'use client'

import { useState, useEffect } from 'react'
import '../styles/components/character-customization-popup.css'

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
  // Reds & Pinks
  '#e74c3c', // Bright red
  '#FF6F61', // Coral red
  '#DD4124', // Red-orange
  '#BC243C', // Crimson
  '#9B2335', // Deep red
  '#FF33A1', // Hot pink
  '#F7CAC9', // Light pink
  '#C3447A', // Rose
  '#955251', // Mauve

  // Oranges & Yellows
  '#FFC300', // Bright yellow
  '#f39c12', // Gold
  '#d35400', // Burnt orange
  '#EFC050', // Mustard yellow
  '#f4d03f', // Lemon yellow
  '#FFEE93', // Pale yellow
  '#FCF6B1', // Vanilla

  // Greens
  '#DAF7A6', // Mint green
  '#88B04B', // Olive green
  '#2ecc71', // Bright green
  '#27ae60', // Fresh green
  '#16a085', // Deep teal
  '#009B77', // Dark teal

  // Cyans & Aquas
  '#7DF9FF', // Neon cyan
  '#98DDDE', // Pale cyan
  '#1abc9c', // Aqua green
  '#45B8AC', // Soft cyan

  // Blues
  '#3498db', // Light blue
  '#2980b9', // Bright blue
  '#5B5EA6', // Steel blue
  '#92A8D1', // Sky blue
  '#6B5B95', // Indigo

  // Purples
  '#8e44ad', // Purple
  '#9b59b6', // Lavender purple
  '#B565A7', // Violet
  '#A569BD', // Amethyst (optional if adding)

  // Browns & Warm Neutrals
  '#DFCFBE', // Cream
  '#FFC09F', // Soft peach

  // Grays & Cool Neutrals
  '#95a5a6', // Gray
  '#2c3e50', // Dark slate
  '#34495e'  // Steel gray
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
    setEditedMembers([...familyMembers])
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
