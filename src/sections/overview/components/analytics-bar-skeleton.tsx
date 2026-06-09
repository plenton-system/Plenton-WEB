import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Skeleton from '@mui/material/Skeleton';
import CardHeader from '@mui/material/CardHeader';

// ----------------------------------------------------------------------

export function AnalyticsBarSkeleton() {
    return (
        <Card>
            <CardHeader title={<Skeleton width={240} />} subheader={<Skeleton width={200} />} />
            <Box sx={{ px: 2.5, pb: 2.5 }}>
                <Skeleton variant="rounded" height={364} />
            </Box>
        </Card>
    );
}
