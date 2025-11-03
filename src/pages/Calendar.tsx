import { useState, useEffect } from 'react'
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa'
import { useHeader } from '../contexts/HeaderContext'

type TimeSlot = {
  date: Date
  hour: number
}

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDates, setSelectedDates] = useState<Date[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [dragStartDate, setDragStartDate] = useState<Date | null>(null)
  const [miniCalendarDate, setMiniCalendarDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<'week' | 'month'>('month')
  const { setLeftContent, setRightContent } = useHeader()

  // 주별 뷰용 시간대 선택 상태
  const [selectedTimeSlots, setSelectedTimeSlots] = useState<TimeSlot[]>([])
  const [dragStartTimeSlot, setDragStartTimeSlot] = useState<TimeSlot | null>(null)

  const monthNames = [
    '1월', '2월', '3월', '4월', '5월', '6월',
    '7월', '8월', '9월', '10월', '11월', '12월'
  ]

  const dayNames = ['일', '월', '화', '수', '목', '금', '토']

  // 특정 월의 모든 날짜 가져오기 (이전달/다음달 포함)
  const getCalendarDays = (date: Date) => {
    if (viewMode === 'week') {
      // 주별 뷰: 현재 날짜가 속한 주의 일요일부터 토요일까지
      const startDate = new Date(date)
      startDate.setDate(date.getDate() - date.getDay())

      const days = []
      const currentDay = new Date(startDate)

      for (let i = 0; i < 7; i++) {
        days.push(new Date(currentDay))
        currentDay.setDate(currentDay.getDate() + 1)
      }

      return days
    } else {
      // 월별 뷰: 기존 로직
      const year = date.getFullYear()
      const month = date.getMonth()

      const firstDay = new Date(year, month, 1)
      const lastDay = new Date(year, month + 1, 0)

      // 첫 주의 일요일 찾기
      const startDate = new Date(firstDay)
      startDate.setDate(firstDay.getDate() - firstDay.getDay())

      // 마지막 주의 토요일 찾기
      const endDate = new Date(lastDay)
      endDate.setDate(lastDay.getDate() + (6 - lastDay.getDay()))

      const days = []
      const currentDay = new Date(startDate)

      while (currentDay <= endDate) {
        days.push(new Date(currentDay))
        currentDay.setDate(currentDay.getDate() + 1)
      }

      return days
    }
  }

  const days = getCalendarDays(currentDate)

  const isSameDay = (date1: Date, date2: Date) => {
    return date1.getDate() === date2.getDate() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear()
  }

  const isSameTimeSlot = (slot1: TimeSlot, slot2: TimeSlot) => {
    return isSameDay(slot1.date, slot2.date) && slot1.hour === slot2.hour
  }

  const isToday = (date: Date) => {
    return isSameDay(date, new Date())
  }

  const isCurrentMonth = (date: Date) => {
    if (viewMode === 'week') {
      // 주별 뷰에서는 모든 날짜가 현재 주에 속함
      return true
    }
    return date.getMonth() === currentDate.getMonth()
  }

  const isDateSelected = (date: Date) => {
    return selectedDates.some(selectedDate => isSameDay(selectedDate, date))
  }

  const isTimeSlotSelected = (slot: TimeSlot) => {
    return selectedTimeSlots.some(selectedSlot => isSameTimeSlot(selectedSlot, slot))
  }

  // 두 날짜 사이의 모든 날짜 가져오기
  const getDateRange = (start: Date, end: Date) => {
    const dates: Date[] = []
    const startTime = start.getTime()
    const endTime = end.getTime()
    const minTime = Math.min(startTime, endTime)
    const maxTime = Math.max(startTime, endTime)

    const currentDay = new Date(minTime)
    while (currentDay.getTime() <= maxTime) {
      dates.push(new Date(currentDay))
      currentDay.setDate(currentDay.getDate() + 1)
    }

    return dates
  }

  // 두 시간대 사이의 모든 시간대 가져오기
  const getTimeSlotRange = (start: TimeSlot, end: TimeSlot) => {
    const slots: TimeSlot[] = []

    const startDateTime = new Date(start.date).setHours(start.hour, 0, 0, 0)
    const endDateTime = new Date(end.date).setHours(end.hour, 0, 0, 0)

    const minTime = Math.min(startDateTime, endDateTime)
    const maxTime = Math.max(startDateTime, endDateTime)

    let currentTime = minTime
    while (currentTime <= maxTime) {
      const currentDate = new Date(currentTime)
      slots.push({
        date: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate()),
        hour: currentDate.getHours()
      })
      currentTime += 60 * 60 * 1000 // 1시간 추가
    }

    return slots
  }

  // 드래그 시작
  const handleMouseDown = (date: Date) => {
    setIsDragging(true)
    setDragStartDate(date)
    setSelectedDates([date])
  }

  // 드래그 중
  const handleMouseEnter = (date: Date) => {
    if (isDragging && dragStartDate) {
      const range = getDateRange(dragStartDate, date)
      setSelectedDates(range)
    }
  }

  // 드래그 종료
  const handleMouseUp = () => {
    setIsDragging(false)
  }

  // 시간대 드래그 시작
  const handleTimeSlotMouseDown = (slot: TimeSlot) => {
    setIsDragging(true)
    setDragStartTimeSlot(slot)
    setSelectedTimeSlots([slot])
  }

  // 시간대 드래그 중
  const handleTimeSlotMouseEnter = (slot: TimeSlot) => {
    if (isDragging && dragStartTimeSlot) {
      const range = getTimeSlotRange(dragStartTimeSlot, slot)
      setSelectedTimeSlots(range)
    }
  }

  // 시간대 드래그 종료
  const handleTimeSlotMouseUp = () => {
    setIsDragging(false)
  }

  const navigatePrevious = () => {
    if (viewMode === 'week') {
      // 주별 뷰: 일주일 전으로 이동
      const newDate = new Date(currentDate)
      newDate.setDate(currentDate.getDate() - 7)
      setCurrentDate(newDate)
    } else {
      // 월별 뷰: 이전 달로 이동
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
    }
  }

  const navigateNext = () => {
    if (viewMode === 'week') {
      // 주별 뷰: 일주일 후로 이동
      const newDate = new Date(currentDate)
      newDate.setDate(currentDate.getDate() + 7)
      setCurrentDate(newDate)
    } else {
      // 월별 뷰: 다음 달로 이동
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
    }
  }

  const goToToday = () => {
    const today = new Date()
    setCurrentDate(today)
    setSelectedDates([today])
    setMiniCalendarDate(today)
  }

  // 날짜를 YYYY-MM-DD 형식으로 변환
  const formatDateForInput = (date: Date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  // 시작 날짜 변경 핸들러
  const handleStartDateChange = (dateString: string) => {
    if (!dateString) return
    const newStartDate = new Date(dateString)
    const endDate = selectedDates.length > 0 ? selectedDates[selectedDates.length - 1] : newStartDate
    const range = getDateRange(newStartDate, endDate)
    setSelectedDates(range)
  }

  // 종료 날짜 변경 핸들러
  const handleEndDateChange = (dateString: string) => {
    if (!dateString) return
    const newEndDate = new Date(dateString)
    const startDate = selectedDates.length > 0 ? selectedDates[0] : newEndDate
    const range = getDateRange(startDate, newEndDate)
    setSelectedDates(range)
  }

  // 헤더 컨텐츠 설정
  useEffect(() => {
    // 좌측: 년/월 표시 + 이전/다음 버튼
    setLeftContent(
      <div className="flex items-center gap-4">
        <button
          onClick={navigatePrevious}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <FaChevronLeft className="text-gray-600" />
        </button>

        <h2 className="text-xl font-bold text-gray-800">
          {currentDate.getFullYear()}년 {monthNames[currentDate.getMonth()]}
        </h2>

        <button
          onClick={navigateNext}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <FaChevronRight className="text-gray-600" />
        </button>
      </div>
    )

    // 우측: 주별/월별 토글 버튼
    setRightContent(
      <div className="flex gap-2 bg-gray-200 p-1 rounded-lg">
        <button
          onClick={() => setViewMode('week')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            viewMode === 'week'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          주별
        </button>
        <button
          onClick={() => setViewMode('month')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            viewMode === 'month'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          월별
        </button>
      </div>
    )

    // 컴포넌트 언마운트 시 헤더 컨텐츠 제거
    return () => {
      setLeftContent(null)
      setRightContent(null)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDate, viewMode, setLeftContent, setRightContent])

  return (
    <div className="calendar-page flex h-full bg-gray-50 overflow-hidden">
      {/* 메인 캘린더 영역 */}
      <div className="main-calendar flex-1 flex flex-col px-8 pt-8 pb-4 overflow-hidden min-h-0">
        {/* 스크롤 가능한 캘린더 영역 */}
        <div className="flex-1 min-h-0 overflow-hidden">
          {viewMode === 'week' ? (
            /* 주별 뷰 - 시간대별 */
            <div className="bg-white rounded-lg shadow h-full flex flex-col">
              {/* 요일 헤더 */}
              <div className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-gray-200 shrink-0">
                <div className="border-r border-gray-200"></div>
                {days.map((date, index) => {
                  const isTodayDate = isToday(date)
                  return (
                    <div
                      key={index}
                      className="text-center py-3 border-r border-gray-200"
                    >
                      <div className="text-xs text-gray-500 mb-1">{dayNames[index]}</div>
                      <div
                        className={`text-sm font-semibold inline-flex items-center justify-center w-8 h-8 rounded-full
                          ${isTodayDate ? 'bg-red-500 text-white' : 'text-gray-900'}
                        `}
                      >
                        {date.getDate()}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* 시간대 그리드 - 내부 스크롤 */}
              <div
                className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
                onMouseUp={handleTimeSlotMouseUp}
                onMouseLeave={handleTimeSlotMouseUp}
              >
                <div className="grid grid-cols-[60px_repeat(7,1fr)]">
                  {Array.from({ length: 24 }, (_, hour) => (
                    <>
                      {/* 시간 라벨 */}
                      <div
                        key={`time-${hour}`}
                        className="border-r border-gray-200 px-2 py-2 text-xs text-gray-500 text-right"
                        style={{ height: '60px' }}
                      >
                        {hour.toString().padStart(2, '0')}:00
                      </div>
                      {/* 요일별 시간 셀 */}
                      {days.map((date, dayIndex) => {
                        const timeSlot: TimeSlot = { date, hour }
                        const isSelected = isTimeSlotSelected(timeSlot)
                        return (
                          <div
                            key={`${hour}-${dayIndex}`}
                            onMouseDown={() => handleTimeSlotMouseDown(timeSlot)}
                            onMouseEnter={() => handleTimeSlotMouseEnter(timeSlot)}
                            className={`border-b border-r border-gray-200 cursor-pointer transition-colors select-none
                              ${isSelected ? 'bg-blue-100' : 'hover:bg-gray-50'}
                            `}
                            style={{ height: '60px' }}
                          ></div>
                        )
                      })}
                    </>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* 월별 뷰 - 기존 */
            <div className="overflow-y-auto h-full [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              <div className="bg-white rounded-lg shadow">
                {/* 요일 헤더 */}
                <div className="grid grid-cols-7 border-b border-gray-200">
                  {dayNames.map((day, index) => (
                    <div
                      key={index}
                      className="text-center text-sm font-semibold text-gray-700 py-3"
                    >
                      {day}
                    </div>
                  ))}
                </div>

                {/* 날짜 그리드 */}
                <div className="grid grid-cols-7" onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
                  {days.map((date, index) => {
                    const isCurrentMonthDay = isCurrentMonth(date)
                    const isTodayDate = isToday(date)
                    const isSelected = isDateSelected(date)

                    return (
                      <div
                        key={index}
                        onMouseDown={() => handleMouseDown(date)}
                        onMouseEnter={() => handleMouseEnter(date)}
                        className={`min-h-[120px] p-3 border-b border-r border-gray-200 cursor-pointer transition-colors select-none
                          ${isSelected ? 'bg-blue-100' : 'hover:bg-gray-50'}
                          ${index % 7 === 0 ? 'border-l' : ''}
                        `}
                      >
                        <div
                          className={`text-sm font-medium inline-flex items-center justify-center w-8 h-8 rounded-full
                            ${isTodayDate ? 'bg-red-500 text-white' : ''}
                            ${!isCurrentMonthDay && !isTodayDate ? 'text-gray-400' : ''}
                            ${isCurrentMonthDay && !isTodayDate ? 'text-gray-900' : ''}
                          `}
                        >
                          {date.getDate()}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 우측 사이드바 영역 */}
      <div className="sidebar w-80 bg-white border-l border-gray-200 p-4 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <button
          onClick={goToToday}
          className="w-full px-4 py-2 text-sm font-medium bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors mb-4"
        >
          오늘
        </button>
        <div className="mb-4">
          <MiniCalendar
            miniCalendarDate={miniCalendarDate}
            setMiniCalendarDate={setMiniCalendarDate}
            selectedDates={selectedDates}
            onDateClick={(date) => {
              setSelectedDates([date])
              setCurrentDate(date)
            }}
          />
        </div>
        {viewMode === 'week' ? (
          /* 주별 뷰 - 시간대 정보 표시 */
          selectedTimeSlots.length > 0 && (
            <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-semibold text-blue-900">
                  선택된 시간: {selectedTimeSlots.length}시간
                </p>
                <button
                  onClick={() => setSelectedTimeSlots([])}
                  className="text-xs text-blue-600 hover:text-blue-800 underline"
                >
                  선택 해제
                </button>
              </div>

              <div className="space-y-2">
                <div>
                  <label className="block text-xs font-medium text-blue-800 mb-1">
                    시작
                  </label>
                  <div className="text-sm text-gray-700">
                    {selectedTimeSlots[0].date.getMonth() + 1}월 {selectedTimeSlots[0].date.getDate()}일{' '}
                    {selectedTimeSlots[0].hour.toString().padStart(2, '0')}:00
                  </div>
                </div>

                {selectedTimeSlots.length > 1 && (
                  <div>
                    <label className="block text-xs font-medium text-blue-800 mb-1">
                      종료
                    </label>
                    <div className="text-sm text-gray-700">
                      {selectedTimeSlots[selectedTimeSlots.length - 1].date.getMonth() + 1}월{' '}
                      {selectedTimeSlots[selectedTimeSlots.length - 1].date.getDate()}일{' '}
                      {selectedTimeSlots[selectedTimeSlots.length - 1].hour.toString().padStart(2, '0')}:59
                    </div>
                  </div>
                )}
              </div>
            </div>
          )
        ) : (
          /* 월별 뷰 - 기존 날짜 정보 표시 */
          selectedDates.length > 0 && (
            <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-semibold text-blue-900">
                  선택된 날짜: {selectedDates.length}일
                </p>
                <button
                  onClick={() => setSelectedDates([])}
                  className="text-xs text-blue-600 hover:text-blue-800 underline"
                >
                  선택 해제
                </button>
              </div>

              <div className="space-y-2">
                <div>
                  <label className="block text-xs font-medium text-blue-800 mb-1">
                    시작 날짜
                  </label>
                  <input
                    type="date"
                    value={formatDateForInput(selectedDates[0])}
                    onChange={(e) => handleStartDateChange(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                </div>

                {selectedDates.length > 1 && (
                  <div>
                    <label className="block text-xs font-medium text-blue-800 mb-1">
                      종료 날짜
                    </label>
                    <input
                      type="date"
                      value={formatDateForInput(selectedDates[selectedDates.length - 1])}
                      onChange={(e) => handleEndDateChange(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    />
                  </div>
                )}
              </div>
            </div>
          )
        )}
      </div>
    </div>
  )
}

// 미니 캘린더 컴포넌트
const MiniCalendar = ({
  miniCalendarDate,
  setMiniCalendarDate,
  selectedDates,
  onDateClick
}: {
  miniCalendarDate: Date
  setMiniCalendarDate: (date: Date) => void
  selectedDates: Date[]
  onDateClick: (date: Date) => void
}) => {
  const dayNames = ['일', '월', '화', '수', '목', '금', '토']
  const monthNames = [
    '1월', '2월', '3월', '4월', '5월', '6월',
    '7월', '8월', '9월', '10월', '11월', '12월'
  ]

  // 미니 캘린더용 날짜 가져오기
  const getMiniCalendarDays = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()

    const firstDay = new Date(year, month, 1)
    const startDate = new Date(firstDay)
    startDate.setDate(firstDay.getDate() - firstDay.getDay())

    const days = []
    const currentDay = new Date(startDate)

    // 6주 표시 (42일)
    for (let i = 0; i < 42; i++) {
      days.push(new Date(currentDay))
      currentDay.setDate(currentDay.getDate() + 1)
    }

    return days
  }

  const days = getMiniCalendarDays(miniCalendarDate)

  const isSameDay = (date1: Date, date2: Date) => {
    return date1.getDate() === date2.getDate() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear()
  }

  const isToday = (date: Date) => {
    return isSameDay(date, new Date())
  }

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === miniCalendarDate.getMonth()
  }

  const isDateSelected = (date: Date) => {
    return selectedDates.some(selectedDate => isSameDay(selectedDate, date))
  }

  const navigatePrevious = () => {
    setMiniCalendarDate(new Date(miniCalendarDate.getFullYear(), miniCalendarDate.getMonth() - 1))
  }

  const navigateNext = () => {
    setMiniCalendarDate(new Date(miniCalendarDate.getFullYear(), miniCalendarDate.getMonth() + 1))
  }

  return (
    <div className="mini-calendar">
      {/* 월 헤더 */}
      <div className="flex items-center justify-between mb-3 p-4">
        <h3 className="text-sm font-semibold text-gray-900">
          {miniCalendarDate.getFullYear()}년 {monthNames[miniCalendarDate.getMonth()]}
        </h3>
        <div className="flex gap-4">
          <button
            onClick={navigatePrevious}
            className="p-1 hover:bg-gray-200 rounded transition-colors"
          >
            <FaChevronLeft className="text-gray-600 text-xs" />
          </button>
          <button
            onClick={navigateNext}
            className="p-1 hover:bg-gray-200 rounded transition-colors"
          >
            <FaChevronRight className="text-gray-600 text-xs" />
          </button>
        </div>
      </div>

      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map((day, index) => (
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
        {days.map((date, index) => {
          const isCurrentMonthDay = isCurrentMonth(date)
          const isTodayDate = isToday(date)
          const isSelected = isDateSelected(date)

          return (
            <button
              key={index}
              onClick={() => onDateClick(date)}
              className={`aspect-square flex items-center justify-center text-xs rounded-md transition-colors
                ${isTodayDate ? 'bg-red-500 text-white font-semibold hover:bg-red-600' : ''}
                ${!isTodayDate && isSelected ? 'bg-blue-500 text-white font-semibold hover:bg-blue-600' : ''}
                ${!isTodayDate && !isSelected && isCurrentMonthDay ? 'text-gray-900 hover:bg-gray-100' : ''}
                ${!isTodayDate && !isSelected && !isCurrentMonthDay ? 'text-gray-300 hover:bg-gray-50' : ''}
              `}
            >
              {date.getDate()}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default Calendar