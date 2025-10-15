import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { status } = await request.json()

    if (!status || !['CONFIRMED', 'CANCELLED'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    const order = await db.order.update({
      where: { id },
      data: {
        organizerConfirmation: status
      },
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
      }
    })

    return NextResponse.json({
      message: `Order ${status.toLowerCase()} successfully`,
      order: {
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
      }
    })

  } catch (error) {
    console.error('Error updating order:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}