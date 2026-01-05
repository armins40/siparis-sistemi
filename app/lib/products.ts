// Product catalog data with hierarchical structure

export type ParentCategory = 'Tekel' | 'Manav' | 'Bakkal' | 'Market'

export interface Product {
  id: string
  name: string
  subcategory: string
  parentCategory: ParentCategory
  image: string
}

export const PRODUCT_CATALOG: Product[] = [
  // TEKEL - Biralar
  { id: 'tek-bir-001', name: 'Efes Pilsen 50cl', subcategory: 'Biralar', parentCategory: 'Tekel', image: 'https://via.placeholder.com/150?text=Efes+Pilsen' },
  { id: 'tek-bir-002', name: 'Efes Dark 50cl', subcategory: 'Biralar', parentCategory: 'Tekel', image: 'https://via.placeholder.com/150?text=Efes+Dark' },
  { id: 'tek-bir-003', name: 'Tuborg Gold 50cl', subcategory: 'Biralar', parentCategory: 'Tekel', image: 'https://via.placeholder.com/150?text=Tuborg+Gold' },
  { id: 'tek-bir-004', name: 'Bomonti Filtresiz 50cl', subcategory: 'Biralar', parentCategory: 'Tekel', image: 'https://via.placeholder.com/150?text=Bomonti' },
  { id: 'tek-bir-005', name: 'Carlsberg 50cl', subcategory: 'Biralar', parentCategory: 'Tekel', image: 'https://via.placeholder.com/150?text=Carlsberg' },
  { id: 'tek-bir-006', name: 'Amsterdam 50cl', subcategory: 'Biralar', parentCategory: 'Tekel', image: 'https://via.placeholder.com/150?text=Amsterdam' },
  { id: 'tek-bir-007', name: 'Corona Extra 35cl', subcategory: 'Biralar', parentCategory: 'Tekel', image: 'https://via.placeholder.com/150?text=Corona' },
  { id: 'tek-bir-008', name: 'Heineken 50cl', subcategory: 'Biralar', parentCategory: 'Tekel', image: 'https://via.placeholder.com/150?text=Heineken' },
  
  // TEKEL - Rakılar
  { id: 'tek-rak-001', name: 'Yeni Rakı 70cl', subcategory: 'Rakılar', parentCategory: 'Tekel', image: 'https://via.placeholder.com/150?text=Yeni+Raki' },
  { id: 'tek-rak-002', name: 'Yeni Rakı 1L', subcategory: 'Rakılar', parentCategory: 'Tekel', image: 'https://via.placeholder.com/150?text=Yeni+Raki+1L' },
  { id: 'tek-rak-003', name: 'Efe Rakı 70cl', subcategory: 'Rakılar', parentCategory: 'Tekel', image: 'https://via.placeholder.com/150?text=Efe+Raki' },
  { id: 'tek-rak-004', name: 'Tekirdağ Rakısı 70cl', subcategory: 'Rakılar', parentCategory: 'Tekel', image: 'https://via.placeholder.com/150?text=Tekirdag+Raki' },
  { id: 'tek-rak-005', name: 'Burgaz Rakı 70cl', subcategory: 'Rakılar', parentCategory: 'Tekel', image: 'https://via.placeholder.com/150?text=Burgaz+Raki' },
  
  // TEKEL - Viskiler
  { id: 'tek-vis-001', name: 'Jack Daniels 70cl', subcategory: 'Viskiler', parentCategory: 'Tekel', image: 'https://via.placeholder.com/150?text=Jack+Daniels' },
  { id: 'tek-vis-002', name: 'Johnnie Walker Red 70cl', subcategory: 'Viskiler', parentCategory: 'Tekel', image: 'https://via.placeholder.com/150?text=Johnnie+Walker' },
  { id: 'tek-vis-003', name: 'Ballantine\'s 70cl', subcategory: 'Viskiler', parentCategory: 'Tekel', image: 'https://via.placeholder.com/150?text=Ballantines' },
  { id: 'tek-vis-004', name: 'Chivas Regal 70cl', subcategory: 'Viskiler', parentCategory: 'Tekel', image: 'https://via.placeholder.com/150?text=Chivas' },
  
  // TEKEL - Şaraplar
  { id: 'tek-sar-001', name: 'Kavaklıdere Kırmızı 75cl', subcategory: 'Şaraplar', parentCategory: 'Tekel', image: 'https://via.placeholder.com/150?text=Kavaklidere+Kirmizi' },
  { id: 'tek-sar-002', name: 'Kavaklıdere Beyaz 75cl', subcategory: 'Şaraplar', parentCategory: 'Tekel', image: 'https://via.placeholder.com/150?text=Kavaklidere+Beyaz' },
  { id: 'tek-sar-003', name: 'Doluca Kırmızı 75cl', subcategory: 'Şaraplar', parentCategory: 'Tekel', image: 'https://via.placeholder.com/150?text=Doluca' },
  { id: 'tek-sar-004', name: 'Pamukkale Şarabı 75cl', subcategory: 'Şaraplar', parentCategory: 'Tekel', image: 'https://via.placeholder.com/150?text=Pamukkale' },
  
  // TEKEL - Atıştırmalıklar
  { id: 'tek-ati-001', name: 'Çekirdek Ayçiçeği 100gr', subcategory: 'Atıştırmalıklar', parentCategory: 'Tekel', image: 'https://via.placeholder.com/150?text=Cekirdek' },
  { id: 'tek-ati-002', name: 'Fıstık 200gr', subcategory: 'Atıştırmalıklar', parentCategory: 'Tekel', image: 'https://via.placeholder.com/150?text=Fistik' },
  { id: 'tek-ati-003', name: 'Leblebi 200gr', subcategory: 'Atıştırmalıklar', parentCategory: 'Tekel', image: 'https://via.placeholder.com/150?text=Leblebi' },
  { id: 'tek-ati-004', name: 'Cips 150gr', subcategory: 'Atıştırmalıklar', parentCategory: 'Tekel', image: 'https://via.placeholder.com/150?text=Cips' },
  
  // TEKEL - Sigaralar
  { id: 'tek-sig-001', name: 'Marlboro Red', subcategory: 'Sigaralar', parentCategory: 'Tekel', image: 'https://via.placeholder.com/150?text=Marlboro+Red' },
  { id: 'tek-sig-002', name: 'Marlboro Gold', subcategory: 'Sigaralar', parentCategory: 'Tekel', image: 'https://via.placeholder.com/150?text=Marlboro+Gold' },
  { id: 'tek-sig-003', name: 'Parliament Blue', subcategory: 'Sigaralar', parentCategory: 'Tekel', image: 'https://via.placeholder.com/150?text=Parliament' },
  { id: 'tek-sig-004', name: 'Winston Red', subcategory: 'Sigaralar', parentCategory: 'Tekel', image: 'https://via.placeholder.com/150?text=Winston+Red' },
  { id: 'tek-sig-005', name: 'Camel Blue', subcategory: 'Sigaralar', parentCategory: 'Tekel', image: 'https://via.placeholder.com/150?text=Camel' },
  { id: 'tek-sig-006', name: 'Kent Blue', subcategory: 'Sigaralar', parentCategory: 'Tekel', image: 'https://via.placeholder.com/150?text=Kent' },
  
  // MANAV - Sebzeler
  { id: 'man-seb-001', name: 'Domates (kg)', subcategory: 'Sebzeler', parentCategory: 'Manav', image: 'https://via.placeholder.com/150?text=Domates' },
  { id: 'man-seb-002', name: 'Salatalık (kg)', subcategory: 'Sebzeler', parentCategory: 'Manav', image: 'https://via.placeholder.com/150?text=Salatalik' },
  { id: 'man-seb-003', name: 'Patlıcan (kg)', subcategory: 'Sebzeler', parentCategory: 'Manav', image: 'https://via.placeholder.com/150?text=Patlican' },
  { id: 'man-seb-004', name: 'Biber (kg)', subcategory: 'Sebzeler', parentCategory: 'Manav', image: 'https://via.placeholder.com/150?text=Biber' },
  { id: 'man-seb-005', name: 'Soğan (kg)', subcategory: 'Sebzeler', parentCategory: 'Manav', image: 'https://via.placeholder.com/150?text=Sogan' },
  { id: 'man-seb-006', name: 'Sarımsak (kg)', subcategory: 'Sebzeler', parentCategory: 'Manav', image: 'https://via.placeholder.com/150?text=Sarimsak' },
  { id: 'man-seb-007', name: 'Patates (kg)', subcategory: 'Sebzeler', parentCategory: 'Manav', image: 'https://via.placeholder.com/150?text=Patates' },
  { id: 'man-seb-008', name: 'Havuç (kg)', subcategory: 'Sebzeler', parentCategory: 'Manav', image: 'https://via.placeholder.com/150?text=Havuc' },
  { id: 'man-seb-009', name: 'Lahana (adet)', subcategory: 'Sebzeler', parentCategory: 'Manav', image: 'https://via.placeholder.com/150?text=Lahana' },
  { id: 'man-seb-010', name: 'Brokoli (adet)', subcategory: 'Sebzeler', parentCategory: 'Manav', image: 'https://via.placeholder.com/150?text=Brokoli' },
  { id: 'man-seb-011', name: 'Kabak (kg)', subcategory: 'Sebzeler', parentCategory: 'Manav', image: 'https://via.placeholder.com/150?text=Kabak' },
  { id: 'man-seb-012', name: 'Taze Fasulye (kg)', subcategory: 'Sebzeler', parentCategory: 'Manav', image: 'https://via.placeholder.com/150?text=Taze+Fasulye' },
  { id: 'man-seb-013', name: 'Bezelye (kg)', subcategory: 'Sebzeler', parentCategory: 'Manav', image: 'https://via.placeholder.com/150?text=Bezelye' },
  { id: 'man-seb-014', name: 'Mısır (adet)', subcategory: 'Sebzeler', parentCategory: 'Manav', image: 'https://via.placeholder.com/150?text=Misir' },
  { id: 'man-seb-015', name: 'Pırasa (demet)', subcategory: 'Sebzeler', parentCategory: 'Manav', image: 'https://via.placeholder.com/150?text=Pirasa' },
  
  // MANAV - Meyveler
  { id: 'man-mey-001', name: 'Elma (kg)', subcategory: 'Meyveler', parentCategory: 'Manav', image: 'https://via.placeholder.com/150?text=Elma' },
  { id: 'man-mey-002', name: 'Muz (kg)', subcategory: 'Meyveler', parentCategory: 'Manav', image: 'https://via.placeholder.com/150?text=Muz' },
  { id: 'man-mey-003', name: 'Portakal (kg)', subcategory: 'Meyveler', parentCategory: 'Manav', image: 'https://via.placeholder.com/150?text=Portakal' },
  { id: 'man-mey-004', name: 'Mandalina (kg)', subcategory: 'Meyveler', parentCategory: 'Manav', image: 'https://via.placeholder.com/150?text=Mandalina' },
  { id: 'man-mey-005', name: 'Limon (kg)', subcategory: 'Meyveler', parentCategory: 'Manav', image: 'https://via.placeholder.com/150?text=Limon' },
  { id: 'man-mey-006', name: 'Çilek (kg)', subcategory: 'Meyveler', parentCategory: 'Manav', image: 'https://via.placeholder.com/150?text=Cilek' },
  { id: 'man-mey-007', name: 'Kiraz (kg)', subcategory: 'Meyveler', parentCategory: 'Manav', image: 'https://via.placeholder.com/150?text=Kiraz' },
  { id: 'man-mey-008', name: 'Üzüm (kg)', subcategory: 'Meyveler', parentCategory: 'Manav', image: 'https://via.placeholder.com/150?text=Uzum' },
  { id: 'man-mey-009', name: 'Şeftali (kg)', subcategory: 'Meyveler', parentCategory: 'Manav', image: 'https://via.placeholder.com/150?text=Seftali' },
  { id: 'man-mey-010', name: 'Kayısı (kg)', subcategory: 'Meyveler', parentCategory: 'Manav', image: 'https://via.placeholder.com/150?text=Kayisi' },
  { id: 'man-mey-011', name: 'Armut (kg)', subcategory: 'Meyveler', parentCategory: 'Manav', image: 'https://via.placeholder.com/150?text=Armut' },
  { id: 'man-mey-012', name: 'Karpuz (adet)', subcategory: 'Meyveler', parentCategory: 'Manav', image: 'https://via.placeholder.com/150?text=Karpuz' },
  { id: 'man-mey-013', name: 'Kavun (adet)', subcategory: 'Meyveler', parentCategory: 'Manav', image: 'https://via.placeholder.com/150?text=Kavun' },
  { id: 'man-mey-014', name: 'Nar (kg)', subcategory: 'Meyveler', parentCategory: 'Manav', image: 'https://via.placeholder.com/150?text=Nar' },
  { id: 'man-mey-015', name: 'İncir (kg)', subcategory: 'Meyveler', parentCategory: 'Manav', image: 'https://via.placeholder.com/150?text=Incir' },
  
  // MANAV - Yeşillikler
  { id: 'man-yes-001', name: 'Ispanak (demet)', subcategory: 'Yeşillikler', parentCategory: 'Manav', image: 'https://via.placeholder.com/150?text=Ispanak' },
  { id: 'man-yes-002', name: 'Marul (adet)', subcategory: 'Yeşillikler', parentCategory: 'Manav', image: 'https://via.placeholder.com/150?text=Marul' },
  { id: 'man-yes-003', name: 'Roka (demet)', subcategory: 'Yeşillikler', parentCategory: 'Manav', image: 'https://via.placeholder.com/150?text=Roka' },
  { id: 'man-yes-004', name: 'Maydanoz (demet)', subcategory: 'Yeşillikler', parentCategory: 'Manav', image: 'https://via.placeholder.com/150?text=Maydanoz' },
  { id: 'man-yes-005', name: 'Dereotu (demet)', subcategory: 'Yeşillikler', parentCategory: 'Manav', image: 'https://via.placeholder.com/150?text=Dereotu' },
  { id: 'man-yes-006', name: 'Nane (demet)', subcategory: 'Yeşillikler', parentCategory: 'Manav', image: 'https://via.placeholder.com/150?text=Nane' },
  { id: 'man-yes-007', name: 'Tere (demet)', subcategory: 'Yeşillikler', parentCategory: 'Manav', image: 'https://via.placeholder.com/150?text=Tere' },
  { id: 'man-yes-008', name: 'Kıvırcık (adet)', subcategory: 'Yeşillikler', parentCategory: 'Manav', image: 'https://via.placeholder.com/150?text=Kivircik' },
  
  // BAKKAL - Ekmek & Unlu Mamuller
  { id: 'bak-ekm-001', name: 'Ekmek (adet)', subcategory: 'Ekmek & Unlu Mamuller', parentCategory: 'Bakkal', image: 'https://via.placeholder.com/150?text=Ekmek' },
  { id: 'bak-ekm-002', name: 'Simit (adet)', subcategory: 'Ekmek & Unlu Mamuller', parentCategory: 'Bakkal', image: 'https://via.placeholder.com/150?text=Simit' },
  { id: 'bak-ekm-003', name: 'Poğaça (adet)', subcategory: 'Ekmek & Unlu Mamuller', parentCategory: 'Bakkal', image: 'https://via.placeholder.com/150?text=Pogaca' },
  { id: 'bak-ekm-004', name: 'Un 1kg', subcategory: 'Ekmek & Unlu Mamuller', parentCategory: 'Bakkal', image: 'https://via.placeholder.com/150?text=Un+1kg' },
  { id: 'bak-ekm-005', name: 'Un 5kg', subcategory: 'Ekmek & Unlu Mamuller', parentCategory: 'Bakkal', image: 'https://via.placeholder.com/150?text=Un+5kg' },
  { id: 'bak-ekm-006', name: 'Şeker 1kg', subcategory: 'Ekmek & Unlu Mamuller', parentCategory: 'Bakkal', image: 'https://via.placeholder.com/150?text=Seker+1kg' },
  { id: 'bak-ekm-007', name: 'Tuz 1kg', subcategory: 'Ekmek & Unlu Mamuller', parentCategory: 'Bakkal', image: 'https://via.placeholder.com/150?text=Tuz' },
  
  // BAKKAL - Süt & Kahvaltılık
  { id: 'bak-sut-001', name: 'Süt 1L', subcategory: 'Süt & Kahvaltılık', parentCategory: 'Bakkal', image: 'https://via.placeholder.com/150?text=Sut+1L' },
  { id: 'bak-sut-002', name: 'Süt 500ml', subcategory: 'Süt & Kahvaltılık', parentCategory: 'Bakkal', image: 'https://via.placeholder.com/150?text=Sut+500ml' },
  { id: 'bak-sut-003', name: 'Yumurta 10\'lu', subcategory: 'Süt & Kahvaltılık', parentCategory: 'Bakkal', image: 'https://via.placeholder.com/150?text=Yumurta+10' },
  { id: 'bak-sut-004', name: 'Yumurta 30\'lu', subcategory: 'Süt & Kahvaltılık', parentCategory: 'Bakkal', image: 'https://via.placeholder.com/150?text=Yumurta+30' },
  { id: 'bak-sut-005', name: 'Beyaz Peynir 500gr', subcategory: 'Süt & Kahvaltılık', parentCategory: 'Bakkal', image: 'https://via.placeholder.com/150?text=Beyaz+Peynir' },
  { id: 'bak-sut-006', name: 'Kaşar Peyniri 500gr', subcategory: 'Süt & Kahvaltılık', parentCategory: 'Bakkal', image: 'https://via.placeholder.com/150?text=Kasar+Peyniri' },
  { id: 'bak-sut-007', name: 'Zeytin Siyah 500gr', subcategory: 'Süt & Kahvaltılık', parentCategory: 'Bakkal', image: 'https://via.placeholder.com/150?text=Zeytin+Siyah' },
  { id: 'bak-sut-008', name: 'Tereyağı 500gr', subcategory: 'Süt & Kahvaltılık', parentCategory: 'Bakkal', image: 'https://via.placeholder.com/150?text=Tereyagi' },
  { id: 'bak-sut-009', name: 'Bal 500gr', subcategory: 'Süt & Kahvaltılık', parentCategory: 'Bakkal', image: 'https://via.placeholder.com/150?text=Bal+500gr' },
  { id: 'bak-sut-010', name: 'Reçel Çilek 380gr', subcategory: 'Süt & Kahvaltılık', parentCategory: 'Bakkal', image: 'https://via.placeholder.com/150?text=Recel+Cilek' },
  { id: 'bak-sut-011', name: 'Zeytinyağı 500ml', subcategory: 'Süt & Kahvaltılık', parentCategory: 'Bakkal', image: 'https://via.placeholder.com/150?text=Zeytinyagi' },
  
  // BAKKAL - Atıştırmalık
  { id: 'bak-ati-001', name: 'Çikolata Sütlü 80gr', subcategory: 'Atıştırmalık', parentCategory: 'Bakkal', image: 'https://via.placeholder.com/150?text=Cikolata+Sutlu' },
  { id: 'bak-ati-002', name: 'Bisküvi 200gr', subcategory: 'Atıştırmalık', parentCategory: 'Bakkal', image: 'https://via.placeholder.com/150?text=Biskuvi' },
  { id: 'bak-ati-003', name: 'Çekirdek 100gr', subcategory: 'Atıştırmalık', parentCategory: 'Bakkal', image: 'https://via.placeholder.com/150?text=Cekirdek' },
  { id: 'bak-ati-004', name: 'Sakız 15\'li', subcategory: 'Atıştırmalık', parentCategory: 'Bakkal', image: 'https://via.placeholder.com/150?text=Sakiz' },
  
  // BAKKAL - İçecek
  { id: 'bak-ice-001', name: 'Ayran 500ml', subcategory: 'İçecek', parentCategory: 'Bakkal', image: 'https://via.placeholder.com/150?text=Ayran+500ml' },
  { id: 'bak-ice-002', name: 'Ayran 1L', subcategory: 'İçecek', parentCategory: 'Bakkal', image: 'https://via.placeholder.com/150?text=Ayran+1L' },
  { id: 'bak-ice-003', name: 'Yoğurt 500gr', subcategory: 'İçecek', parentCategory: 'Bakkal', image: 'https://via.placeholder.com/150?text=Yogurt' },
  
  // MARKET - Temel Gıda
  { id: 'mar-gid-001', name: 'Pirinç 1kg', subcategory: 'Temel Gıda', parentCategory: 'Market', image: 'https://via.placeholder.com/150?text=Pirinc+1kg' },
  { id: 'mar-gid-002', name: 'Makarna 500gr', subcategory: 'Temel Gıda', parentCategory: 'Market', image: 'https://via.placeholder.com/150?text=Makarna' },
  { id: 'mar-gid-003', name: 'Bulgur 1kg', subcategory: 'Temel Gıda', parentCategory: 'Market', image: 'https://via.placeholder.com/150?text=Bulgur' },
  { id: 'mar-gid-004', name: 'Domates Salçası 700gr', subcategory: 'Temel Gıda', parentCategory: 'Market', image: 'https://via.placeholder.com/150?text=Domates+Salcasi' },
  { id: 'mar-gid-005', name: 'Biber Salçası 700gr', subcategory: 'Temel Gıda', parentCategory: 'Market', image: 'https://via.placeholder.com/150?text=Biber+Salcasi' },
  { id: 'mar-gid-006', name: 'Ketçap 500gr', subcategory: 'Temel Gıda', parentCategory: 'Market', image: 'https://via.placeholder.com/150?text=Ketchup' },
  { id: 'mar-gid-007', name: 'Mayonez 400gr', subcategory: 'Temel Gıda', parentCategory: 'Market', image: 'https://via.placeholder.com/150?text=Mayonez' },
  
  // MARKET - Bakliyat
  { id: 'mar-bak-001', name: 'Mercimek Kırmızı 1kg', subcategory: 'Bakliyat', parentCategory: 'Market', image: 'https://via.placeholder.com/150?text=Mercimek+Kirmizi' },
  { id: 'mar-bak-002', name: 'Mercimek Yeşil 1kg', subcategory: 'Bakliyat', parentCategory: 'Market', image: 'https://via.placeholder.com/150?text=Mercimek+Yesil' },
  { id: 'mar-bak-003', name: 'Nohut 1kg', subcategory: 'Bakliyat', parentCategory: 'Market', image: 'https://via.placeholder.com/150?text=Nohut+1kg' },
  { id: 'mar-bak-004', name: 'Fasulye Kuru 1kg', subcategory: 'Bakliyat', parentCategory: 'Market', image: 'https://via.placeholder.com/150?text=Fasulye+Kuru' },
  { id: 'mar-bak-005', name: 'Barbunya 1kg', subcategory: 'Bakliyat', parentCategory: 'Market', image: 'https://via.placeholder.com/150?text=Barbunya' },
  
  // MARKET - Temizlik
  { id: 'mar-tem-001', name: 'Bulaşık Deterjanı 750ml', subcategory: 'Temizlik', parentCategory: 'Market', image: 'https://via.placeholder.com/150?text=Bulasik+Deterjani' },
  { id: 'mar-tem-002', name: 'Çamaşır Deterjanı 4kg', subcategory: 'Temizlik', parentCategory: 'Market', image: 'https://via.placeholder.com/150?text=Camasir+Deterjani' },
  { id: 'mar-tem-003', name: 'Yumuşatıcı 2L', subcategory: 'Temizlik', parentCategory: 'Market', image: 'https://via.placeholder.com/150?text=Yumusatici' },
  { id: 'mar-tem-004', name: 'Sabun 4\'lü', subcategory: 'Temizlik', parentCategory: 'Market', image: 'https://via.placeholder.com/150?text=Sabun' },
  { id: 'mar-tem-005', name: 'Şampuan 400ml', subcategory: 'Temizlik', parentCategory: 'Market', image: 'https://via.placeholder.com/150?text=Sampuan' },
  { id: 'mar-tem-006', name: 'Diş Macunu 100ml', subcategory: 'Temizlik', parentCategory: 'Market', image: 'https://via.placeholder.com/150?text=Dis+Macunu' },
  
  // MARKET - Kişisel Bakım
  { id: 'mar-kis-001', name: 'Tuvalet Kağıdı 8\'li', subcategory: 'Kişisel Bakım', parentCategory: 'Market', image: 'https://via.placeholder.com/150?text=Tuvalet+Kagidi' },
  { id: 'mar-kis-002', name: 'Peçete 100\'lü', subcategory: 'Kişisel Bakım', parentCategory: 'Market', image: 'https://via.placeholder.com/150?text=Pecete' },
  { id: 'mar-kis-003', name: 'Islak Mendil 80\'li', subcategory: 'Kişisel Bakım', parentCategory: 'Market', image: 'https://via.placeholder.com/150?text=Islak+Mendil' },
  { id: 'mar-kis-004', name: 'Jilet 4\'lü', subcategory: 'Kişisel Bakım', parentCategory: 'Market', image: 'https://via.placeholder.com/150?text=Jilet' },
  
  // MARKET - İçecek
  { id: 'mar-ice-001', name: 'Coca Cola 1L', subcategory: 'İçecek', parentCategory: 'Market', image: 'https://via.placeholder.com/150?text=Coca+Cola+1L' },
  { id: 'mar-ice-002', name: 'Coca Cola 2.5L', subcategory: 'İçecek', parentCategory: 'Market', image: 'https://via.placeholder.com/150?text=Coca+Cola+2.5L' },
  { id: 'mar-ice-003', name: 'Fanta 1L', subcategory: 'İçecek', parentCategory: 'Market', image: 'https://via.placeholder.com/150?text=Fanta+1L' },
  { id: 'mar-ice-004', name: 'Sprite 1L', subcategory: 'İçecek', parentCategory: 'Market', image: 'https://via.placeholder.com/150?text=Sprite+1L' },
  { id: 'mar-ice-005', name: 'Pepsi 1L', subcategory: 'İçecek', parentCategory: 'Market', image: 'https://via.placeholder.com/150?text=Pepsi+1L' },
  { id: 'mar-ice-006', name: 'Meyve Suyu Portakal 1L', subcategory: 'İçecek', parentCategory: 'Market', image: 'https://via.placeholder.com/150?text=Meyve+Suyu' },
  { id: 'mar-ice-007', name: 'Çay 1kg', subcategory: 'İçecek', parentCategory: 'Market', image: 'https://via.placeholder.com/150?text=Cay+1kg' },
  { id: 'mar-ice-008', name: 'Nescafé 200gr', subcategory: 'İçecek', parentCategory: 'Market', image: 'https://via.placeholder.com/150?text=Nescafe' },
]

