'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Users, 
  Calendar, 
  IndianRupee, 
  TrendingUp, 
  CheckCircle, 
  Clock, 
  XCircle,
  BarChart3,
  Star,
  Zap
} from 'lucide-react'

interface RegistrationStats {
  totalRegistrations: number
  registrationsByStatus: Array<{
    paymentStatus: string
    _count: {
      id: number
    }
  }>
  registrationsByEventType: Record<string, number>
  topEvents: Array<{
    id: string
    title: string
    type: string
    price: number
    _count: {
      orders: number
    }
  }>
  recentRegistrations: Array<{
    id: string
    bookingDate: string
    paymentStatus: string
    finalCost: number
    user: {
      id: string
      email: string
      name: string | null
    }
    event: {
      id: string
      title: string
      type: string
    }
  }>
}

export default function RegistrationStats() {
  const [stats, setStats] = useState<RegistrationStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchRegistrationStats()
  }, [])

  const fetchRegistrationStats = async () => {
    try {
      const response = await fetch('/api/registrations')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      } else {
        setError('Failed to fetch registration statistics')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    const colors = {
      PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      COMPLETED: 'bg-green-100 text-green-800 border-green-200',
      FAILED: 'bg-red-100 text-red-800 border-red-200',
      REFUNDED: 'bg-gray-100 text-gray-800 border-gray-200'
    }
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200'
  }

  const getEventTypeColor = (type: string) => {
    const colors = {
      CONFERENCE: 'bg-blue-100 text-blue-800 border-blue-200',
      FESTIVAL: 'bg-green-100 text-green-800 border-green-200',
      SUMMIT: 'bg-purple-100 text-purple-800 border-purple-200',
      WORKSHOP: 'bg-orange-100 text-orange-800 border-orange-200',
      SEMINAR: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      OTHER: 'bg-gray-100 text-gray-800 border-gray-200'
    }
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200'
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="h-4 w-4" />
      case 'PENDING':
        return <Clock className="h-4 w-4" />
      case 'FAILED':
        return <XCircle className="h-4 w-4" />
      case 'REFUNDED':
        return <TrendingUp className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getEventTypeIcon = (type: string) => {
    const icons = {
      CONFERENCE: <Zap className="h-4 w-4" />,
      FESTIVAL: <Star className="h-4 w-4" />,
      SUMMIT: <TrendingUp className="h-4 w-4" />,
      WORKSHOP: <Calendar className="h-4 w-4" />,
      SEMINAR: <Users className="h-4 w-4" />,
      OTHER: <BarChart3 className="h-4 w-4" />
    }
    return icons[type as keyof typeof icons] || <BarChart3 className="h-4 w-4" />
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-6">
          <p className="text-red-700">{error}</p>
        </CardContent>
      </Card>
    )
  }

  if (!stats) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-gray-500">No registration data available</p>
        </CardContent>
      </Card>
    )
  }

  const totalRevenue = stats.registrationsByStatus
    .filter(status => status.paymentStatus === 'COMPLETED')
    .reduce((sum, status) => {
      const completedRegistrations = stats.recentRegistrations
        .filter(reg => reg.paymentStatus === 'COMPLETED')
        .reduce((sum, reg) => sum + reg.finalCost, 0)
      return completedRegistrations
    }, 0)

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total Registrations</p>
                <p className="text-2xl font-bold text-blue-900">{stats.totalRegistrations}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Total Revenue</p>
                <p className="text-2xl font-bold text-green-900">₹{totalRevenue.toLocaleString('en-IN')}</p>
              </div>
              <IndianRupee className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-purple-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Completed</p>
                <p className="text-2xl font-bold text-purple-900">
                  {stats.registrationsByStatus.find(s => s.paymentStatus === 'COMPLETED')?._count.id || 0}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-900">
                  {stats.registrationsByStatus.find(s => s.paymentStatus === 'PENDING')?._count.id || 0}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Registration Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Registration Status
            </CardTitle>
            <CardDescription>Breakdown of registration payment status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.registrationsByStatus.map((status) => (
                <div key={status.paymentStatus} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(status.paymentStatus)}
                    <span className="font-medium capitalize">{status.paymentStatus.toLowerCase()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(status.paymentStatus)}>
                      {status._count.id}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Event Type Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Event Type Distribution
            </CardTitle>
            <CardDescription>Registrations by event type</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(stats.registrationsByEventType).map(([type, count]) => (
                <div key={type} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-2">
                    {getEventTypeIcon(type)}
                    <span className="font-medium capitalize">{type.toLowerCase()}</span>
                  </div>
                  <Badge className={getEventTypeColor(type)}>
                    {count}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Events */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Top Events by Registrations
          </CardTitle>
          <CardDescription>Events with the highest number of registrations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {stats.topEvents.slice(0, 5).map((event, index) => (
              <div key={event.id} className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-purple-100 rounded-full text-purple-600 font-bold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium">{event.title}</p>
                    <p className="text-sm text-gray-500 capitalize">{event.type.toLowerCase()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                    {event._count.orders} registrations
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Registrations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Recent Registrations
          </CardTitle>
          <CardDescription>Latest registration activity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {stats.recentRegistrations.slice(0, 10).map((registration) => (
              <div key={registration.id} className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                    <Users className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">{registration.user.name || registration.user.email}</p>
                    <p className="text-sm text-gray-500">{registration.event.title}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(registration.paymentStatus)}>
                    {registration.paymentStatus}
                  </Badge>
                  <span className="text-sm font-medium">₹{registration.finalCost.toLocaleString('en-IN')}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}