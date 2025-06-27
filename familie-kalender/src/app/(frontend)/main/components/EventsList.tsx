'use client'

import { useEffect, useState } from 'react'
import { getFamilyMembers, FamilyMember } from '../utility/familyMembers'

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
const renderAttendees = (attendees: string | Array<{id: string, name: string}> | object | null, familyMembers: FamilyMember[]): string => {
  if (!attendees) return ''

  const getDisplayName = (name: string) => {
    const member = familyMembers.find(m => m.name.toLowerCase() === name.toLowerCase())
    if (member && member.emoji) {
      return `${member.emoji} ${member.name}`
    }
    return name.charAt(0).toUpperCase() + name.slice(1)
  }

  if (typeof attendees === 'string') {
    return attendees.split(',').map(name => getDisplayName(name.trim())).join(', ')
  }

  if (Array.isArray(attendees)) {
    return attendees
      .map(attendee => {
        if (typeof attendee === 'object' && attendee !== null && 'name' in attendee) {
          return getDisplayName(attendee.name)
        }
        return String(attendee)
      })
      .join(', ')
  }

  if (typeof attendees === 'object' && attendees !== null) {
    if ('name' in attendees && typeof attendees.name === 'string') {
      return getDisplayName(attendees.name)
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
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([])

  useEffect(() => {
    const members = getFamilyMembers()
    setFamilyMembers(members)
  }, [])

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
            {renderAttendees(event.attendees, familyMembers) && ` - ${renderAttendees(event.attendees, familyMembers)}`}
          </p>
        </div>
      ))}
    </>
  )
}
