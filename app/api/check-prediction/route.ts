import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ message: 'Prediction ID is required' }, { status: 400 });
  }

  const token = process.env.REPLICATE_API_TOKEN;

  if (!token) {
    console.error('REPLICATE_API_TOKEN is not set');
    return NextResponse.json({ message: 'Server configuration error' }, { status: 500 });
  }

  try {
    const response = await fetch(`https://api.replicate.com/v1/predictions/${id}`, {
      headers: {
        Authorization: `Token ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Replicate API error:', errorData);
      throw new Error(`Failed to check prediction: ${response.status} ${response.statusText}`);
    }

    const prediction = await response.json();
    return NextResponse.json(prediction);
  } catch (error) {
    console.error('Error checking prediction:', error);
    return NextResponse.json(
      { 
        message: 'Error checking prediction', 
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}