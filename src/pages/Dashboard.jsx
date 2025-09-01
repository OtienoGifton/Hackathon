import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { db } from '../lib/supabase'
import { 
  Heart, 
  Users, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Plus,
  Eye
} from 'lucide-react'
import { formatAmount } from '../lib/payments'

const Dashboard = () => {
  const { userProfile, isDonor, isNGO, isBeneficiary } = useAuth()
  const [stats, setStats] = useState({})
  const [recentRequests, setRecentRequests] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      if (isDonor) {
        // Fetch donor-specific data
        const [requests, donations] = await Promise.all([
          db.getRequests('pending'),
          db.getDonationsByRequest(null) // This would need to be modified to get all donations by donor
        ])
        
        setRecentRequests(requests.slice(0, 5))
        setStats({
          totalDonations: donations.length,
          totalAmount: donations.reduce((sum, d) => sum + (d.amount || 0), 0),
          pendingRequests: requests.filter(r => r.status === 'pending').length,
          fulfilledRequests: requests.filter(r => r.status === 'fulfilled').length
        })
      } else if (isNGO) {
        // Fetch NGO-specific data
        const requests = await db.getRequests()
        const ngoRequests = requests.filter(r => r.ngo_id === userProfile.id)
        
        setRecentRequests(ngoRequests.slice(0, 5))
        setStats({
          totalRequests: ngoRequests.length,
          pendingRequests: ngoRequests.filter(r => r.status === 'pending').length,
          fulfilledRequests: ngoRequests.filter(r => r.status === 'fulfilled').length,
          totalBeneficiaries: new Set(ngoRequests.map(r => r.user_id)).size
        })
      } else if (isBeneficiary) {
        // Fetch beneficiary-specific data
        const requests = await db.getRequests()
        const userRequests = requests.filter(r => r.user_id === userProfile.id)
        
        setRecentRequests(userRequests.slice(0, 5))
        setStats({
          totalRequests: userRequests.length,
          pendingRequests: userRequests.filter(r => r.status === 'pending').length,
          fulfilledRequests: userRequests.filter(r => r.status === 'fulfilled').length,
          totalDonations: 0 // Would need to calculate from donations
        })
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatCards = () => {
    if (isDonor) {
      return [
        {
          title: 'Total Donations',
          value: stats.totalDonations || 0,
          icon: Heart,
          color: 'text-primary-600',
          bgColor: 'bg-primary-100'
        },
        {
          title: 'Total Amount',
          value: formatAmount(stats.totalAmount || 0),
          icon: TrendingUp,
          color: 'text-green-600',
          bgColor: 'bg-green-100'
        },
        {
          title: 'Pending Requests',
          value: stats.pendingRequests || 0,
          icon: Clock,
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-100'
        },
        {
          title: 'Fulfilled',
          value: stats.fulfilledRequests || 0,
          icon: CheckCircle,
          color: 'text-green-600',
          bgColor: 'bg-green-100'
        }
      ]
    } else if (isNGO) {
      return [
        {
          title: 'Total Requests',
          value: stats.totalRequests || 0,
          icon: Users,
          color: 'text-blue-600',
          bgColor: 'bg-blue-100'
        },
        {
          title: 'Pending',
          value: stats.pendingRequests || 0,
          icon: Clock,
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-100'
        },
        {
          title: 'Fulfilled',
          value: stats.fulfilledRequests || 0,
          icon: CheckCircle,
          color: 'text-green-600',
          bgColor: 'bg-green-100'
        },
        {
          title: 'Beneficiaries',
          value: stats.totalBeneficiaries || 0,
          icon: Users,
          color: 'text-purple-600',
          bgColor: 'bg-purple-100'
        }
      ]
    } else if (isBeneficiary) {
      return [
        {
          title: 'Total Requests',
          value: stats.totalRequests || 0,
          icon: Users,
          color: 'text-blue-600',
          bgColor: 'bg-blue-100'
        },
        {
          title: 'Pending',
          value: stats.pendingRequests || 0,
          icon: Clock,
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-100'
        },
        {
          title: 'Fulfilled',
          value: stats.fulfilledRequests || 0,
          icon: CheckCircle,
          color: 'text-green-600',
          bgColor: 'bg-green-100'
        },
        {
          title: 'Donations Received',
          value: stats.totalDonations || 0,
          icon: Heart,
          color: 'text-primary-600',
          bgColor: 'bg-primary-100'
        }
      ]
    }
    return []
  }

  const getWelcomeMessage = () => {
    if (isDonor) {
      return {
        title: 'Welcome back, generous donor!',
        subtitle: 'Your contributions are making a real difference in communities.',
        action: 'Browse food requests and make a donation today.'
      }
    } else if (isNGO) {
      return {
        title: 'Welcome back, NGO partner!',
        subtitle: 'Help us distribute food assistance to those in need.',
        action: 'Review and manage food requests from beneficiaries.'
      }
    } else if (isBeneficiary) {
      return {
        title: 'Welcome back!',
        subtitle: 'We\'re here to help you access food assistance.',
        action: 'Submit a new request or check the status of existing ones.'
      }
    }
    return {
      title: 'Welcome to FoodLink!',
      subtitle: 'Your platform for connecting communities through food.',
      action: 'Get started by exploring your dashboard.'
    }
  }

  const getQuickActions = () => {
    if (isDonor) {
      return [
        { label: 'Browse Requests', href: '/requests', icon: Eye },
        { label: 'Make Donation', href: '/donate', icon: Heart }
      ]
    } else if (isNGO) {
      return [
        { label: 'Review Requests', href: '/requests', icon: Eye },
        { label: 'Add New Program', href: '/requests', icon: Plus }
      ]
    } else if (isBeneficiary) {
      return [
        { label: 'Submit Request', href: '/requests', icon: Plus },
        { label: 'View Status', href: '/requests', icon: Eye }
      ]
    }
    return []
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  const welcome = getWelcomeMessage()
  const statCards = getStatCards()
  const quickActions = getQuickActions()

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {welcome.title}
          </h1>
          <p className="text-lg text-gray-600 mb-4">
            {welcome.subtitle}
          </p>
          <p className="text-gray-500">
            {welcome.action}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => (
            <div key={index} className="card">
              <div className="flex items-center">
                <div className={`p-3 rounded-full ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {quickActions.map((action, index) => (
            <a
              key={index}
              href={action.href}
              className="card hover:shadow-md transition-shadow duration-200 cursor-pointer"
            >
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-primary-100">
                  <action.icon className="h-6 w-6 text-primary-600" />
                </div>
                <div className="ml-4">
                  <p className="font-medium text-gray-900">{action.label}</p>
                </div>
              </div>
            </a>
          ))}
        </div>

        {/* Recent Activity */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
            <a href="/requests" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
              View all
            </a>
          </div>

          {recentRequests.length > 0 ? (
            <div className="space-y-4">
              {recentRequests.map((request, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className={`p-2 rounded-full ${
                      request.status === 'fulfilled' ? 'bg-green-100' : 'bg-yellow-100'
                    }`}>
                      {request.status === 'fulfilled' ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <Clock className="h-5 w-5 text-yellow-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {request.description?.substring(0, 50)}...
                      </p>
                      <p className="text-sm text-gray-500">
                        Status: {request.status}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">
                      {new Date(request.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No recent activity to show</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard
