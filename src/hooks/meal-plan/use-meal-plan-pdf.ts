import { useState, useCallback } from 'react';

import { triggerBrowserDownload } from 'src/utils/format-file';

import { mealPlanService } from 'src/services/mealPlan/mealPlanService';

// ----------------------------------------------------------------------

export function useMealPlanPdf() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const download = useCallback(async (mealPlanId: string) => {
    if (!mealPlanId) return;

    setLoading(true);
    setError(null);

    try {
      const { blob, fileName } = await mealPlanService.downloadPdf(mealPlanId);
      triggerBrowserDownload(blob, fileName);
    } catch (err) {
      setError(extractMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  return { download, loading, error };
}

// ----------------------------------------------------------------------

const extractMessage = (err: unknown): string => {
  if (err instanceof Error && err.message) return err.message;
  return 'Erro ao gerar o PDF do plano alimentar.';
};
