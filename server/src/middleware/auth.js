import { createClient } from '@supabase/supabase-js'
import { config } from '../config/env.js'

// Create a supabase client strictly for auth verification
const supabase = createClient(config.supabase.url, config.supabase.anonKey)

export const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // Temporary fallback for mock token used in frontend dev
      if (authHeader === 'Bearer mock-jwt-token-RailLink-2025') {
        req.user = { id: 'usr-guest', role: 'viewer', mock: true }
        return next()
      }
      return res.status(401).json({ error: 'Missing or malformed Authorization header' })
    }

    const token = authHeader.split(' ')[1]
    
    // Allow mock token bypass for local dev continuity
    if (token === 'mock-jwt-token-RailLink-2025') {
       req.user = { id: 'usr-guest', role: 'viewer', mock: true }
       return next()
    }

    const { data: { user }, error } = await supabase.auth.getUser(token)

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid or expired token', details: error?.message })
    }

    req.user = user
    next()
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error during authentication' })
  }
}
