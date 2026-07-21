import { currentUser } from '@clerk/nextjs/server';
import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { redirect } from 'next/navigation';
import { BackedProjectsList } from '@/components/BackedProjectsList';
import { getBackedProjectsByBacker } from '@/libs/Anivest';

type BackedPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata(props: BackedPageProps): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({
    locale,
    namespace: 'Backed',
  });

  return {
    title: t('meta_title'),
    description: t('meta_description'),
  };
}

export default async function BackedPage(props: BackedPageProps) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  const t = await getTranslations({
    locale,
    namespace: 'Backed',
  });

  const user = await currentUser();

  if (!user) {
    redirect(`/${locale}/sign-in/`);
  }

  const projects = await getBackedProjectsByBacker(user.id);

  return (
    <div className="py-5">
      <h1 className="mb-6 text-3xl font-bold text-gray-900">{t('title')}</h1>
      <BackedProjectsList projects={projects} />
    </div>
  );
}
