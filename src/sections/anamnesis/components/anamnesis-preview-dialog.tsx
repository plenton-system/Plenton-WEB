import type { AnamnesisQuestionDto } from 'src/types';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

import { QuestionType } from 'src/enums/anamnesis';

// ----------------------------------------------------------------------

type Props = {
    open: boolean;
    onClose: () => void;
    title: string;
    description?: string | null;
    questions: AnamnesisQuestionDto[];
};

// ----------------------------------------------------------------------

export function AnamnesisPreviewDialog({ open, onClose, title, description, questions }: Props) {
    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
            <DialogTitle>Prévia do questionário</DialogTitle>
            <DialogContent dividers>
                <Card variant="outlined">
                    <CardHeader title={title || 'Sem título'} subheader={description ?? undefined} />
                    <CardContent>
                        <Stack spacing={2}>
                            {questions.length === 0 ? (
                                <Typography color="text.secondary">Nenhuma pergunta adicionada.</Typography>
                            ) : (
                                questions.map((q) => (
                                    <Box key={q.id}>
                                        <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                                            {q.label} {q.required && <span style={{ color: '#2e7d32' }}>*</span>}
                                        </Typography>

                                        {q.type === QuestionType.Text && <TextField fullWidth placeholder="Sua resposta" />}
                                        {q.type === QuestionType.Number && (
                                            <TextField
                                                fullWidth
                                                type="number"
                                                placeholder="0"
                                                slotProps={{
                                                    htmlInput: {
                                                        min: q.min ?? undefined, max: q.max ?? undefined
                                                    }
                                                }}
                                            />
                                        )}
                                        {q.type === QuestionType.Boolean && (
                                            <Stack direction="row" spacing={1}><Chip label="Sim" /><Chip label="Não" /></Stack>
                                        )}
                                        {(q.type === QuestionType.Select || q.type === QuestionType.MultiSelect) && (
                                            <Stack direction="row" spacing={1} flexWrap="wrap">
                                                {(q.options ?? []).map((opt) => <Chip key={opt} label={opt} />)}
                                            </Stack>
                                        )}

                                        {q.helpText && (
                                            <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                                                {q.helpText}
                                            </Typography>
                                        )}
                                    </Box>
                                ))
                            )}
                        </Stack>
                    </CardContent>
                </Card>
            </DialogContent>
            <DialogActions>
                <Button variant="outlined" onClick={onClose}>
                    Fechar
                </Button>
            </DialogActions>
        </Dialog>
    );
}
