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

import MealSubDialog from './meal-sub-dialog';

import type { MealDto } from '../../../../types';

// ----------------------------------------------------------------------

type MealsSubstituteSectionProps = {
    substitutes: MealDto[];
    parentName: string;
    onAdd: (m: MealDto) => void;
    onEdit: (idx: number, m: MealDto) => void;
    onRemove: (idx: number) => void;
};

// ----------------------------------------------------------------------

export default function MealsSubstituteSection({
    substitutes,
    parentName,
    onAdd,
    onEdit,
    onRemove,
}: MealsSubstituteSectionProps) {
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState<{ i: number; v: MealDto } | null>(null);

    return (
        <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Typography variant="body1" sx={{ flexGrow: 1 }}>
                    Substitutas de <b>{parentName}</b>
                </Typography>
                <Button
                    startIcon={<AddIcon />}
                    size="small"
                    onClick={() => {
                        setEditing(null);
                        setOpen(true);
                    }}
                >
                    Adicionar substituta
                </Button>
            </Box>

            <Card variant="outlined" sx={{ mb: 1 }}>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell>Nome</TableCell>
                            <TableCell>Hora</TableCell>
                            <TableCell>Itens</TableCell>
                            <TableCell align="right">Ações</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {substitutes?.length ? (
                            substitutes.map((s, i) => (
                                <TableRow key={i}>
                                    <TableCell>{s.name}</TableCell>
                                    <TableCell>{s.time}</TableCell>
                                    <TableCell>{s.items?.length ?? 0}</TableCell>
                                    <TableCell align="right">
                                        <Tooltip title="Editar">
                                            <IconButton size="small" onClick={() => setEditing({ i, v: s })}>
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
                                <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                                    Nenhuma substituta adicionada.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </Card>

            <MealSubDialog
                open={open || !!editing}
                initial={editing?.v ?? null}
                onClose={() => {
                    setOpen(false);
                    setEditing(null);
                }}
                onSave={(m) => {
                    if (editing) onEdit(editing.i, { ...m, isSubstitute: true });
                    else onAdd({ ...m, isSubstitute: true });
                    setOpen(false);
                    setEditing(null);
                }}
            />
        </Box>
    );
}
