import fs from 'fs'
import path from 'path'
import { createClient } from '@supabase/supabase-js'

function loadEnv(): Record<string, string> {
  const envPath = path.resolve(process.cwd(), '.env.local')
  const raw = fs.readFileSync(envPath, 'utf-8')
  const env: Record<string, string> = {}
  for (const line of raw.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq === -1) continue
    env[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim()
  }
  return env
}

const env = loadEnv()
const supabase = createClient(
  env['NEXT_PUBLIC_SUPABASE_URL']!,
  env['SUPABASE_SERVICE_ROLE_KEY']!,
)

const USER_ID = 'demo@example.com'

const SENDERS = [
  { name: 'Luca Bianchi', address: 'luca@agenziacreativa.it' },
  { name: 'Martina Ferrari', address: 'martina@techsrl.it' },
  { name: 'Giovanni Esposito', address: 'giovanni@consulenze.it' },
  { name: 'Sara Ricci', address: 'sara@digitalstudio.it' },
  { name: 'Francesco Conti', address: 'f.conti@mediagroup.it' },
  { name: 'Alessia Moretti', address: 'alessia@startup.io' },
  { name: 'Marco Russo', address: 'm.russo@impresaedile.it' },
  { name: 'Chiara Romano', address: 'chiara@legale.it' },
  { name: 'Andrea Colombo', address: 'andrea@foodtech.it' },
  { name: 'Elena Mancini', address: 'elena@fashion.it' },
  { name: 'Newsletter', address: 'noreply@producthunt.com' },
  { name: 'GitHub', address: 'noreply@github.com' },
]

type Priority = 'high' | 'medium' | 'low' | 'spam'
type Category = 'client_request' | 'sales_lead' | 'internal' | 'newsletter' | 'notification' | 'support' | 'invoice' | 'other'

interface EmailSpec {
  priority: Priority
  category: Category
  urgency_hours: number
  intent: string
  ai_summary: string
  subject: string
  body_plain: string
}

function randomDate(daysAgo: number): string {
  const d = new Date()
  d.setDate(d.getDate() - Math.floor(Math.random() * daysAgo))
  d.setHours(Math.floor(Math.random() * 12) + 7)
  d.setMinutes(Math.floor(Math.random() * 60))
  return d.toISOString()
}

function randomFrom(arr: typeof SENDERS) {
  return arr[Math.floor(Math.random() * arr.length)]
}

