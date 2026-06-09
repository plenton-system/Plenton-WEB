import { useColorScheme } from '@mui/material/styles';

// ----------------------------------------------------------------------

export type ThemeMode = 'light' | 'dark' | 'system';

const VALID_MODES: ThemeMode[] = ['light', 'dark', 'system'];

/**
 * Normaliza valores externos (ex.: tema vindo do backend como "Light"/"Dark")
 * para o formato aceito pelo MUI. Um valor inválido quebraria a troca de tema,
 * deixando o app preso no esquema padrão.
 */
function normalizeMode(value?: string | null): ThemeMode {
    const mode = value?.toLowerCase() as ThemeMode | undefined;
    return mode && VALID_MODES.includes(mode) ? mode : 'system';
}

// ----------------------------------------------------------------------

export function useThemeMode() {
    const { mode, setMode, systemMode } = useColorScheme();
    const resolvedMode = (mode === 'system' ? systemMode ?? 'light' : mode) as Exclude<ThemeMode, 'system'>;

    const setModeSafe = (next: ThemeMode | string) => setMode(normalizeMode(next));

    return { mode: (mode ?? 'system') as ThemeMode, setMode: setModeSafe, systemMode, resolvedMode };
}
