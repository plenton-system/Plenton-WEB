import { Iconify } from 'src/components/iconify';

import type { AccountPopoverProps } from './components/account-popover';

// ----------------------------------------------------------------------

export const _account: AccountPopoverProps['data'] = [
  {
    labelKey: 'profile.menu.profile',
    href: 'modal:profile',
    icon: <Iconify width={22} icon="solar:shield-keyhole-bold-duotone" />,
  },
  {
    labelKey: 'profile.menu.settings',
    href: 'modal:settings',
    icon: <Iconify width={22} icon="solar:settings-bold-duotone" />
  },
];
