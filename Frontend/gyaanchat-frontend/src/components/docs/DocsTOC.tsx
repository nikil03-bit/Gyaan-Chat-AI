import { useEffect, useRef, useState } from 'react';

interface TOCItem {
  id: string;
  title: string;
  level: number;
}

interface DocsTOCProps {
  content: string;
}

export default function DocsTOC({ content }: DocsTOCProps) {
  const [headings, setHeadings] = useState<TOCItem[]>([]);
  const [activeId, setActiveId] = useState<string>('');
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const regex = /^(##|###)\s+(.+)$/gm;
    let match;
    const items: TOCItem[] = [];

    while ((match = regex.exec(content)) !== null) {
      const level = match[1].length;
      const title = match[2].trim();
      const id = title
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_]+/g, '-')
        .replace(/-+/g, '-');
      items.push({ id, title, level });
    }

    setHeadings(items);
  }, [content]);

  useEffect(() => {
    if (headings.length === 0) return;

    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: '-60px 0px -70% 0px', threshold: 0 }
    );

    headings.forEach((h) => {
      const el = document.getElementById(h.id);
      if (el) observerRef.current?.observe(el);
    });

    return () => observerRef.current?.disconnect();
  }, [headings]);

  if (headings.length === 0) return null;

  return (
    <aside className="docs-toc">
      <div className="docs-toc-title">On this page</div>
      <ul className="docs-toc-list">
        {headings.map((h) => (
          <li
            key={h.id}
            className={`docs-toc-item ${activeId === h.id ? 'active' : ''}`}
            style={{ paddingLeft: (h.level - 2) * 14 }}
          >
            <a
              href={`#${h.id}`}
              className={`docs-toc-link ${activeId === h.id ? 'active' : ''}`}
              onClick={(e) => {
                e.preventDefault();
                document.getElementById(h.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                setActiveId(h.id);
              }}
            >
              {h.title}
            </a>
          </li>
        ))}
      </ul>
    </aside>
  );
}
