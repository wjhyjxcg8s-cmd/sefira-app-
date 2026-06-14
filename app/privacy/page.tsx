"use client";

import Link from "next/link";
import { useLang } from "@/app/lib/LangContext";

type Section = { heading: string; content: string };

type LangContent = {
  title: string;
  lastUpdated: string;
  backButton: string;
  sections: Section[];
  contactLabel: string;
  websiteLabel: string;
  contactEmail: string;
  contactWebsite: string;
  footer: string;
};

const PRIVACY_CONTENT: Record<string, LangContent> = {
  tr: {
    title: "Gizlilik Politikası ve KVKK Aydınlatma Metni",
    lastUpdated: "Son Güncelleme: 31 Mayıs 2026",
    backButton: "← Ana Sayfaya Dön",
    contactLabel: "E-posta",
    websiteLabel: "Web sitesi",
    footer: "© 2026 Sefira Technologies. Tüm hakları saklıdır.",
    sections: [
      {
        heading: "1. Veri Sorumlusu",
        content:
          "6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) kapsamında veri sorumlusu sıfatıyla hareket eden Sefira Technologies, kullanıcılarına ait kişisel verileri işbu aydınlatma metni çerçevesinde işlemektedir. Platformumuza erişim sağlayarak veya hizmetlerimizi kullanarak bu politikayı kabul etmiş sayılırsınız. Kişisel verileriniz, www.getsefira.com alan adlı web sitesi ve mobil uygulama aracılığıyla toplanmaktadır.",
      },
      {
        heading: "2. Toplanan Kişisel Veriler",
        content:
          "Sefira olarak aşağıdaki kişisel veri kategorilerini toplamaktayız:\n• Kimlik bilgileri: Ad, soyad, doğum tarihi, cinsiyet\n• İletişim bilgileri: E-posta adresi, telefon numarası\n• Hesap bilgileri: Kullanıcı adı, şifre (şifrelenmiş olarak), profil fotoğrafı\n• Konum bilgileri: Şehir, ülke ve tercih edilen mahalle\n• Profil bilgileri: Yaşam tarzı tercihleri, bütçe aralığı, evcil hayvan ve sigara durumu\n• Ödeme bilgileri: Fatura adresi ve ödeme yöntemi (kart numaraları Stripe üzerinden işlenir, tarafımızca saklanmaz)\n• Kullanım verileri: Oturum süresi, tıklama davranışları, arama geçmişi\n• Teknik veriler: IP adresi, tarayıcı türü, işletim sistemi, cihaz kimliği",
      },
      {
        heading: "3. Kişisel Verilerin İşlenme Amaçları",
        content:
          "Kişisel verileriniz aşağıdaki amaçlar doğrultusunda işlenmektedir:\n• Hesap oluşturma, kimlik doğrulama ve güvenli giriş sağlama\n• Ev arkadaşı ve konut eşleştirme hizmetinin sunulması\n• Yapay zeka destekli uyumluluk analizi gerçekleştirilmesi\n• Ödeme işlemlerinin güvenli biçimde gerçekleştirilmesi\n• Platform güvenliğinin sağlanması ve sahtekârlığın önlenmesi\n• Kullanıcı destek hizmetlerinin sunulması\n• Yasal yükümlülüklerin yerine getirilmesi\n• İzin verilen kullanıcılara pazarlama ve bildirim iletilmesi\n• Hizmet kalitesinin iyileştirilmesi amacıyla istatistiksel analiz yapılması",
      },
      {
        heading: "4. Hukuki Dayanaklar",
        content:
          "Kişisel verileriniz aşağıdaki hukuki dayanaklar çerçevesinde işlenmektedir:\n• Açık rıza: Pazarlama bildirimleri ve isteğe bağlı profil bilgileri için\n• Sözleşmenin ifası: Hesap ve eşleştirme hizmetlerinin sunulması için\n• Meşru menfaat: Platform güvenliği ve hizmet iyileştirme faaliyetleri için\n• Yasal yükümlülük: Vergi, muhasebe ve resmi bildirim gereklilikleri için\n• Kamu yararı: Zorunlu hallerde yetkili makam talepleri doğrultusunda",
      },
      {
        heading: "5. Kişisel Verilerin Paylaşımı",
        content:
          "Kişisel verileriniz aşağıdaki taraflarla paylaşılabilir:\n• Hizmet sağlayıcılar: Supabase (veritabanı ve kimlik doğrulama), Stripe (ödeme işlemleri), Cloudflare (güvenlik ve CDN)\n• Analiz araçları: Google Analytics (anonim kullanım istatistikleri)\n• Yasal makamlar: Mahkeme kararı veya yasal zorunluluk halinde\n• İş ortakları: Açık rızanız olmaksızın üçüncü taraf reklamcılarla asla paylaşılmaz\nVerileriniz satılmaz, kiralanmaz veya ticari amaçla devredilemez.",
      },
      {
        heading: "6. Uluslararası Veri Transferleri",
        content:
          "Platformumuz küresel olarak hizmet verdiğinden, kişisel verileriniz Türkiye dışındaki sunucularda işlenebilir. Bu transferlerde KVKK'nın 9. maddesi ve Kişisel Verileri Koruma Kurulu kararları doğrultusunda gerekli güvenceler sağlanmaktadır. Verileriniz yalnızca yeterli koruma düzeyine sahip veya gerekli taahhütleri veren ülkelere aktarılmaktadır.",
      },
      {
        heading: "7. Kişisel Veri Saklama Süreleri",
        content:
          "Kişisel verileriniz, hizmet ilişkisi süresince ve akabinde aşağıdaki süreler boyunca saklanmaktadır:\n• Hesap bilgileri: Hesap silindikten sonra 30 gün (geri yükleme imkânı için)\n• Ödeme kayıtları: Yasal zorunluluk gereği 10 yıl\n• Günlük ve teknik veriler: 90 güne kadar\n• Pazarlama tercihleri: Rıza geri alınana kadar\nSaklama süresinin sona ermesinin ardından verileriniz güvenli biçimde anonimleştirilir veya imha edilir.",
      },
      {
        heading: "8. KVKK Kapsamındaki Haklarınız",
        content:
          "KVKK'nın 11. maddesi uyarınca aşağıdaki haklara sahipsiniz:\n• Kişisel verilerinizin işlenip işlenmediğini öğrenme\n• İşlenmiş ise buna ilişkin bilgi talep etme\n• İşlenme amacını ve amaca uygun kullanılıp kullanılmadığını öğrenme\n• Yurt içi veya yurt dışında aktarıldığı üçüncü kişileri öğrenme\n• Eksik veya yanlış işlenen verilerin düzeltilmesini isteme\n• Kanunda öngörülen şartlar dahilinde silinmesini veya yok edilmesini isteme\n• Düzeltme ve silme işlemlerinin üçüncü kişilere bildirilmesini talep etme\n• İşlenen verilerin münhasıran otomatik sistemler aracılığıyla analizi sonucunda aleyhinize bir sonucun ortaya çıkmasına itiraz etme\n• Kanuna aykırı işleme nedeniyle zarara uğramanız hâlinde zararın giderilmesini talep etme\nBaşvurularınızı support@getsefira.com adresine iletebilirsiniz.",
      },
      {
        heading: "9. Çocukların Gizliliği",
        content:
          "Sefira platformu yalnızca 18 yaş ve üzeri bireyler için tasarlanmıştır. 18 yaşından küçük kişilerin hizmetlerimizi kullanması yasaktır. Bir çocuğun kişisel verilerini yanlışlıkla topladığımızı fark etmemiz durumunda, söz konusu veriler derhal silinecektir. Bu konudaki endişelerinizi support@getsefira.com adresine bildirebilirsiniz.",
      },
      {
        heading: "10. İletişim",
        content:
          "Gizlilik politikamız veya kişisel verilerinizin işlenmesi hakkında sorularınız için bizimle iletişime geçebilirsiniz:",
      },
    ],
    contactEmail: "support@getsefira.com",
    contactWebsite: "www.getsefira.com",
  },

  en: {
    title: "Privacy Policy",
    lastUpdated: "Last updated: 31 May 2026",
    backButton: "← Back to Home",
    contactLabel: "Email",
    websiteLabel: "Website",
    footer: "© 2026 Sefira Technologies. All rights reserved.",
    sections: [
      {
        heading: "1. Data Controller",
        content:
          "Sefira Technologies acts as the data controller for personal data collected through the Sefira platform. By accessing www.getsefira.com or using our mobile application, you acknowledge and accept this Privacy Policy. We are committed to protecting your personal data in accordance with applicable data protection laws, including the EU General Data Protection Regulation (GDPR) where applicable.",
      },
      {
        heading: "2. Personal Data We Collect",
        content:
          "We collect the following categories of personal data:\n• Identity data: First name, last name, date of birth, gender\n• Contact data: Email address, phone number\n• Account data: Username, encrypted password, profile photo\n• Location data: City, country, and preferred neighbourhood\n• Profile data: Lifestyle preferences, budget range, pet and smoking status\n• Payment data: Billing address and payment method (card numbers are processed by Stripe and never stored by us)\n• Usage data: Session duration, click behaviour, search history\n• Technical data: IP address, browser type, operating system, device identifier",
      },
      {
        heading: "3. Purposes of Processing",
        content:
          "We process your personal data for the following purposes:\n• Creating accounts, verifying identity, and enabling secure sign-in\n• Providing roommate and property matching services\n• Running AI-powered compatibility analysis\n• Processing payments securely\n• Ensuring platform security and preventing fraud\n• Providing user support services\n• Fulfilling legal obligations\n• Sending marketing communications and notifications to users who have opted in\n• Conducting statistical analysis to improve service quality",
      },
      {
        heading: "4. Legal Bases for Processing",
        content:
          "We process your personal data on the following legal bases:\n• Consent: For marketing notifications and optional profile information\n• Performance of a contract: To provide account and matching services\n• Legitimate interests: For platform security and service improvement activities\n• Legal obligation: For tax, accounting, and mandatory reporting requirements\n• Public interest: In mandatory cases, pursuant to requests from competent authorities",
      },
      {
        heading: "5. Data Sharing",
        content:
          "Your personal data may be shared with the following parties:\n• Service providers: Supabase (database and authentication), Stripe (payment processing), Cloudflare (security and CDN)\n• Analytics tools: Google Analytics (anonymous usage statistics)\n• Legal authorities: In the event of a court order or legal obligation\n• Business partners: Never shared with third-party advertisers without your explicit consent\nYour data is never sold, rented, or transferred for commercial purposes.",
      },
      {
        heading: "6. International Data Transfers",
        content:
          "As our platform operates globally, your personal data may be processed on servers outside your country of residence. We ensure appropriate safeguards are in place for such transfers in accordance with applicable data protection law. Your data is only transferred to countries with an adequate level of protection or that have provided the necessary commitments and guarantees.",
      },
      {
        heading: "7. Data Retention",
        content:
          "Your personal data is retained for the duration of the service relationship and thereafter for the following periods:\n• Account information: 30 days after account deletion (to allow account recovery)\n• Payment records: 10 years as required by law\n• Log and technical data: Up to 90 days\n• Marketing preferences: Until consent is withdrawn\nAfter the retention period expires, your data is securely anonymised or destroyed.",
      },
      {
        heading: "8. Your Rights",
        content:
          "You have the following rights regarding your personal data:\n• Right to be informed about whether your data is being processed\n• Right to access your personal data\n• Right to know the purpose of processing and whether it is being used accordingly\n• Right to know third parties to whom data is transferred domestically or abroad\n• Right to request correction of incomplete or inaccurate data\n• Right to request erasure or destruction under the conditions prescribed by law\n• Right to request notification of corrections and deletions to third parties\n• Right to object to decisions based solely on automated processing that produces effects concerning you\n• Right to seek compensation for damages arising from unlawful processing\nYou may submit your requests to support@getsefira.com.",
      },
      {
        heading: "9. Children's Privacy",
        content:
          "The Sefira platform is designed exclusively for individuals aged 18 and over. Persons under the age of 18 are prohibited from using our services. If we become aware that we have inadvertently collected personal data from a child, that data will be deleted immediately. You may report concerns of this nature to support@getsefira.com.",
      },
      {
        heading: "10. Contact Us",
        content:
          "If you have questions about our privacy policy or the processing of your personal data, please contact us:",
      },
    ],
    contactEmail: "support@getsefira.com",
    contactWebsite: "www.getsefira.com",
  },

  fa: {
    title: "سیاست حریم خصوصی",
    lastUpdated: "آخرین بروزرسانی: ۳۱ اردیبهشت ۱۴۰۵",
    backButton: "→ بازگشت به صفحه اصلی",
    contactLabel: "ایمیل",
    websiteLabel: "وب‌سایت",
    footer: "© ۲۰۲۶ Sefira Technologies. تمامی حقوق محفوظ است.",
    sections: [
      {
        heading: "۱. مسئول پردازش داده‌ها",
        content:
          "شرکت Sefira Technologies به عنوان مسئول پردازش داده‌های شخصی جمع‌آوری‌شده از طریق پلتفرم سفیرا عمل می‌کند. با دسترسی به www.getsefira.com یا استفاده از اپلیکیشن موبایل ما، این سیاست حریم خصوصی را می‌پذیرید. ما متعهد به حفاظت از داده‌های شخصی شما مطابق با قوانین حفاظت از داده‌های قابل اعمال هستیم.",
      },
      {
        heading: "۲. داده‌های شخصی که جمع‌آوری می‌کنیم",
        content:
          "ما دسته‌بندی‌های زیر از داده‌های شخصی را جمع‌آوری می‌کنیم:\n• اطلاعات هویتی: نام، نام خانوادگی، تاریخ تولد، جنسیت\n• اطلاعات تماس: آدرس ایمیل، شماره تلفن\n• اطلاعات حساب: نام کاربری، رمز عبور رمزنگاری‌شده، عکس پروفایل\n• اطلاعات موقعیت: شهر، کشور و محله مورد نظر\n• اطلاعات پروفایل: ترجیحات سبک زندگی، محدوده بودجه، وضعیت حیوان خانگی و سیگار\n• اطلاعات پرداخت: آدرس صورت‌حساب و روش پرداخت (شماره کارت از طریق Stripe پردازش می‌شود و توسط ما ذخیره نمی‌شود)\n• داده‌های استفاده: مدت جلسه، رفتار کلیک، سابقه جستجو\n• داده‌های فنی: آدرس IP، نوع مرورگر، سیستم عامل، شناسه دستگاه",
      },
      {
        heading: "۳. اهداف پردازش",
        content:
          "داده‌های شخصی شما برای اهداف زیر پردازش می‌شود:\n• ایجاد حساب، تأیید هویت و ورود امن\n• ارائه خدمات تطبیق هم‌خانه و ملک\n• اجرای تحلیل سازگاری مبتنی بر هوش مصنوعی\n• پردازش امن پرداخت‌ها\n• تضمین امنیت پلتفرم و جلوگیری از تقلب\n• ارائه خدمات پشتیبانی کاربر\n• انجام تعهدات قانونی\n• ارسال ارتباطات بازاریابی به کاربرانی که رضایت داده‌اند\n• انجام تحلیل آماری برای بهبود کیفیت خدمات",
      },
      {
        heading: "۴. مبانی قانونی پردازش",
        content:
          "داده‌های شخصی شما بر اساس مبانی قانونی زیر پردازش می‌شود:\n• رضایت: برای اعلان‌های بازاریابی و اطلاعات پروفایل اختیاری\n• اجرای قرارداد: برای ارائه خدمات حساب و تطبیق\n• منافع مشروع: برای فعالیت‌های امنیت پلتفرم و بهبود خدمات\n• تعهد قانونی: برای الزامات مالیاتی، حسابداری و گزارش‌دهی اجباری\n• منافع عمومی: در موارد اجباری، بنا به درخواست مقامات صلاحیت‌دار",
      },
      {
        heading: "۵. اشتراک‌گذاری داده‌ها",
        content:
          "داده‌های شخصی شما ممکن است با طرف‌های زیر به اشتراک گذاشته شود:\n• ارائه‌دهندگان خدمات: Supabase (پایگاه داده و احراز هویت)، Stripe (پردازش پرداخت)، Cloudflare (امنیت و CDN)\n• ابزارهای تحلیل: Google Analytics (آمار استفاده ناشناس)\n• مقامات قانونی: در صورت حکم دادگاه یا الزام قانونی\n• شرکای تجاری: هرگز بدون رضایت صریح شما با تبلیغ‌کنندگان شخص ثالث به اشتراک گذاشته نمی‌شود\nداده‌های شما هرگز فروخته، اجاره داده یا برای اهداف تجاری منتقل نمی‌شود.",
      },
      {
        heading: "۶. انتقال داده‌های بین‌المللی",
        content:
          "از آنجا که پلتفرم ما در سطح جهانی فعالیت می‌کند، داده‌های شخصی شما ممکن است در سرورهایی خارج از کشور محل سکونت شما پردازش شود. ما اطمینان می‌دهیم که محافظت‌های مناسب برای چنین انتقال‌هایی مطابق با قانون حفاظت از داده‌های قابل اعمال در نظر گرفته شده است.",
      },
      {
        heading: "۷. نگهداری داده‌ها",
        content:
          "داده‌های شخصی شما برای مدت رابطه خدمات و پس از آن برای دوره‌های زیر نگهداری می‌شود:\n• اطلاعات حساب: ۳۰ روز پس از حذف حساب (برای امکان بازیابی)\n• سوابق پرداخت: ۱۰ سال بنا به الزام قانونی\n• داده‌های گزارش و فنی: حداکثر ۹۰ روز\n• ترجیحات بازاریابی: تا زمان پس‌گرفتن رضایت\nپس از انقضای دوره نگهداری، داده‌های شما به صورت امن ناشناس یا نابود می‌شود.",
      },
      {
        heading: "۸. حقوق شما",
        content:
          "شما درباره داده‌های شخصی خود دارای حقوق زیر هستید:\n• حق اطلاع از اینکه آیا داده‌های شما پردازش می‌شود\n• حق دسترسی به داده‌های شخصی خود\n• حق دانستن هدف پردازش و اینکه آیا مطابق با آن استفاده می‌شود\n• حق دانستن اشخاص ثالثی که داده‌ها به آن‌ها منتقل شده\n• حق درخواست اصلاح داده‌های ناقص یا نادرست\n• حق درخواست حذف یا نابودی تحت شرایط مقرر قانونی\n• حق درخواست اطلاع‌رسانی اصلاحات و حذف‌ها به اشخاص ثالث\n• حق اعتراض به تصمیمات مبتنی صرفاً بر پردازش خودکار\n• حق جبران خسارت ناشی از پردازش غیرقانونی\nمی‌توانید درخواست‌های خود را به support@getsefira.com ارسال کنید.",
      },
      {
        heading: "۹. حریم خصوصی کودکان",
        content:
          "پلتفرم سفیرا صرفاً برای افراد ۱۸ سال و بالاتر طراحی شده است. استفاده از خدمات ما برای افراد زیر ۱۸ سال ممنوع است. اگر متوجه شویم که به طور تصادفی داده‌های شخصی یک کودک را جمع‌آوری کرده‌ایم، آن داده‌ها فوراً حذف خواهند شد. می‌توانید نگرانی‌های خود را به support@getsefira.com گزارش دهید.",
      },
      {
        heading: "۱۰. تماس با ما",
        content:
          "اگر سؤالاتی درباره سیاست حریم خصوصی ما یا پردازش داده‌های شخصی خود دارید، لطفاً با ما تماس بگیرید:",
      },
    ],
    contactEmail: "support@getsefira.com",
    contactWebsite: "www.getsefira.com",
  },

  ar: {
    title: "سياسة الخصوصية",
    lastUpdated: "آخر تحديث: ٣١ مايو ٢٠٢٦",
    backButton: "→ العودة إلى الصفحة الرئيسية",
    contactLabel: "البريد الإلكتروني",
    websiteLabel: "الموقع الإلكتروني",
    footer: "© ٢٠٢٦ Sefira Technologies. جميع الحقوق محفوظة.",
    sections: [
      {
        heading: "١. مسؤول معالجة البيانات",
        content:
          "تعمل شركة Sefira Technologies بوصفها مسؤولاً عن معالجة البيانات الشخصية التي تُجمَّع عبر منصة سفيرا. بالوصول إلى www.getsefira.com أو استخدام تطبيقنا للجوال، فأنت تُقرّ بقبول سياسة الخصوصية هذه. نلتزم بحماية بياناتك الشخصية وفق قوانين حماية البيانات المعمول بها، بما في ذلك اللائحة الأوروبية العامة لحماية البيانات (GDPR) حيثما ينطبق.",
      },
      {
        heading: "٢. البيانات الشخصية التي نجمعها",
        content:
          "نجمع الفئات التالية من البيانات الشخصية:\n• بيانات الهوية: الاسم الأول، اسم العائلة، تاريخ الميلاد، الجنس\n• بيانات التواصل: عنوان البريد الإلكتروني، رقم الهاتف\n• بيانات الحساب: اسم المستخدم، كلمة المرور المشفَّرة، صورة الملف الشخصي\n• بيانات الموقع: المدينة، البلد، والحي المفضَّل\n• بيانات الملف الشخصي: تفضيلات أسلوب الحياة، نطاق الميزانية، وضع الحيوانات الأليفة والتدخين\n• بيانات الدفع: عنوان الفواتير وطريقة الدفع (تُعالَج أرقام البطاقات عبر Stripe ولا نحتفظ بها)\n• بيانات الاستخدام: مدة الجلسة، سلوك النقر، سجل البحث\n• البيانات التقنية: عنوان IP، نوع المتصفح، نظام التشغيل، معرِّف الجهاز",
      },
      {
        heading: "٣. أغراض المعالجة",
        content:
          "تُعالَج بياناتك الشخصية للأغراض التالية:\n• إنشاء الحسابات والتحقق من الهوية وتمكين تسجيل الدخول الآمن\n• تقديم خدمات مطابقة شركاء السكن والعقارات\n• إجراء تحليل التوافق بالذكاء الاصطناعي\n• معالجة المدفوعات بشكل آمن\n• ضمان أمان المنصة ومنع الاحتيال\n• تقديم خدمات دعم المستخدمين\n• الوفاء بالالتزامات القانونية\n• إرسال اتصالات تسويقية للمستخدمين الذين وافقوا على ذلك\n• إجراء تحليل إحصائي لتحسين جودة الخدمة",
      },
      {
        heading: "٤. الأسس القانونية للمعالجة",
        content:
          "تُعالَج بياناتك الشخصية استناداً إلى الأسس القانونية التالية:\n• الموافقة: لإشعارات التسويق ومعلومات الملف الشخصي الاختيارية\n• تنفيذ العقد: لتقديم خدمات الحساب والمطابقة\n• المصالح المشروعة: لأنشطة أمان المنصة وتحسين الخدمة\n• الالتزام القانوني: لمتطلبات الضرائب والمحاسبة وإعداد التقارير الإلزامية\n• المصلحة العامة: في الحالات الإلزامية، بناءً على طلبات السلطات المختصة",
      },
      {
        heading: "٥. مشاركة البيانات",
        content:
          "قد تُشارَك بياناتك الشخصية مع الأطراف التالية:\n• مزودو الخدمات: Supabase (قاعدة البيانات والمصادقة)، Stripe (معالجة الدفع)، Cloudflare (الأمان وشبكة CDN)\n• أدوات التحليل: Google Analytics (إحصائيات الاستخدام المجهولة)\n• الجهات القانونية: في حالة صدور أمر قضائي أو التزام قانوني\n• شركاء الأعمال: لا تُشارَك أبداً مع معلنين من أطراف ثالثة دون موافقتك الصريحة\nلن تُباع بياناتك أو تُؤجَّر أو تُنقَل لأغراض تجارية.",
      },
      {
        heading: "٦. نقل البيانات الدولي",
        content:
          "نظراً لكون منصتنا تعمل على مستوى عالمي، قد تُعالَج بياناتك الشخصية على خوادم خارج بلد إقامتك. نضمن توافر الضمانات المناسبة لعمليات النقل هذه وفق قانون حماية البيانات المعمول به. لا تُنقَل بياناتك إلا إلى البلدان التي توفر مستوى كافياً من الحماية أو قدّمت الالتزامات والضمانات اللازمة.",
      },
      {
        heading: "٧. الاحتفاظ بالبيانات",
        content:
          "تُحتفَظ ببياناتك الشخصية طوال مدة علاقة الخدمة وبعدها للفترات التالية:\n• معلومات الحساب: ٣٠ يوماً بعد حذف الحساب (لإتاحة استرداده)\n• سجلات الدفع: ١٠ سنوات بموجب القانون\n• سجلات البيانات التقنية: حتى ٩٠ يوماً\n• تفضيلات التسويق: حتى سحب الموافقة\nبعد انتهاء فترة الاحتفاظ، تُجهَّل بياناتك أو تُتلَف بشكل آمن.",
      },
      {
        heading: "٨. حقوقك",
        content:
          "لديك الحقوق التالية فيما يتعلق ببياناتك الشخصية:\n• الحق في معرفة ما إذا كانت بياناتك تُعالَج\n• الحق في الوصول إلى بياناتك الشخصية\n• الحق في معرفة غرض المعالجة ومدى استخدامها وفقاً له\n• الحق في معرفة الأطراف الثالثة التي نُقلت إليها البيانات\n• الحق في طلب تصحيح البيانات الناقصة أو غير الدقيقة\n• الحق في طلب المسح أو الإتلاف وفق الشروط المقررة قانوناً\n• الحق في طلب إخطار الأطراف الثالثة بالتصحيحات والحذف\n• الحق في الاعتراض على القرارات المستندة كلياً إلى المعالجة الآلية\n• الحق في التعويض عن الأضرار الناجمة عن المعالجة غير المشروعة\nيمكنك تقديم طلباتك إلى support@getsefira.com.",
      },
      {
        heading: "٩. خصوصية الأطفال",
        content:
          "منصة سفيرا مصمَّمة حصراً للأفراد الذين تبلغ أعمارهم ١٨ عاماً فأكثر. يُحظر على الأشخاص الذين تقل أعمارهم عن ١٨ عاماً استخدام خدماتنا. إذا أدركنا أننا جمعنا بيانات شخصية عن طفل عن غير قصد، ستُحذف تلك البيانات فوراً. يمكنك الإبلاغ عن أي مخاوف في هذا الشأن إلى support@getsefira.com.",
      },
      {
        heading: "١٠. اتصل بنا",
        content:
          "إذا كانت لديك أسئلة حول سياسة الخصوصية الخاصة بنا أو معالجة بياناتك الشخصية، يرجى التواصل معنا:",
      },
    ],
    contactEmail: "support@getsefira.com",
    contactWebsite: "www.getsefira.com",
  },

  de: {
    title: "Datenschutzrichtlinie",
    lastUpdated: "Zuletzt aktualisiert: 31. Mai 2026",
    backButton: "← Zurück zur Startseite",
    contactLabel: "E-Mail",
    websiteLabel: "Webseite",
    footer: "© 2026 Sefira Technologies. Alle Rechte vorbehalten.",
    sections: [
      {
        heading: "1. Verantwortlicher",
        content:
          "Sefira Technologies fungiert als Verantwortlicher für personenbezogene Daten, die über die Sefira-Plattform erhoben werden. Durch den Zugriff auf www.getsefira.com oder die Nutzung unserer mobilen App erkennen Sie diese Datenschutzrichtlinie an. Wir verpflichten uns zum Schutz Ihrer personenbezogenen Daten gemäß den geltenden Datenschutzgesetzen, einschließlich der Datenschutz-Grundverordnung (DSGVO).",
      },
      {
        heading: "2. Von uns erhobene personenbezogene Daten",
        content:
          "Wir erheben folgende Kategorien personenbezogener Daten:\n• Identitätsdaten: Vorname, Nachname, Geburtsdatum, Geschlecht\n• Kontaktdaten: E-Mail-Adresse, Telefonnummer\n• Kontodaten: Benutzername, verschlüsseltes Passwort, Profilfoto\n• Standortdaten: Stadt, Land und bevorzugte Nachbarschaft\n• Profildaten: Lebensstilpräferenzen, Budgetrahmen, Haustier- und Raucherstatus\n• Zahlungsdaten: Rechnungsadresse und Zahlungsmethode (Kartennummern werden über Stripe verarbeitet und von uns nicht gespeichert)\n• Nutzungsdaten: Sitzungsdauer, Klickverhalten, Suchverlauf\n• Technische Daten: IP-Adresse, Browsertyp, Betriebssystem, Gerätekennung",
      },
      {
        heading: "3. Zwecke der Verarbeitung",
        content:
          "Wir verarbeiten Ihre personenbezogenen Daten zu folgenden Zwecken:\n• Kontoerstellung, Identitätsverifizierung und sichere Anmeldung\n• Bereitstellung von Mitbewohner- und Immobilien-Matching-Diensten\n• Durchführung von KI-gestützten Kompatibilitätsanalysen\n• Sichere Zahlungsabwicklung\n• Sicherstellung der Plattformsicherheit und Betrugsverhinderung\n• Bereitstellung von Nutzersupport\n• Erfüllung gesetzlicher Verpflichtungen\n• Versand von Marketing-Kommunikation an Nutzer, die zugestimmt haben\n• Statistische Analysen zur Verbesserung der Servicequalität",
      },
      {
        heading: "4. Rechtsgrundlagen der Verarbeitung",
        content:
          "Wir verarbeiten Ihre personenbezogenen Daten auf folgenden Rechtsgrundlagen:\n• Einwilligung: Für Marketing-Benachrichtigungen und optionale Profilinformationen\n• Vertragserfüllung: Zur Bereitstellung von Konto- und Matching-Diensten\n• Berechtigte Interessen: Für Plattformsicherheit und Serviceverbesserungsmaßnahmen\n• Rechtliche Verpflichtung: Für steuerliche, buchhalterische und Meldepflichten\n• Öffentliches Interesse: In Pflichtfällen auf Anfrage zuständiger Behörden",
      },
      {
        heading: "5. Datenweitergabe",
        content:
          "Ihre personenbezogenen Daten können an folgende Parteien weitergegeben werden:\n• Dienstleister: Supabase (Datenbank und Authentifizierung), Stripe (Zahlungsabwicklung), Cloudflare (Sicherheit und CDN)\n• Analyse-Tools: Google Analytics (anonyme Nutzungsstatistiken)\n• Behörden: Im Falle einer Gerichtsentscheidung oder gesetzlichen Verpflichtung\n• Geschäftspartner: Werden niemals ohne Ihre ausdrückliche Zustimmung an Drittanbieter-Werbetreibende weitergegeben\nIhre Daten werden niemals verkauft, vermietet oder für kommerzielle Zwecke übertragen.",
      },
      {
        heading: "6. Internationale Datenübertragungen",
        content:
          "Da unsere Plattform global operiert, können Ihre personenbezogenen Daten auf Servern außerhalb Ihres Wohnsitzlandes verarbeitet werden. Wir stellen sicher, dass für solche Übertragungen gemäß den geltenden Datenschutzgesetzen geeignete Schutzmaßnahmen vorhanden sind. Ihre Daten werden nur in Länder übertragen, die ein angemessenes Schutzniveau bieten oder die erforderlichen Verpflichtungen und Garantien abgegeben haben.",
      },
      {
        heading: "7. Datenspeicherung",
        content:
          "Ihre personenbezogenen Daten werden für die Dauer der Servicevertragsbeziehung und danach für folgende Zeiträume aufbewahrt:\n• Kontoinformationen: 30 Tage nach Kontolöschung (zur Ermöglichung der Wiederherstellung)\n• Zahlungsaufzeichnungen: 10 Jahre gemäß gesetzlicher Anforderung\n• Protokoll- und technische Daten: Bis zu 90 Tage\n• Marketingpräferenzen: Bis zum Widerruf der Einwilligung\nNach Ablauf der Aufbewahrungsfrist werden Ihre Daten sicher anonymisiert oder vernichtet.",
      },
      {
        heading: "8. Ihre Rechte",
        content:
          "Sie haben folgende Rechte bezüglich Ihrer personenbezogenen Daten:\n• Recht auf Information über die Verarbeitung Ihrer Daten\n• Recht auf Zugang zu Ihren personenbezogenen Daten\n• Recht auf Kenntnis des Verarbeitungszwecks und ob er entsprechend genutzt wird\n• Recht auf Kenntnis der Drittparteien, an die Daten übertragen wurden\n• Recht auf Berichtigung unvollständiger oder unrichtiger Daten\n• Recht auf Löschung oder Vernichtung unter den gesetzlich vorgeschriebenen Bedingungen\n• Recht auf Benachrichtigung Dritter über Korrekturen und Löschungen\n• Recht auf Widerspruch gegen ausschließlich auf automatisierter Verarbeitung basierenden Entscheidungen\n• Recht auf Schadensersatz bei rechtswidriger Verarbeitung\nSie können Ihre Anfragen an support@getsefira.com richten.",
      },
      {
        heading: "9. Datenschutz für Kinder",
        content:
          "Die Sefira-Plattform ist ausschließlich für Personen ab 18 Jahren konzipiert. Personen unter 18 Jahren ist die Nutzung unserer Dienste untersagt. Sollten wir feststellen, dass wir versehentlich personenbezogene Daten eines Kindes erhoben haben, werden diese umgehend gelöscht. Bedenken dieser Art können Sie an support@getsefira.com melden.",
      },
      {
        heading: "10. Kontakt",
        content:
          "Wenn Sie Fragen zu unserer Datenschutzrichtlinie oder zur Verarbeitung Ihrer personenbezogenen Daten haben, kontaktieren Sie uns bitte:",
      },
    ],
    contactEmail: "support@getsefira.com",
    contactWebsite: "www.getsefira.com",
  },

  ru: {
    title: "Политика конфиденциальности",
    lastUpdated: "Последнее обновление: 31 мая 2026 г.",
    backButton: "← На главную страницу",
    contactLabel: "Электронная почта",
    websiteLabel: "Веб-сайт",
    footer: "© 2026 Sefira Technologies. Все права защищены.",
    sections: [
      {
        heading: "1. Оператор данных",
        content:
          "Компания Sefira Technologies выступает оператором персональных данных, собираемых через платформу Sefira. Осуществляя доступ к www.getsefira.com или используя наше мобильное приложение, вы подтверждаете принятие настоящей Политики конфиденциальности. Мы обязуемся защищать ваши персональные данные в соответствии с применимым законодательством о защите данных.",
      },
      {
        heading: "2. Персональные данные, которые мы собираем",
        content:
          "Мы собираем следующие категории персональных данных:\n• Идентификационные данные: имя, фамилия, дата рождения, пол\n• Контактные данные: адрес электронной почты, номер телефона\n• Данные учётной записи: имя пользователя, зашифрованный пароль, фото профиля\n• Данные о местонахождении: город, страна, предпочтительный район\n• Данные профиля: предпочтения образа жизни, диапазон бюджета, наличие домашних животных и статус курильщика\n• Платёжные данные: платёжный адрес и способ оплаты (номера карт обрабатываются через Stripe и не хранятся нами)\n• Данные об использовании: продолжительность сессии, поведение при кликах, история поиска\n• Технические данные: IP-адрес, тип браузера, операционная система, идентификатор устройства",
      },
      {
        heading: "3. Цели обработки",
        content:
          "Мы обрабатываем ваши персональные данные в следующих целях:\n• Создание учётных записей, верификация личности и обеспечение безопасного входа\n• Предоставление услуг по подбору соседей и жилья\n• Проведение анализа совместимости на основе искусственного интеллекта\n• Безопасная обработка платежей\n• Обеспечение безопасности платформы и предотвращение мошенничества\n• Предоставление пользовательской поддержки\n• Выполнение юридических обязательств\n• Отправка маркетинговых сообщений пользователям, давшим согласие\n• Проведение статистического анализа для улучшения качества услуг",
      },
      {
        heading: "4. Правовые основания для обработки",
        content:
          "Мы обрабатываем ваши персональные данные на следующих правовых основаниях:\n• Согласие: для маркетинговых уведомлений и необязательной информации профиля\n• Исполнение договора: для предоставления услуг учётной записи и подбора\n• Законные интересы: для обеспечения безопасности платформы и улучшения услуг\n• Юридическое обязательство: для налоговых, бухгалтерских и обязательных требований отчётности\n• Общественный интерес: в обязательных случаях по запросу компетентных органов",
      },
      {
        heading: "5. Передача данных третьим лицам",
        content:
          "Ваши персональные данные могут быть переданы следующим сторонам:\n• Поставщики услуг: Supabase (база данных и аутентификация), Stripe (обработка платежей), Cloudflare (безопасность и CDN)\n• Аналитические инструменты: Google Analytics (анонимная статистика использования)\n• Правовые органы: в случае судебного решения или юридического обязательства\n• Деловые партнёры: никогда не передаются сторонним рекламодателям без вашего явного согласия\nВаши данные никогда не продаются, не сдаются в аренду и не передаются в коммерческих целях.",
      },
      {
        heading: "6. Международная передача данных",
        content:
          "Поскольку наша платформа работает на глобальном уровне, ваши персональные данные могут обрабатываться на серверах за пределами вашей страны проживания. Мы обеспечиваем наличие надлежащих гарантий для таких передач в соответствии с применимым законодательством о защите данных. Ваши данные передаются только в страны с достаточным уровнем защиты или предоставившие необходимые обязательства и гарантии.",
      },
      {
        heading: "7. Хранение данных",
        content:
          "Ваши персональные данные хранятся в течение срока действия сервисных отношений и после их окончания в течение следующих периодов:\n• Данные учётной записи: 30 дней после удаления учётной записи (для возможности восстановления)\n• Записи платежей: 10 лет в соответствии с требованиями закона\n• Журналы и технические данные: до 90 дней\n• Маркетинговые предпочтения: до отзыва согласия\nПо истечении срока хранения ваши данные надёжно анонимизируются или уничтожаются.",
      },
      {
        heading: "8. Ваши права",
        content:
          "Вы имеете следующие права в отношении своих персональных данных:\n• Право знать, обрабатываются ли ваши данные\n• Право на доступ к своим персональным данным\n• Право знать цель обработки и используются ли данные соответствующим образом\n• Право знать третьих лиц, которым переданы данные\n• Право требовать исправления неполных или неточных данных\n• Право требовать удаления или уничтожения на условиях, предусмотренных законом\n• Право требовать уведомления третьих лиц об исправлениях и удалениях\n• Право возражать против решений, принятых исключительно на основе автоматизированной обработки\n• Право на возмещение ущерба, причинённого незаконной обработкой\nВы можете направить свои запросы на адрес support@getsefira.com.",
      },
      {
        heading: "9. Конфиденциальность детей",
        content:
          "Платформа Sefira предназначена исключительно для лиц в возрасте 18 лет и старше. Лицам, не достигшим 18 лет, запрещено пользоваться нашими услугами. Если мы обнаружим, что непреднамеренно собрали персональные данные ребёнка, эти данные будут немедленно удалены. О подобных опасениях вы можете сообщить на адрес support@getsefira.com.",
      },
      {
        heading: "10. Свяжитесь с нами",
        content:
          "Если у вас есть вопросы о нашей политике конфиденциальности или об обработке ваших персональных данных, пожалуйста, свяжитесь с нами:",
      },
    ],
    contactEmail: "support@getsefira.com",
    contactWebsite: "www.getsefira.com",
  },
};

