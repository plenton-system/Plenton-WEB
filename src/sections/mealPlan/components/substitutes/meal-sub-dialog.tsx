import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

import ItemsSection from '../../components/items/items-section';

import type { MealDto } from '../../../../types';

// ----------------------------------------------------------------------

type MealSubDialogProps = {
    open: boolean;
    initial?: MealDto | null;
    onClose: () => void;
    onSave: (meal: MealDto) => void;
};

// ----------------------------------------------------------------------

export default function MealSubDialog({ open, initial, onClose, onSave }: MealSubDialogProps) {
    const { t } = useTranslation();
    const [meal, setMeal] = useState<MealDto>({
        name: '',
        description: '',
        time: '',
        isSubstitute: true,
        idPrincipalMeal: null,
        items: [],
        substitute: [],
    });

    useEffect(() => {
        if (initial) setMeal({ ...initial, isSubstitute: true, substitute: [] });
        else
            setMeal({
                name: '',
                description: '',
                time: '',
                isSubstitute: true,
                idPrincipalMeal: null,
                items: [],
                substitute: [],
            });
    }, [initial, open]);

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
            <DialogTitle>{initial ? t('mealplan.subDialog.editTitle') : t('mealplan.subDialog.newTitle')}</DialogTitle>
            <DialogContent dividers>
                <Stack spacing={2}>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                        <TextField
                            label={t('mealplan.meals.columns.name')}
                            value={meal.name}
                            onChange={(e) => setMeal((v) => ({ ...v, name: e.target.value }))}
                            required
                            sx={{ flex: 1 }}
                        />
                        <TextField
                            label={t('mealplan.meals.columns.time')}
                            type="time"
                            value={meal.time}
                            onChange={(e) => setMeal((v) => ({ ...v, time: e.target.value }))}
                            required
                            sx={{ width: 180 }}
                            InputLabelProps={{ shrink: true }}
                        />
                    </Stack>

                    <TextField
                        label={t('mealplan.mealDialog.description')}
                        value={meal.description}
                        onChange={(e) => setMeal((v) => ({ ...v, description: e.target.value }))}
                        fullWidth
                    />

                    <ItemsSection
                        items={meal.items}
                        onAdd={(it) => setMeal((v) => ({ ...v, items: [...v.items, it] }))}
                        onEdit={(idx, it) =>
                            setMeal((v) => {
                                const arr = [...v.items];
                                arr[idx] = it;
                                return { ...v, items: arr };
                            })
                        }
                        onRemove={(idx) =>
                            setMeal((v) => {
                                const arr = [...v.items];
                                arr.splice(idx, 1);
                                return { ...v, items: arr };
                            })
                        }
                    />
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>{t('actions.cancel')}</Button>
                <Button
                    variant="contained"
                    onClick={() => {
                        if (!meal.name.trim() || !meal.time) return;
                        onSave(meal);
                    }}
                >
                    {t('actions.save')}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
