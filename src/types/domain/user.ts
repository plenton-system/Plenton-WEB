// ----------------------------------------------------------------------

/**
 * Propriedades do usuário.
 */
export interface User {
  id: string;
  email: string;
  name: string;
  tenantId: string;
  role: string | string[];
  profile?: Profile | null;
}

// ----------------------------------------------------------------------

/**
 * Propriedades do usuário dependendo de cada perfil (Nutricionista ou Paciente).
 */
export interface Profile {
  id: string;
  photo: string;
  status: number | string;
  document?: string | null;
  phone?: string | null;
}

export interface ProfileDetailsProps {
  id: string;
  email: string;
  name: string;
  photoPhoto: string;
  document: string;
  phone: string;
  crn?: string | null;
  gender: Gender | null;
  birthDate: string | null;
  addressDto?: {
    street: string;
    number: string;
    city: string;
    neighborhood: string;
    state: string;
    zipCode: string;
  };
}

export type ProfileFormValues = Omit<ProfileDetailsProps, 'photoPhoto'> & {
  photo: string;
};

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

export enum Gender {
    Male = 0,
    Female = 1,
    Other = 2
}
