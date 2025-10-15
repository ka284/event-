import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { userId, eventId, bookingDate, selectedDateTime, finalCost, paymentMethod, paymentStatus } = await request.json()

    if (!userId || !eventId || !bookingDate || !selectedDateTime || finalCost === undefined || !paymentMethod) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const order = await db.order.create({
      data: {
        userId,
        eventId,
        bookingDate: new Date(bookingDate),
        selectedDateTime: new Date(selectedDateTime),
        finalCost: parseFloat(finalCost),
        paymentMethod,
        paymentStatus: paymentStatus || 'PENDING',
        organizerConfirmation: 'PENDING'
      },
      include: {
        event: {
          include: {
            organizer: true
          }
        },
        user: {
          select: {
            email: true,
            name: true
          }
        }
      }
    })

    return NextResponse.json({
      message: 'Order created successfully',
      order: {
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
      }
    })

  } catch (error) {
    console.error('Error creating order:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}