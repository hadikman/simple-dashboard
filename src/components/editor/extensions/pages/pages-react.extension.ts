import { ReactExtension } from '@lexical/react/ReactExtension'
import { defineExtension } from 'lexical'

import { PagesExtension } from '.'
import { PageSetupDropdownComponent } from '../../components/page-setup-dropdown.component'
export {
  PageSetupDropdownComponent,
  type PageSetupDropdownProps,
} from '../../components/page-setup-dropdown.component'

export const PagesReactExtension = /* @__PURE__ */ defineExtension({
  build: () => ({ Component: PageSetupDropdownComponent }),
  dependencies: [ReactExtension, PagesExtension],
  name: '@lexical/playground/PagesReact',
})
