import { Metadata } from 'next'

import { AddViewGuaranteesPage } from '@/views/guarantee'

export const metadata: Metadata = {
  title: 'Guarantees',
}

export default function Guarantees() {
  return <AddViewGuaranteesPage />
}
