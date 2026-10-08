import PageContainer from '@/components/layout/page-container';
import { ReportsView } from '@/features/reports/components/reports-view';

export const metadata = {
  title: 'Dashboard: Reportes'
};

export default function Page() {
  return (
    <PageContainer
      pageTitle='Reportes'
      pageDescription='Ventas, productos más vendidos y métodos de pago.'
    >
      <ReportsView />
    </PageContainer>
  );
}
