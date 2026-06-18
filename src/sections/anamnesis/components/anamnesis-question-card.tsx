import type { AnamnesisQuestionDto } from 'src/types';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Add from '@mui/icons-material/Add';
import Dialog from '@mui/material/Dialog';
import Switch from '@mui/material/Switch';
import Button from '@mui/material/Button';
import Selectt from '@mui/material/Select';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import Delete from '@mui/icons-material/Delete';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import Typography from '@mui/material/Typography';
import FormControl from '@mui/material/FormControl';
import CardContent from '@mui/material/CardContent';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import ContentCopy from '@mui/icons-material/ContentCopy';
import ArrowUpward from '@mui/icons-material/ArrowUpward';
import ArrowDownward from '@mui/icons-material/ArrowDownward';
import FormControlLabel from '@mui/material/FormControlLabel';

import { QuestionType } from 'src/enums/anamnesis';

// ----------------------------------------------------------------------

type Props = {
    index: number;
    total: number;
    value: AnamnesisQuestionDto;
    onChange: (patch: Partial<AnamnesisQuestionDto>) => void;
    onMoveUp: () => void;
    onMoveDown: () => void;
    onDuplicate: () => void;
    onRemove: () => void;
};

// ----------------------------------------------------------------------

export function AnamnesisQuestionCard({ value: q, index, total, onChange, onMoveUp, onMoveDown, onDuplicate, onRemove }: Props) {
    const { t } = useTranslation();
    const [dlg, setDlg] = useState(false);
    const [newOpt, setNewOpt] = useState('');

    const isChoice = q.type === QuestionType.Select || q.type === QuestionType.MultiSelect;

    const addOption = () => {
        if (!newOpt.trim()) return;
        const next = [...(q.options ?? []), newOpt.trim()];
        onChange({ options: next });
        setNewOpt('');
    };

    const remOption = (opt: string) => {
        onChange({ options: (q.options ?? []).filter(o => o !== opt) });
    };

    return (
        <Card variant="outlined" sx={{ mb: 2 }}>
            <CardContent>
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ md: 'center' }}>
                    <FormControl fullWidth sx={{ maxWidth: 240 }}>
                        <InputLabel id={`type-${q.id}`}>{t('anamnesis.card.type')}</InputLabel>
                        <Selectt
                            labelId={`type-${q.id}`}
                            label={t('anamnesis.card.type')}
                            size="small"
                            value={q.type}
                            onChange={(e) => {
                                const t = e.target.value as QuestionType;
                                const patch: Partial<AnamnesisQuestionDto> = { type: t };
                                if (t !== QuestionType.Select && t !== QuestionType.MultiSelect) patch.options = null;
                                onChange(patch);
                            }}
                        >
                            <MenuItem value={QuestionType.Text}>{t('anamnesis.card.types.text')}</MenuItem>
                            <MenuItem value={QuestionType.Number}>{t('anamnesis.card.types.number')}</MenuItem>
                            <MenuItem value={QuestionType.Boolean}>{t('anamnesis.card.types.boolean')}</MenuItem>
                            <MenuItem value={QuestionType.Select}>{t('anamnesis.card.types.select')}</MenuItem>
                            <MenuItem value={QuestionType.MultiSelect}>{t('anamnesis.card.types.multiSelect')}</MenuItem>
                        </Selectt>
                    </FormControl>

                    <TextField
                        fullWidth
                        size="small"
                        label={t('anamnesis.card.question')}
                        value={q.label}
                        onChange={(e) => onChange({ label: e.target.value })}
                    />

                    <FormControlLabel
                        control={<Switch checked={q.required} onChange={(e) => onChange({ required: e.target.checked })} />}
                        label={t('anamnesis.card.required')}
                    />

                    <Stack direction="row" spacing={1} sx={{ ml: 'auto' }}>
                        <Tooltip title={t('anamnesis.card.moveUp')}>
                            <span>
                                <IconButton size="small" onClick={onMoveUp} disabled={index === 0}>
                                    <ArrowUpward fontSize="small" />
                                </IconButton>
                            </span>
                        </Tooltip>
                        <Tooltip title={t('anamnesis.card.moveDown')}>
                            <span>
                                <IconButton size="small" onClick={onMoveDown} disabled={index === total - 1}>
                                    <ArrowDownward fontSize="small" />
                                </IconButton>
                            </span>
                        </Tooltip>
                        <Tooltip title={t('anamnesis.card.duplicate')}>
                            <IconButton size="small" onClick={onDuplicate}>
                                <ContentCopy fontSize="small" />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title={t('anamnesis.card.remove')}>
                            <IconButton size="small" color="error" onClick={onRemove}>
                                <Delete fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    </Stack>
                </Stack>

                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mt: 2 }}>
                    <TextField
                        fullWidth
                        size="small"
                        label={t('anamnesis.card.help')}
                        value={q.helpText ?? ''}
                        onChange={(e) => onChange({ helpText: e.target.value })}
                    />

                    {q.type === QuestionType.Number && (
                        <>
                            <TextField
                                type="number"
                                size="small"
                                label={t('anamnesis.card.min')}
                                value={q.min ?? ''}
                                onChange={(e) => onChange({ min: e.target.value === '' ? null : Number(e.target.value) })}
                                sx={{ maxWidth: 160 }}
                            />
                            <TextField
                                type="number"
                                size="small"
                                label={t('anamnesis.card.max')}
                                value={q.max ?? ''}
                                onChange={(e) => onChange({ max: e.target.value === '' ? null : Number(e.target.value) })}
                                sx={{ maxWidth: 160 }}
                            />
                        </>
                    )}

                    {isChoice && (
                        <>
                            <Button variant="outlined" onClick={() => setDlg(true)}>{t('anamnesis.card.optionsBtn')}</Button>
                            <Dialog open={dlg} onClose={() => setDlg(false)} fullWidth maxWidth="sm">
                                <DialogTitle>{t('anamnesis.card.optionsTitle')}</DialogTitle>
                                <DialogContent>
                                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
                                        <TextField
                                            fullWidth
                                            size="small"
                                            label={t('anamnesis.card.newOption')}
                                            value={newOpt}
                                            onChange={(e) => setNewOpt(e.target.value)}
                                            onKeyDown={(e) => { if (e.key === 'Enter') addOption(); }}
                                        />
                                        <Button startIcon={<Add />} variant="contained" onClick={addOption}>{t('anamnesis.card.add')}</Button>
                                    </Stack>

                                    <Box sx={{ mt: 2 }}>
                                        {(q.options ?? []).length === 0 ? (
                                            <Typography variant="body2" color="text.secondary">{t('anamnesis.card.noOptions')}</Typography>
                                        ) : (
                                            <Stack direction="row" spacing={1} flexWrap="wrap">
                                                {(q.options ?? []).map((opt) => (
                                                    <Chip key={opt} label={opt} onDelete={() => remOption(opt)} sx={{ mb: 1 }} />
                                                ))}
                                            </Stack>
                                        )}
                                    </Box>
                                </DialogContent>
                                <DialogActions>
                                    <Button onClick={() => setDlg(false)}>{t('anamnesis.card.close')}</Button>
                                </DialogActions>
                            </Dialog>
                        </>
                    )}
                </Stack>
            </CardContent>
        </Card>
    );
}
