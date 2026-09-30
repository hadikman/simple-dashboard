import { ApiRefType, BUTTON_ACTIVE_CLASSES } from '.'

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import {
  IconArrowNarrowLeft,
  IconPhoto,
  IconPlayerEject,
} from '@tabler/icons-react'
import { $getNodeByKey, $getSelection, $isNodeSelection } from 'lexical'
import Link from 'next/link'
import {
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react'

import { HOME_DIRECTORY, useMediaStore, useMetadataStore } from '@/views/media'

import { Button } from '@/components/ui/button'
import { ButtonGroup } from '@/components/ui/button-group'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useModalStore } from '@/store/zustand/modal/modal-stores-provider'

import { DialogComponent } from '../../components/dialog.component'
import {
  INSERT_IMAGE_COMMAND,
  InsertImagePayload,
} from '../../extensions/image/images.extension'
import {
  $isImageNode,
  ImageNodeAlignment,
  ImageNodeType,
} from '../../nodes/image/image.node'
import { useEditorStore } from '../../store/zustand/editor-store-provider'
import { MODAL_STORE_KEY } from '../draggable-block/draggable-block.plugin'

type InsertImageProps = { apiRef: ApiRefType }

export function InsertImage({ apiRef }: InsertImageProps) {
  const [editor] = useLexicalComposerContext()
  const [mode, setMode] = useState<null | ImageNodeType>(null)
  const [show, setShow] = useState(false)
  // Track the node being edited
  const [editingNodeKey, setEditingNodeKey] = useState<string | null>(null)
  const [initialData, setInitialData] = useState<InsertImagePayload | null>(
    null,
  )

  const mediaKey = useMetadataStore(state => state.mediaKey)
  const mediaOpen = useMediaStore(mediaKey, state => state.mediaOpen)
  const setMediaOpen = useMediaStore(mediaKey, state => state.setMediaOpen)

  const modalKey = MODAL_STORE_KEY
  const component = useModalStore(modalKey, state => state.component)
  const setComponent = useModalStore(modalKey, state => state.setComponent)

  const open = show || component === 'image'
  const [isImageSelected, setIsImageSelected] = useState(false)

  const $updateToolbar = useCallback(() => {
    const selection = $getSelection()
    if ($isNodeSelection(selection)) {
      const nodes = selection.getNodes()
      setIsImageSelected(nodes.length === 1 && $isImageNode(nodes[0]))
    } else {
      setIsImageSelected(false)
    }
  }, [])

  useImperativeHandle(apiRef, () => ({
    $updateToolbar,
  }))

  const onClickTrigger = () => {
    editor.getEditorState().read(() => {
      const selection = $getSelection()
      if ($isNodeSelection(selection)) {
        const nodes = selection.getNodes()
        if (nodes.length === 1 && $isImageNode(nodes[0])) {
          const node = nodes[0]
          setEditingNodeKey(node.getKey())
          setInitialData({
            altText: node.getAltText(),
            src: node.getSrc(),
            imageType: node.getImageType(),
            alignment: node.getAlignment(),
            width: node.__width === 'inherit' ? undefined : node.__width,
            height: node.__height === 'inherit' ? undefined : node.__height,
          })
          // Automatically set mode based on whether src is a DataURL (file) or URL
          setMode(node.getImageType())
        }
      }
    })
    setShow(true)
    setComponent(null)
  }

  const onClickImageInsertion = (payload: InsertImagePayload) => {
    if (editingNodeKey) {
      editor.update(() => {
        const node = $getNodeByKey(editingNodeKey)
        if ($isImageNode(node)) {
          node.$update(payload)
        }
      })
    } else {
      editor.dispatchCommand(INSERT_IMAGE_COMMAND, payload)
    }
    resetStates()
  }

  const onClickBack = () => {
    setMode(null)
    setInitialData(null)
    setMediaOpen(false)
  }

  const resetStates = () => {
    setShow(false)
    setMode(null)
    setEditingNodeKey(null)
    setInitialData(null)
    setMediaOpen(false)
    setComponent(null)
  }

  return (
    <DialogComponent
      open={open}
      onOpenChange={open => {
        if (mediaOpen) return

        if (!open) {
          resetStates()
        }
      }}
      renderTrigger={
        <Button
          className={isImageSelected ? BUTTON_ACTIVE_CLASSES : undefined}
          size="icon"
          variant="outline"
          title={isImageSelected ? 'Edit Image' : 'Insert Image'}
          onClick={onClickTrigger}
        >
          <IconPhoto />
        </Button>
      }
      contentKey={mode === 'file' ? 'file-layer' : 'normal-layer'}
      contentClassname="has-[form[data-mode]]:w-fit"
      renderContent={
        <FieldSet>
          <FieldLegend className="flex w-full justify-between">
            {isImageSelected ? 'Edit Image' : 'Insert Image'}
            <Button
              size="icon-sm"
              variant="ghost"
              disabled={!mode}
              onClick={onClickBack}
            >
              <IconArrowNarrowLeft />
            </Button>
          </FieldLegend>

          <FieldSeparator />

          {!mode && (
            <FieldGroup>
              <Field orientation="responsive">
                <Button size="sm" onClick={() => setMode('file')}>
                  File
                </Button>
                <Button size="sm" onClick={() => setMode('url')}>
                  URL
                </Button>
              </Field>
            </FieldGroup>
          )}

          {mode === 'file' && (
            <InsertImageUploaded
              initialData={initialData}
              mediaKey={mediaKey}
              onClick={onClickImageInsertion}
            />
          )}
          {mode === 'url' && (
            <InsertImageUri
              initialData={initialData}
              onClick={onClickImageInsertion}
            />
          )}
        </FieldSet>
      }
    />
  )
}

