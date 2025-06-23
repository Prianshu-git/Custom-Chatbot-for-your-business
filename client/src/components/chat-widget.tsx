import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageCircle, X, Send, Bot, User, Loader2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useChat } from "@/hooks/use-chat";
import ReactMarkdown from "react-markdown";

interface ChatWidgetProps {
  sessionId: string;
}

interface ChatMessage {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function ChatWidget({ sessionId }: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['/api/chat/history', sessionId],
    queryFn: () => apiRequest("GET", `/api/chat/history/${sessionId}`).then(res => res.json()),
    enabled: isOpen && !!sessionId,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (data: { sessionId: string; role: string; content: string }) => {
      const response = await apiRequest("POST", "/api/chat/message", data);
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/chat/history', sessionId] });
      setIsTyping(false);
    },
    onError: (error) => {
      setIsTyping(false);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    const userMessage = message;
    setMessage("");
    setIsTyping(true);

    await sendMessageMutation.mutateAsync({
      sessionId,
      role: "user",
      content: userMessage,
    });
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const TypingIndicator = () => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex items-start space-x-2"
    >
      <div className="w-6 h-6 bg-gradient-to-r from-primary-blue to-bright-blue rounded-full flex items-center justify-center flex-shrink-0">
        <Bot className="text-black" size={12} />
      </div>
      <div className="bg-white rounded-lg p-3 shadow-sm">
        <div className="typing-indicator">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              id="chat-widget"
              onClick={() => setIsOpen(true)}
              className="w-14 h-14 bg-gradient-to-r from-primary-blue to-bright-blue rounded-full shadow-lg hover:shadow-xl transition-all duration-300 animate-pulse-glow"
            >
              <MessageCircle className="text-black" size={24} />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-0 right-0 w-80 h-96 glass rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Chat Header */}
            <div className="bg-gradient-to-r from-primary-blue to-bright-blue p-4 text-blue-500">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    <Bot size={16} />
                  </div>
                  <div>
                    <h4 className="font-semibold">Business Chatbot</h4>
                    <p className="text-xs opacity-80">Online • Powered by AI</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="hover:bg-white/20 text-white p-1 rounded"
                >
                  <X size={16} />
                </Button>
              </div>
            </div>
            
            {/* Chat Messages */}
            <div className="h-64 overflow-y-auto p-4 space-y-3 bg-white/50 custom-scrollbar">
              {/* Welcome message */}
              <div className="flex items-start space-x-2">
                <div className="w-6 h-6 bg-gradient-to-r from-primary-blue to-bright-blue rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="text-white" size={12} />
                </div>
                <div className="bg-white rounded-lg p-3 shadow-sm max-w-64">
                  <p className="text-sm text-slate-700">Hello! I'm your business assistant. I can help answer questions about your products, services, and policies. What would you like to know?</p>
                </div>
              </div>

              {/* Chat Messages */}
              {messages.map((msg: ChatMessage) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex items-start space-x-2 ${msg.role === 'user' ? 'justify-end' : ''}`}
                >
                  {msg.role === 'user' ? (
                    <>
                      <div className="bg-gradient-to-r from-primary-blue to-bright-blue text-black rounded-lg p-3 shadow-sm max-w-64">
                        <p className="text-sm">{msg.content}</p>
                      </div>
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="text-primary-blue" size={12} />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-6 h-6 bg-gradient-to-r from-primary-blue to-bright-blue rounded-full flex items-center justify-center flex-shrink-0">
                        <Bot className="text-white" size={12} />
                      </div>
                      <div className="bg-white rounded-lg p-3 shadow-sm max-w-64">
                        <ReactMarkdown
                          components={{
                            strong: ({node, ...props}) => <strong className="font-semibold text-slate-900" {...props} />,
                            ul: ({node, ...props}) => <ul className="list-disc pl-5 my-2" {...props} />,
                            li: ({node, ...props}) => <li className="mb-1" {...props} />,
                            p: ({node, ...props}) => <p className="prose prose-sm text-slate-700" {...props} />,
                          }}
                        >
                          {msg.content}
                        </ReactMarkdown>
                      </div>
                    </>
                  )}
                </motion.div>
              ))}

              {/* Typing Indicator */}
              <AnimatePresence>
                {isTyping && <TypingIndicator />}
              </AnimatePresence>

              <div ref={messagesEndRef} />
            </div>
            
            {/* Chat Input */}
            <div className="p-4 bg-white border-t border-black/10">
              <div className="flex items-center space-x-2">
                <Input
                  type="text"
                  placeholder="Type your question..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  disabled={sendMessageMutation.isPending}
                  className="flex-1 text-sm"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!message.trim() || sendMessageMutation.isPending}
                  className="bg-gradient-to-r from-primary-blue to-bright-blue hover:shadow-lg transition-all duration-300"
                  size="sm"
                >
                  {sendMessageMutation.isPending ? (
                    <Loader2 className="animate-spin" size={16} />
                  ) : (
                    <Send size={16} />
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
