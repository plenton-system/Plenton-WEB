import type { ProfileFormValues } from 'src/types';
import type { IconButtonProps } from '@mui/material/IconButton';
import type { SystemSettingsProps, EditSystemSettingsDto } from 'src/types/domain/system-settings';

import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Popover from '@mui/material/Popover';
import Divider from '@mui/material/Divider';
import MenuList from '@mui/material/MenuList';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import MenuItem, { menuItemClasses } from '@mui/material/MenuItem';

import { useRouter, usePathname } from 'src/routes/hooks';

import { useAuth } from 'src/hooks/common/use-auth';
import { useUserDataDetails } from 'src/hooks/user-data/use-user-data-details';

import { systemSettingsService } from 'src/services/systemSettings/systemSettingsService';

import { ProfilePopover } from './profile-popover';
import { SettingsPopover } from './settings-popover';

const profileValidationSchema = Yup.object({
  addressDto: Yup.object({
    street: Yup.string().trim().required('Informe a rua ou avenida.'),
    number: Yup.string().trim().required('Informe o número do endereço.'),
    neighborhood: Yup.string().trim().required('Informe o bairro.'),
    city: Yup.string().trim().required('Informe a cidade.'),
    state: Yup.string().trim().required('Informe o estado.'),
    zipCode: Yup.string().trim().required('Informe o CEP.'),
  }).required(),
});

export type AccountPopoverProps = IconButtonProps & {
  data?: {
    label: string;
    href: string;
    icon?: React.ReactNode;
    info?: React.ReactNode;
    onClick?: (ctx: { userId?: string; user?: any }) => void | Promise<void>;
  }[];
};

