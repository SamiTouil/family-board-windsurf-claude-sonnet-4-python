/**
 * Frontend unit tests for authentication components and services
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import Login from '../components/Login';
import Signup from '../components/Signup';
import AuthPage from '../components/AuthPage';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { authService } from '../services/auth';

// Mock i18next with proper translations
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'auth.email': 'Email',
        'auth.password': 'Password',
        'auth.firstName': 'First Name',
        'auth.lastName': 'Last Name',
        'auth.confirmPassword': 'Confirm Password',
        'auth.login.title': 'Sign In',
        'auth.login.button': 'Sign In',
        'auth.login.loading': 'Signing in...',
        'auth.login.noAccount': 'Don\'t have an account?',
        'auth.signup.title': 'Sign Up',
        'auth.signup.button': 'Create Account',
        'auth.signup.loading': 'Creating account...',
        'auth.signup.hasAccount': 'Already have an account?',
        'auth.signup.passwordMismatch': 'Passwords do not match',
        'auth.signup.passwordTooShort': 'Password must be at least 6 characters'
      }
      return translations[key] || key
    },
    i18n: {
      language: 'en',
      changeLanguage: vi.fn()
    }
  }),
  I18nextProvider: ({ children }: { children: React.ReactNode }) => children
}));

// Mock the auth service
vi.mock('../services/auth', () => ({
  authService: {
    login: vi.fn(),
    signup: vi.fn(),
    logout: vi.fn(),
    isAuthenticated: vi.fn(),
    getToken: vi.fn(),
    getAuthHeaders: vi.fn(),
  },
}));

const mockAuthService = vi.mocked(authService);

// Test wrapper component with providers
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>
    {children}
  </AuthProvider>
);

describe('Login Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders login form correctly', () => {
    render(
      <TestWrapper>
        <Login onSuccess={() => {}} onSwitchToSignup={() => {}} />
      </TestWrapper>
    );

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('handles successful login', async () => {
    const mockToken = 'fake-jwt-token';
    mockAuthService.login.mockResolvedValue({ access_token: mockToken, token_type: 'bearer' });
    
    const onSuccess = vi.fn();
    
    render(
      <TestWrapper>
        <Login onSuccess={onSuccess} onSwitchToSignup={() => {}} />
      </TestWrapper>
    );

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockAuthService.login).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled();
    });
  });

  it('displays error on login failure', async () => {
    mockAuthService.login.mockRejectedValue(new Error('Invalid credentials'));
    
    render(
      <TestWrapper>
        <Login onSuccess={() => {}} onSwitchToSignup={() => {}} />
      </TestWrapper>
    );

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
    });
  });

  it('validates required fields', async () => {
    render(
      <TestWrapper>
        <Login onSuccess={() => {}} onSwitchToSignup={() => {}} />
      </TestWrapper>
    );

    const submitButton = screen.getByRole('button', { name: /sign in/i });
    fireEvent.click(submitButton);

    // The form uses HTML5 validation, so we need to check for the required attribute
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    
    expect(emailInput).toBeRequired();
    expect(passwordInput).toBeRequired();
  });

  it('disables form during loading', async () => {
    mockAuthService.login.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 1000)));
    
    render(
      <TestWrapper>
        <Login onSuccess={() => {}} onSwitchToSignup={() => {}} />
      </TestWrapper>
    );

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /signing in/i })).toBeDisabled();
    });
  });
});

describe('Signup Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders signup form correctly', () => {
    render(
      <TestWrapper>
        <Signup onSuccess={() => {}} onSwitchToLogin={() => {}} />
      </TestWrapper>
    );

    expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
  });

  it('handles successful signup', async () => {
    const mockUser = {
      id: 1,
      first_name: 'John',
      last_name: 'Doe',
      email: 'john@example.com',
      avatar_url: undefined,
    };
    const mockToken = 'fake-jwt-token';
    mockAuthService.signup.mockResolvedValue(mockUser);
    mockAuthService.login.mockResolvedValue({ access_token: mockToken, token_type: 'bearer' });
    
    const onSuccess = vi.fn();
    
    render(
      <TestWrapper>
        <Signup onSuccess={onSuccess} onSwitchToLogin={() => {}} />
      </TestWrapper>
    );

    const firstNameInput = screen.getByLabelText(/first name/i);
    const lastNameInput = screen.getByLabelText(/last name/i);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/^password/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
    const submitButton = screen.getByRole('button', { name: /create account/i });

    fireEvent.change(firstNameInput, { target: { value: 'John' } });
    fireEvent.change(lastNameInput, { target: { value: 'Doe' } });
    fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockAuthService.signup).toHaveBeenCalledWith({
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@example.com',
        password: 'password123',
      });
    });

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled();
    });
  });

  it('handles signup error', async () => {
    mockAuthService.signup.mockRejectedValue(new Error('Email already exists'));
    
    render(
      <TestWrapper>
        <Signup onSuccess={() => {}} onSwitchToLogin={() => {}} />
      </TestWrapper>
    );

    const firstNameInput = screen.getByLabelText(/first name/i);
    const lastNameInput = screen.getByLabelText(/last name/i);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/^password/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
    const submitButton = screen.getByRole('button', { name: /create account/i });

    fireEvent.change(firstNameInput, { target: { value: 'John' } });
    fireEvent.change(lastNameInput, { target: { value: 'Doe' } });
    fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/email already exists/i)).toBeInTheDocument();
    });
  });

  it('validates password confirmation', async () => {
    render(
      <TestWrapper>
        <Signup onSuccess={() => {}} onSwitchToLogin={() => {}} />
      </TestWrapper>
    );

    const firstNameInput = screen.getByLabelText(/first name/i);
    const lastNameInput = screen.getByLabelText(/last name/i);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/^password/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
    const submitButton = screen.getByRole('button', { name: /create account/i });

    fireEvent.change(firstNameInput, { target: { value: 'John' } });
    fireEvent.change(lastNameInput, { target: { value: 'Doe' } });
    fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'differentpassword' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
    });
  });
});

describe('AuthPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders login form by default', () => {
    render(
      <TestWrapper>
        <AuthPage onSuccess={() => {}} />
      </TestWrapper>
    );

    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /create account/i })).not.toBeInTheDocument();
  });

  it('switches to signup form when requested', () => {
    render(
      <TestWrapper>
        <AuthPage onSuccess={() => {}} />
      </TestWrapper>
    );

    const switchToSignupButton = screen.getByRole('button', { name: /sign up/i });
    fireEvent.click(switchToSignupButton);

    // Should show the signup form's main button
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
    // Should show the switch back to login link
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    // Should not show the signup switch button anymore
    expect(screen.queryByRole('button', { name: /sign up/i })).not.toBeInTheDocument();
  });

  it('switches back to login form when requested', () => {
    render(
      <TestWrapper>
        <AuthPage onSuccess={() => {}} />
      </TestWrapper>
    );

    // Switch to signup first
    const switchToSignupButton = screen.getByRole('button', { name: /sign up/i });
    fireEvent.click(switchToSignupButton);

    // Then switch back to login
    const switchToLoginButton = screen.getByRole('button', { name: /sign in/i });
    fireEvent.click(switchToLoginButton);

    // Should show the login form's main button
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    // Should show the switch to signup link
    expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument();
    // Should not show the create account button anymore
    expect(screen.queryByRole('button', { name: /create account/i })).not.toBeInTheDocument();
  });
});

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('provides authentication state and methods', () => {
    const TestComponent = () => {
      const { user, login, logout, refreshAuth } = useAuth();
      return (
        <div>
          <span data-testid="user">{user ? user.email : 'No user'}</span>
          <button onClick={() => login('test@example.com', 'password')}>Login</button>
          <button onClick={logout}>Logout</button>
          <button onClick={refreshAuth}>Refresh</button>
        </div>
      );
    };

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('user')).toHaveTextContent('No user');
    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(screen.getByText('Logout')).toBeInTheDocument();
    expect(screen.getByText('Refresh')).toBeInTheDocument();
  });

  it('handles login correctly', async () => {
    const mockToken = 'fake-jwt-token';
    mockAuthService.login.mockResolvedValue({ access_token: mockToken, token_type: 'bearer' });
    
    const TestComponent = () => {
      const { user, login } = useAuth();
      return (
        <div>
          <span data-testid="user">{user ? user.email : 'No user'}</span>
          <button onClick={() => login('test@example.com', 'password')}>Login</button>
        </div>
      );
    };

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const loginButton = screen.getByText('Login');
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(mockAuthService.login).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password',
      });
    });

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('test@example.com');
    });
  });

  it('handles logout correctly', async () => {
    const mockToken = 'fake-jwt-token';
    mockAuthService.login.mockResolvedValue({ access_token: mockToken, token_type: 'bearer' });
    
    const TestComponent = () => {
      const { user, login, logout } = useAuth();
      return (
        <div>
          <span data-testid="user">{user ? user.email : 'No user'}</span>
          <button onClick={() => login('test@example.com', 'password')}>Login</button>
          <button onClick={logout}>Logout</button>
        </div>
      );
    };

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const loginButton = screen.getByText('Login');
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('test@example.com');
    });

    const logoutButton = screen.getByText('Logout');
    fireEvent.click(logoutButton);

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('No user');
    });
  });
});
