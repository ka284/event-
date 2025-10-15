import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const profile = await db.userProfile.findUnique({
      where: { userId }
    })

    return NextResponse.json({
      user,
      profile
    })

  } catch (error) {
    console.error('Error fetching profile:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { userId, name, profile } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    const updatedUser = await db.user.update({
      where: { id: userId },
      data: {
        name: name || null
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true
      }
    })

    const existingProfile = await db.userProfile.findUnique({
      where: { userId }
    })

    let updatedProfile
    if (existingProfile) {
      updatedProfile = await db.userProfile.update({
        where: { userId },
        data: {
          country: profile.country || null,
          state: profile.state || null,
          city: profile.city || null,
          pinCode: profile.pinCode || null,
          address: profile.address || null
        }
      })
    } else {
      updatedProfile = await db.userProfile.create({
        data: {
          userId,
          country: profile.country || null,
          state: profile.state || null,
          city: profile.city || null,
          pinCode: profile.pinCode || null,
          address: profile.address || null
        }
      })
    }

    return NextResponse.json({
      message: 'Profile updated successfully',
      user: updatedUser,
      profile: updatedProfile
    })

  } catch (error) {
    console.error('Error updating profile:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}