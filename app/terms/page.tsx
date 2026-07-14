"use client";

import Link from "next/link";
import { useLang } from "@/app/lib/LangContext";

const TERMS_CONTENT: Record<string, {
  title: string;
  lastUpdated: string;
  backButton: string;
  sections: { heading: string; content: string }[];
  contactEmail: string;
  contactLabel: string;
}> = {
  tr: {
    title: "Kullanım Koşulları",
    lastUpdated: "Son Güncelleme: 01.06.2026",
    backButton: "← Ana Sayfaya Dön",
    contactLabel: "İletişim",
    sections: [
      {
        heading: "1. Taraflar",
        content:
          "Bu Kullanım Koşulları (\"Koşullar\"), Sefira Technologies (\"Sefira\", \"biz\" veya \"platform\") ile Sefira web sitesini ve mobil uygulamasını kullanan gerçek kişiler (\"Kullanıcı\" veya \"siz\") arasındaki hukuki ilişkiyi düzenler. Platforma erişerek veya hesap oluşturarak bu Koşulları okuduğunuzu, anladığınızı ve kabul ettiğinizi beyan etmiş olursunuz.",
      },
      {
        heading: "2. Platformun Niteliği",
        content:
          "Sefira, ev arayanların uygun ev arkadaşları ve paylaşımlı konutlar bulmasını kolaylaştıran bir çevrimiçi ilan ve eşleştirme platformudur. Sefira; bir emlak acentesi, paylaşım şirketi veya taşınmaz danışmanı değildir. Platform üzerindeki ilanlar üçüncü şahıslara aittir; Sefira bu ilanların doğruluğunu, gerçekliğini veya güvenilirliğini garanti etmez.",
      },
      {
        heading: "3. Üyelik ve Hesap Güvenliği",
        content:
          "Platforma kayıt olmak için 18 yaşını doldurmuş olmanız gerekmektedir. Hesabınızı oluştururken sağladığınız bilgilerin doğru, güncel ve eksiksiz olduğunu taahhüt edersiniz. Hesabınızın güvenliğinden siz sorumlusunuz; şifrenizi kimseyle paylaşmayınız. Hesabınıza yetkisiz erişim fark ettiğinizde derhal support@getsefira.com adresine bildirmeniz gerekmektedir. Hesabınız devre dışı bırakılmış ya da askıya alınmış ise yeni bir hesap oluşturamazsınız.",
      },
      {
        heading: "4. Kullanıcı Yükümlülükleri",
        content:
          "Platformu kullanırken aşağıdaki kurallara uymayı kabul edersiniz:\n• Yalnızca kendi adınıza işlem yapacaksınız; başkası adına veya sahte kimlikle hesap açmayacaksınız.\n• Yanıltıcı, aldatıcı veya yanlış bilgi paylaşmayacaksınız.\n• Taciz, nefret söylemi, tehdit veya müstehcen içerik paylaşmayacaksınız.\n• Sefira'nın altyapısına zarar verecek herhangi bir eylemde bulunmayacaksınız (DDoS saldırısı, botlar, scraping vb.).\n• Platforma erişim için yetkisiz üçüncü taraf araçlar kullanmayacaksınız.\n• Yürürlükteki tüm yerel ve uluslararası yasalara uyacaksınız.",
      },
      {
        heading: "5. İlanlar ve İçerikler",
        content:
          "Platform üzerinde ilan yayınlayan kullanıcılar, paylaştıkları tüm bilgilerin doğru ve güncel olduğunu beyan eder. Yanıltıcı, sahte veya mükerrer ilanlar yayınlamak yasaktır. Sefira, uygunsuz gördüğü herhangi bir içeriği önceden haber vermeksizin kaldırma hakkını saklı tutar. Bir ilanın kaldırılması, kullanıcının platformdan tamamen çıkarılmasına da yol açabilir. Kullanıcılar tarafından yüklenen fotoğraf, metin ve diğer içerikler için fikri mülkiyet haklarından kaynaklanan sorumluluk kullanıcıya aittir.",
      },
      {
        heading: "6. Sorumluluğun Sınırlandırılması",
        content:
          "Sefira, kullanıcılar arasında gerçekleşen anlaşmazlıklarda taraf değildir ve bunlara ilişkin herhangi bir sorumluluk üstlenmez. Platform üzerinden tanışan kullanıcılar arasındaki ev arkadaşlığı anlaşmaları, ödeme anlaşmazlıkları veya güvenlik sorunlarından Sefira sorumlu tutulamaz. Sefira, platforma yüklenen içeriklerin doğruluğu, yasallığı veya üçüncü şahıs haklarını ihlal edip etmediği konusunda garanti vermez. Platformun kesintisiz ve hatasız çalışacağı garanti edilmez.",
      },
      {
        heading: "7. Fikri Mülkiyet Hakları",
        content:
          "Sefira logosu, tasarımı, yazılım altyapısı ve özgün içerikleri Sefira Technologies'e aittir. İzinsiz kopyalanamaz, dağıtılamaz veya değiştirilemez. Kullanıcılar platforma yükledikleri içerikler için Sefira'ya dünya genelinde, telifsiz, devredilebilir bir lisans vermiş sayılır. Bu lisans yalnızca platformun işletilmesi için kullanılır; içerikleriniz üçüncü şahıslarla paylaşılmaz.",
      },
      {
        heading: "8. Kişisel Verilerin Korunması",
        content:
          "Kişisel verileriniz Gizlilik Politikamız çerçevesinde işlenmektedir. Platformu kullanarak Gizlilik Politikamızı da kabul etmiş sayılırsınız. Verilerinizin nasıl toplandığı, kullanıldığı ve korunduğu hakkında ayrıntılı bilgiye /privacy adresinden ulaşabilirsiniz.",
      },
      {
        heading: "9. Değişiklik Hakkı",
        content:
          "Sefira, bu Koşulları herhangi bir zamanda değiştirme hakkını saklı tutar. Önemli değişiklikler öncesinde kayıtlı e-posta adresinize bildirim gönderilecektir. Değişikliklerin yayınlanmasından sonra platformu kullanmaya devam etmeniz, güncellenmiş Koşulları kabul ettiğiniz anlamına gelir.",
      },
      {
        heading: "10. Uygulanacak Hukuk ve Yetki",
        content:
          "Bu Koşullar Türk hukukuna tabidir. Bu Koşullardan kaynaklanan herhangi bir uyuşmazlıkta İstanbul mahkemeleri ve icra daireleri yetkilidir.",
      },
      {
        heading: "11. İletişim",
        content:
          "Bu Kullanım Koşullarına ilişkin sorularınız için bizimle iletişime geçebilirsiniz:",
      },
    ],
    contactEmail: "support@getsefira.com",
  },

  en: {
    title: "Terms of Use",
    lastUpdated: "Last Updated: 01.06.2026",
    backButton: "← Back to Home",
    contactLabel: "Contact",
    sections: [
      {
        heading: "1. Parties",
        content:
          "These Terms of Use (\"Terms\") govern the legal relationship between Sefira Technologies (\"Sefira\", \"we\" or \"platform\") and individuals who use the Sefira website and mobile application (\"User\" or \"you\"). By accessing the platform or creating an account, you declare that you have read, understood and accepted these Terms.",
      },
      {
        heading: "2. Nature of the Platform",
        content:
          "Sefira is an online listing and matching platform that helps room seekers find suitable roommates and shared living spaces. Sefira is not a real estate agency, shared living company or property consultant. Listings on the platform belong to third parties; Sefira does not guarantee the accuracy, authenticity or reliability of these listings.",
      },
      {
        heading: "3. Registration and Account Security",
        content:
          "You must be at least 18 years old to register on the platform. You undertake that the information you provide when creating your account is accurate, current and complete. You are responsible for the security of your account; do not share your password with anyone. If you notice any unauthorised access to your account, you must immediately notify support@getsefira.com. If your account has been deactivated or suspended, you may not create a new account.",
      },
      {
        heading: "4. User Obligations",
        content:
          "By using the platform you agree to comply with the following rules:\n• You will act only on your own behalf; you will not open accounts on behalf of others or using false identities.\n• You will not share misleading, deceptive or incorrect information.\n• You will not share harassment, hate speech, threats or obscene content.\n• You will not take any action that damages Sefira's infrastructure (DDoS attacks, bots, scraping, etc.).\n• You will not use unauthorised third-party tools to access the platform.\n• You will comply with all applicable local and international laws.",
      },
      {
        heading: "5. Listings and Content",
        content:
          "Users who publish listings on the platform declare that all information they share is accurate and up to date. Publishing misleading, fake or duplicate listings is prohibited. Sefira reserves the right to remove any content it deems inappropriate without prior notice. Removal of a listing may also result in the user being permanently removed from the platform. Users bear responsibility for intellectual property rights arising from photos, text and other content they upload.",
      },
      {
        heading: "6. Limitation of Liability",
        content:
          "Sefira is not a party to disputes between users and assumes no responsibility for them. Sefira cannot be held responsible for roommate agreements, payment disputes or security issues between users who have met through the platform. Sefira makes no warranty as to the accuracy, legality or non-infringement of third-party rights regarding content uploaded to the platform. Sefira does not guarantee that the platform will operate without interruption or errors.",
      },
      {
        heading: "7. Intellectual Property Rights",
        content:
          "The Sefira logo, design, software infrastructure and original content belong to Sefira Technologies. They may not be copied, distributed or modified without permission. Users are deemed to have granted Sefira a worldwide, royalty-free, transferable licence for content they upload to the platform. This licence is used solely for the operation of the platform; your content is not shared with third parties.",
      },
      {
        heading: "8. Protection of Personal Data",
        content:
          "Your personal data is processed in accordance with our Privacy Policy. By using the platform you are also deemed to have accepted our Privacy Policy. Detailed information on how your data is collected, used and protected is available at /privacy.",
      },
      {
        heading: "9. Right to Amend",
        content:
          "Sefira reserves the right to modify these Terms at any time. A notification will be sent to your registered email address before significant changes. Continuing to use the platform after changes are published means you accept the updated Terms.",
      },
      {
        heading: "10. Governing Law and Jurisdiction",
        content:
          "These Terms are governed by Turkish law. For any dispute arising from these Terms, the courts and enforcement offices of Istanbul shall have jurisdiction.",
      },
      {
        heading: "11. Contact",
        content:
          "For questions regarding these Terms of Use, please contact us:",
      },
    ],
    contactEmail: "support@getsefira.com",
  },

  fa: {
    title: "شرایط استفاده",
    lastUpdated: "آخرین بروزرسانی: ۱ ژوئن ۲۰۲۶",
    backButton: "→ بازگشت به صفحه اصلی",
    contactLabel: "تماس",
    sections: [
      {
        heading: "۱. طرف‌های قرارداد",
        content:
          "این شرایط استفاده («شرایط») رابطه حقوقی بین Sefira Technologies («سفیرا»، «ما» یا «پلتفرم») و افرادی که از وب‌سایت و اپلیکیشن موبایل سفیرا استفاده می‌کنند («کاربر» یا «شما») را تنظیم می‌کند. با دسترسی به پلتفرم یا ایجاد حساب کاربری، اعلام می‌کنید که این شرایط را خوانده، درک کرده و پذیرفته‌اید.",
      },
      {
        heading: "۲. ماهیت پلتفرم",
        content:
          "سفیرا یک پلتفرم آنلاین آگهی و تطبیق است که به هم‌خانه‌یابان در یافتن هم‌اتاقی‌های مناسب و هم‌خانگی کمک می‌کند. سفیرا آژانس مسکن، شرکت هم‌خانگی یا مشاور ملک نیست. آگهی‌های موجود در پلتفرم متعلق به اشخاص ثالث هستند؛ سفیرا صحت، اصالت یا قابلیت اطمینان این آگهی‌ها را تضمین نمی‌کند.",
      },
      {
        heading: "۳. ثبت‌نام و امنیت حساب",
        content:
          "برای ثبت‌نام در پلتفرم باید حداقل ۱۸ سال داشته باشید. متعهد می‌شوید که اطلاعات ارائه‌شده هنگام ایجاد حساب دقیق، به‌روز و کامل باشد. مسئولیت امنیت حساب شما بر عهده خود شماست؛ رمز عبور خود را با کسی به اشتراک نگذارید. در صورت مشاهده دسترسی غیرمجاز به حسابتان، باید فوراً به support@getsefira.com اطلاع دهید.",
      },
      {
        heading: "۴. تعهدات کاربر",
        content:
          "با استفاده از پلتفرم موافقت می‌کنید که:\n• فقط به نام خودتان عمل کنید و حساب‌های جعلی نسازید.\n• اطلاعات گمراه‌کننده، فریبنده یا نادرست به اشتراک نگذارید.\n• محتوای آزاردهنده، نفرت‌انگیز، تهدیدآمیز یا مستهجن منتشر نکنید.\n• هیچ اقدامی که به زیرساخت سفیرا آسیب بزند انجام ندهید.\n• از ابزارهای غیرمجاز شخص ثالث برای دسترسی به پلتفرم استفاده نکنید.\n• از تمام قوانین محلی و بین‌المللی پیروی کنید.",
      },
      {
        heading: "۵. آگهی‌ها و محتوا",
        content:
          "کاربرانی که آگهی در پلتفرم منتشر می‌کنند اعلام می‌دارند که تمام اطلاعات به اشتراک گذاشته‌شده دقیق و به‌روز است. انتشار آگهی‌های گمراه‌کننده، جعلی یا تکراری ممنوع است. سفیرا این حق را برای خود محفوظ می‌دارد که هر محتوایی را که نامناسب می‌داند بدون اطلاع قبلی حذف کند.",
      },
      {
        heading: "۶. محدودیت مسئولیت",
        content:
          "سفیرا طرف اختلافات بین کاربران نیست و هیچ مسئولیتی در قبال آن‌ها نمی‌پذیرد. سفیرا در قبال توافقنامه‌های هم‌خانگی، اختلافات پرداختی یا مسائل امنیتی بین کاربرانی که از طریق پلتفرم با هم آشنا شده‌اند مسئول نیست. سفیرا پیوستگی بدون وقفه یا بدون خطای پلتفرم را تضمین نمی‌کند.",
      },
      {
        heading: "۷. حقوق مالکیت معنوی",
        content:
          "لوگو، طراحی، زیرساخت نرم‌افزاری و محتوای اصلی سفیرا متعلق به Sefira Technologies است. بدون مجوز نمی‌توان آن‌ها را کپی، توزیع یا تغییر داد. کاربران با بارگذاری محتوا در پلتفرم، مجوزی جهانی، بدون حق‌الامتیاز و قابل انتقال به سفیرا اعطا می‌کنند که صرفاً برای بهره‌برداری از پلتفرم استفاده می‌شود.",
      },
      {
        heading: "۸. حفاظت از داده‌های شخصی",
        content:
          "داده‌های شخصی شما مطابق با سیاست حریم خصوصی ما پردازش می‌شود. با استفاده از پلتفرم، سیاست حریم خصوصی ما را نیز پذیرفته‌اید. اطلاعات تفصیلی در /privacy موجود است.",
      },
      {
        heading: "۹. حق تغییر",
        content:
          "سفیرا این حق را برای خود محفوظ می‌دارد که این شرایط را در هر زمانی تغییر دهد. قبل از تغییرات مهم، اطلاعیه‌ای به آدرس ایمیل ثبت‌شده شما ارسال خواهد شد. ادامه استفاده از پلتفرم پس از انتشار تغییرات به معنای پذیرش شرایط به‌روز‌شده است.",
      },
      {
        heading: "۱۰. قانون حاکم و صلاحیت",
        content:
          "این شرایط تابع قانون ترکیه است. برای هر اختلافی که از این شرایط ناشی شود، دادگاه‌ها و ادارات اجرایی استانبول صالح هستند.",
      },
      {
        heading: "۱۱. تماس",
        content:
          "برای سؤالات مربوط به این شرایط استفاده، لطفاً با ما تماس بگیرید:",
      },
    ],
    contactEmail: "support@getsefira.com",
  },

  ar: {
    title: "شروط الاستخدام",
    lastUpdated: "آخر تحديث: ١ يونيو ٢٠٢٦",
    backButton: "→ العودة إلى الصفحة الرئيسية",
    contactLabel: "التواصل",
    sections: [
      {
        heading: "١. الأطراف",
        content:
          "تنظّم شروط الاستخدام هذه («الشروط») العلاقة القانونية بين Sefira Technologies («سفيرا» أو «المنصة») والأفراد الذين يستخدمون موقع سفيرا الإلكتروني وتطبيقها المحمول («المستخدم» أو «أنت»). بالوصول إلى المنصة أو إنشاء حساب، تُقرّ بأنك قرأت هذه الشروط وفهمتها وقبلتها.",
      },
      {
        heading: "٢. طبيعة المنصة",
        content:
          "سفيرا منصة إعلانات ومطابقة إلكترونية تساعد الباحثين عن شريك سكن في إيجاد شركاء سكن مناسبين ومساكن مشتركة. سفيرا ليست وكالة عقارية ولا شركة مشاركة سكنية ولا مستشاراً للعقارات. تنتمي الإعلانات الموجودة في المنصة إلى أطراف ثالثة؛ ولا تضمن سفيرا دقتها أو أصالتها أو موثوقيتها.",
      },
      {
        heading: "٣. التسجيل وأمان الحساب",
        content:
          "يجب أن يكون عمرك ١٨ عامًا على الأقل للتسجيل في المنصة. تتعهد بأن تكون المعلومات التي تقدمها عند إنشاء حسابك دقيقة وحديثة وكاملة. أنت مسؤول عن أمان حسابك؛ لا تشارك كلمة مرورك مع أي شخص. إذا لاحظت أي وصول غير مصرح به، يجب إخطار support@getsefira.com فورًا.",
      },
      {
        heading: "٤. التزامات المستخدم",
        content:
          "باستخدام المنصة توافق على:\n• التصرف بموجب هويتك الحقيقية فقط وعدم فتح حسابات وهمية.\n• عدم مشاركة معلومات مضللة أو كاذبة.\n• عدم نشر محتوى مسيء أو خطاب كراهية أو تهديدات أو محتوى فاحش.\n• عدم الإضرار بالبنية التحتية لسفيرا.\n• عدم استخدام أدوات غير مصرح بها للوصول إلى المنصة.\n• الامتثال لجميع القوانين المحلية والدولية المعمول بها.",
      },
      {
        heading: "٥. الإعلانات والمحتوى",
        content:
          "يُقرّ المستخدمون الذين ينشرون إعلانات بأن جميع المعلومات التي يشاركونها دقيقة ومحدَّثة. يُحظر نشر إعلانات مضللة أو مزيفة أو مكررة. تحتفظ سفيرا بحق إزالة أي محتوى تراه غير لائق دون إشعار مسبق.",
      },
      {
        heading: "٦. تحديد المسؤولية",
        content:
          "سفيرا ليست طرفًا في النزاعات بين المستخدمين ولا تتحمل أي مسؤولية عنها. لا تُسأل سفيرا عن اتفاقيات المشاركة السكنية أو نزاعات الدفع أو مشكلات الأمان بين المستخدمين الذين تقابلوا عبر المنصة. لا تضمن سفيرا عمل المنصة بشكل مستمر وخالٍ من الأخطاء.",
      },
      {
        heading: "٧. حقوق الملكية الفكرية",
        content:
          "تعود شعار سفيرا وتصميمها وبنيتها التحتية البرمجية ومحتواها الأصلي إلى Sefira Technologies. لا يجوز نسخها أو توزيعها أو تعديلها دون إذن. يُعدّ المستخدمون بتحميل المحتوى أنهم منحوا سفيرا ترخيصًا عالميًا خاليًا من حقوق الملكية قابلًا للنقل، يُستخدم فقط لتشغيل المنصة.",
      },
      {
        heading: "٨. حماية البيانات الشخصية",
        content:
          "تُعالَج بياناتك الشخصية وفقًا لسياسة الخصوصية الخاصة بنا. باستخدام المنصة تُعدّ موافقًا أيضًا على سياسة الخصوصية. تفاصيل جمع بياناتك واستخدامها وحمايتها متاحة على /privacy.",
      },
      {
        heading: "٩. حق التعديل",
        content:
          "تحتفظ سفيرا بحق تعديل هذه الشروط في أي وقت. ستُرسل إشعارات إلى عنوان بريدك الإلكتروني المسجَّل قبل التغييرات الجوهرية. مواصلة استخدام المنصة بعد نشر التغييرات تعني قبولك للشروط المحدَّثة.",
      },
      {
        heading: "١٠. القانون الواجب التطبيق والاختصاص القضائي",
        content:
          "تخضع هذه الشروط للقانون التركي. لأي نزاع ناشئ عن هذه الشروط، تكون محاكم إسطنبول ودوائرها التنفيذية هي الجهة المختصة.",
      },
      {
        heading: "١١. التواصل",
        content:
          "للاستفسار عن شروط الاستخدام هذه، يرجى التواصل معنا:",
      },
    ],
    contactEmail: "support@getsefira.com",
  },

  de: {
    title: "Nutzungsbedingungen",
    lastUpdated: "Zuletzt aktualisiert: 01.06.2026",
    backButton: "← Zurück zur Startseite",
    contactLabel: "Kontakt",
    sections: [
      {
        heading: "1. Parteien",
        content:
          "Diese Nutzungsbedingungen («Bedingungen») regeln die rechtliche Beziehung zwischen Sefira Technologies («Sefira», «wir» oder «Plattform») und natürlichen Personen, die die Sefira-Website und -Mobilanwendung nutzen («Benutzer» oder «Sie»). Durch den Zugriff auf die Plattform oder die Erstellung eines Kontos erklären Sie, diese Bedingungen gelesen, verstanden und akzeptiert zu haben.",
      },
      {
        heading: "2. Art der Plattform",
        content:
          "Sefira ist eine Online-Listing- und Matching-Plattform, die WG-Suchenden hilft, geeignete Mitbewohner und WG-Zimmer zu finden. Sefira ist weder eine Immobilienagentur noch ein WG-Vermittlungsunternehmen noch ein Immobilienberater. Inserate auf der Plattform gehören Dritten; Sefira garantiert nicht die Richtigkeit, Echtheit oder Zuverlässigkeit dieser Inserate.",
      },
      {
        heading: "3. Registrierung und Kontosicherheit",
        content:
          "Sie müssen mindestens 18 Jahre alt sein, um sich auf der Plattform zu registrieren. Sie verpflichten sich, bei der Kontoerstellung korrekte, aktuelle und vollständige Angaben zu machen. Sie sind für die Sicherheit Ihres Kontos verantwortlich; teilen Sie Ihr Passwort mit niemandem. Bei unbefugtem Zugriff auf Ihr Konto müssen Sie umgehend support@getsefira.com benachrichtigen.",
      },
      {
        heading: "4. Benutzerpflichten",
        content:
          "Durch die Nutzung der Plattform erklären Sie sich bereit:\n• nur in eigenem Namen zu handeln und keine Konten unter falschen Identitäten zu erstellen.\n• keine irreführenden, täuschenden oder falschen Informationen zu teilen.\n• keine belästigenden, hasserfüllten, bedrohlichen oder obszönen Inhalte zu teilen.\n• keine Maßnahmen zu ergreifen, die der Infrastruktur von Sefira schaden.\n• keine nicht autorisierten Drittanbieter-Tools für den Zugriff auf die Plattform zu verwenden.\n• alle geltenden lokalen und internationalen Gesetze einzuhalten.",
      },
      {
        heading: "5. Inserate und Inhalte",
        content:
          "Benutzer, die Inserate auf der Plattform veröffentlichen, erklären, dass alle geteilten Informationen korrekt und aktuell sind. Das Veröffentlichen irreführender, gefälschter oder doppelter Inserate ist verboten. Sefira behält sich das Recht vor, unangemessene Inhalte ohne Vorankündigung zu entfernen.",
      },
      {
        heading: "6. Haftungsbeschränkung",
        content:
          "Sefira ist keine Partei bei Streitigkeiten zwischen Benutzern und übernimmt dafür keine Haftung. Sefira haftet nicht für Mitbewohner-Vereinbarungen, Zahlungsstreitigkeiten oder Sicherheitsprobleme zwischen Benutzern, die sich über die Plattform kennengelernt haben. Sefira garantiert keinen ununterbrochenen und fehlerfreien Betrieb der Plattform.",
      },
      {
        heading: "7. Geistige Eigentumsrechte",
        content:
          "Das Sefira-Logo, das Design, die Softwareinfrastruktur und die originalen Inhalte gehören Sefira Technologies. Sie dürfen ohne Genehmigung nicht kopiert, verteilt oder verändert werden. Benutzer, die Inhalte auf die Plattform hochladen, gewähren Sefira eine weltweite, lizenzgebührenfreie, übertragbare Lizenz, die ausschließlich für den Betrieb der Plattform genutzt wird.",
      },
      {
        heading: "8. Schutz personenbezogener Daten",
        content:
          "Ihre personenbezogenen Daten werden gemäß unserer Datenschutzrichtlinie verarbeitet. Durch die Nutzung der Plattform akzeptieren Sie auch unsere Datenschutzrichtlinie. Detaillierte Informationen zur Erhebung, Nutzung und zum Schutz Ihrer Daten finden Sie unter /privacy.",
      },
      {
        heading: "9. Änderungsrecht",
        content:
          "Sefira behält sich das Recht vor, diese Bedingungen jederzeit zu ändern. Vor wesentlichen Änderungen wird eine Benachrichtigung an Ihre registrierte E-Mail-Adresse gesendet. Die weitere Nutzung der Plattform nach der Veröffentlichung von Änderungen bedeutet, dass Sie die aktualisierten Bedingungen akzeptieren.",
      },
      {
        heading: "10. Anwendbares Recht und Gerichtsstand",
        content:
          "Diese Bedingungen unterliegen türkischem Recht. Für Streitigkeiten aus diesen Bedingungen sind die Gerichte und Vollstreckungsbehörden in Istanbul zuständig.",
      },
      {
        heading: "11. Kontakt",
        content:
          "Bei Fragen zu diesen Nutzungsbedingungen können Sie uns kontaktieren:",
      },
    ],
    contactEmail: "support@getsefira.com",
  },

  ru: {
    title: "Условия использования",
    lastUpdated: "Последнее обновление: 01.06.2026",
    backButton: "← На главную страницу",
    contactLabel: "Контакт",
    sections: [
      {
        heading: "1. Стороны",
        content:
          "Настоящие Условия использования («Условия») регулируют правовые отношения между Sefira Technologies («Sefira», «мы» или «платформа») и физическими лицами, использующими веб-сайт и мобильное приложение Sefira («Пользователь» или «вы»). Получая доступ к платформе или создавая учётную запись, вы заявляете, что прочитали, поняли и приняли настоящие Условия.",
      },
      {
        heading: "2. Характер платформы",
        content:
          "Sefira — это онлайн-платформа для размещения объявлений и подбора, которая помогает ищущим соседей найти подходящих соседей и жильё для совместного проживания. Sefira не является риелторским агентством, компанией по совместному проживанию или консультантом по недвижимости. Объявления на платформе принадлежат третьим лицам; Sefira не гарантирует их точность, подлинность или достоверность.",
      },
      {
        heading: "3. Регистрация и безопасность учётной записи",
        content:
          "Для регистрации на платформе вам должно быть не менее 18 лет. Вы обязуетесь предоставлять точные, актуальные и полные сведения при создании учётной записи. Вы несёте ответственность за безопасность своей учётной записи; не сообщайте пароль никому. При обнаружении несанкционированного доступа необходимо немедленно уведомить support@getsefira.com.",
      },
      {
        heading: "4. Обязательства пользователя",
        content:
          "Используя платформу, вы соглашаетесь:\n• действовать только от своего имени и не создавать поддельные учётные записи.\n• не распространять вводящую в заблуждение или ложную информацию.\n• не публиковать оскорбительный, разжигающий ненависть, угрожающий или непристойный контент.\n• не предпринимать действий, наносящих ущерб инфраструктуре Sefira.\n• не использовать несанкционированные сторонние инструменты для доступа к платформе.\n• соблюдать все применимые местные и международные законы.",
      },
      {
        heading: "5. Объявления и контент",
        content:
          "Пользователи, размещающие объявления на платформе, заявляют, что все предоставленные ими сведения точны и актуальны. Публикация вводящих в заблуждение, поддельных или дублирующих объявлений запрещена. Sefira оставляет за собой право удалять любой контент, признанный ненадлежащим, без предварительного уведомления.",
      },
      {
        heading: "6. Ограничение ответственности",
        content:
          "Sefira не является стороной в спорах между пользователями и не несёт за них никакой ответственности. Sefira не несёт ответственности за соглашения о совместном проживании, платёжные споры или проблемы безопасности между пользователями, познакомившимися через платформу. Sefira не гарантирует бесперебойную и безошибочную работу платформы.",
      },
      {
        heading: "7. Права интеллектуальной собственности",
        content:
          "Логотип Sefira, дизайн, программная инфраструктура и оригинальный контент принадлежат Sefira Technologies. Их запрещается копировать, распространять или изменять без разрешения. Загружая контент на платформу, пользователи предоставляют Sefira всемирную безвозмездную передаваемую лицензию, которая используется исключительно для работы платформы.",
      },
      {
        heading: "8. Защита персональных данных",
        content:
          "Ваши персональные данные обрабатываются в соответствии с нашей Политикой конфиденциальности. Используя платформу, вы также считаетесь принявшим Политику конфиденциальности. Подробная информация о сборе, использовании и защите ваших данных доступна по адресу /privacy.",
      },
      {
        heading: "9. Право на изменение",
        content:
          "Sefira оставляет за собой право изменять настоящие Условия в любое время. Перед существенными изменениями на ваш зарегистрированный адрес электронной почты будет отправлено уведомление. Продолжение использования платформы после публикации изменений означает принятие обновлённых Условий.",
      },
      {
        heading: "10. Применимое право и юрисдикция",
        content:
          "Настоящие Условия регулируются законодательством Турции. Все споры, возникающие из настоящих Условий, подлежат рассмотрению судами и исполнительными органами Стамбула.",
      },
      {
        heading: "11. Контакт",
        content:
          "По вопросам, связанным с настоящими Условиями использования, обращайтесь к нам:",
      },
    ],
    contactEmail: "support@getsefira.com",
  },
};

