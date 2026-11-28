import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db";

export async function proxy(request: NextRequest) {
  const match = /^\/collections\/([^/]+)\/?$/.exec(request.nextUrl.pathname);
  if (!match) {
    return NextResponse.next();
  }

  let slug: string;
  try {
    slug = decodeURIComponent(match[1]);
  } catch {
    return NextResponse.next();
  }

  const collection = await prisma.collection.findUnique({
    where: { slug },
    select: { id: true },
  });

  if (collection) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = "/_not-found";
  url.search = "";
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ["/collections/:path*"],
};
