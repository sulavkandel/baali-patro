'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import type { District, Crop } from '@/lib/api';
import { ln } from '@/lib/api';

interface Props {
  districts: District[];
  crops: Crop[];
  locale: string;
}

export default function DistrictCropPicker({ districts, crops, locale }: Props) {
  const t = useTranslations('home');
  const router = useRouter();
  const [district, setDistrict] = useState(districts[0]?.slug ?? '');
  const [crop, setCrop] = useState(crops[0]?.code ?? '');

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (district && crop) {
      router.push(`/${locale}/calendar/${district}/${crop}`);
    }
  }

  return (
    <form
      onSubmit={submit}
      className="flex flex-col gap-3 sm:flex-row sm:items-end"
      aria-label={t('pickerTitle')}
    >
      <label className="flex-1">
        <span className="mb-1 block text-sm font-medium text-stone-700">
          {t('district')}
        </span>
        <select
          id="district-select"
          value={district}
          onChange={(e) => setDistrict(e.target.value)}
          className="w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm"
        >
          {districts.map((d) => (
            <option key={d.slug} value={d.slug}>
              {ln(d, locale)}
            </option>
          ))}
        </select>
      </label>

      <label className="flex-1">
        <span className="mb-1 block text-sm font-medium text-stone-700">
          {t('crop')}
        </span>
        <select
          id="crop-select"
          value={crop}
          onChange={(e) => setCrop(e.target.value)}
          className="w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm"
        >
          {crops.map((c) => (
            <option key={c.code} value={c.code}>
              {c.icon} {ln(c, locale)}
            </option>
          ))}
        </select>
      </label>

      <button
        type="submit"
        className="rounded-md bg-emerald-700 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-800"
      >
        {t('go')}
      </button>
    </form>
  );
}
