import * as React from 'react'
import Head from 'next/head'

import * as config from '@/lib/config'

export const PageHead: React.FC<{
  title?: string
  description?: string
  imageUrl?: string
  pathname?: string
}> = ({
  title = config.title,
  description = config.description,
  imageUrl,
  pathname
}) => {
  const url = pathname ? `${config.url}${pathname}` : config.url
  const socialImageUrl = imageUrl ?? config.socialImageUrl

  return (
    <Head>
      <meta name='robots' content='index,follow' />
      <meta property='og:type' content='website' />

      <meta property='og:site_name' content={config.title} />
      <meta property='twitter:domain' content={config.domain} />

      <meta name='twitter:creator' content={`@${config.twitter}`} />

      {description && (
        <>
          <meta name='description' content={description} />
          <meta property='og:description' content={description} />
          <meta name='twitter:description' content={description} />
        </>
      )}

      {socialImageUrl ? (
        <>
          <meta name='twitter:card' content='summary_large_image' />
          <meta name='twitter:image' content={socialImageUrl} />
          <meta property='og:image' content={socialImageUrl} />
        </>
      ) : (
        <meta name='twitter:card' content='summary' />
      )}

      {url && (
        <>
          <link rel='canonical' href={url} />
          <meta property='og:url' content={url} />
          <meta property='twitter:url' content={url} />
        </>
      )}

      <meta property='og:title' content={title} />
      <meta name='twitter:title' content={title} />
      <title>{title}</title>
    </Head>
  )
}
