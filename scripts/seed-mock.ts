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
      gmail_message_id: `mock-${i + 1}-${Date.now()}`,
      thread_id: `thread-mock-${i + 1}`,
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

  const { error: emailsError } = await supabase.from('emails').insert(rows)
  if (emailsError) {
    process.stderr.write(`Failed to insert emails: ${emailsError.message}\n`)
    process.exit(1)
  }

  process.stdout.write(`Inserted ${rows.length} emails (${HIGH_EMAILS.length} high / ${MEDIUM_EMAILS.length} medium / ${LOW_EMAILS.length} low / ${SPAM_EMAILS.length} spam)\n`)
  process.stdout.write('Done! Open http://localhost:3000/app to test.\n')
}

seed()
