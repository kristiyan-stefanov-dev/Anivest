import { currentUser } from '@clerk/nextjs/server';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { LocaleSwitcher } from '@/components/LocaleSwitcher';
import { Link } from '@/libs/I18nNavigation';
import { WideTemplate } from '@/templates/WideTemplate';

export default async function Layout(props: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  const t = await getTranslations({
    locale,
    namespace: 'RootLayout',
  });
  const user = await currentUser();

  return (
    <>
      <WideTemplate
        leftNav={
          <>
            <li>
              <Link href="/" className="border-none text-gray-700 hover:text-gray-900">
                {t('home_link')}
              </Link>
            </li>
            <li>
              <Link href="/about/" className="border-none text-gray-700 hover:text-gray-900">
                {t('about_link')}
              </Link>
            </li>
            <li>
              <Link href="/projects/" className="border-none text-gray-700 hover:text-gray-900">
                {t('projects_link')}
              </Link>
            </li>
            <li>
              <Link href="/studios/" className="border-none text-gray-700 hover:text-gray-900">
                {t('studios_link')}
              </Link>
            </li>
          </>
        }
        rightNav={
          <>
            {user ? (
              <li>
                <Link
                  href="/dashboard/user-profile/"
                  className="border-none text-gray-700 hover:text-gray-900"
                >
                  {t('profile_link')}
                </Link>
              </li>
            ) : (
              <>
                <li>
                  <Link href="/sign-in/" className="border-none text-gray-700 hover:text-gray-900">
                    {t('sign_in_link')}
                  </Link>
                </li>

                <li>
                  <Link href="/sign-up/" className="border-none text-gray-700 hover:text-gray-900">
                    {t('sign_up_link')}
                  </Link>
                </li>
              </>
            )}

            {user && (
              <li>
                <Link href="/studio/" className="border-none text-gray-700 hover:text-gray-900">
                  {t('studio_link')}
                </Link>
              </li>
            )}

            <li>
              <LocaleSwitcher />
            </li>
          </>
        }
      >
        <div className="py-5">{props.children}</div>
      </WideTemplate>
    </>
  );
}
