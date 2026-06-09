import { useRef, useMemo, useState, useCallback, createContext } from 'react';

import { ConfirmDialog } from 'src/components/confirm-dialog';

// ----------------------------------------------------------------------

export type ConfirmOptions = {
    title?: string;
    description?: string;
    confirmText?: string;
    cancelText?: string;
    destructive?: boolean;
};

type ConfirmContextType = {
    confirm: (opts: ConfirmOptions) => Promise<boolean>;
};

type InternalState = {
    open: boolean;
    opts: ConfirmOptions;
};

// ----------------------------------------------------------------------

export const ConfirmContext = createContext<ConfirmContextType | null>(null);

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
    const [state, setState] = useState<InternalState>({ open: false, opts: {} });

    const resolveRef = useRef<((ok: boolean) => void) | null>(null);

    const confirm = useCallback((opts: ConfirmOptions) => {
        // evita abrir dois confirms ao mesmo tempo
        if (state.open) {
            return Promise.resolve(false);
        }

        return new Promise<boolean>((resolve) => {
            resolveRef.current = resolve;
            setState({ open: true, opts });
        });
    }, [state.open]);

    const closeAndResolve = useCallback((value: boolean) => {
        // resolve primeiro, depois fecha
        resolveRef.current?.(value);
        resolveRef.current = null;
        setState((s) => ({ ...s, open: false }));
    }, []);

    const handleClose = useCallback(() => closeAndResolve(false), [closeAndResolve]);
    const handleConfirm = useCallback(() => closeAndResolve(true), [closeAndResolve]);

    const value = useMemo(() => ({ confirm }), [confirm]);

    return (
        <ConfirmContext.Provider value={value}>
            {children}

            <ConfirmDialog
                open={state.open}
                onClose={handleClose}
                onConfirm={handleConfirm}
                title={state.opts.title}
                description={state.opts.description}
                confirmText={state.opts.confirmText}
                cancelText={state.opts.cancelText}
                destructive={state.opts.destructive}
            />
        </ConfirmContext.Provider>
    );
}
