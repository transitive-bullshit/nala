import * as React from 'react'
import { Dialog } from '@headlessui/react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/router'
import useKeypress from 'react-use-keypress'

import type { ImageProps } from '@/lib/types'

import SharedModal from './SharedModal'

export default function Modal({
  images,
  onClose
}: {
  images: ImageProps[]
  onClose?: () => void
}) {
  const overlayRef = React.useRef()
  const router = useRouter()

  const { photoId } = router.query
  const index = Number(photoId)

  const [direction, setDirection] = React.useState(0)
  const [curIndex, setCurIndex] = React.useState(index)

  const handleClose = React.useCallback(() => {
    router.push('/', undefined, { shallow: true })
    onClose()
  }, [onClose, router])

  const changePhotoId = React.useCallback(
    (newVal: number) => {
      if (newVal > index) {
        setDirection(1)
      } else {
        setDirection(-1)
      }

      setCurIndex(newVal)

      router.push(
        {
          query: { photoId: newVal }
        },
        `/p/${newVal}`,
        { shallow: true }
      )
    },
    [index, router]
  )

  useKeypress('ArrowRight', () => {
    if (index + 1 < images.length) {
      changePhotoId(index + 1)
    }
  })

  useKeypress('ArrowLeft', () => {
    if (index > 0) {
      changePhotoId(index - 1)
    }
  })

  return (
    <Dialog
      static
      open={true}
      onClose={handleClose}
      initialFocus={overlayRef}
      className='fixed inset-0 z-10 flex items-center justify-center'
    >
      <Dialog.Overlay
        ref={overlayRef}
        as={motion.div}
        key='backdrop'
        className='fixed inset-0 z-30 bg-black/70 backdrop-blur-2xl'
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      />

      <SharedModal
        index={curIndex}
        direction={direction}
        images={images}
        changePhotoId={changePhotoId}
        closeModal={handleClose}
        navigation={true}
      />
    </Dialog>
  )
}
