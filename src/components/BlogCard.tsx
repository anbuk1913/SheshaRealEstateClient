import { Link } from 'react-router-dom';
import { Calendar, Tag } from 'lucide-react';

interface Props {
  blog: {
    _id:        string;
    slug:       string;
    title:      string;
    excerpt:    string;
    coverImage: string;
    author:     string;
    tags:       string[];
    createdAt:  string;
  };
}

export const BlogCard = ({ blog }: Props) => (
  <Link
    to={`/blog/${blog.slug}`}
    className="group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-300"
  >
    <div className="aspect-video overflow-hidden bg-gray-100">
      {blog.coverImage ? (
        <img
          src={blog.coverImage}
          alt={blog.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-amber-50 to-amber-100 text-amber-300 text-4xl font-bold">
          {blog.title.charAt(0)}
        </div>
      )}
    </div>
    <div className="p-5">
      {blog.tags?.length > 0 && (
        <div className="flex items-center gap-1.5 mb-3">
          <Tag size={12} className="text-amber-500" />
          <span className="text-xs text-amber-600 font-medium">{blog.tags[0]}</span>
        </div>
      )}
      <h3 className="font-semibold text-gray-900 text-base mb-2 line-clamp-2 group-hover:text-amber-600 transition-colors">
        {blog.title}
      </h3>
      {blog.excerpt && (
        <p className="text-sm text-gray-500 line-clamp-2 mb-4">{blog.excerpt}</p>
      )}
      <div className="flex items-center gap-3 text-xs text-gray-400">
        <span className="flex items-center gap-1">
          <Calendar size={11} /> {new Date(blog.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
        </span>
        <span>· {blog.author}</span>
      </div>
    </div>
  </Link>
);
