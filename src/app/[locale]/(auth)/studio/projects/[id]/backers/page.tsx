import { currentUser } from '@clerk/nextjs/server';
import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { ProjectBackersList } from '@/components/ProjectBackersList';
import { getBackersForProject, getProjectById, getStudioByClerkId } from '@/libs/Anivest';
import { Link } from '@/libs/I18nNavigation';

type BackersPageProps = {
  params: Promise<{ locale: string; id: string }>;
};

export async function generateMetadata(props: BackersPageProps): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({
    locale,
    namespace: 'Backers',
  });

  return {
    title: t('meta_title'),
    description: t('meta_description'),
  };
}

export default async function BackersPage(props: BackersPageProps) {
  const { locale, id } = await props.params;
  setRequestLocale(locale);
  const t = await getTranslations({
    locale,
    namespace: 'Backers',
  });

  const user = await currentUser();

  if (!user) {
    notFound();
  }

  const studio = await getStudioByClerkId(user.id);

  if (!studio) {
    notFound();
  }

  const projectId = Number(id);

  if (!Number.isInteger(projectId)) {
    notFound();
  }

  const project = await getProjectById(projectId);

  if (!project || project.studioId !== studio.id) {
    notFound();
  }

  const backers = await getBackersForProject(project.id);

  return (
    <div className="py-5">
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="text-3xl font-bold text-gray-900">{project.title}</h1>
        <Link
          href={`/studio/projects/${project.id}/edit/`}
          className="shrink-0 rounded-sm border border-gray-300 px-3 py-1 text-sm hover:bg-gray-100"
        >
          {t('back_to_edit')}
        </Link>
      </div>

      <h2 className="mb-4 text-xl font-semibold text-gray-900">{t('title')}</h2>
      <ProjectBackersList backers={backers} />
    </div>
  );
}
