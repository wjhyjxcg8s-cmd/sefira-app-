"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/app/lib/AuthContext";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  "https://ceetzophaybywfuhezhv.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNlZXR6b3BoYXlieXdmdWhlemh2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTM1Nzg1NSwiZXhwIjoyMDk0OTMzODU1fQ.Jw1bDN7wqxdqj-OinqK4ll7mV5ka7fT6T-9jORs4x_4",
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const ADMIN_EMAIL = "supportsefira@gmail.com";

interface Profile {
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  gender: string | null;
  birth_date: string | null;
  country: string | null;
  created_at: string | null;
}

interface Listing {
  id: string;
  listing_type: string | null;
  city: string | null;
  rent: number | null;
  price: number | null;
  created_at: string;
}

interface Review {
  id: string;
  reviewer_id: string;
  rating: number | null;
  comment: string | null;
  created_at: string;
}

interface UserMessage {
  id: string;
  sender_id?: string | null;
  receiver_id?: string | null;
  recipient_id?: string | null;
  message?: string | null;
  content?: string | null;
  created_at: string;
}

interface AdminMessage {
  id: string;
  user_id?: string | null;
  message?: string | null;
  sender?: string | null;
  title?: string | null;
  is_global?: boolean;
  created_at: string;
}

interface SentMessage {
  id: string;
  content: string | null;
  created_at: string;
  conversation_id: string | null;
}

interface Conversation {
  id: string;
  user1_id: string;
  user2_id: string;
}

function Field({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-0.5">{label}</p>
      <p className="text-sm font-medium text-gray-800">
        {value || <span className="text-gray-400 font-normal italic">—</span>}
      </p>
    </div>
  );
}

