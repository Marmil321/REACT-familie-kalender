'use client'

interface QuickActionsProps {
  onAddEvent: () => void
  onViewAllEvents: () => void
  onFamilySettings: () => void
}

export default function QuickActions({
  onAddEvent,
  onViewAllEvents,
  onFamilySettings
}: QuickActionsProps) {
  return (
    <div className="quick-actions">
      <button
        className="action-button button-blue"
        onClick={onAddEvent}
      >
        Legg til hendelse
      </button>
      <button
        className="action-button button-green"
        onClick={onViewAllEvents}
      >
        Se alle hendelser
      </button>
      <button
        className="action-button button-purple"
        onClick={onFamilySettings}
      >
        Familieinnstillinger
      </button>
    </div>
  )
}
