"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/lib/AuthContext";
import { supabase } from "@/app/lib/supabase";

const ADMIN_EMAIL = "supportsefira@gmail.com";
const PAGE_SIZE = 20;

type Section = "dashboard" | "users" | "listings" | "feedback" | "reviews";

interface Stats {
  totalUsers: number;
  totalListings: number;
  totalDeletionFeedback: number;
  newUsersThisWeek: number;
}

interface UserRecord {
  id: string;
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
    name?: string;
  } | null>(null);

  const [stats, setStats] = useState<Stats | null>(null);

  const [users, setUsers] = useState<UserRecord[]>([]);
  const [usersTotal, setUsersTotal] = useState(0);
  const [usersPage, setUsersPage] = useState(1);
  const [usersSearch, setUsersSearch] = useState("");
  const [usersSearchInput, setUsersSearchInput] = useState("");

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
      const { data: profiles, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });
      console.log("[Admin] profiles:", profiles, error);

      if (!cancelled) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let allUsers: UserRecord[] = (profiles ?? []).map((p: any) => ({
          id: p.id,
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
      // User deletion requires service role key — keep going through the API route
      const token = session?.access_token;
      if (!token) return;
      try {
        const res = await fetch(`/admin-sefira-2026/api?type=user&id=${id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          setDeleteConfirm(null);
          const { data: profiles } = await supabase
            .from("profiles")
            .select("*")
            .order("created_at", { ascending: false });
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const allUsers: UserRecord[] = (profiles ?? []).map((p: any) => ({
            id: p.id,
            email: p.email ?? "N/A",
            display_name: p.display_name ?? null,
            avatar_url: p.avatar_url ?? null,
            gender: p.gender ?? null,
            birth_date: p.birth_date ?? null,
            country: p.country ?? null,
            created_at: p.created_at,
          }));
          setUsersTotal(allUsers.length);
          setUsers(allUsers.slice((usersPage - 1) * PAGE_SIZE, usersPage * PAGE_SIZE));
        }
      } catch { /* deletion failed silently */ }
    }
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

  const menuItems: { id: Section; label: string; icon: string }[] = [
    { id: "dashboard", label: "Dashboard", icon: "📊" },
    { id: "users", label: "Users", icon: "👥" },
    { id: "listings", label: "Listings", icon: "📋" },
    { id: "feedback", label: "Messages", icon: "💬" },
    { id: "reviews", label: "Reviews", icon: "⭐" },
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
                  className="border-t border-gray-50 transition-colors"
                  style={{ backgroundColor: i % 2 === 1 ? "#fafafa" : "white" }}
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
                    <div className="flex gap-2">
                      <a
                        href={`/profile`}
                        className="px-3 py-1.5 text-xs font-medium rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
                      >
                        View
                      </a>
                      <button
                        onClick={() =>
                          setDeleteConfirm({
                            type: "user",
                            id: u.id,
                            name: u.display_name ?? u.email,
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

  const renderContent = () => {
    if (dataLoading) return <LoadingSpinner />;
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
                onClick={() => navigate(item.id)}
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
          <main className="flex-1 p-4 sm:p-6 lg:p-8">{renderContent()}</main>
        </div>
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
