import { currentUser } from '@clerk/nextjs/server';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { ProjectForm } from '@/components/ProjectForm';
import { getStudioByClerkId } from '@/libs/Anivest';

type NewProjectPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function NewProjectPage(props: NewProjectPageProps) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  const t = await getTranslations({
    locale,
    namespace: 'Studio',
  });

  const user = await currentUser();

  if (!user) {
    notFound();
  }

  const studio = await getStudioByClerkId(user.id);

  if (!studio) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-3xl py-8">
      <h1 className="mb-6 text-3xl font-bold text-gray-900">{t('create_project_title')}</h1>
      <ProjectForm />
    </div>
  );
}
