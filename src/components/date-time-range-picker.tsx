'use client'

import { ChevronDownIcon } from 'lucide-react'
import React from 'react'

import { Button } from './ui/button'
import { Calendar } from './ui/calendar'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './ui/card'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'

type Props = {
  id?: string
  title?: string
  description?: string
  placeholder?: string
  value?: Date | string
  required?: boolean
  onSelectedDate: (date: Date | string) => void
  onBlur?: (e: React.FocusEvent<HTMLButtonElement, Element>) => void
  onChange?: (e: React.ChangeEvent<HTMLButtonElement>) => void
}

function DateTimeRangePicker({
  id,
  title = 'Find Date',
  description,
  placeholder = 'Select Date',
  value,
  required,
  onSelectedDate,
  onBlur,
  onChange,
}: Props) {
  const [open, setOpen] = React.useState(false)
  const [month, setMonth] = React.useState<Date>(new Date())
  const today = new Date()
  //   today.setDate(today.getDate() - 1)

  // STANDBY Time selection needs database implementaion

  const buttonValue =
    value && typeof value !== 'string' ? value.toDateString() : placeholder
  // String type checking is intentional, because need to return '' when slected date is cleared
  const selectedValue = value && typeof value !== 'string' ? value : undefined

  function handleOnSelect(date: Date | undefined) {
    onSelectedDate(date ? date : '') // Return '' instead of undefined
    setOpen(false)
  }

  return (
    <div className="flex w-full flex-col gap-6" data-required={required}>
      <div className="flex flex-col gap-3">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              id={id}
              variant="outline"
              className="w-full justify-between font-normal"
              onBlur={e => {
                onBlur?.(e)
              }}
              onChange={e => {
                onChange?.(e)
              }}
            >
              {buttonValue}
              <ChevronDownIcon />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto" align="start" asChild>
            <Card className="px-0 py-6">
              <CardHeader>
                <CardTitle>{title}</CardTitle>
                {description && (
                  <CardDescription>{description}</CardDescription>
                )}
                <CardAction>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const now = new Date()
                      setMonth(now)
                    }}
                  >
                    Today
                  </Button>
                </CardAction>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  captionLayout="label"
                  fixedWeeks
                  showWeekNumber
                  month={month}
                  selected={selectedValue}
                  disabled={{ before: today }}
                  onMonthChange={setMonth}
                  onSelect={handleOnSelect}
                />
              </CardContent>
            </Card>
          </PopoverContent>
        </Popover>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-3">
          <Label htmlFor="time-from" className="px-1">
            From
          </Label>
          <Input
            id="time-from"
            disabled
            type="time"
            step="1"
            defaultValue="00:00:00"
            className="bg-background appearance-none text-xs sm:text-base [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
          />
        </div>
        <div className="flex flex-col gap-3">
          <Label htmlFor="time-to" className="px-1">
            To
          </Label>
          <Input
            id="time-to"
            disabled
            type="time"
            step="1"
            defaultValue="23:59:59"
            className="bg-background appearance-none text-xs sm:text-base [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
          />
        </div>
      </div>
    </div>
  )
}

export { DateTimeRangePicker }
