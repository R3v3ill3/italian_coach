export interface VocabItem {
  id: string
  it: string
  en: string
  emoji: string
}

export interface Phrase {
  id: string
  it: string
  en: string
}

export interface DialogueLine {
  speaker: string
  it: string
  en: string
}

export interface QuizQuestion {
  q: string
  options: string[]
  answer: number
}

export interface Reading {
  title: string
  sentences: Array<{ it: string; en: string }>
}

export interface Unit {
  id: string
  order: number
  title: string
  titleEn: string
  emoji: string
  cefr: string
  intro: string
  vocab: VocabItem[]
  phrases: Phrase[]
  dialogueTitle: string
  dialogue: DialogueLine[]
  quiz: QuizQuestion[]
  reading: Reading
}

export const UNITS: Unit[] = [
  {
    id: 'saluti',
    order: 1,
    title: 'Saluti e presentazioni',
    titleEn: 'Greetings & introductions',
    emoji: '👋',
    cefr: 'A1',
    intro: 'The essentials: greeting people, introducing yourself, and the polite words Italians use constantly.',
    vocab: [
      { id: 'saluti-ciao', it: 'ciao', en: 'hi / bye (informal)', emoji: '👋' },
      { id: 'saluti-buongiorno', it: 'buongiorno', en: 'good morning', emoji: '🌅' },
      { id: 'saluti-buonasera', it: 'buonasera', en: 'good evening', emoji: '🌆' },
      { id: 'saluti-buonanotte', it: 'buonanotte', en: 'good night', emoji: '🌙' },
      { id: 'saluti-arrivederci', it: 'arrivederci', en: 'goodbye (polite)', emoji: '🚶' },
      { id: 'saluti-grazie', it: 'grazie', en: 'thank you', emoji: '🙏' },
      { id: 'saluti-prego', it: 'prego', en: "you're welcome", emoji: '🤝' },
      { id: 'saluti-perfavore', it: 'per favore', en: 'please', emoji: '🤲' },
      { id: 'saluti-si', it: 'sì', en: 'yes', emoji: '✅' },
      { id: 'saluti-no', it: 'no', en: 'no', emoji: '❌' },
      { id: 'saluti-scusi', it: 'scusi', en: 'excuse me (formal)', emoji: '🙋' },
      { id: 'saluti-piacere', it: 'piacere', en: 'nice to meet you', emoji: '😊' },
    ],
    phrases: [
      { id: 'saluti-p1', it: 'Mi chiamo Marco.', en: 'My name is Marco.' },
      { id: 'saluti-p2', it: 'Come ti chiami?', en: "What's your name?" },
      { id: 'saluti-p3', it: 'Come stai?', en: 'How are you?' },
      { id: 'saluti-p4', it: 'Sto bene, grazie.', en: "I'm well, thanks." },
      { id: 'saluti-p5', it: 'Sono australiano.', en: "I'm Australian." },
      { id: 'saluti-p6', it: "Vengo dall'Australia.", en: 'I come from Australia.' },
      { id: 'saluti-p7', it: "Non parlo bene l'italiano.", en: "I don't speak Italian well." },
      { id: 'saluti-p8', it: 'Può parlare più lentamente?', en: 'Can you speak more slowly?' },
    ],
    dialogueTitle: 'Un incontro al bar',
    dialogue: [
      { speaker: 'Marco', it: 'Buongiorno!', en: 'Good morning!' },
      { speaker: 'Anna', it: 'Buongiorno! Come ti chiami?', en: "Good morning! What's your name?" },
      { speaker: 'Marco', it: 'Mi chiamo Marco. E tu?', en: 'My name is Marco. And you?' },
      { speaker: 'Anna', it: 'Io sono Anna. Piacere!', en: "I'm Anna. Nice to meet you!" },
      { speaker: 'Marco', it: 'Piacere mio. Di dove sei?', en: 'My pleasure. Where are you from?' },
      { speaker: 'Anna', it: 'Sono di Roma. E tu?', en: "I'm from Rome. And you?" },
      { speaker: 'Marco', it: "Vengo dall'Australia.", en: 'I come from Australia.' },
      { speaker: 'Anna', it: 'Che bello! Benvenuto in Italia!', en: 'How lovely! Welcome to Italy!' },
    ],
    quiz: [
      { q: 'What does Anna ask Marco first?', options: ['His age', 'His name', 'Where he is from'], answer: 1 },
      { q: 'Where is Anna from?', options: ['Milan', 'Naples', 'Rome'], answer: 2 },
      { q: 'What does “piacere” mean?', options: ['Please', 'Nice to meet you', 'See you later'], answer: 1 },
    ],
    reading: {
      title: 'Mi presento',
      sentences: [
        { it: 'Ciao! Mi chiamo Troy.', en: 'Hi! My name is Troy.' },
        { it: 'Sono australiano e ho cinquantotto anni.', en: "I'm Australian and I'm fifty-eight years old." },
        { it: 'Abito in Australia, vicino al mare.', en: 'I live in Australia, near the sea.' },
        { it: "Studio l'italiano perché amo l'Italia.", en: "I'm studying Italian because I love Italy." },
        { it: "Parlo un po' di italiano, ma capisco molto.", en: 'I speak a little Italian, but I understand a lot.' },
        { it: 'Piacere di conoscerti!', en: 'Nice to meet you!' },
      ],
    },
  },
  {
    id: 'bar',
    order: 2,
    title: 'Al bar',
    titleEn: 'At the café',
    emoji: '☕',
    cefr: 'A1',
    intro: 'Order like a local: coffee, pastries and paying the bill — the most useful ten minutes of Italian you will learn.',
    vocab: [
      { id: 'bar-caffe', it: 'il caffè', en: 'the (espresso) coffee', emoji: '☕' },
      { id: 'bar-cappuccino', it: 'il cappuccino', en: 'the cappuccino', emoji: '☕🥛' },
      { id: 'bar-te', it: 'il tè', en: 'the tea', emoji: '🍵' },
      { id: 'bar-acqua', it: "l'acqua", en: 'the water', emoji: '💧' },
      { id: 'bar-latte', it: 'il latte', en: 'the milk', emoji: '🥛' },
      { id: 'bar-birra', it: 'la birra', en: 'the beer', emoji: '🍺' },
      { id: 'bar-vino', it: 'il vino', en: 'the wine', emoji: '🍷' },
      { id: 'bar-cornetto', it: 'il cornetto', en: 'the croissant', emoji: '🥐' },
      { id: 'bar-panino', it: 'il panino', en: 'the sandwich', emoji: '🥪' },
      { id: 'bar-zucchero', it: 'lo zucchero', en: 'the sugar', emoji: '🍬' },
      { id: 'bar-conto', it: 'il conto', en: 'the bill', emoji: '🧾' },
      { id: 'bar-tavolo', it: 'il tavolo', en: 'the table', emoji: '🪑' },
    ],
    phrases: [
      { id: 'bar-p1', it: 'Un caffè, per favore.', en: 'A coffee, please.' },
      { id: 'bar-p2', it: 'Vorrei un cappuccino.', en: 'I would like a cappuccino.' },
      { id: 'bar-p3', it: 'Quanto costa?', en: 'How much does it cost?' },
      { id: 'bar-p4', it: 'Il conto, per favore.', en: 'The bill, please.' },
      { id: 'bar-p5', it: "Un bicchiere d'acqua, per favore.", en: 'A glass of water, please.' },
      { id: 'bar-p6', it: 'Posso pagare con la carta?', en: 'Can I pay by card?' },
    ],
    dialogueTitle: 'La colazione',
    dialogue: [
      { speaker: 'Barista', it: 'Buongiorno! Cosa desidera?', en: 'Good morning! What would you like?' },
      { speaker: 'Troy', it: 'Buongiorno. Un cappuccino e un cornetto, per favore.', en: 'Good morning. A cappuccino and a croissant, please.' },
      { speaker: 'Barista', it: "Certo. Qualcos'altro?", en: 'Of course. Anything else?' },
      { speaker: 'Troy', it: "Un bicchiere d'acqua, grazie.", en: 'A glass of water, thanks.' },
      { speaker: 'Barista', it: 'Subito!', en: 'Right away!' },
      { speaker: 'Troy', it: 'Quanto costa?', en: 'How much is it?' },
      { speaker: 'Barista', it: 'Sono cinque euro.', en: "That's five euros." },
      { speaker: 'Troy', it: 'Ecco a Lei. Grazie!', en: 'Here you are. Thank you!' },
    ],
    quiz: [
      { q: 'What does Troy order?', options: ['A coffee and a sandwich', 'A cappuccino and a croissant', 'A tea and a croissant'], answer: 1 },
      { q: 'How much does it cost?', options: ['Five euros', 'Ten euros', 'Two euros'], answer: 0 },
      { q: 'What does “Qualcos\'altro?” mean?', options: ['Anything else?', 'How are you?', 'Is that all?'], answer: 0 },
    ],
    reading: {
      title: 'La colazione italiana',
      sentences: [
        { it: 'In Italia, la colazione è dolce e veloce.', en: 'In Italy, breakfast is sweet and quick.' },
        { it: 'Molti italiani prendono un caffè al bar.', en: 'Many Italians have a coffee at the bar.' },
        { it: 'Il cappuccino è solo per la mattina!', en: 'Cappuccino is only for the morning!' },
        { it: 'Dopo pranzo, gli italiani bevono un espresso.', en: 'After lunch, Italians drink an espresso.' },
        { it: 'Il cornetto è il dolce preferito per la colazione.', en: 'The cornetto is the favourite breakfast pastry.' },
      ],
    },
  },
  {
    id: 'numeri',
    order: 3,
    title: 'I numeri e i prezzi',
    titleEn: 'Numbers & prices',
    emoji: '💶',
    cefr: 'A1',
    intro: 'Numbers unlock prices, times, tickets and phone numbers. Get one to ten automatic and everything else follows.',
    vocab: [
      { id: 'num-uno', it: 'uno', en: 'one', emoji: '1️⃣' },
      { id: 'num-due', it: 'due', en: 'two', emoji: '2️⃣' },
      { id: 'num-tre', it: 'tre', en: 'three', emoji: '3️⃣' },
      { id: 'num-quattro', it: 'quattro', en: 'four', emoji: '4️⃣' },
      { id: 'num-cinque', it: 'cinque', en: 'five', emoji: '5️⃣' },
      { id: 'num-sei', it: 'sei', en: 'six', emoji: '6️⃣' },
      { id: 'num-sette', it: 'sette', en: 'seven', emoji: '7️⃣' },
      { id: 'num-otto', it: 'otto', en: 'eight', emoji: '8️⃣' },
      { id: 'num-nove', it: 'nove', en: 'nine', emoji: '9️⃣' },
      { id: 'num-dieci', it: 'dieci', en: 'ten', emoji: '🔟' },
      { id: 'num-cento', it: 'cento', en: 'one hundred', emoji: '💯' },
      { id: 'num-euro', it: "l'euro", en: 'the euro', emoji: '💶' },
    ],
    phrases: [
      { id: 'num-p1', it: 'Quanto costa questo?', en: 'How much is this?' },
      { id: 'num-p2', it: 'Costa dieci euro.', en: 'It costs ten euros.' },
      { id: 'num-p3', it: 'Sono venti euro in tutto.', en: "That's twenty euros in total." },
      { id: 'num-p4', it: 'Ho due biglietti.', en: 'I have two tickets.' },
      { id: 'num-p5', it: 'Un tavolo per quattro, per favore.', en: 'A table for four, please.' },
    ],
    dialogueTitle: 'Al mercato delle cartoline',
    dialogue: [
      { speaker: 'Venditrice', it: 'Buongiorno! Mi dica.', en: 'Good morning! How can I help?' },
      { speaker: 'Troy', it: 'Quanto costano queste cartoline?', en: 'How much are these postcards?' },
      { speaker: 'Venditrice', it: 'Una cartolina costa due euro.', en: 'One postcard costs two euros.' },
      { speaker: 'Troy', it: 'Prendo tre cartoline, per favore.', en: "I'll take three postcards, please." },
      { speaker: 'Venditrice', it: 'Sono sei euro.', en: "That's six euros." },
      { speaker: 'Troy', it: 'Ecco dieci euro.', en: "Here's ten euros." },
      { speaker: 'Venditrice', it: 'E quattro euro di resto. Grazie!', en: 'And four euros change. Thank you!' },
    ],
    quiz: [
      { q: 'How much does one postcard cost?', options: ['One euro', 'Two euros', 'Three euros'], answer: 1 },
      { q: 'How many postcards does Troy buy?', options: ['Two', 'Three', 'Four'], answer: 1 },
      { q: 'How much change does he get?', options: ['Four euros', 'Six euros', 'Ten euros'], answer: 0 },
    ],
    reading: {
      title: 'I prezzi in Italia',
      sentences: [
        { it: 'Un caffè al banco costa circa un euro e venti.', en: 'A coffee at the counter costs about €1.20.' },
        { it: 'Al tavolo, il caffè costa di più.', en: 'At a table, coffee costs more.' },
        { it: "Un biglietto dell'autobus costa due euro.", en: 'A bus ticket costs two euros.' },
        { it: 'Una pizza margherita costa circa otto euro.', en: 'A margherita pizza costs about eight euros.' },
        { it: 'Il coperto è il prezzo del tavolo al ristorante.', en: 'The “coperto” is the table charge at a restaurant.' },
      ],
    },
  },
  {
    id: 'ristorante',
    order: 4,
    title: 'Al ristorante',
    titleEn: 'At the restaurant',
    emoji: '🍝',
    cefr: 'A1+',
    intro: 'Navigate a real Italian menu — antipasto to dolce — and order with confidence. Pairs perfectly with the camera Lens on menus.',
    vocab: [
      { id: 'rist-menu', it: 'il menù', en: 'the menu', emoji: '📋' },
      { id: 'rist-antipasto', it: "l'antipasto", en: 'the starter', emoji: '🫒' },
      { id: 'rist-primo', it: 'il primo', en: 'the first course (pasta)', emoji: '🍝' },
      { id: 'rist-secondo', it: 'il secondo', en: 'the main course', emoji: '🥩' },
      { id: 'rist-contorno', it: 'il contorno', en: 'the side dish', emoji: '🥗' },
      { id: 'rist-dolce', it: 'il dolce', en: 'the dessert', emoji: '🍰' },
      { id: 'rist-pesce', it: 'il pesce', en: 'the fish', emoji: '🐟' },
      { id: 'rist-pollo', it: 'il pollo', en: 'the chicken', emoji: '🍗' },
      { id: 'rist-formaggio', it: 'il formaggio', en: 'the cheese', emoji: '🧀' },
      { id: 'rist-gelato', it: 'il gelato', en: 'the ice cream', emoji: '🍨' },
      { id: 'rist-pizza', it: 'la pizza', en: 'the pizza', emoji: '🍕' },
      { id: 'rist-pane', it: 'il pane', en: 'the bread', emoji: '🍞' },
    ],
    phrases: [
      { id: 'rist-p1', it: 'Un tavolo per due, per favore.', en: 'A table for two, please.' },
      { id: 'rist-p2', it: 'Vorrei vedere il menù.', en: "I'd like to see the menu." },
      { id: 'rist-p3', it: 'Che cosa mi consiglia?', en: 'What do you recommend?' },
      { id: 'rist-p4', it: 'Prendo la pasta al pomodoro.', en: "I'll have the pasta with tomato." },
      { id: 'rist-p5', it: 'Era tutto buonissimo!', en: 'Everything was delicious!' },
      { id: 'rist-p6', it: 'Il conto, per favore.', en: 'The bill, please.' },
    ],
    dialogueTitle: 'Una cena a Roma',
    dialogue: [
      { speaker: 'Cameriere', it: 'Buonasera! Avete prenotato?', en: 'Good evening! Do you have a booking?' },
      { speaker: 'Troy', it: 'Sì, un tavolo per due a nome Troy.', en: 'Yes, a table for two under Troy.' },
      { speaker: 'Cameriere', it: 'Perfetto, seguitemi. Ecco il menù.', en: "Perfect, follow me. Here's the menu." },
      { speaker: 'Troy', it: 'Grazie. Che cosa mi consiglia?', en: 'Thank you. What do you recommend?' },
      { speaker: 'Cameriere', it: 'Il pesce è freschissimo oggi.', en: 'The fish is very fresh today.' },
      { speaker: 'Troy', it: 'Allora prendo il pesce, con un contorno di verdure.', en: "Then I'll have the fish, with a side of vegetables." },
      { speaker: 'Cameriere', it: 'Ottima scelta! E da bere?', en: 'Excellent choice! And to drink?' },
      { speaker: 'Troy', it: 'Un bicchiere di vino bianco, grazie.', en: 'A glass of white wine, thanks.' },
    ],
    quiz: [
      { q: 'What name is the booking under?', options: ['Marco', 'Troy', 'Anna'], answer: 1 },
      { q: 'What does the waiter recommend?', options: ['The chicken', 'The pizza', 'The fish'], answer: 2 },
      { q: 'What does Troy order to drink?', options: ['White wine', 'Red wine', 'Beer'], answer: 0 },
    ],
    reading: {
      title: 'Come si mangia in Italia',
      sentences: [
        { it: 'La cena italiana ha molte portate.', en: 'An Italian dinner has many courses.' },
        { it: "Si comincia con l'antipasto.", en: 'You start with the starter.' },
        { it: 'Il primo è di solito pasta o risotto.', en: 'The first course is usually pasta or risotto.' },
        { it: 'Il secondo è carne o pesce, con un contorno.', en: 'The main is meat or fish, with a side dish.' },
        { it: "Alla fine, c'è il dolce e un caffè.", en: "At the end, there's dessert and a coffee." },
        { it: 'Buon appetito!', en: 'Enjoy your meal!' },
      ],
    },
  },
  {
    id: 'citta',
    order: 5,
    title: 'In giro per la città',
    titleEn: 'Around town',
    emoji: '🗺️',
    cefr: 'A1+',
    intro: 'Directions, transport and the signs you will see everywhere. Use the Lens on real signs and practise saying them.',
    vocab: [
      { id: 'citta-stazione', it: 'la stazione', en: 'the station', emoji: '🚉' },
      { id: 'citta-treno', it: 'il treno', en: 'the train', emoji: '🚆' },
      { id: 'citta-autobus', it: "l'autobus", en: 'the bus', emoji: '🚌' },
      { id: 'citta-biglietto', it: 'il biglietto', en: 'the ticket', emoji: '🎫' },
      { id: 'citta-uscita', it: "l'uscita", en: 'the exit', emoji: '🚪' },
      { id: 'citta-aperto', it: 'aperto', en: 'open', emoji: '🟢' },
      { id: 'citta-chiuso', it: 'chiuso', en: 'closed', emoji: '🔴' },
      { id: 'citta-bagno', it: 'il bagno', en: 'the toilet', emoji: '🚻' },
      { id: 'citta-farmacia', it: 'la farmacia', en: 'the pharmacy', emoji: '💊' },
      { id: 'citta-destra', it: 'a destra', en: 'to the right', emoji: '👉' },
      { id: 'citta-sinistra', it: 'a sinistra', en: 'to the left', emoji: '👈' },
      { id: 'citta-dritto', it: 'dritto', en: 'straight ahead', emoji: '⬆️' },
    ],
    phrases: [
      { id: 'citta-p1', it: "Dov'è la stazione?", en: 'Where is the station?' },
      { id: 'citta-p2', it: 'Gira a destra.', en: 'Turn right.' },
      { id: 'citta-p3', it: 'Vai sempre dritto.', en: 'Go straight ahead.' },
      { id: 'citta-p4', it: 'È lontano da qui?', en: 'Is it far from here?' },
      { id: 'citta-p5', it: 'A che ora parte il treno?', en: 'What time does the train leave?' },
      { id: 'citta-p6', it: 'Un biglietto per Firenze, per favore.', en: 'A ticket to Florence, please.' },
    ],
    dialogueTitle: 'Chiedere indicazioni',
    dialogue: [
      { speaker: 'Troy', it: "Scusi, dov'è la stazione?", en: 'Excuse me, where is the station?' },
      { speaker: 'Passante', it: 'È vicino. Vai sempre dritto.', en: "It's close. Go straight ahead." },
      { speaker: 'Troy', it: 'E poi?', en: 'And then?' },
      { speaker: 'Passante', it: 'Poi gira a sinistra, dopo la farmacia.', en: 'Then turn left, after the pharmacy.' },
      { speaker: 'Troy', it: 'È lontano?', en: 'Is it far?' },
      { speaker: 'Passante', it: 'No, cinque minuti a piedi.', en: 'No, five minutes on foot.' },
      { speaker: 'Troy', it: 'Grazie mille!', en: 'Thanks a million!' },
      { speaker: 'Passante', it: 'Prego, buona giornata!', en: "You're welcome, have a good day!" },
    ],
    quiz: [
      { q: 'What is the first direction Troy is given?', options: ['Turn left', 'Go straight ahead', 'Turn right'], answer: 1 },
      { q: 'Where should he turn left?', options: ['After the pharmacy', 'After the bank', 'At the station'], answer: 0 },
      { q: 'How far is the station?', options: ['Twenty minutes by bus', 'Five minutes on foot', 'Two kilometres'], answer: 1 },
    ],
    reading: {
      title: 'I cartelli in Italia',
      sentences: [
        { it: 'Quando cammini in città, leggi i cartelli.', en: 'When you walk around town, read the signs.' },
        { it: '«Uscita» e «entrata» sono su porte e stazioni.', en: '“Exit” and “entrance” are on doors and stations.' },
        { it: '«Spingere» vuol dire push; «tirare» vuol dire pull.', en: '“Spingere” means push; “tirare” means pull.' },
        { it: 'Molti negozi sono chiusi la domenica.', en: 'Many shops are closed on Sundays.' },
        { it: '«Vietato fumare» significa che non puoi fumare.', en: '“Vietato fumare” means you cannot smoke.' },
        { it: 'Usa la fotocamera per tradurre i cartelli!', en: 'Use the camera to translate the signs!' },
      ],
    },
  },
  {
    id: 'spesa',
    order: 6,
    title: 'Fare la spesa',
    titleEn: 'Shopping for food',
    emoji: '🛒',
    cefr: 'A1+',
    intro: 'Markets and supermarkets: quantities, freshness and the friendly back-and-forth of buying food in Italy.',
    vocab: [
      { id: 'spesa-mercato', it: 'il mercato', en: 'the market', emoji: '🧺' },
      { id: 'spesa-supermercato', it: 'il supermercato', en: 'the supermarket', emoji: '🛒' },
      { id: 'spesa-frutta', it: 'la frutta', en: 'the fruit', emoji: '🍇' },
      { id: 'spesa-verdura', it: 'la verdura', en: 'the vegetables', emoji: '🥦' },
      { id: 'spesa-mela', it: 'la mela', en: 'the apple', emoji: '🍎' },
      { id: 'spesa-pomodoro', it: 'il pomodoro', en: 'the tomato', emoji: '🍅' },
      { id: 'spesa-uova', it: 'le uova', en: 'the eggs', emoji: '🥚' },
      { id: 'spesa-prosciutto', it: 'il prosciutto', en: 'the prosciutto', emoji: '🥓' },
      { id: 'spesa-chilo', it: 'un chilo', en: 'a kilo', emoji: '⚖️' },
      { id: 'spesa-etto', it: 'un etto', en: '100 grams', emoji: '🤏' },
      { id: 'spesa-fresco', it: 'fresco', en: 'fresh', emoji: '✨' },
      { id: 'spesa-sacchetto', it: 'il sacchetto', en: 'the bag', emoji: '🛍️' },
    ],
    phrases: [
      { id: 'spesa-p1', it: 'Vorrei un chilo di mele.', en: "I'd like a kilo of apples." },
      { id: 'spesa-p2', it: 'Due etti di prosciutto, per favore.', en: '200 grams of prosciutto, please.' },
      { id: 'spesa-p3', it: "Quant'è in tutto?", en: 'How much is it altogether?' },
      { id: 'spesa-p4', it: 'È fresco il pesce?', en: 'Is the fish fresh?' },
      { id: 'spesa-p5', it: 'Serve un sacchetto?', en: 'Do you need a bag?' },
      { id: 'spesa-p6', it: 'Ecco a Lei.', en: 'Here you are (formal).' },
    ],
    dialogueTitle: 'Al mercato',
    dialogue: [
      { speaker: 'Venditore', it: 'Buongiorno! Cosa Le serve?', en: 'Good morning! What do you need?' },
      { speaker: 'Troy', it: 'Vorrei un chilo di pomodori.', en: "I'd like a kilo of tomatoes." },
      { speaker: 'Venditore', it: 'Certo. Sono freschissimi. Altro?', en: "Of course. They're very fresh. Anything else?" },
      { speaker: 'Troy', it: 'Sì, due etti di prosciutto.', en: 'Yes, 200 grams of prosciutto.' },
      { speaker: 'Troy', it: "Quant'è in tutto?", en: 'How much altogether?' },
      { speaker: 'Venditore', it: 'Sette euro e cinquanta.', en: 'Seven euros fifty.' },
      { speaker: 'Troy', it: 'Ecco a Lei.', en: 'Here you are.' },
      { speaker: 'Venditore', it: 'Grazie e arrivederci!', en: 'Thank you and goodbye!' },
    ],
    quiz: [
      { q: 'What does Troy buy a kilo of?', options: ['Apples', 'Tomatoes', 'Eggs'], answer: 1 },
      { q: 'How much prosciutto does he buy?', options: ['100 grams', '200 grams', 'One kilo'], answer: 1 },
      { q: 'What is the total?', options: ['€7.50', '€5.70', '€17.50'], answer: 0 },
    ],
    reading: {
      title: 'Il mercato italiano',
      sentences: [
        { it: 'Il mercato è il cuore della città italiana.', en: 'The market is the heart of the Italian town.' },
        { it: 'Ogni mattina, le persone comprano frutta e verdura fresca.', en: 'Every morning, people buy fresh fruit and vegetables.' },
        { it: 'I venditori gridano i prezzi.', en: 'The vendors call out the prices.' },
        { it: 'Un chilo sono mille grammi; un etto sono cento grammi.', en: 'A “chilo” is 1000 grams; an “etto” is 100 grams.' },
        { it: "Fare la spesa al mercato è un'esperienza vera.", en: 'Shopping at the market is a real experience.' },
      ],
    },
  },
]

export function getUnit(id: string): Unit | undefined {
  return UNITS.find((u) => u.id === id)
}

export function allVocab(): VocabItem[] {
  return UNITS.flatMap((u) => u.vocab)
}

export function vocabById(id: string): { item: VocabItem; unit: Unit } | undefined {
  for (const unit of UNITS) {
    const item = unit.vocab.find((v) => v.id === id)
    if (item) return { item, unit }
  }
  return undefined
}
