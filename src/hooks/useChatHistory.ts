/**
 * @author Shiva Nagendra Babu Kore
 */

import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export interface ChatConversation {
  id: string;
  title: string | null;
  created_at: Date;
  updated_at: Date;
  messages: ChatMessage[];
}

export const useChatHistory = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<
    string | null
  >(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load all conversations for the user
  const loadConversations = useCallback(async () => {
    if (!user || !supabase) return;

    try {
      setLoading(true);
      setError(null);

      const { data: conversationsData, error: conversationsError } =
        await supabase
          .from("chat_conversations")
          .select(
            `
          id,
          title,
          created_at,
          updated_at,
          chat_messages (
            id,
            role,
            content,
            created_at
          )
        `
          )
          .eq("user_id", user.id)
          .order("updated_at", { ascending: false });

      if (conversationsError) throw conversationsError;

      const formattedConversations: ChatConversation[] = (
        conversationsData || []
      ).map((conv) => ({
        id: conv.id,
        title: conv.title,
        created_at: new Date(conv.created_at),
        updated_at: new Date(conv.updated_at),
        messages: (conv.chat_messages || [])
          .sort(
            (a, b) =>
              new Date(a.created_at).getTime() -
              new Date(b.created_at).getTime()
          )
          .map((msg) => ({
            id: msg.id,
            role: msg.role as "user" | "assistant",
            content: msg.content,
            timestamp: new Date(msg.created_at),
          })),
      }));

      setConversations(formattedConversations);
    } catch (err) {
      console.error("Error loading conversations:", err);
      setError("Failed to load chat history");
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Create a new conversation
  const createConversation = useCallback(
    async (title?: string): Promise<string | null> => {
      if (!user || !supabase) return null;

      try {
        const { data, error } = await supabase
          .from("chat_conversations")
          .insert({
            user_id: user.id,
            title: title || null,
          })
          .select()
          .single();

        if (error) throw error;

        const newConversation: ChatConversation = {
          id: data.id,
          title: data.title,
          created_at: new Date(data.created_at),
          updated_at: new Date(data.updated_at),
          messages: [],
        };

        setConversations((prev) => [newConversation, ...prev]);
        setCurrentConversationId(data.id);

        return data.id;
      } catch (err) {
        console.error("Error creating conversation:", err);
        setError("Failed to create new conversation");
        return null;
      }
    },
    [user]
  );

  // Save a message to the current conversation
  const saveMessage = useCallback(
    async (
      message: Omit<ChatMessage, "id" | "timestamp">,
      conversationId?: string
    ) => {
      if (!user || !supabase) return;

      const targetConversationId = conversationId || currentConversationId;
      if (!targetConversationId) {
        console.error("No conversation ID provided");
        return;
      }

      try {
        const { data, error } = await supabase
          .from("chat_messages")
          .insert({
            conversation_id: targetConversationId,
            user_id: user.id,
            role: message.role,
            content: message.content,
          })
          .select()
          .single();

        if (error) throw error;

        const newMessage: ChatMessage = {
          id: data.id,
          role: data.role,
          content: data.content,
          timestamp: new Date(data.created_at),
        };

        // Update local state
        setConversations((prev) =>
          prev.map((conv) => {
            if (conv.id === targetConversationId) {
              return {
                ...conv,
                messages: [...conv.messages, newMessage],
                updated_at: new Date(),
              };
            }
            return conv;
          })
        );

        return newMessage;
      } catch (err) {
        console.error("Error saving message:", err);
        setError("Failed to save message");
      }
    },
    [user, currentConversationId]
  );

  // Load messages for a specific conversation
  const loadConversation = useCallback(
    async (conversationId: string) => {
      if (!user || !supabase) return;

      try {
        const { data, error } = await supabase
          .from("chat_messages")
          .select("*")
          .eq("conversation_id", conversationId)
          .eq("user_id", user.id)
          .order("created_at", { ascending: true });

        if (error) throw error;

        const messages: ChatMessage[] = (data || []).map((msg) => ({
          id: msg.id,
          role: msg.role,
          content: msg.content,
          timestamp: new Date(msg.created_at),
        }));

        setCurrentConversationId(conversationId);
        return messages;
      } catch (err) {
        console.error("Error loading conversation:", err);
        setError("Failed to load conversation");
        return [];
      }
    },
    [user]
  );

  // Delete a conversation
  const deleteConversation = useCallback(
    async (conversationId: string) => {
      if (!user || !supabase) return;

      try {
        // Delete all messages in the conversation first
        await supabase
          .from("chat_messages")
          .delete()
          .eq("conversation_id", conversationId)
          .eq("user_id", user.id);

        // Then delete the conversation
        const { error } = await supabase
          .from("chat_conversations")
          .delete()
          .eq("id", conversationId)
          .eq("user_id", user.id);

        if (error) throw error;

        // Update local state
        setConversations((prev) =>
          prev.filter((conv) => conv.id !== conversationId)
        );

        // If we deleted the current conversation, clear current conversation
        if (currentConversationId === conversationId) {
          setCurrentConversationId(null);
        }
      } catch (err) {
        console.error("Error deleting conversation:", err);
        setError("Failed to delete conversation");
      }
    },
    [user, currentConversationId]
  );

  // Generate conversation title from first message
  const generateConversationTitle = useCallback(
    async (conversationId: string, firstMessage: string) => {
      if (!user || !supabase) return;

      // Take first 50 characters as title
      const title =
        firstMessage.length > 50
          ? firstMessage.substring(0, 50) + "..."
          : firstMessage;

      try {
        const { error } = await supabase
          .from("chat_conversations")
          .update({ title })
          .eq("id", conversationId)
          .eq("user_id", user.id);

        if (error) throw error;

        // Update local state
        setConversations((prev) =>
          prev.map((conv) =>
            conv.id === conversationId ? { ...conv, title } : conv
          )
        );
      } catch (err) {
        console.error("Error updating conversation title:", err);
      }
    },
    [user]
  );

  // Load conversations on user change
  useEffect(() => {
    if (user) {
      loadConversations();
    } else {
      setConversations([]);
      setCurrentConversationId(null);
    }
  }, [user, loadConversations]);

  return {
    conversations,
    currentConversationId,
    loading,
    error,
    loadConversations,
    createConversation,
    saveMessage,
    loadConversation,
    deleteConversation,
    generateConversationTitle,
    setCurrentConversationId,
  };
};
