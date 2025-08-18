"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, Copy } from "lucide-react";

interface ShareLinkButtonProps {
  url: string;
}

export default function ShareLinkButton({ url }: ShareLinkButtonProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={copyToClipboard}
      className="shrink-0 text-muted-foreground/60 hover:text-foreground"
    >
      {copied ? (
        <>
          <Check className="h-4 w-4 mx-1" />
          복사됨
        </>
      ) : (
        <>
          <Copy className="h-4 w-4 mx-1" />
        </>
      )}
    </Button>
  );
}
