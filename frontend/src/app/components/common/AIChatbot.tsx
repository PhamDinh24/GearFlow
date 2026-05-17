import React, { useState, useRef, useEffect } from 'react';
import { aiApi, ProductSuggestion } from '../../services/api';
import { Bot, X, Send, Loader2, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router';

interface Message {
  id: string;
  text: string;
  isBot: boolean;
  suggestions?: ProductSuggestion[];
}

export const AIChatbot: React.FC = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Chào bạn! Mình là trợ lý AI của GearFlow. Bạn cần tư vấn mua bàn phím cơ như thế nào?',
      isBot: true,
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), text: userMessage, isBot: false },
    ]);
    setIsLoading(true);

    try {
      const response = await aiApi.chat(userMessage);
      setMessages((prev) => [
        ...prev,
        { 
          id: (Date.now() + 1).toString(), 
          text: response.content, 
          isBot: true,
          suggestions: response.suggestions 
        },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          text: 'Xin lỗi, tôi đang gặp sự cố kết nối. Vui lòng thử lại sau.',
          isBot: true,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 p-4 bg-primary text-primary-foreground rounded-full shadow-lg hover:bg-primary/90 transition-transform transform hover:scale-105 z-50 flex items-center justify-center"
        >
          <MessageSquare className="w-6 h-6" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-80 sm:w-96 bg-background border rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden animate-in slide-in-from-bottom-5">
          {/* Header */}
          <div className="bg-primary p-4 flex justify-between items-center text-primary-foreground">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5" />
              <h3 className="font-semibold">Trợ lý AI GearFlow</h3>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-primary-foreground/80 hover:text-primary-foreground transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto max-h-96 min-h-80 bg-muted/30 flex flex-col gap-3">
            {messages.map((msg) => (
              <div key={msg.id} className="flex flex-col gap-2">
                <div
                  className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                    msg.isBot
                      ? 'bg-muted rounded-tl-sm self-start text-foreground'
                      : 'bg-primary text-primary-foreground rounded-tr-sm self-end'
                  }`}
                >
                  {msg.text}
                </div>
                
                {/* Product Suggestions */}
                {msg.isBot && msg.suggestions && msg.suggestions.length > 0 && (
                  <div className="flex flex-col gap-2 w-full">
                    {msg.suggestions.map((product) => (
                      <div
                        key={product.id}
                        onClick={() => {
                          navigate(`/product/${product.id}`);
                          setIsOpen(false);
                        }}
                        className="flex items-center gap-3 p-2 bg-background border rounded-lg hover:shadow-md transition-all cursor-pointer group"
                      >
                        <img
                          src={product.imageUrl || '/placeholder-product.png'}
                          alt={product.name}
                          className="w-16 h-16 object-cover rounded-md"
                          onError={(e) => {
                            e.currentTarget.src = '/placeholder-product.png';
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm text-foreground group-hover:text-primary transition-colors truncate">
                            {product.name}
                          </h4>
                          <p className="text-xs text-muted-foreground">{product.brandName}</p>
                          <p className="text-sm font-semibold text-primary mt-1">
                            {product.price.toLocaleString('vi-VN')}đ
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="bg-muted rounded-2xl rounded-tl-sm self-start p-3 max-w-[80%] flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Đang suy nghĩ...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 border-t bg-background">
            <form
              onSubmit={handleSend}
              className="flex items-center gap-2 bg-muted/50 rounded-full pr-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Hỏi tôi bất cứ điều gì..."
                className="flex-1 bg-transparent border-none focus:ring-0 px-4 py-2 text-sm outline-none"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="p-2 bg-primary text-primary-foreground rounded-full disabled:opacity-50 hover:bg-primary/90 transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