const HIGH_EMAILS: EmailSpec[] = [
  {
    priority: 'high',
    category: 'client_request',
    urgency_hours: 2,
    intent: 'Il cliente richiede una revisione urgente del contratto entro oggi',
    ai_summary: 'Richiesta urgente di revisione contratto per progetto web',
    subject: 'URGENTE: revisione contratto entro oggi',
    body_plain: 'Buongiorno, ho bisogno che tu riveda il contratto che ti ho inviato la settimana scorsa. Il cliente finale lo richiede firmato entro le 18:00 di oggi. Puoi confermarmi che ce la fai? Grazie, Luca',
  },
  {
    priority: 'high',
    category: 'invoice',
    urgency_hours: 4,
    intent: 'Sollecito pagamento fattura scaduta da 30 giorni',
    ai_summary: 'Sollecito pagamento fattura #2024-089 scaduta',
    subject: 'Sollecito pagamento fattura #2024-089',
    body_plain: 'Gentile Massimiliano, la fattura n. 2024-089 di €3.200 è scaduta da 30 giorni. La preghiamo di procedere al saldo entro 48h per evitare more. Resto a disposizione.',
  },
  {
    priority: 'high',
    category: 'client_request',
    urgency_hours: 3,
    intent: 'Il cliente segnala un bug critico in produzione sul sito e-commerce',
    ai_summary: 'Bug critico in produzione: carrello non funziona',
    subject: 'BUG CRITICO: carrello e-commerce bloccato',
    body_plain: 'Massimiliano, il carrello del nostro e-commerce non funziona da stamattina. I clienti non riescono a completare gli acquisti. Stiamo perdendo vendite ogni minuto. Intervieni ASAP please!',
  },
  {
    priority: 'high',
    category: 'sales_lead',
    urgency_hours: 8,
    intent: 'Lead caldo: azienda interessata a sviluppo app con budget confermato',
    ai_summary: 'Lead qualificato con budget €15k per app mobile',
    subject: 'Progetto app mobile — budget approvato',
    body_plain: 'Salve Massimiliano, abbiamo approvato il budget di €15.000 per lo sviluppo dell\'app mobile. Vorremmo incontrarla questa settimana per discutere i dettagli tecnici. È disponibile giovedì o venerdì?',
  },
  {
    priority: 'high',
    category: 'client_request',
    urgency_hours: 6,
    intent: 'Cliente chiede demo per domani mattina davanti al board',
    ai_summary: 'Demo richiesta per domani 9:00 davanti al consiglio di amministrazione',
    subject: 'Demo per domani mattina — board meeting',
    body_plain: 'Ciao! Ho presentato il nostro progetto al board e sono entusiasti. Domani alle 9:00 ho il meeting con il CDA e vorrebbero vedere una demo live. Riesci a prepararla per stamattina?',
  },
  {
    priority: 'high',
    category: 'support',
    urgency_hours: 2,
    intent: 'Accesso al pannello admin bloccato, nessun cliente riesce a entrare',
    ai_summary: 'Accesso pannello admin bloccato per tutti gli utenti',
    subject: 'Accesso admin bloccato — tutti fuori!',
    body_plain: 'Massimiliano, nessuno dei nostri operatori riesce più ad accedere al pannello admin. Dice "sessione scaduta" per tutti. Abbiamo 50 ticket aperti. È un disastro. Aiuto!',
  },
  {
    priority: 'high',
    category: 'client_request',
    urgency_hours: 4,
    intent: 'Richiesta modifica urgente alla landing page prima del lancio campagna',
    ai_summary: 'Modifica urgente landing page prima lancio ads domani',
    subject: 'Modifica landing page PRIMA di domani',
    body_plain: 'Buongiorno Massimiliano, domani partiamo con la campagna Google Ads ma ho bisogno di aggiornare il form di contatto sulla landing page. Puoi farlo oggi? La campagna parte alle 8:00.',
  },
  {
    priority: 'high',
    category: 'invoice',
    urgency_hours: 12,
    intent: 'Richiesta fattura per chiusura trimestrale entro fine giornata',
    ai_summary: 'Richiesta fattura per chiusura Q4 entro fine giornata',
    subject: 'Fattura per chiusura trimestrale Q4',
    body_plain: 'Ciao Massimiliano, abbiamo necessità della fattura per le attività di novembre e dicembre per la chiusura del trimestre. Riusciresti a mandarla entro oggi? Il nostro amministrativo ne ha bisogno per stamattina.',
  },
  {
    priority: 'high',
    category: 'client_request',
    urgency_hours: 2,
    intent: 'Sito giù dopo deploy: ripristino immediato richiesto',
    ai_summary: 'Sito down dopo ultimo deploy — ripristino urgente',
    subject: 'Sito offline dopo deploy!',
    body_plain: 'Il sito è andato giù dopo l\'ultimo deploy di ieri sera. Gli errori 500 sono ovunque. Abbiamo bisogno di un rollback immediato o di un fix. Ti chiamo tra 10 minuti.',
  },
  {
    priority: 'high',
    category: 'sales_lead',
    urgency_hours: 24,
    intent: 'Richiesta proposta tecnica per gara pubblica con scadenza domani',
    ai_summary: 'Proposta tecnica per gara pubblica — scadenza domani 12:00',
    subject: 'Proposta tecnica — gara pubblica scadenza domani',
    body_plain: 'Salve, stiamo partecipando a una gara pubblica per la digitalizzazione dei servizi comunali. Abbiamo bisogno di una proposta tecnica entro domani alle 12:00. Budget stimato €40.000. È fattibile?',
  },
]

