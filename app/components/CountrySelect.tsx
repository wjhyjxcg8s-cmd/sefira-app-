'use client'
import { useState, useRef, useEffect } from 'react'

const PRIORITY_COUNT = 8

// First 8 entries = priority (⭐ + orange divider), rest sorted alphabetically
const COUNTRIES: Record<string, string[]> = {
  tr: [
    'Rusya', 'Türkiye', 'Almanya', 'Amerika Birleşik Devletleri',
    'Fransa', 'İtalya', 'Birleşik Krallık', 'İran',
    'Afganistan', 'Andorra', 'Angola', 'Antigua ve Barbuda', 'Arjantin',
    'Arnavutluk', 'Avustralya', 'Avusturya', 'Azerbaycan',
    'Bahamalar', 'Bahreyn', 'Bangladeş', 'Barbados', 'Belçika', 'Belize',
    'Benin', 'Beyaz Rusya', 'Bhutan', 'Birleşik Arap Emirlikleri',
    'Bolivya', 'Bosna Hersek', 'Botsvana', 'Brezilya', 'Brunei',
    'Bulgaristan', 'Burkina Faso', 'Burundi',
    'Cabo Verde', 'Cezayir', 'Cibuti', 'Çad', 'Çekya', 'Çin',
    'Danimarka', 'Demokratik Kongo Cumhuriyeti', 'Dominik Cumhuriyeti', 'Dominika',
    'Ekvador', 'Ekvator Ginesi', 'El Salvador', 'Endonezya', 'Eritre',
    'Ermenistan', 'Estonya', 'Etiyopya',
    'Fas', 'Fiji', 'Fildişi Sahili', 'Filipinler', 'Finlandiya',
    'Gabon', 'Gambiya', 'Gana', 'Gine', 'Gine-Bissau', 'Grenada',
    'Guatemala', 'Guyana', 'Güney Afrika', 'Güney Kore', 'Güney Sudan', 'Gürcistan',
    'Haiti', 'Hırvatistan', 'Hindistan', 'Hollanda', 'Honduras',
    'Irak', 'İrlanda', 'İspanya', 'İsrail', 'İsveç', 'İsviçre', 'İzlanda',
    'Jamaika', 'Japonya',
    'Kamboçya', 'Kamerun', 'Kanada', 'Karadağ', 'Katar', 'Kazakistan',
    'Kenya', 'Kıbrıs', 'Kırgızistan', 'Kiribati', 'Kolombiya', 'Komorlar',
    'Kongo', 'Kosova', 'Kosta Rika', 'Küba', 'Kuzey Kore', 'Kuzey Makedonya', 'Kuveyt',
    'Laos', 'Lesoto', 'Letonya', 'Liberya', 'Libya', 'Liechtenstein',
    'Litvanya', 'Lübnan', 'Lüksemburg',
    'Macaristan', 'Madagaskar', 'Malavi', 'Maldivler', 'Malezya', 'Mali',
    'Malta', 'Marshall Adaları', 'Mauritanya', 'Mauritius', 'Meksika',
    'Mikronezya', 'Mısır', 'Moğolistan', 'Moldova', 'Monako', 'Mozambik', 'Myanmar',
    'Namibya', 'Nauru', 'Nepal', 'Nijer', 'Nijerya', 'Nikaragua', 'Norveç',
    'Orta Afrika Cumhuriyeti', 'Özbekistan',
    'Pakistan', 'Palau', 'Filistin', 'Panama', 'Papua Yeni Gine', 'Paraguay', 'Peru',
    'Polonya', 'Portekiz',
    'Romanya', 'Rwanda',
    'Saint Kitts ve Nevis', 'Saint Lucia', 'Saint Vincent', 'Samoa',
    'San Marino', 'Sao Tome ve Principe', 'Senegal', 'Seyşeller', 'Sierra Leone',
    'Singapur', 'Sırbistan', 'Slovakya', 'Slovenya', 'Solomon Adaları',
    'Somali', 'Sri Lanka', 'Sudan', 'Surinam', 'Suriye', 'Suudi Arabistan', 'Svaziland',
    'Şili',
    'Tacikistan', 'Tanzanya', 'Tayland', 'Timor-Leste', 'Togo', 'Tonga',
    'Trinidad ve Tobago', 'Tunus', 'Türkmenistan', 'Tuvalu',
    'Uganda', 'Ukrayna', 'Umman', 'Uruguay', 'Ürdün',
    'Vanuatu', 'Venezuela', 'Vietnam',
    'Yemen', 'Yeni Zelanda', 'Yunanistan',
    'Zambiya', 'Zimbabve',
  ],
  en: [
    'Russia', 'Turkey', 'Germany', 'United States',
    'France', 'Italy', 'United Kingdom', 'Iran',
    'Afghanistan', 'Albania', 'Algeria', 'Andorra', 'Angola',
    'Antigua and Barbuda', 'Argentina', 'Armenia', 'Australia', 'Austria', 'Azerbaijan',
    'Bahamas', 'Bahrain', 'Bangladesh', 'Barbados', 'Belarus', 'Belgium',
    'Belize', 'Benin', 'Bhutan', 'Bolivia', 'Bosnia and Herzegovina',
    'Botswana', 'Brazil', 'Brunei', 'Bulgaria', 'Burkina Faso', 'Burundi',
    'Cabo Verde', 'Cambodia', 'Cameroon', 'Canada', 'Central African Republic',
    'Chad', 'Chile', 'China', 'Colombia', 'Comoros', 'Congo',
    'Costa Rica', 'Croatia', 'Cuba', 'Cyprus', 'Czech Republic',
    'Democratic Republic of the Congo', 'Denmark', 'Djibouti', 'Dominica', 'Dominican Republic',
    'Ecuador', 'Egypt', 'El Salvador', 'Equatorial Guinea', 'Eritrea',
    'Estonia', 'Eswatini', 'Ethiopia',
    'Fiji', 'Finland',
    'Gabon', 'Gambia', 'Georgia', 'Ghana', 'Greece', 'Grenada',
    'Guatemala', 'Guinea', 'Guinea-Bissau', 'Guyana',
    'Haiti', 'Honduras', 'Hungary',
    'Iceland', 'India', 'Indonesia', 'Iraq', 'Ireland', 'Israel', 'Ivory Coast',
    'Jamaica', 'Japan', 'Jordan',
    'Kazakhstan', 'Kenya', 'Kiribati', 'Kosovo', 'Kuwait', 'Kyrgyzstan',
    'Laos', 'Latvia', 'Lebanon', 'Lesotho', 'Liberia', 'Libya',
    'Liechtenstein', 'Lithuania', 'Luxembourg',
    'Madagascar', 'Malawi', 'Malaysia', 'Maldives', 'Mali', 'Malta',
    'Marshall Islands', 'Mauritania', 'Mauritius', 'Mexico', 'Micronesia',
    'Moldova', 'Monaco', 'Mongolia', 'Montenegro', 'Morocco', 'Mozambique', 'Myanmar',
    'Namibia', 'Nauru', 'Nepal', 'Netherlands', 'New Zealand', 'Nicaragua',
    'Niger', 'Nigeria', 'North Korea', 'North Macedonia', 'Norway',
    'Oman',
    'Pakistan', 'Palau', 'Palestine', 'Panama', 'Papua New Guinea',
    'Paraguay', 'Peru', 'Philippines', 'Poland', 'Portugal',
    'Qatar',
    'Romania', 'Rwanda',
    'Saint Kitts and Nevis', 'Saint Lucia', 'Saint Vincent and the Grenadines',
    'Samoa', 'San Marino', 'São Tomé and Príncipe', 'Saudi Arabia', 'Senegal',
    'Serbia', 'Seychelles', 'Sierra Leone', 'Singapore', 'Slovakia', 'Slovenia',
    'Solomon Islands', 'Somalia', 'South Africa', 'South Korea', 'South Sudan',
    'Spain', 'Sri Lanka', 'Sudan', 'Suriname', 'Sweden', 'Switzerland', 'Syria',
    'Tajikistan', 'Tanzania', 'Thailand', 'Timor-Leste', 'Togo', 'Tonga',
    'Trinidad and Tobago', 'Tunisia', 'Turkmenistan', 'Tuvalu',
    'Uganda', 'Ukraine', 'United Arab Emirates', 'Uruguay', 'Uzbekistan',
    'Vanuatu', 'Venezuela', 'Vietnam',
    'Yemen',
    'Zambia', 'Zimbabwe',
  ],
  fa: [
    'روسیه', 'ترکیه', 'آلمان', 'ایالات متحده آمریکا',
    'فرانسه', 'ایتالیا', 'بریتانیا', 'ایران',
    'افغانستان', 'آلبانی', 'الجزایر', 'آندورا', 'آنگولا',
    'آنتیگوا و باربودا', 'آرژانتین', 'ارمنستان', 'استرالیا', 'اتریش', 'آذربایجان',
    'باهاما', 'بحرین', 'بنگلادش', 'باربادوس', 'بلاروس', 'بلژیک',
    'بلیز', 'بنین', 'بوتان', 'بولیوی', 'بوسنی و هرزگوین',
    'بوتسوانا', 'برزیل', 'برونئی', 'بلغارستان', 'بورکینافاسو', 'بوروندی',
    'کابوورده', 'کامبوج', 'کامرون', 'کانادا', 'جمهوری آفریقای مرکزی',
    'چاد', 'شیلی', 'چین', 'کلمبیا', 'کومور', 'کنگو',
    'کاستاریکا', 'کرواسی', 'کوبا', 'قبرس', 'جمهوری چک',
    'جمهوری دموکراتیک کنگو', 'دانمارک', 'جیبوتی', 'دومینیکا', 'جمهوری دومینیکن',
    'اکوادور', 'مصر', 'السالوادور', 'گینه استوایی', 'اریتره',
    'استونی', 'اسواتینی', 'اتیوپی',
    'فیجی', 'فنلاند',
    'گابون', 'گامبیا', 'گرجستان', 'غنا', 'یونان', 'گرنادا',
    'گواتمالا', 'گینه', 'گینه‌بیسائو', 'گویان',
    'هائیتی', 'هندوراس', 'مجارستان',
    'ایسلند', 'هند', 'اندونزی', 'عراق', 'ایرلند', 'اسرائیل', 'ساحل عاج',
    'جامائیکا', 'ژاپن', 'اردن',
    'قزاقستان', 'کنیا', 'کیریباتی', 'کوزوو', 'کویت', 'قرقیزستان',
    'لائوس', 'لتونی', 'لبنان', 'لسوتو', 'لیبریا', 'لیبی',
    'لیختن‌اشتاین', 'لیتوانی', 'لوکزامبورگ',
    'ماداگاسکار', 'مالاوی', 'مالزی', 'مالدیو', 'مالی', 'مالت',
    'جزایر مارشال', 'موریتانی', 'موریس', 'مکزیک', 'میکرونزی',
    'مولداوی', 'موناکو', 'مغولستان', 'مونتهنگرو', 'مراکش', 'موزامبیک', 'میانمار',
    'نامیبیا', 'نائورو', 'نپال', 'هلند', 'نیوزیلند', 'نیکاراگوئه',
    'نیجر', 'نیجریه', 'کره شمالی', 'مقدونیه شمالی', 'نروژ',
    'عمان',
    'پاکستان', 'پالائو', 'فلسطین', 'پاناما', 'پاپوآ گینه نو',
    'پاراگوئه', 'پرو', 'فیلیپین', 'لهستان', 'پرتغال',
    'قطر',
    'رومانی', 'رواندا',
    'سنت کیتس و نویس', 'سنت لوسیا', 'سنت وینسنت و گرنادین‌ها',
    'ساموآ', 'سان مارینو', 'سائوتومه و پرینسیپه', 'عربستان سعودی', 'سنگال',
    'صربستان', 'سیشل', 'سیرالئون', 'سنگاپور', 'اسلواکی', 'اسلوونی',
    'جزایر سلیمان', 'سومالی', 'آفریقای جنوبی', 'کره جنوبی', 'سودان جنوبی',
    'اسپانیا', 'سریلانکا', 'سودان', 'سورینام', 'سوئد', 'سوئیس', 'سوریه',
    'تاجیکستان', 'تانزانیا', 'تایلند', 'تیمور-لسته', 'توگو', 'تونگا',
    'ترینیداد و توباگو', 'تونس', 'ترکمنستان', 'تووالو',
    'اوگاندا', 'اوکراین', 'امارات متحده عربی', 'اروگوئه', 'ازبکستان',
    'وانواتو', 'ونزوئلا', 'ویتنام',
    'یمن',
    'زامبیا', 'زیمبابوه',
  ],
  ar: [
    'روسيا', 'تركيا', 'ألمانيا', 'الولايات المتحدة الأمريكية',
    'فرنسا', 'إيطاليا', 'المملكة المتحدة', 'إيران',
    'أفغانستان', 'ألبانيا', 'الجزائر', 'أندورا', 'أنغولا',
    'أنتيغوا وبربودا', 'الأرجنتين', 'أرمينيا', 'أستراليا', 'النمسا', 'أذربيجان',
    'جزر البهاما', 'البحرين', 'بنغلاديش', 'باربادوس', 'بيلاروسيا', 'بلجيكا',
    'بليز', 'بنين', 'بوتان', 'بوليفيا', 'البوسنة والهرسك',
    'بوتسوانا', 'البرازيل', 'بروناي', 'بلغاريا', 'بوركينا فاسو', 'بوروندي',
    'الرأس الأخضر', 'كمبوديا', 'الكاميرون', 'كندا', 'جمهورية أفريقيا الوسطى',
    'تشاد', 'تشيلي', 'الصين', 'كولومبيا', 'جزر القمر', 'الكونغو',
    'كوستاريكا', 'كرواتيا', 'كوبا', 'قبرص', 'جمهورية التشيك',
    'جمهورية الكونغو الديمقراطية', 'الدنمارك', 'جيبوتي', 'دومينيكا', 'جمهورية الدومينيكان',
    'الإكوادور', 'مصر', 'السلفادور', 'غينيا الاستوائية', 'إريتريا',
    'إستونيا', 'إسواتيني', 'إثيوبيا',
    'فيجي', 'فنلندا',
    'الغابون', 'غامبيا', 'جورجيا', 'غانا', 'اليونان', 'غرينادا',
    'غواتيمالا', 'غينيا', 'غينيا بيساو', 'غيانا',
    'هايتي', 'هندوراس', 'المجر',
    'آيسلندا', 'الهند', 'إندونيسيا', 'العراق', 'إيرلندا', 'إسرائيل', 'ساحل العاج',
    'جامايكا', 'اليابان', 'الأردن',
    'كازاخستان', 'كينيا', 'كيريباتي', 'كوسوفو', 'الكويت', 'قيرغيزستان',
    'لاوس', 'لاتفيا', 'لبنان', 'ليسوتو', 'ليبيريا', 'ليبيا',
    'ليختنشتاين', 'ليتوانيا', 'لوكسمبورغ',
    'مدغشقر', 'ملاوي', 'ماليزيا', 'جزر المالديف', 'مالي', 'مالطا',
    'جزر مارشال', 'موريتانيا', 'موريشيوس', 'المكسيك', 'ميكرونيزيا',
    'مولدوفا', 'موناكو', 'منغوليا', 'الجبل الأسود', 'المغرب', 'موزمبيق', 'ميانمار',
    'ناميبيا', 'ناورو', 'نيبال', 'هولندا', 'نيوزيلندا', 'نيكاراغوا',
    'النيجر', 'نيجيريا', 'كوريا الشمالية', 'مقدونيا الشمالية', 'النرويج',
    'عُمان',
    'باكستان', 'بالاو', 'فلسطين', 'بنما', 'بابوا غينيا الجديدة',
    'باراغواي', 'بيرو', 'الفلبين', 'بولندا', 'البرتغال',
    'قطر',
    'رومانيا', 'رواندا',
    'سانت كيتس ونيفيس', 'سانت لوسيا', 'سانت فنسنت وجزر غرينادين',
    'ساموا', 'سان مارينو', 'ساو تومي وبرينسيبي', 'المملكة العربية السعودية', 'السنغال',
    'صربيا', 'سيشيل', 'سيراليون', 'سنغافورة', 'سلوفاكيا', 'سلوفينيا',
    'جزر سليمان', 'الصومال', 'جنوب أفريقيا', 'كوريا الجنوبية', 'جنوب السودان',
    'إسبانيا', 'سريلانكا', 'السودان', 'سورينام', 'السويد', 'سويسرا', 'سوريا',
    'طاجيكستان', 'تنزانيا', 'تايلاند', 'تيمور الشرقية', 'توغو', 'تونغا',
    'ترينيداد وتوباغو', 'تونس', 'تركمانستان', 'توفالو',
    'أوغندا', 'أوكرانيا', 'الإمارات العربية المتحدة', 'أوروغواي', 'أوزبكستان',
    'فانواتو', 'فنزويلا', 'فيتنام',
    'اليمن',
    'زامبيا', 'زيمبابوي',
  ],
  de: [
    'Russland', 'Türkei', 'Deutschland', 'Vereinigte Staaten',
    'Frankreich', 'Italien', 'Vereinigtes Königreich', 'Iran',
    'Afghanistan', 'Albanien', 'Algerien', 'Andorra', 'Angola',
    'Antigua und Barbuda', 'Argentinien', 'Armenien', 'Australien', 'Österreich', 'Aserbaidschan',
    'Bahamas', 'Bahrain', 'Bangladesch', 'Barbados', 'Belarus', 'Belgien',
    'Belize', 'Benin', 'Bhutan', 'Bolivien', 'Bosnien und Herzegowina',
    'Botswana', 'Brasilien', 'Brunei', 'Bulgarien', 'Burkina Faso', 'Burundi',
    'Cabo Verde', 'Kambodscha', 'Kamerun', 'Kanada', 'Zentralafrikanische Republik',
    'Tschad', 'Chile', 'China', 'Kolumbien', 'Komoren', 'Kongo',
    'Costa Rica', 'Kroatien', 'Kuba', 'Zypern', 'Tschechien',
    'Demokratische Republik Kongo', 'Dänemark', 'Dschibuti', 'Dominica', 'Dominikanische Republik',
    'Ecuador', 'Ägypten', 'El Salvador', 'Äquatorialguinea', 'Eritrea',
    'Estland', 'Eswatini', 'Äthiopien',
    'Fidschi', 'Finnland',
    'Gabun', 'Gambia', 'Georgien', 'Ghana', 'Griechenland', 'Grenada',
    'Guatemala', 'Guinea', 'Guinea-Bissau', 'Guyana',
    'Haiti', 'Honduras', 'Ungarn',
    'Island', 'Indien', 'Indonesien', 'Irak', 'Irland', 'Israel', 'Elfenbeinküste',
    'Jamaika', 'Japan', 'Jordanien',
    'Kasachstan', 'Kenia', 'Kiribati', 'Kosovo', 'Kuwait', 'Kirgisistan',
    'Laos', 'Lettland', 'Libanon', 'Lesotho', 'Liberia', 'Libyen',
    'Liechtenstein', 'Litauen', 'Luxemburg',
    'Madagaskar', 'Malawi', 'Malaysia', 'Malediven', 'Mali', 'Malta',
    'Marshallinseln', 'Mauretanien', 'Mauritius', 'Mexiko', 'Mikronesien',
    'Moldau', 'Monaco', 'Mongolei', 'Montenegro', 'Marokko', 'Mosambik', 'Myanmar',
    'Namibia', 'Nauru', 'Nepal', 'Niederlande', 'Neuseeland', 'Nicaragua',
    'Niger', 'Nigeria', 'Nordkorea', 'Nordmazedonien', 'Norwegen',
    'Oman',
    'Pakistan', 'Palau', 'Palästina', 'Panama', 'Papua-Neuguinea',
    'Paraguay', 'Peru', 'Philippinen', 'Polen', 'Portugal',
    'Katar',
    'Rumänien', 'Ruanda',
    'St. Kitts und Nevis', 'St. Lucia', 'St. Vincent und die Grenadinen',
    'Samoa', 'San Marino', 'São Tomé und Príncipe', 'Saudi-Arabien', 'Senegal',
    'Serbien', 'Seychellen', 'Sierra Leone', 'Singapur', 'Slowakei', 'Slowenien',
    'Salomonen', 'Somalia', 'Südafrika', 'Südkorea', 'Südsudan',
    'Spanien', 'Sri Lanka', 'Sudan', 'Suriname', 'Schweden', 'Schweiz', 'Syrien',
    'Tadschikistan', 'Tansania', 'Thailand', 'Timor-Leste', 'Togo', 'Tonga',
    'Trinidad und Tobago', 'Tunesien', 'Turkmenistan', 'Tuvalu',
    'Uganda', 'Ukraine', 'Vereinigte Arabische Emirate', 'Uruguay', 'Usbekistan',
    'Vanuatu', 'Venezuela', 'Vietnam',
    'Jemen',
    'Sambia', 'Simbabwe',
  ],
  ru: [
    'Россия', 'Турция', 'Германия', 'США',
    'Франция', 'Италия', 'Великобритания', 'Иран',
    'Афганистан', 'Албания', 'Алжир', 'Андорра', 'Ангола',
    'Антигуа и Барбуда', 'Аргентина', 'Армения', 'Австралия', 'Австрия', 'Азербайджан',
    'Багамы', 'Бахрейн', 'Бангладеш', 'Барбадос', 'Беларусь', 'Бельгия',
    'Белиз', 'Бенин', 'Бутан', 'Боливия', 'Босния и Герцеговина',
    'Ботсвана', 'Бразилия', 'Бруней', 'Болгария', 'Буркина-Фасо', 'Бурунди',
    'Кабо-Верде', 'Камбоджа', 'Камерун', 'Канада', 'Центральноафриканская Республика',
    'Чад', 'Чили', 'Китай', 'Колумбия', 'Коморы', 'Конго',
    'Коста-Рика', 'Хорватия', 'Куба', 'Кипр', 'Чехия',
    'Демократическая Республика Конго', 'Дания', 'Джибути', 'Доминика', 'Доминиканская Республика',
    'Эквадор', 'Египет', 'Сальвадор', 'Экваториальная Гвинея', 'Эритрея',
    'Эстония', 'Эсватини', 'Эфиопия',
    'Фиджи', 'Финляндия',
    'Габон', 'Гамбия', 'Грузия', 'Гана', 'Греция', 'Гренада',
    'Гватемала', 'Гвинея', 'Гвинея-Бисау', 'Гайана',
    'Гаити', 'Гондурас', 'Венгрия',
    'Исландия', 'Индия', 'Индонезия', 'Ирак', 'Ирландия', 'Израиль', 'Кот-д\'Ивуар',
    'Ямайка', 'Япония', 'Иордания',
    'Казахстан', 'Кения', 'Кирибати', 'Косово', 'Кувейт', 'Кыргызстан',
    'Лаос', 'Латвия', 'Ливан', 'Лесото', 'Либерия', 'Ливия',
    'Лихтенштейн', 'Литва', 'Люксембург',
    'Мадагаскар', 'Малави', 'Малайзия', 'Мальдивы', 'Мали', 'Мальта',
    'Маршалловы Острова', 'Мавритания', 'Маврикий', 'Мексика', 'Микронезия',
    'Молдова', 'Монако', 'Монголия', 'Черногория', 'Марокко', 'Мозамбик', 'Мьянма',
    'Намибия', 'Науру', 'Непал', 'Нидерланды', 'Новая Зеландия', 'Никарагуа',
    'Нигер', 'Нигерия', 'Северная Корея', 'Северная Македония', 'Норвегия',
    'Оман',
    'Пакистан', 'Палау', 'Палестина', 'Панама', 'Папуа — Новая Гвинея',
    'Парагвай', 'Перу', 'Филиппины', 'Польша', 'Португалия',
    'Катар',
    'Румыния', 'Руанда',
    'Сент-Китс и Невис', 'Сент-Люсия', 'Сент-Винсент и Гренадины',
    'Самоа', 'Сан-Марино', 'Сан-Томе и Принсипи', 'Саудовская Аравия', 'Сенегал',
    'Сербия', 'Сейшелы', 'Сьерра-Леоне', 'Сингапур', 'Словакия', 'Словения',
    'Соломоновы Острова', 'Сомали', 'Южная Африка', 'Южная Корея', 'Южный Судан',
    'Испания', 'Шри-Ланка', 'Судан', 'Суринам', 'Швеция', 'Швейцария', 'Сирия',
    'Таджикистан', 'Танзания', 'Таиланд', 'Тимор-Лесте', 'Того', 'Тонга',
    'Тринидад и Тобаго', 'Тунис', 'Туркменистан', 'Тувалу',
    'Уганда', 'Украина', 'ОАЭ', 'Уругвай', 'Узбекистан',
    'Вануату', 'Венесуэла', 'Вьетнам',
    'Йемен',
    'Замбия', 'Зимбабве',
  ],
}

