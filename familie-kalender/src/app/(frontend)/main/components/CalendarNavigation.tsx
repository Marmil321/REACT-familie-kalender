'use client'

interface CalendarNavigationProps {
  currentDate: Date
  currentTime: Date
  onPreviousMonth: () => void
  onNextMonth: () => void
  onToday: () => void
}

export default function CalendarNavigation({
  currentDate,
  //currentTime,
  onPreviousMonth,
  onNextMonth,
  onToday
}: CalendarNavigationProps) {
  return (
    <div className="calendar-nav">
      <h2 className="card-title">
        {currentDate.toLocaleDateString('nb-NO', { month: 'long', year: 'numeric' })}
      </h2>
      <div className="nav-buttons">
        <button
          onClick={onPreviousMonth}
          className="nav-button nav-button-prev"
        >
          ←
        </button>
        <button
          onClick={onToday}
          className="nav-button nav-button-today"
        >
          I dag
        </button>
        <button
          onClick={onNextMonth}
          className="nav-button nav-button-next"
        >
          →
        </button>
      </div>
    </div>
  )
}
