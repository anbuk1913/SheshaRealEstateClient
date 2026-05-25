import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { Calendar, Tag, ArrowLeft, User } from 'lucide-react';
import useSeo from '../hooks/useSeo';
import api from '../utils/axios';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from "@vercel/speed-insights/react";

export default function BlogDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [blog, setBlog] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useSeo({
    title: blog ? `${blog.title} | Shesha Real Estate Solutions` : 'Blog Article | Shesha Real Estate Solutions',
    description: blog
      ? blog.excerpt || `${blog.content?.replace(/\s+/g, ' ').trim().slice(0, 150)}${blog.content?.length > 150 ? '...' : ''}`
      : 'Read the latest blog articles from Shesha Real Estate Solutions on real estate insights, market trends, and buying tips.',
    image: blog?.coverImage ? `${import.meta.env.VITE_BASE_URL}${blog.coverImage}` : undefined,
  });

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    (api.get(`/blogs/${slug}`) as any)
      .then((res: any) => { setBlog(res.data); setLoading(false); })
      .catch(() => { setError('Blog not found.'); setLoading(false); });
  }, [slug]);

  function renderContent(text: string) {
    if (!text) return null;
    return text.split('\n').map((line, i) => {
      if (line.trim() === '') {
        return <div key={i} className="h-3" />;
      }

      const parts = line.split(/(\*[^*]+\*|"[^"]+"|'[^']+')/g);
      const hasStarHighlight = parts.some(p => /^\*[^*]+\*$/.test(p));

      return (
        <p key={i} className={`${hasStarHighlight ? 'flex items-start gap-2' : ''} text-gray-700 leading-relaxed`}>
          {hasStarHighlight && (
            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0 inline-block" />
          )}
          <span>
            {parts.map((part, j) =>
              /^(\*[^*]+\*|"[^"]+"|'[^']+')$/.test(part) ? (
                <strong key={j} className="font-semibold text-gray-900">
                  {part.slice(1, -1)}
                </strong>
              ) : (
                <span key={j}>{part}</span>
              )
            )}
          </span>
        </p>
      );
    });
  }

  if (loading)
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <Analytics />
          <div className="animate-spin w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full" />
        </main>
        <Footer />
      </div>
    );

  if (error || !blog)
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center gap-4 text-gray-500">
          <p>{error || 'Blog not found.'}</p>
          <Link to="/blog" className="text-amber-600 text-sm font-medium hover:underline">
            ← Back to Blog
          </Link>
        </main>
        <Footer />
      </div>
    );

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <Analytics />
      <main className="flex-1 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Back Button */}
          <Link
            to="/blog"
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-amber-600 mb-6 transition-colors"
          >
            <ArrowLeft size={14} /> Back to Blog
          </Link>

          {/* Cover Image */}
          {blog.coverImage && (
            <div className="w-full aspect-video overflow-hidden rounded-2xl mb-8 bg-gray-100">
              <img
                src={`${import.meta.env.VITE_BASE_URL}${blog.coverImage}`}
                alt={blog.title}
                className="w-full h-full object-cover"
                      onError={(e) => {
                  e.currentTarget.src = '/blog_default.jpeg';
                }}
                loading="lazy"
              />
            </div>
          )}

          {/* Blog Header */}
          <div className="mb-8">
            {/* Tags */}
            {blog.tags && blog.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {blog.tags.map((tag: string, idx: number) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-700 text-xs font-medium px-3 py-1.5 rounded-full"
                  >
                    <Tag size={12} /> {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Title */}
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">{blog.title}</h1>

            {/* Excerpt */}
            {blog.excerpt && (
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">{blog.excerpt}</p>
            )}

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 border-b border-gray-200 pb-6">
              <span className="flex items-center gap-2">
                <Calendar size={14} />
                {new Date(blog.createdAt).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </span>
              <span className="flex items-center gap-2">
                <User size={14} />
                {blog.author}
              </span>
            </div>
          </div>

          {/* Blog Content */}
          <div className="prose prose-sm max-w-none">
            <div className="space-y-4 text-gray-700">
              {blog.content ? renderContent(blog.content) : null}
            </div>
          </div>

          {/* Divider */}
          <div className="my-12 border-t border-gray-200" />

          {/* Back to Blog */}
          <div className="text-center">
            <Link
              to="/blog"
              className="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white font-medium px-6 py-3 rounded-lg transition-colors"
            >
              ← Back to All Blogs
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
