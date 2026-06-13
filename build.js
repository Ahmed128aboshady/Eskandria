/**
 * Eskandria Restaurant — Build / Compress Script
 * Compresses images (WebP + PNG), minifies CSS/JS/HTML,
 * generates sitemap.xml and robots.txt for SEO.
 */

const fs   = require("fs");
const path = require("path");

const sharp       = require("sharp");
const { minify: minifyJS } = require("terser");
const CleanCSS    = require("clean-css");
const { minify: minifyHTML } = require("html-minifier-terser");

const ROOT = __dirname;

// ============================================================
// Helpers
// ============================================================
function kb(bytes) { return (bytes / 1024).toFixed(1) + " KB"; }

function readFile(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

function writeFile(filePath, content) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, "utf8");
}

function logResult(label, before, after) {
  const saved = ((1 - after / before) * 100).toFixed(0);
  console.log(`  ✅ ${label}: ${kb(before)} → ${kb(after)} (-${saved}%)`);
}

// ============================================================
// 1. COMPRESS IMAGES with sharp
// ============================================================
async function compressImages() {
  console.log("\n🖼️  Compressing images...");

  const images = [
    { src: "assets/images/hero.png",     webp: true,  quality: 78 },
    { src: "assets/images/chef-rat.png", webp: true,  quality: 80, png: 8 },
  ];

  for (const img of images) {
    const srcPath = path.join(ROOT, img.src);
    if (!fs.existsSync(srcPath)) continue;

    const beforeSize = fs.statSync(srcPath).size;
    const tmpPath    = srcPath + ".tmp";

    // PNG optimised → temp file then rename (avoids Windows lock issues)
    await sharp(srcPath)
      .png({ compressionLevel: img.png ?? 9, effort: 10 })
      .toFile(tmpPath);
    fs.renameSync(tmpPath, srcPath);
    const afterPngSize = fs.statSync(srcPath).size;
    logResult(`${img.src} (PNG)`, beforeSize, afterPngSize);

    // WebP version alongside (much lighter, modern browsers)
    if (img.webp) {
      const webpPath = srcPath.replace(/\.png$/, ".webp");
      await sharp(srcPath)
        .webp({ quality: img.quality, effort: 6 })
        .toFile(webpPath);
      const webpSize = fs.statSync(webpPath).size;
      logResult(`${img.src} (WebP)`, beforeSize, webpSize);
    }
  }
}

// ============================================================
// 2. MINIFY CSS
// ============================================================
async function minifyCSS() {
  console.log("\n🎨  Minifying CSS...");

  const cssPath = path.join(ROOT, "css/style.css");
  const src     = readFile(cssPath);
  const result  = new CleanCSS({ level: 2, sourceMap: false }).minify(src);

  if (result.errors.length) {
    console.error("  ❌ CSS errors:", result.errors);
    return;
  }

  writeFile(cssPath, result.styles);
  logResult("css/style.css", Buffer.byteLength(src), Buffer.byteLength(result.styles));
}

// ============================================================
// 3. MINIFY JS
// ============================================================
async function minifyJSFiles() {
  console.log("\n⚡  Minifying JavaScript...");

  const jsFiles = ["js/main.js", "js/menu-data.js", "js/security.js"];

  for (const file of jsFiles) {
    const filePath = path.join(ROOT, file);
    if (!fs.existsSync(filePath)) continue;

    const src    = readFile(filePath);
    const result = await minifyJS(src, {
      compress: { drop_console: false, passes: 2 },
      mangle:   true,
      format:   { comments: false }
    });

    if (result.error) {
      console.error(`  ❌ JS error in ${file}:`, result.error);
      continue;
    }

    writeFile(filePath, result.code);
    logResult(file, Buffer.byteLength(src), Buffer.byteLength(result.code));
  }
}

