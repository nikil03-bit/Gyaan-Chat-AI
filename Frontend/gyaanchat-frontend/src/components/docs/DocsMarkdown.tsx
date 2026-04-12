import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import { Lightbulb, Info, AlertTriangle, AlertOctagon } from 'lucide-react';
import type { ReactNode } from 'react';

interface DocsMarkdownProps {
  content: string;
}

// Custom blockquote to handle [!TIP], [!NOTE], [!WARNING], [!CAUTION]
function CalloutBlock({ children }: { children: ReactNode }) {
  const text = extractText(children);
  const firstLine = text.trimStart();

  if (firstLine.startsWith('[!TIP]')) {
    return (
      <div className="docs-callout docs-callout-tip">
        <div className="docs-callout-header">
          <Lightbulb size={15} />
          <span>Tip</span>
        </div>
        <div className="docs-callout-body">{stripCalloutTag(children, '[!TIP]')}</div>
      </div>
    );
  }
  if (firstLine.startsWith('[!NOTE]')) {
    return (
      <div className="docs-callout docs-callout-note">
        <div className="docs-callout-header">
          <Info size={15} />
          <span>Note</span>
        </div>
        <div className="docs-callout-body">{stripCalloutTag(children, '[!NOTE]')}</div>
      </div>
    );
  }
  if (firstLine.startsWith('[!WARNING]')) {
    return (
      <div className="docs-callout docs-callout-warning">
        <div className="docs-callout-header">
          <AlertTriangle size={15} />
          <span>Warning</span>
        </div>
        <div className="docs-callout-body">{stripCalloutTag(children, '[!WARNING]')}</div>
      </div>
    );
  }
  if (firstLine.startsWith('[!CAUTION]')) {
    return (
      <div className="docs-callout docs-callout-caution">
        <div className="docs-callout-header">
          <AlertOctagon size={15} />
          <span>Caution</span>
        </div>
        <div className="docs-callout-body">{stripCalloutTag(children, '[!CAUTION]')}</div>
      </div>
    );
  }
  return <blockquote className="docs-blockquote">{children}</blockquote>;
}

function extractText(node: ReactNode): string {
  if (typeof node === 'string') return node;
  if (Array.isArray(node)) return node.map(extractText).join('');
  if (node && typeof node === 'object' && 'props' in (node as object)) {
    return extractText((node as { props: { children: ReactNode } }).props.children);
  }
  return '';
}

function stripCalloutTag(children: ReactNode, tag: string): ReactNode {
  if (Array.isArray(children)) {
    return children.map((child, i) => {
      if (i === 0 && typeof child === 'object' && child !== null && 'props' in child) {
        const p = child as { type: string; props: { children: ReactNode } };
        if (p.type === 'p') {
          const text = extractText(p.props.children);
          const cleaned = text.replace(tag, '').trim();
          return <p key={i}>{cleaned}</p>;
        }
      }
      return child;
    });
  }
  return children;
}

export default function DocsMarkdown({ content }: DocsMarkdownProps) {
  return (
    <div className="docs-markdown">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSlug]}
        components={{
          blockquote: ({ children }) => <CalloutBlock>{children}</CalloutBlock>,
          img: ({ node: _node, ...props }) => (
            props.src === 'placeholder' ? (
              <div className="docs-image-placeholder">
                [ Screenshot: {props.alt} ]
              </div>
            ) : (
              <img {...props} loading="lazy" className="docs-img" />
            )
          ),
          a: ({ node: _node, ...props }) => {
            const isExternal = props.href?.startsWith('http');
            return (
              <a
                {...props}
                target={isExternal ? '_blank' : undefined}
                rel={isExternal ? 'noopener noreferrer' : undefined}
              />
            );
          },
          table: ({ node: _node, ...props }) => (
            <div className="docs-table-wrap">
              <table {...props} />
            </div>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
