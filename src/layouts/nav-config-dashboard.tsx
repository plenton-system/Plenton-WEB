import { SvgColor } from 'src/components/svg-color';

// ----------------------------------------------------------------------

const icon = (name: string) => <SvgColor src={`/assets/icons/navbar/${name}.svg`} />;

export type NavItem = {
  title:
    | 'nav.dashboard'
    | 'nav.patients'
    | 'nav.appointments'
    | 'nav.workspace'
    | 'nav.foods'
    | 'nav.anamnesis';
  path: string;
  icon: React.ReactNode;
  info?: React.ReactNode;
};

export const navData: NavItem[] = [
  {
    title: 'nav.dashboard',
    path: '/dashboard',
    icon: icon('ic-analytics'),
  },
  {
    title: 'nav.patients',
    path: '/patient',
    icon: icon('ic-user'),
  },
  {
    title: 'nav.appointments',
    path: '/appointment',
    icon: icon('ic-calendar'),
  },
  {
    title: 'nav.workspace',
    path: '/workspace',
    icon: icon('ic-folder'),
  },
  {
    title: 'nav.foods',
    path: '/food',
    icon: icon('ic-cart'),
  },
  {
    title: 'nav.anamnesis',
    path: '/anamnesis',
    icon: icon('ic-clipboard'),
  },
];