// ============================================================
// 4. MINIFY HTML + inject WebP <picture> for hero & chef-rat
// ============================================================
async function minifyHTMLFiles() {
  console.log("\n📄  Minifying HTML...");

  const htmlFiles = [
    "index.html", "menu.html", "reservation.html", "order.html",
    "contact.html", "impressum.html", "datenschutz.html", "admin.html"
  ];

  const htmlOptions = {
    collapseWhitespace:           true,
    removeComments:               true,
    removeRedundantAttributes:    true,
    removeScriptTypeAttributes:   true,
    removeStyleLinkTypeAttributes:true,
    minifyCSS:                    true,
    minifyJS:                     true,
    useShortDoctype:              true,
    sortAttributes:               true,
  };

  for (const file of htmlFiles) {
    const filePath = path.join(ROOT, file);
    if (!fs.existsSync(filePath)) continue;

    let src = readFile(filePath);

    // Inject WebP <picture> for hero image
    src = src.replace(
      /<img([^>]*?)src="assets\/images\/hero\.png"([^>]*?)>/gi,
      '<picture><source srcset="assets/images/hero.webp" type="image/webp"><img$1src="assets/images/hero.png"$2></picture>'
    );
    // Inject WebP <picture> for chef-rat
    src = src.replace(
      /<img([^>]*?)src="assets\/images\/chef-rat\.png"([^>]*?)>/gi,
      '<picture><source srcset="assets/images/chef-rat.webp" type="image/webp"><img$1src="assets/images/chef-rat.png"$2></picture>'
    );

    // Bump cache-bust version
    src = src.replace(/style\.css\?v=\d+/g, "style.css?v=8");

    const minified = await minifyHTML(src, htmlOptions);

    writeFile(filePath, minified);
    logResult(file, Buffer.byteLength(src), Buffer.byteLength(minified));
  }
}

// ============================================================
// 5. GENERATE sitemap.xml (SEO)
// ============================================================
function generateSitemap() {
  console.log("\n🗺️   Generating sitemap.xml...");

  const baseURL  = "https://ahmed128aboshady.github.io/Eskandria";
  const today    = new Date().toISOString().split("T")[0];

  const urls = [
    { loc: "/",                   priority: "1.00", changefreq: "weekly"  },
    { loc: "/#menu-section",      priority: "0.90", changefreq: "weekly"  },
    { loc: "/#reservation-section",priority:"0.85", changefreq: "monthly" },
    { loc: "/#order-section",     priority: "0.80", changefreq: "monthly" },
    { loc: "/#contact-section",   priority: "0.75", changefreq: "monthly" },
    { loc: "/impressum.html",     priority: "0.30", changefreq: "yearly"  },
    { loc: "/datenschutz.html",   priority: "0.30", changefreq: "yearly"  },
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url>
    <loc>${baseURL}${u.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join("\n")}
</urlset>`;

  writeFile(path.join(ROOT, "sitemap.xml"), xml);
  console.log("  ✅ sitemap.xml generated");
}

// ============================================================
// 6. GENERATE robots.txt (SEO)
// ============================================================
function generateRobots() {
  console.log("\n🤖  Generating robots.txt...");

  const baseURL = "https://ahmed128aboshady.github.io/Eskandria";

  const content = `User-agent: *
Allow: /
Disallow: /admin.html
Disallow: /js/security.js

# Sitemap
Sitemap: ${baseURL}/sitemap.xml

# Crawl-delay
Crawl-delay: 5
`;

  writeFile(path.join(ROOT, "robots.txt"), content);
  console.log("  ✅ robots.txt generated");
}

// ============================================================
// 7. Add .gitignore for node_modules
// ============================================================
function writeGitignore() {
  const content = `node_modules/
npm-debug.log*
package-lock.json
*.log
`;
  writeFile(path.join(ROOT, ".gitignore"), content);
  console.log("\n📝  .gitignore updated");
}

// ============================================================
// MAIN
// ============================================================
(async () => {
  console.log("🚀 Eskandria Build & Compress Script");
  console.log("=====================================");

  await compressImages();
  await minifyCSS();
  await minifyJSFiles();
  await minifyHTMLFiles();
  generateSitemap();
  generateRobots();
  writeGitignore();

  console.log("\n✨ Done! All files compressed & optimised.");

  // Final size summary
  console.log("\n📊 Final sizes:");
  const finalFiles = [
    "index.html","css/style.css","js/main.js","js/menu-data.js",
    "assets/images/hero.png","assets/images/hero.webp",
    "assets/images/chef-rat.png","assets/images/chef-rat.webp"
  ];
  finalFiles.forEach(f => {
    const fp = path.join(ROOT, f);
    if (fs.existsSync(fp)) {
      console.log(`  ${f}: ${kb(fs.statSync(fp).size)}`);
    }
  });
})();
