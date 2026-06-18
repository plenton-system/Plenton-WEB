import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import TableRow from '@mui/material/TableRow';
import AddIcon from '@mui/icons-material/Add';
import TableHead from '@mui/material/TableHead';
import TableCell from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';
import EditIcon from '@mui/icons-material/Edit';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';

import ItemDialog from './item-dialog';

import type { MealItemsDto } from '../../../../types';

// ----------------------------------------------------------------------

type Props = {
    items: MealItemsDto[];
    onAdd: (i: MealItemsDto) => void;
    onEdit: (idx: number, i: MealItemsDto) => void;
    onRemove: (idx: number) => void;
};

// ----------------------------------------------------------------------

export default function ItemsSection({ items, onAdd, onEdit, onRemove }: Props) {
    const { t } = useTranslation();
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState<{ i: number; v: MealItemsDto } | null>(null);

    return (
        <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, mb: 1 }}>
                <Typography variant="subtitle1" sx={{ flexGrow: 1 }}>
                    {t('mealplan.items.title')}
                </Typography>
                <Button
                    startIcon={<AddIcon />}
                    size="small"
                    onClick={() => {
                        setEditing(null);
                        setOpen(true);
                    }}
                >
                    {t('mealplan.items.add')}
                </Button>
            </Box>

            <Card variant="outlined">
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell>{t('mealplan.items.columns.food')}</TableCell>
                            <TableCell>{t('mealplan.items.columns.quantity')}</TableCell>
                            <TableCell>{t('mealplan.items.columns.grams')}</TableCell>
                            <TableCell>{t('mealplan.items.columns.measure')}</TableCell>
                            <TableCell>{t('mealplan.items.columns.optional')}</TableCell>
                            <TableCell>{t('mealplan.items.columns.order')}</TableCell>
                            <TableCell align="right">{t('mealplan.items.columns.actions')}</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {items?.length ? (
                            items.map((it, i) => (
                                <TableRow key={i}>
                                    <TableCell>{it.foodDto?.description}</TableCell>
                                    <TableCell>{it.quantity ?? '-'}</TableCell>
                                    <TableCell>{it.quantityInGrams ?? '-'}</TableCell>
                                    <TableCell>{it.homemadeMeasureDto?.name ?? '-'}</TableCell>
                                    <TableCell>{it.isOptional ? t('common.yes') : t('common.no')}</TableCell>
                                    <TableCell>{it.order ?? '-'}</TableCell>
                                    <TableCell align="right">
                                        <Tooltip title={t('actions.edit')}>
                                            <IconButton size="small" onClick={() => setEditing({ i, v: it })}>
                                                <EditIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title={t('actions.remove')}>
                                            <IconButton size="small" color="error" onClick={() => onRemove(i)}>
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                                    {t('mealplan.items.empty')}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </Card>

            <ItemDialog
                open={open || !!editing}
                initial={editing?.v ?? null}
                onClose={() => {
                    setOpen(false);
                    setEditing(null);
                }}
                onSave={(i) => {
                    if (editing) onEdit(editing.i, i);
                    else onAdd(i);
                    setOpen(false);
                    setEditing(null);
                }}
            />
        </Box>
    );
}
