import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import UserProfile from './UserProfile'
import { AuthContext } from '../context/AuthContext'

// Mock the AuthContext
const mockUser = {
  id: 1,
  email: 'user@example.com',
  first_name: 'John',
  last_name: 'Doe',
  is_verified: true,
  is_active: true,
  role: 'user'
}

const mockAuthContextValue = {
  user: mockUser,
  isAuthenticated: true,
  loading: false,
  error: null
}

const renderWithAuthContext = (component, contextValue = mockAuthContextValue) => {
  return render(
    <AuthContext.Provider value={contextValue}>
      {component}
    </AuthContext.Provider>
  )
}

// Mock API calls
vi.mock('../services/api', () => ({
  default: {
    getUserPublications: vi.fn(),
    getUserNotifications: vi.fn(),
    markNotificationAsRead: vi.fn(),
    updateProfile: vi.fn()
  }
}))

describe('UserProfile Component', () => {
  let mockApi

  beforeEach(() => {
    vi.clearAllMocks()
    mockApi = vi.mocked(require('../services/api').default)

    // Default mock responses
    mockApi.getUserPublications.mockResolvedValue({
      data: {
        publications: [
          {
            id: 1,
            publication_name: 'My Publication',
            status: 'pending',
            created_at: '2024-01-01T00:00:00Z',
            approved_at: null,
            rejected_at: null
          }
        ],
        total: 1,
        page: 1,
        totalPages: 1
      }
    })

    mockApi.getUserNotifications.mockResolvedValue({
      data: {
        notifications: [
          {
            id: 1,
            type: 'publication_approved',
            title: 'Publication Approved!',
            message: 'Your publication has been approved',
            is_read: false,
            created_at: '2024-01-01T00:00:00Z'
          }
        ],
        total: 1,
        unreadCount: 1
      }
    })
  })

  describe('Profile Display', () => {
    it('renders user profile information', async () => {
      renderWithAuthContext(<UserProfile />)

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument()
        expect(screen.getByText('user@example.com')).toBeInTheDocument()
      })
    })

    it('displays user verification status', async () => {
      renderWithAuthContext(<UserProfile />)

      await waitFor(() => {
        expect(screen.getByText('Verified')).toBeInTheDocument()
      })
    })

    it('shows loading state while fetching data', () => {
      mockApi.getUserPublications.mockImplementation(() => new Promise(() => {}))
      mockApi.getUserNotifications.mockImplementation(() => new Promise(() => {}))

      renderWithAuthContext(<UserProfile />)

      expect(screen.getByText('Loading...')).toBeInTheDocument()
    })
  })

  describe('Publications Tab', () => {
    it('displays user publications', async () => {
      renderWithAuthContext(<UserProfile />)

      await waitFor(() => {
        expect(screen.getByText('My Publication')).toBeInTheDocument()
        expect(screen.getByText('pending')).toBeInTheDocument()
      })
    })

    it('shows publication status badges', async () => {
      renderWithAuthContext(<UserProfile />)

      await waitFor(() => {
        const statusBadge = screen.getByText('pending')
        expect(statusBadge).toHaveClass('bg-yellow-100', 'text-yellow-800')
      })
    })

    it('displays publication dates', async () => {
      renderWithAuthContext(<UserProfile />)

      await waitFor(() => {
        expect(screen.getByText(/Jan 1, 2024/)).toBeInTheDocument()
      })
    })

    it('handles empty publications list', async () => {
      mockApi.getUserPublications.mockResolvedValue({
        data: {
          publications: [],
          total: 0,
          page: 1,
          totalPages: 0
        }
      })

      renderWithAuthContext(<UserProfile />)

      await waitFor(() => {
        expect(screen.getByText('No publications found')).toBeInTheDocument()
      })
    })

    it('handles publications API error', async () => {
      mockApi.getUserPublications.mockRejectedValue(new Error('API Error'))

      renderWithAuthContext(<UserProfile />)

      await waitFor(() => {
        expect(screen.getByText('Failed to load publications')).toBeInTheDocument()
      })
    })
  })

  describe('Notifications Tab', () => {
    it('displays user notifications', async () => {
      const user = userEvent.setup()
      renderWithAuthContext(<UserProfile />)

      // Switch to notifications tab
      const notificationsTab = screen.getByText('Notifications')
      await user.click(notificationsTab)

      await waitFor(() => {
        expect(screen.getByText('Publication Approved!')).toBeInTheDocument()
        expect(screen.getByText('Your publication has been approved')).toBeInTheDocument()
      })
    })

    it('shows unread notification count', async () => {
      const user = userEvent.setup()
      renderWithAuthContext(<UserProfile />)

      const notificationsTab = screen.getByText('Notifications')
      await user.click(notificationsTab)

      await waitFor(() => {
        expect(screen.getByText('1')).toBeInTheDocument() // Unread count badge
      })
    })

    it('marks notifications as read', async () => {
      const user = userEvent.setup()
      mockApi.markNotificationAsRead.mockResolvedValue({ data: { success: true } })

      renderWithAuthContext(<UserProfile />)

      const notificationsTab = screen.getByText('Notifications')
      await user.click(notificationsTab)

      await waitFor(() => {
        const markAsReadButton = screen.getByText('Mark as Read')
        user.click(markAsReadButton)
      })

      expect(mockApi.markNotificationAsRead).toHaveBeenCalledWith(1)
    })

    it('handles empty notifications list', async () => {
      const user = userEvent.setup()
      mockApi.getUserNotifications.mockResolvedValue({
        data: {
          notifications: [],
          total: 0,
          unreadCount: 0
        }
      })

      renderWithAuthContext(<UserProfile />)

      const notificationsTab = screen.getByText('Notifications')
      await user.click(notificationsTab)

      await waitFor(() => {
        expect(screen.getByText('No notifications found')).toBeInTheDocument()
      })
    })

    it('handles notifications API error', async () => {
      const user = userEvent.setup()
      mockApi.getUserNotifications.mockRejectedValue(new Error('API Error'))

      renderWithAuthContext(<UserProfile />)

      const notificationsTab = screen.getByText('Notifications')
      await user.click(notificationsTab)

      await waitFor(() => {
        expect(screen.getByText('Failed to load notifications')).toBeInTheDocument()
      })
    })
  })

  describe('Profile Editing', () => {
    it('allows editing profile information', async () => {
      const user = userEvent.setup()
      mockApi.updateProfile.mockResolvedValue({
        data: {
          user: {
            ...mockUser,
            first_name: 'Jane',
            last_name: 'Smith'
          }
        }
      })

      renderWithAuthContext(<UserProfile />)

      const editButton = screen.getByText('Edit Profile')
      await user.click(editButton)

      const firstNameInput = screen.getByLabelText(/first name/i)
      const lastNameInput = screen.getByLabelText(/last name/i)
      const saveButton = screen.getByText('Save Changes')

      await user.clear(firstNameInput)
      await user.type(firstNameInput, 'Jane')
      await user.clear(lastNameInput)
      await user.type(lastNameInput, 'Smith')
      await user.click(saveButton)

      expect(mockApi.updateProfile).toHaveBeenCalledWith({
        first_name: 'Jane',
        last_name: 'Smith'
      })
    })

    it('validates profile form fields', async () => {
      const user = userEvent.setup()

      renderWithAuthContext(<UserProfile />)

      const editButton = screen.getByText('Edit Profile')
      await user.click(editButton)

      const firstNameInput = screen.getByLabelText(/first name/i)
      const saveButton = screen.getByText('Save Changes')

      await user.clear(firstNameInput)
      await user.click(saveButton)

      expect(screen.getByText('First name is required')).toBeInTheDocument()
    })

    it('cancels profile editing', async () => {
      const user = userEvent.setup()

      renderWithAuthContext(<UserProfile />)

      const editButton = screen.getByText('Edit Profile')
      await user.click(editButton)

      const cancelButton = screen.getByText('Cancel')
      await user.click(cancelButton)

      expect(screen.queryByText('Save Changes')).not.toBeInTheDocument()
    })
  })

  describe('Tab Navigation', () => {
    it('switches between tabs correctly', async () => {
      const user = userEvent.setup()

      renderWithAuthContext(<UserProfile />)

      // Default tab should be publications
      expect(screen.getByText('My Publications')).toBeInTheDocument()

      // Switch to notifications
      const notificationsTab = screen.getByText('Notifications')
      await user.click(notificationsTab)

      expect(screen.getByText('My Notifications')).toBeInTheDocument()

      // Switch back to publications
      const publicationsTab = screen.getByText('Publications')
      await user.click(publicationsTab)

      expect(screen.getByText('My Publications')).toBeInTheDocument()
    })

    it('maintains tab state', async () => {
      const user = userEvent.setup()

      renderWithAuthContext(<UserProfile />)

      // Switch to notifications tab
      const notificationsTab = screen.getByText('Notifications')
      await user.click(notificationsTab)

      // Trigger a re-render by clicking something
      await user.click(notificationsTab)

      // Should still be on notifications tab
      expect(screen.getByText('My Notifications')).toBeInTheDocument()
    })
  })

  describe('Responsive Design', () => {
    it('adapts layout for mobile screens', () => {
      // Mock window resize
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375
      })

      renderWithAuthContext(<UserProfile />)

      // Should have mobile-friendly classes
      const container = screen.getByRole('main')
      expect(container).toHaveClass('container', 'mx-auto', 'px-4')
    })

    it('stacks tabs vertically on small screens', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375
      })

      renderWithAuthContext(<UserProfile />)

      const tabContainer = screen.getByRole('tablist')
      expect(tabContainer).toHaveClass('flex', 'flex-col', 'space-y-2')
    })
  })

  describe('Error Handling', () => {
    it('displays error message for failed profile update', async () => {
      const user = userEvent.setup()
      mockApi.updateProfile.mockRejectedValue(new Error('Update failed'))

      renderWithAuthContext(<UserProfile />)

      const editButton = screen.getByText('Edit Profile')
      await user.click(editButton)

      const saveButton = screen.getByText('Save Changes')
      await user.click(saveButton)

      await waitFor(() => {
        expect(screen.getByText('Failed to update profile')).toBeInTheDocument()
      })
    })

    it('handles network errors gracefully', async () => {
      mockApi.getUserPublications.mockRejectedValue(new Error('Network error'))

      renderWithAuthContext(<UserProfile />)

      await waitFor(() => {
        expect(screen.getByText('Failed to load publications')).toBeInTheDocument()
      })
    })
  })

  describe('Accessibility', () => {
    it('has proper ARIA labels for tabs', () => {
      renderWithAuthContext(<UserProfile />)

      const publicationsTab = screen.getByRole('tab', { name: /publications/i })
      const notificationsTab = screen.getByRole('tab', { name: /notifications/i })

      expect(publicationsTab).toHaveAttribute('aria-selected', 'true')
      expect(notificationsTab).toHaveAttribute('aria-selected', 'false')
    })

    it('supports keyboard navigation', async () => {
      const user = userEvent.setup()

      renderWithAuthContext(<UserProfile />)

      const publicationsTab = screen.getByRole('tab', { name: /publications/i })
      const notificationsTab = screen.getByRole('tab', { name: /notifications/i })

      // Tab to publications tab
      await user.tab()
      expect(publicationsTab).toHaveFocus()

      // Tab to notifications tab
      await user.tab()
      expect(notificationsTab).toHaveFocus()
    })

    it('announces tab changes to screen readers', async () => {
      const user = userEvent.setup()

      renderWithAuthContext(<UserProfile />)

      const notificationsTab = screen.getByRole('tab', { name: /notifications/i })
      await user.click(notificationsTab)

      const tabPanel = screen.getByRole('tabpanel')
      expect(tabPanel).toHaveAttribute('aria-labelledby')
    })
  })

  describe('Performance', () => {
    it('debounces rapid tab switches', async () => {
      const user = userEvent.setup()

      renderWithAuthContext(<UserProfile />)

      const publicationsTab = screen.getByText('Publications')
      const notificationsTab = screen.getByText('Notifications')

      // Rapidly switch tabs
      await user.click(notificationsTab)
      await user.click(publicationsTab)
      await user.click(notificationsTab)

      // Should only make the last API call
      await waitFor(() => {
        expect(mockApi.getUserNotifications).toHaveBeenCalledTimes(1)
      })
    })

    it('caches user data to avoid unnecessary API calls', async () => {
      renderWithAuthContext(<UserProfile />)

      await waitFor(() => {
        expect(mockApi.getUserPublications).toHaveBeenCalledTimes(1)
      })

      // Trigger component update
      const { rerender } = renderWithAuthContext(<UserProfile />)

      // Should not make additional API calls if data is cached
      expect(mockApi.getUserPublications).toHaveBeenCalledTimes(1)
    })
  })
})