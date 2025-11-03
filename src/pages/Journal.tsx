import { useState, useEffect, useRef, useMemo } from 'react'
import { FaPlus, FaEdit, FaTrash, FaTimes, FaSearch, FaBold, FaItalic, FaListUl, FaListOl, FaQuoteLeft, FaCode, FaLink, FaUnderline, FaStrikethrough, FaUndo, FaRedo, FaMinus, FaAlignLeft, FaAlignCenter, FaAlignRight, FaAlignJustify, FaHighlighter, FaArrowLeft, FaChevronUp, FaChevronDown, FaImage } from 'react-icons/fa'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Link from '@tiptap/extension-link'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import Highlight from '@tiptap/extension-highlight'
import Image from '@tiptap/extension-image'
import { useHeader } from '../contexts/HeaderContext'
import JournalCalendar from '../components/JournalCalendar'

type JournalEntry = {
  id: string
  title: string
  content: string
  date: string
  createdAt: string
}

// Mock data for testing
const mockJournals: JournalEntry[] = [
  {
    id: '1',
    title: '프로젝트 킥오프 미팅',
    content: '오늘 새로운 프로젝트 킥오프 미팅을 진행했다. 팀원들과 목표를 공유하고 일정을 논의했다. 다음 주부터 본격적으로 개발을 시작할 예정이다.',
    date: '2025-10-30',
    createdAt: '2025-10-30T09:00:00'
  },
  {
    id: '2',
    title: '알고리즘 스터디',
    content: '오늘은 동적 프로그래밍 문제를 풀었다. 메모이제이션 기법을 활용하면 시간 복잡도를 크게 줄일 수 있다는 것을 배웠다.',
    date: '2025-10-29',
    createdAt: '2025-10-29T20:00:00'
  }
]