function InsertImageUploaded({
  initialData,
  mediaKey: key,
  onClick,
}: {
  initialData?: InsertImagePayload | null
  mediaKey: string
  onClick: (payload: InsertImagePayload) => void
}) {
  const [source, setSource] = useState(initialData?.src || '')

  const mediaPath = useMetadataStore(state => state.mediaPath)
  const thumbnailImages = useMediaStore(key!, state => state.thumbnailImages)
  const setThumbnailImages = useMediaStore(
    key,
    state => state.setThumbnailImages,
  )

  const groupId = useEditorStore(s => s.groupId)
  const slug = useEditorStore(s => s.slug)
  const status = useEditorStore(s => s.status)

  const fullName = source.replace(`/${HOME_DIRECTORY}/`, '')
  const imageFullName = thumbnailImages[0] || fullName
  const imageSrc = imageFullName ? `/${HOME_DIRECTORY}/${imageFullName}` : ''

  const params = new URLSearchParams()
  params.set('selection', 'single')
  params.set('key', key)
  // The following three params required if need to navigate back to dynamic route that opened the media (static route don't need these params)
  if (groupId) params.set('group-id', groupId)
  if (slug) params.set('slug', slug)
  if (status) params.set('status', status)

  const href = `${mediaPath}?${params.toString()}`

  return (
    <ImageForm
      formId="file-image-form"
      formDataMode="file"
      initialData={initialData}
      src={imageSrc}
      imageType="file"
      onSubmit={payload => {
        onClick(payload)
        setSource('')
        setThumbnailImages('')
      }}
      renderSourceField={
        <Field>
          <FieldLabel htmlFor="file-src">
            Source {initialData && '(Replace)'}
          </FieldLabel>
          <ButtonGroup>
            <Input
              id="file-src"
              name="src"
              value={imageFullName}
              placeholder="Pick a file from media"
              onChange={e => setSource(e.target.value)}
            />
            <Button asChild variant="outline" title="Pick File">
              <Link href={href}>
                <IconPlayerEject />
              </Link>
            </Button>
          </ButtonGroup>
        </Field>
      }
    />
  )
}

function InsertImageUri({
  onClick,
  initialData,
}: {
  onClick: (payload: InsertImagePayload) => void
  initialData?: InsertImagePayload | null
}) {
  const [src, setSrc] = useState(initialData?.src || '')

  return (
    <ImageForm
      formId="url-image-form"
      formDataMode="url"
      initialData={initialData}
      src={src}
      imageType="url"
      onSubmit={payload => {
        onClick(payload)
        setSrc('')
      }}
      renderSourceField={
        <Field>
          <FieldLabel htmlFor="url-src">URL</FieldLabel>
          <Input
            id="url-src"
            name="url"
            placeholder="https://..."
            value={src}
            onChange={e => setSrc(e.target.value)}
          />
        </Field>
      }
    />
  )
}

