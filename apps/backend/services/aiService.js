/**
 * AI service — uses OpenAI when OPENAI_API_KEY is set, otherwise returns mock responses.
 * Gemini is handled directly in agentController via GEMINI_API_KEY.
 */

async function chatWithOpenAI({ systemContext, message }) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemContext },
        { role: 'user', content: message },
      ],
      max_tokens: 800,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenAI API error: ${err}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content?.trim() || '';
}

function mockChatReply({ storeName, productCount, lowStockCount, totalRevenue, message }) {
  const hints = [
    `You have ${productCount} products in ${storeName || 'your store'}.`,
    lowStockCount > 0
      ? `${lowStockCount} item(s) are running low — consider reordering soon.`
      : 'Stock levels look healthy across your catalog.',
    totalRevenue > 0
      ? `Recent revenue is approximately ₹${totalRevenue.toFixed(0)}.`
      : 'Record more sales to unlock richer analytics.',
  ];

  return (
    `[CommerceOS AI — mock mode]\n\n` +
    `Add OPENAI_API_KEY or GEMINI_API_KEY to apps/backend/.env for live AI responses.\n\n` +
    `${hints.join(' ')}\n\n` +
    `Regarding your question: "${message.slice(0, 120)}${message.length > 120 ? '…' : ''}" — ` +
    `I recommend reviewing low-stock alerts and the sales dashboard for actionable next steps.`
  );
}

async function generateInsight({ systemContext, message, context = {} }) {
  try {
    const openAiReply = await chatWithOpenAI({ systemContext, message });
    if (openAiReply) {
      return { success: true, reply: openAiReply, provider: 'openai' };
    }
  } catch (error) {
    console.error('OpenAI error:', error.message);
  }

  return {
    success: true,
    reply: mockChatReply({
      storeName: context.storeName,
      productCount: context.productCount ?? 0,
      lowStockCount: context.lowStockCount ?? 0,
      totalRevenue: context.totalRevenue ?? 0,
      message,
    }),
    provider: 'mock',
  };
}

module.exports = { generateInsight, chatWithOpenAI, mockChatReply };
