import prisma from '@/lib/prisma';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateText } from 'ai';
import { NextResponse } from 'next/server';

const languageMap: Record<string, string> = {
  'id': 'Indonesian',
  'en': 'English',
}

export async function POST(req: Request) {
  try {
    const { type, language, context } = await req.json();

    const configs = await prisma.aiConfiguration.findMany({
      select: {
        isActive: true,
        provider: true,
        apiKey: true,
      }
    });

    if (!configs || configs.length === 0) {
      return NextResponse.json({ error: 'No active AI configurations found' }, { status: 400 });
    }

    const google = createGoogleGenerativeAI({
      apiKey: configs.find(c => c.provider === 'google')?.apiKey || '',
    })
    const languageName = languageMap[language] || language;

    if (type === 'topic') {
      const { text } = await generateText({
        model: google('gemma-3-27b-it'),
        prompt: `Based on this initial idea: "${context}", generate one catchy, SEO-friendly, and professional article title in language ${languageName}. Output ONLY the title text.`,
      });
      return NextResponse.json({ result: text.trim() });
    }

    if (type === 'keywords') {
      const { text } = await generateText({
        model: google('gemma-3-27b-it'),
        prompt: `Generate 5 relevant SEO keywords for an article about "${context}". Output ONLY the keywords separated by commas.`,
      });
      const keywords = text.split(',').map(k => k.trim());
      return NextResponse.json({ result: keywords });
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}