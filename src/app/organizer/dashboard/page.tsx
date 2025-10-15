'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { 
  ArrowLeft, 
  Plus, 
  Settings, 
  LogOut, 
  Users, 
  Calendar, 
  IndianRupee, 
  CheckCircle, 
  XCircle, 
  Clock,
  Video,
  Edit,
  Trash2,
  Sparkles,
  Star,
  Zap,
  TrendingUp,
  BarChart3
} from 'lucide-react'
import RegistrationStats from '@/components/RegistrationStats'

interface User {
  id: string
  email: string
  name: string | null
  role: string
}

interface Organizer {
  id: string
  name: string
  bio: string | null
  videoUrl: string | null
}

interface Event {
  id: string
  title: string
  description: string | null
  type: string
  price: number
  createdAt: string
}

interface Order {
  id: string
  bookingDate: string
  selectedDateTime: string
  finalCost: number
  paymentStatus: string
  organizerConfirmation: string
  user: {
    name: string | null
    email: string
  }
  event: {
    title: string
    type: string
  }
}

export default function OrganizerDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [organizer, setOrganizer] = useState<Organizer | null>(null)
  const [events, setEvents] = useState<Event[]>([])
  const [pendingOrders, setPendingOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isCreatingEvent, setIsCreatingEvent] = useState(false)
  const [activeTab, setActiveTab] = useState<'events' | 'stats'>('events')
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    type: 'CONFERENCE',
    price: ''
  })
  const [profileForm, setProfileForm] = useState({
    name: '',
    bio: '',
    videoUrl: ''
  })

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (!userData) {
      router.push('/')
      return
    }

    const parsedUser = JSON.parse(userData)
    if (parsedUser.role !== 'ORGANIZER') {
      router.push('/')
      return
    }

    setUser(parsedUser)
    fetchOrganizerData(parsedUser.id)
  }, [router])

  const fetchOrganizerData = async (userId: string) => {
    try {
      const response = await fetch(`/api/organizer/profile?userId=${userId}`)
      if (response.ok) {
        const data = await response.json()
        setOrganizer(data.organizer)
        
        if (!data.organizer || !data.organizer.name) {
          setShowOnboarding(true)
          setProfileForm({
            name: data.organizer?.name || '',
            bio: data.organizer?.bio || '',
            videoUrl: data.organizer?.videoUrl || ''
          })
        } else {
          fetchEvents(data.organizer.id)
          fetchPendingOrders(data.organizer.id)
        }
      }
    } catch (error) {
      console.error('Error fetching organizer data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchEvents = async (organizerId: string) => {
    try {
      const response = await fetch(`/api/organizer/events?organizerId=${organizerId}`)
      if (response.ok) {
        const data = await response.json()
        setEvents(data.events)
      }
    } catch (error) {
      console.error('Error fetching events:', error)
    }
  }

  const fetchPendingOrders = async (organizerId: string) => {
    try {
      const response = await fetch(`/api/organizer/orders?organizerId=${organizerId}&status=PENDING`)
      if (response.ok) {
        const data = await response.json()
        setPendingOrders(data.orders)
      }
    } catch (error) {
      console.error('Error fetching pending orders:', error)
    }
  }

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsCreatingEvent(true)
    setError('')

    try {
      const response = await fetch('/api/organizer/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          ...profileForm
        })
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess('Profile updated successfully')
        setShowOnboarding(false)
        setOrganizer(data.organizer)
        fetchEvents(data.organizer.id)
        fetchPendingOrders(data.organizer.id)
      } else {
        setError(data.error || 'Failed to update profile')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setIsCreatingEvent(false)
    }
  }

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsCreatingEvent(true)
    setError('')

    try {
      const response = await fetch('/api/organizer/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organizerId: organizer?.id,
          ...newEvent,
          price: parseFloat(newEvent.price)
        })
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess('Event created successfully')
        setNewEvent({ title: '', description: '', type: 'CONFERENCE', price: '' })
        fetchEvents(organizer!.id)
      } else {
        setError(data.error || 'Failed to create event')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setIsCreatingEvent(false)
    }
  }

  const handleOrderAction = async (orderId: string, action: 'CONFIRMED' | 'CANCELLED') => {
    try {
      const response = await fetch(`/api/organizer/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: action })
      })

      if (response.ok) {
        setSuccess(`Order ${action.toLowerCase()} successfully`)
        fetchPendingOrders(organizer!.id)
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to update order')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    router.push('/')
  }

  const handleProfileClick = () => {
    setProfileForm({
      name: organizer?.name || '',
      bio: organizer?.bio || '',
      videoUrl: organizer?.videoUrl || ''
    })
    setShowOnboarding(true)
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
      SUMMIT: <TrendingUp className="h-4 w-4" />,
      WORKSHOP: <Settings className="h-4 w-4" />,
      SEMINAR: <Users className="h-4 w-4" />,
      OTHER: <Sparkles className="h-4 w-4" />
    }
    return icons[type as keyof typeof icons] || <Sparkles className="h-4 w-4" />
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-400 via-pink-500 to-red-500">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
      </div>
    )
  }

  if (showOnboarding) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-4 rounded-full">
                <Settings className="h-12 w-12 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Complete Your Organizer Profile
            </CardTitle>
            <CardDescription className="text-gray-600">
              Please provide your details to get started as an event organizer
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert className="mb-4 border-red-200 bg-red-50">
                <AlertDescription className="text-red-700">{error}</AlertDescription>
              </Alert>
            )}
            {success && (
              <Alert className="mb-4 border-green-200 bg-green-50">
                <AlertDescription className="text-green-700">{success}</AlertDescription>
              </Alert>
            )}
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name" className="text-purple-700 font-medium">Organizer Name</Label>
                <Input
                  id="name"
                  type="text"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  placeholder="Enter your organizer name"
                  required
                  className="border-purple-200 focus:border-purple-500 focus:ring-purple-500"
                />
              </div>
              <div>
                <Label htmlFor="bio" className="text-purple-700 font-medium">Bio</Label>
                <Textarea
                  id="bio"
                  value={profileForm.bio}
                  onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                  placeholder="Tell us about yourself and your events"
                  rows={4}
                  className="border-purple-200 focus:border-purple-500 focus:ring-purple-500"
                />
              </div>
              <div>
                <Label htmlFor="videoUrl" className="text-purple-700 font-medium">Video URL (Optional)</Label>
                <Input
                  id="videoUrl"
                  type="url"
                  value={profileForm.videoUrl}
                  onChange={(e) => setProfileForm({ ...profileForm, videoUrl: e.target.value })}
                  placeholder="Link to your recent work video"
                  className="border-purple-200 focus:border-purple-500 focus:ring-purple-500"
                />
              </div>
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium transition-all transform hover:scale-105" 
                disabled={isCreatingEvent}
              >
                {isCreatingEvent ? 'Saving...' : 'Complete Profile'}
              </Button>
            </form>
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
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded-lg">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Organizer Dashboard
              </h1>
              <Badge variant="outline" className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200 text-purple-700">
                Welcome, {organizer?.name}
              </Badge>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button 
                variant="outline" 
                onClick={handleProfileClick}
                className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200 text-purple-700 hover:from-purple-100 hover:to-pink-100"
              >
                <Settings className="h-4 w-4 mr-2" />
                Profile
              </Button>
              <Button 
                variant="outline" 
                onClick={handleLogout}
                className="border-red-200 text-red-600 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
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

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-xl text-white">
            <Calendar className="h-8 w-8 mb-2" />
            <h3 className="text-2xl font-bold">{events.length}</h3>
            <p className="text-blue-100">Total Events</p>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-xl text-white">
            <IndianRupee className="h-8 w-8 mb-2" />
            <h3 className="text-2xl font-bold">
              ₹{events.reduce((sum, event) => sum + event.price, 0).toLocaleString('en-IN')}
            </h3>
            <p className="text-green-100">Total Value</p>
          </div>
          <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 p-6 rounded-xl text-white">
            <Clock className="h-8 w-8 mb-2" />
            <h3 className="text-2xl font-bold">{pendingOrders.length}</h3>
            <p className="text-yellow-100">Pending Orders</p>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-xl text-white">
            <CheckCircle className="h-8 w-8 mb-2" />
            <h3 className="text-2xl font-bold">24/7</h3>
            <p className="text-purple-100">Support</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-purple-100 p-1 rounded-lg mb-6">
          <button
            onClick={() => setActiveTab('events')}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-all ${
              activeTab === 'events'
                ? 'bg-white text-purple-700 shadow-sm'
                : 'text-purple-600 hover:text-purple-700'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Calendar className="h-4 w-4" />
              Events
            </div>
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-all ${
              activeTab === 'stats'
                ? 'bg-white text-purple-700 shadow-sm'
                : 'text-purple-600 hover:text-purple-700'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Registration Stats
            </div>
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'events' ? (
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Your Events
                </h2>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium transition-all transform hover:scale-105">
                      <Plus className="h-4 w-4 mr-2" />
                      Create New Event
                    </Button>
                  </DialogTrigger>
                <DialogContent className="border-purple-200">
                  <DialogHeader>
                    <DialogTitle className="text-purple-800">Create New Event</DialogTitle>
                    <DialogDescription className="text-purple-600">
                      Fill in the details for your new event
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleCreateEvent} className="space-y-4">
                    <div>
                      <Label htmlFor="title" className="text-purple-700 font-medium">Event Title</Label>
                      <Input
                        id="title"
                        type="text"
                        value={newEvent.title}
                        onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                        placeholder="Enter event title"
                        required
                        className="border-purple-200 focus:border-purple-500 focus:ring-purple-500"
                      />
                    </div>
                    <div>
                      <Label htmlFor="description" className="text-purple-700 font-medium">Description</Label>
                      <Textarea
                        id="description"
                        value={newEvent.description}
                        onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                        placeholder="Describe your event"
                        rows={3}
                        className="border-purple-200 focus:border-purple-500 focus:ring-purple-500"
                      />
                    </div>
                    <div>
                      <Label htmlFor="type" className="text-purple-700 font-medium">Event Type</Label>
                      <select
                        id="type"
                        value={newEvent.type}
                        onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value })}
                        className="w-full p-2 border border-purple-200 rounded-md focus:border-purple-500 focus:ring-purple-500"
                        required
                      >
                        <option value="CONFERENCE">Conference</option>
                        <option value="FESTIVAL">Festival</option>
                        <option value="SUMMIT">Summit</option>
                        <option value="WORKSHOP">Workshop</option>
                        <option value="SEMINAR">Seminar</option>
                        <option value="OTHER">Other</option>
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="price" className="text-purple-700 font-medium">Price (₹)</Label>
                      <Input
                        id="price"
                        type="number"
                        value={newEvent.price}
                        onChange={(e) => setNewEvent({ ...newEvent, price: e.target.value })}
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                        required
                        className="border-purple-200 focus:border-purple-500 focus:ring-purple-500"
                      />
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium" 
                      disabled={isCreatingEvent}
                    >
                      {isCreatingEvent ? 'Creating...' : 'Create Event'}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {events.map((event) => (
                <Card 
                  key={event.id} 
                  className="bg-white/80 backdrop-blur-sm border-purple-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden"
                >
                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-4">
                    <div className="flex justify-between items-start mb-2">
                      <Badge className={`${getEventTypeColor(event.type)} border-0`}>
                        <div className="flex items-center gap-1">
                          {getEventTypeIcon(event.type)}
                          {event.type}
                        </div>
                      </Badge>
                    </div>
                    <CardTitle className="text-lg text-white">{event.title}</CardTitle>
                  </div>
                  <CardContent className="p-4">
                    {event.description && (
                      <p className="text-gray-600 mb-4">{event.description}</p>
                    )}
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <IndianRupee className="h-4 w-4 text-green-500" />
                        <span className="font-semibold text-green-600">₹{event.price.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="border-purple-200 text-purple-600 hover:bg-purple-50">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" className="border-red-200 text-red-600 hover:bg-red-50">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {events.length === 0 && (
                <div className="col-span-2 text-center py-12">
                  <div className="bg-gradient-to-r from-purple-100 to-pink-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Calendar className="h-12 w-12 text-purple-500" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No events yet</h3>
                  <p className="text-gray-500 mb-6">Create your first event to get started</p>
                </div>
              )}
            </div>
          </div>

          <div>
            <Card className="bg-white/80 backdrop-blur-sm border-purple-200 shadow-xl sticky top-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-purple-800">
                  <Clock className="h-5 w-5 text-purple-500" />
                  Pending Orders
                </CardTitle>
                <CardDescription className="text-purple-600">
                  Orders awaiting your confirmation
                </CardDescription>
              </CardHeader>
              <CardContent>
                {pendingOrders.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="bg-gradient-to-r from-green-100 to-green-200 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="h-8 w-8 text-green-600" />
                    </div>
                    <p className="text-gray-500">No pending orders</p>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {pendingOrders.map((order) => (
                      <div key={order.id} className="border border-purple-200 rounded-lg p-4 bg-gradient-to-r from-purple-50 to-pink-50">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-medium text-purple-800">{order.event.title}</h4>
                            <p className="text-sm text-purple-600">
                              {order.user.name || order.user.email}
                            </p>
                          </div>
                          <Badge className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white border-yellow-200">
                            PENDING
                          </Badge>
                        </div>
                        
                        <div className="text-sm text-purple-600 mb-3">
                          <div className="flex items-center gap-2 mb-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(order.selectedDateTime).toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-2">
                            <IndianRupee className="h-3 w-3" />
                            ₹{order.finalCost.toLocaleString('en-IN')}
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleOrderAction(order.id, 'CONFIRMED')}
                            className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Accept
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleOrderAction(order.id, 'CANCELLED')}
                            className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
                          >
                            <XCircle className="h-3 w-3 mr-1" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
          ) : (
            <RegistrationStats />
          )}
      </div>
    </div>
  )
}