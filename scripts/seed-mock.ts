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

const USER_ID = 'test@angel1.dev'
const ACCOUNT_PRIMARY = 'account-001'
const ACCOUNT_WORK = 'account-002'
const ACCOUNT_SUPPORT = 'account-003'

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
  ai_suggested_reply: string
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
    ai_suggested_reply: 'Buongiorno, mi metterò subito al lavoro sulla revisione del contratto e le invierò la versione aggiornata entro le 17:00. Può confermare che l\'indirizzo email è corretto? Resto disponibile per qualsiasi chiarimento urgente. Cordiali saluti, Massimiliano',
    subject: 'URGENTE: revisione contratto entro oggi',
    body_plain: 'Buongiorno, ho bisogno che tu riveda il contratto che ti ho inviato la settimana scorsa. Il cliente finale lo richiede firmato entro le 18:00 di oggi. Puoi confermarmi che ce la fai? Grazie, Luca',
  },
  {
    priority: 'high',
    category: 'invoice',
    urgency_hours: 4,
    intent: 'Sollecito pagamento fattura scaduta da 30 giorni',
    ai_summary: 'Sollecito pagamento fattura #2024-089 scaduta',
    ai_suggested_reply: 'Buongiorno, mi scuso per il ritardo nel pagamento. Provvederò al bonifico entro domani mattina e le invierò la conferma di avvenuto pagamento. Cordiali saluti, Massimiliano',
    subject: 'Sollecito pagamento fattura #2024-089',
    body_plain: 'Gentile Massimiliano, la fattura n. 2024-089 di €3.200 è scaduta da 30 giorni. La preghiamo di procedere al saldo entro 48h per evitare more. Resto a disposizione.',
  },
  {
    priority: 'high',
    category: 'client_request',
    urgency_hours: 3,
    intent: 'Il cliente segnala un bug critico in produzione sul sito e-commerce',
    ai_summary: 'Bug critico in produzione: carrello non funziona',
    ai_suggested_reply: 'Sto guardando il problema adesso. Ho identificato la causa nel modulo di checkout aggiornato ieri sera. Il fix sarà online entro 30 minuti, la tengo aggiornata in tempo reale. Massimiliano',
    subject: 'BUG CRITICO: carrello e-commerce bloccato',
    body_plain: 'Massimiliano, il carrello del nostro e-commerce non funziona da stamattina. I clienti non riescono a completare gli acquisti. Stiamo perdendo vendite ogni minuto. Intervieni ASAP please!',
  },
  {
    priority: 'high',
    category: 'sales_lead',
    urgency_hours: 8,
    intent: 'Lead caldo: azienda interessata a sviluppo app con budget confermato',
    ai_summary: 'Lead qualificato con budget €15k per app mobile',
    ai_suggested_reply: 'Buongiorno, sono disponibile giovedì pomeriggio dalle 15:00 in poi o venerdì mattina dalle 9:00. Mi faccia sapere cosa preferisce e le invio il link per la videochiamata. Cordiali saluti, Massimiliano',
    subject: 'Progetto app mobile — budget approvato',
    body_plain: 'Salve Massimiliano, abbiamo approvato il budget di €15.000 per lo sviluppo dell\'app mobile. Vorremmo incontrarla questa settimana per discutere i dettagli tecnici. È disponibile giovedì o venerdì?',
  },
  {
    priority: 'high',
    category: 'client_request',
    urgency_hours: 6,
    intent: 'Cliente chiede demo per domani mattina davanti al board',
    ai_summary: 'Demo richiesta per domani 9:00 davanti al consiglio di amministrazione',
    ai_suggested_reply: 'Certo, preparo la demo per stanotte. Domani alle 9:00 sarò pronto con tutto. Mi manda l\'indirizzo della sala riunioni o il link Meet? Massimiliano',
    subject: 'Demo per domani mattina — board meeting',
    body_plain: 'Ciao! Ho presentato il nostro progetto al board e sono entusiasti. Domani alle 9:00 ho il meeting con il CDA e vorrebbero vedere una demo live. Riesci a prepararla per stamattina?',
  },
  {
    priority: 'high',
    category: 'support',
    urgency_hours: 2,
    intent: 'Accesso al pannello admin bloccato, nessun cliente riesce a entrare',
    ai_summary: 'Accesso pannello admin bloccato per tutti gli utenti',
    ai_suggested_reply: 'Sto investigando adesso. Sembra un problema con la scadenza del JWT. Sto deployando il fix — dovreste riuscire ad accedere entro 15 minuti. Vi aggiorno subito. Massimiliano',
    subject: 'Accesso admin bloccato — tutti fuori!',
    body_plain: 'Massimiliano, nessuno dei nostri operatori riesce più ad accedere al pannello admin. Dice "sessione scaduta" per tutti. Abbiamo 50 ticket aperti. È un disastro. Aiuto!',
  },
  {
    priority: 'high',
    category: 'client_request',
    urgency_hours: 4,
    intent: 'Richiesta modifica urgente alla landing page prima del lancio campagna',
    ai_summary: 'Modifica urgente landing page prima lancio ads domani',
    ai_suggested_reply: 'Certo, aggiorno il form oggi pomeriggio — sarà live entro le 20:00, in tempo per la campagna di domani. Conferma gli aggiornamenti da apportare e procedo subito. Massimiliano',
    subject: 'Modifica landing page PRIMA di domani',
    body_plain: 'Buongiorno Massimiliano, domani partiamo con la campagna Google Ads ma ho bisogno di aggiornare il form di contatto sulla landing page. Puoi farlo oggi? La campagna parte alle 8:00.',
  },
  {
    priority: 'high',
    category: 'invoice',
    urgency_hours: 12,
    intent: 'Richiesta fattura per chiusura trimestrale entro fine giornata',
    ai_summary: 'Richiesta fattura per chiusura Q4 entro fine giornata',
    ai_suggested_reply: 'La fattura è pronta — la invio in questo momento via email. Ammonta a €4.800 per le attività di novembre e dicembre. Buona chiusura trimestrale! Massimiliano',
    subject: 'Fattura per chiusura trimestrale Q4',
    body_plain: 'Ciao Massimiliano, abbiamo necessità della fattura per le attività di novembre e dicembre per la chiusura del trimestre. Riusciresti a mandarla entro oggi? Il nostro amministrativo ne ha bisogno per stamattina.',
  },
  {
    priority: 'high',
    category: 'client_request',
    urgency_hours: 2,
    intent: 'Sito giù dopo deploy: ripristino immediato richiesto',
    ai_summary: 'Sito down dopo ultimo deploy — ripristino urgente',
    ai_suggested_reply: 'Rollback completato — il sito è tornato online. Sto analizzando il deploy per capire l\'origine del problema e prevenire future interruzioni. La chiamo tra 20 minuti. Massimiliano',
    subject: 'Sito offline dopo deploy!',
    body_plain: 'Il sito è andato giù dopo l\'ultimo deploy di ieri sera. Gli errori 500 sono ovunque. Abbiamo bisogno di un rollback immediato o di un fix. Ti chiamo tra 10 minuti.',
  },
  {
    priority: 'high',
    category: 'sales_lead',
    urgency_hours: 24,
    intent: 'Richiesta proposta tecnica per gara pubblica con scadenza domani',
    ai_summary: 'Proposta tecnica per gara pubblica — scadenza domani 12:00',
    ai_suggested_reply: 'Buongiorno, posso preparare la proposta tecnica entro domani mattina alle 10:00. Ho esperienza in digitalizzazione PA con 3 progetti simili. Quali tecnologie sono richieste nel capitolato? Cordiali saluti, Massimiliano',
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
    ai_suggested_reply: 'Ciao, lo sprint 2 è al 75%: completate le sezioni Filtri e Grafici, in corso il modulo Export. Prevedo di chiudere lo sprint entro giovedì. Ti mando un recap dettagliato nel pomeriggio. Massimiliano',
    subject: 'Aggiornamento stato progetto dashboard',
    body_plain: 'Ciao Massimiliano, come procede il progetto dashboard? Siamo a metà del secondo sprint e vorrei un aggiornamento su cosa è stato completato e cosa rimane da fare.',
  },
  {
    priority: 'medium',
    category: 'sales_lead',
    urgency_hours: 72,
    intent: 'Richiesta preventivo per restyling sito web aziendale',
    ai_summary: 'Preventivo restyling sito aziendale — budget non specificato',
    ai_suggested_reply: 'Buongiorno, grazie per il contatto. Per un restyling completo da WordPress stimo 3-4 settimane di lavoro, range €2.500-€4.000 a seconda delle funzionalità. Possiamo fissare una call questa settimana per capire meglio le sue esigenze? Cordiali saluti, Massimiliano',
    subject: 'Preventivo restyling sito web',
    body_plain: 'Buongiorno, siamo interessati a un restyling completo del nostro sito web aziendale. Attualmente è in WordPress e vorremmo qualcosa di più moderno. Potreste inviarci un preventivo?',
  },
  {
    priority: 'medium',
    category: 'support',
    urgency_hours: 24,
    intent: 'Utente non riesce a reimpostare la password',
    ai_summary: 'Richiesta supporto: reset password non funziona',
    ai_suggested_reply: 'Salve, ho verificato l\'account sara.bianchi@azienda.it — l\'email di reset è stata inviata alle 14:23 ma risulta bloccata dal filtro antispam aziendale. Ho rigenerato il link e inviato da un indirizzo alternativo. Funziona adesso? Massimiliano',
    subject: 'Problema reset password',
    body_plain: 'Salve, sto cercando di reimpostare la mia password ma non ricevo l\'email di reset. Ho controllato lo spam ma non c\'è nulla. Potete aiutarmi? Account: sara.bianchi@azienda.it',
  },
  {
    priority: 'medium',
    category: 'client_request',
    urgency_hours: 48,
    intent: 'Richiesta di aggiunta nuova funzionalità al gestionale',
    ai_summary: 'Richiesta nuova feature: export CSV dal gestionale ordini',
    ai_suggested_reply: 'Ciao, l\'export CSV è fattibile e posso includerlo nel prossimo sprint senza costi aggiuntivi. Stimo circa 4 ore di sviluppo. Vuoi che includa anche filtri per data e stato ordine nell\'export? Massimiliano',
    subject: 'Nuova funzionalità: export ordini CSV',
    body_plain: 'Ciao, abbiamo bisogno di poter esportare gli ordini in formato CSV dalla sezione "Ordini" del gestionale. È qualcosa che potete aggiungere nel prossimo sprint?',
  },
  {
    priority: 'medium',
    category: 'internal',
    urgency_hours: 24,
    intent: 'Riunione di team settimanale da confermare',
    ai_summary: 'Conferma disponibilità per riunione team settimanale',
    ai_suggested_reply: 'Confermato per giovedì alle 10:00. Aggiungo all\'ordine del giorno anche il deployment su staging. A presto! Massimiliano',
    subject: 'Riunione team — conferma disponibilità',
    body_plain: 'Ciao Massimiliano, confermo la riunione settimanale per giovedì alle 10:00 su Meet. Ordine del giorno: review sprint 3, pianificazione sprint 4, feedback cliente.',
  },
  {
    priority: 'medium',
    category: 'invoice',
    urgency_hours: 72,
    intent: 'Richiesta chiarimenti su voce in fattura',
    ai_summary: 'Chiarimento richiesto su voce "consulenza straordinaria" in fattura',
    ai_suggested_reply: 'Buongiorno, la voce "consulenza straordinaria" di €800 si riferisce alle 8 ore di lavoro fuori orario del 14 novembre per risolvere il problema critico del database. Ho allegato il timesheet dettagliato. Resto disponibile per ulteriori chiarimenti. Cordiali saluti, Massimiliano',
    subject: 'Chiarimento fattura #2024-091',
    body_plain: 'Buongiorno, ho ricevuto la fattura #2024-091 ma non capisco la voce "consulenza straordinaria" di €800. Può dettagliare le attività incluse? Grazie.',
  },
  {
    priority: 'medium',
    category: 'client_request',
    urgency_hours: 48,
    intent: 'Cliente vuole aggiungere pagamento con PayPal al checkout',
    ai_summary: 'Richiesta integrazione PayPal nel checkout e-commerce',
    ai_suggested_reply: 'Salve, l\'integrazione PayPal tramite SDK ufficiale richiede circa 2 giorni di sviluppo e test. Il costo stimato è €400. Include checkout espresso PayPal e pagamento standard. Quando vorreste procedere? Cordiali saluti, Massimiliano',
    subject: 'Integrazione PayPal checkout',
    body_plain: 'Salve Massimiliano, i nostri clienti ci chiedono spesso di pagare con PayPal. Volevamo capire quanto costerebbe integrarlo nel checkout esistente e quanto tempo ci vorrebbe.',
  },
  {
    priority: 'medium',
    category: 'support',
    urgency_hours: 36,
    intent: 'Segnalazione lentezza del sito nelle ore di punta',
    ai_summary: 'Segnalazione performance: sito lento tra le 18-20',
    ai_suggested_reply: 'Ciao, ho analizzato i log delle ultime 72 ore: il collo di bottiglia è la query degli ordini recenti che non usa l\'indice corretto. Ho già applicato la fix — monitorate nelle prossime ore serali e fatemelo sapere. Massimiliano',
    subject: 'Sito lento nelle ore serali',
    body_plain: 'Ciao, abbiamo notato che il sito diventa molto lento tra le 18 e le 20. I tempi di caricamento a volte superano i 10 secondi. Potete verificare cosa succede?',
  },
  {
    priority: 'medium',
    category: 'sales_lead',
    urgency_hours: 96,
    intent: 'Richiesta informazioni su servizi di SEO',
    ai_summary: 'Richiesta informazioni servizi SEO per e-commerce',
    ai_suggested_reply: 'Buongiorno, offro servizi SEO tecnico e on-page. Per un e-commerce di abbigliamento stimo 4-6 mesi per risultati significativi su keyword competitive. Il pacchetto base parte da €500/mese. Le va bene una call conoscitiva di 30 minuti? Cordiali saluti, Massimiliano',
    subject: 'Informazioni servizi SEO',
    body_plain: 'Buongiorno, gestisco un piccolo e-commerce di abbigliamento e vorrei migliorare il posizionamento su Google. Offrite servizi di SEO? Quali risultati posso aspettarmi e in quanto tempo?',
  },
  {
    priority: 'medium',
    category: 'client_request',
    urgency_hours: 48,
    intent: 'Richiesta accesso alle analytics del sito per il reparto marketing',
    ai_summary: 'Richiesta accesso Google Analytics per team marketing',
    ai_suggested_reply: 'Ciao, ho aggiunto marketing@azienda.it come "Lettore" su Google Analytics. Riceverà un\'email di invito da parte di Google — deve accettarla per completare l\'accesso. Fammi sapere se ha problemi. Massimiliano',
    subject: 'Accesso analytics per il marketing',
    body_plain: 'Ciao, il nostro responsabile marketing ha bisogno di accedere alle analytics del sito. Puoi aggiungere il suo account (marketing@azienda.it) come lettore su Google Analytics?',
  },
  {
    priority: 'medium',
    category: 'internal',
    urgency_hours: 24,
    intent: 'Condivisione documenti per revisione contratto di collaborazione',
    ai_summary: 'Invio contratto collaborazione da rivedere prima della call',
    ai_suggested_reply: 'Massimiliano, ho revisionato il contratto. Ho due commenti: all\'art. 4 aggiungerei una clausola di riservatezza più specifica, e all\'art. 7 preferirei un preavviso di 30 giorni anziché 15. Ne parliamo giovedì. Massimiliano',
    subject: 'Contratto collaborazione — revisione',
    body_plain: 'Massimiliano, ti mando in allegato il contratto di collaborazione aggiornato con le modifiche discusse la settimana scorsa. Puoi darci un occhio prima della call di giovedì?',
  },
  {
    priority: 'medium',
    category: 'support',
    urgency_hours: 48,
    intent: 'Richiesta backup dei dati del sito prima della migrazione',
    ai_summary: 'Richiesta backup completo prima migrazione hosting',
    ai_suggested_reply: 'Certo, eseguo il backup completo (database + file + configurazioni) entro domani mattina e ti invio il link al drive sicuro. Stima circa 2-3 GB. Possiamo procedere con la migrazione da giovedì. Massimiliano',
    subject: 'Backup dati prima migrazione hosting',
    body_plain: 'Prima di procedere con la migrazione al nuovo hosting, vogliamo assicurarci di avere un backup completo di tutto. Database, file, configurazioni. Quando puoi farlo?',
  },
  {
    priority: 'medium',
    category: 'client_request',
    urgency_hours: 72,
    intent: 'Cliente richiede implementazione cookie banner conforme GDPR',
    ai_summary: 'Richiesta implementazione cookie banner GDPR-compliant',
    ai_suggested_reply: 'Ciao Massimiliano, posso implementare un cookie banner conforme GDPR (consenso granulare, rifiuto totale, registro consensi) entro la settimana. Stima 1 giorno di lavoro, €300. Procedo? Massimiliano',
    subject: 'Cookie banner GDPR — quando lo implementiamo?',
    body_plain: 'Ciao Massimiliano, il nostro legale ci ha segnalato che il cookie banner attuale non è conforme al GDPR. Dobbiamo sistemarlo. Quando potresti lavorarci? È urgente dal punto di vista legale.',
  },
  {
    priority: 'medium',
    category: 'sales_lead',
    urgency_hours: 120,
    intent: 'Richiesta di collaborazione per progetto lungo termine',
    ai_summary: 'Proposta collaborazione continuativa per startup fintech',
    ai_suggested_reply: 'Salve, sono interessato a valutare la proposta. Attualmente ho disponibilità di circa 3 giorni/settimana. Possiamo fissare una call la prossima settimana per discutere lo scope, le tecnologie e le condizioni economiche? Cordiali saluti, Massimiliano',
    subject: 'Proposta collaborazione continuativa',
    body_plain: 'Salve, siamo una startup fintech in fase di crescita e stiamo cercando uno sviluppatore affidabile per una collaborazione continuativa di almeno 12 mesi. Sarebbe interessato a valutare una proposta?',
  },
  {
    priority: 'medium',
    category: 'notification',
    urgency_hours: 48,
    intent: 'Notifica rinnovo dominio in scadenza tra 30 giorni',
    ai_summary: 'Dominio azienda.it in scadenza tra 30 giorni',
    ai_suggested_reply: 'Grazie per il promemoria. Ho rinnovato il dominio per 2 anni — la conferma arriverà via email entro 24 ore. Avviso il cliente. Massimiliano',
    subject: 'Rinnovo dominio — scadenza tra 30 giorni',
    body_plain: 'Il dominio azienda.it è in scadenza il 15 del mese prossimo. Si prega di rinnovarlo o di comunicarci se si desidera procedere con la dismissione.',
  },
  {
    priority: 'medium',
    category: 'client_request',
    urgency_hours: 48,
    intent: 'Richiesta modifica colori e logo sul sito dopo rebranding',
    ai_summary: 'Aggiornamento branding sito: nuovi colori e logo post-rebranding',
    ai_suggested_reply: 'Ciao! Perfetto, manda pure tutti gli asset (logo SVG/PNG, palette colori HEX, font). Stimo 2-3 giorni per aggiornare tutto il sito. Posso iniziare la prossima settimana. Massimiliano',
    subject: 'Aggiornamento branding sito web',
    body_plain: 'Ciao! Abbiamo completato il nostro rebranding aziendale. Ti mando i nuovi asset (logo, colori, font). Potresti aggiornare il sito con il nuovo brand? Non ci sono urgenze particolari ma prima è meglio.',
  },
  {
    priority: 'medium',
    category: 'support',
    urgency_hours: 24,
    intent: 'Richiesta installazione certificato SSL su nuovo dominio',
    ai_summary: 'Installazione SSL richiesta su dominio staging.azienda.it',
    ai_suggested_reply: 'Buongiorno, ho installato il certificato SSL su staging.azienda.it — il sito ora mostra il lucchetto verde. Se vedi ancora l\'avviso, prova a svuotare la cache del browser. Massimiliano',
    subject: 'SSL su dominio staging',
    body_plain: 'Buongiorno, abbiamo aggiunto il dominio staging.azienda.it ma manca il certificato SSL. Il browser mostra "connessione non sicura". Puoi installarlo?',
  },
  {
    priority: 'medium',
    category: 'client_request',
    urgency_hours: 96,
    intent: 'Richiesta di formazione sull\'uso del CMS per il team interno',
    ai_summary: 'Sessione formazione CMS richiesta per team editoriale',
    ai_suggested_reply: 'Ciao Massimiliano, certo! Posso fare una sessione di 2 ore in videochiamata per il vostro team. Stimo €200 per la formazione. Quale settimana preferite? Vi preparo anche una guida PDF di riferimento. Massimiliano',
    subject: 'Formazione CMS per il nostro team',
    body_plain: 'Ciao Massimiliano, il nostro team editoriale ha difficoltà a usare il CMS. Potresti fare una sessione di formazione di un paio d\'ore? Siamo circa in 5 persone.',
  },
  {
    priority: 'medium',
    category: 'sales_lead',
    urgency_hours: 72,
    intent: 'Richiesta demo della piattaforma prima di decidere l\'acquisto',
    ai_summary: 'Richiesta demo per valutazione acquisto gestionale',
    ai_suggested_reply: 'Buongiorno, sono felice di mostrare una demo del gestionale. Possiamo fissare una call di 45 minuti questa settimana — le mostro le funzionalità core per team da 25 persone. Martedì o mercoledì va bene? Cordiali saluti, Massimiliano',
    subject: 'Richiesta demo gestionale',
    body_plain: 'Buongiorno, stiamo valutando l\'adozione di un nuovo gestionale per la nostra azienda. Siamo 25 dipendenti. Potrebbe mostrarci una demo della piattaforma prima di prendere una decisione?',
  },
  {
    priority: 'medium',
    category: 'internal',
    urgency_hours: 48,
    intent: 'Invio credenziali accesso per nuovo ambiente di staging',
    ai_summary: 'Credenziali ambiente staging pronte per test QA',
    ai_suggested_reply: 'Ottimo, iniziamo i test QA da oggi. Ho trovato un problema minore sul form di login mobile — apro una issue su Jira e procedo con gli altri scenari. Aggiornamento entro venerdì. Massimiliano',
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
    ai_suggested_reply: 'Interessante numero! L\'articolo sul cloud ibrido è molto pertinente ai progetti su cui sto lavorando. Grazie per la curation. Massimiliano',
    subject: 'TechItalia Newsletter — Novembre 2024',
    body_plain: 'Le ultime novità dal mondo tech: l\'AI generativa continua a crescere, il cloud ibrido è il nuovo standard e le startup italiane raccolgono record di investimenti. Leggi il sommario completo...',
  },
  {
    priority: 'low',
    category: 'notification',
    urgency_hours: 168,
    intent: 'Notifica automatica: nuovo commento sul blog aziendale',
    ai_summary: 'Nuovo commento approvato sul post "Come scegliere un CMS"',
    ai_suggested_reply: 'Grazie per il commento pertinente, mario.b! Ho approvato e pubblicato la sua risposta. Spero il post le sia stato utile. Massimiliano',
    subject: 'Nuovo commento sul tuo blog',
    body_plain: 'L\'utente mario.b ha lasciato un commento sul post "Come scegliere il CMS giusto per il tuo business". Il commento è in attesa di approvazione. Clicca qui per moderarlo.',
  },
  {
    priority: 'low',
    category: 'newsletter',
    urgency_hours: 168,
    intent: 'Digest settimanale di Product Hunt',
    ai_summary: 'Product Hunt Weekly: top 10 prodotti della settimana',
    ai_suggested_reply: 'Grazie per il digest settimanale! L\'AI writing assistant sembra interessante — lo proverò questa settimana. Massimiliano',
    subject: 'Product Hunt — Top Products This Week',
    body_plain: 'This week\'s top products: 1. AI writing assistant with 2k upvotes 2. Design system generator 3. No-code API builder... See all 10 products from this week.',
  },
  {
    priority: 'low',
    category: 'other',
    urgency_hours: 168,
    intent: 'Richiesta di collegamento su LinkedIn',
    ai_summary: 'Richiesta collegamento LinkedIn da sviluppatore junior',
    ai_suggested_reply: 'Buongiorno, grazie per aver trovato il mio profilo! È sempre un piacere connettersi con professionisti interessati all\'AI/ML. Accetto con piacere. Se ha domande sul settore, non esiti a scrivere. Massimiliano',
    subject: 'Richiesta di collegamento — LinkedIn',
    body_plain: 'Buongiorno Massimiliano, ho visto il suo profilo LinkedIn e il suo lavoro nel campo AI/ML mi ha molto interessato. Sarei felice di connettermi. Cordiali saluti.',
  },
  {
    priority: 'low',
    category: 'notification',
    urgency_hours: 72,
    intent: 'Riepilogo mensile utilizzo servizi cloud',
    ai_summary: 'Report mensile AWS: costo totale €234, nessuna anomalia',
    ai_suggested_reply: 'Report ricevuto. Costi nella norma, nessuna anomalia. Valuto di ottimizzare le istanze EC2 il mese prossimo per ridurre i costi del 10-15%. Massimiliano',
    subject: 'Riepilogo mensile AWS — Ottobre 2024',
    body_plain: 'Il tuo riepilogo AWS di ottobre: EC2 €89, RDS €67, S3 €34, CloudFront €44. Totale: €234. Nessuna risorsa anomala rilevata. Il budget mensile è rispettato.',
  },
  {
    priority: 'low',
    category: 'newsletter',
    urgency_hours: 168,
    intent: 'Newsletter su design e UX con articoli selezionati',
    ai_summary: 'UX Weekly: articoli su design system e accessibilità',
    ai_suggested_reply: 'Numero ottimo questa settimana! L\'articolo sull\'accessibilità è fondamentale — spesso sottovalutato nei progetti di piccole aziende. Continuo a seguire. Massimiliano',
    subject: 'UX Weekly — Design Systems & A11y',
    body_plain: 'Questa settimana: un deep-dive sui design system scalabili, 5 errori comuni di accessibilità e come evitarli, e un\'intervista al team di design di Figma.',
  },
  {
    priority: 'low',
    category: 'other',
    urgency_hours: 168,
    intent: 'Invito a partecipare a una survey sul freelancing in Italia',
    ai_summary: 'Invito survey: condizioni freelance in Italia 2024',
    ai_suggested_reply: 'Survey completata! Molto interessante l\'approccio sulle condizioni contrattuali. Aspetto il report con curiosità. Massimiliano',
    subject: 'Partecipa alla survey: Freelancing Italia 2024',
    body_plain: 'Stai lavorando come freelance? Partecipa alla nostra survey annuale sul freelancing in Italia. Solo 5 minuti e riceverai il report completo in anteprima. Scadenza: fine mese.',
  },
  {
    priority: 'low',
    category: 'notification',
    urgency_hours: 168,
    intent: 'Conferma iscrizione a webinar su Next.js 15',
    ai_summary: 'Conferma iscrizione webinar Next.js 15 — 20 novembre ore 18',
    ai_suggested_reply: 'Grazie per la conferma! Ho aggiunto il webinar al calendario. Non vedo l\'ora di scoprire le novità di Next.js 15 — soprattutto le migliorie al caching. Massimiliano',
    subject: 'Conferma iscrizione webinar Next.js 15',
    body_plain: 'Sei iscritto al webinar "Next.js 15: novità e best practice" del 20 novembre alle 18:00. Riceverai il link Zoom 30 minuti prima dell\'inizio. Aggiungi al calendario.',
  },
  {
    priority: 'low',
    category: 'other',
    urgency_hours: 168,
    intent: 'Auguri di compleanno da un vecchio collega',
    ai_summary: 'Messaggio personale: auguri compleanno da ex-collega',
    ai_suggested_reply: 'Ciao! Grazie mille, fa sempre piacere ricevere i tuoi messaggi. Sì, è un po\' che non ci sentiamo — prendiamoci un caffè la settimana prossima? Ti scrivo. Massimiliano',
    subject: 'Buon compleanno! 🎂',
    body_plain: 'Ciao Massimiliano! Ho visto che oggi è il tuo compleanno. Tanti auguri! Come stai? Ci siamo persi di vista dall\'ultima conferenza. Magari ci prendiamo un caffè?',
  },
  {
    priority: 'low',
    category: 'newsletter',
    urgency_hours: 168,
    intent: 'Newsletter settimanale GitHub con trending repository',
    ai_summary: 'GitHub Trending Weekly: top repo JS e Python della settimana',
    ai_suggested_reply: 'Ottima selezione questa settimana! shadcn/ui è diventato il mio go-to per i progetti React — qualità incredibile. Da tenere d\'occhio. Massimiliano',
    subject: 'GitHub Trending — Week of Nov 2024',
    body_plain: 'Top trending repositories this week: 1. shadcn/ui (45k stars) 2. microsoft/TypeScript 3. vercel/next.js... See the full list with summaries and contributors.',
  },
]

