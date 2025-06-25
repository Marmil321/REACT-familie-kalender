'use client'

import { useState, useEffect } from 'react'
import './main/styles/main.css'
import AddEventPopup from './main/components/AddEventPopup'
import ViewAllEventsPopup from './main/components/ViewAllEventsPopup'

interface Event {
  id: number
  title: string
  time: string
  attendees: string
  type: 'appointment' | 'school' | 'family' | 'work' | 'sports' | 'annet'
  date: Date
}

export default function FamilyCalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Popup states
  const [isAddPopupOpen, setIsAddPopupOpen] = useState(false)
  const [isViewAllPopupOpen, setIsViewAllPopupOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)

  // Hent hendelser fra API
  const fetchEvents = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/events')
      const result = await response.json()

      if (result.success) {
        // Konverter datostrenger til Date-objekter
        const eventsWithDates = result.data.map((event: Event) => ({
          ...event,
          date: new Date(event.date)
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
  }

  // Hent hendelser når komponenten laster
  useEffect(() => {
    fetchEvents()
  }, [])

  // Get today's events
  const todaysEvents = events.filter(event => {
    const today = new Date()
    return event.date.toDateString() === today.toDateString()
  })

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

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('nb-NO', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  // Generate calendar dates for current month
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

  // Handle date click
  const handleDateClick = (date: Date) => {
    setSelectedDate(date)
    setIsAddPopupOpen(true)
  }

  // Handle add event button click
  const handleAddEventClick = () => {
    setSelectedDate(new Date()) // Default to today
    setIsAddPopupOpen(true)
  }

  // Handle view all events button click
  const handleViewAllEventsClick = () => {
    setIsViewAllPopupOpen(true)
  }

  // Handle popup close
  const handleAddPopupClose = () => {
    setIsAddPopupOpen(false)
    setSelectedDate(undefined)
  }

  const handleViewAllPopupClose = () => {
    setIsViewAllPopupOpen(false)
  }

  // Handle event added/modified
  const handleEventChanged = () => {
    fetchEvents() // Refresh events list
  }

  return (
    <div className="calendar-container">
      <div className="calendar-wrapper">
        <header className="calendar-header">
          <h1 className="calendar-title">
            Familiekalender
          </h1>
          <p className="calendar-date">
            {formatDate(currentDate)}
          </p>
        </header>

        <div className="calendar-grid">
          {/* Today's Events */}
          <div className="events-card">
            <h2 className="card-title">
              Dagens hendelser
            </h2>
            <div className="events-list">
              {loading ? (
                <p className="event-details">Laster hendelser...</p>
              ) : error ? (
                <div>
                  <p className="event-details" style={{ color: 'red' }}>{error}</p>
                  <button
                    onClick={fetchEvents}
                    className="nav-button nav-button-today"
                    style={{ marginTop: '0.5rem' }}
                  >
                    Prøv igjen
                  </button>
                </div>
              ) : todaysEvents.length > 0 ? (
                todaysEvents.map(event => (
                  <div key={event.id} className={`event-item ${getEventTypeClass(event.type)}`}>
                    <p className="event-title">{event.title}</p>
                    <p className="event-details">{event.time} - {event.attendees}</p>
                  </div>
                ))
              ) : (
                <p className="event-details">Ingen hendelser planlagt for i dag</p>
              )}
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="calendar-card">
            <div className="calendar-nav">
              <h2 className="card-title">
                {currentDate.toLocaleDateString('nb-NO', { month: 'long', year: 'numeric' })}
              </h2>
              <div className="nav-buttons">
                <button
                  onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
                  className="nav-button nav-button-prev"
                >
                  ←
                </button>
                <button
                  onClick={() => setCurrentDate(new Date())}
                  className="nav-button nav-button-today"
                >
                  I dag
                </button>
                <button
                  onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
                  className="nav-button nav-button-next"
                >
                  →
                </button>
              </div>
            </div>

            {/* Calendar header */}
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
                const isToday = date.toDateString() === new Date().toDateString()
                const hasEvents = events.some(event =>
                  event.date.toDateString() === date.toDateString()
                )

                return (
                  <div
                    key={i}
                    className={`calendar-date-cell ${!isCurrentMonth ? 'other-month' : ''} ${isToday ? 'today' : ''}`}
                    onClick={() => handleDateClick(date)}
                  >
                    <span className="date-number">{date.getDate()}</span>
                    {hasEvents && <div className="event-dot"></div>}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="quick-actions">
          <button
            className="action-button button-blue"
            onClick={handleAddEventClick}
          >
            Legg til hendelse
          </button>
          <button
            className="action-button button-green"
            onClick={handleViewAllEventsClick}
          >
            Se alle hendelser
          </button>
          <button className="action-button button-purple">
            Familieinnstillinger
          </button>
        </div>
      </div>

      {/* Popups */}
      <AddEventPopup
        isOpen={isAddPopupOpen}
        onClose={handleAddPopupClose}
        onEventAdded={handleEventChanged}
        selectedDate={selectedDate}
      />

      <ViewAllEventsPopup
        isOpen={isViewAllPopupOpen}
        onClose={handleViewAllPopupClose}
        onRefresh={handleEventChanged}
      />
    </div>
  )
}
