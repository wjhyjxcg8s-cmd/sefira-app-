"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { supabase } from "@/app/lib/supabase";

const translations = {
  tr: {
    title: "Mesajlarım",
    messages: "Mesajlar",
    channelName: "Sefira Bildirimleri",
    supportChannelName: "Sefira Destek",
    noConversation: "Sohbet etmeye başlamak için bir konuşma seçin.",
    welcomePreview: "Hoş geldiniz! 🙏",
    welcomeMessage:
      "Sefira'yı seçtiğiniz için size içtenlikle teşekkür ederiz.\nBizi bir dostunuz olarak bilin; tıpkı bizim sizi dostumuz olarak gördüğümüz gibi. 🙏\n\nBu bölümde, başkalarına gönderdiğiniz mesajlar görüntülenir ve sohbetlerinize devam edebilirsiniz. Teşekkürler.",
    systemMessage: "Bu bir sistem mesajıdır.",
    supportWelcome: "Merhaba! Size nasıl yardımcı olabiliriz? 🙏",
    supportPlaceholder: "Mesajınızı yazın...",
    sendButton: "Gönder",
    home: "Ana Sayfa",
  },
  en: {
    title: "My Messages",
    messages: "Messages",
    channelName: "Sefira Notifications",
    supportChannelName: "Sefira Support",
    noConversation: "Select a conversation to start chatting.",
    welcomePreview: "Welcome! 🙏",
    welcomeMessage:
      "We sincerely thank you for choosing Sefira.\nConsider us your friend, just as we consider you ours. 🙏\n\nIn this section, you can see the messages you have sent to others and continue your conversations. Thank you.",
    systemMessage: "This is a system message.",
    supportWelcome: "Hello! How can we help you? 🙏",
    supportPlaceholder: "Write your message...",
    sendButton: "Send",
    home: "Home",
  },
  fa: {
    title: "پیام‌های من",
    messages: "پیام‌ها",
    channelName: "اعلان‌های سفیرا",
    supportChannelName: "پشتیبانی سفیرا",
    noConversation: "برای شروع گفتگو یک مکالمه را انتخاب کنید.",
    welcomePreview: "خوش آمدید! 🙏",
    welcomeMessage:
      "از اینکه سفیرا را انتخاب کرده‌اید، از شما صمیمانه تشکر می‌کنیم.\nما را دوست خودتان بدانید، همان‌طور که ما نیز شما را دوست خود می‌دانیم. 🙏\n\nدر این بخش، پیام‌هایی که برای دیگران ارسال کرده‌اید نمایش داده می‌شود و می‌توانید به گفت‌وگوها و چت‌های خود ادامه دهید.\nبا تشکر",
    systemMessage: "این یک پیام سیستمی است.",
    supportWelcome: "سلام! چطور می‌توانیم کمکتان کنیم؟ 🙏",
    supportPlaceholder: "پیام خود را بنویسید...",
    sendButton: "ارسال",
    home: "صفحه اصلی",
  },
  de: {
    title: "Meine Nachrichten",
    messages: "Nachrichten",
    channelName: "Sefira Benachrichtigungen",
    supportChannelName: "Sefira Support",
    noConversation: "Wählen Sie eine Unterhaltung aus, um zu chatten.",
    welcomePreview: "Willkommen! 🙏",
    welcomeMessage:
      "Vielen Dank, dass Sie Sefira gewählt haben.\nBetrachten Sie uns als Ihren Freund, genau wie wir Sie als unseren betrachten. 🙏\n\nIn diesem Bereich können Sie Ihre gesendeten Nachrichten sehen und Gespräche fortführen.",
    systemMessage: "Dies ist eine Systemnachricht.",
    supportWelcome: "Hallo! Wie können wir Ihnen helfen? 🙏",
    supportPlaceholder: "Schreiben Sie Ihre Nachricht...",
    sendButton: "Senden",
    home: "Startseite",
  },
  ar: {
    title: "رسائلي",
    messages: "الرسائل",
    channelName: "إشعارات سفيرا",
    supportChannelName: "دعم سفيرا",
    noConversation: "اختر محادثة للبدء في الدردشة.",
    welcomePreview: "مرحباً! 🙏",
    welcomeMessage:
      "شكراً لاختيارك سفيرا. نحن هنا من أجلك، تماماً كما أنت هنا من أجلنا. 🙏\n\nفي هذا القسم، يمكنك رؤية الرسائل التي أرسلتها للآخرين ومتابعة محادثاتك.",
    systemMessage: "هذه رسالة نظام.",
    supportWelcome: "مرحباً! كيف يمكننا مساعدتك؟ 🙏",
    supportPlaceholder: "اكتب رسالتك...",
    sendButton: "إرسال",
    home: "الرئيسية",
  },
  ru: {
    title: "Мои сообщения",
    messages: "Сообщения",
    channelName: "Уведомления Sefira",
    supportChannelName: "Поддержка Sefira",
    noConversation: "Нет сообщений",
    welcomePreview: "Добро пожаловать! 🙏",
    welcomeMessage:
      "Искренне благодарим вас за выбор Sefira.\nМы — ваш друг, как и вы — наш. 🙏\n\nЗдесь вы можете видеть сообщения, отправленные другим пользователям, и продолжать разговоры. Спасибо.",
    systemMessage: "Это системное сообщение.",
    supportWelcome: "Привет! Чем мы можем помочь? 🙏",
    supportPlaceholder: "Напишите сообщение...",
    sendButton: "Отправить",
    home: "Главная",
  },
};

