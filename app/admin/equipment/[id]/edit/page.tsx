import { notFound } from 'next/navigation';
import { getEquipmentById } from '@/lib/storage/repository';
import EquipmentForm from '@/components/admin/EquipmentForm';

export const revalidate = 0;

interface EditEquipmentPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditEquipmentPage({ params }: EditEquipmentPageProps) {
  const { id } = await params;
  const eq = getEquipmentById(id);

  if (!eq) {
    notFound();
  }

  return <EquipmentForm initialData={eq} isEdit={true} />;
}
