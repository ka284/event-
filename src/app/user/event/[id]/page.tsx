'use client'

import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ArrowLeft, Calendar, MapPin, DollarSign, User, Video, Clock, Sparkles, Star, Zap } from 'lucide-react'

interface Event {
  id: string
  title: string
  description: string | null
  type: string
  price: number
  organizer: {
    name: string
    bio: string | null
    videoUrl: string | null
  }
}

interface User {
  id: string
  email: string
  name: string | null
  role: string
}

export default function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const { id } = use(params)
  const eventId = id
  const [user, setUser] = useState<User | null>(null)
  const [event, setEvent] = useState<Event | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isBooking, setIsBooking] = useState(false)
  const [selectedDateTime, setSelectedDateTime] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

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
    fetchEvent(eventId)
  }, [router, eventId])

  const fetchEvent = async (id: string) => {
    try {
      const response = await fetch(`/api/events/${id}`)
      if (response.ok) {
        const data = await response.json()
        setEvent(data.event)
      }
    } catch (error) {
      console.error('Error fetching event:', error)
      setError('Failed to load event details')
    } finally {
      setIsLoading(false)
    }
  }

  const handleBookNow = () => {
    if (!selectedDateTime) {
      setError('Please select a date and time')
      return
    }

    if (!event) return

    setIsBooking(true)
    setError('')

    try {
      const bookingData = {
        eventId: event.id,
        selectedDateTime,
        finalCost: event.price
      }

      localStorage.setItem('bookingData', JSON.stringify(bookingData))
      
      // Use immediate navigation for faster response
      setTimeout(() => {
        router.push('/user/booking/address')
      }, 100) // Small delay to ensure localStorage is set
    } catch (error) {
      setError('Failed to process booking. Please try again.')
      setIsBooking(false)
    }
  }

  const handleBack = () => {
    router.push('/user/dashboard')
  }

  const getEventTypeColor = (type: string) => {
    const colors = {
      CONFERENCE: 'bg-gradient-to-r from-blue-500 to-blue-600 text-white border-blue-200',
      FESTIVAL: 'bg-gradient-to-r from-green-500 to-green-600 text-white border-green-200',
      SUMMIT: 'bg-gradient-to-r from-purple-500 to-purple-600 text-white border-purple-200',
      WORKSHOP: 'bg-gradient-to-r from-orange-500 to-orange-600 text-white border-orange-200',
      SEMINAR: 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white border-yellow-200',
      OTHER: 'bg-gradient-to-r from-gray-500 to-gray-600 text-white border-gray-200'
    }
    return colors[type as keyof typeof colors] || 'bg-gradient-to-r from-gray-500 to-gray-600 text-white border-gray-200'
  }

  const getEventTypeIcon = (type: string) => {
    const icons = {
      CONFERENCE: <Zap className="h-4 w-4" />,
      FESTIVAL: <Star className="h-4 w-4" />,
      SUMMIT: <Calendar className="h-4 w-4" />,
      WORKSHOP: <Video className="h-4 w-4" />,
      SEMINAR: <User className="h-4 w-4" />,
      OTHER: <Sparkles className="h-4 w-4" />
    }
    return icons[type as keyof typeof icons] || <Sparkles className="h-4 w-4" />
  }

  const formatDateForInput = (date: Date) => {
    return date.toISOString().slice(0, 16)
  }

  const getMinDateTime = () => {
    const now = new Date()
    now.setHours(now.getHours() + 1)
    return formatDateForInput(now)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-400 via-pink-500 to-red-500">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-red-50 flex items-center justify-center">
        <Card className="w-full max-w-md bg-white/80 backdrop-blur-sm border-purple-200 shadow-xl">
          <CardContent className="text-center py-8">
            <div className="bg-gradient-to-r from-purple-100 to-pink-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="h-8 w-8 text-purple-500" />
            </div>
            <p className="text-gray-500 mb-4">Event not found</p>
            <Button onClick={handleBack} className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white">
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-red-50">
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
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Event Details
              </h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertDescription className="text-red-700">{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <AlertDescription className="text-green-700">{success}</AlertDescription>
          </Alert>
        )}

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            {/* Main Event Card */}
            <Card className="bg-white/80 backdrop-blur-sm border-purple-200 shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <Badge className={`${getEventTypeColor(event.type)} border-0`}>
                        <div className="flex items-center gap-1">
                          {getEventTypeIcon(event.type)}
                          {event.type}
                        </div>
                      </Badge>
                    </div>
                    <CardTitle className="text-3xl font-bold text-white mb-2">
                      {event.title}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2 text-white/90">
                      <MapPin className="h-4 w-4" />
                      {event.organizer.name}
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
                      <div className="flex items-center gap-2 text-2xl font-bold text-white">
                      <span className="text-lg">₹</span>
                      {event.price.toLocaleString('en-IN')}
                    </div>
                    </div>
                  </div>
                </div>
              </div>
              <CardContent className="p-6">
                {event.description && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-purple-800 mb-3 flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-purple-500" />
                      About This Event
                    </h3>
                    <p className="text-gray-600 leading-relaxed">{event.description}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Organizer Details Card */}
            <Card className="bg-white/80 backdrop-blur-sm border-purple-200 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-purple-800">
                  <User className="h-5 w-5 text-purple-500" />
                  Organizer Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-purple-800 text-lg mb-2">{event.organizer.name}</h4>
                    {event.organizer.bio && (
                      <p className="text-gray-600 leading-relaxed">{event.organizer.bio}</p>
                    )}
                  </div>
                  
                  {event.organizer.videoUrl && (
                    <div>
                      <h4 className="font-semibold text-purple-800 mb-3 flex items-center gap-2">
                        <Video className="h-4 w-4 text-purple-500" />
                        Recent Work
                      </h4>
                      <div className="aspect-video bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl flex items-center justify-center border-2 border-dashed border-purple-200">
                        <div className="text-center">
                          <Video className="h-12 w-12 text-purple-400 mx-auto mb-2" />
                          <span className="text-purple-500 font-medium">Video Preview Available</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Booking Sidebar */}
          <div>
            <Card className="bg-white/80 backdrop-blur-sm border-purple-200 shadow-xl sticky top-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-purple-800">
                  <Calendar className="h-5 w-5 text-purple-500" />
                  Book This Event
                </CardTitle>
                <CardDescription className="text-purple-600">
                  Select your preferred date and time
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="datetime" className="text-purple-700 font-medium">Date & Time</Label>
                  <Input
                    id="datetime"
                    type="datetime-local"
                    value={selectedDateTime}
                    onChange={(e) => setSelectedDateTime(e.target.value)}
                    min={getMinDateTime()}
                    className="mt-2 border-purple-200 focus:border-purple-500 focus:ring-purple-500"
                  />
                </div>

                <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-200">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-purple-700">Event Price:</span>
                      <span className="font-semibold text-purple-800">₹{event.price.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="border-t border-purple-200 pt-3">
                      <div className="flex justify-between items-center text-lg font-bold">
                        <span className="text-purple-800">Total Cost:</span>
                        <span className="text-green-600">₹{event.price.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <Button 
                  onClick={handleBookNow} 
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-3 transition-all transform hover:scale-105 shadow-lg" 
                  disabled={!selectedDateTime || isBooking}
                >
                  {isBooking ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <Calendar className="h-4 w-4 mr-2" />
                      Book Now
                    </>
                  )}
                </Button>

                <div className="text-center">
                  <p className="text-xs text-purple-500">
                    By booking, you agree to our terms and conditions
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}