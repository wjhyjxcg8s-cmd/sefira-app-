"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/lib/AuthContext";
import { supabase } from "@/app/lib/supabase";

const ADMIN_EMAIL = "supportsefira@gmail.com";
const PAGE_SIZE = 20;

type Section = "dashboard" | "users" | "listings" | "feedback" | "reviews" | "messages";

interface Stats {
  totalUsers: number;
  totalListings: number;
  totalDeletionFeedback: number;
  newUsersThisWeek: number;
}

interface UserRecord {
  id: string;
  user_id: string;
  email: string;
  display_name: string | null;
  avatar_url: string | null;
  gender: string | null;
  birth_date: string | null;
  country: string | null;
  created_at: string;
}

interface ListingRecord {
  id: string;
  user_email: string;
  user_id: string;
  listing_type: string | null;
  city: string | null;
  rent: number | null;
  price: number | null;
  created_at: string;
}

interface FeedbackRecord {
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

function Pagination({
  page,
  total,
  onPageChange,
}: {
  page: number;
  total: number;
  onPageChange: (p: number) => void;
}) {
  const totalPages = Math.ceil(total / PAGE_SIZE);
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
      <p className="text-sm text-gray-500">
        Showing {Math.min((page - 1) * PAGE_SIZE + 1, total)}–{Math.min(page * PAGE_SIZE, total)} of{" "}
        {total}
      </p>
      <div className="flex gap-2">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 text-gray-600 disabled:opacity-40 hover:border-orange-400 hover:text-orange-500 transition-colors"
        >
          Previous
        </button>
        <span className="px-3 py-1.5 text-sm text-gray-500">
          {page} / {totalPages}
        </span>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 text-gray-600 disabled:opacity-40 hover:border-orange-400 hover:text-orange-500 transition-colors"
        >
          Next
        </button>
      </div>
    </div>
  );
}

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center h-64">
      <div
        className="w-9 h-9 rounded-full border-4 border-gray-200 border-t-orange-500 animate-spin"
        style={{ animationDuration: "0.7s" }}
      />
    </div>
  );
}

function EmptyRow({ cols, message }: { cols: number; message: string }) {
  return (
    <tr>
      <td colSpan={cols} className="px-4 py-10 text-center text-gray-400 text-sm">
        {message}
      </td>
    </tr>
  );
}

