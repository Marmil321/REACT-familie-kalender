'use client'

import { useState, useEffect } from 'react'
import './main/styles/main.css'
import CalendarHeader from './main/components/CalendarHeader'
import EventsPanel from './main/components/EventsPanel'
import CalendarGrid from './main/components/CalendarGrid'
import QuickActions from './main/components/QuickActions'
import AddEventPopup from './main/components/AddEventPopup'
import ViewAllEventsPopup from './main/components/ViewAllEventsPopup'
import ClickedDatePopup from './main/components/ClickedDatePopup'
import CharacterCustomizationPopup from './main/components/CharacterCustomizationPopup'
import { getFamilyMembers, saveFamilyMembers, FamilyMember } from './main/utility/familyMembers'
import { useCurrentTime, timeUtils } from './main/hooks/useCurrentTime'

interface Event {
  id: number
  title: string
  time: string
  attendees: string | Array<{id: string, name: string}> | object | null
  type: 'appointment' | 'school' | 'family' | 'work' | 'sports' | 'annet'
  date: Date
}

// Hjelpefunksjon for å hente ut deltakernavn fra hendelser
const extractAttendeeNames = (attendees: string | Array<{id: string, name: string}> | object | null): string[] => {
  if (!attendees) return []

  if (typeof attendees === 'string') {
    return attendees.split(',').map(name => name.trim().toLowerCase())
  }

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

  if (typeof attendees === 'object' && attendees !== null) {
    if ('name' in attendees && typeof attendees.name === 'string') {
      return [attendees.name.toLowerCase()]
    }
  }

  return []
}

// Hjelpefunksjon for å få familiemedlemfarger for en bestemt dato
const getFamilyMemberColorsForDate = (date: Date, events: Event[], members: FamilyMember[]): string[] => {
  const dateEvents = events.filter(event =>
    event.date.toDateString() === date.toDateString()
  )

  const allAttendeeNames = new Set<string>()

  dateEvents.forEach(event => {
    const attendeeNames = extractAttendeeNames(event.attendees)
    attendeeNames.forEach(name => allAttendeeNames.add(name))
  })

  const colors: string[] = []

  members.forEach(member => {
    if (allAttendeeNames.has(member.name.toLowerCase())) {
      colors.push(member.color)
    }
  })

  return colors
}

export default function FamilyCalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const currentTime = useCurrentTime()
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Familiemedlemmer state
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([])

  // Popup-tilstander
  const [isAddPopupOpen, setIsAddPopupOpen] = useState(false)
  const [isViewAllPopupOpen, setIsViewAllPopupOpen] = useState(false)
  const [isDayEventsPopupOpen, setIsDayEventsPopupOpen] = useState(false)
  const [isCharacterCustomizationOpen, setIsCharacterCustomizationOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)

  // Filtrer hendelser basert på dagens og morgendagens dato
  const todaysEvents = events.filter(event =>
    timeUtils.isToday(event.date, currentTime)
  )

  const tomorrowsEvents = events.filter(event =>
    timeUtils.isTomorrow(event.date, currentTime)
  )

  // Hent hendelser fra API
  const fetchEvents = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/events')
      const result = await response.json()

      if (result.success) {
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

  // Last inn familiemedlemmer fra localStorage
  useEffect(() => {
    const members = getFamilyMembers()
    setFamilyMembers(members)
  }, [])

  // Navigation handlers
  const handlePreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
  }

  const handleToday = () => {
    setCurrentDate(new Date(currentTime))
  }

  // Date click handler
  const handleDateClick = (date: Date) => {
    console.log('🎯 Dato klikket fra hovedkomponent:', {
      dato: date.toLocaleDateString('nb-NO'),
      tidspunkt: new Date().toISOString()
    })

    setSelectedDate(date)
    setIsDayEventsPopupOpen(true)
  }

  // Action handlers
  const handleAddEventClick = () => {
    setSelectedDate(new Date(currentTime))
    setIsAddPopupOpen(true)
  }

  const handleViewAllEventsClick = () => {
    setIsViewAllPopupOpen(true)
  }

  const handleFamilySettingsClick = () => {
    setIsCharacterCustomizationOpen(true)
  }

  // Character customization handlers
  const handleSaveFamilyMembers = (updatedMembers: FamilyMember[]) => {
    setFamilyMembers(updatedMembers)
    saveFamilyMembers(updatedMembers)
  }

  // Popup close handlers
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

  // Event change handlers
  const handleAddEventFromDayPopup = (date: Date) => {
    setIsDayEventsPopupOpen(false)
    setSelectedDate(date)
    setIsAddPopupOpen(true)
  }

  const handleEventChanged = () => {
    fetchEvents() // Oppdater hendelsesliste
  }

  return (
    <div className="calendar-container">
      <div className="calendar-wrapper">
        <CalendarHeader currentTime={currentTime} />

        <div className="calendar-grid">
          <EventsPanel
            todaysEvents={todaysEvents}
            tomorrowsEvents={tomorrowsEvents}
            loading={loading}
            error={error}
            onRetry={fetchEvents}
          />

          <CalendarGrid
            currentDate={currentDate}
            currentTime={currentTime}
            events={events}
            onDateClick={handleDateClick}
            onPreviousMonth={handlePreviousMonth}
            onNextMonth={handleNextMonth}
            onToday={handleToday}
            getFamilyMemberColorsForDate={(date, events) => getFamilyMemberColorsForDate(date, events, familyMembers)}
          />
        </div>

        <QuickActions
          onAddEvent={handleAddEventClick}
          onViewAllEvents={handleViewAllEventsClick}
          onFamilySettings={handleFamilySettingsClick}
        />
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

      <CharacterCustomizationPopup
        isOpen={isCharacterCustomizationOpen}
        onClose={() => setIsCharacterCustomizationOpen(false)}
        familyMembers={familyMembers}
        onSave={handleSaveFamilyMembers}
      />
    </div>
  )
}
