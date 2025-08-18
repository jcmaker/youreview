import { NextRequest, NextResponse } from "next/server";
import { requireUserId } from "@/lib/auth/user";
import { getEntryCountByCategory } from "@/lib/db/top10";
import type { Category } from "@/types/media";

export async function GET(request: NextRequest) {
  try {
    const userId = await requireUserId();
    const { searchParams } = new URL(request.url);

    const yearParam = searchParams.get("year");
    const categoryParam = searchParams.get("category");

    if (!yearParam || !categoryParam) {
      return NextResponse.json(
        { error: "Year and category parameters are required" },
        { status: 400 }
      );
    }

    const year = parseInt(yearParam, 10);
    const category = categoryParam as Category;

    if (isNaN(year) || !["movie", "music", "book"].includes(category)) {
      return NextResponse.json(
        { error: "Invalid year or category" },
        { status: 400 }
      );
    }

    const count = await getEntryCountByCategory(userId, year, category);

    console.log(
      `Entry count for user ${userId}, year ${year}, category ${category}: ${count}`
    );

    return NextResponse.json({ count });
  } catch (error) {
    console.error("Error fetching entry count:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
