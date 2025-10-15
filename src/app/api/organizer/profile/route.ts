import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    const organizer = await db.organizer.findFirst({
      where: { userId }
    })

    return NextResponse.json({
      organizer
    })

  } catch (error) {
    console.error('Error fetching organizer profile:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { userId, name, bio, videoUrl } = await request.json()

    if (!userId || !name) {
      return NextResponse.json({ error: 'User ID and name are required' }, { status: 400 })
    }

    const existingOrganizer = await db.organizer.findFirst({
      where: { userId }
    })

    let organizer
    if (existingOrganizer) {
      organizer = await db.organizer.update({
        where: { id: existingOrganizer.id },
        data: {
          name,
          bio: bio || null,
          videoUrl: videoUrl || null
        }
      })
    } else {
      organizer = await db.organizer.create({
        data: {
          userId,
          name,
          bio: bio || null,
          videoUrl: videoUrl || null
        }
      })
    }

    return NextResponse.json({
      message: 'Organizer profile updated successfully',
      organizer
    })

  } catch (error) {
    console.error('Error updating organizer profile:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}