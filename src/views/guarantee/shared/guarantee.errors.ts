import type { TGuaranteeErrorCode } from './'

type ErrorConfig = {
  server: string
  client: string
  code: TGuaranteeErrorCode
}

export const guaranteeErrors = {
  GUARANTEE_EXISTS: {
    server: 'Guarantee Name already exists in database',
    client: 'This guarantee is already in use. Please choose a different one.',
    code: 'GUARANTEE_EXISTS',
  },
  CREATE_FAILURE: {
    server: 'Failed to create new guarantee in database',
    client: 'Could not add the guarantee. Please try again.',
    code: 'CREATE_FAILURE',
  },
  EMPTY_GUARANTEES: {
    server: 'No guarantees found in database',
    client: 'No Guarantees To Display',
    code: 'EMPTY_GUARANTEES',
  },
  DELETE_FAILURE: {
    server: 'Failed to delete guarantee from database',
    client: 'Could not delete the guarantee. Please try again.',
    code: 'DELETE_FAILURE',
  },
  NOT_FOUND_GUARANTEES_PROPS: {
    server: 'Guarantee properties not found',
    client: 'Guarantee properties not found',
    code: 'NOT_FOUND_GUARANTEES_PROPS',
  },
  NOT_FOUND_GUARANTEE: {
    server: 'Guarantee not found',
    client: 'Guarantee not found',
    code: 'NOT_FOUND_GUARANTEE',
  },
  DUPLICATE_PROP: {
    server: 'Guarantee value already exists in database',
    client: 'The value is already in use.',
    code: 'DUPLICATE_PROP',
  },
  UPDATE_FAILURE: {
    server: 'Failed to update guarantee',
    client: 'Could not update the guarantee. Please try again.',
    code: 'UPDATE_FAILURE',
  },
} satisfies Record<TGuaranteeErrorCode, ErrorConfig>
