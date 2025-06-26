'use client'

import { useState, useEffect, useCallback } from 'react'

interface Event {
  id: number
  title: string
  time: string
  attendees: { name: string }[]
  type: 'appointment' | 'school' | 'family' | 'work' | 'sports' | 'annet'
  date: Date
}

interface ViewAllEventsPopupProps {
  isOpen: boolean
  onClose: () => void
  onRefresh: () => void
}

export default function ViewAllEventsPopup({ isOpen, onClose, onRefresh }: ViewAllEventsPopupProps) {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Filter states
  const [filterType, setFilterType] = useState<string>('alle')
  const [filterDateFrom, setFilterDateFrom] = useState('')
  const [filterDateTo, setFilterDateTo] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  const eventTypes = [
    { value: 'alle', label: 'Alle typer' },
    { value: 'family', label: 'Familie' },
    { value: 'work', label: 'Arbeid' },
    { value: 'school', label: 'Skole' },
    { value: 'appointment', label: 'Avtale' },
    { value: 'sports', label: 'Sport' },
    { value: 'annet', label: 'Annet' }
  ]

  // Family member labels
  const familyMemberLabels: Record<string, string> = {
    marcus: 'Marcus',
    marita: 'Marita',
    meline: 'Meline',
    lucas: 'Lucas',
    lars: 'Lars',
    noomi: 'Noomi',
    bailey: 'Bailey'
  }

  // Helper function to format attendees display
  const formatAttendees = (attendees: { name: string | undefined}[]) => {
    if (!attendees || attendees.length === 0) {
      return 'Ingen deltakere'
    }

    const names = attendees.map(attendee =>
      attendee.name && familyMemberLabels[attendee.name]
        ? familyMemberLabels[attendee.name]
        : attendee.name || 'Ukjent'
    )

    if (names.length === 1) {
      return names[0]
    } else if (names.length === 2) {
      return `${names[0]} og ${names[1]}`
    } else if (names.length <= 3) {
      return `${names.slice(0, -1).join(', ')} og ${names[names.length - 1]}`
    } else {
      return `${names.slice(0, 2).join(', ')} og ${names.length - 2} andre`
    }
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


  const fetchAllEvents = useCallback(async () => {
    if (!isOpen) return

    try {
      setLoading(true)
      setError(null)

      // Build query parameters
      const params = new URLSearchParams()
      params.append('limit', '100') // Get more events for the overview

      if (filterType !== 'alle') {
        params.append('type', filterType)
      }

      if (filterDateFrom) {
        params.append('from', filterDateFrom)
      }

      if (filterDateTo) {
        params.append('to', filterDateTo)
      }

      const response = await fetch(`/api/events?${params.toString()}`)
      const result = await response.json()

      if (result.success) {
        const eventsWithDates = result.data.map((event: Event) => ({
          ...event,
          date: new Date(event.date),
          // Ensure attendees is always an array
          attendees: Array.isArray(event.attendees) ? event.attendees : []
        }))
        setEvents(eventsWithDates)
      } else {
        setError(result.error || 'Kunne ikke hente hendelser')
      }
    } catch (err) {
      setError('Nettverksfeil ved henting av hendelser')
      console.error('Feil ved henting av hendelser:', err)
    } finally {
      setLoading(false)
    }
  }, [isOpen, filterType, filterDateFrom, filterDateTo])

  // Filter events based on search term
  const filteredEvents = events.filter(event => {
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      const attendeesText = (formatAttendees(event.attendees ?? []) || '').toLowerCase()
      return (
        event.title.toLowerCase().includes(searchLower) ||
        attendeesText.includes(searchLower)
      )
    }
    return true
  })

  // Sort events by date (upcoming first)
  const sortedEvents = [...filteredEvents].sort((a, b) => {
    return a.date.getTime() - b.date.getTime()
  })

  // Group events by date
  const groupedEvents = sortedEvents.reduce((groups, event) => {
    const dateKey = event.date.toDateString()
    if (!groups[dateKey]) {
      groups[dateKey] = []
    }
    groups[dateKey].push(event)
    return groups
  }, {} as Record<string, Event[]>)

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('nb-NO', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatShortDate = (date: Date) => {
    return date.toLocaleDateString('nb-NO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const isEventPast = (date: Date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const eventDate = new Date(date)
    eventDate.setHours(0, 0, 0, 0)
    return eventDate < today
  }

  const handleDeleteEvent = async (eventId: number) => {
    if (!confirm('Er du sikker på at du vil slette denne hendelsen?')) {
      return
    }

    try {
      const response = await fetch(`/api/events/${eventId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setEvents(events.filter(event => event.id !== eventId))
        onRefresh() // Refresh the main calendar
      } else {
        alert('Kunne ikke slette hendelsen')
      }
    } catch (err) {
      alert('Feil ved sletting av hendelse')
      console.error('Feil ved sletting:', err)
    }
  }

  useEffect(() => {
    fetchAllEvents()
  }, [isOpen, filterType, filterDateFrom, filterDateTo, fetchAllEvents])

  if (!isOpen) return null

  return (
    <div className="popup-overlay">
      <div className="popup-container large">
        <div className="popup-header">
          <h2 className="popup-title">Alle hendelser</h2>
          <button
            type="button"
            onClick={onClose}
            className="popup-close-button"
          >
            ×
          </button>
        </div>

        {/* Filters */}
        <div className="filters-section">
          <div className="filters-row">
            <div className="filter-group">
              <label className="filter-label">Søk:</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Søk etter tittel eller deltakere"
                className="filter-input"
              />
            </div>

            <div className="filter-group">
              <label className="filter-label">Type:</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="filter-select"
              >
                {eventTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="filters-row">
            <div className="filter-group">
              <label className="filter-label">Fra dato:</label>
              <input
                type="date"
                value={filterDateFrom}
                onChange={(e) => setFilterDateFrom(e.target.value)}
                className="filter-input"
              />
            </div>

            <div className="filter-group">
              <label className="filter-label">Til dato:</label>
              <input
                type="date"
                value={filterDateTo}
                onChange={(e) => setFilterDateTo(e.target.value)}
                className="filter-input"
              />
            </div>

            <div className="filter-group">
              <button
                onClick={() => {
                  setFilterType('alle')
                  setFilterDateFrom('')
                  setFilterDateTo('')
                  setSearchTerm('')
                }}
                className="clear-filters-btn"
              >
                Tilbakestill
              </button>
            </div>
          </div>
        </div>

        {/* Events List */}
        <div className="events-content">
          {loading ? (
            <div className="loading-state">
              <p>Laster hendelser...</p>
            </div>
          ) : error ? (
            <div className="error-state">
              <p className="error-text">{error}</p>
              <button onClick={fetchAllEvents} className="retry-btn">
                Prøv igjen
              </button>
            </div>
          ) : Object.keys(groupedEvents).length === 0 ? (
            <div className="empty-state">
              <p>Ingen hendelser funnet</p>
              {(filterType !== 'alle' || filterDateFrom || filterDateTo || searchTerm) && (
                <p className="empty-subtitle">Prøv å justere filtrene dine</p>
              )}
            </div>
          ) : (
            <div className="events-list">
              {Object.entries(groupedEvents).map(([dateString, dayEvents]) => {
                const date = new Date(dateString)
                const isPast = isEventPast(date)

                return (
                  <div key={dateString} className="date-group">
                    <div className={`date-header ${isPast ? 'past' : ''}`}>
                      <h3 className="date-title">{formatDate(date)}</h3>
                      <span className="event-count">
                        {dayEvents.length} hendelse{dayEvents.length !== 1 ? 'r' : ''}
                      </span>
                    </div>

                    <div className="day-events">
                      {dayEvents.map(event => (
                        <div
                          key={event.id}
                          className={`event-card ${getEventTypeClass(event.type)} ${isPast ? 'past-event' : ''}`}
                        >
                          <div className="event-main">
                            <div className="event-header">
                              <h4 className="event-title">{event.title}</h4>
                              <span className="event-type-badge">
                                {getEventTypeLabel(event.type)}
                              </span>
                            </div>

                            <div className="event-details">
                              <span className="event-time">🕐 {event.time}</span>
                              <span className="event-attendees">👥 {formatAttendees(event.attendees)}</span>
                              <span className="event-date">📅 {formatShortDate(event.date)}</span>
                            </div>
                          </div>

                          <div className="event-actions">
                            <button
                              onClick={() => handleDeleteEvent(event.id)}
                              className="delete-btn"
                              title="Slett hendelse"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className="popup-footer">
          <div className="events-summary">
            Totalt: {sortedEvents.length} hendelse{sortedEvents.length !== 1 ? 'r' : ''}
          </div>
          <button onClick={onClose} className="close-btn">
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

        .popup-container.large {
          background-color: white;
          border-radius: 1rem;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
          width: 100%;
          max-width: 800px;
          max-height: 90vh;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        .popup-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem;
          border-bottom: 1px solid var(--color-border, #f2e6db);
          flex-shrink: 0;
        }

        .popup-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--color-primary, #f28c8c);
          margin: 0;
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
        }

        .popup-close-button:hover {
          background-color: var(--color-border, #f2e6db);
        }

        .filters-section {
          padding: 1rem 1.5rem;
          background-color: #faf9f7;
          border-bottom: 1px solid var(--color-border, #f2e6db);
          flex-shrink: 0;
        }

        .filters-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .filters-row:last-child {
          margin-bottom: 0;
        }

        .filter-group {
          display: flex;
          flex-direction: column;
        }

        .filter-label {
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--color-text-primary, #4a4a4a);
          margin-bottom: 0.5rem;
        }

        .filter-input,
        .filter-select {
          padding: 0.5rem;
          border: 2px solid var(--color-border, #f2e6db);
          border-radius: 6px;
          font-size: 0.9rem;
          font-family: 'Nunito', sans-serif;
          background-color: white;
        }

        .filter-input:focus,
        .filter-select:focus {
          outline: none;
          border-color: var(--color-primary, #f28c8c);
        }

        .clear-filters-btn {
          background-color: var(--color-warning, #f2d4b7);
          color: var(--color-text-primary, #4a4a4a);
          border: none;
          border-radius: 6px;
          padding: 0.5rem 1rem;
          font-size: 0.9rem;
          cursor: pointer;
          margin-top: auto;
          transition: background-color 0.3s ease;
        }

        .clear-filters-btn:hover {
          background-color: var(--color-text-secondary, #6e6e6e);
        }

        .events-content {
          flex: 1;
          overflow-y: auto;
          padding: 1.5rem;
        }

        .loading-state,
        .error-state,
        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 3rem;
          text-align: center;
        }

        .error-text {
          color: #dc2626;
          margin-bottom: 1rem;
        }

        .retry-btn {
          background-color: var(--color-primary, #f28c8c);
          color: white;
          border: none;
          border-radius: 6px;
          padding: 0.5rem 1rem;
          cursor: pointer;
        }

        .empty-subtitle {
          color: var(--color-text-secondary, #6e6e6e);
          font-size: 0.9rem;
        }

        .events-list {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .date-group {
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .date-header {
          background-color: var(--color-accent, #f28c8c);
          color: var(--color-text-primary, #ffffff);
          padding: 1rem 1.5rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .date-header.past {
          background-color: var(--color-secondary, #f2d4b7);
        }

        .date-title {
          margin: 0;
          font-size: 1.1rem;
          font-weight: 600;
        }

        .event-count {
          font-size: 0.9rem;
          opacity: 0.9;
        }

        .day-events {
          background-color: white;
        }

        .event-card {
          padding: 1rem 1.5rem;
          border-left: 4px solid;
          display: flex;
          justify-content: space-between;
          align-items: center;
          transition: background-color 0.2s;
        }

        .event-card:not(:last-child) {
          border-bottom: 1px solid #f3f4f6;
        }

        .event-card:hover {
          background-color: #f9fafb;
        }

        .event-card.past-event {
          opacity: 0.7;
        }

        .event-card.event-blue {
          border-left-color: #60a5fa;
          background-color: #f0f9ff;
        }

        .event-card.event-green {
          border-left-color: #34d399;
          background-color: #f0fdf4;
        }

        .event-card.event-purple {
          border-left-color: #a855f7;
          background-color: #faf5ff;
        }

        .event-card.event-orange {
          border-left-color: #fb923c;
          background-color: #fff7ed;
        }

        .event-card.event-red {
          border-left-color: #ef4444;
          background-color: #fef2f2;
        }

        .event-main {
          flex: 1;
        }

        .event-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }

        .event-title {
          margin: 0;
          font-size: 1rem;
          font-weight: 600;
          color: var(--color-text-primary, #4a4a4a);
        }

        .event-type-badge {
          background-color: rgba(242, 140, 140, 0.2);
          color: var(--color-primary, #f28c8c);
          padding: 0.2rem 0.6rem;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 500;
        }

        .event-details {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .event-time,
        .event-attendees,
        .event-date {
          font-size: 0.9rem;
          color: var(--color-text-secondary, #6e6e6e);
          display: flex;
          align-items: center;
          gap: 0.3rem;
        }

        .event-actions {
          margin-left: 1rem;
        }

        .delete-btn {
          background: none;
          border: none;
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 6px;
          transition: background-color 0.2s;
          font-size: 1.2rem;
        }

        .delete-btn:hover {
          background-color: #fee2e2;
        }

        .popup-footer {
          padding: 1rem 1.5rem;
          border-top: 1px solid var(--color-border, #f2e6db);
          display: flex;
          justify-content: space-between;
          align-items: center;
          background-color: #faf9f7;
          flex-shrink: 0;
        }

        .events-summary {
          font-size: 0.9rem;
          color: var(--color-text-secondary, #6e6e6e);
          font-weight: 500;
        }

        .close-btn {
          background-color: var(--color-primary, #f28c8c);
          color: white;
          border: none;
          border-radius: 6px;
          padding: 0.5rem 1.5rem;
          font-size: 1rem;
          cursor: pointer;
          transition: background-color 0.3s ease;
        }

        .close-btn:hover {
          background-color: var(--color-accent, #90c5a9);
        }

        @media (max-width: 768px) {
          .popup-container.large {
            margin: 0.5rem;
            max-height: calc(100vh - 1rem);
          }

          .filters-row {
            grid-template-columns: 1fr;
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

          .event-card {
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
