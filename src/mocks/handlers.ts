// src/mocks/handlers.ts
import { http, HttpResponse } from 'msw'; // Import HttpResponse for better typing
import type { PathParams } from 'msw';

export const handlers = [
  http.get<never, never, never>('https://restcountries.com/v3.1/all', ({ request }) => {
    // No need for req, res, ctx in this format
    return HttpResponse.json([
      {
        name: { common: 'France' },
        flags: { svg: 'https://flagcdn.com/fr.svg' },
        region: 'Europe',
        languages: { fra: 'French' },
        population: 67391582,
        capital: ['Paris'],
      },
      {
        name: { common: 'Germany' },
        flags: { svg: 'https://flagcdn.com/de.svg' },
        region: 'Europe',
        languages: { deu: 'German' },
        population: 83240525,
        capital: ['Berlin'],
      },
    ], { status: 200 });
  }),

  http.get<PathParams, never, never>('https://restcountries.com/v3.1/name/:name', ({ request, params }) => {
    const { name } = params;
    return HttpResponse.json([
      {
        name: { common: name },
        flags: { svg: `https://flagcdn.com/${String(name).toLowerCase()}.svg` },
        region: 'Europe',
        languages: { fra: 'French' },
        population: 67391582,
        capital: ['Paris'],
        latlng: [46.0, 2.0],
        cca2: 'FR',
        borders: ['DE'],
      },
    ], { status: 200 });
  }),

  http.get<never, never, never>('https://restcountries.com/v3.1/alpha', ({ request }) => {
    return HttpResponse.json([
      {
        name: { common: 'Germany' },
        flags: { svg: 'https://flagcdn.com/de.svg' },
        capital: ['Berlin'],
      },
    ], { status: 200 });
  }),
];