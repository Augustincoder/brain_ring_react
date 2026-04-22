'use client'

import * as React from 'react'
import {
  ChevronLeftIcon,
  ChevronRightIcon,
} from 'lucide-react'
// DayProps qabul qilinadi
import { DayPicker, useDayPicker, CaptionProps, DayProps } from 'react-day-picker'
import { cn } from '@/lib/utils'

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = 'label',
  ...props
}: React.ComponentProps<typeof DayPicker>) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      hideNavigation={true}
      className={cn(
        'group/calendar p-0 [--cell-size:--spacing(11)]',
        className,
      )}
      captionLayout={captionLayout}
      formatters={{
        formatWeekdayName: (date) =>
          date.toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 3).toUpperCase(),
      }}
      classNames={{
        root: 'w-full',
        months: 'flex flex-col w-full relative',
        month: 'flex flex-col w-full',
        month_caption: "hidden",
        caption_label: "hidden",
        nav: "hidden",
        table: 'w-full border-collapse',
        weekdays: 'grid grid-cols-7 w-full mb-8',
        weekday: 'text-neutral-400 font-bold text-[11px] uppercase tracking-[0.2em] text-center select-none',
        week: 'grid grid-cols-7 w-full mt-2',
        ...classNames,
      }}
      components={{
        Root: ({ className, rootRef, ...props }) => (
          <div data-slot="calendar" ref={rootRef} className={cn(className)} {...props} />
        ),
        MonthCaption: CustomMonthCaption,
        // ASOSIY O'ZGARISH: DayButton emas, Day butunlay qayta yoziladi
        Day: CustomDay,
        ...props.components,
      }}
      {...props}
    />
  )
}

function CustomMonthCaption({ calendarMonth }: CaptionProps) {
  const { goToMonth, nextMonth, previousMonth } = useDayPicker()
  const monthName = calendarMonth.date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }).toUpperCase()

  return (
    <div className="flex items-center justify-between w-full h-10 mb-14 px-1 relative">
      <button
        disabled={!previousMonth}
        onClick={() => previousMonth && goToMonth(previousMonth)}
        type="button"
        className="size-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/15 transition-all opacity-40 hover:opacity-100 disabled:opacity-5 z-20"
      >
        <ChevronLeftIcon className="size-5 text-white" />
      </button>

      <span className="absolute inset-0 flex items-center justify-center text-[0.95rem] font-black uppercase tracking-[0.4em] text-white select-none pointer-events-none">
        {monthName}
      </span>

      <button
        disabled={!nextMonth}
        onClick={() => nextMonth && goToMonth(nextMonth)}
        type="button"
        className="size-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/15 transition-all opacity-40 hover:opacity-100 disabled:opacity-5 z-20"
      >
        <ChevronRightIcon className="size-5 text-white" />
      </button>
    </div>
  )
}

// BIZ YARATGAN YANGI KOMPONENT: Asosiy <td> ni o'zimiz chizamiz
function CustomDay(props: DayProps) {
  const { day, modifiers } = props

  const m = modifiers || {}
  const isStart = !!m.streak_start
  const isMid = !!m.streak_mid
  const isEnd = !!m.streak_end
  const isSolo = !!m.streak_solo
  const isPlayed = isStart || isMid || isEnd || isSolo
  const isGroup = isStart || isMid || isEnd
  const isOutside = !!m.outside
  const isToday = !!m.today

  return (
    <td
      role="gridcell"
      aria-label={day.date.toDateString()}
      className={cn(
        // Standart td stillari
        'relative w-full h-11 p-0 text-center group/day select-none flex items-center justify-center',

        // Agar boshqa oyning kuni bo'lsa
        isOutside && 'opacity-10 pointer-events-none',

        // Agar bugungi kun bo'lsa, z-index ni ko'tarish
        isToday && 'z-10',

        // Olovli chiziqlar (bevosita td ga beramiz)
        "before:content-[''] before:absolute before:inset-y-[30%] before:z-0 before:transition-all before:duration-300",
        isStart && "before:left-1/2 before:right-0 before:bg-orange-500/20 before:rounded-l-full",
        isMid && "before:left-0 before:right-0 before:bg-orange-500/20",
        isEnd && "before:left-0 before:right-1/2 before:bg-orange-500/20 before:rounded-r-full"
      )}
    >
      <div className={cn(
        "z-10 flex items-center justify-center w-9 h-9 rounded-full transition-all duration-500 text-[11px] font-black",
        isPlayed ? "bg-orange-500 text-white shadow-xl shadow-orange-500/40 scale-105" : "bg-white/[0.04] text-neutral-600 hover:text-neutral-400"
      )}>
        {isGroup ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="currentColor"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-white drop-shadow-md"
          >
            <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
          </svg>
        ) : (
          day.date.getDate()
        )}
      </div>
    </td>
  )
}

export { Calendar }