export const CATEGORY_LIST = [
  'Salon & Beauty',
  'Electrician',
  'Plumbing',
  'Cleaning',
  'Car Repair',
  'IT & Tech',
  'Carpentry',
  'Painting',
  'Tutoring',
  'Fitness',
  'Photography',
  'Catering',
  'Other',
] as const;

export type CategoryType = (typeof CATEGORY_LIST)[number];

// SVG path data for category symbols
export const CATEGORY_SYMBOLS: Record<string, string[]> = {
  'Salon & Beauty': [
    'M5 3C3.89 3 3 3.89 3 5V19C3 20.11 3.89 21 5 21H19C20.11 21 21 20.11 21 19V5C21 3.89 20.11 3 19 3H5ZM12 18C8.69 18 6 15.31 6 12S8.69 6 12 6 18 8.69 18 12 15.31 18 12 18Z', // mirror
    'M15.5 1H9.5L7 4H3V20H21V4H17L15.5 1ZM12 17C9.24 17 7 14.76 7 12S9.24 7 12 7 17 9.24 17 12 14.76 17 12 17Z', // scissors simplified
    'M20 8H4V6H20V8ZM18 2H6V4H18V2ZM22 12V22H2V12L4 10H20L22 12Z', // comb
  ],
  'Electrician': [
    'M7 2V13H10V22L17 10H13L17 2H7Z', // lightning bolt
    'M12 2C6.48 2 2 6.48 2 12S6.48 22 12 22 22 17.52 22 12 17.52 2 12 2ZM13 17H11V15H13V17ZM13 13H11V7H13V13Z', // plug
    'M3 17V19H9V21L12 18L9 15V17H3ZM21 7H15V5L12 8L15 11V9H21V7Z', // wire
  ],
  'Plumbing': [
    'M12 2C6.48 2 2 6.48 2 12S6.48 22 12 22 22 17.52 22 12 17.52 2 12 2ZM7 13.5C7 14.33 6.33 15 5.5 15S4 14.33 4 13.5 4.67 12 5.5 12 7 12.67 7 13.5Z', // water drop
    'M22 9V7H20V3H18V7H16V9H18V11H20V9H22ZM8 21V13H4V21H8ZM14 21V9H10V21H14Z', // pipe
    'M14.65 4.98L12.23 7.4L16.56 11.73L18.98 9.31L14.65 4.98ZM3.29 16.71L6.27 19.69C6.66 20.08 7.29 20.08 7.68 19.69L13.15 14.22L9.78 10.85L3.29 17.34Z', // wrench
  ],
  'Cleaning': [
    'M16 11H12V7H10V11H6L3 14V22H21V14L16 11ZM19 20H5V15L7 13H17L19 15V20Z', // spray bottle
    'M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3Z', // broom
    'M12 2L4 5V11C4 16.55 7.84 21.74 12 23C16.16 21.74 20 16.55 20 11V5L12 2Z', // shield/clean
  ],
  'Car Repair': [
    'M12 2C6.48 2 2 6.48 2 12S6.48 22 12 22 22 17.52 22 12 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12S7.59 4 12 4 20 7.59 20 12 16.41 20 12 20ZM12 6C8.69 6 6 8.69 6 12H8C8 9.79 9.79 8 12 8V6Z', // gear
    'M22.7 19L13.6 9.9C14.5 7.6 14 4.9 12.1 3C10.1 1 7.1 0.6 4.7 1.7L9 6L6 9L1.6 4.7C0.4 7.1 0.9 10.1 2.9 12.1C4.8 14 7.5 14.5 9.8 13.6L18.9 22.7C19.3 23.1 19.9 23.1 20.3 22.7L22.6 20.4C23.1 19.9 23.1 19.3 22.7 19Z', // spanner
  ],
  'IT & Tech': [
    'M20 18C21.1 18 21.99 17.1 21.99 16L22 6C22 4.9 21.1 4 20 4H4C2.9 4 2 4.9 2 6V16C2 17.1 2.9 18 4 18H0V20H24V18H20ZM4 6H20V16H4V6Z', // laptop
    'M9.4 16.6L4.8 12L9.4 7.4L8 6L2 12L8 18L9.4 16.6ZM14.6 16.6L19.2 12L14.6 7.4L16 6L22 12L16 18L14.6 16.6Z', // code brackets
    'M12 2C6.48 2 2 6.48 2 12S6.48 22 12 22 22 17.52 22 12 17.52 2 12 2ZM4 12C4 7.58 7.58 4 12 4C13.85 4 15.55 4.63 16.9 5.69L5.69 16.9C4.63 15.55 4 13.85 4 12ZM12 20C10.15 20 8.45 19.37 7.1 18.31L18.31 7.1C19.37 8.45 20 10.15 20 12C20 16.42 16.42 20 12 20Z', // network
  ],
  'Carpentry': [
    'M22 9V7H20V3H18V7H16V9H18V11H20V9H22ZM8 21V13H4V21H8ZM14 21V9H10V21H14Z',
    'M3 17V19H9V21L12 18L9 15V17H3Z',
  ],
  'Painting': [
    'M12 22C6.49 22 2 17.51 2 12S6.49 2 12 2 22 6.49 22 12 17.51 22 12 22ZM12 4C7.58 4 4 7.58 4 12C4 13.85 4.63 15.55 5.69 16.9C6.45 15.46 9.04 14 12 14S17.55 15.46 18.31 16.9C19.37 15.55 20 13.85 20 12C20 7.58 16.42 4 12 4Z',
    'M18 4V3C18 2.45 17.55 2 17 2H7C6.45 2 6 2.45 6 3V7C6 7.55 6.45 8 7 8H17C17.55 8 18 7.55 18 7V6H19V10H10V12H21V4H18Z',
  ],
  'Tutoring': [
    'M5 13.18V17.18L12 21L19 17.18V13.18L12 17L5 13.18ZM12 3L1 9L12 15L21 10.09V17H23V9L12 3Z',
    'M21 5C19.89 5 19 5.89 19 7V15L12 18.5L5 15V7C5 5.89 4.11 5 3 5S1 5.89 1 7V17L12 22.5L23 17V7C23 5.89 22.11 5 21 5Z',
  ],
  'Fitness': [
    'M20.57 14.86L22 13.43L20.57 12L17 15.57L8.43 7L12 3.43L10.57 2L9.14 3.43L7.71 2L5.57 4.14L4.14 2.71L2.71 4.14L4.14 5.57L2 7.71L3.43 9.14L2 10.57L3.43 12L7 8.43L15.57 17L12 20.57L13.43 22L14.86 20.57L16.29 22L18.43 19.86L19.86 21.29L21.29 19.86L19.86 18.43L22 16.29L20.57 14.86Z',
  ],
  'Photography': [
    'M12 12M9 12A3 3 0 1 0 15 12A3 3 0 1 0 9 12ZM2 6H5L7 4H17L19 6H22V20H2V6Z',
  ],
  'Catering': [
    'M8.1 13.34L3.91 9.16C2.35 7.59 2.35 5.06 3.91 3.5L10.93 10.52L8.1 13.34ZM14.88 11.53C16.57 12.38 19.21 11.45 21.48 9.18C23.25 7.4 24.07 5.25 23.5 4L20 7.5L17.88 5.38L21.38 1.88C20.13 1.31 17.99 2.13 16.21 3.91C13.94 6.18 13 8.83 13.86 10.52L4.14 20.24L5.55 21.65L12.07 15.13L18.59 21.65L20 20.24L13.48 13.71L14.88 11.53Z',
  ],
  'Other': [
    'M12 2C6.48 2 2 6.48 2 12S6.48 22 12 22 22 17.52 22 12 17.52 2 12 2ZM13 17H11V11H13V17ZM13 9H11V7H13V9Z',
    'M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM17 13H13V17H11V13H7V11H11V7H13V11H17V13Z',
  ],
};

