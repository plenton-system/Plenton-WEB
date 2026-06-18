import type { WorkspaceStatus } from 'src/types';

import i18n from 'src/i18n';

export const WORKSPACE_STATUS_ORDER: WorkspaceStatus[] = ['ACTIVE', 'INACTIVE', 'SUSPENDED'];

export const WORKSPACE_STATUS_COLOR: Record<WorkspaceStatus, 'default' | 'warning' | 'success'> = {
  ACTIVE: 'success',
  INACTIVE: 'warning',
  SUSPENDED: 'default',
};

export const getWorstStatus = (item: {
  planStatus: WorkspaceStatus | null;
  anthropometryStatus: WorkspaceStatus | null;
  anamnesisStatus: WorkspaceStatus | null;
}): WorkspaceStatus | null => {
  const statuses = [item.planStatus, item.anthropometryStatus, item.anamnesisStatus].filter(
    (status): status is WorkspaceStatus => Boolean(status)
  );

  if (!statuses.length) {
    return null;
  }

  const index = Math.max(...statuses.map((s) => WORKSPACE_STATUS_ORDER.indexOf(s)));
  return WORKSPACE_STATUS_ORDER[index];
};

export const getWorkspaceStatusLabel = (status: WorkspaceStatus | null | undefined) =>
  status === 'ACTIVE'
    ? i18n.t('workspace.status.active')
    : status === 'INACTIVE'
      ? i18n.t('workspace.status.inactive')
      : status === 'SUSPENDED'
        ? i18n.t('workspace.status.suspended')
        : '-';

export const getWorkspaceStatusColor = (
  status: WorkspaceStatus | null | undefined
): 'default' | 'warning' | 'success' => (status ? WORKSPACE_STATUS_COLOR[status] : 'default');
