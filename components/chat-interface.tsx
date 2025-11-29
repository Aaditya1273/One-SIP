"use client"

import { useState, useRef, useEffect } from "react"
import { useCurrentAccount } from "@mysten/dapp-kit"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card } from "@/components/ui/card"
import { Send, Bot, User, Zap, TrendingUp, Lock, Wallet, HelpCircle, Sparkles, MessageSquare, Copy, ThumbsUp, ThumbsDown } from "lucide-react"
import { useAccount } from "@/lib/onechain-wallet"

interface Message {
  id: string
  type: "user" | "bot"
  content: string
  timestamp: Date
  command?: string
  data?: any
}

interface ChatInterfaceProps {
  isOpen: boolean
  onClose: () => void
}

export function ChatInterface({ isOpen, onClose }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [mounted, setMounted] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const currentAccount = useCurrentAccount()

  // Initialize welcome message on client side only
  useEffect(() => {
    setMounted(true)
    setMessages([{
      id: "welcome",
      type: "bot",
      content: "👋 Hello! I'm your Sphira AI Assistant, powered by advanced blockchain intelligence.\n\nI can help you with:\n• Creating and managing SIPs\n• Portfolio optimization\n• Yield farming strategies\n• Emergency fund management\n• Real-time market insights\n\nTry asking me something like \"How do I create a SIP?\" or use commands like `/portfolio` to get started!",
      timestamp: new Date(),
    }])
  }, [])

  const quickCommands = [
    { command: "/portfolio", label: "Portfolio", icon: TrendingUp },
    { command: "/balance", label: "Balance", icon: Wallet },
    { command: "/yield", label: "Yield", icon: Zap },
    { command: "/help", label: "Help", icon: HelpCircle },
  ]

  const suggestions = [
    "How do I create a SIP?",
    "What's my portfolio performance?",
    "Show me the best yield opportunities",
    "How does the emergency vault work?",
    "What tokens can I invest in?",
    "Explain yield optimization",
  ]

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages, isTyping])

  const handleSendMessage = async () => {
    if (!input.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    const currentInput = input
    setInput("")
    setIsTyping(true)

    try {
      // Call the real API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: currentInput,
          userId: currentAccount?.address || 'anonymous'
        })
      })

      const data = await response.json()
      
      if (data.success) {
        // Simulate typing delay for better UX
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        const botResponse: Message = {
          id: Date.now().toString(),
          type: "bot",
          content: data.data.response,
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, botResponse])
      } else {
        throw new Error('API call failed')
      }
    } catch (error) {
      console.error('Chat API error:', error)
      const errorResponse: Message = {
        id: Date.now().toString(),
        type: "bot",
        content: "I'm having trouble connecting right now. Please check your connection and try again! 🔄",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorResponse])
    } finally {
      setIsTyping(false)
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion)
  }

  const handleQuickCommand = (command: string) => {
    setInput(command)
    handleSendMessage()
  }

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content)
  }

  const formatMessage = (content: string) => {
    // Simple formatting for better readability
    return content
      .replace(/\n/g, '<br>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code class="bg-muted px-1 rounded">$1</code>')
  }

  return (
    <div className="flex flex-col h-full bg-white overflow-hidden">
      {/* Minimal Header */}
      <div className="flex-shrink-0 flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <h2 className="text-sm font-semibold text-gray-900">Sphira AI</h2>
        </div>
        <Badge className="bg-green-50 text-green-700 border-green-200 text-xs">
          <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1 animate-pulse"></div>
          Online
        </Badge>
      </div>

      {/* Messages Area - ChatGPT Style */}
      <div className="flex-1 overflow-y-auto" ref={scrollAreaRef}>
        <div className="max-w-3xl mx-auto px-4 py-4">
          {messages.map((message) => (
            <div key={message.id} className={`group mb-6 ${message.type === "user" ? "ml-auto" : ""}`}>
              <div className="flex gap-4 items-start">
                {/* Avatar */}
                {message.type === "bot" && (
                  <div className="w-7 h-7 rounded-sm bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="h-4 w-4 text-white" />
                  </div>
                )}
                
                {/* Message Content */}
                <div className="flex-1 space-y-2">
                  <div 
                    className="text-[15px] leading-7 text-gray-800"
                    dangerouslySetInnerHTML={{ __html: formatMessage(message.content) }}
                  />
                  
                  {/* Actions - Show on hover for bot messages */}
                  {message.type === "bot" && (
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-7 w-7 p-0 hover:bg-gray-100 rounded-md" 
                        onClick={() => copyMessage(message.content)}
                      >
                        <Copy className="h-3.5 w-3.5 text-gray-500" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0 hover:bg-gray-100 rounded-md">
                        <ThumbsUp className="h-3.5 w-3.5 text-gray-500" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0 hover:bg-gray-100 rounded-md">
                        <ThumbsDown className="h-3.5 w-3.5 text-gray-500" />
                      </Button>
                    </div>
                  )}
                </div>
                
                {message.type === "user" && (
                  <div className="w-7 h-7 rounded-sm bg-blue-500 flex items-center justify-center flex-shrink-0">
                    <User className="h-4 w-4 text-white" />
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="mb-6">
              <div className="flex gap-4 items-start">
                <div className="w-7 h-7 rounded-sm bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <div className="flex items-center gap-1 py-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Input Area - ChatGPT Style */}
      <div className="flex-shrink-0 border-t border-gray-200 bg-white">
        {/* Suggestions (show when no messages from user) */}
        {messages.length === 1 && (
          <div className="px-4 pt-3 pb-2">
            <div className="max-w-3xl mx-auto grid grid-cols-2 gap-2">
              {suggestions.slice(0, 4).map((suggestion, index) => (
                <button
                  key={index}
                  className="text-left px-3 py-2 text-sm text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Box */}
        <div className="px-4 pt-3 pb-2">
          <div className="max-w-3xl mx-auto">
            {/* Quick Actions - Above input */}
            <div className="flex items-center justify-center gap-2 mb-2">
              {quickCommands.map((cmd) => (
                <Button
                  key={cmd.command}
                  variant="ghost"
                  size="sm"
                  className="h-7 px-3 text-xs text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full"
                  onClick={() => handleQuickCommand(cmd.command)}
                >
                  <cmd.icon className="h-3.5 w-3.5 mr-1.5" />
                  {cmd.label}
                </Button>
              ))}
            </div>
            
            <div className="relative flex items-center bg-white border border-gray-300 rounded-3xl shadow-sm hover:shadow-md transition-shadow min-h-[52px]">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Message Sphira AI..."
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    handleSendMessage()
                  }
                }}
                className="flex-1 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent px-6 py-4 text-[15px] placeholder:text-gray-400 min-h-[52px]"
                disabled={isTyping}
              />
              <Button
                onClick={handleSendMessage}
                size="sm"
                disabled={!input.trim() || isTyping}
                className="mr-3 h-9 w-9 p-0 rounded-full bg-black hover:bg-gray-800 disabled:bg-gray-200 disabled:opacity-100"
              >
                <Send className="h-4 w-4 text-white" />
              </Button>
            </div>
            
            <p className="text-[10px] text-gray-400 text-center mt-1.5 mb-0">
              Sphira AI can make mistakes. Verify important information.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

