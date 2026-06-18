import type { AnamnesisQuestionDto } from 'src/types';

import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Add from '@mui/icons-material/Add';
import Typography from '@mui/material/Typography';

import { QuestionType } from 'src/enums/anamnesis';

import { AnamnesisQuestionCard } from './anamnesis-question-card';

// ----------------------------------------------------------------------

const uid = () =>
    (typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : Math.random().toString(36).slice(2));

const DEFAULT_Q = (): AnamnesisQuestionDto => ({
    id: uid(),
    type: QuestionType.Text,
    label: 'Nova pergunta',
    required: false,
    helpText: '',
    min: null,
    max: null,
    options: null,
});

type Props = {
    value: AnamnesisQuestionDto[];
    onChange: (next: AnamnesisQuestionDto[]) => void;
};

// ----------------------------------------------------------------------

export function AnamnesisQuestionsPanel({ value, onChange }: Props) {
    const { t } = useTranslation();
    const [list, setList] = useState<AnamnesisQuestionDto[]>(() => value ?? []);

    // sync externo -> interno
    useMemo(() => {
        setList(value ?? []);
    }, [value]);

    const commit = (next: AnamnesisQuestionDto[]) => {
        setList(next);
        onChange(next);
    };

    const add = () => commit([...list, { ...DEFAULT_Q(), label: t('anamnesis.questions.defaultLabel') }]);

    const patch = (id: string, p: Partial<AnamnesisQuestionDto>) =>
        commit(list.map((q) => (q.id === id ? { ...q, ...p } : q)));

    const remove = (id: string) => commit(list.filter((q) => q.id !== id));

    const duplicate = (id: string) => {
        const idx = list.findIndex((x) => x.id === id);
        if (idx < 0) return;
        const clone = { ...list[idx], id: uid(), label: t('anamnesis.questions.copyLabel', { label: list[idx].label }) };
        const next = [...list];
        next.splice(idx + 1, 0, clone);
        commit(next);
    };

    const move = (id: string, dir: -1 | 1) => {
        const idx = list.findIndex((x) => x.id === id);
        const nextIdx = idx + dir;
        if (idx < 0 || nextIdx < 0 || nextIdx >= list.length) return;
        const next = [...list];
        const [item] = next.splice(idx, 1);
        next.splice(nextIdx, 0, item);
        commit(next);
    };

    return (
        <>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mt: 3, mb: 1 }}>
                <Typography variant="subtitle1">{t('anamnesis.questions.count', { count: list.length })}</Typography>
                <Button startIcon={<Add />} variant="contained" onClick={add}>
                    {t('anamnesis.questions.add')}
                </Button>
            </Stack>

            {list.length === 0 ? (
                <Paper variant="outlined" sx={{ p: 3, textAlign: 'center', color: 'text.secondary' }}>
                    {t('anamnesis.questions.empty')}
                </Paper>
            ) : (
                <Stack>
                    {list.map((q, i) => (
                        <AnamnesisQuestionCard
                            key={q.id}
                            value={q}
                            index={i}
                            total={list.length}
                            onChange={(p) => patch(q.id ?? '', p)}
                            onDuplicate={() => duplicate(q.id ?? '')}
                            onRemove={() => remove(q.id ?? '')}
                            onMoveUp={() => move(q.id ?? '', -1)}
                            onMoveDown={() => move(q.id ?? '', 1)}
                        />
                    ))}
                </Stack>
            )}
        </>
    );
}
