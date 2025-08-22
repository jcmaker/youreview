import { NextResponse } from "next/server";
import { requireUserId } from "@/lib/auth/user";
import { supabaseAdmin } from "@/lib/supabase/serverAdmin";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const userId = await requireUserId();
    const body = await request.json();
    const { username, display_name } = body;

    const updateData: { username?: string; display_name?: string | null } = {};

    if (username !== undefined) {
      // Check if username is already taken by another user
      if (username) {
        const { data: existingUser } = await supabaseAdmin
          .from("profiles")
          .select("id")
          .eq("username", username)
          .neq("id", userId)
          .maybeSingle();

        if (existingUser) {
          return NextResponse.json(
            { error: "이미 사용 중인 사용자명입니다" },
            { status: 400 }
          );
        }
      }
      updateData.username = username;
    }

    if (display_name !== undefined) {
      updateData.display_name = display_name || null;
    }

    const { error } = await supabaseAdmin
      .from("profiles")
      .update(updateData)
      .eq("id", userId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      { error: "프로필 업데이트에 실패했습니다" },
      { status: 500 }
    );
  }
}
