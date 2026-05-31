import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

interface PreferencesRequest {
  destination: string;
  scope: 'international' | 'domestic';
}

export async function POST(request: NextRequest) {
  try {
    const body: PreferencesRequest = await request.json();
    const { destination, scope } = body;

    if (!destination) {
      return NextResponse.json({ error: 'Missing destination' }, { status: 400 });
    }

    const prompt = `Recommend travel interests and dietary options for a luxury trip to ${destination} (${scope === 'domestic' ? 'Domestic China' : 'International'}).

Rules:
- Interests: 5-10 items with emoji, tailored to the destination's unique experiences
- Dietary: 5-8 options tailored to local cuisine and common dietary needs
- Examples for Japan: 🍣 Sushi masterclass, ⛩️ Temple stay, 🎎 Tea ceremony
- Examples for Italy: 🍷 Wine tasting, 🎨 Art gallery tour, 🏛️ Ancient ruins
- Examples for Sichuan: 🌶️ Hotpot experience, 🐼 Panda base, 🍵 Tea house culture

Return JSON only:
{
  "interests": [
    {"emoji": "🏔️", "label": "experience name"}
  ],
  "dietary": ["option1", "option2"]
}`;

    const response = await fetch('https://api.xiaomimimo.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer sk-ch2552z0v95vobx06rmse0ugf3xl1z3a5xsk0dutsd0fro29',
      },
      body: JSON.stringify({
        model: 'mimo-v2.5',
        max_tokens: 2048,
        temperature: 0.3,
        messages: [
          { role: 'system', content: 'You are a luxury travel expert. Return valid JSON only.' },
          { role: 'user', content: prompt },
        ],
      }),
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'AI service unavailable' }, { status: 502 });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content ?? '';

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json({ error: 'AI response parse error' }, { status: 500 });
    }

    const parsed = JSON.parse(jsonMatch[0]);
    return NextResponse.json(parsed);
  } catch (error) {
    console.error('AI preferences error:', error);
    return NextResponse.json({ error: 'Failed to get preferences' }, { status: 500 });
  }
}
