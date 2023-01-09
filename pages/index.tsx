import cs from 'clsx'
import type { NextPage } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/router'
import pMap from 'p-map'
import { useEffect, useRef } from 'react'

import * as config from '@/lib/config'
import { GitHub } from '@/components/Icons/GitHub'
import { TwitterIcon } from '@/components/Icons/TwitterIcon'
import Modal from '@/components/Modal'
import { PageHead } from '@/components/PageHead'
import cloudinary from '@/lib/cloudinary'
import getBase64ImageUrl from '@/lib/generateBlurPlaceholder'
import type { ImageProps } from '@/lib/types'
import { useLastViewedPhoto } from '@/lib/useLastViewedPhoto'

import styles from './styles.module.css'

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
          <div className='relative mb-5 flex flex-col items-center justify-center gap-4 overflow-hidden rounded-lg bg-white/10 p-8 text-center text-white shadow-highlight after:pointer-events-none after:absolute after:content after:inset-0 after:rounded-lg after:shadow-highlight'>
            <h1 className='my-4 text-base font-bold uppercase tracking-widest mt-0'>
              Nala 💕
            </h1>

            <p className='max-w-[40ch] text-white/75 sm:max-w-[32ch]'>
              In loving memory of Nala Das Kitten.
            </p>

            <p className='max-w-[40ch] text-white/75 sm:max-w-[32ch]'>
              2010 - 2023
            </p>
          </div>

          {images.map(
            ({ id, public_id, format, blurDataUrl, width, height }) => (
              <Link
                key={id}
                href={`/?photoId=${id}`}
                as={`/p/${id}`}
                ref={id === Number(lastViewedPhoto) ? lastViewedPhotoRef : null}
                shallow
                className='after:content group relative mb-5 block w-full cursor-zoom-in after:pointer-events-none after:absolute after:inset-0 after:rounded-lg after:shadow-highlight'
              >
                <Image
                  alt={config.alt}
                  className='transform rounded-lg brightness-90 transition will-change-auto group-hover:brightness-110'
                  style={{ transform: 'translate3d(0, 0, 0)' }}
                  placeholder='blur'
                  blurDataURL={blurDataUrl}
                  src={`https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/c_scale,w_720/${public_id}.${format}`}
                  width={width}
                  height={height}
                  sizes='(max-width: 640px) 100vw,
                  (max-width: 1280px) 50vw,
                  (max-width: 1536px) 33vw,
                  25vw'
                />
              </Link>
            )
          )}
        </div>
      </main>

      <footer className='flex justify-between gap-2 p-2 max-w-screen-xl self-center m-auto text-center text-white/80 sm:p-6'>
        <a
          className='block'
          href={config.twitterUrl}
          target='_blank'
          rel='noopener noreferrer'
        >
          {config.copyright}
        </a>

        <div>{config.madeWithLove}</div>

        <div className={styles.social}>
          <a
            className={cs(styles.twitter, styles.action)}
            href={config.twitterUrl}
            title={`Twitter ${config.twitter}`}
            target='_blank'
            rel='noopener noreferrer'
          >
            <TwitterIcon />
          </a>

          <a
            className={cs(styles.github, styles.action)}
            href={config.githubRepoUrl}
            title='View source on GitHub'
            target='_blank'
            rel='noopener noreferrer'
          >
            <GitHub />
          </a>
        </div>
      </footer>
    </>
  )
}

export default Home

export async function getStaticProps() {
  const results = await cloudinary.v2.search
    .expression(`folder:${process.env.CLOUDINARY_FOLDER}/*`)
    .sort_by('public_id', 'desc')
    .max_results(config.maxImages)
    .execute()
  const reducedResults: ImageProps[] = []

  let i = 0
  for (const result of results.resources) {
    reducedResults.push({
      id: i,
      width: result.width,
      height: result.height,
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
