import sharp from "sharp"

// Derived from checked-in artwork. Keep original PNGs for PDF/full-size use.
const logo = await sharp("public/brand/rocketrota-logo.png")
  .resize({ width: 192 })
  .webp({ lossless: true })
  .toFile("public/brand/rocketrota-logo-small.webp")
console.log({
  asset: "logo",
  width: logo.width,
  height: logo.height,
  bytes: logo.size,
})
for (const width of [640, 1280, 1917]) {
  const info = await sharp("public/brand/harbour-house-rota.png")
    .resize({ width })
    .webp(width === 1917 ? { lossless: true } : { quality: 90, effort: 6 })
    .toFile(`public/brand/harbour-house-rota-${width}.webp`)
  console.log({ asset: "rota", width, bytes: info.size })
}
const background = await sharp("public/brand/landing-background.png")
  .webp({ lossless: true })
  .toFile("public/brand/landing-background.webp")
console.log({ asset: "background", bytes: background.size })
const favicon = await sharp("public/favicon-v5.png")
  .resize(64, 64)
  .png({ compressionLevel: 9 })
  .toFile("public/favicon-v6.png")
console.log({ asset: "favicon", bytes: favicon.size })
