const HOUR_IN_SECONDS = 3600;
const MS_TO_S = 1000;

const format = (
  ms: number,
  locale: string,
  unitDisplay: 'short' | 'long' | 'narrow',
): string => {
  const safeMs = Number.isFinite(ms) && ms > 0 ? ms : 0;
  const part = (value: number, unit: 'hour' | 'minute' | 'second') => {
    return new Intl.NumberFormat(locale, {
      style: 'unit',
      unit,
      unitDisplay,
    }).format(value);
  };
  const totalSeconds = Math.floor(safeMs / MS_TO_S);
  const hours = Math.floor(totalSeconds / HOUR_IN_SECONDS);
  const minutes = Math.floor((totalSeconds % HOUR_IN_SECONDS) / 60);
  const remainingSeconds = totalSeconds % 60;
  if (hours > 0 && minutes > 0) {
    return `${part(hours, 'hour')} ${part(minutes, 'minute')}`;
  } else if (hours > 0 && minutes === 0) {
    return part(hours, 'hour');
  } else if (hours === 0 && minutes > 0) {
    return part(minutes, 'minute');
  } else {
    return part(remainingSeconds, 'second');
  }
};

export const formatElapsed = (ms: number, locale: string): string => {
  return format(ms, locale, 'narrow');
};

export const formatElapsedSpoken = (ms: number, locale: string): string => {
  return format(ms, locale, 'long');
};
