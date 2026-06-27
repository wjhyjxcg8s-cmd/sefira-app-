"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/lib/AuthContext";

const supabaseAdmin = createClient(
  "https://ceetzophaybywfuhezhv.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNlZXR6b3BoYXlieXdmdWhlemh2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTM1Nzg1NSwiZXhwIjoyMDk0OTMzODU1fQ.Jw1bDN7wqxdqj-OinqK4ll7mV5ka7fT6T-9jORs4x_4",
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const ADMIN_EMAIL = "supportsefira@gmail.com";

interface ReportedMsg {
  id: string;
  reporter_id: string;
  reported_user_id: string;
  message_id: string;
  message_content: string;
  reason: string;
  status: string;
  created_at: string;
  reporter_profile?: { display_name: string | null } | null;
  reported_profile?: { display_name: string | null } | null;
}

const reasonLabels: Record<string, string> = {
  inappropriate: "Uygunsuz içerik",
  spam: "Spam",
  insult: "Hakaret/Küfür",
  other: "Diğer",
};

function formatDate(d: string) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("tr-TR", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ReportedMessagesPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [reports, setReports] = useState<ReportedMsg[]>([]);
  const [profileMap, setProfileMap] = useState<Record<string, { display_name: string | null }>>({});
  const [pageLoading, setPageLoading] = useState(true);
  const [markingId, setMarkingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "pending" | "reviewed">("all");

  useEffect(() => {
    if (!loading && (!user || user.email !== ADMIN_EMAIL)) {
      router.replace("/");
    }
  }, [user, loading, router]);

  const fetchReports = async () => {
    setPageLoading(true);
    const { data, error } = await supabaseAdmin
      .from("reported_messages")
      .select("*")
      .order("created_at", { ascending: false });

    if (error || !data) { setPageLoading(false); return; }

    const userIds = Array.from(new Set([
      ...data.map((r: ReportedMsg) => r.reporter_id),
      ...data.map((r: ReportedMsg) => r.reported_user_id),
    ].filter(Boolean)));

    const pMap: Record<string, { display_name: string | null }> = {};
    if (userIds.length > 0) {
      const { data: profiles } = await supabaseAdmin
        .from("profiles")
        .select("user_id, display_name")
        .in("user_id", userIds);
      if (profiles) {
        profiles.forEach((p: { user_id: string; display_name: string | null }) => {
          pMap[p.user_id] = { display_name: p.display_name };
        });
      }
    }

    setProfileMap(pMap);
    setReports(data.map((r: ReportedMsg) => ({
      ...r,
      reporter_profile: pMap[r.reporter_id] ?? null,
      reported_profile: pMap[r.reported_user_id] ?? null,
    })));
    setPageLoading(false);
  };

  useEffect(() => {
    if (user?.email === ADMIN_EMAIL) fetchReports();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const markReviewed = async (id: string) => {
    setMarkingId(id);
    await supabaseAdmin.from("reported_messages").update({ status: "reviewed" }).eq("id", id);
    setReports((prev) => prev.map((r) => r.id === id ? { ...r, status: "reviewed" } : r));
    setMarkingId(null);
  };

  const filtered = filter === "all" ? reports : reports.filter((r) => r.status === filter);

  if (loading || pageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-9 h-9 rounded-full border-4 border-gray-200 border-t-orange-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6 flex-wrap">
          <button
            onClick={() => router.push("/admin-sefira-2026")}
            className="w-9 h-9 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:border-orange-400 hover:text-orange-500 transition-colors shadow-sm"
          >
            ←
          </button>
          <h1 className="text-2xl font-bold text-gray-800">🚩 Şikayet Edilen Mesajlar</h1>
          <button
            onClick={fetchReports}
            className="ml-auto bg-orange-500 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-orange-600 transition-colors"
          >
            🔄 Yenile
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: "Toplam", value: reports.length, color: "#f8fafc" },
            { label: "Beklemede", value: reports.filter((r) => r.status !== "reviewed").length, color: "#fff7ed" },
            { label: "İncelendi", value: reports.filter((r) => r.status === "reviewed").length, color: "#f0fdf4" },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl p-4 border border-gray-100" style={{ backgroundColor: s.color, boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
              <p className="text-2xl font-bold text-gray-800">{s.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-5">
          {(["all", "pending", "reviewed"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
              style={{
                backgroundColor: filter === f ? "#F97316" : "white",
                color: filter === f ? "white" : "#6b7280",
                border: "1px solid",
                borderColor: filter === f ? "#F97316" : "#e5e7eb",
              }}
            >
              {f === "all" ? "Tümü" : f === "pending" ? "Beklemede" : "İncelendi"}
            </button>
          ))}
        </div>

        {/* Reports list */}
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center text-gray-400 border border-gray-100">
            Bu kategoride şikayet bulunmuyor.
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((r) => (
              <div
                key={r.id}
                className="bg-white rounded-2xl border border-gray-100 p-5"
                style={{ boxShadow: "0 1px 6px rgba(0,0,0,0.06)" }}
              >
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1 min-w-0 space-y-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className="px-2.5 py-1 rounded-lg text-xs font-bold"
                        style={{
                          backgroundColor: r.status === "reviewed" ? "#dcfce7" : "#fff7ed",
                          color: r.status === "reviewed" ? "#16a34a" : "#ea580c",
                        }}
                      >
                        {r.status === "reviewed" ? "✓ İncelendi" : "⏳ Beklemede"}
                      </span>
                      <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-red-50 text-red-600">
                        {reasonLabels[r.reason] ?? r.reason}
                      </span>
                      <span className="text-xs text-gray-400">{formatDate(r.created_at)}</span>
                    </div>

                    <div className="bg-gray-50 rounded-xl px-4 py-3 text-sm text-gray-700 border border-gray-100">
                      <p className="text-xs text-gray-400 font-semibold uppercase mb-1">Şikayet Edilen Mesaj</p>
                      <p className="break-words">{r.message_content || "—"}</p>
                    </div>

                    <div className="flex flex-col gap-1">
                      <div>
                        <span className="text-xs text-gray-500">ŞIKAYETÇI: </span>
                        <button
                          onClick={() => router.push(`/admin-sefira-2026/user/${r.reporter_id}`)}
                          className="text-xs text-blue-600 hover:text-blue-800 underline font-semibold cursor-pointer"
                        >
                          {profileMap[r.reporter_id]?.display_name || r.reporter_id}
                        </button>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500">ŞIKAYET EDİLEN: </span>
                        <button
                          onClick={() => router.push(`/admin-sefira-2026/user/${r.reported_user_id}`)}
                          className="text-xs text-red-600 hover:text-red-800 underline font-semibold cursor-pointer"
                        >
                          {profileMap[r.reported_user_id]?.display_name || r.reported_user_id}
                        </button>
                      </div>
                    </div>
                  </div>

                  {r.status !== "reviewed" && (
                    <button
                      onClick={() => markReviewed(r.id)}
                      disabled={markingId === r.id}
                      className="shrink-0 px-4 py-2.5 rounded-xl bg-green-500 text-white text-sm font-bold hover:bg-green-600 active:scale-95 transition-all disabled:opacity-50"
                    >
                      {markingId === r.id ? "…" : "✓ İncelendi"}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
