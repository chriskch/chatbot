'use client';

import { useEffect, useState } from 'react';
import ChatWindow from './components/ChatWindow';
import CustomerSelect from './components/CustomerSelect';

export default function ChatPage() {
  const [customers, setCustomers] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  useEffect(() => {
    fetch('/api/users')
      .then(res => res.json())
      .then(setCustomers);
  }, []);

  useEffect(() => {
    const customer = customers.find(c => c.id === selectedCustomerId);
    setSelectedCustomer(customer);
  }, [selectedCustomerId, customers]);

  return (
    <div className="h-screen w-full bg-black text-white flex flex-col items-center p-6">
      <div className='w-full max-w-2xl border border-neutral-800 rounded-lg overflow-hidden'>
      <div className="w-full bg-neutral-900 p-4 flex justify-between items-center">
        <h1 className="text-lg font-semibold">Chatbot</h1>
        <CustomerSelect
          customers={customers}
          selectedId={selectedCustomerId}
          onChange={setSelectedCustomerId}
        />
      </div>

      <div className="flex-1 w-full max-w-2xl">
        <ChatWindow customer={selectedCustomer} />
      </div>
      </div>
    </div>
  );
}