"use client";

import Link from "next/link";
import { useLang } from "@/app/lib/LangContext";

type Block =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "quote"; text: string };

type ArticleContent = {
  title: string;
  tag: string;
  readTime: string;
  date: string;
  blocks: Block[];
};

const ARTICLE_CONTENT: Record<string, ArticleContent> = {
  tr: {
    title: "Alan Paylaşımının Psikolojisi; Boş Bir Alan Nasıl Sizin ve Başkalarının Hayatında Yeni Fırsatlar Yaratabilir?",
    tag: "Yaşam & Kariyer",
    readTime: "8 dk okuma",
    date: "2025",
    blocks: [
      { type: "p", text: "Günümüzde ev, ofis, dükkan, muayenehane, atölye ya da hatta bir otopark yeri, sadece fiziksel bir alan değildir; gelir, iş birliği, yeni insanlarla tanışma ve kişisel/mesleki gelişim için bir fırsat olabilir." },
      { type: "p", text: "Son yıllarda alan paylaşımı (Space Sharing) kavramı tüm dünyada büyük bir ivme kazandı. Milyonlarca insan evinin, ofisinin, dükkanının veya çalışma alanının bir kısmını başkalarıyla paylaşıyor; buna karşılık bu alanlara ihtiyaç duyan kişiler, yüksek maliyetler ödemeden kendilerine uygun alanı buluyor." },
      { type: "p", text: "Ancak bu yaşam biçiminin gittikçe artan popülaritesinin tek nedeni maliyetlerin azalması değil. Alan paylaşımı; yaşam kalitesi, ruh sağlığı, yeni bağlantılar kurma ve hatta kariyer başarısı üzerinde derin bir etki yaratabilir." },

      { type: "h2", text: "İnsanlar Bağlantı Kurmak İçin Var Oldu" },
      { type: "p", text: "İnsan doğası gereği sosyal bir varlıktır. Tamamen bağımsız yaşamak ya da çalışmak bazen huzur verici olsa da, uzun vadede yalnızlık hissini, motivasyon kaybını ve hatta stresi artırabilir." },
      { type: "p", text: "Alanımızı başkalarıyla paylaştığımızda, doğal ve günlük bağlantıların kurulmasına fırsat doğar; ortak bir mutfaktaki kısa bir sohbetten, mesleki geleceğinizi değiştirebilecek bir iş birliğine kadar." },
      { type: "p", text: "Bu basit bağlantılar, hayatta daha fazla aidiyet, güven ve tatmin duygusu yaratır." },

      { type: "h2", text: "Kullanılmayan Alan, Bir Gelir Fırsatıdır" },
      { type: "p", text: "Neredeyse hepimizin zamanın büyük bir bölümünde kullanılmadan kalan alanları vardır:" },
      { type: "ul", items: [
        "Boş kalmış bir oda",
        "Ofiste kullanılmayan bir masa",
        "Müşteri almayan bir dükkan bölümü",
        "Güzellik salonunda boş bir koltuk",
        "Haftada sadece birkaç saat kullanılan bir muayenehane odası",
        "Bir deponun boş kısmı",
        "Günün büyük bölümünde kullanılmayan bir otopark",
        "Bazı saatlerde boş kalan bir spor salonu veya eğitim sınıfı",
      ] },
      { type: "p", text: "Bu alanlar size sıradan veya kullanışsız gelebilir, ama bir başkası için uzun zamandır aradığı tam da o fırsat olabilir." },

      { type: "h2", text: "Alan Paylaşımı Sadece Gelir Elde Etmek Anlamına Gelmez" },
      { type: "p", text: "Bu yaşam biçimi şunları sağlayabilir:" },
      { type: "ul", items: [
        "Maliyetlerinizi azaltabilir",
        "İletişim ağınızı genişletebilir",
        "Yeni iş fırsatları yaratabilir",
        "Değerli iş birlikleri oluşturabilir",
        "Yalnızlık hissini azaltabilir",
        "Yaşam kalitesini artırabilir",
      ] },
      { type: "p", text: "Bazen ortak bir alanda iki kişi arasındaki kısa bir sohbet, başarılı bir iş birliğinin ya da yeni bir işletmenin kuruluşunun başlangıcı olur." },

      { type: "h2", text: "Yaratıcılık Etkileşimden Doğar" },
      { type: "p", text: "Dünyadaki birçok başarılı fikir, resmi toplantılarda değil, basit ve rastlantısal sohbetlerde şekillenmiştir." },
      { type: "ul", items: [
        "Paylaşımlı bir ofiste bir grafik tasarımcı bir yazılımcıyla tanışır.",
        "Bir spor koçu, antrenman alanını bir fizyoterapistle paylaşır.",
        "Bir şef, paylaşımlı bir endüstriyel mutfağı kullanarak kendi yemek markasını kurar.",
      ] },

      { type: "h2", text: "Mali Stresin Azalması" },
      { type: "p", text: "Günümüzün en büyük kaygılarından biri, yüksek kira ve bakım maliyetleridir. Alan paylaşımı insanlara şu konularda yardımcı olur:" },
      { type: "ul", items: [
        "Kullanılmayan alanlarından gelir elde etmelerine",
        "Büyük bir yatırım yapmadan işlerini kurmalarına",
        "Kira ve ekipman maliyetlerini azaltmalarına",
      ] },

      { type: "h2", text: "Başarılı Paylaşım Güvenle Başlar" },
      { type: "p", text: "Her başarılı iş birliği, karşılıklı güven ve saygı üzerine kuruludur. Olumlu bir deneyim yaşamak için, başlamadan önce şu konularda anlaşmak faydalıdır:" },
      { type: "ul", items: [
        "Alan kullanım kuralları",
        "Kullanım saatleri",
        "Sorumluluklar",
        "Maliyetler",
        "Ortak imkanların nasıl kullanılacağı",
      ] },

      { type: "h2", text: "Gelecek, Akıllı Paylaşıma Ait" },
      { type: "p", text: "Günümüz ekonomisi her zamankinden daha fazla kaynakların optimum kullanımına doğru ilerliyor. Akıllı alan paylaşımı; maliyetleri azaltmanın yanı sıra yeni bağlantılar kurulmasını, verimliliğin artmasını, girişimcilerin desteklenmesini ve mevcut kaynakların daha etkili kullanılmasını sağlar." },

      { type: "h2", text: "Sonuç" },
      { type: "p", text: "Bazen boş bir alan, sadece boş bir alan değildir." },
      { type: "quote", text: "Sefira'da, her alanın başkaları için bir değer taşıyabileceğine ve her paylaşımın iki taraf için de bir gelişim fırsatı yaratabileceğine inanıyoruz." },
      { type: "p", text: "Kullanılmayan bir alanınız varsa, onu başkalarıyla paylaşın. Uygun bir alan arıyorsanız, belki de en iyi fırsat şu anda sizi bekliyordur." },
    ],
  },

  en: {
    title: "The Psychology of Space Sharing; How an Empty Space Can Create New Opportunities for You and Others",
    tag: "Life & Career",
    readTime: "8 min read",
    date: "2025",
    blocks: [
      { type: "p", text: "Today, a home, office, shop, clinic, workshop, or even a parking spot is not just a physical space; it can be an opportunity for income, collaboration, meeting new people, and personal and professional growth." },
      { type: "p", text: "In recent years, the concept of space sharing has grown remarkably around the world. Millions of people share part of their home, office, shop, or workspace with others, while those who need such spaces find what suits them without paying heavy costs." },
      { type: "p", text: "But the reason behind this lifestyle's growing popularity isn't just lower costs. Space sharing can have a profound impact on quality of life, mental health, building new connections, and even career success." },

      { type: "h2", text: "Humans Are Built for Connection" },
      { type: "p", text: "Humans are inherently social beings. Living or working in complete isolation, while sometimes peaceful, can increase feelings of loneliness, reduce motivation, and even raise stress levels in the long run." },
      { type: "p", text: "When we share our space with others, opportunities for natural, everyday connection emerge — from a short conversation in a shared kitchen to a collaboration that could change your professional future." },
      { type: "p", text: "These simple connections create a greater sense of belonging, security, and satisfaction in life." },

      { type: "h2", text: "An Unused Space Is an Income Opportunity" },
      { type: "p", text: "Almost all of us have spaces that sit unused for much of the time:" },
      { type: "ul", items: [
        "A room left empty",
        "A desk that goes unused in the office",
        "A part of a shop with no customers",
        "An empty chair in a beauty salon",
        "A clinic room used only a few hours a week",
        "The empty part of a storage unit",
        "A parking spot unused most of the day",
        "A gym or classroom that sits empty at certain hours",
      ] },
      { type: "p", text: "These spaces may seem ordinary or useless to you, but for someone else, they could be exactly the opportunity they've been searching for." },

      { type: "h2", text: "Space Sharing Isn't Just About Earning Income" },
      { type: "p", text: "This lifestyle can:" },
      { type: "ul", items: [
        "Reduce your costs",
        "Expand your network",
        "Create new job opportunities",
        "Build valuable collaborations",
        "Reduce feelings of loneliness",
        "Improve your quality of life",
      ] },
      { type: "p", text: "Sometimes a short conversation between two people in a shared space becomes the start of a successful collaboration or even the launch of a new business." },

      { type: "h2", text: "Creativity Is Born from Interaction" },
      { type: "p", text: "Many of the world's successful ideas were shaped not in formal meetings, but in simple, chance conversations." },
      { type: "ul", items: [
        "A graphic designer meets a developer in a shared office.",
        "A fitness coach shares their training space with a physiotherapist.",
        "A chef launches their own food brand using a shared commercial kitchen.",
      ] },

      { type: "h2", text: "Reducing Financial Stress" },
      { type: "p", text: "One of today's biggest concerns is the high cost of rent and space maintenance. Space sharing helps people:" },
      { type: "ul", items: [
        "Earn income from their unused space",
        "Start their business without heavy investment",
        "Reduce rental and equipment costs",
      ] },

      { type: "h2", text: "Successful Sharing Begins with Trust" },
      { type: "p", text: "Every successful collaboration is built on mutual trust and respect. For a positive experience, it's best to agree on the following before starting:" },
      { type: "ul", items: [
        "Rules for using the space",
        "Hours of use",
        "Responsibilities",
        "Costs",
        "How shared facilities will be used",
      ] },

      { type: "h2", text: "The Future Belongs to Smart Sharing" },
      { type: "p", text: "Today's economy is moving toward optimal use of resources more than ever before. Smart space sharing not only reduces costs but also creates new connections, increases productivity, supports entrepreneurs, and makes more effective use of existing resources." },

      { type: "h2", text: "Conclusion" },
      { type: "p", text: "Sometimes an empty space is not just an empty space." },
      { type: "quote", text: "At Sefira, we believe every space can hold value for others, and every act of sharing can create an opportunity for growth for both sides." },
      { type: "p", text: "If you have an unused space, share it with others. If you're looking for the right space, perhaps the best opportunity is waiting for you right now." },
    ],
  },

  fa: {
    title: "روانشناسی اشتراک‌گذاری فضا؛ چگونه یک فضای خالی می‌تواند فرصت‌های جدیدی برای شما و دیگران ایجاد کند؟",
    tag: "زندگی و کار",
    readTime: "۸ دقیقه مطالعه",
    date: "۲۰۲۵",
    blocks: [
      { type: "p", text: "امروزه خانه، دفتر کار، مغازه، مطب، کارگاه یا حتی یک جای پارک، فقط یک فضای فیزیکی نیست؛ بلکه می‌تواند فرصتی برای درآمد، همکاری، آشنایی با افراد جدید و رشد شخصی و حرفه‌ای باشد." },
      { type: "p", text: "در سال‌های اخیر، مفهوم اشتراک‌گذاری فضا (Space Sharing) در سراسر جهان رشد چشمگیری داشته است. میلیون‌ها نفر بخشی از خانه، دفتر، مغازه یا فضای کاری خود را با دیگران به اشتراک می‌گذارند و در مقابل، افرادی که به این فضاها نیاز دارند، بدون پرداخت هزینه‌های سنگین، فضای مناسب خود را پیدا می‌کنند." },
      { type: "p", text: "اما دلیل محبوبیت روزافزون این سبک زندگی فقط کاهش هزینه‌ها نیست. اشتراک‌گذاری فضا می‌تواند تأثیر عمیقی بر کیفیت زندگی، سلامت روان، ایجاد ارتباطات جدید و حتی موفقیت شغلی افراد داشته باشد." },

      { type: "h2", text: "انسان‌ها برای ارتباط ساخته شده‌اند" },
      { type: "p", text: "انسان ذاتاً موجودی اجتماعی است. زندگی یا کار کردن به‌صورت کاملاً مستقل، اگرچه گاهی آرامش‌بخش است، اما در بلندمدت می‌تواند احساس تنهایی، کاهش انگیزه و حتی استرس را افزایش دهد." },
      { type: "p", text: "وقتی فضای خود را با دیگران به اشتراک می‌گذاریم، فرصت شکل‌گیری ارتباط‌های طبیعی و روزمره ایجاد می‌شود؛ از یک گفت‌وگوی کوتاه در آشپزخانه مشترک گرفته تا یک همکاری کاری که شاید آینده حرفه‌ای شما را تغییر دهد." },
      { type: "p", text: "همین ارتباط‌های ساده، احساس تعلق، امنیت و رضایت بیشتری در زندگی ایجاد می‌کنند." },

      { type: "h2", text: "فضای بلااستفاده، فرصتی برای درآمد" },
      { type: "p", text: "تقریباً همه ما فضاهایی داریم که بخش زیادی از زمان بدون استفاده باقی می‌مانند:" },
      { type: "ul", items: [
        "اتاقی که خالی مانده",
        "میزی که در دفتر استفاده نمی‌شود",
        "بخشی از مغازه که مشتری ندارد",
        "یک صندلی آزاد در سالن زیبایی",
        "اتاقی در مطب که فقط چند ساعت در هفته استفاده می‌شود",
        "فضای خالی یک انبار",
        "پارکینگی که بیشتر روز بدون استفاده است",
        "سالن ورزشی یا کلاس آموزشی که در بعضی ساعات خالی است",
      ] },
      { type: "p", text: "شاید این فضاها برای شما عادی یا بلااستفاده باشند، اما برای فرد دیگری دقیقاً همان فرصتی باشند که مدت‌ها به دنبال آن بوده است." },

      { type: "h2", text: "اشتراک‌گذاری فضا فقط به معنای کسب درآمد نیست" },
      { type: "p", text: "این سبک زندگی می‌تواند:" },
      { type: "ul", items: [
        "هزینه‌های شما را کاهش دهد",
        "شبکه ارتباطی شما را گسترش دهد",
        "فرصت‌های شغلی جدید ایجاد کند",
        "همکاری‌های ارزشمند شکل دهد",
        "احساس تنهایی را کاهش دهد",
        "کیفیت زندگی را بهبود ببخشد",
      ] },
      { type: "p", text: "گاهی یک گفت‌وگوی کوتاه میان دو نفر در یک فضای مشترک، آغاز یک همکاری موفق یا حتی راه‌اندازی یک کسب‌وکار جدید می‌شود." },

      { type: "h2", text: "خلاقیت از دل تعامل متولد می‌شود" },
      { type: "p", text: "بسیاری از ایده‌های موفق جهان، نه در جلسات رسمی، بلکه در گفتگوهای ساده و اتفاقی شکل گرفته‌اند." },
      { type: "ul", items: [
        "یک طراح گرافیک در یک دفتر اشتراکی با یک برنامه‌نویس آشنا می‌شود.",
        "یک مربی ورزشی فضای تمرین خود را با یک فیزیوتراپیست به اشتراک می‌گذارد.",
        "یک آشپز با استفاده از یک آشپزخانه صنعتی مشترک، برند غذایی خود را راه‌اندازی می‌کند.",
      ] },

      { type: "h2", text: "کاهش استرس مالی" },
      { type: "p", text: "یکی از بزرگ‌ترین دغدغه‌های امروز، هزینه‌های بالای اجاره و نگهداری فضاهاست. اشتراک‌گذاری فضا به افراد کمک می‌کند:" },
      { type: "ul", items: [
        "از فضای بلااستفاده خود درآمد کسب کنند",
        "بدون سرمایه‌گذاری سنگین کسب‌وکار خود را شروع کنند",
        "هزینه‌های اجاره و تجهیزات را کاهش دهند",
      ] },

      { type: "h2", text: "اشتراک‌گذاری موفق، با اعتماد آغاز می‌شود" },
      { type: "p", text: "هر همکاری موفق بر پایه اعتماد و احترام متقابل شکل می‌گیرد. برای داشتن یک تجربه مثبت، بهتر است قبل از شروع درباره موارد زیر توافق شود:" },
      { type: "ul", items: [
        "قوانین استفاده از فضا",
        "ساعت‌های استفاده",
        "مسئولیت‌ها",
        "هزینه‌ها",
        "نحوه استفاده از امکانات مشترک",
      ] },

      { type: "h2", text: "آینده متعلق به اشتراک‌گذاری هوشمند است" },
      { type: "p", text: "اقتصاد امروز بیش از هر زمان دیگری به سمت استفاده بهینه از منابع حرکت می‌کند. اشتراک‌گذاری هوشمند فضا علاوه بر کاهش هزینه‌ها، باعث ایجاد ارتباطات جدید، افزایش بهره‌وری، حمایت از کارآفرینان و استفاده مؤثرتر از منابع موجود می‌شود." },

      { type: "h2", text: "نتیجه‌گیری" },
      { type: "p", text: "گاهی یک فضای خالی، فقط یک فضای خالی نیست." },
      { type: "quote", text: "در Sefira باور داریم هر فضایی می‌تواند ارزشی برای دیگران داشته باشد و هر اشتراک‌گذاری، فرصتی برای رشد دو طرف ایجاد کند." },
      { type: "p", text: "اگر فضای بلااستفاده‌ای دارید، آن را با دیگران به اشتراک بگذارید. اگر هم به دنبال فضایی مناسب هستید، شاید بهترین فرصت، همین حالا منتظر شما باشد." },
    ],
  },

  ar: {
    title: "علم نفس مشاركة المساحات؛ كيف يمكن لمساحة فارغة أن تخلق فرصاً جديدة لك وللآخرين؟",
    tag: "الحياة والعمل",
    readTime: "٨ دقائق قراءة",
    date: "٢٠٢٥",
    blocks: [
      { type: "p", text: "اليوم، لم يعد المنزل أو المكتب أو المتجر أو العيادة أو الورشة أو حتى موقف السيارات مجرد مساحة مادية؛ بل يمكن أن يكون فرصة للدخل والتعاون والتعرف على أشخاص جدد والنمو الشخصي والمهني." },
      { type: "p", text: "في السنوات الأخيرة، شهد مفهوم مشاركة المساحات (Space Sharing) نمواً ملحوظاً في جميع أنحاء العالم. يشارك الملايين من الناس جزءاً من منازلهم أو مكاتبهم أو متاجرهم أو مساحات عملهم مع الآخرين، وفي المقابل، يجد من يحتاجون إلى هذه المساحات ما يناسبهم دون دفع تكاليف باهظة." },
      { type: "p", text: "لكن سبب الشعبية المتزايدة لهذا الأسلوب في الحياة ليس فقط تقليل التكاليف. فمشاركة المساحات يمكن أن يكون لها تأثير عميق على جودة الحياة والصحة النفسية وبناء علاقات جديدة وحتى النجاح المهني." },

      { type: "h2", text: "البشر مُهيّؤون للتواصل" },
      { type: "p", text: "الإنسان بطبيعته كائن اجتماعي. العيش أو العمل بشكل مستقل تماماً، وإن كان مريحاً أحياناً، قد يزيد على المدى الطويل من الشعور بالوحدة وانخفاض الدافعية بل وحتى التوتر." },
      { type: "p", text: "عندما نشارك مساحتنا مع الآخرين، تُتاح الفرصة لتكوين علاقات طبيعية ويومية؛ من حديث قصير في مطبخ مشترك إلى تعاون عمل قد يغيّر مستقبلك المهني." },
      { type: "p", text: "هذه الروابط البسيطة تخلق شعوراً أكبر بالانتماء والأمان والرضا في الحياة." },

      { type: "h2", text: "المساحة غير المستخدمة فرصة للدخل" },
      { type: "p", text: "يمتلك كل واحد منّا تقريباً مساحات تبقى دون استخدام لمعظم الوقت:" },
      { type: "ul", items: [
        "غرفة بقيت فارغة",
        "مكتب لا يُستخدم في المكتب",
        "جزء من متجر لا يأتيه الزبائن",
        "كرسي فارغ في صالون تجميل",
        "غرفة في عيادة تُستخدم بضع ساعات فقط في الأسبوع",
        "جزء فارغ من مستودع",
        "موقف سيارات غير مستخدم معظم اليوم",
        "صالة رياضية أو قاعة تدريب فارغة في بعض الأوقات",
      ] },
      { type: "p", text: "قد تبدو هذه المساحات عادية أو غير مفيدة بالنسبة لك، لكنها بالنسبة لشخص آخر قد تكون بالضبط الفرصة التي كان يبحث عنها منذ فترة طويلة." },

      { type: "h2", text: "مشاركة المساحة لا تعني فقط تحقيق الدخل" },
      { type: "p", text: "يمكن لهذا الأسلوب من الحياة أن:" },
      { type: "ul", items: [
        "يقلل من تكاليفك",
        "يوسّع شبكة علاقاتك",
        "يخلق فرصاً وظيفية جديدة",
        "يشكّل تعاونات قيّمة",
        "يقلل من الشعور بالوحدة",
        "يحسّن جودة حياتك",
      ] },
      { type: "p", text: "أحياناً، حديث قصير بين شخصين في مساحة مشتركة يكون بداية تعاون ناجح أو حتى انطلاقة مشروع تجاري جديد." },

      { type: "h2", text: "الإبداع يُولد من التفاعل" },
      { type: "p", text: "الكثير من الأفكار الناجحة في العالم لم تتشكل في اجتماعات رسمية، بل في أحاديث بسيطة وعفوية." },
      { type: "ul", items: [
        "مصمم جرافيك يتعرف على مبرمج في مكتب مشترك.",
        "مدرب رياضي يشارك مساحة تدريبه مع أخصائي علاج طبيعي.",
        "طاهٍ يطلق علامته الغذائية الخاصة باستخدام مطبخ صناعي مشترك.",
      ] },

      { type: "h2", text: "تقليل الضغط المالي" },
      { type: "p", text: "من أكبر هموم اليوم ارتفاع تكاليف الإيجار وصيانة المساحات. تساعد مشاركة المساحة الأشخاص على:" },
      { type: "ul", items: [
        "تحقيق دخل من مساحاتهم غير المستخدمة",
        "بدء أعمالهم دون استثمار كبير",
        "تقليل تكاليف الإيجار والمعدات",
      ] },

      { type: "h2", text: "المشاركة الناجحة تبدأ بالثقة" },
      { type: "p", text: "كل تعاون ناجح يقوم على الثقة والاحترام المتبادل. للحصول على تجربة إيجابية، من الأفضل الاتفاق قبل البدء على ما يلي:" },
      { type: "ul", items: [
        "قواعد استخدام المساحة",
        "ساعات الاستخدام",
        "المسؤوليات",
        "التكاليف",
        "طريقة استخدام المرافق المشتركة",
      ] },

      { type: "h2", text: "المستقبل ملك للمشاركة الذكية" },
      { type: "p", text: "يتجه اقتصاد اليوم أكثر من أي وقت مضى نحو الاستخدام الأمثل للموارد. مشاركة المساحة الذكية، إلى جانب تقليل التكاليف، تخلق علاقات جديدة وتزيد الإنتاجية وتدعم رواد الأعمال وتحقق استخداماً أكثر فعالية للموارد المتاحة." },

      { type: "h2", text: "الخاتمة" },
      { type: "p", text: "أحياناً، المساحة الفارغة ليست مجرد مساحة فارغة." },
      { type: "quote", text: "في Sefira، نؤمن بأن كل مساحة يمكن أن تحمل قيمة للآخرين، وأن كل مشاركة يمكن أن تخلق فرصة نمو للطرفين." },
      { type: "p", text: "إذا كانت لديك مساحة غير مستخدمة، شاركها مع الآخرين. وإذا كنت تبحث عن مساحة مناسبة، ربما تكون أفضل فرصة بانتظارك الآن." },
    ],
  },

  de: {
    title: "Die Psychologie des Raumteilens; Wie ein leerer Raum neue Chancen für Sie und andere schaffen kann",
    tag: "Leben & Karriere",
    readTime: "8 Min. Lesen",
    date: "2025",
    blocks: [
      { type: "p", text: "Heutzutage ist eine Wohnung, ein Büro, ein Laden, eine Praxis, eine Werkstatt oder sogar ein Parkplatz nicht nur ein physischer Raum; er kann eine Gelegenheit für Einkommen, Zusammenarbeit, das Kennenlernen neuer Menschen sowie persönliches und berufliches Wachstum sein." },
      { type: "p", text: "In den letzten Jahren hat das Konzept des Raumteilens (Space Sharing) weltweit ein bemerkenswertes Wachstum erfahren. Millionen von Menschen teilen einen Teil ihrer Wohnung, ihres Büros, ihres Ladens oder ihres Arbeitsbereichs mit anderen, und im Gegenzug finden diejenigen, die solche Räume benötigen, den passenden Raum, ohne hohe Kosten zu zahlen." },
      { type: "p", text: "Der Grund für die wachsende Beliebtheit dieses Lebensstils liegt jedoch nicht nur in geringeren Kosten. Raumteilen kann einen tiefgreifenden Einfluss auf die Lebensqualität, die psychische Gesundheit, den Aufbau neuer Verbindungen und sogar den beruflichen Erfolg haben." },

      { type: "h2", text: "Menschen sind für Verbindung geschaffen" },
      { type: "p", text: "Der Mensch ist von Natur aus ein soziales Wesen. Völlig unabhängig zu leben oder zu arbeiten mag manchmal beruhigend sein, kann aber auf lange Sicht das Gefühl der Einsamkeit verstärken, die Motivation senken und sogar Stress erhöhen." },
      { type: "p", text: "Wenn wir unseren Raum mit anderen teilen, entsteht die Möglichkeit für natürliche, alltägliche Verbindungen — von einem kurzen Gespräch in einer gemeinsamen Küche bis hin zu einer Zusammenarbeit, die Ihre berufliche Zukunft verändern könnte." },
      { type: "p", text: "Genau diese einfachen Verbindungen schaffen ein größeres Gefühl von Zugehörigkeit, Sicherheit und Zufriedenheit im Leben." },

      { type: "h2", text: "Ungenutzter Raum ist eine Einkommenschance" },
      { type: "p", text: "Fast jeder von uns hat Räume, die einen Großteil der Zeit ungenutzt bleiben:" },
      { type: "ul", items: [
        "Ein leerstehendes Zimmer",
        "Ein ungenutzter Schreibtisch im Büro",
        "Ein Teil eines Ladens ohne Kundschaft",
        "Ein freier Stuhl in einem Schönheitssalon",
        "Ein Praxisraum, der nur wenige Stunden pro Woche genutzt wird",
        "Der leere Teil eines Lagerraums",
        "Ein Parkplatz, der den größten Teil des Tages ungenutzt bleibt",
        "Ein Fitnessstudio oder Kursraum, der zu bestimmten Zeiten leer steht",
      ] },
      { type: "p", text: "Diese Räume mögen Ihnen gewöhnlich oder nutzlos erscheinen, aber für jemand anderen könnten sie genau die Gelegenheit sein, nach der er lange gesucht hat." },

      { type: "h2", text: "Raumteilen bedeutet nicht nur Einkommen zu erzielen" },
      { type: "p", text: "Dieser Lebensstil kann:" },
      { type: "ul", items: [
        "Ihre Kosten senken",
        "Ihr Netzwerk erweitern",
        "Neue berufliche Chancen schaffen",
        "Wertvolle Kooperationen entstehen lassen",
        "Das Gefühl der Einsamkeit verringern",
        "Ihre Lebensqualität verbessern",
      ] },
      { type: "p", text: "Manchmal wird ein kurzes Gespräch zwischen zwei Menschen in einem gemeinsamen Raum zum Beginn einer erfolgreichen Zusammenarbeit oder sogar zur Gründung eines neuen Unternehmens." },

      { type: "h2", text: "Kreativität entsteht durch Interaktion" },
      { type: "p", text: "Viele erfolgreiche Ideen der Welt sind nicht in formellen Sitzungen entstanden, sondern in einfachen, zufälligen Gesprächen." },
      { type: "ul", items: [
        "Ein Grafikdesigner lernt in einem gemeinsam genutzten Büro einen Entwickler kennen.",
        "Ein Fitnesstrainer teilt seinen Trainingsraum mit einem Physiotherapeuten.",
        "Ein Koch gründet seine eigene Lebensmittelmarke in einer gemeinsam genutzten Gewerbeküche.",
      ] },

      { type: "h2", text: "Weniger finanzieller Stress" },
      { type: "p", text: "Eine der größten Sorgen von heute sind die hohen Kosten für Miete und Instandhaltung von Räumen. Raumteilen hilft Menschen dabei:" },
      { type: "ul", items: [
        "Einkommen aus ihrem ungenutzten Raum zu erzielen",
        "Ihr Geschäft ohne große Investitionen zu starten",
        "Miet- und Ausstattungskosten zu senken",
      ] },

      { type: "h2", text: "Erfolgreiches Teilen beginnt mit Vertrauen" },
      { type: "p", text: "Jede erfolgreiche Zusammenarbeit basiert auf gegenseitigem Vertrauen und Respekt. Für eine positive Erfahrung ist es am besten, sich vor dem Start über Folgendes zu einigen:" },
      { type: "ul", items: [
        "Regeln für die Nutzung des Raums",
        "Nutzungszeiten",
        "Verantwortlichkeiten",
        "Kosten",
        "Wie gemeinsame Einrichtungen genutzt werden",
      ] },

      { type: "h2", text: "Die Zukunft gehört dem intelligenten Teilen" },
      { type: "p", text: "Die heutige Wirtschaft bewegt sich mehr denn je in Richtung einer optimalen Nutzung von Ressourcen. Intelligentes Raumteilen senkt nicht nur Kosten, sondern schafft auch neue Verbindungen, steigert die Produktivität, unterstützt Unternehmer und ermöglicht eine effektivere Nutzung vorhandener Ressourcen." },

      { type: "h2", text: "Fazit" },
      { type: "p", text: "Manchmal ist ein leerer Raum nicht nur ein leerer Raum." },
      { type: "quote", text: "Bei Sefira glauben wir, dass jeder Raum einen Wert für andere haben kann und dass jedes Teilen eine Wachstumschance für beide Seiten schafft." },
      { type: "p", text: "Wenn Sie einen ungenutzten Raum haben, teilen Sie ihn mit anderen. Wenn Sie auf der Suche nach dem passenden Raum sind, wartet vielleicht gerade jetzt die beste Gelegenheit auf Sie." },
    ],
  },

  ru: {
    title: "Психология совместного использования пространства; как пустое пространство может создать новые возможности для вас и других",
    tag: "Жизнь и карьера",
    readTime: "8 мин чтения",
    date: "2025",
    blocks: [
      { type: "p", text: "Сегодня дом, офис, магазин, кабинет, мастерская или даже парковочное место — это не просто физическое пространство; это может быть возможностью для дохода, сотрудничества, знакомства с новыми людьми и личностного и профессионального роста." },
      { type: "p", text: "В последние годы концепция совместного использования пространства (Space Sharing) значительно выросла по всему миру. Миллионы людей делятся частью своего дома, офиса, магазина или рабочего пространства с другими, а те, кому нужны такие пространства, находят подходящий вариант без больших затрат." },
      { type: "p", text: "Но причина растущей популярности этого образа жизни — не только снижение затрат. Совместное использование пространства может оказать глубокое влияние на качество жизни, психическое здоровье, установление новых связей и даже карьерный успех." },

      { type: "h2", text: "Люди созданы для общения" },
      { type: "p", text: "Человек по природе — существо социальное. Полностью независимая жизнь или работа, хотя иногда и умиротворяет, в долгосрочной перспективе может усилить чувство одиночества, снизить мотивацию и даже повысить уровень стресса." },
      { type: "p", text: "Когда мы делимся своим пространством с другими, появляется возможность для естественных, повседневных связей — от короткого разговора на общей кухне до сотрудничества, которое может изменить ваше профессиональное будущее." },
      { type: "p", text: "Именно эти простые связи создают большее чувство принадлежности, безопасности и удовлетворённости в жизни." },

      { type: "h2", text: "Неиспользуемое пространство — это возможность для дохода" },
      { type: "p", text: "Почти у каждого из нас есть пространства, которые большую часть времени остаются неиспользуемыми:" },
      { type: "ul", items: [
        "Пустующая комната",
        "Неиспользуемый стол в офисе",
        "Часть магазина без покупателей",
        "Свободное кресло в салоне красоты",
        "Кабинет, который используется всего несколько часов в неделю",
        "Пустая часть склада",
        "Парковочное место, не используемое большую часть дня",
        "Спортзал или учебный класс, пустующий в определённые часы",
      ] },
      { type: "p", text: "Эти пространства могут казаться вам обычными или бесполезными, но для кого-то другого они могут стать именно той возможностью, которую он долго искал." },

      { type: "h2", text: "Совместное использование пространства — это не только заработок" },
      { type: "p", text: "Такой образ жизни может:" },
      { type: "ul", items: [
        "Снизить ваши расходы",
        "Расширить вашу сеть контактов",
        "Создать новые карьерные возможности",
        "Сформировать ценные партнёрства",
        "Уменьшить чувство одиночества",
        "Улучшить качество вашей жизни",
      ] },
      { type: "p", text: "Иногда короткий разговор между двумя людьми в общем пространстве становится началом успешного сотрудничества или даже запуска нового бизнеса." },

      { type: "h2", text: "Творчество рождается из взаимодействия" },
      { type: "p", text: "Многие успешные идеи в мире родились не на официальных встречах, а в простых, случайных разговорах." },
      { type: "ul", items: [
        "Графический дизайнер знакомится с разработчиком в общем офисе.",
        "Фитнес-тренер делится своим пространством для тренировок с физиотерапевтом.",
        "Повар запускает собственный продуктовый бренд, используя общую промышленную кухню.",
      ] },

      { type: "h2", text: "Снижение финансового стресса" },
      { type: "p", text: "Одна из главных забот сегодня — высокая стоимость аренды и содержания помещений. Совместное использование пространства помогает людям:" },
      { type: "ul", items: [
        "Получать доход от неиспользуемого пространства",
        "Начинать бизнес без крупных инвестиций",
        "Снижать расходы на аренду и оборудование",
      ] },

      { type: "h2", text: "Успешное совместное использование начинается с доверия" },
      { type: "p", text: "Каждое успешное сотрудничество строится на взаимном доверии и уважении. Для положительного опыта лучше заранее договориться о следующем:" },
      { type: "ul", items: [
        "Правила использования пространства",
        "Часы использования",
        "Обязанности",
        "Расходы",
        "Порядок пользования общими удобствами",
      ] },

      { type: "h2", text: "Будущее за умным совместным использованием" },
      { type: "p", text: "Сегодняшняя экономика как никогда движется в сторону оптимального использования ресурсов. Умное совместное использование пространства не только снижает затраты, но и создаёт новые связи, повышает продуктивность, поддерживает предпринимателей и обеспечивает более эффективное использование имеющихся ресурсов." },

      { type: "h2", text: "Заключение" },
      { type: "p", text: "Иногда пустое пространство — это не просто пустое пространство." },
      { type: "quote", text: "В Sefira мы верим, что каждое пространство может представлять ценность для других, а каждое совместное использование может создать возможность для роста обеих сторон." },
      { type: "p", text: "Если у вас есть неиспользуемое пространство, поделитесь им с другими. А если вы ищете подходящее пространство, возможно, лучшая возможность ждёт вас прямо сейчас." },
    ],
  },
};

