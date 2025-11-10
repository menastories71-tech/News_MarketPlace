import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock axios for API calls
import axios from 'axios'
vi.mock('axios')
axios.create = vi.fn(() => axios)

// Mock react-google-recaptcha
vi.mock('react-google-recaptcha', () => ({
  __esModule: true,
  default: 'mock-recaptcha-component'
}))

// Mock react-router-dom
const mockNavigate = vi.fn()
vi.mock('react-router-dom', () => ({
  ...vi.importActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useLocation: () => ({ pathname: '/' }),
  useParams: () => ({}),
}))

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: 'div',
    button: 'button',
    form: 'form',
  },
  AnimatePresence: ({ children }) => children,
}))

// Mock react-hot-toast
vi.mock('react-hot-toast', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    loading: vi.fn(),
    dismiss: vi.fn(),
  },
  Toaster: () => null,
}))

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  Eye: 'mock-eye-icon',
  EyeOff: 'mock-eye-off-icon',
  CheckCircle: 'mock-check-circle-icon',
  XCircle: 'mock-x-circle-icon',
  AlertCircle: 'mock-alert-circle-icon',
  User: 'mock-user-icon',
  Mail: 'mock-mail-icon',
  Lock: 'mock-lock-icon',
  Plus: 'mock-plus-icon',
  Edit: 'mock-edit-icon',
  Trash: 'mock-trash-icon',
  Search: 'mock-search-icon',
  Filter: 'mock-filter-icon',
  Download: 'mock-download-icon',
  Upload: 'mock-upload-icon',
}))

// Global test utilities
global.mockNavigate = mockNavigate