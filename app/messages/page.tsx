"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import Image from "next/image";
import { useLang } from "@/app/lib/LangContext";
import Link from "next/link";
import { motion } from "framer-motion";
import { useSearchParams, useRouter } from "next/navigation";
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
    newMessage: "Yeni Mesaj",
    typeMessage: "Mesaj yazın...",
    noMessagesYet: "Henüz mesaj yok. İlk mesajı gönderin!",
    reply: "Yanıtla",
    replyingTo: "Yanıtlıyorsunuz",
    blockUser: "🚫 Kullanıcıyı Engelle",
    blockConfirm: "Bu kullanıcıyı engellemek istediğinizden emin misiniz?",
    blockSuccess: "Kullanıcı engellendi",
    close: "❌ Kapat",
    confirm: "Onayla",
    cancel: "İptal",
    report: "🚩 Şikayet Et",
    reportTitle: "Şikayet nedeninizi seçin",
    reportInappropriate: "Uygunsuz içerik",
    reportSpam: "Spam",
    reportInsult: "Hakaret/Küfür",
    reportOther: "Diğer",
    reportSuccess: "Şikayetiniz alındı, incelenecektir",
    blockedByYouBanner: "Bu kullanıcıyı engellediniz",
    blockedByThemBanner: "Bu kullanıcı tarafından engellendiniz",
    unblock: "Engeli Kaldır",
    unblockConfirm: "Bu kullanıcının engelini kaldırmak istediğinizden emin misiniz?",
    unblockSuccess: "Engel kaldırıldı",
    cannotSendBlocked: "Bu kullanıcıyı engellediğiniz için mesaj gönderemezsiniz",
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
    newMessage: "New Message",
    typeMessage: "Type a message...",
    noMessagesYet: "No messages yet. Send the first one!",
    reply: "Reply",
    replyingTo: "Replying to",
    blockUser: "🚫 Block User",
    blockConfirm: "Are you sure you want to block this user?",
    blockSuccess: "User blocked",
    close: "❌ Close",
    confirm: "Confirm",
    cancel: "Cancel",
    report: "🚩 Report",
    reportTitle: "Select a reason",
    reportInappropriate: "Inappropriate content",
    reportSpam: "Spam",
    reportInsult: "Insult/Abuse",
    reportOther: "Other",
    reportSuccess: "Your report has been received",
    blockedByYouBanner: "You have blocked this user",
    blockedByThemBanner: "You have been blocked by this user",
    unblock: "Unblock",
    unblockConfirm: "Are you sure you want to unblock this user?",
    unblockSuccess: "User unblocked",
    cannotSendBlocked: "You cannot send messages because you blocked this user",
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
    newMessage: "پیام جدید",
    typeMessage: "پیام بنویسید...",
    noMessagesYet: "هنوز پیامی نیست. اولین پیام را ارسال کنید!",
    reply: "پاسخ",
    replyingTo: "در پاسخ به",
    blockUser: "🚫 مسدود کردن کاربر",
    blockConfirm: "آیا مطمئن هستید که می‌خواهید این کاربر را مسدود کنید؟",
    blockSuccess: "کاربر مسدود شد",
    close: "❌ بستن",
    confirm: "تأیید",
    cancel: "لغو",
    report: "🚩 گزارش",
    reportTitle: "دلیل گزارش را انتخاب کنید",
    reportInappropriate: "محتوای نامناسب",
    reportSpam: "اسپم",
    reportInsult: "توهین/ناسزا",
    reportOther: "سایر",
    reportSuccess: "گزارش شما دریافت شد",
    blockedByYouBanner: "شما این کاربر را مسدود کرده‌اید",
    blockedByThemBanner: "این کاربر شما را مسدود کرده است",
    unblock: "رفع مسدودیت",
    unblockConfirm: "آیا مطمئن هستید که می‌خواهید این کاربر را از مسدودیت خارج کنید؟",
    unblockSuccess: "مسدودیت برداشته شد",
    cannotSendBlocked: "شما این کاربر را مسدود کرده‌اید و نمی‌توانید پیام بفرستید",
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
    newMessage: "Neue Nachricht",
    typeMessage: "Nachricht schreiben...",
    noMessagesYet: "Noch keine Nachrichten. Senden Sie die erste!",
    reply: "Antworten",
    replyingTo: "Antwort auf",
    blockUser: "🚫 Benutzer blockieren",
    blockConfirm: "Möchten Sie diesen Benutzer wirklich blockieren?",
    blockSuccess: "Benutzer blockiert",
    close: "❌ Schließen",
    confirm: "Bestätigen",
    cancel: "Abbrechen",
    report: "🚩 Melden",
    reportTitle: "Grund auswählen",
    reportInappropriate: "Unangemessener Inhalt",
    reportSpam: "Spam",
    reportInsult: "Beleidigung/Missbrauch",
    reportOther: "Sonstiges",
    reportSuccess: "Ihre Meldung wurde erhalten",
    blockedByYouBanner: "Sie haben diesen Benutzer blockiert",
    blockedByThemBanner: "Sie wurden von diesem Benutzer blockiert",
    unblock: "Entsperren",
    unblockConfirm: "Möchten Sie die Blockierung dieses Benutzers wirklich aufheben?",
    unblockSuccess: "Benutzer entsperrt",
    cannotSendBlocked: "Sie können keine Nachrichten senden, da Sie diesen Benutzer blockiert haben",
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
    newMessage: "رسالة جديدة",
    typeMessage: "اكتب رسالة...",
    noMessagesYet: "لا رسائل بعد. أرسل الأول!",
    reply: "رد",
    replyingTo: "ردًا على",
    blockUser: "🚫 حظر المستخدم",
    blockConfirm: "هل أنت متأكد من حظر هذا المستخدم؟",
    blockSuccess: "تم حظر المستخدم",
    close: "❌ إغلاق",
    confirm: "تأكيد",
    cancel: "إلغاء",
    report: "🚩 إبلاغ",
    reportTitle: "اختر السبب",
    reportInappropriate: "محتوى غير لائق",
    reportSpam: "بريد مزعج",
    reportInsult: "إهانة/إساءة",
    reportOther: "أخرى",
    reportSuccess: "تم استلام تقريرك",
    blockedByYouBanner: "لقد حظرت هذا المستخدم",
    blockedByThemBanner: "تم حظرك من قبل هذا المستخدم",
    unblock: "إلغاء الحظر",
    unblockConfirm: "هل أنت متأكد من إلغاء حظر هذا المستخدم؟",
    unblockSuccess: "تم إلغاء الحظر",
    cannotSendBlocked: "لا يمكنك إرسال رسائل لأنك حظرت هذا المستخدم",
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
    newMessage: "Новое сообщение",
    typeMessage: "Написать сообщение...",
    noMessagesYet: "Пока нет сообщений. Отправьте первое!",
    reply: "Ответить",
    replyingTo: "В ответ на",
    blockUser: "🚫 Заблокировать пользователя",
    blockConfirm: "Вы уверены, что хотите заблокировать этого пользователя?",
    blockSuccess: "Пользователь заблокирован",
    close: "❌ Закрыть",
    confirm: "Подтвердить",
    cancel: "Отмена",
    report: "🚩 Пожаловаться",
    reportTitle: "Выберите причину",
    reportInappropriate: "Неуместный контент",
    reportSpam: "Спам",
    reportInsult: "Оскорбление/Нарушение",
    reportOther: "Другое",
    reportSuccess: "Ваша жалоба получена",
    blockedByYouBanner: "Вы заблокировали этого пользователя",
    blockedByThemBanner: "Этот пользователь заблокировал вас",
    unblock: "Разблокировать",
    unblockConfirm: "Вы уверены, что хотите разблокировать этого пользователя?",
    unblockSuccess: "Пользователь разблокирован",
    cannotSendBlocked: "Вы не можете отправлять сообщения, так как заблокировали этого пользователя",
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

