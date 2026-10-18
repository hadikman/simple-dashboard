import { Metadata } from 'next'

import { AddViewOffersPage } from '@/views/offer'

export const metadata: Metadata = {
  title: 'Offers',
}

export default function Offers() {
  return <AddViewOffersPage />
}
