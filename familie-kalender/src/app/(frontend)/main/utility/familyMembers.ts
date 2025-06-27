// utility/familyMembers.ts
export interface FamilyMember {
  name: string
  id: string
  color: string
  emoji?: string
}
export const defaultFamilyMembers: FamilyMember[] = [
  {
    name: 'Marcus',
    id: 'marcus',
    color: '#28A745', //green
    emoji: ''
  },
  {
    name: 'Lars',
    id: 'lars',
    color: '#33A1FF',//blue
    emoji: ''
  },
  {
    name: 'Lucas',
    id: 'lucas',
    color: '#FF5733',//orange
    emoji: ''
  },
  {
    name: 'Noomi',
    id: 'noomi',
    color: '#8E44AD',//purple
    emoji: ''
  },
  {
    name: 'Meline',
    id: 'meline',
    color: '#FFC107',//red
    emoji: ''
  },
  {
    name: 'Bailey',
    id: 'bailey',
    color: '#E91E63',//pink
    emoji: ''
  },
  {
    name: 'Marita',
    id: 'marita',
    color: '#A0522D',//yellow
    emoji: ''
  }
];
// Funksjon for å hente familiemedlemmer fra localStorage eller bruke default
export const getFamilyMembers = (): FamilyMember[] => {
  if (typeof window === 'undefined') return defaultFamilyMembers;

  const stored = localStorage.getItem('familyMembers');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return defaultFamilyMembers;
    }
  }
  return defaultFamilyMembers;
};

// Funksjon for å lagre familiemedlemmer til localStorage
export const saveFamilyMembers = (members: FamilyMember[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('familyMembers', JSON.stringify(members));
  }
};

// For bakoverkompatibilitet
export const familyMembers = defaultFamilyMembers;
