'use client'

import * as React from 'react'
import {
  ChevronLeftIcon,
  ChevronRightIcon,
} from 'lucide-react'
import { DayButton, DayPicker, useDayPicker, CaptionProps } from 'react-day-picker'
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
        weekdays: 'grid grid-cols-7 w-full mb-10',
        weekday: 'text-neutral-700 font-black text-[9px] uppercase tracking-[0.2em] text-center select-none',
        week: 'grid grid-cols-7 w-full mt-2 justify-items-center',
        day: 'relative w-11 h-11 p-0 text-center group/day aspect-square select-none flex items-center justify-center',
        today: 'relative z-10',
        outside: 'opacity-10 pointer-events-none',
        disabled: 'text-muted-foreground opacity-50',
        hidden: 'invisible',
        ...classNames,
      }}
      components={{
        Root: ({ className, rootRef, ...props }) => (
          <div data-slot="calendar" ref={rootRef} className={cn(className)} {...props} />
        ),
        MonthCaption: CustomMonthCaption,
        DayButton: CalendarDayButton,
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
 
function CalendarDayButton(props: React.ComponentProps<typeof DayButton>) {
  const { className, day, modifiers, ...rest } = props
 
  // Robust modifier lookup supporting both dot and bracket notation
  const m = modifiers || {}
  const isStart = !!(m.streak_start || m['streak_start'])
  const isMid = !!(m.streak_mid || m['streak_mid'])
  const isEnd = !!(m.streak_end || m['streak_end'])
  const isSolo = !!(m.streak_solo || m['streak_solo'])
  const isPlayed = isStart || isMid || isEnd || isSolo
  const isGroup = isStart || isMid || isEnd
 
  return (
    <DayButton
      day={day}
      modifiers={modifiers}
      data-streak-start={isStart}
      data-streak-mid={isMid}
      data-streak-end={isEnd}
      data-streak-solo={isSolo}
      data-is-played={isPlayed}
      className={cn(
        'relative flex aspect-square size-auto w-full min-w-(--cell-size) flex-col items-center justify-center font-normal transition-all duration-300 rounded-xl',
        
        // CRITICAL FIX: Add content-[''] to pseudo-elements to ensure they are rendered
        "before:content-[''] before:absolute before:inset-y-[21%] before:z-0 before:transition-all before:duration-300",
        
        "data-[streak-start=true]:before:left-1/2 data-[streak-start=true]:before:right-0 data-[streak-start=true]:before:bg-orange-500/20 data-[streak-start=true]:before:rounded-l-full",
        "data-[streak-mid=true]:before:left-0 data-[streak-mid=true]:before:right-0 data-[streak-mid=true]:before:bg-orange-500/20",
        "data-[streak-end=true]:before:left-0 data-[streak-end=true]:before:right-1/2 data-[streak-end=true]:before:bg-orange-500/20 data-[streak-end=true]:before:rounded-r-full",
        
        'group-data-[focused=true]/day:relative group-data-[focused=true]/day:z-10 group-data-[focused=true]/day:ring-1 group-data-[focused=true]/day:ring-orange-500/40',
        className,
      )}
      {...rest}
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
    </DayButton>
  )
}

export { Calendar }
