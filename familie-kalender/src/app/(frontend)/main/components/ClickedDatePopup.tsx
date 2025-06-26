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

interface ClickedDatePopupProps {
  isOpen: boolean
  selectedDate: Date | null
  events: Event[]
  onClose: () => void
  onAddEvent: (date: Date) => void
  onRefresh: () => void
}

export default function ClickedDatePopup({
  isOpen,
  selectedDate,
  events,
  onClose,
  onAddEvent,
  onRefresh
}: ClickedDatePopupProps) {
  const [isDeleting, setIsDeleting] = useState<number | null>(null)

  if (!isOpen || !selectedDate) return null

  // Filtrer hendelser for den valgte datoen
  const dayEvents = events.filter(event =>
    event.date.toDateString() === selectedDate.toDateString()
  )

  // Sorter hendelser etter tid
  const sortedEvents = [...dayEvents].sort((a, b) => {
    return a.time.localeCompare(b.time)
  })

  // Hjelpefunksjon for å vise deltakere
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

  const getEventTypeLabel = (type: Event['type']) => {
    const typeLabels: Record<Event['type'], string> = {
      sports: 'Sport',
      school: 'Skole',
      appointment: 'Avtale',
      family: 'Familie',
      work: 'Arbeid',
      annet: 'Annet'
    }
    return typeLabels[type]
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('nb-NO', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const isDateToday = (date: Date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  const isDateTomorrow = (date: Date) => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return date.toDateString() === tomorrow.toDateString()
  }

  const isDatePast = (date: Date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const eventDate = new Date(date)
    eventDate.setHours(0, 0, 0, 0)
    return eventDate < today
  }

  const getDateLabel = (date: Date) => {
    if (isDateToday(date)) return 'I dag'
    if (isDateTomorrow(date)) return 'I morgen'
    if (isDatePast(date)) return 'Tidligere'
    return 'Kommende'
  }

  const handleDeleteEvent = async (eventId: number) => {
    if (!confirm('Er du sikker på at du vil slette denne hendelsen?')) {
      return
    }

    try {
      setIsDeleting(eventId)
      const response = await fetch(`/api/events/${eventId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        onRefresh() // Oppdater hovedkalender
      } else {
        alert('Kunne ikke slette hendelsen')
      }
    } catch (err) {
      alert('Feil ved sletting av hendelse')
      console.error('Feil ved sletting:', err)
    } finally {
      setIsDeleting(null)
    }
  }

  const handleAddEventClick = () => {
    onAddEvent(selectedDate)
  }

  return (
    <div className="popup-overlay">
      <div className="popup-container">
        <div className="popup-header">
          <div className="header-content">
            <h2 className="popup-title">
              {formatDate(selectedDate)}
            </h2>
            <div className="date-badge">
              {getDateLabel(selectedDate)}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="popup-close-button"
          >
            ×
          </button>
        </div>

        <div className="popup-content">
          {sortedEvents.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📅</div>
              <h3 className="empty-title">Ingen hendelser planlagt</h3>
              <p className="empty-text">
                Det er ingen hendelser planlagt for denne dagen.
              </p>
            </div>
          ) : (
            <div className="events-list">
              <div className="events-header">
                <h3 className="events-count">
                  {sortedEvents.length} hendelse{sortedEvents.length !== 1 ? 'r' : ''}
                </h3>
              </div>

              <div className="events-container">
                {sortedEvents.map(event => (
                  <div
                    key={event.id}
                    className={`event-item ${getEventTypeClass(event.type)} ${isDatePast(selectedDate) ? 'past-event' : ''}`}
                  >
                    <div className="event-main">
                      <div className="event-header">
                        <h4 className="event-title">{event.title}</h4>
                        <span className="event-type-badge">
                          {getEventTypeLabel(event.type)}
                        </span>
                      </div>

                      <div className="event-details">
                        <div className="event-detail">
                          <span className="detail-icon">🕐</span>
                          <span className="detail-text">{event.time}</span>
                        </div>

                        {renderAttendees(event.attendees) && (
                          <div className="event-detail">
                            <span className="detail-icon">👥</span>
                            <span className="detail-text">{renderAttendees(event.attendees)}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="event-actions">
                      <button
                        onClick={() => handleDeleteEvent(event.id)}
                        className="delete-btn"
                        disabled={isDeleting === event.id}
                        title="Slett hendelse"
                      >
                        {isDeleting === event.id ? '⏳' : '🗑️'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="popup-footer">
          <button
            onClick={handleAddEventClick}
            className="add-event-btn"
          >
            <span className="btn-icon">➕</span>
            Legg til hendelse
          </button>

          <button
            onClick={onClose}
            className="close-btn"
          >
            Lukk
          </button>
        </div>
      </div>

      <style jsx>{`
        .popup-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 1rem;
        }

        .popup-container {
          background-color: white;
          border-radius: 1rem;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
          width: 100%;
          max-width: 600px;
          max-height: 90vh;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        .popup-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding: 1.5rem;
          border-bottom: 1px solid var(--color-border, #f2e6db);
          flex-shrink: 0;
        }

        .header-content {
          flex: 1;
        }

        .popup-title {
          font-size: 1.4rem;
          font-weight: 700;
          color: var(--color-primary, #f28c8c);
          margin: 0 0 0.5rem 0;
          line-height: 1.2;
        }

        .date-badge {
          display: inline-block;
          background-color: rgba(242, 140, 140, 0.1);
          color: var(--color-primary, #f28c8c);
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.85rem;
          font-weight: 600;
        }

        .popup-close-button {
          background: none;
          border: none;
          font-size: 2rem;
          color: var(--color-text-secondary, #6e6e6e);
          cursor: pointer;
          padding: 0;
          width: 2rem;
          height: 2rem;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          transition: background-color 0.2s;
          margin-left: 1rem;
        }

        .popup-close-button:hover {
          background-color: var(--color-border, #f2e6db);
        }

        .popup-content {
          flex: 1;
          overflow-y: auto;
          padding: 1.5rem;
        }

        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 3rem 1rem;
          text-align: center;
        }

        .empty-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
          opacity: 0.5;
        }

        .empty-title {
          font-size: 1.2rem;
          font-weight: 600;
          color: var(--color-text-primary, #4a4a4a);
          margin: 0 0 0.5rem 0;
        }

        .empty-text {
          color: var(--color-text-secondary, #6e6e6e);
          margin: 0;
          max-width: 300px;
        }

        .events-list {
          display: flex;
          flex-direction: column;
        }

        .events-header {
          margin-bottom: 1rem;
        }

        .events-count {
          font-size: 1.1rem;
          font-weight: 600;
          color: var(--color-text-primary, #4a4a4a);
          margin: 0;
        }

        .events-container {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .event-item {
          padding: 1rem;
          border-left: 4px solid;
          border-radius: 8px;
          background-color: white;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .event-item:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }

        .event-item.past-event {
          opacity: 0.7;
        }

        .event-item.event-blue {
          border-left-color: #60a5fa;
          background-color: #f0f9ff;
        }

        .event-item.event-green {
          border-left-color: #34d399;
          background-color: #f0fdf4;
        }

        .event-item.event-purple {
          border-left-color: #a855f7;
          background-color: #faf5ff;
        }

        .event-item.event-orange {
          border-left-color: #fb923c;
          background-color: #fff7ed;
        }

        .event-item.event-red {
          border-left-color: #ef4444;
          background-color: #fef2f2;
        }

        .event-main {
          flex: 1;
        }

        .event-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 0.75rem;
          gap: 1rem;
        }

        .event-title {
          font-size: 1rem;
          font-weight: 600;
          color: var(--color-text-primary, #4a4a4a);
          margin: 0;
          line-height: 1.3;
        }

        .event-type-badge {
          background-color: rgba(242, 140, 140, 0.2);
          color: var(--color-primary, #f28c8c);
          padding: 0.2rem 0.6rem;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 600;
          white-space: nowrap;
        }

        .event-details {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .event-detail {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .detail-icon {
          font-size: 0.9rem;
          width: 1.2rem;
          text-align: center;
        }

        .detail-text {
          font-size: 0.9rem;
          color: var(--color-text-secondary, #6e6e6e);
        }

        .event-actions {
          margin-left: 1rem;
          display: flex;
          align-items: flex-start;
        }

        .delete-btn {
          background: none;
          border: none;
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 6px;
          transition: background-color 0.2s;
          font-size: 1.1rem;
        }

        .delete-btn:hover:not(:disabled) {
          background-color: #fee2e2;
        }

        .delete-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .popup-footer {
          padding: 1rem 1.5rem;
          border-top: 1px solid var(--color-border, #f2e6db);
          display: flex;
          gap: 1rem;
          justify-content: space-between;
          background-color: #faf9f7;
          flex-shrink: 0;
        }

        .add-event-btn {
          background-color: var(--color-primary, #f28c8c);
          color: white;
          border: none;
          border-radius: 8px;
          padding: 0.75rem 1.5rem;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: background-color 0.3s ease, transform 0.2s ease;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .add-event-btn:hover {
          background-color: var(--color-accent, #90c5a9);
          transform: translateY(-1px);
        }

        .btn-icon {
          font-size: 0.9rem;
        }

        .close-btn {
          background-color: transparent;
          color: var(--color-text-secondary, #6e6e6e);
          border: 2px solid var(--color-border, #f2e6db);
          border-radius: 8px;
          padding: 0.75rem 1.5rem;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .close-btn:hover {
          border-color: var(--color-primary, #f28c8c);
          color: var(--color-primary, #f28c8c);
        }

        @media (max-width: 768px) {
          .popup-container {
            margin: 0.5rem;
            max-height: calc(100vh - 1rem);
          }

          .popup-header {
            padding: 1rem;
          }

          .popup-title {
            font-size: 1.2rem;
          }

          .popup-content {
            padding: 1rem;
          }

          .popup-footer {
            padding: 1rem;
            flex-direction: column-reverse;
          }

          .add-event-btn,
          .close-btn {
            width: 100%;
            justify-content: center;
          }

          .event-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.5rem;
          }

          .event-details {
            flex-direction: column;
            gap: 0.3rem;
          }

          .event-item {
            flex-direction: column;
            align-items: flex-start;
          }

          .event-actions {
            margin-left: 0;
            margin-top: 0.5rem;
            align-self: flex-end;
          }
        }
      `}</style>
    </div>
  )
}
