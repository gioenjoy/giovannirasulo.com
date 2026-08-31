# Come aggiornare la proposta in PDF

Guida per rigenerare `proposta-collaborazione-giovanni-rasulo.pdf` dopo aver modificato i testi.
Ultimo aggiornamento: 31 agosto 2026.

---

## Come funziona in breve

Il visitatore compila il form su `/proposta/`, e **nel suo browser** il PDF viene compilato con nome,
cognome, azienda e data, poi appiattito e scaricato. Il PDF che sta sul sito ha due campi modulo vuoti
(`destinatario` e `data`) posizionati in prima pagina dentro il riquadro azzurro.

I pezzi coinvolti:

| File | Cosa fa |
|---|---|
| `proposta/sorgente-pdf.html` | **Il sorgente dei testi.** È qui che si modifica il documento. |
| `proposta-collaborazione-giovanni-rasulo.pdf` | Il PDF finito con i campi vuoti, servito dal sito. |
| `proposta/index.html` | La landing page con il form e il codice che compila il PDF. |
| `assets/pdf-lib.min.js` | La libreria che compila e appiattisce il PDF nel browser. |

---

## Aggiornare i testi: la procedura

### 1. Modifica il sorgente

Apri `proposta/sorgente-pdf.html` in un editor di testo e cambia quello che ti serve.
È normale HTML: i testi stanno dentro i tag, lo stile è tutto nel blocco `<style>` in cima.

**Non toccare questi due elementi**, sono i segnaposto dei campi compilabili:

```html
<div class="forline"><span class="ph" id="ph-dest">&nbsp;PLACEHOLDER DESTINATARIO RIGA UNO&nbsp;</span></div>
<div class="fordate"><span class="ph" id="ph-data">&nbsp;PLACEHOLDER DATA&nbsp;</span></div>
```

Sono invisibili nel PDF (`visibility:hidden`) e servono solo a riservare lo spazio giusto.
Se li sposti o ne cambi la dimensione, vanno ricalcolate le coordinate (vedi più sotto).

### 2. Genera il PDF con Chrome

```bash
cd ~/Desktop/giovannirasulo.com
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --headless --disable-gpu --no-pdf-header-footer \
  --print-to-pdf="/tmp/proposta-clean.pdf" \
  "file://$PWD/proposta/sorgente-pdf.html"
```

### 3. Aggiungi i campi compilabili

Serve `pdf-lib` installato una volta sola:

```bash
cd /tmp && npm install pdf-lib
```

Poi salva questo script come `/tmp/add_fields.js`:

```js
const { PDFDocument, StandardFonts, PDFName } = require('pdf-lib');
const fs = require('fs');
const HOME = process.env.HOME;
const OUT = HOME + '/Desktop/giovannirasulo.com/proposta-collaborazione-giovanni-rasulo.pdf';

(async () => {
  const pdf = await PDFDocument.load(fs.readFileSync('/tmp/proposta-clean.pdf'));
  pdf.setTitle('Proposta di collaborazione professionale - Giovanni Rasulo');
  pdf.setAuthor('Giovanni Rasulo');
  pdf.setSubject('Temporary & Fractional Management per PMI ed e-commerce');
  pdf.setCreator('giovannirasulo.com');
  pdf.setProducer('giovannirasulo.com');

  const form  = pdf.getForm();
  const helv  = await pdf.embedFont(StandardFonts.Helvetica);
  const helvB = await pdf.embedFont(StandardFonts.HelveticaBold);

  const acro = form.acroForm;
  let dr = acro.dict.lookup(PDFName.of('DR'));
  if (!dr) { acro.dict.set(PDFName.of('DR'), pdf.context.obj({})); dr = acro.dict.lookup(PDFName.of('DR')); }
  let fonts = dr.lookup(PDFName.of('Font'));
  if (!fonts) { dr.set(PDFName.of('Font'), pdf.context.obj({})); fonts = dr.lookup(PDFName.of('Font')); }
  fonts.set(PDFName.of('Helv'), helv.ref);
  fonts.set(PDFName.of('HeBo'), helvB.ref);

  const page = pdf.getPage(0);
  const trasparente = (field) => {
    field.acroField.getWidgets().forEach(w => {
      const mk = w.getOrCreateAppearanceCharacteristics();
      mk.dict.set(PDFName.of('BG'), pdf.context.obj([]));
      mk.dict.set(PDFName.of('BC'), pdf.context.obj([]));
    });
  };

  const dest = form.createTextField('destinatario');
  dest.setText('');
  dest.addToPage(page, { x: 56.2, y: 573.2, width: 470, height: 15, borderWidth: 0 });
  dest.setFontSize(11);
  dest.acroField.setDefaultAppearance('/HeBo 11 Tf 0.059 0.157 0.251 rg');
  trasparente(dest);

  const data = form.createTextField('data');
  data.setText('');
  data.addToPage(page, { x: 56.2, y: 557.4, width: 260, height: 12, borderWidth: 0 });
  data.setFontSize(8.6);
  data.acroField.setDefaultAppearance('/Helv 8.6 Tf 0.361 0.478 0.600 rg');
  trasparente(data);

  fs.writeFileSync(OUT, await pdf.save());
  console.log('fatto:', OUT);
  console.log('campi:', form.getFields().map(f => f.getName()).join(', '));
})();
```

