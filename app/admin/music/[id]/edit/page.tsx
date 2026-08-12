import { notFound } from 'next/navigation';
import { getMusicById } from '@/lib/storage/repository';
import MusicForm from '@/components/admin/MusicForm';

export const revalidate = 0;

interface EditMusicPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditMusicPage({ params }: EditMusicPageProps) {
  const { id } = await params;
  const music = getMusicById(id);

  if (!music) {
    notFound();
  }

  return <MusicForm initialData={music} isEdit={true} />;
}
