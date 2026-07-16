'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { useRouter } from '@/libs/I18nNavigation';
import { extractErrorMessage } from '@/utils/format';
import { StudioValidation } from '@/validations/AnivestValidation';

export const StudioRegisterForm = () => {
  const t = useTranslations('Studio');
  const router = useRouter();
  const form = useForm({
    resolver: zodResolver(StudioValidation),
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      logoUrl: '',
      website: '',
    },
  });

  const handleSubmit = form.handleSubmit(async (data) => {
    const response = await fetch('/api/studio', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      router.refresh();
    } else {
      const parsed = await response.json().catch(() => null);
      form.setError('slug', { message: extractErrorMessage(parsed) ?? t('error_generic') });
    }
  });

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
        {t('label_name')}
        <input
          {...form.register('name')}
          className="rounded-sm border border-gray-200 px-3 py-2 text-gray-800 focus:ring-2 focus:ring-blue-300 focus:outline-hidden"
        />
        {form.formState.errors.name && (
          <span className="text-xs font-normal text-red-500">{t('error_name')}</span>
        )}
      </label>

      <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
        {t('label_slug')}
        <input
          {...form.register('slug')}
          placeholder="my-studio"
          className="rounded-sm border border-gray-200 px-3 py-2 text-gray-800 focus:ring-2 focus:ring-blue-300 focus:outline-hidden"
        />
        {form.formState.errors.slug && (
          <span className="text-xs font-normal text-red-500">
            {form.formState.errors.slug.message ?? t('error_slug')}
          </span>
        )}
      </label>

      <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
        {t('label_description')}
        <textarea
          {...form.register('description')}
          rows={3}
          className="rounded-sm border border-gray-200 px-3 py-2 text-gray-800 focus:ring-2 focus:ring-blue-300 focus:outline-hidden"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
        {t('label_logo')}
        <input
          {...form.register('logoUrl')}
          placeholder="https://..."
          className="rounded-sm border border-gray-200 px-3 py-2 text-gray-800 focus:ring-2 focus:ring-blue-300 focus:outline-hidden"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
        {t('label_website')}
        <input
          {...form.register('website')}
          placeholder="https://..."
          className="rounded-sm border border-gray-200 px-3 py-2 text-gray-800 focus:ring-2 focus:ring-blue-300 focus:outline-hidden"
        />
      </label>

      <button
        type="submit"
        disabled={form.formState.isSubmitting}
        className="self-start rounded-sm bg-blue-600 px-5 py-2 font-bold text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {t('button_become')}
      </button>
    </form>
  );
};
