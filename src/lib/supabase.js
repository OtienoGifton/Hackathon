import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database helper functions
export const db = {
  // User management
  async createUser(userData) {
    const { data, error } = await supabase
      .from('users')
      .insert([userData])
      .select()
    
    if (error) throw error
    return data[0]
  },

  async getUserById(id) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  },

  async updateUser(id, updates) {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select()
    
    if (error) throw error
    return data[0]
  },

  // Food requests
  async createRequest(requestData) {
    const { data, error } = await supabase
      .from('requests')
      .insert([requestData])
      .select()
    
    if (error) throw error
    return data[0]
  },

  async getRequests(status = null) {
    let query = supabase
      .from('requests')
      .select(`
        *,
        users!requests_user_id_fkey(name, email),
        ngos!requests_ngo_id_fkey(name, location)
      `)
      .order('created_at', { ascending: false })
    
    if (status) {
      query = query.eq('status', status)
    }
    
    const { data, error } = await query
    if (error) throw error
    return data
  },

  async getRequestsByUser(userId) {
    const { data, error } = await supabase
      .from('requests')
      .select(`
        *,
        users!requests_user_id_fkey(name, email),
        ngos!requests_ngo_id_fkey(name, location)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  async updateRequestStatus(id, status, ngoId = null) {
    const updates = { status }
    if (ngoId) updates.ngo_id = ngoId
    
    const { data, error } = await supabase
      .from('requests')
      .update(updates)
      .eq('id', id)
      .select()
    
    if (error) throw error
    return data[0]
  },

  async updateRequest(id, updates) {
    const { data, error } = await supabase
      .from('requests')
      .update(updates)
      .eq('id', id)
      .select()
    
    if (error) throw error
    return data[0]
  },

  async deleteRequest(id) {
    const { error } = await supabase
      .from('requests')
      .delete()
      .eq('id', id)
    
    if (error) throw error
    return true
  },

  // Donations
  async createDonation(donationData) {
    const { data, error } = await supabase
      .from('donations')
      .insert([donationData])
      .select()
    
    if (error) throw error
    return data[0]
  },

  async createGeneralDonation(donationData) {
    const { data, error } = await supabase
      .from('donations')
      .insert([{
        ...donationData,
        donation_type: 'general',
        request_id: null
      }])
      .select()
    
    if (error) throw error
    return data[0]
  },

  async getDonationsByRequest(requestId) {
    const { data, error } = await supabase
      .from('donations')
      .select(`
        *,
        users!donations_donor_id_fkey(name, email)
      `)
      .eq('request_id', requestId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  async getDonationsByDonor(donorId) {
    const { data, error } = await supabase
      .from('donations')
      .select(`
        *,
        requests!donations_request_id_fkey(description, status)
      `)
      .eq('donor_id', donorId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  async getGeneralDonations() {
    const { data, error } = await supabase
      .from('donations')
      .select(`
        *,
        users!donations_donor_id_fkey(name, email)
      `)
      .is('request_id', null)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  // NGOs
  async getNGOs() {
    const { data, error } = await supabase
      .from('ngos')
      .select('*')
      .eq('verified', true)
      .order('name')
    
    if (error) throw error
    return data
  },

  async createNGO(ngoData) {
    const { data, error } = await supabase
      .from('ngos')
      .insert([ngoData])
      .select()
    
    if (error) throw error
    return data[0]
  }
}
