import { useState, useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useHeader } from '../contexts/HeaderContext'

const Header = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false) // TODO: Replace with actual auth state
  const menuRef = useRef<HTMLDivElement>(null)
  const { leftContent, rightContent } = useHeader()

  // Calendar와 Journal 페이지는 우측에 320px 영역 필요
  const needsRightSidebar = location.pathname === '/calendar' || location.pathname === '/journal' || location.pathname === '/schedule'

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
        return 'Dashboard'
      case '/journal':
        return 'Journal'
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
    <header className="header flex justify-between items-center pl-6 bg-white border-b border-gray-200 shadow-sm" style={{ height: '65px' }}>
      {/* 좌측 콘텐츠 또는 제목 */}
      <div className="flex items-center flex-1 h-full">
        {leftContent ? (
          <div className="flex items-center gap-4 h-full">
            {leftContent}
          </div>
        ) : (
          <h1 className="header-title text-2xl font-semibold text-gray-800 m-0">{getPageTitle()}</h1>
        )}
      </div>

      {/* 우측 영역 */}
      <div className="header-actions flex items-center gap-3 h-full">
        {rightContent && (
          <div className="flex items-center h-full">
            {rightContent}
          </div>
        )}

        {/* 우측 사이드바 영역 (user button 포함) */}
        <div
          style={{ width: needsRightSidebar ? '20rem' : 'auto' }}
          className={`shrink-0 h-full flex items-center justify-center ${needsRightSidebar ? 'border-l border-gray-200' : ''}`}
        >
          <div className="user-menu relative h-full flex items-center" ref={menuRef}>
            <button
              className="user-button flex items-center justify-center w-10 h-10 border-none rounded-full bg-gray-100 cursor-pointer transition-colors duration-200 hover:bg-gray-200"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <span className="user-icon text-lg">:D</span>
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
      </div>
    </header>
  )
}

export default Header
