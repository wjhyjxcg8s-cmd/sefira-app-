"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Section = {
  heading: string;
  content: string;
  bullets?: string[];
};

type LangContent = {
  title: string;
  subtitle: string;
  backButton: string;
  sections: Section[];
  contactLabel: string;
  contactEmail: string;
  footer: string;
};

const SECURITY_CONTENT: Record<string, LangContent> = {
  tr: {
    title: "Güvenlik",
    subtitle: "Sefira'da Güvenlik Önceliğimizdir",
    backButton: "← Ana Sayfaya Dön",
    contactLabel: "Şüpheli bir durum bildirmek için",
    footer: "© 2026 Sefira Technologies",
    sections: [
      {
        heading: "",
        content:
          "Sefira olarak kullanıcılarımızın güvenliği her şeyin önündedir. Platforma eklediğimiz her özelliği ve aldığımız her tasarım kararını güvenlik odaklı bir bakış açısıyla değerlendiriyoruz. Aşağıda hesabınızı, verilerinizi ve diğer kullanıcılarla etkileşimlerinizi korumak için uyguladığımız önlemleri bulabilirsiniz.",
      },
      {
        heading: "Hesap Güvenliği",
        content: "",
        bullets: [
          "Tüm şifreler bcrypt algoritmasıyla şifrelenerek saklanır; düz metin olarak hiçbir zaman tutulmaz.",
          "Giriş işlemleri güvenli oturum yönetimi ve token doğrulamasıyla korunur.",
          "Şüpheli giriş girişimleri otomatik olarak algılanır ve hesabınız geçici olarak kilitlenir.",
          "Hesabınıza başka bir cihazdan giriş yapıldığında e-posta ile bildirim alırsınız.",
          "Güçlü ve benzersiz bir şifre kullanmanızı, şifrenizi kimseyle paylaşmamanızı öneririz.",
        ],
      },
      {
        heading: "Veri Koruma",
        content: "",
        bullets: [
          "Tüm veriler aktarım sırasında TLS/SSL şifrelemesiyle korunur.",
          "Hassas veriler sunucu tarafında AES-256 standardıyla şifrelenir.",
          "Ödeme bilgileri Sefira sunucularında saklanmaz; tüm işlemler PCI-DSS uyumlu Stripe altyapısı üzerinden gerçekleştirilir.",
          "Kişisel verileriniz yalnızca hizmetin sunulması için gerekli olan süre boyunca tutulur.",
          "Verilerinize kimlerin erişebildiği düzenli olarak denetlenir ve en az ayrıcalık ilkesi uygulanır.",
        ],
      },
      {
        heading: "Güvenli İletişim",
        content: "",
        bullets: [
          "Platform içi mesajlaşma altyapımız uçtan uca şifreleme desteğiyle tasarlanmıştır.",
          "Tanımadığınız kişilerle kişisel bilgilerinizi (TC kimlik numarası, banka bilgileri, ev adresi) paylaşmayın.",
          "Sefira hiçbir zaman sizden şifrenizi veya ödeme bilgilerinizi e-posta veya mesaj yoluyla istemez.",
          "Platform dışına çıkmanızı isteyen ya da acele karar vermenizi gerektiren tekliflerden kaçının.",
          "Kullanıcıları doğrudan başka uygulamalara yönlendiren mesajlara karşı dikkatli olun.",
        ],
      },
      {
        heading: "İlan Güvenliği",
        content: "",
        bullets: [
          "Tüm ilanlar yayınlanmadan önce otomatik içerik denetiminden geçirilir.",
          "Gerçek olmadığından şüphelendiğiniz ilanları doğrudan ilan sayfasından bildirebilirsiniz.",
          "Bir mülkü yerinde görmedikçe herhangi bir ödeme yapmayın ve sözleşme imzalamayın.",
          "Ev arkadaşı adayı veya ev sahibiyle buluşmadan önce kimlik doğrulamasını platform üzerinden talep edin.",
          "İlan fiyatları piyasa ortalamasının çok altındaysa bu bir uyarı işareti olabilir.",
        ],
      },
      {
        heading: "Şüpheli Durumlar",
        content:
          "Herhangi bir güvenlik ihlali, şüpheli hesap etkinliği veya dolandırıcılık girişimiyle karşılaşırsanız lütfen bizimle iletişime geçin. Tüm bildirimleri ciddiye alır ve 24 saat içinde yanıt vermeye çalışırız.",
      },
      {
        heading: "",
        content:
          "Güvenli bir topluluk oluşturmak yalnızca bizim sorumluluğumuz değil, tüm Sefira kullanıcılarının ortak sorumluluğudur. Şüphe duyduğunuzda bildirin, dikkatli olun ve güvenli kalın.",
      },
    ],
    contactEmail: "security@getsefira.com",
  },

  en: {
    title: "Security",
    subtitle: "Security is Our Priority at Sefira",
    backButton: "← Back to Home",
    contactLabel: "To report a suspicious situation",
    footer: "© 2026 Sefira Technologies",
    sections: [
      {
        heading: "",
        content:
          "At Sefira, the safety of our users comes before everything else. Every feature we add to the platform and every design decision we make is evaluated from a security-first perspective. Below you can find the measures we apply to protect your account, your data, and your interactions with other users.",
      },
      {
        heading: "Account Security",
        content: "",
        bullets: [
          "All passwords are hashed with bcrypt and never stored in plain text.",
          "Login processes are protected by secure session management and token validation.",
          "Suspicious login attempts are automatically detected and your account is temporarily locked.",
          "You receive an email notification when your account is accessed from a new device.",
          "We recommend using a strong, unique password and never sharing it with anyone.",
        ],
      },
      {
        heading: "Data Protection",
        content: "",
        bullets: [
          "All data is protected by TLS/SSL encryption in transit.",
          "Sensitive data is encrypted server-side using AES-256.",
          "Payment details are never stored on Sefira servers; all transactions are processed through PCI-DSS compliant Stripe infrastructure.",
          "Your personal data is retained only for as long as necessary to provide the service.",
          "Access to your data is regularly audited and the principle of least privilege is applied.",
        ],
      },
      {
        heading: "Safe Communication",
        content: "",
        bullets: [
          "Our in-platform messaging infrastructure is designed with end-to-end encryption support.",
          "Do not share personal details (national ID, bank details, home address) with people you do not know.",
          "Sefira will never ask for your password or payment information via email or message.",
          "Avoid offers that push you to leave the platform or require you to make hasty decisions.",
          "Be cautious of messages that direct users to third-party apps outside the platform.",
        ],
      },
      {
        heading: "Listing Safety",
        content: "",
        bullets: [
          "All listings go through automated content moderation before being published.",
          "You can report listings you suspect are not genuine directly from the listing page.",
          "Do not make any payment or sign any contract without viewing the property in person.",
          "Request identity verification through the platform before meeting a room seeker or host.",
          "If listing prices are significantly below market average, this may be a warning sign.",
        ],
      },
      {
        heading: "Suspicious Situations",
        content:
          "If you encounter any security breach, suspicious account activity, or attempted fraud, please contact us. We take all reports seriously and aim to respond within 24 hours.",
      },
      {
        heading: "",
        content:
          "Building a safe community is not only our responsibility — it is a shared responsibility of all Sefira users. When in doubt, report it, stay alert, and stay safe.",
      },
    ],
    contactEmail: "security@getsefira.com",
  },

  fa: {
    title: "امنیت",
    subtitle: "امنیت اولویت ماست در سفیرا",
    backButton: "→ بازگشت به صفحه اصلی",
    contactLabel: "برای گزارش موارد مشکوک",
    footer: "© 2026 Sefira Technologies",
    sections: [
      {
        heading: "",
        content:
          "در سفیرا، ایمنی کاربران بر همه چیز مقدم است. هر ویژگی که به پلتفرم اضافه می‌کنیم و هر تصمیم طراحی که می‌گیریم را از منظر امنیت‌محور ارزیابی می‌کنیم. در زیر می‌توانید اقداماتی را که برای حفاظت از حساب، داده‌ها و تعاملات شما با سایر کاربران اعمال می‌کنیم، بیابید.",
      },
      {
        heading: "امنیت حساب کاربری",
        content: "",
        bullets: [
          "تمام رمزهای عبور با الگوریتم bcrypt هش می‌شوند و هرگز به صورت متن ساده ذخیره نمی‌شوند.",
          "فرآیندهای ورود توسط مدیریت جلسه ایمن و تأیید توکن محافظت می‌شوند.",
          "تلاش‌های مشکوک برای ورود به طور خودکار شناسایی می‌شوند و حساب شما موقتاً قفل می‌شود.",
          "هنگامی که از دستگاه جدیدی به حساب شما دسترسی پیدا می‌شود، اطلاعیه ایمیل دریافت می‌کنید.",
          "توصیه می‌کنیم از رمز عبور قوی و منحصربه‌فرد استفاده کنید و آن را با کسی به اشتراک نگذارید.",
        ],
      },
      {
        heading: "حفاظت از داده‌ها",
        content: "",
        bullets: [
          "تمام داده‌ها در حین انتقال توسط رمزگذاری TLS/SSL محافظت می‌شوند.",
          "داده‌های حساس در سمت سرور با استاندارد AES-256 رمزگذاری می‌شوند.",
          "اطلاعات پرداخت هرگز در سرورهای سفیرا ذخیره نمی‌شوند؛ تمام تراکنش‌ها از طریق زیرساخت Stripe سازگار با PCI-DSS انجام می‌شوند.",
          "داده‌های شخصی شما فقط تا زمانی که برای ارائه خدمات لازم است نگهداری می‌شود.",
          "دسترسی به داده‌های شما به طور منظم ممیزی می‌شود و اصل حداقل امتیاز اعمال می‌شود.",
        ],
      },
      {
        heading: "ارتباطات امن",
        content: "",
        bullets: [
          "زیرساخت پیام‌رسانی درون پلتفرم ما با پشتیبانی رمزگذاری انتها به انتها طراحی شده است.",
          "اطلاعات شخصی (کد ملی، اطلاعات بانکی، آدرس خانه) را با افرادی که نمی‌شناسید به اشتراک نگذارید.",
          "سفیرا هرگز از طریق ایمیل یا پیام رمز عبور یا اطلاعات پرداخت شما را درخواست نمی‌کند.",
          "از پیشنهاداتی که شما را مجبور به ترک پلتفرم یا تصمیم‌گیری عجولانه می‌کنند خودداری کنید.",
          "نسبت به پیام‌هایی که کاربران را به اپلیکیشن‌های شخص ثالث خارج از پلتفرم هدایت می‌کنند هوشیار باشید.",
        ],
      },
      {
        heading: "ایمنی آگهی‌ها",
        content: "",
        bullets: [
          "تمام آگهی‌ها قبل از انتشار از بررسی خودکار محتوا می‌گذرند.",
          "می‌توانید آگهی‌هایی را که مشکوک به جعلی بودن هستند مستقیماً از صفحه آگهی گزارش دهید.",
          "بدون بازدید حضوری از ملک هیچ پرداختی انجام ندهید و قراردادی امضا نکنید.",
          "قبل از ملاقات با هم‌خانه‌یاب یا مالک، تأیید هویت را از طریق پلتفرم درخواست کنید.",
          "اگر قیمت آگهی‌ها به طور قابل توجهی پایین‌تر از میانگین بازار است، این ممکن است نشانه هشداردهنده‌ای باشد.",
        ],
      },
      {
        heading: "موارد مشکوک",
        content:
          "اگر با هر نقض امنیتی، فعالیت مشکوک در حساب یا تلاش برای کلاهبرداری مواجه شدید، لطفاً با ما تماس بگیرید. ما همه گزارش‌ها را جدی می‌گیریم و هدفمان پاسخ در ظرف ۲۴ ساعت است.",
      },
      {
        heading: "",
        content:
          "ساختن یک جامعه امن تنها مسئولیت ما نیست — این مسئولیت مشترک تمام کاربران سفیرا است. هنگامی که شک دارید، گزارش دهید، هوشیار بمانید و در امنیت بمانید.",
      },
    ],
    contactEmail: "security@getsefira.com",
  },

  ar: {
    title: "الأمان",
    subtitle: "الأمان أولويتنا في سفيرا",
    backButton: "→ العودة إلى الصفحة الرئيسية",
    contactLabel: "للإبلاغ عن حالة مشبوهة",
    footer: "© 2026 Sefira Technologies",
    sections: [
      {
        heading: "",
        content:
          "في سفيرا، سلامة مستخدمينا تأتي قبل كل شيء. نُقيِّم كل ميزة نضيفها إلى المنصة وكل قرار تصميمي نتخذه من منظور يضع الأمان في المقام الأول. أدناه ستجد الإجراءات التي نطبقها لحماية حسابك وبياناتك وتفاعلاتك مع المستخدمين الآخرين.",
      },
      {
        heading: "أمان الحساب",
        content: "",
        bullets: [
          "يتم تشفير جميع كلمات المرور باستخدام خوارزمية bcrypt ولا تُخزَّن أبدًا كنص عادي.",
          "تُحمى عمليات تسجيل الدخول بإدارة جلسة آمنة والتحقق من الرمز المميز.",
          "يتم اكتشاف محاولات تسجيل الدخول المشبوهة تلقائيًا ويُقفَل حسابك مؤقتًا.",
          "تتلقى إشعارًا بالبريد الإلكتروني عند الوصول إلى حسابك من جهاز جديد.",
          "نوصي باستخدام كلمة مرور قوية وفريدة وعدم مشاركتها مع أي شخص.",
        ],
      },
      {
        heading: "حماية البيانات",
        content: "",
        bullets: [
          "تُحمى جميع البيانات أثناء النقل بتشفير TLS/SSL.",
          "تُشفَّر البيانات الحساسة على جانب الخادم باستخدام معيار AES-256.",
          "لا تُخزَّن تفاصيل الدفع على خوادم سفيرا؛ تتم جميع المعاملات عبر بنية Stripe التحتية المتوافقة مع PCI-DSS.",
          "تُحتفَظ ببياناتك الشخصية فقط للمدة اللازمة لتقديم الخدمة.",
          "يتم تدقيق الوصول إلى بياناتك بانتظام وتطبيق مبدأ الحد الأدنى من الامتيازات.",
        ],
      },
      {
        heading: "التواصل الآمن",
        content: "",
        bullets: [
          "تم تصميم بنية المراسلة داخل المنصة بدعم التشفير من طرف إلى طرف.",
          "لا تشارك معلوماتك الشخصية (الهوية الوطنية، تفاصيل البنك، عنوان المنزل) مع أشخاص لا تعرفهم.",
          "لن تطلب سفيرا أبدًا كلمة مرورك أو معلومات الدفع عبر البريد الإلكتروني أو الرسائل.",
          "تجنب العروض التي تدفعك إلى مغادرة المنصة أو اتخاذ قرارات متسرعة.",
          "كن حذرًا من الرسائل التي توجه المستخدمين إلى تطبيقات طرف ثالث خارج المنصة.",
        ],
      },
      {
        heading: "سلامة الإعلانات",
        content: "",
        bullets: [
          "تخضع جميع الإعلانات لإشراف آلي على المحتوى قبل النشر.",
          "يمكنك الإبلاغ عن الإعلانات التي تشك في أنها مزيفة مباشرة من صفحة الإعلان.",
          "لا تُجرِ أي دفع ولا توقع أي عقد دون معاينة العقار شخصيًا.",
          "اطلب التحقق من الهوية عبر المنصة قبل مقابلة باحث عن شريك سكن أو مالك.",
          "إذا كانت أسعار الإعلانات أقل بكثير من متوسط السوق، فقد يكون ذلك إشارة تحذيرية.",
        ],
      },
      {
        heading: "الحالات المشبوهة",
        content:
          "إذا واجهت أي خرق أمني أو نشاطًا مشبوهًا في الحساب أو محاولة احتيال، يرجى التواصل معنا. نأخذ جميع البلاغات بجدية ونهدف إلى الرد خلال 24 ساعة.",
      },
      {
        heading: "",
        content:
          "بناء مجتمع آمن ليس مسؤوليتنا وحدنا — بل هو مسؤولية مشتركة لجميع مستخدمي سفيرا. عندما تشك، أبلِغ، كن يقظًا وابقَ بأمان.",
      },
    ],
    contactEmail: "security@getsefira.com",
  },

  de: {
    title: "Sicherheit",
    subtitle: "Sicherheit hat bei Sefira oberste Priorität",
    backButton: "← Zurück zur Startseite",
    contactLabel: "Um eine verdächtige Situation zu melden",
    footer: "© 2026 Sefira Technologies",
    sections: [
      {
        heading: "",
        content:
          "Bei Sefira steht die Sicherheit unserer Nutzer an erster Stelle. Jede Funktion, die wir zur Plattform hinzufügen, und jede Designentscheidung, die wir treffen, wird aus einer sicherheitsorientierten Perspektive bewertet. Im Folgenden finden Sie die Maßnahmen, die wir zum Schutz Ihres Kontos, Ihrer Daten und Ihrer Interaktionen mit anderen Nutzern ergreifen.",
      },
      {
        heading: "Kontosicherheit",
        content: "",
        bullets: [
          "Alle Passwörter werden mit dem bcrypt-Algorithmus gehasht und niemals im Klartext gespeichert.",
          "Anmeldevorgänge werden durch sicheres Sitzungsmanagement und Token-Validierung geschützt.",
          "Verdächtige Anmeldeversuche werden automatisch erkannt und Ihr Konto vorübergehend gesperrt.",
          "Sie erhalten eine E-Mail-Benachrichtigung, wenn von einem neuen Gerät auf Ihr Konto zugegriffen wird.",
          "Wir empfehlen die Verwendung eines starken, einzigartigen Passworts und raten davon ab, es mit anderen zu teilen.",
        ],
      },
      {
        heading: "Datenschutz",
        content: "",
        bullets: [
          "Alle Daten werden während der Übertragung durch TLS/SSL-Verschlüsselung geschützt.",
          "Sensible Daten werden serverseitig mit AES-256 verschlüsselt.",
          "Zahlungsdetails werden nie auf Sefira-Servern gespeichert; alle Transaktionen werden über die PCI-DSS-konforme Stripe-Infrastruktur abgewickelt.",
          "Ihre persönlichen Daten werden nur so lange aufbewahrt, wie es für die Erbringung des Dienstes erforderlich ist.",
          "Der Zugriff auf Ihre Daten wird regelmäßig überprüft und das Prinzip der geringsten Berechtigung angewendet.",
        ],
      },
      {
        heading: "Sichere Kommunikation",
        content: "",
        bullets: [
          "Unsere plattforminterne Messaging-Infrastruktur ist mit Unterstützung für Ende-zu-Ende-Verschlüsselung konzipiert.",
          "Teilen Sie keine persönlichen Daten (Ausweisnummer, Bankdaten, Heimadresse) mit Personen, die Sie nicht kennen.",
          "Sefira wird Sie niemals per E-Mail oder Nachricht nach Ihrem Passwort oder Zahlungsinformationen fragen.",
          "Vermeiden Sie Angebote, die Sie dazu drängen, die Plattform zu verlassen oder überstürzte Entscheidungen zu treffen.",
          "Seien Sie vorsichtig bei Nachrichten, die Nutzer zu Drittanbieter-Apps außerhalb der Plattform weiterleiten.",
        ],
      },
      {
        heading: "Inseratssicherheit",
        content: "",
        bullets: [
          "Alle Inserate durchlaufen vor der Veröffentlichung eine automatische Inhaltsmoderation.",
          "Sie können Inserate, die Sie für gefälscht halten, direkt auf der Inseratsseite melden.",
          "Leisten Sie keine Zahlung und unterschreiben Sie keinen Vertrag, ohne die Immobilie persönlich besichtigt zu haben.",
          "Fordern Sie die Identitätsprüfung über die Plattform an, bevor Sie einen Mitbewohner-Sucher oder Vermieter treffen.",
          "Wenn Inseratspreise deutlich unter dem Marktdurchschnitt liegen, kann dies ein Warnsignal sein.",
        ],
      },
      {
        heading: "Verdächtige Situationen",
        content:
          "Wenn Sie auf einen Sicherheitsverstoß, verdächtige Kontoaktivitäten oder Betrugsversuche stoßen, wenden Sie sich bitte an uns. Wir nehmen alle Meldungen ernst und bemühen uns, innerhalb von 24 Stunden zu antworten.",
      },
      {
        heading: "",
        content:
          "Eine sichere Gemeinschaft aufzubauen ist nicht nur unsere Verantwortung — es ist eine gemeinsame Verantwortung aller Sefira-Nutzer. Wenn Sie zweifeln, melden Sie es, bleiben Sie wachsam und bleiben Sie sicher.",
      },
    ],
    contactEmail: "security@getsefira.com",
  },

  ru: {
    title: "Безопасность",
    subtitle: "Безопасность — наш приоритет в Sefira",
    backButton: "← На главную страницу",
    contactLabel: "Чтобы сообщить о подозрительной ситуации",
    footer: "© 2026 Sefira Technologies",
    sections: [
      {
        heading: "",
        content:
          "В Sefira безопасность наших пользователей стоит на первом месте. Каждую функцию, которую мы добавляем на платформу, и каждое дизайнерское решение мы оцениваем с точки зрения приоритета безопасности. Ниже вы найдёте меры, которые мы применяем для защиты вашего аккаунта, ваших данных и взаимодействия с другими пользователями.",
      },
      {
        heading: "Безопасность аккаунта",
        content: "",
        bullets: [
          "Все пароли хешируются с помощью алгоритма bcrypt и никогда не хранятся в открытом виде.",
          "Процессы входа защищены безопасным управлением сессиями и валидацией токенов.",
          "Подозрительные попытки входа автоматически обнаруживаются, и ваш аккаунт временно блокируется.",
          "Вы получаете уведомление по электронной почте при входе в аккаунт с нового устройства.",
          "Рекомендуем использовать надёжный уникальный пароль и никому его не передавать.",
        ],
      },
      {
        heading: "Защита данных",
        content: "",
        bullets: [
          "Все данные при передаче защищены шифрованием TLS/SSL.",
          "Конфиденциальные данные шифруются на стороне сервера по стандарту AES-256.",
          "Платёжные данные никогда не хранятся на серверах Sefira; все транзакции обрабатываются через PCI-DSS-совместимую инфраструктуру Stripe.",
          "Ваши персональные данные хранятся только столько, сколько необходимо для оказания услуги.",
          "Доступ к вашим данным регулярно проверяется, применяется принцип минимальных привилегий.",
        ],
      },
      {
        heading: "Безопасное общение",
        content: "",
        bullets: [
          "Наша внутриплатформенная инфраструктура обмена сообщениями разработана с поддержкой сквозного шифрования.",
          "Не делитесь личными данными (паспортные данные, банковские реквизиты, домашний адрес) с незнакомыми людьми.",
          "Sefira никогда не будет запрашивать ваш пароль или платёжные данные по электронной почте или в сообщениях.",
          "Избегайте предложений, которые вынуждают покинуть платформу или принимать поспешные решения.",
          "Будьте осторожны с сообщениями, которые перенаправляют пользователей в сторонние приложения вне платформы.",
        ],
      },
      {
        heading: "Безопасность объявлений",
        content: "",
        bullets: [
          "Все объявления проходят автоматическую модерацию контента перед публикацией.",
          "Вы можете пожаловаться на объявления, которые кажутся вам поддельными, прямо со страницы объявления.",
          "Не совершайте никаких платежей и не подписывайте договоры, не осмотрев объект лично.",
          "Запросите верификацию личности через платформу перед встречей с соседом по комнате или хозяином жилья.",
          "Если цены в объявлениях значительно ниже рыночных, это может быть тревожным сигналом.",
        ],
      },
      {
        heading: "Подозрительные ситуации",
        content:
          "Если вы столкнулись с нарушением безопасности, подозрительной активностью в аккаунте или попыткой мошенничества, пожалуйста, свяжитесь с нами. Мы серьёзно относимся ко всем сообщениям и стараемся ответить в течение 24 часов.",
      },
      {
        heading: "",
        content:
          "Создание безопасного сообщества — это не только наша ответственность, но и общая ответственность всех пользователей Sefira. Если сомневаетесь — сообщите, будьте бдительны и оставайтесь в безопасности.",
      },
    ],
    contactEmail: "security@getsefira.com",
  },
};