interface ConversationItem {
  id: string;
  otherUserId: string;
  otherUserProfile: { display_name: string | null; avatar_url: string | null } | null;
  listingId: string | null;
  listingPreview: {
    id: string;
    city: string | null;
    district: string | null;
    rent: number | null;
    currency: string | null;
    photos: string[] | null;
  } | null;
  lastMessage: { content: string; created_at: string; sender_id: string } | null;
  unreadCount: number;
  updatedAt: string;
}

interface ListingContextData {
  id: string;
  city: string | null;
  district: string | null;
  rent: number | null;
  currency: string | null;
  photos: string[] | null;
  house_type: string | null;
}

const SYSTEM_CONVS = new Set(["sefira-notifications", "sefira-destek"]);

function formatTime(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / 86400000);
  if (diffDays === 0)
    return date.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
  if (diffDays === 1)
    return "Dün " + date.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
  return date.toLocaleDateString("tr-TR", { day: "numeric", month: "short" });
}

const SendIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
  </svg>
);

function MessagesPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  console.log("URL params - userId:", searchParams.get("userId"), "listingId:", searchParams.get("listingId"));

  const { lang } = useLang();
  const [mounted, setMounted] = useState(false);
  const [selectedConv, setSelectedConv] = useState<string | null>(null);
  const [mobileView, setMobileView] = useState<"list" | "chat">("list");

  // System channel state
  const [globalMessages, setGlobalMessages] = useState<AdminMessage[]>([]);
  const [chatMessages, setChatMessages] = useState<AdminMessage[]>([]);
  const [unreadSupportCount, setUnreadSupportCount] = useState(0);
  const [chatInput, setChatInput] = useState("");
  const [sendingChat, setSendingChat] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Peer messaging state
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [targetUserId, setTargetUserId] = useState<string | null>(null);
  const [targetListingId, setTargetListingId] = useState<string | null>(null);
  const [realConvId, setRealConvId] = useState<string | null>(null);
  const [targetProfile, setTargetProfile] = useState<{
    display_name: string | null;
    avatar_url: string | null;
  } | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [messageText, setMessageText] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<HTMLInputElement>(null);
  const messageRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const tapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Reply state
  const [replyingTo, setReplyingTo] = useState<{ id: string; content: string } | null>(null);
  const [contextMenu, setContextMenu] = useState<{
    messageId: string;
    content: string;
    x: number;
    y: number;
  } | null>(null);
  const [swipeMsg, setSwipeMsg] = useState<{
    id: string;
    deltaX: number;
    startX: number;
    startY: number;
    startTime: number;
    triggered: boolean;
    isHorizontal: boolean | null;
  } | null>(null);
  const [tapReplyId, setTapReplyId] = useState<string | null>(null);

  // Block/unblock state
  const [showBlockMenu, setShowBlockMenu] = useState(false);
  const [blockMenuPos, setBlockMenuPos] = useState({ top: 0, left: 0 });
  const blockMenuBtnRef = useRef<HTMLButtonElement>(null);
  const [showBlockConfirm, setShowBlockConfirm] = useState(false);
  const [blockingUser, setBlockingUser] = useState(false);
  const [showUnblockConfirm, setShowUnblockConfirm] = useState(false);
  const [unblockingUser, setUnblockingUser] = useState(false);

  // Report message state
  const [reportMenu, setReportMenu] = useState<{ msgId: string; content: string } | null>(null);
  const [submittingReport, setSubmittingReport] = useState(false);

  // Block status: "blocker" = I blocked them, "blocked" = they blocked me, null = no block
  const [blockStatus, setBlockStatus] = useState<"blocker" | "blocked" | null>(null);

  // Toast state
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Long-press timer ref
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressPos = useRef<{ x: number; y: number } | null>(null);
  const contextMenuDismissTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Press visual feedback state
  const [pressedMsgId, setPressedMsgId] = useState<string | null>(null);

  // Conversations list (enriched — includes listing + otherUser preloaded)
  const [enrichedConvs, setEnrichedConvs] = useState<any[]>([]);
  const [listingContext, setListingContext] = useState<ListingContextData | null>(null);
  const [pendingListingId, setPendingListingId] = useState<string | null>(null);
  const [pendingUserId, setPendingUserId] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Auth + system channel fetch
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.user?.id) return;
      const uid = session.user.id;
      setCurrentUserId(uid);

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

  // Load enriched conversations (with listing + otherUser preloaded) when auth is ready
  useEffect(() => {
    if (!currentUserId) return;
    console.log("[conversations] loading for userId:", currentUserId);
    fetch("/api/messages/conversations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: currentUserId }),
    })
      .then((r) => r.json())
      .then((result) => {
        console.log("[conversations] loaded:", result.conversations?.length, "convs");
        setEnrichedConvs(result.conversations || []);
      })
      .catch((e) => console.log("[conversations] error:", e));
  }, [currentUserId]);

  // Capture URL params immediately and persist in state
  useEffect(() => {
    const lid = searchParams.get("listingId");
    const uid = searchParams.get("userId");
    console.log("[messages] URL params — listingId:", lid, "userId:", uid);
    if (lid) setPendingListingId(lid);
    if (uid) setPendingUserId(uid);
  }, [searchParams]);

