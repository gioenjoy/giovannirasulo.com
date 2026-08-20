# Handoff sessione — giovannirasulo.com

Documento di continuità per una nuova sessione Claude Code. Riassume tutto il lavoro fatto sul sito `giovannirasulo.com` di Giovanni Rasulo. Copialo/allegalo alla nuova sessione perché la vecchia sta esaurendo il contesto.

**Data ultimo aggiornamento di questo documento**: 2026-07-09

---

## ⚠️ STATO CRITICO: nulla è ancora pubblicato

**Tutte le modifiche descritte qui sotto sono SOLO LOCALI** in `~/Desktop/giovannirasulo.com`. Il sito live su https://www.giovannirasulo.com riflette una versione PRECEDENTE.

**Come si pubblica**: Giovanni carica i file a mano su GitHub (repo `gioenjoy/giovannirasulo.com`, branch `main`). Netlify è collegato al repo e fa auto-deploy a ogni push su `main`. Non uso token Netlify per pubblicare (l'utente lo rigenera/revoca dopo ogni uso per sicurezza) — il canale è sempre GitHub → Netlify auto-deploy.

**File da caricare per allineare il live a quanto descritto in questo documento** (tutti in `~/Desktop/giovannirasulo.com/`):
```
index.html
smart-working.html
osservatorio-smartworking/index.html
osservatorio-smartworking/aziende-topten/index.html
lavagna_interattiva_smart_working.html
privacy-cookie-policy.html
termini-condizioni.html
netlify.toml
netlify/functions/unlock.js
thank-you-starter-jkdshbfiuvarothbioqvueybofkd.html
thank-you-percorso-jkdshbfiuvarothbioqvueybofkd.html
thank-you-percorso-diretto-jkdshbfiuvarothbioqvueybofkd.html
```
(`privacy-policy.html` è la vecchia versione, ora orfana/noindex, non serve ricaricarla se già live.)

**Prima azione da fare in una nuova sessione**: chiedere all'utente se ha già pubblicato, e se sì verificare live con `curl`/browser che title, JSON-LD, nav e pricing corrispondano a quanto descritto sotto.

---

## Chi è il cliente e qual è l'obiettivo del sito

**Giovanni Rasulo** — Cagliari, 100% da remoto, smart working dal 2014. Headline LinkedIn: *"Digital Strategist & Fractional Head of Marketing | Massimizzo il ROI su Google e Meta integrando ADV e SEO della nuova era (AEO/GEO) | Autore libro 'Dal controllo alla Fiducia' | Ambassador @Lavoroalsud.it"*.

**Obiettivo primario del sito**: trovare clienti come **Digital Strategist / esperto Google Ads / creatore di Funnel Marketing** in qualità di freelance. NON più posizionarsi come consulente HR/Smart Working (quello resta come elemento di personal branding secondario, su una pagina dedicata separata).

**Due cartelle di lavoro**:
1. `~/Desktop/giovannirasulo.com` — il sito vero e proprio (repo GitHub `gioenjoy/giovannirasulo.com`).
2. `~/Documents/agency/clients/giovanni-smartworking` — contenuti editoriali/social per il brand smart working (post LinkedIn, calendario editoriale). Ha un proprio `CLAUDE.md` con regole di brand voice e cancelli di approvazione (mai pubblicare senza ok esplicito, mai inventare dati).

---

## 1. Repositioning del sito (Home + Smart Working)

### Step 1 — `index.html` (Home): da HR advisor a Digital Strategist/Ads
- **Title**: `Giovanni Rasulo · Digital Strategist & Google Ads Expert` (56 char)
- **Meta description**: `Digital Strategist e Fractional Head of Marketing: massimizzo il ROI su Google e Meta Ads con funnel ad alta conversione. 5M€+ gestiti in Ads.` (142 char)
- **Hero**: badge cambiato da "Autore del libro" a **"5M€+ gestiti in campagne Google & Meta Ads"**. H1 nuovo: **"Massimizzo il ROI su Google e Meta integrando Funnel Marketing e ADV avanzata."** (era "Ciao, sono Giovanni Rasulo"). Sottotitolo riscritto (smart working sostituito con promessa ROI/funnel). CTA primaria **"Richiedi un Audit Ads/Funnel"** (era "Contattami"), CTA secondaria **"Guarda i Casi Studio"** (era "Scopri il libro"). Chip flottante "Smart working dal 2014" → **"+57% lead generati"** (dato reale già presente altrove sul sito).
- **Nuova sezione `#services`** "Come posso aiutarti" subito dopo la Hero, prima di Esperienza — 3 pilastri (riuso CSS `.sw-pillars` esistente): **Google & Meta Ads Performance**, **Funnel Marketing & Growth Strategy**, **Fractional Head of Marketing**. CTA "Parliamo del tuo progetto" → `#contact`.
- **Nav riordinato**: `Servizi | Casi Studio | Esperienza | Smart Working | Osservatorio` (LinkedIn/Il libro/Competenze tolti dal menu top-level ma restano come sezioni sulla pagina, non cancellati).
- **Sezione Progetti → "Casi Studio"**: card riordinate mettendo in testa quelle Ads/Funnel-rilevanti (funnel B2B, SEO/SEM, Ecommerce, EdTech growth, Formazione), HR/coaching in coda. Le prime due riscritte in formato **Problema → Strategia → Risultato** con dati reali già esistenti (niente inventato, niente mockup Funnelytics fittizi).
- **Pulsante contatti**: "Email" → **"Raccontami del tuo progetto"** con link a Google Form `https://forms.gle/XK6dT5EXcubSxbVR6`.
- **NON fatto (deliberatamente)**: lead magnet scaricabile tipo "5 errori Ads/Meta" — l'asset non esiste, non promesso a vuoto.

### Step 2 — `smart-working.html`: ristrutturazione pricing
L'utente aveva già cambiato Stripe link e prezzi prima del mio intervento. Da **3 piani a 2** (rimosso interamente "Il Percorso" 97€, incluso il corso video che sparisce dall'offerta per scelta esplicita — non migrato altrove):