const SPAM_EMAILS: EmailSpec[] = [
  {
    priority: 'spam',
    category: 'other',
    urgency_hours: 0,
    intent: 'Tentativo di phishing con offerta lavoro falsa',
    ai_summary: 'Spam: offerta lavoro falsa con richiesta dati personali',
    ai_suggested_reply: 'Questo è spam. Nessuna risposta necessaria — segnalato e archiviato.',
    subject: 'Offerta di lavoro esclusiva per lei!!!',
    body_plain: 'Gentile utente, la sua candidatura è stata ACCETTATA per la posizione di REMOTE WORKER con stipendio €5000/mese. Inviare IMMEDIATAMENTE nome, codice fiscale e IBAN per procedere. Non perdere questa OPPORTUNITÀ UNICA!',
  },
  {
    priority: 'spam',
    category: 'other',
    urgency_hours: 0,
    intent: 'Email marketing non richiesta per prodotti farmaceutici',
    ai_summary: 'Spam farmaceutico non richiesto',
    ai_suggested_reply: 'Questo è spam. Nessuna risposta necessaria — segnalato e archiviato.',
    subject: 'Farmaci senza ricetta — prezzi imbattibili!!!',
    body_plain: 'Acquista ora i migliori farmaci senza ricetta al 70% di sconto. Consegna discreta in 24h. Clicca qui per il catalogo completo. Offerta valida solo oggi!',
  },
  {
    priority: 'spam',
    category: 'other',
    urgency_hours: 0,
    intent: 'Truffa Nigerian Prince con richiesta trasferimento denaro',
    ai_summary: 'Truffa classica 419: eredità da trasferire',
    ai_suggested_reply: 'Questo è spam. Nessuna risposta necessaria — segnalato e archiviato.',
    subject: 'CONFIDENTIAL BUSINESS PROPOSAL',
    body_plain: 'Dear Friend, I am Dr. Emmanuel Okonkwo, lawyer to late Mr. James who died without heirs. He left $15.5 MILLION USD. I need your assistance to transfer these funds. You will receive 40%. Reply URGENT.',
  },
  {
    priority: 'spam',
    category: 'other',
    urgency_hours: 0,
    intent: 'Tentativo di phishing fingendosi l\'Agenzia delle Entrate',
    ai_summary: 'Phishing: falsa comunicazione Agenzia delle Entrate',
    ai_suggested_reply: 'Questo è spam. Nessuna risposta necessaria — segnalato e archiviato.',
    subject: 'Comunicazione Agenzia delle Entrate — AZIONE RICHIESTA',
    body_plain: 'L\'Agenzia delle Entrate ha rilevato un ERRORE nella sua dichiarazione dei redditi. Per evitare sanzioni, CLICCHI QUI entro 24 ore per verificare la sua posizione fiscale e aggiornare i suoi dati.',
  },
  {
    priority: 'spam',
    category: 'newsletter',
    urgency_hours: 0,
    intent: 'Pubblicità non richiesta per servizio SEO garantito',
    ai_summary: 'Spam SEO: promesse irrealistiche di posizionamento garantito',
    ai_suggested_reply: 'Questo è spam. Nessuna risposta necessaria — segnalato e archiviato.',
    subject: 'Porta il tuo sito in PRIMA PAGINA GOOGLE garantito!',
    body_plain: 'Siamo i leader del SEO italiano! Ti portiamo in PRIMA PAGINA GOOGLE in 30 GIORNI o RIMBORSO TOTALE! Centinaia di clienti soddisfatti. Offerta lancio: solo €99/mese. Scrivi ora!',
  },
]

