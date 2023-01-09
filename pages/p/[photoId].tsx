import type { GetStaticProps, NextPage } from 'next'
import { useRouter } from 'next/router'

import Carousel from '@/components/Carousel'
import { PageHead } from '@/components/PageHead'
import getResults from '@/lib/cachedImages'
import cloudinary from '@/lib/cloudinary'
import getBase64ImageUrl from '@/lib/generateBlurPlaceholder'
import type { ImageProps } from '@/lib/types'

const Home: NextPage = ({ currentPhoto }: { currentPhoto: ImageProps }) => {
  const router = useRouter()
  const { photoId } = router.query
  const index = Number(photoId)

  const currentPhotoUrl = `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/c_scale,w_2560/${currentPhoto.public_id}.${currentPhoto.format}`

  return (
    <>
      <PageHead imageUrl={currentPhotoUrl} />

      <main className='mx-auto max-w-[1960px] p-4'>
        <Carousel currentPhoto={currentPhoto} index={index} />
      </main>
    </>
  )
}

export default Home

export const getStaticProps: GetStaticProps = async (context) => {
  const results = await getResults()

  const reducedResults: ImageProps[] = []
  let i = 0
  for (const result of results.resources) {
    reducedResults.push({
      id: i,
      height: result.height,
      width: result.width,
      public_id: result.public_id,
      format: result.format
    })
    i++
  }

  const currentPhoto = reducedResults.find(
    (img) => img.id === Number(context.params.photoId)
  )
  currentPhoto.blurDataUrl = await getBase64ImageUrl(currentPhoto)

  return {
    props: {
      currentPhoto: currentPhoto
    }
  }
}

export async function getStaticPaths() {
  const results = await cloudinary.v2.search
    .expression(`folder:${process.env.CLOUDINARY_FOLDER}/*`)
    .sort_by('public_id', 'desc')
    .max_results(400)
    .execute()

  const fullPaths = []
  for (let i = 0; i < results.resources.length; i++) {
    fullPaths.push({ params: { photoId: i.toString() } })
  }

  return {
    paths: fullPaths,
    fallback: false
  }
}
