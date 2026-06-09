import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Popover from '@mui/material/Popover';
import MenuList from '@mui/material/MenuList';
import IconButton from '@mui/material/IconButton';
import MenuItem, { menuItemClasses } from '@mui/material/MenuItem';

import { Iconify, type IconifyName } from 'src/components/iconify';

// ----------------------------------------------------------------------

export type RowActionItem = {
  label: string;
  icon: IconifyName;
  onClick: () => void;
  disabled?: boolean;
  color?: 'default' | 'error';
};

type RowActionsMenuProps = {
  actions: RowActionItem[];
  menuWidth?: number;
  icon?: IconifyName;
};

// ----------------------------------------------------------------------

export function RowActionsMenu({
  actions,
  menuWidth = 160,
  icon = 'eva:more-vertical-fill',
}: RowActionsMenuProps) {
  const [openPopover, setOpenPopover] = useState<HTMLButtonElement | null>(null);

  const handleOpenPopover = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    setOpenPopover(event.currentTarget);
  }, []);

  const handleClosePopover = useCallback(() => {
    setOpenPopover(null);
  }, []);

  return (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
        <IconButton onClick={handleOpenPopover}>
          <Iconify icon={icon} />
        </IconButton>
      </Box>

      <Popover
        open={!!openPopover}
        anchorEl={openPopover}
        onClose={handleClosePopover}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuList
          disablePadding
          sx={{
            p: 0.5,
            gap: 0.5,
            width: menuWidth,
            display: 'flex',
            flexDirection: 'column',
            [`& .${menuItemClasses.root}`]: {
              px: 1,
              gap: 2,
              borderRadius: 0.75,
              [`&.${menuItemClasses.selected}`]: { bgcolor: 'action.selected' },
            },
          }}
        >
          {actions.map((action) => (
            <MenuItem
              key={`${action.label}-${action.icon}`}
              onClick={() => {
                handleClosePopover();
                action.onClick();
              }}
              disabled={action.disabled}
              sx={action.color === 'error' ? { color: 'error.main' } : undefined}
            >
              <Iconify icon={action.icon} />
              {action.label}
            </MenuItem>
          ))}
        </MenuList>
      </Popover>
    </>
  );
}
