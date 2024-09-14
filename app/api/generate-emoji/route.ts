import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const token = process.env.REPLICATE_API_TOKEN;
  console.log('API Token in route (first 4 chars):', token?.substring(0, 4) || 'Not set');

  if (!token) {
    console.error('REPLICATE_API_TOKEN is not set');
    return NextResponse.json({ message: 'Server configuration error' }, { status: 500 });
  }

  let prompt: string;

  try {
    const body = await request.json();
    prompt = "A TOK emoji of " + body.prompt;
    console.log('Received prompt:', prompt);
  } catch (error) {
    console.error('Error parsing request body:', error);
    return NextResponse.json({ message: 'Invalid request body' }, { status: 400 });
  }

  if (!prompt) {
    console.error('Prompt is missing');
    return NextResponse.json({ message: 'Prompt is required' }, { status: 400 });
  }

  try {
    console.log('Sending request to Replicate API...');
    const response = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        Authorization: `Token ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        version: "dee76b5afde21b0f01ed7925f0665b7e879c50ee718c5f78a9d38e04d523cc5e",
        input: { prompt },
      }),
    });

    console.log('Replicate API response status:', response.status);
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Replicate API error:', errorData);
      throw new Error(`Failed to generate emoji: ${response.status} ${response.statusText}`);
    }

    const prediction = await response.json();
    console.log('Replicate API prediction:', prediction);
    return NextResponse.json(prediction);
  } catch (error) {
    console.error('Error calling Replicate API:', error);
    return NextResponse.json(
      { 
        message: 'Error generating emoji', 
        error: error instanceof Error ? error.message : 'Unknown error',
        tokenPrefix: token?.substring(0, 4) // Add this line (for debugging only)
      },
      { status: 500 }
    );
  }
}