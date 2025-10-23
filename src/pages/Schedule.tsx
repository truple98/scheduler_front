import { useState, useRef, useEffect } from 'react'
import type { Schedule as ScheduleType, ScheduleStatus, SchedulePriority } from '../types/schedule.type'
import { FaPlus, FaTimes, FaCheck, FaTrash, FaChevronDown, FaList, FaTh, FaCalendar, FaFilter, FaSort, FaEyeSlash, FaChevronLeft, FaChevronRight } from 'react-icons/fa'

type ViewMode = 'list' | 'board'
type FilterMode = 'all' | 'incomplete' | 'complete' | 'this_week' | 'overdue'
type SortMode = 'none' | 'dueDate' | 'alphabet' | 'createdDate'

// Projects
const projects = [
  { id: 'project1', name: '웹사이트 리뉴얼' },
  { id: 'project2', name: '모바일 앱 개발' },
  { id: null, name: '일반 일정' }
]

// Mock data for design testing
const mockSchedules: ScheduleType[] = [
  {
    id: '1',
    title: '새 랜딩 페이지 디자인',
    description: '와이어프레임과 목업 제작',
    startTime: '2025-10-25T09:00:00',
    endTime: '2025-10-25T17:00:00',
    createdAt: '2025-10-23T00:00:00',
    status: 'todo',
    priority: 'high',
    project: 'project1'
  },
  {
    id: '2',
    title: 'API 엔드포인트 개발',
    description: '사용자 인증 API 구현',
    startTime: '2025-10-24T10:00:00',
    endTime: '2025-10-24T12:00:00',
    createdAt: '2025-10-23T00:00:00',
    status: 'in_progress',
    priority: 'high',
    project: 'project2'
  },
  {
    id: '3',
    title: '문서 업데이트',
    description: 'API 예제 추가',
    startTime: '2025-10-23T14:00:00',
    endTime: '2025-10-23T16:00:00',
    createdAt: '2025-10-23T00:00:00',
    status: 'in_progress',
    priority: 'low',
    project: 'project1'
  },
  {
    id: '4',
    title: '병원 예약',
    description: '',
    startTime: '2025-10-26T09:00:00',
    endTime: '2025-10-26T10:00:00',
    createdAt: '2025-10-23T00:00:00',
    status: 'todo',
    priority: 'medium',
    project: null
  },
  {
    id: '5',
    title: '푸시 알림 기능',
    description: '실시간 알림 구현',
    startTime: '2025-10-27T14:00:00',
    endTime: '2025-10-27T18:00:00',
    createdAt: '2025-10-23T00:00:00',
    status: 'todo',
    priority: 'medium',
    project: 'project2'
  }
]

