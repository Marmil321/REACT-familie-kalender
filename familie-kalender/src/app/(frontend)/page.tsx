'use client'

import { useState, useEffect } from 'react'
import './main/styles/main.css'
import AddEventPopup from './main/components/AddEventPopup'
import ViewAllEventsPopup from './main/components/ViewAllEventsPopup'
import ClickedDatePopup from './main/components/ClickedDatePopup'
import CalendarDateCell from './main/components/CalendarDateCell'
import { familyMembers } from './main/utility/familyMembers'

interface Event {
  id: number
  title: string
  time: string
  attendees: string | Array<{id: string, name: string}> | object | null
  type: 'appointment' | 'school' | 'family' | 'work' | 'sports' | 'annet'
  date: Date
}

// Hjelpefunksjon for å trygt vise deltakere
const renderAttendees = (attendees: string | Array<{id: string, name: string}> | object | null): string => {
  if (!attendees) return ''

  // Hvis det er en streng, returner som den er
  if (typeof attendees === 'string') return attendees

  // Hvis det er en array med objekter som har name-egenskap
  if (Array.isArray(attendees)) {
    return attendees
      .map(attendee => {
        if (typeof attendee === 'object' && attendee !== null && 'name' in attendee) {
          let name = attendee.name
          // Sett første bokstav til stor bokstav
          name = name.charAt(0).toUpperCase() + name.slice(1)
          return name
        }
        return String(attendee)
      })
      .join(', ')
  }

  // Hvis det er et enkelt objekt med name-egenskap
  if (typeof attendees === 'object' && attendees !== null) {
    if ('name' in attendees && typeof attendees.name === 'string') {
      return attendees.name
    }
    // Fallback for andre objektstrukturer
    return JSON.stringify(attendees)
  }

  return String(attendees)
}

// Hjelpefunksjon for å hente ut deltakernavn fra hendelser
const extractAttendeeNames = (attendees: string | Array<{id: string, name: string}> | object | null): string[] => {
  if (!attendees) return []

  // Hvis det er en streng, del på komma eller returner enkelt navn
  if (typeof attendees === 'string') {
    return attendees.split(',').map(name => name.trim().toLowerCase())
  }

  // Hvis det er en array med objekter som har name-egenskap
  if (Array.isArray(attendees)) {
    return attendees
      .map(attendee => {
        if (typeof attendee === 'object' && attendee !== null && 'name' in attendee) {
          return String(attendee.name).toLowerCase()
        }
        return String(attendee).toLowerCase()
      })
      .filter(name => name.length > 0)
  }

  // Hvis det er et enkelt objekt med name-egenskap
  if (typeof attendees === 'object' && attendees !== null) {
    if ('name' in attendees && typeof attendees.name === 'string') {
      return [attendees.name.toLowerCase()]
    }
  }

  return []
}

// Hjelpefunksjon for å få familiemedlemfarger for en bestemt dato
const getFamilyMemberColorsForDate = (date: Date, events: Event[]): string[] => {
  const dateEvents = events.filter(event =>
    event.date.toDateString() === date.toDateString()
  )

  const allAttendeeNames = new Set<string>()

  dateEvents.forEach(event => {
    const attendeeNames = extractAttendeeNames(event.attendees)
    attendeeNames.forEach(name => allAttendeeNames.add(name))
  })

  const colors: string[] = []

  familyMembers.forEach(member => {
    if (allAttendeeNames.has(member.name.toLowerCase())) {
      colors.push(member.color)
    }
  })

  return colors
}