type Lang = keyof typeof translations;

interface AdminMessage {
  id: string;
  user_id: string | null;
  email: string | null;
  title: string;
  message: string;
  is_global: boolean;
  created_at: string;
  is_read: boolean;
  sender: "admin" | "user" | null;
}

export default function MessagesPage() {
  const [lang, setLang] = useState<Lang>("tr");
  const [mounted, setMounted] = useState(false);
  const [selectedConv, setSelectedConv] = useState<string | null>(null);
  const [mobileView, setMobileView] = useState<"list" | "chat">("list");
  const [globalMessages, setGlobalMessages] = useState<AdminMessage[]>([]);
  const [chatMessages, setChatMessages] = useState<AdminMessage[]>([]);
  const [unreadSupportCount, setUnreadSupportCount] = useState(0);
  const [chatInput, setChatInput] = useState("");
  const [sendingChat, setSendingChat] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    console.log("selectedConv changed:", selectedConv);
  }, [selectedConv]);

  useEffect(() => {
    const savedLang = localStorage.getItem("sefira-lang") as Lang | null;
    if (savedLang && savedLang in translations) setLang(savedLang as Lang);
    setMounted(true);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.user?.id) return;
      const uid = session.user.id;

      supabase
        .from("admin_messages")
        .select("*")
        .eq("is_global", true)
        .order("created_at", { ascending: false })
        .then(({ data }) => {
          if (data) setGlobalMessages(data as AdminMessage[]);
        });

      supabase
        .from("admin_messages")
        .select("*")
        .eq("user_id", uid)
        .eq("is_global", false)
        .order("created_at", { ascending: true })
        .then(({ data }) => {
          if (data) setChatMessages(data as AdminMessage[]);
        });

      supabase
        .from("admin_messages")
        .select("*", { count: "exact", head: true })
        .eq("user_id", uid)
        .eq("sender", "admin")
        .eq("is_read", false)
        .then(({ count }) => setUnreadSupportCount(count ?? 0));
    });
  }, []);

  useEffect(() => {
    if (selectedConv === "sefira-destek") {
      chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages, selectedConv]);

  const t = translations[lang];
  const isFa = lang === "fa" || lang === "ar";

  const hasUnreadGlobal = mounted && globalMessages.some((m) => !m.is_read);
  const lastGlobalMsg = globalMessages[0] ?? null;

  const openNotificationsChannel = async () => {
    setSelectedConv("sefira-notifications");
    setMobileView("chat");
    if (globalMessages.some((m) => !m.is_read)) {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user?.id) {
        await supabase
          .from("admin_messages")
          .update({ is_read: true })
          .eq("is_global", true);
        setGlobalMessages((prev) => prev.map((m) => ({ ...m, is_read: true })));
      }
    }
  };

  const handleSendChat = async () => {
    console.log("SEND BUTTON CLICKED", chatInput);
    if (!chatInput.trim() || sendingChat) return;
    setSendingChat(true);
    const text = chatInput.trim();
    setChatInput("");

    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.id) {
      console.log("SEND ABORTED: no session");
      setSendingChat(false);
      return;
    }

    const { data, error } = await supabase
      .from("admin_messages")
      .insert([{
        user_id: session.user.id,
        title: "reply",
        message: text,
        is_global: false,
        sender: "user",
        is_read: false,
      }])
      .select()
      .single();

    console.log("CHAT INSERT error:", error, "data:", data);
    if (!error && data) {
      setChatMessages((prev) => [...prev, data as AdminMessage]);
    }
    setSendingChat(false);
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString(
      lang === "tr" ? "tr-TR" : lang === "fa" || lang === "ar" ? "ar" : "en-US",
      { month: "short", day: "numeric" }
    );

  const globalSorted = [...globalMessages].reverse();

  return (
    <div
      className="flex flex-col h-screen bg-[#fefaf5]"
      dir={isFa ? "rtl" : "ltr"}
    >
      {/* Header */}
      <header className="h-14 flex items-center px-4 border-b border-stone-200 bg-white shadow-sm flex-shrink-0 gap-3">
        <Link
          href="/"
          className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 flex-shrink-0"
        >
          <span className="text-white font-black text-sm leading-none">S</span>
        </Link>
        <h1 className="font-black text-stone-900 text-lg">{t.title}</h1>
      </header>

      {/* Back to home */}
      <div className="px-4 py-2.5 border-b border-stone-100 bg-white flex-shrink-0">
        <Link
          href="/"
          dir="ltr"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-stone-500 hover:text-stone-800 bg-stone-100 hover:bg-stone-200 px-3 py-1.5 rounded-lg transition-colors"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            className="w-4 h-4 flex-shrink-0"
          >
            <polyline points={isFa ? "9 18 15 12 9 6" : "15 18 9 12 15 6"} />
          </svg>
          <span>{t.home}</span>
        </Link>
      </div>

      {/* Main layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* ── Left panel: conversation list ──────────────────────────────── */}
        <div
          className={`
            ${mobileView === "chat" ? "hidden" : "flex"} md:flex
            flex-col w-full md:w-[30%] border-r border-stone-200 bg-white overflow-y-auto flex-shrink-0
          `}
        >
          <div className="px-5 py-3 border-b border-stone-100">
            <h2 className="font-bold text-stone-500 text-xs uppercase tracking-wider">
              {t.messages}
            </h2>
          </div>

          {/* Sefira Destek – two-way support chat */}
          <button
            onClick={() => { window.location.href = "/support-chat"; }}
            className="w-full flex items-center gap-3 px-4 py-3.5 transition-colors text-left border-b border-stone-100 hover:bg-stone-50"
          >
            <div className="relative w-12 h-12 flex-shrink-0">
              <div className="w-12 h-12 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                S
              </div>
              {unreadSupportCount > 0 && (
                <div className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-red-500 border-2 border-white" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-0.5">
                <span className={`text-sm truncate ${unreadSupportCount > 0 ? "font-bold text-stone-900" : "font-semibold text-stone-700"}`}>
                  {t.supportChannelName}
                </span>
                {chatMessages.length > 0 && (
                  <span className="text-xs text-stone-400 flex-shrink-0">
                    {formatDate(chatMessages[chatMessages.length - 1].created_at)}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5">
                <p className={`text-xs truncate flex-1 ${unreadSupportCount > 0 ? "text-stone-700 font-medium" : "text-stone-400"}`}>
                  {chatMessages[chatMessages.length - 1]?.message || t.supportWelcome}
                </p>
                {unreadSupportCount > 0 && (
                  <span className="flex-shrink-0 min-w-[18px] h-[18px] rounded-full bg-orange-500 text-white text-[10px] font-bold flex items-center justify-center px-1">
                    {unreadSupportCount > 9 ? "9+" : unreadSupportCount}
                  </span>
                )}
              </div>
            </div>
          </button>

          {/* Sefira Bildirimleri – read-only announcements */}
          <button
            onClick={openNotificationsChannel}
            className={`
              w-full flex items-center gap-3 px-4 py-3.5 transition-colors text-left
              ${selectedConv === "sefira-notifications" ? "bg-orange-50" : "hover:bg-stone-50"}
            `}
          >
            <div className="relative w-12 h-12 flex-shrink-0">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white font-black text-lg shadow-sm">
                S
              </div>
              {hasUnreadGlobal && (
                <div className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-orange-500 border-2 border-white" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-0.5">
                <span
                  className={`text-sm truncate ${hasUnreadGlobal ? "font-bold text-stone-900" : "font-semibold text-stone-700"}`}
                >
                  {t.channelName}
                </span>
                <span className="text-xs text-stone-400 flex-shrink-0">
                  {lastGlobalMsg ? formatDate(lastGlobalMsg.created_at) : "Sefira"}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <p
                  className={`text-xs truncate flex-1 ${hasUnreadGlobal ? "text-stone-700 font-medium" : "text-stone-400"}`}
                >
                  {lastGlobalMsg ? lastGlobalMsg.message : t.welcomePreview}
                </p>
                {hasUnreadGlobal && (
                  <div className="w-2 h-2 rounded-full bg-orange-500 flex-shrink-0" />
                )}
              </div>
            </div>
          </button>
        </div>

        {/* ── Right panel: chat view ─────────────────────────────────────── */}
        <div
          className={`
            ${mobileView === "list" ? "hidden" : "flex"} md:flex
            flex-col flex-1 overflow-hidden
          `}
          style={{ background: "#f0ebe4" }}
        >
          {selectedConv === "sefira-destek" ? (
            <>
              {/* Chat header */}
              <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-stone-200 shadow-sm flex-shrink-0">
                <button
                  onClick={() => setMobileView("list")}
                  className="md:hidden p-2 -ml-2 text-stone-500 hover:text-stone-800 rounded-lg hover:bg-stone-100 transition-colors"
                  aria-label="Back"
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
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-black text-xs shadow-sm flex-shrink-0">
                  SD
                </div>
                <div>
                  <p className="font-bold text-stone-900 text-sm leading-tight">
                    {t.supportChannelName}
                  </p>
                  <p className="text-xs text-emerald-500 font-semibold">Sefira</p>
                </div>
              </div>

              {/* Messages area – always LTR layout, dir="auto" per bubble */}
              <div className="flex-1 overflow-y-auto px-4 py-5 flex flex-col gap-3">
                {/* Welcome bubble from admin */}
                <div
                  className="flex items-end gap-2 max-w-[80%]"
                  style={{ direction: "ltr" }}
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-black text-xs flex-shrink-0 mb-1 shadow-sm">
                    SD
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="bg-white rounded-2xl rounded-bl-sm px-4 py-2.5 shadow-sm">
                      <p
                        dir="auto"
                        className="text-sm text-stone-800 leading-relaxed"
                      >
                        {t.supportWelcome}
                      </p>
                    </div>
                    <span className="text-[11px] text-stone-400 px-1">Sefira</span>
                  </div>
                </div>

                {chatMessages.map((msg) => {
                  const isUser = msg.sender === "user";
                  return (
                    <div
                      key={msg.id}
                      className={`flex w-full ${isUser ? "justify-end" : "justify-start"}`}
                      style={{ direction: "ltr" }}
                    >
                      <div
                        className={`flex items-end gap-2 max-w-[80%] ${isUser ? "flex-row-reverse" : ""}`}
                      >
                        {!isUser && (
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-black text-xs flex-shrink-0 mb-1 shadow-sm">
                            SD
                          </div>
                        )}
                        <div
                          className={`flex flex-col gap-1 ${isUser ? "items-end" : "items-start"}`}
                        >
                          <div
                            className={`rounded-2xl px-4 py-2.5 shadow-sm ${
                              isUser
                                ? "bg-orange-500 rounded-br-sm"
                                : "bg-white rounded-bl-sm"
                            }`}
                          >
                            <p
                              dir="auto"
                              className={`text-sm leading-relaxed whitespace-pre-line ${
                                isUser ? "text-white" : "text-stone-800"
                              }`}
                            >
                              {msg.message}
                            </p>
                          </div>
                          <span className="text-[11px] text-stone-400 px-1">
                            {formatDate(msg.created_at)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={chatBottomRef} />
              </div>

              {/* Input area */}
              <div className="px-4 py-3 bg-white border-t border-stone-200 flex-shrink-0">
                <div className="flex gap-2" style={{ direction: "ltr" }}>
                  <input
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendChat();
                      }
                    }}
                    placeholder={t.supportPlaceholder}
                    dir="auto"
                    className="flex-1 px-4 py-2.5 rounded-2xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-stone-50"
                  />
                  <button
                    onClick={handleSendChat}
                    disabled={!chatInput.trim() || sendingChat}
                    className="px-4 py-2.5 rounded-2xl bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600 disabled:opacity-50 transition-colors flex-shrink-0"
                  >
                    {sendingChat ? "…" : t.sendButton}
                  </button>
                </div>
              </div>
            </>
          ) : selectedConv === "sefira-notifications" ? (
            <>
              {/* Chat header */}
              <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-stone-200 shadow-sm flex-shrink-0">
                <button
                  onClick={() => setMobileView("list")}
                  className="md:hidden p-2 -ml-2 text-stone-500 hover:text-stone-800 rounded-lg hover:bg-stone-100 transition-colors"
                  aria-label="Back"
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
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white font-black shadow-sm flex-shrink-0">
                  S
                </div>
                <div>
                  <p className="font-bold text-stone-900 text-sm leading-tight">
                    {t.channelName}
                  </p>
                  <p className="text-xs text-emerald-500 font-semibold">Sefira</p>
                </div>
              </div>

              {/* Messages area */}
              <div className="flex-1 overflow-y-auto px-4 py-5 flex flex-col gap-3">
                {/* Static welcome bubble */}
                <div className="flex items-end gap-2 max-w-[80%]">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white font-black text-sm flex-shrink-0 mb-1 shadow-sm">
                    S
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="bg-white rounded-2xl rounded-bl-sm px-4 py-2.5 shadow-sm">
                      <p className="text-sm text-stone-800 leading-relaxed whitespace-pre-line">
                        {t.welcomeMessage}
                      </p>
                    </div>
                    <span className="text-[11px] text-stone-400 px-1">Sefira</span>
                  </div>
                </div>

                {globalSorted.map((msg) => (
                  <div
                    key={msg.id}
                    className="flex items-end gap-2 max-w-[80%]"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white font-black text-sm flex-shrink-0 mb-1 shadow-sm">
                      S
                    </div>
                    <div className="flex flex-col gap-1">
                      <div className="bg-white rounded-2xl rounded-bl-sm px-4 py-2.5 shadow-sm">
                        <p className="text-xs font-bold text-orange-500 mb-1">
                          {msg.title}
                        </p>
                        <p className="text-sm text-stone-800 leading-relaxed whitespace-pre-line">
                          {msg.message}
                        </p>
                      </div>
                      <span className="text-[11px] text-stone-400 px-1">
                        {formatDate(msg.created_at)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Read-only footer */}
              <div className="px-4 py-3 bg-white border-t border-stone-200 flex-shrink-0">
                <p className="text-xs text-stone-400 text-center">
                  {t.systemMessage}
                </p>
              </div>
            </>
          ) : (
            /* No conversation selected */
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center px-6">
                <div className="w-20 h-20 rounded-full bg-orange-100 flex items-center justify-center mx-auto mb-4">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-10 h-10 text-orange-400"
                  >
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                </div>
                <p className="text-stone-500 text-sm">{t.noConversation}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
