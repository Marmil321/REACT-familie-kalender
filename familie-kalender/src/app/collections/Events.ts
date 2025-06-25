import { CollectionConfig } from 'payload'

export const Events: CollectionConfig = {
  slug: 'events',
  labels: {
    singular: 'Hendelse',
    plural: 'Hendelser'
  },
  admin: {
    description: 'Administrer familiehendelser og aktiviteter',
    defaultColumns: ['title', 'date', 'time', 'type'],
    useAsTitle: 'title'
  },
  access: {
    read: () => true,
    create: () => true,
    update: () => true,
    delete: () => true,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: 'Tittel',
      required: true,
      admin: {
        description: 'Navn på hendelsen'
      }
    },
    {
      name: 'date',
      type: 'date',
      label: 'Dato',
      required: true,
      admin: {
        description: 'Når hendelsen finner sted'
      }
    },
    {
      name: 'time',
      type: 'text',
      label: 'Tidspunkt',
      required: true,
      admin: {
        description: 'Klokkeslett for hendelsen (f.eks. 14:30)'
      }
    },
    {
      name: 'attendees',
      type: 'text',
      label: 'Deltakere',
      admin: {
        description: 'Hvem som skal delta på hendelsen'
      }
    },
    {
      name: 'type',
      type: 'select',
      label: 'Type',
      required: true,
      options: [
        {
          label: 'Avtale',
          value: 'appointment'
        },
        {
          label: 'Skole',
          value: 'school'
        },
        {
          label: 'Familie',
          value: 'family'
        },
        {
          label: 'Arbeid',
          value: 'work'
        },
        {
          label: 'Sport',
          value: 'sports'
        },
        {
          label: 'Annet',
          value: 'annet'
        }
      ],
      admin: {
        description: 'Kategorisering av hendelsen'
      }
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Beskrivelse',
      admin: {
        description: 'Ekstra detaljer om hendelsen (valgfritt)'
      }
    },
    {
      name: 'location',
      type: 'text',
      label: 'Sted',
      admin: {
        description: 'Hvor hendelsen finner sted (valgfritt)'
      }
    },
    {
      name: 'reminder',
      type: 'checkbox',
      label: 'Påminnelse',
      admin: {
        description: 'Send påminnelse før hendelsen'
      }
    }
  ],
  timestamps: true
}

export default Events
