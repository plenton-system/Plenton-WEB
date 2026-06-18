import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { useTranslation } from 'react-i18next';

import { GenericTableToolbar } from 'src/components/table';

// ----------------------------------------------------------------------

type Props = {
  filterValue: string;
  onFilterValue: (value: string) => void;
};

// ----------------------------------------------------------------------

export function WorkspaceTableToolbar({ filterValue, onFilterValue }: Props) {
  const { t } = useTranslation();
  return (
    <Box sx={{ p: 2 }}>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ md: 'center' }}>
        <Box sx={{ flexGrow: 1, minWidth: 260 }}>
          <GenericTableToolbar
            numSelected={0}
            filterValue={filterValue}
            onFilterValue={(event) => onFilterValue(event.target.value)}
            placeholder={t('workspace.list.search')}
          />
        </Box>
      </Stack>
    </Box>
  );
}
