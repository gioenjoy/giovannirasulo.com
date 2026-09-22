#!/usr/bin/env python3
"""Minimal xlsx reader using only the Python standard library."""
import zipfile, re, sys
from xml.etree import ElementTree as ET

NS = {'m': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}


def col_to_idx(ref):
    m = re.match(r'([A-Z]+)', ref)
    s = m.group(1)
    n = 0
    for ch in s:
        n = n * 26 + (ord(ch) - 64)
    return n - 1


def read_sheet(path, sheet_index=0, max_rows=None):
    z = zipfile.ZipFile(path)
    # shared strings
    shared = []
    if 'xl/sharedStrings.xml' in z.namelist():
        root = ET.fromstring(z.read('xl/sharedStrings.xml'))
        for si in root.findall('m:si', NS):
            shared.append(''.join(t.text or '' for t in si.iter(
                '{http://schemas.openxmlformats.org/spreadsheetml/2006/main}t')))
    sheets = sorted(n for n in z.namelist()
                    if re.match(r'xl/worksheets/sheet\d+\.xml$', n))
    name = sheets[sheet_index]
    root = ET.fromstring(z.read(name))
    rows = []
    for r in root.iter('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}row'):
        cells = {}
        for c in r.findall('m:c', NS):
            ref = c.get('r') or ''
            t = c.get('t')
            v = c.find('m:v', NS)
            if t == 'inlineStr':
                is_el = c.find('m:is', NS)
                val = ''.join(x.text or '' for x in is_el.iter(
                    '{http://schemas.openxmlformats.org/spreadsheetml/2006/main}t')) if is_el is not None else ''
            elif v is None:
                val = ''
            elif t == 's':
                val = shared[int(v.text)]
            else:
                val = v.text
            cells[col_to_idx(ref)] = val
        width = (max(cells) + 1) if cells else 0
        rows.append([cells.get(i, '') for i in range(width)])
        if max_rows and len(rows) >= max_rows:
            break
    return rows, [s for s in sheets]


if __name__ == '__main__':
    path = sys.argv[1]
    n = int(sys.argv[2]) if len(sys.argv) > 2 else 8
    rows, sheets = read_sheet(path, 0, n)
    print(f"fogli: {len(sheets)}")
    for i, r in enumerate(rows):
        print(i, r)
