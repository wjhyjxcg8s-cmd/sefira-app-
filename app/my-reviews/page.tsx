"use client";

import { useState, useEffect } from "react";
import { useLang } from "@/app/lib/LangContext";
import Link from "next/link";
import { useAuth } from "@/app/lib/AuthContext";

const translations = {
  tr: {
    title: "Yorumlarım ve Puanlarım",
    banner: "Bu sayfada başkalarına verdiğiniz yorumları ve puanları görebilir, düzenleyebilir veya silebilirsiniz.",
    empty: "Henüz hiç yorum yapmadınız.",
    notLoggedIn: "Yorumlarınızı görmek için giriş yapınız.",
    goHome: "Ana Sayfaya Git",
    edit: "Düzenle",
    delete: "Sil",
    save: "Kaydet",
    cancel: "İptal",
    confirmDelete: "Bu yorumu silmek istediğinizden emin misiniz?",
    confirmYes: "Evet, Sil",
    confirmNo: "İptal",
    editPlaceholder: "Yorumunuzu yazın...",
    sampleReviewText: "İyi bir insandı, hiç gürültü yapmazdı.\n6 ay boyunca orada kaldım.",
    sampleReviewDate: "15 Mayıs 2026",
    ratingLabel: "Puanınız",
  },
  en: {
    title: "My Comments & Ratings",
    banner: "In this section, you can view, edit, or delete the comments and ratings you have given to others.",
    empty: "You haven't written any reviews yet.",
    notLoggedIn: "Please sign in to view your reviews.",
    goHome: "Go to Home",
    edit: "Edit",
    delete: "Delete",
    save: "Save",
    cancel: "Cancel",
    confirmDelete: "Are you sure you want to delete this review?",
    confirmYes: "Yes, Delete",
    confirmNo: "Cancel",
    editPlaceholder: "Write your review...",
    sampleReviewText: "He was a good person, never made noise.\nI stayed there for 6 months.",
    sampleReviewDate: "May 15, 2026",
    ratingLabel: "Your rating",
  },
  fa: {
    title: "کامنت‌ها و امتیازهای من",
    banner: "شما می‌توانید کامنت‌ها و امتیازهایی که به دیگران داده‌اید را در این صفحه ببینید، ویرایش کنید یا حذف کنید.",
    empty: "هنوز هیچ کامنتی ثبت نکرده‌اید.",
    notLoggedIn: "برای مشاهده نظرات خود لطفاً وارد شوید.",
    goHome: "رفتن به صفحه اصلی",
    edit: "ویرایش",
    delete: "حذف",
    save: "ذخیره",
    cancel: "لغو",
    confirmDelete: "آیا مطمئن هستید که می‌خواهید این نظر را حذف کنید؟",
    confirmYes: "بله، حذف کن",
    confirmNo: "انصراف",
    editPlaceholder: "نظر خود را بنویسید...",
    sampleReviewText: "انسان خوبی بود، سر و صدا نمی‌کرد.\n۶ ماه اونجا بودم.",
    sampleReviewDate: "۱۵ اردیبهشت ۱۴۰۵",
    ratingLabel: "امتیاز شما",
  },
  de: {
    title: "Meine Bewertungen",
    banner: "In diesem Bereich können Sie die Bewertungen und Kommentare, die Sie anderen gegeben haben, ansehen, bearbeiten oder löschen.",
    empty: "Sie haben noch keine Bewertungen geschrieben.",
    notLoggedIn: "Bitte melden Sie sich an, um Ihre Bewertungen anzuzeigen.",
    goHome: "Zur Startseite",
    edit: "Bearbeiten",
    delete: "Löschen",
    save: "Speichern",
    cancel: "Abbrechen",
    confirmDelete: "Möchten Sie diese Bewertung wirklich löschen?",
    confirmYes: "Ja, löschen",
    confirmNo: "Abbrechen",
    editPlaceholder: "Schreiben Sie Ihre Bewertung...",
    sampleReviewText: "Er war ein netter Mensch, sehr ruhig.\nIch habe dort 6 Monate gewohnt.",
    sampleReviewDate: "15. Mai 2026",
    ratingLabel: "Ihre Bewertung",
  },
  // Always add "ar" key when adding new translations
  ar: {
    title: "تعليقاتي وتقييماتي",
    banner: "في هذا القسم، يمكنك عرض التعليقات والتقييمات التي أعطيتها للآخرين وتعديلها أو حذفها.",
    empty: "لم تكتب أي تعليقات بعد.",
    notLoggedIn: "يرجى تسجيل الدخول لعرض تعليقاتك.",
    goHome: "الذهاب إلى الرئيسية",
    edit: "تعديل",
    delete: "حذف",
    save: "حفظ",
    cancel: "إلغاء",
    confirmDelete: "هل أنت متأكد من رغبتك في حذف هذا التعليق؟",
    confirmYes: "نعم، احذف",
    confirmNo: "إلغاء",
    editPlaceholder: "اكتب تعليقك هنا...",
    sampleReviewText: "كان شخصاً طيباً، لا يحدث ضوضاء.\nمكثتُ هناك ٦ أشهر.",
    sampleReviewDate: "١٥ مايو ٢٠٢٦",
    ratingLabel: "تقييمك",
  },
  ru: {
    title: "Мои отзывы",
    banner: "Здесь вы можете просматривать, редактировать или удалять отзывы, оставленные другим пользователям.",
    empty: "У вас нет отзывов.",
    notLoggedIn: "Войдите, чтобы просмотреть отзывы.",
    goHome: "Перейти на главную",
    edit: "Редактировать",
    delete: "Удалить",
    save: "Сохранить",
    cancel: "Отмена",
    confirmDelete: "Удалить этот отзыв?",
    confirmYes: "Да, удалить",
    confirmNo: "Отмена",
    editPlaceholder: "Напишите ваш отзыв...",
    sampleReviewText: "Хороший человек, никогда не шумел.\nЯ прожил там 6 месяцев.",
    sampleReviewDate: "15 мая 2026",
    ratingLabel: "Оценка",
  },
};

