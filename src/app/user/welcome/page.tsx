'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, User, Sparkles, Calendar, MapPin, Star, Heart, Zap } from 'lucide-react'

interface User {
  id: string
  email: string
  name: string | null
  role: string
}

export default function WelcomePage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
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
    setIsLoading(false)
  }, [router])

  const handleContinue = () => {
    router.push('/user/dashboard')
  }

  const handleLogout = () => {
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    router.push('/')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-400 via-pink-500 to-red-500">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-green-300 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header */}
        <div className="p-4">
          <Button
            onClick={handleContinue}
            variant="outline"
            className="bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30 transition-all"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Continue to Dashboard
          </Button>
        </div>

        {/* Main content */}
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-4xl mx-auto text-center">
            {/* Welcome card */}
            <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-2xl mb-8 overflow-hidden">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-8">
                <div className="flex justify-center mb-6">
                  <div className="bg-white/20 backdrop-blur-sm rounded-full p-6">
                    <div className="bg-gradient-to-r from-yellow-400 to-orange-500 p-4 rounded-full">
                      <User className="h-16 w-16 text-white" />
                    </div>
                  </div>
                </div>
                <CardTitle className="text-4xl md:text-5xl font-bold text-white mb-4">
                  Welcome, {user?.name || 'User'}! 🎉
                </CardTitle>
                <CardDescription className="text-xl text-white/90">
                  Ready to explore amazing events?
                </CardDescription>
              </div>
              <CardContent className="p-8">
                <p className="text-gray-600 text-lg mb-8 leading-relaxed">
                  You're now logged in as a user. Browse through various events, book your favorites, and manage your orders all in one place. 
                  Your journey to unforgettable experiences starts here!
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
                    <div className="bg-blue-500 w-12 h-12 rounded-lg flex items-center justify-center mb-4 mx-auto">
                      <Calendar className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-blue-900 mb-2">Discover Events</h3>
                    <p className="text-blue-700 text-sm">Find amazing events near you</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200">
                    <div className="bg-green-500 w-12 h-12 rounded-lg flex items-center justify-center mb-4 mx-auto">
                      <MapPin className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-green-900 mb-2">Book Tickets</h3>
                    <p className="text-green-700 text-sm">Secure your spot instantly</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200">
                    <div className="bg-purple-500 w-12 h-12 rounded-lg flex items-center justify-center mb-4 mx-auto">
                      <Star className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-purple-900 mb-2">Manage Orders</h3>
                    <p className="text-purple-700 text-sm">Track all your bookings</p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button 
                    onClick={handleContinue} 
                    size="lg"
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold text-lg px-8 py-4 transition-all transform hover:scale-105 shadow-lg"
                  >
                    <Sparkles className="mr-2 h-5 w-5" />
                    Explore Events
                  </Button>
                  <Button 
                    onClick={handleLogout} 
                    variant="outline" 
                    size="lg"
                    className="border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold text-lg px-8 py-4"
                  >
                    Logout
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Fun facts section */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-white">
                <Heart className="h-8 w-8 mx-auto mb-2 text-red-300" />
                <p className="text-2xl font-bold">1000+</p>
                <p className="text-sm">Happy Users</p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-white">
                <Calendar className="h-8 w-8 mx-auto mb-2 text-yellow-300" />
                <p className="text-2xl font-bold">500+</p>
                <p className="text-sm">Events</p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-white">
                <Zap className="h-8 w-8 mx-auto mb-2 text-blue-300" />
                <p className="text-2xl font-bold">24/7</p>
                <p className="text-sm">Support</p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-white">
                <Star className="h-8 w-8 mx-auto mb-2 text-green-300" />
                <p className="text-2xl font-bold">4.9</p>
                <p className="text-sm">Rating</p>
              </div>
            </div>
          </div>
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