export interface LoginRequest {
  email: string
  password: string
}

export interface SignupRequest {
  first_name: string
  last_name: string
  email: string
  password: string
  avatar_url?: string
}

export interface AuthResponse {
  access_token: string
  token_type: string
  user: {
    id: number
    first_name: string
    last_name: string
    email: string
    avatar_url?: string
  }
}

export interface AuthError {
  detail: string
}

export interface AuthState {
  isAuthenticated: boolean
  user: AuthResponse['user'] | null
  token: string | null
  loading: boolean
  error: string | null
}
