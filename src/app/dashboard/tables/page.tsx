import PageContainer from '@/components/layout/page-container';
import FloorPlanView from '@/features/tables/components/floor-plan';

export const metadata = {
  title: 'Dashboard: Mesas'
};

export default function Page() {
  return (
    <PageContainer
      pageTitle='Mapa de mesas'
      pageDescription='Organiza las mesas de tu restaurante por zonas.'
    >
      <FloorPlanView />
    </PageContainer>
  );
}
