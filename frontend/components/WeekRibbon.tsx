'use client';

import { useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import type { CalendarWeek } from '@/lib/api';
import { riskNote } from '@/lib/api';
import { STAGE_COLORS, MONTH_TICKS, currentIsoWeek } from '@/lib/stages';

interface Props {
  weeks: CalendarWeek[];
  locale: string;
  /** Compact mode (compare view): shorter cells, no detail panel. */
  compact?: boolean;
  /** Optional heading rendered above the ribbon (compare view). */
  heading?: string;
}

/**
 * Accessible 52-week stage ribbon.
 *
 * Decision: instead of hover-only tooltips (spec), the ribbon is a listbox
 * with full keyboard navigation and a persistent aria-live detail panel —
 * hover tooltips are unusable on touch devices, which is where most target
 * users are.
 */
export default function WeekRibbon({ weeks, locale, compact, heading }: Props) {
  const t = useTranslations('calendar');
  const ts = useTranslations('stages');
  const nowWeek = currentIsoWeek();
  const [selected, setSelected] = useState<number>(
    weeks.some((w) => w.week === nowWeek) ? nowWeek : weeks[0]?.week ?? 1,
  );
  const listRef = useRef<HTMLDivElement>(null);

  const selectedWeek = weeks.find((w) => w.week === selected);
  const nf = new Intl.NumberFormat(locale === 'ne' ? 'ne-NP' : 'en-GB');

  function focusCell(week: number) {
    const el = listRef.current?.querySelector<HTMLButtonElement>(
      `[data-week="${week}"]`,
    );
    el?.focus();
  }

  function move(delta: number) {
    const idx = weeks.findIndex((w) => w.week === selected);
    const next = Math.min(Math.max(idx + delta, 0), weeks.length - 1);
    setSelected(weeks[next].week);
    focusCell(weeks[next].week);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    switch (e.key) {
      case 'ArrowRight':
        e.preventDefault();
        move(1);
        break;
      case 'ArrowLeft':
        e.preventDefault();
        move(-1);
        break;
      case 'Home':
        e.preventDefault();
        setSelected(weeks[0].week);
        focusCell(weeks[0].week);
        break;
      case 'End':
        e.preventDefault();
        setSelected(weeks[weeks.length - 1].week);
        focusCell(weeks[weeks.length - 1].week);
        break;
    }
  }

  return (
    <div>
      {heading && (
        <h3 className="mb-1 text-sm font-semibold text-stone-700">{heading}</h3>
      )}

      {/* Month axis */}
      <div className="relative mb-1 h-4 text-[10px] text-stone-500" aria-hidden="true">
        {MONTH_TICKS.map((m) => (
          <span
            key={m.week}
            className="absolute -translate-x-1/2"
            style={{ left: `${((m.week - 0.5) / 52) * 100}%` }}
          >
            {locale === 'ne' ? m.ne : m.en}
          </span>
        ))}
      </div>

      {/* Ribbon */}
      <div
        ref={listRef}
        role="listbox"
        aria-label={t('ribbonHelp')}
        onKeyDown={onKeyDown}
        className={`flex w-full overflow-hidden rounded-md ring-1 ring-stone-300 ${
          compact ? 'h-8' : 'h-12'
        }`}
      >
        {weeks.map((w) => {
          const color = STAGE_COLORS[w.stage] ?? STAGE_COLORS.fallow;
          const isSelected = w.week === selected;
          const isNow = w.week === nowWeek;
          return (
            <button
              key={w.week}
              type="button"
              role="option"
              aria-selected={isSelected}
              data-week={w.week}
              data-testid="week-cell"
              tabIndex={isSelected ? 0 : -1}
              onClick={() => setSelected(w.week)}
              title={`${t('weekLabel', { week: w.week })} — ${ts(w.stage as never)}`}
              className={`relative min-w-0 flex-1 transition-transform ${
                isSelected ? 'z-10 scale-y-110 ring-2 ring-stone-900' : ''
              }`}
              style={{ backgroundColor: color.bg }}
            >
              {isNow && (
                <span
                  aria-hidden="true"
                  className="absolute -top-0.5 left-1/2 -translate-x-1/2 text-[8px] leading-none"
                  style={{ color: '#1f2937' }}
                >
                  ▼
                </span>
              )}
              <span className="sr-only">
                {t('weekLabel', { week: w.week })}: {ts(w.stage as never)}
                {isNow ? ` (${t('thisWeek')})` : ''}
              </span>
            </button>
          );
        })}
      </div>

      {/* Detail panel */}
      {!compact && selectedWeek && (
        <div
          aria-live="polite"
          className="mt-3 rounded-lg border border-stone-200 bg-white p-4 shadow-sm"
        >
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm font-semibold text-stone-700">
              {t('weekLabel', { week: nf.format(selectedWeek.week) as never })}
            </span>
            {selectedWeek.week === nowWeek && (
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">
                {t('thisWeek')}
              </span>
            )}
            <span
              className="rounded-full px-3 py-0.5 text-xs font-semibold"
              style={{
                backgroundColor: STAGE_COLORS[selectedWeek.stage]?.bg,
                color: STAGE_COLORS[selectedWeek.stage]?.text,
              }}
            >
              {ts(selectedWeek.stage as never)}
            </span>
          </div>
          {riskNote(selectedWeek, locale) && (
            <p className="mt-2 text-sm leading-relaxed text-stone-700">
              <span className="font-medium">{t('riskLabel')}: </span>
              {riskNote(selectedWeek, locale)}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
