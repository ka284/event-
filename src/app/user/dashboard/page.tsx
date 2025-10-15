'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Search, Filter, User, LogOut, ShoppingCart, Settings, Calendar, MapPin, Sparkles, Star, Zap } from 'lucide-react'

interface User {
  id: string
  email: string
  name: string | null
  role: string
}

interface Event {
  id: string
  title: string
  description: string | null
  type: string
  price: number
  organizer: {
    name: string
    bio: string | null
  }
}

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [events, setEvents] = useState<Event[]>([])
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [eventTypeFilter, setEventTypeFilter] = useState('all')
  const [priceRangeFilter, setPriceRangeFilter] = useState('all')
  const [organizerFilter, setOrganizerFilter] = useState('all')

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
    fetchEvents()
  }, [router])

  useEffect(() => {
    filterEvents()
  }, [events, searchTerm, eventTypeFilter, priceRangeFilter, organizerFilter])

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/events')
      if (response.ok) {
        const data = await response.json()
        setEvents(data.events || [])
      } else {
        console.error('API response not ok:', response.statusText)
      }
    } catch (error) {
      console.error('Error fetching events:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filterEvents = () => {
    let filtered = events

    if (searchTerm) {
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.organizer.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (eventTypeFilter !== 'all') {
      filtered = filtered.filter(event => event.type === eventTypeFilter)
    }

    if (priceRangeFilter !== 'all') {
      const [min, max] = priceRangeFilter.split('-').map(Number)
      filtered = filtered.filter(event => {
        if (max) {
          return event.price >= min && event.price <= max
        }
        return event.price >= min
      })
    }

    if (organizerFilter !== 'all') {
      filtered = filtered.filter(event => event.organizer.name === organizerFilter)
    }

    setFilteredEvents(filtered)
  }

  const handleLogout = () => {
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    router.push('/')
  }

  const handleEventClick = (eventId: string) => {
    router.push(`/user/event/${eventId}`)
  }

  const handleProfileClick = () => {
    router.push('/user/profile')
  }

  const handleOrdersClick = () => {
    router.push('/user/orders')
  }

  const getUniqueOrganizers = () => {
    const organizers = events.map(event => event.organizer.name)
    return [...new Set(organizers)]
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
      WORKSHOP: <Settings className="h-4 w-4" />,
      SEMINAR: <User className="h-4 w-4" />,
      OTHER: <Sparkles className="h-4 w-4" />
    }
    return icons[type as keyof typeof icons] || <Sparkles className="h-4 w-4" />
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
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-lg border-b border-purple-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded-lg mr-3">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Event Dashboard
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400 h-4 w-4" />
                <Input
                  placeholder="Search events..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64 border-purple-200 focus:border-purple-500 focus:ring-purple-500"
                />
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200 text-purple-700 hover:from-purple-100 hover:to-pink-100 flex items-center gap-2">
                    <User className="h-4 w-4" />
                    {user?.name || 'User'}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="border-purple-200">
                  <DropdownMenuItem onClick={handleProfileClick} className="text-purple-700">
                    <Settings className="mr-2 h-4 w-4" />
                    User Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleOrdersClick} className="text-purple-700">
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    My Orders
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Stats Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-xl text-white">
            <Calendar className="h-8 w-8 mb-2" />
            <h3 className="text-2xl font-bold">{events.length}</h3>
            <p className="text-blue-100">Total Events</p>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-xl text-white">
            <Star className="h-8 w-8 mb-2" />
            <h3 className="text-2xl font-bold">{filteredEvents.length}</h3>
            <p className="text-green-100">Available Now</p>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-xl text-white">
            <MapPin className="h-8 w-8 mb-2" />
            <h3 className="text-2xl font-bold">{getUniqueOrganizers().length}</h3>
            <p className="text-purple-100">Organizers</p>
          </div>
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-6 rounded-xl text-white">
            <Zap className="h-8 w-8 mb-2" />
            <h3 className="text-2xl font-bold">24/7</h3>
            <p className="text-orange-100">Support</p>
          </div>
        </div>

        <div className="flex gap-8">
          <div className="w-3/4">
            <div className="mb-6">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
                Available Events
              </h2>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredEvents.map((event) => (
                  <Card 
                    key={event.id} 
                    className="cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-0 shadow-lg overflow-hidden"
                    onClick={() => handleEventClick(event.id)}
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
                      <CardDescription className="flex items-center gap-2 mb-4 text-gray-600">
                        <MapPin className="h-4 w-4 text-purple-500" />
                        {event.organizer.name}
                      </CardDescription>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-green-500" />
                          <span className="text-sm font-semibold text-green-600">
                            ₹{event.price.toLocaleString('en-IN')}
                          </span>
                        </div>
                        <Button 
                          size="sm" 
                          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                        >
                          Book Now
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              {filteredEvents.length === 0 && (
                <div className="text-center py-12">
                  <div className="bg-gradient-to-r from-purple-100 to-pink-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Calendar className="h-12 w-12 text-purple-500" />
                  </div>
                  <p className="text-gray-500 text-lg mb-2">No events found</p>
                  <p className="text-gray-400">Try adjusting your filters</p>
                </div>
              )}
            </div>
          </div>

          <div className="w-1/4">
            <Card className="bg-white/80 backdrop-blur-sm border-purple-200 shadow-lg sticky top-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-purple-700">
                  <Filter className="h-5 w-5" />
                  Filters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-purple-700 mb-2 block">
                    Event Type
                  </label>
                  <Select value={eventTypeFilter} onValueChange={setEventTypeFilter}>
                    <SelectTrigger className="border-purple-200 focus:border-purple-500 focus:ring-purple-500">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="CONFERENCE">Conference</SelectItem>
                      <SelectItem value="FESTIVAL">Festival</SelectItem>
                      <SelectItem value="SUMMIT">Summit</SelectItem>
                      <SelectItem value="WORKSHOP">Workshop</SelectItem>
                      <SelectItem value="SEMINAR">Seminar</SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-purple-700 mb-2 block">
                    Price Range
                  </label>
                  <Select value={priceRangeFilter} onValueChange={setPriceRangeFilter}>
                    <SelectTrigger className="border-purple-200 focus:border-purple-500 focus:ring-purple-500">
                      <SelectValue placeholder="Select range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Prices</SelectItem>
                      <SelectItem value="0-5000">₹0 - ₹5,000</SelectItem>
                      <SelectItem value="5000-15000">₹5,000 - ₹15,000</SelectItem>
                      <SelectItem value="15000-50000">₹15,000 - ₹50,000</SelectItem>
                      <SelectItem value="50000-100000">₹50,000 - ₹1,00,000</SelectItem>
                      <SelectItem value="100000+">₹1,00,000+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-purple-700 mb-2 block">
                    Organizer
                  </label>
                  <Select value={organizerFilter} onValueChange={setOrganizerFilter}>
                    <SelectTrigger className="border-purple-200 focus:border-purple-500 focus:ring-purple-500">
                      <SelectValue placeholder="Select organizer" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Organizers</SelectItem>
                      {getUniqueOrganizers().map((organizer) => (
                        <SelectItem key={organizer} value={organizer}>
                          {organizer}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  variant="outline" 
                  className="w-full border-purple-200 text-purple-700 hover:bg-purple-50"
                  onClick={() => {
                    setSearchTerm('')
                    setEventTypeFilter('all')
                    setPriceRangeFilter('all')
                    setOrganizerFilter('all')
                  }}
                >
                  Clear Filters
                </Button>

                <Button 
                  variant="link" 
                  className="w-full text-purple-600 hover:text-purple-700"
                  onClick={handleOrdersClick}
                >
                  View My Orders
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}