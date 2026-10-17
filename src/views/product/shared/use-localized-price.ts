import { useSelector } from '@tanstack/react-form'
import React from 'react'

import { type ProductFormT } from './'

import { CurrencyCode, LOCALS_MAP } from './product.constants'

type UseLocalizedProps = {
  form: ProductFormT
  price: number
}

export function useLocalizedPrice({ form, price }: UseLocalizedProps) {
  const selectedCurrency = useSelector(
    form.store,
    s => s.values.pricing.currency,
  ) as CurrencyCode

  return React.useMemo(() => {
    const config = LOCALS_MAP[selectedCurrency]
    const p = isNaN(price) ? 0 : price

    if (!config) return p.toString()

    try {
      return new Intl.NumberFormat(config.locale, {
        style: 'currency',
        currency: config.currency,
        trailingZeroDisplay: 'stripIfInteger',
      }).format(p)
    } catch (e) {
      console.error('Formatting error', e)
      return p.toString()
    }
  }, [price, selectedCurrency])
}
