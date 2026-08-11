import 'server-only';

import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';

export type DocsPage = {
  slug: string;
  title: string;
  description: string;
  category: string;
  order: number;
  content: string;
};

export type DocsNavigationItem = Pick<DocsPage, 'slug' | 'title' | 'description' | 'category' | 'order'>;

const docsDirectory = path.join(process.cwd(), 'content', 'docs');
const frontmatterPattern = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/;

function parseFrontmatter(source: string, filename: string) {
  const match = source.match(frontmatterPattern);

  if (!match) {
    throw new Error(`Documentation file ${filename} must begin with frontmatter.`);
  }

  const metadata = Object.fromEntries(
    match[1].split(/\r?\n/).flatMap((line) => {
      const separator = line.indexOf(':');
      if (separator === -1) return [];

      return [[line.slice(0, separator).trim(), line.slice(separator + 1).trim()]];
    })
  );

  const title = metadata.title;
  const description = metadata.description;
  const category = metadata.category;
  const order = Number(metadata.order);

  if (!title || !description || !category || !Number.isFinite(order)) {
    throw new Error(
      `Documentation file ${filename} must define title, description, category, and a numeric order.`
    );
  }

  return { title, description, category, order, content: match[2].trim() };
}

export function getDocs(): DocsPage[] {
  return readdirSync(docsDirectory, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith('.md'))
    .map((entry) => {
      const slug = entry.name.replace(/\.md$/, '');
      const source = readFileSync(path.join(docsDirectory, entry.name), 'utf8');

      return { slug, ...parseFrontmatter(source, entry.name) };
    })
    .sort((a, b) => a.category.localeCompare(b.category) || a.order - b.order || a.title.localeCompare(b.title));
}

export function getDocsNavigation(): DocsNavigationItem[] {
  return getDocs().map((document) => ({
    slug: document.slug,
    title: document.title,
    description: document.description,
    category: document.category,
    order: document.order,
  }));
}

export function getDocBySlug(slug: string): DocsPage | undefined {
  return getDocs().find((document) => document.slug === slug);
}

export function getAdjacentDocs(slug: string) {
  const documents = getDocs();
  const index = documents.findIndex((document) => document.slug === slug);

  return {
    previous: index > 0 ? documents[index - 1] : undefined,
    next: index >= 0 && index < documents.length - 1 ? documents[index + 1] : undefined,
  };
}

export function getHeadingId(value: string) {
  return value
    .toLowerCase()
    .replace(/[`*_~]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}
