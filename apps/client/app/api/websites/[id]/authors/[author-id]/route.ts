import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  { params }: { params: Promise<{ id: string; "author-id": string }> }
) {
  try {
    const paramsResolved = await params;
    const websiteId = paramsResolved.id;
    const authorId = paramsResolved["author-id"];
    const author = await prisma.author.findFirst({
      where: {
        id: authorId,
        websites: {
          some: {
            id: websiteId
          }
        }
      },
      include: {
        _count: {
          select: { articles: true }
        }
      }
    })

    if (!author) {
      return NextResponse.json({ error: "Author not found" }, { status: 404 })
    }

    return NextResponse.json(author)
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; "author-id": string }> }
) {
  try {
    const paramsResolved = await params;
    const authorId = paramsResolved["author-id"];
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

    const updatedAuthor = await prisma.author.update({
      where: {
        id: authorId
      },
      data: {
        name,
        slug,
        image,
        bio,
        twitter,
        instagram,
        facebook,
        linkedIn,
        websiteUrl
      }
    })

    return NextResponse.json(updatedAuthor)
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  { params }: { params: Promise<{ id: string; "author-id": string }> }
) {
  try {
    const paramsResolved = await params;
    const authorId = paramsResolved["author-id"];
    await prisma.author.delete({
      where: {
        id: authorId
      }
    })

    return NextResponse.json({ message: "Author deleted successfully" })
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
}