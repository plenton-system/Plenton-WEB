import { SvgColor } from 'src/components/svg-color';

// ----------------------------------------------------------------------

const icon = (name: string) => <SvgColor src={`/assets/icons/navbar/${name}.svg`} />;

export type NavItem = {
  title: string;
  path: string;
  icon: React.ReactNode;
  info?: React.ReactNode;
};

export const navData = [
  {
    title: 'Dashboard',
    path: '/dashboard',
    icon: icon('ic-analytics'),
  },
  {
    title: 'Paciente',
    path: '/patient',
    icon: icon('ic-user'),
  },
  {
    title: 'Consulta',
    path: '/appointment',
    icon: icon('ic-calendar'),
  },
  {
    title: 'Workspace',
    path: '/workspace',
    icon: icon('ic-folder'),
  },
  {
    title: 'Alimentos',
    path: '/food',
    icon: icon('ic-cart'),
  },
  {
    title: 'Anamnese',
    path: '/anamnesis',
    icon: icon('ic-clipboard'),
  },
];
