export function parseCsv(source: string): Record<string, string>[] {
  const text = source.replace(/^\uFEFF/, "");
  const rows: string[][] = [];
  let row: string[] = [], field = "", quoted = false, closed = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') { quoted = false; closed = true; }
      else field += c;
    } else if (c === '"' && !field && !closed) quoted = true;
    else if (c === ',') { row.push(field); field = ""; closed = false; }
    else if (c === '\r' || c === '\n') {
      row.push(field); if (row.some(v => v.trim())) rows.push(row);
      row = []; field = ""; closed = false;
      if (c === '\r' && text[i + 1] === '\n') i++;
    } else {
      if (closed || c === '"') throw new Error("CSV 引号格式错误");
      field += c;
    }
  }
  if (quoted) throw new Error("CSV 存在未闭合的引号");
  row.push(field); if (row.some(v => v.trim())) rows.push(row);
  if (!rows.length) throw new Error("CSV 文件为空");
  const headers = rows.shift()!.map(h => h.trim());
  if (headers.some(h => !h) || new Set(headers).size !== headers.length) throw new Error("表头不能为空或重复");
  return rows.map((r, i) => {
    if (r.length !== headers.length) throw new Error(`第 ${i + 2} 条记录的列数与表头不一致`);
    return Object.fromEntries(headers.map((h, j) => [h, r[j]]));
  });
}

export function exportCsv(rows: Record<string, unknown>[]): string {
  if (!rows.length) throw new Error("没有可导出的数据");
  const headers = [...new Set(rows.flatMap(r => Object.keys(r)))];
  const escape = (value: unknown) => {
    let s = value == null ? "" : String(value);
    if (/^[\s]*[=+@-]/.test(s)) s = "'" + s;
    return '"' + s.replace(/"/g, '""') + '"';
  };
  return '\uFEFF' + [headers.map(escape).join(','), ...rows.map(r => headers.map(h => escape(r[h])).join(','))].join('\r\n');
}
