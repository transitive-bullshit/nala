import { Analytics } from '@vercel/analytics/react'
import type { AppProps } from 'next/app'

import { bootstrap } from '@/lib/bootstrap'
import { isServer } from '@/lib/config'
import '@/styles/index.css'

if (!isServer) {
  bootstrap()
}

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Component {...pageProps} />

      <Analytics />
    </>
  )
}
