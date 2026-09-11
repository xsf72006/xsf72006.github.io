import rss from '@astrojs/rss';
import { getTravel, getWriting } from '../lib/content';

export async function GET(context) {
  const [travel, writing] = await Promise.all([getTravel(), getWriting()]);

  const items = [
    ...travel.map((entry) => ({
      title: entry.data.title,
      description: entry.data.description,
      pubDate: entry.data.date,
      link: `/travel/${entry.id}/`,
    })),
    ...writing.map((entry) => ({
      title: entry.data.title,
      description: entry.data.description,
      pubDate: entry.data.date,
      link: `/writing/${entry.id}/`,
    })),
  ].sort((a, b) => b.pubDate.valueOf() - a.pubDate.valueOf());

  return rss({
    title: 'shaofeng.page',
    description: 'Travelogues, technical writing and small tools.',
    site: context.site,
    items,
  });
}
