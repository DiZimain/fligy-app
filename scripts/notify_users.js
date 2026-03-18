const { createClient } = require('@supabase/supabase-js');

// 1. Context and setup
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Needs service role to read all records
const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN;

if (!supabaseUrl || !supabaseKey || !telegramBotToken) {
  console.error('Missing required environment variables. Ensure SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, and TELEGRAM_BOT_TOKEN are set.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Duolingo-style passive-aggressive / cute messages
const MESSAGES = [
  "Flygy сидит и ждет твоих действий. Он, конечно, очень терпеливый, но всему есть предел...",
  "Я просто напомню, что твои цели сами себя не достигнут. Зайди на 5 минут!",
  "Ты разбиваешь сердечко своему питомцу, когда пропускаешь день. 💔",
  "Кажется, кто-то забыл про свои привычки? Зайди и спаси свой стрик, пока не поздно!",
  "Знаешь, что делают успешные люди? Заходят во Flygy каждый день. 😉",
  "Flygy уже начал забывать, как ты выглядишь. Напомни ему о себе!",
  "Тук-тук! Это я, твоя совесть. И твой дракон. Мы оба ждем тебя в приложении.",
  "Один пропущенный день — это случайность. Два — это уже тенденция. Не дай этому случиться!",
  "Твои невыполненные задачи чувствуют себя очень одиноко. Навести их?",
  "Стрик — это как репутация: строится долго, теряется за секунду. Вперед, в игру!",
  "Flygy сегодня подозрительно молчалив. Кажется, он ждет твоего хода.",
  "Простое напоминание: 5 минут сегодня лучше, чем 0 минут никогда.",
  "Знаешь, кто сегодня не зашел во Flygy? Не будь этим человеком.",
  "Дракон уже разогревает пламя... либо для твоих побед, либо для твоего пропуска.",
  "Сегодня отличный день, чтобы не прерывать серию. Flygy верит в тебя (наверное).",
  "Тс-с... Твои привычки зовут тебя. Слышишь?",
  "Если ты сейчас зайдешь, Flygy сделает вид, что не заметил твоего опоздания.",
  "Никто не идеален, но твой стрик еще может им стать!",
  "Мир не рухнет, если ты не зайдешь. Но дракон расстроится. Сильно.",
  "Твои цели смотрят на тебя с укоризной. Идем исправлять?"
];

function getRandomMessage() {
  return MESSAGES[Math.floor(Math.random() * MESSAGES.length)];
}

// Get current date string in format YYYY-MM-DD (local time approximation)
function getTodayString() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

async function sendTelegramMessage(chatId, text) {
  const url = `https://api.telegram.org/bot${telegramBotToken}/sendMessage`;
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
      })
    });
    if (!response.ok) {
      console.error(`Failed to send to ${chatId}:`, await response.text());
    } else {
      console.log(`Successfully notified ${chatId}`);
    }
  } catch (error) {
    console.error(`Error sending message to ${chatId}:`, error.message);
  }
}

async function runNotifications() {
  console.log('Starting notification worker...');
  const today = getTodayString();

  // 1. Fetch all states from Supabase
  const { data: users, error } = await supabase
    .from('user_states')
    .select('user_id, state_data');

  if (error) {
    console.error('Error fetching users from Supabase:', error);
    process.exit(1);
  }

  let notifiedCount = 0;

  for (const row of users) {
    try {
      if (!row.state_data || !row.state_data.profile) continue;
      
      const profile = row.state_data.profile;
      const telegramId = profile.telegramId;
      const activeDays = profile.activeDays || [];

      // If user has no telegramId attached yet, we can't notify them
      if (!telegramId) continue;

      // Check if they have already been active today
      if (!activeDays.includes(today)) {
        // User has NOT been active today, they need a reminder
        const message = getRandomMessage();
        await sendTelegramMessage(telegramId, message);
        notifiedCount++;
      }
    } catch (err) {
      console.error(`Failed processing user ${row.user_id}:`, err.message);
    }
  }

  console.log(`Notification run complete. Sent ${notifiedCount} reminders.`);
}

runNotifications();