- **Il Sistema — 27€** (era 47€): guida PDF, 3 email template, checklist 20 punti, template smart policy, lista 50 aziende + **NUOVO: eBook "Dal Controllo alla Fiducia" (ePub)**.
- **Il Percorso + Supporto — 147€** (era 197€): Tutto Il Sistema + 2 sessioni 1:1 + analisi situazione + piano d'azione + follow-up + bonus **"Il Sistema di Produttività"** (spostato qui dal vecchio piano 97€ eliminato). **Nessuna garanzia rimborso** (rimossa di proposito).
- CSS pricing-grid da 3 a 2 colonne, container 1020px→760px.
- 2 FAQ riscritte (una citava il modulo del Percorso ormai inesistente, una descriveva il vecchio meccanismo di garanzia).
- **Title**: `Come Ottenere lo Smart Working (Senza Chiederlo) | Rasulo` (57 char). **Description**: `Il metodo per proporre lo smart working al tuo capo con dati, non richieste. Guida, template ed email pronte da chi lo pratica da 11+ anni.` (139 char)
- **Nav**: Logo | **Chi sono** (→ Home) | **Osservatorio** (→ hub) | Inizia ora.

---

## 2. Sistema di sblocco contenuti a pagamento (Netlify Function)

File: `netlify/functions/unlock.js`. Verifica il pagamento via Stripe API (`checkout.sessions.retrieve`) e restituisce i link ai materiali **solo se pagato**. Gli `href="#"` nell'HTML delle thank-you page **non vanno mai toccati manualmente** — li riempie il JS a runtime leggendo la risposta della function.

**Soglia tier**: `amt >= 10000` centesimi (100€, punto medio tra 27€ e 147€, tollera arrotondamenti Stripe) → piano `percorso_supporto`, altrimenti `starter`.

**7 risorse, tutte con link reali impostati** (nessun placeholder residuo, verificato con test):
| Chiave | Risorsa | Da quale piano |
|---|---|---|
| `pdf` | Guida PDF "Come ottenere lo smart working" | Starter |
| `emailtemplates` | 3 email template (Google Doc) | Starter |
| `smartpolicy` | Template smart policy (Drive PDF) | Starter |
| `checklist` | Checklist 20 punti (Drive PDF) | Starter |
| `companies` | Lista 50 aziende (Drive PDF) | Starter |
| `ebook` | eBook ePub del libro (Drive) | Starter |
| `bonus` | Sistema di Produttività (pagina Notion pubblica) | Percorso+Supporto |
| `call` | Prenotazione 1:1 (Google Calendar, non Calendly) | Percorso+Supporto |

Tutti gli URL sono hardcoded come default nella function (fallback su env var Netlify dello stesso nome se impostate, es. `LINK_PDF`, `LINK_EBOOK`, ecc.). **Richiede su Netlify**: env var `STRIPE_SECRET_KEY` (sk_live_...) già impostata dall'utente.

