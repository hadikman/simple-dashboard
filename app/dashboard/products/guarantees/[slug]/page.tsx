import React from 'react'

import { queryGuaranteesProps, UpdateGuaranteePage } from '@/views/guarantee'

import { Spinner } from '@/components/ui/spinner'

async function getGuaranteesProps() {
  return await queryGuaranteesProps({ name: true, slug: true })
}

export async function generateStaticParams() {
  const guaranteesProps = await getGuaranteesProps()

  if (guaranteesProps.success) {
    const { guarantees } = guaranteesProps
    if (guarantees.length > 0) {
      return guarantees.map(item => ({ slug: item.slug }))
    }
  }

  return null
}

export async function generateMetadata({
  params,
}: PageProps<'/dashboard/products/guarantees/[slug]'>) {
  const { slug } = await params
  const guaranteesProps = await getGuaranteesProps()

  if (guaranteesProps.success) {
    const guarantee = guaranteesProps.guarantees.find(f => f.slug === slug)

    return {
      title: 'Guarantee: ' + guarantee?.name,
    }
  }

  return {
    title: 'Unknown Guarantee',
  }
}

export default function Guarantee({
  params,
}: PageProps<'/dashboard/products/guarantees/[slug]'>) {
  const { slug } = React.use(params)

  return (
    <React.Suspense fallback={<Spinner />}>
      <UpdateGuaranteePage slug={slug} />
    </React.Suspense>
  )
}
