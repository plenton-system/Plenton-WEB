import { WorkspaceGenericListTab } from './workspace-generic-list-tab';

// ----------------------------------------------------------------------

type Props = {
  items: ReadonlyArray<{ primary: string; secondary?: string }>;
};

// ----------------------------------------------------------------------

export function WorkspaceDocumentsTab({ items }: Props) {
  return (
    <WorkspaceGenericListTab
      title="Documentos e envios"
      items={items}
      placeholder="Sem documentos ou envios."
    />
  );
}
