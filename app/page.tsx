"use client";

import { useState, useEffect } from "react";

const navLinks = [
  { label: "Find Rooms", href: "#" },
  { label: "Find Roommates", href: "#" },
  { label: "List Property", href: "#" },
  { label: "Community", href: "#" },
];

const stats = [
  { value: "127K+", label: "Verified Users" },
  { value: "52", label: "Cities Worldwide" },
  { value: "98%", label: "Match Satisfaction" },
  { value: "4.9★", label: "App Rating" },
];

const stories = [
  { id: 1, name: "Add Story", isAdd: true, gradient: "from-slate-700 to-slate-800", initials: "+", city: "", online: false },
  { id: 2, name: "Sarah K.", isAdd: false, online: true, initials: "SK", gradient: "from-pink-500 to-rose-600", city: "Berlin" },
  { id: 3, name: "Ahmed M.", isAdd: false, online: true, initials: "AM", gradient: "from-blue-500 to-indigo-600", city: "Dubai" },
  { id: 4, name: "Yuki T.", isAdd: false, online: false, initials: "YT", gradient: "from-violet-500 to-purple-600", city: "Tokyo" },
  { id: 5, name: "Maria L.", isAdd: false, online: true, initials: "ML", gradient: "from-amber-500 to-orange-600", city: "BCN" },
  { id: 6, name: "James W.", isAdd: false, online: false, initials: "JW", gradient: "from-emerald-500 to-teal-600", city: "London" },
  { id: 7, name: "Priya S.", isAdd: false, online: true, initials: "PS", gradient: "from-rose-500 to-pink-600", city: "Mumbai" },
  { id: 8, name: "Carlos R.", isAdd: false, online: true, initials: "CR", gradient: "from-cyan-500 to-blue-600", city: "Madrid" },
  { id: 9, name: "Lena M.", isAdd: false, online: false, initials: "LM", gradient: "from-purple-500 to-violet-600", city: "Paris" },
];

const matchProfiles = [
  {
    id: 1, name: "Emma Wilson", age: 26, occupation: "UX Designer", nationality: "British",
    match: 97, city: "Berlin", gradient: "from-violet-600 via-purple-700 to-indigo-800",
    initials: "EW", lifestyle: ["Night owl", "Minimalist", "Yoga"],
    bio: "Creative designer looking for a quiet, tidy flatmate who appreciates good aesthetics.",
    verified: true, pets: false, smoking: false, budget: "700-1000",
  },
  {
    id: 2, name: "Kai Tanaka", age: 29, occupation: "Software Engineer", nationality: "Japanese",
    match: 94, city: "Berlin", gradient: "from-cyan-600 via-blue-700 to-indigo-800",
    initials: "KT", lifestyle: ["Early bird", "Gamer", "Coffee lover"],
    bio: "Remote dev who values clean spaces and good coffee. Lets build a calm, focused home.",
    verified: true, pets: true, smoking: false, budget: "800-1100",
  },
  {
    id: 3, name: "Sofia Ramirez", age: 24, occupation: "Medical Student", nationality: "Spanish",
    match: 91, city: "Berlin", gradient: "from-rose-500 via-pink-600 to-fuchsia-700",
    initials: "SR", lifestyle: ["Student", "Active", "Social"],
    bio: "Med student, tidy and friendly. Latin music on weekends, focused on weeknights.",
    verified: false, pets: false, smoking: false, budget: "500-750",
  },
];

const listings = [
  {
    id: 1, title: "Modern Studio near Alexanderplatz", city: "Berlin", country: "Germany",
    price: 850, sym: "EUR", rating: 4.9, reviews: 127, type: "Private Room",
    available: "Jun 1", gradient: "from-blue-600 via-indigo-700 to-violet-800",
    verified: true, amenities: ["WiFi", "Gym", "Balcony"], tag: "Most Popular",
    tagColor: "from-blue-500 to-indigo-600", gender: "Any",
  },
  {
    id: 2, title: "Luxury Sea-View Apartment", city: "Dubai", country: "UAE",
    price: 1200, sym: "USD", rating: 4.8, reviews: 89, type: "Entire Flat",
    available: "Now", gradient: "from-amber-500 via-orange-600 to-rose-700",
    verified: true, amenities: ["Pool", "Gym", "Concierge"], tag: "New",
    tagColor: "from-amber-500 to-orange-600", gender: "Male",
  },
  {
    id: 3, title: "Charming Room near Bosphorus", city: "Istanbul", country: "Turkey",
    price: 450, sym: "USD", rating: 4.7, reviews: 204, type: "Private Room",
    available: "May 25", gradient: "from-emerald-500 via-teal-600 to-cyan-700",
    verified: false, amenities: ["WiFi", "Kitchen", "Sea View"], tag: "Best Value",
    tagColor: "from-emerald-500 to-teal-600", gender: "Any",
  },
  {
    id: 4, title: "Designer Loft in Eixample", city: "Barcelona", country: "Spain",
    price: 780, sym: "EUR", rating: 5.0, reviews: 56, type: "Private Room",
    available: "Jun 15", gradient: "from-rose-500 via-pink-600 to-fuchsia-700",
    verified: true, amenities: ["WiFi", "Rooftop", "A/C"], tag: "Top Rated",
    tagColor: "from-rose-500 to-pink-600", gender: "Female",
  },
];

