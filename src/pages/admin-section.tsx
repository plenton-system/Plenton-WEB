import { AdminPlaceholderView } from 'src/sections/admin/view/admin-placeholder-view';

type AdminSection = 'tenants' | 'users' | 'subscriptions' | 'operations' | 'audit';

export default function AdminSectionPage({ section }: { section: AdminSection }) {
  return <AdminPlaceholderView section={section} />;
}
