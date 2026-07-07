export interface Scenario {
  id: string
  emoji: string
  title: string
  titleEn: string
  persona: string
  goal: string
  starter: { it: string; en: string }
  starterSuggestions: Array<{ it: string; en: string }>
}

export const SCENARIOS: Scenario[] = [
  {
    id: 'bar',
    emoji: '☕',
    title: 'Al bar',
    titleEn: 'Order breakfast at a café',
    persona: 'a friendly barista in a busy Roman café',
    goal: 'order a drink and something to eat, ask the price, and pay',
    starter: { it: 'Buongiorno! Cosa desidera?', en: 'Good morning! What would you like?' },
    starterSuggestions: [
      { it: 'Un cappuccino, per favore.', en: 'A cappuccino, please.' },
      { it: 'Un caffè e un cornetto, per favore.', en: 'A coffee and a croissant, please.' },
    ],
  },
  {
    id: 'ristorante',
    emoji: '🍝',
    title: 'Al ristorante',
    titleEn: 'Order dinner at a trattoria',
    persona: 'a welcoming waiter in a family trattoria in Florence',
    goal: 'get a table, ask for a recommendation, order food and a drink',
    starter: { it: 'Buonasera! Ha prenotato?', en: 'Good evening! Do you have a booking?' },
    starterSuggestions: [
      { it: 'No, un tavolo per due, per favore.', en: 'No, a table for two, please.' },
      { it: 'Sì, a nome Troy.', en: 'Yes, under the name Troy.' },
    ],
  },
  {
    id: 'mercato',
    emoji: '🍅',
    title: 'Al mercato',
    titleEn: 'Buy fruit at the market',
    persona: 'a cheerful fruit-and-vegetable vendor at an open-air market',
    goal: 'buy some fruit or vegetables, ask about freshness and the total price',
    starter: { it: 'Buongiorno! Mi dica!', en: 'Good morning! What can I get you?' },
    starterSuggestions: [
      { it: 'Vorrei un chilo di pomodori.', en: "I'd like a kilo of tomatoes." },
      { it: 'Quanto costano le mele?', en: 'How much are the apples?' },
    ],
  },
  {
    id: 'stazione',
    emoji: '🚆',
    title: 'In stazione',
    titleEn: 'Buy a train ticket',
    persona: 'a helpful ticket clerk at Roma Termini station',
    goal: 'buy a ticket to a city, ask the departure time and platform',
    starter: { it: 'Buongiorno, dove vuole andare?', en: 'Good morning, where would you like to go?' },
    starterSuggestions: [
      { it: 'Un biglietto per Firenze, per favore.', en: 'A ticket to Florence, please.' },
      { it: 'A che ora parte il treno?', en: 'What time does the train leave?' },
    ],
  },
  {
    id: 'incontro',
    emoji: '🤝',
    title: 'Un nuovo amico',
    titleEn: 'Meet someone new',
    persona: 'a curious, friendly Italian who has just met the learner at a café table',
    goal: 'introduce yourself, say where you are from, and ask about the other person',
    starter: { it: 'Ciao! Come ti chiami?', en: "Hi! What's your name?" },
    starterSuggestions: [
      { it: 'Mi chiamo Troy. E tu?', en: 'My name is Troy. And you?' },
      { it: "Ciao! Sono Troy, vengo dall'Australia.", en: "Hi! I'm Troy, I come from Australia." },
    ],
  },
]
