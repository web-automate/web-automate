import { RabbitMQService } from "@/lib/services/rabbitmq/producer";
import { BuildTypeWebsitePayload, prisma } from "@repo/database";
import { NextResponse } from "next/server";


export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const website = await prisma.website.findUnique({
      where: { id },
      include: {
        template: true,
        owner: true,
        seo: true,
      },
    });

    if (!website) {
      return NextResponse.json(
        { error: "Website tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json(website);
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: websiteId } = await params;
    const body = await req.json();

    const { 
      name, 
      templateId, 
      logoSquare, 
      logoRectangle, 
      favicon, 
      language,
      themeConfig,
      googleAnalyticsId,
      type 
    } = body;

    const website = await prisma.website.update({
      where: {
        id: websiteId,
      },
      data: {
        name,
        templateId,
        logoSquare,
        logoRectangle,
        favicon,
        language,
        themeConfig,
        googleAnalyticsId,
      },
    });

    if (website) {
      const payload = {
        websiteId: website.id,
        action: type || BuildTypeWebsitePayload.BUILD_WEBSITE,
      };

      try {
        await RabbitMQService.sendToQueue("build_website", payload);
        console.log(`[QUEUE] Website ${website.id} queued with action: ${payload.action}`);
      } catch (queueError) {
        console.error("[QUEUE_ERROR]", queueError);
      }
    } 

    return NextResponse.json(website);
  } catch (error) {
    console.error("[WEBSITE_UPDATE_POST]", error);
    return NextResponse.json(
      { error: "Internal Server Error" }, 
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: websiteId } = await params;

    const website = await prisma.website.delete({
      where: {
        id: websiteId,
      },
    });

    if (website) {
      return NextResponse.json(website);
    } else {
      return NextResponse.json(
        { error: "Website tidak ditemukan" },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error("[WEBSITE_DELETE_POST]", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}