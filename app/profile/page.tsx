import { requireUserId } from "@/lib/auth/user";
import { supabaseAdmin } from "@/lib/supabase/serverAdmin";
import { redirect } from "next/navigation";
import ProfileForm from "@/src/components/ProfileForm";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Settings, Share2 } from "lucide-react";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import ShareLinkButton from "@/components/ShareLinkButton";

export default async function ProfilePage() {
  const userId = await requireUserId();

  // Get user profile data
  const { data: profile, error } = await supabaseAdmin
    .from("profiles")
    .select("username, display_name, created_at")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    console.error("Error fetching profile:", error);
    redirect("/onboarding");
  }

  if (!profile?.username) {
    redirect("/onboarding");
  }

  // Get user's lists summary
  const { data: listsSummary } = await supabaseAdmin
    .from("top10_lists")
    .select("category, item_count, year")
    .eq("user_id", userId)
    .gt("item_count", 0);

  const totalItems =
    listsSummary?.reduce((sum, list) => sum + list.item_count, 0) || 0;
  const totalLists = listsSummary?.length || 0;
  const years = [...new Set(listsSummary?.map((list) => list.year) || [])].sort(
    (a, b) => b - a
  );

  const shareUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/u/${profile.username}`;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="rounded-full border border-border p-2 bg-primary/10">
          <User className="w-8 h-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground">내 프로필</h1>
          <p className="text-muted-foreground">
            프로필 정보를 관리하고 수정하세요
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Profile Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "w-30 h-30 border-2 border-border",
                    userButtonPopoverCard: "shadow-lg",
                  },
                }}
                showName={false}
              />
              프로필 정보
            </CardTitle>
            <CardDescription>
              기본 프로필 정보를 확인하고 수정할 수 있습니다
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  사용자명
                </label>
                <p className="text-lg font-semibold text-foreground">
                  @{profile.username}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  표시명
                </label>
                <p className="text-lg font-semibold text-foreground">
                  @{profile.username?.toUpperCase()}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  가입일
                </label>
                <p className="text-foreground">
                  {new Date(profile.created_at).toLocaleDateString("ko-KR", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
            <div className="pt-4">
              <Link href={`/u/${profile.username}`}>
                <Button
                  variant="outline"
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Top10 보기
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              활동 통계
            </CardTitle>
            <CardDescription>나의 youreview 활동 현황입니다</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 rounded-lg bg-primary/10">
                <div className="text-2xl font-bold text-primary">
                  {totalLists}
                </div>
                <div className="text-sm text-muted-foreground">총 리스트</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-primary/10">
                <div className="text-2xl font-bold text-primary">
                  {totalItems}
                </div>
                <div className="text-sm text-muted-foreground">총 아이템</div>
              </div>
            </div>
            {years.length > 0 && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  활동 연도
                </label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {years.map((year) => (
                    <Link key={year} href={`/dashboard/${year}`}>
                      <Button variant="outline" size="sm">
                        {year}
                      </Button>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Profile Form */}
      <Card>
        <CardHeader>
          <CardTitle>프로필 설정</CardTitle>
          <CardDescription>사용자명을 변경할 수 있습니다</CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileForm initialUsername={profile.username} />
        </CardContent>
      </Card>

      {/* Share Profile */}
      <Card>
        <CardHeader>
          <CardTitle>프로필 공유</CardTitle>
          <CardDescription>
            다른 사람들과 당신의 Top 10 리스트를 공유해보세요
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
            <span className="text-sm text-muted-foreground flex-1 break-all">
              {shareUrl}
            </span>
            <ShareLinkButton url={shareUrl} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