const Journal = () => {
  const [journals, setJournals] = useState<JournalEntry[]>(mockJournals)
  const [selectedJournal, setSelectedJournal] = useState<JournalEntry | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const { setLeftContent, setRightContent } = useHeader()

  // Form states
  const [formTitle, setFormTitle] = useState('')
  const [formContent, setFormContent] = useState('')

  // Scroll states
  const [showTopArrow, setShowTopArrow] = useState(false)
  const [showBottomArrow, setShowBottomArrow] = useState(false)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  // TipTap editor
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: '오늘 있었던 일을 기록하세요...',
      }),
      Link.configure({
        openOnClick: false,
      }),
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Highlight.configure({
        multicolor: true,
      }),
      Image.configure({
        inline: true,
        allowBase64: true,
      }),
    ],
    content: formContent,
    editable: isCreating || isEditing,
    onUpdate: ({ editor }) => {
      setFormContent(editor.getHTML())
    },
    editorProps: {
      handlePaste: (_view, event) => {
        const items = event.clipboardData?.items
        if (!items) return false

        // 이미지 파일 찾기
        for (let i = 0; i < items.length; i++) {
          if (items[i].type.indexOf('image') !== -1) {
            event.preventDefault()
            const file = items[i].getAsFile()
            if (file) {
              const reader = new FileReader()
              reader.onload = (e) => {
                const base64 = e.target?.result as string
                editor?.chain().focus().setImage({ src: base64 }).run()
              }
              reader.readAsDataURL(file)
            }
            return true
          }
        }
        return false
      },
    },
  })

  const setLink = () => {
    const previousUrl = editor?.getAttributes('link').href
    const url = window.prompt('링크 URL을 입력하세요:', previousUrl)

    // cancelled
    if (url === null) {
      return
    }

    // empty
    if (url === '') {
      editor?.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }

    // update link
    editor?.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }

  const addImage = () => {
    const url = window.prompt('이미지 URL을 입력하세요:')

    if (url) {
      editor?.chain().focus().setImage({ src: url }).run()
    }
  }

  const addImageFromFile = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (event) => {
          const base64 = event.target?.result as string
          editor?.chain().focus().setImage({ src: base64 }).run()
        }
        reader.readAsDataURL(file)
      }
    }
    input.click()
  }


  const handleCreateNew = () => {
    setFormTitle('')
    setFormContent('')
    setIsCreating(true)
    setIsEditing(false)
    setSelectedJournal(null)
    editor?.commands.setContent('')
    editor?.setEditable(true)
  }

  const handleSaveNew = () => {
    if (!formTitle.trim() || !formContent.trim()) {
      alert('제목과 내용을 입력해주세요.')
      return
    }

    const today = new Date().toISOString().split('T')[0]
    const newJournal: JournalEntry = {
      id: Date.now().toString(),
      title: formTitle,
      content: formContent,
      date: today,
      createdAt: new Date().toISOString()
    }

    setJournals([newJournal, ...journals])
    setSelectedJournal(newJournal)
    setIsCreating(false)
    setIsEditing(false)
    editor?.setEditable(false)
  }

  const handleSelectJournal = (journal: JournalEntry) => {
    setIsCreating(false)
    setIsEditing(false)
    setSelectedJournal(journal)
    setFormTitle(journal.title)
    setFormContent(journal.content)
    editor?.commands.setContent(journal.content)
    editor?.setEditable(false)
  }

  const handleEdit = () => {
    if (!selectedJournal) return
    setIsEditing(true)
    setIsCreating(false)
    editor?.setEditable(true)
  }

  const handleSaveEdit = () => {
    if (!selectedJournal || !formTitle.trim() || !formContent.trim()) {
      alert('제목과 내용을 입력해주세요.')
      return
    }

    const updated: JournalEntry = {
      ...selectedJournal,
      title: formTitle,
      content: formContent
    }

    setJournals(journals.map(j => j.id === updated.id ? updated : j))
    setSelectedJournal(updated)
    setIsEditing(false)
    editor?.setEditable(false)
  }

  const handleDelete = (id: string) => {
    if (!window.confirm('정말로 이 일지를 삭제하시겠습니까?')) return

    setJournals(journals.filter(j => j.id !== id))
    if (selectedJournal?.id === id) {
      setSelectedJournal(null)
      setIsEditing(false)
    }
  }

  const handleCancel = () => {
    if (isCreating) {
      setIsCreating(false)
      setFormTitle('')
      setFormContent('')
      editor?.commands.setContent('')
    } else if (isEditing && selectedJournal) {
      setIsEditing(false)
      setFormTitle(selectedJournal.title)
      setFormContent(selectedJournal.content)
      editor?.commands.setContent(selectedJournal.content)
      editor?.setEditable(false)
    }
  }

  const handleBackToList = () => {
    setIsCreating(false)
    setIsEditing(false)
    setSelectedJournal(null)
    setFormTitle('')
    setFormContent('')
    editor?.commands.setContent('')
    setSelectedDate(null) // 날짜 선택 초기화
  }

  // 일지가 있는 날짜 목록
  const journalDates = useMemo(() => {
    return journals.map(journal => journal.date)
  }, [journals])

  // 날짜 선택 핸들러
  const handleDateSelect = (date: string) => {
    setSelectedDate(date)
  }

  // 전체 일지 보기 (날짜 필터 해제)
  const handleShowAll = () => {
    setSelectedDate(null)
  }

  // 필터링된 일지 목록
  const filteredJournals = journals.filter(journal => {
    // 검색 필터
    const matchesSearch =
      journal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      journal.content.toLowerCase().includes(searchQuery.toLowerCase())

    // 날짜 필터
    const matchesDate = selectedDate ? journal.date === selectedDate : true

    return matchesSearch && matchesDate
  })

  const formatDate = (dateString: string) => {
    const [year, month, day] = dateString.split('-').map(Number)
    const date = new Date(year, month - 1, day)
    return date.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })
  }

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const element = e.currentTarget
    const scrollTop = element.scrollTop
    const scrollHeight = element.scrollHeight
    const clientHeight = element.clientHeight

    setShowTopArrow(scrollTop > 20)
    setShowBottomArrow(scrollTop + clientHeight < scrollHeight - 20)
  }

  const scrollToTop = () => {
    scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const scrollToBottom = () => {
    scrollContainerRef.current?.scrollTo({ top: scrollContainerRef.current.scrollHeight, behavior: 'smooth' })
  }

  useEffect(() => {
    // Check initial scroll state
    const checkScroll = () => {
      if (scrollContainerRef.current) {
        const element = scrollContainerRef.current
        const scrollHeight = element.scrollHeight
        const clientHeight = element.clientHeight
        setShowBottomArrow(scrollHeight > clientHeight)
      }
    }

    // Small delay to ensure content is rendered
    setTimeout(checkScroll, 100)
  }, [formContent, isCreating, isEditing, selectedJournal])

  // 헤더 컨텐츠 설정
  useEffect(() => {
    if (!isCreating && !isEditing && !selectedJournal) {
      // 일지 목록 화면: 좌측에 검색바, 우측에 새 일지 작성 버튼
      setLeftContent(
        <div className="relative flex-1 max-w-md h-full flex items-center">
          <FaSearch className="absolute left-3 text-gray-400" size={16} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="일지 검색..."
            className="w-full h-10 pl-10 pr-4 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      )
      setRightContent(
        <button
          onClick={handleCreateNew}
          className="h-10 px-4 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors whitespace-nowrap"
        >
          <FaPlus size={14} />
          새 일지 작성
        </button>
      )
    } else if (isCreating || isEditing || selectedJournal) {
      // 작성/편집/보기 화면: 좌측에 뒤로가기 버튼 + 제목
      setLeftContent(
        <div className="flex items-center gap-4 flex-1 shrink-0">
          <button
            onClick={handleBackToList}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="목록으로 돌아가기"
          >
            <FaArrowLeft size={20} className="text-gray-600" />
          </button>
          {isCreating || isEditing ? (
            <input
              type="text"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              placeholder="일지 제목을 입력하세요"
              className="flex-1 text-xl font-bold text-gray-800 bg-transparent border-none outline-none focus:outline-none placeholder-gray-400"
            />
          ) : (
            <div className="flex flex-col">
              <h2 className="text-xl font-bold text-gray-800 truncate">
                {formTitle}
              </h2>
              {selectedJournal && (
                <span className="text-sm text-gray-500 mt-1">
                  {formatDate(selectedJournal.date)}
                </span>
              )}
            </div>
          )}
        </div>
      )

      if (isCreating || isEditing) {
        setRightContent(
          <div className="flex items-center gap-2">
            <button
              onClick={isCreating ? handleSaveNew : handleSaveEdit}
              className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
            >
              저장
            </button>
            <button
              onClick={handleCancel}
              className="px-4 py-2 bg-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-300 transition-colors"
            >
              취소
            </button>
          </div>
        )
      } else {
        setRightContent(
          <div className="flex items-center gap-2">
            <button
              onClick={handleEdit}
              className="px-4 py-2 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 flex items-center gap-2 transition-colors"
            >
              <FaEdit size={14} />
              편집
            </button>
            <button
              onClick={() => {
                setSelectedJournal(null)
                setIsCreating(false)
                setIsEditing(false)
              }}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <FaTimes size={18} />
            </button>
          </div>
        )
      }
    }

    // 컴포넌트 언마운트 시 헤더 컨텐츠 제거
    return () => {
      setLeftContent(null)
      setRightContent(null)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCreating, isEditing, selectedJournal, searchQuery, formTitle, setLeftContent, setRightContent])

  return (
    <div className="journal-container h-full bg-gray-50">
      {/* 일지 목록 화면 */}
      {!isCreating && !isEditing && !selectedJournal ? (
        <div className="h-full flex min-h-full">
          {/* 왼쪽: 일지 목록 */}
          <div className="flex-1 flex flex-col min-h-full overflow-hidden">
            <div className="flex-1 overflow-y-auto p-8">
              <div className="max-w-6xl mx-auto">
                {filteredJournals.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full min-h-[400px]">
                    {selectedDate ? (
                      <>
                        <p className="text-gray-500 mb-2">
                          <span className="font-semibold text-gray-700">
                            {(() => {
                              const [year, month, day] = selectedDate.split('-').map(Number)
                              return new Date(year, month - 1, day).toLocaleDateString('ko-KR', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })
                            })()}
                          </span>
                          에 작성된 일지가 없습니다.
                        </p>
                        <button
                          onClick={handleShowAll}
                          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                          전체 일지 보기
                        </button>
                      </>
                    ) : searchQuery ? (
                      <>
                        <p className="text-gray-500 mb-4">
                          '<span className="font-semibold">{searchQuery}</span>' 검색 결과가 없습니다.
                        </p>
                        <button
                          onClick={() => setSearchQuery('')}
                          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                          검색 초기화
                        </button>
                      </>
                    ) : (
                      <>
                        <p className="text-gray-500 mb-4">작성된 일지가 없습니다.</p>
                        <button
                          onClick={handleCreateNew}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors"
                        >
                          <FaPlus size={16} />
                          첫 일지 작성하기
                        </button>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredJournals.map(journal => (
                      <div
                        key={journal.id}
                        onClick={() => handleSelectJournal(journal)}
                        className="bg-white rounded-lg border border-gray-200 p-6 cursor-pointer hover:shadow-lg transition-shadow"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="font-bold text-lg text-gray-900 line-clamp-2 flex-1">
                            {journal.title}
                          </h3>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDelete(journal.id)
                            }}
                            className="text-gray-400 hover:text-red-600 transition-colors ml-2"
                          >
                            <FaTrash size={14} />
                          </button>
                        </div>
                        <p className="text-sm text-gray-500 mb-3">
                          {formatDate(journal.date)}
                        </p>
                        <div
                          className="text-sm text-gray-600 line-clamp-4 prose prose-sm max-w-none"
                          dangerouslySetInnerHTML={{ __html: journal.content }}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 오른쪽: 캘린더 */}
          <div className="w-80 shrink-0 p-6 border-l border-gray-200 bg-white overflow-y-auto">
            <JournalCalendar
              selectedDate={selectedDate}
              onDateSelect={handleDateSelect}
              journalDates={journalDates}
              onShowAll={handleShowAll}
            />
          </div>
        </div>
      ) : (
        /* 작성/편집/보기 화면 */
        <div className="flex-1 flex flex-col overflow-hidden h-full">
        {isCreating || isEditing || selectedJournal ? (
          <div className="flex flex-col h-full">
            {/* 폼 */}
            <div className="flex-1 overflow-hidden bg-gray-50 flex flex-col">
                  {/* 내용 */}
                  <div className="flex-1 flex flex-col min-h-0">
                    {isCreating || isEditing ? (
                      <div className="flex-1 flex flex-col min-h-0">
                        {/* 툴바 */}
                        {editor && (
                          <div className="py-3 flex justify-center shrink-0">
                            <div className="max-w-4xl w-full px-16 flex items-center gap-1 flex-wrap bg-white rounded-t-lg shadow-sm border border-gray-200">
                        {/* 실행 취소/다시 실행 */}
                        <button
                          onClick={() => editor.chain().focus().undo().run()}
                          disabled={!editor.can().undo()}
                          className={`p-2 rounded hover:bg-gray-200 transition-colors disabled:opacity-30 disabled:cursor-not-allowed`}
                          title="실행 취소 (Ctrl+Z)"
                        >
                          <FaUndo size={14} />
                        </button>
                        <button
                          onClick={() => editor.chain().focus().redo().run()}
                          disabled={!editor.can().redo()}
                          className={`p-2 rounded hover:bg-gray-200 transition-colors disabled:opacity-30 disabled:cursor-not-allowed`}
                          title="다시 실행 (Ctrl+Y)"
                        >
                          <FaRedo size={14} />
                        </button>

                        <div className="w-px h-6 bg-gray-300 mx-1"></div>

                        {/* 텍스트 서식 */}
                        <button
                          onClick={() => editor.chain().focus().toggleBold().run()}
                          className={`p-2 rounded hover:bg-gray-200 transition-colors ${
                            editor.isActive('bold') ? 'bg-gray-300' : ''
                          }`}
                          title="볼드 (Ctrl+B)"
                        >
                          <FaBold size={14} />
                        </button>
                        <button
                          onClick={() => editor.chain().focus().toggleItalic().run()}
                          className={`p-2 rounded hover:bg-gray-200 transition-colors ${
                            editor.isActive('italic') ? 'bg-gray-300' : ''
                          }`}
                          title="이탤릭 (Ctrl+I)"
                        >
                          <FaItalic size={14} />
                        </button>
                        <button
                          onClick={() => editor.chain().focus().toggleUnderline().run()}
                          className={`p-2 rounded hover:bg-gray-200 transition-colors ${
                            editor.isActive('underline') ? 'bg-gray-300' : ''
                          }`}
                          title="밑줄 (Ctrl+U)"
                        >
                          <FaUnderline size={14} />
                        </button>
                        <button
                          onClick={() => editor.chain().focus().toggleStrike().run()}
                          className={`p-2 rounded hover:bg-gray-200 transition-colors ${
                            editor.isActive('strike') ? 'bg-gray-300' : ''
                          }`}
                          title="취소선"
                        >
                          <FaStrikethrough size={14} />
                        </button>
                        <button
                          onClick={() => editor.chain().focus().toggleHighlight().run()}
                          className={`p-2 rounded hover:bg-gray-200 transition-colors ${
                            editor.isActive('highlight') ? 'bg-yellow-200' : ''
                          }`}
                          title="형광펜"
                        >
                          <FaHighlighter size={14} />
                        </button>

                        <div className="w-px h-6 bg-gray-300 mx-1"></div>

                        {/* 제목 */}
                        <button
                          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                          className={`px-2 py-1 rounded hover:bg-gray-200 transition-colors text-sm font-semibold ${
                            editor.isActive('heading', { level: 2 }) ? 'bg-gray-300' : ''
                          }`}
                          title="제목"
                        >
                          H2
                        </button>
                        <button
                          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                          className={`px-2 py-1 rounded hover:bg-gray-200 transition-colors text-sm font-semibold ${
                            editor.isActive('heading', { level: 3 }) ? 'bg-gray-300' : ''
                          }`}
                          title="소제목"
                        >
                          H3
                        </button>

                        <div className="w-px h-6 bg-gray-300 mx-1"></div>

                        {/* 정렬 */}
                        <button
                          onClick={() => editor.chain().focus().setTextAlign('left').run()}
                          className={`p-2 rounded hover:bg-gray-200 transition-colors ${
                            editor.isActive({ textAlign: 'left' }) ? 'bg-gray-300' : ''
                          }`}
                          title="왼쪽 정렬"
                        >
                          <FaAlignLeft size={14} />
                        </button>
                        <button
                          onClick={() => editor.chain().focus().setTextAlign('center').run()}
                          className={`p-2 rounded hover:bg-gray-200 transition-colors ${
                            editor.isActive({ textAlign: 'center' }) ? 'bg-gray-300' : ''
                          }`}
                          title="가운데 정렬"
                        >
                          <FaAlignCenter size={14} />
                        </button>
                        <button
                          onClick={() => editor.chain().focus().setTextAlign('right').run()}
                          className={`p-2 rounded hover:bg-gray-200 transition-colors ${
                            editor.isActive({ textAlign: 'right' }) ? 'bg-gray-300' : ''
                          }`}
                          title="오른쪽 정렬"
                        >
                          <FaAlignRight size={14} />
                        </button>
                        <button
                          onClick={() => editor.chain().focus().setTextAlign('justify').run()}
                          className={`p-2 rounded hover:bg-gray-200 transition-colors ${
                            editor.isActive({ textAlign: 'justify' }) ? 'bg-gray-300' : ''
                          }`}
                          title="양쪽 정렬"
                        >
                          <FaAlignJustify size={14} />
                        </button>

                        <div className="w-px h-6 bg-gray-300 mx-1"></div>

                        {/* 목록 */}
                        <button
                          onClick={() => editor.chain().focus().toggleBulletList().run()}
                          className={`p-2 rounded hover:bg-gray-200 transition-colors ${
                            editor.isActive('bulletList') ? 'bg-gray-300' : ''
                          }`}
                          title="글머리 기호 목록"
                        >
                          <FaListUl size={14} />
                        </button>
                        <button
                          onClick={() => editor.chain().focus().toggleOrderedList().run()}
                          className={`p-2 rounded hover:bg-gray-200 transition-colors ${
                            editor.isActive('orderedList') ? 'bg-gray-300' : ''
                          }`}
                          title="번호 매기기 목록"
                        >
                          <FaListOl size={14} />
                        </button>

                        <div className="w-px h-6 bg-gray-300 mx-1"></div>

                        {/* 기타 */}
                        <button
                          onClick={setLink}
                          className={`p-2 rounded hover:bg-gray-200 transition-colors ${
                            editor.isActive('link') ? 'bg-blue-200' : ''
                          }`}
                          title="링크 추가"
                        >
                          <FaLink size={14} />
                        </button>
                        <button
                          onClick={() => editor.chain().focus().toggleBlockquote().run()}
                          className={`p-2 rounded hover:bg-gray-200 transition-colors ${
                            editor.isActive('blockquote') ? 'bg-gray-300' : ''
                          }`}
                          title="인용"
                        >
                          <FaQuoteLeft size={14} />
                        </button>
                        <button
                          onClick={() => editor.chain().focus().setHorizontalRule().run()}
                          className="p-2 rounded hover:bg-gray-200 transition-colors"
                          title="수평선"
                        >
                          <FaMinus size={14} />
                        </button>
                        <button
                          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                          className={`p-2 rounded hover:bg-gray-200 transition-colors ${
                            editor.isActive('codeBlock') ? 'bg-gray-300' : ''
                          }`}
                          title="코드 블록"
                        >
                          <FaCode size={14} />
                        </button>

                        <div className="w-px h-6 bg-gray-300 mx-1"></div>

                        {/* 이미지 */}
                        <button
                          onClick={addImageFromFile}
                          className="p-2 rounded hover:bg-gray-200 transition-colors"
                          title="이미지 업로드"
                        >
                          <FaImage size={14} />
                        </button>
                        <button
                          onClick={addImage}
                          className="p-2 rounded hover:bg-gray-200 transition-colors text-xs font-semibold"
                          title="이미지 URL 입력"
                        >
                          URL
                        </button>
                            </div>
                          </div>
                        )}
                        {/* 에디터 */}
                        <div className="flex-1 flex justify-center py-10 min-h-0">
                          <div className="relative max-w-4xl w-full">
                            <div
                              ref={scrollContainerRef}
                              onScroll={handleScroll}
                              className="h-full overflow-y-auto scrollbar-hide bg-white shadow-sm border-x border-b border-gray-200 rounded-b-lg"
                            >
                              <EditorContent
                                editor={editor}
                                className="prose prose-lg px-16 py-10 focus:outline-none"
                              />
                            </div>
                            {showTopArrow && (
                              <button
                                onClick={scrollToTop}
                                className="journal-scroll-indicator top"
                                aria-label="맨 위로"
                              >
                                <FaChevronUp size={16} />
                              </button>
                            )}
                            {showBottomArrow && (
                              <button
                                onClick={scrollToBottom}
                                className="journal-scroll-indicator bottom"
                                aria-label="맨 아래로"
                              >
                                <FaChevronDown size={16} />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex-1 flex justify-center py-10 min-h-0">
                        <div className="relative max-w-4xl w-full">
                          <div
                            ref={scrollContainerRef}
                            onScroll={handleScroll}
                            className="h-full overflow-y-auto scrollbar-hide bg-white shadow-sm rounded-lg border border-gray-200"
                          >
                            <EditorContent
                              editor={editor}
                              className="prose prose-lg px-16 py-10 focus:outline-none [&_.ProseMirror]:pointer-events-none"
                            />
                          </div>
                          {showTopArrow && (
                            <button
                              onClick={scrollToTop}
                              className="journal-scroll-indicator top"
                              aria-label="맨 위로"
                            >
                              <FaChevronUp size={16} />
                            </button>
                          )}
                          {showBottomArrow && (
                            <button
                              onClick={scrollToBottom}
                              className="journal-scroll-indicator bottom"
                              aria-label="맨 아래로"
                            >
                              <FaChevronDown size={16} />
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
            </div>
          </div>
        ) : null}
        </div>
      )}
    </div>
  )
}

export default Journal
