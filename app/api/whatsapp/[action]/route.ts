import { NextResponse } from 'next/server';

const WHATSAPP_URL = 'http://localhost:8083';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ action: string }> }
) {
  const { action } = await params;
  const path = '/' + action;
  
  try {
    const res = await fetch(WHATSAPP_URL + path);
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Service unavailable' }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ action: string }> }
) {
  const { action } = await params;
  const path = '/' + action;
  const body = await request.json().catch(() => ({}));
  
  try {
    const res = await fetch(WHATSAPP_URL + path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Service unavailable' }, { status: 500 });
  }
}