const SUPPORT_SENDERS = [
  { name: 'Customer Alice', address: 'alice@customer.io' },
  { name: 'Bob Support', address: 'bob@helpdesk.com' },
  { name: 'Zendesk', address: 'noreply@zendesk.com' },
  { name: 'Diana User', address: 'diana@client-company.com' },
  { name: 'Eric Complaint', address: 'eric@angry-customer.net' },
]

const SUPPORT_EMAILS: EmailSpec[] = [
  { priority: 'high', category: 'support', urgency_hours: 2, intent: 'Cliente segnala impossibilità di accedere all\'account dopo aggiornamento', ai_summary: 'Login bloccato post-aggiornamento — cliente enterprise', ai_suggested_reply: 'Sto guardando il problema adesso. Invio il link di reset manuale entro 5 minuti. Massimiliano', subject: '[Ticket #4821] Impossibile accedere — account bloccato', body_plain: 'Buongiorno, da questa mattina non riesco ad accedere al mio account. La pagina di login rimane in caricamento infinito. Ho provato su Chrome e Firefox. È urgente perché devo completare un ordine.' },
  { priority: 'high', category: 'support', urgency_hours: 4, intent: 'Bug critico: ordine confermato ma merce non spedita da 5 giorni', ai_summary: 'Ordine #ORD-20241104 confermato ma mai spedito — cliente furibondo', ai_suggested_reply: 'Mi scuso per il disservizio. Ho verificato: l\'ordine è stato confermato ma non processato nel magazzino. Provvedo a spedizione prioritaria oggi stesso con tracking. Massimiliano', subject: '[Ticket #4890] Ordine non spedito dopo 5 giorni', body_plain: 'Ho effettuato un ordine 5 giorni fa (ORD-20241104) e ho ricevuto la conferma ma ancora nessuna spedizione. Ho inviato 3 email senza risposta. Voglio un rimborso o la spedizione immediata.' },
  { priority: 'high', category: 'support', urgency_hours: 2, intent: 'Doppio addebito su carta di credito — richiesta rimborso urgente', ai_summary: 'Addebito duplicato €89 — rimborso urgente richiesto', ai_suggested_reply: 'Ho verificato: risultano 2 transazioni di €89 il 3/11. Il rimborso di €89 è stato avviato e arriverà entro 3-5 giorni lavorativi. Mi scuso per il disagio. Massimiliano', subject: '[Ticket #4901] Addebito doppio — RIMBORSO URGENTE', body_plain: 'Sono stata addebitata due volte €89 per lo stesso abbonamento mensile. Ho i riferimenti delle transazioni: TXN-0089334 e TXN-0089341 del 3 novembre. Voglio il rimborso immediato.' },
  { priority: 'medium', category: 'support', urgency_hours: 24, intent: 'Richiesta cambio piano abbonamento da Basic a Pro', ai_summary: 'Upgrade piano: da Basic (€19) a Pro (€49) — da domani', ai_suggested_reply: 'Upgrade effettuato con proratio. Le funzionalità Pro sono già attive. La prossima fattura sarà di €49. Buon lavoro! Massimiliano', subject: '[Ticket #4856] Upgrade piano abbonamento', body_plain: 'Vorrei passare dal piano Basic al piano Pro a partire da questo mese. Come posso procedere? Pagate con carta di credito.' },
  { priority: 'medium', category: 'support', urgency_hours: 36, intent: 'Funzionalità export PDF non funziona da 3 giorni', ai_summary: 'Export PDF rotto da v3.2.0 — 47 ticket aperti sullo stesso problema', ai_suggested_reply: 'Il problema è confermato su v3.2.0 — il fix è in staging e rilascio previsto per domani mattina. Le invio conferma appena è online. Massimiliano', subject: '[Ticket #4834] Export PDF non funziona', body_plain: 'L\'export PDF smesso di funzionare da quando avete fatto l\'aggiornamento 3 giorni fa. Il bottone "Scarica PDF" non fa nulla. Chrome DevTools mostra un errore 500.' },
  { priority: 'medium', category: 'support', urgency_hours: 48, intent: 'Richiesta integrazione API con sistema ERP aziendale', ai_summary: 'Documentazione API richiesta per integrazione SAP', ai_suggested_reply: 'La documentazione completa delle API è su docs.angel1.dev/api/v2. Per integrazioni SAP consiglio il webhook /events. Resto disponibile per una call tecnica. Massimiliano', subject: '[Ticket #4812] API integration docs', body_plain: 'Our IT team needs the complete API documentation to integrate your platform with our SAP ERP. Specifically we need webhooks for order events and the authentication flow.' },
  { priority: 'medium', category: 'support', urgency_hours: 24, intent: 'Password dimenticata — email reset non arriva', ai_summary: 'Email reset password non ricevuta — dominio aziendale blocca', ai_suggested_reply: 'Il suo dominio @bigfirm.eu ha filtri anti-spam aggressivi. Ho aggiunto l\'indirizzo IP di invio alla whitelist — riprovi il reset adesso. Massimiliano', subject: '[Ticket #4867] Reset password — email non ricevuta', body_plain: 'Ho cliccato su "Password dimenticata" 3 volte ma non ricevo nessuna email. Ho controllato spam e cestino. Il mio indirizzo è diana.user@bigfirm.eu' },
  { priority: 'low', category: 'support', urgency_hours: 72, intent: 'Richiesta fattura in formato XML per contabilità', ai_summary: 'Richiesta fattura XML (formato SDI) — 3 fatture periodo luglio-settembre', ai_suggested_reply: 'Ho generato le 3 fatture in formato XML SDI e le ho allegate. Se ha bisogno di altri periodi, scriva pure. Massimiliano', subject: '[Ticket #4799] Fatture in formato XML', body_plain: 'Per la nostra contabilità abbiamo bisogno delle fatture del periodo luglio-settembre in formato XML (Sistema di Interscambio). Potete inviarle?' },
  { priority: 'low', category: 'support', urgency_hours: 96, intent: 'Richiesta aggiunta nuovo utente al team aziendale', ai_summary: 'Nuovo utente da aggiungere: carlo.verdi@company.it — ruolo Viewer', ai_suggested_reply: 'Utente carlo.verdi@company.it aggiunto con ruolo Viewer. Riceverà l\'invito via email. Massimiliano', subject: '[Ticket #4778] Aggiunta utente al team', body_plain: 'Dobbiamo aggiungere un nuovo collaboratore al nostro account team: carlo.verdi@company.it — ruolo: sola lettura (Viewer). Può procedere?' },
  { priority: 'low', category: 'notification', urgency_hours: 168, intent: 'Survey soddisfazione cliente post-risoluzione ticket', ai_summary: 'CSAT survey: cliente ha valutato 5/5 la risoluzione ticket #4756', ai_suggested_reply: '', subject: 'CSAT Survey Completed — Ticket #4756', body_plain: 'A customer has completed the satisfaction survey for Ticket #4756. Rating: 5/5 ⭐. Comment: "Risolto rapidamente e con professionalità. Ottimo supporto!"' },
]

