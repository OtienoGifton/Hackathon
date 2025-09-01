// Payment integration utilities for Flutterwave and Paystack

// Flutterwave payment configuration
export const flutterwaveConfig = {
  publicKey: import.meta.env.VITE_FLUTTERWAVE_PUBLIC_KEY,
  txRef: () => `FLW-${Date.now()}`,
  currency: 'NGN',
  country: 'NG',
  paymentOptions: 'card,mobilemoney,ussd',
  customer: {
    email: '',
    name: '',
    phone_number: ''
  },
  customizations: {
    title: 'FoodLink Donation',
    description: 'Supporting communities in need',
    logo: 'https://foodlink.com/logo.png'
  }
}

// Paystack payment configuration
export const paystackConfig = {
  publicKey: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
  email: '',
  amount: 0,
  currency: 'NGN',
  ref: () => `PS-${Date.now()}`,
  callback: (response) => {
    console.log('Payment successful:', response)
  },
  onClose: () => {
    console.log('Payment cancelled')
  }
}

// Initialize Flutterwave payment
export const initializeFlutterwavePayment = (paymentData) => {
  return new Promise((resolve, reject) => {
    if (typeof window.FlutterwaveCheckout === 'undefined') {
      reject(new Error('Flutterwave not loaded'))
      return
    }

    const config = {
      ...flutterwaveConfig,
      txRef: flutterwaveConfig.txRef(),
      amount: paymentData.amount,
      customer: {
        email: paymentData.email,
        name: paymentData.name,
        phone_number: paymentData.phone || ''
      },
      callback: (response) => {
        if (response.status === 'successful') {
          resolve({
            transactionId: response.transaction_id,
            reference: response.tx_ref,
            amount: paymentData.amount,
            status: 'success'
          })
        } else {
          reject(new Error('Payment failed'))
        }
      },
      onClose: () => {
        reject(new Error('Payment cancelled'))
      }
    }

    window.FlutterwaveCheckout(config)
  })
}

// Initialize Paystack payment
export const initializePaystackPayment = (paymentData) => {
  return new Promise((resolve, reject) => {
    if (typeof window.PaystackPop === 'undefined') {
      reject(new Error('Paystack not loaded'))
      return
    }

    const config = {
      ...paystackConfig,
      email: paymentData.email,
      amount: paymentData.amount * 100, // Paystack expects amount in kobo
      ref: paystackConfig.ref(),
      callback: (response) => {
        resolve({
          transactionId: response.reference,
          reference: response.reference,
          amount: paymentData.amount,
          status: 'success'
        })
      },
      onClose: () => {
        reject(new Error('Payment cancelled'))
      }
    }

    window.PaystackPop.setup(config)
    window.PaystackPop.openIframe()
  })
}

// Verify payment with backend
export const verifyPayment = async (reference, provider) => {
  try {
    const response = await fetch('/api/verify-payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        reference,
        provider
      })
    })

    if (!response.ok) {
      throw new Error('Payment verification failed')
    }

    const result = await response.json()
    return result
  } catch (error) {
    console.error('Payment verification error:', error)
    throw error
  }
}

// Format amount for display
export const formatAmount = (amount, currency = 'NGN') => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: currency
  }).format(amount)
}

// Load payment scripts
export const loadPaymentScripts = () => {
  // Load Flutterwave script
  if (!document.querySelector('script[src*="flutterwave"]')) {
    const flutterwaveScript = document.createElement('script')
    flutterwaveScript.src = 'https://checkout.flutterwave.com/v3.js'
    document.head.appendChild(flutterwaveScript)
  }

  // Load Paystack script
  if (!document.querySelector('script[src*="paystack"]')) {
    const paystackScript = document.createElement('script')
    paystackScript.src = 'https://js.paystack.co/v1/inline.js'
    document.head.appendChild(paystackScript)
  }
}
