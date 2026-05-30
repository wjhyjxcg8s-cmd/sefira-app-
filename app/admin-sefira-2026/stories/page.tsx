"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/lib/AuthContext";
import { createClient } from "@supabase/supabase-js";
import Image from "next/image";

const supabaseAdmin = createClient(
  "https://ceetzophaybywfuhezhv.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNlZXR6b3BoYXlieXdmdWhlemh2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTM1Nzg1NSwiZXhwIjoyMDk0OTMzODU1fQ.Jw1bDN7wqxdqj-OinqK4ll7mV5ka7fT6T-9jORs4x_4",
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const ADMIN_EMAIL = "supportsefira@gmail.com";

interface WeeklyStory {
  id: string;
  image_url: string;
  caption: string | null;
  week_label: string | null;
  created_at: string;
}

export default function StoriesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [stories, setStories] = useState<WeeklyStory[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [weekLabel, setWeekLabel] = useState("Bu Hafta");

  useEffect(() => {
    if (user && user.email === ADMIN_EMAIL) {
      fetchStories();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchStories = async () => {
    setLoading(true);
    const { data, error: fetchErr } = await supabaseAdmin
      .from("weekly_stories")
      .select("*")
      .order("created_at", { ascending: false });
    if (!fetchErr && data) setStories(data);
    setLoading(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setSelectedFile(file);
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) { setError("Lütfen bir görsel seçin."); return; }
    setUploading(true);
    setError(null);
    setSuccess(null);

    const ext = selectedFile.name.split(".").pop() ?? "jpg";
    const fileName = `story-${Date.now()}.${ext}`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from("stories")
      .upload(fileName, selectedFile, { contentType: selectedFile.type, upsert: false });

    if (uploadError) {
      setError(`Yükleme hatası: ${uploadError.message}`);
      setUploading(false);
      return;
    }

    const { data: urlData } = supabaseAdmin.storage.from("stories").getPublicUrl(fileName);

    const { error: insertError } = await supabaseAdmin.from("weekly_stories").insert([{
      image_url: urlData.publicUrl,
      caption: caption.trim() || null,
      week_label: weekLabel.trim() || "Bu Hafta",
    }]);

    if (insertError) {
      setError(`Kayıt hatası: ${insertError.message}`);
      setUploading(false);
      return;
    }

    setSuccess("Hikaye başarıyla yüklendi!");
    setSelectedFile(null);
    setPreviewUrl(null);
    setCaption("");
    setWeekLabel("Bu Hafta");
    if (fileInputRef.current) fileInputRef.current.value = "";
    fetchStories();
    setUploading(false);
  };

  const handleDelete = async (story: WeeklyStory) => {
    if (!confirm("Bu hikayeyi silmek istediğinize emin misiniz?")) return;
    setDeleting(story.id);

    const fileName = story.image_url.split("/").pop();
    if (fileName) {
      await supabaseAdmin.storage.from("stories").remove([fileName]);
    }

    await supabaseAdmin.from("weekly_stories").delete().eq("id", story.id);
    setStories((prev) => prev.filter((s) => s.id !== story.id));
    setDeleting(null);
  };

  // ── Auth guard ────────────────────────────────────────────────────────────
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="w-9 h-9 rounded-full border-4 border-gray-200 border-t-orange-500 animate-spin" style={{ animationDuration: "0.7s" }} />
      </div>
    );
  }
  if (user.email !== ADMIN_EMAIL) {
    router.replace("/");
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside
        className="fixed top-0 left-0 h-full z-30 flex flex-col"
        style={{ width: 256, backgroundColor: "white", boxShadow: "2px 0 16px rgba(0,0,0,0.08)" }}
      >
        <div className="p-5 border-b border-gray-100 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-base font-black shrink-0" style={{ backgroundColor: "#f97316" }}>
            S
          </div>
          <div className="min-w-0">
            <p className="font-bold text-gray-800 text-sm leading-tight">Sefira Admin</p>
            <p className="text-xs text-gray-400 leading-tight mt-0.5">Management Panel</p>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {[
            { label: "Dashboard", icon: "📊", href: "/admin-sefira-2026" },
            { label: "Users", icon: "👥", href: "/admin-sefira-2026" },
            { label: "Kanallarım", icon: "📢", href: "/admin-sefira-2026/channels" },
            { label: "Engelliler", icon: "🚫", href: "/admin-sefira-2026/banned" },
            { label: "Hikayeler", icon: "📸", href: "/admin-sefira-2026/stories", active: true },
          ].map((item) => (
            <button
              key={item.label}
              onClick={() => router.push(item.href)}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all text-left"
              style={{
                backgroundColor: item.active ? "#f97316" : "transparent",
                color: item.active ? "white" : "#374151",
                boxShadow: item.active ? "0 2px 8px rgba(249,115,22,0.3)" : "none",
              }}
              onMouseEnter={(e) => {
                if (!item.active) { e.currentTarget.style.backgroundColor = "#fff7ed"; e.currentTarget.style.color = "#f97316"; }
              }}
              onMouseLeave={(e) => {
                if (!item.active) { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "#374151"; }
              }}
            >
              <span className="text-base leading-none">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0" style={{ backgroundColor: "#fff7ed", color: "#f97316" }}>A</div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-gray-700 truncate">Admin</p>
              <p className="text-xs text-gray-400 truncate">{user.email}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen" style={{ marginLeft: 256 }}>
        <header
          className="sticky top-0 z-10 flex items-center gap-4 px-6 py-3.5 border-b border-gray-100"
          style={{ backgroundColor: "white", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}
        >
          <h1 className="text-lg font-bold text-gray-800">📸 Haftalık Hikayeler</h1>
        </header>

        <main className="flex-1 p-6 max-w-3xl mx-auto w-full">

          {/* Upload form */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-8" style={{ boxShadow: "0 1px 6px rgba(0,0,0,0.06)" }}>
            <h2 className="text-base font-bold text-gray-800 mb-5">Yeni Hikaye Yükle</h2>

            {/* Image picker */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Görsel</label>
              <div
                className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center cursor-pointer hover:border-orange-300 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                {previewUrl ? (
                  <div className="relative w-32 h-32 mx-auto rounded-xl overflow-hidden">
                    <Image src={previewUrl} alt="Önizleme" fill className="object-cover" />
                  </div>
                ) : (
                  <>
                    <div className="text-3xl mb-2">📷</div>
                    <p className="text-sm text-gray-500">JPG, PNG veya WebP seçin</p>
                    <p className="text-xs text-gray-400 mt-1">Tıkla veya sürükle</p>
                  </>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>

            {/* Caption */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Açıklama (isteğe bağlı)</label>
              <input
                type="text"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="İstanbul'da harika bir arkadaşlık 🏠"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20"
              />
            </div>

            {/* Week label */}
            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Hafta Etiketi</label>
              <input
                type="text"
                value={weekLabel}
                onChange={(e) => setWeekLabel(e.target.value)}
                placeholder="Bu Hafta"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20"
              />
            </div>

            {error && (
              <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">{error}</div>
            )}
            {success && (
              <div className="mb-4 px-4 py-3 rounded-xl bg-green-50 border border-green-200 text-sm text-green-700">{success}</div>
            )}

            <button
              onClick={handleUpload}
              disabled={uploading || !selectedFile}
              className="w-full py-3 rounded-xl text-white text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: "#f97316", boxShadow: uploading || !selectedFile ? "none" : "0 4px 12px rgba(249,115,22,0.3)" }}
            >
              {uploading ? "Yükleniyor…" : "Yükle"}
            </button>
          </div>

          {/* Stories grid */}
          <h2 className="text-base font-bold text-gray-800 mb-4">Yüklenen Hikayeler ({stories.length})</h2>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 rounded-full border-4 border-gray-200 border-t-orange-500 animate-spin" style={{ animationDuration: "0.7s" }} />
            </div>
          ) : stories.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center text-gray-400 text-sm">
              Henüz hikaye yüklenmemiş.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {stories.map((story) => (
                <div key={story.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden" style={{ boxShadow: "0 1px 6px rgba(0,0,0,0.06)" }}>
                  <div className="relative w-full aspect-square">
                    <Image src={story.image_url} alt={story.caption ?? "Hikaye"} fill className="object-cover" />
                  </div>
                  <div className="p-3">
                    {story.week_label && (
                      <span className="text-xs font-semibold text-orange-500">{story.week_label}</span>
                    )}
                    {story.caption && (
                      <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">{story.caption}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(story.created_at).toLocaleDateString("tr-TR", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                    <button
                      onClick={() => handleDelete(story)}
                      disabled={deleting === story.id}
                      className="mt-2 w-full py-1.5 rounded-lg text-xs font-semibold text-white bg-red-500 hover:bg-red-600 transition-colors disabled:opacity-50"
                    >
                      {deleting === story.id ? "Siliniyor…" : "Sil"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
