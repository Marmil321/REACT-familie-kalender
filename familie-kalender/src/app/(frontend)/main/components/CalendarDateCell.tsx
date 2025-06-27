'use client'

import { useState } from 'react'
import '../styles/components/calendar-date-cell.css'

interface Event {
  id: number
  title: string
  time: string
  attendees: string | Array<{id: string, name: string}> | object | null
  type: 'appointment' | 'school' | 'family' | 'work' | 'sports' | 'annet'
  date: Date
}

interface CalendarDateCellProps {
  date: Date
  isCurrentMonth: boolean
  isToday: boolean
  events: Event[]
  familyMemberColors: string[]
  onDateClick: (date: Date) => void
}

export default function CalendarDateCell({
  date,
  isCurrentMonth,
  isToday,
  events,
  familyMemberColors,
  onDateClick
}: CalendarDateCellProps) {
  const [isHovered, setIsHovered] = useState(false)

  // Finn hendelser for denne datoen
  const dateEvents = events.filter(event =>
    event.date.toDateString() === date.toDateString()
  )

  const hasEvents = familyMemberColors.length > 0

  const handleClick = () => {
    // Logg data om datoen/ruten
    console.log('📅 Kalender dato klikket:', {
      dato: date.toLocaleDateString('nb-NO'),
      ukedag: date.toLocaleDateString('nb-NO', { weekday: 'long' }),
      erIDag: isToday,
      erAktuellMåned: isCurrentMonth,
      antallHendelser: dateEvents.length,
      hendelser: dateEvents.map(event => ({
        id: event.id,
        tittel: event.title,
        tid: event.time,
        type: event.type
      })),
      familiemedlemFarger: familyMemberColors,
      timestamp: new Date().toISOString()
    })

    // Kall den opprinnelige onClick-funksjonen
    onDateClick(date)
  }

  const getCellClasses = () => {
    let classes = 'calendar-date-cell'

    if (!isCurrentMonth) classes += ' other-month'
    if (isToday) classes += ' today'
    if (isHovered) classes += ' hovered'

    return classes
  }

  const formatDate = (date: Date) => {
    return {
      dag: date.getDate(),
      måned: date.toLocaleDateString('nb-NO', { month: 'short' }),
      år: date.getFullYear(),
      fullDato: date.toLocaleDateString('nb-NO')
    }
  }

  const dateInfo = formatDate(date)

  return (
    <div
      className={getCellClasses()}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      title={`${dateInfo.fullDato}${dateEvents.length > 0 ? ` - ${dateEvents.length} hendelse${dateEvents.length > 1 ? 'r' : ''}` : ''}`}
    >
      <span className="date-number">
        {date.getDate()}
      </span>

      {/* Vis hendelsesprikker hvis det finnes hendelser */}
      {hasEvents && (
        <div className="event-dots-container">
          {familyMemberColors.map((color, index) => (
            <div
              key={index}
              className="event-dot"
              style={{ backgroundColor: color }}
              title={`Hendelse ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Vis antall hendelser som tekst når man hovrer (for debugging) */}
      {isHovered && dateEvents.length > 0 && (
        <div className="event-count-overlay">
          {dateEvents.length}
        </div>
      )}
    </div>
  )
}
