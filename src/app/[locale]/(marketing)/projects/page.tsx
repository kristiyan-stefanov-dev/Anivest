import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ProjectCard } from '@/components/ProjectCard';
import { listCategories, listProjectsByCategory } from '@/libs/Anivest';
import { Link } from '@/libs/I18nNavigation';
import type { Category } from '@/models/Schema';

type ProjectsPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ category?: string }>;
};

export async function generateMetadata(props: ProjectsPageProps): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({
    locale,
    namespace: 'Projects',
  });

  return {
    title: t('meta_title'),
    description: t('meta_description'),
  };
}

export default async function ProjectsPage(props: ProjectsPageProps) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  const t = await getTranslations({
    locale,
    namespace: 'Projects',
  });

  const { category } = await props.searchParams;
  const categories = await listCategories();

  const requested = category ?? 'popular';
  const match = categories.find((cat) => cat.slug === requested);
  const activeCategory: Category['slug'] = match ? match.slug : 'popular';
  const projects = await listProjectsByCategory(activeCategory, { limit: 60 });

  return (
    <div className="py-8">
      <h1 className="mb-4 text-3xl font-bold text-gray-900">{t('title')}</h1>

      <nav className="mb-6 flex flex-wrap gap-2">
        {categories.map((cat) => (
          <Link
            key={cat.slug}
            href={`/projects/?category=${cat.slug}`}
            className={
              cat.slug === activeCategory
                ? 'rounded-full bg-blue-600 px-3 py-1 text-sm font-medium text-white'
                : 'rounded-full border border-gray-300 px-3 py-1 text-sm text-gray-700 hover:bg-gray-100'
            }
          >
            {cat.name}
          </Link>
        ))}
      </nav>

      {projects.length === 0 ? (
        <p className="text-gray-500">{t('empty')}</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
}