const trendingCities = [
  { name: "Istanbul", country: "Turkey", listings: "2,847", growth: "+23%", glow: "bg-orange-500/10", border: "border-orange-500/20", emoji: "🕌" },
  { name: "Berlin", country: "Germany", listings: "1,923", growth: "+18%", glow: "bg-blue-500/10", border: "border-blue-500/20", emoji: "🐻" },
  { name: "Dubai", country: "UAE", listings: "1,456", growth: "+31%", glow: "bg-amber-500/10", border: "border-amber-500/20", emoji: "🏙️" },
  { name: "Barcelona", country: "Spain", listings: "1,234", growth: "+15%", glow: "bg-yellow-500/10", border: "border-yellow-500/20", emoji: "🏖️" },
  { name: "Amsterdam", country: "Netherlands", listings: "987", growth: "+12%", glow: "bg-red-500/10", border: "border-red-500/20", emoji: "🚲" },
  { name: "London", country: "UK", listings: "3,201", growth: "+8%", glow: "bg-indigo-500/10", border: "border-indigo-500/20", emoji: "🎡" },
];

const testimonials = [
  { name: "Alex Morrison", role: "Digital Nomad", city: "Amsterdam", quote: "Found my perfect roommate in 48 hours. The AI matching is insanely accurate. Same sleep schedule, same cleaning habits.", rating: 5, gradient: "from-blue-500 to-indigo-600", initials: "AM" },
  { name: "Layla Hassan", role: "Medical Student", city: "Berlin", quote: "As an expat I was terrified about finding safe housing. Sefiras verification system and warm community made me feel at home.", rating: 5, gradient: "from-emerald-500 to-teal-600", initials: "LH" },
  { name: "Daniel Park", role: "Tech Professional", city: "Dubai", quote: "The UI is addictive. I kept swiping through profiles until I found a place that actually feels like home, not just a room.", rating: 5, gradient: "from-rose-500 to-pink-600", initials: "DP" },
];

const howItWorks = [
  { step: "01", title: "Build Your Profile", desc: "Tell us your lifestyle, budget, and personality. Our AI learns what makes you unique.", icon: "✦", gradient: "from-blue-500 to-indigo-600" },
  { step: "02", title: "Get AI Matches", desc: "40+ compatibility factors analyzed instantly. Your perfect roommate is closer than you think.", icon: "◈", gradient: "from-violet-500 to-purple-600" },
  { step: "03", title: "Swipe and Connect", desc: "Like, match, and message. Video verify before any commitment is made.", icon: "◎", gradient: "from-pink-500 to-rose-600" },
  { step: "04", title: "Move In", desc: "Sign digitally, get community support, and settle into your perfect home.", icon: "⌂", gradient: "from-emerald-500 to-teal-600" },
];

const communityPosts = [
  { id: 1, user: "Sarah K.", location: "Berlin, Germany", content: "Just found the most amazing flatmates through Sefira! Moving in next weekend. This city finally feels like home.", likes: 342, comments: 28, gradient: "from-pink-500 to-rose-600", initials: "SK", time: "2h ago" },
  { id: 2, user: "Ahmed M.", location: "Dubai, UAE", content: "Roommate tip: be honest about your sleep schedule! Mine is a night owl and we matched perfectly. 6 months in, zero issues.", likes: 218, comments: 45, gradient: "from-blue-500 to-indigo-600", initials: "AM", time: "5h ago" },
  { id: 3, user: "Yuki T.", location: "Amsterdam, NL", content: "First week in my new flat. Sefira matched me with 3 others who love minimalist design and early mornings. Dream team.", likes: 456, comments: 67, gradient: "from-violet-500 to-purple-600", initials: "YT", time: "1d ago" },
];

const footerLinks = [
  { title: "Product", links: ["Find Rooms", "Find Roommates", "List Property", "AI Matching", "Premium"] },
  { title: "Company", links: ["About", "Blog", "Careers", "Press", "Contact"] },
  { title: "Support", links: ["Help Center", "Safety", "Terms", "Privacy", "Cookies"] },
];

