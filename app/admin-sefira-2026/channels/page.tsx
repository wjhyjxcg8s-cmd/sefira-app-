"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/lib/AuthContext";

const ADMIN_EMAIL = "supportsefira@gmail.com";

interface Announcement {
  id: string;
  title: string;
  message: string;
  created_at: string;
}

export default function ChannelsPage() {
  const { user, session } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTitle, setNewTitle] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editMessage, setEditMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  const token = (session as { access_token?: string } | null)?.access_token ?? "";
  const authHeaders = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };

  useEffect(() => {
    if (user && user.email === ADMIN_EMAIL) {
      fetchAnnouncements();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/channels", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (json.announcements) setAnnouncements(json.announcements);
    } catch {
      // ignore
    }
    setLoading(false);
  };

  const handleCreate = async () => {
    if (!newTitle.trim() || !newMessage.trim()) return;
    setSending(true);
    setFormError(null);
    try {
      const res = await fetch("/api/admin/channels", {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({ title: newTitle.trim(), message: newMessage.trim() }),
      });
      const json = await res.json();
      if (json.error) {
        setFormError(json.error);
      } else {
        setNewTitle("");
        setNewMessage("");
        setFormSuccess("Duyuru tüm kullanıcılara gönderildi!");
        setTimeout(() => setFormSuccess(null), 3000);
        fetchAnnouncements();
      }
    } catch (e) {
      setFormError(String(e));
    }
    setSending(false);
  };

  const handleEdit = (ann: Announcement) => {
    setEditId(ann.id);
    setEditTitle(ann.title);
    setEditMessage(ann.message);
  };

  const handleSaveEdit = async (id: string) => {
    if (!editTitle.trim() || !editMessage.trim()) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/channels/${id}`, {
        method: "PATCH",
        headers: authHeaders,
        body: JSON.stringify({ title: editTitle.trim(), message: editMessage.trim() }),
      });
      const json = await res.json();
      if (!json.error) {
        setEditId(null);
        fetchAnnouncements();
      }
    } catch {
      // ignore
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/channels/${id}`, {
        method: "DELETE",
        headers: authHeaders,
      });
      const json = await res.json();
      if (!json.error) {
        setDeleteConfirmId(null);
        fetchAnnouncements();
      }
    } catch {
      // ignore
    }
    setDeleting(false);
  };

  const formatDate = (d: string) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("tr-TR", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!user) return null;
  if (user.email !== ADMIN_EMAIL) {
    router.replace("/");
    return null;
  }

  const sidebarItems = [
    { id: "dashboard", label: "Dashboard", icon: "📊" },
    { id: "users", label: "Users", icon: "👥" },
    { id: "listings", label: "Listings", icon: "📋" },
    { id: "feedback", label: "Del. Feedback", icon: "💬" },
    { id: "reviews", label: "Reviews", icon: "⭐" },
    { id: "messages", label: "Messages", icon: "✉️" },
    { id: "channels", label: "Kanallarım", icon: "📢" },
  ];

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: "#f8fafc" }}>
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 lg:hidden"
          style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full z-30 flex flex-col lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{
          width: 256,
          backgroundColor: "white",
          boxShadow: "2px 0 16px rgba(0,0,0,0.08)",
          transition: "transform 0.28s cubic-bezier(0.4,0,0.2,1)",
        }}
      >
        <div className="p-5 border-b border-gray-100 flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-base font-black shrink-0"
            style={{ backgroundColor: "#F97316" }}
          >
            S
          </div>
          <div className="min-w-0">
            <p className="font-bold text-gray-800 text-sm leading-tight">Sefira Admin</p>
            <p className="text-xs text-gray-400 leading-tight mt-0.5">Management Panel</p>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {sidebarItems.map((item) => {
            const active = item.id === "channels";
            return (
              <button
                key={item.id}
                onClick={() => {
                  if (active) return;
                  router.push("/admin-sefira-2026");
                  setSidebarOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all text-left"
                style={{
                  backgroundColor: active ? "#F97316" : "transparent",
                  color: active ? "white" : "#374151",
                  boxShadow: active ? "0 2px 8px rgba(249,115,22,0.3)" : "none",
                  cursor: active ? "default" : "pointer",
                }}
                onMouseEnter={(e) => {
                  if (!active) {
                    e.currentTarget.style.backgroundColor = "#ffedd5";
                    e.currentTarget.style.color = "#F97316";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    e.currentTarget.style.backgroundColor = "transparent";
                    e.currentTarget.style.color = "#374151";
                  }
                }}
              >
                <span className="text-base leading-none">{item.icon}</span>
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
              style={{ backgroundColor: "#ffedd5", color: "#F97316" }}
            >
              A
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-gray-700 truncate">Admin</p>
              <p className="text-xs text-gray-400 truncate">{user.email}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-h-screen">
        <style>{`@media (min-width: 1024px) { .channels-main { margin-left: 256px; } }`}</style>
        <div className="channels-main flex-1 flex flex-col min-h-screen">
          <header
            className="sticky top-0 z-10 flex items-center gap-4 px-4 sm:px-6 py-3.5 border-b border-gray-100"
            style={{ backgroundColor: "white", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}
          >
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors -ml-1"
              aria-label="Toggle sidebar"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="flex items-center gap-2">
              <span className="text-base">📢</span>
              <h1 className="text-base font-semibold text-gray-800">Kanallarım</h1>
            </div>
            <div className="ml-auto">
              <span
                className="text-xs font-medium px-2.5 py-1 rounded-full"
                style={{ backgroundColor: "#ffedd5", color: "#F97316" }}
              >
                Admin
              </span>
            </div>
          </header>

          <main className="flex-1 p-4 sm:p-6 lg:p-8">
            {/* Create new announcement */}
            <div
              className="bg-white rounded-2xl p-6 border border-gray-100 mb-8"
              style={{ boxShadow: "0 1px 6px rgba(0,0,0,0.06)" }}
            >
              <h2 className="text-lg font-bold text-gray-800 mb-4">Yeni Duyuru Oluştur</h2>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Başlık"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-800 outline-none transition-colors"
                  style={{ backgroundColor: "#fafafa" }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "#F97316")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "#e5e7eb")}
                />
                <textarea
                  placeholder="Mesaj içeriği..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-800 outline-none transition-colors resize-none"
                  style={{ backgroundColor: "#fafafa" }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "#F97316")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "#e5e7eb")}
                />
                {formError && <p className="text-sm text-red-500">{formError}</p>}
                {formSuccess && <p className="text-sm text-green-600">{formSuccess}</p>}
                <button
                  onClick={handleCreate}
                  disabled={sending || !newTitle.trim() || !newMessage.trim()}
                  className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: "#F97316" }}
                  onMouseEnter={(e) => {
                    if (!sending) e.currentTarget.style.backgroundColor = "#ea6c10";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "#F97316";
                  }}
                >
                  {sending ? "Gönderiliyor..." : "Tüm Kullanıcılara Gönder"}
                </button>
              </div>
            </div>

            {/* Announcements list */}
            <div>
              <h2 className="text-lg font-bold text-gray-800 mb-4">
                Duyurular
                {!loading && (
                  <span className="ml-2 text-sm font-normal text-gray-400">
                    ({announcements.length})
                  </span>
                )}
              </h2>
              {loading ? (
                <div className="text-gray-400 text-sm">Yükleniyor...</div>
              ) : announcements.length === 0 ? (
                <div
                  className="bg-white rounded-2xl p-8 text-center border border-gray-100"
                  style={{ boxShadow: "0 1px 6px rgba(0,0,0,0.06)" }}
                >
                  <div className="text-4xl mb-3">📢</div>
                  <p className="text-gray-500 text-sm">Henüz duyuru yok.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {announcements.map((ann) => (
                    <div
                      key={ann.id}
                      className="bg-white rounded-2xl p-5 border border-gray-100"
                      style={{ boxShadow: "0 1px 6px rgba(0,0,0,0.06)" }}
                    >
                      {editId === ann.id ? (
                        <div className="space-y-3">
                          <input
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-800 outline-none transition-colors"
                            style={{ backgroundColor: "#fafafa" }}
                            onFocus={(e) => (e.currentTarget.style.borderColor = "#F97316")}
                            onBlur={(e) => (e.currentTarget.style.borderColor = "#e5e7eb")}
                          />
                          <textarea
                            value={editMessage}
                            onChange={(e) => setEditMessage(e.target.value)}
                            rows={4}
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-800 outline-none transition-colors resize-none"
                            style={{ backgroundColor: "#fafafa" }}
                            onFocus={(e) => (e.currentTarget.style.borderColor = "#F97316")}
                            onBlur={(e) => (e.currentTarget.style.borderColor = "#e5e7eb")}
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleSaveEdit(ann.id)}
                              disabled={saving}
                              className="px-4 py-2 rounded-xl text-sm font-medium text-white transition-colors disabled:opacity-50"
                              style={{ backgroundColor: "#F97316" }}
                            >
                              {saving ? "Kaydediliyor..." : "Kaydet"}
                            </button>
                            <button
                              onClick={() => setEditId(null)}
                              className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors"
                            >
                              İptal
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-start justify-between gap-4 flex-wrap">
                            <div className="min-w-0">
                              <h3 className="font-semibold text-gray-800 text-sm">{ann.title}</h3>
                              <p className="text-xs text-gray-400 mt-0.5">{formatDate(ann.created_at)}</p>
                            </div>
                            <div className="flex gap-2 shrink-0">
                              <button
                                onClick={() => handleEdit(ann)}
                                className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors"
                              >
                                Düzenle
                              </button>
                              <button
                                onClick={() => setDeleteConfirmId(ann.id)}
                                className="px-3 py-1.5 rounded-lg text-xs font-medium text-red-500 border border-red-100 hover:bg-red-50 transition-colors"
                              >
                                Sil
                              </button>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 mt-3 whitespace-pre-wrap leading-relaxed">
                            {ann.message}
                          </p>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </main>
        </div>
      </div>

      {/* Delete confirm modal */}
      {deleteConfirmId && (
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
            <h3 className="text-lg font-bold text-gray-800 text-center mb-2">Duyuruyu Sil</h3>
            <p className="text-sm text-gray-500 text-center mb-6">
              Bu duyuruyu silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                İptal
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                disabled={deleting}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white transition-colors disabled:opacity-50"
                style={{ backgroundColor: "#ef4444" }}
                onMouseEnter={(e) => {
                  if (!deleting) e.currentTarget.style.backgroundColor = "#dc2626";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#ef4444";
                }}
              >
                {deleting ? "Siliniyor..." : "Sil"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