const RTL_LANGS = new Set(['fa', 'ar'])

interface CountrySelectProps {
  value: string
  onChange: (country: string, isValid: boolean) => void
  lang?: string
  placeholder?: string
}

export default function CountrySelect({ value, onChange, lang = 'tr', placeholder }: CountrySelectProps) {
  const list = COUNTRIES[lang] ?? COUNTRIES.tr
  const [search, setSearch] = useState(value || '')
  const [open, setOpen] = useState(false)
  const [isValid, setIsValid] = useState(() => !!value && list.includes(value))
  const [filtered, setFiltered] = useState(list)
  const ref = useRef<HTMLDivElement>(null)
  const isRtl = RTL_LANGS.has(lang)

  // Sync when value or lang changes
  useEffect(() => {
    setSearch(value || '')
    const newList = COUNTRIES[lang] ?? COUNTRIES.tr
    setIsValid(!!value && newList.includes(value))
  }, [value, lang])

  // Filter list as user types
  useEffect(() => {
    const newList = COUNTRIES[lang] ?? COUNTRIES.tr
    if (search.trim() === '') {
      setFiltered(newList)
    } else {
      const q = search.toLowerCase()
      setFiltered(newList.filter(c => c.toLowerCase().includes(q)))
    }
  }, [search, lang])

  // Close on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleSelect = (country: string) => {
    setSearch(country)
    setIsValid(true)
    onChange(country, true)
    setOpen(false)
  }

  // On blur: if typed text is not a valid country, revert to last confirmed value
  const handleBlur = () => {
    setTimeout(() => {
      setOpen(false)
      const currentList = COUNTRIES[lang] ?? COUNTRIES.tr
      if (!currentList.includes(search)) {
        setSearch(value || '')
        const revertValid = !!value && currentList.includes(value)
        setIsValid(revertValid)
        if (!revertValid) onChange(value || '', false)
      }
    }, 200)
  }

  const borderColor = isValid ? '#22c55e' : search && !isValid ? '#ef4444' : '#ddd'

  return (
    <div ref={ref} dir={isRtl ? 'rtl' : undefined} style={{ position: 'relative', width: '100%' }}>
      <div style={{ position: 'relative' }}>
        <input
          type="text"
          value={search}
          dir={isRtl ? 'rtl' : undefined}
          onChange={(e) => { setSearch(e.target.value); setIsValid(false); setOpen(true) }}
          onFocus={() => setOpen(true)}
          onBlur={handleBlur}
          placeholder={placeholder || 'Ülke seçin...'}
          style={{
            width: '100%',
            padding: '12px',
            paddingRight: isRtl ? '12px' : '36px',
            paddingLeft: isRtl ? '36px' : '12px',
            border: `1px solid ${borderColor}`,
            borderRadius: '8px',
            fontSize: '16px',
            outline: 'none',
            boxSizing: 'border-box',
            transition: 'border-color 0.15s',
          }}
        />
        {/* Checkmark or X indicator */}
        <span style={{
          position: 'absolute',
          top: '50%',
          right: isRtl ? 'auto' : '12px',
          left: isRtl ? '12px' : 'auto',
          transform: 'translateY(-50%)',
          fontSize: '16px',
          pointerEvents: 'none',
          color: isValid ? '#22c55e' : '#ef4444',
          opacity: search ? 1 : 0,
        }}>
          {isValid ? '✓' : '✗'}
        </span>
      </div>

      {open && filtered.length > 0 && (
        <div
          dir={isRtl ? 'rtl' : undefined}
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            background: 'white',
            border: '1px solid #ddd',
            borderRadius: '8px',
            maxHeight: '200px',
            overflowY: 'auto',
            zIndex: 1000,
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            marginTop: '2px',
          }}
        >
          {filtered.map((country, i) => {
            const isPriority = i < PRIORITY_COUNT
            // Show orange divider after last priority item (only when all priority items are visible)
            const showDivider = isPriority && i === PRIORITY_COUNT - 1 && filtered.length > PRIORITY_COUNT
            return (
              <div
                key={country}
                onMouseDown={() => handleSelect(country)}
                style={{
                  padding: '10px 12px',
                  cursor: 'pointer',
                  borderBottom: showDivider ? '2px solid #f97316' : 'none',
                  background: 'white',
                  fontSize: '15px',
                  textAlign: isRtl ? 'right' : 'left',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = '#fff7ed')}
                onMouseLeave={e => (e.currentTarget.style.background = 'white')}
              >
                {isPriority ? '⭐ ' : ''}{country}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
