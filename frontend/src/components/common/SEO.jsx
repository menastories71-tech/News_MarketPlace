import { Helmet } from 'react-helmet-async';

const SEO = ({
  title,
  description,
  keywords,
  image,
  url,
  type = 'website'
}) => {
  const siteName = 'Visibility as a Service (VaaS) Solutions';
  const defaultImage = '/logo.png'; // Replace with your default image path
  const defaultUrl = 'https://vaas.solutions';

  const metaTitle = title ? `${title} | ${siteName}` : siteName;
  const metaDescription = description || 'Discover, create, and share premium news content. Join our community of writers and readers.';
  const metaKeywords = keywords || 'news, marketplace, articles, journalism, writers, readers';
  const metaImage = image || defaultImage;
  const metaUrl = url || defaultUrl;

  return (
    <Helmet>
      {/* Basic meta tags */}
      <title>{metaTitle}</title>
      <meta name="description" content={metaDescription} />
      <meta name="keywords" content={metaKeywords} />

      {/* Open Graph tags */}
      <meta property="og:title" content={metaTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:image" content={metaImage} />
      <meta property="og:url" content={metaUrl} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={siteName} />

      {/* Twitter Card tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={metaTitle} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={metaImage} />

      {/* Canonical URL */}
      <link rel="canonical" href={metaUrl} />

      {/* Hreflang for geo-targeting */}
      <link rel="alternate" hreflang="en" href={`https://vaas.solutions${window.location.pathname}`} />
    </Helmet>
  );
};

export default SEO;