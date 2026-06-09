import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';

import type { TableEmptyRowsProps } from './types';

// ----------------------------------------------------------------------

export function TableEmptyRows({ emptyRows, height = 68, colSpan = 1, sx, ...other }: TableEmptyRowsProps) {
  if (!emptyRows) {
    return null;
  }

  return (
    <>
      {Array.from({ length: emptyRows }).map((_, idx) => (
        <TableRow
          key={idx}
          sx={[height && { height }, ...(Array.isArray(sx) ? sx : [sx])]}
          {...other}
        >
          <TableCell colSpan={colSpan} />
        </TableRow>
      ))}
    </>
  );
}
