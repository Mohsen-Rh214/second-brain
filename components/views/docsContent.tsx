import React from 'react';

export type Lang = 'en' | 'it' | 'fa';

export const DOC_STRUCTURE = [
    {
        category: { en: 'Introduction', it: 'Introduzione', fa: 'مقدمه' },
        topics: [
            { id: 'overview', label: { en: 'Overview', it: 'Panoramica', fa: 'مرور کلی' } },
            { id: 'getting-started', label: { en: 'Getting Started', it: 'Primi Passi', fa: 'شروع به کار' } },
        ],
    },
    {
        category: { en: 'Core Methodologies', it: 'Metodologie Fondamentali', fa: 'متدولوژی‌های اصلی' },
        topics: [
            { id: 'para', label: { en: 'The P.A.R.A. System', it: 'Il Sistema P.A.R.A.', fa: 'سیستم P.A.R.A.' } },
            { id: 'code', label: { en: 'The C.O.D.E. Method', it: 'Il Metodo C.O.D.E.', fa: 'متد C.O.D.E.' } },
        ],
    },
    {
        category: { en: 'Using the App', it: "Utilizzo dell'App", fa: 'استفاده از برنامه' },
        topics: [
            { id: 'home', label: { en: 'Home', it: 'Home', fa: 'خانه' } },
            { id: 'projects-areas', label: { en: 'Projects & Areas', it: 'Progetti e Aree', fa: 'پروژه‌ها و حوزه‌ها' } },
            { id: 'tasks', label: { en: 'Tasks', it: 'Attività', fa: 'وظایف' } },
            { id: 'graph-view', label: { en: 'Graph View', it: 'Vista Grafo', fa: 'نمای گراف' } },
            { id: 'weekly-review', label: { en: 'Weekly Review', it: 'Revisione Settimanale', fa: 'مرور هفتگی' } },
        ],
    },
    {
        category: { en: 'Advanced Workflows', it: 'Flussi di Lavoro Avanzati', fa: 'گردش‌کارهای پیشرفته' },
        topics: [
            { id: 'linking', label: { en: 'Linking Your Thinking', it: 'Collegare i Tuoi Pensieri', fa: 'پیوند دادن افکار' } },
            { id: 'tagging', label: { en: 'Effective Tagging', it: 'Etichettatura Efficace', fa: 'تگ‌گذاری مؤثر' } },
        ],
    },
    {
        category: { en: 'Data Management', it: 'Gestione Dati', fa: 'مدیریت داده‌ها' },
        topics: [
            { id: 'backup', label: { en: 'Backup & Restore', it: 'Backup e Ripristino', fa: 'پشتیبان‌گیری و بازیابی' } }
        ],
    },
];

type DocTopic = typeof DOC_STRUCTURE[number]['topics'][number]['id'];

const H2: React.FC<{ children: React.ReactNode }> = ({ children }) => <h2 className="text-3xl font-bold font-heading mb-4 text-text-primary tracking-tight">{children}</h2>;
const H3: React.FC<{ children: React.ReactNode }> = ({ children }) => <h3 className="text-xl font-bold font-heading mt-8 mb-3 text-text-primary">{children}</h3>;
const P: React.FC<{ children: React.ReactNode }> = ({ children }) => <p className="mb-4 text-text-secondary leading-relaxed">{children}</p>;
const Strong: React.FC<{ children: React.ReactNode }> = ({ children }) => <strong className="font-semibold text-text-primary">{children}</strong>;
const UL: React.FC<{ children: React.ReactNode }> = ({ children }) => <ul className="list-disc list-inside space-y-2 mb-4 text-text-secondary ps-4">{children}</ul>;
const OL: React.FC<{ children: React.ReactNode }> = ({ children }) => <ol className="list-decimal list-inside space-y-2 mb-4 text-text-secondary ps-4">{children}</ol>;
const LI: React.FC<{ children: React.ReactNode }> = ({ children }) => <li>{children}</li>;
const Code: React.FC<{ children: React.ReactNode }> = ({ children }) => <code className="bg-background/50 text-accent font-mono text-sm px-1.5 py-1 rounded-md border border-outline">{children}</code>;
const Blockquote: React.FC<{ children: React.ReactNode }> = ({ children }) => <blockquote className="border-s-4 border-accent ps-4 italic my-4 text-text-secondary">{children}</blockquote>;

