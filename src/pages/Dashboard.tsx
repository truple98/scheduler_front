import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaPlus, FaCalendar, FaChevronLeft, FaChevronRight } from 'react-icons/fa'

type Journal = {
  id: string
  title: string
  content: string
  date: string
}

// Mock 데이터 생성 함수
const getMockJournals = (): Journal[] => {
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  const twoDaysAgo = new Date(today)
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2)

  const formatDate = (date: Date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  return [
    {
      id: '1',
      title: '프로젝트 킥오프 미팅',
      content: '오늘 새로운 프로젝트 킥오프 미팅을 진행했다...',
      date: formatDate(today)
    },
    {
      id: '2',
      title: '알고리즘 스터디',
      content: '오늘은 동적 프로그래밍 문제를 풀었다...',
      date: formatDate(yesterday)
    },
    {
      id: '3',
      title: '주간 회고',
      content: '이번 주는 생산성이 높았던 한 주였다...',
      date: formatDate(twoDaysAgo)
    }
  ]
}

const mockJournals = getMockJournals()

const Dashboard = () => {
  const navigate = useNavigate()
  const [currentDate, setCurrentDate] = useState(new Date())

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  // 오늘의 일지 가져오기
  const getTodayJournal = () => {
    const today = new Date()
    const todayString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
    return mockJournals.find(j => j.date === todayString)
  }

  // 이전/다음 달로 이동
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1))
  }

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1))
  }

  // 이번 달의 첫날과 마지막 날
  const firstDayOfMonth = new Date(year, month, 1)
  const lastDayOfMonth = new Date(year, month + 1, 0)

  // 캘린더 시작일 (일요일부터 시작)
  const startDate = new Date(firstDayOfMonth)
  startDate.setDate(startDate.getDate() - startDate.getDay())

  // 캘린더 종료일
  const endDate = new Date(lastDayOfMonth)
  endDate.setDate(endDate.getDate() + (6 - endDate.getDay()))

  // 캘린더 날짜들 생성
  const calendarDays: Date[] = []
  const current = new Date(startDate)
  while (current <= endDate) {
    calendarDays.push(new Date(current))
    current.setDate(current.getDate() + 1)
  }

  // 날짜 포맷팅
  const formatDate = (date: Date): string => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  // 오늘 날짜
  const today = formatDate(new Date())

  // 해당 날짜에 일지가 있는지 확인
  const hasJournal = (date: Date): boolean => {
    return mockJournals.some(j => j.date === formatDate(date))
  }

  // 오늘인지 확인
  const isToday = (date: Date): boolean => {
    return today === formatDate(date)
  }

  // 현재 월의 날짜인지 확인
  const isCurrentMonth = (date: Date): boolean => {
    return date.getMonth() === month
  }

  const monthNames = [
    '1월', '2월', '3월', '4월', '5월', '6월',
    '7월', '8월', '9월', '10월', '11월', '12월'
  ]

  const todayJournal = getTodayJournal()

  return (
    <div className="dashboard-container h-full overflow-y-auto bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 왼쪽: 일지 */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">일지</h2>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">오늘</h3>

              {todayJournal ? (
                <div
                  className="p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => navigate('/journal')}
                >
                  <h4 className="text-base font-medium text-gray-900 mb-2">
                    {todayJournal.title}
                  </h4>
                  <p className="text-sm text-gray-600 line-clamp-3">
                    {todayJournal.content}
                  </p>
                </div>
              ) : (
                <button
                  onClick={() => navigate('/journal')}
                  className="w-full p-4 text-left text-sm text-gray-400 hover:bg-gray-50 hover:text-gray-600 rounded-lg border-2 border-dashed border-gray-200 hover:border-gray-300 flex items-center gap-2 transition-colors"
                >
                  <FaPlus size={12} />
                  일지 작성
                </button>
              )}
            </div>
          </div>

          {/* 오른쪽: 캘린더 */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">캘린더</h2>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              {/* 월 헤더 */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {year}년 {monthNames[month]}
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={goToPreviousMonth}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <FaChevronLeft className="text-gray-600" size={14} />
                  </button>
                  <button
                    onClick={goToNextMonth}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <FaChevronRight className="text-gray-600" size={14} />
                  </button>
                </div>
              </div>

              {/* 요일 헤더 */}
              <div className="grid grid-cols-7 gap-2 mb-2">
                {['일', '월', '화', '수', '목', '금', '토'].map((day, index) => (
                  <div
                    key={index}
                    className="text-center text-sm font-medium text-gray-500 py-2"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* 날짜 그리드 */}
              <div className="grid grid-cols-7 gap-2">
                {calendarDays.map((date) => {
                  const currentMonth = isCurrentMonth(date)
                  const todayDate = isToday(date)
                  const hasEntry = hasJournal(date)

                  return (
                    <button
                      key={formatDate(date)}
                      onClick={() => navigate('/calendar')}
                      className={`aspect-square flex items-center justify-center text-sm rounded-lg transition-colors relative
                        ${todayDate ? 'bg-blue-500 text-white font-semibold hover:bg-blue-600' : ''}
                        ${!todayDate && currentMonth ? 'text-gray-900 hover:bg-gray-100' : ''}
                        ${!todayDate && !currentMonth ? 'text-gray-300 hover:bg-gray-50' : ''}
                      `}
                    >
                      {date.getDate()}
                      {hasEntry && !todayDate && (
                        <span className="absolute bottom-1 w-1 h-1 rounded-full bg-blue-500" />
                      )}
                      {hasEntry && todayDate && (
                        <span className="absolute bottom-1 w-1 h-1 rounded-full bg-white" />
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
