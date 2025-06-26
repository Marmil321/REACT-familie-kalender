'use client'

import { useState } from 'react'

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

      <style jsx>{`
        .calendar-date-cell {
          height: 5rem;
          border: 1px solid #e5e7eb;
          padding: 0.25rem;
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;
          background-color: white;
        }

        .calendar-date-cell:hover {
          background-color: #f9fafb;
          border-color: #d1d5db;
          transform: translateY(-1px);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .calendar-date-cell.hovered {
          background-color: #f0f9ff;
          border-color: #3b82f6;
        }

        .calendar-date-cell.other-month {
          opacity: 0.4;
        }

        .calendar-date-cell.other-month:hover {
          opacity: 0.7;
        }

        .calendar-date-cell.today {
          background-color: #dbeafe;
          border-color: #3b82f6;
          font-weight: bold;
        }

        .calendar-date-cell.today:hover {
          background-color: #bfdbfe;
        }

        .calendar-date-cell.today .date-number {
          color: #1d4ed8;
          font-weight: bold;
        }

        .date-number {
          font-size: 0.875rem;
          color: #6b7280;
          font-weight: 500;
        }

        .event-dots-container {
          position: absolute;
          bottom: 0.25rem;
          left: 0.25rem;
          display: flex;
          flex-wrap: wrap;
          flex-direction: column;
          gap: 0.15rem;
          max-width: calc(100% - 0.5rem);
          justify-content: flex-end;
          align-content: flex-end;
          max-height: calc(100% - 1.5rem);
          overflow: visible;
        }

        .event-dot {
          width: 0.75rem;
          height: 0.75rem;
          border-radius: 50%;
          border: 1px solid rgba(255, 255, 255, 0.9);
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.15);
          flex-shrink: 0;
          transition: transform 0.2s ease;
        }

        .calendar-date-cell:hover .event-dot {
          transform: scale(1.1);
        }

        .event-count-overlay {
          position: absolute;
          top: 0.25rem;
          right: 0.25rem;
          background-color: #3b82f6;
          color: white;
          font-size: 0.75rem;
          font-weight: bold;
          width: 1.25rem;
          height: 1.25rem;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
        }

        /* Mobile responsiveness */
        @media (max-width: 768px) {
          .calendar-date-cell {
            height: 3rem;
          }

          .event-dot {
            width: 0.4rem;
            height: 0.4rem;
          }

          .event-dots-container {
            gap: 0.1rem;
            max-height: calc(100% - 1rem);
          }

          .event-count-overlay {
            width: 1rem;
            height: 1rem;
            font-size: 0.65rem;
          }
        }
      `}</style>
    </div>
  )
}
