import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { geo } = await req.json();

  try {
    const res = await fetch(`http://localhost:3003/?geo=${geo}`, {
      cache: 'no-store', 
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      throw new Error(`Backend Service Error: ${res.statusText}`);
    }

    const data = await res.json();

    return NextResponse.json(data);

  } catch (error) {
    console.error('Error fetching trends:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch trends from backend service',
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}