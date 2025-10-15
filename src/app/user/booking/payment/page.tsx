'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ArrowLeft, CreditCard, Smartphone, Truck, CheckCircle, IndianRupee, Calendar, Sparkles } from 'lucide-react'

interface BookingData {
  eventId: string
  selectedDateTime: string
  finalCost: number
  address: {
    country: string
    state: string
    city: string
    pinCode: string
    address: string
  }
}

interface User {
  id: string
  email: string
  name: string | null
  role: string
}

export default function PaymentPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [bookingData, setBookingData] = useState<BookingData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('online')

  useEffect(() => {
    const userData = localStorage.getItem('user')
    const bookingDataStr = localStorage.getItem('bookingData')

    if (!userData || !bookingDataStr) {
      console.log('Missing user or booking data, redirecting to dashboard')
      router.push('/user/dashboard')
      return
    }

    try {
      const parsedUser = JSON.parse(userData)
      if (parsedUser.role !== 'USER') {
        console.log('Invalid user role, redirecting to home')
        router.push('/')
        return
      }

      const parsedBookingData = JSON.parse(bookingDataStr)
      
      // Validate required booking data fields
      if (!parsedBookingData.eventId || !parsedBookingData.selectedDateTime || !parsedBookingData.finalCost) {
        console.log('Invalid booking data structure, redirecting to dashboard')
        router.push('/user/dashboard')
        return
      }

      // Check if address data exists, if not redirect to address page
      if (!parsedBookingData.address || !parsedBookingData.address.country || !parsedBookingData.address.city) {
        console.log('Missing address data, redirecting to address page')
        router.push('/user/booking/address')
        return
      }

      setUser(parsedUser)
      setBookingData(parsedBookingData)
      console.log('Payment page loaded successfully with booking data:', parsedBookingData)
    } catch (error) {
      console.error('Error parsing stored data:', error)
      router.push('/user/dashboard')
      return
    }

    setIsLoading(false)
  }, [router])

  const handlePayment = async () => {
    if (!bookingData || !user) return

    setIsProcessing(true)
    setError('')

    try {
      const orderData = {
        userId: user.id,
        eventId: bookingData.eventId,
        bookingDate: new Date().toISOString(),
        selectedDateTime: bookingData.selectedDateTime,
        finalCost: bookingData.finalCost,
        paymentMethod: paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment',
        paymentStatus: paymentMethod === 'cod' ? 'PENDING' : 'COMPLETED'
      }

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(true)
        localStorage.removeItem('bookingData')
        
        setTimeout(() => {
          router.push('/user/orders')
        }, 3000)
      } else {
        setError(data.error || 'Payment failed')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleBack = () => {
    router.back()
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-400 via-pink-500 to-red-500">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
      </div>
    )
  }

  if (!bookingData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-red-50 flex items-center justify-center">
        <Card className="w-full max-w-md bg-white/80 backdrop-blur-sm border-purple-200 shadow-xl">
          <CardContent className="text-center py-8">
            <div className="bg-gradient-to-r from-purple-100 to-pink-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="h-8 w-8 text-purple-500" />
            </div>
            <p className="text-gray-500 mb-4">Booking data not found</p>
            <Button 
              onClick={() => router.push('/user/dashboard')}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
            >
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-red-50 flex items-center justify-center">
        <Card className="w-full max-w-md bg-white/80 backdrop-blur-sm border-purple-200 shadow-xl">
          <CardContent className="text-center py-8">
            <div className="bg-gradient-to-r from-green-100 to-green-200 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-lg font-medium bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent mb-2">
              Booking Confirmed!
            </h3>
            <p className="text-gray-500 mb-6">
              Your booking has been successfully {paymentMethod === 'cod' ? 'placed' : 'paid'}.
              You will be redirected to your orders page shortly.
            </p>
            <Button 
              onClick={() => router.push('/user/orders')}
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
            >
              View My Orders
            </Button>
          </CardContent>
        </Card>
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
                  Back
                </Button>
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded-lg">
                  <CreditCard className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Payment
                </h1>
              </div>
            </div>
          </div>
        </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertDescription className="text-red-700">{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card className="bg-white/80 backdrop-blur-sm border-purple-200 shadow-xl overflow-hidden mb-6">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 pb-4">
                <CardTitle className="text-purple-800">Payment Method</CardTitle>
                <CardDescription className="text-purple-600">
                  Choose your preferred payment method
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-4">
                  <div className="flex items-center space-x-2 p-4 border-2 border-purple-200 rounded-xl cursor-pointer hover:bg-purple-50 transition-colors bg-gradient-to-r from-blue-50 to-blue-100">
                    <RadioGroupItem value="online" id="online" className="text-blue-600" />
                    <Label htmlFor="online" className="flex items-center gap-3 cursor-pointer flex-1">
                      <div className="bg-blue-500 p-2 rounded-lg">
                        <CreditCard className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <div className="font-medium text-blue-800">Online Payment</div>
                        <div className="text-sm text-blue-600">Pay securely with credit/debit card or UPI</div>
                      </div>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2 p-4 border-2 border-purple-200 rounded-xl cursor-pointer hover:bg-purple-50 transition-colors bg-gradient-to-r from-green-50 to-green-100">
                    <RadioGroupItem value="upi" id="upi" className="text-green-600" />
                    <Label htmlFor="upi" className="flex items-center gap-3 cursor-pointer flex-1">
                      <div className="bg-green-500 p-2 rounded-lg">
                        <Smartphone className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <div className="font-medium text-green-800">UPI Payment</div>
                        <div className="text-sm text-green-600">Pay using any UPI app</div>
                      </div>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2 p-4 border-2 border-purple-200 rounded-xl cursor-pointer hover:bg-purple-50 transition-colors bg-gradient-to-r from-orange-50 to-orange-100">
                    <RadioGroupItem value="cod" id="cod" className="text-orange-600" />
                    <Label htmlFor="cod" className="flex items-center gap-3 cursor-pointer flex-1">
                      <div className="bg-orange-500 p-2 rounded-lg">
                        <Truck className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <div className="font-medium text-orange-800">Cash on Delivery</div>
                        <div className="text-sm text-orange-600">Pay when you attend the event</div>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-purple-200 shadow-xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 pb-4">
                <CardTitle className="text-purple-800">Delivery Address</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {bookingData.address ? (
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-200">
                    <p className="font-medium text-purple-800 mb-2">{bookingData.address.address}</p>
                    <p className="text-purple-600 mb-1">
                      {bookingData.address.city}, {bookingData.address.state} {bookingData.address.pinCode}
                    </p>
                    <p className="text-purple-600">{bookingData.address.country}</p>
                  </div>
                ) : (
                  <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                    <p className="text-yellow-800">Address information is missing. Please go back and enter your address.</p>
                    <Button 
                      onClick={() => router.push('/user/booking/address')}
                      className="mt-2 bg-yellow-500 hover:bg-yellow-600 text-white"
                    >
                      Enter Address
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="bg-white/80 backdrop-blur-sm border-purple-200 shadow-xl sticky top-6 overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 pb-4">
                <CardTitle className="text-purple-800">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-2">
                  <div className="bg-purple-100 p-2 rounded-lg">
                    <Calendar className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Event Date</p>
                    <p className="font-medium text-gray-800">
                      {bookingData.selectedDateTime ? 
                        new Date(bookingData.selectedDateTime).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        }) : 'Date not available'
                      }
                    </p>
                  </div>
                </div>

                <div className="border-t border-purple-100 pt-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-purple-700">Subtotal:</span>
                    <span className="font-medium text-purple-800">
                      ₹{bookingData.finalCost ? bookingData.finalCost.toLocaleString('en-IN') : '0'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-purple-700">Payment Method:</span>
                    <span className="font-medium text-purple-800">
                      {paymentMethod === 'cod' ? 'Cash on Delivery' : 
                       paymentMethod === 'upi' ? 'UPI Payment' : 'Online Payment'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span className="text-purple-800">Total:</span>
                    <span className="text-green-600">
                      ₹{bookingData.finalCost ? bookingData.finalCost.toLocaleString('en-IN') : '0'}
                    </span>
                  </div>
                </div>

                <Button 
                  onClick={handlePayment} 
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium transition-all transform hover:scale-105 shadow-lg" 
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <IndianRupee className="text-lg mr-2" />
                      {paymentMethod === 'cod' ? 'Place Order' : 'Pay Now'}
                    </>
                  )}
                </Button>

                <div className="text-xs text-purple-500 text-center">
                  By completing this purchase, you agree to our terms and conditions
                </div>
              </CardContent>
            </Card>
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
    </div>
  )
}