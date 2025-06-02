export interface User {
  id: number
  first_name: string
  last_name: string
  email: string
  avatar_url?: string
}

export interface UserCreate {
  first_name: string
  last_name: string
  email: string
  password: string
  avatar_url?: string
}

export interface UserUpdate {
  first_name?: string
  last_name?: string
  email?: string
  avatar_url?: string
}
