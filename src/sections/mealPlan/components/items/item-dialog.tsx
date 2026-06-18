import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import TextField from '@mui/material/TextField';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import FormControlLabel from '@mui/material/FormControlLabel';

import FoodAutocomplete from '../autocomplete/food-autocomplete';
import HomemadeMeasureAutocomplete from '../autocomplete/homemade-measure-autocomplete';

import type { MealItemsDto } from '../../../../types';

// ----------------------------------------------------------------------

type Props = {
    open: boolean;
    initial?: MealItemsDto | null;
    onClose: () => void;
    onSave: (i: MealItemsDto) => void;
};

// ----------------------------------------------------------------------

export default function ItemDialog({ open, initial, onClose, onSave }: Props) {
    const { t } = useTranslation();
    const [it, setIt] = useState<MealItemsDto>({
        foodDto: { id: '', description: '' },
        quantity: null,
        quantityInGrams: null,
        homemadeMeasureDto: null,
        notes: '',
        order: null,
        isOptional: false,
        portionLabel: '',
        isEquivalentes: false,
        parentMealItemId: null,
        equivalents: [],
    });

    useEffect(() => {
        if (initial) setIt({ ...initial });
        else
            setIt({
                foodDto: { id: '', description: '' },
                quantity: null,
                quantityInGrams: null,
                homemadeMeasureDto: null,
                notes: '',
                order: null,
                isOptional: false,
                portionLabel: '',
                isEquivalentes: false,
                parentMealItemId: null,
                equivalents: [],
            });
    }, [initial, open]);

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
            <DialogTitle>{initial ? t('mealplan.itemDialog.editTitle') : t('mealplan.itemDialog.newTitle')}</DialogTitle>
            <DialogContent dividers>
                <Stack spacing={2} sx={{ mt: 0.5 }}>
                    <FoodAutocomplete value={it.foodDto} onChange={(v) => setIt((x) => ({ ...x, foodDto: v }))} />

                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                        <TextField
                            label={t('mealplan.itemDialog.quantity')}
                            type="number"
                            value={it.quantity ?? ''}
                            onChange={(e) => {
                                const val = e.target.value ? Number(e.target.value) : null;
                                setIt((x) => ({
                                    ...x,
                                    quantity: val,
                                    quantityInGrams: x.homemadeMeasureDto ? (val ?? 0) * x.homemadeMeasureDto.quantityInGrams : x.quantityInGrams,
                                }));
                            }}
                            sx={{ flex: 1 }}
                            inputProps={{ step: '0.01', min: 0 }}
                        />
                        <HomemadeMeasureAutocomplete
                            foodId={it.foodDto?.id}
                            value={it.homemadeMeasureDto ?? null}
                            onChange={(v) =>
                                setIt((x) => ({
                                    ...x,
                                    homemadeMeasureDto: v,
                                    quantityInGrams: v ? (x.quantity ?? 1) * v.quantityInGrams : x.quantityInGrams,
                                    quantity: v && x.quantity === null ? 1 : x.quantity,
                                }))
                            }
                        />
                        <TextField
                            label={t('mealplan.itemDialog.grams')}
                            type="number"
                            value={it.quantityInGrams ?? ''}
                            onChange={(e) =>
                                setIt((x) => ({ ...x, quantityInGrams: e.target.value ? Number(e.target.value) : null }))
                            }
                            sx={{ width: 180 }}
                            inputProps={{ step: '0.01', min: 0 }}
                        />
                    </Stack>

                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                        <TextField
                            label={t('mealplan.itemDialog.portionLabel')}
                            value={it.portionLabel}
                            onChange={(e) => setIt((x) => ({ ...x, portionLabel: e.target.value }))}
                            sx={{ flex: 1 }}
                        />
                        <TextField
                            label={t('mealplan.itemDialog.order')}
                            type="number"
                            value={it.order ?? ''}
                            onChange={(e) => setIt((x) => ({ ...x, order: e.target.value ? Number(e.target.value) : null }))}
                            sx={{ width: 160 }}
                            inputProps={{ min: 0 }}
                        />
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={it.isOptional}
                                    onChange={(e) => setIt((x) => ({ ...x, isOptional: e.target.checked }))}
                                />
                            }
                            label={t('mealplan.itemDialog.optional')}
                        />
                    </Stack>

                    <TextField
                        label={t('mealplan.itemDialog.notes')}
                        value={it.notes}
                        onChange={(e) => setIt((x) => ({ ...x, notes: e.target.value }))}
                        fullWidth
                        multiline
                        minRows={2}
                    />
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>{t('actions.cancel')}</Button>
                <Button
                    variant="contained"
                    onClick={() => {
                        if (!it.foodDto?.id) return;
                        onSave(it);
                    }}
                >
                    {t('actions.save')}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
