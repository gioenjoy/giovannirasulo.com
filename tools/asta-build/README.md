# Build dell'assistente d'asta

L'app pubblicata è **un solo file**: `fantacalcio-skill-claude/asta/index.html`.
Contiene già dentro di sé i dati dei giocatori, quindi non ha bisogno di server,
database o chiamate esterne: si apre e funziona.

Questi script servono solo a **rigenerarla quando i dati cambiano**.

## Aggiornare il listone

1. Scarica da fantacalcio.it i due file aggiornati:
   - `Quotazioni_Fantacalcio_Stagione_XXXX_YY.xlsx`
   - `Statistiche_Fantacalcio_Stagione_XXXX_YY.xlsx`
2. Lancia, passando il file statistiche (e, se è cambiato, anche quello delle quotazioni):

```bash
cd tools/asta-build
/usr/bin/python3 build_dataset.py "/percorso/Statistiche.xlsx" "/percorso/Quotazioni.xlsx"
/usr/bin/python3 build_app.py ../../fantacalcio-skill-claude/asta/index.html
```

Senza argomenti usa i file di default in `~/Downloads`. La giornata viene
ricavata da sola (presenze massime nel file).

Il primo comando unisce quotazioni e statistiche in `dataset.json`; il secondo lo
inietta nel template e riscrive l'app. Ricarica poi il file su GitHub.

> Usa `/usr/bin/python3` (il Python di sistema): il Python di Homebrew su questa
> macchina ha il modulo XML rotto e non riesce a leggere gli `.xlsx`.

## Aggiornamento dal browser (per gli utenti)

Dal pulsante **📂 Aggiorna dati** chiunque può caricare il file `.xlsx` delle
Statistiche o delle Quotazioni scaricato da fantacalcio.it. Il file è letto nel
browser (zip + XML, senza librerie) e non viene inviato da nessuna parte; i dati
restano salvati solo su quel dispositivo.

Regole di sicurezza già implementate:
- il tipo di file si riconosce dalle intestazioni (`Pv`/`Fm` = statistiche,
  `Qt.A`/`FVM` = quotazioni); file sconosciuti o danneggiati vengono rifiutati;
- viene rifiutato un file di una stagione diversa da quella del listone;
- viene rifiutato un file statistiche non più recente dei dati pubblicati;
- quando pubblichi dati più nuovi, gli aggiornamenti caricati prima vengono
  scartati da soli (statistiche: per giornata; quotazioni: per data di build).

La lettura nel browser è verificata identica a questo script: 0 differenze su
533 giocatori e 20 campi. Se cambi `build_dataset.py`, tieni allineata anche
la funzione `buildPatch` nel template.

## Modificare l'app

Il codice sta in `app_template.html`, con il segnaposto `/*__DATA__*/` al posto
dei dati. Modifica quello, mai il file pubblicato: al primo rebuild verrebbe
sovrascritto.

## Come sono calcolati i prezzi

- I crediti totali della lega (`squadre × budget`) si dividono tra i ruoli:
  P 7%, D 14%, C 32%, A 47% (la difesa sale al 19% con il modificatore attivo).
- Il pool di ogni ruolo si distribuisce tra i giocatori che verranno davvero
  comprati (`quota × squadre`), in proporzione al **FVM** elevato a `0.75`.
- L'esponente è minore di 1 perché il FVM è già una grandezza di tipo prezzo,
  con una coda molto pesante: usato tal quale farebbe valere il miglior
  attaccante quasi metà del budget. Con `0.75` i prezzi tornano realistici
  (top attaccante ~130 su 400 crediti) e il totale allocato resta pari al
  mercato (verificato: 4003 su 4000).
- **Prezzo probabile** = prezzo equo × effetto tifoseria della squadra reale
  (tabella `HYPE` nel template).
- **Massimo consigliato** = prezzo equo corretto per il rapporto tra crediti
  residui e slot ancora da riempire, con il vincolo di lasciare almeno 1 credito
  per ogni slot mancante.

## Nota sui dati della stagione in corso

A inizio stagione le statistiche coprono pochissime giornate. Sono usate solo
per i **fatti** (ha giocato, ha segnato, è ammonito) e mai per determinare il
valore: una fantamedia altissima su 2 partite è rumore, non un segnale. L'app lo
segnala esplicitamente con l'avviso "Campione piccolo".
