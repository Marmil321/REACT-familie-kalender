//api/events/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'

interface Params {
  params: {
    id: string
  }
}

// GET single event
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const payload = await getPayload({ config })
    const eventId = params.id

    // Valider at ID er et gyldig nummer
    if (!eventId || isNaN(parseInt(eventId))) {
      return NextResponse.json(
        {
          success: false,
          error: 'Ugyldig hendelse-ID'
        },
        { status: 400 }
      )
    }

    // Hent hendelsen fra databasen
    const event = await payload.findByID({
      collection: 'events',
      id: parseInt(eventId)
    })

    return NextResponse.json({
      success: true,
      data: event
    })

  } catch (error) {
    console.error('Feil ved henting av hendelse:', error)

    // Håndter "ikke funnet" feil
    if (error instanceof Error && error.message.includes('No document found')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Hendelse ikke funnet'
        },
        { status: 404 }
      )
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Kunne ikke hente hendelse',
        message: error instanceof Error ? error.message : 'Ukjent feil'
      },
      { status: 500 }
    )
  }
}

// UPDATE event
export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const payload = await getPayload({ config })
    const eventId = params.id
    const body = await request.json()

    // Valider at ID er et gyldig nummer
    if (!eventId || isNaN(parseInt(eventId))) {
      return NextResponse.json(
        {
          success: false,
          error: 'Ugyldig hendelse-ID'
        },
        { status: 400 }
      )
    }

    // Valider påkrevde felter
    if (!body.title || !body.date || !body.time || !body.type) {
      return NextResponse.json(
        {
          success: false,
          error: 'Manglende påkrevde felter',
          required: ['title', 'date', 'time', 'type']
        },
        { status: 400 }
      )
    }

    // Oppdater hendelsen
    const updatedEvent = await payload.update({
      collection: 'events',
      id: parseInt(eventId),
      data: body
    })

    return NextResponse.json({
      success: true,
      data: updatedEvent,
      message: 'Hendelse oppdatert'
    })

  } catch (error) {
    console.error('Feil ved oppdatering av hendelse:', error)

    // Håndter "ikke funnet" feil
    if (error instanceof Error && error.message.includes('No document found')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Hendelse ikke funnet'
        },
        { status: 404 }
      )
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Kunne ikke oppdatere hendelse',
        message: error instanceof Error ? error.message : 'Ukjent feil'
      },
      { status: 500 }
    )
  }
}

// DELETE event
export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const payload = await getPayload({ config })
    const eventId = params.id

    // Valider at ID er et gyldig nummer
    if (!eventId || isNaN(parseInt(eventId))) {
      return NextResponse.json(
        {
          success: false,
          error: 'Ugyldig hendelse-ID'
        },
        { status: 400 }
      )
    }

    // Slett hendelsen fra databasen
    await payload.delete({
      collection: 'events',
      id: parseInt(eventId)
    })

    return NextResponse.json({
      success: true,
      message: 'Hendelse slettet'
    })

  } catch (error) {
    console.error('Feil ved sletting av hendelse:', error)

    // Håndter "ikke funnet" feil
    if (error instanceof Error && error.message.includes('No document found')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Hendelse ikke funnet'
        },
        { status: 404 }
      )
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Kunne ikke slette hendelse',
        message: error instanceof Error ? error.message : 'Ukjent feil'
      },
      { status: 500 }
    )
  }
}
