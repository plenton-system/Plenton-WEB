import packageJson from '../package.json';

// ----------------------------------------------------------------------

export type ConfigValue = {
  appName: string;
  appVersion: string;
  siteUrl: string;
  contactEmail: string;
};

export const CONFIG: ConfigValue = {
  appName: 'Plenton',
  appVersion: packageJson.version,
  siteUrl: 'https://www.plenton.com.br',
  contactEmail: 'contato@plenton.com.br',
};
