"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/lib/AuthContext";
import { supabase } from "@/app/lib/supabase";
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  'https://ceetzophaybywfuhezhv.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNlZXR6b3BoYXlieXdmdWhlemh2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTM1Nzg1NSwiZXhwIjoyMDk0OTMzODU1fQ.Jw1bDN7wqxdqj-OinqK4ll7mV5ka7fT6T-9jORs4x_4',
  { auth: { autoRefreshToken: false, persistSession: false } }
);

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
  city?: string | null;
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

interface ProfileSnapshot {
  display_name: string | null;
  gender: string | null;
  birth_date: string | null;
  country: string | null;
  avatar_url: string | null;
  created_at: string | null;
  listings_count: number | null;
}

interface FeedbackRecord {
  id: string;
  email: string;
  reasons: string[] | null;
  rating: number | null;
  feedback: string | null;
  deleted_at: string;
  profile_snapshot?: ProfileSnapshot | null;
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

function formatDate(d: string) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function FeedbackDetailModal({ record, onClose }: { record: FeedbackRecord; onClose: () => void }) {
  const snap = record.profile_snapshot;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.55)" }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.25)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-5">
            <h3 className="text-lg font-bold text-gray-800">Deletion Feedback Detail</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-xl leading-none ml-4 shrink-0"
            >
              ✕
            </button>
          </div>

          {/* Core fields */}
          <div className="space-y-4 mb-5">
            <div>
              <p className="text-xs text-gray-400 uppercase font-semibold mb-1">Email</p>
              <p className="text-gray-800 text-sm">{record.email}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase font-semibold mb-1">Deletion Date</p>
              <p className="text-gray-800 text-sm">{formatDate(record.deleted_at)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase font-semibold mb-1">Reasons</p>
              {record.reasons && record.reasons.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {record.reasons.map((r, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded-md text-xs"
                      style={{ backgroundColor: "#f3f4f6", color: "#4b5563" }}
                    >
                      {r}
                    </span>
                  ))}
                </div>
              ) : (
                <span className="text-gray-400 text-sm">—</span>
              )}
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase font-semibold mb-1">Rating</p>
              <StarRating rating={record.rating} />
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase font-semibold mb-1">Feedback</p>
              <p className="text-gray-700 text-sm whitespace-pre-wrap">
                {record.feedback || <span className="text-gray-400">—</span>}
              </p>
            </div>
          </div>