const ALIGNMENT = [
  { name: 'Left', value: 'left' },
  { name: 'Middle', value: 'middle' },
  { name: 'Right', value: 'right' },
]
type ImageFormProps = {
  formId: string
  formDataMode?: string
  formClassName?: string
  initialData?: InsertImagePayload | null
  src: string
  imageType: ImageNodeType
  renderSourceField: React.ReactNode
  onSubmit: (payload: InsertImagePayload) => void
}
function ImageForm({
  formId,
  formDataMode,
  formClassName,
  initialData,
  src,
  imageType,
  renderSourceField,
  onSubmit,
}: ImageFormProps) {
  const [altText, setAltText] = useState(initialData?.altText || '')
  const [alignment, setAlignment] = useState<ImageNodeAlignment>(
    initialData?.alignment || 'left',
  )

  const naturalWidthRef = useRef<number>(0)
  const naturalHeightRef = useRef<number>(0)
  const lastWidthRef = useRef<number | undefined>(undefined)
  const lastHeightRef = useRef<number | undefined>(undefined)

  const [dimensionMode, setDimensionMode] = useState<'auto' | 'manual'>('auto')
  const [dimensionModeResolved, setDimensionModeResolved] = useState(false)

  const [width, setWidth] = useState<number>(
    initialData?.width && typeof initialData.width === 'number'
      ? initialData.width
      : 0,
  )
  const [height, setHeight] = useState<number>(
    initialData?.height && typeof initialData.height === 'number'
      ? initialData.height
      : 0,
  )
  const [lockAspectRatio, setLockAspectRatio] = useState(true)
  const [aspectRatio, setAspectRatio] = useState<number | null>(null)

  const isAuto = dimensionMode === 'auto'

  // Load natural dimensions when src changes
  useEffect(() => {
    if (!src) return

    const img = new Image()
    img.src = src
    img.onload = () => {
      const { naturalWidth, naturalHeight } = img
      const ratio = naturalWidth / naturalHeight
      setAspectRatio(ratio)

      naturalWidthRef.current = naturalWidth
      naturalHeightRef.current = naturalHeight

      if (!dimensionModeResolved) {
        const hasInitialDimensions =
          initialData?.width &&
          typeof initialData.width === 'number' &&
          initialData?.height &&
          typeof initialData.height === 'number'

        if (hasInitialDimensions) {
          const isNaturalSize =
            initialData.width === naturalWidth &&
            initialData.height === naturalHeight

          if (isNaturalSize) {
            setDimensionMode('auto')
            setWidth(naturalWidth)
            setHeight(naturalHeight)
          } else {
            setDimensionMode('manual')
          }
        } else {
          setDimensionMode('auto')
          setWidth(naturalWidth)
          setHeight(naturalHeight)
        }

        setDimensionModeResolved(true)
      } else {
        setDimensionMode('auto')
        setWidth(naturalWidth)
        setHeight(naturalHeight)
        lastWidthRef.current = undefined
        lastHeightRef.current = undefined
      }
    }
  }, [src])

  function onWidthChange(value: string) {
    const w = parseInt(value, 10) || 0
    setWidth(w)

    if (lockAspectRatio && aspectRatio && w > 0) {
      setHeight(Math.round(w / aspectRatio))
    }
  }

  function onHeightChange(value: string) {
    const h = parseInt(value, 10) || 0
    setHeight(h)

    if (lockAspectRatio && aspectRatio && h > 0) {
      setWidth(Math.round(h * aspectRatio))
    }
  }

  function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault()

    onSubmit({
      altText,
      src,
      imageType,
      alignment,
      width: isAuto ? naturalWidthRef.current : width,
      height: isAuto ? naturalHeightRef.current : height,
    })
  }

  return (
    <form
      id={formId}
      data-mode={formDataMode}
      className={formClassName}
      onSubmit={handleSubmit}
    >
      <FieldGroup className="w-md">
        <FieldGroup>
          <Field orientation="horizontal">
            {renderSourceField}

            <Field>
              <FieldLabel htmlFor={`${formId}-alt`}>Alt</FieldLabel>
              <Input
                id={`${formId}-alt`}
                name="alt"
                placeholder="Alt text"
                value={altText}
                onChange={e => setAltText(e.target.value)}
              />
            </Field>
          </Field>

          <Field orientation="horizontal">
            <Field>
              <FieldLabel htmlFor={`${formId}-alignment`}>Alignment</FieldLabel>
              <Select
                value={alignment}
                onValueChange={(value: ImageNodeAlignment) =>
                  setAlignment(value)
                }
              >
                <SelectTrigger id={`${formId}-alignment`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ALIGNMENT.map(({ name, value }) => (
                    <SelectItem key={value} value={value}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field>
              <FieldLabel htmlFor={`${formId}-dimension-mode`}>
                Dimensions
              </FieldLabel>
              <Select
                value={dimensionMode}
                onValueChange={(value: 'auto' | 'manual') => {
                  setDimensionMode(value)
                  if (value === 'auto') {
                    lastWidthRef.current = width
                    lastHeightRef.current = height
                    setWidth(naturalWidthRef.current)
                    setHeight(naturalHeightRef.current)
                  } else {
                    if (lastWidthRef.current && lastHeightRef.current) {
                      setWidth(lastWidthRef.current)
                      setHeight(lastHeightRef.current)
                    }
                  }
                }}
              >
                <SelectTrigger id={`${formId}-dimension-mode`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">Original</SelectItem>
                  <SelectItem value="manual">Manual</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </Field>
        </FieldGroup>

        <Field orientation="horizontal">
          <Field>
            <FieldLabel htmlFor={`${formId}-width`}>Width</FieldLabel>
            <Input
              id={`${formId}-width`}
              type="number"
              min={1}
              value={width || ''}
              placeholder="px"
              disabled={isAuto}
              onChange={e => onWidthChange(e.target.value)}
            />
          </Field>

          <Field>
            <FieldLabel htmlFor={`${formId}-height`}>Height</FieldLabel>
            <Input
              id={`${formId}-height`}
              type="number"
              min={1}
              value={height || ''}
              placeholder="px"
              disabled={isAuto}
              onChange={e => onHeightChange(e.target.value)}
            />
          </Field>
        </Field>

        <Field orientation="horizontal">
          <Checkbox
            id={`${formId}-lock-aspect-ratio`}
            checked={lockAspectRatio}
            disabled={isAuto}
            onCheckedChange={e => setLockAspectRatio(!!e)}
          />
          <FieldLabel htmlFor={`${formId}-lock-aspect-ratio`}>
            Lock aspect ratio
          </FieldLabel>
        </Field>

        <Field orientation="horizontal">
          <Button form={formId} disabled={!src}>
            {initialData ? 'Update' : 'Confirm'}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  )
}
