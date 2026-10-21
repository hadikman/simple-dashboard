import React from 'react'

import { type TPostLookupResponseWithSubRowsData } from './view-posts.types'

import { postErrors, type TPostLookupResponse } from '../../shared'

import { EmptyView } from '@/components/empty-view'
import { AllPostsTable } from './components/AllPostsTable'
import { queryPosts } from './queries/query-posts'

export function ViewPostsPage() {
  const postsData = React.use(queryPosts({ type: 'published' }))
  const postsDraftData = React.use(queryPosts({ type: 'draft' }))

  const isPostsData = postsData.success
  const isPostsDraftData = postsDraftData.success
  const isAllPostsTypesData = isPostsData || isPostsDraftData

  if (!isAllPostsTypesData) {
    return (
      <EmptyView
        title={
          !isPostsData && postsData?.errors?.code
            ? postErrors[postsData.errors.code].client
            : ''
        }
        featureName="post"
        formName="add new post"
      />
    )
  }

  const PD = isPostsData ? postsData.posts : []
  const PDD = isPostsDraftData ? postsDraftData.posts : []

  const draftGroupIdsMap = new Map<string, TPostLookupResponse>()
  PDD.forEach(p => draftGroupIdsMap.set(p.post_group_id, p))

  const postsWithDraftData: TPostLookupResponseWithSubRowsData = PD.map(p => {
    const isDraftedOfPublishedVersion = p.is_published
    const pdd = draftGroupIdsMap.get(p.post_group_id)

    // Return Audit version
    if (!isDraftedOfPublishedVersion && pdd) {
      return pdd
    }

    // For Expanded Row (has the same changes into columns.tsx at title and status):
    // If subRows has published version the "subRows: [p]"
    // If subRows has draft version the "subRows: [pdd]"
    if (pdd) {
      return { ...p, subRows: [pdd] }
    }

    return p
  })

  return <AllPostsTable postsData={postsWithDraftData} />
}
