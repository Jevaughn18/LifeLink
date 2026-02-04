"use client";

import { useState, useRef, useEffect } from "react";
import { Send, X, Bot, Loader2, Sparkles } from "lucide-react";
import { DoctorSelectionCards } from "./chat/DoctorSelectionCards";
import { DateSelectionGrid } from "./chat/DateSelectionGrid";
import { TimeSlotGrid } from "./chat/TimeSlotGrid";
import { AppointmentConfirmation } from "./chat/AppointmentConfirmation";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  actionData?: {
    type: "doctor_selection" | "date_selection" | "time_slots" | "booking_confirmation";
    data: any;
  };
}

interface HealthBotChatProps {
  userId: string;
  patientName: string;
  onClose: () => void;
}

export function HealthBotChat({ userId, patientName, onClose }: HealthBotChatProps) {
  const firstName = patientName.split(" ")[0];

  // Load messages from localStorage or use welcome message
  const [messages, setMessages] = useState<Message[]>(() => {
    if (typeof window !== 'undefined') {
      const CHAT_VERSION = 'v2'; // Increment this to clear old chats
      const savedMessages = localStorage.getItem(`chat_messages_${userId}_${CHAT_VERSION}`);
      if (savedMessages) {
        try {
          const parsed = JSON.parse(savedMessages);
          // Convert timestamp strings back to Date objects
          return parsed.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }));
        } catch (e) {
          console.error('Failed to parse saved messages:', e);
        }
      }
      // Clear old version chats
      localStorage.removeItem(`chat_messages_${userId}`);
      localStorage.removeItem(`chat_messages_${userId}_v1`);
    }

    return [
      {
        id: "welcome",
        role: "assistant",
        content: `Hello ${firstName}! 👋 I'm Lia, your Health & Benefits Assistant.

I can help you with:
• Questions about symptoms and health conditions
• Preparing for upcoming appointments
• General health and wellness advice
• Understanding medical terms and procedures

What would you like to know today?`,
        timestamp: new Date(),
      },
    ];
  });
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Smart scroll: only auto-scroll for user messages or assistant text-only messages
  // For interactive components, let user manually scroll to see them
  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];

      // Auto-scroll for user messages (they want to see bot response)
      if (lastMessage.role === "user") {
        scrollToBottom();
      }
      // Don't auto-scroll for assistant messages with interactive components
      // This lets users see the beginning of the component instead of jumping to bottom
      else if (lastMessage.role === "assistant" && !lastMessage.actionData) {
        scrollToBottom();
      }
    }
  }, [messages]);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const CHAT_VERSION = 'v2';
      localStorage.setItem(`chat_messages_${userId}_${CHAT_VERSION}`, JSON.stringify(messages));
    }
  }, [messages, userId]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/health-bot/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: input.trim(),
          userId,
          conversationHistory: messages
            .filter((m) => m.id !== "welcome")
            .map((m) => ({
              role: m.role,
              content: m.content,
            })),
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Determine if we need to add interactive components
        let actionData = undefined;

        // Debug logging
        console.log('API Response:', {
          functionCalled: data.functionCalled,
          functionResult: data.functionResult,
          hasSlots: data.functionResult?.slots !== undefined,
          slotsLength: data.functionResult?.slots?.length
        });

        if (data.functionCalled === 'check_doctor_availability' && data.functionResult?.available_doctors) {
          actionData = {
            type: "doctor_selection" as const,
            data: data.functionResult.available_doctors,
          };
        } else if (data.functionCalled === 'get_available_dates' && data.functionResult?.dates) {
          actionData = {
            type: "date_selection" as const,
            data: data.functionResult,
          };
        } else if (data.functionCalled === 'get_available_slots' && data.functionResult?.slots !== undefined) {
          // Check for slots array existence, not truthiness (empty array [] is valid)
          actionData = {
            type: "time_slots" as const,
            data: data.functionResult,
          };
        } else if (data.functionCalled === 'book_appointment' && data.functionResult?.success) {
          actionData = {
            type: "booking_confirmation" as const,
            data: data.functionResult.appointment,
          };
        }

        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: data.response,
          timestamp: new Date(),
          actionData,
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        throw new Error(data.error || "Failed to get response");
      }
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I'm sorry, I encountered an error. Please try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickQuestions = [
    "I want to book an appointment",
    "What should I bring to my appointment?",
    "How do I prepare for blood work?",
  ];

  const handleQuickQuestion = (question: string) => {
    setInput(question);
    textareaRef.current?.focus();
  };

  // Handler for doctor selection
  const handleSelectDoctor = (doctorName: string) => {
    setInput(`I'd like to book an appointment with Dr. ${doctorName}`);
    textareaRef.current?.focus();
  };

  // Handler for date selection
  const handleSelectDate = (date: string) => {
    const formattedDate = new Date(date + 'T00:00:00').toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
    setInput(`I'd like to book for ${formattedDate}`);
    textareaRef.current?.focus();
  };

  // Handler for time slot selection
  const handleSelectSlot = (time: string, formatted: string) => {
    setInput(`Book me for ${formatted}`);
    textareaRef.current?.focus();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="flex h-[95vh] max-h-[900px] w-full max-w-4xl flex-col rounded-3xl bg-white shadow-2xl animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="relative flex items-center justify-between border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-t-3xl">
          <div className="flex items-center gap-4">
            <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 shadow-lg shadow-blue-500/30">
              <Bot className="h-7 w-7 text-white" />
              <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-green-400 border-2 border-white animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                Lia
                <Sparkles className="h-4 w-4 text-blue-500" />
              </h2>
              <p className="text-sm text-gray-600">Health & Benefits Assistant</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-gray-400 transition-all hover:bg-white/80 hover:text-gray-600 hover:rotate-90 duration-300"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gradient-to-b from-gray-50/50 to-white">
          {messages.map((message, index) => (
            <div
              key={message.id}
              className={`flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              } animate-in slide-in-from-bottom-4 duration-500`}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {message.role === "assistant" && (
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 mr-3 mt-1 flex-shrink-0 shadow-md">
                  <Bot className="h-5 w-5 text-white" />
                </div>
              )}
              <div
                className={`${message.role === "user" ? "max-w-[75%]" : "max-w-[90%]"} rounded-2xl px-5 py-3.5 shadow-sm ${
                  message.role === "user"
                    ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-blue-500/20"
                    : "bg-white text-gray-800 border border-gray-100 shadow-gray-200/50"
                }`}
              >
                <p className="whitespace-pre-wrap text-[15px] leading-relaxed">
                  {message.content}
                </p>

                {/* Render interactive components for assistant messages */}
                {message.role === "assistant" && message.actionData && (
                  <>
                    {message.actionData.type === "doctor_selection" && (
                      <DoctorSelectionCards
                        availableDoctors={message.actionData.data}
                        onSelectDoctor={handleSelectDoctor}
                      />
                    )}
                    {message.actionData.type === "date_selection" && (
                      <DateSelectionGrid
                        dates={message.actionData.data.dates}
                        doctor={message.actionData.data.doctor}
                        onSelectDate={handleSelectDate}
                      />
                    )}
                    {message.actionData.type === "time_slots" && (
                      <TimeSlotGrid
                        slots={message.actionData.data.slots}
                        doctor={message.actionData.data.doctor}
                        date={message.actionData.data.date}
                        onSelectSlot={handleSelectSlot}
                      />
                    )}
                    {message.actionData.type === "booking_confirmation" && (
                      <AppointmentConfirmation
                        appointment={message.actionData.data}
                      />
                    )}
                  </>
                )}

                <p
                  className={`mt-2 text-xs ${
                    message.role === "user"
                      ? "text-blue-100"
                      : "text-gray-400"
                  }`}
                >
                  {message.timestamp.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start animate-in fade-in duration-300">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 mr-3 mt-1 shadow-md">
                <Bot className="h-5 w-5 text-white" />
              </div>
              <div className="rounded-2xl bg-white border border-gray-100 px-5 py-4 shadow-sm">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="h-2 w-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="h-2 w-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}
          
          {/* Quick Questions - Show only when conversation is short */}
          {messages.length <= 1 && !isLoading && (
            <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
              <p className="text-sm font-medium text-gray-500 px-1">Quick questions:</p>
              <div className="flex flex-col gap-2">
                {quickQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickQuestion(question)}
                    className="text-left text-sm px-4 py-3 rounded-xl bg-white border border-gray-200 text-gray-700 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 hover:shadow-sm"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-gray-100 bg-white p-5 rounded-b-3xl">
          <div className="flex items-end gap-3">
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything about your health..."
                className="w-full resize-none rounded-2xl border-2 border-gray-200 px-4 py-3.5 text-[15px] outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10 transition-all duration-200"
                rows={1}
                disabled={isLoading}
                style={{ maxHeight: "120px" }}
              />
            </div>
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 text-white transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/30 hover:scale-105 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </button>
          </div>
          <div className="mt-3 flex items-start gap-2 px-1">
            <div className="h-4 w-4 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
              <div className="h-1.5 w-1.5 rounded-full bg-blue-600" />
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">
              This AI assistant provides general health information. Always consult your doctor for medical advice and treatment decisions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}