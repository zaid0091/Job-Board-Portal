import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';
import { chatAPI } from '@/api';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

interface OpenChatButtonProps {
  applicationId: string;
  label?: string;
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
}

export default function OpenChatButton({
  applicationId,
  label = 'Message',
  className = 'btn-secondary text-micro px-2.5 py-1 inline-flex items-center gap-1',
  onClick,
}: OpenChatButtonProps) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick?.(e);
    setLoading(true);
    try {
      const conversation = await chatAPI.openConversation(applicationId);
      navigate(`/messages/${conversation.id}`);
    } catch {
      toast.error('Could not open conversation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button type="button" onClick={handleClick} disabled={loading} className={className}>
      {loading ? (
        <LoadingSpinner size="sm" />
      ) : (
        <>
          <ChatBubbleLeftRightIcon className="h-3.5 w-3.5" />
          {label}
        </>
      )}
    </button>
  );
}
