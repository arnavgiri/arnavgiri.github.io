#!/usr/bin/env node
"use strict";

/**
 * Build the static portfolio, RSS feed and sitemap from projects.json.
 * Run "node build-site.js". GitHub Pages serves the output, not this Node script.
 * Unlisted directories containing index.html are discovered automatically.
 */
const fs = require("node:fs");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

const ROOT = __dirname;
const config = JSON.parse(fs.readFileSync(path.join(ROOT, "projects.json"), "utf8"));
const baseURL = new URL(config.site.url);
const PROJECT_START = "<!-- PROJECTS:START -->";
const PROJECT_END = "<!-- PROJECTS:END -->";
const ESCAPE = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
const escapeHTML = value => String(value).replace(/[&<>"']/g, char => ESCAPE[char]);
const escapeXML = escapeHTML;
const ensureDate = (value, label) => {
  const parsed = new Date(value);
  if (!value || !Number.isFinite(parsed.getTime())) {
    throw new Error("Missing or invalid publication date: " + label);
  }
  return parsed;
};

function gitUpdated(relative) {
  try {
    const date = execFileSync("git", ["log", "-1", "--format=%cI", "--", relative], {
      cwd: ROOT, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"]
    }).trim();
    return date && Number.isFinite(Date.parse(date)) ? date : null;
  } catch {
    return null;
  }
}

function extractMeta(html, pattern) {
  const found = html.match(pattern);
  return found ? found[1].replace(/<[^>]*>/g, "").trim() : "";
}

function discoverProjects() {
  const registered = new Set(config.projects.filter(p => p.slug).map(p => p.slug));
  const ignore = new Set(["assets", "tests", "node_modules", ".github", ".git", "_site", "dist"]);
  return fs.readdirSync(ROOT, { withFileTypes: true })
    .filter(dir => dir.isDirectory() && !dir.name.startsWith(".") &&
      !ignore.has(dir.name) && !registered.has(dir.name) &&
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(dir.name) &&
      fs.existsSync(path.join(ROOT, dir.name, "index.html")))
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(dir => {
      const file = dir.name + "/index.html";
      const html = fs.readFileSync(path.join(ROOT, file), "utf8");
      const title = extractMeta(html, /<title>([^<]*)<\/title>/i).split(/\s+[|—-]\s+/)[0] ||
        dir.name.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
      const summary = extractMeta(html, /<meta\s+name="description"\s+content="([^"]*)"/i) ||
        "Explore this free web tool.";
      const date = gitUpdated(file);
      if (!date) throw new Error("Add a published date to projects.json for " + dir.name);
      return { slug: dir.name, title, summary, category: "Free Web Tool",
        feedTitle: title, feedDescription: summary, published: date };
    });
}

const projects = [...config.projects, ...discoverProjects()];
const local = projects.filter(item => !item.external);

for (const item of projects) {
  if (item.external) {
    if (!/^https:\/\//.test(item.url)) throw new Error("External project must use HTTPS");
  } else {
    if (!item.slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(item.slug)) {
      throw new Error("Invalid project slug: " + item.slug);
    }
    if (!fs.existsSync(path.join(ROOT, item.slug, "index.html"))) {
      throw new Error("Missing project: " + item.slug + "/index.html");
    }
    ensureDate(item.published, item.slug);
  }
}
if (new Set(local.map(p => p.slug)).size !== local.length) {
  throw new Error("Duplicate project slug");
}

function projectRow(item, index) {
  const link = item.external ? item.url : "./" + item.slug + "/";
  const rel = item.external ? 'nofollow noreferrer noopener' : 'noopener noreferrer';
  return [
    '<a class="project" href="' + escapeHTML(link) + '" target="_blank" rel="' + rel +
      '" aria-label="' + escapeHTML("Explore " + item.title) + '">',
    '<span class="project-number">' + String(index + 1).padStart(2, "0") + '</span>',
    '<div><h3>' + escapeHTML(item.title) + '</h3><p>' + escapeHTML(item.summary) + '</p></div>',
    '<span class="project-type">' + escapeHTML(item.category) + '</span>',
    '<span class="project-arrow" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M5 19 19 5M7 5h12v12"/></svg></span>',
    '</a>'
  ].join("\n");
}

function updateFile(relative, content) {
  const target = path.join(ROOT, relative);
  if (fs.existsSync(target) && fs.readFileSync(target, "utf8") === content) return false;
  if (!process.argv.includes("--check")) fs.writeFileSync(target, content, "utf8");
  return true;
}

const homepagePath = path.join(ROOT, "index.html");
let homepage = fs.readFileSync(homepagePath, "utf8");
const newRows = projects.map(projectRow).join("\n");
if (homepage.includes(PROJECT_START) && homepage.includes(PROJECT_END)) {
  const start = homepage.indexOf(PROJECT_START) + PROJECT_START.length;
  const end = homepage.indexOf(PROJECT_END);
  if (end <= start) throw new Error("Invalid project section markers");
  homepage = homepage.slice(0, start) + "\n" + newRows + "\n" + homepage.slice(end);
} else {
  const regex = /(<div class="projects">)[\s\S]*?(<\/div>\s*<\/section>\s*<section class="services")/;
  if (!regex.test(homepage)) throw new Error("Unable to find homepage projects section");
  homepage = homepage.replace(regex, (_, open, rest) =>
    open + "\n" + PROJECT_START + "\n" + newRows + "\n" + PROJECT_END + "\n" + rest);
}

// Keep the RSS feed and sitemap newest-first using publication dates.
const newestFirst = (a, b) =>
  ensureDate(b.published, b.url).getTime() - ensureDate(a.published, a.url).getTime() ||
  a.url.localeCompare(b.url);
const publishedPages = [
  ...local.map(item => ({
    url: new URL(item.slug + "/", baseURL).href,
    published: item.published
  })).sort(newestFirst),
  { url: config.site.url, published: config.site.published }
];
const urls = publishedPages.map(item => item.url);
const sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n' +
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
  urls.map(url => "  <url><loc>" + escapeXML(url) + "</loc></url>").join("\n") +
  "\n</urlset>\n";

const feedEntries = [
  ...local.map(item => ({
    url: new URL(item.slug + "/", baseURL).href, title: item.feedTitle || item.title,
    description: item.feedDescription || item.summary, published: item.published,
    updated: item.updated || gitUpdated(item.slug)
  })).sort(newestFirst),
  { url: config.site.url, title: config.site.feedTitle,
    description: config.site.feedDescription, published: config.site.published }
];
const lastBuildDate = new Date(Math.max(
  ...feedEntries.map(item => ensureDate(item.updated || item.published, item.url).getTime())
)).toUTCString();
const items = feedEntries.map(item => [
  "    <item>",
  "      <title>" + escapeXML(item.title) + "</title>",
  "      <link>" + escapeXML(item.url) + "</link>",
  '      <guid isPermaLink="true">' + escapeXML(item.url) + "</guid>",
  "      <pubDate>" + ensureDate(item.published, item.url).toUTCString() + "</pubDate>",
  "      <description>" + escapeXML(item.description) + "</description>",
  "    </item>"
].join("\n")).join("\n");
const feed = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
  "  <channel>",
  "    <title>" + escapeXML(config.site.title) + "</title>",
  "    <link>" + escapeXML(config.site.url) + "</link>",
  "    <description>" + escapeXML(config.site.description) + "</description>",
  "    <language>en</language>",
  '    <atom:link href="https://pubsubhubbub.appspot.com/" rel="hub" />',
  '    <atom:link href="' + escapeXML(new URL("feed.xml", baseURL).href) +
    '" rel="self" type="application/rss+xml" />',
  "    <lastBuildDate>" + lastBuildDate + "</lastBuildDate>",
  items,
  "  </channel>",
  "</rss>",
  ""
].join("\n");

const changed = [
  updateFile("index.html", homepage) && "index.html",
  updateFile("feed.xml", feed) && "feed.xml",
  updateFile("sitemap.xml", sitemap) && "sitemap.xml"
].filter(Boolean);

if (process.argv.includes("--check") && changed.length) {
  console.error("Generated files were stale: " + changed.join(", "));
  process.exitCode = 1;
}
console.log("Site generator: " + projects.length + " homepage projects, " +
  feedEntries.length + " RSS items; changed: " + (changed.join(", ") || "none"));
