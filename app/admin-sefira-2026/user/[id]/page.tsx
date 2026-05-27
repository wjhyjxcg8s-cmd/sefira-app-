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
        <span key={i} style={{ color: i < rating ? "#f59e0b" : "#d1d5db" }}>★</span>
      ))}
    </span>
  );
}

function InfoRow({
  label,
  value,
  capitalize = false,
}: {
  label: string;
  value: string | null | undefined;
  capitalize?: boolean;
}) {
  return (
    <div>
      <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-0.5">{label}</p>
      <p className={`text-sm font-medium text-gray-800 ${capitalize ? "capitalize" : ""}`}>
        {value ?? <span className="text-gray-400 font-normal">—</span>}
      </p>
    </div>
  );
}

export default function UserDetailPage() {
  const { user, session, loading } = useAuth();
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const userId = params.id;

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [feedback, setFeedback] = useState<DeletionFeedback[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  const [editDisplayName, setEditDisplayName] = useState("");
  const [editGender, setEditGender] = useState("");
  const [editBirthDate, setEditBirthDate] = useState("");
  const [editCountry, setEditCountry] = useState("");
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [editSuccess, setEditSuccess] = useState(false);

  const [resetSending, setResetSending] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);

  const [deleteUserConfirm, setDeleteUserConfirm] = useState(false);
  const [deletingUser, setDeletingUser] = useState(false);

  const [deleteListingId, setDeleteListingId] = useState<string | null>(null);
  const [deletingListing, setDeletingListing] = useState(false);

  useEffect(() => {
    if (!loading && (!user || user.email !== ADMIN_EMAIL)) {
      router.replace("/");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!user || user.email !== ADMIN_EMAIL || !userId) return;
    let cancelled = false;

    const fetchData = async () => {
      setDataLoading(true);

      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (cancelled) return;

      if (profileData) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const p = profileData as any;
        const profile: UserProfile = {
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
        setProfile(profile);
        setEditDisplayName(profile.display_name ?? "");
        setEditGender(profile.gender ?? "");
        setEditBirthDate(profile.birth_date ?? "");
        setEditCountry(profile.country ?? "");

        if (profile.email) {
          const { data: fbData } = await supabase
            .from("deletion_feedback")
            .select("*")
            .eq("email", profile.email)
            .order("deleted_at", { ascending: false });
          if (!cancelled) setFeedback(fbData ?? []);
        }
      }

      const { data: listingsData } = await supabase
        .from("listings")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      if (!cancelled) setListings(listingsData ?? []);

      if (!cancelled) setDataLoading(false);
    };

    fetchData();
    return () => { cancelled = true; };
  }, [userId, user]);

  const handleResetPassword = async () => {
    if (!profile?.email) return;
    setResetSending(true);
    setResetError(null);
    setResetSent(false);
    const { error } = await supabase.auth.resetPasswordForEmail(profile.email, {
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
    if (!session?.access_token) return;
    setDeletingUser(true);
    try {
      const res = await fetch(`/admin-sefira-2026/api?type=user&id=${userId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (res.ok) {
        router.replace("/admin-sefira-2026");
        return;
      }
    } catch { /* fall through */ }
    setDeletingUser(false);
    setDeleteUserConfirm(false);
  };

  const handleDeleteListing = async () => {
    if (!deleteListingId || !session?.access_token) return;
    setDeletingListing(true);
    try {
      const res = await fetch(`/admin-sefira-2026/api?type=listing&id=${deleteListingId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (res.ok) {
        setListings((prev) => prev.filter((l) => l.id !== deleteListingId));
        setDeleteListingId(null);
      }
    } catch { /* fall through */ }
    setDeletingListing(false);
  };

  const handleSaveProfile = async () => {
    if (!profile) return;
    setEditSaving(true);
    setEditError(null);
    setEditSuccess(false);
    const { error } = await supabase
      .from("profiles")
      .update({
        display_name: editDisplayName || null,
        gender: editGender || null,
        birth_date: editBirthDate || null,
        country: editCountry || null,
      })
      .eq("id", userId);
    setEditSaving(false);
    if (error) {
      setEditError(error.message);
    } else {
      setEditSuccess(true);
      setProfile((prev) =>
        prev
          ? {
              ...prev,
              display_name: editDisplayName || null,
              gender: editGender || null,
              birth_date: editBirthDate || null,
              country: editCountry || null,
            }
          : prev
      );
      setTimeout(() => setEditSuccess(false), 3000);
    }
  };

  const formatDate = (d: string | null | undefined) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

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
        {/* Back button */}
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
          <div className="text-center py-20 text-gray-400">User not found.</div>
        ) : (
          <div className="space-y-5">

            {/* SECTION 1: Profile Info */}
            <div
              className="bg-white rounded-2xl p-6 border border-gray-100"
              style={{ boxShadow: "0 1px 6px rgba(0,0,0,0.06)" }}
            >
              <h2 className="text-base font-bold text-gray-800 mb-5">Profile Info</h2>
              <div className="flex flex-col sm:flex-row gap-6">
                {/* Avatar */}
                <div className="shrink-0 flex justify-center sm:justify-start">
                  {profile.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt=""
                      className="w-24 h-24 rounded-full object-cover"
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
                      }}
                    >
                      {profile.display_name?.[0]?.toUpperCase() ??
                        profile.email?.[0]?.toUpperCase() ??
                        "?"}
                    </div>
                  )}
                </div>

                {/* Info grid */}
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                  <InfoRow label="Display Name" value={profile.display_name} />
                  <InfoRow label="Email" value={profile.email} />
                  <InfoRow label="Gender" value={profile.gender} capitalize />
                  <InfoRow label="Birth Date" value={formatDate(profile.birth_date)} />
                  <InfoRow label="Country" value={profile.country} />
                  <InfoRow label="Join Date" value={formatDate(profile.created_at)} />
                  <InfoRow label="Last Updated" value={formatDate(profile.updated_at)} />
                </div>
              </div>
            </div>

            {/* SECTION 2: Account Actions */}
            <div
              className="bg-white rounded-2xl p-6 border border-gray-100"
              style={{ boxShadow: "0 1px 6px rgba(0,0,0,0.06)" }}
            >
              <h2 className="text-base font-bold text-gray-800 mb-5">Account Actions</h2>
              <div className="flex flex-wrap gap-3 items-start">
                <div className="flex flex-col gap-1.5">
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
                    {resetSending ? "Sending…" : resetSent ? "Email Sent!" : "Reset Password"}
                  </button>
                  {resetError && (
                    <p className="text-xs text-red-500">{resetError}</p>
                  )}
                </div>

                <button
                  onClick={() => setDeleteUserConfirm(true)}
                  className="px-5 py-2.5 rounded-xl text-sm font-medium transition-colors"
                  style={{ backgroundColor: "#fef2f2", color: "#ef4444" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = "#fee2e2")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "#fef2f2")
                  }
                >
                  Delete Account
                </button>
              </div>
            </div>

            {/* SECTION 3: Listings */}
            <div
              className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
              style={{ boxShadow: "0 1px 6px rgba(0,0,0,0.06)" }}
            >
              <div className="px-6 py-5 border-b border-gray-100">
                <h2 className="text-base font-bold text-gray-800">
                  Listings{" "}
                  <span className="text-sm font-normal text-gray-400">
                    ({listings.length})
                  </span>
                </h2>
              </div>
              {listings.length === 0 ? (
                <div className="px-6 py-10 text-center text-gray-400 text-sm">
                  No listings found.
                </div>
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
                          className="border-t border-gray-50 transition-colors"
                          style={{
                            backgroundColor: i % 2 === 1 ? "#fafafa" : "white",
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
                              style={{ backgroundColor: "#fff7ed", color: "#f97316" }}
                            >
                              {l.listing_type?.replace(/_/g, " ") ?? "—"}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-700">
                            {l.city ?? <span className="text-gray-400">—</span>}
                          </td>
                          <td className="px-4 py-3 text-gray-800 font-semibold">
                            {l.rent != null
                              ? `$${l.rent.toLocaleString()}`
                              : l.price != null
                              ? `$${l.price.toLocaleString()}`
                              : (
                                <span className="text-gray-400 font-normal">—</span>
                              )}
                          </td>
                          <td className="px-4 py-3 text-gray-600">
                            {formatDate(l.created_at)}
                          </td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => setDeleteListingId(l.id)}
                              className="px-3 py-1.5 text-xs font-medium rounded-lg transition-colors"
                              style={{ backgroundColor: "#fef2f2", color: "#ef4444" }}
                              onMouseEnter={(e) =>
                                (e.currentTarget.style.backgroundColor = "#fee2e2")
                              }
                              onMouseLeave={(e) =>
                                (e.currentTarget.style.backgroundColor = "#fef2f2")
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
            </div>

            {/* SECTION 4: Deletion Feedback */}
            {feedback.length > 0 && (
              <div
                className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
                style={{ boxShadow: "0 1px 6px rgba(0,0,0,0.06)" }}
              >
                <div className="px-6 py-5 border-b border-gray-100">
                  <h2 className="text-base font-bold text-gray-800">
                    Deletion Feedback{" "}
                    <span className="text-sm font-normal text-gray-400">
                      ({feedback.length})
                    </span>
                  </h2>
                </div>
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
                                  style={{ backgroundColor: "#f3f4f6", color: "#4b5563" }}
                                >
                                  {r}
                                </span>
                              ))}
                            </div>
                          )}
                          {f.feedback && (
                            <p className="text-sm text-gray-600">{f.feedback}</p>
                          )}
                          {!f.feedback && (!f.reasons || f.reasons.length === 0) && (
                            <p className="text-sm text-gray-400">No feedback text.</p>
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
              </div>
            )}

            {/* SECTION 5: Edit Profile */}
            <div
              className="bg-white rounded-2xl p-6 border border-gray-100"
              style={{ boxShadow: "0 1px 6px rgba(0,0,0,0.06)" }}
            >
              <h2 className="text-base font-bold text-gray-800 mb-5">Edit Profile</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">
                      Display Name
                    </label>
                    <input
                      value={editDisplayName}
                      onChange={(e) => setEditDisplayName(e.target.value)}
                      placeholder="Display name"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">
                      Gender
                    </label>
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
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">
                      Birth Date
                    </label>
                    <input
                      type="date"
                      value={editBirthDate}
                      onChange={(e) => setEditBirthDate(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">
                      Country
                    </label>
                    <input
                      value={editCountry}
                      onChange={(e) => setEditCountry(e.target.value)}
                      placeholder="Country"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                    />
                  </div>
                </div>

                {editError && (
                  <p className="text-sm text-red-500">{editError}</p>
                )}
                {editSuccess && (
                  <p className="text-sm text-green-600">Profile updated successfully.</p>
                )}

                <button
                  onClick={handleSaveProfile}
                  disabled={editSaving}
                  className="px-6 py-2.5 rounded-xl text-sm font-medium text-white transition-colors disabled:opacity-60"
                  style={{ backgroundColor: "#f97316" }}
                  onMouseEnter={(e) => {
                    if (!editSaving)
                      e.currentTarget.style.backgroundColor = "#ea6c08";
                  }}
                  onMouseLeave={(e) => {
                    if (!editSaving)
                      e.currentTarget.style.backgroundColor = "#f97316";
                  }}
                >
                  {editSaving ? "Saving…" : "Save Changes"}
                </button>
              </div>
            </div>

          </div>
        )}
      </div>

      {/* Delete user confirmation modal */}
      {deleteUserConfirm && (
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
              Delete Account
            </h3>
            <p className="text-sm text-gray-500 text-center mb-6">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-gray-700">
                {profile?.display_name ?? profile?.email ?? "this user"}
              </span>
              ? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteUserConfirm(false)}
                disabled={deletingUser}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteUser}
                disabled={deletingUser}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white transition-colors disabled:opacity-60"
                style={{ backgroundColor: "#ef4444" }}
                onMouseEnter={(e) => {
                  if (!deletingUser)
                    e.currentTarget.style.backgroundColor = "#dc2626";
                }}
                onMouseLeave={(e) => {
                  if (!deletingUser)
                    e.currentTarget.style.backgroundColor = "#ef4444";
                }}
              >
                {deletingUser ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete listing confirmation modal */}
      {deleteListingId && (
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
              Delete Listing
            </h3>
            <p className="text-sm text-gray-500 text-center mb-6">
              Are you sure you want to delete this listing? This action cannot be
              undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteListingId(null)}
                disabled={deletingListing}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteListing}
                disabled={deletingListing}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white transition-colors disabled:opacity-60"
                style={{ backgroundColor: "#ef4444" }}
                onMouseEnter={(e) => {
                  if (!deletingListing)
                    e.currentTarget.style.backgroundColor = "#dc2626";
                }}
                onMouseLeave={(e) => {
                  if (!deletingListing)
                    e.currentTarget.style.backgroundColor = "#ef4444";
                }}
              >
                {deletingListing ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
