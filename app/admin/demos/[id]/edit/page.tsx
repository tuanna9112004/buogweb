import { notFound } from 'next/navigation';
import { getDemoMusicById } from '@/lib/storage/repository';
import DemoMusicForm from '@/components/admin/DemoMusicForm';

export default async function EditDemoMusicPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const item = getDemoMusicById(id);

  if (!item) {
    notFound();
  }

  return (
    <div className="pb-10">
      <DemoMusicForm initialData={item} isEdit />
    </div>
  );
}
