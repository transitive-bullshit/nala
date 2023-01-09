import type { NextPage } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/router'
import pMap from 'p-map'
import { useEffect, useRef } from 'react'

import Bridge from '@/components/Icons/Bridge'
import Logo from '@/components/Icons/Logo'
import Modal from '@/components/Modal'
import { PageHead } from '@/components/PageHead'
import cloudinary from '@/lib/cloudinary'
import getBase64ImageUrl from '@/lib/generateBlurPlaceholder'
import type { ImageProps } from '@/lib/types'
import { useLastViewedPhoto } from '@/lib/useLastViewedPhoto'

const Home: NextPage = ({ images }: { images: ImageProps[] }) => {
  const router = useRouter()
  const { photoId } = router.query
  const [lastViewedPhoto, setLastViewedPhoto] = useLastViewedPhoto()

  const lastViewedPhotoRef = useRef<HTMLAnchorElement>(null)

  useEffect(() => {
    // This effect keeps track of the last viewed photo in the modal to keep the index page in sync when the user navigates back
    if (lastViewedPhoto && !photoId) {
      lastViewedPhotoRef.current.scrollIntoView({ block: 'center' })
      setLastViewedPhoto(null)
    }
  }, [photoId, lastViewedPhoto, setLastViewedPhoto])

  return (
    <>
      <PageHead />

      <main className='mx-auto max-w-[1960px] p-4'>
        {photoId && (
          <Modal
            images={images}
            onClose={() => {
              setLastViewedPhoto(photoId)
            }}
          />
        )}

        <div className='columns-1 gap-4 sm:columns-2 xl:columns-3 2xl:columns-4'>
          <div className='after:content relative mb-5 flex h-[629px] flex-col items-center justify-end gap-4 overflow-hidden rounded-lg bg-white/10 px-6 pb-16 pt-64 text-center text-white shadow-highlight after:pointer-events-none after:absolute after:inset-0 after:rounded-lg after:shadow-highlight lg:pt-0'>
            <div className='absolute inset-0 flex items-center justify-center opacity-20'>
              <span className='flex max-h-full max-w-full items-center justify-center'>
                <Bridge />
              </span>
              <span className='absolute left-0 right-0 bottom-0 h-[400px] bg-gradient-to-b from-black/0 via-black to-black'></span>
            </div>

            <Logo />

            <h1 className='mt-8 mb-4 text-base font-bold uppercase tracking-widest'>
              TODO
            </h1>

            <p className='max-w-[40ch] text-white/75 sm:max-w-[32ch]'>TODO</p>
          </div>

          {images.map(({ id, public_id, format, blurDataUrl }) => (
            <Link
              key={id}
              href={`/?photoId=${id}`}
              as={`/p/${id}`}
              ref={id === Number(lastViewedPhoto) ? lastViewedPhotoRef : null}
              shallow
              className='after:content group relative mb-5 block w-full cursor-zoom-in after:pointer-events-none after:absolute after:inset-0 after:rounded-lg after:shadow-highlight'
            >
              <Image
                alt='Next.js Conf photo'
                className='transform rounded-lg brightness-90 transition will-change-auto group-hover:brightness-110'
                style={{ transform: 'translate3d(0, 0, 0)' }}
                placeholder='blur'
                blurDataURL={blurDataUrl}
                src={`https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/c_scale,w_720/${public_id}.${format}`}
                width={720}
                height={480}
                sizes='(max-width: 640px) 100vw,
                  (max-width: 1280px) 50vw,
                  (max-width: 1536px) 33vw,
                  25vw'
              />
            </Link>
          ))}
        </div>
      </main>

      <footer className='p-6 text-center text-white/80 sm:p-12'>
        Thank you to{' '}
        <a
          href='https://edelsonphotography.com/'
          target='_blank'
          className='font-semibold hover:text-white'
          rel='noreferrer'
        >
          Josh Edelson
        </a>
        ,{' '}
        <a
          href='https://www.newrevmedia.com/'
          target='_blank'
          className='font-semibold hover:text-white'
          rel='noreferrer'
        >
          Jenny Morgan
        </a>
        , and{' '}
        <a
          href='https://www.garysextonphotography.com/'
          target='_blank'
          className='font-semibold hover:text-white'
          rel='noreferrer'
        >
          Gary Sexton
        </a>{' '}
        for the pictures.
      </footer>
    </>
  )
}

export default Home

export async function getStaticProps() {
  const results = await cloudinary.v2.search
    .expression(`folder:${process.env.CLOUDINARY_FOLDER}/*`)
    .sort_by('public_id', 'desc')
    .max_results(400)
    .execute()
  const reducedResults: ImageProps[] = []

  let i = 0
  for (let result of results.resources) {
    reducedResults.push({
      id: i,
      height: result.height,
      width: result.width,
      public_id: result.public_id,
      format: result.format
    })
    i++
  }

  const imagesWithBlurDataUrls = await pMap(
    results.resources,
    async (image: ImageProps) => {
      return getBase64ImageUrl(image)
    },
    {
      concurrency: 8
    }
  )

  for (let i = 0; i < reducedResults.length; i++) {
    reducedResults[i].blurDataUrl = imagesWithBlurDataUrls[i]
  }

  return {
    props: {
      images: reducedResults
    }
  }
}
