import type { NavItem } from 'src/layouts/nav-config-dashboard';

import { SvgColor } from 'src/components/svg-color';

const icon = (name: string) => <SvgColor src={`/assets/icons/navbar/${name}.svg`} />;

export const adminNavData: NavItem[] = [
  { title: 'admin.nav.overview', path: '/admin', icon: icon('ic-analytics') },
  { title: 'admin.nav.tenants', path: '/admin/tenants', icon: icon('ic-folder') },
  { title: 'admin.nav.users', path: '/admin/users', icon: icon('ic-user') },
  { title: 'admin.nav.subscriptions', path: '/admin/subscriptions', icon: icon('ic-cart') },
  { title: 'admin.nav.operations', path: '/admin/operations', icon: icon('ic-calendar') },
  { title: 'admin.nav.audit', path: '/admin/audit', icon: icon('ic-clipboard') },
];
