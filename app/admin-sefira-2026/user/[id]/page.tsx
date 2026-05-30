"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/app/lib/AuthContext";
import { supabase } from "@/app/lib/supabase";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  "https://ceetzophaybywfuhezhv.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNlZXR6b3BoYXlieXdmdWhlemh2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTM1Nzg1NSwiZXhwIjoyMDk0OTMzODU1fQ.Jw1bDN7wqxdqj-OinqK4ll7mV5ka7fT6T-9jORs4x_4",
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const ADMIN_EMAIL = "supportsefira@gmail.com";

interface UserProfile {
  id: string;
  email: string | null;
  display_name: string | null;
  avatar_url: string | null;
  gender: string | null;
  birth_date: string | null;
  country: string | null;
  created_at: string;
  updated_at: string | null;
}

interface Review {
  id: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

interface Listing {
  id: string;
  listing_type: string | null;
  city: string | null;
  rent: number | null;
  price: number | null;
  created_at: string;
}

interface DeletionFeedback {
  id: string;
  email: string;
  reasons: string[] | null;
  rating: number | null;
  feedback: string | null;
  deleted_at: string;
}

interface AdminMessage {
  id: string;
  user_id: string | null;
  email: string | null;
  title: string;
  message: string;
  is_global: boolean;
  created_at: string;
  sender: "admin" | "user" | null;
}

function StarRating({ rating }: { rating: number | null }) {
  if (rating === null) return <span className="text-gray-400">—</span>;
  return (
    <span className="text-base leading-none">
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} style={{ color: i < rating ? "#f59e0b" : "#d1d5db" }}>
          ★
        </span>
      ))}
    </span>
  );
}

function SectionCard({
  title,
  count,
  children,
}: {
  title: string;
  count?: number;
  children: React.ReactNode;
}) {
  return (
    <div
      className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
      style={{ boxShadow: "0 1px 6px rgba(0,0,0,0.06)" }}
    >
      <div className="px-6 py-4 border-b border-gray-100">
        <h2 className="text-base font-bold text-gray-800">
          {title}
          {count !== undefined && (
            <span className="ml-2 text-sm font-normal text-gray-400">
              ({count})
            </span>
          )}
        </h2>
      </div>
      {children}
    </div>
  );
}

