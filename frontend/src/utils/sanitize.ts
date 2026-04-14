import DOMPurify from 'dompurify';

/**
 * Sanitize HTML content before rendering with dangerouslySetInnerHTML.
 * Only allows safe tags and attributes to prevent XSS.
 */
export function sanitizeHTML(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'b', 'em', 'i', 'u',
      'ul', 'ol', 'li',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'a', 'blockquote', 'code', 'pre', 'span',
    ],
    ALLOWED_ATTR: ['href', 'title', 'rel', 'class'],
  });
}