export function AccountPopover({ data = [], sx, ...other }: AccountPopoverProps) {
  const router = useRouter();
  const { signOut, user } = useAuth();

  const emptyProfileValues: ProfileFormValues = {
    id: '',
    email: '',
    name: '',
    photo: '',
    document: '',
    phone: '',
    birthDate: '',
    crn: '',
    gender: null,
    addressDto: {
      street: '',
      number: '',
      city: '',
      neighborhood: '',
      state: '',
      zipCode: '',
    },
  };

  const pathname = usePathname();

  const [openPopover, setOpenPopover] = useState<HTMLButtonElement | null>(null);
  const [openSettings, setOpenSettings] = useState(false);
  const [openProfile, setOpenProfile] = useState(false);

  // >>> estados p/ carregar/salvar e dados da modal
  const [settingsData, setSettingsData] = useState<SystemSettingsProps | undefined>();
  const [initialValuesProfile, setInitialValuesProfile] =
    useState<ProfileFormValues>(emptyProfileValues);
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [, setSettingsSaving] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [, setLocalError] = useState<string | null>(null);

  const { error, loading, update, refetch } = useUserDataDetails({
    userId: user?.id ?? null,
    autoLoad: profileLoading,
  });

  const handleOpenPopover = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    setOpenPopover(event.currentTarget);
  }, []);

  const handleClosePopover = useCallback(() => {
    setOpenPopover(null);
  }, []);

  // Buscar dados antes de abrir a modal
  const handleClickItem = useCallback(
    async (item: NonNullable<AccountPopoverProps['data']>[number]) => {
      try {
        if (item.href?.startsWith('modal:settings')) {
          if (!user?.id) return;
          setSettingsLoading(true);
          const dto = await systemSettingsService.getByUserId(user.id);
          setSettingsData(dto);
          setOpenSettings(true);
        }

        if (item.href?.startsWith('modal:profile')) {
          if (!user?.id) return;
          setOpenProfile(true);
          setProfileLoading(true);

          const profileResponse = await refetch();

          if (!profileResponse) return;
          setInitialValuesProfile({
            id: profileResponse?.id,
            document: profileResponse?.document ?? '',
            email: profileResponse?.email ?? '',
            name: profileResponse?.name ?? '',
            phone: profileResponse?.phone ?? '',
            photo: profileResponse?.photo ?? '',
            crn: profileResponse?.crn ?? '',
            gender: profileResponse?.gender ?? 0,
            birthDate: profileResponse?.birthDate ?? '',
            addressDto: {
              street: profileResponse.addressDto?.street ?? '',
              number: profileResponse.addressDto?.number ?? '',
              city: profileResponse.addressDto?.city ?? '',
              neighborhood: profileResponse.addressDto?.neighborhood ?? '',
              state: profileResponse.addressDto?.state ?? '',
              zipCode: profileResponse.addressDto?.zipCode ?? '',
            },
          });
        }
      } finally {
        setSettingsLoading(false);
        setProfileLoading(false);
      }
    },
    [user?.id, refetch]
  );

  // >>> AQUI: onSave (chama o backend)
  const handleSaveSettings = useCallback(async (payload: EditSystemSettingsDto) => {
    if (!payload) return;
    setSettingsSaving(true);
    try {
      await systemSettingsService.update(payload);
      setSettingsData(payload);
      setOpenSettings(false);
    } finally {
      setSettingsSaving(false);
    }
  }, []);
  const formikProfile = useFormik<ProfileFormValues>({
    initialValues: initialValuesProfile,
    enableReinitialize: true,
    validationSchema: profileValidationSchema,
    onSubmit: async (values) => {
      setLocalError(null);

      const payload = {
        ...values,
      };

      const ok = await update(payload);
      if (ok) {
        return;
      }
    },
  });
  const avatarSrc = initialValuesProfile.photo || user?.profile?.photo || '';

  return (
    <>
      <IconButton
        onClick={handleOpenPopover}
        sx={{
          p: '2px',
          width: 40,
          height: 40,
          background: (theme) =>
            `conic-gradient(${theme.vars.palette.primary.light}, ${theme.vars.palette.warning.light}, ${theme.vars.palette.primary.light})`,
          ...sx,
        }}
        {...other}
      >
        <Avatar src={avatarSrc} alt={user?.name}>
          {user?.name?.charAt(0).toUpperCase()}
        </Avatar>
      </IconButton>

      <Popover
        open={!!openPopover}
        anchorEl={openPopover}
        onClose={handleClosePopover}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{
          paper: {
            sx: { width: 200 },
          },
        }}
      >
        <Box sx={{ p: 2, pb: 1.5 }}>
          <Typography variant="subtitle2" noWrap>
            {user?.name}
          </Typography>

          <Typography variant="body2" sx={{ color: 'text.secondary' }} noWrap>
            {user?.email}
          </Typography>
        </Box>

        <Divider sx={{ borderStyle: 'dashed' }} />

        <MenuList
          disablePadding
          sx={{
            p: 1,
            gap: 0.5,
            display: 'flex',
            flexDirection: 'column',
            [`& .${menuItemClasses.root}`]: {
              px: 1,
              gap: 2,
              borderRadius: 0.75,
              color: 'text.secondary',
              '&:hover': { color: 'text.primary' },
              [`&.${menuItemClasses.selected}`]: {
                color: 'text.primary',
                bgcolor: 'action.selected',
                fontWeight: 'fontWeightSemiBold',
              },
            },
          }}
        >
          {data.map((option) => (
            <MenuItem
              key={option.label}
              selected={option.href === pathname}
              onClick={() => handleClickItem(option)}
            >
              {option.icon}
              {option.label}
            </MenuItem>
          ))}
        </MenuList>

        <Divider sx={{ borderStyle: 'dashed' }} />

        <Box sx={{ p: 1 }}>
          <Button
            fullWidth
            color="error"
            size="medium"
            variant="text"
            onClick={() => {
              signOut();
              router.push('/sign-in');
            }}
          >
            Sair
          </Button>
        </Box>
      </Popover>

      <>
        <ProfilePopover
          onClose={() => setOpenProfile(false)}
          open={openProfile}
          loading={loading}
          error={error}
          formik={formikProfile}
        />
        <SettingsPopover
          data={settingsData}
          loading={settingsLoading}
          open={openSettings}
          onClose={() => setOpenSettings(false)}
          onSave={handleSaveSettings}
        />
      </>
    </>
  );
}
