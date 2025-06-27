'use client'

import { useState, useEffect } from 'react'
import '../styles/components/character-customization-popup.css'
import { defaultFamilyMembers } from '../utility/familyMembers'

interface FamilyMember {
  name: string
  id: string
  color: string
  emoji?: string
}

interface CharacterCustomizationPopupProps {
  isOpen: boolean
  onClose: () => void
  familyMembers: FamilyMember[]
  onSave: (updatedMembers: FamilyMember[]) => void
}

const availableEmojis = [
  // People
  '👨', '👩', '👦', '👧', '👶', '🧑', '👨‍🦰', '👩‍🦰', '👨‍🦱', '👩‍🦱',
  '👨‍🦳', '👩‍🦳', '👨‍🦲', '👩‍🦲', '🧔', '👱‍♂️', '👱‍♀️', '🧒', '👵', '👴',
  '🧑‍🎓', '🧑‍🏫', '🧑‍💻', '🧑‍🎨', '🧑‍🚀', '🧑‍🚒', '👮‍♂️', '👮‍♀️',
  '👷‍♂️', '👷‍♀️', '💂‍♂️', '💂‍♀️', '🕵️‍♂️', '🕵️‍♀️',

  // Faces
  '😀', '😊', '😎', '🤓', '😇', '🥰', '😍', '🤩', '😋', '😜',
  '😅', '😂', '😭', '😡', '😱', '🤯', '😴', '🤤', '😷', '🤒',

  // Animals
  '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯',
  '🦁', '🐮', '🐷', '🐸', '🐵', '🐔', '🐧', '🐦', '🐤', '🦄',
  '🐙', '🐢', '🐬', '🐳', '🦋', '🕷️', '🐝', '🐞', '🦀', '🐊',

  // Symbols/Nature
  '⭐', '🌟', '✨', '💫', '🌈', '☀️', '🌙', '🌸', '🌺', '🌻',
  '🌼', '🌷', '🌹', '🌵', '🌴', '🍀', '🍁', '🍂', '🍃', '🔥'
];

const availableColors = [
  '#e74c3c', '#FF6F61', '#DD4124', '#BC243C', '#9B2335', '#FF33A1', '#F7CAC9', '#C3447A', '#955251', // red shades
  '#FFC300', '#f39c12', '#d35400', '#EFC050', '#f4d03f', '#FFEE93', '#FCF6B1', // yellow shades
  '#DAF7A6', '#88B04B', '#2ecc71', '#27ae60', '#16a085', '#009B77', // green shades
  '#7DF9FF', '#98DDDE', '#1abc9c', '#45B8AC', '#3498db', '#2980b9', '#5B5EA6', '#92A8D1', '#6B5B95',// blue shades
  '#8e44ad', '#9b59b6', '#B565A7', '#A569BD', // purple shades
  '#DFCFBE', '#FFC09F', // beige shades
  '#95a5a6', '#2c3e50', '#34495e' // gray shades
];



export default function CharacterCustomizationPopup({
  isOpen,
  onClose,
  familyMembers,
  onSave
}: CharacterCustomizationPopupProps) {
  const [editedMembers, setEditedMembers] = useState<FamilyMember[]>([])
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      setEditedMembers([...familyMembers])
      setSelectedMemberId(familyMembers[0]?.id || null)
    }
  }, [isOpen, familyMembers])

  const handleColorChange = (memberId: string, color: string) => {
    setEditedMembers(prev =>
      prev.map(member =>
        member.id === memberId ? { ...member, color } : member
      )
    )
  }

  const handleEmojiChange = (memberId: string, emoji: string) => {
    setEditedMembers(prev =>
      prev.map(member =>
        member.id === memberId ? { ...member, emoji } : member
      )
    )
  }

  const handleSave = () => {
    onSave(editedMembers)
    onClose()
  }

const handleReset = () => {
  // sjekk om det er et valgt familiemedlem
  if (!selectedMemberId) return;

  // med valgt medlem id, finn default verdien til medlemmet
  console.log('Resetting member:', selectedMemberId)
  const original = defaultFamilyMembers.find(member => member.id === selectedMemberId);
  console.log('Original member:', original)

  // hvis default verdien ikke finnes, gjør ingenting
  if (!original) return;

  setEditedMembers(prev =>
    prev.map(member =>
      member.id === selectedMemberId ? { ...original } : member
    )
  );
}

  if (!isOpen) return null

  const selectedMember = editedMembers.find(m => m.id === selectedMemberId)

  return (
    <div className="popup-overlay">
      <div className="popup-container character-popup">
        <div className="popup-header">
          <h2 className="popup-title">Tilpass familiemedlemmer</h2>
          <button
            type="button"
            onClick={onClose}
            className="popup-close-button"
          >
            ×
          </button>
        </div>

        <div className="customization-content">
          {/* Familiemedlem-liste */}
          <div className="members-sidebar">
            <h3 className="sidebar-title">Familiemedlemmer</h3>
            <div className="members-list">
              {editedMembers.map(member => (
                <button
                  key={member.id}
                  className={`member-item ${selectedMemberId === member.id ? 'selected' : ''}`}
                  onClick={() => setSelectedMemberId(member.id)}
                >
                  <span className="member-emoji">{member.emoji || '👤'}</span>
                  <span className="member-name">{member.name}</span>
                  <div
                    className="member-color-indicator"
                    style={{ backgroundColor: member.color }}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Tilpasningsområde */}
          {selectedMember && (
            <div className="customization-area">
              <div className="preview-section">
                <h3 className="section-title">Forhåndsvisning</h3>
                <div className="preview-card" style={{ backgroundColor: selectedMember.color + '20' }}>
                  <div className="preview-emoji">{selectedMember.emoji || '👤'}</div>
                  <div className="preview-name">{selectedMember.name}</div>
                </div>
              </div>

              <div className="emoji-section">
                <h3 className="section-title">Velg karakter</h3>
                <div className="emoji-grid">
                  <button
                    className={`emoji-option ${!selectedMember.emoji ? 'selected' : ''}`}
                    onClick={() => handleEmojiChange(selectedMember.id, '')}
                  >
                    👤
                  </button>
                  {availableEmojis.map(emoji => (
                    <button
                      key={emoji}
                      className={`emoji-option ${selectedMember.emoji === emoji ? 'selected' : ''}`}
                      onClick={() => handleEmojiChange(selectedMember.id, emoji)}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div className="color-section">
                <h3 className="section-title">Velg farge</h3>
                <div className="color-grid">
                  {availableColors.map(color => (
                    <button
                      key={color}
                      className={`color-option ${selectedMember.color === color ? 'selected' : ''}`}
                      style={{ backgroundColor: color }}
                      onClick={() => handleColorChange(selectedMember.id, color)}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="popup-footer">
          <button
            onClick={handleReset}
            className="button-secondary"
          >
            Tilbakestill
          </button>
          <div className="footer-actions">
            <button
              onClick={onClose}
              className="button-secondary"
            >
              Avbryt
            </button>
            <button
              onClick={handleSave}
              className="button-primary"
            >
              Lagre endringer
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
