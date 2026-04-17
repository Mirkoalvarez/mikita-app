import AuthGate from '@/shared/components/AuthGate';
import AdminDashboard from '@/features/admin/AdminDashboard';

export default function AdminPage() {
  return (
    <AuthGate title="Mikita" subtitle="Nail Bar" backHref="/" backLabel="← Volver al cotizador">
      <AdminDashboard />
    </AuthGate>
  );
}
