import type { JSX } from 'react'
import type { PageSetup, PageSize } from '../extensions/pages/types'

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
// STANDBY
// import { useExtensionSignalValue } from '@lexical/react/useExtensionSignalValue'
import { IconFile } from '@tabler/icons-react'
import { useCallback } from 'react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { DEFAULT_PAGE_SETUP } from '../extensions/pages/constants'
import { $setPageSetup } from '../nodes/page/page-setup'

const MARGIN_PRESETS: readonly {
  label: string
  margins: PageSetup['margins']
}[] = [
  {
    label: 'Narrow (0.25")',
    margins: { bottom: 0.25, left: 0.25, right: 0.25, top: 0.25 },
  },
  {
    label: 'Normal (0.4")',
    margins: { ...DEFAULT_PAGE_SETUP.margins },
  },
  {
    label: 'Moderate (0.75")',
    margins: { bottom: 0.75, left: 0.75, right: 0.75, top: 0.75 },
  },
  {
    label: 'Wide (1")',
    margins: { bottom: 1, left: 1, right: 1, top: 1 },
  },
]

const PAGE_SIZE_ORDER: PageSize[] = [
  'A4',
  'Letter',
  'Legal',
  'Tabloid',
  'A3',
  'A5',
  'B4',
  'B5',
  'Statement',
  'Executive',
  'Folio',
]

export type PageSetupDropdownProps = {
  disabled?: boolean
}

/**
 * Output component for {@link PageExtension}. Render via
 * {@link @lexical/react/ExtensionComponent | ExtensionComponent} or
 * {@link @lexical/react/useExtensionComponent | useExtensionComponent}.
 */
export function PageSetupDropdownComponent({
  disabled = false,
}: PageSetupDropdownProps): JSX.Element {
  const [editor] = useLexicalComposerContext()
  //  STANDBY Usefull
  //  const pageSetup = useExtensionSignalValue(PagesExtension, 'pageSetup')

  const applyUpdate = useCallback(
    (v: null | Partial<PageSetup>) => {
      editor.update(() => {
        $setPageSetup(
          v ? prev => ({ ...(prev || DEFAULT_PAGE_SETUP), ...v }) : v,
        )
      })
    },
    [editor],
  )

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <IconFile />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>Page Size</DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent>
              <DropdownMenuItem onClick={() => applyUpdate(null)}>
                Pageless
              </DropdownMenuItem>
              {PAGE_SIZE_ORDER.map(pageSize => (
                <DropdownMenuItem
                  key={pageSize}
                  onClick={() => applyUpdate({ pageSize })}
                >
                  {pageSize}
                </DropdownMenuItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>

        <DropdownMenuSub>
          <DropdownMenuSubTrigger>Orientation</DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent>
              <DropdownMenuItem
                onClick={() => applyUpdate({ orientation: 'portrait' })}
              >
                Portrait
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => applyUpdate({ orientation: 'landscape' })}
              >
                Landscape
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>

        <DropdownMenuSub>
          <DropdownMenuSubTrigger>Margins</DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent>
              {MARGIN_PRESETS.map(({ label, margins }) => (
                <DropdownMenuItem
                  key={label}
                  onClick={() => applyUpdate({ margins })}
                >
                  {label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
