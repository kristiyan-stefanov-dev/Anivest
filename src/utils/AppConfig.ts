import { enUS, csCZ } from '@clerk/localizations';
import type { LocalizationResource } from '@clerk/shared/types';
import type { LocalePrefixMode } from 'next-intl/routing';

/** Locale prefix strategy for next-intl routing. */
const localePrefix: LocalePrefixMode = 'as-needed';

export const AppConfig = {
  name: 'Anivest',
  i18n: {
    locales: ['en', 'csCZ'],
    defaultLocale: 'en',
    localePrefix,
  },
};

const supportedLocales: Record<string, LocalizationResource> = {
  en: enUS,
  cz: csCZ,
};

export const ClerkLocalizations = {
  defaultLocale: enUS,
  supportedLocales,
};