// Fetch listing context when targetListingId changes
  useEffect(() => {
    if (!targetListingId) {
      setListingContext(null);
      return;
    }
    supabase
      .from("listings")
      .select("id, city, district, rent, currency, photos, house_type")
      .eq("id", targetListingId)
      .maybeSingle()
      .then(({ data }) => setListingContext(data as ListingContextData | null));
  }, [targetListingId]);

  // Handle ?userId= query param — auto-open conversation
  useEffect(() => {
    const userId = searchParams.get("userId");
    const listingId = searchParams.get("listingId");
    if (!userId) return;

    setTargetUserId(userId);
    setTargetListingId(listingId);
    setRealConvId(null);
    setMessages([]);
    setSelectedConv(userId);
    setMobileView("chat");

    supabase
      .from("profiles")
      .select("display_name, avatar_url")
      .eq("user_id", userId)
      .maybeSingle()
      .then(({ data }) => {
        setTargetProfile(data ?? { display_name: null, avatar_url: null });
      });
  }, [searchParams]);

  // Handle ?convId= query param — opened from notification bell
  useEffect(() => {
    const convId = searchParams.get("convId");
    if (!convId || !currentUserId) return;

    setRealConvId(convId);
    setSelectedConv(convId);
    setMessages([]);
    setMobileView("chat");

    fetch("/api/messages/fetch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversationId: convId, currentUserId }),
    })
      .then((r) => r.json())
      .then((result) => {
        if (result.messages) setMessages(result.messages);
        if (result.listingId) setTargetListingId(result.listingId);
        if (result.targetUserId) {
          setTargetUserId(result.targetUserId);
          supabase
            .from("profiles")
            .select("display_name, avatar_url")
            .eq("user_id", result.targetUserId)
            .maybeSingle()
            .then(({ data }) => {
              setTargetProfile(data ?? { display_name: null, avatar_url: null });
            });
        }
      });

    fetch("/api/messages/mark-read", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversationId: convId, userId: currentUserId }),
    });
  }, [searchParams, currentUserId]);

  // Load peer messages via server API whenever a user conversation is selected
  useEffect(() => {
    if (
      !selectedConv ||
      SYSTEM_CONVS.has(selectedConv) ||
      !currentUserId ||
      !targetUserId
    )
      return;

    fetch("/api/messages/fetch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ senderId: currentUserId, targetUserId, listingId: pendingListingId || targetListingId }),
    })
      .then((r) => r.json())
      .then((result) => {
        if (result.conversationId) setRealConvId(result.conversationId);
        if (result.messages) setMessages(result.messages);
      });
  }, [selectedConv, currentUserId, targetUserId]);

  // Scroll to bottom after new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Scroll support chat to bottom
  useEffect(() => {
    if (selectedConv === "sefira-destek") {
      chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages, selectedConv]);

  // Auto-dismiss context menu after 3 seconds
  useEffect(() => {
    if (contextMenu) {
      if (contextMenuDismissTimer.current) clearTimeout(contextMenuDismissTimer.current);
      contextMenuDismissTimer.current = setTimeout(() => setContextMenu(null), 3000);
    }
    return () => { if (contextMenuDismissTimer.current) clearTimeout(contextMenuDismissTimer.current); };
  }, [contextMenu]);

  // Check block status whenever the active conversation changes
  useEffect(() => {
    if (!currentUserId || !targetUserId) { setBlockStatus(null); return; }
    fetch("/api/users/block-check", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: currentUserId, targetUserId }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.blockedByUser) setBlockStatus("blocker");
        else if (data.blockedByTarget) setBlockStatus("blocked");
        else setBlockStatus(null);
      })
      .catch(() => setBlockStatus(null));
  }, [currentUserId, targetUserId]);

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

  const openConversation = (conv: any) => {
    const otherUserId = conv.user1_id === currentUserId ? conv.user2_id : conv.user1_id;
    setTargetUserId(otherUserId);
    setTargetProfile(conv.otherUser ?? null);
    setTargetListingId(conv.listing_id ?? null);
    setRealConvId(conv.id);
    setSelectedConv(conv.id);
    setMessages([]);
    setMobileView("chat");

    fetch("/api/messages/fetch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversationId: conv.id, currentUserId }),
    })
      .then((r) => r.json())
      .then((result) => {
        if (result.messages) setMessages(result.messages);
      });

    if (conv.unreadCount > 0) {
      fetch("/api/messages/mark-read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId: conv.id, userId: currentUserId }),
      }).then(() => {
        setEnrichedConvs((prev) =>
          prev.map((c) => (c.id === conv.id ? { ...c, unreadCount: 0 } : c))
        );
      });
    }
  };

  const handleSendChat = async () => {
    if (!chatInput.trim() || sendingChat) return;
    setSendingChat(true);
    const text = chatInput.trim();
    setChatInput("");

    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.user?.id) {
      setSendingChat(false);
      return;
    }

    const { data, error } = await supabase
      .from("admin_messages")
      .insert([
        {
          user_id: session.user.id,
          title: "reply",
          message: text,
          is_global: false,
          sender: "user",
          is_read: false,
        },
      ])
      .select()
      .single();

    if (!error && data) setChatMessages((prev) => [...prev, data as AdminMessage]);
    setSendingChat(false);
  };

  const scrollToMessage = (messageId: string) => {
    const el = messageRefs.current.get(messageId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.style.transition = "background-color 0.3s ease";
      el.style.backgroundColor = "rgba(249, 115, 22, 0.18)";
      setTimeout(() => { el.style.backgroundColor = ""; }, 1200);
    }
  };

  const onMsgTouchStart = (msg: any, e: React.TouchEvent) => {
    const touch = e.touches[0];
    longPressPos.current = { x: touch.clientX, y: touch.clientY };
    setPressedMsgId(msg.id);
    setSwipeMsg({
      id: msg.id,
      deltaX: 0,
      startX: touch.clientX,
      startY: touch.clientY,
      startTime: Date.now(),
      triggered: false,
      isHorizontal: null,
    });
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
    longPressTimer.current = setTimeout(() => {
      if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(40);
      setPressedMsgId(null);
      const pos = longPressPos.current;
      setContextMenu({ messageId: msg.id, content: msg.content, x: pos?.x ?? touch.clientX, y: pos?.y ?? touch.clientY });
      setSwipeMsg(null);
    }, 300);
  };

  const onMsgTouchMove = (msg: any, e: React.TouchEvent) => {
    if (!swipeMsg || swipeMsg.id !== msg.id) return;
    const touch = e.touches[0];
    const dx = touch.clientX - swipeMsg.startX;
    const dy = touch.clientY - swipeMsg.startY;

    if (Math.abs(dx) > 10 || Math.abs(dy) > 10) {
      if (longPressTimer.current) { clearTimeout(longPressTimer.current); longPressTimer.current = null; }
      setPressedMsgId(null);
    }

    let isHoriz = swipeMsg.isHorizontal;
    if (isHoriz === null && (Math.abs(dx) > 4 || Math.abs(dy) > 4)) {
      isHoriz = Math.abs(dx) > Math.abs(dy);
      if (!isHoriz) { setSwipeMsg(null); return; }
    }
    if (isHoriz === false) { setSwipeMsg(null); return; }

    const clampedDx = Math.max(0, dx);
    let triggered = swipeMsg.triggered;
    if (!triggered && clampedDx >= 60) {
      triggered = true;
      if (longPressTimer.current) { clearTimeout(longPressTimer.current); longPressTimer.current = null; }
      if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(30);
      handleReply(msg.id, msg.content);
    }
    setSwipeMsg({ ...swipeMsg, deltaX: clampedDx, triggered, isHorizontal: isHoriz ?? true });
  };

  const onMsgTouchEnd = (msg: any) => {
    if (longPressTimer.current) { clearTimeout(longPressTimer.current); longPressTimer.current = null; }
    setPressedMsgId(null);
    const snap = swipeMsg;
    if (snap && snap.id === msg.id) {
      const { deltaX, startTime } = snap;
      const wasTap = deltaX < 5 && Date.now() - startTime < 300;
      if (wasTap) {
        if (tapTimer.current) clearTimeout(tapTimer.current);
        setTapReplyId(msg.id);
        tapTimer.current = setTimeout(() => setTapReplyId(null), 2000);
      }
    }
    setSwipeMsg(null);
  };

  const handleRightClick = (msg: any, e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({ messageId: msg.id, content: msg.content, x: e.clientX, y: e.clientY });
  };

  const handleReply = (messageId: string, content: string) => {
    setReplyingTo({ id: messageId, content });
    setContextMenu(null);
    setTimeout(() => messageInputRef.current?.focus(), 50);
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleBlockUser = async () => {
    if (!currentUserId || !targetUserId || blockingUser) return;
    setBlockingUser(true);
    try {
      const res = await fetch("/api/users/block", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blocker_id: currentUserId, blocked_id: targetUserId }),
      });
      const result = await res.json();
      if (result.error) {
        showToast("Hata: " + result.error);
      } else {
        showToast(t.blockSuccess);
        setShowBlockConfirm(false);
        setShowBlockMenu(false);
        setTimeout(() => setMobileView("list"), 1500);
      }
    } catch {
      showToast("Bir hata oluştu");
    }
    setBlockingUser(false);
  };

  const handleUnblock = () => {
    setShowUnblockConfirm(true);
  };

  const handleUnblockConfirm = async () => {
    if (!currentUserId || !targetUserId || unblockingUser) return;
    setUnblockingUser(true);
    try {
      const res = await fetch("/api/users/unblock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blocker_id: currentUserId, blocked_id: targetUserId }),
      });
      const result = await res.json();
      if (!result.error) {
        setBlockStatus(null);
        setShowUnblockConfirm(false);
        showToast(t.unblockSuccess);
      } else {
        showToast("Hata: " + result.error);
      }
    } catch {
      showToast("Bir hata oluştu");
    }
    setUnblockingUser(false);
  };

  const handleReportMessage = async (reason: string) => {
    if (!currentUserId || !reportMenu || submittingReport) return;
    setSubmittingReport(true);
    try {
      const res = await fetch("/api/messages/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reporter_id: currentUserId,
          reported_user_id: targetUserId,
          message_id: reportMenu.msgId,
          message_content: reportMenu.content,
          reason,
        }),
      });
      const result = await res.json();
      if (result.error) {
        showToast("Hata: " + result.error);
      } else {
        showToast(t.reportSuccess);
        setReportMenu(null);
      }
    } catch {
      showToast("Bir hata oluştu");
    }
    setSubmittingReport(false);
  };

  const sendMessage = async () => {
    if (!messageText.trim() || !currentUserId || !targetUserId) return;

    const content = messageText.trim();
    const replyToId = replyingTo?.id ?? null;
    setMessageText("");
    setReplyingTo(null);

    const tempMsg = {
      id: "temp-" + Date.now(),
      sender_id: currentUserId,
      content,
      created_at: new Date().toISOString(),
      reply_to_id: replyToId,
      reply_to: replyToId && replyingTo ? { id: replyingTo.id, content: replyingTo.content } : null,
    };
    setMessages((prev) => [...prev, tempMsg]);

    console.log("Sending message with:", {
      conversationId: realConvId,
      senderId: currentUserId,
      targetUserId: pendingUserId || targetUserId,
      listingId: pendingListingId || targetListingId,
    });

    const res = await fetch("/api/messages/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        conversationId: realConvId,
        senderId: currentUserId,
        content,
        targetUserId: pendingUserId || targetUserId,
        listingId: pendingListingId || targetListingId,
        replyToId,
      }),
    });

    const result = await res.json();

    if (result.error) {
      setMessages((prev) => prev.filter((m) => m.id !== tempMsg.id));
      setMessageText(content);
      if (result.error === "blocked") {
        showToast(t.cannotSendBlocked);
        setBlockStatus("blocker");
      } else {
        showToast("Mesaj gönderilemedi: " + result.error);
      }
      return;
    }

    if (result.conversationId && result.conversationId !== realConvId) {
      setRealConvId(result.conversationId);
    }

    setMessages((prev) =>
      prev.map((m) => (m.id === tempMsg.id ? result.message : m))
    );

    // Update conversation list with latest message
    if (result.conversationId) {
      setEnrichedConvs((prev) => {
        const updated = prev.map((c) =>
          c.id === result.conversationId
            ? {
                ...c,
                lastMessage: {
                  content,
                  created_at: new Date().toISOString(),
                  sender_id: currentUserId!,
                },
                updated_at: new Date().toISOString(),
              }
            : c
        );
        return updated.sort(
          (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
        );
      });
    }
  };

  const [activeListing, setActiveListing] = useState<any>(null);
  const [listingLoading, setListingLoading] = useState(false);
  const userIdRef = useRef<string | null>(null);
  const listingContextRef = useRef<ListingContextData | null>(null);

  useEffect(() => { userIdRef.current = currentUserId; }, [currentUserId]);
  useEffect(() => { listingContextRef.current = listingContext; }, [listingContext]);

  useEffect(() => {
    if (!selectedConv || SYSTEM_CONVS.has(selectedConv)) return;

    let cancelled = false;
    setListingLoading(true);

    fetch("/api/messages/conversation-detail", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        conversationId: selectedConv,
        currentUserId: userIdRef.current || "",
      }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        if (data.listing) {
          setActiveListing(data.listing);
        } else if (listingContextRef.current) {
          setActiveListing(listingContextRef.current);
        }
        setListingLoading(false);
      })
      .catch(() => {
        if (!cancelled) setListingLoading(false);
      });

    return () => { cancelled = true; };
  }, [selectedConv]);

  // Deduplicate: for conversations without listing_id, skip if a better one for same user exists
  const deduplicatedConvs = enrichedConvs.reduce((acc: any[], conv: any) => {
    const otherUserId = conv.user1_id === currentUserId ? conv.user2_id : conv.user1_id;
    if (!conv.listing_id) {
      const existingWithListing = acc.find((c: any) => {
        const otherId = c.user1_id === currentUserId ? c.user2_id : c.user1_id;
        return otherId === otherUserId && c.listing_id;
      });
      if (existingWithListing) return acc;
    }
    return [...acc, conv];
  }, []);

  const globalSorted = [...globalMessages].reverse();
  const isUserConv = selectedConv !== null && !SYSTEM_CONVS.has(selectedConv);
  const activePeerName = (targetProfile?.display_name === "Admin" ? "Sefira Destek" : targetProfile?.display_name) ?? "—";
  const activePeerAvatar = targetProfile?.avatar_url ?? null;

  // Is there already a conversation for this specific user + listing?
  const pendingLid = pendingListingId || targetListingId;
  const targetInList = targetUserId
    ? enrichedConvs.some((c) => {
        const otherId = c.user1_id === currentUserId ? c.user2_id : c.user1_id;
        return otherId === targetUserId && (!pendingLid || c.listing_id === pendingLid);
      })
    : false;

  return (
    <div className="flex flex-col h-screen bg-[#fefaf5]" dir={isFa ? "rtl" : "ltr"}>
      <style>{`
        @keyframes slideUpSheet {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>
      {/* Top header bar */}
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
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="inline-block">
          <Link
            href="/"
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-700 text-white font-bold px-5 py-2.5 rounded-2xl shadow-md transition-colors duration-200"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            <span>{t.home}</span>
          </Link>
        </motion.div>
      </div>

      {/* Main layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* ── Left panel ──────────────────────────────────────────────── */}
        <div
          className={`
            ${mobileView === "chat" ? "hidden" : "flex"} md:flex
            flex-col w-full md:w-[30%] border-r border-gray-100 bg-white overflow-y-auto flex-shrink-0
          `}
        >
          <div className="px-5 py-3 border-b border-gray-100">
            <h2 className="font-bold text-gray-500 text-xs uppercase tracking-wider">
              {t.messages}
            </h2>
          </div>

          {/* Sefira Destek */}
          <button
            onClick={() => {
              window.location.href = "/support-chat";
            }}
            className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-orange-50 transition-colors border-b border-gray-50 active:bg-orange-100"
          >
            <div className="relative flex-shrink-0">
              <div className="w-12 h-12 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                S
              </div>
              {unreadSupportCount > 0 && (
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center">
                <p
                  className={`text-sm ${
                    unreadSupportCount > 0
                      ? "font-extrabold text-gray-900"
                      : "font-bold text-gray-900"
                  }`}
                >
                  {t.supportChannelName}
                </p>
                {chatMessages.length > 0 && (
                  <p className="text-[10px] text-gray-400">
                    {formatTime(chatMessages[chatMessages.length - 1].created_at)}
                  </p>
                )}
              </div>
              <div className="flex items-center justify-between mt-0.5">
                <p
                  className={`text-xs truncate flex-1 ${
                    unreadSupportCount > 0
                      ? "text-gray-700 font-medium"
                      : "text-gray-500"
                  }`}
                >
                  {chatMessages[chatMessages.length - 1]?.message || t.supportWelcome}
                </p>
                {unreadSupportCount > 0 && (
                  <span className="w-5 h-5 bg-orange-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold flex-shrink-0 ml-1">
                    {unreadSupportCount > 9 ? "9+" : unreadSupportCount}
                  </span>
                )}
              </div>
            </div>
          </button>

          {/* Sefira Bildirimleri */}
          <button
            onClick={openNotificationsChannel}
            className={`w-full flex items-center gap-3 px-4 py-3.5 hover:bg-orange-50 transition-colors border-b border-gray-50 active:bg-orange-100 ${
              selectedConv === "sefira-notifications" ? "bg-orange-50" : ""
            }`}
          >
            <div className="relative flex-shrink-0">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white font-black text-lg shadow-sm">
                S
              </div>
              {hasUnreadGlobal && (
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-orange-500 rounded-full border-2 border-white" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center">
                <p
                  className={`text-sm ${
                    hasUnreadGlobal
                      ? "font-extrabold text-gray-900"
                      : "font-bold text-gray-900"
                  }`}
                >
                  {t.channelName}
                </p>
                {lastGlobalMsg && (
                  <p className="text-[10px] text-gray-400">
                    {formatTime(lastGlobalMsg.created_at)}
                  </p>
                )}
              </div>
              <div className="flex items-center justify-between mt-0.5">
                <p
                  className={`text-xs truncate flex-1 ${
                    hasUnreadGlobal ? "text-gray-700 font-medium" : "text-gray-500"
                  }`}
                >
                  {lastGlobalMsg ? lastGlobalMsg.message : t.welcomePreview}
                </p>
                {hasUnreadGlobal && (
                  <div className="w-2 h-2 rounded-full bg-orange-500 flex-shrink-0 ml-1" />
                )}
              </div>
            </div>
          </button>

          {/* URL-param new conversation — shown only if no existing conv for this user+listing */}
          {targetUserId && !targetInList && (
            <button
              onClick={() => {
                setSelectedConv(targetUserId);
                setMobileView("chat");
              }}
              className={`w-full flex items-center gap-3 px-4 py-3.5 hover:bg-orange-50 transition-colors border-b border-gray-50 active:bg-orange-100 ${
                selectedConv === targetUserId ? "bg-orange-50" : ""
              }`}
            >
              <div className="relative flex-shrink-0">
                {listingContext?.photos?.[0] ? (
                  <Image src={listingContext.photos[0]} alt="" width={56} height={56} className="rounded-xl object-cover" />
                ) : (
                  <div className="w-14 h-14 rounded-xl bg-orange-50 flex items-center justify-center text-2xl">🏠</div>
                )}
                <div className="absolute -bottom-1 -right-1">
                  {activePeerAvatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={activePeerAvatar} alt="" className="w-6 h-6 rounded-full border-2 border-white object-cover" />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-orange-400 border-2 border-white flex items-center justify-center text-white text-[10px] font-bold">
                      {activePeerName[0]?.toUpperCase() ?? "?"}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center">
                  <p className="font-bold text-gray-900 text-sm truncate">{activePeerName}</p>
                  <p className="text-[10px] text-orange-400 font-semibold flex-shrink-0 ml-1">{t.newMessage}</p>
                </div>
                {listingContext && (
                  <p className="text-xs text-orange-500 font-medium truncate">
                    🏠 {listingContext.city}{listingContext.district ? ` / ${listingContext.district}` : ""}
                  </p>
                )}
                <p className="text-xs text-gray-400 truncate mt-0.5">
                  {messages.length > 0 ? messages[messages.length - 1].content : t.noMessagesYet}
                </p>
              </div>
            </button>
          )}

          {/* Loaded peer conversations */}
          {deduplicatedConvs.map((conv: any) => {
            const name = (conv.otherUser?.display_name === "Admin" ? "Sefira Destek" : conv.otherUser?.display_name) ?? "Kullanıcı";
            const avatar = conv.otherUser?.avatar_url ?? null;
            const listing = conv.listing ?? null;
            const isSelected = selectedConv === conv.id;
            console.log("Conv listing DEBUG:", {
              convId: conv.id,
              hasListing: !!conv.listing,
              listingId: conv.listing?.id,
              photosArray: conv.listing?.photos,
              firstPhoto: conv.listing?.photos?.[0],
              otherUserId: conv.user1_id === currentUserId ? conv.user2_id : conv.user1_id,
            });
            return (
              <button
                key={conv.id}
                onClick={() => openConversation(conv)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 hover:bg-orange-50 transition-colors border-b border-gray-50 active:bg-orange-100 ${
                  isSelected ? "bg-orange-50" : ""
                }`}
              >
                {/* Listing thumbnail as primary, user avatar as overlay */}
                <div className="relative flex-shrink-0">
                  {listing?.photos?.[0] ? (
                    <Image src={listing.photos[0]} alt="" width={56} height={56} className="rounded-xl object-cover" />
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-orange-50 flex items-center justify-center text-2xl">🏠</div>
                  )}
                  <div className="absolute -bottom-1 -right-1">
                    {avatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={avatar} alt="" className="w-6 h-6 rounded-full border-2 border-white object-cover" />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-orange-400 border-2 border-white flex items-center justify-center text-white text-[10px] font-bold">
                        {name[0]?.toUpperCase() ?? "?"}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <p
                      className={`text-sm truncate ${
                        conv.unreadCount > 0 ? "font-extrabold text-gray-900" : "font-bold text-gray-900"
                      }`}
                    >
                      {name}
                    </p>
                    {conv.lastMessage && (
                      <p className="text-[10px] text-gray-400 flex-shrink-0 ml-1">
                        {formatTime(conv.lastMessage.created_at)}
                      </p>
                    )}
                  </div>
                  {listing && (
                    <p className="text-xs text-orange-500 font-medium truncate">
                      🏠 {listing.city}{listing.district ? ` / ${listing.district}` : ""}
                    </p>
                  )}
                  <p
                    className={`text-xs truncate mt-0.5 ${
                      conv.unreadCount > 0 ? "text-gray-700 font-medium" : "text-gray-500"
                    }`}
                  >
                    {conv.lastMessage?.content ?? t.noMessagesYet}
                  </p>
                </div>
                {conv.unreadCount > 0 && (
                  <span className="w-5 h-5 bg-orange-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold flex-shrink-0">
                    {conv.unreadCount > 9 ? "9+" : conv.unreadCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ── Right panel ─────────────────────────────────────────────── */}
        <div
          className={`${
            mobileView === "list" ? "hidden" : "flex"
          } md:flex flex-col flex-1 overflow-hidden`}
          style={{ background: "linear-gradient(135deg, #fafafa 0%, #ffedd5 100%)" }}
        >
          {isUserConv ? (
            /* ── Peer chat ── */
            <>
              {/* Chat header */}
              <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-100 shadow-sm flex-shrink-0">
                <button
                  onClick={() => setMobileView("list")}
                  className="md:hidden w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 text-lg font-bold"
                >
                  ←
                </button>
                {activePeerAvatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={activePeerAvatar}
                    alt=""
                    className="w-10 h-10 rounded-full object-cover border-2 border-orange-200"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center font-bold text-orange-500">
                    {activePeerName[0]?.toUpperCase() ?? "?"}
                  </div>
                )}
                <div className="flex-1">
                  <p className="font-bold text-gray-900 text-sm">
                    {activePeerName || "Kullanıcı"}
                  </p>
                  <p className="text-xs text-green-500">● Çevrimiçi</p>
                </div>
                {/* Three-dot menu button */}
                <div>
                  <button
                    ref={blockMenuBtnRef}
                    type="button"
                    onClick={() => {
                      const btn = blockMenuBtnRef.current?.getBoundingClientRect();
                      if (btn) {
                        const menuWidth = 220;
                        const padding = 12;
                        let left = btn.right - menuWidth;
                        if (left < padding) left = padding;
                        if (left + menuWidth > window.innerWidth - padding) {
                          left = window.innerWidth - menuWidth - padding;
                        }
                        setBlockMenuPos({ top: btn.bottom + 8, left });
                      }
                      setShowBlockMenu((v) => !v);
                    }}
                    className="w-9 h-9 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100 active:bg-gray-200 transition-colors text-xl font-bold"
                    aria-label="More options"
                  >
                    ⋮
                  </button>
                  {showBlockMenu && (
                    <>
                      <div style={{ position: "fixed", inset: 0, zIndex: 99998 }} onClick={() => setShowBlockMenu(false)} />
                      <div
                        style={{
                          position: "fixed",
                          top: blockMenuPos.top,
                          left: blockMenuPos.left,
                          width: 220,
                          zIndex: 99999,
                          background: "white",
                          borderRadius: 16,
                          boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
                          overflow: "hidden",
                          direction: isFa ? "rtl" : "ltr",
                        }}
                      >
                        {blockStatus === "blocker" ? (
                          <button
                            type="button"
                            onClick={() => { setShowBlockMenu(false); setShowUnblockConfirm(true); }}
                            style={{ width: "100%", display: "flex", alignItems: "center", flexDirection: isFa ? "row-reverse" : "row", gap: 10, padding: "14px 18px", fontSize: 14, fontWeight: 600, color: "#f97316", background: "none", border: "none", cursor: "pointer", textAlign: isFa ? "right" : "left", whiteSpace: "nowrap" }}
                          >
                            {t.unblock}
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => { setShowBlockMenu(false); setShowBlockConfirm(true); }}
                            style={{ width: "100%", display: "flex", alignItems: "center", flexDirection: isFa ? "row-reverse" : "row", gap: 10, padding: "14px 18px", fontSize: 14, fontWeight: 600, color: "#ef4444", background: "none", border: "none", cursor: "pointer", textAlign: isFa ? "right" : "left", whiteSpace: "nowrap" }}
                          >
                            {t.blockUser}
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setShowBlockMenu(false)}
                          style={{ width: "100%", display: "flex", alignItems: "center", flexDirection: isFa ? "row-reverse" : "row", gap: 10, padding: "14px 18px", fontSize: 14, fontWeight: 600, color: "#6b7280", background: "none", borderTop: "1px solid #f3f4f6", cursor: "pointer", textAlign: isFa ? "right" : "left", whiteSpace: "nowrap" }}
                        >
                          {t.close}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Listing context card — fetched on-demand per conversation */}
              {listingLoading && !activeListing && (
                <div className="mx-3 mt-3 mb-2 h-20 bg-orange-100 animate-pulse rounded-2xl flex-shrink-0" />
              )}
              {activeListing && (
                <div
                  onClick={() => router.push(`/listings/${activeListing.id}`)}
                  className="mx-3 mt-3 mb-2 cursor-pointer active:scale-[0.98] transition-transform flex-shrink-0"
                >
                  <div className="flex items-center gap-3 bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl p-3 shadow-lg">
                    {activeListing.photos?.[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={activeListing.photos[0]}
                        className="w-16 h-16 rounded-xl object-cover flex-shrink-0 border-2 border-white/30"
                        alt=""
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-white/20 flex items-center justify-center text-3xl flex-shrink-0">
                        🏠
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-white/80 text-[10px] font-bold uppercase tracking-wide mb-0.5">
                        💬 Bu ilan hakkında konuşuyorsunuz
                      </p>
                      <p className="font-bold text-white text-sm truncate">
                        {activeListing.city}
                        {activeListing.district ? ` / ${activeListing.district}` : ""}
                      </p>
                      <p className="text-white font-bold text-sm">
                        {activeListing.rent?.toLocaleString()} {activeListing.currency}/ay
                      </p>
                      <p className="text-white/70 text-xs">
                        {activeListing.house_type}
                        {activeListing.rooms ? ` • ${activeListing.rooms} oda` : ""}
                        {" "}• Detay için tıkla →
                      </p>
                    </div>
                    <span className="text-white/80 text-xl flex-shrink-0">›</span>
                  </div>
                </div>
              )}

              {/* Block status banners */}
              {blockStatus === "blocker" && (
                <div className="mx-3 mt-2 mb-1 flex items-center justify-between bg-orange-50 border border-orange-200 rounded-xl px-4 py-2.5 flex-shrink-0">
                  <p className="text-sm text-orange-700 font-medium">{t.blockedByYouBanner}</p>
                  <button
                    type="button"
                    onClick={handleUnblock}
                    className="text-xs font-bold text-orange-600 bg-orange-100 hover:bg-orange-200 active:bg-orange-300 px-3 py-1.5 rounded-lg transition-colors ml-3 flex-shrink-0"
                  >
                    {t.unblock}
                  </button>
                </div>
              )}
              {blockStatus === "blocked" && (
                <div className="mx-3 mt-2 mb-1 flex items-center bg-gray-100 border border-gray-200 rounded-xl px-4 py-2.5 flex-shrink-0">
                  <p className="text-sm text-gray-500 font-medium">{t.blockedByThemBanner}</p>
                </div>
              )}

              {/* Messages area */}
              <div
                className="flex-1 overflow-y-auto py-4"
                style={{ direction: "ltr", overflowX: "hidden" }}
              >
                {messages.length === 0 && (
                  <div className="text-center py-10 text-gray-400 text-sm">
                    {t.noMessagesYet}
                  </div>
                )}
                {messages.map((msg) => {
                  const isMe = msg.sender_id === currentUserId;
                  const setRef = (el: HTMLDivElement | null) => {
                    if (el) messageRefs.current.set(msg.id, el);
                    else messageRefs.current.delete(msg.id);
                  };
                  const isSwiping = swipeMsg?.id === msg.id;
                  const swipeDelta = isSwiping ? Math.min(swipeMsg!.deltaX * 0.4, 40) : 0;
                  const swipeOpacity = isSwiping ? Math.min(swipeMsg!.deltaX / 60, 1) : 0;
                  const isPressed = pressedMsgId === msg.id && !isSwiping;
                  return isMe ? (
                    <div
                      key={msg.id}
                      ref={setRef}
                      className="flex justify-end mb-3 px-4 relative"
                      onContextMenu={(e) => handleRightClick(msg, e)}
                    >
                      {/* Reply icon fades in on left as bubble slides right */}
                      <div
                        aria-hidden="true"
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-500 text-base pointer-events-none select-none"
                        style={{ opacity: swipeOpacity, transition: isSwiping ? "none" : "opacity 0.2s ease" }}
                      >
                        ↩
                      </div>
                      {/* Tap-to-reply floating button */}
                      {tapReplyId === msg.id && (
                        <button
                          type="button"
                          onClick={() => { handleReply(msg.id, msg.content); setTapReplyId(null); }}
                          className="absolute left-10 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white shadow-lg border border-orange-200 flex items-center justify-center text-orange-500 text-base z-10"
                        >
                          ↩
                        </button>
                      )}
                      <div
                        className="max-w-[75%]"
                        style={{
                          transform: `translateX(${swipeDelta}px) scale(${isPressed ? 0.97 : 1})`,
                          transition: isSwiping ? "none" : isPressed ? "transform 0.1s ease" : "transform 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                          willChange: "transform",
                        }}
                        onTouchStart={(e) => onMsgTouchStart(msg, e)}
                        onTouchMove={(e) => onMsgTouchMove(msg, e)}
                        onTouchEnd={() => onMsgTouchEnd(msg)}
                      >
                        <div className="bg-gradient-to-br from-orange-500 to-amber-500 text-white px-4 py-2.5 rounded-2xl rounded-tr-sm shadow-sm">
                          {msg.reply_to && (
                            <button
                              type="button"
                              onClick={() => scrollToMessage(msg.reply_to.id)}
                              className="w-full text-left mb-2 px-2.5 py-1.5 text-xs text-white/80 truncate block"
                              style={{ background: "rgba(255,255,255,0.2)", borderLeft: "3px solid rgba(255,255,255,0.6)", borderRadius: "8px" }}
                            >
                              {msg.reply_to.content.slice(0, 50)}
                            </button>
                          )}
                          <p className="text-sm leading-relaxed" dir="auto">
                            {msg.content}
                          </p>
                        </div>
                        <p className="text-right text-[10px] text-gray-400 mt-1 mr-1">
                          {formatTime(msg.created_at)}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div
                      key={msg.id}
                      ref={setRef}
                      className="flex items-end gap-2 mb-3 px-4 relative"
                      onContextMenu={(e) => handleRightClick(msg, e)}
                    >
                      {activePeerAvatar ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={activePeerAvatar}
                          alt=""
                          className="w-7 h-7 rounded-full object-cover flex-shrink-0"
                        />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-500 flex-shrink-0">
                          {activePeerName[0]?.toUpperCase() ?? "?"}
                        </div>
                      )}
                      {/* Reply icon appears between avatar and bubble */}
                      <div
                        aria-hidden="true"
                        className="absolute left-12 bottom-3 w-7 h-7 rounded-full bg-orange-100 flex items-center justify-center text-orange-500 text-sm pointer-events-none select-none"
                        style={{ opacity: swipeOpacity, transition: isSwiping ? "none" : "opacity 0.2s ease" }}
                      >
                        ↩
                      </div>
                      {/* Tap-to-reply floating button */}
                      {tapReplyId === msg.id && (
                        <button
                          type="button"
                          onClick={() => { handleReply(msg.id, msg.content); setTapReplyId(null); }}
                          className="absolute right-4 bottom-3 w-8 h-8 rounded-full bg-white shadow-lg border border-orange-200 flex items-center justify-center text-orange-500 text-base z-10"
                        >
                          ↩
                        </button>
                      )}
                      <div
                        className="max-w-[75%]"
                        style={{
                          transform: `translateX(${swipeDelta}px) scale(${isPressed ? 0.97 : 1})`,
                          transition: isSwiping ? "none" : isPressed ? "transform 0.1s ease" : "transform 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                          willChange: "transform",
                        }}
                        onTouchStart={(e) => onMsgTouchStart(msg, e)}
                        onTouchMove={(e) => onMsgTouchMove(msg, e)}
                        onTouchEnd={() => onMsgTouchEnd(msg)}
                      >
                        <div className="bg-white text-gray-800 px-4 py-2.5 rounded-2xl rounded-tl-sm shadow-sm border border-gray-100">
                          {msg.reply_to && (
                            <button
                              type="button"
                              onClick={() => scrollToMessage(msg.reply_to.id)}
                              className="w-full text-left mb-2 px-2.5 py-1.5 text-xs text-gray-500 truncate block"
                              style={{ background: "rgba(249,115,22,0.08)", borderLeft: "3px solid #f97316", borderRadius: "8px" }}
                            >
                              {msg.reply_to.content.slice(0, 50)}
                            </button>
                          )}
                          <p className="text-sm leading-relaxed" dir="auto">
                            {msg.content}
                          </p>
                        </div>
                        <p className="text-[10px] text-gray-400 mt-1 ml-1">
                          {formatTime(msg.created_at)}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Reply preview bar and message input — hidden when blocked */}
              {!blockStatus && (
                <>
                  {/* Reply preview bar — slides up when replying */}
                  <div
                    className="flex-shrink-0 overflow-hidden"
                    style={{ maxHeight: replyingTo ? "72px" : "0", transition: "max-height 0.2s ease" }}
                  >
                    {replyingTo && (
                      <div
                        className="mx-3 mb-2 bg-white rounded-xl shadow-sm flex items-center gap-2 px-3 py-2"
                        style={{ borderLeft: "4px solid #f97316" }}
                      >
                        <span className="text-orange-500 text-base flex-shrink-0">↩</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] font-semibold text-orange-500">{t.replyingTo}:</p>
                          <p className="text-xs text-gray-500 truncate">{replyingTo.content.slice(0, 50)}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setReplyingTo(null)}
                          className="w-6 h-6 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 text-xs font-bold flex-shrink-0 hover:bg-gray-200 active:scale-95 transition-all"
                        >
                          ✕
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Message input */}
                  <div className="bg-white border-t border-gray-100 px-4 py-3 flex items-center gap-3 shadow-lg flex-shrink-0">
                    <div className="flex-1 flex items-center bg-gray-100 rounded-2xl px-4 py-2.5 gap-2">
                      <input
                        ref={messageInputRef}
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            sendMessage();
                          }
                        }}
                        placeholder={t.typeMessage}
                        dir="auto"
                        className="flex-1 bg-transparent text-sm text-gray-800 focus:outline-none placeholder-gray-400"
                      />
                    </div>
                    <button
                      onClick={sendMessage}
                      disabled={!messageText.trim() || sendingMessage}
                      className="w-11 h-11 rounded-full flex items-center justify-center transition-all shadow-md bg-gradient-to-br from-orange-500 to-amber-500 text-white disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
                    >
                      <SendIcon />
                    </button>
                  </div>
                </>
              )}
            </>
          ) : selectedConv === "sefira-destek" ? (
            /* ── Support chat ── */
            <>
              <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-100 shadow-sm flex-shrink-0">
                <button
                  onClick={() => setMobileView("list")}
                  className="md:hidden w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 text-lg font-bold"
                >
                  ←
                </button>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-700 flex items-center justify-center text-white font-black text-xs shadow-sm flex-shrink-0">
                  SD
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-sm">{t.supportChannelName}</p>
                  <p className="text-xs text-green-500">● Çevrimiçi</p>
                </div>
              </div>
              <div
                className="flex-1 overflow-y-auto px-4 py-5 flex flex-col gap-3"
                style={{ direction: "ltr" }}
              >
                <div className="flex items-end gap-2">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-orange-400 to-orange-700 flex items-center justify-center text-white font-black text-xs flex-shrink-0 shadow-sm">
                    SD
                  </div>
                  <div className="max-w-[75%]">
                    <div className="bg-white text-gray-800 px-4 py-2.5 rounded-2xl rounded-tl-sm shadow-sm border border-gray-100">
                      <p dir="auto" className="text-sm leading-relaxed">
                        {t.supportWelcome}
                      </p>
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1 ml-1">Sefira</p>
                  </div>
                </div>
                {chatMessages.map((msg) => {
                  const isUser = msg.sender === "user";
                  return isUser ? (
                    <div key={msg.id} className="flex justify-end">
                      <div className="max-w-[75%]">
                        <div className="bg-gradient-to-br from-orange-500 to-amber-500 text-white px-4 py-2.5 rounded-2xl rounded-tr-sm shadow-sm">
                          <p dir="auto" className="text-sm leading-relaxed whitespace-pre-line">
                            {msg.message}
                          </p>
                        </div>
                        <p className="text-right text-[10px] text-gray-400 mt-1 mr-1">
                          {formatTime(msg.created_at)}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div key={msg.id} className="flex items-end gap-2">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-orange-400 to-orange-700 flex items-center justify-center text-white font-black text-xs flex-shrink-0 shadow-sm">
                        SD
                      </div>
                      <div className="max-w-[75%]">
                        <div className="bg-white text-gray-800 px-4 py-2.5 rounded-2xl rounded-tl-sm shadow-sm border border-gray-100">
                          <p dir="auto" className="text-sm leading-relaxed whitespace-pre-line">
                            {msg.message}
                          </p>
                        </div>
                        <p className="text-[10px] text-gray-400 mt-1 ml-1">
                          {formatTime(msg.created_at)}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={chatBottomRef} />
              </div>
              <div className="bg-white border-t border-gray-100 px-4 py-3 flex items-center gap-3 shadow-lg flex-shrink-0">
                <div className="flex-1 flex items-center bg-gray-100 rounded-2xl px-4 py-2.5 gap-2">
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
                    className="flex-1 bg-transparent text-sm text-gray-800 focus:outline-none placeholder-gray-400"
                  />
                </div>
                <button
                  onClick={handleSendChat}
                  disabled={!chatInput.trim() || sendingChat}
                  className="w-11 h-11 rounded-full flex items-center justify-center transition-all shadow-md bg-gradient-to-br from-orange-500 to-amber-500 text-white disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
                >
                  <SendIcon />
                </button>
              </div>
            </>
          ) : selectedConv === "sefira-notifications" ? (
            /* ── Notifications channel ── */
            <>
              <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-100 shadow-sm flex-shrink-0">
                <button
                  onClick={() => setMobileView("list")}
                  className="md:hidden w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 text-lg font-bold"
                >
                  ←
                </button>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white font-black shadow-sm flex-shrink-0">
                  S
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-sm">{t.channelName}</p>
                  <p className="text-xs text-green-500">● Sefira</p>
                </div>
              </div>
              <div
                className="flex-1 overflow-y-auto px-4 py-5 flex flex-col gap-3"
                style={{ direction: "ltr" }}
              >
                <div className="flex items-end gap-2">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white font-black text-sm flex-shrink-0 shadow-sm">
                    S
                  </div>
                  <div className="max-w-[75%]">
                    <div className="bg-white text-gray-800 px-4 py-2.5 rounded-2xl rounded-tl-sm shadow-sm border border-gray-100">
                      <p className="text-sm leading-relaxed whitespace-pre-line">
                        {t.welcomeMessage}
                      </p>
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1 ml-1">Sefira</p>
                  </div>
                </div>
                {globalSorted.map((msg) => (
                  <div key={msg.id} className="flex items-end gap-2">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white font-black text-sm flex-shrink-0 shadow-sm">
                      S
                    </div>
                    <div className="max-w-[75%]">
                      <div className="bg-white text-gray-800 px-4 py-2.5 rounded-2xl rounded-tl-sm shadow-sm border border-gray-100">
                        <p className="text-xs font-bold text-orange-500 mb-1">{msg.title}</p>
                        <p className="text-sm leading-relaxed whitespace-pre-line">
                          {msg.message}
                        </p>
                      </div>
                      <p className="text-[10px] text-gray-400 mt-1 ml-1">
                        {formatTime(msg.created_at)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="bg-white border-t border-gray-100 px-4 py-3 flex-shrink-0">
                <p className="text-xs text-gray-400 text-center">{t.systemMessage}</p>
              </div>
            </>
          ) : (
            /* ── Nothing selected ── */
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
                <p className="text-gray-500 text-sm">{t.noConversation}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Context menu backdrop */}
      {contextMenu && (
        <div
          className="fixed inset-0 z-[998]"
          onClick={() => setContextMenu(null)}
        />
      )}

      {/* Context menu floating pill */}
      {contextMenu && (
        <div
          className="fixed z-[999] animate-in fade-in duration-150"
          style={{
            top: Math.max(8, contextMenu.y - 60),
            left: Math.min(Math.max(8, contextMenu.x - 100), (typeof window !== "undefined" ? window.innerWidth : 400) - 210),
          }}
        >
          <div className="flex items-center bg-[#1f2937] rounded-[20px] shadow-2xl overflow-hidden">
            <button
              type="button"
              onClick={() => handleReply(contextMenu.messageId, contextMenu.content)}
              className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold text-white active:bg-white/10 transition-colors whitespace-nowrap"
            >
              ↩ {t.reply}
            </button>
            <div className="w-px h-5 bg-white/20 flex-shrink-0" />
            <button
              type="button"
              onClick={() => { setReportMenu({ msgId: contextMenu.messageId, content: contextMenu.content }); setContextMenu(null); }}
              className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold text-orange-400 active:bg-white/10 transition-colors whitespace-nowrap"
            >
              {t.report}
            </button>
          </div>
        </div>
      )}

      {/* Block user confirmation dialog */}
      {showBlockConfirm && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.55)" }}
          onClick={() => setShowBlockConfirm(false)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-base font-bold text-gray-800 text-center mb-6">
              {t.blockConfirm}
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowBlockConfirm(false)}
                className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50 active:scale-95 transition-all"
              >
                {t.cancel}
              </button>
              <button
                type="button"
                onClick={handleBlockUser}
                disabled={blockingUser}
                className="flex-1 py-3 rounded-xl bg-red-500 text-white font-bold text-sm hover:bg-red-600 active:scale-95 transition-all disabled:opacity-50"
              >
                {blockingUser ? "..." : t.confirm}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Unblock confirmation dialog */}
      {showUnblockConfirm && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.55)" }}
          onClick={() => setShowUnblockConfirm(false)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-base font-bold text-gray-800 text-center mb-6">
              {t.unblockConfirm}
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowUnblockConfirm(false)}
                className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50 active:scale-95 transition-all"
              >
                {t.cancel}
              </button>
              <button
                type="button"
                onClick={handleUnblockConfirm}
                disabled={unblockingUser}
                className="flex-1 py-3 rounded-xl bg-orange-500 text-white font-bold text-sm hover:bg-orange-600 active:scale-95 transition-all disabled:opacity-50"
              >
                {unblockingUser ? "..." : t.unblock}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report message bottom sheet */}
      {reportMenu && (
        <div
          className="fixed inset-0 z-[200] flex items-end justify-center"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          onClick={() => setReportMenu(null)}
        >
          <div
            className="bg-white w-full max-w-lg shadow-2xl"
            style={{ borderRadius: "24px 24px 0 0", animation: "slideUpSheet 0.3s ease-out" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Handle bar */}
            <div style={{ width: 40, height: 4, background: "#d1d5db", borderRadius: 2, margin: "12px auto 0" }} />
            {/* Title */}
            <p style={{ fontWeight: 700, fontSize: 18, textAlign: "center", margin: "16px 0 0", color: "#111827" }}>
              {t.report}
            </p>
            {/* Divider */}
            <div style={{ height: 1, background: "#e5e7eb", margin: "16px 0 0" }} />
            {/* Reason options */}
            {[
              { key: "inappropriate", label: t.reportInappropriate, icon: "🔞" },
              { key: "spam", label: t.reportSpam, icon: "📢" },
              { key: "insult", label: t.reportInsult, icon: "💢" },
              { key: "other", label: t.reportOther, icon: "📝" },
            ].map(({ key, label, icon }, idx, arr) => (
              <button
                key={key}
                type="button"
                disabled={submittingReport}
                onClick={() => handleReportMessage(key)}
                className="w-full flex items-center text-gray-800 active:bg-orange-50 transition-colors disabled:opacity-50"
                style={{
                  height: 56,
                  padding: "0 20px",
                  fontSize: 16,
                  fontWeight: 500,
                  gap: 12,
                  borderBottom: idx < arr.length - 1 ? "1px solid #f3f4f6" : "none",
                }}
              >
                <span style={{ fontSize: 20, flexShrink: 0 }}>{icon}</span>
                <span>{label}</span>
              </button>
            ))}
            {/* Cancel button */}
            <div style={{ padding: "8px 16px 32px" }}>
              <button
                type="button"
                onClick={() => setReportMenu(null)}
                className="w-full font-bold text-gray-700 active:bg-gray-200 transition-colors"
                style={{ background: "#f3f4f6", borderRadius: 16, height: 52, fontSize: 16 }}
              >
                {t.cancel}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast notification */}
      {toastMsg && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[300] pointer-events-none">
          <div className="bg-gray-900 text-white text-sm font-semibold px-5 py-3 rounded-2xl shadow-2xl whitespace-nowrap">
            {toastMsg}
          </div>
        </div>
      )}
    </div>
  );
}

export default function MessagesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#fefaf5]">
          <div className="w-10 h-10 border-4 border-orange-400 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <MessagesPageContent />
    </Suspense>
  );
}