export default function Home() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [likedListings, setLikedListings] = useState<number[]>([]);
  const [likedProfiles, setLikedProfiles] = useState<number[]>([]);
  const [activeMatch, setActiveMatch] = useState(0);
  const [searchInput, setSearchInput] = useState("");
  const [searchTab, setSearchTab] = useState("Room");
  const [countries, setCountries] = useState<string[]>([]);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [cities, setCities] = useState<string[]>([]);
  const [selectedCity, setSelectedCity] = useState("");
  const [loadingCities, setLoadingCities] = useState(false);

  const toggleListing = (id: number) =>
    setLikedListings((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
  const toggleProfile = (id: number) =>
    setLikedProfiles((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  useEffect(() => {
    fetch("https://countriesnow.space/api/v0.1/countries")
      .then((r) => r.json())
      .then((data) => {
        if (data?.data) {
          setCountries(data.data.map((c: { country: string }) => c.country).sort());
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedCountry) { setCities([]); setSelectedCity(""); return; }
    setLoadingCities(true);
    fetch("https://countriesnow.space/api/v0.1/countries/cities", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ country: selectedCountry }),
    })
      .then((r) => r.json())
      .then((data) => { if (data?.data) setCities(data.data); })
      .catch(() => setCities([]))
      .finally(() => setLoadingCities(false));
  }, [selectedCountry]);

  const profile = matchProfiles[activeMatch];

  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-x-hidden">

      {/* NAVBAR */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-5 h-16 flex items-center justify-between gap-6">
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center font-black text-sm shadow-lg shadow-blue-500/30">
              S
            </div>
            <span className="text-xl font-black tracking-tight bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
              Sefira
            </span>
          </div>
          <div className="hidden lg:flex items-center gap-7">
            {navLinks.map((l) => (
              <a key={l.label} href={l.href} className="text-sm text-slate-400 hover:text-white transition-colors duration-200 font-medium">
                {l.label}
              </a>
            ))}
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <button className="hidden sm:block text-sm text-slate-400 hover:text-white transition-colors font-medium px-3 py-2">
              Sign In
            </button>
            <button className="text-sm font-bold bg-gradient-to-r from-blue-500 to-violet-600 px-5 py-2.5 rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-blue-500/25">
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative min-h-screen flex flex-col justify-center pt-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950" />
        <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-5 py-24 text-center">
          <div className="inline-flex items-center gap-2.5 bg-white/5 border border-white/10 rounded-full px-5 py-2 mb-10 text-sm text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
            Trusted by{" "}
            <strong className="text-white ml-1">127,000+</strong>
            {" "}verified users across 52 cities
          </div>
          <h1 className="text-6xl sm:text-7xl lg:text-8xl font-black leading-tight tracking-tighter mb-7">
            <span className="text-white">Find Your</span>
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-violet-400 to-indigo-400 bg-clip-text text-transparent">
              Perfect Home
            </span>
            <br />
            <span className="text-white">and Roommate.</span>
          </h1>
          <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            AI-powered roommate matching meets premium rental discovery. Built for expats, students, and modern professionals.
          </p>
          <div className="max-w-3xl mx-auto bg-white/5 border border-white/10 rounded-2xl p-2 flex flex-col sm:flex-row gap-2 mb-5 shadow-2xl">
            <div className="flex bg-white/5 rounded-xl p-1 gap-1 flex-shrink-0">
              {["Room", "Roommate", "Flat"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setSearchTab(tab)}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-all duration-200 ${
                    searchTab === tab
                      ? "bg-gradient-to-r from-blue-500 to-violet-600 text-white shadow-lg"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
            <select
              value={selectedCountry}
              onChange={(e) => { setSelectedCountry(e.target.value); setSelectedCity(""); }}
              className="bg-slate-900 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-slate-400 outline-none cursor-pointer flex-shrink-0"
            >
              <option value="">Country</option>
              {countries.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              disabled={!selectedCountry || loadingCities}
              className="bg-slate-900 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-slate-400 outline-none cursor-pointer flex-shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <option value="">{loadingCities ? "Loading…" : "City"}</option>
              {cities.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Search city, neighborhood, or keyword..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="flex-1 bg-transparent px-4 py-2.5 text-white placeholder:text-slate-500 outline-none text-sm min-w-0"
            />
            <button className="bg-gradient-to-r from-blue-500 to-violet-600 text-white px-7 py-3 rounded-xl font-bold text-sm hover:opacity-90 transition-opacity shadow-lg shadow-blue-500/25 whitespace-nowrap">
              Search
            </button>
          </div>
          <div className="flex flex-wrap justify-center gap-2 mb-14">
            {(selectedCountry && cities.length > 0
              ? cities.slice(0, 5)
              : ["Berlin", "Dubai", "Istanbul", "Barcelona", "London"]
            ).map((city) => (
              <button
                key={city}
                className="px-4 py-1.5 text-xs font-medium text-slate-400 bg-white/5 border border-white/10 rounded-full hover:border-white/25 hover:text-white transition-all duration-200"
              >
                {city}
              </button>
            ))}
          </div>
          <div className="flex items-center justify-center gap-4">
            <div className="flex -space-x-3">
              {[
                ["SK", "from-pink-500 to-rose-600"],
                ["AM", "from-blue-500 to-indigo-600"],
                ["YT", "from-violet-500 to-purple-600"],
                ["JW", "from-emerald-500 to-teal-600"],
                ["PS", "from-amber-500 to-orange-600"],
              ].map(([init, grad], i) => (
                <div
                  key={i}
                  className={`w-10 h-10 rounded-full bg-gradient-to-br ${grad} border-2 border-slate-950 flex items-center justify-center text-xs font-bold shadow-lg`}
                >
                  {init}
                </div>
              ))}
            </div>
            <div className="text-left">
              <div className="text-sm font-bold text-white">2,847 matches this week</div>
              <div className="text-xs text-slate-500">4.9 stars from 12,000+ reviews</div>
            </div>
          </div>
        </div>
        <div className="relative flex justify-center pb-10">
          <div className="w-6 h-10 border-2 border-white/15 rounded-full flex justify-center pt-2 animate-bounce">
            <div className="w-1 h-2 bg-white/30 rounded-full" />
          </div>
        </div>
      </section>

      {/* STATS */}
      <div className="border-y border-white/5 bg-slate-900/30">
        <div className="max-w-7xl mx-auto px-5 py-10 grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent mb-1">
                {s.value}
              </div>
              <div className="text-sm text-slate-500">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* STORIES */}
      <section className="max-w-7xl mx-auto px-5 py-12">
        <div className="flex items-center gap-3 mb-6">
          <h2 className="text-lg font-bold text-white">Community Stories</h2>
          <span className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full font-medium">
            Live
          </span>
        </div>
        <div className="flex gap-5 overflow-x-auto pb-3" style={{ scrollbarWidth: "none" }}>
          {stories.map((s) => (
            <div key={s.id} className="flex flex-col items-center gap-2 flex-shrink-0 cursor-pointer group">
              <div className="relative">
                <div
                  className={`w-16 h-16 rounded-full bg-gradient-to-br ${s.gradient} flex items-center justify-center font-bold text-sm group-hover:scale-105 transition-transform duration-200 ${
                    !s.isAdd
                      ? "ring-2 ring-violet-500/50 ring-offset-2 ring-offset-slate-950"
                      : "border-2 border-dashed border-white/20"
                  }`}
                >
                  {s.isAdd ? (
                    <span className="text-2xl text-slate-400 font-light">+</span>
                  ) : (
                    s.initials
                  )}
                </div>
                {!s.isAdd && s.online && (
                  <span className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-slate-950" />
                )}
              </div>
              <span className="text-xs text-slate-400 group-hover:text-white transition-colors whitespace-nowrap">
                {s.name}
              </span>
              {s.city && <span className="text-xs text-slate-600">{s.city}</span>}
            </div>
          ))}
        </div>
      </section>

      {/* AI MATCH */}
      <section className="max-w-7xl mx-auto px-5 py-20">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-2 mb-7">
              AI-Powered Matching
            </div>
            <h2 className="text-4xl sm:text-5xl font-black leading-tight text-white mb-6 tracking-tight">
              Your Perfect Match
              <br />
              <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
                Finds You.
              </span>
            </h2>
            <p className="text-lg text-slate-400 leading-relaxed mb-9">
              Our AI analyzes 40+ compatibility factors from sleep schedules to social habits, surfacing people you will genuinely want to live with.
            </p>
            <div className="space-y-5 mb-9">
              {[
                { label: "Lifestyle Match", value: 97, color: "from-blue-500 to-violet-600" },
                { label: "Sleep Schedule", value: 94, color: "from-emerald-500 to-teal-600" },
                { label: "Cleanliness", value: 100, color: "from-amber-500 to-orange-600" },
                { label: "Budget Range", value: 88, color: "from-rose-500 to-pink-600" },
              ].map((bar) => (
                <div key={bar.label}>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-400 font-medium">{bar.label}</span>
                    <span className="text-white font-bold">{bar.value}%</span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${bar.color} rounded-full`}
                      style={{ width: `${bar.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <button className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-violet-600 text-white px-7 py-3.5 rounded-xl font-bold hover:opacity-90 transition-opacity shadow-xl shadow-blue-500/25">
              Find My Matches
            </button>
          </div>
          <div className="relative flex justify-center lg:justify-end">
            <div
              className="absolute top-5 left-8 right-8 bottom-0 bg-white/3 rounded-3xl border border-white/5"
              style={{ transform: "rotate(3deg)" }}
            />
            <div
              className="absolute top-2.5 left-4 right-4 bottom-0 bg-white/5 rounded-3xl border border-white/5"
              style={{ transform: "rotate(1deg)" }}
            />
            <div className="relative w-full max-w-sm bg-slate-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
              <div
                className={`h-72 bg-gradient-to-br ${profile.gradient} relative flex items-center justify-center`}
              >
                <div className="w-28 h-28 rounded-full bg-white/15 border-4 border-white/25 flex items-center justify-center text-3xl font-black shadow-2xl">
                  {profile.initials}
                </div>
                <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-md border border-white/15 rounded-2xl px-4 py-2 text-center">
                  <div className="text-2xl font-black text-white">{profile.match}%</div>
                  <div className="text-xs text-white/60">Match</div>
                </div>
                {profile.verified && (
                  <div className="absolute top-4 left-4 bg-blue-500/80 backdrop-blur-md rounded-full px-3 py-1 text-xs font-bold text-white">
                    Verified
                  </div>
                )}
              </div>
              <div className="p-6">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-xl font-bold text-white">
                      {profile.name}, {profile.age}
                    </h3>
                    <p className="text-sm text-slate-400">
                      {profile.occupation} · {profile.city}
                    </p>
                  </div>
                  <span className="text-xs text-slate-400">{profile.nationality}</span>
                </div>
                <p className="text-sm text-slate-400 leading-relaxed mb-4">{profile.bio}</p>
                <div className="flex flex-wrap gap-2 mb-5">
                  {profile.lifestyle.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs bg-white/5 border border-white/10 rounded-full px-3 py-1 text-slate-300"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-4 text-xs text-slate-500 mb-5">
                  <span>{profile.pets ? "Pets OK" : "No Pets"}</span>
                  <span>{profile.smoking ? "Smoker" : "Non-smoker"}</span>
                  <span>{profile.budget}/mo</span>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setActiveMatch((p) => (p + 1) % matchProfiles.length)}
                    className="flex-1 bg-white/5 border border-white/10 rounded-2xl py-3 text-slate-400 hover:text-white hover:border-white/20 transition-all duration-200 font-semibold"
                  >
                    Skip
                  </button>
                  <button
                    onClick={() => {
                      toggleProfile(profile.id);
                      setActiveMatch((p) => (p + 1) % matchProfiles.length);
                    }}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-violet-600 rounded-2xl py-3 text-white font-bold hover:opacity-90 transition-opacity shadow-lg shadow-blue-500/25"
                  >
                    Like
                  </button>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-8 flex gap-2">
              {matchProfiles.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveMatch(i)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    i === activeMatch ? "w-7 bg-blue-500" : "w-2 bg-white/20 hover:bg-white/40"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* LISTINGS */}
      <section className="max-w-7xl mx-auto px-5 py-20">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-2 tracking-tight">
              Featured Listings
            </h2>
            <p className="text-slate-400">Premium verified rooms and apartments</p>
          </div>
          <div className="flex gap-2 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
            {["All", "Berlin", "Dubai", "Istanbul", "Barcelona"].map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 whitespace-nowrap ${
                  activeFilter === f
                    ? "bg-gradient-to-r from-blue-500 to-violet-600 text-white shadow-lg shadow-blue-500/25"
                    : "bg-white/5 text-slate-400 hover:text-white border border-white/10 hover:border-white/20"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {listings.map((listing) => (
            <div
              key={listing.id}
              className="group bg-slate-900 border border-white/5 rounded-2xl overflow-hidden hover:border-white/15 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 cursor-pointer"
            >
              <div className="relative h-52">
                <div className={`absolute inset-0 bg-gradient-to-br ${listing.gradient}`} />
                <div
                  className={`absolute top-3 left-3 bg-gradient-to-r ${listing.tagColor} text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg`}
                >
                  {listing.tag}
                </div>
                <button
                  onClick={() => toggleListing(listing.id)}
                  className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 font-bold ${
                    likedListings.includes(listing.id)
                      ? "bg-rose-500 text-white shadow-lg"
                      : "bg-black/30 backdrop-blur-sm text-white/50 hover:text-white hover:bg-black/50"
                  }`}
                >
                  ♥
                </button>
                {listing.verified && (
                  <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-black/40 backdrop-blur-sm rounded-full px-2.5 py-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-400" />
                    <span className="text-xs text-white font-medium">Verified</span>
                  </div>
                )}
                <div className="absolute bottom-3 right-3 bg-black/50 backdrop-blur-sm rounded-xl px-3 py-1.5">
                  <span className="text-white font-black text-sm">
                    {listing.sym === "EUR" ? "€" : "$"}
                    {listing.price}
                  </span>
                  <span className="text-white/50 text-xs">/mo</span>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-white mb-1.5 group-hover:text-blue-300 transition-colors text-sm leading-snug">
                  {listing.title}
                </h3>
                <p className="text-xs text-slate-500 mb-3">
                  {listing.city}, {listing.country}
                </p>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-amber-400 text-xs">★</span>
                  <span className="text-white text-xs font-bold">{listing.rating}</span>
                  <span className="text-slate-600 text-xs">({listing.reviews})</span>
                  <span className="ml-auto text-xs text-slate-500">{listing.available}</span>
                </div>
                <div className="flex gap-1.5 flex-wrap items-center">
                  {listing.amenities.map((a) => (
                    <span key={a} className="text-xs bg-white/5 rounded-md px-2 py-0.5 text-slate-400">
                      {a}
                    </span>
                  ))}
                  <span className="text-xs text-slate-600 ml-auto">{listing.gender}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="text-center mt-10">
          <button className="bg-white/5 border border-white/10 text-white px-8 py-3.5 rounded-xl font-bold hover:bg-white/10 hover:border-white/20 transition-all duration-200">
            View All Listings
          </button>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="bg-slate-900/40 border-y border-white/5 py-20">
        <div className="max-w-7xl mx-auto px-5">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-4 tracking-tight">
              How Sefira Works
            </h2>
            <p className="text-slate-400 text-lg max-w-xl mx-auto">
              From profile to perfect home in under 48 hours.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
            {howItWorks.map((step, i) => (
              <div key={step.step} className="relative text-center group">
                {i < howItWorks.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-full w-full h-px bg-gradient-to-r from-white/10 to-transparent -translate-x-1/2 z-0" />
                )}
                <div
                  className={`relative z-10 w-16 h-16 rounded-2xl bg-gradient-to-br ${step.gradient} flex items-center justify-center text-2xl mx-auto mb-5 shadow-xl group-hover:scale-110 transition-transform duration-300`}
                >
                  {step.icon}
                </div>
                <div className="text-xs font-black text-slate-600 mb-2 tracking-widest">
                  {step.step}
                </div>
                <h3 className="font-bold text-white mb-2">{step.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ROOMMATES */}
      <section className="max-w-7xl mx-auto px-5 py-20">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-2 tracking-tight">
              Top Matches Near You
            </h2>
            <p className="text-slate-400">People looking for roommates in Berlin right now</p>
          </div>
          <button className="text-sm text-blue-400 hover:text-blue-300 transition-colors hidden sm:block font-medium">
            View all
          </button>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {matchProfiles.map((p) => (
            <div
              key={p.id}
              className="group bg-slate-900 border border-white/5 rounded-2xl overflow-hidden hover:border-white/15 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 cursor-pointer"
            >
              <div
                className={`h-44 bg-gradient-to-br ${p.gradient} relative flex items-center justify-center`}
              >
                <div className="w-20 h-20 rounded-full bg-white/15 border-4 border-white/25 flex items-center justify-center text-2xl font-black shadow-xl">
                  {p.initials}
                </div>
                <div className="absolute top-3 right-3 bg-black/40 backdrop-blur-md rounded-2xl px-3 py-1.5 text-center">
                  <div className="text-lg font-black text-white">{p.match}%</div>
                  <div className="text-xs text-white/60">Match</div>
                </div>
                {p.verified && (
                  <div className="absolute top-3 left-3 bg-blue-500/75 backdrop-blur-sm rounded-full px-2.5 py-0.5 text-xs font-bold text-white">
                    Verified
                  </div>
                )}
              </div>
              <div className="p-5">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-bold text-white">
                      {p.name}, {p.age}
                    </h3>
                    <p className="text-xs text-slate-500">{p.occupation}</p>
                  </div>
                  <span className="text-xs text-slate-400">{p.nationality}</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">{p.bio}</p>
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {p.lifestyle.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs bg-white/5 border border-white/5 rounded-full px-2.5 py-0.5 text-slate-400"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-500 mb-5">
                  <span>{p.budget}/mo</span>
                  <span>{p.pets ? "Pets OK" : "No pets"}</span>
                  <span className="ml-auto text-slate-600">{p.city}</span>
                </div>
                <button
                  onClick={() => toggleProfile(p.id)}
                  className={`w-full py-3 rounded-xl text-sm font-bold transition-all duration-200 ${
                    likedProfiles.includes(p.id)
                      ? "bg-rose-500/20 border border-rose-500/40 text-rose-400"
                      : "bg-gradient-to-r from-blue-500 to-violet-600 text-white hover:opacity-90 shadow-lg shadow-blue-500/20"
                  }`}
                >
                  {likedProfiles.includes(p.id) ? "Matched!" : "Connect"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* TRENDING CITIES */}
      <section className="max-w-7xl mx-auto px-5 py-20">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-4 tracking-tight">
            Trending Cities
          </h2>
          <p className="text-slate-400">Where modern people are moving in 2025</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {trendingCities.map((city) => (
            <div
              key={city.name}
              className={`group relative ${city.glow} border ${city.border} bg-slate-900/60 rounded-2xl p-6 cursor-pointer hover:scale-105 transition-all duration-300 overflow-hidden`}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/3 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative">
                <div className="flex items-start justify-between mb-5">
                  <span className="text-5xl">{city.emoji}</span>
                  <span className="text-emerald-400 text-sm font-bold bg-emerald-500/10 border border-emerald-500/20 rounded-full px-3 py-1">
                    {city.growth}
                  </span>
                </div>
                <h3 className="text-xl font-black text-white mb-1">{city.name}</h3>
                <p className="text-sm text-slate-400 mb-4">{city.country}</p>
                <div>
                  <span className="text-2xl font-black text-white">{city.listings}</span>
                  <span className="text-sm text-slate-500 ml-2">active listings</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* COMMUNITY FEED */}
      <section className="bg-slate-900/30 border-y border-white/5 py-20">
        <div className="max-w-7xl mx-auto px-5">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-violet-400 bg-violet-500/10 border border-violet-500/20 rounded-full px-4 py-2 mb-6">
              Community Feed
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-4 tracking-tight">
              Real Stories. Real People.
            </h2>
            <p className="text-slate-400">Join 127,000+ members sharing their journey</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {communityPosts.map((post) => (
              <div
                key={post.id}
                className="bg-slate-900 border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-colors duration-200"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className={`w-10 h-10 rounded-full bg-gradient-to-br ${post.gradient} flex items-center justify-center text-sm font-bold flex-shrink-0`}
                  >
                    {post.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white truncate">{post.user}</p>
                    <p className="text-xs text-slate-500">{post.location}</p>
                  </div>
                  <span className="text-xs text-slate-600 flex-shrink-0">{post.time}</span>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed mb-5">{post.content}</p>
                <div className="flex items-center gap-5 text-xs text-slate-500">
                  <button className="hover:text-rose-400 transition-colors">{post.likes} likes</button>
                  <button className="hover:text-blue-400 transition-colors">{post.comments} comments</button>
                  <button className="hover:text-violet-400 transition-colors ml-auto">Share</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="max-w-7xl mx-auto px-5 py-20">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-4 tracking-tight">
            Loved by Thousands
          </h2>
          <div className="flex items-center justify-center gap-2">
            <span className="text-amber-400 text-xl">★★★★★</span>
            <span className="text-white font-black text-xl">4.9</span>
            <span className="text-slate-500">from 12,000+ reviews</span>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="bg-slate-900 border border-white/5 rounded-2xl p-7 hover:border-white/10 hover:-translate-y-0.5 hover:shadow-xl transition-all duration-200"
            >
              <div className="flex gap-1 mb-5">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <span key={i} className="text-amber-400 text-sm">
                    ★
                  </span>
                ))}
              </div>
              <p className="text-slate-300 text-sm leading-relaxed mb-6 italic">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div
                  className={`w-11 h-11 rounded-full bg-gradient-to-br ${t.gradient} flex items-center justify-center text-sm font-black flex-shrink-0 shadow-lg`}
                >
                  {t.initials}
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{t.name}</p>
                  <p className="text-xs text-slate-500">
                    {t.role} · {t.city}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* DOWNLOAD APP */}
      <section className="relative overflow-hidden border-y border-white/5 py-20 bg-gradient-to-br from-blue-950/60 via-indigo-950/60 to-violet-950/60">
        <div className="absolute top-0 left-1/4 w-72 h-72 bg-blue-500/8 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-violet-500/8 rounded-full blur-3xl pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-5 grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-5 tracking-tight leading-tight">
              Sefira in your pocket.
              <br />
              <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
                Anywhere. Anytime.
              </span>
            </h2>
            <p className="text-lg text-slate-400 leading-relaxed mb-9">
              Instant match notifications, real-time messaging, and swipe through listings on the go.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="flex items-center gap-4 bg-white text-slate-900 px-6 py-4 rounded-2xl font-bold hover:bg-white/90 transition-colors shadow-2xl">
                <span className="text-3xl leading-none">🍎</span>
                <div className="text-left">
                  <div className="text-xs text-slate-500 font-normal">Download on the</div>
                  <div className="text-sm font-black">App Store</div>
                </div>
              </button>
              <button className="flex items-center gap-4 bg-white/10 border border-white/20 text-white px-6 py-4 rounded-2xl font-bold hover:bg-white/15 transition-colors">
                <span className="text-3xl leading-none">▶</span>
                <div className="text-left">
                  <div className="text-xs text-slate-400 font-normal">Get it on</div>
                  <div className="text-sm font-black">Google Play</div>
                </div>
              </button>
            </div>
          </div>
          <div className="flex justify-center lg:justify-end">
            <div className="relative w-60 h-[500px]">
              <div className="absolute inset-0 bg-slate-900 rounded-[2.5rem] border-4 border-white/10 shadow-2xl overflow-hidden">
                <div className="absolute inset-2 bg-slate-950 rounded-[2rem] overflow-hidden">
                  <div className="flex items-center justify-between px-4 pt-3 pb-2">
                    <span className="text-xs text-white font-medium">9:41</span>
                    <span className="text-xs text-white/40">● ● ● ●</span>
                  </div>
                  <div className="px-3 py-2 space-y-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-black bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
                        Sefira
                      </span>
                      <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-violet-600 rounded-full shadow-lg" />
                    </div>
                    <div className="bg-gradient-to-r from-blue-600/20 to-violet-600/20 border border-blue-500/20 rounded-xl p-3">
                      <div className="text-xs text-blue-400 font-bold mb-1">New Match!</div>
                      <div className="text-xs text-white">Emma W. liked your profile</div>
                      <div className="text-xs text-slate-500">97% compatibility · 2 min ago</div>
                    </div>
                    <div className="text-xs text-slate-500 font-medium px-1">Suggested</div>
                    {[
                      { init: "KT", name: "Kai T.", match: 94, grad: "from-cyan-500 to-blue-600" },
                      { init: "SR", name: "Sofia R.", match: 91, grad: "from-rose-500 to-pink-600" },
                      { init: "LM", name: "Lena M.", match: 89, grad: "from-violet-500 to-purple-600" },
                    ].map((c) => (
                      <div key={c.init} className="flex items-center gap-2 bg-white/5 rounded-xl p-2">
                        <div
                          className={`w-8 h-8 rounded-full bg-gradient-to-br ${c.grad} flex items-center justify-center text-xs font-black flex-shrink-0`}
                        >
                          {c.init}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs text-white font-medium">{c.name}</div>
                          <div className="text-xs text-slate-500">{c.match}% match</div>
                        </div>
                        <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-violet-600 rounded-full flex items-center justify-center text-xs text-white flex-shrink-0">
                          →
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="absolute right-[-3px] top-28 w-1 h-14 bg-white/15 rounded-full" />
              <div className="absolute left-[-3px] top-20 w-1 h-8 bg-white/15 rounded-full" />
              <div className="absolute left-[-3px] top-32 w-1 h-14 bg-white/15 rounded-full" />
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-950 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-5 py-16">
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-12 mb-14">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center font-black text-sm shadow-lg shadow-blue-500/25">
                  S
                </div>
                <span className="text-xl font-black tracking-tight bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
                  Sefira
                </span>
              </div>
              <p className="text-sm text-slate-500 leading-relaxed max-w-xs mb-7">
                The most trusted platform for finding roommates and rooms. Built for modern, borderless living.
              </p>
              <div className="flex gap-2.5">
                {["X", "in", "ig", "yt"].map((icon) => (
                  <button
                    key={icon}
                    className="w-9 h-9 bg-white/5 border border-white/10 rounded-lg text-xs text-slate-400 hover:text-white hover:border-white/25 hover:bg-white/10 transition-all duration-200 font-bold"
                  >
                    {icon}
                  </button>
                ))}
                <a
                  href="https://t.me/getsefira"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Join our Telegram"
                  className="w-9 h-9 bg-white/5 border border-white/10 rounded-lg text-slate-400 hover:text-white hover:border-white/25 hover:bg-white/10 transition-all duration-200 flex items-center justify-center"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                  </svg>
                </a>
              </div>
            </div>
            {footerLinks.map((col) => (
              <div key={col.title}>
                <h4 className="text-sm font-bold text-white mb-5">{col.title}</h4>
                <ul className="space-y-3">
                  {col.links.map((link) => (
                    <li key={link}>
                      <a
                        href="#"
                        className="text-sm text-slate-500 hover:text-white transition-colors duration-200"
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-white/5 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-slate-600">
              2025 Sefira Technologies, Inc. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              {["Terms", "Privacy", "Cookies"].map((l) => (
                <a
                  key={l}
                  href="#"
                  className="text-xs text-slate-600 hover:text-slate-400 transition-colors"
                >
                  {l}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