const contentMap: Record<DocTopic, React.ReactNode> = {
    overview: (
        <>
            <H2>Overview: What is a Second Brain?</H2>
            <P>Welcome to your Second Brain. This application is more than just a place to store notes; it's a comprehensive system designed to help you manage the constant flow of information in your life, turning scattered ideas into tangible results.</P>
            <Blockquote>The goal is not just to collect information, but to connect ideas and create new knowledge that serves your goals and ambitions.</Blockquote>
            <P>This app is built on two proven methodologies:</P>
            <UL>
                <LI><Strong>The P.A.R.A. System:</Strong> A simple, powerful method for organizing all your digital information into four actionable categories.</LI>
                <LI><Strong>The C.O.D.E. Method:</Strong> A four-step workflow for processing information, from initial capture to final creative expression.</LI>
            </UL>
            <P>By using this system, you'll create a reliable, digital extension of your mind. You'll never lose a valuable idea again, and you'll have a structured way to make progress on the things that matter most to you.</P>
        </>
    ),
    'getting-started': (
         <>
            <H2>Getting Started: Your First 5 Minutes</H2>
            <P>Let's get you an immediate win and demonstrate the core workflow of the app. Follow these four simple steps to experience the power of your Second Brain.</P>
            <OL>
                <LI>
                    <Strong>Capture a Fleeting Thought.</Strong> Click the big <Code>+</Code> button in the bottom right (or press <Code>C</Code>) to open the command bar. Select "New Note" and jot down the first thing that comes to mind—an idea, a quote, a reminder. This goes into your Inbox.
                </LI>
                <LI>
                    <Strong>Create Your First Area.</Strong> Navigate to the "Areas" view from the sidebar. An Area is a long-term domain of your life. Click "Create New Area" and make one called <Strong>"Personal Growth"</Strong>.
                </LI>
                <LI>
                    <Strong>Define Your First Project.</Strong> Inside your new Area, you'll see a section for Projects. A Project has a clear goal. Click "Add Project" and create one called <Strong>"Learn a new skill"</Strong>.
                </LI>
                <LI>
                    <Strong>Add an Actionable Task.</Strong> Now, in your new project, click "Add Task" and create a specific, actionable to-do, like <Strong>"Watch a 10-minute tutorial on a topic I'm interested in"</Strong>.
                </LI>
            </OL>
            <P>Congratulations! You've just completed the core loop of capturing an idea, organizing it into a relevant project within a life area, and defining a concrete next step. This is the fundamental habit that will make your Second Brain thrive.</P>
        </>
    ),
    para: (
        <>
            <H2>The P.A.R.A. System: Your Digital Filing Cabinet</H2>
            <P>P.A.R.A. is a simple, universal system for organizing any kind of digital information. It consists of four categories, which represent the only four places information can be.</P>
            <H3>P — Projects</H3>
            <P>A series of tasks linked to a goal with a deadline. This is where you put information related to things you are <Strong>actively working on right now</Strong>.</P>
            <UL>
                <LI>Example: "Plan Holiday Party"</LI>
                <LI>Example: "Complete Q3 Report"</LI>
                <LI>Example: "Develop new feature"</LI>
            </UL>
            <H3>A — Areas</H3>
            <P>A sphere of activity with a standard to be maintained over time. These are the domains of your life where you have ongoing responsibility.</P>
            <UL>
                <LI>Example: "Health & Fitness"</LI>
                <LI>Example: "Finances"</LI>
                <LI>Example: "Career Development"</LI>
            </UL>
            <H3>R — Resources</H3>
            <P>A topic or theme of ongoing interest. This is where you keep information on subjects you want to learn about or refer to in the future.</P>
            <UL>
                <LI>Example: "Web Development"</LI>
                <LI>Example: "Gardening"</LI>
                <LI>Example: "Stoic Philosophy"</LI>
            </UL>
            <H3>A — Archives</H3>
            <P>Inactive items from the other three categories. This is your cold storage for anything that is complete, inactive, or no longer relevant.</P>
            <UL>
                <LI>Example: A completed project.</LI>
                <LI>Example: An area you are no longer maintaining.</LI>
                <LI>Example: A resource you've lost interest in.</LI>
            </UL>
        </>
    ),
    code: (
        <>
            <H2>The C.O.D.E. Method: Your Knowledge Workflow</H2>
            <P>C.O.D.E. is a four-step process for how information flows through your Second Brain, turning raw data into creative output.</P>
            <H3>C — Capture</H3>
            <P>The first step is to get ideas out of your head and into a trusted place. Your <Strong>Inbox</Strong> is the digital landing pad for every thought, idea, link, or snippet that resonates with you. Don't worry about where it belongs yet—just capture it quickly and move on.</P>
            <H3>O — Organize</H3>
            <P>Periodically, review your Inbox and ask the key question: "Where does this go so I can find it when I need it?" Move each item into the appropriate P.A.R.A. bucket. Is it for an active project? A long-term area? Or just a general resource? This step makes information actionable.</P>
            <H3>D — Distill</H3>
            <P>This is the art of finding the essence. Raw notes are not very useful. Over time, make your notes more valuable by highlighting the key passages, bolding the most important points, and eventually, writing your own executive summary at the top. This technique, called <Strong>Progressive Summarization</Strong>, ensures your best ideas are always visible at a glance.</P>
            <H3>E — Express</H3>
            <P>The ultimate purpose of a Second Brain is not just to store information, but to <Strong>use it</Strong>. Express is about turning your curated knowledge into something new: a presentation, a blog post, a project plan, or even just a more informed opinion in a conversation. This is where your thinking pays off.</P>
        </>
    ),
    home: <><H2>Using the App: Home</H2><P>The Home view is your daily dashboard, providing a clear overview of your priorities. Here you can find your "My Day" task list, a quick-capture box, and lists of recent projects and areas to jump back into your work quickly.</P></>,
    'projects-areas': <><H2>Using the App: Projects & Areas</H2><P>These are the core organizational views. The Areas view shows your high-level life domains, and clicking on an Area reveals all the goal-oriented Projects within it. This top-down structure ensures your daily work (in Projects) is always aligned with your long-term responsibilities (in Areas).</P></>,
    tasks: <><H2>Using the App: Tasks</H2><P>The "All Tasks" view provides a master list of every active task across all your projects. You can group your tasks by Project, Priority, or Due Date, giving you powerful ways to plan your work and decide what to focus on next.</P></>,
    'graph-view': <><H2>Using the App: Graph View</H2><P>The Graph View is a powerful tool for creativity and insight. It visualizes your notes, projects, and areas as an interconnected network. Use it to discover unexpected relationships between ideas and to see the bigger picture of your knowledge.</P></>,
    'weekly-review': <><H2>Using the App: Weekly Review</H2><P>The Weekly Review is a guided workflow that walks you through the essential habit of maintaining your Second Brain. It prompts you to clear your inbox, review your projects and areas, and look ahead at your upcoming tasks to ensure nothing falls through the cracks.</P></>,
    linking: <><H2>Advanced: Linking Your Thinking</H2><P>Create a personal wiki by linking notes together. In the note editor, type <Code>/</Code> to bring up a list of other items in your system. Selecting one will create a direct link. This builds a web of knowledge, making it easier to navigate between related concepts and build on previous work.</P></>,
    tagging: <><H2>Advanced: Effective Tagging</H2><P>Tags are a flexible way to add another layer of organization. Use them to denote status (<Code>#status/in-progress</Code>), source (<Code>#source/book</Code>), or topic (<Code>#topic/psychology</Code>). This allows you to create cross-cutting collections of items that live in different P.A.R.A. buckets.</P></>,
    backup: (
        <>
            <H2>Backup & Restore: Safeguarding Your Knowledge</H2>
            <P>Your Second Brain data is stored <Strong>exclusively in your web browser's local storage</Strong>. This means your data is private and fast, but it also comes with a critical responsibility: you must back it up yourself.</P>
            <Blockquote>Without backups, clearing your browser cache, switching browsers, or changing computers will result in <Strong>permanent data loss</Strong>.</Blockquote>
            <H3>How to Keep Your Data Safe</H3>
            <P>We've made it simple to protect your work. Navigate to the <Code>Settings</Code> view for the following options:</P>
            <OL>
                <LI>
                    <Strong>Export Data:</Strong> This is your backup tool. Clicking this button will generate a single JSON file (e.g., <Code>second-brain-backup-2024-10-26.json</Code>) and download it to your computer. This file is a complete snapshot of everything in your Second Brain at that moment.
                </LI>
                <LI>
                    <Strong>Import Data:</Strong> This is your restore tool. You can select a previously exported JSON file to load it into the application.
                </LI>
            </OL>
            <H3>Important: How Importing Works</H3>
            <P><Strong>WARNING:</Strong> Importing a backup file will <Strong>completely overwrite and replace all current data</Strong> in the application. This action cannot be undone. It's like restoring your computer from a backup—the old state is completely replaced by the state in the file.</P>
            <H3>Our Recommendation</H3>
            <P>Get into the habit of exporting your data regularly. A good practice is to do it at the end of every week as part of your Weekly Review. Store your backup files in a safe place, like a cloud storage folder (Dropbox, Google Drive) or an external hard drive.</P>
        </>
    ),
};

const italianContentMap: Partial<Record<DocTopic, React.ReactNode>> = {
    overview: (
        <>
            <H2>Panoramica: Cos'è un Secondo Cervello?</H2>
            <P>Benvenuto nel tuo Secondo Cervello. Questa applicazione è più di un semplice posto dove archiviare appunti; è un sistema completo progettato per aiutarti a gestire il flusso costante di informazioni nella tua vita, trasformando idee sparse in risultati tangibili.</P>
            <Blockquote>L'obiettivo non è solo raccogliere informazioni, ma collegare idee e creare nuova conoscenza al servizio dei tuoi obiettivi e delle tue ambizioni.</Blockquote>
            <P>Questa app si basa su due metodologie collaudate:</P>
            <UL>
                <LI><Strong>Il Sistema P.A.R.A.:</Strong> Un metodo semplice e potente per organizzare tutte le tue informazioni digitali in quattro categorie operative.</LI>
                <LI><Strong>Il Metodo C.O.D.E.:</Strong> Un flusso di lavoro in quattro passaggi per elaborare le informazioni, dalla cattura iniziale all'espressione creativa finale.</LI>
            </UL>
            <P>Utilizzando questo sistema, creerai un'estensione digitale affidabile della tua mente. Non perderai mai più un'idea preziosa e avrai un modo strutturato per fare progressi sulle cose che contano di più per te.</P>
        </>
    ),
    'getting-started': (
        <>
            <H2>Primi Passi: I Tuoi Primi 5 Minuti</H2>
            <P>Otteniamo subito un risultato e dimostriamo il flusso di lavoro principale dell'app. Segui questi quattro semplici passaggi per sperimentare la potenza del tuo Secondo Cervello.</P>
            <OL>
                <LI>
                    <Strong>Cattura un Pensiero Fugace.</Strong> Clicca il grande pulsante <Code>+</Code> in basso a destra (o premi <Code>C</Code>) per aprire la barra dei comandi. Seleziona "Nuovo Appunto" e scrivi la prima cosa che ti viene in mente: un'idea, una citazione, un promemoria. Questo andrà nella tua Posta in Arrivo.
                </LI>
                <LI>
                    <Strong>Crea la Tua Prima Area.</Strong> Naviga alla vista "Aree" dalla barra laterale. Un'Area è un dominio a lungo termine della tua vita. Clicca "Crea Nuova Area" e creane una chiamata <Strong>"Crescita Personale"</Strong>.
                </LI>
                <LI>
                    <Strong>Definisci il Tuo Primo Progetto.</Strong> All'interno della tua nuova Area, vedrai una sezione per i Progetti. Un Progetto ha un obiettivo chiaro. Clicca "Aggiungi Progetto" e creane uno chiamato <Strong>"Imparare una nuova abilità"</Strong>.
                </LI>
                <LI>
                    <Strong>Aggiungi un'Attività Concreta.</Strong> Ora, nel tuo nuovo progetto, clicca "Aggiungi Attività" e crea un'azione specifica e concreta, come <Strong>"Guardare un tutorial di 10 minuti su un argomento che mi interessa"</Strong>.
                </LI>
            </OL>
            <P>Congratulazioni! Hai appena completato il ciclo fondamentale di catturare un'idea, organizzarla in un progetto pertinente all'interno di un'area della tua vita e definire un passo successivo concreto. Questa è l'abitudine fondamentale che farà prosperare il tuo Secondo Cervello.</P>
        </>
    ),
    para: (
        <>
            <H2>Il Sistema P.A.R.A.: Il Tuo Archivio Digitale</H2>
            <P>P.A.R.A. è un sistema semplice e universale per organizzare qualsiasi tipo di informazione digitale. Consiste in quattro categorie, che rappresentano gli unici quattro posti in cui le informazioni possono trovarsi.</P>
            <H3>P — Progetti (Projects)</H3>
            <P>Una serie di attività legate a un obiettivo con una scadenza. Qui è dove metti le informazioni relative alle cose su cui stai <Strong>lavorando attivamente in questo momento</Strong>.</P>
            <UL>
                <LI>Esempio: "Organizzare Festa di Natale"</LI>
                <LI>Esempio: "Completare Report Q3"</LI>
                <LI>Esempio: "Sviluppare nuova funzionalità"</LI>
            </UL>
            <H3>A — Aree (Areas)</H3>
            <P>Una sfera di attività con uno standard da mantenere nel tempo. Questi sono i domini della tua vita in cui hai una responsabilità continua.</P>
            <UL>
                <LI>Esempio: "Salute & Fitness"</LI>
                <LI>Esempio: "Finanze"</LI>
                <LI>Esempio: "Sviluppo di Carriera"</LI>
            </UL>
            <H3>R — Risorse (Resources)</H3>
            <P>Un argomento o un tema di interesse continuo. Qui è dove conservi le informazioni su argomenti di cui vuoi imparare o a cui fare riferimento in futuro.</P>
            <UL>
                <LI>Esempio: "Sviluppo Web"</LI>
                <LI>Esempio: "Giardinaggio"</LI>
                <LI>Esempio: "Filosofia Stoica"</LI>
            </UL>
            <H3>A — Archivi (Archives)</H3>
            <P>Elementi inattivi dalle altre tre categorie. Questo è il tuo archivio a freddo per tutto ciò che è completato, inattivo o non più rilevante.</P>
            <UL>
                <LI>Esempio: Un progetto completato.</LI>
                <LI>Esempio: Un'area che non stai più mantenendo.</LI>
                <LI>Esempio: Una risorsa a cui hai perso interesse.</LI>
            </UL>
        </>
    ),
    code: (
        <>
            <H2>Il Metodo C.O.D.E.: Il Tuo Flusso di Lavoro per la Conoscenza</H2>
            <P>C.O.D.E. è un processo in quattro fasi che descrive come le informazioni fluiscono attraverso il tuo Secondo Cervello, trasformando dati grezzi in output creativo.</P>
            <H3>C — Cattura (Capture)</H3>
            <P>Il primo passo è tirare fuori le idee dalla testa e metterle in un posto fidato. La tua <Strong>Posta in Arrivo (Inbox)</Strong> è la piattaforma di atterraggio digitale per ogni pensiero, idea, link o frammento che ti colpisce. Non preoccuparti ancora di dove appartiene—catturalo velocemente e vai avanti.</P>
            <H3>O — Organizza (Organize)</H3>
            <P>Periodicamente, rivedi la tua Posta in Arrivo e poniti la domanda chiave: "Dove va a finire questo in modo che possa trovarlo quando ne avrò bisogno?" Sposta ogni elemento nel contenitore P.A.R.A. appropriato. È per un progetto attivo? Un'area a lungo termine? O solo una risorsa generale? Questo passaggio rende le informazioni utilizzabili.</P>
            <H3>D — Distilla (Distill)</H3>
            <P>Questa è l'arte di trovare l'essenza. Le note grezze non sono molto utili. Nel tempo, rendi le tue note più preziose evidenziando i passaggi chiave, mettendo in grassetto i punti più importanti e, alla fine, scrivendo il tuo riassunto esecutivo in cima. Questa tecnica, chiamata <Strong>Riassunto Progressivo</Strong>, assicura che le tue migliori idee siano sempre visibili a colpo d'occhio.</P>
            <H3>E — Esprimi (Express)</H3>
            <P>Lo scopo ultimo di un Secondo Cervello non è solo archiviare informazioni, ma <Strong>usarle</Strong>. Esprimere significa trasformare la tua conoscenza curata in qualcosa di nuovo: una presentazione, un post sul blog, un piano di progetto, o anche solo un'opinione più informata in una conversazione. È qui che il tuo pensiero dà i suoi frutti.</P>
        </>
    ),
    home: <><H2>Utilizzo dell'App: Home</H2><P>La vista Home è la tua dashboard quotidiana, che fornisce una chiara panoramica delle tue priorità. Qui puoi trovare la tua lista di attività "La Mia Giornata", una casella di cattura rapida e liste di progetti e aree recenti per tornare rapidamente al tuo lavoro.</P></>,
    'projects-areas': <><H2>Utilizzo dell'App: Progetti e Aree</H2><P>Queste sono le viste organizzative principali. La vista Aree mostra i tuoi domini di vita di alto livello, e cliccando su un'Area si rivelano tutti i Progetti orientati a un obiettivo al suo interno. Questa struttura dall'alto verso il basso assicura che il tuo lavoro quotidiano (nei Progetti) sia sempre allineato con le tue responsabilità a lungo termine (nelle Aree).</P></>,
    tasks: <><H2>Utilizzo dell'App: Attività</H2><P>La vista "Tutte le Attività" fornisce una lista principale di ogni attività attiva in tutti i tuoi progetti. Puoi raggruppare le tue attività per Progetto, Priorità o Data di Scadenza, offrendoti modi potenti per pianificare il tuo lavoro e decidere su cosa concentrarti dopo.</P></>,
    'graph-view': <><H2>Utilizzo dell'App: Vista Grafo</H2><P>La Vista Grafo è uno strumento potente per la creatività e l'intuizione. Visualizza i tuoi appunti, progetti e aree come una rete interconnessa. Usala per scoprire relazioni inaspettate tra le idee e per vedere il quadro generale della tua conoscenza.</P></>,
    'weekly-review': <><H2>Utilizzo dell'App: Revisione Settimanale</H2><P>La Revisione Settimanale è un flusso di lavoro guidato che ti accompagna attraverso l'abitudine essenziale di mantenere il tuo Secondo Cervello. Ti spinge a svuotare la tua casella di posta, rivedere i tuoi progetti e le tue aree, e guardare avanti alle tue attività imminenti per assicurarti che nulla venga trascurato.</P></>,
    linking: <><H2>Avanzato: Collegare i Tuoi Pensieri</H2><P>Crea un wiki personale collegando gli appunti tra loro. Nell'editor di appunti, digita <Code>/</Code> per far apparire una lista di altri elementi nel tuo sistema. Selezionandone uno creerai un link diretto. Questo costruisce una rete di conoscenza, rendendo più facile navigare tra concetti correlati e costruire sul lavoro precedente.</P></>,
    tagging: <><H2>Avanzato: Etichettatura Efficace</H2><P>Le etichette (tag) sono un modo flessibile per aggiungere un ulteriore livello di organizzazione. Usale per denotare lo stato (<Code>#stato/in-corso</Code>), la fonte (<Code>#fonte/libro</Code>), o l'argomento (<Code>#argomento/psicologia</Code>). Questo ti permette di creare raccolte trasversali di elementi che si trovano in diversi contenitori P.A.R.A.</P></>,
     backup: (
        <>
            <H2>Backup e Ripristino: Proteggere la Tua Conoscenza</H2>
            <P>I dati del tuo Secondo Cervello sono memorizzati <Strong>esclusivamente nella memoria locale del tuo browser web</Strong>. Questo significa che i tuoi dati sono privati e veloci, ma comporta anche una responsabilità fondamentale: devi occuparti tu stesso del backup.</P>
            <Blockquote>Senza backup, cancellare la cache del browser, cambiare browser o computer comporterà la <Strong>perdita permanente dei dati</Strong>.</Blockquote>
            <H3>Come Mantenere i Tuoi Dati al Sicuro</H3>
            <P>Abbiamo reso semplice proteggere il tuo lavoro. Naviga alla vista <Code>Impostazioni</Code> per le seguenti opzioni:</P>
            <OL>
                <LI>
                    <Strong>Esporta Dati:</Strong> Questo è il tuo strumento di backup. Cliccando questo pulsante verrà generato un singolo file JSON (ad es. <Code>second-brain-backup-2024-10-26.json</Code>) che verrà scaricato sul tuo computer. Questo file è un'istantanea completa di tutto ciò che si trova nel tuo Secondo Cervello in quel momento.
                </LI>
                <LI>
                    <Strong>Importa Dati:</Strong> Questo è il tuo strumento di ripristino. Puoi selezionare un file JSON esportato in precedenza per caricarlo nell'applicazione.
                </LI>
            </OL>
            <H3>Importante: Come Funziona l'Importazione</H3>
            <P><Strong>ATTENZIONE:</Strong> L'importazione di un file di backup <Strong>sovrascriverà e sostituirà completamente tutti i dati attuali</Strong> nell'applicazione. Questa azione non può essere annullata. È come ripristinare il computer da un backup: lo stato precedente viene completamente sostituito dallo stato presente nel file.</P>
            <H3>La Nostra Raccomandazione</H3>
            <P>Prendi l'abitudine di esportare i tuoi dati regolarmente. Una buona pratica è farlo alla fine di ogni settimana come parte della tua Revisione Settimanale. Conserva i tuoi file di backup in un posto sicuro, come una cartella di archiviazione cloud (Dropbox, Google Drive) o un disco rigido esterno.</P>
        </>
    ),
};

const persianContentMap: Partial<Record<DocTopic, React.ReactNode>> = {
    overview: (
        <>
            <H2>مرور کلی: یک مغز دوم چیست؟</H2>
            <P>به مغز دوم خود خوش آمدید. این برنامه چیزی بیش از یک مکان برای ذخیره یادداشت‌هاست؛ این یک سیستم جامع است که برای کمک به شما در مدیریت جریان مداوم اطلاعات در زندگی‌تان طراحی شده است، تا ایده‌های پراکنده را به نتایج ملموس تبدیل کند.</P>
            <Blockquote>هدف فقط جمع‌آوری اطلاعات نیست، بلکه اتصال ایده‌ها و خلق دانش جدیدی است که به اهداف و جاه‌طلبی‌های شما خدمت کند.</Blockquote>
            <P>این برنامه بر اساس دو متدولوژی اثبات شده ساخته شده است:</P>
            <UL>
                <LI><Strong>سیستم P.A.R.A.:</Strong> یک روش ساده و قدرتمند برای سازماندهی تمام اطلاعات دیجیتال شما در چهار دسته قابل اجرا.</LI>
                <LI><Strong>متد C.O.D.E.:</Strong> یک گردش کار چهار مرحله‌ای برای پردازش اطلاعات، از ثبت اولیه تا بیان خلاقانه نهایی.</LI>
            </UL>
            <P>با استفاده از این سیستم، شما یک افزونه دیجیتال قابل اعتماد برای ذهن خود ایجاد خواهید کرد. دیگر هرگز یک ایده ارزشمند را از دست نخواهید داد و راهی ساختاریافته برای پیشرفت در مهم‌ترین مسائل زندگی خود خواهید داشت.</P>
        </>
    ),
    'getting-started': (
        <>
            <H2>شروع به کار: ۵ دقیقه اول شما</H2>
            <P>بیایید یک پیروزی فوری برای شما رقم بزنیم و گردش کار اصلی برنامه را نشان دهیم. این چهار مرحله ساده را دنبال کنید تا قدرت مغز دوم خود را تجربه کنید.</P>
            <OL>
                <LI>
                    <Strong>یک فکر گذرا را ثبت کنید.</Strong> روی دکمه بزرگ <Code>+</Code> در پایین سمت راست کلیک کنید (یا <Code>C</Code> را فشار دهید) تا نوار فرمان باز شود. «یادداشت جدید» را انتخاب کرده و اولین چیزی که به ذهنتان می‌رسد را بنویسید—یک ایده، یک نقل‌قول، یک یادآوری. این یادداشت به صندوق ورودی شما می‌رود.
                </LI>
                <LI>
                    <Strong>اولین حوزه خود را ایجاد کنید.</Strong> از نوار کناری به نمای «حوزه‌ها» بروید. یک حوزه، یک قلمرو طولانی‌مدت در زندگی شماست. روی «ایجاد حوزه جدید» کلیک کرده و یکی به نام <Strong>«رشد شخصی»</Strong> بسازید.
                </LI>
                <LI>
                    <Strong>اولین پروژه خود را تعریف کنید.</Strong> درون حوزه جدید خود، بخشی برای پروژه‌ها خواهید دید. یک پروژه هدفی مشخص دارد. روی «افزودن پروژه» کلیک کرده و یکی به نام <Strong>«یادگیری یک مهارت جدید»</Strong> بسازید.
                </LI>
                <LI>
                    <Strong>یک وظیفه قابل اجرا اضافه کنید.</Strong> حالا، در پروژه جدید خود، روی «افزودن وظیفه» کلیک کرده و یک کار مشخص و قابل اجرا ایجاد کنید، مانند <Strong>«تماشای یک آموزش ۱۰ دقیقه‌ای در مورد موضوعی که به آن علاقه‌مندم»</Strong>.
                </LI>
            </OL>
            <P>تبریک می‌گویم! شما به تازگی چرخه اصلی ثبت یک ایده، سازماندهی آن در یک پروژه مرتبط درون یک حوزه زندگی، و تعریف یک گام بعدی مشخص را تکمیل کرده‌اید. این عادت اساسی است که باعث شکوفایی مغز دوم شما خواهد شد.</P>
        </>
    ),
    para: (
        <>
            <H2>سیستم P.A.R.A.: کابینت فایل دیجیتال شما</H2>
            <P>P.A.R.A. یک سیستم ساده و جهانی برای سازماندهی هر نوع اطلاعات دیجیتال است. این سیستم از چهار دسته تشکیل شده است که تنها چهار مکانی هستند که اطلاعات می‌توانند در آن قرار بگیرند.</P>
            <H3>P — پروژه‌ها (Projects)</H3>
            <P>مجموعه‌ای از وظایف مرتبط با یک هدف که دارای مهلت زمانی مشخصی است. اینجا جایی است که اطلاعات مربوط به چیزهایی را قرار می‌دهید که <Strong>همین الان فعالانه روی آن‌ها کار می‌کنید</Strong>.</P>
            <UL>
                <LI>مثال: «برنامه‌ریزی مهمانی تعطیلات»</LI>
                <LI>مثال: «تکمیل گزارش سه ماهه سوم»</LI>
                <LI>مثال: «توسعه ویژگی جدید»</LI>
            </UL>
            <H3>A — حوزه‌ها (Areas)</H3>
            <P>یک حوزه فعالیت با استانداردی که باید در طول زمان حفظ شود. این‌ها قلمروهای زندگی شما هستند که در آن‌ها مسئولیت مداوم دارید.</P>
            <UL>
                <LI>مثال: «سلامتی و تناسب اندام»</LI>
                <LI>مثال: «امور مالی»</LI>
                <LI>مثال: «توسعه شغلی»</LI>
            </UL>
            <H3>R — منابع (Resources)</H3>
            <P>یک موضوع یا زمینه مورد علاقه مداوم. اینجا جایی است که اطلاعاتی را در مورد موضوعاتی که می‌خواهید یاد بگیرید یا در آینده به آن‌ها مراجعه کنید، نگهداری می‌کنید.</P>
            <UL>
                <LI>مثال: «توسعه وب»</LI>
                <LI>مثال: «باغبانی»</LI>
                <LI>مثال: «فلسفه رواقی»</LI>
            </UL>
            <H3>A — بایگانی‌ها (Archives)</H3>
            <P>موارد غیرفعال از سه دسته دیگر. این انبار سرد شما برای هر چیزی است که تکمیل شده، غیرفعال است یا دیگر مرتبط نیست.</P>
            <UL>
                <LI>مثال: یک پروژه تکمیل شده.</LI>
                <LI>مثال: حوزه‌ای که دیگر آن را دنبال نمی‌کنید.</LI>
                <LI>مثال: منبعی که دیگر به آن علاقه ندارید.</LI>
            </UL>
        </>
    ),
    code: (
        <>
            <H2>متد C.O.D.E.: گردش کار دانش شما</H2>
            <P>C.O.D.E. یک فرآیند چهار مرحله‌ای است که نشان می‌دهد اطلاعات چگونه در مغز دوم شما جریان می‌یابد و داده‌های خام را به خروجی خلاقانه تبدیل می‌کند.</P>
            <H3>C — ثبت (Capture)</H3>
            <P>اولین قدم این است که ایده‌ها را از ذهن خود خارج کرده و به مکانی قابل اعتماد منتقل کنید. <Strong>صندوق ورودی</Strong> شما سکوی فرود دیجیتال برای هر فکر، ایده، لینک یا قطعه‌ای است که برای شما جالب است. نگران نباشید که به کجا تعلق دارد—فقط آن را سریع ثبت کنید و ادامه دهید.</P>
            <H3>O — سازماندهی (Organize)</H3>
            <P>به صورت دوره‌ای، صندوق ورودی خود را مرور کنید و این سؤال کلیدی را بپرسید: «این مورد کجا باید برود تا وقتی به آن نیاز داشتم، پیدایش کنم؟» هر مورد را به سطل مناسب P.A.R.A. منتقل کنید. آیا برای یک پروژه فعال است؟ یک حوزه بلندمدت؟ یا فقط یک منبع عمومی؟ این مرحله اطلاعات را قابل اجرا می‌کند.</P>
            <H3>D — تقطیر (Distill)</H3>
            <P>این هنر یافتن جوهره است. یادداشت‌های خام چندان مفید نیستند. با گذشت زمان، با برجسته کردن قسمت‌های کلیدی، پررنگ کردن مهم‌ترین نکات و در نهایت، نوشتن خلاصه اجرایی خود در بالای آن، یادداشت‌های خود را ارزشمندتر کنید. این تکنیک، که <Strong>خلاصه‌سازی تدریجی</Strong> نامیده می‌شود، تضمین می‌کند که بهترین ایده‌های شما همیشه در یک نگاه قابل مشاهده باشند.</P>
            <H3>E — بیان (Express)</H3>
            <P>هدف نهایی یک مغز دوم فقط ذخیره اطلاعات نیست، بلکه <Strong>استفاده از آن</Strong> است. بیان یعنی تبدیل دانش مدیریت‌شده خود به چیزی جدید: یک ارائه، یک پست وبلاگ، یک برنامه پروژه، یا حتی فقط یک نظر آگاهانه‌تر در یک گفتگو. اینجاست که تفکر شما نتیجه می‌دهد.</P>
        </>
    ),
    home: <><H2>استفاده از برنامه: خانه</H2><P>نمای خانه داشبورد روزانه شماست که یک نمای کلی واضح از اولویت‌های شما ارائه می‌دهد. در اینجا می‌توانید لیست وظایف «امروز من»، یک کادر ثبت سریع، و لیست پروژه‌ها و حوزه‌های اخیر را برای بازگشت سریع به کار خود پیدا کنید.</P></>,
    'projects-areas': <><H2>استفاده از برنامه: پروژه‌ها و حوزه‌ها</H2><P>این‌ها نماهای اصلی سازمانی هستند. نمای حوزه‌ها دامنه‌های سطح بالای زندگی شما را نشان می‌دهد و با کلیک بر روی یک حوزه، تمام پروژه‌های هدف‌محور درون آن آشکار می‌شود. این ساختار بالا به پایین تضمین می‌کند که کارهای روزمره شما (در پروژه‌ها) همیشه با مسئولیت‌های بلندمدت شما (در حوزه‌ها) همسو باشد.</P></>,
    tasks: <><H2>استفاده از برنامه: وظایف</H2><P>نمای «همه وظایف» یک لیست اصلی از تمام وظایف فعال در همه پروژه‌های شما را ارائه می‌دهد. شما می‌توانید وظایف خود را بر اساس پروژه، اولویت یا تاریخ سررسید گروه‌بندی کنید، که راه‌های قدرتمندی برای برنامه‌ریزی کارهایتان و تصمیم‌گیری برای تمرکز بعدی به شما می‌دهد.</P></>,
    'graph-view': <><H2>استفاده از برنامه: نمای گراف</H2><P>نمای گراف یک ابزار قدرتمند برای خلاقیت و بینش است. این نما یادداشت‌ها، پروژه‌ها و حوزه‌های شما را به عنوان یک شبکه به هم پیوسته تجسم می‌کند. از آن برای کشف روابط غیرمنتظره بین ایده‌ها و دیدن تصویر بزرگتر دانش خود استفاده کنید.</P></>,
    'weekly-review': <><H2>استفاده از برنامه: مرور هفتگی</H2><P>مرور هفتگی یک گردش کار هدایت‌شده است که شما را در عادت ضروری نگهداری از مغز دومتان راهنمایی می‌کند. این شما را ترغیب می‌کند که صندوق ورودی خود را پاک کنید، پروژه‌ها و حوزه‌های خود را مرور کنید و به وظایف آینده خود نگاهی بیندازید تا اطمینان حاصل کنید که هیچ چیزی از قلم نیفتد.</P></>,
    linking: <><H2>پیشرفته: پیوند دادن افکار</H2><P>با پیوند دادن یادداشت‌ها به یکدیگر، یک ویکی شخصی ایجاد کنید. در ویرایشگر یادداشت، <Code>/</Code> را تایپ کنید تا لیستی از موارد دیگر در سیستم شما ظاهر شود. انتخاب یکی از آن‌ها یک پیوند مستقیم ایجاد می‌کند. این کار شبکه‌ای از دانش می‌سازد و پیمایش بین مفاهیم مرتبط و بنا نهادن بر روی کارهای قبلی را آسان‌تر می‌کند.</P></>,
    tagging: <><H2>پیشرفته: تگ‌گذاری مؤثر</H2><P>تگ‌ها یک روش انعطاف‌پذیر برای افزودن یک لایه دیگر از سازماندهی هستند. از آن‌ها برای مشخص کردن وضعیت (<Code>#وضعیت/در-جریان</Code>)، منبع (<Code>#منبع/کتاب</Code>) یا موضوع (<Code>#موضوع/روانشناسی</Code>) استفاده کنید. این به شما امکان می‌دهد مجموعه‌های متقاطعی از موارد را ایجاد کنید که در سطل‌های مختلف P.A.R.A. قرار دارند.</P></>,
    backup: (
        <>
            <H2>پشتیبان‌گیری و بازیابی: حفاظت از دانش شما</H2>
            <P>اطلاعات مغز دوم شما <Strong>منحصراً در حافظه محلی مرورگر وب شما</Strong> ذخیره می‌شود. این بدان معناست که داده‌های شما خصوصی و سریع هستند، اما همچنین با یک مسئولیت حیاتی همراه است: شما باید خودتان از آن پشتیبان‌گیری کنید.</P>
            <Blockquote>بدون پشتیبان‌گیری، پاک کردن حافظه پنهان مرورگر، تغییر مرورگر یا تعویض کامپیوتر منجر به <Strong>از دست رفتن دائمی داده‌ها</Strong> خواهد شد.</Blockquote>
            <H3>چگونه داده‌های خود را ایمن نگه داریم</H3>
            <P>ما محافظت از کار شما را ساده کرده‌ایم. برای گزینه‌های زیر به نمای <Code>تنظیمات</Code> بروید:</P>
            <OL>
                <LI>
                    <Strong>صادر کردن داده‌ها:</Strong> این ابزار پشتیبان‌گیری شماست. با کلیک بر روی این دکمه، یک فایل JSON واحد (مانند <Code>second-brain-backup-2024-10-26.json</Code>) ایجاد و در کامپیوتر شما دانلود می‌شود. این فایل یک عکس فوری کامل از همه چیز در مغز دوم شما در آن لحظه است.
                </LI>
                <LI>
                    <Strong>وارد کردن داده‌ها:</Strong> این ابزار بازیابی شماست. شما می‌توانید یک فایل JSON که قبلاً صادر شده را برای بارگذاری در برنامه انتخاب کنید.
                </LI>
            </OL>
            <H3>مهم: نحوه کار وارد کردن</H3>
            <P><Strong>هشدار:</Strong> وارد کردن یک فایل پشتیبان، <Strong>تمام داده‌های فعلی را به طور کامل بازنویسی و جایگزین می‌کند</Strong> در برنامه. این عمل قابل بازگشت نیست. مانند بازیابی کامپیوتر از یک پشتیبان است—وضعیت قدیمی به طور کامل با وضعیت موجود در فایل جایگزین می‌شود.</P>
            <H3>توصیه ما</H3>
            <P>عادت کنید که داده‌های خود را به طور منظم صادر کنید. یک عمل خوب این است که آن را در پایان هر هفته به عنوان بخشی از بررسی هفتگی خود انجام دهید. فایل‌های پشتیبان خود را در مکانی امن، مانند یک پوشه ذخیره‌سازی ابری (دراپ‌باکس، گوگل درایو) یا یک هارد دیسک خارجی ذخیره کنید.</P>
        </>
    ),
};

const contentMaps: Record<Lang, Partial<Record<DocTopic, React.ReactNode>>> = {
    en: contentMap,
    it: italianContentMap,
    fa: persianContentMap,
};

export const getTopicContent = (topicId: DocTopic, lang: Lang): React.ReactNode => {
    // 1. Try to get content for the selected language
    const langContent = contentMaps[lang]?.[topicId];
    if (langContent) {
        return langContent;
    }

    // 2. Fallback to English content if available
    const englishContent = contentMap[topicId];
    if (englishContent) {
        return englishContent;
    }
    
    // 3. Fallback to a "Coming Soon" message
    const topic = DOC_STRUCTURE.flatMap(s => s.topics).find(t => t.id === topicId);
    const label = topic ? (topic.label[lang] || topic.label['en']) : "Content";
    const comingSoonText = lang === 'it' ? 'Traduzione in arrivo...' : lang === 'fa' ? 'محتوا به زودی...' : 'Content coming soon...';

    return (
        <>
            <H2>{label}</H2>
            <P>{comingSoonText}</P>
        </>
    );
};