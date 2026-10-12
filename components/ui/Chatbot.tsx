'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Sparkles, Bot, User } from 'lucide-react';
import { mockDB } from '@/lib/supabase/mock-db';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

// Guided chatbot knowledge base for jewelry store
const CHATBOT_RESPONSES: Record<string, string> = {
  shipping: 'We offer complimentary fully insured express shipping on all orders across India. Delivery typically takes 3–5 business days. International shipping is available on request.',
  return: 'We offer a 30-day hassle-free return policy. Items must be returned in their original condition with all packaging. Simply contact our concierge team to initiate a return.',
  payment: 'We accept Credit/Debit Cards, UPI, Net Banking, Wallets (Paytm, PhonePe), and Cash on Delivery. All transactions are 256-bit SSL encrypted for your security.',
  ring: 'Our rings range from ₹4,999 to ₹35,000+. We carry solitaire diamond rings, emerald bands, and rose gold collections. Visit /shop to explore all rings.',
  necklace: 'Our necklace collection includes pendant necklaces, diamond chains, and gold chokers. Prices start from ₹8,999. Visit /category/necklaces to browse.',
  earring: 'Our earring collection features pearl drops, diamond studs, and gold hoops starting from ₹3,999. Each pair is hallmark certified.',
  bracelet: 'Our bracelets include tennis bracelets, charm bangles, and delicate gold chains. Visit /category/bracelets to explore our collection.',
  coupon: 'We have several active promotional codes! Try WELCOME10 for 10% off your first order, FOREVERE20 for 20% off orders above ₹20,000, or JEWEL500 for a flat ₹500 discount on orders above ₹5,000.',
  loyalty: 'You earn 0.05 Jewel Points for every ₹1 spent. Points can be redeemed for store credit discounts. Sign in to check your balance!',
  hallmark: 'All our jewelry is BIS Hallmark certified, guaranteeing metal purity. Each piece comes with an authentication certificate.',
  default: "Thank you for reaching out to Forevere Jewellary! I'm your personal jewelry concierge. I can help you with information about our collections, shipping, returns, payment options, and promotional offers. What can I assist you with today?"
};

