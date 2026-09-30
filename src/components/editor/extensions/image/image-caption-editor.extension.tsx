import { NestedEditorExtension } from '@lexical/extension'
import { HashtagExtension } from '@lexical/hashtag'
import { HistoryExtension } from '@lexical/history'
import { LinkExtension } from '@lexical/link'
import { ReactExtension } from '@lexical/react/ReactExtension'
import { ReactProviderExtension } from '@lexical/react/ReactProviderExtension'
import { RichTextExtension } from '@lexical/rich-text'
import { configExtension, defineExtension } from 'lexical'

import { ImageContentEditable } from '../../components/image-content-editable'

export const ImageCaptionEditorExtension = defineExtension({
  // Skip the default empty-paragraph initializer. In collab mode
  // CollaborationPlugin's bootstrap only runs `initializeEditor` when
  // the Lexical root is empty, so a pre-seeded paragraph would prevent
  // the caption editor from ever exporting its state to Yjs. In
  // non-collab mode RichText's normalization adds a paragraph as soon
  // as the editor mounts.
  $initialEditorState: null,
  dependencies: [
    // FIXME - The current playground has tests that assume that image captions don't have shared history
    // SharedHistoryExtension,
    HistoryExtension,
    NestedEditorExtension,
    ReactProviderExtension,
    RichTextExtension,
    HashtagExtension,
    LinkExtension,
    configExtension(ReactExtension, {
      contentEditable: (
        <ImageContentEditable
          placeholder="Enter a caption..."
          placeholderClassName="ImageNode__placeholder"
          className="ImageNode__contentEditable"
        />
      ),
    }),
  ],
  name: '@lexical/ImageNodeCaption',
  namespace: 'ImageNodeCaption',
})
