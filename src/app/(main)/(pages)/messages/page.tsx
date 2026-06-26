'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useAuthContext } from '@/providers/auth-provider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Image from 'next/image'
import { Loader2, Send, ArrowLeft, MessageSquare } from 'lucide-react'
import { createLogger } from '@/lib/logger'
import { toast } from 'sonner'

const log = createLogger('messages')

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return new Date(dateStr).toLocaleDateString()
}

interface MessageUser {
  id: string
  name: string | null
  firstName: string | null
  lastName: string | null
  profileImage: string | null
}

interface Message {
  id: number
  content: string
  jobId: number | null
  readAt: string | null
  createdAt: string
  isOwn: boolean
  sender: MessageUser
  receiver: MessageUser
}

interface Conversation {
  key: string
  jobId: number | null
  otherUser: MessageUser
  lastMessage: Message
  unreadCount: number
}

function groupConversations(messages: Message[], currentUserId: string): Conversation[] {
  const groups: Record<string, Message[]> = {}

  for (const msg of messages) {
    const otherParty = msg.isOwn ? msg.receiver : msg.sender
    const key = `${msg.jobId || 'general'}-${otherParty.id}`
    if (!groups[key]) groups[key] = []
    groups[key].push(msg)
  }

  return Object.entries(groups).map(([key, msgs]) => {
    const sorted = msgs.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    const lastMsg = sorted[sorted.length - 1]
    const otherUser = lastMsg.isOwn ? lastMsg.receiver : lastMsg.sender
    const unreadCount = sorted.filter(m => !m.isOwn && !m.readAt).length

    return {
      key,
      jobId: lastMsg.jobId,
      otherUser,
      lastMessage: lastMsg,
      unreadCount,
    }
  }).sort((a, b) => new Date(b.lastMessage.createdAt).getTime() - new Date(a.lastMessage.createdAt).getTime())
}

