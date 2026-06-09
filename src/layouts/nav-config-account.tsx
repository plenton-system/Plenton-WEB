import { Iconify } from 'src/components/iconify';

import type { AccountPopoverProps } from './components/account-popover';

// ----------------------------------------------------------------------

export const _account: AccountPopoverProps['data'] = [
  {
    label: 'Perfil',
    href: 'modal:profile',
    icon: <Iconify width={22} icon="solar:shield-keyhole-bold-duotone" />,
  },
  {
    label: 'Configurações',
    href: 'modal:settings',
    icon: <Iconify width={22} icon="solar:settings-bold-duotone" />
  },
];
