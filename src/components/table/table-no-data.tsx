import Box from '@mui/material/Box';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';

import type { TableNoDataProps } from './types';

// ----------------------------------------------------------------------

export function TableNoData({ searchQuery, ...other }: TableNoDataProps) {
  return (
    <TableRow {...other}>
      <TableCell align="center" colSpan={7}>
        <Box sx={{ py: 15, textAlign: 'center' }}>
          <Typography variant="h6" sx={{ mb: 1 }}>
            Não encontrado
          </Typography>

          <Typography variant="body2">
            Nenhum resultado encontrado para &nbsp;
            <strong>&quot;{searchQuery}&quot;</strong>.
            <br /> Tente verificar se há erros de digitação ou use palavras completas.
          </Typography>
        </Box>
      </TableCell>
    </TableRow>
  );
}
