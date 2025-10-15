import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    const orders = await db.order.findMany({
      where: { userId },
      include: {
        event: {
          include: {
            organizer: true
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
        paymentMethod: order.paymentMethod,
        event: {
          id: order.event.id,
          title: order.event.title,
          type: order.event.type,
          price: order.event.price,
          organizer: {
            name: order.event.organizer.name
          }
        }
      }))
    })

  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}