const MEDIUM_EMAILS: EmailSpec[] = [
  {
    priority: 'medium',
    category: 'client_request',
    urgency_hours: 48,
    intent: 'Cliente chiede aggiornamento sullo stato di avanzamento del progetto',
    ai_summary: 'Richiesta stato avanzamento progetto dashboard analytics',
    subject: 'Aggiornamento stato progetto dashboard',
    body_plain: 'Ciao Massimiliano, come procede il progetto dashboard? Siamo a metà del secondo sprint e vorrei un aggiornamento su cosa è stato completato e cosa rimane da fare.',
  },
  {
    priority: 'medium',
    category: 'sales_lead',
    urgency_hours: 72,
    intent: 'Richiesta preventivo per restyling sito web aziendale',
    ai_summary: 'Preventivo restyling sito aziendale — budget non specificato',
    subject: 'Preventivo restyling sito web',
    body_plain: 'Buongiorno, siamo interessati a un restyling completo del nostro sito web aziendale. Attualmente è in WordPress e vorremmo qualcosa di più moderno. Potreste inviarci un preventivo?',
  },
  {
    priority: 'medium',
    category: 'support',
    urgency_hours: 24,
    intent: 'Utente non riesce a reimpostare la password',
    ai_summary: 'Richiesta supporto: reset password non funziona',
    subject: 'Problema reset password',
    body_plain: 'Salve, sto cercando di reimpostare la mia password ma non ricevo l\'email di reset. Ho controllato lo spam ma non c\'è nulla. Potete aiutarmi? Account: sara.bianchi@azienda.it',
  },
  {
    priority: 'medium',
    category: 'client_request',
    urgency_hours: 48,
    intent: 'Richiesta di aggiunta nuova funzionalità al gestionale',
    ai_summary: 'Richiesta nuova feature: export CSV dal gestionale ordini',
    subject: 'Nuova funzionalità: export ordini CSV',
    body_plain: 'Ciao, abbiamo bisogno di poter esportare gli ordini in formato CSV dalla sezione "Ordini" del gestionale. È qualcosa che potete aggiungere nel prossimo sprint?',
  },
  {
    priority: 'medium',
    category: 'internal',
    urgency_hours: 24,
    intent: 'Riunione di team settimanale da confermare',
    ai_summary: 'Conferma disponibilità per riunione team settimanale',
    subject: 'Riunione team — conferma disponibilità',
    body_plain: 'Ciao Massimiliano, confermo la riunione settimanale per giovedì alle 10:00 su Meet. Ordine del giorno: review sprint 3, pianificazione sprint 4, feedback cliente.',
  },
  {
    priority: 'medium',
    category: 'invoice',
    urgency_hours: 72,
    intent: 'Richiesta chiarimenti su voce in fattura',
    ai_summary: 'Chiarimento richiesto su voce "consulenza straordinaria" in fattura',
    subject: 'Chiarimento fattura #2024-091',
    body_plain: 'Buongiorno, ho ricevuto la fattura #2024-091 ma non capisco la voce "consulenza straordinaria" di €800. Può dettagliare le attività incluse? Grazie.',
  },
  {
    priority: 'medium',
    category: 'client_request',
    urgency_hours: 48,
    intent: 'Cliente vuole aggiungere pagamento con PayPal al checkout',
    ai_summary: 'Richiesta integrazione PayPal nel checkout e-commerce',
    subject: 'Integrazione PayPal checkout',
    body_plain: 'Salve Massimiliano, i nostri clienti ci chiedono spesso di pagare con PayPal. Volevamo capire quanto costerebbe integrarlo nel checkout esistente e quanto tempo ci vorrebbe.',
  },
  {
    priority: 'medium',
    category: 'support',
    urgency_hours: 36,
    intent: 'Segnalazione lentezza del sito nelle ore di punta',
    ai_summary: 'Segnalazione performance: sito lento tra le 18-20',
    subject: 'Sito lento nelle ore serali',
    body_plain: 'Ciao, abbiamo notato che il sito diventa molto lento tra le 18 e le 20. I tempi di caricamento a volte superano i 10 secondi. Potete verificare cosa succede?',
  },
  {
    priority: 'medium',
    category: 'sales_lead',
    urgency_hours: 96,
    intent: 'Richiesta informazioni su servizi di SEO',
    ai_summary: 'Richiesta informazioni servizi SEO per e-commerce',
    subject: 'Informazioni servizi SEO',
    body_plain: 'Buongiorno, gestisco un piccolo e-commerce di abbigliamento e vorrei migliorare il posizionamento su Google. Offrite servizi di SEO? Quali risultati posso aspettarmi e in quanto tempo?',
  },
  {
    priority: 'medium',
    category: 'client_request',
    urgency_hours: 48,
    intent: 'Richiesta accesso alle analytics del sito per il reparto marketing',
    ai_summary: 'Richiesta accesso Google Analytics per team marketing',
    subject: 'Accesso analytics per il marketing',
    body_plain: 'Ciao, il nostro responsabile marketing ha bisogno di accedere alle analytics del sito. Puoi aggiungere il suo account (marketing@azienda.it) come lettore su Google Analytics?',
  },
  {
    priority: 'medium',
    category: 'internal',
    urgency_hours: 24,
    intent: 'Condivisione documenti per revisione contratto di collaborazione',
    ai_summary: 'Invio contratto collaborazione da rivedere prima della call',
    subject: 'Contratto collaborazione — revisione',
    body_plain: 'Massimiliano, ti mando in allegato il contratto di collaborazione aggiornato con le modifiche discusse la settimana scorsa. Puoi darci un occhio prima della call di giovedì?',
  },
  {
    priority: 'medium',
    category: 'support',
    urgency_hours: 48,
    intent: 'Richiesta backup dei dati del sito prima della migrazione',
    ai_summary: 'Richiesta backup completo prima migrazione hosting',
    subject: 'Backup dati prima migrazione hosting',
    body_plain: 'Prima di procedere con la migrazione al nuovo hosting, vogliamo assicurarci di avere un backup completo di tutto. Database, file, configurazioni. Quando puoi farlo?',
  },
  {
    priority: 'medium',
    category: 'client_request',
    urgency_hours: 72,
    intent: 'Cliente richiede implementazione cookie banner conforme GDPR',
    ai_summary: 'Richiesta implementazione cookie banner GDPR-compliant',
    subject: 'Cookie banner GDPR — quando lo implementiamo?',
    body_plain: 'Ciao Massimiliano, il nostro legale ci ha segnalato che il cookie banner attuale non è conforme al GDPR. Dobbiamo sistemarlo. Quando potresti lavorarci? È urgente dal punto di vista legale.',
  },
  {
    priority: 'medium',
    category: 'sales_lead',
    urgency_hours: 120,
    intent: 'Richiesta di collaborazione per progetto lungo termine',
    ai_summary: 'Proposta collaborazione continuativa per startup fintech',
    subject: 'Proposta collaborazione continuativa',
    body_plain: 'Salve, siamo una startup fintech in fase di crescita e stiamo cercando uno sviluppatore affidabile per una collaborazione continuativa di almeno 12 mesi. Sarebbe interessato a valutare una proposta?',
  },
  {
    priority: 'medium',
    category: 'notification',
    urgency_hours: 48,
    intent: 'Notifica rinnovo dominio in scadenza tra 30 giorni',
    ai_summary: 'Dominio azienda.it in scadenza tra 30 giorni',
    subject: 'Rinnovo dominio — scadenza tra 30 giorni',
    body_plain: 'Il dominio azienda.it è in scadenza il 15 del mese prossimo. Si prega di rinnovarlo o di comunicarci se si desidera procedere con la dismissione.',
  },
  {
    priority: 'medium',
    category: 'client_request',
    urgency_hours: 48,
    intent: 'Richiesta modifica colori e logo sul sito dopo rebranding',
    ai_summary: 'Aggiornamento branding sito: nuovi colori e logo post-rebranding',
    subject: 'Aggiornamento branding sito web',
    body_plain: 'Ciao! Abbiamo completato il nostro rebranding aziendale. Ti mando i nuovi asset (logo, colori, font). Potresti aggiornare il sito con il nuovo brand? Non ci sono urgenze particolari ma prima è meglio.',
  },
  {
    priority: 'medium',
    category: 'support',
    urgency_hours: 24,
    intent: 'Richiesta installazione certificato SSL su nuovo dominio',
    ai_summary: 'Installazione SSL richiesta su dominio staging.azienda.it',
    subject: 'SSL su dominio staging',
    body_plain: 'Buongiorno, abbiamo aggiunto il dominio staging.azienda.it ma manca il certificato SSL. Il browser mostra "connessione non sicura". Puoi installarlo?',
  },
  {
    priority: 'medium',
    category: 'client_request',
    urgency_hours: 96,
    intent: 'Richiesta di formazione sull\'uso del CMS per il team interno',
    ai_summary: 'Sessione formazione CMS richiesta per team editoriale',
    subject: 'Formazione CMS per il nostro team',
    body_plain: 'Ciao Massimiliano, il nostro team editoriale ha difficoltà a usare il CMS. Potresti fare una sessione di formazione di un paio d\'ore? Siamo circa in 5 persone.',
  },
  {
    priority: 'medium',
    category: 'sales_lead',
    urgency_hours: 72,
    intent: 'Richiesta demo della piattaforma prima di decidere l\'acquisto',
    ai_summary: 'Richiesta demo per valutazione acquisto gestionale',
    subject: 'Richiesta demo gestionale',
    body_plain: 'Buongiorno, stiamo valutando l\'adozione di un nuovo gestionale per la nostra azienda. Siamo 25 dipendenti. Potrebbe mostrarci una demo della piattaforma prima di prendere una decisione?',
  },
  {
    priority: 'medium',
    category: 'internal',
    urgency_hours: 48,
    intent: 'Invio credenziali accesso per nuovo ambiente di staging',
    ai_summary: 'Credenziali ambiente staging pronte per test QA',
    subject: 'Credenziali ambiente staging',
    body_plain: 'Ciao team, l\'ambiente di staging è pronto. URL: staging.progetto.it — user: admin — pass: vedi KeePass. Potete iniziare i test QA. Ping me per qualsiasi problema.',
  },
]

