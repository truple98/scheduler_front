import { Link, useLocation } from 'react-router-dom'
import { AiFillHome } from 'react-icons/ai'
import { MdSchedule, MdCalendarToday } from 'react-icons/md'

const Sidebar = () => {
  const location = useLocation()

  const menuItems = [
    { text: 'Home', path: '/', icon: AiFillHome },
    { text: 'Schedule', path: '/schedule', icon: MdSchedule },
    { text: 'Calendar', path: '/calendar', icon: MdCalendarToday },
  ]

  return (
    <aside className="sidebar w-60 bg-white border-r border-gray-200 flex flex-col">
      <div className="sidebar-header px-5 py-4 border-b border-gray-200">
        <h2 className="sidebar-title text-2xl font-bold text-gray-800 text-center m-0">Planner</h2>
      </div>
      <nav className="sidebar-nav flex-1 pt-4">
        <ul className="menu-list list-none m-0 px-2.5">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path
            return (
              <li key={item.path} className="menu-item">
                <Link
                  to={item.path}
                  className={`menu-link flex items-center gap-3 mb-2 px-3 py-2.5 rounded-lg transition-all duration-200 no-underline ${
                    isActive
                      ? 'active bg-gray-200 text-gray-900'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <span className="menu-icon text-xl flex items-center justify-center w-6">
                    <Icon />
                  </span>
                  <span className="menu-text text-base font-medium">{item.text}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </aside>
  )
}

export default Sidebar
