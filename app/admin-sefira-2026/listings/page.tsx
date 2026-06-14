"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/lib/AuthContext";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  "https://ceetzophaybywfuhezhv.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNlZXR6b3BoYXlieXdmdWhlemh2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTM1Nzg1NSwiZXhwIjoyMDk0OTMzODU1fQ.Jw1bDN7wqxdqj-OinqK4ll7mV5ka7fT6T-9jORs4x_4",
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const ADMIN_EMAIL = "supportsefira@gmail.com";

interface Listing {
  id: string;
  city: string | null;
  district: string | null;
  country_code: string | null;
  rent: number | null;
  currency: string | null;
  type: string | null;
  house_type: string | null;
  rooms: number | null;
  photos: string[] | null;
  user_id: string;
  created_at: string;
  is_deleted: boolean;
}

function formatDate(d: string) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("tr-TR", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function countryFlag(code: string | null) {
  if (!code || !/^[A-Za-z]{2}$/.test(code)) return "🌍";
  return String.fromCodePoint(
    ...[...code.toUpperCase()].map((c) => 0x1f1e6 - 65 + c.charCodeAt(0))
  );
}

export default function AdminListingsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [listings, setListings] = useState<Listing[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Listing | null>(null);
  const [acting, setActing] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && (!user || user.email !== ADMIN_EMAIL)) {
      router.replace("/");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!user || user.email !== ADMIN_EMAIL) return;
    fetchListings();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  async function fetchListings() {
    setDataLoading(true);
    const { data } = await supabaseAdmin
      .from("listings")
      .select("id, city, district, country_code, rent, currency, type, house_type, rooms, photos, user_id, created_at, is_deleted")
      .order("created_at", { ascending: false });
    setListings((data as Listing[]) ?? []);
    setDataLoading(false);
  }

  async function handleSoftDelete() {
    if (!deleteTarget) return;
    setActing(deleteTarget.id);
    await supabaseAdmin.from("listings").update({ is_deleted: true }).eq("id", deleteTarget.id);
    setListings((prev) => prev.map((l) => l.id === deleteTarget.id ? { ...l, is_deleted: true } : l));
    setDeleteTarget(null);
    setActing(null);
  }

  async function handleRestore(id: string) {
    setActing(id);
    await supabaseAdmin.from("listings").update({ is_deleted: false }).eq("id", id);
    setListings((prev) => prev.map((l) => l.id === id ? { ...l, is_deleted: false } : l));
    setActing(null);
  }

  if (loading || (!user && !loading)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-9 h-9 rounded-full border-4 border-gray-200 border-t-orange-600 animate-spin" />
      </div>
    );
  }

  const filtered = listings.filter((l) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      (l.city ?? "").toLowerCase().includes(q) ||
      (l.district ?? "").toLowerCase().includes(q)
    );
  });

  const deletedCount = listings.filter((l) => l.is_deleted).length;
  const activeCount = listings.length - deletedCount;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4 flex items-center gap-3">
        <button
          onClick={() => router.push("/admin-sefira-2026")}
          className="text-gray-400 hover:text-gray-700 transition-colors"
        >
          ← Geri
        </button>
        <h1 className="text-xl font-bold text-gray-800">İlan Yönetimi</h1>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
        {/* Summary + search */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="bg-white rounded-2xl px-5 py-3 border border-gray-100 shadow-sm flex items-center gap-3 shrink-0 flex-wrap">
            <span className="text-sm text-gray-500">
              <span className="text-2xl font-bold text-orange-600">{activeCount}</span> aktif
            </span>
            <span className="text-gray-300">|</span>
            <span className="text-sm text-gray-500">
              <span className="text-xl font-bold text-red-400">{deletedCount}</span> silindi
            </span>
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Şehre göre ara..."
            className="flex-1 bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
          />
          <button
            onClick={fetchListings}
            className="bg-orange-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-orange-700 transition-colors shrink-0"
          >
            🔄 Yenile
          </button>
        </div>

        {/* List */}
        {dataLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-9 h-9 rounded-full border-4 border-gray-200 border-t-orange-600 animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400 text-sm">İlan bulunamadı</div>
        ) : (
          <div className="space-y-3">
            {filtered.map((l) => (
              <div
                key={l.id}
                className={`bg-white rounded-2xl border overflow-hidden flex gap-0 ${l.is_deleted ? "border-red-200 opacity-70" : "border-gray-100"}`}
                style={{ boxShadow: "0 1px 6px rgba(0,0,0,0.06)" }}
              >
                {/* Thumbnail */}
                <div className="w-24 h-24 shrink-0 bg-gray-100 relative overflow-hidden">
                  {l.photos?.[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={l.photos[0]}
                      alt={l.city ?? ""}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl text-gray-300">
                      🏠
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 px-4 py-3 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-lg leading-none">{countryFlag(l.country_code)}</span>
                        <span className="font-semibold text-sm text-gray-800 truncate">
                          {l.city ?? "—"}
                          {l.district ? ` / ${l.district}` : ""}
                        </span>
                        {l.country_code && (
                          <span className="text-xs text-gray-400">{l.country_code}</span>
                        )}
                        {l.is_deleted && (
                          <span className="px-2 py-0.5 rounded-md text-xs font-bold" style={{ backgroundColor: "#fef2f2", color: "#ef4444" }}>
                            Silindi
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span
                          className="px-2 py-0.5 rounded-md text-xs font-medium"
                          style={{
                            backgroundColor: l.type === "has_place" ? "#f0fdf4" : "#eff6ff",
                            color: l.type === "has_place" ? "#16a34a" : "#2563eb",
                          }}
                        >
                          {l.type === "has_place" ? "Ev Sahibi" : l.type === "needs_place" ? "Kiracı" : l.type ?? "—"}
                        </span>
                        {l.house_type && (
                          <span className="text-xs text-gray-400">{l.house_type}</span>
                        )}
                        {l.rooms != null && (
                          <span className="text-xs text-gray-400">{l.rooms} oda</span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        {l.rent != null && (
                          <span className="text-sm font-bold text-orange-600">
                            {l.rent.toLocaleString()} {l.currency ?? ""}
                          </span>
                        )}
                        <span className="text-xs text-gray-400">{formatDate(l.created_at)}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-1.5 shrink-0">
                      <a
                        href={`/listings/${l.id}?from=admin`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 text-xs font-medium rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors text-center"
                      >
                        Görüntüle
                      </a>
                      {l.is_deleted ? (
                        <button
                          onClick={() => handleRestore(l.id)}
                          disabled={acting === l.id}
                          className="px-3 py-1.5 text-xs font-medium rounded-lg transition-colors text-center disabled:opacity-50"
                          style={{ backgroundColor: "#f0fdf4", color: "#16a34a" }}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#dcfce7")}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#f0fdf4")}
                        >
                          {acting === l.id ? "..." : "Geri Yükle"}
                        </button>
                      ) : (
                        <button
                          onClick={() => setDeleteTarget(l)}
                          disabled={acting === l.id}
                          className="px-3 py-1.5 text-xs font-medium rounded-lg transition-colors text-center disabled:opacity-50"
                          style={{ backgroundColor: "#fef2f2", color: "#ef4444" }}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#fee2e2")}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#fef2f2")}
                        >
                          Sil
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Soft-delete confirm dialog */}
      {deleteTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.55)" }}
          onClick={() => !acting && setDeleteTarget(null)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-sm p-6"
            style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.25)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-gray-800 mb-2">İlanı Gizle</h3>
            <p className="text-sm text-gray-600 mb-5">
              Bu ilanı silmek istediğinize emin misiniz?
              <br />
              <span className="font-medium text-gray-800">
                {deleteTarget.city ?? "—"}
                {deleteTarget.district ? ` / ${deleteTarget.district}` : ""}
              </span>
              <br />
              <span className="text-xs text-gray-400 mt-1 block">İlan gizlenecek; kalıcı silinmeyecek.</span>
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={!!acting}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                İptal
              </button>
              <button
                onClick={handleSoftDelete}
                disabled={!!acting}
                className="flex-1 py-2.5 rounded-xl text-white text-sm font-bold transition-colors disabled:opacity-50"
                style={{ backgroundColor: "#ef4444" }}
                onMouseEnter={(e) => !acting && (e.currentTarget.style.backgroundColor = "#dc2626")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#ef4444")}
              >
                {acting ? "Gizleniyor..." : "Gizle"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
