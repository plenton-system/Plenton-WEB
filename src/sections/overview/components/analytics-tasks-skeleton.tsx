import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Skeleton from '@mui/material/Skeleton';
import CardHeader from '@mui/material/CardHeader';

// ----------------------------------------------------------------------

export function AnalyticsTasksSkeleton() {
    return (
        <Card>
            <CardHeader title={<Skeleton width={200} />} subheader={<Skeleton width={80} />} />
            <Box sx={{ px: 2.5, pb: 2.5 }}>
                {[...Array(4)].map((_, i) => (
                    <Box key={i} sx={{ display: 'flex', gap: 1.5, alignItems: 'center', mb: 1.5 }}>
                        <Skeleton variant="circular" width={32} height={32} />
                        <Skeleton width="80%" />
                    </Box>
                ))}
            </Box>
        </Card>
    );
}
