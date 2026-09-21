export function parseCount(value: string): number | null {
  const match = (value || "").trim().replace(/,/g, "").match(/^(\d+(?:\.\d+)?)\s*([km])?(?:\s+(?:sales|reviews))?$/i);
  if (!match) return null;
  return Math.round(Number(match[1]) * ({k: 1000, m: 1000000}[match[2]?.toLowerCase() as "k" | "m"] || 1));
}
export function parseAgeMonths(value: string): number | null {
  const s = (value || "").toLowerCase();
  const y = s.match(/(\d+(?:\.\d+)?)\s*years?/), m = s.match(/(\d+(?:\.\d+)?)\s*months?/);
  return y || m ? Math.round(Number(y?.[1] || 0) * 12 + Number(m?.[1] || 0)) : null;
}
export function normalizeListingUrl(value: string): string {
  try { const u = new URL(value); const m = u.pathname.match(/^\/listing\/(\d+)(?:\/|$)/);
    return /^(www\.)?etsy\.com$/i.test(u.hostname) && m ? "https://www.etsy.com/listing/" + m[1] + "/" : "";
  } catch { return ""; }
}
export function cleanLandropRows(rows: Record<string, string>[]) {
  const seen = new Set<string>();
  return rows.flatMap(r => {
    const url = normalizeListingUrl(r.listing_url || "");
    const id = /^\d+$/.test(r.listing_id || "") ? r.listing_id : url.match(/listing\/(\d+)/)?.[1];
    if (!id || seen.has(id)) return [];
    seen.add(id);
    const sales = parseCount(r.sales), reviews = parseCount(r.review_count), months = parseAgeMonths(r.shop_age);
    return [{...r, listing_id: id, listing_url: "https://www.etsy.com/listing/" + id + "/",
      sales_value: sales, review_count_value: reviews, shop_age_months: months,
      monthly_sales: months && sales !== null ? Math.round(sales / months * 100) / 100 : null,
      hot: Boolean((r.badge || "").trim())}];
  });
}
