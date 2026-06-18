interface GeneralSettings {
  orderBy: string;
  autoSendBirthdayEmail: boolean;
}

interface AnamnesisSettings {
  defaultTemplateId: string | null;
}

interface PreferenceSettings {
  theme: string;
  preferredLanguage: string;
}

interface AppSystemSettings {
  showAnthropometry: boolean;
  showPrescriptions: boolean;
}

export interface SystemSettingsProps {
  id : string;
  userId: string;
  generalDto: GeneralSettings;
  anamnesisDto: AnamnesisSettings;
  preferenceDto: PreferenceSettings;
  appSystemSettingsDto: AppSystemSettings;
}


export interface SystemSettingsViewProps {
  id : string;
  userId: string;
  generalDto: GeneralSettings;
  anamnesisDto: AnamnesisSettings;
  preferenceDto: PreferenceSettings;
  appSystemSettingsDto: AppSystemSettings;
}

export interface EditSystemSettingsDto  extends SystemSettingsProps {
  
}