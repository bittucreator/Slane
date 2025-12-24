/**
 * @author Shiva Nagendra Babu Kore
 */

import { MetadataRoute } from 'next'
 
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/auth/callback/'],
    },
    sitemap: 'https://slane.app/sitemap.xml',
  }
}
