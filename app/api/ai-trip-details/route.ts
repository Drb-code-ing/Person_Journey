import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

interface TripDetailsRequest {
  origin: string;
  destination: string;
  scope: 'international' | 'domestic';
  adults: number;
  children: number;
  travelDate?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: TripDetailsRequest = await request.json();
    const { origin, destination, scope, adults, children, travelDate } = body;

    if (!origin || !destination) {
      return NextResponse.json({ error: 'Missing origin or destination' }, { status: 400 });
    }

    const prompt = `Recommend luxury travel details for this trip:
From: ${origin}
To: ${destination}
Type: ${scope === 'domestic' ? 'Domestic China' : 'International'}
Travelers: ${adults} adults${children > 0 ? `, ${children} children` : ''}
${travelDate ? `Date: ${travelDate}` : ''}

Rules:
- Transport: domestic <800km recommend highspeed-rail, otherwise flight. International always flight.
- Days: based on destination richness, recommend 3-7 days
- Hotels: recommend 3 top luxury hotels at the destination

Return JSON only:
{
  "transportType": "flight" or "highspeed-rail",
  "transportReason": "brief reason",
  "recommendedDays": number,
  "daysReason": "brief reason",
  "hotels": [
    {"name": "hotel name", "stars": 5, "highlight": "one-line highlight"}
  ]
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
    console.error('AI trip details error:', error);
    return NextResponse.json({ error: 'Failed to get trip details' }, { status: 500 });
  }
}
