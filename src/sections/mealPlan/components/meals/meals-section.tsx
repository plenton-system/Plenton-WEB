import { Fragment, useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Collapse from '@mui/material/Collapse';
import TableRow from '@mui/material/TableRow';
import AddIcon from '@mui/icons-material/Add';
import TableHead from '@mui/material/TableHead';
import TableCell from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

import { RowActionsMenu, type RowActionItem } from 'src/components/table';

import MealDialog from './meal-dialog';

import type { MealDto, MealItemsDto } from '../../../../types';

// ----------------------------------------------------------------------

type Props = {
    meals: MealDto[];
    onAdd: (m: MealDto) => void;
    onEdit: (index: number, m: MealDto) => void;
    onRemove: (index: number) => void;
};

type MockMacros = {
    protein: number;
    carbs: number;
    fat: number;
    calories: number;
};

const EMPTY_DETAIL_MESSAGE = 'Nenhum alimento ou substituta cadastrados.';

// ----------------------------------------------------------------------

export default function MealsSection({ meals, onAdd, onEdit, onRemove }: Props) {
    const [open, setOpen] = useState(false);
    const [expandedRows, setExpandedRows] = useState<Record<number, boolean>>({});
    const [editing, setEditing] = useState<{ index: number; value: MealDto } | null>(null);

    const toggleExpandedRow = (index: number) => {
        setExpandedRows((prev) => ({
            ...prev,
            [index]: !prev[index],
        }));
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Typography variant="h6" sx={{ flexGrow: 1 }}>
                    Refeições
                </Typography>
                <Button
                    startIcon={<AddIcon />}
                    variant="outlined"
                    onClick={() => {
                        setEditing(null);
                        setOpen(true);
                    }}
                >
                    Adicionar refeição
                </Button>
            </Box>

            <Card variant="outlined">
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell width={56} />
                            <TableCell>Nome</TableCell>
                            <TableCell>Hora</TableCell>
                            <TableCell>Proteína (g)</TableCell>
                            <TableCell>Carboidrato (g)</TableCell>
                            <TableCell>Lipídeo (g)</TableCell>
                            <TableCell>Calorias (kcal)</TableCell>
                            <TableCell align="center">Ações</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {meals?.length ? (
                            meals.map((meal, index) => {
                                const totals = buildMockMacros(meal);
                                const actions: RowActionItem[] = [
                                    {
                                        label: 'Editar',
                                        icon: 'solar:pen-bold',
                                        onClick: () => {
                                            setEditing({ index, value: meal });
                                            setOpen(true);
                                        },
                                    },
                                    {
                                        label: 'Remover',
                                        icon: 'solar:trash-bin-trash-bold',
                                        color: 'error',
                                        onClick: () => onRemove(index),
                                    },
                                ];

                                return (
                                    <Fragment key={`${meal.id ?? meal.name}-${index}`}>
                                        <TableRow hover>
                                            <TableCell>
                                                <IconButton
                                                    size="small"
                                                    onClick={() => toggleExpandedRow(index)}
                                                    aria-label={
                                                        expandedRows[index]
                                                            ? `Recolher ${meal.name}`
                                                            : `Expandir ${meal.name}`
                                                    }
                                                >
                                                    {expandedRows[index] ? (
                                                        <KeyboardArrowUpIcon fontSize="small" />
                                                    ) : (
                                                        <KeyboardArrowDownIcon fontSize="small" />
                                                    )}
                                                </IconButton>
                                            </TableCell>
                                            <TableCell>{meal.name}</TableCell>
                                            <TableCell>{meal.time || '-'}</TableCell>
                                            <TableCell>{totals.protein}</TableCell>
                                            <TableCell>{totals.carbs}</TableCell>
                                            <TableCell>{totals.fat}</TableCell>
                                            <TableCell>{totals.calories}</TableCell>
                                            <TableCell align="center">
                                                <RowActionsMenu actions={actions} menuWidth={140} />
                                            </TableCell>
                                        </TableRow>

                                        <TableRow>
                                            <TableCell colSpan={8} sx={{ py: 0, borderBottom: 0 }}>
                                                <Collapse in={Boolean(expandedRows[index])} timeout="auto" unmountOnExit>
                                                    <Box sx={{ px: 2, py: 2.5, bgcolor: 'background.default' }}>
                                                        {hasMealDetails(meal) ? (
                                                            <Stack spacing={2}>
                                                                <Box>
                                                                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                                                                        Alimentos da refeição
                                                                    </Typography>
                                                                    <MealItemsList
                                                                        items={meal.items}
                                                                        emptyMessage="Nenhum alimento principal cadastrado."
                                                                    />
                                                                </Box>

                                                                <Divider />

                                                                <Box>
                                                                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                                                                        Substitutas
                                                                    </Typography>

                                                                    {meal.substitute?.length ? (
                                                                        <Stack spacing={1.5}>
                                                                            {meal.substitute.map((substitute, substituteIndex) => (
                                                                                <Box
                                                                                    key={`${substitute.id ?? substitute.name}-${substituteIndex}`}
                                                                                    sx={{
                                                                                        p: 1.5,
                                                                                        border: '1px solid',
                                                                                        borderColor: 'divider',
                                                                                        borderRadius: 1.5,
                                                                                    }}
                                                                                >
                                                                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                                                        {substitute.name || 'Substituta sem nome'}
                                                                                        {substitute.time ? ` • ${substitute.time}` : ''}
                                                                                    </Typography>
                                                                                    <MealItemsList
                                                                                        items={substitute.items}
                                                                                        emptyMessage="Nenhum alimento cadastrado nesta substituta."
                                                                                        compact
                                                                                    />
                                                                                </Box>
                                                                            ))}
                                                                        </Stack>
                                                                    ) : (
                                                                        <Typography variant="body2" color="text.secondary">
                                                                            Nenhuma substituta cadastrada.
                                                                        </Typography>
                                                                    )}
                                                                </Box>
                                                            </Stack>
                                                        ) : (
                                                            <Typography variant="body2" color="text.secondary">
                                                                {EMPTY_DETAIL_MESSAGE}
                                                            </Typography>
                                                        )}
                                                    </Box>
                                                </Collapse>
                                            </TableCell>
                                        </TableRow>
                                    </Fragment>
                                );
                            })
                        ) : (
                            <TableRow>
                                <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                                    Nenhuma refeição adicionada.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </Card>

            <MealDialog
                open={open}
                initial={editing?.value}
                onClose={() => {
                    setOpen(false);
                    setEditing(null);
                }}
                onSave={(meal) => {
                    if (editing) onEdit(editing.index, meal);
                    else onAdd(meal);
                    setOpen(false);
                    setEditing(null);
                }}
            />
        </Box>
    );
}

function MealItemsList({
    items,
    emptyMessage,
    compact = false,
}: {
    items?: MealItemsDto[] | null;
    emptyMessage: string;
    compact?: boolean;
}) {
    if (!items?.length) {
        return (
            <Typography variant="body2" color="text.secondary">
                {emptyMessage}
            </Typography>
        );
    }

    return (
        <Stack spacing={compact ? 0.75 : 1} sx={{ mt: 1 }}>
            {items.map((item, index) => (
                <Box key={`${item.id ?? item.foodDto?.id ?? 'meal-item'}-${index}`}>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {item.foodDto?.description || 'Alimento sem descrição'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        {buildItemDescription(item)}
                    </Typography>
                </Box>
            ))}
        </Stack>
    );
}

const buildMockMacros = (meal: MealDto): MockMacros => {
    const allItems = getMealItems(meal);
    const protein = allItems.length * 12;
    const carbs = allItems.length * 18;
    const fat = allItems.length * 6;

    return {
        protein,
        carbs,
        fat,
        calories: protein * 4 + carbs * 4 + fat * 9,
    };
};

const getMealItems = (meal: MealDto): MealItemsDto[] => [
    ...(meal.items ?? []),
    ...((meal.substitute ?? []).flatMap((substitute) => substitute.items ?? [])),
];

const hasMealDetails = (meal: MealDto) =>
    Boolean(meal.items?.length) || Boolean(meal.substitute?.length);

const buildItemDescription = (item: MealItemsDto) => {
    const tokens = [
        item.quantity || undefined,
        item.quantityInGrams != null ? `${item.quantityInGrams} g` : undefined,
        item.homemadeMeasureDto?.name || undefined,
    ].filter(Boolean);

    return tokens.length ? tokens.join(' • ') : 'Sem quantidade informada';
};
