"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Send,
  ThumbsUp,
  ThumbsDown,
  Sparkles,
  Brain,
  MessageSquare,
  Pencil,
  Lightbulb,
  Zap,
  ChevronDown,
  ChevronUp,
  Scale,
  Dumbbell,
  Utensils,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { motion, AnimatePresence } from "framer-motion"

// ประเภทข้อมูลสำหรับข้อความในแชท
interface ChatMessage {
  role: "user" | "assistant" | "system"
  content: string
  source?: string
  timestamp?: number
  feedback?: "positive" | "negative"
  id?: string
}

export default function HealthChatbot() {
  // สถานะสำหรับเก็บข้อความในแชท
  const [messages, setMessages] = useState<ChatMessage[]>([])
  // สถานะสำหรับข้อความที่ผู้ใช้กำลังพิมพ์
  const [input, setInput] = useState("")
  // สถานะแสดงว่ากำลังโหลดหรือไม่
  const [isLoading, setIsLoading] = useState(false)
  // สถานะสำหรับการแก้ไขคำตอบ
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState("")
  // อ้างอิงถึงส่วนล่างสุดของแชทเพื่อเลื่อนอัตโนมัติ
  const messagesEndRef = useRef<HTMLDivElement>(null)
  // สถานะสำหรับการแสดงคำถามที่แนะนำ
  const [suggestedQuestions, setSuggestedQuestions] = useState([
    "วิธีลดน้ำหนักที่ดีที่สุดคืออะไร?",
    "ฉันควรออกกำลังกายบ่อยแค่ไหน?",
    "อาหารที่ดีสำหรับการสร้างกล้ามเนื้อคืออะไร?",
    "วิธีเพิ่มแรงจูงใจในการออกกำลังกาย",
  ])
  // สถานะสำหรับการแสดง/ซ่อนคำถามแนะนำในมือถือ
  const [showMobileSuggestions, setShowMobileSuggestions] = useState(false)

  // เลื่อนไปที่ข้อความล่าสุดเมื่อมีข้อความใหม่
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // ฟังก์ชันสำหรับส่งคำถาม
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // ตรวจสอบว่ามีข้อความหรือไม่
    if (!input.trim()) return

    // สร้าง ID ที่ไม่ซ้ำกันสำหรับข้อความ
    const messageId = Date.now().toString()

    // เพิ่มข้อความของผู้ใช้ลงในแชท
    const userMessage: ChatMessage = {
      role: "user",
      content: input,
      timestamp: Date.now(),
      id: messageId,
    }
    setMessages((prev) => [...prev, userMessage])

    // ล้างช่องข้อความ
    setInput("")

    // แสดงสถานะกำลังโหลด
    setIsLoading(true)

    try {
      // ส่งคำขอไปยัง API
      const response = await fetch("/api/health-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
        }),
      })

      // ตรวจสอบการตอบกลับ
      if (!response.ok) {
        throw new Error("การเชื่อมต่อล้มเหลว")
      }

      // แปลงการตอบกลับเป็น JSON
      const data = await response.json()

      // เพิ่มข้อความตอบกลับลงในแชท
      if (data.messages && data.messages.length > 0) {
        const botMessages = data.messages.map((msg: any) => ({
          ...msg,
          timestamp: Date.now(),
          id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
        }))
        setMessages((prev) => [...prev, ...botMessages])

        // อัปเดตคำถามแนะนำถ้ามี
        if (data.suggestedQuestions && data.suggestedQuestions.length > 0) {
          setSuggestedQuestions(data.suggestedQuestions)
        }
      }
    } catch (error) {
      console.error("เกิดข้อผิดพลาด:", error)
      // เพิ่มข้อความแสดงข้อผิดพลาด
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "ขออภัย เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่อีกครั้ง",
          timestamp: Date.now(),
          id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
        },
      ])
    } finally {
      // ปิดสถานะกำลังโหลด
      setIsLoading(false)
    }
  }

  // ฟังก์ชันสำหรับถามคำถามแนะนำ
  const askQuestion = (question: string) => {
    setInput(question)
    setShowMobileSuggestions(false)

    // จำลองการกดปุ่มส่ง
    const fakeEvent = {
      preventDefault: () => {},
    } as React.FormEvent<HTMLFormElement>

    setTimeout(() => {
      handleSubmit(fakeEvent)
    }, 100)
  }

  // ฟังก์ชันสำหรับให้ feedback กับคำตอบ
  const giveFeedback = (messageId: string, feedback: "positive" | "negative") => {
    setMessages((prev) => {
      const newMessages = [...prev]
      const messageIndex = newMessages.findIndex((m) => m.id === messageId)
      if (messageIndex !== -1) {
        newMessages[messageIndex] = {
          ...newMessages[messageIndex],
          feedback,
        }
      }
      return newMessages
    })
  }

  // ฟังก์ชันสำหรับเริ่มแก้ไขคำตอบ
  const startEditing = (messageId: string) => {
    const message = messages.find((m) => m.id === messageId)
    if (message) {
      setEditingMessageId(messageId)
      setEditContent(message.content)
    }
  }

  // ฟังก์ชันสำหรับบันทึกการแก้ไข
  const saveEdit = async (messageId: string) => {
    if (!editContent.trim()) return

    const messageIndex = messages.findIndex((m) => m.id === messageId)
    if (messageIndex === -1) return

    // หาคำถามที่เกี่ยวข้องกับคำตอบนี้
    const previousUserMessageIndex = messages
      .slice(0, messageIndex)
      .map((m, i) => ({ message: m, index: i }))
      .filter((item) => item.message.role === "user")
      .pop()

    if (!previousUserMessageIndex) return

    const originalQuestion = messages[previousUserMessageIndex.index].content
    const teachCommand = `สอน: ${originalQuestion} | ${editContent}`

    // ส่งคำสั่งสอนไปยัง API
    setIsLoading(true)

    try {
      const response = await fetch("/api/health-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [{ role: "user", content: teachCommand }],
        }),
      })

      if (!response.ok) {
        throw new Error("การเชื่อมต่อล้มเหลว")
      }

      const data = await response.json()

      // อัปเดตข้อความที่แก้ไข
      setMessages((prev) => {
        const newMessages = [...prev]
        newMessages[messageIndex] = {
          ...newMessages[messageIndex],
          content: editContent,
          source: "learned",
        }

        // เพิ่มข้อความยืนยันการเรียนรู้
        if (data.messages && data.messages.length > 0) {
          newMessages.push({
            ...data.messages[0],
            timestamp: Date.now(),
            id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
          })
        }

        return newMessages
      })
    } catch (error) {
      console.error("เกิดข้อผิดพลาดในการบันทึกการแก้ไข:", error)
    } finally {
      setIsLoading(false)
      setEditingMessageId(null)
      setEditContent("")
    }
  }

  // ฟังก์ชันสำหรับยกเลิกการแก้ไข
  const cancelEdit = () => {
    setEditingMessageId(null)
    setEditContent("")
  }

  // ฟังก์ชันสำหรับเลือกไอคอนตามแหล่งที่มาของข้อความ
  const getSourceIcon = (source?: string) => {
    switch (source) {
      case "learned":
        return <Sparkles className="h-3 w-3 mr-1" />
      case "contextual":
        return <MessageSquare className="h-3 w-3 mr-1" />
      case "llama":
        return <Brain className="h-3 w-3 mr-1" />
      default:
        return <Zap className="h-3 w-3 mr-1" />
    }
  }

  // ฟังก์ชันสำหรับเลือกสีตามแหล่งที่มาของข้อความ
  const getSourceColor = (source?: string) => {
    switch (source) {
      case "learned":
        return "bg-green-400/10 text-green-400 border-green-400/20"
      case "contextual":
        return "bg-blue-400/10 text-blue-400 border-blue-400/20"
      case "llama":
        return "bg-purple-400/10 text-purple-400 border-purple-400/20"
      default:
        return "bg-yellow-400/10 text-yellow-400 border-yellow-400/20"
    }
  }

  // ฟังก์ชันสำหรับเลือกไอคอนตามคำถามแนะนำ
  const getSuggestionIcon = (question: string) => {
    if (question.includes("ลดน้ำหนัก")) return <Scale className="h-4 w-4 mr-2 text-yellow-400" />
    if (question.includes("ออกกำลังกาย")) return <Dumbbell className="h-4 w-4 mr-2 text-yellow-400" />
    if (question.includes("อาหาร")) return <Utensils className="h-4 w-4 mr-2 text-yellow-400" />
    return <Lightbulb className="h-4 w-4 mr-2 text-yellow-400" />
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <DashboardHeader activePage="chathp" />

      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-5xl mx-auto"
        >
          <Card className="border border-yellow-400/20 shadow-lg shadow-yellow-400/5">
            <CardHeader className="bg-gradient-to-r from-yellow-400/10 to-transparent border-b border-yellow-400/10">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-2xl flex items-center">
                    <motion.div
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      transition={{
                        duration: 0.5,
                        type: "spring",
                        stiffness: 200,
                      }}
                    >
                      <Brain className="h-7 w-7 mr-3 text-yellow-400" />
                    </motion.div>
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-yellow-300">
                      ผู้ช่วยสุขภาพ Hyperweight
                    </span>
                    <Badge variant="outline" className="ml-3 bg-yellow-400/10 text-yellow-400 border-yellow-400/20">
                      AI รุ่นใหม่
                    </Badge>
                  </CardTitle>
                  <CardDescription className="mt-1">
                    ถามคำถามเกี่ยวกับสุขภาพ การออกกำลังกาย หรือโภชนาการ และรับคำแนะนำที่เป็นประโยชน์
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 md:p-6">
              <div className="flex flex-col md:flex-row gap-4">
                {/* ส่วนแสดงข้อความในแชท */}
                <div className="flex-1">
                  <div className="h-[60vh] overflow-y-auto mb-4 p-4 border border-yellow-400/10 rounded-lg bg-gradient-to-b from-yellow-400/5 to-transparent">
                    {messages.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-center">
                        <motion.div
                          className="mb-6"
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.5 }}
                        >
                          <Avatar className="h-20 w-20 mb-6 mx-auto bg-yellow-400/20 ring-4 ring-yellow-400/10 shadow-lg">
                            <AvatarFallback className="text-yellow-400">
                              <Brain className="h-10 w-10" />
                            </AvatarFallback>
                          </Avatar>
                          <h3 className="text-2xl font-medium mb-3 bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-yellow-300">
                            สวัสดี! ฉันคือผู้ช่วยสุขภาพของ Hyperweight
                          </h3>
                          <p className="text-muted-foreground max-w-md mx-auto">
                            ฉันสามารถตอบคำถามเกี่ยวกับสุขภาพ การออกกำลังกาย และโภชนาการได้ และคุณสามารถสอนฉันได้!
                          </p>
                        </motion.div>
                        <motion.div
                          className="grid grid-cols-1 md:grid-cols-2 gap-2 w-full max-w-lg"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.3, duration: 0.5 }}
                        >
                          {suggestedQuestions.map((question, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.3 + index * 0.1, duration: 0.3 }}
                            >
                              <Button
                                variant="outline"
                                className="w-full border-yellow-400/30 hover:bg-yellow-400/10 justify-start h-auto py-3 px-4 group"
                                onClick={() => askQuestion(question)}
                              >
                                {getSuggestionIcon(question)}
                                <span className="text-left">{question}</span>
                              </Button>
                            </motion.div>
                          ))}
                        </motion.div>
                      </div>
                    ) : (
                      <div>
                        {messages.map((message, index) => (
                          <motion.div
                            key={message.id}
                            className="mb-4"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <div className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                              {message.role !== "user" && (
                                <Avatar className="h-8 w-8 mr-2 ring-2 ring-yellow-400/20">
                                  <AvatarFallback className="bg-yellow-400/20 text-yellow-400">
                                    <Brain className="h-4 w-4" />
                                  </AvatarFallback>
                                </Avatar>
                              )}
                              <motion.div
                                initial={{ scale: 0.95 }}
                                animate={{ scale: 1 }}
                                transition={{ duration: 0.2 }}
                                className={`max-w-[80%] rounded-lg px-4 py-3 shadow-md ${
                                  message.role === "user"
                                    ? "bg-gradient-to-r from-yellow-400 to-yellow-500 text-black"
                                    : message.source
                                      ? `bg-gradient-to-br from-background to-background border ${
                                          message.source === "learned"
                                            ? "border-green-400/30"
                                            : message.source === "contextual"
                                              ? "border-blue-400/30"
                                              : message.source === "llama"
                                                ? "border-purple-400/30"
                                                : "border-yellow-400/30"
                                        }`
                                      : "bg-secondary border border-yellow-400/20"
                                }`}
                              >
                                {editingMessageId === message.id ? (
                                  <div className="space-y-2">
                                    <Textarea
                                      value={editContent}
                                      onChange={(e) => setEditContent(e.target.value)}
                                      className="w-full p-2 bg-background border border-yellow-400/30 rounded-md focus-visible:ring-yellow-400"
                                      rows={4}
                                    />
                                    <div className="flex justify-end space-x-2">
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={cancelEdit}
                                        className="h-8 border-yellow-400/30 hover:bg-yellow-400/10"
                                      >
                                        ยกเลิก
                                      </Button>
                                      <Button
                                        size="sm"
                                        onClick={() => saveEdit(message.id!)}
                                        className="h-8 bg-yellow-400 hover:bg-yellow-500 text-black"
                                        disabled={isLoading}
                                      >
                                        {isLoading ? (
                                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-black border-t-transparent" />
                                        ) : (
                                          "บันทึก"
                                        )}
                                      </Button>
                                    </div>
                                  </div>
                                ) : (
                                  <div>
                                    <div className="whitespace-pre-wrap">{message.content}</div>
                                    {message.source && (
                                      <Badge
                                        variant="outline"
                                        className={`ml-2 mt-2 ${getSourceColor(message.source)}`}
                                      >
                                        {getSourceIcon(message.source)}
                                        {message.source === "learned" && "เรียนรู้แล้ว"}
                                        {message.source === "contextual" && "ตามบริบท"}
                                        {message.source === "llama" && "Llama 3.1"}
                                      </Badge>
                                    )}
                                  </div>
                                )}
                              </motion.div>
                              {message.role === "user" && (
                                <Avatar className="h-8 w-8 ml-2 ring-2 ring-yellow-400/20">
                                  <AvatarFallback className="bg-secondary">U</AvatarFallback>
                                </Avatar>
                              )}
                            </div>

                            {/* แสดงปุ่ม feedback และแก้ไขสำหรับข้อความจากผู้ช่วย */}
                            {message.role === "assistant" && !editingMessageId && (
                              <div className="flex justify-start mt-1 space-x-2">
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-6 w-6 hover:bg-yellow-400/10"
                                  onClick={() => giveFeedback(message.id!, "positive")}
                                >
                                  <ThumbsUp
                                    className={`h-4 w-4 transition-all ${
                                      message.feedback === "positive" ? "text-green-500 fill-green-500" : ""
                                    }`}
                                  />
                                </Button>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-6 w-6 hover:bg-yellow-400/10"
                                  onClick={() => giveFeedback(message.id!, "negative")}
                                >
                                  <ThumbsDown
                                    className={`h-4 w-4 transition-all ${
                                      message.feedback === "negative" ? "text-red-500 fill-red-500" : ""
                                    }`}
                                  />
                                </Button>
                                {message.source !== "system" && (
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-6 w-6 hover:bg-yellow-400/10"
                                    onClick={() => startEditing(message.id!)}
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            )}

                            {/* แสดงเวลาของข้อความ */}
                            {message.timestamp && (
                              <div
                                className={`text-xs text-muted-foreground mt-1 ${
                                  message.role === "user" ? "text-right" : "text-left"
                                }`}
                              >
                                {new Date(message.timestamp).toLocaleTimeString()}
                              </div>
                            )}
                          </motion.div>
                        ))}
                        <div ref={messagesEndRef} />
                      </div>
                    )}
                  </div>

                  {/* ฟอร์มสำหรับส่งข้อความ */}
                  <form onSubmit={handleSubmit} className="relative">
                    <Input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="พิมพ์คำถามเกี่ยวกับสุขภาพของคุณ หรือ 'สอน: [คำถาม] | [คำตอบ]' เพื่อสอนผม..."
                      className="pr-12 border-yellow-400/30 focus-visible:ring-yellow-400 shadow-md"
                      disabled={isLoading}
                    />
                    <Button
                      type="submit"
                      size="icon"
                      className="absolute right-1 top-1 h-8 w-8 bg-yellow-400 hover:bg-yellow-500 text-black rounded-md"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-black border-t-transparent" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                      <span className="sr-only">ส่ง</span>
                    </Button>
                  </form>

                  {/* ปุ่มแสดงคำถามแนะนำบนมือถือ */}
                  <div className="md:hidden mt-4">
                    <Button
                      variant="outline"
                      className="w-full border-yellow-400/30 flex items-center justify-center"
                      onClick={() => setShowMobileSuggestions(!showMobileSuggestions)}
                    >
                      <Lightbulb className="h-4 w-4 mr-2 text-yellow-400" />
                      {showMobileSuggestions ? "ซ่อนคำถามแนะนำ" : "แสดงคำถามแนะนำ"}
                      {showMobileSuggestions ? (
                        <ChevronUp className="h-4 w-4 ml-2" />
                      ) : (
                        <ChevronDown className="h-4 w-4 ml-2" />
                      )}
                    </Button>

                    <AnimatePresence>
                      {showMobileSuggestions && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden mt-2"
                        >
                          <div className="space-y-2 p-2 border border-yellow-400/20 rounded-lg bg-yellow-400/5">
                            {suggestedQuestions.map((question, index) => (
                              <Button
                                key={index}
                                variant="outline"
                                size="sm"
                                className="w-full justify-start h-auto py-2 px-3 border-yellow-400/20 hover:bg-yellow-400/10 text-left"
                                onClick={() => askQuestion(question)}
                              >
                                {getSuggestionIcon(question)}
                                {question}
                              </Button>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* ส่วนแสดงคำถามแนะนำ (แสดงเฉพาะบนหน้าจอขนาดใหญ่) */}
                <div className="w-full md:w-64 shrink-0 hidden md:block">
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="border border-yellow-400/20 rounded-lg p-4 bg-gradient-to-b from-yellow-400/5 to-transparent sticky top-20"
                  >
                    <h3 className="text-sm font-medium mb-3 flex items-center">
                      <Sparkles className="h-4 w-4 mr-2 text-yellow-400" />
                      คำถามแนะนำ
                    </h3>
                    <div className="space-y-2">
                      <AnimatePresence initial={false}>
                        {suggestedQuestions.map((question, index) => (
                          <motion.div
                            key={question}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ delay: 0.1 + index * 0.1, duration: 0.3 }}
                          >
                            <Button
                              key={index}
                              variant="outline"
                              size="sm"
                              className="w-full justify-start h-auto py-2 px-3 border-yellow-400/20 hover:bg-yellow-400/10 text-left group"
                              onClick={() => askQuestion(question)}
                            >
                              <span className="flex items-center">
                                {getSuggestionIcon(question)}
                                <span className="group-hover:translate-x-1 transition-transform">{question}</span>
                              </span>
                            </Button>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                </div>
              </div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="text-xs text-muted-foreground mt-6 text-center"
              >
                หมายเหตุ: ผู้ช่วยนี้ให้ข้อมูลทั่วไปเท่านั้น ไม่ใช่คำแนะนำทางการแพทย์ โปรดปรึกษาแพทย์สำหรับปัญหาสุขภาพที่จำเพาะ
              </motion.p>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  )
}