// Extra emails for work account (account-002) — different senders/subjects
const WORK_SENDERS = [
  { name: 'Sofia Gallo', address: 'sofia@enterprise-client.com' },
  { name: 'Roberto Ferri', address: 'roberto@bigcorp.com' },
  { name: 'Valeria Longo', address: 'valeria@investor.vc' },
  { name: 'Davide Serra', address: 'd.serra@partnerfirm.it' },
  { name: 'Slack', address: 'feedback@slack.com' },
]

const WORK_EMAILS: EmailSpec[] = [
  { priority: 'high', category: 'client_request', urgency_hours: 3, intent: 'Enterprise client richiede SLA firmato entro domani', ai_summary: 'SLA urgente da firmare — enterprise client', ai_suggested_reply: 'Ricevuto. Invio il documento firmato entro questa sera. Massimiliano', subject: 'SLA Agreement — firma urgente', body_plain: 'Massimiliano, il nostro legal team ha bisogno del SLA firmato entro domani per attivare il contratto enterprise. Puoi procedere oggi?' },
  { priority: 'high', category: 'sales_lead', urgency_hours: 6, intent: 'VC interessato a investire nella piattaforma', ai_summary: 'Investor call richiesta — seed round €500k', ai_suggested_reply: 'Grazie per l\'interesse! Sono disponibile per una call questa settimana. Mi manda i suoi slot disponibili? Massimiliano', subject: 'Interesse investimento — Angel1 Platform', body_plain: 'Salve, abbiamo analizzato la vostra piattaforma e siamo interessati a discutere un possibile investimento seed. Budget indicativo €500k. Possiamo organizzare una call?' },
  { priority: 'high', category: 'support', urgency_hours: 2, intent: 'API down per enterprise client in produzione', ai_summary: 'API endpoint /v2/classify down — enterprise production', ai_suggested_reply: 'Sto investigando adesso — stimo risoluzione entro 20 minuti. Vi tengo aggiornati ogni 5 minuti. Massimiliano', subject: 'CRITICAL: API down in production', body_plain: 'Your API endpoint /v2/classify is returning 503 since 10 minutes. We have 50k requests queued. Please fix ASAP.' },
  { priority: 'medium', category: 'client_request', urgency_hours: 48, intent: 'Revisione Q4 roadmap product', ai_summary: 'Review roadmap Q4 con partner — call giovedì', ai_suggested_reply: 'Confermato per giovedì alle 14:00. Ho aggiornato la roadmap con i punti discussi. La condivido prima della call. Massimiliano', subject: 'Q4 Roadmap Review — giovedì 14:00', body_plain: 'Ciao, per la nostra call di giovedì vorrei rivedere la roadmap Q4 e discutere le priorità per il lancio di gennaio.' },
  { priority: 'medium', category: 'invoice', urgency_hours: 72, intent: 'Richiesta fattura mensile enterprise', ai_summary: 'Fattura mensile enterprise — €8.400', ai_suggested_reply: 'La fattura per novembre è allegata — totale €8.400 per licenze enterprise + supporto dedicato. Buona giornata! Massimiliano', subject: 'Fattura mensile Novembre — Enterprise', body_plain: 'Gentile Massimiliano, potete inviarci la fattura per il mese di novembre? Include licenze e supporto dedicato.' },
  { priority: 'medium', category: 'sales_lead', urgency_hours: 96, intent: 'Richiesta partnership go-to-market', ai_summary: 'Proposta partnership GTM con firma di consulenza internazionale', ai_suggested_reply: 'Buongiorno, la proposta è interessante. Possiamo fissare una call la prossima settimana per definire i termini? Cordiali saluti, Massimiliano', subject: 'Partnership proposal — Go-to-Market', body_plain: 'Dear Massimiliano, we are interested in a go-to-market partnership for the EMEA region. Could we schedule a call to discuss terms?' },
  { priority: 'medium', category: 'internal', urgency_hours: 24, intent: 'Onboarding nuovo developer — accessi da configurare', ai_summary: 'Setup accessi per nuovo developer Luca — team Angel1', ai_suggested_reply: 'Fatto! Luca ha accesso a GitHub, Slack, Linear e staging. Ho inviato le credenziali al suo indirizzo work. Massimiliano', subject: 'Onboarding Luca — accessi account', body_plain: 'Ciao, Luca inizia lunedì. Può configurare gli accessi a GitHub, Slack, Linear e l\'ambiente staging prima di allora?' },
  { priority: 'low', category: 'notification', urgency_hours: 168, intent: 'Report mensile utilizzo piattaforma — ottobre', ai_summary: 'Platform usage report ottobre: 12k API calls, 99.8% uptime', ai_suggested_reply: '', subject: 'Monthly Usage Report — October', body_plain: 'October platform report: 12,450 API calls processed. Average response time: 340ms. Uptime: 99.8%. Top endpoint: /classify (67%).' },
  { priority: 'low', category: 'newsletter', urgency_hours: 168, intent: 'Newsletter settimanale Y Combinator', ai_summary: 'YC Newsletter: startup trends e fundraising tips', ai_suggested_reply: '', subject: 'YC Weekly — Startup Insights', body_plain: 'This week at YC: how to structure your seed round, the best metrics to track pre-product-market fit, and founder stories from W24 batch.' },
  { priority: 'low', category: 'other', urgency_hours: 168, intent: 'Congratulazioni per award "Best AI Startup Italy"', ai_summary: 'Award nomination: Best AI Startup Italy 2024', ai_suggested_reply: 'Grazie mille! È un riconoscimento che motiva tutto il team. Massimiliano', subject: 'Congratulazioni — Best AI Startup Italy 2024', body_plain: 'Carissimo Massimiliano, è con grande piacere che le comunichiamo la nomination di Angel1 tra le "Best AI Startup Italy 2024". Complimenti a tutto il team!' },
  { priority: 'medium', category: 'client_request', urgency_hours: 48, intent: 'White-label richiesta per licenza piattaforma', ai_summary: 'Richiesta white-label licensing per startup francese', ai_suggested_reply: 'Bonjour! Merci pour votre intérêt. Nous proposons des licences white-label à partir de €2.000/mois. Je vous envoie les détails. Massimiliano', subject: 'White-label licensing inquiry', body_plain: 'Bonjour, nous sommes une startup française et nous aimerions utiliser votre plateforme en marque blanche. Quelles sont les conditions?' },
  { priority: 'medium', category: 'support', urgency_hours: 36, intent: 'Webhook non riceve eventi dopo aggiornamento', ai_summary: 'Webhook events non arrivano dopo deploy v2.3.1', ai_suggested_reply: 'Identificato il problema: il deploy v2.3.1 ha cambiato il formato del payload. Sto rilasciando il fix v2.3.2 entro 30 minuti. Massimiliano', subject: 'Webhook events not received — v2.3.1', body_plain: 'Since the v2.3.1 update, our webhook is not receiving events. We checked our endpoint and it\'s working fine. The issue seems to be on your side.' },
  { priority: 'high', category: 'client_request', urgency_hours: 4, intent: 'Scadenza demo per board meeting domani', ai_summary: 'Demo enterprise richiesta per board — domani 9:00', ai_suggested_reply: 'Preparerò una demo personalizzata stanotte. Domani alle 9:00 sarò pronto. Mi confermate gli use case prioritari? Massimiliano', subject: 'Board demo tomorrow 9am — URGENT', body_plain: 'Massimiliano, we have a board meeting tomorrow at 9am and need a full product demo ready. Can you prepare a custom demo for our use case?' },
  { priority: 'low', category: 'notification', urgency_hours: 168, intent: 'Conferma iscrizione conferenza Tech Leaders 2025', ai_summary: 'Iscrizione confermata — Tech Leaders Summit 2025', ai_suggested_reply: '', subject: 'Registration confirmed — Tech Leaders Summit 2025', body_plain: 'Your registration for Tech Leaders Summit 2025 (Milan, March 15-16) is confirmed. Speaker lineup and schedule will be announced in January.' },
  { priority: 'medium', category: 'client_request', urgency_hours: 72, intent: 'Richiesta caso studio per marketing', ai_summary: 'Case study richiesto — successo implementazione AI triage', ai_suggested_reply: 'Certo! Possiamo pubblicare un case study anonimizzato. Vi mando un questionario di 10 domande così raccogliamo i dati chiave. Massimiliano', subject: 'Case study collaboration', body_plain: 'Dear Massimiliano, we would love to create a case study about our success with your platform. Would you be interested in co-publishing it?' },
]

