'use client'

import { useState } from 'react'
import '../styles/components/clicked-date-popup.css'

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
    </div>
  )
}
