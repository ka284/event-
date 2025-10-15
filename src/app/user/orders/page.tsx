'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, ShoppingCart, Calendar, MapPin, DollarSign, CheckCircle, XCircle, Clock } from 'lucide-react'

interface Order {
  id: string
  bookingDate: string
  selectedDateTime: string
  finalCost: number
  paymentStatus: string
  organizerConfirmation: string
  paymentMethod: string | null
  event: {
    id: string
    title: string
    type: string
    price: number
    organizer: {
      name: string
    }
  }
}

interface User {
  id: string
  email: string
  name: string | null
  role: string
}

export default function OrdersPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (!userData) {
      router.push('/')
      return
    }

    const parsedUser = JSON.parse(userData)
    if (parsedUser.role !== 'USER') {
      router.push('/')
      return
    }

    setUser(parsedUser)
    fetchOrders(parsedUser.id)
  }, [router])

  const fetchOrders = async (userId: string) => {
    try {
      const response = await fetch(`/api/user/orders?userId=${userId}`)
      if (response.ok) {
        const data = await response.json()
        setOrders(data.orders)
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleBack = () => {
    router.push('/user/dashboard')
  }

  const handleEventClick = (eventId: string) => {
    router.push(`/user/event/${eventId}`)
  }

  const getPaymentStatusColor = (status: string) => {
    const colors = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      COMPLETED: 'bg-green-100 text-green-800',
      FAILED: 'bg-red-100 text-red-800',
      REFUNDED: 'bg-gray-100 text-gray-800'
    }
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const getConfirmationStatusColor = (status: string) => {
    const colors = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      CONFIRMED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800'
    }
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const getConfirmationIcon = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'CANCELLED':
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return <Clock className="h-4 w-4 text-yellow-600" />
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-400 via-pink-500 to-red-500">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-red-50">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-green-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-sm shadow-lg border-b border-purple-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center gap-4">
                <Button 
                  variant="outline" 
                  onClick={handleBack}
                  className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200 text-purple-700 hover:from-purple-100 hover:to-pink-100"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded-lg">
                  <ShoppingCart className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  My Orders
                </h1>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {orders.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-gradient-to-r from-purple-100 to-pink-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingCart className="h-12 w-12 text-purple-500" />
              </div>
              <h3 className="text-lg font-medium bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                No orders yet
              </h3>
              <p className="text-gray-500 mb-6">You haven't made any bookings yet.</p>
              <Button 
                onClick={() => router.push('/user/dashboard')}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium transition-all transform hover:scale-105"
              >
                Browse Events
              </Button>
            </div>
          ) : (
            <div className="grid gap-6">
              {orders.map((order) => (
                <Card 
                  key={order.id} 
                  className="bg-white/80 backdrop-blur-sm border-purple-200 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden"
                >
                  <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 pb-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle 
                          className="text-lg cursor-pointer hover:text-purple-600 transition-colors bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"
                          onClick={() => handleEventClick(order.event.id)}
                        >
                          {order.event.title}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-1 text-purple-600">
                          <MapPin className="h-4 w-4" />
                          {order.event.organizer.name}
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Badge className={`${getPaymentStatusColor(order.paymentStatus)} border-0 shadow-sm`}>
                          {order.paymentStatus}
                        </Badge>
                        <Badge className={`${getConfirmationStatusColor(order.organizerConfirmation)} border-0 shadow-sm`}>
                          <div className="flex items-center gap-1">
                            {getConfirmationIcon(order.organizerConfirmation)}
                            {order.organizerConfirmation}
                          </div>
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                      <div className="flex items-center gap-2">
                        <div className="bg-purple-100 p-2 rounded-lg">
                          <Calendar className="h-4 w-4 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Booking Date</p>
                          <p className="font-medium text-gray-800">{formatDate(order.bookingDate)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="bg-green-100 p-2 rounded-lg">
                          <Calendar className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Event Date</p>
                          <p className="font-medium text-gray-800">{formatDate(order.selectedDateTime)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="bg-yellow-100 p-2 rounded-lg">
                          <DollarSign className="h-4 w-4 text-yellow-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Total Cost</p>
                          <p className="font-medium text-gray-800">${order.finalCost.toFixed(2)}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Payment Method</p>
                        <p className="font-medium text-gray-800">
                          {order.paymentMethod || 'Not specified'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-purple-100">
                      <div className="flex justify-between items-center">
                        <div className="flex gap-4">
                          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                            {order.event.type}
                          </Badge>
                          <Badge variant="outline" className="bg-pink-50 text-pink-700 border-pink-200">
                            Order ID: {order.id.slice(-8)}
                          </Badge>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleEventClick(order.event.id)}
                          className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200 text-purple-700 hover:from-purple-100 hover:to-pink-100"
                        >
                          View Event
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  )
}