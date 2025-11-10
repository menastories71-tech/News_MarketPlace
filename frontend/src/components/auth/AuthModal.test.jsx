import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AuthModal from './AuthModal'
import { AuthContext } from '../../context/AuthContext'

// Mock the AuthContext
const mockLogin = vi.fn()
const mockRegister = vi.fn()
const mockVerifyOTP = vi.fn()
const mockForgotPassword = vi.fn()
const mockResetPassword = vi.fn()

const mockAuthContextValue = {
  login: mockLogin,
  register: mockRegister,
  verifyOTP: mockVerifyOTP,
  forgotPassword: mockForgotPassword,
  resetPassword: mockResetPassword,
  loading: false,
  error: null,
  user: null,
  isAuthenticated: false
}

const renderWithAuthContext = (component, contextValue = mockAuthContextValue) => {
  return render(
    <AuthContext.Provider value={contextValue}>
      {component}
    </AuthContext.Provider>
  )
}

describe('AuthModal Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Login Form', () => {
    it('renders login form by default', () => {
      renderWithAuthContext(<AuthModal isOpen={true} onClose={() => {}} />)

      expect(screen.getByText('Welcome Back')).toBeInTheDocument()
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
    })

    it('handles login form submission', async () => {
      const user = userEvent.setup()
      mockLogin.mockResolvedValue({ success: true })

      renderWithAuthContext(<AuthModal isOpen={true} onClose={() => {}} />)

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /sign in/i })

      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'password123')
      await user.click(submitButton)

      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123', false)
    })

    it('shows OTP verification after successful login', async () => {
      const user = userEvent.setup()
      mockLogin.mockResolvedValue({ requiresOTP: true, message: 'OTP sent to your email' })

      renderWithAuthContext(<AuthModal isOpen={true} onClose={() => {}} />)

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /sign in/i })

      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'password123')
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Enter OTP')).toBeInTheDocument()
      })
    })

    it('validates email format', async () => {
      const user = userEvent.setup()

      renderWithAuthContext(<AuthModal isOpen={true} onClose={() => {}} />)

      const emailInput = screen.getByLabelText(/email/i)
      const submitButton = screen.getByRole('button', { name: /sign in/i })

      await user.type(emailInput, 'invalid-email')
      await user.click(submitButton)

      expect(screen.getByText(/please enter a valid email/i)).toBeInTheDocument()
    })

    it('validates required fields', async () => {
      const user = userEvent.setup()

      renderWithAuthContext(<AuthModal isOpen={true} onClose={() => {}} />)

      const submitButton = screen.getByRole('button', { name: /sign in/i })
      await user.click(submitButton)

      expect(screen.getByText(/email is required/i)).toBeInTheDocument()
      expect(screen.getByText(/password is required/i)).toBeInTheDocument()
    })
  })

  describe('Registration Form', () => {
    it('switches to registration form', async () => {
      const user = userEvent.setup()

      renderWithAuthContext(<AuthModal isOpen={true} onClose={() => {}} />)

      const registerTab = screen.getByText('Sign Up')
      await user.click(registerTab)

      expect(screen.getByText('Create Account')).toBeInTheDocument()
      expect(screen.getByLabelText(/first name/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/last name/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument()
    })

    it('handles registration form submission', async () => {
      const user = userEvent.setup()
      mockRegister.mockResolvedValue({ success: true })

      renderWithAuthContext(<AuthModal isOpen={true} onClose={() => {}} />)

      // Switch to register tab
      const registerTab = screen.getByText('Sign Up')
      await user.click(registerTab)

      const firstNameInput = screen.getByLabelText(/first name/i)
      const lastNameInput = screen.getByLabelText(/last name/i)
      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /create account/i })

      await user.type(firstNameInput, 'John')
      await user.type(lastNameInput, 'Doe')
      await user.type(emailInput, 'john@example.com')
      await user.type(passwordInput, 'password123')
      await user.click(submitButton)

      expect(mockRegister).toHaveBeenCalledWith({
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@example.com',
        password: 'password123'
      })
    })

    it('includes reCAPTCHA in registration', async () => {
      const user = userEvent.setup()

      renderWithAuthContext(<AuthModal isOpen={true} onClose={() => {}} />)

      // Switch to register tab
      const registerTab = screen.getByText('Sign Up')
      await user.click(registerTab)

      expect(screen.getByTestId('recaptcha')).toBeInTheDocument()
    })
  })

  describe('OTP Verification', () => {
    it('handles OTP verification for login', async () => {
      const user = userEvent.setup()
      mockVerifyOTP.mockResolvedValue({ success: true })

      renderWithAuthContext(<AuthModal isOpen={true} onClose={() => {}} />)

      // First trigger OTP flow
      mockLogin.mockResolvedValue({ requiresOTP: true })

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /sign in/i })

      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'password123')
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Enter OTP')).toBeInTheDocument()
      })

      // Now verify OTP
      const otpInput = screen.getByLabelText(/enter otp/i)
      const verifyButton = screen.getByRole('button', { name: /verify otp/i })

      await user.type(otpInput, '123456')
      await user.click(verifyButton)

      expect(mockVerifyOTP).toHaveBeenCalledWith('test@example.com', '123456', false)
    })

    it('validates OTP format', async () => {
      const user = userEvent.setup()

      renderWithAuthContext(<AuthModal isOpen={true} onClose={() => {}} />)

      // Trigger OTP flow
      mockLogin.mockResolvedValue({ requiresOTP: true })

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /sign in/i })

      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'password123')
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Enter OTP')).toBeInTheDocument()
      })

      const otpInput = screen.getByLabelText(/enter otp/i)
      const verifyButton = screen.getByRole('button', { name: /verify otp/i })

      await user.type(otpInput, '12345') // Invalid length
      await user.click(verifyButton)

      expect(screen.getByText(/otp must be 6 digits/i)).toBeInTheDocument()
    })
  })

  describe('Forgot Password Flow', () => {
    it('switches to forgot password form', async () => {
      const user = userEvent.setup()

      renderWithAuthContext(<AuthModal isOpen={true} onClose={() => {}} />)

      const forgotPasswordLink = screen.getByText(/forgot password/i)
      await user.click(forgotPasswordLink)

      expect(screen.getByText('Reset Password')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /send reset link/i })).toBeInTheDocument()
    })

    it('handles forgot password submission', async () => {
      const user = userEvent.setup()
      mockForgotPassword.mockResolvedValue({ success: true })

      renderWithAuthContext(<AuthModal isOpen={true} onClose={() => {}} />)

      const forgotPasswordLink = screen.getByText(/forgot password/i)
      await user.click(forgotPasswordLink)

      const emailInput = screen.getByLabelText(/email/i)
      const submitButton = screen.getByRole('button', { name: /send reset link/i })

      await user.type(emailInput, 'test@example.com')
      await user.click(submitButton)

      expect(mockForgotPassword).toHaveBeenCalledWith('test@example.com')
    })
  })

  describe('Modal Behavior', () => {
    it('closes modal when close button is clicked', async () => {
      const mockOnClose = vi.fn()
      const user = userEvent.setup()

      renderWithAuthContext(<AuthModal isOpen={true} onClose={mockOnClose} />)

      const closeButton = screen.getByRole('button', { name: /close/i })
      await user.click(closeButton)

      expect(mockOnClose).toHaveBeenCalled()
    })

    it('does not render when isOpen is false', () => {
      renderWithAuthContext(<AuthModal isOpen={false} onClose={() => {}} />)

      expect(screen.queryByText('Welcome Back')).not.toBeInTheDocument()
    })
  })

  describe('Loading States', () => {
    it('shows loading state during login', async () => {
      const user = userEvent.setup()
      mockLogin.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))

      renderWithAuthContext(<AuthModal isOpen={true} onClose={() => {}} />)

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /sign in/i })

      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'password123')
      await user.click(submitButton)

      expect(submitButton).toBeDisabled()
      expect(submitButton).toHaveTextContent(/signing in/i)
    })

    it('shows loading state during registration', async () => {
      const user = userEvent.setup()
      mockRegister.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))

      renderWithAuthContext(<AuthModal isOpen={true} onClose={() => {}} />)

      // Switch to register
      const registerTab = screen.getByText('Sign Up')
      await user.click(registerTab)

      const firstNameInput = screen.getByLabelText(/first name/i)
      const lastNameInput = screen.getByLabelText(/last name/i)
      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /create account/i })

      await user.type(firstNameInput, 'John')
      await user.type(lastNameInput, 'Doe')
      await user.type(emailInput, 'john@example.com')
      await user.type(passwordInput, 'password123')
      await user.click(submitButton)

      expect(submitButton).toBeDisabled()
      expect(submitButton).toHaveTextContent(/creating account/i)
    })
  })

  describe('Error Handling', () => {
    it('displays login errors', async () => {
      const user = userEvent.setup()
      mockLogin.mockRejectedValue(new Error('Invalid credentials'))

      renderWithAuthContext(<AuthModal isOpen={true} onClose={() => {}} />)

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /sign in/i })

      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'wrongpassword')
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Invalid credentials')).toBeInTheDocument()
      })
    })

    it('displays registration errors', async () => {
      const user = userEvent.setup()
      mockRegister.mockRejectedValue(new Error('Email already exists'))

      renderWithAuthContext(<AuthModal isOpen={true} onClose={() => {}} />)

      // Switch to register
      const registerTab = screen.getByText('Sign Up')
      await user.click(registerTab)

      const firstNameInput = screen.getByLabelText(/first name/i)
      const lastNameInput = screen.getByLabelText(/last name/i)
      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /create account/i })

      await user.type(firstNameInput, 'John')
      await user.type(lastNameInput, 'Doe')
      await user.type(emailInput, 'existing@example.com')
      await user.type(passwordInput, 'password123')
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Email already exists')).toBeInTheDocument()
      })
    })
  })

  describe('Accessibility', () => {
    it('has proper ARIA labels', () => {
      renderWithAuthContext(<AuthModal isOpen={true} onClose={() => {}} />)

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)

      expect(emailInput).toHaveAttribute('aria-label')
      expect(passwordInput).toHaveAttribute('aria-label')
    })

    it('supports keyboard navigation', async () => {
      const user = userEvent.setup()

      renderWithAuthContext(<AuthModal isOpen={true} onClose={() => {}} />)

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /sign in/i })

      // Tab through form
      await user.tab()
      expect(emailInput).toHaveFocus()

      await user.tab()
      expect(passwordInput).toHaveFocus()

      await user.tab()
      expect(submitButton).toHaveFocus()
    })
  })
})