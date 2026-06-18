import type { Basics, AnamnesisCreateDto, AnamnesisQuestionDto } from 'src/types';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';

import { useAnamnesisDetail } from 'src/hooks/anamnesis/use-anamnesis-detail';

import { QuestionType } from 'src/enums/anamnesis';

import { AnamnesisBasicsForm } from './../components/anamnesis-basics-form';
import { AnamnesisPreviewDialog } from './../components/anamnesis-preview-dialog';
import { AnamnesisHeaderActions } from './../components/anamnesis-header-actions';
import { AnamnesisQuestionsPanel } from './../components/anamnesis-questions-panel';

// ----------------------------------------------------------------------

interface AnamnesisFormViewProps {
    anamnesisId?: string | null;
    onReturn: () => void;
};

// ----------------------------------------------------------------------

export function AnamnesisFormView({ anamnesisId, onReturn }: AnamnesisFormViewProps) {
    const { t } = useTranslation();

    const {
        data,
        loading,
        error,
        createOrUpdate,
    } = useAnamnesisDetail({ id: anamnesisId ?? null, autoLoad: !!anamnesisId });

    const [basics, setBasics] = useState<Basics>({ title: '', description: '' });
    const [questions, setQuestions] = useState<AnamnesisQuestionDto[]>([]);
    const [localError, setLocalError] = useState<string | null>(null);
    const [previewOpen, setPreviewOpen] = useState(false);

    useEffect(() => {
        if (data) {
            setBasics({ title: data.title ?? '', description: data.description ?? '' });
            setQuestions(
                (data.questions ?? []).map((q) => ({
                    id: q.id,
                    type: q.type,
                    label: q.label,
                    required: q.required,
                    helpText: q.helpText ?? '',
                    min: q.min ?? null,
                    max: q.max ?? null,
                    options: q.options ?? null,
                }))
            );
        }
    }, [data]);

    const handleUseExample = () => {
        setBasics({
            title: t('anamnesis.form.exampleTitle'),
            description: t('anamnesis.form.exampleDescription'),
        });
        // exemplo mínimo de perguntas (opcional):
        if (questions.length === 0) {
            setQuestions([
                { id: crypto.randomUUID(), type: QuestionType.Text, label: t('anamnesis.form.exampleQ1'), required: true, helpText: '', min: null, max: null, options: null },
                { id: crypto.randomUUID(), type: QuestionType.Number, label: t('anamnesis.form.exampleQ2'), required: true, helpText: t('anamnesis.form.exampleQ2Help'), min: 0, max: 500, options: null },
            ]);
        }
    };

    const validate = (): string[] => {
        const errs: string[] = [];
        if (!basics.title.trim()) errs.push(t('anamnesis.form.errTitleRequired'));
        questions.forEach((q, idx) => {
            if (!q.label?.trim()) errs.push(t('anamnesis.form.errLabelRequired', { index: idx + 1 }));
            if (q.type === QuestionType.Number && q.min != null && q.max != null && q.min > q.max)
                errs.push(t('anamnesis.form.errMinMax', { index: idx + 1 }));
            if ((q.type === QuestionType.Select || q.type === QuestionType.MultiSelect) && (!q.options || q.options.filter(o => o?.trim()).length < 2))
                errs.push(t('anamnesis.form.errMinOptions', { index: idx + 1 }));
        });

        return errs;
    };

    const buildDto = (): AnamnesisCreateDto => ({
        title: basics.title.trim(),
        description: basics.description?.trim() || '',
        questions: questions.map((q, idx) => ({
            id: q.id,
            type: q.type,
            label: q.label.trim(),
            required: q.required,
            order: idx,
            helpText: q.helpText?.trim() || null,
            min: q.type === QuestionType.Number ? q.min ?? null : null,
            max: q.type === QuestionType.Number ? q.max ?? null : null,
            options:
                q.type === QuestionType.Select || q.type === QuestionType.MultiSelect ?
                    (q.options ?? []).filter(Boolean).map(o => String(o)) : null,
        })),
    });

    const handleSave = async () => {
        setLocalError(null);

        const errs = validate();
        if (errs.length) {
            setLocalError(errs.join('\n'));
            return;
        }

        const dto = buildDto();

        try {
            const ok = await createOrUpdate(dto);
            if (ok) onReturn?.();
        } catch {
            // erro já é exibido via `error` do hook
        }
    };

    return (

        <>
            {(error || localError) && (
                <Alert severity="error" sx={{ mb: 2, whiteSpace: 'pre-wrap' }}>
                    {localError ?? error}
                </Alert>
            )}

            <Box sx={{ mx: 'auto', width: '60%' }}>
                {loading ? (
                    <Stack
                        flex={1}
                        alignItems="center"
                        justifyContent="center"
                        sx={{ minHeight: '80vh' }}
                    >
                        <CircularProgress />
                    </Stack>
                ) : (
                    <>
                        <AnamnesisHeaderActions onUseExample={handleUseExample} />

                        <AnamnesisBasicsForm
                            value={basics}
                            onChange={(patch) => setBasics((prev) => ({ ...prev, ...patch }))}
                            disabled={loading}
                        />

                        {/* Cards de perguntas */}
                        <AnamnesisQuestionsPanel value={questions} onChange={setQuestions} />


                        <Stack direction="row" justifyContent="flex-end" spacing={1} sx={{ mt: 2 }}>
                            <Button variant="outlined" onClick={onReturn} disabled={loading}>
                                {t('actions.cancel')}
                            </Button>
                            <Button variant="outlined" onClick={() => setPreviewOpen(true)} disabled={loading}>
                                {t('anamnesis.form.preview')}
                            </Button>
                            <Button variant="contained" onClick={handleSave} disabled={loading}>
                                {t('actions.save')}
                            </Button>
                        </Stack>
                    </>
                )}
                <AnamnesisPreviewDialog
                    open={previewOpen}
                    onClose={() => setPreviewOpen(false)}
                    title={basics.title}
                    description={basics.description}
                    questions={questions}
                />
            </Box>
        </>
    );
}