function renderContent(text: string, isRtl: boolean) {
  const lines = text.split("\n");
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
        <p key={i} className="text-sm text-gray-600 leading-relaxed mb-1">
          {p}
        </p>
      ))}
      {bullets.length > 0 && (
        <ul className="text-sm text-gray-600 leading-relaxed mt-2 space-y-1 list-disc list-inside">
          {bullets.map((b, i) => (
            <li key={i}>{b}</li>
          ))}
        </ul>
      )}
    </>
  );
}

export default function PrivacyPage() {
  const { lang } = useLang();

  const content = PRIVACY_CONTENT[lang] || PRIVACY_CONTENT["tr"];
  const isRtl = lang === "fa" || lang === "ar";

  return (
    <div className="min-h-screen bg-white">
      <div
        className={`max-w-2xl mx-auto px-4 py-8 ${isRtl ? "text-right" : "text-left"}`}
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
          const isLast = i === content.sections.length - 1;
          return (
            <div key={i}>
              <h2 className="text-lg font-bold text-gray-800 mt-6 mb-2">{section.heading}</h2>
              {renderContent(section.content, isRtl)}
              {isLast && (
                <ul className="text-sm text-gray-600 leading-relaxed mt-2 space-y-1">
                  <li>
                    {content.contactLabel}:{" "}
                    <span className="text-orange-600 font-medium" dir="ltr">
                      {content.contactEmail}
                    </span>
                  </li>
                  <li>
                    {content.websiteLabel}:{" "}
                    <span className="text-orange-600 font-medium" dir="ltr">
                      {content.contactWebsite}
                    </span>
                  </li>
                </ul>
              )}
              <hr className="border-t border-gray-100 my-4" />
            </div>
          );
        })}

        <div className="mt-6 mb-2">
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white text-sm font-bold px-4 py-2 rounded-2xl transition-colors duration-200"
          >
            {content.backButton}
          </Link>
        </div>

        <p className="text-xs text-gray-400 mt-6 mb-4" dir="ltr">
          {content.footer}
        </p>
      </div>
    </div>
  );
}
