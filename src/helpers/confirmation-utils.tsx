import React from 'react'
import { toast } from 'sonner'

export async function deleteConfirmation(
  item: string = 'Item',
  description?: React.ReactNode,
) {
  return new Promise(resolve => {
    toast(`Deleting ${item}`, {
      description: (
        <div className="grid">
          <span>Are you sure you want to delete?</span>
          <span>You won’t be able to undo this action.</span>
          {description}
        </div>
      ),
      actionButtonStyle: { marginInlineStart: '0px' },
      action: {
        label: 'Yes',
        onClick: () => resolve(true),
      },
      cancel: {
        label: 'No',
        onClick: () => resolve(false),
      },
      onAutoClose: () => resolve(false),
      onDismiss: () => resolve(false),
    })
  })
}
