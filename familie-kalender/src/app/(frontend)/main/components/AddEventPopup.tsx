'use client'

import { useState, useEffect } from 'react'
import { familyMembers } from '../utility/familyMembers'
import '../styles/components/add-event-popup.css'

interface Event {
  id?: number
  title: string
  time: string
  attendees: Array<{name: string}>
  type: 'appointment' | 'school' | 'family' | 'work' | 'sports' | 'annet'
  date: Date
}

interface AddEventPopupProps {
  isOpen: boolean
  onClose: () => void
  onEventAdded: () => void
  selectedDate?: Date
}

export default function AddEventPopup({ isOpen, onClose, onEventAdded, selectedDate }: AddEventPopupProps) {
  // Helper function to format date for input (fixes timezone issue)
  const formatDateForInput = (date: Date) => {
    const adjustedDate = new Date(date)
    adjustedDate.setDate(adjustedDate.getDate() + 1) // Add 1 day to fix timezone issue
    return adjustedDate.toISOString().split('T')[0]
  }

  const [formData, setFormData] = useState({
    title: '',
    date: selectedDate ? formatDateForInput(selectedDate) : formatDateForInput(new Date()),
    time: '',
    type: 'family' as Event['type']
  })

  const [selectedFamilyMembers, setSelectedFamilyMembers] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Update form data when selectedDate changes
  useEffect(() => {
    if (selectedDate) {
      setFormData(prev => ({
        ...prev,
        date: formatDateForInput(selectedDate)
      }))
    }
  }, [selectedDate])

  // Reset form when popup opens/closes
  useEffect(() => {
    if (isOpen) {
      // Reset form when opening
      setFormData({
        title: '',
        date: selectedDate ? formatDateForInput(selectedDate) : formatDateForInput(new Date()),
        time: '',
        type: 'family'
      })
      setSelectedFamilyMembers([])
      setError(null)
    }
  }, [isOpen, selectedDate])

  const eventTypes = [
    { value: 'family', label: 'Familie' },
    { value: 'work', label: 'Arbeid' },
    { value: 'school', label: 'Skole' },
    { value: 'appointment', label: 'Avtale' },
    { value: 'sports', label: 'Sport' },
    { value: 'annet', label: 'Annet' }
  ]

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleFamilyMemberToggle = (memberId: string) => {
    setSelectedFamilyMembers(prev => {
      if (prev.includes(memberId)) {
        return prev.filter(id => id !== memberId)
      } else {
        return [...prev, memberId]
      }
    })
  }

  const handleSelectAll = () => {
    setSelectedFamilyMembers(familyMembers.map(member => member.id))
  }

  const handleDeselectAll = () => {
    setSelectedFamilyMembers([])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      // Build attendees data - let database auto-generate IDs
      let attendees: Array<{name: string}> = []

      if (selectedFamilyMembers.length > 0) {
        attendees = selectedFamilyMembers.map(memberId => {
          const member = familyMembers.find(fm => fm.id === memberId)
          return {
            name: member?.name.toLowerCase() || memberId.toLowerCase()
          }
        })
      }

      const submitData = {
        ...formData,
        attendees
      }

      console.log('Submitting event data:', JSON.stringify(submitData, null, 2))

      const response = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(submitData)
      })

      const result = await response.json()

      if (result.success) {
        // Reset form
        setFormData({
          title: '',
          date: selectedDate ? formatDateForInput(selectedDate) : formatDateForInput(new Date()),
          time: '',
          type: 'family'
        })
        setSelectedFamilyMembers([])

        // Notify parent component
        onEventAdded()
        onClose()
      } else {
        setError(result.error || 'Kunne ikke opprette hendelse')
      }
    } catch (err) {
      setError('Nettverksfeil ved opprettelse av hendelse')
      console.error('Feil ved opprettelse av hendelse:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      setError(null)
      setSelectedFamilyMembers([])
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="popup-overlay">
      <div className="popup-container">
        <div className="popup-header">
          <h2 className="popup-title">Legg til ny hendelse</h2>
          <button
            type="button"
            onClick={handleClose}
            className="popup-close-button"
            disabled={isSubmitting}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="popup-form">
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="title" className="form-label">
              Tittel *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="form-input"
              required
              placeholder="Skriv inn hendelsens tittel"
              disabled={isSubmitting}
            />
          </div>

          <div className="form-group">
            <label htmlFor="type" className="form-label">
              Type hendelse *
            </label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              className="form-select"
              required
              disabled={isSubmitting}
            >
              {eventTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="date" className="form-label">
                Dato *
              </label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                className="form-input"
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="form-group">
              <label htmlFor="time" className="form-label">
                Tidspunkt *
              </label>
              <input
                type="time"
                id="time"
                name="time"
                value={formData.time}
                onChange={handleInputChange}
                className="form-input"
                required
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Family Members Selection */}
          <div className="form-group">
            <div className="family-members-header">
              <label className="form-label">
                Familiemedlemmer
              </label>
              <div className="selection-buttons">
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="select-button select-all"
                  disabled={isSubmitting}
                >
                  Velg alle
                </button>
                <button
                  type="button"
                  onClick={handleDeselectAll}
                  className="select-button deselect-all"
                  disabled={isSubmitting}
                >
                  Fjern alle
                </button>
              </div>
            </div>
            <div className="family-members-grid">
              {familyMembers.map(member => (
                <label key={member.id} className="family-member-option">
                  <input
                    type="checkbox"
                    checked={selectedFamilyMembers.includes(member.id)}
                    onChange={() => handleFamilyMemberToggle(member.id)}
                    disabled={isSubmitting}
                    className="family-member-checkbox"
                  />
                  <div
                    className="family-member-indicator"
                    style={{ backgroundColor: member.color }}
                  />
                  <span className="family-member-name">{member.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={handleClose}
              className="button-secondary"
              disabled={isSubmitting}
            >
              Avbryt
            </button>
            <button
              type="submit"
              className="button-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Lagrer...' : 'Lagre hendelse'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