const Schedule = () => {
  const [schedules, setSchedules] = useState<ScheduleType[]>(mockSchedules)
  const [selectedSchedule, setSelectedSchedule] = useState<ScheduleType | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isAddingTask, setIsAddingTask] = useState(false)
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [currentProject, setCurrentProject] = useState<string | null>(null)
  const [editedSchedule, setEditedSchedule] = useState<ScheduleType | null>(null)
  const [collapsedSections, setCollapsedSections] = useState<Set<string | null>>(new Set())
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [filterMode, setFilterMode] = useState<FilterMode>('all')
  const [sortMode, setSortMode] = useState<SortMode>('none')
  const [showFilterMenu, setShowFilterMenu] = useState(false)
  const [showSortMenu, setShowSortMenu] = useState(false)
  const [showHideMenu, setShowHideMenu] = useState(false)
  const [showDueDate, setShowDueDate] = useState(true)
  const [showPriority, setShowPriority] = useState(true)
  const [showStatus, setShowStatus] = useState(true)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [datePickerMonth, setDatePickerMonth] = useState(new Date())
  const datePickerRef = useRef<HTMLDivElement>(null)

  const getFilteredSchedules = () => {
    const now = new Date()
    const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

    switch (filterMode) {
      case 'incomplete':
        return schedules.filter(s => s.status !== 'done')
      case 'complete':
        return schedules.filter(s => s.status === 'done')
      case 'this_week':
        return schedules.filter(s => {
          const endTime = new Date(s.endTime)
          return endTime >= now && endTime <= oneWeekFromNow
        })
      case 'overdue':
        return schedules.filter(s => {
          const endTime = new Date(s.endTime)
          return endTime < now && s.status !== 'done'
        })
      case 'all':
      default:
        return schedules
    }
  }

  const getSortedSchedules = (scheduleList: ScheduleType[]) => {
    const sorted = [...scheduleList]

    switch (sortMode) {
      case 'dueDate':
        return sorted.sort((a, b) => new Date(a.endTime).getTime() - new Date(b.endTime).getTime())
      case 'alphabet':
        return sorted.sort((a, b) => a.title.localeCompare(b.title))
      case 'createdDate':
        return sorted.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      case 'none':
      default:
        return sorted
    }
  }

  const getSchedulesByProject = (projectId: string | null) => {
    const filtered = getFilteredSchedules()
    const projectFiltered = filtered.filter(schedule => schedule.project === projectId)
    return getSortedSchedules(projectFiltered)
  }

  const getPriorityLabel = (priority?: SchedulePriority) => {
    switch (priority) {
      case 'high':
        return '높음'
      case 'medium':
        return '보통'
      case 'low':
        return '낮음'
      default:
        return '-'
    }
  }

  const getPriorityColor = (priority?: SchedulePriority) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 bg-red-50'
      case 'medium':
        return 'text-yellow-600 bg-yellow-50'
      case 'low':
        return 'text-blue-600 bg-blue-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  const getStatusLabel = (status?: ScheduleStatus) => {
    switch (status) {
      case 'todo':
        return '할 일'
      case 'in_progress':
        return '진행 중'
      case 'done':
        return '완료'
      default:
        return '-'
    }
  }

  // 날짜 포맷팅 함수
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })
  }

  // 달력 날짜 생성 함수
  const generateCalendarDays = (year: number, month: number) => {
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days: Date[] = []

    // 이전 달의 날짜들
    const prevMonthLastDay = new Date(year, month, 0).getDate()
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      days.push(new Date(year, month - 1, prevMonthLastDay - i))
    }

    // 현재 달의 날짜들
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i))
    }

    // 다음 달의 날짜들 (42칸 맞추기)
    const remainingDays = 42 - days.length
    for (let i = 1; i <= remainingDays; i++) {
      days.push(new Date(year, month + 1, i))
    }

    return days
  }

  // 클릭 외부 감지
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        setShowDatePicker(false)
      }
    }

    if (showDatePicker) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showDatePicker])

  const handleTaskClick = (schedule: ScheduleType) => {
    setSelectedSchedule(schedule)
    setEditedSchedule(schedule)
    setIsDetailOpen(true)
  }

  const handleUpdateSchedule = () => {
    if (!editedSchedule || !selectedSchedule) return

    const updated = editedSchedule
    setSchedules(schedules.map(s => s.id === updated.id ? updated : s))
    setSelectedSchedule(updated)
    setEditedSchedule(updated)
  }

  const handleDeleteSchedule = () => {
    if (!selectedSchedule) return
    if (!window.confirm('정말로 이 작업을 삭제하시겠습니까?')) return

    setSchedules(schedules.filter(s => s.id !== selectedSchedule.id))
    setIsDetailOpen(false)
    setSelectedSchedule(null)
    setEditedSchedule(null)
  }

  const handleAddTask = (projectId: string | null) => {
    setCurrentProject(projectId)
    setIsAddingTask(true)
  }

  const handleCreateTask = () => {
    if (!newTaskTitle.trim()) return

    const newSchedule: ScheduleType = {
      id: Date.now().toString(),
      title: newTaskTitle,
      description: '',
      startTime: new Date().toISOString(),
      endTime: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      status: 'todo',
      priority: 'medium',
      project: currentProject
    }
    setSchedules([...schedules, newSchedule])
    setNewTaskTitle('')
    setIsAddingTask(false)
  }

  const handleToggleComplete = (schedule: ScheduleType) => {
    const newStatus: ScheduleStatus = schedule.status === 'done' ? 'todo' : 'done'
    const updated = { ...schedule, status: newStatus }
    setSchedules(schedules.map(s => s.id === schedule.id ? updated : s))
    if (selectedSchedule?.id === schedule.id) {
      setSelectedSchedule(updated)
    }
  }

  const toggleSection = (projectId: string | null) => {
    const newCollapsed = new Set(collapsedSections)
    if (newCollapsed.has(projectId)) {
      newCollapsed.delete(projectId)
    } else {
      newCollapsed.add(projectId)
    }
    setCollapsedSections(newCollapsed)
  }

  return (
    <div className="schedule-container flex h-full bg-gray-50">
      {/* 왼쪽: 태스크 테이블 */}
      <div className="flex-1 overflow-y-auto p-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <div className="mx-auto">
          {/* 헤더 탭 */}
          <div className="flex items-center gap-1 mb-4 border-b border-gray-200">
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 text-sm font-medium flex items-center gap-2 border-b-2 transition-colors ${
                viewMode === 'list'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <FaList size={14} />
              목록
            </button>
            <button
              onClick={() => setViewMode('board')}
              className={`px-4 py-2 text-sm font-medium flex items-center gap-2 border-b-2 transition-colors ${
                viewMode === 'board'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <FaTh size={14} />
              보드
            </button>
          </div>

          {/* 상단 툴바 */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleAddTask(null)}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-50 flex items-center gap-1"
              >
                <FaPlus size={12} />
                작업 추가
              </button>

              {/* Filter 버튼 */}
              <div className="relative">
                <button
                  onClick={() => {
                    setShowFilterMenu(!showFilterMenu)
                    setShowSortMenu(false)
                    setShowHideMenu(false)
                  }}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-50 flex items-center gap-1"
                >
                  <FaFilter size={12} />
                  필터
                </button>
                {showFilterMenu && (
                  <div className="absolute top-full mt-1 left-0 bg-white border border-gray-200 rounded-md shadow-lg py-1 z-10 w-48">
                    <button
                      onClick={() => {
                        setFilterMode('all')
                        setShowFilterMenu(false)
                      }}
                      className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 ${filterMode === 'all' ? 'bg-blue-50 text-blue-600' : ''}`}
                    >
                      모든 작업
                    </button>
                    <button
                      onClick={() => {
                        setFilterMode('incomplete')
                        setShowFilterMenu(false)
                      }}
                      className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 ${filterMode === 'incomplete' ? 'bg-blue-50 text-blue-600' : ''}`}
                    >
                      미완료 작업
                    </button>
                    <button
                      onClick={() => {
                        setFilterMode('complete')
                        setShowFilterMenu(false)
                      }}
                      className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 ${filterMode === 'complete' ? 'bg-blue-50 text-blue-600' : ''}`}
                    >
                      완료된 작업
                    </button>
                    <div className="border-t border-gray-200 my-1"></div>
                    <button
                      onClick={() => {
                        setFilterMode('this_week')
                        setShowFilterMenu(false)
                      }}
                      className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 ${filterMode === 'this_week' ? 'bg-blue-50 text-blue-600' : ''}`}
                    >
                      이번 주 마감
                    </button>
                    <button
                      onClick={() => {
                        setFilterMode('overdue')
                        setShowFilterMenu(false)
                      }}
                      className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 ${filterMode === 'overdue' ? 'bg-blue-50 text-blue-600' : ''}`}
                    >
                      기한 초과
                    </button>
                  </div>
                )}
              </div>

              {/* Sort 버튼 */}
              <div className="relative">
                <button
                  onClick={() => {
                    setShowSortMenu(!showSortMenu)
                    setShowFilterMenu(false)
                    setShowHideMenu(false)
                  }}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-50 flex items-center gap-1"
                >
                  <FaSort size={12} />
                  정렬
                </button>
                {showSortMenu && (
                  <div className="absolute top-full mt-1 left-0 bg-white border border-gray-200 rounded-md shadow-lg py-1 z-10 w-48">
                    <button
                      onClick={() => {
                        setSortMode('none')
                        setShowSortMenu(false)
                      }}
                      className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 ${sortMode === 'none' ? 'bg-blue-50 text-blue-600' : ''}`}
                    >
                      없음
                    </button>
                    <div className="border-t border-gray-200 my-1"></div>
                    <button
                      onClick={() => {
                        setSortMode('dueDate')
                        setShowSortMenu(false)
                      }}
                      className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 ${sortMode === 'dueDate' ? 'bg-blue-50 text-blue-600' : ''}`}
                    >
                      마감일
                    </button>
                    <button
                      onClick={() => {
                        setSortMode('alphabet')
                        setShowSortMenu(false)
                      }}
                      className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 ${sortMode === 'alphabet' ? 'bg-blue-50 text-blue-600' : ''}`}
                    >
                      알파벳순
                    </button>
                    <button
                      onClick={() => {
                        setSortMode('createdDate')
                        setShowSortMenu(false)
                      }}
                      className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 ${sortMode === 'createdDate' ? 'bg-blue-50 text-blue-600' : ''}`}
                    >
                      생성일
                    </button>
                  </div>
                )}
              </div>

              {/* Hide 버튼 */}
              <div className="relative">
                <button
                  onClick={() => {
                    setShowHideMenu(!showHideMenu)
                    setShowFilterMenu(false)
                    setShowSortMenu(false)
                  }}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-50 flex items-center gap-1"
                >
                  <FaEyeSlash size={12} />
                  숨기기
                </button>
                {showHideMenu && (
                  <div className="absolute top-full mt-1 left-0 bg-white border border-gray-200 rounded-md shadow-lg py-1 z-10 w-48">
                    <label className="flex items-center px-4 py-2 hover:bg-gray-50 cursor-pointer">
                      <input
                        type="checkbox"
                        className="mr-2"
                        checked={showStatus}
                        onChange={(e) => setShowStatus(e.target.checked)}
                      />
                      <span className="text-sm">상태</span>
                    </label>
                    <label className="flex items-center px-4 py-2 hover:bg-gray-50 cursor-pointer">
                      <input
                        type="checkbox"
                        className="mr-2"
                        checked={showPriority}
                        onChange={(e) => setShowPriority(e.target.checked)}
                      />
                      <span className="text-sm">중요도</span>
                    </label>
                    <label className="flex items-center px-4 py-2 hover:bg-gray-50 cursor-pointer">
                      <input
                        type="checkbox"
                        className="mr-2"
                        checked={showDueDate}
                        onChange={(e) => setShowDueDate(e.target.checked)}
                      />
                      <span className="text-sm">마감일</span>
                    </label>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 뷰 컨텐츠 */}
          {viewMode === 'list' ? (
            /* List 뷰 - 심플 리스트 */
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">

            {/* 프로젝트별 태스크 */}
            {projects.map(project => {
              const projectTasks = getSchedulesByProject(project.id)
              const isCollapsed = collapsedSections.has(project.id)

              return (
                <div key={project.id || 'general'}>
                  {/* 프로젝트 헤더 */}
                  <div className="border-b border-gray-200">
                    <button
                      onClick={() => toggleSection(project.id)}
                      className="w-full px-6 py-3 flex items-center gap-2 hover:bg-gray-50 text-sm font-semibold text-gray-900"
                    >
                      <FaChevronDown
                        size={10}
                        className={`transition-transform text-gray-500 ${isCollapsed ? '-rotate-90' : ''}`}
                      />
                      {project.name}
                      <span className="ml-2 text-xs text-gray-500 font-normal">
                        ({projectTasks.length}개)
                      </span>
                    </button>
                  </div>

                  {/* 컬럼 헤더 */}
                  {!isCollapsed && (
                    <div className="px-6 py-2 bg-gray-50 border-b border-gray-200 grid grid-cols-12 gap-3 text-xs font-medium text-gray-500">
                      <div className="col-span-1 flex items-center">
                        <div className="w-4 h-4"></div>
                      </div>
                      <div className="col-span-4">작업 이름</div>
                      {showStatus && <div className="col-span-2">상태</div>}
                      {showPriority && <div className="col-span-2">중요도</div>}
                      {showDueDate && <div className="col-span-3">마감일</div>}
                    </div>
                  )}

                  {/* 프로젝트 태스크들 */}
                  {!isCollapsed && (
                    <>
                      {projectTasks.map(schedule => (
                        <div
                          key={schedule.id}
                          onClick={() => handleTaskClick(schedule)}
                          className="px-6 py-3 border-b border-gray-200 hover:bg-gray-50 cursor-pointer grid grid-cols-12 gap-3 items-center"
                        >
                          <div className="col-span-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleToggleComplete(schedule)
                              }}
                              className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${
                                schedule.status === 'done'
                                  ? 'bg-green-500 border-green-500'
                                  : 'border-gray-300 hover:border-green-500'
                              }`}
                            >
                              {schedule.status === 'done' && <FaCheck size={8} className="text-white" />}
                            </button>
                          </div>

                          <div className="col-span-4 min-w-0">
                            <div className={`text-sm ${schedule.status === 'done' ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                              {schedule.title}
                            </div>
                          </div>

                          {showStatus && (
                            <div className="col-span-2 text-xs text-gray-600">
                              {getStatusLabel(schedule.status)}
                            </div>
                          )}

                          {showPriority && (
                            <div className="col-span-2">
                              <span className={`text-xs px-2 py-1 rounded ${getPriorityColor(schedule.priority)}`}>
                                {getPriorityLabel(schedule.priority)}
                              </span>
                            </div>
                          )}

                          {showDueDate && (
                            <div className="col-span-3 text-xs text-gray-500">
                              {new Date(schedule.endTime).toLocaleDateString('ko-KR', { year: 'numeric', month: 'short', day: 'numeric' })}
                            </div>
                          )}
                        </div>
                      ))}

                      {/* Add task 인라인 폼 */}
                      {isAddingTask && currentProject === project.id && (
                        <div className="px-6 py-3 border-b border-gray-200 flex items-center gap-3">
                          <div className="w-4 h-4"></div>
                          <input
                            type="text"
                            value={newTaskTitle}
                            onChange={(e) => setNewTaskTitle(e.target.value)}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') handleCreateTask()
                              if (e.key === 'Escape') {
                                setIsAddingTask(false)
                                setNewTaskTitle('')
                              }
                            }}
                            onBlur={() => {
                              if (!newTaskTitle.trim()) {
                                setIsAddingTask(false)
                              }
                            }}
                            placeholder="작업 이름"
                            className="flex-1 px-2 py-1 text-sm border-0 focus:outline-none"
                            autoFocus
                          />
                        </div>
                      )}

                      {/* Add task 버튼 */}
                      {!isAddingTask && (
                        <button
                          onClick={() => handleAddTask(project.id)}
                          className="w-full px-6 py-3 text-left text-sm text-gray-400 hover:bg-gray-50 hover:text-gray-600 flex items-center gap-2"
                        >
                          작업 추가...
                        </button>
                      )}
                    </>
                  )}
                </div>
              )
            })}
          </div>
          ) : (
            /* Board 뷰 - 칸반 스타일 */
            <div className="flex gap-4 h-[calc(100vh-200px)]">
              {projects.map(project => {
                const projectTasks = getSchedulesByProject(project.id)

                return (
                  <div key={project.id || 'general'} className="flex-1 bg-gray-50 rounded-lg p-4 flex flex-col">
                    {/* 컬럼 헤더 */}
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                        {project.name}
                        <span className="text-xs text-gray-500 bg-gray-200 px-2 py-0.5 rounded-full">
                          {projectTasks.length}
                        </span>
                      </h3>
                    </div>

                    {/* 태스크 카드들 */}
                    <div className="flex-1 overflow-y-auto space-y-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                      {projectTasks.map(schedule => (
                        <div
                          key={schedule.id}
                          onClick={() => handleTaskClick(schedule)}
                          className="bg-white rounded-lg p-3 shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
                        >
                          <div className="flex items-start gap-2 mb-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleToggleComplete(schedule)
                              }}
                              className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors flex-shrink-0 mt-0.5 ${
                                schedule.status === 'done'
                                  ? 'bg-green-500 border-green-500'
                                  : 'border-gray-300 hover:border-green-500'
                              }`}
                            >
                              {schedule.status === 'done' && <FaCheck size={8} className="text-white" />}
                            </button>
                            <div className="flex-1 min-w-0">
                              <div className={`text-sm font-medium ${schedule.status === 'done' ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                                {schedule.title}
                              </div>
                            </div>
                          </div>
                          {schedule.description && (
                            <p className="text-xs text-gray-500 mb-2 line-clamp-2">{schedule.description}</p>
                          )}
                          {showDueDate && (
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <FaCalendar size={10} />
                              <span>{new Date(schedule.endTime).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}</span>
                            </div>
                          )}
                        </div>
                      ))}

                      {/* Add task 버튼 */}
                      {!isAddingTask && (
                        <button
                          onClick={() => handleAddTask(project.id)}
                          className="w-full p-3 text-left text-sm text-gray-400 hover:bg-white hover:text-gray-600 rounded-lg border-2 border-dashed border-gray-200 hover:border-gray-300 flex items-center gap-2"
                        >
                          <FaPlus size={12} />
                          작업 추가
                        </button>
                      )}

                      {/* Add task 인라인 폼 */}
                      {isAddingTask && currentProject === project.id && (
                        <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-200">
                          <input
                            type="text"
                            value={newTaskTitle}
                            onChange={(e) => setNewTaskTitle(e.target.value)}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') handleCreateTask()
                              if (e.key === 'Escape') {
                                setIsAddingTask(false)
                                setNewTaskTitle('')
                              }
                            }}
                            onBlur={() => {
                              if (!newTaskTitle.trim()) {
                                setIsAddingTask(false)
                              }
                            }}
                            placeholder="작업 이름"
                            className="w-full text-sm border-0 focus:outline-none"
                            autoFocus
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* 오른쪽: 상세 패널 - Asana 스타일 */}
      {isDetailOpen && selectedSchedule && editedSchedule && (
        <div className="w-[500px] bg-white border-l border-gray-200 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] flex flex-col">

          {/* 작업 제목과 닫기 버튼 */}
          <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-200">
            <input
              type="text"
              value={editedSchedule.title}
              onChange={(e) => setEditedSchedule({ ...editedSchedule, title: e.target.value })}
              className="flex-1 text-xl font-semibold border-0 focus:outline-none focus:ring-0 px-0 text-gray-900 placeholder-gray-400"
              placeholder="작업 이름"
            />
            <button
              onClick={() => setIsDetailOpen(false)}
              className="text-gray-400 hover:text-gray-600 flex-shrink-0"
            >
              <FaTimes size={18} />
            </button>
          </div>
          {/* 작업 속성들 */}
          <div className="px-6 space-y-3">
            {/* 마감일 */}
            <div className="flex items-center gap-3 py-2">
              <div className="w-20 text-sm text-gray-500">마감일</div>
              <div className="flex-1 relative" ref={datePickerRef}>
                <button
                  onClick={() => {
                    setShowDatePicker(!showDatePicker)
                    setDatePickerMonth(new Date(editedSchedule.endTime))
                  }}
                  className="w-full px-3 py-1.5 text-sm text-left border border-gray-300 rounded hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-between"
                >
                  <span>{formatDate(new Date(editedSchedule.endTime))}</span>
                  <FaCalendar size={12} className="text-gray-400" />
                </button>

                {/* 커스텀 달력 팝업 */}
                {showDatePicker && (
                  <div className="absolute top-full mt-1 left-0 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50 w-80">
                    {/* 월 헤더 */}
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-semibold text-gray-900">
                        {datePickerMonth.getFullYear()}년 {datePickerMonth.getMonth() + 1}월
                      </h3>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            const newMonth = new Date(datePickerMonth)
                            newMonth.setMonth(newMonth.getMonth() - 1)
                            setDatePickerMonth(newMonth)
                          }}
                          className="p-1 hover:bg-gray-100 rounded"
                        >
                          <FaChevronLeft size={12} className="text-gray-600" />
                        </button>
                        <button
                          onClick={() => {
                            const newMonth = new Date(datePickerMonth)
                            newMonth.setMonth(newMonth.getMonth() + 1)
                            setDatePickerMonth(newMonth)
                          }}
                          className="p-1 hover:bg-gray-100 rounded"
                        >
                          <FaChevronRight size={12} className="text-gray-600" />
                        </button>
                      </div>
                    </div>

                    {/* 요일 헤더 */}
                    <div className="grid grid-cols-7 gap-1 mb-2">
                      {['일', '월', '화', '수', '목', '금', '토'].map((day, index) => (
                        <div key={index} className="text-center text-xs font-medium text-gray-500 py-1">
                          {day}
                        </div>
                      ))}
                    </div>

                    {/* 날짜 그리드 */}
                    <div className="grid grid-cols-7 gap-1">
                      {generateCalendarDays(datePickerMonth.getFullYear(), datePickerMonth.getMonth()).map((date, index) => {
                        const isToday =
                          date.getDate() === new Date().getDate() &&
                          date.getMonth() === new Date().getMonth() &&
                          date.getFullYear() === new Date().getFullYear()

                        const isSelected =
                          date.getDate() === new Date(editedSchedule.endTime).getDate() &&
                          date.getMonth() === new Date(editedSchedule.endTime).getMonth() &&
                          date.getFullYear() === new Date(editedSchedule.endTime).getFullYear()

                        const isCurrentMonth = date.getMonth() === datePickerMonth.getMonth()

                        return (
                          <button
                            key={index}
                            onClick={() => {
                              const newDate = new Date(date)
                              newDate.setHours(new Date(editedSchedule.endTime).getHours())
                              newDate.setMinutes(new Date(editedSchedule.endTime).getMinutes())
                              setEditedSchedule({ ...editedSchedule, endTime: newDate.toISOString() })
                              setShowDatePicker(false)
                            }}
                            className={`aspect-square flex items-center justify-center text-xs rounded-md transition-colors ${
                              isToday ? 'bg-red-500 text-white font-semibold hover:bg-red-600' :
                              isSelected ? 'bg-blue-500 text-white font-semibold hover:bg-blue-600' :
                              isCurrentMonth ? 'text-gray-900 hover:bg-gray-100' :
                              'text-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            {date.getDate()}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 프로젝트 */}
            <div className="flex items-center gap-3 py-2">
              <div className="w-20 text-sm text-gray-500">프로젝트</div>
              <div className="flex-1">
                <select
                  value={editedSchedule.project || ''}
                  onChange={(e) => setEditedSchedule({ ...editedSchedule, project: e.target.value || null })}
                  className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {projects.map(project => (
                    <option key={project.id || 'general'} value={project.id || ''}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* 상태 */}
            <div className="flex items-center gap-3 py-2">
              <div className="w-20 text-sm text-gray-500">상태</div>
              <div className="flex-1">
                <select
                  value={editedSchedule.status || 'todo'}
                  onChange={(e) => setEditedSchedule({ ...editedSchedule, status: e.target.value as ScheduleStatus })}
                  className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="todo">할 일</option>
                  <option value="in_progress">진행 중</option>
                  <option value="done">완료</option>
                </select>
              </div>
            </div>

            {/* 중요도 */}
            <div className="flex items-center gap-3 py-2">
              <div className="w-20 text-sm text-gray-500">중요도</div>
              <div className="flex-1">
                <select
                  value={editedSchedule.priority || 'medium'}
                  onChange={(e) => setEditedSchedule({ ...editedSchedule, priority: e.target.value as SchedulePriority })}
                  className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="high">높음</option>
                  <option value="medium">보통</option>
                  <option value="low">낮음</option>
                </select>
              </div>
            </div>
          </div>

          {/* 설명 섹션 */}
          <div className="px-6 py-6 mt-4">
            <div className="text-sm font-medium text-gray-700 mb-2">설명</div>
            <textarea
              value={editedSchedule.description}
              onChange={(e) => setEditedSchedule({ ...editedSchedule, description: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px] resize-none"
              placeholder="작업에 대한 설명을 추가하세요..."
            />
          </div>

          {/* 구분선 */}
          <div className="border-t border-gray-200 mx-6"></div>

          {/* 댓글 섹션 */}
          <div className="px-6 py-6">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-white text-sm flex-shrink-0">
                나
              </div>
              <div className="flex-1">
                <textarea
                  placeholder="질문하거나 업데이트를 게시하세요..."
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[60px] resize-none"
                />
              </div>
            </div>
          </div>

          {/* 하단 버튼들 */}
          <div className="px-6 pb-6 mt-auto space-y-2">
            <button
              onClick={handleUpdateSchedule}
              className="w-full px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 transition-colors"
            >
              변경사항 저장
            </button>
            <button
              onClick={handleDeleteSchedule}
              className="w-full px-4 py-2 text-red-600 text-sm font-medium rounded hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
            >
              <FaTrash size={12} />
              작업 삭제
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Schedule
