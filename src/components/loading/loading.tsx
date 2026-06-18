import { useTheme } from '@mui/material/styles';
import { Box, keyframes, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

// ----------------------------------------------------------------------

const spin = keyframes`
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
`;

const spinRev = keyframes`
  from { transform: rotate(0deg); }
  to   { transform: rotate(-360deg); }
`;

const pulseLeaf = keyframes`
  0%, 100% { transform: scale(1); opacity: 0.9; }
  50%       { transform: scale(1.12); opacity: 1; }
`;

const dotBounce = keyframes`
  0%, 80%, 100% { transform: translateY(0); opacity: 0.45; }
  40%           { transform: translateY(-8px); opacity: 1; }
`;

const fadeMsg = keyframes`
  0%, 40%, 100% { opacity: 1; }
  50%, 90%      { opacity: 0.4; }
`;

// ----------------------------------------------------------------------

interface LoadingProps {
    /** Override the cycling message list */
    messages?: string[];
    /** Static message — disables cycling */
    message?: string;
    /** Renders compact inside a card/dialog instead of full viewport */
    inline?: boolean;
}

export function Loading({ messages, message, inline = false }: LoadingProps) {
    const theme = useTheme();
    const { t } = useTranslation();
    const resolvedMessages = messages ?? [
        t('shared.loadingMessages.plan'),
        t('shared.loadingMessages.nutrients'),
        t('shared.loadingMessages.form'),
        t('shared.loadingMessages.almost'),
    ];

    /**
     * Semantic color mapping:
     *  primary  → proteínas / outer arc / leaf
     *  warning  → carboidratos / inner arc
     *  error    → gorduras
     */
    const c = {
        primary: theme.palette.primary.main,
        primaryLight: theme.palette.primary.light,
        warning: theme.palette.warning.main,
        error: theme.palette.error.main,
    };

    const DOTS = [
        { color: c.primary, delay: '0s' },
        { color: c.warning, delay: '0.2s' },
        { color: c.error, delay: '0.4s' },
    ];

    const MACROS = [
        { label: t('shared.macros.protein'), color: c.primary },
        { label: t('shared.macros.carbs'), color: c.warning },
        { label: t('shared.macros.fat'), color: c.error },
    ];

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: inline ? 200 : '100vh',
                p: inline ? 2 : 4,
                fontFamily: theme.typography.fontFamily,
            }}
        >
            {/* ── Animated plate ── */}
            <Box sx={{ position: 'relative', width: 96, height: 96, mb: 3 }}>
                {/* Outer ring */}
                <Box
                    sx={{
                        position: 'absolute',
                        inset: 0,
                        borderRadius: '50%',
                        border: '2px solid',
                        borderColor: 'divider',
                    }}
                />
                {/* Outer arc — primary */}
                <Box
                    sx={{
                        position: 'absolute',
                        inset: 0,
                        borderRadius: '50%',
                        border: '2.5px solid transparent',
                        borderTopColor: c.primary,
                        borderRightColor: c.primary,
                        animation: `${spin} 1.4s cubic-bezier(0.6,0,0.4,1) infinite`,
                    }}
                />
                {/* Inner arc — warning */}
                <Box
                    sx={{
                        position: 'absolute',
                        inset: '8px',
                        borderRadius: '50%',
                        border: '2px solid transparent',
                        borderBottomColor: c.warning,
                        borderLeftColor: c.warning,
                        animation: `${spinRev} 1.8s cubic-bezier(0.6,0,0.4,1) infinite`,
                    }}
                />
                {/* Leaf icon — primary */}
                <Box
                    sx={{
                        position: 'absolute',
                        inset: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        animation: `${pulseLeaf} 2s ease-in-out infinite`,
                    }}
                >
                    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                        <path
                            d="M14 3C14 3 5 8 5 16C5 21 9 24 14 24C19 24 23 21 23 16C23 8 14 3 14 3Z"
                            fill={c.primary}
                            opacity="0.15"
                        />
                        <path
                            d="M14 3C14 3 5 8 5 16C5 21 9 24 14 24C19 24 23 21 23 16C23 8 14 3 14 3Z"
                            stroke={c.primary}
                            strokeWidth="1.5"
                            strokeLinejoin="round"
                        />
                        <path d="M14 3L14 22" stroke={c.primary} strokeWidth="1" strokeLinecap="round" opacity="0.5" />
                        <path d="M14 10C14 10 10 13 9 17" stroke={c.primary} strokeWidth="1" strokeLinecap="round" opacity="0.4" />
                        <path d="M14 10C14 10 18 13 19 17" stroke={c.primary} strokeWidth="1" strokeLinecap="round" opacity="0.4" />
                    </svg>
                </Box>
            </Box>

            {/* ── Bouncing dots ── */}
            <Box sx={{ display: 'flex', gap: '10px', mb: 1.5 }}>
                {DOTS.map((dot, i) => (
                    <Box
                        key={i}
                        sx={{
                            width: 7,
                            height: 7,
                            borderRadius: '50%',
                            bgcolor: dot.color,
                            animation: `${dotBounce} 1.4s ease-in-out ${dot.delay} infinite`,
                        }}
                    />
                ))}
            </Box>

            {/* ── Cycling message ── */}
            <Typography
                sx={{
                    fontFamily: `${theme.typography.fontFamily}`,
                    fontWeight: 300,
                    fontStyle: 'italic',
                    fontSize: 17,
                    letterSpacing: '-0.01em',
                    color: 'text.primary',
                    mb: 0.5,
                    animation: message ? 'none' : `${fadeMsg} 2.4s ease-in-out infinite`,
                }}
            >
                {message ?? resolvedMessages[0]}
            </Typography>

            {/* ── Brand label ── */}
            <Typography
                sx={{
                    fontSize: 11,
                    fontWeight: 500,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: c.primary,
                }}
            >
                Plenton
            </Typography>

            {/* ── Macro legend ── */}
            <Box sx={{ display: 'flex', gap: '18px', mt: 2.5, opacity: 0.55 }}>
                {MACROS.map((m) => (
                    <Box key={m.label} sx={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: m.color }} />
                        <Typography sx={{ fontSize: 11, color: 'text.secondary', letterSpacing: '0.04em' }}>
                            {m.label}
                        </Typography>
                    </Box>
                ))}
            </Box>
        </Box>
    );
}
