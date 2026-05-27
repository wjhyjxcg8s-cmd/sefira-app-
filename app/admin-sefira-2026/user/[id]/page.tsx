"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/app/lib/AuthContext";
import { supabase } from "@/app/lib/supabase";

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

  // Messaging
  const [msgTitle, setMsgTitle] = useState("");
  const [msgMessage, setMsgMessage] = useState("");
  const [sendingMsg, setSendingMsg] = useState(false);
  const [msgError, setMsgError] = useState<string | null>(null);
  const [msgSuccess, setMsgSuccess] = useState<string | null>(null);
  const [confirmGlobalMsg, setConfirmGlobalMsg] = useState(false);

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

  // Review actions
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [editReviewText, setEditReviewText] = useState("");
  const [savingReview, setSavingReview] = useState(false);
  const [deleteReviewId, setDeleteReviewId] = useState<string | null>(null);
  const [deletingReview, setDeletingReview] = useState(false);

  useEffect(() => {
    if (!loading && (!user || user.email !== ADMIN_EMAIL)) {
      router.replace("/");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!user || user.email !== ADMIN_EMAIL || !userId) return;
    let cancelled = false;

    const fetchAll = async () => {
      setDataLoading(true);

      // Profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (cancelled) return;

      if (profileData) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const p = profileData as any;
        const prof: UserProfile = {
          id: p.id,
          email: p.email ?? null,
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

        // Fetch real email from auth admin API
        const emailRes = await fetch(`/api/admin/get-user?userId=${userId}`, {
          headers: {
            Authorization: `Bearer ${session?.access_token ?? ""}`,
          },
        });
        if (!cancelled && emailRes.ok) {
          const emailJson = await emailRes.json();
          if (emailJson.email) setUserAuthEmail(emailJson.email);
        }

        // Deletion feedback by email
        if (prof.email) {
          const { data: fbData } = await supabase
            .from("deletion_feedback")
            .select("*")
            .eq("email", prof.email)
            .order("deleted_at", { ascending: false });
          if (!cancelled) setFeedback(fbData ?? []);
        }
      }

      // Reviews by this user
      const { data: reviewsData } = await supabase
        .from("reviews")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      if (!cancelled) setReviews(reviewsData ?? []);

      // Listings by this user
      const { data: listingsData } = await supabase
        .from("listings")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      if (!cancelled) setListings(listingsData ?? []);

      if (!cancelled) setDataLoading(false);
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

    const updates = {
      display_name: editDisplayName || null,
      gender: editGender || null,
      birth_date: editBirthDate || null,
      country: editCountry || null,
    };

    try {
      const res = await fetch("/api/admin/update-user", {
        method: "POST",
        headers: authHeader(),
        body: JSON.stringify({ userId, updates }),
      });
      const json = await res.json();
      if (json.error) {
        setProfileError(json.error);
      } else {
        setProfileSuccess(true);
        setProfile((prev) => (prev ? { ...prev, ...updates } : prev));
        setTimeout(() => setProfileSuccess(false), 3000);
      }
    } catch (e) {
      setProfileError(String(e));
    }
    setProfileSaving(false);
  };

  const handleSendMessage = async (sendToAll: boolean) => {
    if (!msgTitle.trim() || !msgMessage.trim()) {
      setMsgError("Title and message are required.");
      return;
    }
    setSendingMsg(true);
    setMsgError(null);
    setMsgSuccess(null);
    setConfirmGlobalMsg(false);
    try {
      const res = await fetch("/api/admin/send-message", {
        method: "POST",
        headers: authHeader(),
        body: JSON.stringify({
          userId,
          userEmail: userAuthEmail ?? profile?.email,
          title: msgTitle,
          message: msgMessage,
          sendToAll,
        }),
      });
      const json = await res.json();
      if (json.error) {
        setMsgError(json.error);
      } else {
        setMsgSuccess(sendToAll ? "Message sent to all users." : "Message sent to this user.");
        setMsgTitle("");
        setMsgMessage("");
        setTimeout(() => setMsgSuccess(null), 4000);
      }
    } catch (e) {
      setMsgError(String(e));
    }
    setSendingMsg(false);
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

            {/* ── SECTION 2: Send Message ──────────────────────────────── */}
            <SectionCard title="Send Message to User">
              <div className="p-6 space-y-4">
                <Field label="Title">
                  <input
                    value={msgTitle}
                    onChange={(e) => setMsgTitle(e.target.value)}
                    placeholder="Message title"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                  />
                </Field>
                <Field label="Message">
                  <textarea
                    value={msgMessage}
                    onChange={(e) => setMsgMessage(e.target.value)}
                    placeholder="Write your message here…"
                    rows={4}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
                  />
                </Field>

                {msgError && (
                  <p className="text-sm text-red-500">{msgError}</p>
                )}
                {msgSuccess && (
                  <p className="text-sm text-green-600">{msgSuccess}</p>
                )}

                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => handleSendMessage(false)}
                    disabled={sendingMsg}
                    className="px-5 py-2.5 rounded-xl text-sm font-medium text-white transition-colors disabled:opacity-60"
                    style={{ backgroundColor: "#f97316" }}
                    onMouseEnter={(e) => { if (!sendingMsg) e.currentTarget.style.backgroundColor = "#ea6c08"; }}
                    onMouseLeave={(e) => { if (!sendingMsg) e.currentTarget.style.backgroundColor = "#f97316"; }}
                  >
                    {sendingMsg ? "Sending…" : "Send to This User Only"}
                  </button>
                  <button
                    onClick={() => setConfirmGlobalMsg(true)}
                    disabled={sendingMsg}
                    className="px-5 py-2.5 rounded-xl text-sm font-medium text-white transition-colors disabled:opacity-60"
                    style={{ backgroundColor: "#ea580c" }}
                    onMouseEnter={(e) => { if (!sendingMsg) e.currentTarget.style.backgroundColor = "#c2410c"; }}
                    onMouseLeave={(e) => { if (!sendingMsg) e.currentTarget.style.backgroundColor = "#ea580c"; }}
                  >
                    Send to ALL Users
                  </button>
                </div>
              </div>
            </SectionCard>

            {/* ── SECTION 3: Reviews ───────────────────────────────────── */}
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

            {/* ── SECTION 4: Listings ──────────────────────────────────── */}
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

            {/* ── SECTION 5: Deletion Feedback ─────────────────────────── */}
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

            {/* ── SECTION 6: Danger Zone ───────────────────────────────── */}
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
              <div className="px-6 py-5">
                <p className="text-sm text-gray-500 mb-4">
                  Bu işlemler geri alınamaz. Lütfen dikkatli olun.
                </p>
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
        onConfirm={() => handleSendMessage(true)}
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
