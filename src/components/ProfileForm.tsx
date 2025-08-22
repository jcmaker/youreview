"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Check, X } from "lucide-react";

interface ProfileFormProps {
  initialUsername: string;
}

export default function ProfileForm({ initialUsername }: ProfileFormProps) {
  const [username, setUsername] = useState(initialUsername);
  const [isLoading, setIsLoading] = useState(false);
  const [usernameError, setUsernameError] = useState("");
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [toast, setToast] = useState<string>("");

  const validateUsername = (value: string) => {
    if (value.length < 3) {
      return "사용자명은 3자 이상이어야 합니다";
    }
    if (value.length > 20) {
      return "사용자명은 20자 이하여야 합니다";
    }
    if (!/^[a-zA-Z0-9_]+$/.test(value)) {
      return "사용자명은 영문, 숫자, 언더스코어만 사용할 수 있습니다";
    }
    return "";
  };

  const checkUsernameAvailability = async (value: string) => {
    if (value === initialUsername) return true;

    setIsCheckingUsername(true);
    try {
      const response = await fetch(
        `/api/profile/username/availability?q=${encodeURIComponent(value)}`
      );
      const data = await response.json();
      return data.available;
    } catch (error) {
      console.error("Error checking username availability:", error);
      return false;
    } finally {
      setIsCheckingUsername(false);
    }
  };

  const handleUsernameChange = async (value: string) => {
    setUsername(value);
    const error = validateUsername(value);
    setUsernameError(error);

    if (!error && value !== initialUsername) {
      const isAvailable = await checkUsernameAvailability(value);
      if (!isAvailable) {
        setUsernameError("이미 사용 중인 사용자명입니다");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (usernameError || isCheckingUsername) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/profile/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username !== initialUsername ? username : undefined,
        }),
      });

      if (!response.ok) {
        throw new Error("프로필 업데이트에 실패했습니다");
      }

      setToast("프로필이 업데이트되었습니다");
      setTimeout(() => setToast(""), 3000);

      // Update the page to reflect changes
      window.location.reload();
    } catch (error) {
      setToast(
        `에러: ${
          error instanceof Error
            ? error.message
            : "프로필 업데이트에 실패했습니다"
        }`
      );
      setTimeout(() => setToast(""), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const hasChanges = username !== initialUsername;

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div
          className={`p-3 rounded-lg text-sm font-medium ${
            toast.startsWith("에러")
              ? "bg-destructive/10 text-destructive border border-destructive/20"
              : "bg-green-500/10 text-green-600 border border-green-500/20"
          }`}
        >
          {toast}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div>
            <label
              htmlFor="username"
              className="text-sm font-medium text-foreground"
            >
              사용자명
            </label>
            <div className="relative mt-1">
              <Input
                id="username"
                value={username}
                onChange={(e) => handleUsernameChange(e.target.value)}
                placeholder="사용자명을 입력하세요"
                className={`pr-10 ${usernameError ? "border-destructive" : ""}`}
                disabled={isLoading}
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                {isCheckingUsername ? (
                  <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                ) : usernameError ? (
                  <X className="w-4 h-4 text-destructive" />
                ) : username && !usernameError ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : null}
              </div>
            </div>
            {usernameError && (
              <p className="text-sm text-destructive mt-1">{usernameError}</p>
            )}
            <p className="text-sm text-muted-foreground mt-1">
              사용자명은 3-20자의 영문, 숫자, 언더스코어만 사용할 수 있습니다
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            type="submit"
            disabled={
              isLoading || !hasChanges || !!usernameError || isCheckingUsername
            }
            className="flex-1"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                저장 중...
              </>
            ) : (
              "변경사항 저장"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
