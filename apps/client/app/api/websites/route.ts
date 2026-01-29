import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import createWebsiteSchema from "@/lib/schema/website";
import { RabbitMQService } from "@/lib/services/rabbitmq/producer";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

const queueName = process.env.RABBITMQ_QUEUE_NAME || "build_website";

export async function GET() {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const websites = await prisma.website.findMany({
      where: {
        ownerId: session.user.id
      },
      include: {
        template: true,
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    return NextResponse.json(websites);
  } catch (error) {
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const validation = createWebsiteSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(validation.error.format(), { status: 400 });
    }

    const { name, domain, templateId, language, type } = validation.data;

    const existingSite = await prisma.website.findUnique({
      where: { domain },
    });

    if (existingSite) {
      return new NextResponse("Domain already exists", { status: 409 });
    }

    const authorName = `mate-${domain}`;
    const authorSlug = authorName.toLowerCase().replace(/\./g, '-');

    const website = await prisma.website.create({
      data: {
        name,
        domain,
        templateId,
        ownerId: session.user.id,
        language,
        themeConfig: {
          "primary": {
            "50": "#f5f8ff", "100": "#e5ecff", "200": "#d1deff", "300": "#b5ccff", "400": "#8eb6ff",
            "500": "#5da0ff", "600": "#008af8", "700": "#006dd6", "800": "#0051b5", "900": "#003794", "950": "#002075"
          },
          "secondary": {
            "50": "#fff4f8", "100": "#ffe1eb", "200": "#ffcbdd", "300": "#ffacca", "400": "#ff83b2",
            "500": "#fe529c", "600": "#f10084", "700": "#cf0069", "800": "#ae0050", "900": "#8c0037", "950": "#6b0021"
          }
        },
        authors: {
          connectOrCreate: [
            {
              where: { slug: authorSlug }, 
              create: {
                name: authorName,
                slug: authorSlug,
                bio: `Automated content creator for ${domain}, powered by Web-Automate.`,
              }
            }
          ]
        },
        articles: {
          create: [
            {
              topic: "Pengenalan Web-Automate",
              keywords: ["otomatisasi cms", "web-automate", "cms modern"],
              category: "Technology",
              title: "Web-Automate: Revolusi Otomatisasi CMS untuk Efisiensi Maksimal",
              slug: "pengenalan-web-automate",
              excerpt: "Pelajari bagaimana Web-Automate membantu Anda mengelola ribuan konten CMS secara otomatis.",
              content: `
# Selamat Datang di Dunia Otomatisasi dengan Web-Automate

**Web-Automate** hadir sebagai solusi mutakhir bagi para pengelola media online yang ingin meningkatkan produktivitas melalui fitur **otomatisasi CMS**.

## Fitur Unggulan:
1. **Otomatisasi Konten**: Kurasi dan publikasi mandiri.
2. **Multi-Website Management**: Satu dashboard untuk semua.
3. **Optimasi SEO Real-time**: Struktur data otomatis sesuai standar.

Bergabunglah bersama **Web-Automate**.
          `.trim(),
              status: "PUBLISHED",
              publishedAt: new Date(),
              createdBy: {
                connect: {
                  id: session.user.id
                }
              },
              author: {
                connect: { slug: authorSlug }
              },
              seo: {
                create: {
                  metaTitle: "Web-Automate: Solusi Otomatisasi CMS Modern",
                  metaDescription: "Kelola konten CMS Anda secara otomatis dengan Web-Automate.",
                  ogType: "article"
                }
              }
            }
          ]
        } as any,
        logs: {
          create: {
            status: "SUCCESS",
            message: `Initial setup success. Created author: ${authorName}`
          }
        }
      },
      include: {
        articles: true,
        authors: true,
        logs: true
      }
    });

    if (website) {
      const buildPayload = {
        websiteId: website.id,
        action: type,
      };

      try {
        await RabbitMQService.sendToQueue(queueName, buildPayload);
        console.log(`[QUEUE] Website ${website.id} queued for building.`);
      } catch (queueError) {
        console.error("[RABBITMQ_ERROR]", queueError);
        await prisma.websiteLog.create({
          data: {
            websiteId: website.id,
            status: "FAILED",
            message: "Failed to queue build task to RabbitMQ",
            details: String(queueError)
          }
        });
      }
    }

    return NextResponse.json(website);
  } catch (error: any) {
    console.error("[WEBSITES_POST_ERROR]", error);
    return new NextResponse(error.message || "Internal Server Error", { status: 500 });
  }
}