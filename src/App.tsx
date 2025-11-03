import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { HeaderProvider } from './contexts/HeaderContext'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import Schedule from './pages/Schedule'
import Calendar from './pages/Calendar'
import Journal from './pages/Journal'
import SignIn from './pages/SignIn'
import SignUp from './pages/SignUp'

const App = () => {
  return (
    <BrowserRouter>
      <HeaderProvider>
        <Routes>
          <Route path="/sign-in" element={<SignIn />} />
          <Route path="/sign-up" element={<SignUp />} />
          <Route
            path="/*"
            element={
              <div className="flex h-full bg-gray-100">
                <Sidebar />
                <div className="flex-1 flex flex-col min-w-0">
                  <Header />
                  <main className="flex-1 min-h-0 overflow-hidden">
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/schedule" element={<Schedule />} />
                      <Route path="/calendar" element={<Calendar />} />
                      <Route path="/journal" element={<Journal />} />
                      <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                  </main>
                </div>
              </div>
            }
          />
        </Routes>
      </HeaderProvider>
    </BrowserRouter>
  )
}

export default App
