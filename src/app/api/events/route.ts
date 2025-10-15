import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const events = await db.event.findMany({
      include: {
        organizer: {
          include: {
            user: {
              select: {
                email: true
              }
            }
          }
        }
      },
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
        organizer: {
          name: event.organizer.name,
          bio: event.organizer.bio
        }
      }))
    })

  } catch (error) {
    console.error('Error fetching events:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}