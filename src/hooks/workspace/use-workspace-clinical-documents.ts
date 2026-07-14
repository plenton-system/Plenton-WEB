import type { ClinicalDocument, ClinicalDocumentType } from 'src/types';

import { useRef, useMemo, useState, useEffect, useCallback } from 'react';

import { extractApiErrorMessage } from 'src/utils/api-error';

import i18n from 'src/i18n';
import { clinicalDocumentService } from 'src/services/clinicalDocuments/clinicalDocumentService';

// ----------------------------------------------------------------------

export type WorkspaceClinicalDocumentKind = 'exams' | 'prescriptions';

type SaveDocumentInput = {
  id?: string;
  title: string;
  content: string;
  type: ClinicalDocumentType;
};

type ValidationResult = {
  title?: string;
  content?: string;
  type?: string;
  patientId?: string;
};

type UseWorkspaceClinicalDocumentsProps = {
  patientId?: string;
  kind: WorkspaceClinicalDocumentKind;
  prescriptionType?: Extract<ClinicalDocumentType, 'Medication' | 'Compounded'>;
  search?: string;
};

const getTypesForKind = (
  kind: WorkspaceClinicalDocumentKind,
  prescriptionType?: Extract<ClinicalDocumentType, 'Medication' | 'Compounded'>
): ClinicalDocumentType[] => {
  if (kind === 'exams') return ['ExamRequest'];
  return prescriptionType ? [prescriptionType] : ['Medication', 'Compounded'];
};

const isValidType = (type: ClinicalDocumentType, allowedTypes: ClinicalDocumentType[]) =>
  allowedTypes.includes(type);

export function useWorkspaceClinicalDocuments({
  kind,
  search,
  patientId,
  prescriptionType,
}: UseWorkspaceClinicalDocumentsProps) {
  const requestIdRef = useRef(0);
  const [items, setItems] = useState<ClinicalDocument[]>([]);
  const [selected, setSelected] = useState<ClinicalDocument | null>(null);
  const [loading, setLoading] = useState(false);
  const [mutating, setMutating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [validation, setValidation] = useState<ValidationResult>({});

  const allowedTypes = useMemo(
    () => getTypesForKind(kind, prescriptionType),
    [kind, prescriptionType]
  );

  const refetch = useCallback(async () => {
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    setLoading(true);
    setError(null);

    if (!patientId) {
      setItems([]);
      setLoading(false);
      return;
    }

    try {
      const page = await clinicalDocumentService.list({
        types: allowedTypes,
        search,
        patientId,
      });

      if (requestIdRef.current !== requestId) return;

      setItems((page.items ?? []).filter((item) => allowedTypes.includes(item.type)));
    } catch (err) {
      if (requestIdRef.current !== requestId) return;
      setError(extractApiErrorMessage(err, i18n.t('workspace.clinicalDocuments.errors.load')));
    } finally {
      if (requestIdRef.current === requestId) {
        setLoading(false);
      }
    }
  }, [allowedTypes, patientId, search]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const validate = useCallback(
    (input: SaveDocumentInput): ValidationResult => {
      const nextValidation: ValidationResult = {};

      if (!input.title.trim()) {
        nextValidation.title = i18n.t('workspace.clinicalDocuments.validation.title');
      }

      if (!input.content.trim()) {
        nextValidation.content = i18n.t('workspace.clinicalDocuments.validation.content');
      }

      if (!isValidType(input.type, allowedTypes)) {
        nextValidation.type = i18n.t('workspace.clinicalDocuments.validation.type');
      }

      if (!patientId) {
        nextValidation.patientId = i18n.t('workspace.clinicalDocuments.validation.patient');
      }

      setValidation(nextValidation);
      return nextValidation;
    },
    [allowedTypes, patientId]
  );

  const saveDocument = useCallback(
    async (input: SaveDocumentInput): Promise<ClinicalDocument | null> => {
      setError(null);
      setSuccess(null);

      const nextValidation = validate(input);
      if (Object.keys(nextValidation).length > 0 || !patientId) return null;

      setMutating(true);

      try {
        const payload = {
          title: input.title.trim(),
          content: input.content.trim(),
          type: input.type,
          patientId,
        };

        const saved = input.id
          ? await clinicalDocumentService.updatePatientDocument(input.id, payload)
          : await clinicalDocumentService.createPatientDocument(payload);

        setSelected(saved);
        setSuccess(i18n.t('workspace.clinicalDocuments.success.saved'));
        await refetch();
        return saved;
      } catch (err) {
        setError(extractApiErrorMessage(err, i18n.t('workspace.clinicalDocuments.errors.save')));
        return null;
      } finally {
        setMutating(false);
      }
    },
    [patientId, refetch, validate]
  );

  return {
    error,
    items,
    loading,
    success,
    selected,
    mutating,
    validation,
    allowedTypes,
    refetch,
    setError,
    setSuccess,
    setSelected,
    setValidation,
    saveDocument,
  };
}
