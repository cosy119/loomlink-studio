import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseCsv, exportCsv } from '../lib/csv.ts';
import { cleanLandropRows, parseAgeMonths, parseCount, normalizeListingUrl } from '../lib/landrop.ts';
test('CSV handles BOM, quoted commas, escaped quotes and multiline values',()=>{
 const rows=parseCsv('\uFEFFid,title\r\n1,"Linen, ""soft""\nwhite"\r\n');
 assert.equal(rows[0].title,'Linen, "soft"\nwhite');
 assert.deepEqual(parseCsv(exportCsv(rows)),rows);
});
test('CSV rejects malformed headers and records',()=>{
 for(const text of ['a,a\n1,2','a,b\n1','a\n"unclosed'])assert.throws(()=>parseCsv(text));
});
test('CSV exports every row with BOM and neutralizes formulas',()=>{
 const rows=Array.from({length:150},(_,i)=>({id:i,title:i===0?'=cmd()':'linen'}));
 const out=exportCsv(rows);assert.equal(out.charCodeAt(0),0xfeff);assert.equal(parseCsv(out).length,150);assert.equal(parseCsv(out)[0].title,"'=cmd()");
});
test('Landrop deduplicates and preserves missing values',()=>{
 const rows=cleanLandropRows([{listing_url:'https://www.etsy.com/listing/123/linen?ref=ad',sales:'1.2k',shop_age:'1 year 6 months'},{listing_id:'123',sales:'3'},{listing_id:'456',sales:'unknown'}]);
 assert.equal(rows.length,2);assert.equal(rows[0].sales_value,1200);assert.equal(rows[0].shop_age_months,18);assert.equal(rows[1].monthly_sales,null);
 assert.equal(normalizeListingUrl('https://etsy.com.evil.test/listing/1'),'');
 assert.equal(parseCount('0'),0);assert.equal(parseAgeMonths('unknown'),null);
});
