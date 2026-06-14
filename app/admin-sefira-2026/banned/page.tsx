"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { useAuth } from "@/app/lib/AuthContext";

const ADMIN_EMAIL = "supportsefira@gmail.com";

const supabaseAdmin = createClient(
  "https://ceetzophaybywfuhezhv.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNlZXR6b3BoYXlieXdmdWhlemh2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTM1Nzg1NSwiZXhwIjoyMDk0OTMzODU1fQ.Jw1bDN7wqxdqj-OinqK4ll7mV5ka7fT6T-9jORs4x_4",
  { auth: { autoRefreshToken: false, persistSession: false } }
);

interface BannedUser {
  id: string;
  email: string;
  user_id: string;
  reason: string | null;
  banned_at: string;
}

export default function BannedPage() {
  const { user, session, loading } = useAuth();
  const router = useRouter();

  const [bannedList, setBannedList] = useState<BannedUser[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<BannedUser | null>(null);
  const [bannedLastUpdated, setBannedLastUpdated] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && (!user || user.email !== ADMIN_EMAIL)) {
      router.replace("/");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!user || user.email !== ADMIN_EMAIL) return;
    fetchBanned();
    const interval = setInterval(fetchBanned, 30000);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchBanned = async () => {
    setPageLoading(true);
    const { data, error } = await supabaseAdmin
      .from("banned_emails")
      .select("*")
      .order("banned_at", { ascending: false });
    console.log("Banned list:", data, error);
    setBannedList(data ?? []);
    setBannedLastUpdated(new Date().toLocaleTimeString('tr-TR'));
    setPageLoading(false);
  };

  const handleUnban = async (item: BannedUser) => {
    setActionLoading(item.user_id);
    const token = session?.access_token;
    try {
      const res = await fetch("/api/admin/ban-user", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ userId: item.user_id, email: item.email, action: "unban" }),
      });
      const result = await res.json();
      console.log("Unban result:", result);
      if (result.success) {
        alert("Engel kaldırıldı!");
        setBannedList((prev) => prev.filter((b) => b.email !== item.email));
      } else {
        alert("Hata: " + JSON.stringify(result));
      }
    } catch (e) {
      console.error("Unban error:", e);
      alert("Bağlantı hatası");
    }
    setActionLoading(null);
  };

  const handleDelete = async (item: BannedUser) => {
    setActionLoading(item.user_id);
    const token = session?.access_token;
    try {
      const res = await fetch("/api/admin/delete-user", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ userId: item.user_id }),
      });
      const json = await res.json();
      if (!json.error) {
        setBannedList((prev) => prev.filter((b) => b.user_id !== item.user_id));
      }
    } catch { /* fail silently */ }
    setDeleteConfirm(null);
    setActionLoading(null);
  };

  const formatDate = (d: string) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("tr-TR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div
          className="w-9 h-9 rounded-full border-4 border-gray-200 border-t-orange-600 animate-spin"
          style={{ animationDuration: "0.7s" }}
        />
      </div>
    );
  }

  if (user.email !== ADMIN_EMAIL) return null;

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f8fafc" }}>
      {/* Header */}
      <div
        className="bg-white border-b border-gray-100 px-4 sm:px-6 py-4"
        style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}
      >
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <button
            onClick={() => router.push("/admin-sefira-2026")}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors text-lg font-bold"
            aria-label="Geri"
          >
            ←
          </button>
          <h1 className="text-xl font-bold text-gray-800">🚫 Engelliler</h1>
          <button onClick={fetchBanned} className="bg-orange-600 text-white px-4 py-2 rounded-xl text-sm font-bold">
            🔄 Yenile
          </button>
          <span
            className="ml-auto px-3 py-1 rounded-full text-sm font-semibold"
            style={{ backgroundColor: "#fef2f2", color: "#ef4444" }}
          >
            {bannedList.length} kullanıcı
          </span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 sm:p-6">
        {/* Count */}
        <p className="text-sm text-gray-500 mb-2 font-medium">
          {bannedList.length} kullanıcı engellendi
        </p>
        {bannedLastUpdated && <p className="text-xs text-gray-400 mb-4">Son güncelleme: {bannedLastUpdated}</p>}

        {pageLoading ? (
          <div className="flex items-center justify-center h-64">
            <div
              className="w-9 h-9 rounded-full border-4 border-gray-200 border-t-orange-600 animate-spin"
              style={{ animationDuration: "0.7s" }}
            />
          </div>
        ) : bannedList.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 gap-3">
            <span className="text-5xl">✅</span>
            <p className="text-gray-500 font-medium text-lg">Engellenmiş kullanıcı yok</p>
          </div>
        ) : (
          <div className="space-y-3">
            {bannedList.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl p-5 border border-gray-100 flex flex-col sm:flex-row sm:items-center gap-4"
                style={{ boxShadow: "0 1px 6px rgba(0,0,0,0.06)" }}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xl">🚫</span>
                    <p className="text-base font-bold text-gray-900 truncate">{item.email}</p>
                  </div>
                  <p
                    className="text-xs text-gray-400 font-mono truncate mb-1"
                    title={item.user_id}
                  >
                    {item.user_id}
                  </p>
                  {item.reason && (
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Sebep:</span> {item.reason}
                    </p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">{formatDate(item.banned_at)}</p>
                </div>

                <div className="flex gap-2 shrink-0 flex-wrap">
                  <button
                    onClick={() => handleUnban(item)}
                    disabled={actionLoading === item.user_id}
                    className="px-4 py-2 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
                    style={{ backgroundColor: "#f0fdf4", color: "#16a34a" }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#dcfce7")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#f0fdf4")}
                  >
                    {actionLoading === item.user_id ? "…" : "✅ Engeli Kaldır"}
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(item)}
                    disabled={actionLoading === item.user_id}
                    className="px-4 py-2 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
                    style={{ backgroundColor: "#fef2f2", color: "#ef4444" }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#fee2e2")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#fef2f2")}
                  >
                    🗑️ Kalıcı Sil
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete confirmation modal */}
      {deleteConfirm && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div
            className="bg-white rounded-2xl p-6 w-full max-w-sm"
            style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}
          >
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4"
              style={{ backgroundColor: "#fef2f2" }}
            >
              🗑️
            </div>
            <h3 className="text-lg font-bold text-gray-800 text-center mb-2">
              Kullanıcıyı Kalıcı Sil
            </h3>
            <p className="text-sm text-gray-500 text-center mb-1">
              Bu kullanıcıyı tamamen silmek istiyor musunuz?
            </p>
            <p className="text-sm font-semibold text-gray-700 text-center mb-6 break-all">
              {deleteConfirm.email}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                İptal
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                disabled={actionLoading === deleteConfirm.user_id}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white transition-colors disabled:opacity-60"
                style={{ backgroundColor: "#ef4444" }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#dc2626")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#ef4444")}
              >
                {actionLoading === deleteConfirm.user_id ? "Siliniyor…" : "Sil"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