const LOW_EMAILS: EmailSpec[] = [
  {
    priority: 'low',
    category: 'newsletter',
    urgency_hours: 168,
    intent: 'Newsletter mensile con aggiornamenti del settore tech',
    ai_summary: 'Newsletter TechItalia: trend AI e cloud di novembre',
    subject: 'TechItalia Newsletter — Novembre 2024',
    body_plain: 'Le ultime novità dal mondo tech: l\'AI generativa continua a crescere, il cloud ibrido è il nuovo standard e le startup italiane raccolgono record di investimenti. Leggi il sommario completo...',
  },
  {
    priority: 'low',
    category: 'notification',
    urgency_hours: 168,
    intent: 'Notifica automatica: nuovo commento sul blog aziendale',
    ai_summary: 'Nuovo commento approvato sul post "Come scegliere un CMS"',
    subject: 'Nuovo commento sul tuo blog',
    body_plain: 'L\'utente mario.b ha lasciato un commento sul post "Come scegliere il CMS giusto per il tuo business". Il commento è in attesa di approvazione. Clicca qui per moderarlo.',
  },
  {
    priority: 'low',
    category: 'newsletter',
    urgency_hours: 168,
    intent: 'Digest settimanale di Product Hunt',
    ai_summary: 'Product Hunt Weekly: top 10 prodotti della settimana',
    subject: 'Product Hunt — Top Products This Week',
    body_plain: 'This week\'s top products: 1. AI writing assistant with 2k upvotes 2. Design system generator 3. No-code API builder... See all 10 products from this week.',
  },
  {
    priority: 'low',
    category: 'other',
    urgency_hours: 168,
    intent: 'Richiesta di collegamento su LinkedIn',
    ai_summary: 'Richiesta collegamento LinkedIn da sviluppatore junior',
    subject: 'Richiesta di collegamento — LinkedIn',
    body_plain: 'Buongiorno Massimiliano, ho visto il suo profilo LinkedIn e il suo lavoro nel campo AI/ML mi ha molto interessato. Sarei felice di connettermi. Cordiali saluti.',
  },
  {
    priority: 'low',
    category: 'notification',
    urgency_hours: 72,
    intent: 'Riepilogo mensile utilizzo servizi cloud',
    ai_summary: 'Report mensile AWS: costo totale €234, nessuna anomalia',
    subject: 'Riepilogo mensile AWS — Ottobre 2024',
    body_plain: 'Il tuo riepilogo AWS di ottobre: EC2 €89, RDS €67, S3 €34, CloudFront €44. Totale: €234. Nessuna risorsa anomala rilevata. Il budget mensile è rispettato.',
  },
  {
    priority: 'low',
    category: 'newsletter',
    urgency_hours: 168,
    intent: 'Newsletter su design e UX con articoli selezionati',
    ai_summary: 'UX Weekly: articoli su design system e accessibilità',
    subject: 'UX Weekly — Design Systems & A11y',
    body_plain: 'Questa settimana: un deep-dive sui design system scalabili, 5 errori comuni di accessibilità e come evitarli, e un\'intervista al team di design di Figma.',
  },
  {
    priority: 'low',
    category: 'other',
    urgency_hours: 168,
    intent: 'Invito a partecipare a una survey sul freelancing in Italia',
    ai_summary: 'Invito survey: condizioni freelance in Italia 2024',
    subject: 'Partecipa alla survey: Freelancing Italia 2024',
    body_plain: 'Stai lavorando come freelance? Partecipa alla nostra survey annuale sul freelancing in Italia. Solo 5 minuti e riceverai il report completo in anteprima. Scadenza: fine mese.',
  },
  {
    priority: 'low',
    category: 'notification',
    urgency_hours: 168,
    intent: 'Conferma iscrizione a webinar su Next.js 15',
    ai_summary: 'Conferma iscrizione webinar Next.js 15 — 20 novembre ore 18',
    subject: 'Conferma iscrizione webinar Next.js 15',
    body_plain: 'Sei iscritto al webinar "Next.js 15: novità e best practice" del 20 novembre alle 18:00. Riceverai il link Zoom 30 minuti prima dell\'inizio. Aggiungi al calendario.',
  },
  {
    priority: 'low',
    category: 'other',
    urgency_hours: 168,
    intent: 'Auguri di compleanno da un vecchio collega',
    ai_summary: 'Messaggio personale: auguri compleanno da ex-collega',
    subject: 'Buon compleanno! 🎂',
    body_plain: 'Ciao Massimiliano! Ho visto che oggi è il tuo compleanno. Tanti auguri! Come stai? Ci siamo persi di vista dall\'ultima conferenza. Magari ci prendiamo un caffè?',
  },
  {
    priority: 'low',
    category: 'newsletter',
    urgency_hours: 168,
    intent: 'Newsletter settimanale GitHub con trending repository',
    ai_summary: 'GitHub Trending Weekly: top repo JS e Python della settimana',
    subject: 'GitHub Trending — Week of Nov 2024',
    body_plain: 'Top trending repositories this week: 1. shadcn/ui (45k stars) 2. microsoft/TypeScript 3. vercel/next.js... See the full list with summaries and contributors.',
  },
  {
    priority: 'low',
    category: 'notification',
    urgency_hours: 168,
    intent: 'Notifica aggiornamento termini di servizio di Vercel',
    ai_summary: 'Vercel ha aggiornato i ToS — effettivi dal 1° gennaio 2025',
    subject: 'Aggiornamento Termini di Servizio Vercel',
    body_plain: 'Vercel ha aggiornato i propri Termini di Servizio. Le modifiche riguardano principalmente la sezione sulla privacy dei dati e l\'utilizzo dell\'AI. I nuovi termini entrano in vigore il 1° gennaio 2025.',
  },
  {
    priority: 'low',
    category: 'newsletter',
    urgency_hours: 168,
    intent: 'Offerta sconto corso online su TypeScript avanzato',
    ai_summary: 'Sconto 40% corso TypeScript avanzato — offerta valida 48h',
    subject: 'TypeScript Avanzato — 40% di sconto per 48h',
    body_plain: 'Solo per i prossimi 2 giorni: il nostro corso TypeScript Avanzato è disponibile a €59 invece di €99. Include: tipi generici, decoratori, pattern avanzati e progetto finale.',
  },
  {
    priority: 'low',
    category: 'other',
    urgency_hours: 168,
    intent: 'Invito a partecipare a conferenza tech a Milano',
    ai_summary: 'Invito JSDay Milano — 15 marzo 2025',
    subject: 'JSDay Milano 2025 — Early bird disponibili',
    body_plain: 'Ciao Massimiliano, i biglietti early bird per JSDay Milano 2025 sono disponibili! Sarai tra i relatori quest\'anno? Abbiamo uno slot da 45 minuti disponibile per argomenti React/Next.js.',
  },
  {
    priority: 'low',
    category: 'notification',
    urgency_hours: 168,
    intent: 'Riepilogo attività mensile Supabase',
    ai_summary: 'Supabase monthly: 12k richieste DB, storage 2.3GB',
    subject: 'Supabase Monthly Usage Report',
    body_plain: 'Your Supabase project usage for October: Database requests: 12,847 | Storage used: 2.3 GB | Auth users: 127 | Realtime connections: 48. You\'re on track with your free tier limits.',
  },
  {
    priority: 'low',
    category: 'other',
    urgency_hours: 168,
    intent: 'Richiesta di feedback su portfolio da parte di uno studente',
    ai_summary: 'Studente chiede feedback sul proprio portfolio di sviluppatore',
    subject: 'Feedback portfolio — studente sviluppatore',
    body_plain: 'Buongiorno Massimiliano, sono uno studente di informatica al terzo anno e ho creato il mio primo portfolio. Ho trovato il suo profilo LinkedIn e sarei molto grato se potesse darmi un feedback. Grazie in anticipo!',
  },
]