type Lang = keyof typeof translations;

const SAMPLE_ID = 1;

function StarRow({
  rating,
  interactive,
  hover,
  onHover,
  onClick,
}: {
  rating: number;
  interactive?: boolean;
  hover?: number;
  onHover?: (s: number) => void;
  onClick?: (s: number) => void;
}) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= (hover || rating);
        return interactive ? (
          <button
            key={star}
            type="button"
            onMouseEnter={() => onHover?.(star)}
            onMouseLeave={() => onHover?.(0)}
            onClick={() => onClick?.(star)}
            className={`text-2xl leading-none transition-colors ${filled ? "text-orange-500" : "text-stone-300"}`}
          >
            ★
          </button>
        ) : (
          <span
            key={star}
            className={`text-xl leading-none ${filled ? "text-orange-500" : "text-stone-300"}`}
          >
            ★
          </span>
        );
      })}
    </div>
  );
}

export default function MyReviewsPage() {
  const { user, loading } = useAuth();
  const { lang } = useLang();

  // review presence (removed = empty state)
  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);

  // edit state
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState("");
  const [editRating, setEditRating] = useState(4);
  const [hoverRating, setHoverRating] = useState(0);

  // customised content (after user saves an edit)
  const [customText, setCustomText] = useState<string | null>(null);
  const [customRating, setCustomRating] = useState<number | null>(null);

  // delete confirmation
  const [confirmDelete, setConfirmDelete] = useState(false);

  const t = translations[lang];
  const isFa = lang === "fa" || lang === "ar";

  const displayText = customText ?? t.sampleReviewText;
  const displayRating = customRating ?? 4;

  const startEdit = () => {
    setEditText(displayText);
    setEditRating(displayRating);
    setHoverRating(0);
    setEditing(true);
    setConfirmDelete(false);
  };

  const saveEdit = () => {
    setCustomText(editText.trim() || displayText);
    setCustomRating(editRating);
    setEditing(false);
  };

  const cancelEdit = () => {
    setEditing(false);
    setHoverRating(0);
  };

  const handleDeleteConfirm = () => {
    setConfirmDelete(false);
    setFading(true);
    setTimeout(() => setVisible(false), 320);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-stone-50 gap-5 p-6">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-500/30">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 text-white">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        </div>
        <p className="text-stone-600 text-center font-medium">{t.notLoggedIn}</p>
        <Link
          href="/"
          className="bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold px-8 py-3 rounded-xl shadow-lg shadow-orange-500/25 hover:opacity-90 transition-all active:scale-95"
        >
          {t.goHome}
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50" dir={isFa ? "rtl" : "ltr"}>
      {/* Navbar */}
      <nav dir="ltr" style={{ transform: "translateZ(0)", WebkitTransform: "translateZ(0)", willChange: "transform" }} className="fixed top-0 left-0 right-0 w-full z-[9999] bg-white border-b border-stone-200 shadow-sm">
        <div className="max-w-2xl mx-auto px-5 h-16 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 group flex-shrink-0">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center font-black text-sm text-white shadow-lg shadow-orange-500/30 group-hover:scale-110 transition-all duration-300">
              S
            </div>
            <span className="text-xl font-black tracking-tight bg-gradient-to-r from-orange-500 to-amber-600 bg-clip-text text-transparent">
              Sefira
            </span>
          </Link>
          <Link href="/" className="text-sm font-semibold text-stone-500 hover:text-stone-800 transition-colors">
            ←
          </Link>
        </div>
      </nav>

      <div className="pt-24 pb-24 px-5 max-w-2xl mx-auto">
        {/* Back to home */}
        <Link href="/" dir="ltr" className="inline-flex items-center gap-1.5 mb-5 text-sm font-semibold text-stone-500 hover:text-stone-800 bg-stone-100 hover:bg-stone-200 px-3 py-1.5 rounded-lg transition-colors">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="w-4 h-4 flex-shrink-0">
            <polyline points={isFa ? "9 18 15 12 9 6" : "15 18 9 12 15 6"} />
          </svg>
          <span>{lang === "tr" ? "Ana Sayfa" : lang === "fa" ? "صفحه اصلی" : lang === "ar" ? "الرئيسية" : "Home"}</span>
        </Link>

        {/* Page title */}
        <h1 className="text-2xl font-black text-stone-900 flex items-center gap-3 mb-5">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-orange-500 flex-shrink-0">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
          {t.title}
        </h1>

        {/* Info banner */}
        <div className="flex items-start gap-3 bg-orange-50 border border-orange-200 rounded-2xl px-4 py-3.5 mb-7">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <p className="text-sm text-orange-900 leading-relaxed">{t.banner}</p>
        </div>

        {/* Review list */}
        {!visible ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
            <div className="w-20 h-20 rounded-3xl bg-stone-100 flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10 text-stone-400">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            </div>
            <p className="text-stone-500 font-medium max-w-xs">{t.empty}</p>
          </div>
        ) : (
          /* Review card */
          <div
            className="transition-all duration-300"
            style={{ opacity: fading ? 0 : 1, transform: fading ? "scale(0.97)" : "scale(1)" }}
          >
            <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
              {/* Card header: avatar + name + stars */}
              <div className="flex items-start gap-3 p-5 pb-4">
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white font-black text-base flex-shrink-0 shadow-sm">
                  K
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-stone-900 text-sm leading-tight">Kullanıcı Test</p>
                  <div className="mt-1">
                    <StarRow rating={displayRating} />
                  </div>
                </div>
                {/* Date */}
                <span className="text-xs text-stone-400 flex-shrink-0 pt-0.5 flex items-center gap-1">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  {t.sampleReviewDate}
                </span>
              </div>

              {/* Review text or edit form */}
              {editing ? (
                <div className="px-5 pb-5 space-y-3">
                  {/* Star picker */}
                  <div>
                    <p className="text-xs font-semibold text-stone-500 mb-1.5">{t.ratingLabel}</p>
                    <StarRow
                      rating={editRating}
                      interactive
                      hover={hoverRating}
                      onHover={setHoverRating}
                      onClick={setEditRating}
                    />
                  </div>
                  {/* Textarea */}
                  <textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    placeholder={t.editPlaceholder}
                    rows={4}
                    dir={isFa ? "rtl" : "ltr"}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-sm text-stone-800 placeholder-stone-400 outline-none focus:ring-2 focus:ring-orange-400 transition-all resize-none"
                  />
                  {/* Save / Cancel */}
                  <div className="flex gap-2">
                    <button
                      onClick={saveEdit}
                      className="flex-1 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-sm font-bold py-2.5 rounded-xl hover:opacity-90 active:scale-95 transition-all shadow-sm"
                    >
                      {t.save}
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="flex-1 bg-stone-100 text-stone-600 text-sm font-bold py-2.5 rounded-xl hover:bg-stone-200 active:scale-95 transition-all"
                    >
                      {t.cancel}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="px-5 pb-5">
                  <p className="text-sm text-stone-700 leading-relaxed mb-4 whitespace-pre-line">&ldquo;{displayText}&rdquo;</p>

                  {/* Delete confirmation inline */}
                  {confirmDelete ? (
                    <div className="bg-rose-50 border border-rose-200 rounded-xl p-3.5 space-y-3">
                      <p className="text-sm text-rose-700 font-medium">{t.confirmDelete}</p>
                      <div className="flex gap-2">
                        <button
                          onClick={handleDeleteConfirm}
                          className="flex-1 bg-rose-500 text-white text-sm font-bold py-2 rounded-lg hover:bg-rose-600 active:scale-95 transition-all"
                        >
                          {t.confirmYes}
                        </button>
                        <button
                          onClick={() => setConfirmDelete(false)}
                          className="flex-1 bg-white border border-stone-200 text-stone-600 text-sm font-bold py-2 rounded-lg hover:bg-stone-50 active:scale-95 transition-all"
                        >
                          {t.confirmNo}
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Edit / Delete buttons */
                    <div className="flex gap-2">
                      <button
                        onClick={startEdit}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-50 text-orange-700 text-sm font-semibold hover:bg-orange-100 active:scale-95 transition-all border border-orange-200"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                        {t.edit}
                      </button>
                      <button
                        onClick={() => setConfirmDelete(true)}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-50 text-rose-500 text-sm font-semibold hover:bg-rose-100 active:scale-95 transition-all border border-rose-200"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
                          <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                        </svg>
                        {t.delete}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