          {/* Profile snapshot */}
          <div className="border-t border-gray-100 pt-5">
            <p className="text-xs text-gray-400 uppercase font-semibold mb-3">Profile Snapshot</p>
            {!snap ? (
              <p className="text-gray-400 text-sm italic">
                Bu hesap için profil bilgisi kaydedilmemiş
              </p>
            ) : (
              <div className="flex gap-4 items-start">
                {snap.avatar_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={snap.avatar_url}
                    alt=""
                    className="w-16 h-16 rounded-full object-cover shrink-0 border border-gray-100"
                  />
                )}
                <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                  <div>
                    <span className="text-gray-400">Name: </span>
                    <span className="text-gray-700">{snap.display_name || "—"}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Gender: </span>
                    <span className="text-gray-700">{snap.gender || "—"}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Birth: </span>
                    <span className="text-gray-700">
                      {snap.birth_date
                        ? new Date(snap.birth_date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
                        : "—"}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400">Country: </span>
                    <span className="text-gray-700">{snap.country || "—"}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Listings: </span>
                    <span className="text-gray-700">{snap.listings_count ?? "—"}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Joined: </span>
                    <span className="text-gray-700">
                      {snap.created_at ? formatDate(snap.created_at) : "—"}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const REASON_LABELS: Record<string, string> = {
  "1": "Uygulamayı beğenmedim, tasarımı zayıf",
  "2": "Uygun bir şey bulamadım",
  "3": "Artık ihtiyacım yok",
};

const COUNTRY_FLAGS: Record<string, string> = {
  "Türkiye": "🇹🇷", "Turkey": "🇹🇷",
  "İran": "🇮🇷", "Iran": "🇮🇷",
  "Almanya": "🇩🇪", "Germany": "🇩🇪",
  "Amerika Birleşik Devletleri": "🇺🇸", "United States": "🇺🇸", "USA": "🇺🇸",
  "Birleşik Krallık": "🇬🇧", "United Kingdom": "🇬🇧", "UK": "🇬🇧",
  "Hollanda": "🇳🇱", "Netherlands": "🇳🇱",
  "Fransa": "🇫🇷", "France": "🇫🇷",
  "İsviçre": "🇨🇭", "Switzerland": "🇨🇭",
  "Avusturya": "🇦🇹", "Austria": "🇦🇹",
  "Belçika": "🇧🇪", "Belgium": "🇧🇪",
  "İsveç": "🇸🇪", "Sweden": "🇸🇪",
  "Norveç": "🇳🇴", "Norway": "🇳🇴",
  "Danimarka": "🇩🇰", "Denmark": "🇩🇰",
  "İtalya": "🇮🇹", "Italy": "🇮🇹",
  "İspanya": "🇪🇸", "Spain": "🇪🇸",
  "Kanada": "🇨🇦", "Canada": "🇨🇦",
  "Avustralya": "🇦🇺", "Australia": "🇦🇺",
  "Rusya": "🇷🇺", "Russia": "🇷🇺",
  "Azerbaycan": "🇦🇿", "Azerbaijan": "🇦🇿",
  "Kazakistan": "🇰🇿", "Kazakhstan": "🇰🇿",
  "Ukrayna": "🇺🇦", "Ukraine": "🇺🇦",
  "Gürcistan": "🇬🇪", "Georgia": "🇬🇪",
  "Ermenistan": "🇦🇲", "Armenia": "🇦🇲",
  "Birleşik Arap Emirlikleri": "🇦🇪", "UAE": "🇦🇪", "United Arab Emirates": "🇦🇪",
  "Irak": "🇮🇶", "Iraq": "🇮🇶",
  "Suudi Arabistan": "🇸🇦", "Saudi Arabia": "🇸🇦",
  "Suriye": "🇸🇾", "Syria": "🇸🇾",
  "Lübnan": "🇱🇧", "Lebanon": "🇱🇧",
  "Bilinmiyor": "❓",
};

const TR_MONTHS = ["Ocak","Şubat","Mart","Nisan","Mayıs","Haziran","Temmuz","Ağustos","Eylül","Ekim","Kasım","Aralık"];

function formatMonth(yyyymm: string) {
  const [year, month] = yyyymm.split("-");
  return `${TR_MONTHS[parseInt(month) - 1]} ${year}`;
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
  const [usersAll, setUsersAll] = useState<UserRecord[]>([]);
  const [usersTotal, setUsersTotal] = useState(0);
  const [usersPage, setUsersPage] = useState(1);
  const [usersSearch, setUsersSearch] = useState("");
  const [usersSearchInput, setUsersSearchInput] = useState("");
  const [bannedEmails, setBannedEmails] = useState<Set<string>>(new Set());
  const [banningUserId, setBanningUserId] = useState<string | null>(null);
  const [announcementCount, setAnnouncementCount] = useState(0);

  const [listings, setListings] = useState<ListingRecord[]>([]);
  const [listingsTotal, setListingsTotal] = useState(0);
  const [listingsPage, setListingsPage] = useState(1);

  const [feedback, setFeedback] = useState<FeedbackRecord[]>([]);
  const [feedbackAll, setFeedbackAll] = useState<FeedbackRecord[]>([]);
  const [feedbackTotal, setFeedbackTotal] = useState(0);
  const [feedbackPage, setFeedbackPage] = useState(1);
  const [avgRating, setAvgRating] = useState(0);
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackRecord | null>(null);

  const [reviews, setReviews] = useState<FeedbackRecord[]>([]);
  const [reviewsTotal, setReviewsTotal] = useState(0);
  const [reviewsPage, setReviewsPage] = useState(1);

  const [deletingGlobalMsgs, setDeletingGlobalMsgs] = useState(false);
  const [deleteGlobalMsgsConfirm, setDeleteGlobalMsgsConfirm] = useState(false);
  const [deleteGlobalMsgsResult, setDeleteGlobalMsgsResult] = useState<string | null>(null);

  const [dashboardRefresh, setDashboardRefresh] = useState(0);
  const [usersRefresh, setUsersRefresh] = useState(0);
  const [listingsRefresh, setListingsRefresh] = useState(0);
  const [feedbackRefresh, setFeedbackRefresh] = useState(0);
  const [reviewsRefresh, setReviewsRefresh] = useState(0);
  const [statsLastUpdated, setStatsLastUpdated] = useState<string | null>(null);
  const [usersLastUpdated, setUsersLastUpdated] = useState<string | null>(null);
  const [listingsLastUpdated, setListingsLastUpdated] = useState<string | null>(null);
  const [feedbackLastUpdated, setFeedbackLastUpdated] = useState<string | null>(null);
  const [reviewsLastUpdated, setReviewsLastUpdated] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && (!user || user.email !== ADMIN_EMAIL)) {
      router.replace("/");
    }
  }, [user, loading, router]);

