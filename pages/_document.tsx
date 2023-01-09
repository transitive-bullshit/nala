import Document, { Head, Html, Main, NextScript } from 'next/document'

class MyDocument extends Document {
  render() {
    return (
      <Html lang='en'>
        <Head>
          <link rel='icon' href='/favicon.ico' />
        </Head>

        <body className='bg-black antialiased'>
          <Main />

          <NextScript />
        </body>
      </Html>
    )
  }
}

export default MyDocument
