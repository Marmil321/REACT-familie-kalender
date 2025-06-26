'use client'

import { useState } from 'react'
import { familyMembers } from '../utility/familyMembers'

interface Event {
  id?: number
  title: string
  time: string
  attendees: string | Array<{id: string, name: string}>
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
  const [formData, setFormData] = useState({
    title: '',
    date: selectedDate ? selectedDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    time: '',
    type: 'family' as Event['type']
  })

  const [selectedFamilyMembers, setSelectedFamilyMembers] = useState<string[]>([])
  const [customAttendees, setCustomAttendees] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      // Build attendees data - matching the expected API format
      let attendees: string | Array<{id: string, name: string}> = ''

      if (selectedFamilyMembers.length > 0) {
        attendees = selectedFamilyMembers.map(memberId => {
          const member = familyMembers.find(fm => fm.id === memberId)
          return {
            id: memberId, // Use the simple ID for now, let backend handle ObjectId generation
            name: member?.name.toLowerCase() || memberId.toLowerCase()
          }
        })

        // If there are also custom attendees, combine them
        if (customAttendees.trim()) {
          if (typeof attendees === 'object' && Array.isArray(attendees)) {
            const customNames = customAttendees.split(',').map(name => name.trim()).filter(name => name.length > 0)
            customNames.forEach(name => {
              (attendees as Array<{id: string, name: string}>).push({
                id: name.toLowerCase().replace(/\s+/g, ''), // Simple ID from name
                name: name.toLowerCase()
              })
            })
          }
        }
      } else if (customAttendees.trim()) {
        // Only custom attendees - convert to array format
        const customNames = customAttendees.split(',').map(name => name.trim()).filter(name => name.length > 0)
        attendees = customNames.map(name => ({
          id: name.toLowerCase().replace(/\s+/g, ''),
          name: name.toLowerCase()
        }))
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
          date: selectedDate ? selectedDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          time: '',
          type: 'family'
        })
        setSelectedFamilyMembers([])
        setCustomAttendees('')

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
      setCustomAttendees('')
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
            <label className="form-label">
              Familiemedlemmer
            </label>
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

          {/* Custom Attendees */}
          <div className="form-group">
            <label htmlFor="customAttendees" className="form-label">
              Andre deltakere
            </label>
            <input
              type="text"
              id="customAttendees"
              value={customAttendees}
              onChange={(e) => setCustomAttendees(e.target.value)}
              className="form-input"
              placeholder="Andre deltakere (kommaseparert)"
              disabled={isSubmitting}
            />
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

      <style jsx>{`
        .popup-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 1rem;
        }

        .popup-container {
          background-color: white;
          border-radius: 1rem;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
          width: 100%;
          max-width: 500px;
          max-height: 90vh;
          overflow-y: auto;
        }

        .popup-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem 1.5rem 0 1.5rem;
          border-bottom: 1px solid var(--color-border, #f2e6db);
          margin-bottom: 1.5rem;
        }

        .popup-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--color-primary, #f28c8c);
          margin: 0;
        }

        .popup-close-button {
          background: none;
          border: none;
          font-size: 2rem;
          color: var(--color-text-secondary, #6e6e6e);
          cursor: pointer;
          padding: 0;
          width: 2rem;
          height: 2rem;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          transition: background-color 0.2s;
        }

        .popup-close-button:hover:not(:disabled) {
          background-color: var(--color-border, #f2e6db);
        }

        .popup-close-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .popup-form {
          padding: 0 1.5rem 1.5rem 1.5rem;
        }

        .form-group {
          margin-bottom: 1.25rem;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .form-label {
          display: block;
          font-weight: 600;
          color: var(--color-text-primary, #4a4a4a);
          margin-bottom: 0.5rem;
          font-size: 0.9rem;
        }

        .form-input,
        .form-select {
          width: 100%;
          padding: 0.75rem;
          border: 2px solid var(--color-border, #f2e6db);
          border-radius: 8px;
          font-size: 1rem;
          font-family: 'Nunito', sans-serif;
          background-color: white;
          color: var(--color-text-primary, #4a4a4a);
          transition: border-color 0.3s ease, box-shadow 0.3s ease;
        }

        .form-input:focus,
        .form-select:focus {
          outline: none;
          border-color: var(--color-primary, #f28c8c);
          box-shadow: 0 0 0 3px rgba(242, 140, 140, 0.1);
        }

        .form-input:disabled,
        .form-select:disabled {
          background-color: #f5f5f5;
          opacity: 0.7;
          cursor: not-allowed;
        }

        .form-input::placeholder {
          color: var(--color-text-secondary, #6e6e6e);
        }

        /* Family Members Selection Styles */
        .family-members-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 0.75rem;
          margin-top: 0.5rem;
        }

        .family-member-option {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem;
          border: 2px solid var(--color-border, #f2e6db);
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
          background-color: white;
        }

        .family-member-option:hover {
          border-color: var(--color-primary, #f28c8c);
          background-color: #fef2f2;
        }

        .family-member-option:has(.family-member-checkbox:checked) {
          border-color: var(--color-primary, #f28c8c);
          background-color: rgba(242, 140, 140, 0.1);
        }

        .family-member-checkbox {
          margin: 0;
          cursor: pointer;
        }

        .family-member-indicator {
          width: 0.75rem;
          height: 0.75rem;
          border-radius: 50%;
          border: 1px solid rgba(0, 0, 0, 0.1);
          flex-shrink: 0;
        }

        .family-member-name {
          font-size: 0.9rem;
          font-weight: 500;
          color: var(--color-text-primary, #4a4a4a);
        }

        .error-message {
          background-color: #fef2f2;
          border: 1px solid #fecaca;
          color: #dc2626;
          padding: 0.75rem;
          border-radius: 8px;
          margin-bottom: 1rem;
          font-size: 0.9rem;
        }

        .form-actions {
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
          margin-top: 2rem;
          padding-top: 1rem;
          border-top: 1px solid var(--color-border, #f2e6db);
        }

        .button-primary {
          background-color: var(--color-primary, #f28c8c);
          color: white;
          border: none;
          border-radius: 8px;
          padding: 0.75rem 1.5rem;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: background-color 0.3s ease, transform 0.2s ease;
        }

        .button-primary:hover:not(:disabled) {
          background-color: var(--color-accent, #90c5a9);
          transform: translateY(-1px);
        }

        .button-primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .button-secondary {
          background-color: transparent;
          color: var(--color-text-secondary, #6e6e6e);
          border: 2px solid var(--color-border, #f2e6db);
          border-radius: 8px;
          padding: 0.75rem 1.5rem;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .button-secondary:hover:not(:disabled) {
          border-color: var(--color-primary, #f28c8c);
          color: var(--color-primary, #f28c8c);
        }

        .button-secondary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        @media (max-width: 640px) {
          .popup-container {
            margin: 1rem;
            max-height: calc(100vh - 2rem);
          }

          .form-row {
            grid-template-columns: 1fr;
          }

          .family-members-grid {
            grid-template-columns: 1fr;
          }

          .form-actions {
            flex-direction: column-reverse;
          }

          .button-primary,
          .button-secondary {
            width: 100%;
          }
        }
      `}</style>
    </div>
  )
}
