import { type TOfferErrorCode } from './'

type ErrorConfig = {
  server: string
  client: string
  code: TOfferErrorCode
}

export const offerErrors = {
  OFFER_EXISTS: {
    server: 'Offer Name already exists in database',
    client: 'This offer is already in use. Please choose a different one.',
    code: 'OFFER_EXISTS',
  },
  CREATE_FAILURE: {
    server: 'Failed to create new offer in database',
    client: 'Could not add the offer. Please try again.',
    code: 'CREATE_FAILURE',
  },
  EMPTY_OFFERS: {
    server: 'No offers found in database',
    client: 'No Offers To Display',
    code: 'EMPTY_OFFERS',
  },
  DELETE_FAILURE: {
    server: 'Failed to delete offer from database',
    client: 'Could not delete the offer. Please try again.',
    code: 'DELETE_FAILURE',
  },
  NOT_FOUND_OFFERS_PROPS: {
    server: 'Offer properties not found',
    client: 'Offer properties not found',
    code: 'NOT_FOUND_OFFERS_PROPS',
  },
  NOT_FOUND_OFFER: {
    server: 'Offer not found',
    client: 'Offer not found',
    code: 'NOT_FOUND_OFFER',
  },
  DUPLICATE_PROP: {
    server: 'Offer value already exists in database',
    client: 'The value is already in use.',
    code: 'DUPLICATE_PROP',
  },
  UPDATE_FAILURE: {
    server: 'Failed to update offer',
    client: 'Could not update the offer. Please try again.',
    code: 'UPDATE_FAILURE',
  },
} satisfies Record<TOfferErrorCode, ErrorConfig>
