"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useLang } from "@/app/lib/LangContext";

const commercialTypeOptionsByLang: Record<string, { slug: string; emoji: string; label: string }[]> = {
  tr: [
    { slug: "ofis", emoji: "🏢", label: "Ofis" },
    { slug: "dukkan", emoji: "🏪", label: "Dükkan" },
    { slug: "berber-koltugu", emoji: "💈", label: "Berber Koltuğu" },
    { slug: "atolye", emoji: "🔧", label: "Atölye" },
    { slug: "depo", emoji: "📦", label: "Depo" },
    { slug: "mutfak", emoji: "🍳", label: "Mutfak" },
    { slug: "icerik-studyosu", emoji: "🎬", label: "İçerik Stüdyosu" },
    { slug: "egitim-sinifi", emoji: "📚", label: "Eğitim Sınıfı" },
    { slug: "otopark", emoji: "🚗", label: "Otopark" },
    { slug: "ticari-adres", emoji: "📮", label: "Ticari Adres" },
    { slug: "kuafor-guzellik-salonu", emoji: "💇", label: "Kuaför / Güzellik Salonu" },
    { slug: "muayenehane-klinik", emoji: "🏥", label: "Muayenehane / Klinik" },
    { slug: "spor-alani", emoji: "🏋️", label: "Spor Alanı" },
    { slug: "etkinlik-salonu", emoji: "🎪", label: "Etkinlik Salonu" },
  ],
  en: [
    { slug: "ofis", emoji: "🏢", label: "Office" },
    { slug: "dukkan", emoji: "🏪", label: "Shop" },
    { slug: "berber-koltugu", emoji: "💈", label: "Barber Chair" },
    { slug: "atolye", emoji: "🔧", label: "Workshop" },
    { slug: "depo", emoji: "📦", label: "Warehouse" },
    { slug: "mutfak", emoji: "🍳", label: "Kitchen" },
    { slug: "icerik-studyosu", emoji: "🎬", label: "Content Studio" },
    { slug: "egitim-sinifi", emoji: "📚", label: "Training Room" },
    { slug: "otopark", emoji: "🚗", label: "Parking" },
    { slug: "ticari-adres", emoji: "📮", label: "Business Address" },
    { slug: "kuafor-guzellik-salonu", emoji: "💇", label: "Hair Salon / Beauty Salon" },
    { slug: "muayenehane-klinik", emoji: "🏥", label: "Clinic / Doctor's Office" },
    { slug: "spor-alani", emoji: "🏋️", label: "Sports Facility" },
    { slug: "etkinlik-salonu", emoji: "🎪", label: "Event Hall" },
  ],
  fa: [
    { slug: "ofis", emoji: "🏢", label: "آفیس" },
    { slug: "dukkan", emoji: "🏪", label: "دکان" },
    { slug: "berber-koltugu", emoji: "💈", label: "صندلی آرایشگاه" },
    { slug: "atolye", emoji: "🔧", label: "کارگاه" },
    { slug: "depo", emoji: "📦", label: "انبار" },
    { slug: "mutfak", emoji: "🍳", label: "آشپزخانه" },
    { slug: "icerik-studyosu", emoji: "🎬", label: "استودیو تولید محتوا" },
    { slug: "egitim-sinifi", emoji: "📚", label: "کلاس آموزشی" },
    { slug: "otopark", emoji: "🚗", label: "پارکینگ" },
    { slug: "ticari-adres", emoji: "📮", label: "آدرس تجاری" },
    { slug: "kuafor-guzellik-salonu", emoji: "💇", label: "آرایشگاه / سالن زیبایی" },
    { slug: "muayenehane-klinik", emoji: "🏥", label: "مطب / کلینیک" },
    { slug: "spor-alani", emoji: "🏋️", label: "فضای ورزشی" },
    { slug: "etkinlik-salonu", emoji: "🎪", label: "سالن مراسمات" },
  ],
  ar: [
    { slug: "ofis", emoji: "🏢", label: "مكتب" },
    { slug: "dukkan", emoji: "🏪", label: "محل تجاري" },
    { slug: "berber-koltugu", emoji: "💈", label: "كرسي حلاقة" },
    { slug: "atolye", emoji: "🔧", label: "ورشة" },
    { slug: "depo", emoji: "📦", label: "مستودع" },
    { slug: "mutfak", emoji: "🍳", label: "مطبخ" },
    { slug: "icerik-studyosu", emoji: "🎬", label: "استوديو المحتوى" },
    { slug: "egitim-sinifi", emoji: "📚", label: "قاعة تدريب" },
    { slug: "otopark", emoji: "🚗", label: "موقف سيارات" },
    { slug: "ticari-adres", emoji: "📮", label: "عنوان تجاري" },
    { slug: "kuafor-guzellik-salonu", emoji: "💇", label: "صالون تجميل" },
    { slug: "muayenehane-klinik", emoji: "🏥", label: "عيادة / كلينيك" },
    { slug: "spor-alani", emoji: "🏋️", label: "مرفق رياضي" },
    { slug: "etkinlik-salonu", emoji: "🎪", label: "قاعة الفعاليات" },
  ],
  de: [
    { slug: "ofis", emoji: "🏢", label: "Büro" },
    { slug: "dukkan", emoji: "🏪", label: "Laden" },
    { slug: "berber-koltugu", emoji: "💈", label: "Friseurstuhl" },
    { slug: "atolye", emoji: "🔧", label: "Werkstatt" },
    { slug: "depo", emoji: "📦", label: "Lager" },
    { slug: "mutfak", emoji: "🍳", label: "Küche" },
    { slug: "icerik-studyosu", emoji: "🎬", label: "Content-Studio" },
    { slug: "egitim-sinifi", emoji: "📚", label: "Schulungsraum" },
    { slug: "otopark", emoji: "🚗", label: "Parkplatz" },
    { slug: "ticari-adres", emoji: "📮", label: "Geschäftsadresse" },
    { slug: "kuafor-guzellik-salonu", emoji: "💇", label: "Friseursalon / Schönheitssalon" },
    { slug: "muayenehane-klinik", emoji: "🏥", label: "Praxis / Klinik" },
    { slug: "spor-alani", emoji: "🏋️", label: "Sportstätte" },
    { slug: "etkinlik-salonu", emoji: "🎪", label: "Veranstaltungssaal" },
  ],
  ru: [
    { slug: "ofis", emoji: "🏢", label: "Офис" },
    { slug: "dukkan", emoji: "🏪", label: "Магазин" },
    { slug: "berber-koltugu", emoji: "💈", label: "Кресло парикмахера" },
    { slug: "atolye", emoji: "🔧", label: "Мастерская" },
    { slug: "depo", emoji: "📦", label: "Склад" },
    { slug: "mutfak", emoji: "🍳", label: "Кухня" },
    { slug: "icerik-studyosu", emoji: "🎬", label: "Студия контента" },
    { slug: "egitim-sinifi", emoji: "📚", label: "Учебный класс" },
    { slug: "otopark", emoji: "🚗", label: "Парковка" },
    { slug: "ticari-adres", emoji: "📮", label: "Бизнес-адрес" },
    { slug: "kuafor-guzellik-salonu", emoji: "💇", label: "Салон красоты" },
    { slug: "muayenehane-klinik", emoji: "🏥", label: "Клиника / Кабинет врача" },
    { slug: "spor-alani", emoji: "🏋️", label: "Спортивный объект" },
    { slug: "etkinlik-salonu", emoji: "🎪", label: "Зал мероприятий" },
  ],
};

