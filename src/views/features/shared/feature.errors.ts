import type { TFeatureErrorCode } from '../'

type ErrorConfig = {
  server: string
  client: string
  code: TFeatureErrorCode
}

export const featureErrors = {
  FEATURE_EXISTS: {
    server: 'Feature Name already exists in database',
    client: 'This Feature is already in use. Please choose a different one.',
    code: 'FEATURE_EXISTS',
  },
  CREATE_FAILURE: {
    server: 'Failed to create new feature in database',
    client: 'Could not add the feature. Please try again.',
    code: 'CREATE_FAILURE',
  },
  EMPTY_FEATURES: {
    server: 'No features found in database',
    client: 'No Features To Display',
    code: 'EMPTY_FEATURES',
  },
  DELETE_FAILURE: {
    server: 'Failed to delete feature from database',
    client: 'Could not delete the feature. Please try again.',
    code: 'DELETE_FAILURE',
  },
  NOT_FOUND_FEATURES_PROPS: {
    server: 'Feature properties not found',
    client: 'Feature properties not found',
    code: 'NOT_FOUND_FEATURES_PROPS',
  },
  NOT_FOUND_FEATURE: {
    server: 'Feature not found',
    client: 'Feature not found',
    code: 'NOT_FOUND_FEATURE',
  },
  DUPLICATE_PROP: {
    server: 'Feature value already exists in database',
    client: 'The value is already in use.',
    code: 'DUPLICATE_PROP',
  },
  UPDATE_FAILURE: {
    server: 'Failed to update feature',
    client: 'Could not update the feature. Please try again.',
    code: 'UPDATE_FAILURE',
  },
  VALUE_EXISTS: {
    server: 'Feature Value already exists in database',
    client: 'This value is already in use. Please choose a different one.',
    code: 'VALUE_EXISTS',
  },
  ADD_VALUE_FAILURE: {
    server: 'Failed to add new value in database',
    client: 'Could not add the value. Please try again.',
    code: 'ADD_VALUE_FAILURE',
  },
  UPDATE_VALUE_FAILURE: {
    server: 'Failed to update value in database',
    client: 'Could not update the value. Please try again.',
    code: 'UPDATE_VALUE_FAILURE',
  },
  DELETE_VALUE_FAILURE: {
    server: 'Failed to delete value in database',
    client: 'Could not delete the value. Please try again.',
    code: 'DELETE_VALUE_FAILURE',
  },
} satisfies Record<TFeatureErrorCode, ErrorConfig>
