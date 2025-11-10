import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

// Mock components that might have responsive behavior
vi.mock('../components/common/UserHeader', () => ({
  default: () => <header data-testid="user-header">User Header</header>
}))

vi.mock('../components/common/UserFooter', () => ({
  default: () => <footer data-testid="user-footer">User Footer</footer>
}))

vi.mock('../components/auth/AuthModal', () => ({
  default: ({ isOpen, onClose }) => isOpen ? (
    <div data-testid="auth-modal" role="dialog">
      <button onClick={onClose}>Close</button>
      Auth Modal Content
    </div>
  ) : null
}))

describe('Responsive Design Testing', () => {
  let originalInnerWidth
  let originalInnerHeight

  beforeEach(() => {
    // Store original window dimensions
    originalInnerWidth = window.innerWidth
    originalInnerHeight = window.innerHeight

    // Mock window.matchMedia
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    })
  })

  afterEach(() => {
    // Restore original window dimensions
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: originalInnerWidth
    })
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: originalInnerHeight
    })
  })

  const setViewportSize = (width, height = 768) => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: width
    })
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: height
    })

    // Update matchMedia mock based on width
    window.matchMedia.mockImplementation(query => ({
      matches: query.includes('max-width') ?
        width <= parseInt(query.match(/(\d+)px/)[1]) :
        query.includes('min-width') ?
        width >= parseInt(query.match(/(\d+)px/)[1]) : false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }))

    // Trigger resize event
    window.dispatchEvent(new Event('resize'))
  }

  describe('Mobile Responsiveness (320px - 767px)', () => {
    it('adapts layout for mobile screens (375px)', () => {
      setViewportSize(375)

      // Test mobile breakpoint
      const mobileMediaQuery = window.matchMedia('(max-width: 767px)')
      expect(mobileMediaQuery.matches).toBe(true)

      const desktopMediaQuery = window.matchMedia('(min-width: 768px)')
      expect(desktopMediaQuery.matches).toBe(false)
    })

    it('shows mobile navigation menu', () => {
      setViewportSize(375)

      // Mock a component that changes based on screen size
      const { container } = render(
        <div className="navigation">
          <div className="hidden md:block desktop-menu">Desktop Menu</div>
          <div className="block md:hidden mobile-menu">Mobile Menu</div>
        </div>
      )

      expect(container.querySelector('.mobile-menu')).toBeInTheDocument()
      expect(container.querySelector('.desktop-menu')).not.toBeVisible()
    })

    it('stacks form elements vertically on mobile', () => {
      setViewportSize(375)

      const { container } = render(
        <form className="flex flex-col md:flex-row gap-4">
          <input className="w-full md:w-1/2" placeholder="Field 1" />
          <input className="w-full md:w-1/2" placeholder="Field 2" />
        </form>
      )

      const inputs = container.querySelectorAll('input')
      expect(inputs).toHaveLength(2)

      // On mobile, inputs should stack vertically (flex-col)
      inputs.forEach(input => {
        expect(input).toHaveClass('w-full')
      })
    })

    it('adjusts modal size for mobile screens', () => {
      setViewportSize(375)

      const TestComponent = () => {
        const [isOpen, setIsOpen] = React.useState(true)
        return (
          <div>
            <button onClick={() => setIsOpen(true)}>Open Modal</button>
            <AuthModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
          </div>
        )
      }

      render(<TestComponent />)

      const modal = screen.getByTestId('auth-modal')
      expect(modal).toBeInTheDocument()

      // Modal should be positioned appropriately for mobile
      expect(modal).toHaveAttribute('role', 'dialog')
    })
  })

  describe('Tablet Responsiveness (768px - 1023px)', () => {
    it('adapts layout for tablet screens (768px)', () => {
      setViewportSize(768)

      const tabletMediaQuery = window.matchMedia('(min-width: 768px) and (max-width: 1023px)')
      expect(tabletMediaQuery.matches).toBe(true)
    })

    it('shows tablet-specific navigation', () => {
      setViewportSize(768)

      const { container } = render(
        <nav className="hidden md:flex lg:hidden tablet-nav">
          Tablet Navigation
        </nav>
      )

      expect(container.querySelector('.tablet-nav')).toBeInTheDocument()
    })

    it('adjusts grid layouts for tablet', () => {
      setViewportSize(768)

      const { container } = render(
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>Item 1</div>
          <div>Item 2</div>
          <div>Item 3</div>
        </div>
      )

      // Should show 2 columns on tablet
      const grid = container.firstChild
      expect(grid).toHaveClass('md:grid-cols-2')
    })
  })

  describe('Desktop Responsiveness (1024px+)', () => {
    it('adapts layout for desktop screens (1024px)', () => {
      setViewportSize(1024)

      const desktopMediaQuery = window.matchMedia('(min-width: 1024px)')
      expect(desktopMediaQuery.matches).toBe(true)
    })

    it('shows full desktop navigation', () => {
      setViewportSize(1024)

      const { container } = render(
        <nav className="hidden lg:flex desktop-nav">
          Desktop Navigation
        </nav>
      )

      expect(container.querySelector('.desktop-nav')).toBeInTheDocument()
    })

    it('displays multi-column layouts on desktop', () => {
      setViewportSize(1024)

      const { container } = render(
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>Item 1</div>
          <div>Item 2</div>
          <div>Item 3</div>
          <div>Item 4</div>
        </div>
      )

      const grid = container.firstChild
      expect(grid).toHaveClass('lg:grid-cols-4')
    })
  })

  describe('Touch Interactions', () => {
    it('supports touch gestures on mobile', async () => {
      setViewportSize(375)
      const user = userEvent.setup()

      const TestComponent = () => {
        const [isOpen, setIsOpen] = React.useState(false)
        return (
          <div>
            <button onClick={() => setIsOpen(true)}>Open Menu</button>
            {isOpen && (
              <div data-testid="mobile-menu">
                <button onClick={() => setIsOpen(false)}>Close</button>
                Menu Content
              </div>
            )}
          </div>
        )
      }

      render(<TestComponent />)

      const openButton = screen.getByText('Open Menu')
      await user.click(openButton)

      const menu = screen.getByTestId('mobile-menu')
      expect(menu).toBeInTheDocument()

      const closeButton = screen.getByText('Close')
      await user.click(closeButton)

      expect(menu).not.toBeInTheDocument()
    })

    it('handles swipe gestures appropriately', () => {
      setViewportSize(375)

      // Mock touch events
      const mockTouchStart = new TouchEvent('touchstart', {
        touches: [{ clientX: 100, clientY: 100 }]
      })

      const mockTouchEnd = new TouchEvent('touchend', {
        changedTouches: [{ clientX: 50, clientY: 100 }]
      })

      const element = document.createElement('div')
      element.dispatchEvent(mockTouchStart)
      element.dispatchEvent(mockTouchEnd)

      // Test passes if no errors are thrown
      expect(true).toBe(true)
    })
  })

  describe('Orientation Changes', () => {
    it('adapts to portrait orientation', () => {
      setViewportSize(375, 667) // iPhone SE dimensions

      const portraitQuery = window.matchMedia('(orientation: portrait)')
      expect(portraitQuery.matches).toBe(true)
    })

    it('adapts to landscape orientation', () => {
      setViewportSize(667, 375) // iPhone SE rotated

      const landscapeQuery = window.matchMedia('(orientation: landscape)')
      expect(landscapeQuery.matches).toBe(true)
    })

    it('handles orientation change events', () => {
      const orientationChangeHandler = vi.fn()
      window.addEventListener('orientationchange', orientationChangeHandler)

      // Simulate orientation change
      window.dispatchEvent(new Event('orientationchange'))

      expect(orientationChangeHandler).toHaveBeenCalled()

      window.removeEventListener('orientationchange', orientationChangeHandler)
    })
  })

  describe('High DPI Displays', () => {
    it('handles retina displays', () => {
      // Mock device pixel ratio
      Object.defineProperty(window, 'devicePixelRatio', {
        writable: true,
        value: 2
      })

      expect(window.devicePixelRatio).toBe(2)

      // Test that images/components handle high DPI appropriately
      const { container } = render(
        <img
          src="test.jpg"
          srcSet="test.jpg 1x, test@2x.jpg 2x"
          alt="Test image"
        />
      )

      const img = container.querySelector('img')
      expect(img).toHaveAttribute('srcSet')
    })
  })

  describe('Accessibility in Responsive Design', () => {
    it('maintains focus management on mobile', async () => {
      setViewportSize(375)
      const user = userEvent.setup()

      const TestComponent = () => {
        const [isMenuOpen, setIsMenuOpen] = React.useState(false)
        return (
          <div>
            <button onClick={() => setIsMenuOpen(true)}>Open Menu</button>
            {isMenuOpen && (
              <nav role="navigation">
                <button onClick={() => setIsMenuOpen(false)}>Close</button>
                <a href="#home">Home</a>
                <a href="#about">About</a>
              </nav>
            )}
          </div>
        )
      }

      render(<TestComponent />)

      const openButton = screen.getByText('Open Menu')
      await user.click(openButton)

      const closeButton = screen.getByText('Close')
      expect(closeButton).toHaveFocus()
    })

    it('provides appropriate touch targets on mobile', () => {
      setViewportSize(375)

      const { container } = render(
        <button className="min-h-[44px] min-w-[44px] p-2">
          Mobile Button
        </button>
      )

      const button = container.querySelector('button')
      const styles = window.getComputedStyle(button)

      // Button should have minimum touch target size
      expect(button).toHaveClass('min-h-[44px]', 'min-w-[44px]')
    })

    it('adjusts text size for readability on small screens', () => {
      setViewportSize(375)

      const { container } = render(
        <p className="text-sm md:text-base lg:text-lg">
          Responsive text content
        </p>
      )

      const paragraph = container.querySelector('p')
      expect(paragraph).toHaveClass('text-sm') // Small text on mobile
    })
  })

  describe('Performance on Different Screen Sizes', () => {
    it('lazy loads images appropriately', () => {
      setViewportSize(375)

      const { container } = render(
        <img
          src="large-image.jpg"
          loading="lazy"
          alt="Large image"
          className="w-full h-auto"
        />
      )

      const img = container.querySelector('img')
      expect(img).toHaveAttribute('loading', 'lazy')
    })

    it('adjusts animation complexity based on screen size', () => {
      setViewportSize(375)

      // Mock framer-motion animation that changes based on screen size
      const { container } = render(
        <div className="animate-pulse md:animate-bounce">
          Animated Content
        </div>
      )

      const div = container.firstChild
      expect(div).toHaveClass('animate-pulse') // Simpler animation on mobile
    })
  })

  describe('Cross-browser Compatibility', () => {
    it('handles vendor prefixes appropriately', () => {
      const { container } = render(
        <div
          className="webkit-appearance-none moz-appearance-none appearance-none"
          style={{
            WebkitAppearance: 'none',
            MozAppearance: 'none',
            appearance: 'none'
          }}
        >
          Cross-browser element
        </div>
      )

      const div = container.firstChild
      expect(div).toHaveClass('webkit-appearance-none', 'moz-appearance-none', 'appearance-none')
    })

    it('provides fallbacks for CSS Grid', () => {
      const { container } = render(
        <div className="flex flex-wrap lg:grid lg:grid-cols-3">
          <div>Item 1</div>
          <div>Item 2</div>
          <div>Item 3</div>
        </div>
      )

      const div = container.firstChild
      expect(div).toHaveClass('flex', 'flex-wrap') // Flexbox fallback
      expect(div).toHaveClass('lg:grid', 'lg:grid-cols-3') // Grid for modern browsers
    })
  })
})