"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useChat } from 'ai/react';
import AIChatDisplay from './display';
import { prepareDataContext } from './service';

// This file defines the AI Chat control component, managing state and logic.

// This function renders the chat control component, handling the open state and auto-scrolling.
export default function AIChatControl({ participants, measurements }) {
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef(null);

  const dataContext = prepareDataContext(participants, measurements);

  const { messages, append, isLoading, input, handleInputChange, setInput, error } = useChat({
    api: '/api/chat',
    body: {
      dataContext: dataContext
    }
  });

  // This function scrolls the chat view to the latest message.
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  return (
    <AIChatDisplay
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      messages={messages}
      append={append}
      isLoading={isLoading}
      input={input}
      handleInputChange={handleInputChange}
      setInput={setInput}
      error={error}
      messagesEndRef={messagesEndRef}
    />
  );
}
