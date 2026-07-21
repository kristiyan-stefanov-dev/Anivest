import { currentUser } from '@clerk/nextjs/server';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { LedgerManager } from '@/components/LedgerManager';
import { ProjectForm } from '@/components/ProjectForm';
import { TierManager } from '@/components/TierManager';
import {
  getLedgersForProject,
  getProjectById,
  getStudioByClerkId,
  getTiersForProject,
} from '@/libs/Anivest';
import { Link } from '@/libs/I18nNavigation';

type EditProjectPageProps = {
  params: Promise<{ locale: string; id: string }>;
};

export default async function EditProjectPage(props: EditProjectPageProps) {
  const { locale, id } = await props.params;
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

  const projectId = Number(id);

  if (!Number.isInteger(projectId)) {
    notFound();
  }

  const project = await getProjectById(projectId);

  if (!project || project.studioId !== studio.id) {
    notFound();
  }

  const [tiers, ledgers] = await Promise.all([
    getTiersForProject(project.id),
    getLedgersForProject(project.id),
  ]);

  return (
    <div className="mx-auto max-w-3xl py-8">
      <h1 className="mb-2 text-3xl font-bold text-gray-900">{project.title}</h1>
      <p className="mb-6 text-gray-600">{t('edit_project_subtitle')}</p>

      <Link
        href={`/studio/projects/${project.id}/backers/`}
        className="mb-6 inline-block rounded-sm border border-gray-300 px-3 py-1 text-sm hover:bg-gray-100"
      >
        {t('view_backers')}
      </Link>

      <section className="mb-10">
        <h2 className="mb-4 text-xl font-semibold text-gray-900">{t('edit_details')}</h2>
        <ProjectForm
          projectId={project.id}
          defaultValues={{
            title: project.title,
            slug: project.slug,
            tagline: project.tagline,
            description: project.description,
            coverImageUrl: project.coverImageUrl,
            category: project.category,
            goalAmount: project.goalAmount,
            currency: project.currency,
            featured: project.featured,
            endsAt: project.endsAt ? project.endsAt.toISOString().slice(0, 16) : '',
          }}
        />
      </section>

      <section className="mb-10 border-t border-gray-200 pt-6">
        <h2 className="mb-4 text-xl font-semibold text-gray-900">{t('manage_tiers')}</h2>
        <TierManager projectId={project.id} tiers={tiers} />
      </section>

      <section className="border-t border-gray-200 pt-6">
        <h2 className="mb-4 text-xl font-semibold text-gray-900">{t('manage_ledgers')}</h2>
        <LedgerManager projectId={project.id} ledgers={ledgers} />
      </section>
    </div>
  );
}
