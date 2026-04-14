import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
}

const SITE_NAME = 'JobBoard';
const DEFAULT_DESCRIPTION =
  'Find your dream job or hire top talent. Browse thousands of job listings across industries.';

export default function SEO({ title, description = DEFAULT_DESCRIPTION }: SEOProps) {
  const pageTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;

  return (
    <Helmet>
      <title>{pageTitle}</title>
      <meta name="description" content={description} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={description} />
    </Helmet>
  );
}
