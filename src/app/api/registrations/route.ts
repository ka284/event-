import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    // Get total registrations count
    const totalRegistrations = await db.order.count()
    
    // Get registrations by payment status
    const registrationsByStatus = await db.order.groupBy({
      by: ['paymentStatus'],
      _count: {
        id: true
      }
    })
    
    // Get registrations by event type
    const registrationsByEventType = await db.order.findMany({
      select: {
        event: {
          select: {
            type: true
          }
        }
      }
    })
    
    // Group by event type
    const eventTypeCounts = registrationsByEventType.reduce((acc, order) => {
      const type = order.event.type
      acc[type] = (acc[type] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    // Get top events by registration count
    const topEvents = await db.event.findMany({
      select: {
        id: true,
        title: true,
        type: true,
        price: true,
        _count: {
          select: {
            orders: true
          }
        }
      },
      orderBy: {
        orders: {
          _count: 'desc'
        }
      },
      take: 10
    })
    
    // Get recent registrations
    const recentRegistrations = await db.order.findMany({
      select: {
        id: true,
        bookingDate: true,
        paymentStatus: true,
        finalCost: true,
        user: {
          select: {
            id: true,
            email: true,
            name: true
          }
        },
        event: {
          select: {
            id: true,
            title: true,
            type: true
          }
        }
      },
      orderBy: {
        bookingDate: 'desc'
      },
      take: 20
    })

    return NextResponse.json({
      totalRegistrations,
      registrationsByStatus,
      registrationsByEventType: eventTypeCounts,
      topEvents,
      recentRegistrations
    })
  } catch (error) {
    console.error('Error fetching registration statistics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch registration statistics' },
      { status: 500 }
    )
  }
}