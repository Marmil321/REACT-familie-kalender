import { NextRequest, NextResponse } from 'next/server'
import { getPayloadHMR } from '@payloadcms/next/utilities'
import config from '@/payload.config'

export async function GET(request: NextRequest) {
  try {
    // Hent Payload-instansen
    const payload = await getPayloadHMR({ config })

    // Hent URL-parametere for filtrering
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const type = searchParams.get('type')
    const from = searchParams.get('from') // Fra dato (YYYY-MM-DD)
    const to = searchParams.get('to') // Til dato (YYYY-MM-DD)

    // Bygg where-vilkår for filtrering
    const where: {
      type?: { equals: string }
      date?: { greater_than_equal?: string; less_than_equal?: string }
    } = {}

    // Filtrer på type hvis spesifisert
    if (type) {
      where.type = { equals: type }
    }

    // Filtrer på datoområde hvis spesifisert
    if (from || to) {
      where.date = {}
      if (from) {
        where.date.greater_than_equal = from
      }
      if (to) {
        where.date.less_than_equal = to
      }
    }

    // Hent hendelser fra databasen
    const result = await payload.find({
      collection: 'events',
      where,
      page,
      limit,
      sort: 'date', // Sorter etter dato (eldste først)
    })

    // Returner data med metadata
    return NextResponse.json({
      success: true,
      data: result.docs,
      pagination: {
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
        totalDocs: result.totalDocs,
        hasNextPage: result.hasNextPage,
        hasPrevPage: result.hasPrevPage
      }
    })

  } catch (error) {
    console.error('Feil ved henting av hendelser:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Kunne ikke hente hendelser',
        message: error instanceof Error ? error.message : 'Ukjent feil'
      },
      { status: 500 }
    )
  }
}

// Eksempel på POST-funksjon for å opprette nye hendelser
export async function POST(request: NextRequest) {
  try {
    const payload = await getPayloadHMR({ config })
    const body = await request.json()

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

    // Opprett ny hendelse
    const newEvent = await payload.create({
      collection: 'events',
      data: body
    })

    return NextResponse.json({
      success: true,
      data: newEvent,
      message: 'Hendelse opprettet'
    }, { status: 201 })

  } catch (error) {
    console.error('Feil ved opprettelse av hendelse:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Kunne ikke opprette hendelse',
        message: error instanceof Error ? error.message : 'Ukjent feil'
      },
      { status: 500 }
    )
  }
}
