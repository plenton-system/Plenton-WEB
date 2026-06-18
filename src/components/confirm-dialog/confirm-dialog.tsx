import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import CircularProgress from '@mui/material/CircularProgress';

import type { ConfirmDialogProps } from './types';


// ----------------------------------------------------------------------

function WarningTriangle({ color }: { color: 'error' | 'primary' }) {
    return (
        <Box
            sx={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                display: 'grid',
                placeItems: 'center',
                bgcolor: (t) =>
                    t.palette.mode === 'light' ?
                        `${t.palette[color].main}22` : `${t.palette[color].main}33`,
                color: (t) => t.palette[color].main,
            }}
        >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path
                    d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    fill="none"
                />
                <path d="M12 8v5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                <circle cx="12" cy="16.5" r="1" fill="currentColor" />
            </svg>
        </Box>
    );
}

export function ConfirmDialog({
    open,
    title,
    description,
    confirmText,
    cancelText,
    destructive = false,
    onClose,
    onConfirm,
}: ConfirmDialogProps) {
    const { t } = useTranslation();
    const [submitting, setSubmitting] = useState(false);
    const accent = useMemo(() => (destructive ? 'error' : 'primary'), [destructive]);

    const handleConfirm = async () => {
        try {
            const r = onConfirm();
            if (r instanceof Promise) {
                setSubmitting(true);
                await r;
            }
            onClose();
        } catch {
            // mantém aberto; toast/erro exibido externamente
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog
            open={open}
            onClose={(_, reason) => {
                if (submitting && (reason === 'backdropClick' || reason === 'escapeKeyDown')) return;
                onClose();
            }}
            maxWidth="xs"
            fullWidth
            slotProps={{
                paper: {
                    elevation: 0,
                    sx: (theme) => ({
                        borderRadius: 3,
                        border: `1px solid ${theme.palette.divider}`,
                        boxShadow: `0 10px 30px ${theme.palette.mode === 'light' ? 'rgba(16,24,40,0.08)' : 'rgba(0,0,0,0.5)'}`,
                    })
                }
            }}
        >
            <DialogTitle sx={{ p: 0 }}>
                <Stack spacing={2} alignItems="center" textAlign="center" sx={{ pt: 3 }}>
                    <WarningTriangle color={accent} />
                    <Typography variant="h6" component="h2">{title ?? t('shared.confirmAction')}</Typography>
                </Stack>
            </DialogTitle>

            <DialogContent sx={{ px: 3, pt: 1, pb: 0 }}>
                <Typography variant="body2" color="text.secondary" textAlign="center">
                    {description ?? t('shared.irreversibleAction')}
                </Typography>
            </DialogContent>

            <DialogActions
                sx={{
                    p: 3,
                    gap: 1,
                    gridTemplateColumns: '1fr',
                }}
            >
                {/* Cancel: claro com borda */}
                <Button
                    onClick={onClose}
                    color='error'
                    disabled={submitting}
                    fullWidth
                    variant="outlined"
                    sx={{
                        py: 1.2,
                        borderRadius: 2,
                        textTransform: 'none',
                        fontWeight: 600,
                        borderColor: (theme) => theme.palette[accent].main,
                        color: (theme) => theme.palette[accent].main
                    }}
                >
                    {cancelText ?? t('actions.cancel')}
                </Button>

                {/* Botão principal ermelho */}
                <Button
                    onClick={handleConfirm}
                    color={accent}
                    variant="contained"
                    disabled={submitting}
                    fullWidth
                    sx={{
                        py: 1.2,
                        borderRadius: 2,
                        textTransform: 'none',
                        fontWeight: 600,
                    }}
                >
                    {submitting ? <CircularProgress size={20} /> : (confirmText ?? t('actions.confirm'))}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
