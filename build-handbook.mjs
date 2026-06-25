/**
 * build-handbook.mjs
 * -----------------------------------------------------------------------------
 * Pulls the live Google Doc (HTML export) and writes handbook.json in the same
 * structure the website's reader already uses. Run by .github/workflows/handbook.yml
 * on a schedule (and on demand). No Apps Script involved.
 *
 * The doc must be shared "Anyone with the link: Viewer" so this can fetch it.
 * -----------------------------------------------------------------------------
 */
import * as cheerio from "cheerio";
import { writeFileSync } from "node:fs";

const DOC_ID = "17GXxVF1uWDWxZH5hjcN8eBGDcNodXC0OzqHR0dr9G5U";
const OUT    = "handbook.json";
const EXPORT = `https://docs.google.com/document/d/17GXxVF1uWDWxZH5hjcN8eBGDcNodXC0OzqHR0dr9G5U/edit?usp=sharing`;

const escHtml = s => String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
const escAttr = s => escHtml(s).replace(/"/g,"&quot;");
const slug = s => (s||"").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"").slice(0,40);

// Google wraps links as https://www.google.com/url?q=REAL&sa=...  — unwrap them.
function unwrapLink(href){
  if(!href) return "";
  const m = href.match(/[?&]q=([^&]+)/);
  if(href.includes("google.com/url") && m){ try { return decodeURIComponent(m[1]); } catch(e){ return m[1]; } }
  return href;
}

// Turn a node's inline contents into safe HTML (bold/italic/underline/links/breaks).
function inline($, node){
  let out = "";
  $(node).contents().each((_, c) => {
    if(c.type === "text"){
      out += escHtml(c.data).replace(/\r\n|\r|\n/g, "<br>");
    } else if(c.type === "tag"){
      const $c = $(c);
      if(c.name === "br"){ out += "<br>"; return; }
      if(c.name === "a"){
        const href = unwrapLink($c.attr("href"));
        out += `<a href="${escAttr(href)}" target="_blank" rel="noopener">${inline($, c)}</a>`;
        return;
      }
      let inner = inline($, c);
      const style = ($c.attr("style") || "").toLowerCase();
      if(/font-weight:\s*(700|800|900|bold)/.test(style)) inner = `<strong>${inner}</strong>`;
      if(/font-style:\s*italic/.test(style))               inner = `<em>${inner}</em>`;
      if(/text-decoration:[^;]*underline/.test(style))     inner = `<u>${inner}</u>`;
      out += inner;
    }
  });
  return out;
}

export function build(html){
  const $ = cheerio.load(html);
  const title = ($("title").first().text() || "Faculty Handbook").trim();

  // Content sits in <body>; sometimes inside a single wrapper <div>.
  let root = $("body");
  const kids = root.children();
  if(kids.length === 1 && kids[0].name === "div") root = $(kids[0]);

  const sections = [];
  let current = null, list = null;
  const flush = () => { if(list && current){ current.blocks.push({ type:list.ordered?"ol":"ul", items:list.items }); } list = null; };
  const newSection = (t, level) => { flush(); current = { level, title:t, anchor:"sec-"+sections.length+"-"+slug(t), blocks:[] }; sections.push(current); };
  newSection(title, 0);

  root.children().each((_, el) => {
    const tag = el.name, $el = $(el);
    if(tag === "h1" || tag === "h2"){
      const t = $el.text().trim();
      if(t){ newSection(t, tag === "h2" ? 2 : 1); }
      return;
    }
    if(tag === "h3" || tag === "h4"){
      flush();
      current.blocks.push({ type:"h", level: tag === "h3" ? 3 : 4, html: inline($, el) });
      return;
    }
    if(tag === "p"){
      if($el.text().trim() === "") return;
      flush();
      current.blocks.push({ type:"p", html: inline($, el) });
      return;
    }
    if(tag === "ul" || tag === "ol"){
      flush();
      const items = [];
      $el.children("li").each((_, li) => items.push(inline($, li)));
      if(items.length) current.blocks.push({ type: tag === "ol" ? "ol" : "ul", items });
      return;
    }
    if(tag === "table"){
      flush();
      const rows = [];
      $el.find("tr").each((_, tr) => {
        const cells = [];
        $(tr).find("td,th").each((_, td) => cells.push($(td).text().trim()));
        rows.push(cells);
      });
      if(rows.length) current.blocks.push({ type:"table", rows });
      return;
    }
  });
  flush();
  if(sections.length && sections[0].level === 0 && sections[0].blocks.length === 0) sections.shift();

  return { title, fetched: new Date().toISOString(), sections };
}

import { pathToFileURL } from "node:url";
const _entry = process.argv[1] ? pathToFileURL(process.argv[1]).href : "";
if(import.meta.url === _entry){
  const res = await fetch(EXPORT, { redirect: "follow" });
  if(!res.ok) throw new Error("Export fetch failed: HTTP " + res.status + " (is the doc shared 'Anyone with the link'?)");
  const html = await res.text();
  const data = build(html);
  if(!data.sections.length) throw new Error("No sections parsed — check the doc uses Heading 1/2 styles.");
  writeFileSync(OUT, JSON.stringify(data, null, 2));
  console.log(`Wrote ${OUT}: ${data.sections.length} sections.`);
}
