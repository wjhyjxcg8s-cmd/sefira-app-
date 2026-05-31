"use client";

import Link from "next/link";

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto px-4 py-8" dir="rtl">

        {/* Back button */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold px-4 py-2 rounded-2xl transition-colors duration-200 mb-8"
        >
          ← بازگشت به صفحه اصلی
        </Link>

        {/* Title */}
        <h1 className="text-2xl font-black text-gray-900 mb-2">
          سیاست استفاده از کوکی‌ها
        </h1>
        <p className="text-sm text-gray-400 mb-6">آخرین بروزرسانی: ژوئن ۲۰۲۶</p>

        <hr className="border-t border-gray-100 my-4" />

        {/* Section 1 */}
        <h2 className="text-lg font-bold text-gray-800 mt-6 mb-2">۱. کوکی چیست؟</h2>
        <p className="text-sm text-gray-600 leading-relaxed">
          کوکی‌ها فایل‌های کوچک متنی هستند که هنگام بازدید از وب‌سایت سفیرا روی دستگاه شما ذخیره می‌شوند.
          این فایل‌ها به ما کمک می‌کنند تجربه‌ای شخصی‌سازی‌شده و روان‌تر برای شما فراهم کنیم،
          ترجیحات شما را به یاد بیاوریم و عملکرد سایت را بهبود دهیم.
        </p>

        <hr className="border-t border-gray-100 my-4" />

        {/* Section 2 */}
        <h2 className="text-lg font-bold text-gray-800 mt-6 mb-2">۲. انواع کوکی‌هایی که استفاده می‌کنیم</h2>

        <p className="text-sm font-semibold text-gray-700 mt-3 mb-1">الف) کوکی‌های ضروری</p>
        <p className="text-sm text-gray-600 leading-relaxed">
          این کوکی‌ها برای عملکرد اصلی وب‌سایت ضروری هستند و نمی‌توان آن‌ها را غیرفعال کرد.
          شامل حفظ وضعیت ورود به سیستم، ذخیره تنظیمات امنیتی و مدیریت جلسه کاربری می‌شوند.
        </p>

        <p className="text-sm font-semibold text-gray-700 mt-3 mb-1">ب) کوکی‌های عملکردی</p>
        <p className="text-sm text-gray-600 leading-relaxed">
          این کوکی‌ها ترجیحات شما مانند زبان انتخابی، واحد پول و تنظیمات نمایش را ذخیره می‌کنند
          تا در بازدیدهای بعدی نیازی به تنظیم مجدد نداشته باشید.
        </p>

        <p className="text-sm font-semibold text-gray-700 mt-3 mb-1">ج) کوکی‌های تحلیلی</p>
        <p className="text-sm text-gray-600 leading-relaxed">
          از این کوکی‌ها برای درک نحوه استفاده بازدیدکنندگان از سایت استفاده می‌کنیم.
          اطلاعات جمع‌آوری‌شده کاملاً ناشناس است و به بهبود خدمات ما کمک می‌کند.
          ابزارهایی مانند Google Analytics ممکن است در این دسته قرار گیرند.
        </p>

        <p className="text-sm font-semibold text-gray-700 mt-3 mb-1">د) کوکی‌های بازاریابی</p>
        <p className="text-sm text-gray-600 leading-relaxed">
          این کوکی‌ها برای نمایش تبلیغات مرتبط و شخصی‌سازی‌شده استفاده می‌شوند.
          ما اطلاعات شما را با شرکای تبلیغاتی معتمد به اشتراک می‌گذاریم،
          اما هرگز اطلاعات شخصی قابل شناسایی را بدون رضایت شما منتقل نمی‌کنیم.
        </p>

        <hr className="border-t border-gray-100 my-4" />

        {/* Section 3 */}
        <h2 className="text-lg font-bold text-gray-800 mt-6 mb-2">۳. کوکی‌های شخص ثالث</h2>
        <p className="text-sm text-gray-600 leading-relaxed">
          برخی از ویژگی‌های سایت ما از سرویس‌های شخص ثالث استفاده می‌کنند که ممکن است کوکی‌های
          خود را تنظیم کنند. این سرویس‌ها شامل موارد زیر می‌شوند:
        </p>
        <ul className="text-sm text-gray-600 leading-relaxed mt-2 space-y-1 list-disc list-inside">
          <li>Google Analytics — تحلیل رفتار کاربران</li>
          <li>Stripe — پردازش پرداخت امن</li>
          <li>Supabase — احراز هویت و ذخیره‌سازی داده</li>
          <li>Cloudflare — امنیت و بهینه‌سازی عملکرد</li>
        </ul>
        <p className="text-sm text-gray-600 leading-relaxed mt-2">
          این شرکت‌ها دارای سیاست حریم خصوصی مستقل هستند و ما مسئولیتی در قبال کوکی‌های آن‌ها نداریم.
        </p>

        <hr className="border-t border-gray-100 my-4" />

        {/* Section 4 */}
        <h2 className="text-lg font-bold text-gray-800 mt-6 mb-2">۴. مدت نگهداری کوکی‌ها</h2>
        <p className="text-sm text-gray-600 leading-relaxed">
          کوکی‌های جلسه‌ای (Session Cookies) پس از بستن مرورگر به‌طور خودکار حذف می‌شوند.
          کوکی‌های دائمی (Persistent Cookies) برای مدت مشخصی — معمولاً بین ۳۰ روز تا ۲ سال —
          روی دستگاه شما باقی می‌مانند، مگر اینکه خودتان آن‌ها را زودتر حذف کنید.
        </p>

        <hr className="border-t border-gray-100 my-4" />

        {/* Section 5 */}
        <h2 className="text-lg font-bold text-gray-800 mt-6 mb-2">۵. مدیریت و غیرفعال‌سازی کوکی‌ها</h2>
        <p className="text-sm text-gray-600 leading-relaxed">
          شما می‌توانید از طریق تنظیمات مرورگر خود، کوکی‌ها را مدیریت یا حذف کنید.
          توجه داشته باشید که غیرفعال کردن برخی کوکی‌ها ممکن است عملکرد سایت را تحت تأثیر قرار دهد.
          راهنمای مدیریت کوکی در مرورگرهای مختلف:
        </p>
        <ul className="text-sm text-gray-600 leading-relaxed mt-2 space-y-1 list-disc list-inside">
          <li>Google Chrome: تنظیمات ← حریم خصوصی و امنیت ← کوکی‌ها</li>
          <li>Mozilla Firefox: تنظیمات ← حریم خصوصی و امنیت</li>
          <li>Safari: ترجیحات ← حریم خصوصی</li>
          <li>Microsoft Edge: تنظیمات ← کوکی‌ها و مجوزهای سایت</li>
        </ul>

        <hr className="border-t border-gray-100 my-4" />

        {/* Section 6 */}
        <h2 className="text-lg font-bold text-gray-800 mt-6 mb-2">۶. رضایت شما</h2>
        <p className="text-sm text-gray-600 leading-relaxed">
          با ادامه استفاده از سایت سفیرا، شما با استفاده از کوکی‌های ضروری موافقت می‌کنید.
          برای سایر دسته‌بندی‌های کوکی، از شما رضایت صریح دریافت خواهیم کرد.
          می‌توانید در هر زمان رضایت خود را پس بگیرید؛ این کار هیچ تأثیری بر قانونی بودن
          پردازش‌های انجام‌شده پیش از آن ندارد.
        </p>

        <hr className="border-t border-gray-100 my-4" />

        {/* Section 7 */}
        <h2 className="text-lg font-bold text-gray-800 mt-6 mb-2">۷. تغییرات در سیاست کوکی</h2>
        <p className="text-sm text-gray-600 leading-relaxed">
          ما این سیاست را ممکن است به‌روزرسانی کنیم تا منعکس‌کننده تغییرات در فناوری، قوانین
          یا خدمات ما باشد. تاریخ «آخرین بروزرسانی» در بالای این صفحه را دنبال کنید.
          استفاده مداوم از سایت پس از انتشار تغییرات به منزله پذیرش آن‌ها تلقی می‌شود.
        </p>

        <hr className="border-t border-gray-100 my-4" />

        {/* Section 8 */}
        <h2 className="text-lg font-bold text-gray-800 mt-6 mb-2">۸. تماس با ما</h2>
        <p className="text-sm text-gray-600 leading-relaxed">
          اگر سؤالی درباره سیاست کوکی‌های ما دارید، می‌توانید از طریق راه‌های زیر با ما در تماس باشید:
        </p>
        <ul className="text-sm text-gray-600 leading-relaxed mt-2 space-y-1">
          <li>ایمیل: <span className="text-orange-500 font-medium" dir="ltr">privacy@sefira.app</span></li>
          <li>وب‌سایت: <span className="text-orange-500 font-medium" dir="ltr">sefira.app</span></li>
        </ul>

        <div className="mt-10 mb-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold px-4 py-2 rounded-2xl transition-colors duration-200"
          >
            ← بازگشت به صفحه اصلی
          </Link>
        </div>

      </div>
    </div>
  );
}