export function getCategoryKey(cat: string): string {
  const lower = cat.toLowerCase();
  for (const key of Object.keys(CATEGORY_SYMBOLS)) {
    if (key.toLowerCase().includes(lower) || lower.includes(key.toLowerCase())) {
      return key;
    }
  }
  // Partial matching
  if (lower.includes('salon') || lower.includes('beauty') || lower.includes('hair')) return 'Salon & Beauty';
  if (lower.includes('electric')) return 'Electrician';
  if (lower.includes('plumb')) return 'Plumbing';
  if (lower.includes('clean')) return 'Cleaning';
  if (lower.includes('car') || lower.includes('auto') || lower.includes('mechanic')) return 'Car Repair';
  if (lower.includes('it') || lower.includes('tech') || lower.includes('computer') || lower.includes('software')) return 'IT & Tech';
  if (lower.includes('carpent') || lower.includes('wood')) return 'Carpentry';
  if (lower.includes('paint')) return 'Painting';
  if (lower.includes('tutor') || lower.includes('teach') || lower.includes('education')) return 'Tutoring';
  if (lower.includes('fit') || lower.includes('gym') || lower.includes('yoga')) return 'Fitness';
  if (lower.includes('photo')) return 'Photography';
  if (lower.includes('cater') || lower.includes('food') || lower.includes('cook')) return 'Catering';
  return 'Other';
}
