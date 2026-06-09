import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Skeleton from '@mui/material/Skeleton';
import CardHeader from '@mui/material/CardHeader';

// ----------------------------------------------------------------------

export function AnalyticsWidgetSkeleton() {
    return (
        <Card>
            <CardHeader
                title={<Skeleton width={120} />}
                subheader={<Skeleton width={90} />}
            />
            <Box sx={{ px: 1.5, pb: 1.5 }}>
                <Skeleton variant="rounded" height={120} />
            </Box>
        </Card>
    );
}
