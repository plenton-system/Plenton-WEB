import type { FoodDto } from 'src/types';

import { useRef, useState, useEffect, useCallback } from 'react';

import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';

import { foodService } from 'src/services/food/foodService';

// ----------------------------------------------------------------------

type Props = {
    value: FoodDto;
    onChange: (v: FoodDto) => void;
};

// ----------------------------------------------------------------------

export default function FoodAutocomplete({ value, onChange }: Props) {
    const [options, setOptions] = useState<FoodDto[]>([]);
    const [inputValue, setInputValue] = useState(value?.description ?? '');
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [currentMode, setCurrentMode] = useState<'search' | 'all'>('all');
    
    const skipSearchRef = useRef(false);

    useEffect(() => {
        if (value?.description && !inputValue && !skipSearchRef.current) {
            setInputValue(value.description);
        }
    }, [value, inputValue]);

    const handleSearch = useCallback(
        async (query: string, mode: 'search' | 'all', pageIndex: number, controller?: AbortController) => {
            setLoading(true);
            try {
                const method = mode === 'search' ? foodService.search : foodService.getAllByTable;
                const response = await method(
                    { value: query, pageIndex, pageSize: 10 },
                    { signal: controller?.signal }
                );

                const items = response.items ?? [];
                const mapped = items.map((item) => ({
                    id: item.id,
                    description: item.description,
                }));

                setOptions((prev) => {
                    const updated = pageIndex === 1 ? mapped : [...prev, ...mapped];

                    // Garantir que o item selecionado esteja na lista e sem duplicatas
                    const seen = new Set();
                    const unique = updated.filter((i) => {
                        if (seen.has(i.id)) return false;
                        seen.add(i.id);
                        return true;
                    });

                    if (value?.id && !unique.some((item) => item.id === value.id)) {
                        unique.unshift(value);
                    }
                    return unique;
                });

                setHasMore(items.length >= 10);
                setPage(pageIndex);
                setCurrentMode(mode);
            } catch (error) {
                if (error instanceof Error && error.name === 'AbortError') return;
                if (pageIndex === 1) {
                    setOptions(value?.id ? [value] : []);
                }
            } finally {
                setLoading(false);
            }
        },
        [value]
    );

    const loadMore = () => {
        if (!loading && hasMore) {
            handleSearch(inputValue.trim(), currentMode, page + 1);
        }
    };

    useEffect(() => {
        let active = true;

        if (skipSearchRef.current) {
            skipSearchRef.current = false;
            return undefined;
        }

        const query = inputValue.trim();

        if (!query || query.length < 3) {
            setOptions(value?.id ? [value] : []);
            setHasMore(false);
            setPage(1);
            return undefined;
        }

        const controller = new AbortController();
        const timeoutId = window.setTimeout(() => {
            if (active) {
                handleSearch(query, 'search', 1, controller);
            }
        }, 350);

        return () => {
            active = false;
            controller.abort();
            window.clearTimeout(timeoutId);
        };
    }, [inputValue, handleSearch, value]);

    return (
        <Autocomplete
            options={options}
            value={value?.id ? value : null}
            onOpen={() => {
                if (options.length <= 1) { // Só busca se estiver vazio ou apenas com o selecionado
                    handleSearch(inputValue.trim(), 'all', 1);
                }
            }}
            onChange={(_, v) => {
                skipSearchRef.current = true;
                setInputValue(v?.description ?? '');
                onChange(v ?? { id: '', description: '' });
            }}
            getOptionLabel={(o) => o.description}
            isOptionEqualToValue={(option, v) => option.id === v.id}
            inputValue={inputValue}
            onInputChange={(_, v, reason) => {
                if (reason !== 'input') return;
                setInputValue(v);
            }}
            filterOptions={(items) => items}
            loading={loading}
            slotProps={{
                listbox: {
                    sx: { maxHeight: 200 },
                    onScroll: (event: React.SyntheticEvent) => {
                        const listboxNode = event.currentTarget;
                        if (
                            listboxNode.scrollTop + listboxNode.clientHeight >=
                            listboxNode.scrollHeight - 1
                        ) {
                            loadMore();
                        }
                    },
                },
            }}
            renderInput={(params) => (
                <TextField {...params} placeholder="Digite para buscar..." label="Alimento" required />
            )}
            fullWidth
        />
    );
}
