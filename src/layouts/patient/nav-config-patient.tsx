import type { NavItem } from 'src/layouts/nav-config-dashboard';

import { SvgColor } from 'src/components/svg-color';

const icon = (name: string) => <SvgColor src={`/assets/icons/navbar/${name}.svg`} />;

export const patientNavData: NavItem[] = [
  {
    title: 'patientPortal.nav.home',
    path: '/portal',
    icon: icon('ic-analytics'),
  },
  {
    title: 'patientPortal.nav.mealPlan',
    path: '/portal/meal-plan',
    icon: icon('ic-cart'),
  },
];
