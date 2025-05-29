import { LoaderDots } from '@/app/chat/components/LoaderDots';

export default function Message({ sender, text, loading }) {
  const isUser = sender === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`rounded-lg px-4 py-2 max-w-[70%] whitespace-pre-wrap ${isUser ? 'bg-blue-600 text-white' : 'bg-neutral-800 text-white'}`}>
        {loading ? <LoaderDots /> : text}
      </div>
    </div>
  );
}