'use client'

interface Event {
  id: number
  title: string
  time: string
  attendees: string | Array<{id: string, name: string}> | object | null
  type: 'appointment' | 'school' | 'family' | 'work' | 'sports' | 'annet'
  date: Date
}

interface EventsListProps {
  events: Event[]
  loading: boolean
  error: string | null
  onRetry?: () => void
  emptyMessage: string
}

// Hjelpefunksjon for å trygt vise deltakere
const renderAttendees = (attendees: string | Array<{id: string, name: string}> | object | null): string => {
  if (!attendees) return ''

  if (typeof attendees === 'string') return attendees

  if (Array.isArray(attendees)) {
    return attendees
      .map(attendee => {
        if (typeof attendee === 'object' && attendee !== null && 'name' in attendee) {
          let name = attendee.name
          name = name.charAt(0).toUpperCase() + name.slice(1)
          return name
        }
        return String(attendee)
      })
      .join(', ')
  }

  if (typeof attendees === 'object' && attendees !== null) {
    if ('name' in attendees && typeof attendees.name === 'string') {
      return attendees.name
    }
    return JSON.stringify(attendees)
  }

  return String(attendees)
}

const getEventTypeClass = (type: Event['type']) => {
  const typeClasses: Record<Event['type'], string> = {
    sports: 'event-blue',
    school: 'event-green',
    appointment: 'event-purple',
    family: 'event-orange',
    work: 'event-red',
    annet: 'event-green'
  }
  return typeClasses[type]
}

export default function EventsList({
  events,
  loading,
  error,
  onRetry,
  emptyMessage
}: EventsListProps) {
  if (loading) {
    return <p className="event-details">Laster hendelser...</p>
  }

  if (error) {
    return (
      <div>
        <p className="event-details" style={{ color: 'red' }}>{error}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="nav-button nav-button-today"
            style={{ marginTop: '0.5rem' }}
          >
            Prøv igjen
          </button>
        )}
      </div>
    )
  }

  if (events.length === 0) {
    return <p className="event-details">{emptyMessage}</p>
  }

  return (
    <>
      {events.map(event => (
        <div key={event.id} className={`event-item ${getEventTypeClass(event.type)}`}>
          <p className="event-title">{event.title}</p>
          <p className="event-details">
            {event.time}
            {renderAttendees(event.attendees) && ` - ${renderAttendees(event.attendees)}`}
          </p>
        </div>
      ))}
    </>
  )
}
