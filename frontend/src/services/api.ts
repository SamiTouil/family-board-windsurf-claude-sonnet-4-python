import axios from 'axios'
import type { User, UserCreate, UserUpdate } from '../types/user'
import type { LoginRequest, SignupRequest, AuthResponse } from '../types/auth'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Token management
export const tokenManager = {
  getToken: (): string | null => {
    return localStorage.getItem('auth_token')
  },
  
  setToken: (token: string): void => {
    localStorage.setItem('auth_token', token)
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`
  },
  
  removeToken: (): void => {
    localStorage.removeItem('auth_token')
    delete api.defaults.headers.common['Authorization']
  },
  
  initializeToken: (): void => {
    const token = tokenManager.getToken()
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
    }
  }
}

// Initialize token on app start
tokenManager.initializeToken()

// User API
export const userApi = {
  getUsers: async (): Promise<User[]> => {
    const response = await api.get<User[]>('/users/')
    return response.data
  },

  getUser: async (id: number): Promise<User> => {
    const response = await api.get<User>(`/users/${id}`)
    return response.data
  },

  createUser: async (userData: UserCreate): Promise<User> => {
    const response = await api.post<User>('/users/', userData)
    return response.data
  },

  updateUser: async (id: number, userData: UserUpdate): Promise<User> => {
    const response = await api.put<User>(`/users/${id}`, userData)
    return response.data
  },

  deleteUser: async (id: number): Promise<void> => {
    await api.delete(`/users/${id}`)
  },
}

// Auth API
export const authApi = {
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post<{ access_token: string; token_type: string }>('/auth/login', {
      email: credentials.email,
      password: credentials.password
    })
    
    // Store token
    tokenManager.setToken(response.data.access_token)
    
    // Get user info using the token
    const userResponse = await api.get<User>('/auth/me', {
      headers: {
        Authorization: `Bearer ${response.data.access_token}`
      }
    })
    
    // Return AuthResponse format with actual user data
    return {
      access_token: response.data.access_token,
      token_type: response.data.token_type,
      user: userResponse.data
    }
  },

  signup: async (userData: SignupRequest): Promise<AuthResponse> => {
    // First create the user
    const signupResponse = await api.post<User>('/auth/signup', userData)
    
    // Then login to get the token
    const loginResponse = await api.post<{ access_token: string; token_type: string }>('/auth/login', {
      email: userData.email,
      password: userData.password
    })
    
    // Store token
    tokenManager.setToken(loginResponse.data.access_token)
    
    // Return combined response
    return {
      access_token: loginResponse.data.access_token,
      token_type: loginResponse.data.token_type,
      user: {
        id: signupResponse.data.id,
        first_name: signupResponse.data.first_name,
        last_name: signupResponse.data.last_name,
        email: signupResponse.data.email,
        avatar_url: signupResponse.data.avatar_url
      }
    }
  },

  logout: (): void => {
    tokenManager.removeToken()
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await api.get<User>('/auth/me')
    return response.data
  }
}

export default api
