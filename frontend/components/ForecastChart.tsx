import type { DailyForecast } from '@/lib/api';

/**
 * Server-rendered SVG forecast chart.
 *
 * Decision: the spec suggested Chart.js, but for a fixed 7-point dataset a
 * hand-rolled SVG is better — zero client JS (~200KB saved), renders on the
 * server, works without JavaScript and on 2G connections, and is fully
 * stylable. Precip as bars, tmax/tmin as polylines with point markers.
 */
export default function ForecastChart({
  daily,
  locale,
}: {
  daily: DailyForecast[];
  locale: string;
}) {
  if (!daily.length) return null;

  const W = 560;
  const H = 180;
  const PAD = { top: 16, right: 36, bottom: 28, left: 36 };
  const plotW = W - PAD.left - PAD.right;
  const plotH = H - PAD.top - PAD.bottom;
  const n = daily.length;
  const step = plotW / n;

  const tAll = daily.flatMap((d) => [d.tmax, d.tmin]);
  const tMin = Math.min(...tAll) - 2;
  const tMax = Math.max(...tAll) + 2;
  const pMax = Math.max(...daily.map((d) => d.precip), 10);

  const ty = (t: number) => PAD.top + plotH - ((t - tMin) / (tMax - tMin)) * plotH;
  const py = (p: number) => (p / pMax) * plotH;
  const cx = (i: number) => PAD.left + step * i + step / 2;

  const df = new Intl.DateTimeFormat(locale === 'ne' ? 'ne-NP' : 'en-GB', {
    weekday: 'short',
  });

  const tmaxPoints = daily.map((d, i) => `${cx(i)},${ty(d.tmax)}`).join(' ');
  const tminPoints = daily.map((d, i) => `${cx(i)},${ty(d.tmin)}`).join(' ');

  return (
    <figure>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={daily
          .map((d) => `${d.date}: ${d.tmax}/${d.tmin}°C, ${d.precip}mm`)
          .join('; ')}
        className="w-full"
      >
        {/* Precip bars */}
        {daily.map((d, i) => (
          <rect
            key={d.date}
            x={cx(i) - step * 0.3}
            y={PAD.top + plotH - py(d.precip)}
            width={step * 0.6}
            height={py(d.precip)}
            fill="#93c5fd"
            rx={2}
          >
            <title>{`${d.date}: ${d.precip} mm`}</title>
          </rect>
        ))}

        {/* Temperature lines */}
        <polyline points={tmaxPoints} fill="none" stroke="#c2410c" strokeWidth={2} />
        <polyline points={tminPoints} fill="none" stroke="#0369a1" strokeWidth={2} />
        {daily.map((d, i) => (
          <g key={d.date}>
            <circle cx={cx(i)} cy={ty(d.tmax)} r={3} fill="#c2410c">
              <title>{`${d.date}: max ${d.tmax}°C`}</title>
            </circle>
            <circle cx={cx(i)} cy={ty(d.tmin)} r={3} fill="#0369a1">
              <title>{`${d.date}: min ${d.tmin}°C`}</title>
            </circle>
          </g>
        ))}

        {/* Weekday labels */}
        {daily.map((d, i) => (
          <text
            key={d.date}
            x={cx(i)}
            y={H - 8}
            textAnchor="middle"
            fontSize={11}
            fill="#57534e"
          >
            {df.format(new Date(`${d.date}T00:00:00Z`))}
          </text>
        ))}

        {/* Temp axis labels */}
        <text x={4} y={ty(tMax - 2) + 4} fontSize={10} fill="#57534e">
          {Math.round(tMax - 2)}°
        </text>
        <text x={4} y={ty(tMin + 2) + 4} fontSize={10} fill="#57534e">
          {Math.round(tMin + 2)}°
        </text>
      </svg>
      <figcaption className="mt-1 flex gap-4 text-[11px] text-stone-600">
        <span className="flex items-center gap-1">
          <span className="inline-block h-0.5 w-4 bg-[#c2410c]" /> Tmax
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-0.5 w-4 bg-[#0369a1]" /> Tmin
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-2 w-3 rounded-sm bg-[#93c5fd]" /> mm
        </span>
      </figcaption>
    </figure>
  );
}
