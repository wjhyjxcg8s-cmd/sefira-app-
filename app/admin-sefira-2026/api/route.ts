import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNlZXR6b3BoYXlieXdmdWhlemh2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkzNTc4NTUsImV4cCI6MjA5NDkzMzg1NX0.DARDlw_AL8WX6yfgYDgb6nSgCo84jMV05aNbfT-zHpI";
const ADMIN_EMAIL = "supportsefira@gmail.com";
const PAGE_SIZE = 20;

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

async function verifyAdmin(req: NextRequest) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return null;

  const supabaseUser = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const {
    data: { user },
    error,
  } = await supabaseUser.auth.getUser();
  if (error || !user || user.email !== ADMIN_EMAIL) return null;
  return user;
}

export async function GET(req: NextRequest) {
  const adminUser = await verifyAdmin(req);
  if (!adminUser) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const section = searchParams.get("section");
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const search = searchParams.get("search") || "";
  const offset = (page - 1) * PAGE_SIZE;

  try {
    if (section === "stats") {
      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

      const { count: usersCount } = await supabaseAdmin
        .from("profiles")
        .select("*", { count: "exact", head: true });

      const { count: listingsCount } = await supabaseAdmin
        .from("listings")
        .select("*", { count: "exact", head: true });

      const { count: feedbackCount } = await supabaseAdmin
        .from("deletion_feedback")
        .select("*", { count: "exact", head: true });

      const { count: newUsersCount } = await supabaseAdmin
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .gte("created_at", oneWeekAgo);

      return NextResponse.json({
        totalUsers: usersCount ?? 0,
        totalListings: listingsCount ?? 0,
        totalDeletionFeedback: feedbackCount ?? 0,
        newUsersThisWeek: newUsersCount ?? 0,
      });
    }

    if (section === "users") {
      const { data: authData } = await supabaseAdmin.auth.admin.listUsers({
        perPage: 10000,
      });
      const authUsers = authData?.users ?? [];

      const emailMap: Record<string, string> = {};
      for (const u of authUsers) {
        if (u.email) emailMap[u.id] = u.email;
      }

      const { data: profiles } = await supabaseAdmin
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let combined = (profiles ?? []).map((p: any) => ({
        id: p.id,
        email: emailMap[p.id] ?? "N/A",
        display_name: p.display_name ?? null,
        avatar_url: p.avatar_url ?? null,
        gender: p.gender ?? null,
        birth_date: p.birth_date ?? null,
        country: p.country ?? null,
        created_at: p.created_at,
      }));

      if (search) {
        const s = search.toLowerCase();
        combined = combined.filter(
          (u) =>
            u.email.toLowerCase().includes(s) ||
            u.display_name?.toLowerCase().includes(s)
        );
      }

      const total = combined.length;
      const paginated = combined.slice(offset, offset + PAGE_SIZE);

      return NextResponse.json({ users: paginated, total });
    }

    if (section === "listings") {
      const { data: authData } = await supabaseAdmin.auth.admin.listUsers({
        perPage: 10000,
      });
      const authUsers = authData?.users ?? [];

      const emailMap: Record<string, string> = {};
      for (const u of authUsers) {
        if (u.email) emailMap[u.id] = u.email;
      }

      const { data: listings, count, error } = await supabaseAdmin
        .from("listings")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(offset, offset + PAGE_SIZE - 1);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const withEmails = (listings ?? []).map((l: any) => ({
        ...l,
        user_email: emailMap[l.user_id] ?? "N/A",
      }));

      return NextResponse.json({ listings: withEmails, total: count ?? 0 });
    }

    if (section === "feedback") {
      console.log('fetching deletion_feedback with admin client')
      const { data: allRatings } = await supabaseAdmin
        .from("deletion_feedback")
        .select("rating")
        .not("rating", "is", null);

      const avgRating =
        allRatings && allRatings.length > 0
          ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
            allRatings.reduce((sum: number, r: any) => sum + (r.rating ?? 0), 0) /
            allRatings.length
          : 0;

      const { data: feedback, count, error } = await supabaseAdmin
        .from("deletion_feedback")
        .select("*", { count: "exact" })
        .order("deleted_at", { ascending: false })
        .range(offset, offset + PAGE_SIZE - 1);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ feedback, total: count ?? 0, avgRating });
    }

    if (section === "reviews") {
      const { data: reviews, count, error } = await supabaseAdmin
        .from("deletion_feedback")
        .select("*", { count: "exact" })
        .order("deleted_at", { ascending: false })
        .range(offset, offset + PAGE_SIZE - 1);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ reviews, total: count ?? 0 });
    }

    return NextResponse.json({ error: "Invalid section" }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const adminUser = await verifyAdmin(req);
  if (!adminUser) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  try {
    if (type === "user") {
      const { error } = await supabaseAdmin.auth.admin.deleteUser(id);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ ok: true });
    }

    if (type === "listing") {
      const { error } = await supabaseAdmin.from("listings").delete().eq("id", id);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
