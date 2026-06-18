import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import { useTranslation } from 'react-i18next';

import { Loading } from 'src/components/loading';

import { WorkspaceSectionList } from '../section-list/workspace-section-list';

// ----------------------------------------------------------------------

type WorkspaceListItem = { primary: string; secondary?: string };

type Props = {
  title: string;
  items: ReadonlyArray<WorkspaceListItem>;
  placeholder?: string;
  loading?: boolean;
  error?: string | null;
  onReload?: () => void;
};

// ----------------------------------------------------------------------

export function WorkspaceGenericListTab({ title, items, placeholder, loading, error, onReload }: Props) {
  const { t } = useTranslation();

  if (loading) {
    return (
      <Card variant="outlined" sx={{ p: 2 }}>
        <Loading inline message={t('workspace.generic.loading', { title: title.toLowerCase() })} />
      </Card>
    );
  }

  if (error) {
    return (
      <Card variant="outlined" sx={{ p: 2 }}>
        <Typography variant="body2" color="error">
          {error}
        </Typography>
        {onReload && (
          <Typography
            component="button"
            variant="body2"
            sx={{ mt: 1, color: 'primary.main', textDecoration: 'underline', cursor: 'pointer' }}
            onClick={onReload}
          >
            {t('shared.retry')}
          </Typography>
        )}
      </Card>
    );
  }

  if (!items?.length && placeholder) {
    return (
      <Card variant="outlined" sx={{ p: 2 }}>
        <Typography variant="body2" color="text.secondary">
          {placeholder}
        </Typography>
      </Card>
    );
  }

  return <WorkspaceSectionList title={title} items={items} />;
}
