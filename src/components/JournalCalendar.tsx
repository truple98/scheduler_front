import { useState } from 'react'
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa'

type JournalCalendarProps = {
  selectedDate: string | null
  onDateSelect: (date: string) => void
  journalDates: string[] // 일지가 있는 날짜들 (YYYY-MM-DD 형식)
  onShowAll?: () => void // 전체 보기 콜백
}

const JournalCalendar = ({ selectedDate, onDateSelect, journalDates, onShowAll }: JournalCalendarProps) => {
  const [currentDate, setCurrentDate] = useState(new Date())

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

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

  // 날짜를 YYYY-MM-DD 형식으로 변환 (로컬 시간대 기준)
  const formatDate = (date: Date): string => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  // 오늘 날짜
  const today = formatDate(new Date())

  // 날짜 클릭 핸들러
  const handleDateClick = (date: Date) => {
    const dateStr = formatDate(date)
    onDateSelect(dateStr)
  }

  // 해당 날짜에 일지가 있는지 확인
  const hasJournal = (date: Date): boolean => {
    return journalDates.includes(formatDate(date))
  }

  // 선택된 날짜인지 확인
  const isSelected = (date: Date): boolean => {
    return selectedDate === formatDate(date)
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

  return (
    <div className="journal-calendar">
      {/* 선택된 날짜 표시 및 전체 보기 버튼 */}
      {selectedDate && onShowAll && (
        <div className="mb-4 pb-3 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              <span className="font-semibold text-blue-600">
                {(() => {
                  const [year, month, day] = selectedDate.split('-').map(Number)
                  return new Date(year, month - 1, day).toLocaleDateString('ko-KR', {
                    month: 'long',
                    day: 'numeric'
                  })
                })()}
              </span>
              <span className="ml-1">선택됨</span>
            </div>
            <button
              onClick={onShowAll}
              className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded transition-colors"
            >
              전체 보기
            </button>
          </div>
        </div>
      )}

      {/* 월 헤더 */}
      <div className="flex items-center justify-between mb-3 p-4">
        <h3 className="text-sm font-semibold text-gray-900">
          {year}년 {monthNames[month]}
        </h3>
        <div className="flex gap-4">
          <button
            onClick={goToPreviousMonth}
            className="p-1 hover:bg-gray-200 rounded transition-colors"
          >
            <FaChevronLeft className="text-gray-600 text-xs" />
          </button>
          <button
            onClick={goToNextMonth}
            className="p-1 hover:bg-gray-200 rounded transition-colors"
          >
            <FaChevronRight className="text-gray-600 text-xs" />
          </button>
        </div>
      </div>

      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['일', '월', '화', '수', '목', '금', '토'].map((day, index) => (
          <div
            key={index}
            className="text-center text-xs font-medium text-gray-500"
          >
            {day}
          </div>
        ))}
      </div>

      {/* 날짜 그리드 */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((date, index) => {
          const currentMonth = isCurrentMonth(date)
          const todayDate = isToday(date)
          const selected = isSelected(date)
          const hasEntry = hasJournal(date)

          return (
            <button
              key={formatDate(date)}
              onClick={() => handleDateClick(date)}
              className={`aspect-square flex items-center justify-center text-xs rounded-md transition-colors relative
                ${todayDate ? 'bg-red-500 text-white font-semibold hover:bg-red-600' : ''}
                ${!todayDate && selected ? 'bg-blue-500 text-white font-semibold hover:bg-blue-600' : ''}
                ${!todayDate && !selected && currentMonth ? 'text-gray-900 hover:bg-gray-100' : ''}
                ${!todayDate && !selected && !currentMonth ? 'text-gray-300 hover:bg-gray-50' : ''}
              `}
            >
              {date.getDate()}
              {hasEntry && !todayDate && !selected && (
                <span className="absolute bottom-0.5 w-1 h-1 rounded-full bg-blue-500" />
              )}
              {hasEntry && (todayDate || selected) && (
                <span className="absolute bottom-0.5 w-1 h-1 rounded-full bg-white" />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default JournalCalendar
