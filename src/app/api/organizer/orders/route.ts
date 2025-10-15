import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const organizerId = searchParams.get('organizerId')
    const status = searchParams.get('status')

    if (!organizerId) {
      return NextResponse.json({ error: 'Organizer ID is required' }, { status: 400 })
    }

    const whereClause: any = {
      event: {
        organizerId
      }
    }

    if (status) {
      whereClause.organizerConfirmation = status
    }

    const orders = await db.order.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        },
        event: {
          select: {
            title: true,
            type: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({
      orders: orders.map(order => ({
        id: order.id,
        bookingDate: order.bookingDate.toISOString(),
        selectedDateTime: order.selectedDateTime.toISOString(),
        finalCost: order.finalCost,
        paymentStatus: order.paymentStatus,
        organizerConfirmation: order.organizerConfirmation,
        user: {
          name: order.user.name,
          email: order.user.email
        },
        event: {
          title: order.event.title,
          type: order.event.type
        }
      }))
    })

  } catch (error) {
    console.error('Error fetching organizer orders:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}