function renderSection(section: Section, isRtl: boolean, isContact: boolean, contactLabel: string, contactEmail: string) {
  return (
    <>
      {section.content && (
        <p className="text-sm text-gray-600 leading-relaxed">{section.content}</p>
      )}
      {section.bullets && section.bullets.length > 0 && (
        <ul className={`list-disc list-inside text-sm text-gray-600 space-y-1 mt-2`}>
          {section.bullets.map((b, i) => (
            <li key={i}>{b}</li>
          ))}
        </ul>
      )}
      {isContact && (
        <p className="text-sm text-gray-600 mt-3">
          {contactLabel}:{" "}
          <span className="text-orange-500 font-medium" dir="ltr">
            {contactEmail}
          </span>
        </p>
      )}
    </>
  );
}

export default function SecurityPage() {
  const [lang, setLang] = useState("tr");

  useEffect(() => {
    const savedLang = localStorage.getItem("sefira-lang") || "tr";
    setLang(savedLang);
  }, []);

  const content = SECURITY_CONTENT[lang] || SECURITY_CONTENT["tr"];
  const isRtl = lang === "fa" || lang === "ar";

  const contactSectionIndex = content.sections.findIndex(
    (s) => s.heading === "Şüpheli Durumlar" ||
           s.heading === "Suspicious Situations" ||
           s.heading === "موارد مشکوک" ||
           s.heading === "الحالات المشبوهة" ||
           s.heading === "Verdächtige Situationen" ||
           s.heading === "Подозрительные ситуации"
  );

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

        <h1 className="text-2xl font-black text-gray-900 mb-1">{content.title}</h1>
        <p className="text-base font-semibold text-gray-700 mb-6">{content.subtitle}</p>

        <hr className="border-t border-gray-100 my-4" />

        {content.sections.map((section, i) => (
          <div key={i}>
            {section.heading ? (
              <h2 className="text-lg font-bold text-gray-800 mt-6 mb-2">{section.heading}</h2>
            ) : null}
            {renderSection(
              section,
              isRtl,
              i === contactSectionIndex,
              content.contactLabel,
              content.contactEmail
            )}
            <hr className="border-t border-gray-100 my-4" />
          </div>
        ))}

        <p className="text-xs text-gray-400 mt-2 mb-4">{content.footer}</p>

        <div className="mb-4">
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
