'use client'

import { timeUtils } from '../hooks/useCurrentTime'

interface CalendarHeaderProps {
  currentTime: Date
}

export default function CalendarHeader({ currentTime }: CalendarHeaderProps) {
  return (
    <header className="calendar-header">
      <h1 className="calendar-title">
        Familiekalender
      </h1>
      <p className="calendar-date">
        {timeUtils.formatNorwegian(currentTime)}
      </p>
    </header>
  )
}