function renderSectionContent(content: string, isRtl: boolean) {
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
        <ul className={`text-sm text-gray-600 leading-relaxed mt-2 space-y-1 list-disc list-inside`}>
          {bullets.map((b, i) => (
            <li key={i}>{b}</li>
          ))}
        </ul>
      )}
    </>
  );
}

export default function TermsPage() {
  const { lang } = useLang();

  const content = TERMS_CONTENT[lang] || TERMS_CONTENT["tr"];
  const isRtl = lang === "fa" || lang === "ar";

  return (
    <div className="min-h-screen bg-white">
      <div
        className={`max-w-2xl mx-auto px-4 pt-8 pb-24 md:pb-8 ${isRtl ? "text-right" : "text-left"}`}
        dir={isRtl ? "rtl" : "ltr"}
      >
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white text-sm font-bold px-4 py-2 rounded-2xl transition-colors duration-200 mb-8"
        >
          {content.backButton}
        </Link>

        <h1 className="text-2xl font-black text-gray-900 mb-2">{content.title}</h1>
        <p className="text-xs text-gray-400 mb-6">{content.lastUpdated}</p>

        <hr className="border-t border-gray-100 my-4" />

        {content.sections.map((section, i) => {
          const isLastSection = i === content.sections.length - 1;
          return (
            <div key={i}>
              <h2 className="text-lg font-bold text-gray-800 mt-6 mb-2">{section.heading}</h2>
              {renderSectionContent(section.content, isRtl)}
              {isLastSection && (
                <ul className="text-sm text-gray-600 leading-relaxed mt-2 space-y-1">
                  <li>
                    {content.contactLabel}:{" "}
                    <span className="text-orange-600 font-medium" dir="ltr">
                      {content.contactEmail}
                    </span>
                  </li>
                </ul>
              )}
              <hr className="border-t border-gray-100 my-4" />
            </div>
          );
        })}

        <p className="text-xs text-gray-400 mt-2 mb-4">© 2026 Sefira Technologies</p>

        <div className="mb-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white text-sm font-bold px-4 py-2 rounded-2xl transition-colors duration-200"
          >
            {content.backButton}
          </Link>
        </div>
      </div>
    </div>
  );
}
