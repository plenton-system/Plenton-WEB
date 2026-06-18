import { WorkspaceGenericListTab } from './workspace-generic-list-tab';
import { useTranslation } from 'react-i18next';

// ----------------------------------------------------------------------

type Props = {
  items: ReadonlyArray<{ primary: string; secondary?: string }>;
};

// ----------------------------------------------------------------------

export function WorkspaceDocumentsTab({ items }: Props) {
  const { t } = useTranslation();

  return (
    <WorkspaceGenericListTab
      title={t('workspace.documents.title')}
      items={items}
      placeholder={t('workspace.documents.empty')}
    />
  );
}
