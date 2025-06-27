'use client'

import CalendarNavigation from './CalendarNavigation'
import CalendarDateCell from './CalendarDateCell'
import { timeUtils } from '../hooks/useCurrentTime'

interface Event {
  id: number
  title: string
  time: string
  attendees: string | Array<{id: string, name: string}> | object | null
  type: 'appointment' | 'school' | 'family' | 'work' | 'sports' | 'annet'
  date: Date
}

interface CalendarGridProps {
  currentDate: Date
  currentTime: Date
  events: Event[]
  onDateClick: (date: Date) => void
  onPreviousMonth: () => void
  onNextMonth: () => void
  onToday: () => void
  getFamilyMemberColorsForDate: (date: Date, events: Event[]) => string[]
}

export default function CalendarGrid({
  currentDate,
  currentTime,
  events,
  onDateClick,
  onPreviousMonth,
  onNextMonth,
  onToday,
  getFamilyMemberColorsForDate
}: CalendarGridProps) {
  // Generer kalenderdatoer for gjeldende måned
  const generateCalendarDates = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay())

    const dates = []
    const currentCalendarDate = new Date(startDate)

    for (let i = 0; i < 42; i++) {
      dates.push(new Date(currentCalendarDate))
      currentCalendarDate.setDate(currentCalendarDate.getDate() + 1)
    }

    return dates
  }

  const calendarDates = generateCalendarDates()

  return (
    <div className="calendar-card">
      <CalendarNavigation
        currentDate={currentDate}
        currentTime={currentTime}
        onPreviousMonth={onPreviousMonth}
        onNextMonth={onNextMonth}
        onToday={onToday}
      />

      {/* Kalenderoverskrift */}
      <div className="calendar-header-row">
        {['Søn', 'Man', 'Tir', 'Ons', 'Tor', 'Fre', 'Lør'].map(day => (
          <div key={day} className="calendar-day-header">
            {day}
          </div>
        ))}
      </div>

      <div className="calendar-dates">
        {calendarDates.map((date, i) => {
          const isCurrentMonth = date.getMonth() === currentDate.getMonth()
          const isToday = timeUtils.isToday(date, currentTime)
          const familyMemberColors = getFamilyMemberColorsForDate(date, events)

          return (
            <CalendarDateCell
              key={i}
              date={date}
              isCurrentMonth={isCurrentMonth}
              isToday={isToday}
              events={events}
              familyMemberColors={familyMemberColors}
              onDateClick={onDateClick}
            />
          )
        })}
      </div>
    </div>
  )
}
