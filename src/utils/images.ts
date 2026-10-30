import type React from 'react';

/** Self-contained placeholder (no network needed) shown when a food photo fails to load. */
export const FOOD_PLACEHOLDER =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1d4d38"/><stop offset="1" stop-color="#0f2a1e"/></linearGradient></defs><rect width="600" height="400" fill="url(#g)"/><g fill="none" stroke="#7ad3a6" stroke-width="10" stroke-linecap="round" opacity=".55"><circle cx="300" cy="200" r="70"/><path d="M200 140v120M180 140v40q0 20 20 20t20-20v-40M420 140c-20 20-20 80 0 100v40"/></g></svg>`
  );

/** onError handler: swap once to the placeholder, never loop. */
export const onImgError = (e: React.SyntheticEvent<HTMLImageElement>) => {
  const img = e.currentTarget;
  if (img.dataset.fallback === '1') return;
  img.dataset.fallback = '1';
  img.src = FOOD_PLACEHOLDER;
};
