'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import React from 'react'

import { useMediaStore } from '@/views/media'

import { Dialog } from '@/components/ui/dialog'

export function DialogSlot({ children }: { children: React.ReactNode }) {
  const { back } = useRouter()
  const [open, setOpen] = React.useState(true)

  const searchParams = useSearchParams()
  const key = searchParams.get('key')
  const setMediaOpen = useMediaStore(key!, state => state.setMediaOpen)

  React.useEffect(() => {
    setMediaOpen(true)
  }, [])

  return (
    <Dialog
      open={open}
      onOpenChange={openState => {
        setOpen(!openState)

        if (!openState) {
          back()
          setMediaOpen(false)
        }
      }}
    >
      {children}
    </Dialog>
  )
}
