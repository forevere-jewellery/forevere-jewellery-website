import { NextResponse } from 'next/server';
import { checkRateLimit, getClientIp } from '@/lib/security/rate-limit';
import { chatbotMessageSchema } from '@/lib/security/validation';

// Knowledge base strictly scoped to public luxury brand and customer service info
const CONCIERGE_KNOWLEDGE: Record<string, string> = {
  shipping: 'We offer complimentary fully insured express shipping across India. Delivery typically completes within 3 to 5 business days.',
  returns: 'We provide a 30-day hassle-free return policy for unworn jewelry in its original packaging with authenticity certificates.',
  payment: 'We accept Credit/Debit Cards, UPI, Net Banking, and select digital wallets. All transactions are securely processed.',
  rings: 'Our solitaire diamond rings, emerald bands, and artisanal gold designs are handcrafted by master jewelers. Explore our full range in Shop > Rings.',
  necklaces: 'Our necklace collections feature ethical diamond pendants, chokers, and 18K gold statement pieces.',
  earrings: 'Browse our hallmark-certified South Sea pearl drop earrings, diamond studs, and handcrafted hoops.',
  bracelets: 'Our bracelet catalog features our renowned Elysian Diamond Tennis Bracelet, delicate chain bracelets, and solid gold bangles.',
  hallmark: 'Every Forevere jewel is BIS Hallmark certified with comprehensive purity and authenticity documentation.',
  offers: 'We offer tiered spend discounts on orders above ₹10,000, along with periodic festive promotional benefits.',
  default: "Thank you for contacting Forevere Jewellary Concierge! I'm delighted to assist you with our luxury collections, insured shipping, sizing consultations, and store policies.",
};

function sanitizeInput(text: string): string {
  // Strip script tags and HTML markup to prevent injection
  return text.replace(/<[^>]*>/g, '').trim();
}

function getSafeResponse(query: string): string {
  const q = query.toLowerCase();

  // Guard against prompt injection or extraction attempts
  if (q.includes('admin') || q.includes('system prompt') || q.includes('password') || q.includes('secret') || q.includes('database') || q.includes('token')) {
    return 'I am your Forevere customer concierge. I can only assist with public product inquiries, orders, and store services.';
  }

  if (q.includes('ship') || q.includes('deliver') || q.includes('transit')) return CONCIERGE_KNOWLEDGE.shipping;
  if (q.includes('return') || q.includes('refund') || q.includes('exchange')) return CONCIERGE_KNOWLEDGE.returns;
  if (q.includes('pay') || q.includes('card') || q.includes('upi')) return CONCIERGE_KNOWLEDGE.payment;
  if (q.includes('ring') || q.includes('solitaire')) return CONCIERGE_KNOWLEDGE.rings;
  if (q.includes('necklace') || q.includes('pendant')) return CONCIERGE_KNOWLEDGE.necklaces;
  if (q.includes('earring') || q.includes('stud')) return CONCIERGE_KNOWLEDGE.earrings;
  if (q.includes('bracelet') || q.includes('tennis') || q.includes('bangle')) return CONCIERGE_KNOWLEDGE.bracelets;
  if (q.includes('hallmark') || q.includes('gold purity') || q.includes('authentic')) return CONCIERGE_KNOWLEDGE.hallmark;
  if (q.includes('offer') || q.includes('coupon') || q.includes('discount')) return CONCIERGE_KNOWLEDGE.offers;

  return CONCIERGE_KNOWLEDGE.default;
}

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const rate = checkRateLimit(`chatbot:${ip}`, { limit: 20, windowMs: 60 * 1000 });

    if (!rate.allowed) {
      return NextResponse.json(
        { success: false, error: 'Too many messages sent. Please pause a moment before continuing.' },
        { status: 429 }
      );
    }

    const body = await request.json().catch(() => null);
    const parsed = chatbotMessageSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Message must be between 1 and 500 characters.' },
        { status: 400 }
      );
    }

    const cleanMessage = sanitizeInput(parsed.data.message);
    const reply = getSafeResponse(cleanMessage);

    return NextResponse.json({
      success: true,
      reply,
    });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Concierge is momentarily unavailable. Please try again.' },
      { status: 500 }
    );
  }
}
