import { Button } from '../../ui/button'
import { COLORS } from '../plugins/toolbar/font/constant'

type ColorPaletteComponentProps = {
  selectedColor: string
  onSelect: (color: string) => void
  onClose?: () => void
  onClear: () => void
}

export function ColorPaletteComponent({
  selectedColor,
  onSelect,
  onClose,
  onClear,
}: ColorPaletteComponentProps) {
  return (
    <div>
      <div className="grid grid-cols-10 gap-1">
        {COLORS.map(color => (
          <button
            key={color}
            data-active={selectedColor === color}
            className="ring-ring size-6 rounded-sm transition-transform hover:scale-110 data-[active=true]:ring-2"
            style={{ backgroundColor: color }}
            onClick={e => {
              e.preventDefault()
              e.stopPropagation()
              onSelect(color)
              onClose?.()
            }}
          />
        ))}
      </div>

      <Button
        className="mt-2 w-full text-xs"
        variant="ghost"
        onClick={e => {
          e.preventDefault()
          e.stopPropagation()
          onClear()
          onClose?.()
        }}
      >
        Clear Color
      </Button>
    </div>
  )
}
