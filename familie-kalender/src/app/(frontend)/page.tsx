'use client'

import { useState } from 'react'
import './main/styles/main.css'

interface Event {
  id: number
  title: string
  time: string
  attendees: string
  type: 'appointment' | 'school' | 'family' | 'work' | 'sports' | 'zzZZ' | 'annet'
  date: Date
}

export default function FamilyCalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date())

  // Dummy events data
  const dummyEvents: Event[] = [
    {
      id: 1,
      title: 'Sove',
      time: '20:00',
      attendees: 'Noomi',
      type: 'zzZZ',
      date: new Date()
    },
    {
      id: 2,
      title: 'Slutte å mase',
      time: '7:00 PM',
      attendees: 'Mamma',
      type: 'annet',
      date: new Date()
    },
    {
      id: 3,
      title: 'Dentist Appointment',
      time: '10:30 AM',
      attendees: 'Jake',
      type: 'appointment',
      date: new Date(Date.now() + 86400000) // Tomorrow
    },
    {
      id: 4,
      title: 'Piano Lesson',
      time: '4:00 PM',
      attendees: 'Emma',
      type: 'appointment',
      date: new Date(Date.now() + 86400000) // Tomorrow
    },
    {
      id: 5,
      title: 'Family Movie Night',
      time: '7:30 PM',
      attendees: 'Whole Family',
      type: 'family',
      date: new Date(Date.now() + 172800000) // Day after tomorrow
    },
    {
      id: 6,
      title: 'School Science Fair',
      time: '6:00 PM',
      attendees: 'Jake & Parents',
      type: 'school',
      date: new Date(Date.now() + 259200000) // 3 days from now
    }
  ]

  // Get today's events
  const todaysEvents = dummyEvents.filter(event => {
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
      zzZZ: 'event-blue',
      annet: 'event-green'
    }
    return typeClasses[type]
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
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
    const lastDay = new Date(year, month + 1, 0)
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
    <div className="calendar-container">
      <div className="calendar-wrapper">
        <header className="calendar-header">
          <h1 className="calendar-title">
            Family Calendar
          </h1>
          <p className="calendar-date">
            {formatDate(currentDate)}
          </p>
        </header>

        <div className="calendar-grid">
          {/* Today's Events */}
          <div className="events-card">
            <h2 className="card-title">
              Todays Events
            </h2>
            <div className="events-list">
              {todaysEvents.length > 0 ? (
                todaysEvents.map(event => (
                  <div key={event.id} className={`event-item ${getEventTypeClass(event.type)}`}>
                    <p className="event-title">{event.title}</p>
                    <p className="event-details">{event.time} - {event.attendees}</p>
                  </div>
                ))
              ) : (
                <p className="event-details">No events scheduled for today</p>
              )}
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="calendar-card">
            <div className="calendar-nav">
              <h2 className="card-title">
                {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
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
                  Today
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
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="calendar-day-header">
                  {day}
                </div>
              ))}
            </div>

            <div className="calendar-dates">
              {calendarDates.map((date, i) => {
                const isCurrentMonth = date.getMonth() === currentDate.getMonth()
                const isToday = date.toDateString() === new Date().toDateString()
                const hasEvents = dummyEvents.some(event =>
                  event.date.toDateString() === date.toDateString()
                )

                return (
                  <div
                    key={i}
                    className={`calendar-date-cell ${!isCurrentMonth ? 'other-month' : ''} ${isToday ? 'today' : ''}`}
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
          <button className="action-button button-blue">
            Add Event
          </button>
          <button className="action-button button-green">
            View All Events
          </button>
          <button className="action-button button-purple">
            Family Settings
          </button>
        </div>
      </div>
    </div>
  )
}
