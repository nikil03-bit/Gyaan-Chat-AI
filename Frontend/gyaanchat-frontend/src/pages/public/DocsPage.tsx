// Renders documentation from Markdown
import { useParams, Navigate, useNavigate } from 'react-router-dom';
import DocsMarkdown from '../../components/docs/DocsMarkdown';
import DocsTOC from '../../components/docs/DocsTOC';
import { getContentForSlug } from '../../features/docs/contentProvider';
import { getDocBySlug, getAdjacentDocs } from '../../features/docs/docs-config';
import DocsLayout from '../../components/layout/DocsLayout';
import { Clock, ArrowLeft, ArrowRight } from 'lucide-react';

export default function DocsPage() {
  // Get slug from URL
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  // Redirect if no slug
  if (!slug) {
    return <Navigate to="/docs/getting-started" replace />;
  }

  // Fetch meta and content
  const docInfo = getDocBySlug(slug);
  const content = getContentForSlug(slug);
  
  // Get nav links
  const { prev, next } = getAdjacentDocs(slug);

  // 404 state
  if (!docInfo || !content) {
    return (
      <DocsLayout>
        <div className="docs-not-found">
          <div className="docs-not-found-icon">404</div>
          <h2 className="docs-not-found-title">Page not found</h2>
          <p className="docs-not-found-sub">
            The article you're looking for doesn't exist or may have been moved.
          </p>
          <button className="docs-not-found-btn" onClick={() => navigate('/docs/getting-started')}>
            Go to Getting Started
          </button>
        </div>
      </DocsLayout>
    );
  }

  const Icon = docInfo.Icon;

  return (
    <DocsLayout>
      <div className="docs-page-layout">
        <div className="docs-page-content">
          {/* Header */}
          <div className="docs-article-hero">
            <div className="docs-article-icon-wrap">
              <Icon size={22} strokeWidth={1.75} />
            </div>
            <div className="docs-article-meta">
              <span className="docs-article-readtime">
                <Clock size={13} />
                {docInfo.readTime}
              </span>
              <p className="docs-article-desc">{docInfo.description}</p>
            </div>
          </div>

          {/* Article Body */}
          <DocsMarkdown content={content} />

          {/* Navigation */}
          <div className="docs-pagination">
            {prev ? (
              <button
                className="docs-pagination-card docs-pagination-prev"
                onClick={() => navigate(`/docs/${prev.slug}`)}
              >
                <div className="docs-pagination-dir">
                  <ArrowLeft size={14} />
                  <span>Previous</span>
                </div>
                <div className="docs-pagination-title">{prev.title}</div>
              </button>
            ) : (
              <div />
            )}

            {next ? (
              <button
                className="docs-pagination-card docs-pagination-next"
                onClick={() => navigate(`/docs/${next.slug}`)}
              >
                <div className="docs-pagination-dir">
                  <span>Next</span>
                  <ArrowRight size={14} />
                </div>
                <div className="docs-pagination-title">{next.title}</div>
              </button>
            ) : (
              <div />
            )}
          </div>
        </div>

        {/* Sidebar TOC */}
        <DocsTOC content={content} />
      </div>
    </DocsLayout>
  );
}


