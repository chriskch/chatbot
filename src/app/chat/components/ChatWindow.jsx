'use client';

import { useState, useRef, useEffect } from 'react';
import Message from './Message';
import MessageInput from './MessageInput';

export default function ChatWindow({ customer }) {
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
  if (customer) {
    setMessages([
      {
        role: "system",
        content: "Du bist ein freundlicher Chatbot eines E-Commerce-Shops. Antworte präzise, hilfsbereit und höflich."
      },
      {
        role: "system",
        content: `Der aktuelle Nutzer ist ${customer.name}. E-Mail: ${customer.email}, Telefonnummer: ${customer.phone}.`
      }
    ]);
  }
}, [customer]);

  const bottomRef = useRef(null);

  const sendMessage = async (userText) => {
  const updatedMessages = [
    ...messages,
    { role: "user", content: userText }
  ];

  setMessages([...updatedMessages, { role: "assistant", content: "...", loading: true }]);
  setIsLoading(true);

  const response = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages: updatedMessages, customer })
  });

  const data = await response.json();

  // Entferne Lade-Nachricht & füge echte Antwort ein
  setMessages([
    ...updatedMessages,
    { role: "assistant", content: data.reply }
  ]);

  setIsLoading(false);
};

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex flex-col h-[85vh] bg-black text-white">
      {/* Nachrichtenbereich */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {messages
          .filter((msg) => msg.role !== "system")
          .map((msg, idx) => (
            <Message key={idx} sender={msg.role} text={msg.content} loading={msg.loading} />
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Eingabefeld bleibt am unteren Rand */}
      <div className="border-t border-neutral-800">
        <MessageInput onSend={sendMessage} />
      </div>
    </div>
  );
}