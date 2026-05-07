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

type Priority = 'high' | 'medium' | 'low' | 'spam'
type Category = 'client_request' | 'sales_lead' | 'internal' | 'newsletter' | 'notification' | 'support' | 'invoice' | 'other'

interface EmailSpec {
  from_name: string
  from_address: string
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

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ACCOUNT 1 — massi@angel1.dev — 35 email IT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const PRIMARY_HIGH: EmailSpec[] = [
  {
    from_name: 'Marco Ferretti',
    from_address: 'marco.ferretti@nextweb.it',
    priority: 'high',
    category: 'client_request',
    urgency_hours: 2,
    intent: 'Cliente richiede fix urgente bug checkout e-commerce con perdita €800/h',
    ai_summary: 'Bug critico checkout, perdita €800/h, budget €500-1000',
    ai_suggested_reply: 'Ciao Marco, ho ricevuto il tuo messaggio e capisco l\'urgenza della situazione. Sono disponibile ad analizzare il problema immediatamente. Puoi condividere l\'accesso al repository e i log degli errori? Stima preliminare: 2-4 ore di lavoro per identificare e risolvere il problema. Ti ricontatto entro 30 minuti. Massimiliano',
    subject: 'Bug critico in produzione — checkout non funziona',
    body_plain: 'Ciao Massimiliano, stiamo avendo un problema serio sul nostro e-commerce. Il processo di checkout si blocca dopo l\'inserimento della carta. Perdiamo circa €800/ora di vendite. Hai disponibilità immediata? Budget disponibile per fix urgente: €500-1000.',
  },
  {
    from_name: 'Giulia Marchetti',
    from_address: 'g.marchetti@startuplab.io',
    priority: 'high',
    category: 'sales_lead',
    urgency_hours: 24,
    intent: 'Lead caldo con budget definito per AI integration su SaaS B2B',
    ai_summary: 'Proposta integrazione AI documenti, €8k budget, 6 settimane',
    ai_suggested_reply: 'Buongiorno Giulia, grazie per avermi contattato. Il progetto che descrive è esattamente il tipo di lavoro in cui mi specializzo — classificazione documenti con AI è uno dei miei core service. Sono disponibile per una call giovedì o venerdì pomeriggio. Nel frattempo, può condividere qualche dettaglio in più sul tipo di documenti e sul volume atteso? Cordiali saluti, Massimiliano',
    subject: 'Proposta collaborazione — AI integration €8k budget',
    body_plain: 'Buongiorno Massimiliano, ho trovato il suo profilo su LinkedIn e sono rimasta colpita dai suoi progetti AI. Stiamo cercando uno sviluppatore per integrare un sistema di classificazione automatica documenti nella nostra piattaforma SaaS B2B. Budget: €8.000, timeline: 6 settimane. È disponibile per una call questa settimana?',
  },
  {
    from_name: 'Luca Conti',
    from_address: 'luca@mediafactory.it',
    priority: 'high',
    category: 'support',
    urgency_hours: 1,
    intent: 'Sito offline dopo deploy, problema ricorrente terza volta questo mese',
    ai_summary: 'Sito offline post-deploy, problema ricorrente',
    ai_suggested_reply: 'Luca, sto guardando subito. Puoi inviarmi le credenziali Vercel o il link ai log di deployment? Recupero il sito e poi analizziamo la causa radice per evitare che si ripeta. Massimiliano',
    subject: 'URGENTE: sito down dopo deploy',
    body_plain: 'Massimiliano, il sito è offline dopo il deploy di stamattina. I clienti non riescono ad accedere. Puoi guardare subito? È la terza volta questo mese.',
  },
  {
    from_name: 'Antonio Russo',
    from_address: 'a.russo@fileni.it',
    priority: 'high',
    category: 'client_request',
    urgency_hours: 48,
    intent: 'Review Q2 con CTO Fileni, richiesta conferma disponibilità',
    ai_summary: 'Review Q2 con CTO Fileni, 15-16 del mese',
    ai_suggested_reply: 'Ciao Antonio, confermo la disponibilità per il 15, preferibilmente nel pomeriggio dalle 14 alle 16. Preparo una presentazione con i KPI del trimestre e le prossime milestone. Serve qualcosa di specifico da includere nell\'agenda? Cordiali saluti, Massimiliano',
    subject: 'Riunione review Q2 — conferma disponibilità',
    body_plain: 'Ciao Massimiliano, come da accordi volevamo organizzare la review trimestrale del progetto. Sei disponibile il 15 o il 16 per una call di 2 ore? Parteciperanno il CTO e il responsabile IT.',
  },
  {
    from_name: 'Sara Bianchi',
    from_address: 'sara.b@investtech.com',
    priority: 'high',
    category: 'sales_lead',
    urgency_hours: 12,
    intent: 'Lead app mobile React Native con budget €12k e avvio immediato',
    ai_summary: 'Lead app mobile React Native, €12k budget',
    ai_suggested_reply: 'Salve Sara, grazie per avermi contattato. Sviluppo React Native con dashboard analytics è esattamente il mio stack principale. Potrei iniziare la prossima settimana. Possiamo fare una call di 30 minuti per definire i requisiti? Cordiali saluti, Massimiliano',
    subject: 'Interesse progetto React Native — timeline?',
    body_plain: 'Salve, abbiamo bisogno di sviluppare un\'app mobile per il nostro gestionale. React Native, iOS e Android, con dashboard analytics. Budget €12k. Quando potrebbe iniziare?',
  },
  {
    from_name: 'Paolo Rinaldi',
    from_address: 'p.rinaldi@pizzerianapoli.it',
    priority: 'high',
    category: 'sales_lead',
    urgency_hours: 8,
    intent: 'Richiesta preventivo landing page per pizzeria con budget €2k',
    ai_summary: 'Preventivo landing page pizzeria, budget €2k, avvio entro 2 settimane',
    ai_suggested_reply: 'Salve Paolo, per una landing page professionale con form prenotazioni e menu digitale stimo €1.800-€2.200, consegna in 10 giorni lavorativi. Posso inviarle un mockup gratuito entro domani per farle vedere la direzione stilistica. La chiamo questo pomeriggio? Massimiliano',
    subject: 'Preventivo sito web — landing page ristorante',
    body_plain: 'Salve, ho una pizzeria a Napoli e voglio finalmente avere un sito web professionale. Ho bisogno di una landing page con il menu, la galleria foto e un form per le prenotazioni. Budget: circa €2000. Quando potrebbe farmi un preventivo?',
  },
  {
    from_name: 'Elena Costa',
    from_address: 'elena@costafashion.it',
    priority: 'high',
    category: 'client_request',
    urgency_hours: 3,
    intent: 'Bug e-commerce: aggiornamento taglie non salvato, clienti ordinano taglie esaurite',
    ai_summary: 'Bug inventario taglie: ordini su stock esaurito, perdita €400',
    ai_suggested_reply: 'Elena, identificato il problema: il webhook Shopify non aggiornava lo stock dopo gli ordini. Ho applicato il fix e riallineato l\'inventario. Verifica che le taglie esaurite siano ora bloccate. Massimiliano',
    subject: 'BUG: clienti ordinano taglie esaurite',
    body_plain: 'Massimiliano, grave problema sul nostro shop: i clienti riescono a ordinare taglie che abbiamo esaurito. Abbiamo già 8 ordini impossibili da evadere e clienti arrabbiati. Dobbiamo risolvere subito!',
  },
  {
    from_name: 'Federica Ruggeri',
    from_address: 'f.ruggeri@pixel.agency',
    priority: 'high',
    category: 'sales_lead',
    urgency_hours: 24,
    intent: 'Agenzia propone partnership white-label per sviluppo clienti enterprise',
    ai_summary: 'Proposta partnership agenzia: sviluppo white-label, 3-4 progetti/anno',
    ai_suggested_reply: 'Ciao Federica, la proposta mi interessa molto. Collaboro già con alcune agenzie in modalità white-label e il modello funziona bene. Possiamo sentirci giovedì? Nel frattempo mi mandi il portfolio dei clienti enterprise per capire meglio lo scope. Massimiliano',
    subject: 'Proposta partnership sviluppo — clienti enterprise',
    body_plain: 'Ciao Massimiliano, siamo un\'agenzia creativa di Milano e stiamo cercando uno sviluppatore affidabile per il nostro team esteso. Gestiamo 3-4 progetti enterprise all\'anno con budget tra €15k-€50k. Ti interessa una collaborazione continuativa?',
  },
  {
    from_name: 'Daniele Greco',
    from_address: 'd.greco@ristotech.it',
    priority: 'high',
    category: 'client_request',
    urgency_hours: 6,
    intent: 'Integrazione API pagamenti Stripe: webhook non riceve eventi ordini',
    ai_summary: 'Webhook Stripe non funziona: ordini non confermati, €2k in sospeso',
    ai_suggested_reply: 'Daniele, il problema è nella firma del webhook — la chiave è stata ruotata su Stripe ma non aggiornata sul server. Fix in deploy adesso. Entro 15 minuti gli ordini si confermeranno. Massimiliano',
    subject: 'URGENTE: pagamenti Stripe non confermati',
    body_plain: 'Massimiliano, abbiamo un problema critico: da stamattina gli ordini completati su Stripe non arrivano come "confermati" nel gestionale. Ci sono circa €2.000 di ordini in sospeso. I clienti sono preoccupati. Fix urgente!',
  },
  {
    from_name: 'Matteo De Santis',
    from_address: 'matteo@costruzionisud.it',
    priority: 'high',
    category: 'client_request',
    urgency_hours: 4,
    intent: 'Progetto gestionale in ritardo di 3 settimane, cliente minaccia penali contrattuali',
    ai_summary: 'Escalation progetto: 3 sett ritardo, penali €500/giorno da venerdì',
    ai_suggested_reply: 'Matteo, capisco la gravità della situazione. Organizziamo una call domani mattina alle 9 con il tuo team per rivedere le priorità e tagliare le feature non essenziali per rispettare la deadline contrattuale. Posso garantire il modulo principale entro venerdì. Massimiliano',
    subject: 'Progetto in ritardo — penali da venerdì',
    body_plain: 'Massimiliano, siamo a 3 settimane di ritardo sul gestionale cantieri. Il contratto prevede penali di €500 al giorno dal prossimo venerdì. Ho bisogno di un piano concreto e di una data di consegna certa. Chiamami appena puoi.',
  },
]

const PRIMARY_MEDIUM: EmailSpec[] = [
  {
    from_name: 'Roberto Mancini',
    from_address: 'r.mancini@studiodental.it',
    priority: 'medium',
    category: 'client_request',
    urgency_hours: 72,
    intent: 'Follow-up preventivo app prenotazioni, ancora in attesa di risposta',
    ai_summary: 'Follow-up preventivo app prenotazioni studio dentistico',
    ai_suggested_reply: 'Buongiorno Roberto, scusi il ritardo. Il preventivo per l\'app prenotazioni è di €3.400 con timeline 4 settimane. Include integrazione Google Calendar, notifiche SMS e pannello admin. Possiamo fare una call questa settimana? Massimiliano',
    subject: 'Re: preventivo app prenotazioni — ancora aspetto',
    body_plain: 'Buongiorno Massimiliano, la scorsa settimana le ho chiesto un preventivo per un\'app di prenotazioni per il mio studio dentistico. Non ho ancora ricevuto risposta. Può aggiornarmi? Ho bisogno di prendere una decisione entro fine settimana.',
  },
  {
    from_name: 'Valentina Galli',
    from_address: 'v.galli@agriturismotoscana.it',
    priority: 'medium',
    category: 'sales_lead',
    urgency_hours: 96,
    intent: 'Agriturismo chiede info su sito web con prenotazioni online',
    ai_summary: 'Info sito web agriturismo con sistema prenotazioni: budget non definito',
    ai_suggested_reply: 'Buongiorno Valentina, per un sito agriturismo con prenotazioni online stimo €2.500-€3.500 in base alle funzionalità. Include galleria foto, descrizione camere, calendario disponibilità e pagamento online. Ha un logo o dei materiali grafici già pronti? Cordiali saluti, Massimiliano',
    subject: 'Informazioni sito web agriturismo',
    body_plain: 'Buongiorno, ho un agriturismo in Toscana e vorrei finalmente creare un sito web che permettesse le prenotazioni online. Attualmente gestisco tutto per telefono. Può darmi informazioni su costi e tempi?',
  },
  {
    from_name: 'Antonio Ferrara',
    from_address: 'a.ferrara@logisticaexpress.it',
    priority: 'medium',
    category: 'client_request',
    urgency_hours: 48,
    intent: 'Aggiornamento stato avanzamento modulo tracking spedizioni',
    ai_summary: 'Sprint 3 al 60%: tracking completato, notifiche in sviluppo',
    ai_suggested_reply: 'Ciao Antonio, lo sprint 3 è al 60%: il modulo tracking è completato e testato, le notifiche SMS sono in sviluppo (fine settimana). Rimane l\'integrazione con il CRM prevista per lunedì. Ti mando screenshot del tracking in azione. Massimiliano',
    subject: 'Aggiornamento progetto gestionale logistica',
    body_plain: 'Ciao Massimiliano, come procede il modulo tracking spedizioni? Il responsabile operativo mi chiede aggiornamenti. Siamo in linea con la deadline del 20?',
  },
  {
    from_name: 'Cristina Barbieri',
    from_address: 'c.barbieri@studioavv.it',
    priority: 'medium',
    category: 'client_request',
    urgency_hours: 48,
    intent: 'Scheduling call per allineamento prima della presentazione al cliente finale',
    ai_summary: 'Call allineamento pre-presentazione: mercoledì o giovedì mattina',
    ai_suggested_reply: 'Ciao Cristina, sono disponibile mercoledì dalle 10 alle 12 o giovedì dalle 9 alle 11. Preferisce videochiamata o telefono? Mi preparo con un riepilogo della versione demo. Massimiliano',
    subject: 'Call allineamento pre-presentazione — disponibilità?',
    body_plain: 'Ciao Massimiliano, prima di presentare il portale al nostro cliente finale vorrei fare una call di allineamento con te. Sei disponibile mercoledì o giovedì mattina?',
  },
  {
    from_name: 'Andrea Vitale',
    from_address: 'a.vitale@cloudsolutions.it',
    priority: 'medium',
    category: 'sales_lead',
    urgency_hours: 120,
    intent: 'Azienda cloud propone collaborazione tecnica su progetti AWS',
    ai_summary: 'Proposta collaborazione tecnica AWS/DevOps: 2-3 progetti/anno',
    ai_suggested_reply: 'Ciao Andrea, collaborare su progetti AWS è qualcosa che mi interessa. Ho certificazione Solutions Architect e ho lavorato su infrastrutture per 10k+ utenti. Possiamo fare una call esplorativa la prossima settimana? Massimiliano',
    subject: 'Collaborazione tecnica — progetti cloud AWS',
    body_plain: 'Ciao, siamo una società di cloud solutions e cerchiamo professionisti AWS per supportare i nostri clienti enterprise. Gestiamo 2-3 progetti grandi all\'anno. Hai esperienza con architetture cloud scalabili?',
  },
  {
    from_name: 'Simone Lombardi',
    from_address: 's.lombardi@ecommercepet.it',
    priority: 'medium',
    category: 'client_request',
    urgency_hours: 72,
    intent: 'Feedback positivo post-consegna progetto e-commerce, richiesta manutenzione',
    ai_summary: 'Feedback ottimo post-lancio: +23% conversioni. Richiesta piano manutenzione',
    ai_suggested_reply: 'Ottima notizia Simone! +23% conversioni è un risultato fantastico. Per il piano di manutenzione propongo €300/mese che include aggiornamenti, monitoraggio uptime e 4 ore di modifiche. Ti mando il contratto. Massimiliano',
    subject: 'Feedback progetto + proposta manutenzione',
    body_plain: 'Ciao Massimiliano, volevo aggiornarti: il nuovo e-commerce va benissimo! Abbiamo già il 23% in più di conversioni rispetto al vecchio sito. I clienti si lamentano molto meno. Hai un piano di manutenzione mensile? Vorremmo continuare a lavorare con te.',
  },
  {
    from_name: 'Giovanna Cattaneo',
    from_address: 'g.cattaneo@agenziaviaggistyle.it',
    priority: 'medium',
    category: 'sales_lead',
    urgency_hours: 96,
    intent: 'Agenzia viaggi chiede portfolio e referenze per progetto booking',
    ai_summary: 'Richiesta portfolio e referenze per piattaforma booking viaggi',
    ai_suggested_reply: 'Buongiorno Giovanna, le invio il link al portfolio: angel1.dev/work — include 3 progetti e-commerce e una piattaforma prenotazioni. Per referenze posso mettere in contatto con 2 clienti del settore travel. Quando vuole fare una call di presentazione? Massimiliano',
    subject: 'Richiesta portfolio e referenze — progetto booking',
    body_plain: 'Buongiorno, stiamo valutando lo sviluppo di una piattaforma di booking per la nostra agenzia viaggi. Prima di procedere con i preventivi vorremmo vedere il suo portfolio e contattare qualche suo cliente come referenza.',
  },
  {
    from_name: 'Stripe',
    from_address: 'no-reply@stripe.com',
    priority: 'medium',
    category: 'invoice',
    urgency_hours: 72,
    intent: 'Conferma pagamento ricevuto €1.200 da cliente Lombardi Simone',
    ai_summary: 'Pagamento confermato: €1.200 da s.lombardi@ecommercepet.it',
    ai_suggested_reply: '',
    subject: 'Payment received: €1,200.00 from Simone Lombardi',
    body_plain: 'A payment of €1,200.00 has been received from Simone Lombardi (s.lombardi@ecommercepet.it) for invoice INV-2024-041. Funds will be available in your Stripe account within 2 business days.',
  },
  {
    from_name: 'Giorgio Rizzo',
    from_address: 'g.rizzo@palestra360.it',
    priority: 'medium',
    category: 'client_request',
    urgency_hours: 48,
    intent: 'Onboarding nuovo cliente: accesso CMS e briefing iniziale',
    ai_summary: 'Onboarding Palestra 360: accesso CMS inviato, kickoff call giovedì',
    ai_suggested_reply: 'Ciao Giorgio, le ho inviato le credenziali CMS all\'indirizzo email. La nostra call di kickoff è confermata per giovedì alle 15:00. Prepari le foto della palestra e il testo dei corsi — lo usiamo come punto di partenza. Massimiliano',
    subject: 'Benvenuto — prossimi passi progetto sito web',
    body_plain: 'Ciao Massimiliano, oggi ho firmato il contratto. Non vedo l\'ora di iniziare! Come procediamo? Ho le foto della palestra e il testo per le pagine pronto. Quando facciamo la prima call?',
  },
  {
    from_name: 'Vercel',
    from_address: 'invoice@vercel.com',
    priority: 'medium',
    category: 'invoice',
    urgency_hours: 168,
    intent: 'Fattura mensile Vercel Pro: €20 per hosting progetti',
    ai_summary: 'Vercel Pro invoice: €20/mese — 3 deployment attivi',
    ai_suggested_reply: '',
    subject: 'Your Vercel invoice for November 2024',
    body_plain: 'Your Vercel Pro invoice for November 2024 is ready. Amount due: €20.00. This covers your Pro subscription with unlimited deployments, custom domains, and analytics for 3 active projects.',
  },
  {
    from_name: 'Massimo Benedetti',
    from_address: 'm.benedetti@impiantisavona.it',
    priority: 'medium',
    category: 'client_request',
    urgency_hours: 72,
    intent: 'Follow-up preventivo CRM per gestione clienti e interventi tecnici',
    ai_summary: 'Follow-up preventivo CRM personalizzato: €5.500, attesa risposta',
    ai_suggested_reply: 'Salve Massimo, il preventivo è ancora valido. Il CRM per la gestione interventi include: calendario tecnici, storico clienti, generazione preventivi PDF e app mobile per i tecnici sul campo. €5.500 tutto incluso, 8 settimane. Possiamo sentirci questa settimana? Massimiliano',
    subject: 'Re: preventivo CRM — ancora valido?',
    body_plain: 'Salve, due settimane fa avevo chiesto un preventivo per un CRM per la gestione dei miei tecnici e degli interventi di manutenzione impianti. È ancora valido? Ho avuto il via libera dal commercialista.',
  },
  {
    from_name: 'Silvana Moreno',
    from_address: 's.moreno@studioprofessionale.it',
    priority: 'medium',
    category: 'sales_lead',
    urgency_hours: 120,
    intent: 'Studio professionale chiede consulenza per digitalizzazione processi interni',
    ai_summary: 'Consulenza digitalizzazione studio: gestione pratiche, firma digitale',
    ai_suggested_reply: 'Buongiorno Silvana, la digitalizzazione di uno studio professionale è un processo che conosco bene. Le propongo un\'analisi iniziale gratuita di 1 ora per capire i flussi attuali e identificare le priorità. Quando è disponibile? Cordiali saluti, Massimiliano',
    subject: 'Consulenza digitalizzazione studio professionale',
    body_plain: 'Buongiorno, gestisco uno studio di consulenza con 8 professionisti. Siamo ancora molto cartacei e vorremmo digitalizzare la gestione delle pratiche, le firme e la comunicazione con i clienti. Da dove si comincia?',
  },
  {
    from_name: 'Claudia Esposito',
    from_address: 'c.esposito@starlucieventi.it',
    priority: 'medium',
    category: 'client_request',
    urgency_hours: 48,
    intent: 'Aggiornamento milestone piattaforma prenotazioni eventi: modulo pagamento OK',
    ai_summary: 'Milestone M3 completata: pagamenti live. M4 (calendario) in sviluppo',
    ai_suggested_reply: 'Claudia, ottimo! Il modulo pagamento è live e ho già 3 prenotazioni di test completate con successo. Inizio la M4 (calendario disponibilità) da domani. Prevedo di finire entro venerdì. Massimiliano',
    subject: 'Update milestone M3 — piattaforma eventi',
    body_plain: 'Ciao Massimiliano, come siamo messi con la milestone M3? Il cliente chiede aggiornamenti per la call di domani pomeriggio.',
  },
  {
    from_name: 'Supabase',
    from_address: 'billing@supabase.io',
    priority: 'medium',
    category: 'invoice',
    urgency_hours: 168,
    intent: 'Fattura mensile Supabase Pro: $25 per database e auth',
    ai_summary: 'Supabase Pro invoice: $25/mese — database principale progetti',
    ai_suggested_reply: '',
    subject: 'Supabase Invoice — November 2024',
    body_plain: 'Your Supabase Pro invoice for November 2024: $25.00. Your project has processed 2.3M database requests this month with 99.99% uptime. Thank you for being a Pro subscriber.',
  },
  {
    from_name: 'Marco Pellegrini',
    from_address: 'm.pellegrini@digitalconsulting.it',
    priority: 'medium',
    category: 'sales_lead',
    urgency_hours: 120,
    intent: 'Digital agency propone collaborazione continuativa su clienti retail',
    ai_summary: 'Proposta collaborazione continuativa: 2 giorni/sett, retail/fashion',
    ai_suggested_reply: 'Ciao Marco, una collaborazione continuativa nel settore retail mi interessa. Ho lavorato su diversi e-commerce fashion negli ultimi 2 anni. Sono disponibile per 2 giorni/settimana. Possiamo fare una call esplorativa? Massimiliano',
    subject: 'Collaborazione continuativa — sviluppatori esterni',
    body_plain: 'Ciao Massimiliano, siamo una digital agency specializzata nel retail e cerchiamo uno sviluppatore affidabile per supportarci su base continuativa (circa 2 giorni/settimana). Hai esperienza con e-commerce nel settore fashion?',
  },
]

const PRIMARY_LOW: EmailSpec[] = [
  {
    from_name: 'Laravel News',
    from_address: 'newsletter@laravel-news.com',
    priority: 'low',
    category: 'newsletter',
    urgency_hours: 168,
    intent: 'Newsletter settimanale Laravel con novità v11 e pacchetti popolari',
    ai_summary: 'Laravel News: novità v11.x, Livewire 3.5, top pacchetti settimana',
    ai_suggested_reply: '',
    subject: 'Laravel News — Week of November 2024',
    body_plain: 'This week in Laravel: v11.3 released with improved rate limiting, Livewire 3.5 brings new persistence features, and the most popular packages of the week. Plus: an in-depth tutorial on Laravel Reverb for real-time apps.',
  },
  {
    from_name: 'GitHub',
    from_address: 'noreply@github.com',
    priority: 'low',
    category: 'notification',
    urgency_hours: 168,
    intent: 'PR #47 su repo cliente approvata e mergiata in main',
    ai_summary: 'PR #47 merged: fix filtro ordini dashboard — repo costafashion/admin',
    ai_suggested_reply: '',
    subject: '[costafashion/admin] PR #47 merged: fix order filter',
    body_plain: 'Pull request #47 "fix: order filter not showing archived orders" has been merged into main by @elena-costa. 3 files changed, 42 additions, 8 deletions.',
  },
  {
    from_name: 'Vercel',
    from_address: 'noreply@vercel.com',
    priority: 'low',
    category: 'notification',
    urgency_hours: 168,
    intent: 'Deployment production riuscito su progetto palestra360',
    ai_summary: 'Deploy success: palestra360.it — build 2m 14s, 0 error',
    ai_suggested_reply: '',
    subject: '✓ Deployment successful — palestra360.it',
    body_plain: 'Your deployment to palestra360.it is live. Build duration: 2m 14s. 0 errors, 0 warnings. The latest commit "feat: add class booking calendar" is now in production.',
  },
  {
    from_name: 'LinkedIn',
    from_address: 'messages-noreply@linkedin.com',
    priority: 'low',
    category: 'other',
    urgency_hours: 168,
    intent: 'Richiesta collegamento LinkedIn da junior developer interessato all\'AI',
    ai_summary: 'Richiesta collegamento: Luca V., junior dev, interessato AI/ML',
    ai_suggested_reply: '',
    subject: 'Luca Venezia vorrebbe collegarsi con te su LinkedIn',
    body_plain: 'Luca Venezia, Junior Frontend Developer @ Startup Milano, vuole connettersi con te. "Ciao Massimiliano, seguo i tuoi post sull\'AI da mesi. Mi piacerebbe connettermi e imparare dalla tua esperienza nel settore."',
  },
  {
    from_name: 'Stripe',
    from_address: 'payouts@stripe.com',
    priority: 'low',
    category: 'notification',
    urgency_hours: 72,
    intent: 'Payout Stripe settimanale: €2.340 accreditati sul conto',
    ai_summary: 'Stripe payout: €2.340 in arrivo entro 2 giorni lavorativi',
    ai_suggested_reply: '',
    subject: 'Your Stripe payout of €2,340.00 is on its way',
    body_plain: 'A payout of €2,340.00 has been initiated to your bank account ending in 4821. It should arrive within 2 business days. This includes payments from 4 customers processed between Nov 1-7.',
  },
  {
    from_name: 'Google Workspace',
    from_address: 'billing-noreply@google.com',
    priority: 'low',
    category: 'invoice',
    urgency_hours: 168,
    intent: 'Fattura mensile Google Workspace Business: €12/mese per 1 utente',
    ai_summary: 'Google Workspace invoice: €12 — account massi@angel1.dev',
    ai_suggested_reply: '',
    subject: 'Il tuo estratto conto Google Workspace — Novembre 2024',
    body_plain: 'Estratto conto novembre 2024 per il tuo account Google Workspace Business Starter. Importo addebitato: €12,00 per 1 utente (massi@angel1.dev). Il pagamento verrà elaborato il 5 dicembre.',
  },
  {
    from_name: 'Cloudflare',
    from_address: 'noreply@cloudflare.com',
    priority: 'low',
    category: 'notification',
    urgency_hours: 168,
    intent: 'Report analytics settimanale Cloudflare: 45k richieste, 0 attacchi',
    ai_summary: 'Cloudflare weekly: 45k req, 98% cached, 0 threats blocked',
    ai_suggested_reply: '',
    subject: 'Cloudflare Weekly Analytics — 3 siti monitorati',
    body_plain: 'Il tuo report settimanale Cloudflare: 45.230 richieste totali, 98% servite dalla cache, 0 minacce bloccate. Risparmio banda stimato: 4.2 GB. Siti: nextweb.it, costafashion.it, palestra360.it.',
  },
]

const PRIMARY_SPAM: EmailSpec[] = [
  {
    from_name: 'SEO Expert Italia',
    from_address: 'info@seo-guaranteed.it',
    priority: 'spam',
    category: 'other',
    urgency_hours: 0,
    intent: 'Spam: offerta SEO garantita prima pagina Google in 30 giorni',
    ai_summary: 'Spam SEO: promesse irrealistiche posizionamento garantito',
    ai_suggested_reply: '',
    subject: 'Porta il tuo sito in PRIMA PAGINA GOOGLE garantito!',
    body_plain: 'Siamo i leader del SEO italiano! Ti portiamo in PRIMA PAGINA GOOGLE in 30 GIORNI o RIMBORSO TOTALE! Centinaia di clienti soddisfatti. Offerta lancio esclusiva: solo €99/mese. Non perdere questa opportunità UNICA! Clicca ora!',
  },
  {
    from_name: 'Premio Internazionale',
    from_address: 'premi@vincitore-ufficiale.com',
    priority: 'spam',
    category: 'other',
    urgency_hours: 0,
    intent: 'Spam: notifica falsa vincita iPhone 15 Pro',
    ai_summary: 'Spam: falsa vincita iPhone — phishing per dati personali',
    ai_suggested_reply: '',
    subject: '🎉 Hai vinto un iPhone 15 Pro — ritira il tuo premio!',
    body_plain: 'COMPLIMENTI! Sei stato selezionato come vincitore di un iPhone 15 Pro del valore di €1.299! Per ritirare il tuo premio clicca sul link entro 24 ore e inserisci i tuoi dati. Offerta non trasferibile. ATTENZIONE: scade oggi!',
  },
  {
    from_name: 'CryptoWealth Pro',
    from_address: 'invest@cryptowealth-pro.net',
    priority: 'spam',
    category: 'other',
    urgency_hours: 0,
    intent: 'Spam: opportunità investimento crypto con rendimento garantito 300%',
    ai_summary: 'Spam crypto: rendimento 300% garantito — truffa investimento',
    ai_suggested_reply: '',
    subject: 'Investi €500 e guadagna €15.000 in 30 giorni — GARANTITO',
    body_plain: 'Il nostro algoritmo di trading AI ha generato rendimenti del 300% negli ultimi 6 mesi. Investi solo €500 e guadagna fino a €15.000 in 30 giorni. Metodo GARANTITO usato da 50.000 persone. Posti limitati — iscriviti ora prima che sia troppo tardi!',
  },
]

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ACCOUNT 2 — work@angel1.dev — 15 email EN
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const WORK_HIGH: EmailSpec[] = [
  {
    from_name: 'James Morrison',
    from_address: 'james@techventures.io',
    priority: 'high',
    category: 'client_request',
    urgency_hours: 4,
    intent: 'Client pushing for AI dashboard delivery by Friday, requests full-time commitment',
    ai_summary: 'Upwork contract: AI dashboard, full-time this week, +$500 budget available',
    ai_suggested_reply: 'Hi James, I understand the urgency. I can dedicate full time starting tomorrow morning EU time. Please share the current codebase status and the specific features still pending. I\'ll send you a revised timeline by end of day today. Massimiliano',
    subject: 'Upwork contract — AI dashboard urgent delivery',
    body_plain: 'Hi Massimiliano, we\'re behind on our AI dashboard project. The client is pushing hard for delivery by Friday. Can you dedicate full time this week? We can increase the budget by $500 if needed.',
  },
  {
    from_name: 'Sarah Chen',
    from_address: 's.chen@vc-backed-startup.com',
    priority: 'high',
    category: 'sales_lead',
    urgency_hours: 48,
    intent: 'VC-backed startup offers senior AI engineer contract at $95/h for 6 months',
    ai_summary: 'Senior AI Engineer contract: $95/h, 6 months, fully remote',
    ai_suggested_reply: 'Dear Sarah, thank you for reaching out. A 6-month AI engineering contract is very interesting. I\'m available for a technical interview Tuesday or Wednesday next week, preferably between 2-5 PM CET. Could you share more details about the tech stack and the project scope? Best regards, Massimiliano',
    subject: 'Technical interview — Senior AI Engineer role $95/h',
    body_plain: 'Dear Massimiliano, we found your profile on Upwork and we\'re impressed by your AI projects. We\'re looking for a senior AI engineer for a 6-month contract, $95/hour, fully remote. Are you available for a technical interview next week?',
  },
  {
    from_name: 'Mike Rodriguez',
    from_address: 'mike@digitalagentur.de',
    priority: 'high',
    category: 'support',
    urgency_hours: 1,
    intent: 'React app showing blank screen in production, 500+ active users affected',
    ai_summary: 'React app blank screen post-deploy: 500+ users affected, join call now',
    ai_suggested_reply: 'Hi Mike, I\'m available now. Send me the Vercel/deployment logs and repo access. I\'ll join the call — share the link. Massimiliano',
    subject: 'URGENT: React app broken in production',
    body_plain: 'Massimiliano, our React app is showing a blank screen after the latest deployment. We have 500+ active users affected. Can you join a call in 30 minutes?',
  },
  {
    from_name: 'Emma Williams',
    from_address: 'emma@freelancer-agency.co.uk',
    priority: 'high',
    category: 'sales_lead',
    urgency_hours: 72,
    intent: 'UK AI agency proposes long-term developer partnership, £8-15k avg project',
    ai_summary: 'UK agency partnership: AI projects £8-15k avg, long-term',
    ai_suggested_reply: 'Hi Emma, a long-term partnership with an AI-focused agency sounds very interesting. I specialize in Next.js + AI integrations and have delivered projects for RAI and Fileni Group. I\'d love to learn more — can we schedule a call this week? Best, Massimiliano',
    subject: 'Long-term partnership proposal — AI projects',
    body_plain: 'Hi, we\'re a UK-based agency specializing in AI solutions. We\'re looking for reliable developers for ongoing projects. Our average project is £8-15k. Interested in a partnership?',
  },
]

const WORK_MEDIUM: EmailSpec[] = [
  {
    from_name: 'Upwork',
    from_address: 'notifications@upwork.com',
    priority: 'medium',
    category: 'notification',
    urgency_hours: 48,
    intent: 'Upwork invitation to interview for full-stack AI developer role',
    ai_summary: 'Upwork interview invite: full-stack AI dev, $75/h, 3 months',
    ai_suggested_reply: 'Hi, I\'m very interested in this role. I have 5+ years of full-stack experience with a focus on AI integrations. Available for an interview this week. Massimiliano',
    subject: 'You\'ve been invited to interview — Full-Stack AI Developer',
    body_plain: 'A client has invited you to interview for "Full-Stack AI Developer" ($75/hr, 3 months). The client has a 4.9 rating and has spent $47,000 on Upwork. Respond within 48 hours to keep your response rate high.',
  },
  {
    from_name: 'David Park',
    from_address: 'd.park@digitalfirm.co',
    priority: 'medium',
    category: 'client_request',
    urgency_hours: 72,
    intent: 'Client sends positive feedback on delivered e-commerce project',
    ai_summary: 'Excellent feedback: project delivered on time, client very satisfied',
    ai_suggested_reply: 'Hi David, thank you so much — it was a pleasure working with your team! I\'ll be happy to leave a 5-star review on your Upwork profile as well. Looking forward to future collaborations. Massimiliano',
    subject: 'Project feedback — great work on the e-commerce!',
    body_plain: 'Hi Massimiliano, I wanted to take a moment to say how impressed we are with the final result. The e-commerce platform looks great and works perfectly. You delivered on time and the code quality is excellent. I\'ll leave you a 5-star review on Upwork.',
  },
  {
    from_name: 'Stripe',
    from_address: 'payment-confirm@stripe.com',
    priority: 'medium',
    category: 'invoice',
    urgency_hours: 168,
    intent: 'Invoice payment confirmed: $2,400 from TechVentures project milestone',
    ai_summary: 'Payment confirmed: $2,400 — TechVentures milestone 2 of 3',
    ai_suggested_reply: '',
    subject: 'Payment confirmed: $2,400.00 from TechVentures Inc.',
    body_plain: 'Payment of $2,400.00 has been successfully processed from TechVentures Inc. (james@techventures.io) for milestone 2/3 of the AI Dashboard project. Funds will appear in your account within 1-2 business days.',
  },
  {
    from_name: 'Tom Harris',
    from_address: 't.harris@previousclient.com',
    priority: 'medium',
    category: 'support',
    urgency_hours: 48,
    intent: 'Previous client has technical question about the API integration we built',
    ai_summary: 'Ex-client question: rate limiting on /classify endpoint',
    ai_suggested_reply: 'Hi Tom, great to hear from you. The /classify endpoint has a default rate limit of 100 req/min per API key. You can increase it in your dashboard under Settings → API → Rate Limits. Let me know if you need any other help. Massimiliano',
    subject: 'Quick technical question about the API',
    body_plain: 'Hi Massimiliano, hope you\'re doing well. We\'re still using the API integration you built for us. Quick question: we\'re hitting the rate limit on the /classify endpoint. Is there a way to increase it or do we need to upgrade our plan?',
  },
  {
    from_name: 'Claire Bennett',
    from_address: 'c.bennett@b2bsaas.io',
    priority: 'medium',
    category: 'client_request',
    urgency_hours: 96,
    intent: 'Client requests written testimonial for their website',
    ai_summary: 'Testimonial request: B2B SaaS platform project, 3-4 sentences',
    ai_suggested_reply: 'Hi Claire, of course! Here\'s a testimonial: "Working with Claire\'s team at B2B SaaS was an excellent experience. Clear requirements, fast feedback cycles, and a genuine focus on business outcomes. The platform we built together has been running smoothly for 6 months with zero major issues." Use it however you like! Massimiliano',
    subject: 'Testimonial request for our website',
    body_plain: 'Hi Massimiliano, we\'re updating our website and would love to include a short testimonial from you about working with us. Just 3-4 sentences about the collaboration would be perfect. No rush — whenever you have 5 minutes.',
  },
  {
    from_name: 'Linear',
    from_address: 'billing@linear.app',
    priority: 'medium',
    category: 'invoice',
    urgency_hours: 168,
    intent: 'Linear annual subscription renewal: $96/year for Pro plan',
    ai_summary: 'Linear Pro renewal: $96/year — project management tool',
    ai_suggested_reply: '',
    subject: 'Your Linear Pro subscription has been renewed',
    body_plain: 'Your Linear Pro subscription has been renewed for another year. Amount charged: $96.00 to your card ending in 7823. Your workspace has 1 active project with 47 open issues. Thank you for being a Pro subscriber.',
  },
  {
    from_name: 'GitHub',
    from_address: 'noreply@github.com',
    priority: 'medium',
    category: 'notification',
    urgency_hours: 48,
    intent: 'Collaborator requests code review on PR #23 for API authentication module',
    ai_summary: 'PR review requested: #23 JWT refresh token logic — techventures/ai-dashboard',
    ai_suggested_reply: 'On it — will review by end of day. Massimiliano',
    subject: '[techventures/ai-dashboard] Review requested on PR #23',
    body_plain: 'james-morrison requested your review on pull request #23: "feat: add JWT refresh token rotation". 4 files changed, 127 additions, 43 deletions. Please review before merging to main.',
  },
  {
    from_name: 'Upwork',
    from_address: 'noreply@upwork.com',
    priority: 'medium',
    category: 'notification',
    urgency_hours: 96,
    intent: 'New job invitation matching AI development skills',
    ai_summary: 'New Upwork job: Next.js + OpenAI integration, $4,000 fixed price',
    ai_suggested_reply: 'Hi, I\'m very interested in this project. I have extensive experience with Next.js and OpenAI API integrations. Available to start immediately. Massimiliano',
    subject: 'New job invitation matches your skills — Next.js + AI',
    body_plain: 'A client has posted a job that matches your skills: "Build AI-powered content generator with Next.js and OpenAI". Fixed price: $4,000. Timeline: 4 weeks. Client rating: 5.0 ⭐ (12 reviews, $180k spent).',
  },
]

const WORK_LOW: EmailSpec[] = [
  {
    from_name: 'Upwork',
    from_address: 'weekly@upwork.com',
    priority: 'low',
    category: 'newsletter',
    urgency_hours: 168,
    intent: 'Upwork weekly digest: market trends and top skills in demand',
    ai_summary: 'Upwork Weekly: AI/ML skills demand up 34%, avg rate $85/h',
    ai_suggested_reply: '',
    subject: 'Upwork Weekly Insights — AI Skills in High Demand',
    body_plain: 'This week on Upwork: AI/ML development skills saw a 34% increase in job postings. Average hourly rate for senior AI developers reached $85/h. Top skills: Python, LangChain, Next.js, OpenAI API. Your profile is in the top 10% for AI Development.',
  },
  {
    from_name: 'GitHub Security',
    from_address: 'security@github.com',
    priority: 'low',
    category: 'notification',
    urgency_hours: 168,
    intent: 'Dependabot security advisory: moderate severity in lodash dependency',
    ai_summary: 'GitHub security: lodash 4.17.20 moderate vuln — auto-PR available',
    ai_suggested_reply: '',
    subject: '[security] Dependabot alert on massiangelone/email-triage',
    body_plain: 'Dependabot has detected a moderate severity vulnerability in lodash (4.17.20) used by massiangelone/email-triage. A pull request to update to 4.17.21 has been automatically created. Review and merge when ready.',
  },
  {
    from_name: 'Stripe',
    from_address: 'payouts@stripe.com',
    priority: 'low',
    category: 'notification',
    urgency_hours: 72,
    intent: 'Weekly Stripe payout: $3,140 from international clients',
    ai_summary: 'Stripe payout: $3,140 — 2 US clients, arriving in 2 business days',
    ai_suggested_reply: '',
    subject: 'Your Stripe payout of $3,140.00 is on its way',
    body_plain: 'A payout of $3,140.00 has been initiated to your bank account ending in 4821. Expected arrival: 2 business days. This payout includes payments from 2 international customers processed Nov 4-10.',
  },
]

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ACCOUNT 3 — support@angel1.dev — 10 email ES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const SUPPORT_HIGH: EmailSpec[] = [
  {
    from_name: 'Carlos Mendoza',
    from_address: 'c.mendoza@empresatech.es',
    priority: 'high',
    category: 'client_request',
    urgency_hours: 1,
    intent: 'Plataforma caída 2 horas, 200 clientes afectados, presupuesto €800 para solución',
    ai_summary: 'Error crítico: plataforma caída 2h, 200 clientes sin acceso, €800 presupuesto',
    ai_suggested_reply: 'Hola Carlos, entiendo la urgencia. Estoy disponible ahora mismo. Por favor comparte acceso al repositorio y los logs de error. Te contacto en 15 minutos con una primera evaluación. Massimiliano',
    subject: 'Error crítico en la plataforma — clientes afectados',
    body_plain: 'Hola Massimiliano, llevamos 2 horas con la plataforma caída. Tenemos 200 clientes que no pueden acceder. ¿Puedes ayudarnos urgentemente? Presupuesto para solución inmediata: €800.',
  },
  {
    from_name: 'Ana García',
    from_address: 'ana@startupmexico.com',
    priority: 'high',
    category: 'sales_lead',
    urgency_hours: 24,
    intent: 'Startup mexicana propone desarrollo app móvil React Native con presupuesto €10k',
    ai_summary: 'Lead app móvil React Native, €10k presupuesto, startup México',
    ai_suggested_reply: 'Buenos días Ana, muchas gracias por contactarme. React Native con AI es mi especialidad. ¿Podríamos agendar una llamada esta semana para definir los requisitos del proyecto? Estoy disponible martes o jueves por la tarde. Saludos, Massimiliano',
    subject: 'Propuesta proyecto — App móvil €10k',
    body_plain: 'Buenos días, encontré tu perfil en LinkedIn y me impresionaron tus proyectos de AI. Necesitamos desarrollar una app móvil con React Native para nuestro negocio de logística. Presupuesto: €10.000. ¿Disponible para una llamada esta semana?',
  },
  {
    from_name: 'Roberto Silva',
    from_address: 'r.silva@agenciacreativa.co',
    priority: 'high',
    category: 'client_request',
    urgency_hours: 4,
    intent: 'Agencia colombiana necesita integración AI urgente para cliente importante',
    ai_summary: 'Integración AI urgente: clasificación documentos para cliente enterprise Colombia',
    ai_suggested_reply: 'Hola Roberto, con tan poco tiempo necesito entender el alcance exacto del trabajo. ¿Puedes compartir más detalles sobre la integración de AI que necesitan? ¿Qué tipo de documentos, qué volumen y qué output esperan? Así evalúo si es factible para mañana. Massimiliano',
    subject: 'Colaboración urgente — cliente importante AI',
    body_plain: 'Hola, somos una agencia creativa en Colombia. Tenemos un cliente enterprise que necesita integración de AI para clasificación automática de documentos. El cliente necesita una demo para mañana. ¿Puedes ayudar?',
  },
]

const SUPPORT_MEDIUM: EmailSpec[] = [
  {
    from_name: 'Miguel Torres',
    from_address: 'm.torres@serviciosit.es',
    priority: 'medium',
    category: 'sales_lead',
    urgency_hours: 72,
    intent: 'Follow-up presupuesto enviado hace 10 días, cliente pide actualización',
    ai_summary: 'Follow-up presupuesto portal RRHH: €6.500, aún esperando respuesta',
    ai_suggested_reply: 'Hola Miguel, el presupuesto de €6.500 para el portal de RRHH sigue vigente. Incluye módulo de vacaciones, control horario y generación de nóminas en PDF. ¿Han tomado una decisión? Podría empezar la próxima semana. Saludos, Massimiliano',
    subject: 'Re: presupuesto portal RRHH — ¿alguna novedad?',
    body_plain: 'Hola Massimiliano, hace 10 días recibimos tu presupuesto para el portal de gestión de RRHH. Hemos estado evaluando opciones. ¿El presupuesto sigue siendo válido? ¿Cuándo podrías empezar si lo aprobamos?',
  },
  {
    from_name: 'Laura Sánchez',
    from_address: 'l.sanchez@consultoramexico.com',
    priority: 'medium',
    category: 'client_request',
    urgency_hours: 48,
    intent: 'Coordinación kickoff meeting proyecto CRM para consultora mexicana',
    ai_summary: 'Kickoff CRM: jueves 15:00 CDMX (22:00 CET) — 5 participantes',
    ai_suggested_reply: 'Hola Laura, confirmado para el jueves a las 15:00 hora de México (22:00 CET para mí). Antes de la reunión compárteme el organigrama del equipo y los procesos actuales de gestión de clientes. Así llegamos más preparados. Massimiliano',
    subject: 'Kickoff meeting proyecto CRM — confirmación',
    body_plain: 'Hola Massimiliano, ¿podemos hacer el kickoff del proyecto CRM el jueves a las 3pm hora de México? Participarán el director comercial, dos vendedores y el equipo de TI. Queremos arrancar cuanto antes.',
  },
  {
    from_name: 'Pedro Vargas',
    from_address: 'p.vargas@tiendaonlinecl.cl',
    priority: 'medium',
    category: 'client_request',
    urgency_hours: 96,
    intent: 'Cliente chileno muy satisfecho, solicita plan de mantenimiento mensual',
    ai_summary: 'Feedback excelente tienda online Chile: +31% ventas. Solicita mantenimiento €250/mes',
    ai_suggested_reply: 'Hola Pedro, ¡excelente noticia! +31% en ventas es un resultado fantástico. Para el mantenimiento mensual propongo €250/mes que incluye actualizaciones, monitoreo y 3 horas de modificaciones. ¿Te parece bien? Massimiliano',
    subject: 'Feedback proyecto + mantenimiento mensual',
    body_plain: 'Hola Massimiliano, quería contarte que desde que lanzamos la nueva tienda las ventas han subido un 31%. Los clientes navegan mucho más fácil. ¿Tienes un plan de mantenimiento mensual? No queremos perder el contacto contigo.',
  },
  {
    from_name: 'Isabella Fernández',
    from_address: 'i.fernandez@agenciadigitalco.co',
    priority: 'medium',
    category: 'client_request',
    urgency_hours: 120,
    intent: 'Agencia colombiana solicita referencia profesional para cliente enterprise',
    ai_summary: 'Solicitud referencia: proyecto e-commerce moda, resultados y metodología',
    ai_suggested_reply: 'Hola Isabella, por supuesto. Aquí una referencia breve: "Massimiliano Angelone desarrolló nuestra plataforma e-commerce en 8 semanas, dentro del presupuesto y con calidad excelente. Código limpio, comunicación fluida y resolución rápida de problemas." Úsala libremente. Massimiliano',
    subject: 'Solicitud de referencia profesional',
    body_plain: 'Hola Massimiliano, estamos licitando un proyecto grande con un cliente enterprise y nos piden referencias de desarrolladores con los que hemos trabajado. ¿Podrías escribirnos una breve referencia sobre nuestra colaboración?',
  },
  {
    from_name: 'Diego Morales',
    from_address: 'd.morales@empresaargentina.com.ar',
    priority: 'medium',
    category: 'support',
    urgency_hours: 72,
    intent: 'Ex-cliente argentino pregunta sobre integración de pagos locales MercadoPago',
    ai_summary: 'Consulta técnica: integración MercadoPago en Next.js — ex cliente',
    ai_suggested_reply: 'Hola Diego, sí, tengo experiencia con MercadoPago. Para Next.js la integración más limpia es usando el SDK oficial con webhooks para confirmación de pagos. El proceso toma 2-3 días. ¿Quieres que te prepare un presupuesto? Massimiliano',
    subject: 'Consulta técnica — integración MercadoPago',
    body_plain: 'Hola Massimiliano, espero que estés bien. Necesito integrar MercadoPago en el sitio que me hiciste. Tenemos muchos clientes argentinos que prefieren pagar con MercadoPago. ¿Tienes experiencia con esa plataforma?',
  },
]

const SUPPORT_LOW: EmailSpec[] = [
  {
    from_name: 'Tecnología Empresarial',
    from_address: 'noreply@tecnologiaempresarial.es',
    priority: 'low',
    category: 'newsletter',
    urgency_hours: 168,
    intent: 'Newsletter tecnología española: tendencias IA en empresas medianas',
    ai_summary: 'Newsletter TecnoEmpresa: IA en PYMEs, automatización RPA, cloud adoption España',
    ai_suggested_reply: '',
    subject: 'TecnoEmpresa — IA en las PYMEs españolas: estado actual',
    body_plain: 'En este número: cómo están adoptando la IA las pequeñas y medianas empresas españolas, casos de éxito de automatización RPA, y los 5 errores más comunes al migrar al cloud. Además: entrevista con el CTO de una startup de Barcelona que triplicó su productividad con IA.',
  },
  {
    from_name: 'Stripe',
    from_address: 'no-reply@stripe.com',
    priority: 'low',
    category: 'notification',
    urgency_hours: 72,
    intent: 'Confirmación pago recibido €1.800 de cliente colombiano proyecto kickoff',
    ai_summary: 'Pago confirmado: €1.800 depósito inicial proyecto CRM — Consultoría México',
    ai_suggested_reply: '',
    subject: 'Pago recibido: €1.800,00 de Laura Sánchez',
    body_plain: 'Se ha recibido un pago de €1.800,00 de Laura Sánchez (l.sanchez@consultoramexico.com) como depósito inicial para el proyecto CRM. Los fondos estarán disponibles en tu cuenta de Stripe en 2 días hábiles.',
  },
]

async function seed() {
  process.stdout.write('Seeding mock data for test@angel1.dev...\n')

  // Delete existing emails (idempotent re-run)
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

  // Upsert users_settings with classification rules for primary account
  const { error: settingsError } = await supabase.from('users_settings').upsert({
    user_id: USER_ID,
    email_address: USER_ID,
    google_refresh_token: null,
    classification_rules: [
      { from_contains: 'fileni.it', force_priority: 'high' },
      { from_contains: 'rai.it', force_priority: 'high' },
    ],
    active_account_id: ACCOUNT_PRIMARY,
  })
  if (settingsError) {
    process.stderr.write(`Failed to upsert users_settings: ${settingsError.message}\n`)
    process.exit(1)
  }
  process.stdout.write('users_settings row created (active_account_id = account-001, 2 rules)\n')

  function makeRows(specs: EmailSpec[], accountId: string, prefix: string, daysAgo: number) {
    return specs.map((spec, i) => ({
      user_id: USER_ID,
      account_id: accountId,
      gmail_message_id: `mock-${prefix}-${i + 1}-${Date.now()}`,
      thread_id: `thread-${prefix}-${i + 1}`,
      from_address: spec.from_address,
      from_name: spec.from_name,
      subject: spec.subject,
      snippet: spec.body_plain.slice(0, 100),
      body_plain: spec.body_plain,
      received_at: randomDate(daysAgo),
      priority: spec.priority,
      category: spec.category,
      urgency_hours: spec.urgency_hours,
      intent: spec.intent,
      ai_summary: spec.ai_summary,
      ai_suggested_reply: spec.ai_suggested_reply,
      is_processed: true,
      is_handled: false,
    }))
  }

  const primarySpecs = [...PRIMARY_HIGH, ...PRIMARY_MEDIUM, ...PRIMARY_LOW, ...PRIMARY_SPAM]
  const workSpecs = [...WORK_HIGH, ...WORK_MEDIUM, ...WORK_LOW]
  const supportSpecs = [...SUPPORT_HIGH, ...SUPPORT_MEDIUM, ...SUPPORT_LOW]

  const primaryRows = makeRows(primarySpecs, ACCOUNT_PRIMARY, 'primary', 30)
  const workRows = makeRows(workSpecs, ACCOUNT_WORK, 'work', 30)
  const supportRows = makeRows(supportSpecs, ACCOUNT_SUPPORT, 'support', 14)

  const allRows = [...primaryRows, ...workRows, ...supportRows]
  const { error: emailsError } = await supabase.from('emails').insert(allRows)
  if (emailsError) {
    process.stderr.write(`Failed to insert emails: ${emailsError.message}\n`)
    process.exit(1)
  }

  const count = (arr: EmailSpec[], p: Priority) => arr.filter(e => e.priority === p).length

  process.stdout.write(`\nInserted ${allRows.length} total emails:\n`)
  process.stdout.write(`  account-001 (massi@angel1.dev)    [IT] ${primaryRows.length} — ${count(primarySpecs, 'high')}H ${count(primarySpecs, 'medium')}M ${count(primarySpecs, 'low')}L ${count(primarySpecs, 'spam')}S\n`)
  process.stdout.write(`  account-002 (work@angel1.dev)     [EN] ${workRows.length} — ${count(workSpecs, 'high')}H ${count(workSpecs, 'medium')}M ${count(workSpecs, 'low')}L\n`)
  process.stdout.write(`  account-003 (support@angel1.dev)  [ES] ${supportRows.length} — ${count(supportSpecs, 'high')}H ${count(supportSpecs, 'medium')}M ${count(supportSpecs, 'low')}L\n`)
  process.stdout.write('\nClassification rules (account-001): fileni.it → high, rai.it → high\n')
  process.stdout.write('\nDone! Open http://localhost:3000/app to test.\n')
}

seed()
