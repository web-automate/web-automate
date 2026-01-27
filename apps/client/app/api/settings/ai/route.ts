import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";

const AiConfigSchema = z.object({
  provider: z.string(),
  apiKey: z.string().min(5),
  baseUrl: z.string().optional().nullable(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validatedData = AiConfigSchema.parse(body);

    const config = await prisma.aiConfiguration.create({
        data: {
          provider: validatedData.provider,
          apiKey: validatedData.apiKey,
          baseUrl: validatedData.baseUrl || null,
          isActive: true,
        }
    });

    return NextResponse.json({
      success: true,
      message: `Configuration for ${validatedData.provider} saved successfully`,
      data: {
        provider: config.provider,
        isActive: config.isActive
      }
    });

  } catch (error: any) {
    console.error("AI Config Error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: "Validation failed", 
        details: error.issues.map(issue => ({
          path: issue.path.join("."),
          message: issue.message,
        })) 
      }, { status: 400 });
    }

    return NextResponse.json({ 
      error: "Internal Server Error", 
      message: error.message 
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    console.log("Attempting to fetch AI configurations...");
    
    const configs = await prisma.aiConfiguration.findMany({
      select: {
        isActive: true,
        provider: true,
        id: true,
      }
    });

    console.log("Configs fetched successfully:", configs);
    return NextResponse.json(configs);
    
  } catch (error: any) {
    console.error("Fetch AI Config Error - Full details:", {
      message: error.message,
      stack: error.stack,
      code: error.code,
    });
    
    return NextResponse.json({ 
      error: "Failed to fetch configurations",
      message: error.message,
      details: error.toString()
    }, { status: 500 });
  }
}