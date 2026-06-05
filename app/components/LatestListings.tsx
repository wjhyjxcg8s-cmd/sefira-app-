"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabaseClient = createClient(
  "https://ceetzophaybywfuhezhv.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNlZXR6b3BoYXlieXdmdWhlemh2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkzNTc4NTUsImV4cCI6MjA5NDkzMzg1NX0.DARDlw_AL8WX6yfgYDgb6nSgCo84jMV05aNbfT-zHpI"
);

export default function LatestListings() {
  const [listings, setListings] = useState<any[]>([]);

  useEffect(() => {
    async function fetchListings() {
      const { data, error } = await supabaseClient
        .from("listings")
        .select("id, type, city, district, rent, currency, photos, house_type, rooms, smoking, user_id")
        .order("created_at", { ascending: false })
        .limit(6);

      if (error || !data || data.length === 0) {
        setListings([]);
        return;
      }

      const userIds = data.map((l: any) => l.user_id).filter(Boolean);
      const { data: profiles } = await supabaseClient
        .from("profiles")
        .select("user_id, display_name, avatar_url")
        .in("user_id", userIds);

      const merged = data.map((l: any) => ({
        ...l,
        profile: profiles?.find((p: any) => p.user_id === l.user_id) || null,
      }));

      setListings(merged);
    }
    fetchListings();
  }, []);

  return (
    <section className="max-w-7xl mx-auto px-5 mt-14 mb-14">
      <div className="text-center mb-8">
        <h2 className="text-3xl sm:text-4xl font-black text-stone-900 mb-2 tracking-tight">
          Son İlanlar
        </h2>
      </div>

      {listings.length === 0 ? (
        <p className="text-center text-gray-400 py-8">Henüz ilan yok</p>
      ) : (
        <div className="grid grid-cols-3 gap-3">
          {listings.map((listing) => (
            <div
              key={listing.id}
              className="rounded-2xl overflow-hidden shadow-md bg-white hover:shadow-xl transition-shadow cursor-pointer"
            >
              <div className="aspect-video bg-gray-100 relative">
                {listing.photos?.[0] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={listing.photos[0]}
                    alt={listing.city}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-stone-200 to-stone-300 flex items-center justify-center">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-10 h-10 text-stone-400">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                    </svg>
                  </div>
                )}
                <span className="absolute top-2 left-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                  {listing.type === "has_place" ? "Ev Sahibi" : "Kiracı"}
                </span>
              </div>

              <div className="p-4">
                <p className="font-bold text-sm text-gray-900">
                  {listing.city}{listing.district ? ` / ${listing.district}` : ""}
                </p>
                {listing.rent && listing.currency && (
                  <p className="text-orange-500 font-bold text-sm mt-1">
                    {listing.rent} {listing.currency}/ay
                  </p>
                )}
                {(listing.house_type || listing.rooms) && (
                  <p className="text-gray-500 text-xs mt-1">
                    {listing.house_type ?? ""}
                    {listing.house_type && listing.rooms ? " • " : ""}
                    {listing.rooms ? `${listing.rooms} oda` : ""}
                  </p>
                )}
                {listing.smoking === false && (
                  <p className="text-gray-400 text-xs mt-1">🚭 Sigara İçilmez</p>
                )}

                {listing.profile?.avatar_url && (
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={listing.profile.avatar_url}
                      className="w-8 h-8 rounded-full object-cover border-2 border-orange-200"
                      alt=""
                    />
                    <span className="text-xs text-gray-500 font-medium truncate">
                      {listing.profile.display_name || ""}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
