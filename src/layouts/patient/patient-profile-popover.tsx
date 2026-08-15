import type { MouseEvent } from 'react';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import Menu from '@mui/material/Menu';
import Avatar from '@mui/material/Avatar';
import Dialog from '@mui/material/Dialog';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import DialogTitle from '@mui/material/DialogTitle';
import ListItemIcon from '@mui/material/ListItemIcon';
import DialogContent from '@mui/material/DialogContent';

import { useAuth } from 'src/hooks/common/use-auth';
import { usePatientAccount } from 'src/hooks/patient-portal/use-patient-account';

import { PatientAccountContent } from 'src/sections/patient-portal/view/patient-account-view';

type DialogType = 'account' | null;

function PatientProfileDialog({
  type,
  onClose,
}: {
  type: Exclude<DialogType, null>;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const state = usePatientAccount();
  return (
    <Dialog
      open
      onClose={onClose}
      fullWidth
      maxWidth="md"
      aria-labelledby="patient-profile-dialog-title"
    >
      <DialogTitle id="patient-profile-dialog-title" sx={{ pr: 7 }}>
        {t('patientPortal.account.title')}
        <IconButton
          aria-label={t('actions.close')}
          onClick={onClose}
          sx={{ position: 'absolute', top: 8, right: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ p: { xs: 2, sm: 3 } }}>
        <PatientAccountContent state={state} />
      </DialogContent>
    </Dialog>
  );
}

export function PatientProfilePopover() {
  const { t } = useTranslation();
  const { user, signOut } = useAuth();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [dialog, setDialog] = useState<DialogType>(null);

  const openDialog = (type: Exclude<DialogType, null>) => {
    setAnchorEl(null);
    setDialog(type);
  };

  const handleOpen = (event: MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget);

  return (
    <>
      <Tooltip title={t('profile.menu.profile')}>
        <IconButton
          aria-label={t('profile.menu.profile')}
          aria-controls={anchorEl ? 'patient-profile-menu' : undefined}
          aria-haspopup="menu"
          aria-expanded={anchorEl ? 'true' : undefined}
          onClick={handleOpen}
        >
          <Avatar src={user?.profile?.photo ?? ''} alt={user?.name} sx={{ width: 32, height: 32 }}>
            {user?.name?.charAt(0).toUpperCase()}
          </Avatar>
        </IconButton>
      </Tooltip>

      <Menu
        id="patient-profile-menu"
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        slotProps={{ paper: { sx: { minWidth: 220 } } }}
      >
        <MenuItem onClick={() => openDialog('account')}>
          <ListItemIcon>
            <PersonIcon fontSize="small" />
          </ListItemIcon>
          {t('patientPortal.account.title')}
        </MenuItem>
        <MenuItem
          onClick={() => {
            setAnchorEl(null);
            void signOut();
          }}
        >
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          {t('profile.menu.signOut')}
        </MenuItem>
      </Menu>

      {dialog && <PatientProfileDialog type={dialog} onClose={() => setDialog(null)} />}
    </>
  );
}