async function seed() {
  process.stdout.write('Seeding mock data for test@angel1.dev...\n')

  // First delete existing emails for this mock user (idempotent re-run)
  const { error: deleteError } = await supabase
    .from('emails')
    .delete()
    .eq('user_id', USER_ID)
  if (deleteError) {
    process.stderr.write(`Warning: could not delete existing emails: ${deleteError.message}\n`)
  }

  // Upsert gmail_accounts
  const { error: accountsError } = await supabase.from('gmail_accounts').upsert([
    {
      id: ACCOUNT_PRIMARY,
      user_id: USER_ID,
      email_address: 'massi@angel1.dev',
      display_name: 'Massi Angelone',
      is_primary: true,
    },
    {
      id: ACCOUNT_WORK,
      user_id: USER_ID,
      email_address: 'work@angel1.dev',
      display_name: 'Angel1 Work',
      is_primary: false,
    },
    {
      id: ACCOUNT_SUPPORT,
      user_id: USER_ID,
      email_address: 'support@angel1.dev',
      display_name: 'Angel1 Support',
      is_primary: false,
    },
  ], { onConflict: 'user_id,email_address' })
  if (accountsError) {
    process.stderr.write(`Warning: could not upsert gmail_accounts: ${accountsError.message}\n`)
  } else {
    process.stdout.write('gmail_accounts rows upserted (3 accounts)\n')
  }

  const { error: settingsError } = await supabase.from('users_settings').upsert({
    user_id: USER_ID,
    email_address: USER_ID,
    google_refresh_token: null,
    classification_rules: [],
    active_account_id: ACCOUNT_PRIMARY,
  })
  if (settingsError) {
    process.stderr.write(`Failed to upsert users_settings: ${settingsError.message}\n`)
    process.exit(1)
  }
  process.stdout.write('users_settings row created (active_account_id = account-001)\n')

  // Primary account emails: 10 high + 15 medium + 8 low + 2 spam = 35
  const primaryEmails = [
    ...HIGH_EMAILS,
    ...MEDIUM_EMAILS,
    ...LOW_EMAILS.slice(0, 8),
    ...SPAM_EMAILS.slice(0, 2),
  ]

  const primaryRows = primaryEmails.map((spec, i) => {
    const sender = randomFrom(SENDERS)
    return {
      user_id: USER_ID,
      account_id: ACCOUNT_PRIMARY,
      gmail_message_id: `mock-primary-${i + 1}-${Date.now()}`,
      thread_id: `thread-primary-${i + 1}`,
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
      ai_suggested_reply: spec.ai_suggested_reply,
      is_processed: true,
      is_handled: false,
    }
  })

  // Work account emails: 15 total
  const workRows = WORK_EMAILS.map((spec, i) => {
    const sender = randomFrom(WORK_SENDERS)
    return {
      user_id: USER_ID,
      account_id: ACCOUNT_WORK,
      gmail_message_id: `mock-work-${i + 1}-${Date.now()}`,
      thread_id: `thread-work-${i + 1}`,
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
      ai_suggested_reply: spec.ai_suggested_reply,
      is_processed: true,
      is_handled: false,
    }
  })

  // Support account emails: 10 total
  const supportRows = SUPPORT_EMAILS.map((spec, i) => {
    const sender = randomFrom(SUPPORT_SENDERS)
    return {
      user_id: USER_ID,
      account_id: ACCOUNT_SUPPORT,
      gmail_message_id: `mock-support-${i + 1}-${Date.now()}`,
      thread_id: `thread-support-${i + 1}`,
      from_address: sender.address,
      from_name: sender.name,
      subject: spec.subject,
      snippet: spec.body_plain.slice(0, 100),
      body_plain: spec.body_plain,
      received_at: randomDate(14),
      priority: spec.priority,
      category: spec.category,
      urgency_hours: spec.urgency_hours,
      intent: spec.intent,
      ai_summary: spec.ai_summary,
      ai_suggested_reply: spec.ai_suggested_reply,
      is_processed: true,
      is_handled: false,
    }
  })

  const allRows = [...primaryRows, ...workRows, ...supportRows]
  const { error: emailsError } = await supabase.from('emails').insert(allRows)
  if (emailsError) {
    process.stderr.write(`Failed to insert emails: ${emailsError.message}\n`)
    process.exit(1)
  }

  const primaryHigh = primaryEmails.filter(e => e.priority === 'high').length
  const primaryMedium = primaryEmails.filter(e => e.priority === 'medium').length
  const primaryLow = primaryEmails.filter(e => e.priority === 'low').length
  const primarySpam = primaryEmails.filter(e => e.priority === 'spam').length
  const workHigh = WORK_EMAILS.filter(e => e.priority === 'high').length
  const workMedium = WORK_EMAILS.filter(e => e.priority === 'medium').length
  const workLow = WORK_EMAILS.filter(e => e.priority === 'low').length
  const workSpam = WORK_EMAILS.filter(e => e.priority === 'spam').length
  const supportHigh = SUPPORT_EMAILS.filter(e => e.priority === 'high').length
  const supportMedium = SUPPORT_EMAILS.filter(e => e.priority === 'medium').length
  const supportLow = SUPPORT_EMAILS.filter(e => e.priority === 'low').length
  const supportSpam = SUPPORT_EMAILS.filter(e => e.priority === 'spam').length

  process.stdout.write(`\nInserted ${allRows.length} total emails:\n`)
  process.stdout.write(`  account-001 (massi@angel1.dev):    ${primaryRows.length} emails — ${primaryHigh}H ${primaryMedium}M ${primaryLow}L ${primarySpam}S\n`)
  process.stdout.write(`  account-002 (work@angel1.dev):     ${workRows.length} emails — ${workHigh}H ${workMedium}M ${workLow}L ${workSpam}S\n`)
  process.stdout.write(`  account-003 (support@angel1.dev):  ${supportRows.length} emails — ${supportHigh}H ${supportMedium}M ${supportLow}L ${supportSpam}S\n`)
  process.stdout.write('\nDone! Open http://localhost:3000/app to test.\n')
}

seed()