  // Dashboard stats
  useEffect(() => {
    if (activeSection !== "dashboard" || !user || user.email !== ADMIN_EMAIL) return;
    let active = true;
    setDataLoading(true);

    const fetchStats = async () => {
      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

      const { data: { users: allAuthUsers } } = await supabaseAdmin.auth.admin.listUsers({ perPage: 100000 });
      const usersCount = allAuthUsers.length;

      const { count: listingsCount } = await supabase
        .from("listings")
        .select("*", { count: "exact", head: true });

      const { count: feedbackCount } = await supabaseAdmin
        .from("deletion_feedback")
        .select("*", { count: "exact", head: true });

      const newUsersCount = allAuthUsers.filter((u: any) => u.created_at >= oneWeekAgo).length;

      if (active) {
        setStats({
          totalUsers: usersCount ?? 0,
          totalListings: listingsCount ?? 0,
          totalDeletionFeedback: feedbackCount ?? 0,
          newUsersThisWeek: newUsersCount,
        });
        setStatsLastUpdated(new Date().toLocaleTimeString('tr-TR'));
        setDataLoading(false);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => { active = false; clearInterval(interval); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSection, user, dashboardRefresh]);

  // Users
  useEffect(() => {
    if (activeSection !== "users" || !user || user.email !== ADMIN_EMAIL) return;
    let active = true;
    setDataLoading(true);

    const fetchUsers = async () => {
      const [authUsersRes, profilesRes, bannedRes, announcementsRes] = await Promise.all([
        supabaseAdmin.auth.admin.listUsers({ perPage: 100000 }),
        supabaseAdmin.from("profiles").select("*"),
        supabase.from("banned_emails").select("email"),
        supabaseAdmin.from("admin_messages").select("*", { count: "exact", head: true }).eq("is_global", true),
      ]);
      const authUsers = authUsersRes.data?.users ?? [];
      const profiles = profilesRes.data ?? [];

      if (active) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const rawUsers: UserRecord[] = authUsers.map((u: any) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const profile = profiles.find((p: any) => p.user_id === u.id);
          return {
            id: u.id,
            user_id: u.id,
            email: u.email ?? "N/A",
            display_name: profile?.display_name ?? null,
            avatar_url: profile?.avatar_url ?? null,
            gender: profile?.gender ?? null,
            birth_date: profile?.birth_date ?? null,
            country: profile?.country ?? null,
            city: profile?.city ?? null,
            created_at: u.created_at,
          };
        });

        setUsersAll(rawUsers);
        setAnnouncementCount(announcementsRes.count ?? 0);

        let allUsers = rawUsers;
        if (usersSearch) {
          const s = usersSearch.toLowerCase();
          allUsers = rawUsers.filter(
            (u) =>
              u.display_name?.toLowerCase().includes(s) ||
              u.email.toLowerCase().includes(s)
          );
        }

        setBannedEmails(new Set((bannedRes.data ?? []).map((b: { email: string }) => b.email)));
        setUsersTotal(allUsers.length);
        setUsers(allUsers.slice((usersPage - 1) * PAGE_SIZE, usersPage * PAGE_SIZE));
        setUsersLastUpdated(new Date().toLocaleTimeString('tr-TR'));
        setDataLoading(false);
      }
    };

    fetchUsers();
    const interval = setInterval(fetchUsers, 30000);
    return () => { active = false; clearInterval(interval); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSection, usersPage, usersSearch, user, usersRefresh]);

  // Listings
  useEffect(() => {
    if (activeSection !== "listings" || !user || user.email !== ADMIN_EMAIL) return;
    let active = true;
    setDataLoading(true);

    const fetchListings = async () => {
      const { data: listingsData, error } = await supabase
        .from("listings")
        .select("*")
        .order("created_at", { ascending: false });
      console.log("[Admin] listings:", listingsData, error);

      if (active) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const allListings: ListingRecord[] = (listingsData ?? []).map((l: any) => ({
          ...l,
          user_email: l.user_email ?? l.email ?? "N/A",
        }));

        setListingsTotal(allListings.length);
        setListings(allListings.slice((listingsPage - 1) * PAGE_SIZE, listingsPage * PAGE_SIZE));
        setListingsLastUpdated(new Date().toLocaleTimeString('tr-TR'));
        setDataLoading(false);
      }
    };

    fetchListings();
    const interval = setInterval(fetchListings, 30000);
    return () => { active = false; clearInterval(interval); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSection, listingsPage, user, listingsRefresh]);

  // Feedback
  useEffect(() => {
    if (activeSection !== "feedback" || !user || user.email !== ADMIN_EMAIL) return;
    let active = true;
    setDataLoading(true);

    const fetchFeedback = async () => {
      const { data: feedbackData, error: feedbackError } = await supabaseAdmin
        .from('deletion_feedback')
        .select('id, email, reasons, rating, feedback, deleted_at, profile_snapshot')
        .order('deleted_at', { ascending: false });
      console.log('FEEDBACK RESULT:', feedbackData?.length, feedbackError?.message);

      if (active) {
        const allFeedback: FeedbackRecord[] = feedbackData || [];
        const rated = allFeedback.filter((f) => f.rating !== null);
        const avg =
          rated.length > 0
            ? rated.reduce((sum, f) => sum + (f.rating ?? 0), 0) / rated.length
            : 0;

        setAvgRating(avg);
        setFeedbackAll(allFeedback);
        setFeedbackTotal(allFeedback.length);
        setFeedback(allFeedback.slice((feedbackPage - 1) * PAGE_SIZE, feedbackPage * PAGE_SIZE));
        setFeedbackLastUpdated(new Date().toLocaleTimeString('tr-TR'));
        setDataLoading(false);
      }
    };

    fetchFeedback();
    const interval = setInterval(fetchFeedback, 30000);
    return () => { active = false; clearInterval(interval); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSection, feedbackPage, user, feedbackRefresh]);

  // Reviews
  useEffect(() => {
    if (activeSection !== "reviews" || !user || user.email !== ADMIN_EMAIL) return;
    let active = true;
    setDataLoading(true);

    const fetchReviews = async () => {
      const { data: reviewsData, error } = await supabaseAdmin
        .from("deletion_feedback")
        .select("*")
        .order("deleted_at", { ascending: false });
      console.log('deletion_feedback:', reviewsData?.length, error);

      if (active) {
        const allReviews: FeedbackRecord[] = reviewsData ?? [];
        setReviewsTotal(allReviews.length);
        setReviews(allReviews.slice((reviewsPage - 1) * PAGE_SIZE, reviewsPage * PAGE_SIZE));
        setReviewsLastUpdated(new Date().toLocaleTimeString('tr-TR'));
        setDataLoading(false);
      }
    };

    fetchReviews();
    const interval = setInterval(fetchReviews, 30000);
    return () => { active = false; clearInterval(interval); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSection, reviewsPage, user, reviewsRefresh]);

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

  const menuItems: { id: Section | "channels" | "banned" | "stories"; label: string; icon: string; href?: string }[] = [
    { id: "dashboard", label: "Dashboard", icon: "📊" },
    { id: "users", label: "Users", icon: "👥" },
    { id: "listings", label: "Listings", icon: "📋" },
    { id: "feedback", label: "Del. Feedback", icon: "💬" },
    { id: "reviews", label: "Reviews", icon: "⭐" },
    { id: "messages", label: "Messages", icon: "✉️" },
    { id: "channels", label: "Kanallarım", icon: "📢", href: "/admin-sefira-2026/channels" },
    { id: "banned", label: "Engelliler", icon: "🚫", href: "/admin-sefira-2026/banned" },
    { id: "stories", label: "Hikayeler", icon: "📸", href: "/admin-sefira-2026/stories" },
  ];

  const navigate = (section: Section) => {
    setActiveSection(section);
    setSidebarOpen(false);
  };

  // ─── Section renderers ───────────────────────────────────────────────────────

  const renderDashboard = () => (
    <div>
      <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
        <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>
        <button onClick={() => setDashboardRefresh(n => n + 1)} className="bg-orange-500 text-white px-4 py-2 rounded-xl text-sm font-bold">
          🔄 Yenile
        </button>
      </div>
      {stats ? (
        <>
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
                link: "/admin-sefira-2026/listings",
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
                bg: "#ccfbf1",
                color: "#F97316",
              },
            ].map((card) => (
              <div
                key={card.label}
                className={`bg-white rounded-2xl p-6 border border-gray-100 ${"link" in card && card.link ? "cursor-pointer hover:border-orange-200 hover:shadow-md transition-all" : ""}`}
                style={{ boxShadow: "0 1px 6px rgba(0,0,0,0.06)" }}
                onClick={"link" in card && card.link ? () => router.push(card.link as string) : undefined}
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
          {statsLastUpdated && <p className="text-xs text-gray-400 mt-4">Son güncelleme: {statsLastUpdated}</p>}
        </>
      ) : (
        <div className="text-gray-400 text-sm">Loading stats…</div>
      )}
    </div>
  );

  const renderUsers = () => {
    const total = usersAll.length;
    const bannedCount = usersAll.filter((u) => bannedEmails.has(u.email)).length;
    const activeCount = total - bannedCount;
    const pct = (n: number) => (total > 0 ? Math.round((n / total) * 100) : 0);

    // ── Countries ─────────────────────────────────────────────────────────────
    const countryCounts: Record<string, number> = {};
    usersAll.forEach((u) => {
      const c = u.country || "Bilinmiyor";
      countryCounts[c] = (countryCounts[c] || 0) + 1;
    });
    const topCountries = Object.entries(countryCounts).sort((a, b) => b[1] - a[1]).slice(0, 15);
    const maxCountry = topCountries[0]?.[1] ?? 1;

    // ── Gender ────────────────────────────────────────────────────────────────
    const genderCounts = { male: 0, female: 0, other: 0, unknown: 0 };
    usersAll.forEach((u) => {
      const g = u.gender?.toLowerCase();
      if (!g) genderCounts.unknown++;
      else if (["male", "erkek"].includes(g)) genderCounts.male++;
      else if (["female", "kadın", "kadin"].includes(g)) genderCounts.female++;
      else genderCounts.other++;
    });

    // ── Age groups ────────────────────────────────────────────────────────────
    const currentYear = new Date().getFullYear();
    const ageCounts = { y1825: 0, y2535: 0, y35plus: 0, unknown: 0 };
    usersAll.forEach((u) => {
      if (!u.birth_date) { ageCounts.unknown++; return; }
      const age = currentYear - new Date(u.birth_date).getFullYear();
      if (age >= 18 && age < 25) ageCounts.y1825++;
      else if (age >= 25 && age < 35) ageCounts.y2535++;
      else if (age >= 35) ageCounts.y35plus++;
      else ageCounts.unknown++;
    });
    const maxAge = Math.max(ageCounts.y1825, ageCounts.y2535, ageCounts.y35plus, ageCounts.unknown, 1);
    const ageGroups = [
      { label: "🧑 18-25 yaş", count: ageCounts.y1825 },
      { label: "👤 25-35 yaş", count: ageCounts.y2535 },
      { label: "🧓 35+ yaş",   count: ageCounts.y35plus },
      { label: "❓ Bilinmiyor", count: ageCounts.unknown },
    ];

    // ── Cities ────────────────────────────────────────────────────────────────
    const hasCities = usersAll.some((u) => u.city);
    const cityCounts: Record<string, number> = {};
    if (hasCities) {
      usersAll.forEach((u) => {
        const c = u.city || "Bilinmiyor";
        cityCounts[c] = (cityCounts[c] || 0) + 1;
      });
    }
    const topCities = Object.entries(cityCounts).sort((a, b) => b[1] - a[1]).slice(0, 10);
    const maxCity = topCities[0]?.[1] ?? 1;

    const card = "bg-white rounded-2xl border border-gray-100 p-5";
    const shadow = { boxShadow: "0 1px 6px rgba(0,0,0,0.06)" };

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h2 className="text-2xl font-bold text-gray-800">Users</h2>
          <button onClick={() => setUsersRefresh(n => n + 1)} className="bg-orange-500 text-white px-4 py-2 rounded-xl text-sm font-bold">
            🔄 Yenile
          </button>
        </div>
        {usersLastUpdated && <p className="text-xs text-gray-400 -mt-2">Son güncelleme: {usersLastUpdated}</p>}

        {/* ── Row 1: Summary cards ──────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className={card} style={shadow}>
            <p className="text-xs text-gray-400 uppercase font-semibold mb-1">👥 Toplam Kullanıcı</p>
            <p className="text-4xl font-black" style={{ color: "#F97316" }}>{total}</p>
          </div>
          <div className={card} style={shadow}>
            <p className="text-xs text-gray-400 uppercase font-semibold mb-1">✅ Aktif Kullanıcı</p>
            <p className="text-4xl font-black text-green-500">{activeCount}</p>
          </div>
          <div className={card} style={shadow}>
            <p className="text-xs text-gray-400 uppercase font-semibold mb-1">🚫 Engellenen</p>
            <p className="text-4xl font-black text-red-500">{bannedCount}</p>
          </div>
        </div>

        {/* ── Row 2: Announcements ──────────────────────────────────────────── */}
        <div className={card} style={shadow}>
          <p className="text-xs text-gray-400 uppercase font-semibold mb-1">📢 Aktif Duyurular</p>
          <p className="text-4xl font-black" style={{ color: "#F97316" }}>{announcementCount}</p>
        </div>

        {/* ── Row 3: Countries ──────────────────────────────────────────────── */}
        <div className={card} style={shadow}>
          <p className="text-sm font-bold text-gray-700 mb-4">Ülkelere Göre Kullanıcılar (Top 15)</p>
          {topCountries.length === 0 ? (
            <p className="text-sm text-gray-400">Veri yok</p>
          ) : (
            <div className="space-y-2.5">
              {topCountries.map(([country, count], i) => {
                const p = pct(count);
                const barW = Math.round((count / maxCountry) * 100);
                const flag = COUNTRY_FLAGS[country] ?? "🌍";
                return (
                  <div key={country} className="flex items-center gap-3">
                    <span className="text-xs font-bold text-gray-400 w-4 shrink-0">{i + 1}</span>
                    <span className="text-lg shrink-0">{flag}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5 gap-2">
                        <span className="text-sm text-gray-700 truncate">{country}</span>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-sm font-black" style={{ color: "#F97316" }}>{count}</span>
                          <span className="text-xs text-gray-400 w-8 text-right">{p}%</span>
                        </div>
                      </div>
                      <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${barW}%`, backgroundColor: "#F97316" }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Row 4: Gender | Age groups ────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Gender */}
          <div className={card} style={shadow}>
            <p className="text-sm font-bold text-gray-700 mb-4">Cinsiyet Dağılımı</p>
            {genderCounts.male + genderCounts.female > 0 ? (
              <>
                <div className="flex h-3 rounded-full overflow-hidden mb-4">
                  <div style={{ width: `${pct(genderCounts.male)}%`, backgroundColor: "#3b82f6" }} />
                  <div style={{ width: `${pct(genderCounts.female)}%`, backgroundColor: "#ec4899" }} />
                  <div style={{ width: `${pct(genderCounts.other + genderCounts.unknown)}%`, backgroundColor: "#d1d5db" }} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-3 rounded-xl" style={{ backgroundColor: "#eff6ff" }}>
                    <p className="text-2xl mb-1">👨</p>
                    <p className="text-2xl font-black text-blue-500">{pct(genderCounts.male)}%</p>
                    <p className="text-xs text-gray-500 mt-0.5">Erkek · {genderCounts.male} kişi</p>
                  </div>
                  <div className="text-center p-3 rounded-xl" style={{ backgroundColor: "#fdf2f8" }}>
                    <p className="text-2xl mb-1">👩</p>
                    <p className="text-2xl font-black" style={{ color: "#ec4899" }}>{pct(genderCounts.female)}%</p>
                    <p className="text-xs text-gray-500 mt-0.5">Kadın · {genderCounts.female} kişi</p>
                  </div>
                </div>
                {(genderCounts.other > 0 || genderCounts.unknown > 0) && (
                  <p className="text-xs text-gray-400 mt-3 text-center">
                    Diğer: {genderCounts.other} · Belirtmemiş: {genderCounts.unknown}
                  </p>
                )}
              </>
            ) : (
              <p className="text-sm text-gray-400">Veri yok</p>
            )}
          </div>

          {/* Age groups */}
          <div className={card} style={shadow}>
            <p className="text-sm font-bold text-gray-700 mb-4">Yaş Grupları</p>
            {total > 0 ? (
              <div className="space-y-3">
                {ageGroups.map(({ label, count }) => (
                  <div key={label}>
                    <div className="flex items-center justify-between mb-0.5 text-sm">
                      <span className="text-gray-700">{label}</span>
                      <span className="text-gray-500">{count} kişi ({pct(count)}%)</span>
                    </div>
                    <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${Math.round((count / maxAge) * 100)}%`, backgroundColor: "#F97316" }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400">Veri yok</p>
            )}
          </div>
        </div>

        {/* ── Row 5: Top Cities (only if field exists) ──────────────────────── */}
        {hasCities && (
          <div className={card} style={shadow}>
            <p className="text-sm font-bold text-gray-700 mb-4">En Çok Kullanıcı Olan Şehirler</p>
            <div className="space-y-2.5">
              {topCities.map(([city, count], i) => {
                const p = pct(count);
                const barW = Math.round((count / maxCity) * 100);
                return (
                  <div key={city} className="flex items-center gap-3">
                    <span className="text-xs font-bold text-gray-400 w-4 shrink-0">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5 gap-2">
                        <span className="text-sm text-gray-700 truncate">{city}</span>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-sm font-black" style={{ color: "#F97316" }}>{count}</span>
                          <span className="text-xs text-gray-400 w-8 text-right">{p}%</span>
                        </div>
                      </div>
                      <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${barW}%`, backgroundColor: "#F97316" }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Users table ───────────────────────────────────────────────────── */}
        <div>
          <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
            <p className="text-sm font-bold text-gray-600">
              Kullanıcı Listesi ({usersTotal})
            </p>
            <div className="flex gap-2">
              <input
                value={usersSearchInput}
                onChange={(e) => setUsersSearchInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") { setUsersSearch(usersSearchInput); setUsersPage(1); }
                }}
                placeholder="Search by name or email…"
                className="px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 w-56 sm:w-72"
              />
              <button
                onClick={() => { setUsersSearch(usersSearchInput); setUsersPage(1); }}
                className="px-4 py-2 rounded-xl text-sm font-medium text-white transition-colors"
                style={{ backgroundColor: "#F97316" }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#ea6c08")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#F97316")}
              >
                Search
              </button>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden" style={shadow}>
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
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#ccfbf1")}
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.backgroundColor = i % 2 === 1 ? "#fafafa" : "white")
                      }
                    >
                      <td className="px-4 py-3">
                        {u.avatar_url ? (
                          <img src={u.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover" />
                        ) : (
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                            style={{ backgroundColor: "#ccfbf1", color: "#F97316" }}
                          >
                            {u.display_name?.[0]?.toUpperCase() ?? u.email?.[0]?.toUpperCase() ?? "?"}
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
                              style={{ backgroundColor: "#ccfbf1", color: "#F97316" }}
                              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#ffedd5")}
                              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#ccfbf1")}
                            >
                              {banningUserId === u.user_id ? "…" : "🚫 Engelle"}
                            </button>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteConfirm({ type: "user", id: u.id, userId: u.user_id, name: u.display_name ?? u.email });
                            }}
                            className="px-3 py-1.5 text-xs font-medium rounded-lg transition-colors"
                            style={{ backgroundColor: "#fef2f2", color: "#ef4444" }}
                            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#fee2e2")}
                            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#fef2f2")}
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
      </div>
    );
  };

  const renderListings = () => (
    <div>
      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        <h2 className="text-2xl font-bold text-gray-800">Listings</h2>
        <button onClick={() => setListingsRefresh(n => n + 1)} className="bg-orange-500 text-white px-4 py-2 rounded-xl text-sm font-bold">
          🔄 Yenile
        </button>
      </div>
      {listingsLastUpdated && <p className="text-xs text-gray-400 mb-4">Son güncelleme: {listingsLastUpdated}</p>}
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
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#ccfbf1")}
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = i % 2 === 1 ? "#fafafa" : "white")
                  }
                >
                  <td className="px-4 py-3 text-gray-600">{l.user_email}</td>
                  <td className="px-4 py-3">
                    <span
                      className="px-2.5 py-1 rounded-lg text-xs font-medium capitalize"
                      style={{ backgroundColor: "#ccfbf1", color: "#F97316" }}
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

  const renderFeedback = () => {
    const total = feedbackAll.length;

    // ── Reason counts ──────────────────────────────────────────────────────────
    const reasonCounts: Record<string, number> = {};
    feedbackAll.forEach((f) => {
      (f.reasons || []).forEach((r) => {
        reasonCounts[r] = (reasonCounts[r] || 0) + 1;
      });
    });
    const topReasons = Object.entries(reasonCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
    const maxReasonCount = topReasons[0]?.[1] ?? 1;

    // ── Country counts ─────────────────────────────────────────────────────────
    const countryCounts: Record<string, number> = {};
    feedbackAll.forEach((f) => {
      const c = (f.profile_snapshot as { country?: string } | null)?.country || "Bilinmiyor";
      countryCounts[c] = (countryCounts[c] || 0) + 1;
    });
    const topCountries = Object.entries(countryCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    // ── Monthly counts ─────────────────────────────────────────────────────────
    const monthCounts: Record<string, number> = {};
    feedbackAll.forEach((f) => {
      if (!f.deleted_at) return;
      const m = f.deleted_at.substring(0, 7);
      monthCounts[m] = (monthCounts[m] || 0) + 1;
    });
    const monthsSorted = Object.entries(monthCounts)
      .sort((a, b) => b[0].localeCompare(a[0]))
      .slice(0, 12);
    const maxMonthCount = monthsSorted[0]?.[1] ?? 1;

    // ── This month ─────────────────────────────────────────────────────────────
    const thisMonthKey = new Date().toISOString().substring(0, 7);
    const thisMonthCount = monthCounts[thisMonthKey] ?? 0;

    const card = "bg-white rounded-2xl border border-gray-100 p-5";
    const cardShadow = { boxShadow: "0 1px 6px rgba(0,0,0,0.06)" };

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h2 className="text-2xl font-bold text-gray-800">Deletion Feedback</h2>
          <button onClick={() => setFeedbackRefresh(n => n + 1)} className="bg-orange-500 text-white px-4 py-2 rounded-xl text-sm font-bold">
            🔄 Yenile
          </button>
        </div>
        {feedbackLastUpdated && <p className="text-xs text-gray-400 -mt-2">Son güncelleme: {feedbackLastUpdated}</p>}

        {/* ── Row 1: Summary cards ──────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Total */}
          <div className={card} style={cardShadow}>
            <p className="text-xs text-gray-400 uppercase font-semibold mb-1">Toplam Silme</p>
            <p className="text-4xl font-black" style={{ color: "#F97316" }}>{total}</p>
            <p className="text-xs text-gray-400 mt-1">kayıtlı kullanıcı</p>
          </div>
          {/* Avg rating */}
          <div className={card} style={cardShadow}>
            <p className="text-xs text-gray-400 uppercase font-semibold mb-1">Ortalama Puan</p>
            <p className="text-4xl font-black" style={{ color: "#F97316" }}>
              {avgRating > 0 ? avgRating.toFixed(1) : "—"}
            </p>
            <div className="mt-1">
              <StarRating rating={avgRating > 0 ? Math.round(avgRating) : null} />
            </div>
          </div>
          {/* This month */}
          <div className={card} style={cardShadow}>
            <p className="text-xs text-gray-400 uppercase font-semibold mb-1">Bu Ay</p>
            <p className="text-4xl font-black" style={{ color: "#F97316" }}>{thisMonthCount}</p>
            <p className="text-xs text-gray-400 mt-1">{formatMonth(thisMonthKey)} silmesi</p>
          </div>
        </div>

        {/* ── Row 2: Top reasons ────────────────────────────────────────────── */}
        <div className={card} style={cardShadow}>
          <p className="text-sm font-bold text-gray-700 mb-4">En Sık Ayrılma Nedenleri</p>
          {topReasons.length === 0 ? (
            <p className="text-gray-400 text-sm">Henüz veri yok</p>
          ) : (
            <div className="space-y-3">
              {topReasons.map(([key, count], i) => {
                const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                const barPct = Math.round((count / maxReasonCount) * 100);
                const label = REASON_LABELS[key] ?? `Neden ${key}`;
                return (
                  <div key={key} className="flex items-center gap-3">
                    <span className="text-xs font-bold text-gray-400 w-4 shrink-0">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1 gap-2">
                        <span className="text-sm text-gray-700 truncate">{label}</span>
                        <div className="flex items-center gap-2 shrink-0">
                          <span
                            className="text-xs font-bold px-2 py-0.5 rounded-full text-white"
                            style={{ backgroundColor: "#F97316" }}
                          >
                            {count}
                          </span>
                          <span className="text-xs text-gray-400 w-8 text-right">{pct}%</span>
                        </div>
                      </div>
                      <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{ width: `${barPct}%`, backgroundColor: "#F97316" }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Row 3: Countries + Monthly trend ─────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Countries */}
          <div className={card} style={cardShadow}>
            <p className="text-sm font-bold text-gray-700 mb-4">Ülkelere Göre Silmeler</p>
            {topCountries.length === 0 ? (
              <p className="text-gray-400 text-sm">Henüz veri yok</p>
            ) : (
              <div className="space-y-2">
                {topCountries.map(([country, count]) => {
                  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                  const flag = COUNTRY_FLAGS[country] ?? "🌍";
                  return (
                    <div key={country} className="flex items-center gap-3">
                      <span className="text-xl shrink-0">{flag}</span>
                      <div className="flex-1 min-w-0">
                        <span className="text-sm text-gray-700 truncate block">{country}</span>
                      </div>
                      <span className="text-lg font-black shrink-0" style={{ color: "#F97316" }}>
                        {count}
                      </span>
                      <span className="text-xs text-gray-400 w-8 text-right shrink-0">{pct}%</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Monthly trend */}
          <div className={card} style={cardShadow}>
            <p className="text-sm font-bold text-gray-700 mb-4">Aylık Silme Trendi</p>
            {monthsSorted.length === 0 ? (
              <p className="text-gray-400 text-sm">Henüz veri yok</p>
            ) : (
              <div className="space-y-2">
                {monthsSorted.map(([month, count]) => {
                  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                  const barPct = Math.round((count / maxMonthCount) * 100);
                  return (
                    <div key={month}>
                      <div className="flex items-center justify-between mb-0.5 text-xs">
                        <span className="text-gray-600 font-medium">{formatMonth(month)}</span>
                        <span className="text-gray-400">{count} silme ({pct}%)</span>
                      </div>
                      <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${barPct}%`, backgroundColor: "#F97316" }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ── Feedback table ────────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden" style={cardShadow}>
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
                    style={{ backgroundColor: i % 2 === 1 ? "#fafafa" : "white", cursor: "pointer" }}
                    onClick={() => setSelectedFeedback(f)}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#ccfbf1")}
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
                              {REASON_LABELS[r] ?? r}
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
  };

  const renderReviews = () => (
    <div>
      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        <h2 className="text-2xl font-bold text-gray-800">Reviews</h2>
        <button onClick={() => setReviewsRefresh(n => n + 1)} className="bg-orange-500 text-white px-4 py-2 rounded-xl text-sm font-bold">
          🔄 Yenile
        </button>
      </div>
      {reviewsLastUpdated && <p className="text-xs text-gray-400 mb-4">Son güncelleme: {reviewsLastUpdated}</p>}
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
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#ccfbf1")}
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
            style={{ backgroundColor: "#F97316" }}
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
                  backgroundColor: active ? "#F97316" : "transparent",
                  color: active ? "white" : "#374151",
                  boxShadow: active ? "0 2px 8px rgba(249,115,22,0.3)" : "none",
                }}
                onMouseEnter={(e) => {
                  if (!active) {
                    e.currentTarget.style.backgroundColor = "#ccfbf1";
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

        {/* Bottom user info */}
        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
              style={{ backgroundColor: "#ccfbf1", color: "#F97316" }}
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
                style={{ backgroundColor: "#ccfbf1", color: "#F97316" }}
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

      {/* Feedback detail modal */}
      {selectedFeedback && (
        <FeedbackDetailModal
          record={selectedFeedback}
          onClose={() => setSelectedFeedback(null)}
        />
      )}

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
              style={{ backgroundColor: "#ccfbf1" }}
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
                style={{ backgroundColor: "#F97316" }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#ea6c08")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#F97316")}
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
  key: string;
  user_id: string;
  email: string | null;
  display_name: string | null;
  last_message: string;
  last_date: string;
  unread_count: number;
  source: "admin" | "listing";
  conversation_id?: string;
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
  const [selectedConvObj, setSelectedConvObj] = useState<Conversation | null>(null);
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

  const fetchThread = async (conv: Conversation) => {
    setLoadingThread(true);
    const url =
      conv.source === "listing" && conv.conversation_id
        ? `/api/admin/conversations?convId=${conv.conversation_id}`
        : `/api/admin/conversations?userId=${conv.user_id}`;
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    const json = await res.json();
    if (json.messages) setThread(json.messages);
    setLoadingThread(false);
    setTimeout(() => threadEndRef.current?.scrollIntoView({ behavior: "smooth" }), 80);
  };

  useEffect(() => { fetchConversations(); }, []);

  const selectConversation = async (conv: Conversation) => {
    setSelectedId(conv.key);
    setSelectedConvObj(conv);
    setMobileView("chat");
    fetchThread(conv);
    // Zero the badge immediately in local state
    setConversations((prev) =>
      prev.map((c) => c.key === conv.key ? { ...c, unread_count: 0 } : c)
    );
    // Persist read status
    const markReadBody =
      conv.source === "listing" && conv.conversation_id
        ? JSON.stringify({ convId: conv.conversation_id })
        : JSON.stringify({ userId: conv.user_id });
    await fetch("/api/admin/mark-read", {
      method: "POST",
      headers: authJson,
      body: markReadBody,
    });
    fetchConversations();
  };

  const handleSend = async () => {
    if (!replyText.trim() || !selectedId || !selectedConvObj || sending) return;
    setSending(true);
    const text = replyText.trim();
    setReplyText("");

    // Optimistic update
    const tempId = "temp-" + Date.now();
    const optimistic: ThreadMsg = {
      id: tempId,
      user_id: selectedConvObj.user_id,
      message: text,
      sender: "admin",
      is_read: false,
      created_at: new Date().toISOString(),
    };
    setThread((prev) => [...prev, optimistic]);
    setTimeout(() => threadEndRef.current?.scrollIntoView({ behavior: "smooth" }), 30);

    const isListing = selectedConvObj.source === "listing" && selectedConvObj.conversation_id;
    const sendBody = isListing
      ? JSON.stringify({ convId: selectedConvObj.conversation_id, message: text })
      : JSON.stringify({ userId: selectedConvObj.user_id, userEmail: "", title: "reply", message: text, sendToAll: false, sender: "admin" });

    const res = await fetch("/api/admin/send-message", {
      method: "POST",
      headers: authJson,
      body: sendBody,
    });
    const result = await res.json();
    if (!result.error) {
      await fetchThread(selectedConvObj);
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

  const selectedConv = conversations.find((c) => c.key === selectedId) ?? selectedConvObj;
  const displayName = (conv: Conversation | null | undefined, uid: string | null) =>
    conv?.display_name ?? conv?.email ?? (uid ? uid.slice(0, 8) + "…" : "?");

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
                key={conv.key}
                onClick={() => selectConversation(conv)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 text-left border-b border-gray-50 transition-colors ${
                  selectedId === conv.key ? "bg-orange-50" : "hover:bg-gray-50"
                }`}
              >
                <div
                  className="w-11 h-11 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                  style={{ backgroundColor: "#F97316" }}
                >
                  {(conv.display_name?.[0] ?? conv.email?.[0] ?? "?").toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <span
                      className={`text-sm truncate ${
                        conv.unread_count > 0 ? "font-bold text-gray-900" : "font-semibold text-gray-700"
                      }`}
                    >
                      {conv.display_name ?? conv.email ?? conv.user_id.slice(0, 8) + "…"}
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
                  style={{ backgroundColor: "#F97316" }}
                >
                  {(selectedConv?.display_name?.[0] ?? selectedConv?.email?.[0] ?? "?").toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900 text-sm leading-tight truncate">
                    {displayName(selectedConv, selectedId)}
                  </p>
                  <p className="text-xs text-emerald-500 font-semibold">
                    {selectedConv?.source === "listing" ? "İlan Mesajı" : "Kullanıcı"}
                  </p>
                </div>
                <button
                  onClick={() => router.push(`/admin-sefira-2026/user/${selectedConv?.user_id ?? selectedId}`)}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg bg-orange-50 hover:bg-orange-100 text-orange-700 transition-colors flex-shrink-0"
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
                              {(selectedConv?.display_name?.[0] ?? selectedConv?.email?.[0] ?? "?").toUpperCase()}
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
                    style={{ backgroundColor: "#F97316" }}
                    onMouseEnter={(e) => {
                      if (!sending) e.currentTarget.style.backgroundColor = "#ea6c08";
                    }}
                    onMouseLeave={(e) => {
                      if (!sending) e.currentTarget.style.backgroundColor = "#F97316";
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
