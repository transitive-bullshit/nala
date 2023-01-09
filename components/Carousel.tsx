import * as React from 'react'
import Image from 'next/image'
import { useRouter } from 'next/router'
import useKeypress from 'react-use-keypress'

import type { ImageProps } from '@/lib/types'
import { useLastViewedPhoto } from '@/lib/useLastViewedPhoto'

import SharedModal from './SharedModal'

export default function Carousel({
  index,
  currentPhoto
}: {
  index: number
  currentPhoto: ImageProps
}) {
  const router = useRouter()
  const [, setLastViewedPhoto] = useLastViewedPhoto()

  const closeModal = React.useCallback(() => {
    setLastViewedPhoto(currentPhoto.id)
    router.push('/', undefined, { shallow: true })
  }, [currentPhoto.id, router, setLastViewedPhoto])

  const changePhotoId = React.useCallback((newVal: number) => {
    return newVal
  }, [])

  useKeypress('Escape', () => {
    closeModal()
  })

  return (
    <div className='fixed inset-0 flex items-center justify-center'>
      <button
        className='absolute inset-0 z-30 cursor-default bg-black backdrop-blur-2xl'
        onClick={closeModal}
      >
        <Image
          src={currentPhoto.blurDataUrl}
          className='pointer-events-none h-full w-full'
          alt='blurred background'
          priority={true}
          fill
        />
      </button>

      <SharedModal
        index={index}
        currentPhoto={currentPhoto}
        changePhotoId={changePhotoId}
        closeModal={closeModal}
        navigation={false}
      />
    </div>
  )
}
