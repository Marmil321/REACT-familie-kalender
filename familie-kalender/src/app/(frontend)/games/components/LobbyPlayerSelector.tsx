"use client";

import React, { useState, useEffect } from "react";
import { FamilyMember, getFamilyMembers } from "@/app/(frontend)/main/utility/familyMembers";
import '../styles/components/lobby-player-selector.css'

export default function PlayerSelector() {
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    const members = getFamilyMembers();
    setFamilyMembers(members);
  }, []);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  return (
   <section className="player-selector">
  <div>
    <h3 className="h3-select-players">Selected Players:</h3>
    {selectedIds.length === 0 ? (
      <p className="no-selection">No players selected.</p>
    ) : (
      <>
        <div className="selected-emoji-box">
          {selectedIds.map((id) => {
            const member = familyMembers.find((m) => m.id === id);
            return (
              <span
                key={id}
                className="emoji"
                title={member?.name}
                style={{ color: member?.color, fontSize: '2rem', marginRight: '0.5rem' }}
              >
                {member?.emoji || member?.name.charAt(0)}
              </span>
            );
          })}
        </div>
        <ul className="selected-names">
          {selectedIds.map((id) => {
            const member = familyMembers.find((m) => m.id === id);
            return (
              <li key={id} style={{ color: member?.color }}>
                {member?.name}
              </li>
            );
          })}
        </ul>
      </>
    )}
  </div>

<h2>Who’s playing?</h2>
<div className="checkbox-container">
  {familyMembers.map(({ id, name, color, emoji }) => {
    const isSelected = selectedIds.includes(id);
    return (
      <label
        key={id}
        className={`checkbox-label ${isSelected ? 'selected' : 'unselected'}`}
        style={{ backgroundColor: isSelected ? color : 'white', color: isSelected ? '#fff' : '#000' }}
      >
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => toggleSelect(id)}
          style={{ marginRight: '0.5rem' }}
        />
        {emoji ? `${emoji} ` : '? '}
        {name}
      </label>
    );
  })}
</div>

</section>
  );
}
