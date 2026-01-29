import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const paramsResolved = await params;
    const websiteId = paramsResolved.id;
    const authors = await prisma.author.findMany({
      where: {
        websites: {
          some: {
            id: websiteId
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    })

    return NextResponse.json(authors)
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await req.json()
    const {
      name,
      slug,
      image,
      bio,
      twitter,
      instagram,
      facebook,
      linkedIn,
      websiteUrl
    } = body

    const paramsResolved = await params;
    const websiteId = paramsResolved.id;
    
    const existingAuthor = await prisma.author.findUnique({
      where: { slug }
    })

    if (existingAuthor) {
      return NextResponse.json(
        { error: "Slug already exists" },
        { status: 409 }
      )
    }

    const newAuthor = await prisma.author.create({
      data: {
        name,
        slug,
        image,
        bio,
        twitter,
        instagram,
        facebook,
        linkedIn,
        websiteUrl,
        websites: {
          connect: {
            id: websiteId
          }
        }
      }
    })

    return NextResponse.json(newAuthor, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
}