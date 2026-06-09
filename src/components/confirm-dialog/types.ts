
// ----------------------------------------------------------------------

export type ConfirmDialogProps = {
    open: boolean;
    title?: string;
    description?: string;
    confirmText?: string;
    cancelText?: string;
    destructive?: boolean;
    onClose: () => void;
    onConfirm: () => void | Promise<void>;
};