**Le 3 thank-you page** (`thank-you-starter-...`, `thank-you-percorso-...`, `thank-you-percorso-diretto-...`) sono identiche tra loro, hanno 8 card `.access-link` con `data-key` corrispondenti alle 8 chiavi sopra (il vecchio `data-key="video"` è stato rimosso perché il corso video non esiste più — nessuna card orfana). Card eBook ha nota d'uso: *"apri con l'app Libri su Mac/iPhone, oppure usa 'Invia a Kindle' di Amazon per leggerlo su Kindle"* (Kindle non apre .epub nativamente).

**Verificato con test Node** (mock Stripe, non un vero acquisto): 27€ → 6 chiavi (no bonus/call), 147€ → 8 chiavi (tutto). Non testato con un acquisto Stripe reale end-to-end — da fare quando possibile.

---

## 3. Contenuti del prodotto "Il Sistema" (creati in questa sessione)

Tutti salvati in `~/Documents/agency/clients/giovanni-smartworking/outputs/`:
- `2026-07-06_template-email_negoziazione-capo.md` — 3 email (gentile/diretto/definitivo) per negoziare lo smart working col capo.
- `checklist-20-punti.html` + `.pdf` — checklist 20 punti, stesso layout navy/amber del PDF guida originale.
- `template-smart-policy.html` + `.pdf` — template smart policy personale a 7 sezioni.
- `2026-07-06_lista-50-aziende-remote.md` + `lista-50-aziende-remote.html`/`.pdf` — 50 aziende (35 full remote + 15 ibride) verificate via database `italiaremote.com` + verifiche dirette, VOIPVOICE incluso come da richiesta, Automattic escluso.
- Guida PDF principale già esisteva: `guida-smart-working.html`/`.pdf` (30+ pagine).

Metodo PDF: Chrome headless (`--print-to-pdf`) rispetta le regole CSS `@page` (cover a bordo pieno, margini). Stile condiviso: navy `#15263f` / amber `#e0972b`, Georgia + Helvetica Neue.

