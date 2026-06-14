import sharp from 'sharp';
sharp('public/hero-bg.jpg')
  .resize(800)
  .webp({ quality: 60 })
  .toFile('public/hero-bg.webp');
