import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';

import { GenericTableToolbar } from 'src/components/table';

// ----------------------------------------------------------------------

type Props = {
  filterValue: string;
  onFilterValue: (value: string) => void;
};

// ----------------------------------------------------------------------

export function FoodTableToolbar({ filterValue, onFilterValue }: Props) {
  return (
    <Box sx={{ p: 2 }}>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ md: 'center' }}>
        <Box sx={{ flexGrow: 1, minWidth: 260 }}>
          <GenericTableToolbar
            numSelected={0}
            filterValue={filterValue}
            onFilterValue={(e) => onFilterValue(e.target.value)}
            placeholder="Buscar alimento"
          />
        </Box>
      </Stack>
    </Box>
  );
}
