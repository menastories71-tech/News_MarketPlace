import { Helmet } from 'react-helmet-async';

const Schema = ({ type, data }) => {
  const generateSchema = () => {
    const baseUrl = window.location.origin;

    switch (type) {
      case 'organization':
        return {
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "News Marketplace",
          "url": baseUrl,
          "logo": `${baseUrl}/logo.png`, // Replace with actual logo path
          "description": "A leading digital media marketplace connecting content creators with global publications",
          "email": "thesheikhmedia@gmail.com",
          "contactPoint": {
            "@type": "ContactPoint",
            "email": "thesheikhmedia@gmail.com",
            "contactType": "customer service"
          },
          "sameAs": [
            "https://t.me/VisibilityExperts"
          ]
        };

      case 'article':
        return {
          "@context": "https://schema.org",
          "@type": "Article",
          "headline": data.headline,
          "author": {
            "@type": "Person",
            "name": data.author || "Anonymous"
          },
          "publisher": {
            "@type": "Organization",
            "name": "News Marketplace",
            "logo": {
              "@type": "ImageObject",
              "url": `${baseUrl}/logo.png`
            }
          },
          "datePublished": data.datePublished,
          "dateModified": data.dateModified || data.datePublished,
          "image": data.image ? [data.image] : [],
          "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": data.url
          },
          "articleSection": data.articleSection || "News"
        };

      case 'breadcrumb':
        return {
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": data.map((item, index) => ({
            "@type": "ListItem",
            "position": index + 1,
            "name": item.name,
            "item": item.url
          }))
        };

      default:
        return null;
    }
  };

  const schema = generateSchema();

  if (!schema) return null;

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  );
};

export default Schema;