import Card from '@mui/material/Card';
import List from '@mui/material/List';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import ListItem from '@mui/material/ListItem';
import Typography from '@mui/material/Typography';
import ListItemText from '@mui/material/ListItemText';

// ----------------------------------------------------------------------

type WorkspaceSectionListItem = { primary: string; secondary?: string };

type WorkspaceSectionListProps = {
    title: string;
    items: ReadonlyArray<WorkspaceSectionListItem>;
    actionLabel?: string;
    onAction?: () => void;
};

// ----------------------------------------------------------------------

export function WorkspaceSectionList({ title, items, actionLabel, onAction }: WorkspaceSectionListProps) {
    return (
        <Card variant="outlined" sx={{ p: 2 }}>
            <Stack spacing={2}>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Typography variant="h6">{title}</Typography>
                    {actionLabel && (
                        <Button size="small" variant="outlined" onClick={onAction}>
                            {actionLabel}
                        </Button>
                    )}
                </Stack>

                <List disablePadding>
                    {items.map((item, idx) => (
                        <ListItem key={idx} disableGutters>
                            <ListItemText primary={item.primary} secondary={item.secondary} />
                        </ListItem>
                    ))}
                    {items.length === 0 && (
                        <Typography variant="body2" color="text.secondary">
                            Nenhum item disponível.
                        </Typography>
                    )}
                </List>
            </Stack>
        </Card>
    );
}
