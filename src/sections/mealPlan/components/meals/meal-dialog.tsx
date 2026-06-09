import { useState, useEffect } from 'react';

import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

import ItemsSection from '../items/items-section';
import MealsSubstituteSection from '../substitutes/meals-substitute-section';

import type { MealDto } from '../../../../types';

// ----------------------------------------------------------------------

type MealDialogProps = {
    open: boolean;
    initial?: MealDto | null;
    onClose: () => void;
    onSave: (meal: MealDto) => void;
};

// ----------------------------------------------------------------------

export default function MealDialog({ open, initial, onClose, onSave }: MealDialogProps) {
    const [meal, setMeal] = useState<MealDto>({
        name: '',
        description: '',
        time: '',
        isSubstitute: false,
        idPrincipalMeal: null,
        items: [],
        substitute: [],
    });

    useEffect(() => {
        if (initial) setMeal({ ...initial, isSubstitute: false });
        else
            setMeal({
                name: '',
                description: '',
                time: '',
                isSubstitute: false,
                idPrincipalMeal: null,
                items: [],
                substitute: [],
            });
    }, [initial, open]);

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
            <DialogTitle>{initial ? 'Editar refeição' : 'Nova refeição'}</DialogTitle>
            <DialogContent dividers>
                <Stack spacing={2} sx={{ mt: 0.5 }}>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                        <TextField
                            label="Nome"
                            value={meal.name}
                            onChange={(e) => setMeal((v) => ({ ...v, name: e.target.value }))}
                            required
                            sx={{ flex: 1 }}
                        />
                        <TextField
                            label="Hora"
                            type="time"
                            value={meal.time}
                            onChange={(e) => setMeal((v) => ({ ...v, time: e.target.value }))}
                            required
                            sx={{ width: 180 }}
                            InputLabelProps={{ shrink: true }}
                        />
                    </Stack>
                    <TextField
                        label="Descrição"
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

                    <Divider sx={{ my: 1.5 }} />

                    <Typography variant="subtitle1">Variações substitutas</Typography>
                    <MealsSubstituteSection
                        substitutes={meal.substitute}
                        parentName={meal.name || 'Refeição'}
                        onAdd={(sub) =>
                            setMeal((v) => ({ ...v, substitute: [...v.substitute, { ...sub, isSubstitute: true }] }))
                        }
                        onEdit={(idx, sub) =>
                            setMeal((v) => {
                                const arr = [...v.substitute];
                                arr[idx] = { ...sub, isSubstitute: true };
                                return { ...v, substitute: arr };
                            })
                        }
                        onRemove={(idx) =>
                            setMeal((v) => {
                                const arr = [...v.substitute];
                                arr.splice(idx, 1);
                                return { ...v, substitute: arr };
                            })
                        }
                    />
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancelar</Button>
                <Button
                    variant="contained"
                    onClick={() => {
                        if (!meal.name.trim() || !meal.time) return;
                        onSave(meal);
                    }}
                >
                    Salvar
                </Button>
            </DialogActions>
        </Dialog>
    );
}