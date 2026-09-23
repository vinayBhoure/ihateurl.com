"use client";

import { useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, DatabaseZap, Loader2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function DbCheck() {
  const [loading, setLoading] = useState(false);

  async function checkConnection() {
    setLoading(true);
    try {
      const res = await fetch("/api/health", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "pong" }),
      });
      const data = await res.json();

      if (res.ok && data.ok) {
        toast.success(`Connected via ${data.provider}`, {
          icon: <CheckCircle2 className="size-4" />,
          description:
            typeof data.latencyMs === "number" ? `Round-trip took ${data.latencyMs}ms` : undefined,
        });
      } else {
        toast.error("Connection failed", {
          icon: <XCircle className="size-4" />,
          description: data.error ?? "Unknown error",
        });
      }
    } catch (err) {
      toast.error("Network error", {
        icon: <XCircle className="size-4" />,
        description: err instanceof Error ? err.message : "Could not reach /api/health",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      size="lg"
      onClick={checkConnection}
      disabled={loading}
      className="w-full rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/30 hover:opacity-90"
    >
      {loading ? <Loader2 className="animate-spin" /> : <DatabaseZap />}
      Check DB Connection
    </Button>
  );
}
