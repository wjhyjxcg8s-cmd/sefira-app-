"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLang } from "@/app/lib/LangContext";

type ListingContent = {
  heading: string;
  sub: string;
  back: string;
};

const BLOG_LISTING_CONTENT: Record<string, ListingContent> = {
  tr: { heading: "Blog", sub: "Uzmanların ipuçları ve ilham verici hikayeler", back: "← Geri" },
  en: { heading: "Blog", sub: "Expert tips and inspiring stories", back: "← Back" },
  fa: { heading: "بلاگ", sub: "راهنمایی‌های تخصصی و داستان‌های الهام‌بخش", back: "→ بازگشت" },
  ar: { heading: "المدونة", sub: "نصائح الخبراء وقصص ملهمة", back: "→ رجوع" },
  de: { heading: "Blog", sub: "Expertentipps und inspirierende Geschichten", back: "← Zurück" },
  ru: { heading: "Блог", sub: "Советы экспертов и вдохновляющие истории", back: "← Назад" },
};

type ArticleCard = {
  title: string;
  excerpt: string;
  tag: string;
  readTime: string;
  date: string;
};

const ARTICLES: Record<string, ArticleCard> = {
  tr: {
    title: "Alan Paylaşımının Psikolojisi",
    excerpt: "Boş bir alan nasıl yeni fırsatlar yaratabilir? Ev, ofis veya ticari alanınızı paylaşmanın size ve başkalarına katkıları.",
    tag: "Yaşam & Kariyer",
    readTime: "8 dk okuma",
    date: "2025",
  },
  en: {
    title: "The Psychology of Space Sharing",
    excerpt: "How can an empty space create new opportunities? Discover the impact of sharing your home, office or commercial space.",
    tag: "Life & Career",
    readTime: "8 min read",
    date: "2025",
  },
  fa: {
    title: "روانشناسی اشتراک‌گذاری فضا",
    excerpt: "چگونه یک فضای خالی می‌تواند فرصت‌های جدیدی برای شما و دیگران ایجاد کند؟ تأثیر اشتراک‌گذاری خانه، دفتر یا فضای تجاری.",
    tag: "زندگی و کار",
    readTime: "۸ دقیقه مطالعه",
    date: "۲۰۲۵",
  },
  ar: {
    title: "علم نفس مشاركة المساحات",
    excerpt: "كيف يمكن لمساحة فارغة أن تخلق فرصاً جديدة؟ اكتشف تأثير مشاركة منزلك أو مكتبك أو مساحتك التجارية.",
    tag: "الحياة والعمل",
    readTime: "٨ دقائق قراءة",
    date: "٢٠٢٥",
  },
  de: {
    title: "Psychologie des Raumteilens",
    excerpt: "Wie kann ein leerer Raum neue Chancen schaffen? Entdecken Sie die Wirkung des Teilens Ihrer Wohnung, Ihres Büros oder Ihrer Gewerbefläche.",
    tag: "Leben & Karriere",
    readTime: "8 Min. Lesen",
    date: "2025",
  },
  ru: {
    title: "Психология совместного использования пространства",
    excerpt: "Как пустое пространство может создать новые возможности? Узнайте о пользе совместного использования жилья, офиса или коммерческого помещения.",
    tag: "Жизнь и карьера",
    readTime: "8 мин чтения",
    date: "2025",
  },
};

export default function BlogPage() {
  const router = useRouter();
  const { lang } = useLang();
  const isRtl = lang === "fa" || lang === "ar";

  const listing = BLOG_LISTING_CONTENT[lang] || BLOG_LISTING_CONTENT.tr;
  const article = ARTICLES[lang] || ARTICLES.tr;

  return (
    <div className="min-h-screen bg-white" dir={isRtl ? "rtl" : "ltr"}>
      <div className="max-w-2xl mx-auto px-5 py-8">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-sm font-semibold text-stone-500 hover:text-stone-900 transition-colors duration-200 mb-8"
        >
          {listing.back}
        </button>

        <h1 className="text-3xl sm:text-4xl font-black text-stone-900 mb-2">
          {listing.heading}
        </h1>
        <p className="text-base text-stone-500 mb-10">{listing.sub}</p>

        <Link
          href="/blog/space-sharing-psychology"
          className="group block bg-white border border-stone-200 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
        >
          <span
            className="inline-block text-xs font-bold px-3 py-1 rounded-full mb-4"
            style={{ background: "rgba(249,115,22,0.1)", color: "#f97316" }}
          >
            {article.tag}
          </span>

          <h2 className="text-xl sm:text-2xl font-black text-stone-900 mb-2 group-hover:text-orange-600 transition-colors duration-200">
            {article.title}
          </h2>

          <p className="text-sm text-stone-500 leading-relaxed line-clamp-2 mb-5">
            {article.excerpt}
          </p>

          <div className="flex items-center gap-3 text-xs font-semibold text-stone-400">
            <span>{article.date}</span>
            <span className="w-1 h-1 rounded-full bg-stone-300" />
            <span>{article.readTime}</span>
          </div>
        </Link>
      </div>
    </div>
  );
}