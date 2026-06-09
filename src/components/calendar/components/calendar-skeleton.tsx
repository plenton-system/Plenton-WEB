import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';

// ----------------------------------------------------------------------

export function CalendarSkeleton() {
    return (
        <Box
            sx={(theme) => ({
                position: 'absolute',
                inset: 0,
                zIndex: 10,
                pointerEvents: 'none',
                bgcolor: theme.vars.palette.background.default,
                display: 'flex',
                flexDirection: 'column',
                p: 2,
                pt: 0,
                height: "100%",
                boxSizing: 'border-box',
            })}
        >
            <Box sx={{ mb: 2, width: "100%" }}>
                <Skeleton variant="rectangular" width="100%" height={40} />
            </Box>
            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(7, 1fr)',
                    gap: 1,
                    height: 'calc(100% - 90px)',
                }}
            >
                {[...Array(6 * 7)].map((_, i) => (
                    <Skeleton key={i} variant="rectangular" height="100%" sx={{ minHeight: 80 }} />
                ))}
            </Box>
        </Box>
    );
}