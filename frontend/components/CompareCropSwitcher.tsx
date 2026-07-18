'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import type { Crop } from '@/lib/api';
import { ln } from '@/lib/api';

interface Props {
  crops: Crop[];
  district: string;
  locale: string;
  initialA: string;
  initialB: string;
}

export default function CompareCropSwitcher({
  crops,
  district,
  locale,
  initialA,
  initialB,
}: Props) {
  const t = useTranslations('compare');
  const router = useRouter();
  const [a, setA] = useState(initialA);
  const [b, setB] = useState(initialB);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (a && b && a !== b) {
      router.push(`/${locale}/compare/${district}?crops=${a},${b}`);
    }
  }

  return (
    <form onSubmit={submit} className="flex flex-wrap items-end gap-3">
      <label>
        <span className="mb-1 block text-sm font-medium text-stone-700">
          {t('cropA')}
        </span>
        <select
          value={a}
          onChange={(e) => setA(e.target.value)}
          className="rounded-md border border-stone-300 bg-white px-3 py-2 text-sm"
        >
          {crops.map((c) => (
            <option key={c.code} value={c.code} disabled={c.code === b}>
              {c.icon} {ln(c, locale)}
            </option>
          ))}
        </select>
      </label>

      <label>
        <span className="mb-1 block text-sm font-medium text-stone-700">
          {t('cropB')}
        </span>
        <select
          value={b}
          onChange={(e) => setB(e.target.value)}
          className="rounded-md border border-stone-300 bg-white px-3 py-2 text-sm"
        >
          {crops.map((c) => (
            <option key={c.code} value={c.code} disabled={c.code === a}>
              {c.icon} {ln(c, locale)}
            </option>
          ))}
        </select>
      </label>

      <button
        type="submit"
        className="rounded-md bg-emerald-700 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-800"
      >
        {t('apply')}
      </button>
    </form>
  );
}