const commercialTypeDescriptions: Record<string, { owner: Record<string, string>; seeker: Record<string, string> }> = {
  ofis: {
    owner: {
      tr: "Ofisinizdeki boş masa, oda veya alanları serbest çalışanlar, girişimler veya diğer şirketlerle paylaşarak kullanılmayan alanınızdan gelir elde edebilirsiniz.",
      en: "If you have empty desks, rooms or space in your office, you can share them with freelancers, startups or other companies and earn income from your unused space.",
      fa: "اگر در دفتر کارتان میز، اتاق یا فضای خالی دارید، می‌توانید آن را با فریلنسرها، استارتاپ‌ها یا شرکت‌های دیگر به اشتراک بگذارید و از فضای بلااستفاده خود درآمد کسب کنید.",
      ar: "إذا كان لديك مكاتب أو غرف أو مساحات فارغة في مكتبك، يمكنك مشاركتها مع المستقلين والشركات الناشئة وكسب دخل من المساحة غير المستخدمة.",
      de: "Wenn Sie freie Schreibtische, Räume oder Flächen in Ihrem Büro haben, können Sie diese mit Freelancern, Startups oder anderen Unternehmen teilen.",
      ru: "Если в вашем офисе есть свободные столы, комнаты или площади, вы можете сдавать их фрилансерам, стартапам или другим компаниям.",
    },
    seeker: {
      tr: "Çalışma alanı, masa veya ortak ofise ihtiyacınız varsa ilan verin, alan sahipleri sizi bulsun.",
      en: "Need a desk, room or shared office? Post a listing and let space owners find you.",
      fa: "اگر برای کار، استارتاپ یا شرکت خود به میز، اتاق یا دفتر اشتراکی نیاز دارید، آگهی ثبت کنید تا صاحبان فضا با شما تماس بگیرند.",
      ar: "هل تحتاج إلى مكتب مشترك أو مساحة عمل؟ انشر إعلانك ودع أصحاب المساحات يجدونك.",
      de: "Benötigen Sie einen Schreibtisch oder ein Shared Office? Inserieren Sie und lassen Sie Raumeigentümer Sie finden.",
      ru: "Нужен стол, комната или коворкинг? Разместите объявление и позвольте владельцам пространства найти вас.",
    },
  },
  dukkan: {
    owner: {
      tr: "Dükkanınızın kullanılmayan bir bölümü varsa veya başka bir işletmeyle iş birliği yapacak kadar alanınız varsa, bu alanı başkalarıyla paylaşabilirsiniz.",
      en: "If part of your shop is unused or you have enough space to collaborate with another business, you can share it with others.",
      fa: "اگر بخشی از مغازه شما بدون استفاده مانده یا فضای کافی برای همکاری با کسب‌وکار دیگری دارید، می‌توانید آن را با دیگران به اشتراک بگذارید.",
      ar: "إذا كان جزء من محلك غير مستخدم أو لديك مساحة كافية للتعاون مع عمل آخر، يمكنك مشاركته مع الآخرين.",
      de: "Wenn ein Teil Ihres Ladens ungenutzt ist oder Sie genug Platz für die Zusammenarbeit mit einem anderen Unternehmen haben, können Sie ihn mit anderen teilen.",
      ru: "Если часть вашего магазина пустует или у вас достаточно места для сотрудничества с другим бизнесом, вы можете поделиться им.",
    },
    seeker: {
      tr: "İşletmeniz için dükkan alanı arıyorsanız ilan verin, dükkan sahipleri sizinle iletişime geçsin.",
      en: "Looking for shop space for your business? Post a listing and let shop owners reach out to you.",
      fa: "اگر برای راه‌اندازی یا گسترش کسب‌وکار خود به بخشی از یک مغازه نیاز دارید، آگهی ثبت کنید تا صاحبان مغازه شما را پیدا کنند.",
      ar: "هل تبحث عن مساحة محل لعملك؟ انشر إعلانك ودع أصحاب المحلات يتواصلون معك.",
      de: "Suchen Sie Ladenfläche für Ihr Unternehmen? Inserieren Sie und lassen Sie Eigentümer auf Sie zukommen.",
      ru: "Ищете торговую площадь для бизнеса? Разместите объявление и позвольте владельцам магазинов связаться с вами.",
    },
  },
  "berber-koltugu": {
    owner: {
      tr: "Berber salonunuzda boş koltuk varsa, bunu diğer berberlere kiralayabilir veya ortaklık şeklinde kullanımlarına sunabilirsiniz.",
      en: "If you have an empty chair in your barbershop, you can rent it to other barbers or make it available on a shared basis.",
      fa: "اگر در سالن آرایشگری خود صندلی خالی دارید، می‌توانید آن را به آرایشگران دیگر اجاره دهید یا به صورت اشتراکی در اختیارشان قرار دهید.",
      ar: "إذا كان لديك كرسي فارغ في صالون الحلاقة، يمكنك تأجيره لحلاقين آخرين أو إتاحته على أساس مشترك.",
      de: "Wenn Sie in Ihrem Friseursalon einen freien Stuhl haben, können Sie ihn an andere Friseure vermieten oder gemeinschaftlich nutzen lassen.",
      ru: "Если в вашей парикмахерской есть свободное кресло, вы можете сдать его другим мастерам.",
    },
    seeker: {
      tr: "Bir salonda berber koltuğuna ihtiyacınız varsa ilan verin, uygun salonlar sizi bulsun.",
      en: "Need a barber chair in a salon? Post a listing and let suitable salons find you.",
      fa: "اگر آرایشگر هستید و به صندلی در یک سالن نیاز دارید، آگهی ثبت کنید تا سالن‌های مناسب با شما تماس بگیرند.",
      ar: "هل تحتاج إلى كرسي حلاقة في صالون؟ انشر إعلانك ودع الصالونات المناسبة تجدك.",
      de: "Benötigen Sie einen Friseurstuhl in einem Salon? Inserieren Sie und lassen Sie passende Salons Sie finden.",
      ru: "Нужно кресло в парикмахерской? Разместите объявление и позвольте подходящим салонам найти вас.",
    },
  },
  atolye: {
    owner: {
      tr: "Atölyenizde boş alan veya başkalarının kullanabileceği ekipmanlarınız varsa, bunları diğer kişi veya işletmelerle paylaşabilirsiniz.",
      en: "If you have empty space or equipment that others can use in your workshop, you can share it with other individuals or businesses.",
      fa: "اگر در کارگاه خود فضای خالی یا تجهیزات قابل استفاده برای دیگران دارید، می‌توانید آن را با افراد یا کسب‌وکارهای دیگر به اشتراک بگذارید.",
      ar: "إذا كان لديك مساحة فارغة أو معدات يمكن للآخرين استخدامها في ورشتك، يمكنك مشاركتها مع أفراد أو شركات أخرى.",
      de: "Wenn Sie in Ihrer Werkstatt freie Flächen oder Geräte haben, die andere nutzen können, können Sie diese teilen.",
      ru: "Если в вашей мастерской есть свободное место или оборудование для других, вы можете поделиться ими.",
    },
    seeker: {
      tr: "Atölye veya çalışma alanına ihtiyacınız varsa ilan verin, alan sahipleri sizinle iletişime geçsin.",
      en: "Need a workshop or work space? Post a listing and let owners contact you.",
      fa: "اگر برای تولید، تعمیر یا فعالیت‌های فنی به کارگاه نیاز دارید، آگهی ثبت کنید تا صاحبان کارگاه شما را پیدا کنند.",
      ar: "هل تحتاج إلى ورشة عمل؟ انشر إعلانك ودع أصحاب المساحات يتواصلون معك.",
      de: "Benötigen Sie eine Werkstatt oder Arbeitsfläche? Inserieren Sie und lassen Sie Eigentümer Sie kontaktieren.",
      ru: "Нужна мастерская или рабочее пространство? Разместите объявление и позвольте владельцам связаться с вами.",
    },
  },
  depo: {
    owner: {
      tr: "Ürün depolamaya uygun bir deponuz veya alanınız varsa ve bir kısmı boşsa, bunu başkalarıyla paylaşabilirsiniz.",
      en: "If you have a warehouse or suitable space for storing goods and part of it is empty, you can share it with others.",
      fa: "اگر انبار یا فضای مناسبی برای نگهداری کالا دارید و بخشی از آن خالی است، می‌توانید آن را با دیگران به اشتراک بگذارید.",
      ar: "إذا كان لديك مستودع أو مساحة مناسبة لتخزين البضائع وجزء منها فارغ، يمكنك مشاركته مع الآخرين.",
      de: "Wenn Sie ein Lager oder geeigneten Stauraum haben und ein Teil davon leer ist, können Sie ihn mit anderen teilen.",
      ru: "Если у вас есть склад или подходящее место для хранения товаров и часть его пустует, вы можете поделиться им.",
    },
    seeker: {
      tr: "Depolama alanına ihtiyacınız varsa ilan verin, depo sahipleri sizi bulsun.",
      en: "Need storage space for your goods? Post a listing and let warehouse owners find you.",
      fa: "اگر برای نگهداری کالا یا تجهیزات به فضای انبار نیاز دارید، آگهی ثبت کنید تا صاحبان انبار با شما تماس بگیرند.",
      ar: "هل تحتاج إلى مستودع لتخزين بضاعتك؟ انشر إعلانك ودع أصحاب المستودعات يجدونك.",
      de: "Benötigen Sie Lagerfläche für Ihre Waren? Inserieren Sie und lassen Sie Lagereigentümer Sie finden.",
      ru: "Нужно складское помещение? Разместите объявление и позвольте владельцам складов найти вас.",
    },
  },
  mutfak: {
    owner: {
      tr: "Endüstriyel mutfağınız veya yemek hazırlama alanınız belirli saat veya günlerde kullanılmıyorsa, aşçılar, catering firmaları veya yemek markaları ile paylaşabilirsiniz.",
      en: "If your commercial kitchen or food preparation space is unused at certain hours or days, you can share it with chefs, caterers or food brands.",
      fa: "اگر آشپزخانه صنعتی یا فضای آماده‌سازی غذا یا رستوران دارید و در ساعات یا روزهای خاص بدون استفاده است، می‌توانید آن را با آشپزها، کترینگ‌ها یا برندهای غذایی به اشتراک بگذارید.",
      ar: "إذا كانت مطبخك التجاري أو مساحة تحضير الطعام غير مستخدمة في أوقات أو أيام معينة، يمكنك مشاركتها مع الطهاة وشركات تقديم الطعام.",
      de: "Wenn Ihre Großküche oder Speisenzubereitungsfläche zu bestimmten Zeiten ungenutzt ist, können Sie sie mit Köchen, Caterern oder Lebensmittelmarken teilen.",
      ru: "Если ваша коммерческая кухня или пространство для приготовления еды пустует в определённые часы или дни, вы можете поделиться им с поварами или кейтеринговыми компаниями.",
    },
    seeker: {
      tr: "Gıda işletmeniz için endüstriyel mutfağa ihtiyacınız varsa ilan verin, alan sahipleri sizinle iletişime geçsin.",
      en: "Need a commercial kitchen for your food business? Post a listing and let space owners reach out.",
      fa: "اگر برای کسب‌وکار غذایی یا کترینگ به آشپزخانه صنعتی نیاز دارید، آگهی ثبت کنید تا صاحبان فضا شما را پیدا کنند.",
      ar: "هل تحتاج إلى مطبخ صناعي لمشروعك الغذائي؟ انشر إعلانك ودع أصحاب المساحات يتواصلون معك.",
      de: "Benötigen Sie eine Gewerbeküche für Ihr Food-Business? Inserieren Sie und lassen Sie Eigentümer Sie kontaktieren.",
      ru: "Нужна промышленная кухня для вашего пищевого бизнеса? Разместите объявление и позвольте владельцам связаться с вами.",
    },
  },
  "icerik-studyosu": {
    owner: {
      tr: "Stüdyonuz, fotoğraf çekim alanınız veya içerik üretim ekipmanlarınız varsa, bunları içerik üreticileri, fotoğrafçılar ve kameramanlarla paylaşabilirsiniz.",
      en: "If you have a studio, photography space or content production equipment, you can make them available to content creators, photographers and videographers.",
      fa: "اگر استودیو، فضای عکاسی یا تجهیزات تولید محتوا دارید، می‌توانید آن را در اختیار تولیدکنندگان محتوا، عکاسان و فیلم‌برداران قرار دهید.",
      ar: "إذا كان لديك استوديو أو مساحة تصوير أو معدات إنتاج محتوى، يمكنك إتاحتها لمنتجي المحتوى والمصورين.",
      de: "Wenn Sie ein Studio, einen Fotobereich oder Inhaltsproduktionsausrüstung haben, können Sie diese Kreativen, Fotografen und Kameraleuten zur Verfügung stellen.",
      ru: "Если у вас есть студия, фотопространство или оборудование для создания контента, вы можете предоставить их контент-мейкерам, фотографам и видеографам.",
    },
    seeker: {
      tr: "Fotoğraf, video veya içerik üretimi için stüdyoya ihtiyacınız varsa ilan verin, stüdyo sahipleri sizi bulsun.",
      en: "Need a studio for photography, video or podcasting? Post a listing and let studio owners find you.",
      fa: "اگر برای عکاسی، فیلم‌برداری، پادکست یا تولید محتوا به استودیو نیاز دارید، آگهی ثبت کنید تا صاحبان استودیو با شما تماس بگیرند.",
      ar: "هل تحتاج إلى استوديو للتصوير أو إنتاج المحتوى؟ انشر إعلانك ودع أصحاب الاستوديوهات يجدونك.",
      de: "Benötigen Sie ein Studio für Foto, Video oder Podcasting? Inserieren Sie und lassen Sie Studioeigentümer Sie finden.",
      ru: "Нужна студия для фото, видео или подкастов? Разместите объявление и позвольте владельцам студий найти вас.",
    },
  },
  "egitim-sinifi": {
    owner: {
      tr: "Sınıfınız veya eğitim alanınız bazı gün veya saatlerde boşsa, kurs, atölye ve seminerler için başkalarıyla paylaşabilirsiniz.",
      en: "If your classroom or training space is empty on certain days or hours, you can share it with others for courses, workshops and seminars.",
      fa: "اگر کلاس یا فضای آموزشی شما در بعضی روزها یا ساعات خالی است، می‌توانید آن را برای برگزاری دوره‌ها، کارگاه‌ها و سمینارها با دیگران به اشتراک بگذارید.",
      ar: "إذا كانت قاعة الدراسة أو مساحة التدريب فارغة في أيام أو ساعات معينة، يمكنك مشاركتها مع الآخرين للدورات والورش والندوات.",
      de: "Wenn Ihr Klassenzimmer oder Schulungsraum an bestimmten Tagen oder Stunden leer steht, können Sie ihn für Kurse, Workshops und Seminare mit anderen teilen.",
      ru: "Если ваш класс или учебное пространство пустует в определённые дни или часы, вы можете поделиться им для проведения курсов, мастер-классов и семинаров.",
    },
    seeker: {
      tr: "Kurs veya atölye için eğitim alanına ihtiyacınız varsa ilan verin, alan sahipleri sizinle iletişime geçsin.",
      en: "Need a space for classes or workshops? Post a listing and let space owners contact you.",
      fa: "اگر برای برگزاری کلاس، دوره یا کارگاه به فضای آموزشی نیاز دارید، آگهی ثبت کنید تا صاحبان فضا شما را پیدا کنند.",
      ar: "هل تحتاج إلى فضاء تعليمي لإقامة دوراتك؟ انشر إعلانك ودع أصحاب المساحات يتواصلون معك.",
      de: "Benötigen Sie einen Raum für Kurse oder Workshops? Inserieren Sie und lassen Sie Eigentümer Sie kontaktieren.",
      ru: "Нужно помещение для занятий или воркшопов? Разместите объявление и позвольте владельцам связаться с вами.",
    },
  },
  otopark: {
    owner: {
      tr: "Otopark olarak kullanılabilecek fazla alanınız varsa, bunu başkalarıyla paylaşabilir ve kullanılmayan alanınızdan gelir elde edebilirsiniz.",
      en: "If you have extra space that can be used as a parking area, you can share it with others and earn income from your unused space.",
      fa: "اگر فضای اضافی دارید که می‌توان از آن به عنوان پارکینگ استفاده کرد، می‌توانید آن را با دیگران به اشتراک بگذارید و از فضای بلااستفاده خود درآمد کسب کنید.",
      ar: "إذا كان لديك مساحة إضافية يمكن استخدامها كموقف سيارات، يمكنك مشاركتها مع الآخرين وكسب دخل من المساحة غير المستخدمة.",
      de: "Wenn Sie zusätzlichen Platz haben, der als Parkplatz genutzt werden kann, können Sie ihn mit anderen teilen und Einnahmen erzielen.",
      ru: "Если у вас есть дополнительное пространство, которое можно использовать как парковку, вы можете поделиться им и получать доход.",
    },
    seeker: {
      tr: "Aracınız için park yeri arıyorsanız ilan verin, park yeri sahipleri sizi bulsun.",
      en: "Need parking for your vehicle? Post a listing and let parking owners find you.",
      fa: "اگر برای خودرو یا موتورسیکلت خود به جای پارک نیاز دارید، آگهی ثبت کنید تا صاحبان پارکینگ با شما تماس بگیرند.",
      ar: "هل تحتاج إلى موقف سيارة؟ انشر إعلانك ودع أصحاب المواقف يجدونك.",
      de: "Benötigen Sie einen Parkplatz für Ihr Fahrzeug? Inserieren Sie und lassen Sie Parkplatzeigentümer Sie finden.",
      ru: "Нужна парковка для вашего автомобиля? Разместите объявление и позвольте владельцам парковок найти вас.",
    },
  },
  "ticari-adres": {
    owner: {
      tr: "Şirket tescili veya posta alımı için ticari adres sağlayabiliyorsanız, bu hizmetleri başkalarıyla paylaşabilirsiniz.",
      en: "If you can provide a business address for company registration or receiving mail, you can share this service with others.",
      fa: "اگر امکان ارائه آدرس تجاری برای ثبت شرکت یا دریافت مرسولات را دارید، می‌توانید این خدمات را با دیگران به اشتراک بگذارید.",
      ar: "إذا كان بإمكانك توفير عنوان تجاري لتسجيل الشركات أو استلام البريد، يمكنك مشاركة هذه الخدمة مع الآخرين.",
      de: "Wenn Sie eine Geschäftsadresse für die Unternehmensregistrierung oder den Postempfang anbieten können, können Sie diesen Service mit anderen teilen.",
      ru: "Если вы можете предоставить юридический адрес для регистрации компании или получения почты, вы можете поделиться этой услугой с другими.",
    },
    seeker: {
      tr: "Şirket kaydı veya posta için ticari adrese ihtiyacınız varsa ilan verin, uygun hizmet sağlayıcılar sizi bulsun.",
      en: "Need a business address for registration or mail? Post a listing and let providers find you.",
      fa: "اگر برای ثبت شرکت یا دریافت مرسولات به آدرس تجاری نیاز دارید، آگهی ثبت کنید تا ارائه‌دهندگان مناسب شما را پیدا کنند.",
      ar: "هل تحتاج إلى عنوان تجاري لتسجيل شركتك؟ انشر إعلانك ودع مقدمي الخدمة يجدونك.",
      de: "Benötigen Sie eine Geschäftsadresse für Ihre Firmenanmeldung? Inserieren Sie und lassen Sie Anbieter Sie finden.",
      ru: "Нужен юридический адрес для регистрации компании? Разместите объявление и позвольте провайдерам найти вас.",
    },
  },
  "kuafor-guzellik-salonu": {
    owner: {
      tr: "Güzellik salonunuzda boş koltuk, oda veya alan varsa, bunları kuaförler ve güzellik uzmanlarıyla paylaşabilirsiniz.",
      en: "If you have empty chairs, rooms or space in your beauty salon, you can share them with hairdressers and beauty professionals.",
      fa: "اگر در سالن زیبایی خود صندلی، اتاق یا فضای خالی دارید، می‌توانید آن را با آرایشگران و متخصصان زیبایی به اشتراک بگذارید.",
      ar: "إذا كان لديك كراسي أو غرف أو مساحات فارغة في صالون التجميل، يمكنك مشاركتها مع مصففي الشعر وخبراء التجميل.",
      de: "Wenn Sie in Ihrem Schönheitssalon freie Stühle, Räume oder Flächen haben, können Sie diese mit Friseuren und Schönheitsprofis teilen.",
      ru: "Если в вашем салоне красоты есть свободные кресла, комнаты или пространство, вы можете поделиться ими с парикмахерами и специалистами по красоте.",
    },
    seeker: {
      tr: "Güzellik salonunda koltuk veya çalışma alanına ihtiyacınız varsa ilan verin, uygun salonlar sizi bulsun.",
      en: "Need a chair or workspace in a beauty salon? Post a listing and let suitable salons find you.",
      fa: "اگر آرایشگر یا متخصص زیبایی هستید و به صندلی یا فضای کاری در یک سالن نیاز دارید، آگهی ثبت کنید تا سالن‌های مناسب با شما تماس بگیرند.",
      ar: "هل تحتاج إلى كرسي أو مساحة عمل في صالون تجميل؟ انشر إعلانك ودع الصالونات المناسبة تجدك.",
      de: "Benötigen Sie einen Stuhl oder Arbeitsplatz in einem Schönheitssalon? Inserieren Sie und lassen Sie passende Salons Sie finden.",
      ru: "Нужно кресло или рабочее место в салоне красоты? Разместите объявление и позвольте подходящим салонам найти вас.",
    },
  },
  "muayenehane-klinik": {
    owner: {
      tr: "Muayenehane veya kliniğiniz büyükse ve başka bir doktor ya da uzmanın odalardan birini kullanabilmesi mümkünse, alanınızı başkalarıyla paylaşabilirsiniz.",
      en: "If your clinic or medical office is large and another doctor or specialist can use one of its rooms, you can share your space with others.",
      fa: "اگر مطب یا کلینیک شما بزرگ است و امکان استفاده یک پزشک یا متخصص دیگر از یکی از فضاها یا اتاق‌های آن وجود دارد، می‌توانید فضای خود را با دیگران به اشتراک بگذارید.",
      ar: "إذا كانت عيادتك أو مركزك الطبي كبيراً ويمكن لطبيب أو متخصص آخر استخدام أحد غرفه، يمكنك مشاركة مساحتك مع الآخرين.",
      de: "Wenn Ihre Praxis oder Klinik groß ist und ein anderer Arzt oder Spezialist einen der Räume nutzen kann, können Sie Ihren Raum mit anderen teilen.",
      ru: "Если ваш медицинский кабинет или клиника большие и другой врач или специалист может использовать одну из комнат, вы можете поделиться своим пространством.",
    },
    seeker: {
      tr: "Muayene odası veya klinik alanına ihtiyacınız varsa ilan verin, alan sahipleri sizinle iletişime geçsin.",
      en: "Need an examination room or clinic space? Post a listing and let clinic owners contact you.",
      fa: "اگر پزشک یا متخصص هستید و به اتاق معاینه یا فضای درمانی نیاز دارید، آگهی ثبت کنید تا صاحبان مطب و کلینیک شما را پیدا کنند.",
      ar: "هل تحتاج إلى غرفة فحص أو مساحة طبية؟ انشر إعلانك ودع أصحاب العيادات يتواصلون معك.",
      de: "Benötigen Sie einen Untersuchungsraum oder Klinikfläche? Inserieren Sie und lassen Sie Klinikbetreiber Sie kontaktieren.",
      ru: "Нужен кабинет или клиническое пространство? Разместите объявление и позвольте владельцам клиник связаться с вами.",
    },
  },
  "spor-alani": {
    owner: {
      tr: "Spor salonunuz, futbol sahanız veya başka bir spor alanınız belirli saat ya da günlerde kullanılmıyorsa, antrenörler, takımlar ve sporcularla paylaşarak boş zamanlarınızdan gelir elde edebilirsiniz.",
      en: "If you have a gym, football pitch, sports hall or any other sports facility that is unused at certain hours or days, you can share it with coaches, teams and athletes and earn income from your idle time.",
      fa: "اگر باشگاه، زمین فوتبال، سالن ورزشی یا هر فضای ورزشی دیگری دارید که در برخی ساعات یا روزها بدون استفاده است، می‌توانید آن را با مربیان، تیم‌ها و ورزشکاران به اشتراک بگذارید و از زمان‌های خالی مجموعه خود درآمد کسب کنید.",
      ar: "إذا كان لديك صالة رياضية أو ملعب كرة قدم أو أي مرفق رياضي آخر غير مستخدم في أوقات أو أيام معينة، يمكنك مشاركته مع المدربين والفرق والرياضيين وكسب دخل من الأوقات الفارغة.",
      de: "Wenn Ihr Fitnessstudio, Fußballplatz, Sporthalle oder eine andere Sportstätte zu bestimmten Zeiten oder Tagen ungenutzt ist, können Sie sie mit Trainern, Teams und Sportlern teilen und Einnahmen erzielen.",
      ru: "Если ваш спортзал, футбольное поле, спортивный зал или другой спортивный объект пустует в определённые часы или дни, вы можете поделиться им с тренерами, командами и спортсменами.",
    },
    seeker: {
      tr: "Antrenman veya spor etkinliği için alan arıyorsanız ilan verin, alan sahipleri sizi bulsun.",
      en: "Need a gym or sports facility for training or classes? Post a listing and let owners find you.",
      fa: "اگر برای تمرین، برگزاری کلاس یا فعالیت ورزشی به سالن یا زمین ورزشی نیاز دارید، آگهی ثبت کنید تا صاحبان فضا با شما تماس بگیرند.",
      ar: "هل تحتاج إلى صالة أو ملعب رياضي؟ انشر إعلانك ودع أصحاب المرافق يجدونك.",
      de: "Benötigen Sie eine Sporthalle oder ein Spielfeld? Inserieren Sie und lassen Sie Eigentümer Sie finden.",
      ru: "Нужен зал или спортивная площадка? Разместите объявление и позвольте владельцам найти вас.",
    },
  },
  "etkinlik-salonu": {
    owner: {
      tr: "Düğün, doğum günü, konferans veya diğer etkinlikler için uygun bir salon, bahçe veya alanınız varsa ve bazı günler boşsa, bunu başkalarıyla paylaşarak gelirinizi artırabilirsiniz.",
      en: "If you have a hall, garden or suitable space for weddings, birthdays, conferences or other events and it is empty on some days, you can share it with others and earn income from your space.",
      fa: "اگر سالن، باغ یا فضای مناسبی برای برگزاری عروسی، تولد، همایش یا سایر مراسم و رویدادها دارید و در برخی روزها خالی است، می‌توانید آن را با دیگران به اشتراک بگذارید و از فضای خود درآمد کسب کنید.",
      ar: "إذا كان لديك قاعة أو حديقة أو مساحة مناسبة لإقامة حفلات الأعراس وأعياد الميلاد والمؤتمرات أو الفعاليات الأخرى وكانت فارغة في بعض الأيام، يمكنك مشاركتها مع الآخرين وكسب دخل.",
      de: "Wenn Sie einen Saal, Garten oder geeigneten Raum für Hochzeiten, Geburtstage, Konferenzen oder andere Veranstaltungen haben und dieser an manchen Tagen leer steht, können Sie ihn mit anderen teilen.",
      ru: "Если у вас есть зал, сад или подходящее пространство для свадеб, дней рождения, конференций или других мероприятий, и оно пустует в некоторые дни, вы можете поделиться им с другими.",
    },
    seeker: {
      tr: "Düğün, doğum günü veya etkinlik için salon arıyorsanız ilan verin, salon sahipleri sizinle iletişime geçsin.",
      en: "Need a venue for a wedding, event or gathering? Post a listing and let hall owners reach out.",
      fa: "اگر برای برگزاری عروسی، تولد، همایش یا سایر مراسم به سالن مناسب نیاز دارید، آگهی ثبت کنید تا صاحبان سالن شما را پیدا کنند.",
      ar: "هل تحتاج إلى قاعة لحفل أو فعالية؟ انشر إعلانك ودع أصحاب القاعات يتواصلون معك.",
      de: "Benötigen Sie einen Saal für eine Hochzeit oder Veranstaltung? Inserieren Sie und lassen Sie Saalbetreiber Sie kontaktieren.",
      ru: "Нужен зал для свадьбы или мероприятия? Разместите объявление и позвольте владельцам залов связаться с вами.",
    },
  },
};

