import React from 'react'
import { Link } from 'react-router-dom'
import { Heart, Users, Shield, TrendingUp, ArrowRight } from 'lucide-react'

const Home = () => {
  const features = [
    {
      icon: Heart,
      title: 'Direct Impact',
      description: 'See exactly how your donations help communities in need with full transparency.'
    },
    {
      icon: Users,
      title: 'Community Driven',
      description: 'Connect donors, NGOs, and beneficiaries in a trusted ecosystem.'
    },
    {
      icon: Shield,
      title: 'Verified Partners',
      description: 'All NGOs are thoroughly vetted to ensure your donations reach the right people.'
    },
    {
      icon: TrendingUp,
      title: 'Real-time Updates',
      description: 'Track the progress of your donations and see the impact in real-time.'
    }
  ]

  const stats = [
    { number: '10,000+', label: 'Lives Impacted' },
    { number: '500+', label: 'Verified NGOs' },
    { number: '₦50M+', label: 'Donations Raised' },
    { number: '95%', label: 'Success Rate' }
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-50 to-secondary-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            End Hunger,
            <span className="text-primary-600"> One Donation</span> at a Time
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            FoodLink connects compassionate donors with verified NGOs to provide food assistance 
            to communities in need. Together, we can achieve Zero Hunger.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="btn-primary text-lg px-8 py-3"
            >
              Start Donating Today
            </Link>
            <Link
              to="/#how-it-works"
              className="btn-outline text-lg px-8 py-3"
            >
              Learn How It Works
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary-600 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="how-it-works" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How FoodLink Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our simple three-step process makes it easy to make a difference
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {features.map((feature, index) => (
              <div key={index} className="card text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-6">
                  <feature.icon className="h-8 w-8 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>

          {/* Process Steps */}
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-primary-600 text-white rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Beneficiaries Request Help
              </h3>
              <p className="text-gray-600">
                People in need submit food assistance requests through our platform.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-primary-600 text-white rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                NGOs Verify & Distribute
              </h3>
              <p className="text-gray-600">
                Verified NGOs review requests and coordinate food distribution.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-primary-600 text-white rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Donors Support & Track
              </h3>
              <p className="text-gray-600">
                Generous donors contribute and see their impact in real-time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Make a Difference?
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Join thousands of donors who are already helping communities achieve food security.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="bg-white text-primary-600 hover:bg-gray-100 font-medium py-3 px-8 rounded-lg transition-colors duration-200 text-lg"
            >
              Get Started Now
            </Link>
            <Link
              to="/login"
              className="border-2 border-white text-white hover:bg-white hover:text-primary-600 font-medium py-3 px-8 rounded-lg transition-colors duration-200 text-lg"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                About FoodLink
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                FoodLink is a mission-driven platform dedicated to addressing Zero Hunger (SDG 2) 
                by creating a transparent bridge between donors and communities in need.
              </p>
              <p className="text-lg text-gray-600 mb-6">
                We believe that everyone deserves access to nutritious food, and through 
                technology and community collaboration, we can make this vision a reality.
              </p>
              <div className="flex items-center space-x-2 text-primary-600 font-medium">
                <span>Learn more about our mission</span>
                <ArrowRight className="h-5 w-5" />
              </div>
            </div>
            <div className="bg-gradient-to-br from-primary-100 to-secondary-100 rounded-2xl p-8">
              <div className="text-center">
                <Heart className="h-24 w-24 text-primary-600 mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Our Mission
                </h3>
                <p className="text-gray-700">
                  To eliminate hunger by connecting compassionate donors with verified organizations 
                  and ensuring transparent, efficient food distribution to those who need it most.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
