'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from '@/libs/I18nNavigation';
import type { Ledger } from '@/models/Schema';
import { formatCurrency } from '@/utils/format';
import { LedgerValidation } from '@/validations/AnivestValidation';

export const LedgerManager = (props: { projectId: number; ledgers: Ledger[] }) => {
  const t = useTranslations('LedgerManager');
  const router = useRouter();
  const [editingId, setEditingId] = useState<number | null>(null);

  const form = useForm({
    resolver: zodResolver(LedgerValidation),
    defaultValues: {
      label: '',
      amount: 0,
      currency: 'USD',
      note: '',
      displayOrder: 0,
    },
  });

  const startEdit = (ledger: Ledger) => {
    setEditingId(ledger.id);
    form.reset({
      label: ledger.label,
      amount: ledger.amount,
      currency: ledger.currency,
      note: ledger.note,
      displayOrder: ledger.displayOrder,
    });
  };

  const handleSubmit = form.handleSubmit(async (data) => {
    const method = editingId ? 'PATCH' : 'POST';
    const body = editingId ? { ...data, id: editingId } : { ...data, projectId: props.projectId };

    const response = await fetch('/api/ledgers', {
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
    const response = await fetch(`/api/ledgers?id=${id}`, { method: 'DELETE' });
    if (response.ok) {
      router.refresh();
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <ul className="flex flex-col gap-2">
        {props.ledgers.map((ledger) => (
          <li
            key={ledger.id}
            className="flex items-center justify-between gap-2 rounded-md border border-gray-200 p-3"
          >
            <div>
              <p className="font-medium text-gray-900">
                {ledger.label} · {formatCurrency(ledger.amount, ledger.currency)}
              </p>
              <p className="text-sm text-gray-500">{ledger.note}</p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  startEdit(ledger);
                }}
                className="rounded-sm border border-gray-300 px-3 py-1 text-sm hover:bg-gray-100"
              >
                {t('edit')}
              </button>
              <button
                type="button"
                onClick={() => {
                  void handleDelete(ledger.id);
                }}
                className="rounded-sm border border-red-300 px-3 py-1 text-sm text-red-600 hover:bg-red-50"
              >
                {t('delete')}
              </button>
            </div>
          </li>
        ))}
        {props.ledgers.length === 0 && <p className="text-sm text-gray-500">{t('empty')}</p>}
      </ul>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3 border-t border-gray-200 pt-4">
        <p className="font-semibold text-gray-800">
          {editingId ? t('heading_edit') : t('heading_new')}
        </p>

        <input
          {...form.register('label')}
          placeholder={t('placeholder_label')}
          className="rounded-sm border border-gray-200 px-3 py-2 text-gray-800 focus:ring-2 focus:ring-blue-300 focus:outline-hidden"
        />
        <input
          type="number"
          {...form.register('amount', { valueAsNumber: true })}
          placeholder={t('placeholder_amount')}
          className="w-40 rounded-sm border border-gray-200 px-3 py-2 text-gray-800 focus:ring-2 focus:ring-blue-300 focus:outline-hidden"
        />
        <textarea
          {...form.register('note')}
          placeholder={t('placeholder_note')}
          rows={2}
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