Ed esegui:

```bash
cd /tmp && node add_fields.js
```

### 4. Controlla e pubblica

Apri il PDF: la riga sotto "ALLA CORTESE ATTENZIONE DI" deve essere **vuota**.
Poi vai su `/proposta/` in locale o in produzione, compila il form e verifica che il file
scaricato abbia nome e azienda al posto giusto.

Carica su GitHub `proposta-collaborazione-giovanni-rasulo.pdf` e `proposta/sorgente-pdf.html`.

---

## Se sposti il riquadro del destinatario

Solo in quel caso servono nuove coordinate. Le si trova così, senza misurare a occhio:

1. In `sorgente-pdf.html` cambia temporaneamente la regola `.ph` da `visibility:hidden;` a
   `background:#FF00FF;color:#FF00FF;`
2. Rigenera il PDF con Chrome (passo 2) in un file di prova
3. Converti la prima pagina in immagine: `pdftoppm -f 1 -l 1 -r 150 prova.pdf m`
4. Trova il rettangolo magenta nell'immagine `m-1.ppm` e converti:
   `punti = pixel / 150 * 72`, con la Y misurata **dal basso** della pagina
   (altezza A4 = 841,92 punti)
5. Riporta i nuovi valori in `add_fields.js` e rimetti `visibility:hidden`

Le coordinate attuali (A4, margini 16/15/14/15 mm) sono:
`destinatario` x 56,2 y 573,2 · `data` x 56,2 y 557,4

---

## Dove finiscono i contatti raccolti

Su **Netlify Forms**, form `proposta-download`.
Dashboard Netlify → il sito → **Forms**.

Le notifiche via email **non sono attive di default**: vanno configurate una volta in
Site configuration → Notifications (o Forms → Form notifications) → Add notification →
Email notification, scegliendo il form `proposta-download` e l'indirizzo dove ricevere l'avviso.

Il piano gratuito include 100 invii al mese. Superata la soglia gli invii successivi
vengono bloccati fino al mese seguente: se succede, il download continua comunque a
funzionare, si perde solo la registrazione del contatto.

---

## Note

- Il PDF grezzo è raggiungibile da chi conosce l'URL diretto. È voluto: il gate è morbido,
  e chi arriva al file diretto è comunque un segnale di interesse. È escluso da Google
  tramite `robots.txt`.
- `proposta/sorgente-pdf.html` ha `noindex` ed è escluso da `robots.txt`: non va promosso
  come pagina del sito, è solo il sorgente di stampa.
- Il testo dei campi viene scritto in Helvetica. È il carattere standard dei PDF e si
  intona al resto del documento, che usa Helvetica Neue.
