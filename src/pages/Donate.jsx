import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { db } from '../lib/supabase'
import { 
  initializeFlutterwavePayment, 
  initializePaystackPayment, 
  loadPaymentScripts,
  formatAmount 
} from '../lib/payments'
import { Heart, CreditCard, Building, User, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'

const Donate = () => {
  const { userProfile } = useAuth()
  const [requests, setRequests] = useState([])
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [donationAmount, setDonationAmount] = useState('')
  const [paymentMethod, setPaymentMethod] = 'flutterwave'
  const [loading, setLoading] = useState(false)
  const [loadingRequests, setLoadingRequests] = useState(true)

  useEffect(() => {
    loadPaymentScripts()
    fetchRequests()
  }, [])

  const fetchRequests = async () => {
    try {
      setLoadingRequests(true)
      // Get all requests, not just pending ones
      const data = await db.getRequests()
      setRequests(data)
    } catch (error) {
      console.error('Error fetching requests:', error)
      toast.error('Failed to load food requests')
    } finally {
      setLoadingRequests(false)
    }
  }

  const handleRequestSelect = (request) => {
    setSelectedRequest(request)
    setDonationAmount('')
  }

  const handleDonation = async () => {
    if (!donationAmount || parseFloat(donationAmount) <= 0) {
      toast.error('Please enter a valid donation amount')
      return
    }

    setLoading(true)
    try {
      const paymentData = {
        amount: parseFloat(donationAmount),
        email: userProfile.email,
        name: userProfile.name,
        phone: userProfile.phone || '',
        requestId: selectedRequest?.id || null, // Pass requestId if available
        requestDescription: selectedRequest?.description || 'General Donation' // Pass description if available
      }

      let paymentResult
      if (paymentMethod === 'flutterwave') {
        paymentResult = await initializeFlutterwavePayment(paymentData)
      } else {
        paymentResult = await initializePaystackPayment(paymentData)
      }

      // Save donation to database
      const donationData = {
        donor_id: userProfile.id,
        request_id: selectedRequest?.id || null, // Save requestId if available
        amount: parseFloat(donationAmount),
        payment_status: 'completed',
        transaction_id: paymentResult.transactionId,
        payment_reference: paymentResult.reference,
        payment_provider: paymentMethod
      }

      await db.createDonation(donationData)

      toast.success('Thank you for your donation! Your contribution will help provide food assistance.')
      
      // Reset form
      setSelectedRequest(null)
      setDonationAmount('')
      
      // Refresh requests
      fetchRequests()
    } catch (error) {
      console.error('Payment error:', error)
      toast.error('Payment failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const presetAmounts = [1000, 2500, 5000, 10000, 25000]

  if (loadingRequests) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Make a Donation
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Choose a food request and make a donation to help communities in need. 
            Every contribution makes a difference in someone's life.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Food Requests */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Food Requests
            </h2>
            
            {/* General Donation Option */}
            <div className="mb-6 p-4 border-2 border-dashed border-primary-300 rounded-lg text-center hover:border-primary-400 transition-colors cursor-pointer"
                 onClick={() => handleRequestSelect(null)}>
              <Heart className="h-8 w-8 text-primary-500 mx-auto mb-2" />
              <h3 className="font-medium text-primary-900 mb-1">Make a General Donation</h3>
              <p className="text-sm text-primary-700">Donate to our general food assistance fund</p>
            </div>
            
            {requests.length === 0 ? (
              <div className="text-center py-8">
                <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No food requests at the moment</p>
              </div>
            ) : (
              <div className="space-y-4">
                {requests.map((request) => (
                  <div
                    key={request.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors duration-200 ${
                      selectedRequest?.id === request.id
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleRequestSelect(request)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 mb-2">
                          {request.description}
                        </p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center space-x-1">
                            <User className="h-4 w-4" />
                            <span>{request.users?.name || 'Anonymous'}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Building className="h-4 w-4" />
                            <span>{request.ngos?.name || 'Unassigned NGO'}</span>
                          </div>
                        </div>
                        <div className="mt-2">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            request.status === 'approved' ? 'bg-blue-100 text-blue-800' :
                            request.status === 'fulfilled' ? 'bg-green-100 text-green-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                          </span>
                        </div>
                      </div>
                      {selectedRequest?.id === request.id && (
                        <CheckCircle className="h-5 w-5 text-primary-600" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Donation Form */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Donation Details
            </h2>

            {selectedRequest ? (
              <div className="space-y-6">
                {/* Selected Request Summary */}
                <div className="p-4 bg-primary-50 rounded-lg">
                  <h3 className="font-medium text-primary-900 mb-2">Selected Request</h3>
                  <p className="text-primary-800 text-sm">
                    {selectedRequest.description}
                  </p>
                </div>

                {/* Donation Amount */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Donation Amount (₦)
                  </label>
                  
                  {/* Preset Amounts */}
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    {presetAmounts.map((amount) => (
                      <button
                        key={amount}
                        type="button"
                        onClick={() => setDonationAmount(amount.toString())}
                        className={`p-3 text-center rounded-lg border transition-colors duration-200 ${
                          donationAmount === amount.toString()
                            ? 'border-primary-500 bg-primary-50 text-primary-700'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        {formatAmount(amount)}
                      </button>
                    ))}
                  </div>

                  {/* Custom Amount */}
                  <input
                    type="number"
                    value={donationAmount}
                    onChange={(e) => setDonationAmount(e.target.value)}
                    placeholder="Enter custom amount"
                    className="input-field"
                    min="100"
                    step="100"
                  />
                </div>

                {/* Payment Method */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Payment Method
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <label className="relative flex items-center p-3 border rounded-lg cursor-pointer">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="flutterwave"
                        checked={paymentMethod === 'flutterwave'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="sr-only"
                      />
                      <div className={`w-4 h-4 rounded-full border-2 mr-3 ${
                        paymentMethod === 'flutterwave'
                          ? 'border-primary-500 bg-primary-500'
                          : 'border-gray-300'
                      }`}></div>
                      <div>
                        <div className="font-medium text-gray-900">Flutterwave</div>
                        <div className="text-sm text-gray-500">Cards, Mobile Money</div>
                      </div>
                    </label>

                    <label className="relative flex items-center p-3 border rounded-lg cursor-pointer">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="paystack"
                        checked={paymentMethod === 'paystack'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="sr-only"
                      />
                      <div className={`w-4 h-4 rounded-full border-2 mr-3 ${
                        paymentMethod === 'paystack'
                          ? 'border-primary-500 bg-primary-500'
                          : 'border-gray-300'
                      }`}></div>
                      <div>
                        <div className="font-medium text-gray-900">Paystack</div>
                        <div className="text-sm text-gray-500">Cards, Bank Transfer</div>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Donate Button */}
                <button
                  onClick={handleDonation}
                  disabled={loading || !donationAmount}
                  className="w-full btn-primary py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Processing...' : `Donate ${formatAmount(donationAmount || 0)}`}
                </button>

                {/* Security Note */}
                <div className="text-center text-sm text-gray-500">
                  <p>🔒 Your payment is secure and encrypted</p>
                  <p>All donations are tracked transparently</p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* General Donation Info */}
                <div className="p-4 bg-primary-50 rounded-lg">
                  <h3 className="font-medium text-primary-900 mb-2">General Donation</h3>
                  <p className="text-primary-800 text-sm">
                    Your donation will go to our general food assistance fund to help communities in need.
                  </p>
                </div>

                {/* Donation Amount */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Donation Amount (₦)
                  </label>
                  
                  {/* Preset Amounts */}
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    {presetAmounts.map((amount) => (
                      <button
                        key={amount}
                        type="button"
                        onClick={() => setDonationAmount(amount.toString())}
                        className={`p-3 text-center rounded-lg border transition-colors duration-200 ${
                          donationAmount === amount.toString()
                            ? 'border-primary-500 bg-primary-50 text-primary-700'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        {formatAmount(amount)}
                      </button>
                    ))}
                  </div>

                  {/* Custom Amount */}
                  <input
                    type="number"
                    value={donationAmount}
                    onChange={(e) => setDonationAmount(e.target.value)}
                    placeholder="Enter custom amount"
                    className="input-field"
                    min="100"
                    step="100"
                  />
                </div>

                {/* Payment Method */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Payment Method
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <label className="relative flex items-center p-3 border rounded-lg cursor-pointer">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="flutterwave"
                        checked={paymentMethod === 'flutterwave'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="sr-only"
                      />
                      <div className={`w-4 h-4 rounded-full border-2 mr-3 ${
                        paymentMethod === 'flutterwave'
                          ? 'border-primary-500 bg-primary-500'
                          : 'border-gray-300'
                      }`}></div>
                      <div>
                        <div className="font-medium text-gray-900">Flutterwave</div>
                        <div className="text-sm text-gray-500">Cards, Mobile Money</div>
                      </div>
                    </label>

                    <label className="relative flex items-center p-3 border rounded-lg cursor-pointer">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="paystack"
                        checked={paymentMethod === 'paystack'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="sr-only"
                      />
                      <div className={`w-4 h-4 rounded-full border-2 mr-3 ${
                        paymentMethod === 'paystack'
                          ? 'border-primary-500 bg-primary-500'
                          : 'border-gray-300'
                      }`}></div>
                      <div>
                        <div className="font-medium text-gray-900">Paystack</div>
                        <div className="text-sm text-gray-500">Cards, Bank Transfer</div>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Donate Button */}
                <button
                  onClick={handleDonation}
                  disabled={loading || !donationAmount}
                  className="w-full btn-primary py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Processing...' : `Donate ${formatAmount(donationAmount || 0)}`}
                </button>

                {/* Security Note */}
                <div className="text-center text-sm text-gray-500">
                  <p>🔒 Your payment is secure and encrypted</p>
                  <p>All donations are tracked transparently</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Impact Section */}
        <div className="mt-12 card">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Your Impact Matters
            </h2>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Every donation helps provide nutritious meals to families and communities in need. 
              Track your impact and see how your generosity makes a difference.
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-600 mb-2">₦1000</div>
                <p className="text-gray-600">Provides 1 family meal</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-600 mb-2">₦5000</div>
                <p className="text-gray-600">Feeds 5 families for a day</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-600 mb-2">₦25000</div>
                <p className="text-gray-600">Supports a community program</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Donate
