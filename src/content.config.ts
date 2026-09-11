import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const lang = z.enum(['zh-Hant', 'en']);

/** The masthead image of a travel entry. The only cropped image on the page. */
const hero = z.object({
  src: z.string(),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  alt: z.string(),
  place: z.string(),
  caption: z.string(),
});

const travel = defineCollection({
  loader: glob({ base: './src/content/travel', pattern: '**/*.md' }),
  schema: z.object({
    title: z.string(),
    subtitle: z.string(),
    /** Display string, e.g. "2026.08.29 — 09.05". */
    dates: z.string(),
    /** ISO date, the sort key. */
    date: z.coerce.date(),
    description: z.string(),
    lang,
    hero,
    region: z.string(),
    /** Romanised stops, for the essay footer line. Falls back to `region`. */
    route: z.array(z.string()).default([]),
    /** Closing line of the essay footer. */
    colophon: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

const writing = defineCollection({
  loader: glob({ base: './src/content/writing', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    description: z.string(),
    lang,
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});

const projects = defineCollection({
  loader: glob({ base: './src/content/projects', pattern: '**/*.yaml' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    url: z.url(),
    repo: z.url(),
    year: z.number().int(),
    stack: z.string(),
    status: z.enum(['live', 'archived']),
    order: z.number().int(),
  }),
});

export const collections = { travel, writing, projects };