export interface ProductSettings {
  price: number | null
  active: boolean
  outOfStock: boolean
}

const PRODUCT_SETTINGS_KEY = 'siparis-product-settings'

export const productSettings = {
  // Get storage key for a specific business
  getStorageKey: (businessSlug: string): string => {
    return `siparisProducts_${businessSlug}`
  },

  // Get all product settings for a specific business
  getAllForBusiness: (businessSlug: string): Record<string, ProductSettings> => {
    if (typeof window === 'undefined') return {}
    const key = productSettings.getStorageKey(businessSlug)
    const settingsStr = localStorage.getItem(key)
    if (!settingsStr) return {}
    try {
      return JSON.parse(settingsStr)
    } catch {
      return {}
    }
  },

  // Save all product settings for a specific business
  saveAllForBusiness: (businessSlug: string, settings: Record<string, ProductSettings>): void => {
    if (typeof window === 'undefined') return
    const key = productSettings.getStorageKey(businessSlug)
    localStorage.setItem(key, JSON.stringify(settings))
  },

  // Get all product settings for current user (legacy support)
  getAll: (): Record<string, ProductSettings> => {
    if (typeof window === 'undefined') return {}
    const settingsStr = localStorage.getItem(PRODUCT_SETTINGS_KEY)
    if (!settingsStr) return {}
    try {
      return JSON.parse(settingsStr)
    } catch {
      return {}
    }
  },

  // Get settings for a specific product
  get: (productId: string): ProductSettings => {
    const all = productSettings.getAll()
    return all[productId] || { price: null, active: true, outOfStock: false }
  },

  // Save settings for a product (legacy - for temporary in-memory changes)
  save: (productId: string, settings: ProductSettings): void => {
    if (typeof window === 'undefined') return
    const all = productSettings.getAll()
    all[productId] = settings
    localStorage.setItem(PRODUCT_SETTINGS_KEY, JSON.stringify(all))
  },

  // Update price for a product (legacy - for temporary in-memory changes)
  updatePrice: (productId: string, price: number | null): void => {
    const current = productSettings.get(productId)
    productSettings.save(productId, { ...current, price })
  },

  // Update active status for a product (legacy - for temporary in-memory changes)
  updateActive: (productId: string, active: boolean): void => {
    const current = productSettings.get(productId)
    productSettings.save(productId, { ...current, active })
  },

  // Update out of stock status for a product (legacy - for temporary in-memory changes)
  updateOutOfStock: (productId: string, outOfStock: boolean): void => {
    const current = productSettings.get(productId)
    productSettings.save(productId, { ...current, outOfStock })
  }
}
