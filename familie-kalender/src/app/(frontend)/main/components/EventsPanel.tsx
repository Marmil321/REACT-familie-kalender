'use client'

import EventsList from './EventsList'

interface Event {
  id: number
  title: string
  time: string
  attendees: string | Array<{id: string, name: string}> | object | null
  type: 'appointment' | 'school' | 'family' | 'work' | 'sports' | 'annet'
  date: Date
}

interface EventsPanelProps {
  todaysEvents: Event[]
  tomorrowsEvents: Event[]
  loading: boolean
  error: string | null
  onRetry: () => void
}

export default function EventsPanel({
  todaysEvents,
  tomorrowsEvents,
  loading,
  error,
  onRetry
}: EventsPanelProps) {
  return (
    <div className="events-card">
      <h2 className="card-title">
        Kommende hendelser
      </h2>

      {/* Dagens hendelser-seksjon */}
      <div className="events-section">
        <h3 className="section-title">I dag</h3>
        <div className="events-list">
          <EventsList
            events={todaysEvents}
            loading={loading}
            error={error}
            onRetry={onRetry}
            emptyMessage="Ingen hendelser planlagt for i dag"
          />
        </div>
      </div>

      {/* Morgendagens hendelser-seksjon */}
      <div className="events-section">
        <h3 className="section-title">I morgen</h3>
        <div className="events-list">
          <EventsList
            events={tomorrowsEvents}
            loading={loading}
            error={error}
            onRetry={onRetry}
            emptyMessage="Ingen hendelser planlagt for i morgen"
          />
        </div>
      </div>
    </div>
  )
}