const SPAM_EMAILS: EmailSpec[] = [
  {
    priority: 'spam',
    category: 'other',
    urgency_hours: 0,
    intent: 'Tentativo di phishing con offerta lavoro falsa',
    ai_summary: 'Spam: offerta lavoro falsa con richiesta dati personali',
    subject: 'Offerta di lavoro esclusiva per lei!!!',
    body_plain: 'Gentile utente, la sua candidatura è stata ACCETTATA per la posizione di REMOTE WORKER con stipendio €5000/mese. Inviare IMMEDIATAMENTE nome, codice fiscale e IBAN per procedere. Non perdere questa OPPORTUNITÀ UNICA!',
  },
  {
    priority: 'spam',
    category: 'other',
    urgency_hours: 0,
    intent: 'Email marketing non richiesta per prodotti farmaceutici',
    ai_summary: 'Spam farmaceutico non richiesto',
    subject: 'Farmaci senza ricetta — prezzi imbattibili!!!',
    body_plain: 'Acquista ora i migliori farmaci senza ricetta al 70% di sconto. Consegna discreta in 24h. Clicca qui per il catalogo completo. Offerta valida solo oggi!',
  },
  {
    priority: 'spam',
    category: 'other',
    urgency_hours: 0,
    intent: 'Truffa Nigerian Prince con richiesta trasferimento denaro',
    ai_summary: 'Truffa classica 419: eredità da trasferire',
    subject: 'CONFIDENTIAL BUSINESS PROPOSAL',
    body_plain: 'Dear Friend, I am Dr. Emmanuel Okonkwo, lawyer to late Mr. James who died without heirs. He left $15.5 MILLION USD. I need your assistance to transfer these funds. You will receive 40%. Reply URGENT.',
  },
  {
    priority: 'spam',
    category: 'other',
    urgency_hours: 0,
    intent: 'Tentativo di phishing fingendosi l\'Agenzia delle Entrate',
    ai_summary: 'Phishing: falsa comunicazione Agenzia delle Entrate',
    subject: 'Comunicazione Agenzia delle Entrate — AZIONE RICHIESTA',
    body_plain: 'L\'Agenzia delle Entrate ha rilevato un ERRORE nella sua dichiarazione dei redditi. Per evitare sanzioni, CLICCHI QUI entro 24 ore per verificare la sua posizione fiscale e aggiornare i suoi dati.',
  },
  {
    priority: 'spam',
    category: 'newsletter',
    urgency_hours: 0,
    intent: 'Pubblicità non richiesta per servizio SEO garantito',
    ai_summary: 'Spam SEO: promesse irrealistiche di posizionamento garantito',
    subject: 'Porta il tuo sito in PRIMA PAGINA GOOGLE garantito!',
    body_plain: 'Siamo i leader del SEO italiano! Ti portiamo in PRIMA PAGINA GOOGLE in 30 GIORNI o RIMBORSO TOTALE! Centinaia di clienti soddisfatti. Offerta lancio: solo €99/mese. Scrivi ora!',
  },
]

