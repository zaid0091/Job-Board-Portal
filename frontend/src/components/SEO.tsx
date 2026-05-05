import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  canonical?: string;
  image?: string;
  type?: string;
  jsonLd?: object | object[] | null;
  noindex?: boolean;
  nofollow?: boolean;
  articlePublishedTime?: string;
  articleModifiedTime?: string;
}

const SITE_NAME = 'Jobly';
const SITE_URL = import.meta.env.VITE_SITE_URL || 'https://jobly.com';
const DEFAULT_DESCRIPTION =
  'Find your dream job or hire top talent. Browse thousands of curated job listings across industries.';
const DEFAULT_OG_IMAGE = '/og-image.png';

export default function SEO({
  title,
  description = DEFAULT_DESCRIPTION,
  canonical,
  image,
  type = 'website',
  jsonLd,
  noindex = false,
  nofollow = false,
  articlePublishedTime,
  articleModifiedTime,
}: SEOProps) {
  const pageTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
  const ogImage = image || DEFAULT_OG_IMAGE;
  const canonicalUrl = canonical ? `${SITE_URL}${canonical}` : undefined;
  const robots = `${noindex ? 'noindex' : 'index'},${nofollow ? 'nofollow' : 'follow'}`;

  const organizationJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    sameAs: [
      'https://twitter.com/jobly',
      'https://linkedin.com/company/jobly',
      'https://facebook.com/jobly',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+1-415-555-0123',
      contactType: 'customer service',
      email: 'hello@jobboard.com',
    },
  };

  const jsonLdArray = Array.isArray(jsonLd) ? jsonLd : jsonLd ? [jsonLd] : [];

  return (
    <Helmet>
      {/* Core */}
      <title>{pageTitle}</title>
      <meta name="description" content={description} />
      <meta name="robots" content={robots} />
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}

      {/* Open Graph */}
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:image" content={ogImage.startsWith('http') ? ogImage : `${SITE_URL}${ogImage}`} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={pageTitle} />
      <meta property="og:locale" content="en_US" />
      {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}
      {articlePublishedTime && <meta property="article:published_time" content={articlePublishedTime} />}
      {articleModifiedTime && <meta property="article:modified_time" content={articleModifiedTime} />}

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@jobly" />
      <meta name="twitter:creator" content="@jobly" />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage.startsWith('http') ? ogImage : `${SITE_URL}${ogImage}`} />

      {/* JSON-LD Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(organizationJsonLd)}
      </script>
      {jsonLdArray.map((data, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(data)}
        </script>
      ))}
    </Helmet>
  );
}