export default function AdminPage() {
  const { user, session, loading } = useAuth();
  const router = useRouter();

  const [activeSection, setActiveSection] = useState<Section>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    type: string;
    id: string;
    userId?: string;
    name?: string;
  } | null>(null);
  const [banConfirm, setBanConfirm] = useState<UserRecord | null>(null);

  const [stats, setStats] = useState<Stats | null>(null);

  const [users, setUsers] = useState<UserRecord[]>([]);
  const [usersTotal, setUsersTotal] = useState(0);
  const [usersPage, setUsersPage] = useState(1);
  const [usersSearch, setUsersSearch] = useState("");
  const [usersSearchInput, setUsersSearchInput] = useState("");
  const [bannedEmails, setBannedEmails] = useState<Set<string>>(new Set());
  const [banningUserId, setBanningUserId] = useState<string | null>(null);

  const [listings, setListings] = useState<ListingRecord[]>([]);
  const [listingsTotal, setListingsTotal] = useState(0);
  const [listingsPage, setListingsPage] = useState(1);

  const [feedback, setFeedback] = useState<FeedbackRecord[]>([]);
  const [feedbackTotal, setFeedbackTotal] = useState(0);
  const [feedbackPage, setFeedbackPage] = useState(1);
  const [avgRating, setAvgRating] = useState(0);

  const [reviews, setReviews] = useState<FeedbackRecord[]>([]);
  const [reviewsTotal, setReviewsTotal] = useState(0);
  const [reviewsPage, setReviewsPage] = useState(1);

  const [deletingGlobalMsgs, setDeletingGlobalMsgs] = useState(false);
  const [deleteGlobalMsgsConfirm, setDeleteGlobalMsgsConfirm] = useState(false);
  const [deleteGlobalMsgsResult, setDeleteGlobalMsgsResult] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && (!user || user.email !== ADMIN_EMAIL)) {
      router.replace("/");
    }
  }, [user, loading, router]);

  // Dashboard stats
  useEffect(() => {
    if (activeSection !== "dashboard" || !user || user.email !== ADMIN_EMAIL) return;
    let cancelled = false;
    setDataLoading(true);

    const fetchStats = async () => {
      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

      const { count: usersCount, error: e1 } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });
      console.log("[Admin] profiles count:", usersCount, e1);

      const { count: listingsCount, error: e2 } = await supabase
        .from("listings")
        .select("*", { count: "exact", head: true });
      console.log("[Admin] listings count:", listingsCount, e2);

      const { count: feedbackCount, error: e3 } = await supabase
        .from("deletion_feedback")
        .select("*", { count: "exact", head: true });
      console.log("[Admin] feedback count:", feedbackCount, e3);

      const { count: newUsersCount, error: e4 } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .gte("created_at", oneWeekAgo);
      console.log("[Admin] new users this week:", newUsersCount, e4);

      if (!cancelled) {
        setStats({
          totalUsers: usersCount ?? 0,
          totalListings: listingsCount ?? 0,
          totalDeletionFeedback: feedbackCount ?? 0,
          newUsersThisWeek: newUsersCount ?? 0,
        });
        setDataLoading(false);
      }
    };

    fetchStats();
    return () => { cancelled = true; };
  }, [activeSection, user]);

  // Users
  useEffect(() => {
    if (activeSection !== "users" || !user || user.email !== ADMIN_EMAIL) return;
    let cancelled = false;
    setDataLoading(true);

    const fetchUsers = async () => {
      const [profilesRes, bannedRes] = await Promise.all([
        supabase.from("profiles").select("*").order("created_at", { ascending: false }),
        supabase.from("banned_emails").select("email"),
      ]);
      const profiles = profilesRes.data;
      const error = profilesRes.error;
      console.log("[Admin] profiles:", profiles, error);

      if (!cancelled) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let allUsers: UserRecord[] = (profiles ?? []).map((p: any) => ({
          id: p.id,
          user_id: p.user_id,
          email: p.email ?? "N/A",
          display_name: p.display_name ?? null,
          avatar_url: p.avatar_url ?? null,
          gender: p.gender ?? null,
          birth_date: p.birth_date ?? null,
          country: p.country ?? null,
          created_at: p.created_at,
        }));

        if (usersSearch) {
          const s = usersSearch.toLowerCase();
          allUsers = allUsers.filter(
            (u) =>
              u.display_name?.toLowerCase().includes(s) ||
              u.email.toLowerCase().includes(s)
          );
        }

        setBannedEmails(new Set((bannedRes.data ?? []).map((b: { email: string }) => b.email)));
        setUsersTotal(allUsers.length);
        setUsers(allUsers.slice((usersPage - 1) * PAGE_SIZE, usersPage * PAGE_SIZE));
        setDataLoading(false);
      }
    };

    fetchUsers();
    return () => { cancelled = true; };
  }, [activeSection, usersPage, usersSearch, user]);

  // Listings
  useEffect(() => {
    if (activeSection !== "listings" || !user || user.email !== ADMIN_EMAIL) return;
    let cancelled = false;
    setDataLoading(true);

    const fetchListings = async () => {
      const { data: listingsData, error } = await supabase
        .from("listings")
        .select("*")
        .order("created_at", { ascending: false });
      console.log("[Admin] listings:", listingsData, error);

      if (!cancelled) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const allListings: ListingRecord[] = (listingsData ?? []).map((l: any) => ({
          ...l,
          user_email: l.user_email ?? l.email ?? "N/A",
        }));

        setListingsTotal(allListings.length);
        setListings(allListings.slice((listingsPage - 1) * PAGE_SIZE, listingsPage * PAGE_SIZE));
        setDataLoading(false);
      }
    };

    fetchListings();
    return () => { cancelled = true; };
  }, [activeSection, listingsPage, user]);

  // Feedback
  useEffect(() => {
    if (activeSection !== "feedback" || !user || user.email !== ADMIN_EMAIL) return;
    let cancelled = false;
    setDataLoading(true);

    const fetchFeedback = async () => {
      const { data: feedbackData, error } = await supabase
        .from("deletion_feedback")
        .select("*")
        .order("deleted_at", { ascending: false });
      console.log("[Admin] deletion_feedback:", feedbackData, error);

      if (!cancelled) {
        const allFeedback: FeedbackRecord[] = feedbackData ?? [];
        const rated = allFeedback.filter((f) => f.rating !== null);
        const avg =
          rated.length > 0
            ? rated.reduce((sum, f) => sum + (f.rating ?? 0), 0) / rated.length
            : 0;

        setAvgRating(avg);
        setFeedbackTotal(allFeedback.length);
        setFeedback(allFeedback.slice((feedbackPage - 1) * PAGE_SIZE, feedbackPage * PAGE_SIZE));
        setDataLoading(false);
      }
    };

    fetchFeedback();
    return () => { cancelled = true; };
  }, [activeSection, feedbackPage, user]);

  // Reviews
  useEffect(() => {
    if (activeSection !== "reviews" || !user || user.email !== ADMIN_EMAIL) return;
    let cancelled = false;
    setDataLoading(true);

    const fetchReviews = async () => {
      const { data: reviewsData, error } = await supabase
        .from("deletion_feedback")
        .select("*")
        .order("deleted_at", { ascending: false });
      console.log("[Admin] reviews (deletion_feedback):", reviewsData, error);

      if (!cancelled) {
        const allReviews: FeedbackRecord[] = reviewsData ?? [];
        setReviewsTotal(allReviews.length);
        setReviews(allReviews.slice((reviewsPage - 1) * PAGE_SIZE, reviewsPage * PAGE_SIZE));
        setDataLoading(false);
      }
    };

    fetchReviews();
    return () => { cancelled = true; };
  }, [activeSection, reviewsPage, user]);

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    const { type, id } = deleteConfirm;

    if (type === "listing") {
      const { error } = await supabase.from("listings").delete().eq("id", id);
      if (!error) {
        setDeleteConfirm(null);
        const { data: listingsData } = await supabase
          .from("listings")
          .select("*")
          .order("created_at", { ascending: false });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const allListings: ListingRecord[] = (listingsData ?? []).map((l: any) => ({
          ...l,
          user_email: l.user_email ?? l.email ?? "N/A",
        }));
        setListingsTotal(allListings.length);
        setListings(allListings.slice((listingsPage - 1) * PAGE_SIZE, listingsPage * PAGE_SIZE));
      }
    } else if (type === "user") {
      const token = session?.access_token;
      if (!token || !deleteConfirm?.userId) return;
      try {
        const res = await fetch("/api/admin/delete-user", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ userId: deleteConfirm.userId }),
        });
        const json = await res.json();
        if (!json.error) {
          const deletedUserId = deleteConfirm.userId;
          setDeleteConfirm(null);
          setUsers((prev) => prev.filter((u) => u.user_id !== deletedUserId));
          setUsersTotal((prev) => prev - 1);
        }
      } catch { /* deletion failed silently */ }
    }
  };

  const handleQuickBan = async (u: UserRecord) => {
    if (!u.user_id || !u.email) return;
    setBanningUserId(u.user_id);
    const token = session?.access_token;
    try {
      const res = await fetch("/api/admin/ban-user", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          userId: u.user_id,
          email: u.email,
          action: "ban",
          reason: "Admin tarafından engellendi",
        }),
      });
      const result = await res.json();
      console.log("Ban result:", result);
      if (result.success) {
        setBannedEmails((prev) => new Set([...prev, u.email]));
        alert("Kullanıcı engellendi!");
      } else {
        alert("Hata: " + JSON.stringify(result));
      }
    } catch (e) {
      console.error("Ban error:", e);
      alert("Bağlantı hatası");
    }
    setBanningUserId(null);
  };

  const handleQuickUnban = async (u: UserRecord) => {
    if (!u.user_id) return;
    setBanningUserId(u.user_id);
    const token = session?.access_token;
    try {
      const res = await fetch("/api/admin/ban-user", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ userId: u.user_id, email: u.email, action: "unban" }),
      });
      const result = await res.json();
      console.log("Unban result:", result);
      if (result.success) {
        setBannedEmails((prev) => { const s = new Set(prev); s.delete(u.email); return s; });
        alert("Engel kaldırıldı!");
      } else {
        alert("Hata: " + JSON.stringify(result));
      }
    } catch (e) {
      console.error("Unban error:", e);
      alert("Bağlantı hatası");
    }
    setBanningUserId(null);
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

  const menuItems: { id: Section | "channels" | "banned"; label: string; icon: string; href?: string }[] = [
    { id: "dashboard", label: "Dashboard", icon: "📊" },
    { id: "users", label: "Users", icon: "👥" },
    { id: "listings", label: "Listings", icon: "📋" },
    { id: "feedback", label: "Del. Feedback", icon: "💬" },
    { id: "reviews", label: "Reviews", icon: "⭐" },
    { id: "messages", label: "Messages", icon: "✉️" },
    { id: "channels", label: "Kanallarım", icon: "📢", href: "/admin-sefira-2026/channels" },
    { id: "banned", label: "Engelliler", icon: "🚫", href: "/admin-sefira-2026/banned" },
  ];

  const navigate = (section: Section) => {
    setActiveSection(section);
    setSidebarOpen(false);
  };

  const formatDate = (d: string) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // ─── Section renderers ───────────────────────────────────────────────────────

  const renderDashboard = () => (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h2>
      {stats ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {[
            {
              label: "Total Users",
              value: stats.totalUsers,
              icon: "👥",
              bg: "#eff6ff",
              color: "#2563eb",
            },
            {
              label: "Total Listings",
              value: stats.totalListings,
              icon: "🏠",
              bg: "#f0fdf4",
              color: "#16a34a",
            },
            {
              label: "Deletion Feedback",
              value: stats.totalDeletionFeedback,
              icon: "💬",
              bg: "#faf5ff",
              color: "#9333ea",
            },
            {
              label: "New This Week",
              value: stats.newUsersThisWeek,
              icon: "🆕",
              bg: "#fff7ed",
              color: "#f97316",
            },
          ].map((card) => (
            <div
              key={card.label}
              className="bg-white rounded-2xl p-6 border border-gray-100"
              style={{ boxShadow: "0 1px 6px rgba(0,0,0,0.06)" }}
            >
              <div
                className="inline-flex items-center justify-center w-12 h-12 rounded-xl text-2xl mb-4"
                style={{ backgroundColor: card.bg }}
              >
                {card.icon}
              </div>
              <p className="text-3xl font-bold text-gray-800">
                {card.value.toLocaleString()}
              </p>
              <p className="text-sm text-gray-500 mt-1">{card.label}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-gray-400 text-sm">Loading stats…</div>
      )}
    </div>
  );

  const renderUsers = () => (
    <div>
      <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
        <h2 className="text-2xl font-bold text-gray-800">Users</h2>
        <div className="flex gap-2">
          <input
            value={usersSearchInput}
            onChange={(e) => setUsersSearchInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                setUsersSearch(usersSearchInput);
                setUsersPage(1);
              }
            }}
            placeholder="Search by name or email…"
            className="px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 w-56 sm:w-72"
          />
          <button
            onClick={() => {
              setUsersSearch(usersSearchInput);
              setUsersPage(1);
            }}
            className="px-4 py-2 rounded-xl text-sm font-medium text-white transition-colors"
            style={{ backgroundColor: "#f97316" }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#ea6c08")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#f97316")}
          >
            Search
          </button>
        </div>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden" style={{ boxShadow: "0 1px 6px rgba(0,0,0,0.06)" }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-400 uppercase text-xs">
                <th className="px-4 py-3 text-left font-semibold">Avatar</th>
                <th className="px-4 py-3 text-left font-semibold">Display Name</th>
                <th className="px-4 py-3 text-left font-semibold">Email</th>
                <th className="px-4 py-3 text-left font-semibold">Gender</th>
                <th className="px-4 py-3 text-left font-semibold">Birth Date</th>
                <th className="px-4 py-3 text-left font-semibold">Country</th>
                <th className="px-4 py-3 text-left font-semibold">Join Date</th>
                <th className="px-4 py-3 text-left font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u, i) => (
                <tr
                  key={u.id}
                  className="border-t border-gray-50 transition-colors cursor-pointer"
                  style={{ backgroundColor: i % 2 === 1 ? "#fafafa" : "white" }}
                  onClick={() => router.push(`/admin-sefira-2026/user/${u.user_id}`)}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#fff7ed")}
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = i % 2 === 1 ? "#fafafa" : "white")
                  }
                >
                  <td className="px-4 py-3">
                    {u.avatar_url ? (
                      <img
                        src={u.avatar_url}
                        alt=""
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                        style={{ backgroundColor: "#fff7ed", color: "#f97316" }}
                      >
                        {u.display_name?.[0]?.toUpperCase() ??
                          u.email?.[0]?.toUpperCase() ??
                          "?"}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-800">
                    {u.display_name ?? <span className="text-gray-400">—</span>}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{u.email}</td>
                  <td className="px-4 py-3 text-gray-600 capitalize">
                    {u.gender ?? <span className="text-gray-400">—</span>}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {u.birth_date ? formatDate(u.birth_date) : <span className="text-gray-400">—</span>}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {u.country ?? <span className="text-gray-400">—</span>}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{formatDate(u.created_at)}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1.5 items-center">
                      {bannedEmails.has(u.email) && (
                        <span
                          className="px-2 py-0.5 rounded-full text-xs font-bold"
                          style={{ backgroundColor: "#fef2f2", color: "#ef4444", border: "1px solid #fecaca" }}
                        >
                          ⛔ BANNED
                        </span>
                      )}
                      <a
                        href={`/admin-sefira-2026/user/${u.user_id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="px-3 py-1.5 text-xs font-medium rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
                      >
                        View
                      </a>
                      {bannedEmails.has(u.email) ? (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleQuickUnban(u); }}
                          disabled={banningUserId === u.user_id}
                          className="px-3 py-1.5 text-xs font-medium rounded-lg transition-colors disabled:opacity-50"
                          style={{ backgroundColor: "#f0fdf4", color: "#16a34a" }}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#dcfce7")}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#f0fdf4")}
                        >
                          {banningUserId === u.user_id ? "…" : "✅ Engeli Kaldır"}
                        </button>
                      ) : (
                        <button
                          onClick={(e) => { e.stopPropagation(); setBanConfirm(u); }}
                          disabled={banningUserId === u.user_id}
                          className="px-3 py-1.5 text-xs font-medium rounded-lg transition-colors disabled:opacity-50"
                          style={{ backgroundColor: "#fff7ed", color: "#f97316" }}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#ffedd5")}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#fff7ed")}
                        >
                          {banningUserId === u.user_id ? "…" : "🚫 Engelle"}
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteConfirm({
                            type: "user",
                            id: u.id,
                            userId: u.user_id,
                            name: u.display_name ?? u.email,
                          });
                        }}
                        className="px-3 py-1.5 text-xs font-medium rounded-lg transition-colors"
                        style={{ backgroundColor: "#fef2f2", color: "#ef4444" }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.backgroundColor = "#fee2e2")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.backgroundColor = "#fef2f2")
                        }
                      >
                        🗑️ Sil
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {users.length === 0 && !dataLoading && (
                <EmptyRow cols={8} message="No users found" />
              )}
            </tbody>
          </table>
        </div>
        <Pagination page={usersPage} total={usersTotal} onPageChange={setUsersPage} />
      </div>
    </div>
  );

  const renderListings = () => (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Listings</h2>
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden" style={{ boxShadow: "0 1px 6px rgba(0,0,0,0.06)" }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-400 uppercase text-xs">
                <th className="px-4 py-3 text-left font-semibold">User Email</th>
                <th className="px-4 py-3 text-left font-semibold">Type</th>
                <th className="px-4 py-3 text-left font-semibold">City</th>
                <th className="px-4 py-3 text-left font-semibold">Price / Rent</th>
                <th className="px-4 py-3 text-left font-semibold">Created</th>
                <th className="px-4 py-3 text-left font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {listings.map((l, i) => (
                <tr
                  key={l.id}
                  className="border-t border-gray-50 transition-colors"
                  style={{ backgroundColor: i % 2 === 1 ? "#fafafa" : "white" }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#fff7ed")}
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = i % 2 === 1 ? "#fafafa" : "white")
                  }
                >
                  <td className="px-4 py-3 text-gray-600">{l.user_email}</td>
                  <td className="px-4 py-3">
                    <span
                      className="px-2.5 py-1 rounded-lg text-xs font-medium capitalize"
                      style={{ backgroundColor: "#fff7ed", color: "#f97316" }}
                    >
                      {l.listing_type?.replace(/_/g, " ") ?? "—"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-700 font-medium">
                    {l.city ?? <span className="text-gray-400">—</span>}
                  </td>
                  <td className="px-4 py-3 text-gray-800 font-semibold">
                    {l.rent != null
                      ? `$${l.rent.toLocaleString()}`
                      : l.price != null
                      ? `$${l.price.toLocaleString()}`
                      : <span className="text-gray-400 font-normal">—</span>}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{formatDate(l.created_at)}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button className="px-3 py-1.5 text-xs font-medium rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors">
                        View
                      </button>
                      <button
                        onClick={() =>
                          setDeleteConfirm({
                            type: "listing",
                            id: l.id,
                            name: `${l.listing_type ?? "Listing"} in ${l.city ?? "unknown city"}`,
                          })
                        }
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
                    </div>
                  </td>
                </tr>
              ))}
              {listings.length === 0 && !dataLoading && (
                <EmptyRow cols={6} message="No listings found" />
              )}
            </tbody>
          </table>
        </div>
        <Pagination page={listingsPage} total={listingsTotal} onPageChange={setListingsPage} />
      </div>
    </div>
  );

  const renderFeedback = () => (
    <div>
      <div className="flex items-center gap-4 mb-6 flex-wrap">
        <h2 className="text-2xl font-bold text-gray-800">Deletion Feedback</h2>
        {avgRating > 0 && (
          <div
            className="flex items-center gap-2 bg-white rounded-xl px-4 py-2 border border-gray-100"
            style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}
          >
            <span className="text-sm text-gray-500">Avg rating:</span>
            <span className="font-bold" style={{ color: "#f97316" }}>
              {avgRating.toFixed(1)}
            </span>
            <StarRating rating={Math.round(avgRating)} />
          </div>
        )}
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden" style={{ boxShadow: "0 1px 6px rgba(0,0,0,0.06)" }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-400 uppercase text-xs">
                <th className="px-4 py-3 text-left font-semibold">Email</th>
                <th className="px-4 py-3 text-left font-semibold">Reasons</th>
                <th className="px-4 py-3 text-left font-semibold">Rating</th>
                <th className="px-4 py-3 text-left font-semibold">Feedback</th>
                <th className="px-4 py-3 text-left font-semibold">Date</th>
              </tr>
            </thead>
            <tbody>
              {feedback.map((f, i) => (
                <tr
                  key={f.id}
                  className="border-t border-gray-50 transition-colors"
                  style={{ backgroundColor: i % 2 === 1 ? "#fafafa" : "white" }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#fff7ed")}
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = i % 2 === 1 ? "#fafafa" : "white")
                  }
                >
                  <td className="px-4 py-3 text-gray-600">{f.email}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {f.reasons && f.reasons.length > 0 ? (
                        f.reasons.map((r, ri) => (
                          <span
                            key={ri}
                            className="px-2 py-0.5 rounded-md text-xs"
                            style={{ backgroundColor: "#f3f4f6", color: "#4b5563" }}
                          >
                            {r}
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <StarRating rating={f.rating} />
                  </td>
                  <td className="px-4 py-3 text-gray-600 max-w-xs">
                    {f.feedback ? (
                      <span
                        className="block overflow-hidden"
                        style={{
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                        }}
                      >
                        {f.feedback}
                      </span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{formatDate(f.deleted_at)}</td>
                </tr>
              ))}
              {feedback.length === 0 && !dataLoading && (
                <EmptyRow cols={5} message="No feedback found" />
              )}
            </tbody>
          </table>
        </div>
        <Pagination page={feedbackPage} total={feedbackTotal} onPageChange={setFeedbackPage} />
      </div>
    </div>
  );

  const renderReviews = () => (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Reviews</h2>
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden" style={{ boxShadow: "0 1px 6px rgba(0,0,0,0.06)" }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-400 uppercase text-xs">
                <th className="px-4 py-3 text-left font-semibold">Email</th>
                <th className="px-4 py-3 text-left font-semibold">Reasons</th>
                <th className="px-4 py-3 text-left font-semibold">Rating</th>
                <th className="px-4 py-3 text-left font-semibold">Feedback</th>
                <th className="px-4 py-3 text-left font-semibold">Date</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map((r, i) => (
                <tr
                  key={r.id}
                  className="border-t border-gray-50 transition-colors"
                  style={{ backgroundColor: i % 2 === 1 ? "#fafafa" : "white" }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#fff7ed")}
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = i % 2 === 1 ? "#fafafa" : "white")
                  }
                >
                  <td className="px-4 py-3 text-gray-600">{r.email}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {r.reasons && r.reasons.length > 0 ? (
                        r.reasons.map((reason, ri) => (
                          <span
                            key={ri}
                            className="px-2 py-0.5 rounded-md text-xs"
                            style={{ backgroundColor: "#f3f4f6", color: "#4b5563" }}
                          >
                            {reason}
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <StarRating rating={r.rating} />
                  </td>
                  <td className="px-4 py-3 text-gray-600 max-w-xs">
                    {r.feedback ? (
                      <span
                        className="block overflow-hidden"
                        style={{
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                        }}
                      >
                        {r.feedback}
                      </span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{formatDate(r.deleted_at)}</td>
                </tr>
              ))}
              {reviews.length === 0 && !dataLoading && (
                <EmptyRow cols={5} message="No reviews found" />
              )}
            </tbody>
          </table>
        </div>
        <Pagination page={reviewsPage} total={reviewsTotal} onPageChange={setReviewsPage} />
      </div>
    </div>
  );

  const handleDeleteGlobalMessages = async () => {
    setDeletingGlobalMsgs(true);
    setDeleteGlobalMsgsResult(null);
    try {
      const token = session?.access_token;
      if (!token) { setDeleteGlobalMsgsResult("Not authenticated."); setDeletingGlobalMsgs(false); return; }
      const res = await fetch("/api/admin/delete-messages", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (json.error) {
        setDeleteGlobalMsgsResult(`Error: ${json.error}`);
      } else {
        setDeleteGlobalMsgsResult("All global messages deleted.");
        setDeleteGlobalMsgsConfirm(false);
        setTimeout(() => setDeleteGlobalMsgsResult(null), 4000);
      }
    } catch (e) {
      setDeleteGlobalMsgsResult(String(e));
    }
    setDeletingGlobalMsgs(false);
  };

  const renderMessages = () => <MessagesSection session={session} />;

  const renderContent = () => {
    if (dataLoading && activeSection !== "messages") return <LoadingSpinner />;
    // messages section manages its own loading state
    switch (activeSection) {
      case "dashboard":
        return renderDashboard();
      case "users":
        return renderUsers();
      case "listings":
        return renderListings();
      case "feedback":
        return renderFeedback();
      case "reviews":
        return renderReviews();
      case "messages":
        return renderMessages();
    }
  };

  // ─── Layout ──────────────────────────────────────────────────────────────────

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: "#f8fafc" }}>
      {/* Mobile overlay */}
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
        {/* Logo area */}
        <div className="p-5 border-b border-gray-100 flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-base font-black shrink-0"
            style={{ backgroundColor: "#f97316" }}
          >
            S
          </div>
          <div className="min-w-0">
            <p className="font-bold text-gray-800 text-sm leading-tight">Sefira Admin</p>
            <p className="text-xs text-gray-400 leading-tight mt-0.5">Management Panel</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const active = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  if (item.href) { router.push(item.href); setSidebarOpen(false); }
                  else navigate(item.id as Section);
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all text-left"
                style={{
                  backgroundColor: active ? "#f97316" : "transparent",
                  color: active ? "white" : "#374151",
                  boxShadow: active ? "0 2px 8px rgba(249,115,22,0.3)" : "none",
                }}
                onMouseEnter={(e) => {
                  if (!active) {
                    e.currentTarget.style.backgroundColor = "#fff7ed";
                    e.currentTarget.style.color = "#f97316";
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

        {/* Bottom user info */}
        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
              style={{ backgroundColor: "#fff7ed", color: "#f97316" }}
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
      <div
        className="flex-1 flex flex-col min-h-screen"
        style={{ marginLeft: 0 }}
      >
        {/* Add left margin on large screens via CSS trick */}
        <style>{`@media (min-width: 1024px) { .admin-main { margin-left: 256px; } }`}</style>
        <div className="admin-main flex-1 flex flex-col min-h-screen">
          {/* Top header */}
          <header
            className="sticky top-0 z-10 flex items-center gap-4 px-4 sm:px-6 py-3.5 border-b border-gray-100"
            style={{ backgroundColor: "white", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}
          >
            {/* Hamburger */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors -ml-1"
              aria-label="Toggle sidebar"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>

            <div className="flex items-center gap-2">
              <span className="text-base">
                {menuItems.find((m) => m.id === activeSection)?.icon}
              </span>
              <h1 className="text-base font-semibold text-gray-800">
                {menuItems.find((m) => m.id === activeSection)?.label}
              </h1>
            </div>

            <div className="ml-auto">
              <span
                className="text-xs font-medium px-2.5 py-1 rounded-full"
                style={{ backgroundColor: "#fff7ed", color: "#f97316" }}
              >
                Admin
              </span>
            </div>
          </header>

          {/* Page content */}
          <main className={`flex-1 ${activeSection === "messages" ? "overflow-hidden p-0" : "p-4 sm:p-6 lg:p-8"}`}>
            {renderContent()}
          </main>
        </div>
      </div>

      {/* Ban confirmation modal */}
      {banConfirm && (
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
              style={{ backgroundColor: "#fff7ed" }}
            >
              🚫
            </div>
            <h3 className="text-lg font-bold text-gray-800 text-center mb-2">
              Kullanıcıyı Engelle
            </h3>
            <p className="text-sm text-gray-500 text-center mb-1">
              Bu kullanıcıyı engellemek istiyor musunuz?
            </p>
            <p className="text-sm font-semibold text-gray-700 text-center mb-6 break-all">
              {banConfirm.display_name ?? banConfirm.email}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setBanConfirm(null)}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                İptal
              </button>
              <button
                onClick={() => { handleQuickBan(banConfirm); setBanConfirm(null); }}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white transition-colors"
                style={{ backgroundColor: "#f97316" }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#ea6c08")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#f97316")}
              >
                Engelle
              </button>
            </div>
          </div>
        </div>
      )}

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
              Confirm Delete
            </h3>
            <p className="text-sm text-gray-500 text-center mb-6">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-gray-700">{deleteConfirm.name}</span>
              ? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white transition-colors"
                style={{ backgroundColor: "#ef4444" }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#dc2626")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#ef4444")}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Telegram-style inbox ────────────────────────────────────────────────────

interface Conversation {
  user_id: string;
  email: string | null;
  last_message: string;
  last_date: string;
  unread_count: number;
}

interface ThreadMsg {
  id: string;
  user_id: string | null;
  message: string;
  created_at: string;
  sender: "admin" | "user" | null;
  is_read: boolean;
}

function MessagesSection({ session }: { session: { access_token?: string } | null }) {
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [thread, setThread] = useState<ThreadMsg[]>([]);
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);
  const [mobileView, setMobileView] = useState<"list" | "chat">("list");
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [loadingThread, setLoadingThread] = useState(false);
  const [deleteGlobalConfirm, setDeleteGlobalConfirm] = useState(false);
  const [deletingGlobal, setDeletingGlobal] = useState(false);
  const [deleteResult, setDeleteResult] = useState<string | null>(null);
  const threadEndRef = useRef<HTMLDivElement>(null);

  const token = session?.access_token ?? "";
  const authJson = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };

  const fetchConversations = async () => {
    const res = await fetch("/api/admin/conversations", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const json = await res.json();
    if (json.conversations) setConversations(json.conversations);
    setLoadingConvs(false);
  };

  const fetchThread = async (userId: string) => {
    setLoadingThread(true);
    const res = await fetch(`/api/admin/conversations?userId=${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const json = await res.json();
    if (json.messages) setThread(json.messages);
    setLoadingThread(false);
    setTimeout(() => threadEndRef.current?.scrollIntoView({ behavior: "smooth" }), 80);
  };

  useEffect(() => { fetchConversations(); }, []);

  const selectConversation = async (userId: string) => {
    setSelectedId(userId);
    setMobileView("chat");
    fetchThread(userId);
    // Zero the badge immediately in local state
    setConversations((prev) =>
      prev.map((c) => c.user_id === userId ? { ...c, unread_count: 0 } : c)
    );
    // Persist read status via service-role API route (bypasses RLS)
    await fetch("/api/admin/mark-read", {
      method: "POST",
      headers: authJson,
      body: JSON.stringify({ userId }),
    });
    fetchConversations();
  };

  const handleSend = async () => {
    if (!replyText.trim() || !selectedId || sending) return;
    setSending(true);
    const text = replyText.trim();
    setReplyText("");

    // Feature 1: Optimistic update — show message immediately
    const tempId = "temp-" + Date.now();
    const optimistic: ThreadMsg = {
      id: tempId,
      user_id: selectedId,
      message: text,
      sender: "admin",
      is_read: false,
      created_at: new Date().toISOString(),
    };
    setThread((prev) => [...prev, optimistic]);
    setTimeout(() => threadEndRef.current?.scrollIntoView({ behavior: "smooth" }), 30);

    const res = await fetch("/api/admin/send-message", {
      method: "POST",
      headers: authJson,
      body: JSON.stringify({
        userId: selectedId,
        userEmail: "",
        title: "reply",
        message: text,
        sendToAll: false,
        sender: "admin",
      }),
    });
    const result = await res.json();
    if (!result.error) {
      await fetchThread(selectedId);
      fetchConversations();
    } else {
      setThread((prev) => prev.filter((m) => m.id !== tempId));
    }
    setSending(false);
  };

  const handleDeleteGlobal = async () => {
    setDeletingGlobal(true);
    const res = await fetch("/api/admin/delete-messages", {
      method: "POST",
      headers: authJson,
      body: JSON.stringify({ action: "delete_global" }),
    });
    const json = await res.json();
    setDeleteResult(json.error ? `Error: ${json.error}` : "All global messages deleted.");
    setDeletingGlobal(false);
    setDeleteGlobalConfirm(false);
    setTimeout(() => setDeleteResult(null), 4000);
  };

  const fmtTime = (d: string) => {
    const date = new Date(d);
    const isToday = date.toDateString() === new Date().toDateString();
    return isToday
      ? date.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })
      : date.toLocaleDateString("tr-TR", { day: "numeric", month: "short" });
  };

  const selectedConv = conversations.find((c) => c.user_id === selectedId);
  const displayEmail = (conv: Conversation | undefined, uid: string) =>
    conv?.email ?? uid.slice(0, 8) + "…";

  return (
    <div className="flex flex-col overflow-hidden" style={{ height: "calc(100vh - 57px)" }}>
      {/* ── Top bar ──────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100 bg-white flex-shrink-0">
        <h2 className="text-sm font-bold text-gray-800">Mesaj Gelen Kutusu</h2>
        <div className="flex items-center gap-2 flex-wrap justify-end">
          {deleteResult && (
            <span className={`text-xs ${deleteResult.startsWith("Error") ? "text-red-500" : "text-green-600"}`}>
              {deleteResult}
            </span>
          )}
          {!deleteGlobalConfirm ? (
            <button
              onClick={() => setDeleteGlobalConfirm(true)}
              className="px-3 py-1.5 text-xs font-medium rounded-lg transition-colors"
              style={{ backgroundColor: "#fef2f2", color: "#ef4444" }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#fee2e2")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#fef2f2")}
            >
              Bildirimleri Sil
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-red-600">Emin misiniz?</span>
              <button
                onClick={handleDeleteGlobal}
                disabled={deletingGlobal}
                className="px-3 py-1.5 text-xs font-medium rounded-lg text-white disabled:opacity-60"
                style={{ backgroundColor: "#ef4444" }}
              >
                {deletingGlobal ? "…" : "Evet"}
              </button>
              <button
                onClick={() => setDeleteGlobalConfirm(false)}
                className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
              >
                İptal
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Main split ───────────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* Left panel — conversation list */}
        <div
          className={`${mobileView === "chat" ? "hidden" : "flex"} md:flex flex-col w-full md:w-80 border-r border-gray-100 bg-white overflow-y-auto flex-shrink-0`}
        >
          {loadingConvs ? (
            <div className="flex items-center justify-center flex-1 py-12">
              <div className="w-7 h-7 rounded-full border-[3px] border-gray-200 border-t-orange-500 animate-spin" />
            </div>
          ) : conversations.length === 0 ? (
            <p className="text-center text-gray-400 text-sm py-12 px-4">
              Henüz konuşma yok
            </p>
          ) : (
            conversations.map((conv) => (
              <button
                key={conv.user_id}
                onClick={() => selectConversation(conv.user_id)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 text-left border-b border-gray-50 transition-colors ${
                  selectedId === conv.user_id ? "bg-orange-50" : "hover:bg-gray-50"
                }`}
              >
                <div
                  className="w-11 h-11 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                  style={{ backgroundColor: "#f97316" }}
                >
                  {(conv.email?.[0] ?? "?").toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <span
                      className={`text-sm truncate ${
                        conv.unread_count > 0 ? "font-bold text-gray-900" : "font-semibold text-gray-700"
                      }`}
                    >
                      {conv.email ?? conv.user_id.slice(0, 8) + "…"}
                    </span>
                    <span className="text-[11px] text-gray-400 flex-shrink-0">
                      {fmtTime(conv.last_date)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <p
                      className={`text-xs truncate flex-1 ${
                        conv.unread_count > 0 ? "text-gray-700 font-medium" : "text-gray-400"
                      }`}
                    >
                      {conv.last_message}
                    </p>
                    {conv.unread_count > 0 && (
                      <span className="flex-shrink-0 min-w-[18px] h-[18px] rounded-full bg-orange-500 text-white text-[10px] font-bold flex items-center justify-center px-1">
                        {conv.unread_count}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>

        {/* Right panel — chat thread */}
        <div
          className={`${mobileView === "list" ? "hidden" : "flex"} md:flex flex-col flex-1 overflow-hidden`}
          style={{ background: "#f0ebe4" }}
        >
          {!selectedId ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center px-6">
                <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center mx-auto mb-3">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-8 h-8 text-orange-400"
                  >
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                </div>
                <p className="text-gray-500 text-sm">Bir konuşma seçin</p>
              </div>
            </div>
          ) : (
            <>
              {/* Thread header */}
              <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-200 shadow-sm flex-shrink-0">
                <button
                  onClick={() => setMobileView("list")}
                  className="md:hidden p-1.5 -ml-1 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    className="w-5 h-5"
                  >
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                </button>
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                  style={{ backgroundColor: "#f97316" }}
                >
                  {(selectedConv?.email?.[0] ?? "?").toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900 text-sm leading-tight truncate">
                    {displayEmail(selectedConv, selectedId)}
                  </p>
                  <p className="text-xs text-emerald-500 font-semibold">Kullanıcı</p>
                </div>
                <button
                  onClick={() => router.push(`/admin-sefira-2026/user/${selectedId}`)}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg bg-orange-50 hover:bg-orange-100 text-orange-600 transition-colors flex-shrink-0"
                >
                  👤 Kullanıcı Bilgileri
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
                {loadingThread ? (
                  <div className="flex items-center justify-center flex-1 py-12">
                    <div className="w-7 h-7 rounded-full border-[3px] border-gray-200 border-t-orange-500 animate-spin" />
                  </div>
                ) : thread.length === 0 ? (
                  <p className="text-center text-gray-400 text-sm py-8">Henüz mesaj yok</p>
                ) : (
                  thread.map((msg) => {
                    const isAdmin = msg.sender === "admin" || msg.sender === null;
                    return (
                      <div
                        key={msg.id}
                        className={`flex w-full ${isAdmin ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`flex items-end gap-2 max-w-[75%] ${isAdmin ? "flex-row-reverse" : ""}`}
                        >
                          {!isAdmin && (
                            <div className="w-7 h-7 rounded-full bg-gray-400 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mb-1">
                              {(selectedConv?.email?.[0] ?? "?").toUpperCase()}
                            </div>
                          )}
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
                                {msg.message}
                              </p>
                            </div>
                            <span className="text-[11px] text-gray-400 px-1" style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                              {fmtTime(msg.created_at)}
                              {/* Feature 2: tick indicators on admin messages */}
                              {isAdmin && (
                                msg.is_read
                                  ? <span style={{ color: "#34b7f1", fontSize: "12px", lineHeight: 1 }}>✓✓</span>
                                  : <span style={{ color: "#9ca3af", fontSize: "12px", lineHeight: 1 }}>✓</span>
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={threadEndRef} />
              </div>

              {/* Reply input */}
              <div className="px-4 py-3 bg-white border-t border-gray-200 flex-shrink-0">
                <div className="flex gap-2">
                  <input
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    placeholder="Mesaj yaz…"
                    className="flex-1 px-4 py-2.5 rounded-2xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-gray-50"
                  />
                  <button
                    onClick={handleSend}
                    disabled={!replyText.trim() || sending}
                    className="px-4 py-2.5 rounded-2xl text-white text-sm font-semibold disabled:opacity-50 transition-colors flex-shrink-0"
                    style={{ backgroundColor: "#f97316" }}
                    onMouseEnter={(e) => {
                      if (!sending) e.currentTarget.style.backgroundColor = "#ea6c08";
                    }}
                    onMouseLeave={(e) => {
                      if (!sending) e.currentTarget.style.backgroundColor = "#f97316";
                    }}
                  >
                    {sending ? "…" : "Gönder"}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
