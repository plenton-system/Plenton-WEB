import type { PagedResult } from '../api';

// ----------------------------------------------------------------------

export type ClinicalDocumentType = 'ExamRequest' | 'Medication' | 'Compounded';

export type ClinicalDocument = {
  id: string;
  title: string;
  content: string;
  type: ClinicalDocumentType;
  isTemplate: boolean;
  patientId: string | null;
  patientName?: string | null;
  canceledAt?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

export type ClinicalDocumentListQuery = {
  patientId: string;
  type?: ClinicalDocumentType;
  types?: ClinicalDocumentType[];
  search?: string;
  pageIndex?: number;
  pageSize?: number;
};

export type ClinicalDocumentListResponse = PagedResult<ClinicalDocument>;

export type SavePatientClinicalDocumentRequest = {
  patientId: string;
  title: string;
  content: string;
  type: ClinicalDocumentType;
  isTemplate: false;
};