export default function MessagesPage() {
  const { user } = useAuthContext()
  const [messages, setMessages] = useState<Message[]>([])
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeConversation, setActiveConversation] = useState<string | null>(null)
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(true)
  const [showMobileList, setShowMobileList] = useState(true)
  const chatEndRef = useRef<HTMLDivElement>(null)

  const currentUserId = user?.id

  const fetchMessages = useCallback(async () => {
    try {
      const res = await fetch('/api/messages')
      if (res.ok) {
        const data = await res.json()
        setMessages(data)
      }
    } catch (err) {
      log.error('Failed to fetch messages', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchMessages()
    const interval = setInterval(fetchMessages, 10000)
    return () => clearInterval(interval)
  }, [fetchMessages])

  useEffect(() => {
    if (!currentUserId) return
    setConversations(groupConversations(messages, currentUserId))
  }, [messages, currentUserId])

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [activeConversation, messages])

  const activeMessages = activeConversation
    ? messages.filter(m => {
        const otherParty = m.isOwn ? m.receiver : m.sender
        const key = `${m.jobId || 'general'}-${otherParty.id}`
        return key === activeConversation
      })
    : []

  const activeConv = conversations.find(c => c.key === activeConversation)

  const handleSend = async () => {
    if (!newMessage.trim() || !activeConv || sending) return

    const content = newMessage.trim()
    const optimisticMsg: Message = {
      id: Date.now(),
      content,
      jobId: activeConv.jobId,
      readAt: null,
      createdAt: new Date().toISOString(),
      isOwn: true,
      sender: { id: currentUserId || '', name: 'You', firstName: null, lastName: null, profileImage: null },
      receiver: activeConv.otherUser,
    }

    setMessages(prev => [...prev, optimisticMsg])
    setNewMessage('')
    setSending(true)

    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          receiverId: activeConv.otherUser.id,
          content,
          jobId: activeConv.jobId,
        }),
      })

      if (!res.ok) {
        setMessages(prev => prev.filter(m => m.id !== optimisticMsg.id))
        toast.error('Failed to send message')
      }
    } catch (err) {
      setMessages(prev => prev.filter(m => m.id !== optimisticMsg.id))
      log.error('Failed to send message', err)
      toast.error('Failed to send message. Please try again.')
    } finally {
      setSending(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const openConversation = (key: string) => {
    setActiveConversation(key)
    setShowMobileList(false)
    setTimeout(() => {
      const unread = messages.filter(m => {
        const otherParty = m.isOwn ? m.receiver : m.sender
        const msgKey = `${m.jobId || 'general'}-${otherParty.id}`
        return msgKey === key && !m.isOwn && !m.readAt
      })
      unread.forEach(msg => {
        fetch(`/api/messages/${msg.id}/read`, { method: 'POST' }).catch(() => {})
      })
    }, 500)
  }

  return (
    <div className="flex h-full bg-background">
      <div className={`w-full md:w-80 lg:w-96 border-r border flex flex-col ${!showMobileList ? 'hidden md:flex' : ''}`}>
        <div className="p-4 border-b border">
          <h2 className="text-lg font-semibold text-foreground">Messages</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          ) : conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <div className="relative w-32 h-32 mb-2">
                <Image
                  src="/images/No%20Messages.png"
                  alt="No messages yet"
                  fill
                  className="object-contain opacity-50"
                />
              </div>
              <p className="text-sm">No conversations yet</p>
              <p className="text-xs mt-1">Messages appear when an employer moves you to Interview stage</p>
            </div>
          ) : (
            conversations.map(conv => (
              <button
                key={conv.key}
                onClick={() => openConversation(conv.key)}
                className={`w-full text-left p-4 hover:bg-muted/50 transition-colors border-b border/50 ${
                  activeConversation === conv.key ? 'bg-muted/30' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground truncate">
                    {conv.otherUser.firstName || conv.otherUser.name || 'Unknown'}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {timeAgo(conv.lastMessage.createdAt)}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-muted-foreground truncate">
                    {conv.lastMessage.content}
                  </span>
                  {conv.unreadCount > 0 && (
                    <span className="ml-2 w-5 h-5 bg-emerald-500 text-white text-xs rounded-full flex items-center justify-center flex-shrink-0">
                      {conv.unreadCount}
                    </span>
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      <div className={`flex-1 flex flex-col ${showMobileList ? 'hidden md:flex' : ''}`}>
        {activeConversation && activeConv ? (
          <>
            <div className="p-4 border-b border flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setShowMobileList(true)}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 text-sm font-medium">
                {(activeConv.otherUser.firstName || activeConv.otherUser.name || '?')[0]}
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  {activeConv.otherUser.firstName || activeConv.otherUser.name || 'Unknown'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {activeConv.jobId ? `Regarding Job #${activeConv.jobId}` : 'General'}
                </p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {activeMessages.map(msg => (
                <div key={msg.id} className={`flex ${msg.isOwn ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                      msg.isOwn
                        ? 'bg-emerald-500 text-white rounded-br-sm'
                        : 'bg-muted text-foreground/60 rounded-bl-sm'
                    }`}
                  >
                    <p className="text-sm">{msg.content}</p>
                    <p className={`text-xs mt-1 ${msg.isOwn ? 'text-emerald-200' : 'text-muted-foreground'}`}>
                      {timeAgo(msg.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            <div className="p-4 border-t border">
              <div className="flex gap-2">
                <Input
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type a message..."
                  className="bg-muted border text-foreground"
                />
                <Button
                  onClick={handleSend}
                  disabled={!newMessage.trim() || sending}
                  size="icon"
                  className="bg-emerald-500 hover:bg-emerald-600"
                >
                  {sending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <div className="relative w-40 h-40 mx-auto mb-3">
                <Image
                  src="/images/No%20Messages.png"
                  alt="No messages"
                  fill
                  className="object-contain opacity-30"
                />
              </div>
              <p className="text-sm">Select a conversation to start chatting</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
