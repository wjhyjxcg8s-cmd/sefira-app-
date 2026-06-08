"use client";

import Link from "next/link";
import { useLang } from "@/app/lib/LangContext";

const COOKIES_CONTENT: Record<string, {
  title: string;
  lastUpdated: string;
  backButton: string;
  sections: { heading: string; content: string | { label: string; text: string }[] | string[] }[];
  contactEmail: string;
  contactWebsite: string;
  contactLabel: string;
  websiteLabel: string;
}> = {
  fa: {
    title: "سیاست استفاده از کوکی‌ها",
    lastUpdated: "آخرین بروزرسانی: ژوئن ۲۰۲۶",
    backButton: "← بازگشت به صفحه اصلی",
    contactLabel: "ایمیل",
    websiteLabel: "وب‌سایت",
    sections: [
      {
        heading: "۱. کوکی چیست؟",
        content:
          "کوکی‌ها فایل‌های کوچک متنی هستند که هنگام بازدید از وب‌سایت سفیرا روی دستگاه شما ذخیره می‌شوند. این فایل‌ها به ما کمک می‌کنند تجربه‌ای شخصی‌سازی‌شده و روان‌تر برای شما فراهم کنیم، ترجیحات شما را به یاد بیاوریم و عملکرد سایت را بهبود دهیم.",
      },
      {
        heading: "۲. انواع کوکی‌هایی که استفاده می‌کنیم",
        content: [
          { label: "الف) کوکی‌های ضروری", text: "این کوکی‌ها برای عملکرد اصلی وب‌سایت ضروری هستند و نمی‌توان آن‌ها را غیرفعال کرد. شامل حفظ وضعیت ورود به سیستم، ذخیره تنظیمات امنیتی و مدیریت جلسه کاربری می‌شوند." },
          { label: "ب) کوکی‌های عملکردی", text: "این کوکی‌ها ترجیحات شما مانند زبان انتخابی، واحد پول و تنظیمات نمایش را ذخیره می‌کنند تا در بازدیدهای بعدی نیازی به تنظیم مجدد نداشته باشید." },
          { label: "ج) کوکی‌های تحلیلی", text: "از این کوکی‌ها برای درک نحوه استفاده بازدیدکنندگان از سایت استفاده می‌کنیم. اطلاعات جمع‌آوری‌شده کاملاً ناشناس است و به بهبود خدمات ما کمک می‌کند. ابزارهایی مانند Google Analytics ممکن است در این دسته قرار گیرند." },
          { label: "د) کوکی‌های بازاریابی", text: "این کوکی‌ها برای نمایش تبلیغات مرتبط و شخصی‌سازی‌شده استفاده می‌شوند. ما اطلاعات شما را با شرکای تبلیغاتی معتمد به اشتراک می‌گذاریم، اما هرگز اطلاعات شخصی قابل شناسایی را بدون رضایت شما منتقل نمی‌کنیم." },
        ],
      },
      {
        heading: "۳. کوکی‌های شخص ثالث",
        content: "برخی از ویژگی‌های سایت ما از سرویس‌های شخص ثالث استفاده می‌کنند که ممکن است کوکی‌های خود را تنظیم کنند. این سرویس‌ها شامل موارد زیر می‌شوند:\n• Google Analytics — تحلیل رفتار کاربران\n• Stripe — پردازش پرداخت امن\n• Supabase — احراز هویت و ذخیره‌سازی داده\n• Cloudflare — امنیت و بهینه‌سازی عملکرد\nاین شرکت‌ها دارای سیاست حریم خصوصی مستقل هستند و ما مسئولیتی در قبال کوکی‌های آن‌ها نداریم.",
      },
      {
        heading: "۴. مدت نگهداری کوکی‌ها",
        content:
          "کوکی‌های جلسه‌ای (Session Cookies) پس از بستن مرورگر به‌طور خودکار حذف می‌شوند. کوکی‌های دائمی (Persistent Cookies) برای مدت مشخصی — معمولاً بین ۳۰ روز تا ۲ سال — روی دستگاه شما باقی می‌مانند، مگر اینکه خودتان آن‌ها را زودتر حذف کنید.",
      },
      {
        heading: "۵. مدیریت و غیرفعال‌سازی کوکی‌ها",
        content:
          "شما می‌توانید از طریق تنظیمات مرورگر خود، کوکی‌ها را مدیریت یا حذف کنید. توجه داشته باشید که غیرفعال کردن برخی کوکی‌ها ممکن است عملکرد سایت را تحت تأثیر قرار دهد. راهنمای مدیریت کوکی در مرورگرهای مختلف:\n• Google Chrome: تنظیمات ← حریم خصوصی و امنیت ← کوکی‌ها\n• Mozilla Firefox: تنظیمات ← حریم خصوصی و امنیت\n• Safari: ترجیحات ← حریم خصوصی\n• Microsoft Edge: تنظیمات ← کوکی‌ها و مجوزهای سایت",
      },
      {
        heading: "۶. رضایت شما",
        content:
          "با ادامه استفاده از سایت سفیرا، شما با استفاده از کوکی‌های ضروری موافقت می‌کنید. برای سایر دسته‌بندی‌های کوکی، از شما رضایت صریح دریافت خواهیم کرد. می‌توانید در هر زمان رضایت خود را پس بگیرید؛ این کار هیچ تأثیری بر قانونی بودن پردازش‌های انجام‌شده پیش از آن ندارد.",
      },
      {
        heading: "۷. تغییرات در سیاست کوکی",
        content:
          "ما این سیاست را ممکن است به‌روزرسانی کنیم تا منعکس‌کننده تغییرات در فناوری، قوانین یا خدمات ما باشد. تاریخ «آخرین بروزرسانی» در بالای این صفحه را دنبال کنید. استفاده مداوم از سایت پس از انتشار تغییرات به منزله پذیرش آن‌ها تلقی می‌شود.",
      },
      {
        heading: "۸. تماس با ما",
        content:
          "اگر سؤالی درباره سیاست کوکی‌های ما دارید، می‌توانید از طریق راه‌های زیر با ما در تماس باشید:",
      },
    ],
    contactEmail: "support@getsefira.com",
    contactWebsite: "www.getsefira.com",
  },

  tr: {
    title: "Çerez Politikası",
    lastUpdated: "Son güncelleme: Haziran 2026",
    backButton: "← Ana Sayfaya Dön",
    contactLabel: "E-posta",
    websiteLabel: "Web sitesi",
    sections: [
      {
        heading: "1. Çerez Nedir?",
        content:
          "Çerezler, Sefira web sitesini ziyaret ettiğinizde cihazınıza kaydedilen küçük metin dosyalarıdır. Bu dosyalar, size kişiselleştirilmiş ve akıcı bir deneyim sunmamıza, tercihlerinizi hatırlamamıza ve sitenin performansını iyileştirmemize yardımcı olur.",
      },
      {
        heading: "2. Kullandığımız Çerez Türleri",
        content: [
          { label: "a) Zorunlu Çerezler", text: "Bu çerezler web sitesinin temel işlevleri için gereklidir ve devre dışı bırakılamazlar. Oturum açma durumunun korunması, güvenlik ayarlarının saklanması ve kullanıcı oturumunun yönetilmesini kapsar." },
          { label: "b) İşlevsel Çerezler", text: "Bu çerezler, seçili dil, para birimi ve görüntüleme ayarları gibi tercihlerinizi saklayarak sonraki ziyaretlerinizde yeniden yapılandırma ihtiyacını ortadan kaldırır." },
          { label: "c) Analitik Çerezler", text: "Bu çerezleri, ziyaretçilerin siteyi nasıl kullandığını anlamak için kullanıyoruz. Toplanan bilgiler tamamen anonimdir ve hizmetlerimizi geliştirmemize yardımcı olur. Google Analytics gibi araçlar bu kategoriye girebilir." },
          { label: "d) Pazarlama Çerezleri", text: "Bu çerezler, ilgili ve kişiselleştirilmiş reklamlar göstermek için kullanılır. Bilgilerinizi güvenilir reklam ortaklarıyla paylaşıyoruz; ancak onayınız olmadan kişisel tanımlayıcı bilgileri hiçbir zaman aktarmıyoruz." },
        ],
      },
      {
        heading: "3. Üçüncü Taraf Çerezleri",
        content:
          "Sitemizin bazı özellikleri, kendi çerezlerini ayarlayabilecek üçüncü taraf hizmetlerini kullanır. Bu hizmetler şunlardır:\n• Google Analytics — Kullanıcı davranışı analizi\n• Stripe — Güvenli ödeme işleme\n• Supabase — Kimlik doğrulama ve veri depolama\n• Cloudflare — Güvenlik ve performans optimizasyonu\nBu şirketlerin bağımsız gizlilik politikaları vardır ve çerezlerinden sorumlu değiliz.",
      },
      {
        heading: "4. Çerezlerin Saklama Süresi",
        content:
          "Oturum çerezleri (Session Cookies) tarayıcınızı kapattığınızda otomatik olarak silinir. Kalıcı çerezler (Persistent Cookies) genellikle 30 gün ile 2 yıl arasında belirli bir süre cihazınızda kalır; ancak siz daha önce silmedikçe.",
      },
      {
        heading: "5. Çerezlerin Yönetimi ve Devre Dışı Bırakılması",
        content:
          "Tarayıcı ayarlarınız üzerinden çerezleri yönetebilir veya silebilirsiniz. Bazı çerezleri devre dışı bırakmanın sitenin işlevselliğini etkileyebileceğini unutmayın. Farklı tarayıcılarda çerez yönetimi rehberi:\n• Google Chrome: Ayarlar → Gizlilik ve Güvenlik → Çerezler\n• Mozilla Firefox: Ayarlar → Gizlilik ve Güvenlik\n• Safari: Tercihler → Gizlilik\n• Microsoft Edge: Ayarlar → Çerezler ve Site İzinleri",
      },
      {
        heading: "6. Onayınız",
        content:
          "Sefira sitesini kullanmaya devam ederek zorunlu çerezlerin kullanımını kabul etmiş olursunuz. Diğer çerez kategorileri için açık onayınızı alacağız. İstediğiniz zaman onayınızı geri alabilirsiniz; bu, öncesinde gerçekleştirilen işlemlerin yasallığını etkilemez.",
      },
      {
        heading: "7. Çerez Politikasındaki Değişiklikler",
        content:
          "Bu politikayı teknoloji, mevzuat veya hizmetlerimizdeki değişiklikleri yansıtmak amacıyla güncelleyebiliriz. Bu sayfanın üstündeki 'Son güncelleme' tarihini takip edin. Değişikliklerin yayınlanmasından sonra siteyi kullanmaya devam etmeniz, bu değişiklikleri kabul ettiğiniz anlamına gelir.",
      },
      {
        heading: "8. Bize Ulaşın",
        content:
          "Çerez politikamız hakkında sorularınız varsa aşağıdaki kanallar aracılığıyla bizimle iletişime geçebilirsiniz:",
      },
    ],
    contactEmail: "support@getsefira.com",
    contactWebsite: "www.getsefira.com",
  },

  en: {
    title: "Cookie Policy",
    lastUpdated: "Last updated: June 2026",
    backButton: "← Back to Home",
    contactLabel: "Email",
    websiteLabel: "Website",
    sections: [
      {
        heading: "1. What Are Cookies?",
        content:
          "Cookies are small text files stored on your device when you visit the Sefira website. They help us provide a personalised and seamless experience, remember your preferences, and improve the performance of our site.",
      },
      {
        heading: "2. Types of Cookies We Use",
        content: [
          { label: "a) Essential Cookies", text: "These cookies are necessary for the core functionality of the website and cannot be disabled. They cover maintaining login state, storing security settings, and managing user sessions." },
          { label: "b) Functional Cookies", text: "These cookies store your preferences such as selected language, currency unit, and display settings so you do not need to reconfigure them on return visits." },
          { label: "c) Analytical Cookies", text: "We use these cookies to understand how visitors use the site. The information collected is fully anonymous and helps us improve our services. Tools such as Google Analytics may fall into this category." },
          { label: "d) Marketing Cookies", text: "These cookies are used to display relevant and personalised advertisements. We share your information with trusted advertising partners but never transfer personally identifiable information without your consent." },
        ],
      },
      {
        heading: "3. Third-Party Cookies",
        content:
          "Some features of our site use third-party services that may set their own cookies. These services include:\n• Google Analytics — User behaviour analysis\n• Stripe — Secure payment processing\n• Supabase — Authentication and data storage\n• Cloudflare — Security and performance optimisation\nThese companies have independent privacy policies and we are not responsible for their cookies.",
      },
      {
        heading: "4. Cookie Retention Period",
        content:
          "Session Cookies are deleted automatically when you close your browser. Persistent Cookies remain on your device for a set period — typically between 30 days and 2 years — unless you delete them earlier.",
      },
      {
        heading: "5. Managing and Disabling Cookies",
        content:
          "You can manage or delete cookies through your browser settings. Please note that disabling certain cookies may affect the functionality of the site. Cookie management guide for common browsers:\n• Google Chrome: Settings → Privacy and Security → Cookies\n• Mozilla Firefox: Settings → Privacy and Security\n• Safari: Preferences → Privacy\n• Microsoft Edge: Settings → Cookies and Site Permissions",
      },
      {
        heading: "6. Your Consent",
        content:
          "By continuing to use the Sefira site, you agree to the use of essential cookies. For other cookie categories, we will request your explicit consent. You may withdraw your consent at any time; this does not affect the lawfulness of processing carried out before the withdrawal.",
      },
      {
        heading: "7. Changes to the Cookie Policy",
        content:
          "We may update this policy to reflect changes in technology, regulations, or our services. Please follow the 'Last updated' date at the top of this page. Continued use of the site after changes are published constitutes acceptance of those changes.",
      },
      {
        heading: "8. Contact Us",
        content:
          "If you have questions about our cookie policy, you can reach us through the following channels:",
      },
    ],
    contactEmail: "support@getsefira.com",
    contactWebsite: "www.getsefira.com",
  },

  ar: {
    title: "سياسة ملفات تعريف الارتباط",
    lastUpdated: "آخر تحديث: يونيو 2026",
    backButton: "→ العودة إلى الصفحة الرئيسية",
    contactLabel: "البريد الإلكتروني",
    websiteLabel: "الموقع الإلكتروني",
    sections: [
      {
        heading: "١. ما هي ملفات تعريف الارتباط؟",
        content:
          "ملفات تعريف الارتباط هي ملفات نصية صغيرة تُخزَّن على جهازك عند زيارة موقع سفيرا. تساعدنا هذه الملفات في تقديم تجربة مخصصة وسلسة لك، وتذكُّر تفضيلاتك، وتحسين أداء الموقع.",
      },
      {
        heading: "٢. أنواع ملفات تعريف الارتباط التي نستخدمها",
        content: [
          { label: "أ) ملفات الارتباط الأساسية", text: "هذه الملفات ضرورية لوظائف الموقع الأساسية ولا يمكن تعطيلها. تشمل الحفاظ على حالة تسجيل الدخول وتخزين إعدادات الأمان وإدارة جلسات المستخدم." },
          { label: "ب) ملفات الارتباط الوظيفية", text: "تحفظ هذه الملفات تفضيلاتك مثل اللغة المختارة ووحدة العملة وإعدادات العرض حتى لا تحتاج إلى إعادة ضبطها في الزيارات القادمة." },
          { label: "ج) ملفات الارتباط التحليلية", text: "نستخدم هذه الملفات لفهم كيفية استخدام الزوار للموقع. المعلومات المجمَّعة مجهولة الهوية تمامًا وتساعدنا على تحسين خدماتنا. قد تندرج أدوات مثل Google Analytics ضمن هذه الفئة." },
          { label: "د) ملفات الارتباط التسويقية", text: "تُستخدم هذه الملفات لعرض إعلانات ذات صلة ومخصصة. نشارك معلوماتك مع شركاء إعلانيين موثوقين، غير أننا لا ننقل بيانات التعريف الشخصية أبدًا دون موافقتك." },
        ],
      },
      {
        heading: "٣. ملفات تعريف الارتباط التابعة لجهات خارجية",
        content:
          "تستخدم بعض ميزات موقعنا خدمات تابعة لجهات خارجية قد تضع ملفات الارتباط الخاصة بها. تشمل هذه الخدمات:\n• Google Analytics — تحليل سلوك المستخدمين\n• Stripe — معالجة المدفوعات الآمنة\n• Supabase — المصادقة وتخزين البيانات\n• Cloudflare — الأمان وتحسين الأداء\nهذه الشركات لديها سياسات خصوصية مستقلة ولسنا مسؤولين عن ملفات الارتباط الخاصة بها.",
      },
      {
        heading: "٤. مدة الاحتفاظ بملفات تعريف الارتباط",
        content:
          "تُحذف ملفات الارتباط للجلسة (Session Cookies) تلقائيًا عند إغلاق المتصفح. تبقى ملفات الارتباط الدائمة (Persistent Cookies) على جهازك لمدة محددة — عادةً بين 30 يومًا وسنتين — ما لم تحذفها بنفسك في وقت أبكر.",
      },
      {
        heading: "٥. إدارة ملفات تعريف الارتباط وتعطيلها",
        content:
          "يمكنك إدارة ملفات الارتباط أو حذفها من خلال إعدادات المتصفح. لاحظ أن تعطيل بعض الملفات قد يؤثر على وظائف الموقع. دليل إدارة ملفات الارتباط في المتصفحات الشائعة:\n• Google Chrome: الإعدادات ← الخصوصية والأمان ← ملفات الارتباط\n• Mozilla Firefox: الإعدادات ← الخصوصية والأمان\n• Safari: التفضيلات ← الخصوصية\n• Microsoft Edge: الإعدادات ← ملفات الارتباط وأذونات الموقع",
      },
      {
        heading: "٦. موافقتك",
        content:
          "بمواصلة استخدام موقع سفيرا، فإنك توافق على استخدام ملفات الارتباط الأساسية. بالنسبة لفئات ملفات الارتباط الأخرى، سنطلب موافقتك الصريحة. يمكنك سحب موافقتك في أي وقت؛ ولا يؤثر ذلك على مشروعية المعالجة التي تمت قبل ذلك.",
      },
      {
        heading: "٧. التغييرات في سياسة ملفات تعريف الارتباط",
        content:
          "قد نُحدِّث هذه السياسة لتعكس التغييرات في التكنولوجيا أو اللوائح أو خدماتنا. تابع تاريخ 'آخر تحديث' أعلى هذه الصفحة. مواصلة استخدام الموقع بعد نشر التغييرات يُعدّ قبولًا لها.",
      },
      {
        heading: "٨. اتصل بنا",
        content:
          "إذا كان لديك أسئلة حول سياسة ملفات تعريف الارتباط الخاصة بنا، يمكنك التواصل معنا عبر القنوات التالية:",
      },
    ],
    contactEmail: "support@getsefira.com",
    contactWebsite: "www.getsefira.com",
  },

  de: {
    title: "Cookie-Richtlinie",
    lastUpdated: "Zuletzt aktualisiert: Juni 2026",
    backButton: "← Zurück zur Startseite",
    contactLabel: "E-Mail",
    websiteLabel: "Webseite",
    sections: [
      {
        heading: "1. Was sind Cookies?",
        content:
          "Cookies sind kleine Textdateien, die beim Besuch der Sefira-Website auf Ihrem Gerät gespeichert werden. Sie helfen uns, Ihnen eine personalisierte und reibungslose Erfahrung zu bieten, Ihre Einstellungen zu speichern und die Leistung der Website zu verbessern.",
      },
      {
        heading: "2. Arten von Cookies, die wir verwenden",
        content: [
          { label: "a) Notwendige Cookies", text: "Diese Cookies sind für die grundlegenden Funktionen der Website erforderlich und können nicht deaktiviert werden. Sie umfassen die Aufrechterhaltung des Anmeldestatus, die Speicherung von Sicherheitseinstellungen und die Verwaltung von Benutzersitzungen." },
          { label: "b) Funktionale Cookies", text: "Diese Cookies speichern Ihre Einstellungen wie gewählte Sprache, Währung und Anzeigeoptionen, damit Sie diese bei Folgebesuchen nicht neu konfigurieren müssen." },
          { label: "c) Analytische Cookies", text: "Wir verwenden diese Cookies, um zu verstehen, wie Besucher die Website nutzen. Die gesammelten Informationen sind vollständig anonym und helfen uns, unsere Dienste zu verbessern. Tools wie Google Analytics können in diese Kategorie fallen." },
          { label: "d) Marketing-Cookies", text: "Diese Cookies werden verwendet, um relevante und personalisierte Werbung anzuzeigen. Wir teilen Ihre Daten mit vertrauenswürdigen Werbepartnern, übermitteln jedoch niemals persönlich identifizierbare Informationen ohne Ihre Einwilligung." },
        ],
      },
      {
        heading: "3. Drittanbieter-Cookies",
        content:
          "Einige Funktionen unserer Website nutzen Drittanbieterdienste, die möglicherweise eigene Cookies setzen. Diese Dienste umfassen:\n• Google Analytics — Analyse des Nutzerverhaltens\n• Stripe — Sichere Zahlungsabwicklung\n• Supabase — Authentifizierung und Datenspeicherung\n• Cloudflare — Sicherheit und Leistungsoptimierung\nDiese Unternehmen haben eigene Datenschutzrichtlinien und wir übernehmen keine Verantwortung für deren Cookies.",
      },
      {
        heading: "4. Aufbewahrungsdauer von Cookies",
        content:
          "Session-Cookies werden automatisch gelöscht, wenn Sie Ihren Browser schließen. Persistente Cookies verbleiben für einen bestimmten Zeitraum — in der Regel zwischen 30 Tagen und 2 Jahren — auf Ihrem Gerät, es sei denn, Sie löschen sie früher.",
      },
      {
        heading: "5. Verwaltung und Deaktivierung von Cookies",
        content:
          "Sie können Cookies über Ihre Browsereinstellungen verwalten oder löschen. Bitte beachten Sie, dass das Deaktivieren bestimmter Cookies die Funktionalität der Website beeinträchtigen kann. Anleitung zur Cookie-Verwaltung in gängigen Browsern:\n• Google Chrome: Einstellungen → Datenschutz und Sicherheit → Cookies\n• Mozilla Firefox: Einstellungen → Datenschutz und Sicherheit\n• Safari: Einstellungen → Datenschutz\n• Microsoft Edge: Einstellungen → Cookies und Websiteberechtigungen",
      },
      {
        heading: "6. Ihre Einwilligung",
        content:
          "Durch die weitere Nutzung der Sefira-Website stimmen Sie der Verwendung notwendiger Cookies zu. Für andere Cookie-Kategorien werden wir Ihre ausdrückliche Einwilligung einholen. Sie können Ihre Einwilligung jederzeit widerrufen; dies berührt nicht die Rechtmäßigkeit der zuvor erfolgten Verarbeitung.",
      },
      {
        heading: "7. Änderungen der Cookie-Richtlinie",
        content:
          "Wir können diese Richtlinie aktualisieren, um Änderungen in der Technologie, den gesetzlichen Vorschriften oder unseren Diensten widerzuspiegeln. Bitte achten Sie auf das Datum 'Zuletzt aktualisiert' am Anfang dieser Seite. Die weitere Nutzung der Website nach der Veröffentlichung von Änderungen gilt als Zustimmung zu diesen Änderungen.",
      },
      {
        heading: "8. Kontakt",
        content:
          "Wenn Sie Fragen zu unserer Cookie-Richtlinie haben, können Sie uns über folgende Kanäle erreichen:",
      },
    ],
    contactEmail: "support@getsefira.com",
    contactWebsite: "www.getsefira.com",
  },

  ru: {
    title: "Политика использования файлов cookie",
    lastUpdated: "Последнее обновление: июнь 2026 г.",
    backButton: "← На главную страницу",
    contactLabel: "Электронная почта",
    websiteLabel: "Веб-сайт",
    sections: [
      {
        heading: "1. Что такое файлы cookie?",
        content:
          "Файлы cookie — это небольшие текстовые файлы, которые сохраняются на вашем устройстве при посещении сайта Sefira. Они помогают нам предоставлять персонализированный и удобный опыт, запоминать ваши предпочтения и улучшать производительность сайта.",
      },
      {
        heading: "2. Типы используемых нами файлов cookie",
        content: [
          { label: "а) Необходимые файлы cookie", text: "Эти файлы cookie необходимы для основных функций сайта и не могут быть отключены. Они включают поддержание состояния входа в систему, хранение настроек безопасности и управление пользовательскими сеансами." },
          { label: "б) Функциональные файлы cookie", text: "Эти файлы cookie сохраняют ваши настройки, такие как выбранный язык, валюта и параметры отображения, чтобы вам не приходилось перенастраивать их при повторных посещениях." },
          { label: "в) Аналитические файлы cookie", text: "Мы используем эти файлы cookie, чтобы понять, как посетители используют сайт. Собранная информация полностью анонимна и помогает нам улучшать наши услуги. В эту категорию могут входить такие инструменты, как Google Analytics." },
          { label: "г) Маркетинговые файлы cookie", text: "Эти файлы cookie используются для показа релевантной и персонализированной рекламы. Мы делимся вашими данными с доверенными рекламными партнёрами, однако никогда не передаём персональные идентификационные данные без вашего согласия." },
        ],
      },
      {
        heading: "3. Файлы cookie третьих сторон",
        content:
          "Некоторые функции нашего сайта используют сторонние сервисы, которые могут устанавливать собственные файлы cookie. К этим сервисам относятся:\n• Google Analytics — анализ поведения пользователей\n• Stripe — безопасная обработка платежей\n• Supabase — аутентификация и хранение данных\n• Cloudflare — безопасность и оптимизация производительности\nЭти компании имеют независимые политики конфиденциальности, и мы не несём ответственности за их файлы cookie.",
      },
      {
        heading: "4. Срок хранения файлов cookie",
        content:
          "Сеансовые файлы cookie (Session Cookies) удаляются автоматически при закрытии браузера. Постоянные файлы cookie (Persistent Cookies) остаются на вашем устройстве в течение определённого срока — как правило, от 30 дней до 2 лет, — если вы не удалите их раньше.",
      },
      {
        heading: "5. Управление файлами cookie и их отключение",
        content:
          "Вы можете управлять файлами cookie или удалять их через настройки браузера. Обратите внимание, что отключение некоторых файлов cookie может повлиять на функциональность сайта. Руководство по управлению файлами cookie в популярных браузерах:\n• Google Chrome: Настройки → Конфиденциальность и безопасность → Файлы cookie\n• Mozilla Firefox: Настройки → Конфиденциальность и защита\n• Safari: Настройки → Конфиденциальность\n• Microsoft Edge: Настройки → Файлы cookie и разрешения сайтов",
      },
      {
        heading: "6. Ваше согласие",
        content:
          "Продолжая использовать сайт Sefira, вы соглашаетесь на использование необходимых файлов cookie. Для других категорий файлов cookie мы запросим ваше явное согласие. Вы можете отозвать своё согласие в любое время; это не влияет на законность обработки, осуществлённой до отзыва.",
      },
      {
        heading: "7. Изменения в политике использования файлов cookie",
        content:
          "Мы можем обновлять эту политику, чтобы отразить изменения в технологиях, законодательстве или наших услугах. Следите за датой «Последнее обновление» в верхней части этой страницы. Продолжение использования сайта после публикации изменений означает их принятие.",
      },
      {
        heading: "8. Свяжитесь с нами",
        content:
          "Если у вас есть вопросы о нашей политике использования файлов cookie, вы можете связаться с нами по следующим каналам:",
      },
    ],
    contactEmail: "support@getsefira.com",
    contactWebsite: "www.getsefira.com",
  },
};

