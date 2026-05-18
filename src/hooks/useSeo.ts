import { useEffect } from 'react';

type SeoOptions = {
  title: string;
  description: string;
  url?: string;
  image?: string;
  type?: string;
  noIndex?: boolean;
};

function updateMetaTag(attribute: 'name' | 'property', key: string, content?: string) {
  if (!content) return;

  const selector = `${attribute}="${key}"`;
  let element = document.head.querySelector(`meta[${selector}]`) as HTMLMetaElement | null;

  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }

  element.setAttribute('content', content);
}

function updateLinkTag(rel: string, href?: string) {
  if (!href) return;

  let element = document.head.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;

  if (!element) {
    element = document.createElement('link');
    element.setAttribute('rel', rel);
    document.head.appendChild(element);
  }

  element.setAttribute('href', href);
}

export default function useSeo({ title, description, url, image, type = 'website', noIndex = false }: SeoOptions) {
  useEffect(() => {
    if (title) document.title = title;

    updateMetaTag('name', 'description', description);
    updateMetaTag('property', 'og:title', title);
    updateMetaTag('property', 'og:description', description);
    updateMetaTag('property', 'og:type', type);
    updateMetaTag('property', 'og:url', url || window.location.href);
    updateMetaTag('property', 'og:image', image);
    updateMetaTag('name', 'twitter:card', image ? 'summary_large_image' : 'summary');
    updateMetaTag('name', 'twitter:title', title);
    updateMetaTag('name', 'twitter:description', description);
    updateMetaTag('name', 'twitter:image', image);

    updateLinkTag('canonical', url || window.location.href);

    if (noIndex) {
      updateMetaTag('name', 'robots', 'noindex, nofollow');
    }
  }, [title, description, url, image, type, noIndex]);
}
