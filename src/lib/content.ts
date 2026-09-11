import { getCollection, type CollectionEntry } from 'astro:content';

/** Drafts never reach the built site. */
const published = <T extends { data: { draft: boolean } }>(entries: T[]) =>
  entries.filter((entry) => !entry.data.draft);

const byDateDesc = (a: { data: { date: Date } }, b: { data: { date: Date } }) =>
  b.data.date.valueOf() - a.data.date.valueOf();

export async function getTravel(): Promise<CollectionEntry<'travel'>[]> {
  return published(await getCollection('travel')).sort(byDateDesc);
}

export async function getWriting(): Promise<CollectionEntry<'writing'>[]> {
  return published(await getCollection('writing')).sort(byDateDesc);
}

export async function getProjects(): Promise<CollectionEntry<'projects'>[]> {
  const projects = await getCollection('projects');
  return projects.sort((a, b) => a.data.order - b.data.order);
}

/** 2026-09-05 -> "2026.09.05" */
export const stamp = (date: Date) =>
  date.toISOString().slice(0, 10).replace(/-/g, '.');
