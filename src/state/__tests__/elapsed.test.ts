import { formatElapsed, formatElapsedSpoken } from '../elapsed';

const S = 1000;
const M = 60 * S;
const H = 60 * M;

describe('formatElapsed', () => {
  test('seconds, minutes, hours', () => {
    expect(formatElapsed(8 * S, 'en')).toBe('8s');
    expect(formatElapsed(41 * M, 'en')).toBe('41m');
    expect(formatElapsed(3 * H + 12 * M, 'en')).toBe('3h 12m');
  });

  test('drops the minutes when they are zero', () => {
    expect(formatElapsed(2 * H, 'en')).toBe('2h');
  });

  test('zero and negative degrade to 0s, never NaN', () => {
    expect(formatElapsed(0, 'en')).toBe('0s');
    expect(formatElapsed(-5000, 'en')).toBe('0s');
    expect(formatElapsed(Number.NaN, 'en')).toBe('0s');
  });

  test('beyond a day keeps counting in hours', () => {
    expect(formatElapsed(26 * H, 'en')).toBe('26h');
  });
});

describe('formatElapsedSpoken', () => {
  test('en and el', () => {
    expect(formatElapsedSpoken(3 * H + 12 * M, 'en')).toBe(
      '3 hours 12 minutes',
    );
    expect(formatElapsedSpoken(41 * M, 'en')).toBe('41 minutes');
    expect(formatElapsedSpoken(41 * M, 'el')).toBe('41 λεπτά');
  });
});
