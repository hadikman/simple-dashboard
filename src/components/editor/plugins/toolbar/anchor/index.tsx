import { ApiRefType, BUTTON_ACTIVE_CLASSES } from '..'

import { $isLinkNode, LinkNode, TOGGLE_LINK_COMMAND } from '@lexical/link'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { IconAnchor, IconLink } from '@tabler/icons-react'
import {
  $createTextNode,
  $findMatchingParent,
  $getRoot,
  $getSelection,
  $isElementNode,
  $isNodeSelection,
  $isRangeSelection,
  LexicalNode,
} from 'lexical'
import { useCallback, useImperativeHandle, useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { ButtonGroup } from '@/components/ui/button-group'
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DialogComponent } from '../../../components/dialog.component'
import { $createAnchorNode, $isAnchorNode } from '../../../nodes/anchor.node'
import { $isImageNode } from '../../../nodes/image/image.node'
import { sanitizeUrl } from './utils'

type AnchorType = {
  name: string
  id: string
}
type AnchorProps = { apiRef: ApiRefType }

export function Anchor({ apiRef }: AnchorProps) {
  const [editor] = useLexicalComposerContext()

  // Anchor state
  const [isAnchor, setIsAnchor] = useState(false)
  const [anchorName, setAnchorName] = useState('')

  // Link state
  const [isLink, setIsLink] = useState(false)
  const [linkURL, setLinkURL] = useState('')
  const [linkProtocol, setLinkProtocol] = useState('https')

  // Popover state
  const [showAnchorPopover, setShowAnchorPopover] = useState(false)
  const [showLinkPopover, setShowLinkPopover] = useState(false)

  // Link type: 'url' or 'anchor'
  const [linkType, setLinkType] = useState<'url' | 'anchor'>('url')

  // Available anchors in the document
  const [availableAnchors, setAvailableAnchors] = useState<AnchorType[]>([])

  // Helper: Reset all link/anchor state
  const resetAllState = useCallback(() => {
    setIsLink(false)
    setLinkURL('')
    setIsAnchor(false)
    setAnchorName('')
  }, [])

  // Helper: Parse and apply URL state
  const applyURLState = useCallback((url: string) => {
    const protocolMatch = url.match(/^([a-z]+):\/\//)
    if (protocolMatch) {
      setLinkProtocol(protocolMatch[1])
      setLinkURL(url.replace(/^[a-z]+:\/\//, ''))
      setLinkType('url')
    } else if (url.startsWith('#')) {
      setLinkType('anchor')
      setLinkURL(url.replace('#', ''))
    }
  }, [])

  // Helper: Find link node in image's parent chain
  const findImageLinkNode = useCallback(
    (imageNode: LexicalNode): LinkNode | null => {
      let parent = imageNode.getParent()
      while (parent) {
        if ($isLinkNode(parent)) return parent
        parent = parent.getParent()
      }
      return null
    },
    [],
  )

  // Helper: Find anchor node in parent chain
  const findAnchorInChain = useCallback((startNode: LexicalNode): boolean => {
    let node: LexicalNode | null = startNode
    while (node) {
      if ($isAnchorNode(node)) {
        setIsAnchor(true)
        return true
      }
      node = node.getParent()
    }
    setIsAnchor(false)
    setAnchorName('')
    return false
  }, [])

  const $updateToolbar = useCallback(() => {
    const selection = $getSelection()

    // Handle NodeSelection (images)
    if ($isNodeSelection(selection)) {
      const nodes = selection.getNodes()

      if (nodes.length === 1 && $isImageNode(nodes[0])) {
        const linkNode = findImageLinkNode(nodes[0])

        if (linkNode) {
          setIsLink(true)
          applyURLState(linkNode.getURL())
        } else {
          setIsLink(false)
          setLinkURL('')
        }
      } else {
        resetAllState()
        return
      }

      setIsAnchor(false)
      setAnchorName('')
      return
    }

    // Handle RangeSelection (text)
    if (!$isRangeSelection(selection)) {
      resetAllState()
      return
    }

    const anchorNode = selection.anchor.getNode()

    // Detect link
    const parentLink = $findMatchingParent(anchorNode, $isLinkNode)
    if (parentLink) {
      setIsLink(true)
      applyURLState(parentLink.getURL())
    } else {
      setIsLink(false)
      setLinkURL('')
    }

    // Detect anchor
    findAnchorInChain(anchorNode)
  }, [resetAllState, applyURLState, findImageLinkNode, findAnchorInChain])

  useImperativeHandle(apiRef, () => ({
    $updateToolbar,
  }))

  // Apply anchor - wraps selected text in span with id
  const applyAnchor = useCallback(() => {
    if (!anchorName.trim()) {
      toast.error('Anchor name required', {
        description: 'Please enter a name for the anchor.',
      })
      return
    }

    const anchorId = `anchor-${anchorName.replace(/\s+/g, '-').toLowerCase()}`

    // Check selection before entering editor.update()
    let hasSelection = false

    editor.getEditorState().read(() => {
      const selection = $getSelection()
      if ($isRangeSelection(selection) && !selection.isCollapsed()) {
        hasSelection = true
      }
    })

    if (!hasSelection) {
      toast.error('No text selected', {
        description: 'Select the text you want to turn into an anchor.',
      })
      setShowAnchorPopover(false)
      return
    }

    editor.update(() => {
      const selection = $getSelection()
      if (!$isRangeSelection(selection)) return

      // Check if the ENTIRE selection is inside the SAME anchor
      const startNode = selection.anchor.getNode()
      const endNode = selection.focus.getNode()

      let startAnchor: LexicalNode | null = startNode
      let endAnchor: LexicalNode | null = endNode

      while (startAnchor) {
        if ($isAnchorNode(startAnchor)) break
        startAnchor = startAnchor.getParent()
      }

      while (endAnchor) {
        if ($isAnchorNode(endAnchor)) break
        endAnchor = endAnchor.getParent()
      }

      // Case 1: Selection is fully inside the SAME existing anchor → Update it
      if ($isAnchorNode(startAnchor) && startAnchor === endAnchor) {
        const currentId = startAnchor.getAnchorId()

        // Same name → change the anchor content to only the selected text
        if (currentId === anchorId) {
          const selectedText = selection.getTextContent()
          if (selectedText.length === 0) return

          // Unwrap the anchor first
          const children = startAnchor.getChildren()
          const parent = startAnchor.getParent()
          if (parent) {
            children.forEach(child => parent.append(child))
            startAnchor.remove()
          }

          // Remove the selected text
          selection.removeText()

          // Create new anchor with just the selected text
          const textNode = $createTextNode(selectedText)
          const newAnchor = $createAnchorNode(anchorId)
          newAnchor.append(textNode)
          selection.insertNodes([newAnchor])

          setShowAnchorPopover(false)
          setIsAnchor(true)
          return
        }

        // Different name → check uniqueness then rename
        const existingAnchors = $getAllAnchors()
        const isDuplicate = existingAnchors.some(a => a.id === anchorId)

        if (isDuplicate) {
          toast.error('Name already used', {
            description:
              'Each anchor must have a unique name. Try a different one.',
          })
          return
        }

        // Replace with new anchor name
        const children = startAnchor.getChildren()
        const newAnchor = $createAnchorNode(anchorId)
        children.forEach(child => newAnchor.append(child))
        startAnchor.replace(newAnchor)

        setShowAnchorPopover(false)
        setIsAnchor(true)
        return
      }

      // Case 2: Not fully inside same anchor → create NEW anchor
      // Check uniqueness
      const existingAnchors = $getAllAnchors()
      const isDuplicate = existingAnchors.some(a => a.id === anchorId)

      if (isDuplicate) {
        toast.error('Name already used', {
          description:
            'Each anchor must have a unique name. Try a different one.',
        })
        return
      }

      const selectedText = selection.getTextContent()
      if (selectedText.length === 0) return

      selection.removeText()

      const textNode = $createTextNode(selectedText)
      const newAnchor = $createAnchorNode(anchorId)
      newAnchor.append(textNode)

      selection.insertNodes([newAnchor])

      setShowAnchorPopover(false)
      setIsAnchor(true)
    })
  }, [editor, anchorName])

  const removeAnchor = useCallback(() => {
    editor.update(() => {
      const selection = $getSelection()
      if (!$isRangeSelection(selection)) return

      const node = selection.anchor.getNode()

      // Find parent anchor node
      let anchorNode: LexicalNode | null = node
      while (anchorNode) {
        if ($isAnchorNode(anchorNode)) {
          break
        }
        anchorNode = anchorNode.getParent()
      }

      if (!$isAnchorNode(anchorNode)) return

      // Get the text content
      const textContent = anchorNode.getTextContent()

      // Create a plain text node
      const textNode = $createTextNode(textContent)

      // Replace anchor with plain text
      anchorNode.replace(textNode)

      // Select the new text node
      textNode.select()
    })

    setIsAnchor(false)
    setAnchorName('')
  }, [editor])

  // Apply link
  const applyLink = useCallback(() => {
    let fullURL = ''

    if (linkType === 'url') {
      if (!linkURL.trim()) return
      fullURL = sanitizeUrl(`${linkProtocol}://${linkURL}`)
    } else {
      if (!linkURL.trim()) return
      fullURL = `#${linkURL}`
    }

    editor.dispatchCommand(TOGGLE_LINK_COMMAND, fullURL)
    setShowLinkPopover(false)
  }, [editor, linkType, linkProtocol, linkURL])

  // Remove link
  const removeLink = useCallback(() => {
    editor.dispatchCommand(TOGGLE_LINK_COMMAND, null)
    setShowLinkPopover(false)
    setIsLink(false)
    setLinkURL('')
  }, [editor])

  const handleOpenLinkPopover = useCallback(
    (open: boolean) => {
      setShowLinkPopover(open)

      if (open) {
        editor.read(() => {
          const anchors = $getAllAnchors()
          setAvailableAnchors(anchors)
        })
      }
    },
    [editor],
  )

  const handleOpenAnchorPopover = useCallback(
    (open: boolean) => {
      setShowAnchorPopover(open)

      if (open) {
        // If we're on an anchor, get its current name
        editor.getEditorState().read(() => {
          const selection = $getSelection()
          if (!$isRangeSelection(selection)) return

          const node = selection.anchor.getNode()
          let anchorNode: LexicalNode | null = node

          while (anchorNode) {
            if ($isAnchorNode(anchorNode)) {
              const id = anchorNode.getAnchorId()
              // Extract name from "anchor-some-name"
              const name = id.replace(/^anchor-/, '').replace(/-/g, ' ')
              setAnchorName(name)
              break
            }
            anchorNode = anchorNode.getParent()
          }
        })
      }
    },
    [editor],
  )

  return (
    <ButtonGroup>
      {/* Anchor Button */}
      <DialogComponent
        open={showAnchorPopover}
        onOpenChange={handleOpenAnchorPopover}
        renderTrigger={
          <Button
            className={isAnchor ? BUTTON_ACTIVE_CLASSES : ''}
            size="icon"
            variant="outline"
            title={isAnchor ? 'Update/Remove Anchor' : 'Add Anchor'}
            onClick={() => setShowAnchorPopover(true)}
          >
            <IconAnchor />
          </Button>
        }
        renderContent={
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="anchor-name">Anchor Name</FieldLabel>
              <Input
                id="anchor-name"
                value={anchorName}
                onChange={e => {
                  setAnchorName(e.target.value)
                }}
                placeholder="Enter unique anchor name"
              />
              <FieldDescription>
                Anchor name must be unique across the document
              </FieldDescription>
            </Field>

            <Field orientation="horizontal">
              <Button size="sm" onClick={applyAnchor}>
                {isAnchor ? 'Update' : 'Add'}
              </Button>

              <Button
                size="sm"
                variant="outline"
                disabled={!isAnchor}
                onClick={removeAnchor}
              >
                Remove
              </Button>
            </Field>
          </FieldGroup>
        }
      />

      {/* Link Button */}
      <DialogComponent
        open={showLinkPopover}
        onOpenChange={handleOpenLinkPopover}
        renderTrigger={
          <Button
            className={isLink ? BUTTON_ACTIVE_CLASSES : ''}
            size="icon"
            variant="outline"
            title={isLink ? 'Update/Remove Link' : 'Add Link'}
            onClick={() => handleOpenLinkPopover(true)}
          >
            <IconLink />
          </Button>
        }
        renderContent={
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="link-type">Link Type</FieldLabel>
              <Select
                value={linkType}
                onValueChange={v => setLinkType(v as 'url' | 'anchor')}
              >
                <SelectTrigger id="link-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="url">URL</SelectItem>
                  <SelectItem value="anchor">Anchor</SelectItem>
                </SelectContent>
              </Select>
            </Field>

            {linkType === 'url' ? (
              <>
                <Field>
                  <FieldLabel htmlFor="protocol">Protocol</FieldLabel>
                  <Select value={linkProtocol} onValueChange={setLinkProtocol}>
                    <SelectTrigger id="protocol">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="https">https://</SelectItem>
                      <SelectItem value="http">http://</SelectItem>
                      <SelectItem value="ftp">ftp://</SelectItem>
                      <SelectItem value="news">news://</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>

                <Field>
                  <FieldLabel htmlFor="link-url">URL</FieldLabel>
                  <Input
                    id="link-url"
                    value={linkURL}
                    onChange={e => setLinkURL(e.target.value)}
                    placeholder="example.com"
                  />
                </Field>
              </>
            ) : (
              <Field>
                <FieldLabel htmlFor="anchor-select">Anchor</FieldLabel>
                <Select value={linkURL} onValueChange={setLinkURL}>
                  <SelectTrigger id="anchor-select">
                    <SelectValue placeholder="Select an anchor" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableAnchors.length === 0 ? (
                      <div className="text-muted-foreground px-2 py-1.5 text-sm">
                        No anchors found
                      </div>
                    ) : (
                      availableAnchors.map(anchor => (
                        <SelectItem key={anchor.id} value={anchor.id}>
                          {anchor.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </Field>
            )}

            <Field orientation="horizontal">
              <Button size="sm" onClick={applyLink}>
                {isLink ? 'Update' : 'Add'}
              </Button>

              <Button
                size="sm"
                variant="outline"
                disabled={!isLink}
                onClick={removeLink}
              >
                Remove
              </Button>
            </Field>
          </FieldGroup>
        }
      />
    </ButtonGroup>
  )
}

// Update $getAllAnchors to find AnchorNode instances
function $getAllAnchors(): AnchorType[] {
  const anchors: AnchorType[] = []
  const root = $getRoot()

  const findAnchors = (node: LexicalNode) => {
    if ($isElementNode(node)) {
      const children = node.getChildren()
      children.forEach(child => {
        if ($isAnchorNode(child)) {
          const id = child.getAnchorId()
          const text = child.getTextContent()
          anchors.push({
            name: text || id.replace(/^anchor-/, '').replace(/-/g, ' '),
            id,
          })
        }
        findAnchors(child)
      })
    }
  }

  findAnchors(root)
  return anchors
}
