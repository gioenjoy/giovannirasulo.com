#!/usr/bin/env python3
"""Costruisce il dataset dei giocatori unendo quotazioni e statistiche 2026/27.

Uso: build_dataset.py [statistiche.xlsx] [quotazioni.xlsx]
"""
import json, os, sys, time
from xlsx_read import read_sheet

HERE = os.path.dirname(os.path.abspath(__file__))
STAT = sys.argv[1] if len(sys.argv) > 1 else "/Users/giovanniras/Downloads/Statistiche_Fantacalcio_Stagione_2026_27.xlsx"
QUOT = sys.argv[2] if len(sys.argv) > 2 else "/Users/giovanniras/Downloads/Quotazioni_Fantacalcio_Stagione_2026_27.xlsx"


def num(v, default=0.0):
    try:
        return float(str(v).replace(',', '.'))
    except (ValueError, TypeError):
        return default


def rows_of(path):
    raw, _ = read_sheet(path)
    header = raw[1]
    idx = {h: i for i, h in enumerate(header)}
    out = []
    for r in raw[2:]:
        if len(r) > 3 and r[0]:
            out.append({h: (r[i] if i < len(r) else '') for h, i in idx.items()})
    return out


quot = rows_of(QUOT)
stat = {r['Id']: r for r in rows_of(STAT)}

players = []
max_pv = 0
for q in quot:
    s = stat.get(q['Id'], {})
    pv = int(num(s.get('Pv', 0)))
    max_pv = max(max_pv, pv)
    players.append({
        'id': q['Id'],
        'n': q['Nome'].strip(),
        'r': q['R'].strip(),                  # ruolo Classic
        'rm': q['RM'].strip(),                # ruoli Mantra (separati da ;)
        't': q['Squadra'].strip(),
        'qa': int(num(q['Qt.A'])),            # quotazione attuale Classic
        'qi': int(num(q['Qt.I'])),            # quotazione iniziale Classic
        'qam': int(num(q['Qt.A M'])),         # quotazione attuale Mantra
        'fvm': int(num(q['FVM'])),            # fantavoto medio ponderato
        'fvmM': int(num(q['FVM M'])),
        'pv': pv,                             # presenze stagione in corso
        'mv': round(num(s.get('Mv', 0)), 2),  # media voto
        'fm': round(num(s.get('Fm', 0)), 2),  # fantamedia
        'gf': int(num(s.get('Gf', 0))),       # gol fatti
        'gs': int(num(s.get('Gs', 0))),       # gol subiti (portieri)
        'rp': int(num(s.get('Rp', 0))),       # rigori parati
        'rc': int(num(s.get('Rc', 0))),       # rigori calciati
        'ass': int(num(s.get('Ass', 0))),
        'amm': int(num(s.get('Amm', 0))),
        'esp': int(num(s.get('Esp', 0))),
    })

# fascia calcolata sulla quotazione, per ruolo (quartili sul listone reale)
by_role = {}
for p in players:
    by_role.setdefault(p['r'], []).append(p)

for role, group in by_role.items():
    ordered = sorted(group, key=lambda x: (-x['qa'], -x['fvm'], int(x['id'])))  # spareggio per id, come nell'app
    n = len(ordered)
    for i, p in enumerate(ordered):
        pct = i / n
        if pct < 0.05:
            p['f'] = 'TOP'
        elif pct < 0.15:
            p['f'] = 'SEMI-TOP'
        elif pct < 0.35:
            p['f'] = 'TITOLARE'
        elif pct < 0.60:
            p['f'] = 'SCOMMESSA'
        else:
            p['f'] = 'LOW COST'

players.sort(key=lambda p: (-p['fvm'], -p['qa']))

teams = sorted(set(p['t'] for p in players))
meta = {
    'season': '2026/27',
    'giornata': max_pv,
    'source': 'Quotazioni e Statistiche Fantacalcio 2026/27',
    'teams': teams,
    'count': len(players),
    # data di pubblicazione: le quotazioni caricate dagli utenti prima di
    # questa data vengono scartate a favore di quelle pubblicate
    'built': int(time.time() * 1000),
}

out = {'meta': meta, 'players': players}
path = os.path.join(HERE, 'dataset.json')
with open(path, 'w', encoding='utf-8') as f:
    json.dump(out, f, ensure_ascii=False, separators=(',', ':'))

import os
print('giocatori:', len(players))
print('giornata rilevata:', max_pv)
print('squadre:', len(teams))
print('dimensione JSON: %.1f KB' % (os.path.getsize(path) / 1024))
print('esempio:', json.dumps(players[0], ensure_ascii=False))
from collections import Counter
print('fasce:', dict(Counter(p['f'] for p in players)))
print('con almeno 1 presenza:', sum(1 for p in players if p['pv'] > 0))
print('rigoristi (rc>0):', sum(1 for p in players if p['rc'] > 0))
