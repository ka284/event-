const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkRegistrationStats() {
  try {
    console.log('📊 Event Management System - Registration Statistics\n')
    
    // 1. Total registrations
    const totalRegistrations = await prisma.order.count()
    console.log('📈 Total Registrations:', totalRegistrations)
    
    // 2. Registrations by payment status
    const registrationsByStatus = await prisma.order.groupBy({
      by: ['paymentStatus'],
      _count: {
        id: true
      }
    })
    console.log('\n💳 Registrations by Payment Status:')
    registrationsByStatus.forEach(status => {
      console.log(`  ${status.paymentStatus}: ${status._count.id}`)
    })
    
    // 3. Total revenue
    const completedOrders = await prisma.order.aggregate({
      where: {
        paymentStatus: 'COMPLETED'
      },
      _sum: {
        finalCost: true
      }
    })
    console.log('\n💰 Total Revenue:', `₹${completedOrders._sum.finalCost?.toLocaleString('en-IN') || 0}`)
    
    // 4. Top events by registration count
    const topEvents = await prisma.event.findMany({
      select: {
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
      take: 5
    })
    console.log('\n🏆 Top 5 Events by Registrations:')
    topEvents.forEach((event, index) => {
      console.log(`  ${index + 1}. ${event.title} (${event.type}) - ${event._count.orders} registrations`)
    })
    
    // 5. Recent registrations
    const recentRegistrations = await prisma.order.findMany({
      select: {
        bookingDate: true,
        paymentStatus: true,
        finalCost: true,
        user: {
          select: {
            email: true,
            name: true
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
        bookingDate: 'desc'
      },
      take: 5
    })
    console.log('\n🕐 Recent 5 Registrations:')
    recentRegistrations.forEach((reg, index) => {
      console.log(`  ${index + 1}. ${reg.user.name || reg.user.email} - ${reg.event.title}`)
      console.log(`     Status: ${reg.paymentStatus}, Amount: ₹${reg.finalCost.toLocaleString('en-IN')}`)
      console.log(`     Date: ${new Date(reg.bookingDate).toLocaleDateString()}`)
    })
    
    // 6. Event type distribution
    const eventTypeStats = await prisma.order.findMany({
      select: {
        event: {
          select: {
            type: true
          }
        }
      }
    })
    
    const eventTypeCounts = eventTypeStats.reduce((acc, order) => {
      const type = order.event.type
      acc[type] = (acc[type] || 0) + 1
      return acc
    }, {})
    
    console.log('\n📊 Event Type Distribution:')
    Object.entries(eventTypeCounts).forEach(([type, count]) => {
      console.log(`  ${type}: ${count}`)
    })
    
    console.log('\n✅ Registration statistics check completed!')
    
  } catch (error) {
    console.error('❌ Error checking registration statistics:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the function
checkRegistrationStats()