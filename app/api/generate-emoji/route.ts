import { NextResponse } from 'next/server';
import {uploadEmojiToSupabase } from '@/lib/supabase';

export async function POST(request: Request) {
  const token = process.env.REPLICATE_API_TOKEN;
  if (!token) {
    console.error('REPLICATE_API_TOKEN is not set');
    return NextResponse.json({ message: 'Server configuration error' }, { status: 500 });
  }

  let prompt: string;
  let userId: string;

  try {
    const body = await request.json();
    prompt = "A TOK emoji of " + body.prompt;
    userId = body.userId;
    console.log('Received prompt:', prompt);
  } catch (error) {
    console.error('Error parsing request body:', error);
    return NextResponse.json({ message: 'Invalid request body' }, { status: 400 });
  }

  if (!prompt || !userId) {
    console.error('Prompt or userId is missing');
    return NextResponse.json({ message: 'Prompt and userId are required' }, { status: 400 });
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

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Replicate API error:', errorData);
      throw new Error(`Failed to generate emoji: ${response.status} ${response.statusText}`);
    }

    const prediction = await response.json();
    console.log('Replicate API prediction:', prediction);

    // Wait for the prediction to complete
    const result = await waitForPrediction(prediction.id, token);

    if (result.status === 'succeeded' && result.output && result.output.length > 0) {
      const imageUrl = result.output[0];
      
      // Upload to Supabase
      const { data: uploadedData, error: uploadError } = await uploadEmojiToSupabase(imageUrl, userId, prompt);

      if (uploadError) {
        throw new Error(`Failed to upload emoji: ${uploadError instanceof Error ? uploadError.message : 'Unknown error'}`);
      }

      if (!uploadedData || !uploadedData.image_url) {
        throw new Error('Failed to get image URL after upload');
      }

      return NextResponse.json({ 
        id: uploadedData.id, 
        imageUrl: uploadedData.image_url,
        likes: uploadedData.likes,
        isLiked: uploadedData.isLiked
      });
    } else {
      throw new Error('Failed to generate emoji');
    }
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { 
        message: 'Error generating or uploading emoji', 
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

async function waitForPrediction(predictionId: string, token: string): Promise<{ status: string; output?: string[] }> {
  const maxAttempts = 30;
  const interval = 2000; // 2 seconds

  for (let i = 0; i < maxAttempts; i++) {
    const response = await fetch(`https://api.replicate.com/v1/predictions/${predictionId}`, {
      headers: {
        Authorization: `Token ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const prediction = await response.json();

    if (prediction.status === 'succeeded' || prediction.status === 'failed') {
      return prediction;
    }

    await new Promise(resolve => setTimeout(resolve, interval));
  }

  throw new Error('Prediction timed out');
}