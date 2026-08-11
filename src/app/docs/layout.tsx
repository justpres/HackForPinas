import { DocsShell } from '@/components/docs/DocsShell';
import { getDocsNavigation } from '@/lib/docs';
import './docs.css';

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <DocsShell items={getDocsNavigation()}>{children}</DocsShell>
  );
}
