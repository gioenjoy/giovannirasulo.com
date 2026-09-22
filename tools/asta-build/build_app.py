#!/usr/bin/env python3
"""Inietta il dataset nel template e produce l'app finale (file unico)."""
import json, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
TPL = os.path.join(HERE, 'app_template.html')
DATA = os.path.join(HERE, 'dataset.json')
OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, 'asta.html')

tpl = open(TPL, encoding='utf-8').read()
data = open(DATA, encoding='utf-8').read()

if '/*__DATA__*/' not in tpl:
    raise SystemExit('ERRORE: placeholder /*__DATA__*/ non trovato nel template')

# protegge da una chiusura prematura del tag script se un nome contenesse "</script"
data = data.replace('</', '<\\/')

html = tpl.replace('/*__DATA__*/', data)
open(OUT, 'w', encoding='utf-8').write(html)

meta = json.loads(open(DATA, encoding='utf-8').read())['meta']
print('scritto:', OUT)
print('dimensione: %.0f KB' % (os.path.getsize(OUT) / 1024))
print('stagione %s · giornata %s · %d giocatori' % (meta['season'], meta['giornata'], meta['count']))