type CtaContent = { text: string; btn: string };

const CTA_CONTENT: Record<string, CtaContent> = {
  tr: { text: "Fırsatları kaçırmayın", btn: "Hemen Başla" },
  en: { text: "Don't miss the opportunities", btn: "Get Started" },
  fa: { text: "فرصت‌ها را از دست ندهید", btn: "همین الان شروع کن" },
  ar: { text: "لا تفوّت الفرص", btn: "ابدأ الآن" },
  de: { text: "Verpassen Sie keine Chancen", btn: "Jetzt starten" },
  ru: { text: "Не упускайте возможности", btn: "Начать сейчас" },
};

const BACK_TO_BLOG: Record<string, string> = {
  tr: "← Bloga Dön",
  en: "← Back to Blog",
  fa: "→ بازگشت به بلاگ",
  ar: "→ العودة إلى المدونة",
  de: "← Zurück zum Blog",
  ru: "← Назад в блог",
};

const HOME_LABEL: Record<string, string> = {
  tr: "Ana Sayfa",
  en: "Home",
  fa: "صفحه اصلی",
  ar: "الصفحة الرئيسية",
  de: "Startseite",
  ru: "Главная",
};

function renderBlock(block: Block, i: number) {
  switch (block.type) {
    case "h2":
      return (
        <h2 key={i} className="text-xl sm:text-2xl font-black mt-10 mb-3" style={{ color: "#f97316" }}>
          {block.text}
        </h2>
      );
    case "p":
      return (
        <p key={i} className="text-base text-stone-700 leading-loose mb-4">
          {block.text}
        </p>
      );
    case "ul":
      return (
        <ul key={i} className="mb-4 space-y-2">
          {block.items.map((item, j) => (
            <li key={j} className="flex items-start gap-3 text-base text-stone-700 leading-relaxed">
              <span
                className="mt-2.5 w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{ background: "#f97316" }}
              />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      );
    case "quote":
      return (
        <blockquote
          key={i}
          className="my-6 pl-5 rtl:pl-0 rtl:pr-5 border-l-4 rtl:border-l-0 rtl:border-r-4 text-stone-600 italic text-lg leading-relaxed"
          style={{ borderColor: "#f97316" }}
        >
          {block.text}
        </blockquote>
      );
  }
}

export default function SpaceSharingPsychologyPage() {
  const { lang } = useLang();
  const isRtl = lang === "fa" || lang === "ar";

  const article = ARTICLE_CONTENT[lang] || ARTICLE_CONTENT.tr;
  const cta = CTA_CONTENT[lang] || CTA_CONTENT.tr;
  const backLabel = BACK_TO_BLOG[lang] || BACK_TO_BLOG.tr;
  const homeLabel = HOME_LABEL[lang] || HOME_LABEL.tr;

  return (
    <div className="min-h-screen bg-white" dir={isRtl ? "rtl" : "ltr"}>
      <div
        className="relative px-6 py-16 sm:py-20 text-center"
        style={{ background: "linear-gradient(135deg, #f97316, #f59e0b)" }}
      >
        <div className="max-w-2xl mx-auto">
          <span className="inline-block text-xs font-bold px-3 py-1 rounded-full bg-white/20 text-white mb-4">
            {article.tag}
          </span>
          <h1 className="text-2xl sm:text-4xl font-black text-white leading-snug mb-5">
            {article.title}
          </h1>
          <div className="flex items-center justify-center gap-3 text-sm font-semibold text-white/80">
            <span>{article.date}</span>
            <span className="w-1 h-1 rounded-full bg-white/60" />
            <span>{article.readTime}</span>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-12">
        <article>{article.blocks.map((b, i) => renderBlock(b, i))}</article>

        <div
          className="mt-14 rounded-3xl p-8 text-center text-white"
          style={{ background: "linear-gradient(135deg, #f97316, #f59e0b)" }}
        >
          <p className="text-lg sm:text-xl font-bold mb-5">{cta.text}</p>
          <Link
            href="/"
            className="inline-block bg-white text-orange-600 font-bold text-sm px-6 py-3 rounded-2xl hover:bg-stone-100 transition-colors duration-200"
          >
            {cta.btn}
          </Link>
        </div>

        <div className="flex items-center justify-center gap-3 mt-8 mb-4">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm font-semibold text-stone-600 bg-white border border-stone-200 hover:bg-stone-50 rounded-full px-5 py-2.5 transition-colors duration-200"
          >
            {backLabel}
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-white bg-gradient-to-r from-orange-500 to-amber-500 rounded-full px-5 py-2.5 hover:shadow-lg hover:scale-105 transition-all duration-200"
          >
            🏠 {homeLabel}
          </Link>
        </div>
      </div>
    </div>
  );
}