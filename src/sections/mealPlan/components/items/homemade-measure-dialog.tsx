import type { HomemadeMeasureDto } from 'src/types';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

import { homemadeMeasureService } from 'src/services/mealPlan/homemadeMeasureService';

// ----------------------------------------------------------------------

type Props = {
    open: boolean;
    foodId: string;
    initial?: HomemadeMeasureDto | null;
    onClose: () => void;
    onSave: (m: HomemadeMeasureDto) => void;
};

// ----------------------------------------------------------------------

export default function HomemadeMeasureDialog({ open, foodId, initial, onClose, onSave }: Props) {
    const { t } = useTranslation();
    const [form, setForm] = useState({
        name: '',
        quantityInGrams: 0,
    });

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open) {
            if (initial) {
                setForm({
                    name: initial.name,
                    quantityInGrams: initial.quantityInGrams,
                });
            } else {
                setForm({
                    name: '',
                    quantityInGrams: 0,
                });
            }
        }
    }, [open, initial, setForm]);

    const handleSave = async () => {
        setLoading(true);
        try {
            if (initial) {
                // Implementação de edição se necessário no futuro
            } else {
                const created = await homemadeMeasureService.create({
                    foodId,
                    name: form.name,
                    quantityInGrams: form.quantityInGrams,
                    isGlobal: false,
                });
                onSave(created);
            }
            onClose();
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
            <DialogTitle>{initial ? t('mealplan.measureDialog.editTitle') : t('mealplan.measureDialog.newTitle')}</DialogTitle>
            <DialogContent dividers>
                <Stack spacing={2} sx={{ mt: 0.5 }}>
                    <TextField
                        label={t('mealplan.measureDialog.description')}
                        fullWidth
                        autoFocus
                        value={form.name}
                        onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                    />
                    <TextField
                        label={t('mealplan.measureDialog.grams')}
                        fullWidth
                        type="number"
                        placeholder="0.00"
                        value={form.quantityInGrams}
                        onChange={(e) => setForm((prev) => ({ ...prev, quantityInGrams: Number(e.target.value) }))}
                        inputProps={{ step: '0.01', min: 0 }}
                    />
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>{t('actions.cancel')}</Button>
                <Button variant="contained" onClick={handleSave} disabled={loading || !form.name}>
                    {loading ? t('mealplan.measureDialog.saving') : t('actions.save')}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
