import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import remarkGfm from 'remark-gfm';
import { Icon } from '@iconify/react';
import { DocsCodeBlock } from '@/components/docs/DocsCodeBlock';
import { getAdjacentDocs, getDocBySlug, getDocs, getHeadingId } from '@/lib/docs';

export const dynamicParams = false;

export function generateStaticParams() {
  return getDocs().map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<'/docs/[slug]'>): Promise<Metadata> {
  const { slug } = await params;
  const document = getDocBySlug(slug);

  if (!document) return {};

  return {
    title: document.title,
    description: document.description,
  };
}

export default async function DocsArticlePage({ params }: PageProps<'/docs/[slug]'>) {
  const { slug } = await params;
  const document = getDocBySlug(slug);

  if (!document) notFound();

  const { previous, next } = getAdjacentDocs(slug);

  return (
    <article data-docs-article className="docs-prose">
      <div className="mb-12 border-b border-border pb-8">
        <p className="mb-3 text-sm font-medium text-primary">{document.category}</p>
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">{document.title}</h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">{document.description}</p>
      </div>

      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          h2: ({ children }) => <h2 id={getHeadingId(String(children))}>{children}</h2>,
          h3: ({ children }) => <h3 id={getHeadingId(String(children))}>{children}</h3>,
          pre: ({ children }) => <DocsCodeBlock>{children}</DocsCodeBlock>,
        }}
      >
        {document.content}
      </ReactMarkdown>

      <nav aria-label="Adjacent documentation" className="mt-16 grid gap-4 border-t border-border pt-8 sm:grid-cols-2">
        {previous ? (
          <Link href={`/docs/${previous.slug}`} className="rounded-xl border border-border p-4 transition-colors hover:border-white/30 hover:bg-card">
            <span className="flex items-center gap-1 text-xs uppercase tracking-[0.14em] text-muted-foreground">
              <Icon icon="fluent:arrow-left-16-regular" width={14} /> Previous
            </span>
            <span className="mt-2 block font-medium">{previous.title}</span>
          </Link>
        ) : <div />}
        {next && (
          <Link href={`/docs/${next.slug}`} className="rounded-xl border border-border p-4 text-right transition-colors hover:border-white/30 hover:bg-card">
            <span className="flex items-center justify-end gap-1 text-xs uppercase tracking-[0.14em] text-muted-foreground">
              Next <Icon icon="fluent:arrow-right-16-regular" width={14} />
            </span>
            <span className="mt-2 block font-medium">{next.title}</span>
          </Link>
        )}
      </nav>
    </article>
  );
}