function renderSectionContent(
  content: { label: string; text: string }[] | string,
  isRtl: boolean
) {
  if (Array.isArray(content)) {
    return (
      <div>
        {content.map((item, i) => (
          <div key={i}>
            <p className="text-sm font-semibold text-gray-700 mt-3 mb-1">{item.label}</p>
            <p className="text-sm text-gray-600 leading-relaxed">{item.text}</p>
          </div>
        ))}
      </div>
    );
  }

  const lines = content.split("\n");
  const paragraphs: string[] = [];
  const bullets: string[] = [];

  for (const line of lines) {
    if (line.startsWith("•")) {
      bullets.push(line.slice(1).trim());
    } else if (line.trim()) {
      paragraphs.push(line.trim());
    }
  }

  return (
    <>
      {paragraphs.map((p, i) => (
        <p key={i} className="text-sm text-gray-600 leading-relaxed">
          {p}
        </p>
      ))}
      {bullets.length > 0 && (
        <ul className={`text-sm text-gray-600 leading-relaxed mt-2 space-y-1 list-disc ${isRtl ? "list-inside" : "list-inside"}`}>
          {bullets.map((b, i) => (
            <li key={i}>{b}</li>
          ))}
        </ul>
      )}
    </>
  );
}

export default function CookiesPage() {
  const { lang } = useLang();

  const content = COOKIES_CONTENT[lang] || COOKIES_CONTENT["tr"];
  const isRtl = lang === "fa" || lang === "ar";

  return (
    <div className="min-h-screen bg-white">
      <div
        className={`max-w-2xl mx-auto px-4 py-8 ${isRtl ? "text-right" : "text-left"}`}
        dir={isRtl ? "rtl" : "ltr"}
      >
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold px-4 py-2 rounded-2xl transition-colors duration-200 mb-8"
        >
          {content.backButton}
        </Link>

        <h1 className="text-2xl font-black text-gray-900 mb-2">{content.title}</h1>
        <p className="text-sm text-gray-400 mb-6">{content.lastUpdated}</p>

        <hr className="border-t border-gray-100 my-4" />

        {content.sections.map((section, i) => {
          const isLastSection = i === content.sections.length - 1;
          return (
            <div key={i}>
              <h2 className="text-lg font-bold text-gray-800 mt-6 mb-2">{section.heading}</h2>
              {renderSectionContent(
                section.content as { label: string; text: string }[] | string,
                isRtl
              )}
              {isLastSection && (
                <ul className="text-sm text-gray-600 leading-relaxed mt-2 space-y-1">
                  <li>
                    {content.contactLabel}:{" "}
                    <span className="text-orange-500 font-medium" dir="ltr">
                      {content.contactEmail}
                    </span>
                  </li>
                  <li>
                    {content.websiteLabel}:{" "}
                    <span className="text-orange-500 font-medium" dir="ltr">
                      {content.contactWebsite}
                    </span>
                  </li>
                </ul>
              )}
              <hr className="border-t border-gray-100 my-4" />
            </div>
          );
        })}

        <div className="mt-6 mb-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold px-4 py-2 rounded-2xl transition-colors duration-200"
          >
            {content.backButton}
          </Link>
        </div>
      </div>
    </div>
  );
}
