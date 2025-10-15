import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const organizerId = searchParams.get('organizerId')

    if (!organizerId) {
      return NextResponse.json({ error: 'Organizer ID is required' }, { status: 400 })
    }

    const events = await db.event.findMany({
      where: { organizerId },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({
      events: events.map(event => ({
        id: event.id,
        title: event.title,
        description: event.description,
        type: event.type,
        price: event.price,
        createdAt: event.createdAt.toISOString()
      }))
    })

  } catch (error) {
    console.error('Error fetching organizer events:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { organizerId, title, description, type, price } = await request.json()

    if (!organizerId || !title || !type || price === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const event = await db.event.create({
      data: {
        organizerId,
        title,
        description: description || null,
        type,
        price: parseFloat(price)
      }
    })

    return NextResponse.json({
      message: 'Event created successfully',
      event: {
        id: event.id,
        title: event.title,
        description: event.description,
        type: event.type,
        price: event.price,
        createdAt: event.createdAt.toISOString()
      }
    })

  } catch (error) {
    console.error('Error creating event:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}