export default function FamilyCalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Popup-tilstander
  const [isAddPopupOpen, setIsAddPopupOpen] = useState(false)
  const [isViewAllPopupOpen, setIsViewAllPopupOpen] = useState(false)
  const [isDayEventsPopupOpen, setIsDayEventsPopupOpen] = useState(false)
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

  // Få dagens hendelser
  const todaysEvents = events.filter(event => {
    const today = new Date()
    return event.date.toDateString() === today.toDateString()
  })

  // Få morgendagens hendelser
  const tomorrowsEvents = events.filter(event => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return event.date.toDateString() === tomorrow.toDateString()
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

  // Håndter datoklikk
  const handleDateClick = (date: Date) => {
    console.log('🎯 Dato klikket fra hovedkomponent:', {
      dato: date.toLocaleDateString('nb-NO'),
      tidspunkt: new Date().toISOString()
    })

    setSelectedDate(date)
    setIsDayEventsPopupOpen(true)
  }

  // Håndter legg til hendelse-knapp klikk
  const handleAddEventClick = () => {
    const today = new Date()
    setSelectedDate(today) // Standard til i dag
    setIsAddPopupOpen(true)
  }

  // Håndter se alle hendelser-knapp klikk
  const handleViewAllEventsClick = () => {
    setIsViewAllPopupOpen(true)
  }

  // Håndter popup lukking
  const handleAddPopupClose = () => {
    setIsAddPopupOpen(false)
    setSelectedDate(undefined)
  }

  const handleViewAllPopupClose = () => {
    setIsViewAllPopupOpen(false)
  }

  const handleDayEventsPopupClose = () => {
    setIsDayEventsPopupOpen(false)
    setSelectedDate(undefined)
  }

  // Håndter legg til hendelse fra dag popup
  const handleAddEventFromDayPopup = (date: Date) => {
    setIsDayEventsPopupOpen(false)
    setSelectedDate(date)
    setIsAddPopupOpen(true)
  }

  // Håndter hendelse lagt til/endret
  const handleEventChanged = () => {
    fetchEvents() // Oppdater hendelsesliste
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
          {/* Dagens og morgendagens hendelser */}
          <div className="events-card">
            <h2 className="card-title">
              Kommende hendelser
            </h2>

            {/* Dagens hendelser-seksjon */}
            <div className="events-section">
              <h3 className="section-title">I dag</h3>
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
                      <p className="event-details">
                        {event.time}
                        {renderAttendees(event.attendees) && ` - ${renderAttendees(event.attendees)}`}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="event-details">Ingen hendelser planlagt for i dag</p>
                )}
              </div>
            </div>

            {/* Morgendagens hendelser-seksjon */}
            <div className="events-section">
              <h3 className="section-title">I morgen</h3>
              <div className="events-list">
                {loading ? (
                  <p className="event-details">Laster hendelser...</p>
                ) : error ? (
                  <p className="event-details" style={{ color: 'red' }}>Kan ikke laste hendelser</p>
                ) : tomorrowsEvents.length > 0 ? (
                  tomorrowsEvents.map(event => (
                    <div key={event.id} className={`event-item ${getEventTypeClass(event.type)}`}>
                      <p className="event-title">{event.title}</p>
                      <p className="event-details">
                        {event.time}
                        {renderAttendees(event.attendees) && ` - ${renderAttendees(event.attendees)}`}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="event-details">Ingen hendelser planlagt for i morgen</p>
                )}
              </div>
            </div>
          </div>

          {/* Kalenderrutenett */}
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
                const isToday = date.toDateString() === new Date().toDateString()
                const familyMemberColors = getFamilyMemberColorsForDate(date, events)

                return (
                  <CalendarDateCell
                    key={i}
                    date={date}
                    isCurrentMonth={isCurrentMonth}
                    isToday={isToday}
                    events={events}
                    familyMemberColors={familyMemberColors}
                    onDateClick={handleDateClick}
                  />
                )
              })}
            </div>
          </div>
        </div>

        {/* Hurtighandlinger */}
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
      <ClickedDatePopup
        isOpen={isDayEventsPopupOpen}
        selectedDate={selectedDate || null}
        events={events}
        onClose={handleDayEventsPopupClose}
        onAddEvent={handleAddEventFromDayPopup}
        onRefresh={handleEventChanged}
      />

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
