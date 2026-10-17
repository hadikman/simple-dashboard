export { AddProductPage } from './features/AddProduct/AddProductPage'

export { UpdateProductPage } from './features/UpdateProduct/UpdateProductPage'

export { ViewProductsPage } from './features/ViewProducts/ViewProductsPage'

export { NewProductMediaModalSlot } from './shared/components/slots/NewProductMediaModalSlot'
export { ProductMediaModalSlot } from './shared/components/slots/ProductMediaModalSlot'

export { queryProducts } from './shared/queries/query-products'
export { queryProductsForLinking } from './shared/queries/query-products-for-linking'
export { queryProductsProps } from './shared/queries/query-products-props'

export {
  CURRENCY_OPTIONS,
  LOCALS_MAP,
  type CurrencyCode,
} from './shared/product.constants'
export type {
  PriceItem,
  PricePropSchema,
  Prices,
  ProductFormT,
} from './shared/product.schema'
export * from './shared/product.types'
export { useLocalizedPrice } from './shared/use-localized-price'
