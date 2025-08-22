/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.NEXT_PUBLIC_BASE_URL || "https://youreview.vercel.app",
  generateRobotsTxt: true,
  generateIndexSitemap: false,
  robotsTxtOptions: {
    policies: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/dev/", "/sign-in", "/sign-up"],
      },
    ],
    additionalSitemaps: ["https://youreview.vercel.app/sitemap.xml"],
  },
  exclude: ["/api/*", "/dev/*", "/sign-in", "/sign-up"],
  changefreq: "weekly",
  priority: 0.7,
};