const commercialConfirmLabels: Record<string, { continue: string; cancel: string }> = {
  tr: { continue: "Devam Et", cancel: "İptal" },
  en: { continue: "Continue", cancel: "Cancel" },
  fa: { continue: "ادامه", cancel: "انصراف" },
  ar: { continue: "متابعة", cancel: "إلغاء" },
  de: { continue: "Weiter", cancel: "Abbrechen" },
  ru: { continue: "Продолжить", cancel: "Отмена" },
};

const headerTitleByMode: Record<string, Record<string, string>> = {
  owner: {
    tr: "Mekan türünü seçin",
    en: "Select space type",
    fa: "نوع مکان را انتخاب کنید",
    ar: "اختر نوع المكان",
    de: "Raumtyp auswählen",
    ru: "Выберите тип помещения",
  },
  seeker: {
    tr: "Aradığınız mekan türünü seçin",
    en: "Select the space you're looking for",
    fa: "نوع مکان مورد نظر را انتخاب کنید",
    ar: "اختر نوع المكان الذي تبحث عنه",
    de: "Gesuchten Raumtyp auswählen",
    ru: "Выберите тип помещения, которое ищете",
  },
};

function CommercialTypeSelectContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { lang } = useLang();
  const isRtl = lang === "fa" || lang === "ar";

  const mode = searchParams.get("mode") === "seeker" ? "seeker" : "owner";
  const [selectedTypeForConfirm, setSelectedTypeForConfirm] = useState<string | null>(null);

  const commercialTypeOptions = commercialTypeOptionsByLang[lang] ?? commercialTypeOptionsByLang.tr;
  const headerTitle = (headerTitleByMode[mode][lang] ?? headerTitleByMode[mode].tr);

  return (
    <div className="min-h-screen bg-white flex flex-col" dir={isRtl ? "rtl" : "ltr"}>
      {/* Orange header */}
      <div
        className="relative flex items-center px-4 shrink-0"
        style={{ height: '56px', paddingTop: 'env(safe-area-inset-top)', backgroundColor: '#f97316' }}
      >
        <button
          onClick={() => router.back()}
          className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors shrink-0"
          aria-label="Geri"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" style={{ transform: isRtl ? 'scaleX(-1)' : undefined }}>
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <h3 className="text-white font-black text-lg flex-1 text-center pr-9">
          {headerTitle}
        </h3>
      </div>

      {/* Options grid */}
      <div className="flex-1 overflow-y-auto p-5 pb-8 grid grid-cols-2 gap-3 content-start">
        {commercialTypeOptions.map((opt) => (
          <button
            key={opt.slug}
            onClick={() => setSelectedTypeForConfirm(opt.slug)}
            className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border-2 border-stone-200 hover:border-orange-300 hover:bg-orange-50 active:scale-95 transition-all duration-200 text-center"
          >
            <span className="text-3xl">{opt.emoji}</span>
            <span className="text-sm font-bold text-stone-700">{opt.label}</span>
          </button>
        ))}
      </div>

      {/* Confirmation bottom sheet */}
      <AnimatePresence>
        {selectedTypeForConfirm && (() => {
          const selectedOpt = commercialTypeOptions.find((o) => o.slug === selectedTypeForConfirm);
          if (!selectedOpt) return null;
          const descriptionSet = commercialTypeDescriptions[selectedOpt.slug]?.[mode];
          const description = descriptionSet?.[lang] ?? descriptionSet?.tr ?? "";
          const labels = commercialConfirmLabels[lang] ?? commercialConfirmLabels.tr;
          return (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedTypeForConfirm(null)}
                className="fixed inset-0 bg-black/40"
                style={{ zIndex: 99999 }}
              />
              <motion.div
                initial={{ y: 300 }}
                animate={{ y: 0 }}
                exit={{ y: 300 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl p-6 max-h-[70vh] overflow-y-auto"
                style={{ zIndex: 100000 }}
              >
                <div className="text-5xl text-center mb-3">{selectedOpt.emoji}</div>
                <h4 className="text-center font-bold text-[20px] text-stone-900 mb-2">{selectedOpt.label}</h4>
                <p className="text-gray-500 text-[15px] leading-relaxed mb-6">{description}</p>
                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => {
                      router.push(`/create-commercial-listing?type=${selectedOpt.slug}&mode=${mode}`);
                    }}
                    className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white font-black text-sm py-3 rounded-xl shadow-lg shadow-orange-500/25 hover:opacity-95 active:scale-95 transition-all duration-200"
                  >
                    {labels.continue}
                  </button>
                  <button
                    onClick={() => setSelectedTypeForConfirm(null)}
                    className="w-full border-2 border-stone-200 text-stone-700 font-black text-sm py-3 rounded-xl hover:border-orange-300 hover:bg-orange-50 hover:text-orange-800 active:scale-95 transition-all duration-200"
                  >
                    {labels.cancel}
                  </button>
                </div>
              </motion.div>
            </>
          );
        })()}
      </AnimatePresence>
    </div>
  );
}

export default function CommercialTypeSelectPage() {
  return (
    <Suspense fallback={null}>
      <CommercialTypeSelectContent />
    </Suspense>
  );
}