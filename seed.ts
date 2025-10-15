import { db } from './src/lib/db'
import bcrypt from 'bcryptjs'

async function main() {
  // Create test users
  const hashedPassword = await bcrypt.hash('password123', 12)
  
  // Create a regular user
  const user = await db.user.create({
    data: {
      email: 'user@example.com',
      name: 'John Doe',
      password: hashedPassword,
      role: 'USER'
    }
  })

  // Create an organizer user
  const organizerUser = await db.user.create({
    data: {
      email: 'organizer@example.com',
      name: 'Jane Smith',
      password: hashedPassword,
      role: 'ORGANIZER'
    }
  })

  // Create organizer profile
  const organizer = await db.organizer.create({
    data: {
      userId: organizerUser.id,
      name: 'Jane Smith Events',
      bio: 'Professional event organizer with 10+ years of experience in conferences and workshops.',
      videoUrl: 'https://example.com/sample-video'
    }
  })

  // Create some events
  const events = await Promise.all([
    db.event.create({
      data: {
        title: 'Tech Conference 2024',
        description: 'Annual technology conference featuring the latest innovations in AI, blockchain, and web development.',
        type: 'CONFERENCE',
        price: 299.99,
        organizerId: organizer.id
      }
    }),
    db.event.create({
      data: {
        title: 'Music Festival Summer',
        description: 'Three-day music festival featuring top artists from around the world.',
        type: 'FESTIVAL',
        price: 149.99,
        organizerId: organizer.id
      }
    }),
    db.event.create({
      data: {
        title: 'Business Leadership Summit',
        description: 'Executive summit for business leaders and entrepreneurs.',
        type: 'SUMMIT',
        price: 499.99,
        organizerId: organizer.id
      }
    }),
    db.event.create({
      data: {
        title: 'Web Development Workshop',
        description: 'Hands-on workshop covering modern web development technologies and best practices.',
        type: 'WORKSHOP',
        price: 89.99,
        organizerId: organizer.id
      }
    }),
    db.event.create({
      data: {
        title: 'Digital Marketing Seminar',
        description: 'Learn the latest digital marketing strategies and tools.',
        type: 'SEMINAR',
        price: 79.99,
        organizerId: organizer.id
      }
    })
  ])

  // Create some sample orders
  const orders = await Promise.all([
    db.order.create({
      data: {
        userId: user.id,
        eventId: events[0].id,
        bookingDate: new Date(),
        selectedDateTime: new Date('2024-06-15T09:00:00'),
        finalCost: 299.99,
        paymentStatus: 'COMPLETED',
        organizerConfirmation: 'CONFIRMED',
        paymentMethod: 'Online Payment'
      }
    }),
    db.order.create({
      data: {
        userId: user.id,
        eventId: events[1].id,
        bookingDate: new Date(),
        selectedDateTime: new Date('2024-07-20T18:00:00'),
        finalCost: 149.99,
        paymentStatus: 'PENDING',
        organizerConfirmation: 'PENDING',
        paymentMethod: 'Cash on Delivery'
      }
    })
  ])

  console.log('Database seeded successfully!')
  console.log('Test credentials:')
  console.log('User: user@example.com / password123')
  console.log('Organizer: organizer@example.com / password123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })