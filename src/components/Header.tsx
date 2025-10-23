import { useState, useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

const Header = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false) // TODO: Replace with actual auth state
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false)
      }
    }

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isMenuOpen])

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/':
        return 'Home'
      case '/schedule':
        return 'Schedule'
      case '/calendar':
        return 'Calendar'
      default:
        return 'Planner'
    }
  }

  const handleSignIn = () => {
    navigate('/sign-in')
    setIsMenuOpen(false)
  }

  const handleSignOut = () => {
    setIsLoggedIn(false)
    setIsMenuOpen(false)
    // TODO: Implement actual sign out logic
  }

  return (
    <header className="header flex justify-between items-center px-6 py-4 bg-white border-b border-gray-200 shadow-sm">
      <h1 className="header-title text-2xl font-semibold text-gray-800 m-0">{getPageTitle()}</h1>
      <div className="header-actions flex items-center gap-3">
        <div className="user-menu relative" ref={menuRef}>
          <button
            className="user-button flex items-center justify-center w-8 h-8 border-none rounded-full bg-gray-100 cursor-pointer transition-colors duration-200 hover:bg-gray-200"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <span className="user-icon text-xl">:D</span>
          </button>

          {isMenuOpen && (
            <div className="dropdown-menu absolute top-full right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg min-w-[150px] z-[1000] overflow-hidden">
              {isLoggedIn ? (
                <button
                  onClick={handleSignOut}
                  className="dropdown-menu-item block w-full px-4 py-3 border-none bg-transparent text-left text-sm text-gray-800 cursor-pointer transition-colors duration-200 hover:bg-gray-100"
                >
                  Sign Out
                </button>
              ) : (
                <button
                  onClick={handleSignIn}
                  className="dropdown-menu-item block w-full px-4 py-3 border-none bg-transparent text-left text-sm text-gray-800 cursor-pointer transition-colors duration-200 hover:bg-gray-100"
                >
                  Sign In
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header
