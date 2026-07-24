'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from '@/libs/I18nNavigation';
import type { TierWithStats } from '@/models/Schema';
import { formatCurrency } from '@/utils/format';
import { TierValidation } from '@/validations/AnivestValidation';

export const TierManager = (props: { projectId: number; tiers: TierWithStats[] }) => {
  const t = useTranslations('TierManager');
  const router = useRouter();
  const [editingId, setEditingId] = useState<number | null>(null);

  const form = useForm({
    resolver: zodResolver(TierValidation),
    defaultValues: {
      title: '',
      description: '',
      price: 1,
      currency: 'USD',
      limitedQuantity: null as number | null,
      reward: '',
      imageUrl: '',
      deliveryDate: '',
      displayOrder: 0,
      active: true,
    },
  });

  const startEdit = (tier: TierWithStats) => {
    setEditingId(tier.id);
    form.reset({
      title: tier.title,
      description: tier.description,
      price: tier.price,
      currency: tier.currency,
      limitedQuantity: tier.limitedQuantity,
      reward: tier.reward,
      imageUrl: tier.imageUrl,
      deliveryDate: tier.deliveryDate,
      displayOrder: tier.displayOrder,
      active: tier.active,
    });
  };

  const handleSubmit = form.handleSubmit(async (data) => {
    const method = editingId ? 'PATCH' : 'POST';
    const body = editingId
      ? { ...data, id: editingId, limitedQuantity: data.limitedQuantity ?? null }
      : { ...data, projectId: props.projectId, limitedQuantity: data.limitedQuantity ?? null };

    const response = await fetch('/api/tiers', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (response.ok) {
      setEditingId(null);
      form.reset();
      router.refresh();
    }
  });

  const handleDelete = async (id: number) => {
    const response = await fetch(`/api/tiers?id=${id}`, { method: 'DELETE' });
    if (response.ok) {
      router.refresh();
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <ul className="flex flex-col gap-2">
        {props.tiers.map((tier) => (
          <li
            key={tier.id}
            className="flex items-center justify-between gap-2 rounded-md border border-gray-200 p-3"
          >
            <div>
              <p className="font-medium text-gray-900">
                {tier.title} · {formatCurrency(tier.price, tier.currency)}
              </p>
              <p className="text-sm text-gray-500">
                {tier.remaining === null ? 'Unlimited' : `${tier.remaining} left`}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  startEdit(tier);
                }}
                className="rounded-sm border border-gray-300 px-3 py-1 text-sm hover:bg-gray-100"
              >
                {t('edit')}
              </button>
              <button
                type="button"
                onClick={() => {
                  void handleDelete(tier.id);
                }}
                className="rounded-sm border border-red-300 px-3 py-1 text-sm text-red-600 hover:bg-red-50"
              >
                {t('delete')}
              </button>
            </div>
          </li>
        ))}
        {props.tiers.length === 0 && <p className="text-sm text-gray-500">{t('empty')}</p>}
      </ul>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3 border-t border-gray-200 pt-4">
        <p className="font-semibold text-gray-800">
          {editingId ? t('heading_edit') : t('heading_new')}
        </p>

        <input
          {...form.register('title')}
          placeholder={t('placeholder_title')}
          className="rounded-sm border border-gray-200 px-3 py-2 text-gray-800 focus:ring-2 focus:ring-blue-300 focus:outline-hidden"
        />
        <textarea
          {...form.register('description')}
          placeholder={t('placeholder_description')}
          rows={2}
          className="rounded-sm border border-gray-200 px-3 py-2 text-gray-800 focus:ring-2 focus:ring-blue-300 focus:outline-hidden"
        />
        <div className="flex gap-3">
          <input
            type="number"
            {...form.register('price', { valueAsNumber: true })}
            placeholder={t('placeholder_price')}
            className="w-32 rounded-sm border border-gray-200 px-3 py-2 text-gray-800 focus:ring-2 focus:ring-blue-300 focus:outline-hidden"
          />
          <input
            type="number"
            {...form.register('limitedQuantity', { valueAsNumber: true })}
            placeholder={t('placeholder_limit')}
            className="w-32 rounded-sm border border-gray-200 px-3 py-2 text-gray-800 focus:ring-2 focus:ring-blue-300 focus:outline-hidden"
          />
        </div>
        <textarea
          {...form.register('reward')}
          placeholder={t('placeholder_reward')}
          rows={2}
          className="rounded-sm border border-gray-200 px-3 py-2 text-gray-800 focus:ring-2 focus:ring-blue-300 focus:outline-hidden"
        />
        <input
          {...form.register('imageUrl')}
          placeholder={t('placeholder_image_url')}
          className="rounded-sm border border-gray-200 px-3 py-2 text-gray-800 focus:ring-2 focus:ring-blue-300 focus:outline-hidden"
        />
        <input
          {...form.register('deliveryDate')}
          placeholder={t('placeholder_delivery_date')}
          className="rounded-sm border border-gray-200 px-3 py-2 text-gray-800 focus:ring-2 focus:ring-blue-300 focus:outline-hidden"
        />

        <div className="flex gap-2">
          <button
            type="submit"
            className="rounded-sm bg-blue-600 px-4 py-1.5 text-sm font-bold text-white hover:bg-blue-700"
          >
            {editingId ? t('save') : t('add')}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={() => {
                setEditingId(null);
                form.reset();
              }}
              className="rounded-sm border border-gray-300 px-4 py-1.5 text-sm hover:bg-gray-100"
            >
              {t('cancel')}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};