function getBotResponse(message: string): string {
  const lowerMsg = message.toLowerCase();
  if (lowerMsg.includes('ship') || lowerMsg.includes('deliver') || lowerMsg.includes('tracking')) return CHATBOT_RESPONSES.shipping;
  if (lowerMsg.includes('return') || lowerMsg.includes('refund') || lowerMsg.includes('exchange')) return CHATBOT_RESPONSES.return;
  if (lowerMsg.includes('payment') || lowerMsg.includes('pay') || lowerMsg.includes('upi') || lowerMsg.includes('card')) return CHATBOT_RESPONSES.payment;
  if (lowerMsg.includes('ring')) return CHATBOT_RESPONSES.ring;
  if (lowerMsg.includes('necklace') || lowerMsg.includes('pendant') || lowerMsg.includes('chain')) return CHATBOT_RESPONSES.necklace;
  if (lowerMsg.includes('earring') || lowerMsg.includes('stud') || lowerMsg.includes('hoop')) return CHATBOT_RESPONSES.earring;
  if (lowerMsg.includes('bracelet') || lowerMsg.includes('bangle') || lowerMsg.includes('tennis')) return CHATBOT_RESPONSES.bracelet;
  if (lowerMsg.includes('coupon') || lowerMsg.includes('discount') || lowerMsg.includes('promo') || lowerMsg.includes('code')) return CHATBOT_RESPONSES.coupon;
  if (lowerMsg.includes('point') || lowerMsg.includes('loyal') || lowerMsg.includes('reward')) return CHATBOT_RESPONSES.loyalty;
  if (lowerMsg.includes('hallmark') || lowerMsg.includes('certif') || lowerMsg.includes('authentic') || lowerMsg.includes('real') || lowerMsg.includes('genuine')) return CHATBOT_RESPONSES.hallmark;
  return CHATBOT_RESPONSES.default;
}

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: "Welcome to Forevere Jewellary! ✨ I'm your personal jewelry concierge. Ask me about our collections, shipping, returns, or exclusive offers!" }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = async (text?: string) => {
    const msg = (text || input).trim();
    if (!msg) return;

    const userMsg: ChatMessage = { role: 'user', content: msg };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Simulate typing delay
    await new Promise((r) => setTimeout(r, 800 + Math.random() * 600));

    const botResponse = getBotResponse(msg);
    setMessages((prev) => [...prev, { role: 'assistant', content: botResponse }]);
    setIsTyping(false);
  };

  const QUICK_SUGGESTIONS = ['Shipping info', 'Coupon codes', 'Return policy', 'Ring collection'];

  return (
    <>
      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-5 sm:right-8 z-50 w-[calc(100vw-40px)] sm:w-96 bg-[#FDFBF7] border border-[#EADFC9] rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-300 max-h-[70vh]">
          {/* Chat Header */}
          <div className="bg-[#111111] px-5 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#C5A059]/20 border border-[#C5A059]/40 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-[#C5A059]" />
              </div>
              <div>
                <h3 className="font-serif text-white text-sm font-semibold">Forevere Concierge</h3>
                <span className="text-[10px] text-emerald-400 font-sans flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                  Online — Instant Support
                </span>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white p-1 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-full bg-[#F8F3E6] border border-[#EADFC9] text-[#C5A059] flex items-center justify-center shrink-0 mt-1">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                )}
                <div className={`max-w-[78%] px-4 py-2.5 rounded-2xl text-xs font-sans leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-[#111111] text-white rounded-br-sm'
                    : 'bg-white border border-[#EADFC9] text-[#111111] rounded-bl-sm shadow-sm'
                }`}>
                  {msg.content}
                </div>
                {msg.role === 'user' && (
                  <div className="w-7 h-7 rounded-full bg-[#111111] text-[#C5A059] flex items-center justify-center shrink-0 mt-1">
                    <User className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-2 justify-start">
                <div className="w-7 h-7 rounded-full bg-[#F8F3E6] border border-[#EADFC9] text-[#C5A059] flex items-center justify-center shrink-0">
                  <Bot className="w-3.5 h-3.5" />
                </div>
                <div className="bg-white border border-[#EADFC9] px-4 py-3 rounded-2xl rounded-bl-sm shadow-sm">
                  <div className="flex gap-1 items-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#C5A059] animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-[#C5A059] animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-[#C5A059] animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions */}
          <div className="px-4 pb-2 flex gap-2 flex-wrap">
            {QUICK_SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => handleSend(s)}
                className="text-[10px] font-sans border border-[#EADFC9] text-gray-600 px-2.5 py-1 rounded-full hover:border-[#C5A059] hover:text-[#C5A059] transition-colors bg-white"
              >
                {s}
              </button>
            ))}
          </div>

          {/* Input Area */}
          <div className="px-4 pb-4">
            <form
              onSubmit={(e) => { e.preventDefault(); handleSend(); }}
              className="flex gap-2 bg-white border border-[#EADFC9] rounded-full px-4 py-2 focus-within:border-[#C5A059] transition-colors"
            >
              <input
                type="text"
                placeholder="Ask about collections, shipping..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1 text-xs font-sans bg-transparent focus:outline-none text-[#111111] placeholder-gray-400"
              />
              <button type="submit" className="text-[#C5A059] hover:text-[#111111] transition-colors p-1">
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-5 sm:right-8 z-50 w-14 h-14 bg-[#111111] hover:bg-[#C5A059] text-white rounded-full shadow-2xl flex items-center justify-center transition-all group"
        title="Chat with Forevere Concierge"
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <>
            <MessageCircle className="w-6 h-6" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full text-[9px] text-white flex items-center justify-center font-bold border border-white">1</span>
          </>
        )}
      </button>
    </>
  );
}
