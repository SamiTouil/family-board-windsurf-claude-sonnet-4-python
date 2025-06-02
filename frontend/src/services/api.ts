import axios from 'axios'
import type { User, UserCreate, UserUpdate } from '../types/user'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
})

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

export default api
