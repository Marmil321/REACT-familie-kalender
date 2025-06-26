// hooks/useCurrentTime.ts
import { useState, useEffect } from 'react'

export function useCurrentTime() {
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    // Funksjon for å beregne tid til neste midnatt
    const getTimeUntilMidnight = () => {
      const now = new Date()
      const midnight = new Date(now)
      midnight.setHours(24, 0, 0, 0) // Neste midnatt
      return midnight.getTime() - now.getTime()
    }

    // Funksjon for å oppdatere tid
    const updateTime = () => {
      setCurrentTime(prevTime => {
        const now = new Date()
        const previousTime = prevTime

        // Logg når dagen skifter
        const dayChanged = now.toDateString() !== previousTime.toDateString()
        if (dayChanged) {
          console.log('🌅 Ny dag registrert:', {
            gammelDag: previousTime.toLocaleDateString('nb-NO'),
            nyDag: now.toLocaleDateString('nb-NO'),
            tidspunkt: now.toLocaleTimeString('nb-NO')
          })
        }
        return now
      })
    }

    // Første oppdatering
    updateTime()

    // Sett opp timer til neste midnatt
    const timeUntilMidnight = getTimeUntilMidnight()
    const midnightTimeout = setTimeout(() => {
      updateTime()

      // Sett opp intervall som kjører hver time etter midnatt
      const hourlyInterval = setInterval(updateTime, 60 * 60 * 1000)

      return () => clearInterval(hourlyInterval)
    }, timeUntilMidnight)

    // Også kjør hvert minutt for å være sikker
    const minuteInterval = setInterval(updateTime, 60 * 1000)

    // Rydd opp
    return () => {
      clearTimeout(midnightTimeout)
      clearInterval(minuteInterval)
    }
  }, []) // Tom dependency array

  return currentTime
}

// Hjelpefunksjoner for å jobbe med tid
export const timeUtils = {
  isToday: (date: Date, currentTime: Date) => {
    return date.toDateString() === currentTime.toDateString()
  },

  isTomorrow: (date: Date, currentTime: Date) => {
    const tomorrow = new Date(currentTime)
    tomorrow.setDate(tomorrow.getDate() + 1)
    return date.toDateString() === tomorrow.toDateString()
  },

  isPast: (date: Date, currentTime: Date) => {
    const today = new Date(currentTime)
    today.setHours(0, 0, 0, 0)
    const eventDate = new Date(date)
    eventDate.setHours(0, 0, 0, 0)
    return eventDate < today
  },

  formatNorwegian: (date: Date) => {
    return date.toLocaleDateString('nb-NO', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }
}
