'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from '@/libs/I18nNavigation';
import { extractErrorMessage } from '@/utils/format';
import { ProjectValidation } from '@/validations/AnivestValidation';

const CATEGORIES = [
  'popular',
  'isekai',
  'drama',
  'action',
  'fantasy',
  'slice-of-life',
  'mecha',
  'romance',
] as const;

export const ProjectForm = (props: {
  projectId?: number;
  defaultValues?: Partial<Record<string, unknown>>;
  galleryImageUrls?: string[];
}) => {
  const t = useTranslations('ProjectForm');
  const router = useRouter();
  const isEdit = Boolean(props.projectId);

  const form = useForm({
    resolver: zodResolver(ProjectValidation),
    defaultValues: {
      title: '',
      slug: '',
      tagline: '',
      description: '',
      coverImageUrl: '',
      category: 'popular',
      goalAmount: 0,
      currency: 'USD',
      featured: false,
      endsAt: '',
      ...props.defaultValues,
    },
  });

  const [galleryUrls, setGalleryUrls] = useState((props.galleryImageUrls ?? []).join('\n'));

  const handleSubmit = form.handleSubmit(async (data) => {
    const payload = {
      ...data,
      endsAt: data.endsAt ? new Date(data.endsAt).toISOString() : null,
      galleryImages: galleryUrls
        .split('\n')
        .map((url) => url.trim())
        .filter((url) => url.length > 0),
    };

    const response = await fetch('/api/projects', {
      method: isEdit ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(isEdit ? { ...payload, id: props.projectId } : payload),
    });

    if (response.ok) {
      router.refresh();
      if (!isEdit) {
        router.push('/studio/');
      }
    } else {
      const parsed = await response.json().catch(() => null);
      form.setError('slug', { message: extractErrorMessage(parsed) ?? t('error_generic') });
    }
  });

  const fieldError = (name: keyof typeof form.formState.errors) =>
    form.formState.errors[name]?.message;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {form.formState.errors.slug && (
        <p className="rounded-sm bg-red-50 px-3 py-2 text-sm text-red-600">
          {form.formState.errors.slug.message}
        </p>
      )}

      <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
        {t('label_title')}
        <input
          {...form.register('title')}
          className="rounded-sm border border-gray-200 px-3 py-2 text-gray-800 focus:ring-2 focus:ring-blue-300 focus:outline-hidden"
        />
        {fieldError('title') && (
          <span className="text-xs font-normal text-red-500">{fieldError('title')}</span>
        )}
      </label>

      <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
        {t('label_slug')}
        <input
          {...form.register('slug')}
          placeholder="my-project"
          className="rounded-sm border border-gray-200 px-3 py-2 text-gray-800 focus:ring-2 focus:ring-blue-300 focus:outline-hidden"
        />
        {fieldError('slug') && (
          <span className="text-xs font-normal text-red-500">{fieldError('slug')}</span>
        )}
      </label>

      <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
        {t('label_tagline')}
        <input
          {...form.register('tagline')}
          className="rounded-sm border border-gray-200 px-3 py-2 text-gray-800 focus:ring-2 focus:ring-blue-300 focus:outline-hidden"
        />
        {fieldError('tagline') && (
          <span className="text-xs font-normal text-red-500">{fieldError('tagline')}</span>
        )}
      </label>

      <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
        {t('label_description')}
        <textarea
          {...form.register('description')}
          rows={5}
          className="rounded-sm border border-gray-200 px-3 py-2 text-gray-800 focus:ring-2 focus:ring-blue-300 focus:outline-hidden"
        />
        {fieldError('description') && (
          <span className="text-xs font-normal text-red-500">{fieldError('description')}</span>
        )}
      </label>

      <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
        {t('label_cover')}
        <input
          {...form.register('coverImageUrl')}
          placeholder="https://..."
          className="rounded-sm border border-gray-200 px-3 py-2 text-gray-800 focus:ring-2 focus:ring-blue-300 focus:outline-hidden"
        />
        {fieldError('coverImageUrl') && (
          <span className="text-xs font-normal text-red-500">{fieldError('coverImageUrl')}</span>
        )}
      </label>

      <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
        {t('label_gallery')}
        <textarea
          value={galleryUrls}
          onChange={(event) => {
            setGalleryUrls(event.target.value);
          }}
          aria-label={t('label_gallery')}
          placeholder={t('placeholder_gallery')}
          rows={3}
          className="rounded-sm border border-gray-200 px-3 py-2 text-gray-800 focus:ring-2 focus:ring-blue-300 focus:outline-hidden"
        />
        <span className="text-xs font-normal text-gray-500">{t('gallery_hint')}</span>
      </label>

      <div className="flex gap-4">
        <label className="flex flex-1 flex-col gap-1 text-sm font-medium text-gray-700">
          {t('label_category')}
          <select
            {...form.register('category')}
            className="rounded-sm border border-gray-200 px-3 py-2 text-gray-800 focus:ring-2 focus:ring-blue-300 focus:outline-hidden"
          >
            {CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-1 flex-col gap-1 text-sm font-medium text-gray-700">
          {t('label_goal')}
          <input
            type="number"
            {...form.register('goalAmount', { valueAsNumber: true })}
            className="rounded-sm border border-gray-200 px-3 py-2 text-gray-800 focus:ring-2 focus:ring-blue-300 focus:outline-hidden"
          />
          {fieldError('goalAmount') && (
            <span className="text-xs font-normal text-red-500">{fieldError('goalAmount')}</span>
          )}
        </label>
      </div>

      <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
        {t('label_ends_at')}
        <input
          type="datetime-local"
          {...form.register('endsAt')}
          className="rounded-sm border border-gray-200 px-3 py-2 text-gray-800 focus:ring-2 focus:ring-blue-300 focus:outline-hidden"
        />
        {fieldError('endsAt') && (
          <span className="text-xs font-normal text-red-500">{fieldError('endsAt')}</span>
        )}
      </label>

      <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
        <input type="checkbox" {...form.register('featured')} />
        {t('label_featured')}
      </label>

      <button
        type="submit"
        disabled={form.formState.isSubmitting}
        className="self-start rounded-sm bg-blue-600 px-5 py-2 font-bold text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {isEdit ? t('button_update') : t('button_create')}
      </button>
    </form>
  );
};
