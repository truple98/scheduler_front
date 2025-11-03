import { createContext, useContext, useState, ReactNode } from 'react'

type HeaderContextType = {
  leftContent: ReactNode | null
  setLeftContent: (content: ReactNode | null) => void
  rightContent: ReactNode | null
  setRightContent: (content: ReactNode | null) => void
}

const HeaderContext = createContext<HeaderContextType | undefined>(undefined)

export const HeaderProvider = ({ children }: { children: ReactNode }) => {
  const [leftContent, setLeftContent] = useState<ReactNode | null>(null)
  const [rightContent, setRightContent] = useState<ReactNode | null>(null)

  return (
    <HeaderContext.Provider value={{ leftContent, setLeftContent, rightContent, setRightContent }}>
      {children}
    </HeaderContext.Provider>
  )
}

export const useHeader = () => {
  const context = useContext(HeaderContext)
  if (!context) {
    throw new Error('useHeader must be used within HeaderProvider')
  }
  return context
}
