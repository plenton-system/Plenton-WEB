import { useState } from 'react';

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
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState<{ i: number; v: MealItemsDto } | null>(null);

    return (
        <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, mb: 1 }}>
                <Typography variant="subtitle1" sx={{ flexGrow: 1 }}>
                    Itens da refeição
                </Typography>
                <Button
                    startIcon={<AddIcon />}
                    size="small"
                    onClick={() => {
                        setEditing(null);
                        setOpen(true);
                    }}
                >
                    Adicionar item
                </Button>
            </Box>

            <Card variant="outlined">
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell>Alimento</TableCell>
                            <TableCell>Qtd</TableCell>
                            <TableCell>Gramas</TableCell>
                            <TableCell>Medida</TableCell>
                            <TableCell>Opcional</TableCell>
                            <TableCell>Ordem</TableCell>
                            <TableCell align="right">Ações</TableCell>
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
                                    <TableCell>{it.isOptional ? 'Sim' : 'Não'}</TableCell>
                                    <TableCell>{it.order ?? '-'}</TableCell>
                                    <TableCell align="right">
                                        <Tooltip title="Editar">
                                            <IconButton size="small" onClick={() => setEditing({ i, v: it })}>
                                                <EditIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Remover">
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
                                    Nenhum item adicionado.
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