export default function UserDetailPage() {
  const { user, session, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;

  const [profile, setProfile] = useState<Profile | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [pageLoading, setPageLoading] = useState(true);

  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editGender, setEditGender] = useState("");
  const [editBirthDate, setEditBirthDate] = useState("");
  const [editCountry, setEditCountry] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);

  const [userMessages, setUserMessages] = useState<UserMessage[]>([]);
  const [adminMessages, setAdminMessages] = useState<AdminMessage[]>([]);
  const [sentMessages, setSentMessages] = useState<SentMessage[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);

  const [deletingListing, setDeletingListing] = useState<string | null>(null);
  const [deletingReview, setDeletingReview] = useState<string | null>(null);

  const [deleteAccountConfirm, setDeleteAccountConfirm] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [deleteAccountMsg, setDeleteAccountMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && (!user || user.email !== ADMIN_EMAIL)) {
      router.replace("/");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!user || user.email !== ADMIN_EMAIL || !userId) return;

    const fetchAll = async () => {
      setPageLoading(true);

      console.log("userId:", userId);

      const [profileRes, listingsRes, reviewsRes, authRes, msgsRes, adminMsgsRes] = await Promise.all([
        supabaseAdmin.from("profiles").select("*").eq("user_id", userId).single(),
        supabaseAdmin.from("listings").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
        supabaseAdmin.from("reviews").select("*").eq("reviewer_id", userId).order("created_at", { ascending: false }),
        supabaseAdmin.auth.admin.getUserById(userId),
        supabaseAdmin.from("messages").select("*").eq("sender_id", userId).order("created_at", { ascending: false }).limit(20),
        supabaseAdmin.from("admin_messages").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
      ]);

      console.log("profile:", profileRes.data, "error:", profileRes.error);
      console.log("auth user:", authRes.data?.user?.email, "error:", authRes.error);
      console.log("messages:", msgsRes.data?.length, "error:", msgsRes.error);
      console.log("admin_messages:", adminMsgsRes.data?.length, "error:", adminMsgsRes.error);

      if (profileRes.data) {
        const p = profileRes.data as Profile;
        setProfile(p);
        setEditName(p.display_name ?? "");
        setEditGender(p.gender ?? "");
        setEditBirthDate(p.birth_date ?? "");
        setEditCountry(p.country ?? "");
      }
      if (listingsRes.data) setListings(listingsRes.data as Listing[]);
      if (reviewsRes.data) setReviews(reviewsRes.data as Review[]);
      if (authRes.data?.user?.email) setEmail(authRes.data.user.email);
      if (msgsRes.data) setUserMessages(msgsRes.data as UserMessage[]);
      if (adminMsgsRes.data) setAdminMessages(adminMsgsRes.data as AdminMessage[]);

      const [sentMsgsRes, convsRes] = await Promise.all([
        supabaseAdmin
          .from("user_messages")
          .select("id, content, created_at, conversation_id")
          .eq("sender_id", userId)
          .order("created_at", { ascending: false })
          .limit(50),
        supabaseAdmin
          .from("conversations")
          .select("id, user1_id, user2_id")
          .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
          .order("updated_at", { ascending: false })
          .limit(20),
      ]);
      if (sentMsgsRes.data) setSentMessages(sentMsgsRes.data as SentMessage[]);
      if (convsRes.data) setConversations(convsRes.data as Conversation[]);

      setPageLoading(false);
    };

    fetchAll();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, user]);

  const handleSave = async () => {
    setSaving(true);
    setSaveMsg(null);
    const updates: Record<string, unknown> = {
      display_name: editName || null,
      gender: editGender || null,
      birth_date: editBirthDate || null,
      country: editCountry || null,
    };
    const res = await fetch("/api/admin/update-user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, updates }),
    });
    const json = await res.json();
    if (json.error) {
      setSaveMsg("Error: " + JSON.stringify(json.error));
    } else {
      setSaveMsg("Saved!");
      setProfile((prev) => (prev ? { ...prev, ...updates } : prev));
      setEditing(false);
      setTimeout(() => setSaveMsg(null), 3000);
    }
    setSaving(false);
  };

  const handleDeleteListing = async (id: string) => {
    if (!confirm("Bu ilanı silmek istiyor musunuz?")) return;
    setDeletingListing(id);
    const { error } = await supabaseAdmin.from("listings").delete().eq("id", id);
    if (!error) setListings((prev) => prev.filter((l) => l.id !== id));
    setDeletingListing(null);
  };

  const handleDeleteReview = async (id: string) => {
    if (!confirm("Bu yorumu silmek istiyor musunuz?")) return;
    setDeletingReview(id);
    const res = await fetch("/api/admin/delete-review", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session?.access_token}`,
      },
      body: JSON.stringify({ reviewId: id }),
    });
    const json = await res.json();
    if (!json.error) setReviews((prev) => prev.filter((r) => r.id !== id));
    setDeletingReview(null);
  };

  const handleDeleteAccount = async () => {
    setDeletingAccount(true);
    setDeleteAccountMsg(null);
    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (error) {
      setDeleteAccountMsg("Error: " + error.message);
      setDeletingAccount(false);
    } else {
      setDeleteAccountMsg("Account deleted.");
      setDeleteAccountConfirm(false);
      setDeletingAccount(false);
      setTimeout(() => router.push("/admin-sefira-2026"), 1500);
    }
  };

  const formatDate = (d: string | null) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  };

  if (loading || pageLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div
          className="w-9 h-9 rounded-full border-4 border-gray-200 border-t-orange-500 animate-spin"
          style={{ animationDuration: "0.7s" }}
        />
      </div>
    );
  }

  if (!user || user.email !== ADMIN_EMAIL) return null;

  const initials = (profile?.display_name ?? email ?? "?")
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header
        className="sticky top-0 z-10 bg-white border-b border-gray-100 px-4 sm:px-6 py-3.5"
        style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}
      >
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <button
            onClick={() => router.push("/admin-sefira-2026")}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
            Admin
          </button>
          <span className="text-gray-300">/</span>
          <span className="text-sm font-semibold text-gray-800 truncate">
            {profile?.display_name ?? email ?? userId}
          </span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">

        {/* ── Profile card ─────────────────────────────────────────────────── */}
        <div
          className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6"
          style={{ boxShadow: "0 1px 6px rgba(0,0,0,0.06)" }}
        >
          <div className="flex flex-col sm:flex-row items-start gap-5">
            <div className="shrink-0">
              {profile?.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profile.avatar_url}
                  alt=""
                  className="w-20 h-20 rounded-full object-cover border-2 border-gray-100"
                />
              ) : (
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-black text-white"
                  style={{ backgroundColor: "#F97316" }}
                >
                  {initials}
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="Display Name" value={profile?.display_name} />
                <Field label="Email" value={email} />
                <Field label="Gender" value={profile?.gender} />
                <Field label="Birth Date" value={profile?.birth_date ? formatDate(profile.birth_date) : null} />
                <Field label="Country" value={profile?.country} />
                <Field label="Joined" value={formatDate(profile?.created_at ?? null)} />
              </div>
              <p className="text-xs text-gray-400 mt-3 font-mono break-all">ID: {userId}</p>
            </div>
          </div>
        </div>

        {/* ── Edit section ─────────────────────────────────────────────────── */}
        <div
          className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6"
          style={{ boxShadow: "0 1px 6px rgba(0,0,0,0.06)" }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-gray-800">Edit Profile</h2>
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="px-4 py-2 rounded-xl text-sm font-bold text-white transition-opacity hover:opacity-90"
                style={{ backgroundColor: "#F97316" }}
              >
                Edit
              </button>
            )}
          </div>

          {editing ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Display Name</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-800 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Gender</label>
                  <select
                    value={editGender}
                    onChange={(e) => setEditGender(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-800 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20"
                  >
                    <option value="">—</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Birth Date</label>
                  <input
                    type="date"
                    value={editBirthDate}
                    onChange={(e) => setEditBirthDate(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-800 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Country</label>
                  <input
                    type="text"
                    value={editCountry}
                    onChange={(e) => setEditCountry(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-800 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20"
                  />
                </div>
              </div>
              {saveMsg && (
                <p className={`text-sm font-medium ${saveMsg.startsWith("Error") ? "text-red-500" : "text-green-600"}`}>
                  {saveMsg}
                </p>
              )}
              <div className="flex gap-3">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-60 transition-opacity hover:opacity-90"
                  style={{ backgroundColor: "#F97316" }}
                >
                  {saving ? "Saving…" : "Save Changes"}
                </button>
                <button
                  onClick={() => { setEditing(false); setSaveMsg(null); }}
                  className="px-5 py-2.5 rounded-xl text-sm font-bold text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-400">Click Edit to modify display name, gender, birth date, or country.</p>
          )}

          {saveMsg && !editing && (
            <p className="mt-3 text-sm font-medium text-green-600">{saveMsg}</p>
          )}
        </div>

        {/* ── Listings ─────────────────────────────────────────────────────── */}
        <div
          className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
          style={{ boxShadow: "0 1px 6px rgba(0,0,0,0.06)" }}
        >
          <div className="px-5 sm:px-6 py-4 border-b border-gray-100">
            <h2 className="text-base font-bold text-gray-800">Listings ({listings.length})</h2>
          </div>
          {listings.length === 0 ? (
            <p className="px-5 sm:px-6 py-8 text-sm text-gray-400 text-center">No listings found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-gray-400 uppercase text-xs">
                    <th className="px-4 py-3 text-left font-semibold">Type</th>
                    <th className="px-4 py-3 text-left font-semibold">City</th>
                    <th className="px-4 py-3 text-left font-semibold">Price</th>
                    <th className="px-4 py-3 text-left font-semibold">Created</th>
                    <th className="px-4 py-3 text-left font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {listings.map((l, i) => (
                    <tr
                      key={l.id}
                      className="border-t border-gray-50 cursor-pointer transition-colors"
                      style={{ backgroundColor: i % 2 === 1 ? "#fafafa" : "white" }}
                      onClick={() => router.push(`/listings/${l.id}`)}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#ffedd5")}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = i % 2 === 1 ? "#fafafa" : "white")}
                    >
                      <td className="px-4 py-3">
                        <span
                          className="px-2.5 py-1 rounded-lg text-xs font-medium capitalize"
                          style={{ backgroundColor: "#ffedd5", color: "#F97316" }}
                        >
                          {l.listing_type?.replace(/_/g, " ") ?? "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-700">{l.city ?? "—"}</td>
                      <td className="px-4 py-3 text-gray-800 font-semibold">
                        {l.rent != null
                          ? `$${l.rent.toLocaleString()}`
                          : l.price != null
                          ? `$${l.price.toLocaleString()}`
                          : "—"}
                      </td>
                      <td className="px-4 py-3 text-gray-500">{formatDate(l.created_at)}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => window.open(`/listings/${l.id}`, "_blank")}
                            className="px-3 py-1.5 text-xs font-medium rounded-lg transition-colors"
                            style={{ backgroundColor: "#eff6ff", color: "#2563eb" }}
                            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#dbeafe")}
                            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#eff6ff")}
                            title="Open in new tab"
                          >
                            👁 View
                          </button>
                          <button
                            onClick={() => handleDeleteListing(l.id)}
                            disabled={deletingListing === l.id}
                            className="px-3 py-1.5 text-xs font-medium rounded-lg transition-colors disabled:opacity-50"
                            style={{ backgroundColor: "#fef2f2", color: "#ef4444" }}
                            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#fee2e2")}
                            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#fef2f2")}
                          >
                            {deletingListing === l.id ? "…" : "🗑️ Sil"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ── Reviews ──────────────────────────────────────────────────────── */}
        <div
          className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
          style={{ boxShadow: "0 1px 6px rgba(0,0,0,0.06)" }}
        >
          <div className="px-5 sm:px-6 py-4 border-b border-gray-100">
            <h2 className="text-base font-bold text-gray-800">Reviews Left by User ({reviews.length})</h2>
          </div>
          {reviews.length === 0 ? (
            <p className="px-5 sm:px-6 py-8 text-sm text-gray-400 text-center">No reviews found.</p>
          ) : (
            <div className="divide-y divide-gray-50">
              {reviews.map((r) => (
                <div key={r.id} className="px-5 sm:px-6 py-4 flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {r.rating != null && (
                        <span className="text-sm font-bold" style={{ color: "#f59e0b" }}>
                          {"★".repeat(r.rating)}{"☆".repeat(Math.max(0, 5 - r.rating))}
                        </span>
                      )}
                      <span className="text-xs text-gray-400">{formatDate(r.created_at)}</span>
                    </div>
                    {r.comment && <p className="text-sm text-gray-700">{r.comment}</p>}
                  </div>
                  <button
                    onClick={() => handleDeleteReview(r.id)}
                    disabled={deletingReview === r.id}
                    className="shrink-0 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors disabled:opacity-50"
                    style={{ backgroundColor: "#fef2f2", color: "#ef4444" }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#fee2e2")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#fef2f2")}
                  >
                    {deletingReview === r.id ? "…" : "🗑️ Sil"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Messages ─────────────────────────────────────────────────────── */}
        <div
          className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
          style={{ boxShadow: "0 1px 6px rgba(0,0,0,0.06)" }}
        >
          <div className="px-5 sm:px-6 py-4 border-b border-gray-100">
            <h2 className="text-base font-bold text-gray-800">
              Messages Sent ({userMessages.length + adminMessages.filter(m => m.sender === "user").length})
            </h2>
          </div>

          {userMessages.length === 0 && adminMessages.filter(m => m.sender === "user").length === 0 ? (
            <p className="px-5 sm:px-6 py-8 text-sm text-gray-400 text-center">No messages found.</p>
          ) : (
            <div className="divide-y divide-gray-50">
              {/* User→User messages */}
              {userMessages.map((m) => {
                const body = m.message ?? m.content ?? "";
                const recipient = m.receiver_id ?? m.recipient_id ?? null;
                return (
                  <div key={m.id} className="px-5 sm:px-6 py-3 flex items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                        <span className="text-xs font-semibold text-gray-500">To:</span>
                        <span className="text-xs text-gray-700 font-mono truncate">{recipient ?? "—"}</span>
                        <span className="text-xs text-gray-400 ml-auto shrink-0">{formatDate(m.created_at)}</span>
                      </div>
                      <p className="text-sm text-gray-700 line-clamp-2">
                        {body ? body.slice(0, 100) + (body.length > 100 ? "…" : "") : <span className="text-gray-400 italic">—</span>}
                      </p>
                    </div>
                    <span
                      className="shrink-0 px-2 py-0.5 rounded-full text-xs font-medium"
                      style={{ backgroundColor: "#eff6ff", color: "#2563eb" }}
                    >
                      user msg
                    </span>
                  </div>
                );
              })}
              {/* User→Admin messages */}
              {adminMessages.filter(m => m.sender === "user").map((m) => {
                const body = m.message ?? "";
                return (
                  <div key={m.id} className="px-5 sm:px-6 py-3 flex items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                        <span className="text-xs font-semibold text-gray-500">To:</span>
                        <span className="text-xs text-gray-700">Admin</span>
                        {m.title && <span className="text-xs text-gray-400">· {m.title}</span>}
                        <span className="text-xs text-gray-400 ml-auto shrink-0">{formatDate(m.created_at)}</span>
                      </div>
                      <p className="text-sm text-gray-700 line-clamp-2">
                        {body ? body.slice(0, 100) + (body.length > 100 ? "…" : "") : <span className="text-gray-400 italic">—</span>}
                      </p>
                    </div>
                    <span
                      className="shrink-0 px-2 py-0.5 rounded-full text-xs font-medium"
                      style={{ backgroundColor: "#ffedd5", color: "#F97316" }}
                    >
                      to admin
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Tüm Mesajlar (user_messages) ─────────────────────────────────── */}
        <div
          className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
          style={{ boxShadow: "0 1px 6px rgba(0,0,0,0.06)" }}
        >
          <div className="px-5 sm:px-6 py-4 border-b border-gray-100 flex items-center gap-2">
            <h2 className="text-base font-bold text-gray-800">💬 Tüm Mesajlar</h2>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-gray-100 text-gray-500">
              {sentMessages.length}
            </span>
          </div>
          {sentMessages.length === 0 ? (
            <p className="px-5 sm:px-6 py-8 text-sm text-gray-400 text-center">Bu kullanıcının mesajı yok</p>
          ) : (
            <div className="px-5 sm:px-6 py-4 space-y-2">
              {sentMessages.map((m) => {
                const body = m.content ?? "";
                return (
                  <div key={m.id} className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm text-gray-700">
                      {body ? body.slice(0, 100) + (body.length > 100 ? "…" : "") : <span className="text-gray-400 italic">—</span>}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">{formatDate(m.created_at)}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Konuşmalar (conversations) ───────────────────────────────────── */}
        <div
          className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
          style={{ boxShadow: "0 1px 6px rgba(0,0,0,0.06)" }}
        >
          <div className="px-5 sm:px-6 py-4 border-b border-gray-100 flex items-center gap-2">
            <h2 className="text-base font-bold text-gray-800">🗣 Konuşmalar</h2>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-gray-100 text-gray-500">
              {conversations.length}
            </span>
          </div>
          {conversations.length === 0 ? (
            <p className="px-5 sm:px-6 py-8 text-sm text-gray-400 text-center">Konuşma bulunamadı</p>
          ) : (
            <div className="divide-y divide-gray-50">
              {conversations.map((c) => {
                const otherId = c.user1_id === userId ? c.user2_id : c.user1_id;
                return (
                  <div key={c.id} className="px-5 sm:px-6 py-3 flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-400 font-mono truncate">Konuşma: {c.id.slice(0, 16)}…</p>
                      <button
                        onClick={() => router.push(`/admin-sefira-2026/user/${otherId}`)}
                        className="text-blue-600 hover:text-blue-800 hover:underline text-xs font-semibold transition-colors font-mono"
                      >
                        Karşı taraf: {otherId.slice(0, 16)}…
                      </button>
                    </div>
                    <span className="shrink-0 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
                      konuşma
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Delete Account ───────────────────────────────────────────────── */}
        <div
          className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6"
          style={{ boxShadow: "0 1px 6px rgba(0,0,0,0.06)" }}
        >
          <h2 className="text-base font-bold text-gray-800 mb-1">Danger Zone</h2>
          <p className="text-sm text-gray-400 mb-4">Permanently delete this account and all associated data. This cannot be undone.</p>

          {deleteAccountMsg && (
            <p className={`text-sm font-medium mb-3 ${deleteAccountMsg.startsWith("Error") ? "text-red-500" : "text-green-600"}`}>
              {deleteAccountMsg}
            </p>
          )}

          {!deleteAccountConfirm ? (
            <button
              onClick={() => setDeleteAccountConfirm(true)}
              className="px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: "#ef4444" }}
            >
              🗑️ Delete Account
            </button>
          ) : (
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-sm font-semibold text-red-600">Emin misiniz? Bu işlem geri alınamaz.</span>
              <button
                onClick={handleDeleteAccount}
                disabled={deletingAccount}
                className="px-5 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-60 transition-opacity hover:opacity-90"
                style={{ backgroundColor: "#ef4444" }}
              >
                {deletingAccount ? "Deleting…" : "Evet, Sil"}
              </button>
              <button
                onClick={() => setDeleteAccountConfirm(false)}
                className="px-5 py-2.5 rounded-xl text-sm font-bold text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                İptal
              </button>
            </div>
          )}
        </div>

      </main>
    </div>
  );
}
