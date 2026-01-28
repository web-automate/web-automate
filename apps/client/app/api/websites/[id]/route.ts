import { auth } from "@/lib/auth";
import { RabbitMQService } from "@/lib/services/rabbitmq/producer";
import { BuildTypeWebsitePayload, prisma, WebsiteStatus } from "@repo/database";
import { headers } from "next/headers";
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
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { id: websiteId } = await params;

    const website = await prisma.website.update({
      where: {
        id: websiteId,
        ownerId: session.user.id,
      },
      data: {
        status: WebsiteStatus.MAINTENANCE
      }
    });

    if (!website) {
      return NextResponse.json(
        { error: "Website tidak ditemukan atau Anda tidak memiliki akses" },
        { status: 404 }
      );
    }

    const payload = {
      websiteId: website.id,
    };

    try {
      await RabbitMQService.sendToQueue("delete_website", payload);
      console.log(`[QUEUE] Website ${website.id} queued for deletion.`);
      
      await prisma.websiteLog.create({
        data: {
          websiteId: website.id,
          status: WebsiteStatus.MAINTENANCE,
          message: "Deletion request received. Cleaning up infrastructure..."
        }
      });

    } catch (queueError) {
      console.error("[QUEUE_ERROR]", queueError);
      await prisma.website.update({
        where: { id: websiteId },
        data: { status: WebsiteStatus.FAILED }
      });
      
      return NextResponse.json(
        { error: "Gagal menjadwalkan penghapusan ke antrean" },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      message: "Penghapusan sedang diproses di latar belakang",
      id: website.id 
    });

  } catch (error) {
    console.error("[WEBSITE_DELETE_POST]", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}