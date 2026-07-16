import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ProjectCarousel } from '@/components/ProjectCarousel';
import { getFeaturedProjects, listCategories, listProjectsByCategory } from '@/libs/Anivest';
import { Link } from '@/libs/I18nNavigation';

type IndexPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata(props: IndexPageProps): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({
    locale,
    namespace: 'Home',
  });

  return {
    title: t('meta_title'),
    description: t('meta_description'),
  };
}

export default async function Index(props: IndexPageProps) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  const t = await getTranslations({
    locale,
    namespace: 'Home',
  });

  const categories = await listCategories();
  const featured = await getFeaturedProjects(12);

  const categoryProjects = await Promise.all(
    categories.map(async (category) => ({
      category,
      projects: await listProjectsByCategory(category.slug, { limit: 12 }),
    })),
  );

  return (
    <div className="py-8">
      <section className="mb-10">
        <h1 className="text-4xl font-bold text-gray-900">{t('hero_title')}</h1>
        <p className="mt-3 max-w-2xl text-lg text-gray-600">{t('hero_subtitle')}</p>
        <Link
          href="/projects/"
          className="mt-4 inline-block rounded-sm bg-blue-600 px-5 py-2 font-bold text-white hover:bg-blue-700"
        >
          {t('browse_button')}
        </Link>
      </section>

      {featured.length > 0 && <ProjectCarousel title={t('featured_title')} projects={featured} />}

      {categoryProjects.map(({ category, projects }) =>
        projects.length > 0 ? (
          <ProjectCarousel key={category.slug} title={category.name} projects={projects} />
        ) : null,
      )}
    </div>
  );
}