function ConfirmModal({
  open,
  title,
  body,
  confirmLabel,
  cancelLabel,
  dangerous,
  loading,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  body: React.ReactNode;
  confirmLabel: string;
  cancelLabel: string;
  dangerous?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!open) return null;
  return (
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
          style={{ backgroundColor: dangerous ? "#fef2f2" : "#f3f4f6" }}
        >
          {dangerous ? "🗑️" : "⚠️"}
        </div>
        <h3 className="text-lg font-bold text-gray-800 text-center mb-2">
          {title}
        </h3>
        <div className="text-sm text-gray-500 text-center mb-6">{body}</div>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-60"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white transition-colors disabled:opacity-60"
            style={{ backgroundColor: dangerous ? "#ef4444" : "#f97316" }}
            onMouseEnter={(e) => {
              if (!loading)
                e.currentTarget.style.backgroundColor = dangerous
                  ? "#dc2626"
                  : "#ea6c08";
            }}
            onMouseLeave={(e) => {
              if (!loading)
                e.currentTarget.style.backgroundColor = dangerous
                  ? "#ef4444"
                  : "#f97316";
            }}
          >
            {loading ? "…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function UserDetailPage() {
  const { user, session, loading } = useAuth();
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const userId = params.id;

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [userAuthEmail, setUserAuthEmail] = useState<string | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [feedback, setFeedback] = useState<DeletionFeedback[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  // Profile edit
  const [editDisplayName, setEditDisplayName] = useState("");
  const [editGender, setEditGender] = useState("");
  const [editBirthDate, setEditBirthDate] = useState("");
  const [editCountry, setEditCountry] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = useState(false);

  // Global announcement form
  const [msgTitle, setMsgTitle] = useState("");
  const [msgMessage, setMsgMessage] = useState("");
  const [sendingMsg, setSendingMsg] = useState(false);
  const [msgError, setMsgError] = useState<string | null>(null);
  const [msgSuccess, setMsgSuccess] = useState<string | null>(null);
  const [confirmGlobalMsg, setConfirmGlobalMsg] = useState(false);

  // Conversation thread
  const [chatThread, setChatThread] = useState<AdminMessage[]>([]);
  const [adminReply, setAdminReply] = useState("");
  const [sendingReply, setSendingReply] = useState(false);
  const [deleteMsgId, setDeleteMsgId] = useState<string | null>(null);
  const [deletingMsg, setDeletingMsg] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Password reset
  const [resetSending, setResetSending] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);

  // Delete user
  const [deleteUserConfirm, setDeleteUserConfirm] = useState(false);
  const [deletingUser, setDeletingUser] = useState(false);

  // Delete listing
  const [deleteListingId, setDeleteListingId] = useState<string | null>(null);
  const [deletingListing, setDeletingListing] = useState(false);

  // Support chat history
  const [chatHistory, setChatHistory] = useState<AdminMessage[]>([]);
  const [supportInput, setSupportInput] = useState("");
  const [sendingSupport, setSendingSupport] = useState(false);

  // Review actions
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [editReviewText, setEditReviewText] = useState("");
  const [savingReview, setSavingReview] = useState(false);
  const [deleteReviewId, setDeleteReviewId] = useState<string | null>(null);
  const [deletingReview, setDeletingReview] = useState(false);

  // Ban
  const [isBanned, setIsBanned] = useState(false);
  const [banRecord, setBanRecord] = useState<{ reason: string | null; banned_at: string } | null>(null);
  const [showBanInput, setShowBanInput] = useState(false);
  const [banReason, setBanReason] = useState("");
  const [banning, setBanning] = useState(false);
  const [unbanning, setUnbanning] = useState(false);
  const [banActionError, setBanActionError] = useState<string | null>(null);
  const [banActionSuccess, setBanActionSuccess] = useState<string | null>(null);


  useEffect(() => {
    if (!loading && (!user || user.email !== ADMIN_EMAIL)) {
      router.replace("/");
    }
  }, [user, loading, router]);

  useEffect(() => {
    const fetchChat = async () => {
      const { data, error } = await supabaseAdmin
        .from('admin_messages')
        .select('*')
        .eq('user_id', userId)
        .eq('is_global', false)
        .order('created_at', { ascending: true })
      console.log('Chat history:', data?.length, error?.message)
      if (data) setChatHistory(data as AdminMessage[])
    }
    fetchChat()
  }, [userId])

  useEffect(() => {
    if (!user || user.email !== ADMIN_EMAIL || !userId) return;
    let cancelled = false;

    const fetchAll = async () => {
      setDataLoading(true);
      try {

      // Profile — use service role to bypass RLS, filter by user_id column
      const { data: profileData, error: profileError } = await supabaseAdmin
        .from("profiles")
        .select("*")
        .eq("user_id", userId)
        .single();

      console.log('detail page id from url:', userId);
      console.log('profile result:', profileData, 'error:', profileError);

      if (cancelled) return;

      // Always fetch real email from auth (works even when profiles row is missing)
      const { data: { user: authUser } } = await supabaseAdmin.auth.admin.getUserById(userId)
      const authEmail = authUser?.email ?? null
      if (!cancelled && authEmail) setUserAuthEmail(authEmail)

      // Ban status
      const emailForBan = authEmail ?? (profileData as { email?: string } | null)?.email
      if (emailForBan && !cancelled) {
        const { data: banData } = await supabaseAdmin
          .from("banned_emails")
          .select("*")
          .eq("email", emailForBan)
          .single();
        setIsBanned(!!banData);
        setBanRecord(banData ?? null);
      }

      if (profileData) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const p = profileData as any;
        const prof: UserProfile = {
          id: p.id,
          email: p.email ?? authEmail,
          display_name: p.display_name ?? null,
          avatar_url: p.avatar_url ?? null,
          gender: p.gender ?? null,
          birth_date: p.birth_date ?? null,
          country: p.country ?? null,
          created_at: p.created_at,
          updated_at: p.updated_at ?? null,
        };
        setProfile(prof);
        setEditDisplayName(prof.display_name ?? "");
        setEditGender(prof.gender ?? "");
        setEditBirthDate(prof.birth_date ?? "");
        setEditCountry(prof.country ?? "");

        // Deletion feedback by email
        const emailForFeedback = prof.email ?? authEmail
        if (emailForFeedback) {
          const { data: fbData, error: fbError } = await supabaseAdmin
            .from("deletion_feedback")
            .select("*")
            .eq("email", emailForFeedback)
            .order("deleted_at", { ascending: false });
          console.log('feedback data:', fbData?.length, 'error:', fbError?.message);
          if (!cancelled) setFeedback(fbData ?? []);
        }
      } else if (authUser) {
        // No profiles row — build minimal profile from auth data so page renders
        const minProf: UserProfile = {
          id: authUser.id,
          email: authEmail,
          display_name: null,
          avatar_url: null,
          gender: null,
          birth_date: null,
          country: null,
          created_at: authUser.created_at,
          updated_at: null,
        }
        if (!cancelled) {
          setProfile(minProf)
          setUserAuthEmail(authEmail)
        }
      }

      // Reviews by this user
      const { data: reviewsData } = await supabaseAdmin
        .from("reviews")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      if (!cancelled) setReviews(reviewsData ?? []);

      // Listings by this user
      const { data: listingsData } = await supabaseAdmin
        .from("listings")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      if (!cancelled) setListings(listingsData ?? []);

      // Conversation thread with this user
      const { data: chatData } = await supabaseAdmin
        .from("admin_messages")
        .select("*")
        .eq("user_id", userId)
        .eq("is_global", false)
        .order("created_at", { ascending: true });
      if (!cancelled) setChatThread(chatData ?? []);

      } catch (e) {
        console.error('fetchAll error:', e);
      } finally {
        if (!cancelled) setDataLoading(false);
      }
    };

    fetchAll();
    return () => {
      cancelled = true;
    };
  }, [userId, user]);

  const authHeader = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${session?.access_token ?? ""}`,
  });

  const handleSaveProfile = async () => {
    if (!profile) return;
    setProfileSaving(true);
    setProfileError(null);
    setProfileSuccess(false);

    try {
      const res = await fetch('/api/admin/update-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userId,
          updates: {
            display_name: editDisplayName,
            gender: editGender,
            birth_date: editBirthDate,
            country: editCountry,
          }
        })
      });
      const result = await res.json();
      console.log('Save result:', result);
      if (result.error) {
        alert('Error: ' + JSON.stringify(result.error));
      } else {
        alert('Kaydedildi!');
        setProfile((prev) => prev ? {
          ...prev,
          display_name: editDisplayName || null,
          gender: editGender || null,
          birth_date: editBirthDate || null,
          country: editCountry || null,
        } : prev);
      }
    } catch (e) {
      alert('Error: ' + String(e));
    }
    setProfileSaving(false);
  };

  const refetchChatThread = async () => {
    const { data } = await supabase
      .from("admin_messages")
      .select("*")
      .eq("user_id", userId)
      .eq("is_global", false)
      .order("created_at", { ascending: true });
    setChatThread(data ?? []);
    setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
  };

  const handleSendReply = async () => {
    if (!adminReply.trim() || sendingReply) return;
    setSendingReply(true);
    const text = adminReply.trim();
    setAdminReply("");
    const { data: { session } } = await supabase.auth.getSession();
    const res = await fetch("/api/admin/send-message", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session?.access_token}`,
      },
      body: JSON.stringify({
        userId,
        userEmail: "",
        title: "reply",
        message: text,
        sendToAll: false,
      }),
    });
    const result = await res.json();
    if (!result.error) {
      await refetchChatThread();
    }
    setSendingReply(false);
  };

  const handleDeleteMsg = async () => {
    if (!deleteMsgId) return;
    setDeletingMsg(true);
    try {
      const res = await fetch("/api/admin/delete-messages", {
        method: "POST",
        headers: authHeader(),
        body: JSON.stringify({ action: "delete_selected", ids: [deleteMsgId] }),
      });
      const json = await res.json();
      if (!json.error) {
        setChatThread((prev) => prev.filter((m) => m.id !== deleteMsgId));
        setDeleteMsgId(null);
      }
    } catch { /* fall through */ }
    setDeletingMsg(false);
  };

  const handleSendToAll = async () => {
    const session = (await supabase.auth.getSession()).data.session;
    const res = await fetch('/api/admin/send-message', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session?.access_token}`
      },
      body: JSON.stringify({
        title: msgTitle,
        message: msgMessage,
        sendToAll: true
      })
    });
    const result = await res.json();
    alert(result.error ? 'Error: ' + result.error : 'Sent to all!');
  };

  const handleResetPassword = async () => {
    const emailToReset = userAuthEmail ?? profile?.email;
    if (!emailToReset) return;
    setResetSending(true);
    setResetError(null);
    setResetSent(false);
    const { error } = await supabase.auth.resetPasswordForEmail(emailToReset, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setResetSending(false);
    if (error) {
      setResetError(error.message);
    } else {
      setResetSent(true);
    }
  };

  const handleDeleteUser = async () => {
    setDeletingUser(true);
    try {
      const res = await fetch("/api/admin/delete-user", {
        method: "POST",
        headers: authHeader(),
        body: JSON.stringify({ userId }),
      });
      const json = await res.json();
      if (!json.error) {
        router.replace("/admin-sefira-2026");
        return;
      }
    } catch { /* fall through */ }
    setDeletingUser(false);
    setDeleteUserConfirm(false);
  };

  const handleDeleteListing = async () => {
    if (!deleteListingId) return;
    setDeletingListing(true);
    try {
      const res = await fetch(
        `/admin-sefira-2026/api?type=listing&id=${deleteListingId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${session?.access_token ?? ""}` },
        }
      );
      if (res.ok) {
        setListings((prev) => prev.filter((l) => l.id !== deleteListingId));
        setDeleteListingId(null);
      }
    } catch { /* fall through */ }
    setDeletingListing(false);
  };

  const startEditReview = (review: Review) => {
    setEditingReviewId(review.id);
    setEditReviewText(
      review.comment ?? review.text ?? review.feedback ?? review.body ?? ""
    );
  };

  const handleSaveReview = async (reviewId: string) => {
    setSavingReview(true);
    try {
      const res = await fetch("/api/admin/delete-review", {
        method: "POST",
        headers: authHeader(),
        body: JSON.stringify({
          reviewId,
          updates: { comment: editReviewText },
        }),
      });
      const json = await res.json();
      if (!json.error) {
        setReviews((prev) =>
          prev.map((r) =>
            r.id === reviewId ? { ...r, comment: editReviewText } : r
          )
        );
        setEditingReviewId(null);
      }
    } catch { /* fall through */ }
    setSavingReview(false);
  };

  const handleDeleteReview = async () => {
    if (!deleteReviewId) return;
    setDeletingReview(true);
    try {
      const res = await fetch("/api/admin/delete-review", {
        method: "POST",
        headers: authHeader(),
        body: JSON.stringify({ reviewId: deleteReviewId }),
      });
      const json = await res.json();
      if (!json.error) {
        setReviews((prev) => prev.filter((r) => r.id !== deleteReviewId));
        setDeleteReviewId(null);
      }
    } catch { /* fall through */ }
    setDeletingReview(false);
  };

  const handleBanUser = async () => {
    const email = userAuthEmail ?? profile?.email;
    if (!email) return;
    setBanning(true);
    setBanActionError(null);
    setBanActionSuccess(null);
    try {
      const { data: { session: s } } = await supabase.auth.getSession();
      const res = await fetch("/api/admin/ban-user", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${s?.access_token}` },
        body: JSON.stringify({ userId, email, reason: banReason.trim() || "Banned by admin" }),
      });
      const json = await res.json();
      if (json.error) {
        setBanActionError(json.error);
      } else {
        setIsBanned(true);
        setBanRecord({ reason: banReason.trim() || "Banned by admin", banned_at: new Date().toISOString() });
        setShowBanInput(false);
        setBanReason("");
        setBanActionSuccess("User banned successfully.");
        setTimeout(() => setBanActionSuccess(null), 4000);
      }
    } catch (e) {
      setBanActionError(String(e));
    }
    setBanning(false);
  };

  const handleUnbanUser = async () => {
    const email = userAuthEmail ?? profile?.email;
    if (!email) return;
    setUnbanning(true);
    setBanActionError(null);
    setBanActionSuccess(null);
    try {
      const { data: { session: s } } = await supabase.auth.getSession();
      const res = await fetch("/api/admin/ban-user", {
        method: "DELETE",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${s?.access_token}` },
        body: JSON.stringify({ userId, email }),
      });
      const json = await res.json();
      if (json.error) {
        setBanActionError(json.error);
      } else {
        setIsBanned(false);
        setBanRecord(null);
        setBanActionSuccess("User unbanned successfully.");
        setTimeout(() => setBanActionSuccess(null), 4000);
      }
    } catch (e) {
      setBanActionError(String(e));
    }
    setUnbanning(false);
  };

  const formatDate = (d: string | null | undefined) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const reviewText = (r: Review) =>
    r.comment ?? r.text ?? r.feedback ?? r.body ?? null;

  const reviewerName = (r: Review) =>
    r.reviewer_name ?? r.author_name ?? r.name ?? null;

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div
          className="w-9 h-9 rounded-full border-4 border-gray-200 border-t-orange-500 animate-spin"
          style={{ animationDuration: "0.7s" }}
        />
      </div>
    );
  }

  if (user.email !== ADMIN_EMAIL) return null;

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f8fafc" }}>
      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Back */}
        <button
          onClick={() => router.push("/admin-sefira-2026")}
          className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-orange-500 transition-colors mb-6"
        >
          <span>←</span>
          <span>Back to Users</span>
        </button>

        {dataLoading ? (
          <div className="flex items-center justify-center h-64">
            <div
              className="w-9 h-9 rounded-full border-4 border-gray-200 border-t-orange-500 animate-spin"
              style={{ animationDuration: "0.7s" }}
            />
          </div>
        ) : !profile ? (
          <div className="text-center py-20 text-gray-400">
            User not found.
          </div>
        ) : (
          <div className="space-y-5">

            {/* ── SECTION 1: Profile (display + edit) ─────────────────── */}
            <SectionCard title="Profile">
              <div className="p-6">
                {/* Avatar + static info */}
                <div className="flex flex-col sm:flex-row gap-5 mb-6">
                  <div className="shrink-0 flex justify-center sm:justify-start">
                    {profile.avatar_url ? (
                      <img
                        src={profile.avatar_url}
                        alt=""
                        className="rounded-full object-cover"
                        style={{ width: 100, height: 100 }}
                      />
                    ) : (
                      <div
                        className="rounded-full flex items-center justify-center text-3xl font-bold"
                        style={{
                          width: 100,
                          height: 100,
                          backgroundColor: "#fff7ed",
                          color: "#f97316",
                          flexShrink: 0,
                        }}
                      >
                        {profile.display_name?.[0]?.toUpperCase() ??
                          profile.email?.[0]?.toUpperCase() ??
                          "?"}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 text-sm">
                    <StaticField label="Email (read-only)" value={userAuthEmail ?? profile.email} />
                    <StaticField
                      label="Join Date"
                      value={formatDate(profile.created_at)}
                    />
                    <StaticField
                      label="Last Updated"
                      value={formatDate(profile.updated_at)}
                    />
                  </div>
                </div>

                {/* Editable fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <Field label="Display Name">
                    <input
                      value={editDisplayName}
                      onChange={(e) => setEditDisplayName(e.target.value)}
                      placeholder="Display name"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                    />
                  </Field>
                  <Field label="Gender">
                    <select
                      value={editGender}
                      onChange={(e) => setEditGender(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white"
                    >
                      <option value="">— Not set —</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </Field>
                  <Field label="Birth Date">
                    <input
                      type="date"
                      value={editBirthDate}
                      onChange={(e) => setEditBirthDate(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                    />
                  </Field>
                  <Field label="Country">
                    <input
                      value={editCountry}
                      onChange={(e) => setEditCountry(e.target.value)}
                      placeholder="Country"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                    />
                  </Field>
                </div>

                {profileError && (
                  <p className="text-sm text-red-500 mb-3">{profileError}</p>
                )}
                {profileSuccess && (
                  <p className="text-sm text-green-600 mb-3">
                    Profile saved successfully.
                  </p>
                )}

                <div className="flex flex-wrap gap-3 items-center">
                  <button
                    onClick={handleSaveProfile}
                    disabled={profileSaving}
                    className="px-6 py-2.5 rounded-xl text-sm font-medium text-white transition-colors disabled:opacity-60"
                    style={{ backgroundColor: "#f97316" }}
                    onMouseEnter={(e) => {
                      if (!profileSaving)
                        e.currentTarget.style.backgroundColor = "#ea6c08";
                    }}
                    onMouseLeave={(e) => {
                      if (!profileSaving)
                        e.currentTarget.style.backgroundColor = "#f97316";
                    }}
                  >
                    {profileSaving ? "Saving…" : "Save Changes"}
                  </button>

                  <div className="flex flex-col gap-1">
                    <button
                      onClick={handleResetPassword}
                      disabled={resetSending || resetSent}
                      className="px-5 py-2.5 rounded-xl text-sm font-medium text-white transition-colors disabled:opacity-60"
                      style={{ backgroundColor: "#3b82f6" }}
                      onMouseEnter={(e) => {
                        if (!resetSending && !resetSent)
                          e.currentTarget.style.backgroundColor = "#2563eb";
                      }}
                      onMouseLeave={(e) => {
                        if (!resetSending && !resetSent)
                          e.currentTarget.style.backgroundColor = "#3b82f6";
                      }}
                    >
                      {resetSending
                        ? "Sending…"
                        : resetSent
                        ? "Email Sent!"
                        : "Reset Password"}
                    </button>
                    {resetError && (
                      <p className="text-xs text-red-500">{resetError}</p>
                    )}
                  </div>
                </div>
              </div>
            </SectionCard>

            {/* ── SECTION 2: Global Announcement ──────────────────────── */}
            <SectionCard title="Send Global Announcement">
              <div className="p-6 space-y-4">
                <Field label="Title">
                  <input
                    value={msgTitle}
                    onChange={(e) => setMsgTitle(e.target.value)}
                    placeholder="Announcement title"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                  />
                </Field>
                <Field label="Message">
                  <textarea
                    value={msgMessage}
                    onChange={(e) => setMsgMessage(e.target.value)}
                    placeholder="Write your announcement here…"
                    rows={3}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
                  />
                </Field>

                {msgError && <p className="text-sm text-red-500">{msgError}</p>}
                {msgSuccess && <p className="text-sm text-green-600">{msgSuccess}</p>}

                <button
                  onClick={handleSendToAll}
                  disabled={sendingMsg}
                  className="px-5 py-2.5 rounded-xl text-sm font-medium text-white transition-colors disabled:opacity-60"
                  style={{ backgroundColor: "#ea580c" }}
                  onMouseEnter={(e) => { if (!sendingMsg) e.currentTarget.style.backgroundColor = "#c2410c"; }}
                  onMouseLeave={(e) => { if (!sendingMsg) e.currentTarget.style.backgroundColor = "#ea580c"; }}
                >
                  {sendingMsg ? "Sending…" : "Send to ALL Users"}
                </button>
              </div>
            </SectionCard>

            {/* ── Support Chat ─────────────────────────────────────────── */}
            <SectionCard title={`Support Chat (${chatHistory.length})`}>
              <div
                className="px-4 py-4 flex flex-col gap-3 overflow-y-auto"
                style={{ maxHeight: "28rem", minHeight: "8rem", background: "#f8fafc" }}
              >
                {chatHistory.length === 0 && (
                  <p className="text-center text-gray-400 text-sm py-6">
                    No messages yet.
                  </p>
                )}
                {chatHistory.map((m) => {
                  const isUser = m.sender === "user";
                  return (
                    <div
                      key={m.id}
                      className={`flex w-full ${isUser ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`flex items-end gap-2 max-w-[75%] ${isUser ? "flex-row-reverse" : ""}`}
                      >
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mb-1 ${
                            isUser
                              ? "bg-gradient-to-br from-orange-400 to-orange-600"
                              : "bg-gradient-to-br from-gray-400 to-gray-500"
                          }`}
                        >
                          {isUser ? "U" : "S"}
                        </div>
                        <div
                          className={`flex flex-col gap-1 ${isUser ? "items-end" : "items-start"}`}
                        >
                          <div
                            className={`rounded-2xl px-4 py-2.5 shadow-sm ${
                              isUser
                                ? "bg-orange-500 text-white rounded-br-sm"
                                : "bg-white text-gray-800 rounded-bl-sm"
                            }`}
                          >
                            <div className="text-[11px] font-bold mb-1 opacity-70">
                              {isUser ? "Kullanıcı" : "Sefira Destek"}
                            </div>
                            <p className="text-sm leading-relaxed whitespace-pre-line">
                              {m.message}
                            </p>
                          </div>
                          <span className="text-[11px] text-gray-400 px-1">
                            {formatDate(m.created_at)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="px-4 py-3 border-t border-gray-100 bg-white">
                <div className="flex gap-2">
                  <input
                    value={supportInput}
                    onChange={(e) => setSupportInput(e.target.value)}
                    onKeyDown={async (e) => {
                      if (e.key === "Enter") {
                        if (!supportInput.trim() || sendingSupport) return;
                        setSendingSupport(true);
                        const text = supportInput.trim();
                        setSupportInput("");
                        const { data: { session: s } } = await supabase.auth.getSession();
                        const res = await fetch("/api/admin/send-message", {
                          method: "POST",
                          headers: { "Content-Type": "application/json", Authorization: `Bearer ${s?.access_token}` },
                          body: JSON.stringify({ userId, userEmail: "", title: "reply", message: text, sendToAll: false, sender: "admin" }),
                        });
                        const result = await res.json();
                        if (!result.error) {
                          const { data } = await supabaseAdmin.from('admin_messages').select('*').eq('user_id', userId).eq('is_global', false).order('created_at', { ascending: true });
                          if (data) setChatHistory(data as AdminMessage[]);
                        }
                        setSendingSupport(false);
                      }
                    }}
                    placeholder="Type a reply…"
                    className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                  />
                  <button
                    onClick={async () => {
                      if (!supportInput.trim() || sendingSupport) return;
                      setSendingSupport(true);
                      const text = supportInput.trim();
                      setSupportInput("");
                      const { data: { session: s } } = await supabase.auth.getSession();
                      const res = await fetch("/api/admin/send-message", {
                        method: "POST",
                        headers: { "Content-Type": "application/json", Authorization: `Bearer ${s?.access_token}` },
                        body: JSON.stringify({ userId, userEmail: "", title: "reply", message: text, sendToAll: false, sender: "admin" }),
                      });
                      const result = await res.json();
                      if (!result.error) {
                        const { data } = await supabaseAdmin.from('admin_messages').select('*').eq('user_id', userId).eq('is_global', false).order('created_at', { ascending: true });
                        if (data) setChatHistory(data as AdminMessage[]);
                      }
                      setSendingSupport(false);
                    }}
                    disabled={!supportInput.trim() || sendingSupport}
                    className="px-4 py-2.5 rounded-xl text-sm font-medium text-white transition-colors disabled:opacity-60"
                    style={{ backgroundColor: "#f97316" }}
                    onMouseEnter={(e) => { if (!sendingSupport) e.currentTarget.style.backgroundColor = "#ea6c08"; }}
                    onMouseLeave={(e) => { if (!sendingSupport) e.currentTarget.style.backgroundColor = "#f97316"; }}
                  >
                    {sendingSupport ? "…" : "Send Reply"}
                  </button>
                </div>
              </div>
            </SectionCard>

            {/* ── SECTION 3: Conversation ──────────────────────────────── */}
            <SectionCard title={`Conversation (${chatThread.length})`}>
              {/* Chat thread */}
              <div
                className="px-4 py-4 flex flex-col gap-3 overflow-y-auto"
                style={{ maxHeight: "28rem", minHeight: "8rem", background: "#f8fafc" }}
              >
                {chatThread.length === 0 && (
                  <p className="text-center text-gray-400 text-sm py-6">
                    No messages yet. Start the conversation below.
                  </p>
                )}
                {chatThread.map((m) => {
                  const isAdmin = m.sender === "admin" || m.sender === null;
                  return (
                    <div
                      key={m.id}
                      className={`flex w-full ${isAdmin ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`flex items-end gap-2 max-w-[75%] ${isAdmin ? "flex-row-reverse" : ""}`}
                      >
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mb-1 ${
                            isAdmin
                              ? "bg-gradient-to-br from-orange-400 to-orange-600"
                              : "bg-gradient-to-br from-gray-400 to-gray-500"
                          }`}
                        >
                          {isAdmin ? "A" : "U"}
                        </div>
                        <div
                          className={`flex flex-col gap-1 ${isAdmin ? "items-end" : "items-start"}`}
                        >
                          <div
                            className={`rounded-2xl px-4 py-2.5 shadow-sm ${
                              isAdmin
                                ? "bg-orange-500 text-white rounded-br-sm"
                                : "bg-white text-gray-800 rounded-bl-sm"
                            }`}
                          >
                            <p className="text-sm leading-relaxed whitespace-pre-line">
                              {m.message}
                            </p>
                          </div>
                          <div className={`flex items-center gap-2 px-1 ${isAdmin ? "flex-row-reverse" : ""}`}>
                            <span className="text-[11px] text-gray-400">
                              {formatDate(m.created_at)}
                            </span>
                            <button
                              onClick={() => setDeleteMsgId(m.id)}
                              className="text-[11px] text-red-400 hover:text-red-600 transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={chatEndRef} />
              </div>

              {/* Reply input */}
              <div className="px-4 py-3 border-t border-gray-100 bg-white">
                <div className="flex gap-2">
                  <textarea
                    value={adminReply}
                    onChange={(e) => setAdminReply(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendReply();
                      }
                    }}
                    placeholder="Type a reply…"
                    rows={2}
                    className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
                  />
                  <button
                    onClick={handleSendReply}
                    disabled={!adminReply.trim() || sendingReply}
                    className="px-4 py-2.5 rounded-xl text-sm font-medium text-white transition-colors disabled:opacity-60 self-end"
                    style={{ backgroundColor: "#f97316" }}
                    onMouseEnter={(e) => { if (!sendingReply) e.currentTarget.style.backgroundColor = "#ea6c08"; }}
                    onMouseLeave={(e) => { if (!sendingReply) e.currentTarget.style.backgroundColor = "#f97316"; }}
                  >
                    {sendingReply ? "…" : "Send"}
                  </button>
                </div>
              </div>
            </SectionCard>

            {/* ── SECTION 5: Reviews ───────────────────────────────────── */}
            <SectionCard title="Reviews" count={reviews.length}>
              {reviews.length === 0 ? (
                <p className="px-6 py-8 text-center text-gray-400 text-sm">
                  No reviews found.
                </p>
              ) : (
                <div className="divide-y divide-gray-50">
                  {reviews.map((r) => (
                    <div key={r.id} className="px-6 py-4">
                      {editingReviewId === r.id ? (
                        /* Edit mode */
                        <div className="space-y-2">
                          <textarea
                            value={editReviewText}
                            onChange={(e) => setEditReviewText(e.target.value)}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleSaveReview(r.id)}
                              disabled={savingReview}
                              className="px-4 py-1.5 rounded-lg text-xs font-medium text-white disabled:opacity-60"
                              style={{ backgroundColor: "#f97316" }}
                            >
                              {savingReview ? "Saving…" : "Save"}
                            </button>
                            <button
                              onClick={() => setEditingReviewId(null)}
                              className="px-4 py-1.5 rounded-lg text-xs font-medium text-gray-600 border border-gray-200 hover:bg-gray-50"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* Display mode */
                        <div className="flex items-start justify-between gap-4 flex-wrap">
                          <div className="flex-1 min-w-0 space-y-1">
                            {reviewerName(r) && (
                              <p className="text-xs font-semibold text-gray-500">
                                {reviewerName(r)}
                              </p>
                            )}
                            <StarRating rating={r.rating ?? null} />
                            {reviewText(r) && (
                              <p className="text-sm text-gray-700 mt-1">
                                {reviewText(r)}
                              </p>
                            )}
                            <p className="text-xs text-gray-400">
                              {formatDate(r.created_at)}
                            </p>
                          </div>
                          <div className="flex gap-2 shrink-0">
                            <button
                              onClick={() => startEditReview(r)}
                              className="px-3 py-1.5 text-xs font-medium rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => setDeleteReviewId(r.id)}
                              className="px-3 py-1.5 text-xs font-medium rounded-lg transition-colors"
                              style={{
                                backgroundColor: "#fef2f2",
                                color: "#ef4444",
                              }}
                              onMouseEnter={(e) =>
                                (e.currentTarget.style.backgroundColor =
                                  "#fee2e2")
                              }
                              onMouseLeave={(e) =>
                                (e.currentTarget.style.backgroundColor =
                                  "#fef2f2")
                              }
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </SectionCard>

            {/* ── SECTION 6: Listings ──────────────────────────────────── */}
            <SectionCard title="Listings" count={listings.length}>
              {listings.length === 0 ? (
                <p className="px-6 py-8 text-center text-gray-400 text-sm">
                  No listings found.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 text-gray-400 uppercase text-xs">
                        <th className="px-4 py-3 text-left font-semibold">
                          Type
                        </th>
                        <th className="px-4 py-3 text-left font-semibold">
                          City
                        </th>
                        <th className="px-4 py-3 text-left font-semibold">
                          Price
                        </th>
                        <th className="px-4 py-3 text-left font-semibold">
                          Created
                        </th>
                        <th className="px-4 py-3 text-left font-semibold">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {listings.map((l, i) => (
                        <tr
                          key={l.id}
                          className="border-t border-gray-50 transition-colors"
                          style={{
                            backgroundColor:
                              i % 2 === 1 ? "#fafafa" : "white",
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.backgroundColor = "#fff7ed")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.backgroundColor =
                              i % 2 === 1 ? "#fafafa" : "white")
                          }
                        >
                          <td className="px-4 py-3">
                            <span
                              className="px-2.5 py-1 rounded-lg text-xs font-medium capitalize"
                              style={{
                                backgroundColor: "#fff7ed",
                                color: "#f97316",
                              }}
                            >
                              {l.listing_type?.replace(/_/g, " ") ?? "—"}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-700">
                            {l.city ?? (
                              <span className="text-gray-400">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-gray-800 font-semibold">
                            {l.rent != null
                              ? `$${l.rent.toLocaleString()}`
                              : l.price != null
                              ? `$${l.price.toLocaleString()}`
                              : (
                                <span className="text-gray-400 font-normal">
                                  —
                                </span>
                              )}
                          </td>
                          <td className="px-4 py-3 text-gray-600">
                            {formatDate(l.created_at)}
                          </td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => setDeleteListingId(l.id)}
                              className="px-3 py-1.5 text-xs font-medium rounded-lg transition-colors"
                              style={{
                                backgroundColor: "#fef2f2",
                                color: "#ef4444",
                              }}
                              onMouseEnter={(e) =>
                                (e.currentTarget.style.backgroundColor =
                                  "#fee2e2")
                              }
                              onMouseLeave={(e) =>
                                (e.currentTarget.style.backgroundColor =
                                  "#fef2f2")
                              }
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </SectionCard>

            {/* ── SECTION 7: Deletion Feedback ─────────────────────────── */}
            {feedback.length > 0 && (
              <SectionCard title="Deletion Feedback" count={feedback.length}>
                <div className="divide-y divide-gray-50">
                  {feedback.map((f) => (
                    <div key={f.id} className="px-6 py-4">
                      <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div className="flex-1 space-y-2 min-w-0">
                          {f.reasons && f.reasons.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {f.reasons.map((r, ri) => (
                                <span
                                  key={ri}
                                  className="px-2 py-0.5 rounded-md text-xs"
                                  style={{
                                    backgroundColor: "#f3f4f6",
                                    color: "#4b5563",
                                  }}
                                >
                                  {r}
                                </span>
                              ))}
                            </div>
                          )}
                          {f.feedback ? (
                            <p className="text-sm text-gray-600">{f.feedback}</p>
                          ) : (
                            !f.reasons?.length && (
                              <p className="text-sm text-gray-400">
                                No feedback text.
                              </p>
                            )
                          )}
                        </div>
                        <div className="text-right shrink-0">
                          <StarRating rating={f.rating} />
                          <p className="text-xs text-gray-400 mt-1">
                            {formatDate(f.deleted_at)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </SectionCard>
            )}

            {/* ── SECTION 8: Danger Zone ───────────────────────────────── */}
            <div
              className="bg-white rounded-2xl border overflow-hidden"
              style={{
                borderColor: "#fecaca",
                boxShadow: "0 1px 6px rgba(239,68,68,0.08)",
              }}
            >
              <div
                className="px-6 py-4 border-b"
                style={{ borderColor: "#fecaca", backgroundColor: "#fff5f5" }}
              >
                <h2 className="text-base font-bold" style={{ color: "#ef4444" }}>
                  Tehlikeli İşlemler
                </h2>
              </div>
              <div className="px-6 py-5 space-y-5">
                <p className="text-sm text-gray-500">
                  Bu işlemler geri alınamaz. Lütfen dikkatli olun.
                </p>

                {/* ── Ban / Unban ── */}
                <div className="border border-red-100 rounded-xl p-4 bg-red-50/40">
                  <div className="flex items-center justify-between flex-wrap gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-700">Kullanıcı Yasağı</span>
                      {isBanned && (
                        <span
                          className="px-2 py-0.5 rounded-full text-xs font-bold"
                          style={{ backgroundColor: "#fef2f2", color: "#ef4444", border: "1px solid #fecaca" }}
                        >
                          ⛔ BANNED
                        </span>
                      )}
                    </div>
                    {isBanned ? (
                      <button
                        onClick={handleUnbanUser}
                        disabled={unbanning}
                        className="px-4 py-2 rounded-xl text-sm font-semibold text-white transition-colors disabled:opacity-60"
                        style={{ backgroundColor: "#16a34a" }}
                        onMouseEnter={(e) => { if (!unbanning) e.currentTarget.style.backgroundColor = "#15803d"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#16a34a"; }}
                      >
                        {unbanning ? "Kaldırılıyor…" : "✅ Yasağı Kaldır"}
                      </button>
                    ) : (
                      <button
                        onClick={() => setShowBanInput((v) => !v)}
                        className="px-4 py-2 rounded-xl text-sm font-semibold text-white transition-colors"
                        style={{ backgroundColor: "#ef4444" }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#dc2626")}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#ef4444")}
                      >
                        🚫 Kullanıcıyı Yasakla
                      </button>
                    )}
                  </div>

                  {isBanned && banRecord && (
                    <div className="text-xs text-gray-500 space-y-0.5 mt-1">
                      {banRecord.reason && <p><span className="font-medium">Sebep:</span> {banRecord.reason}</p>}
                      {banRecord.banned_at && <p><span className="font-medium">Tarih:</span> {formatDate(banRecord.banned_at)}</p>}
                    </div>
                  )}

                  {!isBanned && showBanInput && (
                    <div className="mt-3 space-y-2">
                      <input
                        type="text"
                        value={banReason}
                        onChange={(e) => setBanReason(e.target.value)}
                        placeholder="Yasak sebebi (opsiyonel)"
                        className="w-full px-3 py-2 rounded-xl border border-red-200 text-sm outline-none focus:border-red-400 bg-white"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={handleBanUser}
                          disabled={banning}
                          className="px-4 py-2 rounded-xl text-sm font-semibold text-white transition-colors disabled:opacity-60"
                          style={{ backgroundColor: "#ef4444" }}
                        >
                          {banning ? "Yasaklanıyor…" : "Onayla ve Yasakla"}
                        </button>
                        <button
                          onClick={() => { setShowBanInput(false); setBanReason(""); }}
                          className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors"
                        >
                          İptal
                        </button>
                      </div>
                    </div>
                  )}

                  {banActionError && <p className="text-xs text-red-600 mt-2">{banActionError}</p>}
                  {banActionSuccess && <p className="text-xs text-green-600 mt-2">{banActionSuccess}</p>}
                </div>

                {/* ── Delete account ── */}
                <button
                  onClick={() => setDeleteUserConfirm(true)}
                  className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors"
                  style={{ backgroundColor: "#ef4444" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = "#dc2626")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "#ef4444")
                  }
                >
                  Hesabı Sil
                </button>
              </div>
            </div>

          </div>
        )}
      </div>

      {/* ── Modals ─────────────────────────────────────────────────────── */}

      <ConfirmModal
        open={confirmGlobalMsg}
        title="Send to ALL Users"
        body={
          <>
            This will send the message to every user on the platform.
            <br />
            <span className="font-semibold text-orange-600">This action cannot be undone.</span>
          </>
        }
        confirmLabel="Yes, Send to All"
        cancelLabel="Cancel"
        loading={sendingMsg}
        onConfirm={handleSendToAll}
        onCancel={() => setConfirmGlobalMsg(false)}
      />

      <ConfirmModal
        open={deleteUserConfirm}
        title="Hesabı Sil"
        body={
          <>
            Bu kullanıcıyı tamamen silmek istediğinizden emin misiniz?
            <br />
            <span className="font-semibold text-gray-700">
              {profile?.display_name ?? profile?.email ?? "Bu kullanıcı"}
            </span>{" "}
            hesabı kalıcı olarak silinecek.
            <br />
            <span className="font-semibold text-red-500">
              Bu işlem geri alınamaz.
            </span>
          </>
        }
        confirmLabel="Evet, Sil"
        cancelLabel="İptal"
        dangerous
        loading={deletingUser}
        onConfirm={handleDeleteUser}
        onCancel={() => setDeleteUserConfirm(false)}
      />

      <ConfirmModal
        open={!!deleteListingId}
        title="Delete Listing"
        body="Are you sure you want to delete this listing? This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        dangerous
        loading={deletingListing}
        onConfirm={handleDeleteListing}
        onCancel={() => setDeleteListingId(null)}
      />

      <ConfirmModal
        open={!!deleteReviewId}
        title="Delete Review"
        body="Are you sure you want to delete this review? This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        dangerous
        loading={deletingReview}
        onConfirm={handleDeleteReview}
        onCancel={() => setDeleteReviewId(null)}
      />

      <ConfirmModal
        open={!!deleteMsgId}
        title="Delete Message"
        body="Are you sure you want to delete this message? This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        dangerous
        loading={deletingMsg}
        onConfirm={handleDeleteMsg}
        onCancel={() => setDeleteMsgId(null)}
      />
    </div>
  );
}

function StaticField({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  return (
    <div>
      <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-0.5">
        {label}
      </p>
      <p className="text-sm font-medium text-gray-700">
        {value ?? <span className="text-gray-400 font-normal">—</span>}
      </p>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">
        {label}
      </label>
      {children}
    </div>
  );
}
