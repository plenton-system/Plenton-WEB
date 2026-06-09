import Table from '@mui/material/Table';
import Skeleton from '@mui/material/Skeleton';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableContainer from '@mui/material/TableContainer';

import type { TableSkeletonProps } from '../types';

// ----------------------------------------------------------------------

export function TableSkeleton({
    rows = 5,
    columns = 4,
    withHeader = true,
    rowHeight = 48,
}: TableSkeletonProps) {
    return (
        <TableContainer>
            <Table>
                {withHeader && (
                    <TableHead>
                        <TableRow>
                            {Array.from({ length: columns }).map((_, i) => (
                                <TableCell key={i}>
                                    <Skeleton variant="text" width="80%" />
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                )}

                <TableBody>
                    {Array.from({ length: rows }).map((_, rowIndex) => (
                        <TableRow key={rowIndex}>
                            {Array.from({ length: columns }).map((__, colIndex) => (
                                <TableCell key={colIndex}>
                                    <Skeleton height={rowHeight} />
                                </TableCell>
                            ))}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
}
