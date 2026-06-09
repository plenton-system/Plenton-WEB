import Button from '@mui/material/Button';
import Toolbar from '@mui/material/Toolbar';
import Lightbulb from '@mui/icons-material/Lightbulb';

// ----------------------------------------------------------------------

type Props = {
    onUseExample: () => void;
};

// ----------------------------------------------------------------------

export function AnamnesisHeaderActions({ onUseExample }: Props) {
    return (
        <Toolbar disableGutters sx={{ gap: 1, mb: 2, justifyContent: 'flex-end' }}>
            <Button onClick={onUseExample} startIcon={<Lightbulb />}>
                Usar exemplo
            </Button>
        </Toolbar>
    );
}
