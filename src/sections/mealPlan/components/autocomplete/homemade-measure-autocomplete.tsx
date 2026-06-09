import { useState } from 'react';

import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Autocomplete, { createFilterOptions } from '@mui/material/Autocomplete';

import { useHomemadeMeasures } from 'src/hooks/meal-plan/use-homemade-measures';

import { Iconify } from 'src/components/iconify';

import HomemadeMeasureDialog from '../items/homemade-measure-dialog';

import type { HomemadeMeasureDto } from '../../../../types';

// ----------------------------------------------------------------------

type Props = {
    foodId?: string | null;
    value: HomemadeMeasureDto | null | undefined;
    onChange: (v: HomemadeMeasureDto | null) => void;
};

type HomemadeMeasureOption = HomemadeMeasureDto & {
    isAdd?: boolean;
};

const filter = createFilterOptions<HomemadeMeasureOption>();

// ----------------------------------------------------------------------

export default function HomemadeMeasureAutocomplete({ foodId, value, onChange }: Props) {
    const { measures, loading, refetch } = useHomemadeMeasures({ foodId });

    const [openDialog, setOpenDialog] = useState(false);

    const handleSaveNew = (newMeasure: HomemadeMeasureDto) => {
        refetch();
        onChange(newMeasure);
    };

    const options: HomemadeMeasureOption[] = foodId
        ? [
              {
                  id: 'add-new',
                  name: 'Adicionar nova medida...',
                  isAdd: true,
                  foodId: '',
                  quantityInGrams: 0,
                  isGlobal: false,
              },
              ...measures,
          ]
        : measures;

    return (
        <>
            <Autocomplete<HomemadeMeasureOption>
                options={options}
                loading={loading}
                value={value ?? null}
                filterOptions={(opts, params) => {
                    const filtered = filter(opts, params);
                    if (foodId && !filtered.some((o) => o.isAdd)) {
                        filtered.unshift({
                            id: 'add-new',
                            name: 'Adicionar nova medida...',
                            isAdd: true,
                            foodId: '',
                            quantityInGrams: 0,
                            isGlobal: false,
                        });
                    }
                    return filtered;
                }}
                onChange={(_, v) => {
                    if (v?.isAdd) {
                        setOpenDialog(true);
                    } else {
                        onChange(v ?? null);
                    }
                }}
                getOptionLabel={(o) => o.name}
                isOptionEqualToValue={(option, v) => option.id === v.id}
                renderOption={(props, option) => (
                    <Box component="li" {...props} key={option.id}>
                        {option.isAdd ? (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'primary.main', fontWeight: 'bold' }}>
                                <Iconify icon="mingcute:add-line" width={18} />
                                <Typography variant="body2">{option.name}</Typography>
                            </Box>
                        ) : (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
                                {option.name}
                                {option.isGlobal && (
                                    <Tooltip title="Padrão do sistema">
                                        <Box component="span" sx={{ display: 'inline-flex' }}>
                                            <Iconify
                                                icon="solar:global-bold"
                                                width={16}
                                                sx={{ color: 'primary.main' }}
                                            />
                                        </Box>
                                    </Tooltip>
                                )}
                            </Box>
                        )}
                    </Box>
                )}
                renderInput={(params) => (
                    <TextField
                        {...params}
                        label="Medida caseira"
                        InputProps={{
                            ...params.InputProps,
                            endAdornment: (
                                <>
                                    {loading ? <Iconify icon="mingcute:loading-line" width={20} /> : null}
                                    {params.InputProps.endAdornment}
                                </>
                            ),
                        }}
                    />
                )}
                sx={{ flex: 1, minWidth: 220 }}
            />

            {foodId && (
                <HomemadeMeasureDialog
                    open={openDialog}
                    foodId={foodId}
                    onClose={() => setOpenDialog(false)}
                    onSave={handleSaveNew}
                />
            )}
        </>
    );
}