async function seed() {
  process.stdout.write('Seeding demo data...\n')

  // Upsert demo user settings
  const { error: settingsError } = await supabase.from('users_settings').upsert({
    user_id: USER_ID,
    email_address: USER_ID,
    google_refresh_token: null,
    classification_rules: [],
  })
  if (settingsError) {
    process.stderr.write(`Failed to upsert users_settings: ${settingsError.message}\n`)
    process.exit(1)
  }
  process.stdout.write('users_settings row created\n')

  const allEmails = [
    ...HIGH_EMAILS,
    ...MEDIUM_EMAILS,
    ...LOW_EMAILS,
    ...SPAM_EMAILS,
  ]

  const rows = allEmails.map((spec, i) => {
    const sender = randomFrom(SENDERS)
    return {
      user_id: USER_ID,
      gmail_message_id: `demo-${i + 1}-${Date.now()}`,
      thread_id: `thread-demo-${i + 1}`,
      from_address: sender.address,
      from_name: sender.name,
      subject: spec.subject,
      snippet: spec.body_plain.slice(0, 100),
      body_plain: spec.body_plain,
      received_at: randomDate(30),
      priority: spec.priority,
      category: spec.category,
      urgency_hours: spec.urgency_hours,
      intent: spec.intent,
      ai_summary: spec.ai_summary,
      ai_suggested_reply: null,
      is_processed: true,
      is_handled: false,
    }
  })

  const { error: emailsError } = await supabase.from('emails').insert(rows)
  if (emailsError) {
    process.stderr.write(`Failed to insert emails: ${emailsError.message}\n`)
    process.exit(1)
  }

  process.stdout.write(`Inserted ${rows.length} emails (10 high / 20 medium / 15 low / 5 spam)\n`)
  process.stdout.write('Done!\n')
}

seed()