**"Il Sistema di Produttività"** (bonus Percorso+Supporto): template Notion pubblico a `https://gem-bottom-fd8.notion.site/sistema-produttivita-dal-controllo-alla-fiducia`, spiegato da una guida PDF (10 pagine, fornita dall'utente come "01 IL SISTEMA DI PRODUTTIVITÀ - Notion.pdf").

---

## 4. Osservatorio Smart Working

Sezione di content marketing/authority building, replica (senza riferimenti a Serra/GEO) dello studio "Osservatorio GEO·AI" di Roberto Serra ma sul tema lavoro da remoto.

- **Hub**: `osservatorio-smartworking/index.html` — indice con card-report, 1 pubblicato + 3 "In arrivo" (Città italiane remote, Aziende italiane con posizioni aperte recenti, Professioni più remotizzabili).
- **Report pubblicato**: `osservatorio-smartworking/aziende-topten/index.html` — "Aziende remote & ibride — quali consiglia l'AI". Metodo dichiarato: modello Claude Opus 4.8, arm memoria (N=30, auto-elicitazione) vs arm live (N=30, ricerche web reali). Leader: Automattic (mem 97/live 87). TOP 10 in ciascuna classifica. GitLab marcata "(non assume in Italia)".
- Stile: navy `#0F2840` + palette pastello Home (lavender/peach/sage/honey), favicon+logo = foto reale di Giovanni (data-URI ridotta 96-120px).
- Nav aggiunta: "Chi sono" (→ Home) su entrambe le pagine.

---

## 5. Compliance e tracking (tutte le pagine)

- **GA4** `G-1Q1LLRPZYP`, modalità **opt-in** (bloccato finché `localStorage['cookie-consent'] !== 'accepted'`).
- **Barra cookie**: sfondo `rgba(15,40,64,0.7)` + blur, testo *"I cookie esistono per migliorare l'esperienza di navigazione..."*, bottoni Accetta/Rifiuta. "Rifiuta" → link `/` (torna Home, NON salva consenso → barra ricompare = cookie-wall). Assente di proposito sulle thank-you page (chi arriva lì ha già scelto).
- **P.IVA 04088780129** nel footer di tutte le pagine.
- `sitemap.xml`, `robots.txt` (Disallow sulle 3 thank-you), `llms.txt` già creati.
- **Privacy**: `privacy-cookie-policy.html` è la pagina attuale (informativa GDPR completa). `privacy-policy.html` è la vecchia versione, ormai orfana, con `noindex` — lasciata per compatibilità link esterni eventuali ma non promossa.

---

## 6. SEO on-page (ultimo lavoro fatto, 2026-07-09)

**5 pagine indicizzabili** ottimizzate (escluse le 3 thank-you già noindex, escluse le pagine legali di proposito): `index.html`, `smart-working.html`, `osservatorio-smartworking/index.html`, `osservatorio-smartworking/aziende-topten/index.html`, `lavagna_interattiva_smart_working.html`.

- Title 56-57 caratteri, description 131-149 caratteri su tutte e 5 (prima erano fuori limite o mancanti — vedi tabella nel messaggio precedente della chat).
- **Fix di igiene trovati per strada**: aggiunto `noindex` mancante su `privacy-cookie-policy.html` (per coerenza con le altre pagine legali); corretto link interno in `termini-condizioni.html` che puntava ancora alla vecchia privacy policy.
- **JSON-LD schema.org**: `index.html` **aveva già** un blocco ricco preesistente (Person con alumniOf/hasOccupation, Book con ISBN, ProfessionalService con hasOfferCatalog) — **aggiornato in-place** (non sostituito): jobTitle/descrizione allineati al nuovo posizionamento Ads, OfferCatalog espanso da 3 a 5 voci per rispecchiare la sezione Servizi, aggiunta l'entità `WebSite` mancante. Le altre 4 pagine (nessun JSON-LD preesistente) hanno ricevuto: `smart-working.html` → `Product`×2 (con prezzi reali) + `FAQPage` (le 4 Q&A esatte già in pagina) + `BreadcrumbList`; hub → `CollectionPage` + `BreadcrumbList`; report → `Article` + `BreadcrumbList`; lavagna → `Book` + `WebPage`. Tutti validati come JSON corretto, verificati in browser con 0 errori console.

---

## 7. Note tecniche / gotcha da ricordare

- **Metodo verifica browser**: il vecchio tool `mcp__Claude_Preview__*` si è disconnesso a metà sessione; usare `mcp__Claude_Browser__*` (preview_start con `{name:"gr-static"}`, richiede `.claude/launch.json` con un server statico Python su porta 8848 sulla cartella del sito).
- **Bug noto del tool screenshot**: a certi scroll offset lo screenshot del Browser pane torna bianco/vuoto (probabile problema di compositing col nav sticky/backdrop-filter blur) — non è un bug del sito. In quel caso usare `javascript_tool` per leggere DOM/testo/computed style invece di fidarsi dello screenshot.
- **Editing file grandi con data-URI**: `index.html` è ~200KB perché contiene 2-3 immagini come data-URI base64 (avatar hero, cover libro). Per leggerlo senza sforare il budget di token, sostituire i data-URI con un placeholder testuale prima di leggere (vedi tecnica usata: `re.sub(r'data:image/...;base64,[A-Za-z0-9+/=]+', 'DATA_URI_PLACEHOLDER', t)`).
- **Mai inventare dati**: regola vigente su tutto il progetto (sia per il sito che per i contenuti smart working). Ogni numero/claim usato è verificato o già presente altrove nel sito.
- **Gating server-side è una scelta deliberata**: i link ai materiali a pagamento NON vanno mai scritti in chiaro nell'HTML delle thank-you page, nemmeno se sembra più comodo — vivono solo in `unlock.js`.

---

## 8. Possibili prossimi passi (non fatti, da valutare con l'utente)

- Pubblicare tutto su GitHub (vedi lista file in cima) e verificare live.
- Testare il gating con un acquisto Stripe reale (anche di importo minimo/test) per confermare che la thank-you sblocchi i materiali giusti end-to-end.
- Creare i contenuti per le 3 card "In arrivo" dell'Osservatorio (Città remote, Aziende con assunzioni recenti, Professioni remotizzabili).
- Verificare hiring-in-Italia di aziende minori nella lista 50 (Buffer, Zapier, Coverflex) per eventuale marcatura "(non assume in Italia)".
- Considerare se aggiungere un lead magnet reale (checklist "5 errori Ads/Meta") per la Home, se Giovanni vuole crearne il contenuto.
- Valutare hosting di un'immagine reale (non data-URI) per il campo `image` nei JSON-LD, se si vuole sfruttare meglio i rich results.
