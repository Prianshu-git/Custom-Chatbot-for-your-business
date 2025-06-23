import { useState, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/api';

export interface ChatMessage {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export function useChat(sessionId: string) {
  const [isTyping, setIsTyping] = useState(false);
  const queryClient = useQueryClient();

  const sendMessageMutation = useMutation({
    mutationFn: async (data: { sessionId: string; role: string; content: string }) => {
      const response = await apiRequest("POST", "/api/chat/message", data);
      return response.json();
    },
    onMutate: () => {
      setIsTyping(true);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/chat/history', sessionId] });
      setIsTyping(false);
    },
    onError: () => {
      setIsTyping(false);
    },
  });

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;

    await sendMessageMutation.mutateAsync({
      sessionId,
      role: "user",
      content,
    });
  }, [sessionId, sendMessageMutation]);

  return {
    sendMessage,
    isTyping,
    isPending: sendMessageMutation.isPending,
  };
}
