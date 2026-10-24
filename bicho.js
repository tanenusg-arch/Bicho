const { Telegraf, Markup, Telegram } = require('telegraf');
const { createClient } = require('@supabase/supabase-js');
const { Client } = require('pg');
const { Resvg } = require('@resvg/resvg-js');      // npm i @resvg/resvg-js  (draws the fixtures image, works on Termux)

// ====================== CONFIG: fill these in ======================
const BOT_TOKEN = '8977161927:AAGtK3CNrBhpE5F5v7dZCeIpudE2e9qWwmY';
const ADMIN_IDS = '8453713398, 6153912689';          // comma-separated Telegram user IDs
const ADMIN_USERNAME = 'el_bicho14';              // admin Telegram username without @ (needed for pre-filled buy messages)

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY environment variable');
}

// Supabase -> Project Settings -> Database -> Connection string -> URI (use the "Session pooler" one)
// Replace [YOUR-PASSWORD] with your database password. Used only to create the tables automatically.
const DATABASE_URL = process.env.DATABASE_URL;

const CHANNEL = '@nationalefootballethopiya';                   // bot must be admin here
const CHANNEL_LINK = 'https://t.me/nationalefootballethopiya';
const GROUP = '@BICHO_EFOOT_BALL_NEWS_GP';                       // bot must be admin here
const GROUP_LINK = 'https://t.me/BICHO_EFOOT_BALL_NEWS_GP';
const SALES_CHANNEL = '@bicho_efoot_ball_coin_shop';
const TOURNAMENT_POST_TARGET = '@bichotournament'             // where accounts for sale are posted

const BUY_COIN_URL = 'https://example.com';        // website opened by the "Buy Coin" button
const REFERRAL_REWARD = 5;                     // ETB paid to the inviter when an invited user's tournament registration is approved
const RESERVE_MINUTES = 15;                        // how long an account is held for a buyer who has not finished

const CBE_ACCOUNT = '1000000192914';
const CBE_NAME = 'Firehiwot Desalegn Teka';
const TELEBIRR_NUMBER = '0971332916';
const TELEBIRR_NAME = 'woeldesemayat eshete';

// verify.et auto-verification (https://verify.et -> dashboard -> API Keys; key needs the verification:write permission)
const VERIFY_ET_API_KEY = 'VERIFY_BANK_ET__MBOwticaenoGF0Lye417dRdr-xwgxxhuuNdvizLdUSpzYmbwkHrSDBzl_w905j3';
const VERIFY_ET_URL = 'https://verify.et';
const PAY_WINDOW_MIN = 10;                         // a payment must have been made within this many minutes

// Render webhook mode: on Render, RENDER_EXTERNAL_URL and PORT are set automatically.
// Set WEBHOOK_URL yourself (e.g. https://my-bot.onrender.com) to override, or leave both unset to use polling locally.
const WEBHOOK_URL = (process.env.WEBHOOK_URL || process.env.RENDER_EXTERNAL_URL || '').replace(/\/+$/, '');
const PORT = Number(process.env.PORT) || 3000;
// ===================================================================

// ================= TELEGRAM PREMIUM EMOJIS =================
// Replace 'EMOJI_ID' with the custom emoji ID for any emoji you want shown as a premium emoji.
// Leave 'EMOJI_ID' as is to keep the normal emoji. Works in message text, captions and on buttons (a button's leading emoji becomes its icon).
const PREMIUM_EMOJI = {
  '🥇': '5440539497383087970',
  '🥈': '5447203607294265305',
  '🥉': '5453902265922376865',
  '🟢': 'EMOJI_ID',
  '🔴': 'EMOJI_ID',
  '⚫': 'EMOJI_ID',
  '👥': '6035084557378654059',
  '🏆': '5220166546491459639',
  '💰': '6296202896639791835',
  '📝': '5447421246172069841',
  '📢': '5458603970916270333',
  '💬': '5443038326535759644',
  '✅': '6325645228166353066',
  '👋': '5913243091174693777',
  '🚫': 'EMOJI_ID',
  '📋': '5251662946127336150',
  '👤': '4913497231492908158',
  '❓': '6271271702408204490',
  '⚙️': '5296369303661067030',
  '📊': '5303213613220121573',
  '⏳': '5123230779593196220',
  '🪙': '5994654376659000566',
  '✨': '5890925363067886150',
  '👇': '5231102735817918643',
  '⬅️': '5445365692004071819',
  '❌': '5278299040511970900',
  '💵': '5769403330761593044',
  '🏅': '5217822164362739968',
  '🎁': '5875180111744995604',
  '📌': '5462912132351797094',
  '⚠️': '5447381715293074599',
  '🏦': '5789460978357772535',
  '📱': '5789537424480673447',
  '💳': '5256186332669035163',
  '🖼': '5956561916573782596',
  '📣': '5395695537687123235',
  '✖': 'EMOJI_ID',
  '📧': '5253742260054409879',
  '🎉': '5461151367559141950',
  '🏁': '5220166546491459639',
  '🛠': 'EMOJI_ID',
  '🆕': 'EMOJI_ID',
  '✏️': 'EMOJI_ID',
  '🔒': 'EMOJI_ID',
  '🔓': 'EMOJI_ID',
  '📜': '5778299625370817409',
  '➕': '5397916757333654639' ,
  '➖': '5260293700088511294',
  '📤': '6028346797368283073',
  '💸': '5224257782013769471',
  '🔎': 'EMOJI_ID',
  '✉️': '6028346797368283073',
  '⏰': '5999085326914555083',
  '🛒': '5447319442562251569',
  '🧾': '5447421246172069841',
  '🔧': 'EMOJI_ID',
  '📈': '5231200819986047254',
  '👮': '6269105110450705259',
  'ℹ️': '5983580310292402968',
  '📩': '5445355530111437729',
  '🎮': '5789721476714209149',
  '🔁': '5386367538735104399',
  '🏷': '5418010521309815154',
  '📞': '5258337316715373336',
  '♻️': '5377336227533969892',
  '🔥': '5424972470023104089',
};
// ===========================================================

const ADMINS = ADMIN_IDS.split(',').map((s) => Number(s.trim())).filter(Boolean);
const isAdmin = (id) => ADMINS.includes(id);
const bot = new Telegraf(BOT_TOKEN);
const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, { auth: { persistSession: false } });

/* ---------------- helpers ---------------- */
const esc = (s = '') => String(s).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const HTML = { parse_mode: 'HTML' };

/* ---------------- premium emoji support ---------------- */
const EMOJI_RE = /\p{Extended_Pictographic}(?:\uFE0F|\u200D\p{Extended_Pictographic}|[\u{1F3FB}-\u{1F3FF}])*\uFE0F?/gu;
const stripVS = (e) => e.replace(/\uFE0F/g, '');
const PREMIUM_LOOKUP = new Map();
for (const [e, id] of Object.entries(PREMIUM_EMOJI)) {
  if (/^\d+$/.test(String(id).trim())) PREMIUM_LOOKUP.set(stripVS(e), String(id).trim());
}

function premiumize(html) {
  if (html.includes('<tg-emoji')) return null;
  let hit = false;
  const out = html.replace(EMOJI_RE, (e) => {
    const id = PREMIUM_LOOKUP.get(stripVS(e));
    if (!id) return e;
    hit = true;
    return `<tg-emoji emoji-id="${id}">${e}</tg-emoji>`;
  });
  return hit ? out : null;
}

// A leading emoji on a button becomes the button's premium icon (button text can't hold <tg-emoji>)
const LEAD_EMOJI_RE = new RegExp('^\\s*(' + EMOJI_RE.source + ')\\s*', 'u');
function premiumButton(b) {
  if (!b || typeof b.text !== 'string' || b.icon_custom_emoji_id) return b;
  const m = b.text.match(LEAD_EMOJI_RE);
  if (!m) return b;
  const id = PREMIUM_LOOKUP.get(stripVS(m[1]));
  const rest = b.text.slice(m[0].length);
  if (!id || !rest) return b;
  return { ...b, text: rest, icon_custom_emoji_id: id };
}

// Every outgoing text/caption/button goes through here, so no other code needs to change
const _callApi = Telegram.prototype.callApi;
Telegram.prototype.callApi = function (method, payload, ...rest) {
  if (PREMIUM_LOOKUP.size && payload && typeof payload === 'object') {
    if (!payload.entities && !payload.caption_entities) {
      for (const field of ['text', 'caption']) {
        if (typeof payload[field] !== 'string') continue;
        const isHtml = payload.parse_mode === 'HTML';
        if (!isHtml && payload.parse_mode) continue; // leave Markdown messages alone
        const out = premiumize(isHtml ? payload[field] : esc(payload[field]));
        if (out) payload = { ...payload, [field]: out, parse_mode: 'HTML' };
      }
    }
    const kb = payload.reply_markup && payload.reply_markup.inline_keyboard;
    if (Array.isArray(kb)) {
      payload = { ...payload, reply_markup: { ...payload.reply_markup, inline_keyboard: kb.map((row) => row.map(premiumButton)) } };
    }
  }
  return _callApi.call(this, method, payload, ...rest);
};

const states = new Map();      // wizard state (in memory): userId -> { step, data }

// Replace the previous bot message whenever this chat receives a new bot reply.
// This is intentionally global (not checkout-only), so menus/wizards stay clean.
const lastBotReply = new Map(); // chatId -> message_id
const bannedIds = new Set();   // loaded from DB at startup
const pendingBuy = new Map();  // userId -> sale id (user opened a buy link before joining channel/group)
let BOT_USERNAME = '';         // filled at startup, used for buy deep links
const MEDAL = ['🥇', '🥈', '🥉'];
const argsOf = (ctx) => ctx.message.text.replace(/^\/\w+(@\w+)?\s*/, '').trim();
const B = (text, data) => Markup.button.callback(text, data);
// Native Telegram copy buttons for payment pages (tournament + account purchases)
const copyButtons = (amount, account) => ({
  inline_keyboard: [[
    { text: '📋 Copy amount', copy_text: { text: String(amount) } },
    { text: '📋 Copy account', copy_text: { text: String(account) } },
  ]],
});
const fmtTime = (d) => new Date(d).toISOString().slice(0, 16).replace('T', ' ');

// Admin-only wrapper (works for commands, buttons and inline actions)
const A = (fn) => async (ctx) => {
  if (!isAdmin(ctx.from.id)) return;
  if (ctx.callbackQuery) await ctx.answerCbQuery().catch(() => {});
  return fn(ctx);
};

function logAction(ctx, action, detail = '') {
  sb.from('admin_log')
    .insert({ admin_id: ctx.from.id, admin_name: ctx.from.first_name || '', action, detail })
    .then(({ error }) => error && console.error('log', error.message));
}

async function getTournament() {
  const { data, error } = await sb.from('tournaments').select('*').order('id', { ascending: false }).limit(1).maybeSingle();
  if (error) console.error('getTournament', error.message);
  return data;
}

async function approvedCount(tid) {
  const { count } = await sb
    .from('registrations')
    .select('id', { count: 'exact', head: true })
    .eq('tournament_id', tid)
    .eq('status', 'approved');
  return count || 0;
}

async function allUserIds() {
  const ids = [];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await sb.from('users').select('id').range(from, from + 999);
    if (error || !data || data.length === 0) break;
    ids.push(...data.map((u) => u.id));
    if (data.length < 1000) break;
  }
  return ids.filter((id) => !bannedIds.has(id));
}

async function findUser(arg) {
  const a = (arg || '').replace('@', '').trim();
  if (!a) return null;
  if (/^\d+$/.test(a)) {
    const { data } = await sb.from('users').select('*').eq('id', Number(a)).maybeSingle();
    return data;
  }
  const { data } = await sb.from('users').select('*').ilike('username', a.replace(/[\\%_]/g, '\\$&')).limit(1).maybeSingle();
  return data;
}

async function isJoined(userId) {
  const ok = ['creator', 'administrator', 'member', 'restricted'];
  try {
    const [c, g] = await Promise.all([
      bot.telegram.getChatMember(CHANNEL, userId),
      bot.telegram.getChatMember(GROUP, userId),
    ]);
    return ok.includes(c.status) && ok.includes(g.status);
  } catch (e) {
    console.error('membership check failed:', e.message);
    return false;
  }
}

async function broadcast(fn, ids) {
  let sent = 0;
  for (const id of ids || (await allUserIds())) {
    try { await fn(id); sent++; } catch (_) { /* user blocked the bot */ }
    await sleep(50); // stay under Telegram rate limits
  }
  return sent;
}

const notifyAdmins = (fn) => Promise.all(ADMINS.map((id) => fn(id).catch(() => {})));

function tournamentText(t, count) {
  const status = { open: '🟢 Open', full: '🔴 Full', closed: '⚫ Closed' }[t.status] || t.status;
  const players =
    count === undefined
      ? `👥 Players needed: <b>${t.needed}</b>`
      : `👥 Players: <b>${count}/${t.needed}</b> (${Math.max(t.needed - count, 0)} spots left)`;
  return (
    `🏆 <b>${esc(t.name)}</b>\n` +
    `Status: ${status}\n\n` +
    `${players}\n` +
    `💰 Entry fee: <b>${t.fee} ETB</b>\n\n` +
    `🥇 1st: <b>${t.prize1} ETB</b>\n` +
    `🥈 2nd: <b>${t.prize2} ETB</b>\n` +
    `🥉 3rd: <b>${t.prize3} ETB</b>` +
    (t.details ? `\n\n📝 ${esc(t.details)}` : '')
  );
}

const joinKeyboard = () =>
  Markup.inlineKeyboard([
    [Markup.button.url('📢 Join Channel', CHANNEL_LINK)],
    [Markup.button.url('💬 Join Group', GROUP_LINK)],
    [Markup.button.callback('✅ I have joined', 'check_join')],
  ]);

const askJoin = (ctx) => ctx.reply('👋 To use this bot you must join our channel and group first.', joinKeyboard());

/* ---------------- middleware ---------------- */
// Keep only the newest bot reply in each private chat. Callback messages are
// also removed when the next reply is sent, so this applies across the whole bot.
bot.use(async (ctx, next) => {
  if (ctx.chat && ctx.chat.type === 'private' && typeof ctx.reply === 'function') {
    const originalReply = ctx.reply.bind(ctx);
    ctx.reply = async (...args) => {
      const chatId = ctx.chat.id;
      const previousId = lastBotReply.get(chatId);
      if (previousId) {
        try { await ctx.telegram.deleteMessage(chatId, previousId); } catch (_) {}
      }
      const sent = await originalReply(...args);
      if (sent && sent.message_id) lastBotReply.set(chatId, sent.message_id);
      return sent;
    };
  }
  return next();
});

bot.use(async (ctx, next) => {
  if (ctx.chat && ctx.chat.type !== 'private') return; // private chats only
  if (ctx.from) {
    const { error } = await sb.from('users').upsert({
      id: ctx.from.id,
      username: ctx.from.username || null,
      first_name: ctx.from.first_name || '',
    });
    if (error) console.error('user upsert', error.message);
    const refLink = ctx.message && ctx.message.text && ctx.message.text.match(/^\/start ref_(\d+)/);
    if (refLink) {
      const attached = await attachReferrer(ctx.from.id, Number(refLink[1])).catch((e) => {
        console.error('attachReferrer', e.message);
        return false;
      });
      if (attached) {
        await rewardReferrer(ctx.from.id).catch((e) => console.error('instant referral reward', e.message));
      }
    }
  }
  return next();
});

// Banned users are blocked completely
bot.use(async (ctx, next) => {
  if (ctx.from && bannedIds.has(ctx.from.id) && !isAdmin(ctx.from.id)) {
    if (ctx.callbackQuery) return ctx.answerCbQuery('🚫 You are banned.', { show_alert: true }).catch(() => {});
    return ctx.reply('🚫 You are banned from using this bot. Contact an admin if you think this is a mistake.');
  }
  return next();
});

// Gate: non-admins must have joined channel + group
bot.use(async (ctx, next) => {
  if (!ctx.from || isAdmin(ctx.from.id)) return next();
  if (ctx.callbackQuery && ctx.callbackQuery.data === 'check_join') return next();
  if (await isJoined(ctx.from.id)) return next();
  const buyLink = ctx.message && ctx.message.text && ctx.message.text.match(/^\/start buy_(\d+)/);
  if (buyLink) pendingBuy.set(ctx.from.id, Number(buyLink[1]));
  if (ctx.callbackQuery) await ctx.answerCbQuery('Please join first', { show_alert: true }).catch(() => {});
  return askJoin(ctx);
});

/* ---------------- menu + help ---------------- */

const mainMenuKeyboard = (ctx) => {
  const rows = [
    [B('🏆 Tournament', 'menu:tournament'), B('👥 Players', 'menu:players')],
    [B('👤 Profile', 'menu:profile'), B('🛍 Accounts', 'menu:accounts')],
    [B('❓ Help', 'menu:help'), B('🎮 Sell account', 'menu:usell')],
  ];
  if (isAdmin(ctx.from.id)) rows.push([
    B('⚙️ Admin', 'menu:admin'),
    B('📊 Stats', 'menu:stats'),
    B('⏳ Pending', 'menu:pending'),
  ]);
  rows.push([Markup.button.url('🪙 Buy Coin', BUY_COIN_URL)]);
  return Markup.inlineKeyboard(rows);
};

const mainMenu = async (ctx, text = '✨ <b>Main menu</b>\nChoose an option below 👇') => {
  const opts = { ...HTML, ...mainMenuKeyboard(ctx) };
  if (ctx.callbackQuery) {
    try { return await ctx.editMessageText(text, opts); } catch (_) { /* fall through */ }
  }
  return ctx.reply(text, opts);
};

const removePersistentKeyboard = (ctx) =>
  ctx.reply(' ', Markup.removeKeyboard()).catch(() => {});

const USER_HELP =
  '❓ <b>Commands</b>\n' +
  '/menu – main menu\n' +
  '/tournament – current tournament details\n' +
  '/register – register and pay\n' +
  '/status – your registration status\n' +
  '/profile – your profile and results\n' +
  '/players – registered players\n' +
  '/referral – invite friends and earn\n' +
  '/cancel – cancel what you are doing\n' +
  '/help – this message\n\n' +
  '<b>How to register</b>\n' +
  '1. Tap 📝 Register and choose CBE or Telebirr\n' +
  '2. Pay the entry fee to the account shown\n' +
  '3. Send the Telebirr transaction ID (or the CBE receipt link) here within 10 minutes of paying\n' +
  '4. Your payment is verified automatically and you are registered instantly';

const ADMIN_HELP =
  '\n\n⚙️ <b>Admin commands</b> (all of these are also buttons in /admin)\n' +
  '<b>Tournament</b>\n' +
  '/newtournament – create (notifies everyone)\n' +
  '/edit – edit name, players, fee, prizes, details\n' +
  '/setfee 100 · /setneeded 32 · /setprizes 1000 500 200\n' +
  '/accountprice 3 600 – change the price of #EF3 (only while nobody is buying it)\n' +
  '/setname text · /setdetails text\n' +
  '/close · /reopen\n' +
  '/history – past tournaments\n\n' +
  '<b>Players &amp; payments</b>\n' +
  '/pending – payments waiting approval\n' +
  '/players – players with IDs\n' +
  '/addplayer @user – register someone (paid in cash)\n' +
  '/remove @user – remove an approved player\n' +
  '/export – players CSV file\n\n' +
  '<b>Results</b>\n' +
  '/winners – set 1st/2nd/3rd and announce\n' +
  '/payouts – prizes and mark as paid\n\n' +
  '<b>Users</b>\n' +
  '/user @user|id – look up a user\n' +
  '/ban @user|id [reason] · /unban @user|id\n' +
  '/dm @user|id message – message one user\n' +
  '/announce – message ALL users\n' +
  '/msgplayers – message approved players\n' +
  '/remind – remind users who have not registered\n\n' +
  '<b>Other</b>\n' +
  '/stats · /sell · /log · /config';

const showHelp = (ctx) => ctx.reply(
  USER_HELP + (isAdmin(ctx.from.id) ? ADMIN_HELP : ''),
  { ...HTML, ...Markup.inlineKeyboard([[B('⬅️ Back to main menu', 'menu:main')]]) }
);

bot.start(async (ctx) => {
  states.delete(ctx.from.id);
  const buy = /^buy_(\d+)$/.exec(ctx.startPayload || '');
  if (buy) return startPurchase(ctx, Number(buy[1]));
  await removePersistentKeyboard(ctx);
  await ctx.reply(
    `👋 Welcome ${esc(ctx.from.first_name || '')}!\nRegister for eFootball tournaments and buy eFootball accounts here.`,
    HTML
  );
  // Keep the first main-menu message visible after /start.
  return mainMenu(ctx);
});

/* ---------------- referral program ---------------- */
async function attachReferrer(userId, refId) {
  if (userId === refId) return false;
  const { data: ref } = await sb.from('users').select('id, referred_by').eq('id', refId).maybeSingle();
  if (!ref || ref.referred_by === userId) return false;           // unknown inviter, or mutual invites
  const { data: me } = await sb.from('users').select('referred_by').eq('id', userId).maybeSingle();
  if (!me || me.referred_by) return false;                         // already invited by someone
  const { count } = await sb.from('registrations').select('id', { count: 'exact', head: true }).eq('user_id', userId);
  if (count) return false;                                         // existing player, not a new invite
  const { data, error } = await sb.from('users')
    .update({ referred_by: refId })
    .eq('id', userId)
    .is('referred_by', null)
    .select('id');
  if (error || !data || data.length === 0) return false;
  return true;
}

// Called when a registration is approved; pays the inviter once per invited user
async function rewardReferrer(userId) {
  const { data, error } = await sb.rpc('reward_referral', { p_user: userId, p_amount: REFERRAL_REWARD });
  if (error) throw error;
  if (!data || !data.ok) return;
  bot.telegram
    .sendMessage(
      data.referrer,
      `🎁 <b>+${REFERRAL_REWARD} ETB!</b> A friend you invited just registered for a tournament.\n💰 Balance: <b>${Number(data.balance).toFixed(2)} ETB</b>`,
      HTML
    )
    .catch(() => {});
}

async function showReferral(ctx) {
  const uid = ctx.from.id;
  const [{ data: u }, inv, paid] = await Promise.all([
    sb.from('users').select('balance').eq('id', uid).maybeSingle(),
    sb.from('users').select('id', { count: 'exact', head: true }).eq('referred_by', uid),
    sb.from('users').select('id', { count: 'exact', head: true }).eq('referred_by', uid).eq('referral_paid', true),
  ]);
  const link = `https://t.me/${BOT_USERNAME}?start=ref_${uid}`;
  const share = `https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent('Join eFootball tournaments with me!')}`;
  return ctx.reply(
    `🎁 <b>Referral program</b>\n\nInvite friends with your link. You earn <b>${REFERRAL_REWARD} ETB</b> each time a friend you invited registers for a tournament and their payment is approved.\n\n` +
      `🔗 <code>${link}</code>\n\n👥 Invited: <b>${inv.count || 0}</b>\n✅ Rewarded: <b>${paid.count || 0}</b>\n💰 Balance: <b>${Number((u && u.balance) || 0).toFixed(2)} ETB</b>`,
    {
      ...HTML,
      ...Markup.inlineKeyboard([
        [Markup.button.url('📤 Share link', share)],
        [B('⬅️ Back to main menu', 'menu:main')],
      ]),
    }
  );
}
bot.command('referral', showReferral);
bot.action('menu:referral', async (ctx) => {
  await ctx.answerCbQuery().catch(() => {});
  return showReferral(ctx);
});

bot.command('menu', async (ctx) => {
  states.delete(ctx.from.id);
  await removePersistentKeyboard(ctx);
  return mainMenu(ctx);
});
bot.command('help', showHelp);

bot.command('cancel', (ctx) => {
  states.delete(ctx.from.id);
  releaseReservation(ctx.from.id);
  return ctx.reply('Cancelled.');
});

bot.action('check_join', async (ctx) => {
  if (isAdmin(ctx.from.id) || (await isJoined(ctx.from.id))) {
    await ctx.answerCbQuery('Verified ✅');
    await ctx.reply('✅ Thanks for joining!');
    const pb = pendingBuy.get(ctx.from.id);
    if (pb) { pendingBuy.delete(ctx.from.id); return startPurchase(ctx, pb); }
    return mainMenu(ctx);
  }
  return ctx.answerCbQuery('You have not joined both yet ❌', { show_alert: true });
});

/* ---------------- user: tournament info / players / status / profile ---------------- */
async function showTournament(ctx) {
  const t = await getTournament();
  if (!t) return ctx.reply('No tournament yet. Stay tuned! 🏆');
  const count = await approvedCount(t.id);
  const rows = [];
  if (t.status === 'open') rows.push([B('📝 Register', 'register')]);
  rows.push([B('📋 My status', 'menu:status')]);
  rows.push([B('⬅️ Back to main menu', 'menu:main')]);
  return ctx.reply(tournamentText(t, count), { ...HTML, ...Markup.inlineKeyboard(rows) });
}

async function showAccounts(ctx) {
  const { data: sales, error } = await sb
    .from('account_sales')
    .select('*')
    .eq('status', 'available')
    .not('price', 'is', null)
    .order('created_at', { ascending: false })
    .limit(20);
  if (error) {
    console.error('available accounts', error.message);
    return ctx.reply('❌ Could not load available accounts right now. Please try again.');
  }
  if (!sales || sales.length === 0) {
    return ctx.reply(
      '🛍 <b>Available eFootball accounts</b>\n\nNo accounts are available right now. Check back later.',
      { ...HTML, ...Markup.inlineKeyboard([[B('⬅️ Back to main menu', 'menu:main')]]) }
    );
  }

  const rows = sales.map((s) => [
    B(`${saleTag(s)} • ${s.price} ETB`, `account:${s.id}`),
  ]);
  rows.push([B('⬅️ Back to main menu', 'menu:main')]);
  return ctx.reply(
    `🛍 <b>Available eFootball accounts</b>\n\nChoose an account to view its details and buy it.`,
    { ...HTML, ...Markup.inlineKeyboard(rows) }
  );
}

async function showPlayers(ctx) {
  const t = await getTournament();
  if (!t) return ctx.reply('No tournament yet.');
  const { data: regs } = await sb.from('registrations').select('username,user_id,status').eq('tournament_id', t.id).order('id');
  const approved = (regs || []).filter((r) => r.status === 'approved');
  const pending = (regs || []).filter((r) => r.status === 'pending').length;
  const admin = isAdmin(ctx.from.id);
  const list = approved
    .map((r, i) => `${i + 1}. @${esc(r.username)}${admin ? ` (<code>${r.user_id}</code>)` : ''}`)
    .join('\n');
  return ctx.reply(
    `👥 <b>${esc(t.name)}</b> — ${approved.length}/${t.needed} registered` +
      (admin ? ` • ⏳ ${pending} pending` : '') +
      `\n\n${list || 'No players yet.'}`,
    { ...HTML, ...Markup.inlineKeyboard([[B('⬅️ Back to main menu', 'menu:main')]]) }
  );
}

const REG_LABEL = {
  pending: '⏳ Waiting for admin approval',
  approved: '✅ Registered',
  rejected: '❌ Rejected — you can register again',
  removed: '🚫 Removed by admin',
};

async function showStatus(ctx) {
  const t = await getTournament();
  if (!t) return ctx.reply('No active tournament.');
  const { data: r } = await sb
    .from('registrations')
    .select('*')
    .eq('tournament_id', t.id)
    .eq('user_id', ctx.from.id)
    .order('id', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!r) return ctx.reply(`You have not registered for <b>${esc(t.name)}</b> yet. Use /register.`, HTML);
  const count = await approvedCount(t.id);
  return ctx.reply(
    `📋 <b>${esc(t.name)}</b>\nStatus: ${REG_LABEL[r.status] || r.status}\nPayment: ${r.method.toUpperCase()} • ${t.fee} ETB\n` +
      `Sent: ${fmtTime(r.created_at)} UTC\nPlayers registered: ${count}/${t.needed}`,
    { ...HTML, ...Markup.inlineKeyboard([[B('⬅️ Back to main menu', 'menu:main')]]) }
  );
}

async function ensureProfileUser(ctx) {
  const uid = ctx.from.id;
  const payload = {
    id: uid,
    username: ctx.from.username || null,
    first_name: ctx.from.first_name || '',
  };

  try {
    const { data, error } = await sb
      .from('users')
      .upsert(payload, { onConflict: 'id' })
      .select('id, username, first_name, created_at')
      .single();

    if (error) {
      console.error('profile user upsert failed:', error.message);
      return null;
    }
    return data || null;
  } catch (e) {
    console.error('profile user upsert exception:', e.message || e);
    return null;
  }
}

async function showProfile(ctx) {
  const uid = ctx.from.id;

  // Make sure the Telegram user actually exists in Supabase before reading
  // the profile. This fixes profiles for users whose first upsert failed or
  // who started using the bot before the users table existed.
  let u = await ensureProfileUser(ctx);
  let regs = [];
  let wins = [];
  let t = null;

  try {
    const { data, error } = await sb
      .from('registrations')
      .select('status, tournament_id, tournaments(fee)')
      .eq('user_id', uid)
      .eq('status', 'approved');
    if (error) console.error('profile registrations query failed:', error.message);
    regs = data || [];
  } catch (e) {
    console.error('profile registrations query exception:', e.message || e);
  }

  try {
    const { data, error } = await sb
      .from('winners')
      .select('place, prize')
      .eq('user_id', uid);
    if (error) console.error('profile winners query failed:', error.message);
    wins = data || [];
  } catch (e) {
    // Winners are optional for a new user. Do not make Profile fail if the
    // winners table is not present yet.
    console.error('profile winners query exception:', e.message || e);
  }

  try {
    t = await getTournament();
  } catch (e) {
    console.error('profile tournament query failed:', e.message || e);
  }

  const joined = regs.length;
  const spent = regs.reduce((sum, r) => sum + Number((r.tournaments && r.tournaments.fee) || 0), 0);
  const medals = [0, 0, 0];
  wins.forEach((w) => {
    const place = Number(w.place);
    if (place >= 1 && place <= 3) medals[place - 1]++;
  });
  const won = wins.reduce((sum, w) => sum + Number(w.prize || 0), 0);

  let current = 'No tournament right now';
  if (t) {
    try {
      const { data: r, error } = await sb
        .from('registrations')
        .select('status')
        .eq('tournament_id', t.id)
        .eq('user_id', uid)
        .order('id', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) console.error('profile current registration query failed:', error.message);
      current = `${esc(t.name)}: ${r ? REG_LABEL[r.status] || r.status : 'not registered'}`;
    } catch (e) {
      console.error('profile current registration query exception:', e.message || e);
      current = `${esc(t.name)}: unavailable`;
    }
  }

  const memberSince = u && u.created_at ? fmtTime(u.created_at).slice(0, 10) : 'Just now';
  const text =
    `👤 <b>Your profile</b>\n\n` +
    `Name: ${esc(ctx.from.first_name || '')}\n` +
    `Username: ${ctx.from.username ? '@' + esc(ctx.from.username) : '— (set one to register)'}\n` +
    `ID: <code>${uid}</code>\n` +
    `Member since: ${memberSince}\n\n` +
    `🏆 Tournaments joined: <b>${joined}</b>\n` +
    `💵 Total entry fees paid: <b>${spent} ETB</b>\n` +
    `🏅 Podiums: 🥇 ${medals[0]}  🥈 ${medals[1]}  🥉 ${medals[2]}\n` +
    `🎁 Prizes won: <b>${won} ETB</b>\n\n` +
    `📌 Current: ${current}`;

  const opts = { ...HTML, ...Markup.inlineKeyboard([[B('⬅️ Back to main menu', 'menu:main')]]) };

  if (ctx.callbackQuery) {
    try {
      await ctx.editMessageText(text, opts);
      return;
    } catch (e) {
      if (!String(e.message || e).includes('message is not modified')) {
        console.error('profile inline edit failed:', e.message || e);
      }
    }
  }

  return ctx.reply(text, opts);
}

bot.command('tournament', showTournament);
bot.command('players', showPlayers);
bot.command('accounts', showAccounts);
bot.command('status', showStatus);
bot.command('profile', showProfile);
bot.action('mystatus', async (ctx) => { await ctx.answerCbQuery(); return showStatus(ctx); });

// Inline-only main menu navigation.
bot.action('menu:main', async (ctx) => {
  await ctx.answerCbQuery().catch(() => {});
  states.delete(ctx.from.id);
  return mainMenu(ctx);
});
bot.action('menu:register', async (ctx) => {
  await ctx.answerCbQuery().catch(() => {});
  return startRegistration(ctx);
});
bot.action('menu:status', async (ctx) => {
  await ctx.answerCbQuery().catch(() => {});
  return showStatus(ctx);
});
bot.action('menu:tournament', async (ctx) => {
  await ctx.answerCbQuery().catch(() => {});
  return showTournament(ctx);
});
bot.action('menu:accounts', async (ctx) => {
  await ctx.answerCbQuery().catch(() => {});
  return showAccounts(ctx);
});
bot.action(/^account:(\d+)$/, async (ctx) => {
  await ctx.answerCbQuery().catch(() => {});
  const { data: s } = await sb.from('account_sales').select('*').eq('id', Number(ctx.match[1])).eq('status', 'available').maybeSingle();
  if (!s) return ctx.reply('❌ That account is no longer available.', HTML);
  const caption = saleCaption(s);
  const kb = buyKeyboard(s);
  const photos = s.photos || [];
  if (photos.length) {
    await ctx.replyWithPhoto(photos[0], { caption, ...HTML, ...kb });
    for (const photo of photos.slice(1)) await ctx.replyWithPhoto(photo).catch(() => {});
    return;
  }
  return ctx.reply(caption, { ...HTML, ...kb });
});
bot.action('menu:players', async (ctx) => {
  await ctx.answerCbQuery().catch(() => {});
  return showPlayers(ctx);
});
bot.action('menu:profile', async (ctx) => {
  await ctx.answerCbQuery('Opening profile…').catch(() => {});
  try {
    return await showProfile(ctx);
  } catch (e) {
    console.error('Profile button error:', e);
    return ctx.reply('❌ Could not load your profile right now. Please try again.', HTML).catch(() => {});
  }
});
bot.action('menu:help', async (ctx) => {
  await ctx.answerCbQuery().catch(() => {});
  return showHelp(ctx);
});
bot.action('menu:admin', A(async (ctx) => showMenu(ctx, 'main')));
bot.action('menu:stats', A(async (ctx) => showStats(ctx)));
bot.action('menu:pending', A(async (ctx) => showPending(ctx)));

/* ---------------- user: registration ---------------- */
async function startRegistration(ctx) {
  const t = await getTournament();
  if (!t || t.status !== 'open') {
    return ctx.reply(
      t && t.status === 'full' ? '🔴 This tournament is full. Wait for the next one!' : 'No tournament is open for registration right now.'
    );
  }

  if (!ctx.from.username) {
    return ctx.reply(
      '⚠️ You need a Telegram username to register.\nSet one in Telegram Settings → Username, then press the button.',
      Markup.inlineKeyboard([[Markup.button.callback('✅ I set my username', 'register')]])
    );
  }

  const { data: existing } = await sb
    .from('registrations')
    .select('status')
    .eq('tournament_id', t.id)
    .eq('user_id', ctx.from.id)
    .in('status', ['pending', 'approved'])
    .maybeSingle();
  if (existing) {
    return ctx.reply(
      existing.status === 'approved'
        ? '✅ You are already registered for this tournament.'
        : '⏳ Your payment is waiting for admin approval.'
    );
  }

  const count = await approvedCount(t.id);
  const { data: me } = await sb.from('users').select('balance').eq('id', ctx.from.id).maybeSingle();
  const balance = Number((me && me.balance) || 0);
  const canUseBalance = balance >= Number(t.fee);
  const rows = [[Markup.button.callback('🏦 CBE', 'pay_cbe'), Markup.button.callback('📱 Telebirr', 'pay_telebirr')]];
  if (canUseBalance) rows.unshift([Markup.button.callback(`💰 Pay with balance (${Number(t.fee)} ETB)`, 'pay_balance')]);
  return ctx.reply(
    tournamentText(t, count) +
      `\n\n👤 Your username: @${esc(ctx.from.username)}` +
      (balance > 0 ? `\n💰 Your balance: <b>${balance.toFixed(2)} ETB</b>${canUseBalance ? '' : ' (not enough for the entry fee)'}` : '') +
      `\n\nChoose a payment method:`,
    { ...HTML, ...Markup.inlineKeyboard(rows) }
  );
}

bot.command('register', startRegistration);
bot.action('register', async (ctx) => {
  await ctx.answerCbQuery();
  return startRegistration(ctx);
});

bot.action(/^pay_(cbe|telebirr)$/, async (ctx) => {
  await ctx.answerCbQuery();
  const t = await getTournament();
  if (!t || t.status !== 'open') return ctx.reply('Registration is closed.');
  const method = ctx.match[1];
  states.set(ctx.from.id, { step: 'await_txn', data: { method, tid: t.id } });

  const details =
    method === 'cbe'
      ? `🏦 <b>CBE</b>\nAccount: <code>${esc(CBE_ACCOUNT)}</code>\nName: ${esc(CBE_NAME)}`
      : `📱 <b>Telebirr</b>\nNumber: <code>${esc(TELEBIRR_NUMBER)}</code>\nName: ${esc(TELEBIRR_NAME)}`;

  const account = method === 'cbe' ? CBE_ACCOUNT : TELEBIRR_NUMBER;
  return ctx.reply(
    `${details}\n\n💰 Amount: <b>${t.fee} ETB</b>\n\n${TXN_ASK(method)}\n(/cancel to stop)`,
    {
      ...HTML,
      reply_markup: copyButtons(t.fee, account),
    }
  );
});

bot.action('pay_balance', async (ctx) => {
  await ctx.answerCbQuery().catch(() => {});
  const t = await getTournament();
  if (!t || t.status !== 'open') return ctx.reply('Registration is closed.');
  if (!ctx.from.username) return ctx.reply('⚠️ You need a Telegram username to register. Set one in Telegram Settings → Username.');

  const { data: res, error } = await sb.rpc('register_with_balance', {
    p_user: ctx.from.id,
    p_tid: t.id,
    p_username: ctx.from.username,
  });
  if (error) {
    console.error('register_with_balance', error.message);
    return ctx.reply('Something went wrong, please try again.');
  }
  if (!res.ok) {
    const msg = {
      closed: 'Registration is closed.',
      full: '🔴 This tournament is full.',
      already: 'You already have a registration for this tournament.',
      insufficient: `Your balance (${Number(res.balance || 0).toFixed(2)} ETB) is not enough for the entry fee. Pay with CBE or Telebirr instead.`,
      not_found: 'Tournament not found.',
    }[res.error] || res.error;
    return ctx.reply(msg);
  }

  await ctx.reply(
    `✅ You are registered for <b>${esc(res.tournament_name)}</b> using your balance (−${Number(t.fee)} ETB).\n` +
      `💰 New balance: <b>${Number(res.balance).toFixed(2)} ETB</b>\nPlayers so far: ${res.count}/${res.needed}`,
    HTML
  );
  logAction(ctx, 'register (balance)', `${res.tournament_name} ${t.fee} ETB`);
  notifyAdmins((id) =>
    bot.telegram.sendMessage(id, `💰 @${esc(ctx.from.username)} registered for <b>${esc(res.tournament_name)}</b> using referral balance (${Number(t.fee)} ETB). Players: ${res.count}/${res.needed}`, HTML)
  ).catch(() => {});
  if (res.full) await announceFull(res.tournament_id, res.tournament_name, res.count, res.needed);
});

/* ---------------- auto payment verification (verify.et) ---------------- */
const MAX_TXN_TRIES = 5;
const TXN_ASK = (method) =>
  method === 'cbe'
    ? `After paying, send the <b>CBE transaction link</b> (the receipt link) here.\n⏱ Send it within ${PAY_WINDOW_MIN} minutes of paying.`
    : `After paying, send the <b>Telebirr transaction ID</b> here.\n⏱ Send it within ${PAY_WINDOW_MIN} minutes of paying.`;

const nameTokens = (s) =>
  String(s || '').toLowerCase().replace(/\*/g, '').replace(/[^a-z\u1200-\u137f\s]/g, ' ').split(/\s+/).filter((w) => w.length >= 2);

// Receiver names can be shortened/masked, so compare name parts (prefix match) instead of the whole string
function nameMatches(expected, actual) {
  const e = nameTokens(expected);
  const a = nameTokens(actual);
  if (!e.length || !a.length) return false;
  const hits = e.filter((x) => a.some((y) => x.startsWith(y) || y.startsWith(x))).length;
  return hits >= Math.min(2, e.length);
}

function parseTxnTime(ts) {
  if (!ts) return NaN;
  let s = String(ts).trim();
  // no timezone in the string -> assume Ethiopian time (UTC+3)
  if (/^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}/.test(s) && !/(Z|[+-]\d{2}:?\d{2})$/i.test(s)) s = s.replace(' ', 'T') + '+03:00';
  return new Date(s).getTime();
}

// Returns an error message for the user, or null when everything matches
function checkPayment(method, item, expectedAmount) {
  if (!item || !(item.verified === true || item.status === 'success')) {
    return 'This transaction could not be verified. Check the ' + (method === 'cbe' ? 'link' : 'transaction ID') + ' and try again.';
  }
  const amount = Number(String(item.amount).replace(/,/g, ''));
  if (!Number.isFinite(amount)) return 'Could not read the paid amount from this transaction.';
  if (amount < expectedAmount) return `Amount mismatch: this payment is ${amount} ETB but ${expectedAmount} ETB is required.`;
  if (!nameMatches(method === 'cbe' ? CBE_NAME : TELEBIRR_NAME, item.receiverName)) {
    return 'This payment was not sent to our account (receiver name does not match).';
  }
  const ts = parseTxnTime(item.timestamp);
  if (!Number.isFinite(ts)) return 'Could not read the time of this transaction.';
  const age = Date.now() - ts;
  if (age > PAY_WINDOW_MIN * 60 * 1000 || age < -2 * 60 * 1000) {
    return `This payment was not made within the last ${PAY_WINDOW_MIN} minutes.`;
  }
  return null;
}

let lastApiAlert = 0;
function alertApi(msg) {
  console.error('verify.et', msg);
  if (Date.now() - lastApiAlert < 10 * 60 * 1000) return;
  lastApiAlert = Date.now();
  notifyAdmins((id) =>
    bot.telegram.sendMessage(id, `⚠️ verify.et problem: ${esc(msg)}\nAuto-verification is failing — check your API key and credits.`, HTML)
  ).catch(() => {});
}

// Calls verify.et. Returns { ok: true, item } | { ok: false, api: true, msg } (service problem) | { ok: false, msg } (bad input / not found)
async function verifyEt(method, input) {
  const body = method === 'cbe' ? { bank: 'cbe', reference: input } : { bank: 'telebirr', transactionNumber: input };
  const headers = {
    'Content-Type': 'application/json',
    'x-api-key': VERIFY_ET_API_KEY,
    // same key = replay of the same result, so re-submitting after a 202 does not start a second check
    'Idempotency-Key': `bot-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
  };
  const call = async (url, opts) => {
    const r = await fetch(url, { ...opts, signal: AbortSignal.timeout(45000) });
    return { status: r.status, json: await r.json().catch(() => ({})) };
  };
  const submit = () => call(`${VERIFY_ET_URL}/api/verify?waitMs=15000`, { method: 'POST', headers, body: JSON.stringify(body) });

  let r = await submit();
  if (r.status === 202 && r.json.requestId) {
    const every = Math.max(1500, (r.json.links && r.json.links.pollAfterMs) || 1500);
    for (let i = 0; i < 10; i++) {
      await sleep(every);
      const p = await call(`${VERIFY_ET_URL}/api/verify/${r.json.requestId}`, { headers: { 'x-api-key': VERIFY_ET_API_KEY } });
      const v = p.json && p.json.data;
      if (v && v.processingStatus === 'completed') { r = await submit(); break; }
    }
  }

  const errMsg = (r.json && (r.json.message || (r.json.error && (r.json.error.message || r.json.error.code)))) || '';
  if ([401, 402, 403, 429].includes(r.status) || r.status >= 500) return { ok: false, api: true, msg: `HTTP ${r.status} ${errMsg}` };
  if (r.status === 202) return { ok: false, api: true, msg: 'verification still pending after waiting' };
  const item = Array.isArray(r.json.data) ? r.json.data[0] : null;
  if (!item) return { ok: false, msg: 'Transaction not found. Check it and try again.' };
  return { ok: true, item };
}

const txnKey = (k) => String(k).trim().toUpperCase();

// Check the submitted transaction reference before calling the verification API.
// The canonical transaction fields are also checked after verification in claimTxn(),
// so the same payment cannot be reused through a different receipt link/identifier.
async function isTxnUsed(input) {
  const ref = txnKey(input);
  if (!ref) return false;
  const { data, error } = await sb.from('used_txns').select('ref').eq('ref', ref).maybeSingle();
  if (error) throw error;
  return !!data;
}

// Each transaction can pay for only one thing. Returns the claimed keys, or null if it was already used.
async function claimTxn(item, input, userId, kind) {
  const keys = [...new Set([input, item.referenceNumber, item.receiptNumber, item.transactionNumber].filter(Boolean).map(txnKey))];
  const { error } = await sb.from('used_txns').insert(keys.map((ref) => ({ ref, user_id: userId, kind })));
  if (error) {
    if (error.code === '23505') return null;
    throw error;
  }
  return keys;
}
const releaseTxn = (keys) => sb.from('used_txns').delete().in('ref', keys).then(() => {}, () => {});

async function failAttempt(ctx, st, problem, onGiveUp) {
  const left = MAX_TXN_TRIES - (st.data.tries || 0);
  if (left <= 0) {
    states.delete(ctx.from.id);
    if (onGiveUp) await onGiveUp();
    await ctx.reply(`❌ ${problem}\n\nToo many failed attempts, so this was cancelled. Contact the admin if you really paid.`);
    return null;
  }
  await ctx.reply(`❌ ${problem}\n\nSend the correct ${st.data.method === 'cbe' ? 'link' : 'transaction ID'} again, or /cancel. (${left} attempt(s) left)`);
  return null;
}

// Shared by tournament and account purchases. Returns { item, keys } when the payment is verified and claimed, otherwise null (user already told why).
async function runVerification(ctx, st, amount, kind, onGiveUp) {
  const input = ctx.message.text.trim();
  const method = st.data.method;
  const valid = method === 'cbe' ? /^https?:\/\/\S*cbe\.com\.et\/\S*$/i.test(input) : /^[A-Za-z0-9]{8,20}$/.test(input);
  if (!valid) {
    await ctx.reply(
      method === 'cbe'
        ? '🔗 That is not a CBE receipt link. Send the full link (like https://mbreciept.cbe.com.et/...) or /cancel.'
        : '🔢 That does not look like a Telebirr transaction ID (letters and numbers, like DET8FJGUJ4). Send it again or /cancel.'
    );
    return null;
  }
  if (st.data.busy) return null;

  // Reject an exact transaction link/ID that has already been used before
  // without making another verification request.
  try {
    if (await isTxnUsed(input)) {
      await ctx.reply('❌ This transaction link/ID has already been used for a payment. Please send a different transaction.');
      return null;
    }
  } catch (e) {
    console.error('isTxnUsed', e.message);
    await ctx.reply('Something went wrong while checking the transaction. Please try again.');
    return null;
  }

  st.data.busy = true;
  try {
    await ctx.reply('⏳ Verifying your payment, please wait…');
    let r;
    try { r = await verifyEt(method, input); } catch (e) { r = { ok: false, api: true, msg: e.message }; }
    if (!r.ok && r.api) {
      alertApi(r.msg);
      await ctx.reply('⚠️ The verification service is not responding right now. Please send it again in a minute (this attempt was not counted).');
      return null;
    }
    st.data.tries = (st.data.tries || 0) + 1;
    const problem = r.ok ? checkPayment(method, r.item, amount) : r.msg;
    if (problem) return await failAttempt(ctx, st, problem, onGiveUp);

    const keys = await claimTxn(r.item, input, ctx.from.id, kind);
    if (!keys) return await failAttempt(ctx, st, 'This transaction was already used for another payment.', onGiveUp);
    return { item: r.item, keys, input };
  } catch (e) {
    console.error('runVerification', e.message);
    await ctx.reply('Something went wrong, please try again.');
    return null;
  } finally {
    st.data.busy = false;
  }
}

const txnRef = (r) => r.item.referenceNumber || r.item.receiptNumber || r.input;

async function handleTournamentTxn(ctx, st) {
  const t = await getTournament();
  if (!t || t.id !== st.data.tid || t.status !== 'open') {
    states.delete(ctx.from.id);
    return ctx.reply('Registration is closed.');
  }
  const r = await runVerification(ctx, st, Number(t.fee), 'tournament');
  if (!r) return;
  states.delete(ctx.from.id);
  const who = ctx.from.username ? '@' + esc(ctx.from.username) : `<code>${ctx.from.id}</code>`;

  const { data: reg, error } = await sb
    .from('registrations')
    .insert({ tournament_id: t.id, user_id: ctx.from.id, username: ctx.from.username, method: st.data.method, file_id: 'auto' })
    .select()
    .single();
  if (error) {
    await releaseTxn(r.keys);
    if (error.code === '23505') return ctx.reply('You already have a pending or approved registration.');
    console.error('insert reg', error.message);
    return ctx.reply('Something went wrong, please try again.');
  }

  const { data: res, error: rpcErr } = await sb.rpc('approve_registration', { p_reg_id: reg.id, p_admin: 0 });
  if (rpcErr || !res || !res.ok) {
    await sb.from('registrations').update({ status: 'rejected' }).eq('id', reg.id);
    const why = rpcErr ? 'database error' : { full: 'the tournament is full', closed: 'the tournament is closed' }[res && res.error] || (res && res.error) || 'unknown';
    // the money is real and the transaction stays claimed, so the admin has to refund or fix this by hand
    notifyAdmins((id) =>
      bot.telegram.sendMessage(id, `⚠️ Verified payment but could not register ${who}: ${esc(why)}.\n${st.data.method.toUpperCase()} ${t.fee} ETB • ref <code>${esc(txnRef(r))}</code> — refund may be needed.`, HTML)
    ).catch(() => {});
    return ctx.reply(`✅ Your payment was verified, but registration failed (${why}). The admin has been notified.`);
  }

  await ctx.reply(
    `✅ Payment verified! You are registered for <b>${esc(res.tournament_name)}</b>.\nPlayers so far: ${res.count}/${res.needed}`,
    HTML
  );
  notifyAdmins((id) =>
    bot.telegram.sendMessage(
      id,
      `💳 Auto-verified payment #${reg.id}: ${who} — ${st.data.method.toUpperCase()} ${t.fee} ETB\nRef: <code>${esc(txnRef(r))}</code>\nPlayers: ${res.count}/${res.needed}`,
      HTML
    )
  ).catch(() => {});
  if (res.full) await announceFull(res.tournament_id, res.tournament_name, res.count, res.needed);
}

/* ---------------- payment card (sent to admins) ---------------- */
const sendPaymentCard = (chatId, reg, t) =>
  bot.telegram.sendPhoto(chatId, reg.file_id, {
    caption:
      `💳 <b>Payment</b> #${reg.id}\n` +
      `User: @${esc(reg.username)} (<code>${reg.user_id}</code>)\n` +
      `Method: ${reg.method.toUpperCase()}\nAmount: ${t.fee} ETB\n` +
      `Tournament: ${esc(t.name)}`,
    parse_mode: 'HTML',
    ...Markup.inlineKeyboard([
      [Markup.button.callback('✅ Approve', `ap:${reg.id}`), Markup.button.callback('❌ Reject', `rj:${reg.id}`)],
      [Markup.button.callback('👤 User info', `ui:${reg.user_id}`)],
    ]),
  });

/* ---------------- photos: payment screenshot / admin sale images ---------------- */
bot.on('photo', async (ctx) => {
  const st = states.get(ctx.from.id);
  const fileId = ctx.message.photo[ctx.message.photo.length - 1].file_id;

  // Admin adding images to an account for sale
  if (st && st.step === 'a_photos' && isAdmin(ctx.from.id)) {
    if (st.data.photos.length >= 10) return ctx.reply('Max 10 images. Press Publish.');
    st.data.photos.push(fileId);
    return ctx.reply(
      `🖼 ${st.data.photos.length} image(s) added.`,
      Markup.inlineKeyboard([[Markup.button.callback('📣 Publish', 'a_publish'), Markup.button.callback('✖ Cancel', 'a_cancel')]])
    );
  }

  // User adding images to an account they want to sell
  if (st && st.step === 'us_photos') {
    if (st.data.photos.length >= 10) return ctx.reply('Max 10 images. Tap Submit.', usellKb());
    st.data.photos.push(fileId);
    return ctx.reply(`🖼 ${st.data.photos.length} image(s) added.`, usellKb());
  }

  // Buyer's payment screenshot for an account
  if (st && st.step === 'buy_shot') {
    if (!(await touchReservation(st.data.saleId, ctx.from.id))) {
      states.delete(ctx.from.id);
      return ctx.reply(RESERVE_LOST);
    }
    st.data.fileId = fileId;
    st.step = 'buy_email';
    return ctx.reply('✅ Screenshot received.\n\n📧 Send the email address where you want the account:');
  }

  // Payments are verified from a Telebirr transaction ID / CBE receipt link, not a screenshot
  if (st && st.step === 'await_txn') {
    return ctx.reply(
      st.data.method === 'cbe'
        ? '🔗 Please send the CBE transaction <b>link</b> as text, not a screenshot (or /cancel).'
        : '🔢 Please send the Telebirr transaction <b>ID</b> as text, not a screenshot (or /cancel).',
      HTML
    );
  }

  if (!isAdmin(ctx.from.id)) return ctx.reply('Use /register first, then send your payment screenshot.');
});

/* ---------------- admin: approve / reject ---------------- */
bot.action(/^ap:(\d+)$/, async (ctx) => {
  if (!isAdmin(ctx.from.id)) return ctx.answerCbQuery('Admins only');
  const regId = Number(ctx.match[1]);

  const { data: res, error } = await sb.rpc('approve_registration', { p_reg_id: regId, p_admin: ctx.from.id });
  if (error) {
    console.error('approve rpc', error.message);
    return ctx.answerCbQuery('Database error', { show_alert: true });
  }
  if (!res.ok) {
    const msg = {
      not_found: 'Not found',
      already_approved: 'Already approved',
      already_rejected: 'Already rejected',
      already_removed: 'Player was removed',
      full: 'Tournament is full — cannot approve.',
      closed: 'Tournament is closed — cannot approve.',
    }[res.error] || res.error;
    return ctx.answerCbQuery(msg, { show_alert: true });
  }

  await ctx.editMessageCaption(`${esc(ctx.callbackQuery.message.caption)}\n\n✅ APPROVED by ${esc(ctx.from.first_name)}`, HTML).catch(() => {});
  await ctx.answerCbQuery('✅ Approved');
  logAction(ctx, 'approve', `payment #${regId}`);

  bot.telegram
    .sendMessage(
      res.user_id,
      `✅ Payment approved! You are registered for <b>${esc(res.tournament_name)}</b>.\nPlayers so far: ${res.count}/${res.needed}`,
      HTML
    )
    .catch(() => {});


  if (res.full) await announceFull(res.tournament_id, res.tournament_name, res.count, res.needed);
});

/* ---------------- fixtures image (posted to the channel when a tournament is full) ---------------- */
// SVG -> PNG. Looks for a .ttf font (Termux: pkg install ttf-dejavu, or drop any .ttf in ./fonts next to the bot)
function findFonts() {
  const fs = require('fs');
  const path = require('path');
  const dirs = [path.join(__dirname, 'fonts'), (process.env.PREFIX || '/usr') + '/share/fonts', '/usr/share/fonts', '/system/fonts'];
  const found = [];
  const walk = (d, depth) => {
    let items = [];
    try { items = fs.readdirSync(d, { withFileTypes: true }); } catch { return; }
    for (const it of items) {
      const p = path.join(d, it.name);
      if (it.isDirectory() && depth < 3) walk(p, depth + 1);
      else if (/\.(ttf|otf)$/i.test(it.name) && /dejavu|roboto|noto ?sans|liberation|arial/i.test(it.name) && !/emoji|symbol|serif|mono|cjk/i.test(it.name)) found.push(p);
    }
  };
  dirs.forEach((d) => walk(d, 0));
  return found;
}
const FONT_FILES = findFonts();
if (!FONT_FILES.length) console.warn('No font found for the fixtures image — run: pkg install ttf-dejavu  (or put a .ttf in ./fonts)');

function svgToPng(svg) {
  const resvg = new Resvg(svg, { font: { fontFiles: FONT_FILES, loadSystemFonts: true, defaultFontFamily: 'DejaVu Sans' } });
  return resvg.render().asPng();
}

const xmlEsc = (s) => String(s).replace(/[<>&"']/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' }[c]));
const cut = (s, n) => (String(s).length > n ? String(s).slice(0, n - 1) + '…' : String(s));

// Same seed -> same draw, so /fixtures re-posts exactly the same matches
function seededShuffle(arr, seed) {
  const a = arr.slice();
  let s = Number(seed) >>> 0;
  const rnd = () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

async function fixturesImage(title, subtitle, pairs, startNo) {
  const W = 1000, ROW = 96, HEAD = 200, FOOT = 70;
  const H = HEAD + pairs.length * ROW + FOOT;
  const FONT = "font-family=\"DejaVu Sans, Arial, Helvetica, sans-serif\"";
  const rows = pairs
    .map(([a, b], i) => {
      const y = HEAD + i * ROW;
      return `
  <rect x="40" y="${y}" width="920" height="80" rx="16" fill="${i % 2 ? '#1c2540' : '#222c4d'}"/>
  <text x="70" y="${y + 50}" font-size="24" fill="#7f8bb3" ${FONT}>#${startNo + i}</text>
  <text x="450" y="${y + 52}" font-size="30" font-weight="bold" fill="#ffffff" text-anchor="end" ${FONT}>${xmlEsc(cut(a, 16))}</text>
  <text x="500" y="${y + 51}" font-size="24" font-weight="bold" fill="#ffc83d" text-anchor="middle" ${FONT}>VS</text>
  <text x="550" y="${y + 52}" font-size="30" font-weight="bold" fill="${b ? '#ffffff' : '#7f8bb3'}" ${FONT}>${xmlEsc(b ? cut(b, 16) : 'BYE')}</text>`;
    })
    .join('');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="#12182e"/>
  <rect width="${W}" height="8" fill="#ffc83d"/>
  <text x="500" y="85" font-size="46" font-weight="bold" fill="#ffffff" text-anchor="middle" ${FONT}>${xmlEsc(cut(title, 28))}</text>
  <text x="500" y="140" font-size="28" fill="#ffc83d" text-anchor="middle" ${FONT}>${xmlEsc(subtitle)}</text>${rows}
  <text x="500" y="${H - 28}" font-size="22" fill="#7f8bb3" text-anchor="middle" ${FONT}>Good luck everyone!</text>
</svg>`;
  return svgToPng(svg);
}

// ----- Champions League style knockout bracket: two halves meeting in a final with 2 empty slots -----
const BYE = '__BYE__';

function buildBracket(names) {
  const n = names.length;
  let size = 2;
  while (size < n) size *= 2;
  const M = size / 2;
  const byes = size - n;
  const byeIdx = new Set();
  for (let b = 0; b < byes; b++) byeIdx.add(Math.floor(((b + 0.5) * M) / byes)); // spread the byes around the draw
  const r0 = [];
  let pi = 0;
  for (let i = 0; i < M; i++) {
    if (byeIdx.has(i)) r0.push([names[pi++], BYE]);
    else r0.push([names[pi++], names[pi++]]);
  }
  const win = (m) => (m[1] === BYE ? m[0] : m[0] === BYE ? m[1] : null);
  const rounds = [r0];
  while (rounds[rounds.length - 1].length > 1) {
    const prev = rounds[rounds.length - 1];
    const next = [];
    for (let j = 0; j < prev.length; j += 2) next.push([win(prev[j]), win(prev[j + 1])]);
    rounds.push(next);
  }
  return rounds;
}

async function bracketImage(title, subtitle, rounds) {
  const R = rounds.length;
  const BW = 230, BH = 64, GAP = 44, SLOT = 84, CW = 300, HEAD = 260, FOOT = 70;
  const FONT = "font-family=\"DejaVu Sans, Arial, Helvetica, sans-serif\"";
  const c = R - 1;                                   // columns on each side of the final
  const h = c > 0 ? rounds[0].length / 2 : 0;        // first-round matches per side
  const contentH = Math.max(h * SLOT, 4 * SLOT);
  const top = HEAD + (contentH - h * SLOT) / 2;
  const blockW = 2 * c * (BW + GAP) + CW;
  const W = Math.max(blockW + 80, 1000);
  const H = HEAD + contentH + FOOT;
  const ox = (W - blockW) / 2;
  const xL = (k) => ox + k * (BW + GAP);
  const xR = (k) => W - ox - BW - k * (BW + GAP);
  const finalX = W / 2 - BW / 2;
  const finalYc = HEAD + contentH / 2;

  const ycs = [];
  for (let k = 0; k < c; k++) {
    const cnt = rounds[k].length / 2;
    ycs[k] = [];
    for (let i = 0; i < cnt; i++) ycs[k][i] = k === 0 ? top + i * SLOT + SLOT / 2 : (ycs[k - 1][2 * i] + ycs[k - 1][2 * i + 1]) / 2;
  }

  const slot = (v, x, y) =>
    v === BYE
      ? `<text x="${x}" y="${y}" font-size="17" fill="#5d6aa5" ${FONT}>BYE</text>`
      : v
      ? `<text x="${x}" y="${y}" font-size="19" font-weight="bold" fill="#ffffff" ${FONT}>${xmlEsc(cut(v, 17))}</text>`
      : `<text x="${x}" y="${y}" font-size="17" fill="#6f7fb8" ${FONT}>TBD</text>`;
  const box = (x, yc, m, gold) => {
    const y = yc - BH / 2;
    return `<rect x="${x}" y="${y}" width="${BW}" height="${BH}" rx="10" fill="#14236b" stroke="${gold ? '#ffc83d' : '#4f6bff'}" stroke-width="${gold ? 3 : 1.5}"/>
<line x1="${x + 8}" x2="${x + BW - 8}" y1="${y + BH / 2}" y2="${y + BH / 2}" stroke="#33489a"/>
${slot(m[0], x + 16, y + 23)}${slot(m[1], x + 16, y + BH - 10)}`;
  };

  let lines = '';
  const ln = (d) => { lines += `<path d="${d}" fill="none" stroke="#6f8cff" stroke-width="2"/>`; };
  for (let k = 0; k < c - 1; k++) {
    for (let j = 0; j < ycs[k + 1].length; j++) {
      const ya = ycs[k][2 * j], yb = ycs[k][2 * j + 1], yp = ycs[k + 1][j];
      let x1 = xL(k) + BW, mx = x1 + GAP / 2, x2 = xL(k + 1);
      ln(`M${x1} ${ya} H${mx} M${x1} ${yb} H${mx} M${mx} ${ya} V${yb} M${mx} ${yp} H${x2}`);
      x1 = xR(k); mx = x1 - GAP / 2; x2 = xR(k + 1) + BW;
      ln(`M${x1} ${ya} H${mx} M${x1} ${yb} H${mx} M${mx} ${ya} V${yb} M${mx} ${yp} H${x2}`);
    }
  }
  if (c > 0) {
    const y = ycs[c - 1][0];
    ln(`M${xL(c - 1) + BW} ${y} H${finalX}`);
    ln(`M${xR(c - 1)} ${y} H${finalX + BW}`);
  }

  let boxes = '';
  let heads = '';
  const roundName = (k) => ({ 2: 'FINAL', 4: 'SEMI-FINALS', 8: 'QUARTER-FINALS', 16: 'ROUND OF 16', 32: 'ROUND OF 32' }[2 ** (R - k)] || `ROUND ${k + 1}`);
  for (let k = 0; k < c; k++) {
    const cnt = rounds[k].length / 2;
    for (let i = 0; i < cnt; i++) {
      boxes += box(xL(k), ycs[k][i], rounds[k][i], false);
      boxes += box(xR(k), ycs[k][i], rounds[k][cnt + i], false);
    }
    heads += `<text x="${xL(k) + BW / 2}" y="${HEAD - 22}" font-size="16" font-weight="bold" fill="#9fb4ff" text-anchor="middle" ${FONT}>${roundName(k)}</text>`;
    heads += `<text x="${xR(k) + BW / 2}" y="${HEAD - 22}" font-size="16" font-weight="bold" fill="#9fb4ff" text-anchor="middle" ${FONT}>${roundName(k)}</text>`;
  }
  boxes += box(finalX, finalYc, rounds[R - 1][0], true);
  const trophy = `<g transform="translate(${W / 2 - 45}, ${finalYc - 162})">
<path d="M12 10 C-8 10 -8 42 22 46" fill="none" stroke="#ffc83d" stroke-width="6"/>
<path d="M78 10 C98 10 98 42 68 46" fill="none" stroke="#ffc83d" stroke-width="6"/>
<path d="M15 0 H75 V32 C75 56 60 68 45 70 C30 68 15 56 15 32 Z" fill="#ffc83d"/>
<rect x="40" y="68" width="10" height="14" fill="#ffc83d"/>
<rect x="26" y="82" width="38" height="8" rx="2" fill="#ffc83d"/>
</g>
<text x="${W / 2}" y="${finalYc - 46}" font-size="22" font-weight="bold" fill="#ffc83d" text-anchor="middle" letter-spacing="4" ${FONT}>FINAL</text>`;

  let stars = '';
  let s = 12345;
  for (let i = 0; i < 70; i++) {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    const sx = s % W;
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    const sy = s % H;
    stars += `<circle cx="${sx}" cy="${sy}" r="${1 + (i % 3) * 0.6}" fill="#ffffff" opacity="${0.15 + (i % 5) * 0.08}"/>`;
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
<defs>
  <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#070b30"/><stop offset="0.5" stop-color="#1a1163"/><stop offset="1" stop-color="#070b30"/></linearGradient>
  <radialGradient id="glow" cx="0.5" cy="0.5" r="0.6"><stop offset="0" stop-color="#4a4df0" stop-opacity="0.35"/><stop offset="1" stop-color="#4a4df0" stop-opacity="0"/></radialGradient>
</defs>
<rect width="${W}" height="${H}" fill="url(#bg)"/>
<rect width="${W}" height="${H}" fill="url(#glow)"/>
${stars}
<text x="${W / 2}" y="95" font-size="56" font-weight="bold" fill="#ffffff" text-anchor="middle" letter-spacing="3" ${FONT}>${xmlEsc(cut(title.toUpperCase(), 30))}</text>
<text x="${W / 2}" y="145" font-size="26" fill="#9fb4ff" text-anchor="middle" letter-spacing="5" ${FONT}>${xmlEsc(subtitle)}</text>
<text x="${W / 2}" y="195" font-size="26" fill="#ffffff" text-anchor="middle" letter-spacing="14" ${FONT}>★ ★ ★ ★ ★ ★ ★ ★</text>
${heads}${lines}${boxes}${trophy}
<text x="${W / 2}" y="${H - 26}" font-size="20" fill="#7f8bb3" text-anchor="middle" ${FONT}>Winners advance — two players meet in the final. Good luck!</text>
</svg>`;
  return svgToPng(svg);
}

async function sendFixturePhoto(chatId, pngBuffer, options = {}) {
  const https = require('https');
  const crypto = require('crypto');

  const boundary = '----YABFixtures' + crypto.randomBytes(12).toString('hex');
  const chunks = [];
  const addField = (name, value) => {
    chunks.push(Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="${name}"\r\n\r\n${String(value)}\r\n`));
  };

  addField('chat_id', chatId);
  if (options.caption) addField('caption', options.caption);
  if (options.parse_mode) addField('parse_mode', options.parse_mode);
  chunks.push(Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="photo"; filename="fixtures.png"\r\nContent-Type: image/png\r\n\r\n`));
  chunks.push(Buffer.isBuffer(pngBuffer) ? pngBuffer : Buffer.from(pngBuffer));
  chunks.push(Buffer.from(`\r\n--${boundary}--\r\n`));
  const body = Buffer.concat(chunks);

  let lastError;
  for (let attempt = 1; attempt <= 4; attempt++) {
    try {
      const result = await new Promise((resolve, reject) => {
        const req = https.request({
          hostname: 'api.telegram.org',
          path: `/bot${BOT_TOKEN}/sendPhoto`,
          method: 'POST',
          family: 4,
          agent: false,
          headers: {
            'Content-Type': `multipart/form-data; boundary=${boundary}`,
            'Content-Length': body.length,
            'Connection': 'close',
          },
        }, (res) => {
          const response = [];
          res.on('data', (chunk) => response.push(chunk));
          res.on('end', () => {
            const text = Buffer.concat(response).toString('utf8');
            let json;
            try { json = JSON.parse(text); } catch (_) {}
            if (res.statusCode >= 200 && res.statusCode < 300 && json && json.ok) return resolve(json.result);
            reject(new Error(`Telegram sendPhoto HTTP ${res.statusCode}: ${json && json.description ? json.description : text.slice(0, 300)}`));
          });
          res.on('error', reject);
        });
        req.setTimeout(65000, () => req.destroy(new Error('Telegram sendPhoto timed out after 65 seconds')));
        req.on('error', reject);
        req.end(body);
      });
      return result;
    } catch (e) {
      lastError = e;
      const msg = String(e && (e.message || e));
      const transient = /socket hang up|ECONNRESET|ETIMEDOUT|EPIPE|ENETUNREACH|EAI_AGAIN|timed out|network/i.test(msg);
      if (!transient || attempt === 4) throw e;
      console.warn(`fixtures direct send attempt ${attempt} failed: ${msg}`);
      await sleep(2000 * attempt);
    }
  }
  throw lastError || new Error('Could not send fixtures image');
}

async function postFixtures(tid, name) {
  const { data: players } = await sb
    .from('registrations')
    .select('username,user_id')
    .eq('tournament_id', tid)
    .eq('status', 'approved')
    .order('id');
  if (!players || players.length < 2) throw new Error('need at least 2 approved players');

  const names = seededShuffle(players, tid).map((p) => (p.username ? '@' + p.username : 'Player ' + p.user_id));
  if (names.length <= 32) {
    const buf = await bracketImage(name, `KNOCKOUT STAGE • ${names.length} PLAYERS`, buildBracket(names));
    await sendFixturePhoto(
      CHANNEL,
      buf,
      { caption: `🏆 <b>${esc(name)}</b> is full — the draw is out!\n\nWinners go through, and two players will meet in the final. Good luck! 🍀`, ...HTML }
    );
    return;
  }

  // very big tournaments: plain list of matches (bracket would be unreadable)
  const pairs = [];
  for (let i = 0; i < names.length; i += 2) pairs.push([names[i], names[i + 1] || null]);

  const PER_IMAGE = 12;
  const parts = Math.ceil(pairs.length / PER_IMAGE);
  for (let p = 0; p < parts; p++) {
    const chunk = pairs.slice(p * PER_IMAGE, (p + 1) * PER_IMAGE);
    const sub = `Round 1 • ${names.length} players` + (parts > 1 ? ` • part ${p + 1}/${parts}` : '');
    const buf = await fixturesImage(name, sub, chunk, p * PER_IMAGE + 1);
    await sendFixturePhoto(
      CHANNEL,
      buf,
      p === 0 ? { caption: `🏆 <b>${esc(name)}</b> is full — here are the matches!`, ...HTML } : {}
    );
  }
}

bot.command('fixtures', async (ctx) => {
  if (!isAdmin(ctx.from.id)) return;
  const { data: t } = await sb.from('tournaments').select('id,name').order('id', { ascending: false }).limit(1).maybeSingle();
  if (!t) return ctx.reply('No tournament yet.');
  try {
    await postFixtures(t.id, t.name);
    await ctx.reply('✅ Fixtures posted to the channel.');
  } catch (e) {
    await ctx.reply('Could not post fixtures: ' + e.message);
  }
});

async function announceFull(tid, name, count, needed) {
  const { data: players } = await sb
    .from('registrations')
    .select('username')
    .eq('tournament_id', tid)
    .eq('status', 'approved')
    .order('id');
  const list = (players || []).map((p, i) => `${i + 1}. @${esc(p.username)}`).join('\n');
  await notifyAdmins((id) =>
    bot.telegram.sendMessage(id, `🎉 <b>${esc(name)}</b> is FULL (${count}/${needed})!\n\n${list}\n\nYou can take it from here.`, HTML)
  );
  try {
    await postFixtures(tid, name);
  } catch (e) {
    console.error('fixtures', e.message);
    await notifyAdmins((id) =>
      bot.telegram.sendMessage(id, `⚠️ Could not post the fixtures image: ${esc(e.message)}\nFix it, then send /fixtures to try again.`, HTML)
    );
  }
}

// Reject asks the admin for a reason first
bot.action(/^rj:(\d+)$/, async (ctx) => {
  if (!isAdmin(ctx.from.id)) return ctx.answerCbQuery('Admins only');
  const regId = Number(ctx.match[1]);
  const { data: reg } = await sb.from('registrations').select('status').eq('id', regId).maybeSingle();
  if (!reg) return ctx.answerCbQuery('Not found', { show_alert: true });
  if (reg.status !== 'pending') return ctx.answerCbQuery(`Already ${reg.status}`, { show_alert: true });

  const m = ctx.callbackQuery.message;
  states.set(ctx.from.id, { step: 'rj_reason', data: { regId, chatId: m.chat.id, msgId: m.message_id, caption: m.caption || '' } });
  await ctx.answerCbQuery();
  return ctx.reply(`❌ Rejecting payment #${regId}.\nType the reason to show the user (e.g. "amount too low"), or send - for no reason.\n/cancel to abort.`);
});

/* ---------------- admin: panel, stats, pending, history, export ---------------- */
const back = [B('⬅️ Back', 'm:main')];
const MENUS = {
  main: {
    title: '⚙️ <b>Admin panel</b>\nChoose a section:',
    rows: [
      [B('🏆 Tournament', 'm:t'), B('👥 Players', 'm:p')],
      [B('🏁 Results', 'm:r'), B('👤 Users', 'm:u')],
      [B('📢 Messaging', 'm:m'), B('🛠 Tools', 'm:x')],
      [B('⏳ Pending payments', 'a_pending'), B('📊 Stats', 'a_stats')],
    ],
  },
  t: {
    title: '🏆 <b>Tournament</b>',
    rows: [
      [B('🆕 New tournament', 'a_newt'), B('✏️ Edit', 'a_edit')],
      [B('🔒 Close', 'a_close'), B('🔓 Reopen', 'a_reopen')],
      [B('📜 History', 'a_history'), B('📊 Stats', 'a_stats')],
      back,
    ],
  },
  p: {
    title: '👥 <b>Players &amp; payments</b>',
    rows: [
      [B('⏳ Pending payments', 'a_pending'), B('👥 Player list', 'a_players')],
      [B('➕ Add player', 'a_addplayer'), B('➖ Remove player', 'a_remove')],
      [B('📤 Export CSV', 'a_export')],
      back,
    ],
  },
  r: {
    title: '🏁 <b>Results</b>',
    rows: [[B('🏁 Set winners', 'a_winners'), B('💸 Payouts', 'a_payouts')], back],
  },
  u: {
    title: '👤 <b>Users</b>',
    rows: [
      [B('🔎 Look up user', 'a_user')],
      [B('🚫 Ban', 'a_ban'), B('✅ Unban', 'a_unban')],
      [B('✉️ Message a user', 'a_dm')],
      back,
    ],
  },
  m: {
    title: '📢 <b>Messaging</b>',
    rows: [
      [B('📢 Message all users', 'a_announce')],
      [B('✉️ Message approved players', 'a_msgplayers')],
      [B('⏰ Remind unregistered', 'a_remind')],
      back,
    ],
  },
  x: {
    title: '🛠 <b>Tools</b>',
    rows: [
      [B('🛒 Sell eFootball account', 'a_sell')],
      [B('🧾 Admin log', 'a_log'), B('🔧 Bot check', 'a_config')],
      back,
    ],
  },
};

async function showMenu(ctx, key) {
  const m = MENUS[key] || MENUS.main;
  const opts = { ...HTML, ...Markup.inlineKeyboard(m.rows) };
  if (ctx.callbackQuery) {
    try { return await ctx.editMessageText(m.title, opts); } catch (_) { /* fall through to a new message */ }
  }
  return ctx.reply(m.title, opts);
}

const adminPanel = (ctx) => showMenu(ctx, 'main');
bot.action(/^m:(\w+)$/, A((ctx) => showMenu(ctx, ctx.match[1])));

async function showStats(ctx) {
  const since = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
  const [{ count: users }, { count: newUsers }, { count: banned }] = await Promise.all([
    sb.from('users').select('id', { count: 'exact', head: true }),
    sb.from('users').select('id', { count: 'exact', head: true }).gte('created_at', since),
    sb.from('users').select('id', { count: 'exact', head: true }).eq('banned', true),
  ]);
  let msg =
    `📊 <b>Stats</b>\n\n👤 Bot users: <b>${users || 0}</b> (+${newUsers || 0} in 24h)\n` +
    `🚫 Banned: ${banned || 0}\n`;
  const t = await getTournament();
  if (!t) return ctx.reply(msg + '\nNo tournament yet.', HTML);

  const { data: regs } = await sb.from('registrations').select('status').eq('tournament_id', t.id);
  const c = (s) => (regs || []).filter((r) => r.status === s).length;
  const approved = c('approved');
  const income = approved * Number(t.fee);
  const prizes = Number(t.prize1) + Number(t.prize2) + Number(t.prize3);

  msg +=
    `\n🏆 <b>${esc(t.name)}</b> [${t.status}]\n` +
    `✅ Approved: <b>${approved}/${t.needed}</b>\n` +
    `⏳ Pending: <b>${c('pending')}</b>\n` +
    `❌ Rejected: ${c('rejected')} • 🚫 Removed: ${c('removed')}\n\n` +
    `💵 Income so far: <b>${income} ETB</b>\n` +
    `🎁 Total prizes: <b>${prizes} ETB</b>\n` +
    `📈 Expected income if full: ${t.needed * Number(t.fee)} ETB\n` +
    `💰 Expected profit if full: <b>${t.needed * Number(t.fee) - prizes} ETB</b>`;
  return ctx.reply(msg, HTML);
}

async function showPending(ctx) {
  const t = await getTournament();
  if (!t) return ctx.reply('No tournament yet.');
  const { data } = await sb
    .from('registrations')
    .select('*')
    .eq('tournament_id', t.id)
    .eq('status', 'pending')
    .order('id')
    .limit(10);
  if (!data || data.length === 0) return ctx.reply('No pending payments ✅');
  await ctx.reply(`⏳ ${data.length} pending payment(s):`);
  for (const reg of data) {
    if (reg.file_id === 'manual') continue;
    await sendPaymentCard(ctx.chat.id, reg, t).catch(() => {});
  }
}

async function showHistory(ctx) {
  const { data: ts } = await sb.from('tournaments').select('*').order('id', { ascending: false }).limit(8);
  if (!ts || ts.length === 0) return ctx.reply('No tournaments yet.');
  const { data: regs } = await sb
    .from('registrations')
    .select('tournament_id')
    .in('tournament_id', ts.map((t) => t.id))
    .eq('status', 'approved');
  const lines = ts.map((t) => {
    const n = (regs || []).filter((r) => r.tournament_id === t.id).length;
    return `• <b>${esc(t.name)}</b> [${t.status}] — ${n}/${t.needed} players, ${n * Number(t.fee)} ETB income (${fmtTime(t.created_at).slice(0, 10)})`;
  });
  return ctx.reply(`📜 <b>Recent tournaments</b>\n\n${lines.join('\n')}`, HTML);
}

async function exportPlayers(ctx) {
  const t = await getTournament();
  if (!t) return ctx.reply('No tournament yet.');
  const { data } = await sb.from('registrations').select('*').eq('tournament_id', t.id).order('id');
  const rows = [['id', 'username', 'user_id', 'method', 'status', 'created_at']].concat(
    (data || []).map((r) => [r.id, r.username || '', r.user_id, r.method, r.status, r.created_at])
  );
  const csv = rows.map((r) => r.map((x) => '"' + String(x).replace(/"/g, '""') + '"').join(',')).join('\n');
  return ctx.replyWithDocument({ source: Buffer.from(csv, 'utf8'), filename: `players-${t.id}.csv` });
}

async function showLog(ctx) {
  const { data } = await sb.from('admin_log').select('*').order('id', { ascending: false }).limit(15);
  if (!data || data.length === 0) return ctx.reply('No admin actions logged yet.');
  const lines = data.map((l) => `${fmtTime(l.created_at).slice(5)} • ${esc(l.admin_name)} • ${esc(l.action)} ${esc(l.detail || '')}`);
  return ctx.reply(`🧾 <b>Last actions (UTC)</b>\n\n${lines.join('\n')}`, HTML);
}

async function showConfig(ctx) {
  const t0 = Date.now();
  const { error } = await sb.from('tournaments').select('id').limit(1);
  const ms = Date.now() - t0;
  const me = await bot.telegram.getMe();
  const check = async (chat) => {
    try {
      const m = await bot.telegram.getChatMember(chat, me.id);
      return ['administrator', 'creator'].includes(m.status) ? '✅ admin' : `⚠️ ${m.status} (make the bot admin)`;
    } catch (e) {
      return '❌ not accessible';
    }
  };
  return ctx.reply(
    `🔧 <b>Bot check</b>\n\n` +
      `Bot: @${esc(me.username)}\n` +
      `Database: ${error ? '❌ ' + esc(error.message) : '✅ OK'} (${ms} ms)\n` +
      `Channel ${esc(CHANNEL)}: ${await check(CHANNEL)}\n` +
      `Group ${esc(GROUP)}: ${await check(GROUP)}\n` +
      `Sales channel ${esc(SALES_CHANNEL)}: ${await check(SALES_CHANNEL)}\n\n` +
      `🏦 CBE: <code>${esc(CBE_ACCOUNT)}</code> (${esc(CBE_NAME)})\n` +
      `📱 Telebirr: <code>${esc(TELEBIRR_NUMBER)}</code> (${esc(TELEBIRR_NAME)})\n` +
      `👮 Admins: ${ADMINS.length} • 🚫 Banned: ${bannedIds.size}`,
    HTML
  );
}

/* ---------------- admin: tournament control ---------------- */
const beginNewTournament = (ctx) => {
  states.set(ctx.from.id, { step: 't_name', data: {} });
  return ctx.reply('🆕 Tournament name?  (/cancel to abort)');
};

async function closeTournament(ctx) {
  const t = await getTournament();
  if (!t) return ctx.reply('No tournament.');
  await sb.from('tournaments').update({ status: 'closed' }).eq('id', t.id);
  logAction(ctx, 'close', t.name);
  return ctx.reply('🔒 Tournament closed.');
}

async function reopenTournament(ctx) {
  const t = await getTournament();
  if (!t) return ctx.reply('No tournament.');
  const count = await approvedCount(t.id);
  if (count >= t.needed) return ctx.reply(`Already ${count}/${t.needed} players. Raise the limit first with /setneeded.`);
  await sb.from('tournaments').update({ status: 'open' }).eq('id', t.id);
  logAction(ctx, 'reopen', t.name);
  return ctx.reply(`🔓 Tournament reopened (${count}/${t.needed} players).`);
}

const EDIT_PROMPTS = {
  name: '✏️ Send the new tournament name:',
  needed: '👥 Send the new number of players needed:',
  fee: '💰 Send the new entry fee (ETB):',
  prizes: '🎁 Send the 3 prizes: 1st 2nd 3rd  (e.g. 1000 500 200):',
  details: '📝 Send the new details (date, rules…) or - to clear:',
};

async function editTournament(ctx, field, raw) {
  const t = await getTournament();
  if (!t) return ctx.reply('No tournament.');
  const count = await approvedCount(t.id);
  const v = String(raw).trim();
  const upd = {};
  let note = '';

  switch (field) {
    case 'name':
      if (!v) return ctx.reply('Send a name.');
      upd.name = v;
      break;
    case 'details':
      upd.details = v === '-' ? null : v;
      break;
    case 'fee': {
      const n = Number(v);
      if (!(n > 0)) return ctx.reply('Send a valid fee, e.g. /setfee 100');
      upd.fee = n;
      if (count > 0) note = `\n⚠️ ${count} approved player(s) already paid the old fee (${t.fee} ETB).`;
      break;
    }
    case 'needed': {
      const n = Math.floor(Number(v));
      if (!(n > 0)) return ctx.reply('Send a valid number, e.g. /setneeded 32');
      if (n < count) return ctx.reply(`There are already ${count} approved players — cannot go below that.`);
      upd.needed = n;
      if (t.status === 'full' && n > count) { upd.status = 'open'; note = '\n🔓 Tournament reopened.'; }
      if (t.status === 'open' && n === count) { upd.status = 'full'; note = '\n🔴 Now full.'; }
      break;
    }
    case 'prizes': {
      const p = v.split(/[\s,]+/).map(Number);
      if (p.length !== 3 || p.some((x) => Number.isNaN(x) || x < 0)) {
        return ctx.reply('Send 3 numbers: 1st 2nd 3rd, e.g. /setprizes 1000 500 200');
      }
      [upd.prize1, upd.prize2, upd.prize3] = p;
      break;
    }
    default:
      return;
  }

  const { error } = await sb.from('tournaments').update(upd).eq('id', t.id);
  if (error) return ctx.reply('Update failed: ' + error.message);
  logAction(ctx, 'edit ' + field, v.slice(0, 80));
  const t2 = { ...t, ...upd };
  return ctx.reply('✅ Updated.\n\n' + tournamentText(t2, count) + note, HTML);
}

const quickEdit = (field, usage) => A(async (ctx) => {
  const arg = argsOf(ctx);
  if (!arg) return ctx.reply(`Usage: ${usage}`);
  return editTournament(ctx, field, arg);
});

const editMenu = (ctx) =>
  ctx.reply('✏️ What do you want to edit?', Markup.inlineKeyboard([
    [Markup.button.callback('Name', 'e_name'), Markup.button.callback('Players needed', 'e_needed')],
    [Markup.button.callback('Entry fee', 'e_fee'), Markup.button.callback('Prizes', 'e_prizes')],
    [Markup.button.callback('Details', 'e_details')],
  ]));

bot.action(/^e_(name|needed|fee|prizes|details)$/, A(async (ctx) => {
  const field = ctx.match[1];
  states.set(ctx.from.id, { step: 'e_val', data: { field } });
  return ctx.reply(EDIT_PROMPTS[field] + '\n(/cancel to abort)');
}));

/* ---------------- admin: players ---------------- */
async function removeReg(ctx, reg, t) {
  const { data: rows } = await sb
    .from('registrations')
    .update({ status: 'removed', reviewed_by: ctx.from.id })
    .eq('id', reg.id)
    .eq('status', 'approved')
    .select();
  if (!rows || rows.length === 0) return ctx.reply('That player is no longer approved.');
  const reopened = t.status === 'full';
  if (reopened) await sb.from('tournaments').update({ status: 'open' }).eq('id', t.id);
  logAction(ctx, 'remove', '@' + reg.username);
  bot.telegram.sendMessage(reg.user_id, `🚫 You were removed from <b>${esc(t.name)}</b> by an admin.`, HTML).catch(() => {});
  const count = await approvedCount(t.id);
  return ctx.reply(`🚫 Removed @${esc(reg.username)}. Players now ${count}/${t.needed}${reopened ? ' — tournament reopened.' : '.'}`, HTML);
}

bot.command('remove', A(async (ctx) => {
  const arg = argsOf(ctx).replace('@', '').toLowerCase();
  if (!arg) return ctx.reply('Usage: /remove @username  (or use the Players menu buttons)');
  const t = await getTournament();
  if (!t) return ctx.reply('No tournament.');
  const { data: approved } = await sb.from('registrations').select('*').eq('tournament_id', t.id).eq('status', 'approved');
  const reg = (approved || []).find((r) => (r.username || '').toLowerCase() === arg);
  if (!reg) return ctx.reply(`No approved player @${esc(arg)} in this tournament.`, HTML);
  return removeReg(ctx, reg, t);
}));

bot.action('a_remove', A(async (ctx) => {
  const t = await getTournament();
  if (!t) return ctx.reply('No tournament.');
  const { data } = await sb.from('registrations').select('id, username').eq('tournament_id', t.id).eq('status', 'approved').order('id');
  if (!data || data.length === 0) return ctx.reply('No approved players yet.');
  const btns = data.slice(0, 90).map((r) => B(`➖ @${r.username}`, `rmq:${r.id}`));
  const rows = [];
  for (let i = 0; i < btns.length; i += 2) rows.push(btns.slice(i, i + 2));
  rows.push([B('✖ Cancel', 'a_cancel')]);
  return ctx.reply('Tap the player to remove:', Markup.inlineKeyboard(rows));
}));

bot.action(/^rmq:(\d+)$/, A(async (ctx) => {
  const { data: reg } = await sb.from('registrations').select('*').eq('id', Number(ctx.match[1])).maybeSingle();
  if (!reg || reg.status !== 'approved') return ctx.reply('That player is not approved (anymore).');
  return ctx.reply(`Remove @${esc(reg.username)} from the tournament?`, {
    ...HTML,
    ...Markup.inlineKeyboard([[B('✅ Yes, remove', `rmy:${reg.id}`), B('✖ No', 'a_cancel')]]),
  });
}));

bot.action(/^rmy:(\d+)$/, A(async (ctx) => {
  const { data: reg } = await sb.from('registrations').select('*').eq('id', Number(ctx.match[1])).maybeSingle();
  if (!reg) return ctx.reply('Not found.');
  const t = await getTournament();
  if (!t || t.id !== reg.tournament_id) return ctx.reply('That registration belongs to an older tournament.');
  return removeReg(ctx, reg, t);
}));

// Register someone manually (e.g. paid in cash). They must have started the bot once.
async function addPlayer(ctx, arg) {
  const t = await getTournament();
  if (!t || t.status !== 'open') return ctx.reply('No open tournament.');
  const u = await findUser(arg);
  if (!u) return ctx.reply('User not found — they must press /start in the bot first.');
  if (u.banned) return ctx.reply('That user is banned.');
  if (!u.username) return ctx.reply('That user has no Telegram username yet.');

  const { data: reg, error } = await sb
    .from('registrations')
    .insert({ tournament_id: t.id, user_id: u.id, username: u.username, method: 'manual', file_id: 'manual' })
    .select()
    .single();
  if (error) {
    if (error.code === '23505') return ctx.reply('That user already has a pending or approved registration.');
    return ctx.reply('Failed: ' + error.message);
  }
  const { data: res } = await sb.rpc('approve_registration', { p_reg_id: reg.id, p_admin: ctx.from.id });
  if (!res || !res.ok) {
    await sb.from('registrations').update({ status: 'rejected' }).eq('id', reg.id);
    return ctx.reply(`Could not add: ${res ? res.error : 'unknown error'} (tournament may be full).`);
  }
  logAction(ctx, 'addplayer', '@' + u.username);
  bot.telegram.sendMessage(u.id, `✅ An admin registered you for <b>${esc(t.name)}</b>.\nPlayers so far: ${res.count}/${res.needed}`, HTML).catch(() => {});
  await ctx.reply(`✅ Added @${esc(u.username)} (${res.count}/${res.needed}).`, HTML);
  if (res.full) await announceFull(res.tournament_id, res.tournament_name, res.count, res.needed);
}

bot.command('addplayer', A(async (ctx) => {
  const arg = argsOf(ctx).split(/\s+/)[0];
  if (!arg) return ctx.reply('Usage: /addplayer @username  (the user must have started the bot)');
  return addPlayer(ctx, arg);
}));

bot.action('a_addplayer', A((ctx) => {
  states.set(ctx.from.id, { step: 'x_addplayer', data: {} });
  return ctx.reply('➕ Send the @username (or ID) of the player to register.\nThey must have started the bot.\n(/cancel to abort)');
}));

/* ---------------- admin: users (lookup, ban, dm) ---------------- */
async function setBan(ctx, u, ban, reason) {
  if (isAdmin(u.id)) return ctx.reply('You cannot ban an admin.');
  await sb.from('users').update({ banned: ban, ban_reason: ban ? reason || null : null }).eq('id', u.id);
  if (ban) {
    bannedIds.add(u.id);
    await sb.from('registrations').update({ status: 'rejected' }).eq('user_id', u.id).eq('status', 'pending');
  } else {
    bannedIds.delete(u.id);
  }
  logAction(ctx, ban ? 'ban' : 'unban', `${u.username ? '@' + u.username : u.id}${reason ? ' — ' + reason : ''}`);
  bot.telegram
    .sendMessage(u.id, ban ? `🚫 You have been banned from this bot.${reason ? '\nReason: ' + reason : ''}` : '✅ Your ban has been lifted.')
    .catch(() => {});

  let hint = '';
  if (ban) {
    const t = await getTournament();
    if (t) {
      const { data } = await sb.from('registrations').select('id').eq('tournament_id', t.id).eq('user_id', u.id).eq('status', 'approved').limit(1);
      if (data && data.length) hint = `\nℹ️ They are still registered — use /remove @${u.username} if needed.`;
    }
  }
  return ctx.reply(`${ban ? '🚫 Banned' : '✅ Unbanned'} ${u.username ? '@' + esc(u.username) : u.id}.${hint}`, HTML);
}

async function doBan(ctx, raw, ban) {
  const parts = raw.trim().split(/\s+/);
  if (!parts[0]) return ctx.reply(ban ? 'Usage: /ban @username|id [reason]' : 'Usage: /unban @username|id');
  const u = await findUser(parts[0]);
  if (!u) return ctx.reply('User not found (they must have started the bot).');
  return setBan(ctx, u, ban, parts.slice(1).join(' '));
}

bot.command('ban', A((ctx) => doBan(ctx, argsOf(ctx), true)));
bot.command('unban', A((ctx) => doBan(ctx, argsOf(ctx), false)));

bot.action('a_ban', A((ctx) => {
  states.set(ctx.from.id, { step: 'x_ban', data: {} });
  return ctx.reply('🚫 Send the @username or ID to ban. You can add a reason after it, e.g. @john cheating.\n(/cancel to abort)');
}));
bot.action('a_unban', A((ctx) => {
  states.set(ctx.from.id, { step: 'x_unban', data: {} });
  return ctx.reply('✅ Send the @username or ID to unban.\n(/cancel to abort)');
}));

bot.action(/^(ban|unban):(\d+)$/, A(async (ctx) => {
  const { data: u } = await sb.from('users').select('*').eq('id', Number(ctx.match[2])).maybeSingle();
  if (!u) return ctx.reply('User not found.');
  return setBan(ctx, u, ctx.match[1] === 'ban');
}));

async function showUser(ctx, arg) {
  const u = await findUser(arg);
  if (!u) return ctx.reply('User not found (they must have started the bot).');

  const [{ data: regs }, { data: wins }] = await Promise.all([
    sb.from('registrations').select('status, method, created_at, tournaments(name, fee)').eq('user_id', u.id).order('id', { ascending: false }).limit(5),
    sb.from('winners').select('place, prize').eq('user_id', u.id),
  ]);
  const regLines = (regs || []).map((r) => `• ${esc((r.tournaments && r.tournaments.name) || '?')} — ${r.status} (${r.method})`).join('\n');
  const won = (wins || []).reduce((s, w) => s + Number(w.prize), 0);

  return ctx.reply(
    `?? <b>${esc(u.first_name || '')}</b> ${u.username ? '@' + esc(u.username) : ''}\n` +
      `ID: <code>${u.id}</code>\nJoined: ${fmtTime(u.created_at)} UTC\n` +
      `Status: ${u.banned ? '🚫 banned' + (u.ban_reason ? ' — ' + esc(u.ban_reason) : '') : '✅ active'}\n` +
      `🏅 Podiums: ${(wins || []).length} • 🎁 Won: ${won} ETB\n\n` +
      `<b>Recent registrations</b>\n${regLines || 'None'}`,
    {
      ...HTML,
      ...Markup.inlineKeyboard([
        [B(u.banned ? '✅ Unban' : '🚫 Ban', `${u.banned ? 'unban' : 'ban'}:${u.id}`), B('✉️ Message', `dmq:${u.id}`)],
      ]),
    }
  );
}

bot.command('user', A((ctx) => {
  const arg = argsOf(ctx).split(/\s+/)[0];
  if (!arg) return ctx.reply('Usage: /user @username|id');
  return showUser(ctx, arg);
}));
bot.action('a_user', A((ctx) => {
  states.set(ctx.from.id, { step: 'x_user', data: {} });
  return ctx.reply('🔎 Send the @username or ID to look up.\n(/cancel to abort)');
}));
bot.action(/^ui:(\d+)$/, A((ctx) => showUser(ctx, ctx.match[1])));

async function sendDm(ctx, u, msg) {
  try {
    await bot.telegram.sendMessage(u.id, `📩 Message from admin:\n\n${msg}`);
    logAction(ctx, 'dm', u.username ? '@' + u.username : String(u.id));
    return ctx.reply('✅ Sent.');
  } catch (e) {
    return ctx.reply('Could not send: ' + e.message);
  }
}

bot.command('dm', A(async (ctx) => {
  const rest = argsOf(ctx);
  const target = rest.split(/\s+/)[0];
  const msg = rest.slice(target.length).trim();
  if (!target || !msg) return ctx.reply('Usage: /dm @username|id your message');
  const u = await findUser(target);
  if (!u) return ctx.reply('User not found.');
  return sendDm(ctx, u, msg);
}));
bot.action('a_dm', A((ctx) => {
  states.set(ctx.from.id, { step: 'x_dm', data: {} });
  return ctx.reply('✉️ Send the @username or ID of the user to message.\n(/cancel to abort)');
}));
bot.action(/^dmq:(\d+)$/, A((ctx) => {
  states.set(ctx.from.id, { step: 'x_dm2', data: { uid: ctx.match[1] } });
  return ctx.reply('✉️ Type the message to send to this user.\n(/cancel to abort)');
}));

/* ---------------- admin: broadcast / remind ---------------- */
const beginAnnounce = (target) => (ctx) => {
  states.set(ctx.from.id, { step: 'an_text', data: { target } });
  return ctx.reply(
    target === 'all'
      ? '📢 Type the message to send to ALL bot users.  (/cancel to abort)'
      : '✉️ Type the message to send to all APPROVED players.  (/cancel to abort)'
  );
};

bot.action('an_send', async (ctx) => {
  if (!isAdmin(ctx.from.id)) return;
  const st = states.get(ctx.from.id);
  await ctx.answerCbQuery().catch(() => {});
  if (!st || st.step !== 'an_confirm') return ctx.reply('Nothing to send.');
  states.delete(ctx.from.id);
  await ctx.reply('Sending…');

  let ids;
  if (st.data.target === 'players') {
    const t = await getTournament();
    if (!t) return ctx.reply('No tournament.');
    const { data } = await sb.from('registrations').select('user_id').eq('tournament_id', t.id).eq('status', 'approved');
    ids = (data || []).map((r) => r.user_id);
  }
  const sent = await broadcast((id) => bot.telegram.sendMessage(id, `📢 ${st.data.text}`), ids);
  logAction(ctx, 'broadcast ' + st.data.target, st.data.text.slice(0, 60));
  return ctx.reply(`✅ Sent to ${sent} user(s).`);
});

async function remindUnregistered(ctx) {
  const t = await getTournament();
  if (!t || t.status !== 'open') return ctx.reply('No open tournament to remind about.');
  const { data } = await sb.from('registrations').select('user_id').eq('tournament_id', t.id).in('status', ['pending', 'approved']);
  const skip = new Set((data || []).map((r) => r.user_id));
  const ids = (await allUserIds()).filter((id) => !skip.has(id) && !isAdmin(id));
  await ctx.reply(`⏰ Sending reminder to ${ids.length} user(s)…`);
  const count = await approvedCount(t.id);
  const sent = await broadcast(
    (id) =>
      bot.telegram.sendMessage(id, `⏰ <b>Spots are filling up!</b>\n\n${tournamentText(t, count)}`, {
        ...HTML,
        ...Markup.inlineKeyboard([[Markup.button.callback('📝 Register', 'register')]]),
      }),
    ids
  );
  logAction(ctx, 'remind', `${sent} users`);
  return ctx.reply(`✅ Reminder sent to ${sent} user(s).`);
}

/* ---------------- admin: winners & payouts ---------------- */
const PLACE_LABEL = ['1st', '2nd', '3rd'];

function winnerKeyboard(st) {
  const picked = new Set(st.data.picks.map((p) => p.user_id));
  const btns = st.data.players
    .filter((p) => !picked.has(p.user_id))
    .slice(0, 90)
    .map((p) => B('@' + p.username, `wp:${p.user_id}`));
  const rows = [];
  for (let i = 0; i < btns.length; i += 2) rows.push(btns.slice(i, i + 2));
  rows.push([B('✖ Cancel', 'a_cancel')]);
  return Markup.inlineKeyboard(rows);
}

function askWinner(ctx, st) {
  const i = st.data.picks.length;
  return ctx.reply(`${MEDAL[i]} Tap the <b>${PLACE_LABEL[i]} place</b> player (or type their @username):`, {
    ...HTML,
    ...winnerKeyboard(st),
  });
}

async function beginWinners(ctx) {
  const t = await getTournament();
  if (!t) return ctx.reply('No tournament.');
  const { data } = await sb.from('registrations').select('username, user_id').eq('tournament_id', t.id).eq('status', 'approved').order('id');
  if (!data || data.length < 3) return ctx.reply('You need at least 3 approved players to set winners.');
  const st = { step: 'w_pick', data: { t, players: data, picks: [] } };
  states.set(ctx.from.id, st);
  await ctx.reply(`🏁 Winners for <b>${esc(t.name)}</b>\n(/cancel to abort)`, HTML);
  return askWinner(ctx, st);
}

async function pickWinner(ctx, st, p) {
  st.data.picks.push(p);
  if (st.data.picks.length < 3) return askWinner(ctx, st);
  states.delete(ctx.from.id);
  return finishWinners(ctx, st);
}

bot.action(/^wp:(\d+)$/, A(async (ctx) => {
  const st = states.get(ctx.from.id);
  if (!st || st.step !== 'w_pick') return ctx.reply('Start again with 🏁 Set winners.');
  const uid = Number(ctx.match[1]);
  const p = st.data.players.find((x) => x.user_id === uid);
  if (!p || st.data.picks.find((x) => x.user_id === uid)) return;
  return pickWinner(ctx, st, p);
}));

async function finishWinners(ctx, st) {
  const { t, picks } = st.data;
  await sb.from('winners').delete().eq('tournament_id', t.id);
  const rows = picks.map((p, i) => ({
    tournament_id: t.id, place: i + 1, user_id: p.user_id, username: p.username, prize: t['prize' + (i + 1)],
  }));
  const { error } = await sb.from('winners').insert(rows);
  if (error) return ctx.reply('Failed to save winners: ' + error.message);
  await sb.from('tournaments').update({ status: 'closed' }).eq('id', t.id);
  logAction(ctx, 'winners', picks.map((p) => '@' + p.username).join(', '));

  const board = rows.map((r) => `${MEDAL[r.place - 1]} @${esc(r.username)} — <b>${r.prize} ETB</b>`).join('\n');
  await ctx.reply(`✅ Winners saved, tournament closed.\n\n${board}\n\nAnnouncing to everyone… Use /payouts to track payments.`, HTML);

  const sent = await broadcast((id) =>
    bot.telegram.sendMessage(id, `🏁 <b>${esc(t.name)} — Results</b>\n\n${board}\n\nCongratulations! 🎉`, HTML)
  );
  for (const r of rows) {
    bot.telegram
      .sendMessage(r.user_id, `🎉 You finished ${MEDAL[r.place - 1]} in <b>${esc(t.name)}</b> and won <b>${r.prize} ETB</b>! An admin will contact you for payment.`, HTML)
      .catch(() => {});
  }
  return ctx.reply(`📣 Results sent to ${sent} users.`);
}

async function showPayouts(ctx) {
  const t = await getTournament();
  if (!t) return ctx.reply('No tournament.');
  const { data } = await sb.from('winners').select('*').eq('tournament_id', t.id).order('place');
  if (!data || data.length === 0) return ctx.reply('No winners set yet. Use /winners.');
  await ctx.reply(`💸 <b>Payouts — ${esc(t.name)}</b>`, HTML);
  for (const w of data) {
    const line = `${MEDAL[w.place - 1]} @${esc(w.username)} (<code>${w.user_id}</code>)\n${w.prize} ETB — ${w.paid ? '✅ Paid' : '⏳ Unpaid'}`;
    await ctx.reply(line, {
      ...HTML,
      ...(w.paid ? {} : Markup.inlineKeyboard([[Markup.button.callback('✅ Mark paid', `paid:${w.id}`)]])),
    });
  }
}

bot.action(/^paid:(\d+)$/, async (ctx) => {
  if (!isAdmin(ctx.from.id)) return ctx.answerCbQuery('Admins only');
  const { data: rows } = await sb
    .from('winners')
    .update({ paid: true, paid_at: new Date().toISOString() })
    .eq('id', Number(ctx.match[1]))
    .eq('paid', false)
    .select();
  if (!rows || rows.length === 0) return ctx.answerCbQuery('Already marked paid', { show_alert: true });
  const w = rows[0];
  await ctx.answerCbQuery('✅ Marked paid');
  await ctx.editMessageText(`${MEDAL[w.place - 1]} @${esc(w.username)}\n${w.prize} ETB — ✅ Paid`, HTML).catch(() => {});
  logAction(ctx, 'paid', `@${w.username} ${w.prize} ETB`);
  bot.telegram.sendMessage(w.user_id, `💸 Your prize of <b>${w.prize} ETB</b> has been marked as paid. Thank you for playing!`, HTML).catch(() => {});
});

/* ---------------- admin: sell accounts ---------------- */
const beginSell = (ctx) => {
  states.set(ctx.from.id, { step: 'a_text', data: { photos: [] } });
  return ctx.reply('🛒 Send the account description (include price, level, players, etc.).  (/cancel to abort)');
};

bot.action('a_cancel', async (ctx) => {
  states.delete(ctx.from.id);
  await ctx.answerCbQuery();
  return ctx.reply('Cancelled.');
});

/* ---------------- numbered accounts + buy flow ---------------- */
const publishKb = () =>
  Markup.inlineKeyboard([[Markup.button.callback('📣 Publish', 'a_publish'), Markup.button.callback('✖ Cancel', 'a_cancel')]]);

const RESERVE_MS = RESERVE_MINUTES * 60 * 1000;
const RESERVE_LOST = '⚠️ This account is no longer reserved for you (time ran out or someone else took it). Tap the buy button on the post again.';
const saleTag = (s) => `#EF${s.sale_no}`;
const payTag = (s) => `#PAYEF${s.sale_no}`;

function detectPrice(text) {
  const t = String(text).replace(/,/g, '');
  const m =
    t.match(/(?:price|cost|amount|birr|etb)\s*[:=\-]?\s*(\d+(?:\.\d+)?)/i) ||
    t.match(/(\d+(?:\.\d+)?)\s*(?:etb|birr|br)\b/i);
  const n = m ? Number(m[1]) : 0;
  return n > 0 ? n : null;
}

const saleCaption = (s, opts = {}) =>
  `🎮 <b>eFootball account for sale</b> ${saleTag(s)}${opts.again ? '\n🔁 <b>Back on sale</b>' : ''}\n\n` +
  `${esc((s.description || '').slice(0, 700))}\n\n💰 Price: <b>${s.price} ETB</b>\n\n` +
  (opts.sold ? '❌ <b>SOLD</b>' : '📩 Tap the button below to buy.');

const buyKeyboard = (s) =>
  Markup.inlineKeyboard([[Markup.button.url('🛒 Buy this account', `https://t.me/${BOT_USERNAME}?start=buy_${s.id}`)]]);

// Post an account to the sales channel + all users, remembering each message so it can be marked SOLD later
async function postSale(s, again, ctx) {
  const caption = saleCaption(s, { again });
  const kb = buyKeyboard(s);
  const photos = s.photos || [];
  const record = (m, kind) =>
    sb.from('sale_posts')
      .insert({ sale_id: s.id, chat_id: m.chat.id, message_id: m.message_id, kind })
      .then(({ error }) => error && console.error('sale_posts', error.message));
  const send = async (chatId) => {
    if (photos.length === 0) {
      const m = await bot.telegram.sendMessage(chatId, caption, { ...HTML, ...kb });
      return record(m, 'text');
    }
    for (let i = 0; i < photos.length; i++) {
      const m = await bot.telegram.sendPhoto(chatId, photos[i], {
        ...(i === 0 ? { caption } : {}),
        ...HTML,
        ...kb,
      });
      await record(m, i === 0 ? 'photo_cap' : 'photo');
    }
  };
  await send(SALES_CHANNEL || CHANNEL).catch((e) => ctx && ctx.reply('Channel post failed: ' + e.message));
  return broadcast(send);
}

// Edit every post of this account to show SOLD and remove the buy button
async function markPostsSold(s) {
  const { data: posts } = await sb.from('sale_posts').select('*').eq('sale_id', s.id);
  const text = saleCaption(s, { sold: true });
  const noKb = { inline_keyboard: [] };
  for (const p of posts || []) {
    try {
      if (p.kind === 'text') await bot.telegram.editMessageText(p.chat_id, p.message_id, undefined, text, { ...HTML, reply_markup: noKb });
      else if (p.kind === 'photo_cap') await bot.telegram.editMessageCaption(p.chat_id, p.message_id, undefined, text, { ...HTML, reply_markup: noKb });
      else await bot.telegram.editMessageReplyMarkup(p.chat_id, p.message_id, undefined, noKb);
    } catch (_) { /* message deleted / user blocked bot */ }
    await sleep(50);
  }
}

async function touchReservation(saleId, userId) {
  const { data } = await sb
    .from('account_sales')
    .update({ reserved_at: new Date().toISOString() })
    .eq('id', saleId).eq('status', 'reserved').eq('buyer_id', userId)
    .select('id');
  return !!(data && data.length);
}

async function releaseReservation(userId) {
  await sb
    .from('account_sales')
    .update({ status: 'available', buyer_id: null, reserved_at: null })
    .eq('buyer_id', userId).eq('status', 'reserved');
}

// User tapped the buy button on a post (deep link /start buy_<id>)
async function deleteCheckoutMessage(ctx, messageId) {
  if (!messageId) return;
  try { await ctx.telegram.deleteMessage(ctx.chat.id, messageId); } catch (_) {}
}

async function sendCheckoutMessage(ctx, text, extra = {}) {
  const st = states.get(ctx.from.id);
  if (st && st.data && st.data.messageId) {
    await deleteCheckoutMessage(ctx, st.data.messageId);
  }
  const m = await ctx.reply(text, extra);
  const current = states.get(ctx.from.id);
  if (current) {
    current.data = current.data || {};
    current.data.messageId = m.message_id;
  }
  return m;
}

async function startPurchase(ctx, saleId) {
  states.delete(ctx.from.id);
  const { data: s } = await sb.from('account_sales').select('*').eq('id', saleId).maybeSingle();
  if (!s || !s.sale_no) return ctx.reply('That account is no longer available.');
  if (!s.price) return ctx.reply('This account has no price set. Please contact the admin.');
  if (s.status === 'sold') return ctx.reply(`❌ ${saleTag(s)} is already sold.`);
  if (s.status === 'pending') {
    return ctx.reply(
      s.buyer_id === ctx.from.id
        ? `⏳ Your payment for ${saleTag(s)} is waiting for admin approval.`
        : `⏳ ${saleTag(s)} has a payment waiting for approval, so it can't be requested right now. If that payment fails, the account will be posted again.`
    );
  }

  // Atomic claim: only succeeds if free, already mine, or someone's reservation has expired
  const cutoff = new Date(Date.now() - RESERVE_MS).toISOString();
  const { data: got, error } = await sb
    .from('account_sales')
    .update({ status: 'reserved', buyer_id: ctx.from.id, reserved_at: new Date().toISOString() })
    .eq('id', s.id)
    .or(`status.eq.available,and(status.eq.reserved,buyer_id.eq.${ctx.from.id}),and(status.eq.reserved,reserved_at.lt.${cutoff})`)
    .select()
    .maybeSingle();
  if (error) { console.error('claim sale', error.message); return ctx.reply('Something went wrong, please try again.'); }
  if (!got) return ctx.reply(`⏳ ${saleTag(s)} is being bought by another user right now. Try again in a few minutes.`);

  const m = await ctx.reply(
    `🛒 <b>${saleTag(s)}</b>\n\n💰 Amount to pay: <b>${s.price} ETB</b>\n\nChoose a payment method:`,
    {
      ...HTML,
      ...Markup.inlineKeyboard([
        [B('🏦 CBE', `bpay:cbe:${s.id}`), B('📱 Telebirr', `bpay:telebirr:${s.id}`)],
        [B('✖ Cancel', 'bcancel')],
      ]),
    }
  );
  states.set(ctx.from.id, { step: 'buy_method', data: { saleId: s.id, messageId: m.message_id } });
  return m;
}

bot.action(/^bpay:(cbe|telebirr):(\d+)$/, async (ctx) => {
  await ctx.answerCbQuery().catch(() => {});
  const method = ctx.match[1];
  const saleId = Number(ctx.match[2]);
  const { data: s } = await sb.from('account_sales').select('*').eq('id', saleId).maybeSingle();
  if (!s || s.status !== 'reserved' || s.buyer_id !== ctx.from.id) return ctx.reply(RESERVE_LOST);
  await touchReservation(saleId, ctx.from.id);
  const previousMessageId = ctx.callbackQuery && ctx.callbackQuery.message ? ctx.callbackQuery.message.message_id : null;
  await deleteCheckoutMessage(ctx, previousMessageId);

  const account = method === 'cbe' ? CBE_ACCOUNT : TELEBIRR_NUMBER;
  const details =
    method === 'cbe'
      ? `🏦 <b>CBE</b>\nAccount: <code>${esc(CBE_ACCOUNT)}</code>\nName: ${esc(CBE_NAME)}`
      : `📱 <b>Telebirr</b>\nNumber: <code>${esc(TELEBIRR_NUMBER)}</code>\nName: ${esc(TELEBIRR_NAME)}`;

  // Send native Telegram copy buttons directly through the Bot API.
  const m = await ctx.telegram.callApi('sendMessage', {
    chat_id: ctx.chat.id,
    text: `${details}\n\n🏷 ${saleTag(s)}\n💰 Amount: <b>${s.price} ETB</b>\n\nAfter paying, send the <b>screenshot</b> of your payment here as a photo.\n(/cancel to stop)`,
    parse_mode: 'HTML',
    reply_markup: copyButtons(s.price, account),
  });
  states.set(ctx.from.id, { step: 'buy_shot', data: { saleId, method, messageId: m.message_id } });
  return m;
});

bot.action('bcancel', async (ctx) => {
  await ctx.answerCbQuery().catch(() => {});
  states.delete(ctx.from.id);
  await releaseReservation(ctx.from.id);
  return ctx.reply('Cancelled.');
});

// Email, then phone
async function handleBuyText(ctx, st) {
  const text = ctx.message.text.trim();
  if (!(await touchReservation(st.data.saleId, ctx.from.id))) {
    states.delete(ctx.from.id);
    return ctx.reply(RESERVE_LOST);
  }
  if (st.step === 'buy_email') {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text)) return ctx.reply('That does not look like a valid email. Send it again (or /cancel):');
    st.data.email = text;
    st.step = 'buy_phone';
    return ctx.reply('📞 Send your phone number, so we can call you for the code if you are offline:');
  }
  if (text.replace(/\D/g, '').length < 7 || !/^[+\d\s\-()]+$/.test(text)) {
    return ctx.reply('That does not look like a valid phone number. Send it again (or /cancel):');
  }
  return submitPurchase(ctx, st, text);
}

const sendOrderCard = (chatId, o, s) =>
  bot.telegram.sendPhoto(chatId, o.file_id, {
    caption:
      `💳 <b>${payTag(s)}</b>\n` +
      `Account: ${saleTag(s)}\n` +
      `User: ${o.username ? '@' + esc(o.username) : 'no username'} (<code>${o.user_id}</code>)\n` +
      `Method: ${o.method.toUpperCase()}\nAmount: ${s.price} ETB\n` +
      `📧 ${esc(o.email)}\n📞 ${esc(o.phone)}`,
    parse_mode: 'HTML',
    ...Markup.inlineKeyboard([
      [B('✅ Approve', `eap:${o.id}`), B('❌ Reject', `erj:${o.id}`)],
      [B('👤 User info', `ui:${o.user_id}`)],
    ]),
  });

async function submitPurchase(ctx, st, phone) {
  const { saleId, method, fileId, email } = st.data;
  states.delete(ctx.from.id);

  // Lock the account: from now on nobody else can request it
  const { data: s } = await sb
    .from('account_sales')
    .update({ status: 'pending', reserved_at: new Date().toISOString() })
    .eq('id', saleId).eq('status', 'reserved').eq('buyer_id', ctx.from.id)
    .select().maybeSingle();
  if (!s) return ctx.reply(RESERVE_LOST);

  const { data: o, error } = await sb
    .from('account_orders')
    .insert({ sale_id: s.id, user_id: ctx.from.id, username: ctx.from.username || null, method, file_id: fileId, email, phone })
    .select().single();
  if (error) {
    console.error('insert order', error.message);
    await sb.from('account_sales').update({ status: 'available', buyer_id: null, reserved_at: null }).eq('id', s.id);
    return ctx.reply('Something went wrong, please try again.');
  }

  // Admin gets the screenshot card (Approve / Reject) from the bot
  await notifyAdmins((id) => sendOrderCard(id, o, s));

  const msg = `Hey bicho, I wanted to buy ${saleTag(s)} and I've sent the payment check ${payTag(s)}. If I'm not online, call me at ${phone}.`;
  const done = `✅ Done! Your payment for ${saleTag(s)} is waiting for admin approval. You will be notified here.`;
  if (ADMIN_USERNAME) {
    return ctx.reply(`${done}\n\nTap the button, then press <b>Send</b> in the admin chat.`, {
      ...HTML,
      ...Markup.inlineKeyboard([[Markup.button.url('📩 Message the admin', `https://t.me/${ADMIN_USERNAME}?text=${encodeURIComponent(msg)}`)]]),
    });
  }
  return ctx.reply(`${done}\n\nSend this message to the admin:\n<code>${esc(msg)}</code>`, HTML);
}

bot.action(/^eap:(\d+)$/, A(async (ctx) => {
  const { data: o } = await sb
    .from('account_orders')
    .update({ status: 'approved', reviewed_by: ctx.from.id })
    .eq('id', Number(ctx.match[1])).eq('status', 'pending')
    .select().maybeSingle();
  if (!o) return ctx.reply('That payment was already handled.');

  const { data: s } = await sb.from('account_sales').update({ status: 'sold' }).eq('id', o.sale_id).select().single();
  await ctx.editMessageCaption(`${esc(ctx.callbackQuery.message.caption)}\n\n✅ APPROVED by ${esc(ctx.from.first_name)} — SOLD`, HTML).catch(() => {});
  logAction(ctx, 'approve account', `${payTag(s)} ${o.phone}`);
  bot.telegram
    .sendMessage(o.user_id, `✅ Payment approved! ${saleTag(s)} is sold to you. The account will be sent to ${o.email}. We may call you at ${o.phone} for the code.`)
    .catch(() => {});
  if (s.seller_id) {
    bot.telegram.sendMessage(s.seller_id, `💰 Your account ${saleTag(s)} was sold! The admin will contact you about your payment.`).catch(() => {});
  }
  await ctx.reply(`✅ ${saleTag(s)} marked as SOLD. Updating the posts…`);
  markPostsSold(s).catch((e) => console.error('markPostsSold', e.message));
}));

bot.action(/^erj:(\d+)$/, A(async (ctx) => {
  const { data: o } = await sb
    .from('account_orders')
    .update({ status: 'rejected', reviewed_by: ctx.from.id })
    .eq('id', Number(ctx.match[1])).eq('status', 'pending')
    .select().maybeSingle();
  if (!o) return ctx.reply('That payment was already handled.');

  const { data: s } = await sb
    .from('account_sales')
    .update({ status: 'available', buyer_id: null, reserved_at: null })
    .eq('id', o.sale_id).select().single();
  await ctx.editMessageCaption(`${esc(ctx.callbackQuery.message.caption)}\n\n❌ REJECTED by ${esc(ctx.from.first_name)}`, HTML).catch(() => {});
  logAction(ctx, 'reject account', payTag(s));
  bot.telegram.sendMessage(o.user_id, `❌ Your payment for ${saleTag(s)} was rejected. Contact the admin if you think this is a mistake.`).catch(() => {});
  await ctx.reply(`♻️ ${saleTag(s)} is available again. Reposting…`);
  const sent = await postSale(s, true, ctx);
  return ctx.reply(`✅ ${saleTag(s)} reposted to the channel and sent to ${sent} users.`);
}));

bot.action('a_publish', async (ctx) => {
  if (!isAdmin(ctx.from.id)) return;
  const st = states.get(ctx.from.id);
  await ctx.answerCbQuery().catch(() => {});
  if (!st || st.step !== 'a_photos') return ctx.reply('Nothing to publish.');
  states.delete(ctx.from.id);

  const { data: s, error } = await sb
    .from('account_sales')
    .insert({ description: st.data.text, photos: st.data.photos, price: st.data.price, posted_by: ctx.from.id })
    .select().single();
  if (error) {
    console.error('insert sale', error.message);
    return ctx.reply('Failed to save the account: ' + error.message);
  }
  logAction(ctx, 'sell', `${saleTag(s)} ${st.data.text.slice(0, 60)}`);
  const sent = await postSale(s, false, ctx);
  return ctx.reply(`✅ ${saleTag(s)} posted to channel and sent to ${sent} users.`);
});

/* ---------------- users post accounts for sale (admin reviews) ---------------- */
const usellKb = () => Markup.inlineKeyboard([[B('📨 Submit to admin', 'usell_submit'), B('✖ Cancel', 'usell_cancel')]]);
const USELL_NEXT = 'Now send the account images (up to 10), then tap Submit.';

async function beginUserSell(ctx) {
  if (!ctx.from.username) {
    return ctx.reply('⚠️ You need a Telegram username to sell. Set one in Telegram Settings → Username, then try again.');
  }
  const { count } = await sb
    .from('account_submissions')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', ctx.from.id).eq('status', 'pending');
  if ((count || 0) >= 3) return ctx.reply('⏳ You already have 3 accounts waiting for admin review. Please wait for a decision.');
  states.set(ctx.from.id, { step: 'us_text', data: { photos: [] } });
  return ctx.reply(
    '💼 <b>Sell your account</b>\n\nSend the account description <b>with the price</b>, for example:\n<i>Level 30, 3 star players, 2000 coins. Price: 500 ETB</i>\n\n(/cancel to stop)',
    HTML
  );
}

async function handleUserSellText(ctx, st) {
  const text = ctx.message.text.trim();
  const isNum = /^[\d.,]+$/.test(text) && Number(text.replace(/,/g, '')) > 0;
  const n = isNum ? Number(text.replace(/,/g, '')) : null;

  if (st.step === 'us_text') {
    if (text.length < 10) return ctx.reply('Please write a longer description (include the price).');
    st.data.text = text.slice(0, 1500);
    const price = detectPrice(text);
    if (!price) {
      st.step = 'us_price';
      return ctx.reply('💰 I could not find a price. Send the price in ETB (number only):');
    }
    st.data.price = price;
    st.step = 'us_photos';
    return ctx.reply(`💰 Price detected: ${price} ETB (send a number any time to change it).\n\n${USELL_NEXT}`, usellKb());
  }
  if (st.step === 'us_price') {
    if (!n) return ctx.reply('Send a valid price, e.g. 500');
    st.data.price = n;
    st.step = 'us_photos';
    return ctx.reply(`💰 Price set to ${n} ETB.\n\n${USELL_NEXT}`, usellKb());
  }
  if (n) { st.data.price = n; return ctx.reply(`💰 Price changed to ${n} ETB.`); }
  return ctx.reply('Send images, or a number to change the price. Tap Submit when done.', usellKb());
}

const submissionCaption = (x) =>
  `💼 <b>Account submission</b> #S${x.id}\n` +
  `From: @${esc(x.username)} (<code>${x.user_id}</code>)\n💰 Price: <b>${x.price} ETB</b>\n\n` +
  esc((x.description || '').slice(0, 700));

async function sendSubmissionCard(chatId, x) {
  const kb = Markup.inlineKeyboard([
    [B('✅ Approve & publish', `sap:${x.id}`), B('❌ Reject', `srj:${x.id}`)],
    [B('✏️ Change price', `sprice:${x.id}`), B('👤 User info', `ui:${x.user_id}`)],
  ]);
  const photos = x.photos || [];
  if (!photos.length) return bot.telegram.sendMessage(chatId, submissionCaption(x), { ...HTML, ...kb });
  await bot.telegram.sendPhoto(chatId, photos[0], { caption: submissionCaption(x), ...HTML, ...kb });
  const rest = photos.slice(1);
  if (rest.length === 1) await bot.telegram.sendPhoto(chatId, rest[0]).catch(() => {});
  else if (rest.length > 1) await bot.telegram.sendMediaGroup(chatId, rest.map((f) => ({ type: 'photo', media: f }))).catch(() => {});
}

bot.command('sellaccount', beginUserSell);
bot.action('menu:usell', async (ctx) => {
  await ctx.answerCbQuery().catch(() => {});
  return beginUserSell(ctx);
});
bot.action('usell_cancel', async (ctx) => {
  await ctx.answerCbQuery().catch(() => {});
  states.delete(ctx.from.id);
  return ctx.reply('Cancelled.');
});
bot.action('usell_submit', async (ctx) => {
  await ctx.answerCbQuery().catch(() => {});
  const st = states.get(ctx.from.id);
  if (!st || st.step !== 'us_photos') return ctx.reply('Nothing to submit.');
  states.delete(ctx.from.id);
  const { data: x, error } = await sb
    .from('account_submissions')
    .insert({ user_id: ctx.from.id, username: ctx.from.username || null, description: st.data.text, photos: st.data.photos, price: st.data.price })
    .select().single();
  if (error) {
    console.error('insert submission', error.message);
    return ctx.reply('Something went wrong, please try again.');
  }
  await ctx.reply(`✅ Sent to the admin for review (#S${x.id}). You will be notified here.`);
  await notifyAdmins((id) => sendSubmissionCard(id, x));
});

const editCard = (ctx, note) => {
  const m = ctx.callbackQuery.message;
  const body = `${esc(m.caption || m.text || '')}\n\n${note}`;
  return (m.caption ? ctx.editMessageCaption(body, HTML) : ctx.editMessageText(body, HTML)).catch(() => {});
};

bot.action(/^sap:(\d+)$/, A(async (ctx) => {
  const { data: x } = await sb
    .from('account_submissions')
    .update({ status: 'approved', reviewed_by: ctx.from.id })
    .eq('id', Number(ctx.match[1])).eq('status', 'pending')
    .select().maybeSingle();
  if (!x) return ctx.reply('That submission was already handled.');

  const { data: s, error } = await sb
    .from('account_sales')
    .insert({ description: x.description, photos: x.photos, price: x.price, posted_by: ctx.from.id, seller_id: x.user_id })
    .select().single();
  if (error) {
    console.error('publish submission', error.message);
    await sb.from('account_submissions').update({ status: 'pending', reviewed_by: null }).eq('id', x.id);
    return ctx.reply('Failed to publish: ' + error.message);
  }
  await sb.from('account_submissions').update({ sale_id: s.id }).eq('id', x.id);
  await editCard(ctx, `✅ APPROVED by ${esc(ctx.from.first_name)} — published as ${saleTag(s)}`);
  logAction(ctx, 'approve submission', `#S${x.id} ${saleTag(s)}`);
  bot.telegram.sendMessage(x.user_id, `✅ Your account was approved and published as ${saleTag(s)}. You will be notified when it sells.`).catch(() => {});
  const sent = await postSale(s, false, ctx);
  return ctx.reply(`✅ ${saleTag(s)} posted to channel and sent to ${sent} users.`);
}));

bot.action(/^sprice:(\d+)$/, A(async (ctx) => {
  const m = ctx.callbackQuery.message;
  states.set(ctx.from.id, { step: 'sp_price', data: { id: Number(ctx.match[1]), chatId: m.chat.id, messageId: m.message_id, caption: !!m.caption } });
  return ctx.reply(`✏️ Send the new price in ETB for #S${ctx.match[1]} (/cancel to stop):`);
}));

// Update the price shown on every post of an account
async function refreshPosts(s) {
  const { data: posts } = await sb.from('sale_posts').select('*').eq('sale_id', s.id);
  const text = saleCaption(s);
  const kb = buyKeyboard(s);
  for (const p of posts || []) {
    try {
      if (p.kind === 'text') await bot.telegram.editMessageText(p.chat_id, p.message_id, undefined, text, { ...HTML, ...kb });
      else if (p.kind === 'photo_cap') await bot.telegram.editMessageCaption(p.chat_id, p.message_id, undefined, text, { ...HTML, ...kb });
    } catch (_) { /* deleted / blocked */ }
    await sleep(50);
  }
}

// /accountprice 3 600   (or: /accountprice #EF3 600)
bot.command('accountprice', A(async (ctx) => {
  const [, ref, priceTxt] = ctx.message.text.trim().split(/\s+/);
  const no = Number(String(ref || '').replace(/[^\d]/g, ''));
  const price = Number(String(priceTxt || '').replace(/,/g, ''));
  if (!no || !(price > 0)) return ctx.reply('Usage: /accountprice 3 600  (changes #EF3 to 600 ETB)');

  const { data: s } = await sb
    .from('account_sales')
    .update({ price })
    .eq('sale_no', no).eq('status', 'available')
    .select().maybeSingle();
  if (!s) {
    const { data: cur } = await sb.from('account_sales').select('status').eq('sale_no', no).maybeSingle();
    if (!cur) return ctx.reply(`#EF${no} not found.`);
    return ctx.reply(
      cur.status === 'sold'
        ? `#EF${no} is already sold.`
        : `#EF${no} has a buyer in progress, so its price can't change now. Handle that payment first.`
    );
  }
  logAction(ctx, 'account price', `#EF${no} → ${price}`);
  await ctx.reply(`💰 ${saleTag(s)} is now ${price} ETB. Updating the posts…`);
  refreshPosts(s).catch((e) => console.error('refreshPosts', e.message));
}));

bot.action(/^srj:(\d+)$/, A(async (ctx) => {
  const { data: x } = await sb
    .from('account_submissions')
    .update({ status: 'rejected', reviewed_by: ctx.from.id })
    .eq('id', Number(ctx.match[1])).eq('status', 'pending')
    .select().maybeSingle();
  if (!x) return ctx.reply('That submission was already handled.');
  await editCard(ctx, `❌ REJECTED by ${esc(ctx.from.first_name)}`);
  logAction(ctx, 'reject submission', `#S${x.id}`);
  bot.telegram.sendMessage(x.user_id, `❌ Your account submission #S${x.id} was not accepted. Contact the admin if you have questions.`).catch(() => {});
}));

/* ---------------- admin: command + button registrations ---------------- */
bot.command('admin', A(adminPanel));
bot.command('stats', A(showStats));
bot.action('a_stats', A(showStats));
bot.command('pending', A(showPending));
bot.action('a_pending', A(showPending));
bot.command('history', A(showHistory));
bot.action('a_history', A(showHistory));
bot.command('export', A(exportPlayers));
bot.action('a_export', A(exportPlayers));
bot.command('log', A(showLog));
bot.action('a_log', A(showLog));
bot.command('config', A(showConfig));
bot.action('a_config', A(showConfig));
bot.command('newtournament', A(beginNewTournament));
bot.action('a_newt', A(beginNewTournament));
bot.command('edit', A(editMenu));
bot.action('a_edit', A(editMenu));
bot.command('setfee', quickEdit('fee', '/setfee 100'));
bot.command('setneeded', quickEdit('needed', '/setneeded 32'));
bot.command('setprizes', quickEdit('prizes', '/setprizes 1000 500 200'));
bot.command('setname', quickEdit('name', '/setname My Cup'));
bot.command('setdetails', quickEdit('details', '/setdetails Starts Saturday 8PM, 15 min matches'));
bot.command('close', A(closeTournament));
bot.action('a_close', A(closeTournament));
bot.command('reopen', A(reopenTournament));
bot.action('a_reopen', A(reopenTournament));
bot.action('a_players', A(showPlayers));
bot.command('winners', A(beginWinners));
bot.action('a_winners', A(beginWinners));
bot.command('payouts', A(showPayouts));
bot.action('a_payouts', A(showPayouts));
bot.command('sell', A(beginSell));
bot.action('a_sell', A(beginSell));
bot.command('announce', A(beginAnnounce('all')));
bot.action('a_announce', A(beginAnnounce('all')));
bot.command('msgplayers', A(beginAnnounce('players')));
bot.action('a_msgplayers', A(beginAnnounce('players')));
bot.command('remind', A(remindUnregistered));
bot.action('a_remind', A(remindUnregistered));

/* ---------------- text wizards ---------------- */
bot.on('text', async (ctx, next) => {
  const st = states.get(ctx.from.id);
  if (st && st.step === 'await_txn') return handleTournamentTxn(ctx, st);
  if (st && st.step === 'buy_shot') return ctx.reply('Please send the payment screenshot as a photo, or /cancel.');
  if (st && (st.step === 'buy_email' || st.step === 'buy_phone')) return handleBuyText(ctx, st);
  if (st && st.step.startsWith('us_')) return handleUserSellText(ctx, st);
  if (!st || !isAdmin(ctx.from.id)) return next();
  const text = ctx.message.text.trim();
  const num = Number(text);
  const needNum = () => (Number.isFinite(num) && num > 0 ? true : (ctx.reply('Send a valid number.'), false));

  switch (st.step) {
    case 't_name':
      st.data.name = text; st.step = 't_needed';
      return ctx.reply('How many players are needed?');
    case 't_needed':
      if (!needNum()) return;
      st.data.needed = Math.floor(num); st.step = 't_fee';
      return ctx.reply('Entry fee per player (ETB)?');
    case 't_fee':
      if (!needNum()) return;
      st.data.fee = num; st.step = 't_p1';
      return ctx.reply('🥇 1st place prize (ETB)?');
    case 't_p1':
      if (!needNum()) return;
      st.data.p1 = num; st.step = 't_p2';
      return ctx.reply('🥈 2nd place prize (ETB)?');
    case 't_p2':
      if (!needNum()) return;
      st.data.p2 = num; st.step = 't_p3';
      return ctx.reply('🥉 3rd place prize (ETB)?');
    case 't_p3':
      if (!needNum()) return;
      st.data.p3 = num; st.step = 't_details';
      return ctx.reply('📝 Extra details for players (date/time, rules, format…)?\nSend - to skip.');
    case 't_details': {
      const d = st.data;
      states.delete(ctx.from.id);

      // close any previous tournament, then create the new one
      await sb.from('tournaments').update({ status: 'closed' }).in('status', ['open', 'full']);
      const { data: t, error } = await sb
        .from('tournaments')
        .insert({
          name: d.name, needed: d.needed, fee: d.fee,
          prize1: d.p1, prize2: d.p2, prize3: d.p3,
          details: text === '-' ? null : text,
          status: 'open',
        })
        .select()
        .single();
      if (error) return ctx.reply('Failed to create tournament: ' + error.message);
      logAction(ctx, 'new tournament', t.name);

      await ctx.reply('✅ Tournament created. Notifying all users…');
      const msg = tournamentText(t);
      const sent = await broadcast((id) =>
        bot.telegram.sendMessage(id, msg + '\n\n🔥 Registration is open!', {
          ...HTML,
          ...Markup.inlineKeyboard([[Markup.button.callback('📝 Register', 'register')]]),
        })
      );
      return ctx.reply(`📣 Sent to ${sent} users.`);
    }
    case 'e_val':
      states.delete(ctx.from.id);
      return editTournament(ctx, st.data.field, text);
    case 'rj_reason': {
      const { regId, chatId, msgId, caption } = st.data;
      states.delete(ctx.from.id);
      const reason = text === '-' ? null : text;
      const { data: rows } = await sb
        .from('registrations')
        .update({ status: 'rejected', reviewed_by: ctx.from.id })
        .eq('id', regId)
        .eq('status', 'pending')
        .select();
      if (!rows || rows.length === 0) return ctx.reply('That payment was already handled.');
      bot.telegram
        .editMessageCaption(chatId, msgId, undefined,
          `${esc(caption)}\n\n❌ REJECTED by ${esc(ctx.from.first_name)}${reason ? `\nReason: ${esc(reason)}` : ''}`, HTML)
        .catch(() => {});
      logAction(ctx, 'reject', `payment #${regId}${reason ? ' — ' + reason : ''}`);
      bot.telegram
        .sendMessage(rows[0].user_id, `❌ Your payment was rejected.${reason ? '\nReason: ' + reason : ''}\nUse /register to try again with a valid screenshot.`)
        .catch(() => {});
      return ctx.reply(`❌ Payment #${regId} rejected.`);
    }
    case 'w_pick': {
      const name = text.replace('@', '').toLowerCase();
      const p = st.data.players.find((x) => (x.username || '').toLowerCase() === name);
      if (!p) return ctx.reply('That username is not an approved player in this tournament. Tap a button or try again:');
      if (st.data.picks.find((x) => x.user_id === p.user_id)) return ctx.reply('Already picked for another place. Choose a different player:');
      return pickWinner(ctx, st, p);
    }
    case 'x_addplayer':
      states.delete(ctx.from.id);
      return addPlayer(ctx, text.split(/\s+/)[0]);
    case 'x_user':
      states.delete(ctx.from.id);
      return showUser(ctx, text.split(/\s+/)[0]);
    case 'x_ban':
      states.delete(ctx.from.id);
      return doBan(ctx, text, true);
    case 'x_unban':
      states.delete(ctx.from.id);
      return doBan(ctx, text, false);
    case 'x_dm': {
      const u = await findUser(text.split(/\s+/)[0]);
      if (!u) return ctx.reply('User not found. Try again or /cancel.');
      st.data.uid = u.id; st.step = 'x_dm2';
      return ctx.reply(`✉️ Type the message for ${u.username ? '@' + u.username : u.id}:`);
    }
    case 'x_dm2': {
      states.delete(ctx.from.id);
      const u = await findUser(String(st.data.uid));
      if (!u) return ctx.reply('User not found.');
      return sendDm(ctx, u, text);
    }
    case 'a_text': {
      st.data.text = text;
      const price = detectPrice(text);
      if (!price) {
        st.step = 'a_price';
        return ctx.reply('💰 I could not find a price in the description. Send the price in ETB (number only):');
      }
      st.data.price = price; st.step = 'a_photos';
      return ctx.reply(`💰 Price detected: ${price} ETB (send a number any time to change it).\n\nNow send the account images (up to 10). Press Publish when done, or Publish now for text only.`, publishKb());
    }
    case 'sp_price': {
      if (!needNum()) return;
      states.delete(ctx.from.id);
      const d = st.data;
      const { data: x } = await sb.from('account_submissions').update({ price: num }).eq('id', d.id).eq('status', 'pending').select().maybeSingle();
      if (!x) return ctx.reply('That submission was already handled.');
      const kb = Markup.inlineKeyboard([
        [B('✅ Approve & publish', `sap:${x.id}`), B('❌ Reject', `srj:${x.id}`)],
        [B('✏️ Change price', `sprice:${x.id}`), B('👤 User info', `ui:${x.user_id}`)],
      ]);
      const extra = { ...HTML, ...kb };
      await (d.caption
        ? bot.telegram.editMessageCaption(d.chatId, d.messageId, undefined, submissionCaption(x), extra)
        : bot.telegram.editMessageText(d.chatId, d.messageId, undefined, submissionCaption(x), extra)
      ).catch(() => {});
      return ctx.reply(`💰 Price for #S${x.id} set to ${num} ETB.`);
    }
    case 'a_price':
      if (!needNum()) return;
      st.data.price = num; st.step = 'a_photos';
      return ctx.reply(`💰 Price set to ${num} ETB.\n\nNow send the account images (up to 10). Press Publish when done, or Publish now for text only.`, publishKb());
    case 'a_photos':
      if (Number.isFinite(num) && num > 0) { st.data.price = num; return ctx.reply(`💰 Price changed to ${num} ETB.`); }
      return ctx.reply('Send images, or a number to change the price. Press Publish when done.', publishKb());
    case 'an_text':
      st.data.text = text; st.step = 'an_confirm';
      return ctx.reply(
        `Preview:\n\n📢 ${text}\n\nSend it?`,
        Markup.inlineKeyboard([[Markup.button.callback('📣 Send', 'an_send'), Markup.button.callback('✖ Cancel', 'a_cancel')]])
      );
    default:
      return next();
  }
});

// anything else typed → gentle hint
bot.on('text', (ctx) => {
  if (ctx.message.text.startsWith('/')) return ctx.reply('Unknown command. Use /help to see what I can do.');
  return ctx.reply('Use the buttons below or /help.');
});

bot.catch((err) => console.error('Bot error:', err));

/* ---------------- auto-create database tables ---------------- */
const SCHEMA_SQL = `
-- Run this once in Supabase: SQL Editor -> New query -> paste -> Run

create table if not exists users (
  id          bigint primary key,           -- Telegram user id
  username    text,
  first_name  text,
  created_at  timestamptz default now()
);

create table if not exists tournaments (
  id          bigserial primary key,
  name        text not null,
  needed      int  not null,
  fee         numeric not null,
  prize1      numeric not null,
  prize2      numeric not null,
  prize3      numeric not null,
  status      text not null default 'open',  -- open | full | closed
  created_at  timestamptz default now()
);

-- extra info shown to players (date/time, rules, etc.)
alter table tournaments add column if not exists details text;

create table if not exists registrations (
  id             bigserial primary key,
  tournament_id  bigint not null references tournaments(id) on delete cascade,
  user_id        bigint not null,
  username       text,
  method         text not null,              -- cbe | telebirr
  status         text not null default 'pending', -- pending | approved | rejected
  file_id        text not null,              -- Telegram file_id of the screenshot
  reviewed_by    bigint,
  created_at     timestamptz default now()
);

-- A user can only have one pending/approved registration per tournament
create unique index if not exists one_active_reg_per_user
  on registrations (tournament_id, user_id)
  where status in ('pending', 'approved');

create table if not exists account_sales (
  id          bigserial primary key,
  description text,
  photos      text[],
  posted_by   bigint,
  created_at  timestamptz default now()
);

-- Atomic approval: locks the tournament row so two admins approving at once
-- can never push the count past the player limit.
create or replace function approve_registration(p_reg_id bigint, p_admin bigint)
returns json
language plpgsql
as $$
declare
  r registrations%rowtype;
  t tournaments%rowtype;
  cnt int;
begin
  select * into r from registrations where id = p_reg_id for update;
  if not found then return json_build_object('ok', false, 'error', 'not_found'); end if;
  if r.status <> 'pending' then
    return json_build_object('ok', false, 'error', 'already_' || r.status);
  end if;

  select * into t from tournaments where id = r.tournament_id for update;
  if t.status <> 'open' then
    return json_build_object('ok', false, 'error', 'closed');
  end if;

  select count(*) into cnt from registrations
    where tournament_id = t.id and status = 'approved';
  if cnt >= t.needed then
    return json_build_object('ok', false, 'error', 'full');
  end if;

  update registrations set status = 'approved', reviewed_by = p_admin where id = r.id;
  cnt := cnt + 1;

  if cnt >= t.needed then
    update tournaments set status = 'full' where id = t.id;
  end if;

  return json_build_object('ok', true, 'count', cnt, 'needed', t.needed,
                           'full', cnt >= t.needed, 'user_id', r.user_id,
                           'tournament_id', t.id, 'tournament_name', t.name);
end;
$$;

-- The bot uses the service_role key, so lock the tables from public access:
alter table users          enable row level security;
alter table tournaments    enable row level security;
alter table registrations  enable row level security;
alter table account_sales  enable row level security;

-- ===== v3 additions: bans, winners/payouts, admin log =====
alter table users add column if not exists banned boolean default false;
alter table users add column if not exists ban_reason text;

create table if not exists winners (
  id             bigserial primary key,
  tournament_id  bigint not null references tournaments(id) on delete cascade,
  place          int not null,               -- 1, 2, 3
  user_id        bigint not null,
  username       text,
  prize          numeric not null,
  paid           boolean not null default false,
  paid_at        timestamptz,
  created_at     timestamptz default now()
);

create table if not exists admin_log (
  id          bigserial primary key,
  admin_id    bigint,
  admin_name  text,
  action      text,
  detail      text,
  created_at  timestamptz default now()
);

alter table winners   enable row level security;
alter table admin_log enable row level security;

-- ===== v4 additions: numbered accounts (#EF1, #EF2...) + account purchases =====
create sequence if not exists account_sale_no_seq;
alter table account_sales add column if not exists sale_no     bigint default nextval('account_sale_no_seq');
alter table account_sales add column if not exists price       numeric;
alter table account_sales add column if not exists status      text not null default 'available'; -- available | reserved | pending | sold
alter table account_sales add column if not exists buyer_id    bigint;
alter table account_sales add column if not exists reserved_at timestamptz;

create table if not exists sale_posts (
  id          bigserial primary key,
  sale_id     bigint not null references account_sales(id) on delete cascade,
  chat_id     bigint not null,
  message_id  bigint not null,
  kind        text not null                    -- text | photo_cap | photo
);

create table if not exists account_orders (
  id          bigserial primary key,
  sale_id     bigint not null references account_sales(id) on delete cascade,
  user_id     bigint not null,
  username    text,
  method      text not null,
  file_id     text not null,
  email       text,
  phone       text,
  status      text not null default 'pending', -- pending | approved | rejected
  reviewed_by bigint,
  created_at  timestamptz default now()
);

-- ===== referral program =====
alter table users add column if not exists referred_by    bigint;
alter table users add column if not exists referral_paid  boolean not null default false;
alter table users add column if not exists balance        numeric(12,2) not null default 0;

create table if not exists referral_rewards (
  id          bigserial primary key,
  referrer_id bigint not null,
  referred_id bigint not null unique,
  amount      numeric(12,2) not null,
  created_at  timestamptz default now()
);
alter table referral_rewards enable row level security;

create or replace function reward_referral(p_user bigint, p_amount numeric)
returns json
language plpgsql
as $$
declare
  ref bigint;
  bal numeric;
begin
  update users set referral_paid = true
    where id = p_user and referred_by is not null and referral_paid = false
    returning referred_by into ref;
  if ref is null then
    return json_build_object('ok', false);
  end if;
  update users set balance = balance + p_amount where id = ref returning balance into bal;
  insert into referral_rewards (referrer_id, referred_id, amount) values (ref, p_user, p_amount);
  return json_build_object('ok', true, 'referrer', ref, 'balance', bal);
end;
$$;

create or replace function register_with_balance(p_user bigint, p_tid bigint, p_username text)
returns json
language plpgsql
as $$
declare
  t   tournaments%rowtype;
  u   users%rowtype;
  cnt int;
begin
  select * into t from tournaments where id = p_tid for update;
  if not found then return json_build_object('ok', false, 'error', 'not_found'); end if;
  if t.status <> 'open' then return json_build_object('ok', false, 'error', 'closed'); end if;

  if exists (select 1 from registrations
             where tournament_id = t.id and user_id = p_user and status in ('pending', 'approved')) then
    return json_build_object('ok', false, 'error', 'already');
  end if;

  select * into u from users where id = p_user for update;
  if not found or u.balance < t.fee then
    return json_build_object('ok', false, 'error', 'insufficient', 'balance', coalesce(u.balance, 0));
  end if;

  select count(*) into cnt from registrations where tournament_id = t.id and status = 'approved';
  if cnt >= t.needed then return json_build_object('ok', false, 'error', 'full'); end if;

  update users set balance = balance - t.fee where id = p_user;
  insert into registrations (tournament_id, user_id, username, method, status, file_id)
    values (t.id, p_user, p_username, 'balance', 'approved', 'balance');
  cnt := cnt + 1;
  if cnt >= t.needed then update tournaments set status = 'full' where id = t.id; end if;

  return json_build_object('ok', true, 'count', cnt, 'needed', t.needed, 'full', cnt >= t.needed,
                           'user_id', p_user, 'tournament_id', t.id, 'tournament_name', t.name,
                           'balance', u.balance - t.fee);
end;
$$;

alter table account_sales add column if not exists seller_id bigint;   -- set when a user posted the account

create table if not exists account_submissions (
  id          bigserial primary key,
  user_id     bigint not null,
  username    text,
  description text not null,
  photos      text[],
  price       numeric not null,
  status      text not null default 'pending',   -- pending | approved | rejected
  reviewed_by bigint,
  sale_id     bigint,
  created_at  timestamptz default now()
);
alter table account_submissions enable row level security;

-- ===== auto payment verification: each transaction can be used only once =====
create table if not exists used_txns (
  ref        text primary key,
  user_id    bigint not null,
  kind       text,
  created_at timestamptz default now()
);
alter table used_txns enable row level security;

alter table sale_posts     enable row level security;
alter table account_orders enable row level security;

`;

async function ensureSchema() {
  const client = new Client({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } });
  await client.connect();
  try {
    await client.query(SCHEMA_SQL);
    await client.query("notify pgrst, 'reload schema'");
    console.log('Database ready');
  } finally {
    await client.end();
  }
  await sleep(1500); // let Supabase's API pick up the new tables
}

/* ---------------- Telegram "/" command menu ---------------- */
async function setupCommands() {
  const userCmds = [
    { command: 'menu', description: 'Main menu' },
    { command: 'tournament', description: 'Current tournament details' },
    { command: 'register', description: 'Register and pay' },
    { command: 'status', description: 'My registration status' },
    { command: 'profile', description: 'My profile and results' },
    { command: 'referral', description: 'Invite friends and earn' },
    { command: 'sellaccount', description: 'Sell your account' },
    { command: 'players', description: 'Registered players' },
    { command: 'accounts', description: 'Available eFootball accounts' },
    { command: 'help', description: 'How it works & commands' },
  ];
  const adminCmds = [
    ...userCmds,
    { command: 'admin', description: 'Admin panel' },
    { command: 'pending', description: 'Payments waiting approval' },
    { command: 'stats', description: 'Stats and profit' },
    { command: 'newtournament', description: 'Create a tournament' },
    { command: 'edit', description: 'Edit tournament settings' },
    { command: 'winners', description: 'Set winners and announce' },
    { command: 'payouts', description: 'Prizes and mark as paid' },
    { command: 'addplayer', description: 'Register a player: /addplayer @user' },
    { command: 'remove', description: 'Remove a player: /remove @user' },
    { command: 'user', description: 'Look up a user' },
    { command: 'ban', description: 'Ban a user: /ban @user reason' },
    { command: 'unban', description: 'Unban a user' },
    { command: 'dm', description: 'Message one user' },
    { command: 'announce', description: 'Message all users' },
    { command: 'msgplayers', description: 'Message approved players' },
    { command: 'remind', description: 'Remind unregistered users' },
    { command: 'export', description: 'Players CSV file' },
    { command: 'history', description: 'Past tournaments' },
    { command: 'sell', description: 'Post an account for sale' },
    { command: 'close', description: 'Close the tournament' },
    { command: 'reopen', description: 'Reopen the tournament' },
    { command: 'log', description: 'Admin action log' },
    { command: 'config', description: 'Bot health check' },
  ];
  await bot.telegram.setMyCommands(userCmds);
  for (const id of ADMINS) {
    await bot.telegram.setMyCommands(adminCmds, { scope: { type: 'chat', chat_id: id } }).catch(() => {});
  }
}

(async () => {
  try {
    await ensureSchema();
  } catch (e) {
    console.error('Could not set up the database:', e.message);
    process.exit(1);
  }
  const { data: banned } = await sb.from('users').select('id').eq('banned', true);
  (banned || []).forEach((u) => bannedIds.add(u.id));
  await setupCommands().catch((e) => console.error('setMyCommands failed:', e.message));
  try {
    BOT_USERNAME = (await bot.telegram.getMe()).username;
  } catch (e) {
    console.error('getMe failed:', e.message);
    process.exit(1);
  }
  bot.botInfo = bot.botInfo || (await bot.telegram.getMe());

  if (WEBHOOK_URL) {
    await startWebhook();
  } else {
    await bot.launch(() => console.log('Bot running (polling)'));
  }
})();

/* ---------------- Render webhook server ---------------- */
let httpServer = null;
let botReady = false;

function startHttpServer() {
  // Secret path + secret header, both derived from the bot token (nothing else to configure)
  const digest = require('crypto').createHash('sha256').update(BOT_TOKEN).digest('hex');
  const hookPath = `/webhook/${digest.slice(0, 32)}`;
  const secretToken = digest.slice(32, 64);

  httpServer = require('http').createServer((req, res) => {
    const url = (req.url || '').split('?')[0];

    // Health check for Render (and uptime pings)
    if (req.method === 'GET' || req.method === 'HEAD') {
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      return res.end('ok');
    }

    if (req.method !== 'POST' || url !== hookPath) {
      res.writeHead(404);
      return res.end();
    }
    if (req.headers['x-telegram-bot-api-secret-token'] !== secretToken) {
      res.writeHead(403);
      return res.end();
    }
    if (!botReady) {          // still starting: Telegram will retry
      res.writeHead(503);
      return res.end();
    }

    let body = '';
    req.on('data', (c) => {
      body += c;
      if (body.length > 5e6) req.destroy();
    });
    req.on('end', () => {
      let update;
      try { update = JSON.parse(body); } catch (_) { res.writeHead(400); return res.end(); }
      // Answer Telegram right away; slow handlers (payment verification) must not cause retries
      res.writeHead(200);
      res.end();
      bot.handleUpdate(update).catch((e) => console.error('handleUpdate failed:', e));
    });
  });

  return new Promise((resolve, reject) => {
    httpServer.once('error', reject);
    httpServer.listen(PORT, '0.0.0.0', () => resolve({ hookPath, secretToken }));
  });
}

async function startWebhook() {
  const { hookPath, secretToken } = await startHttpServer();
  await bot.telegram.setWebhook(`${WEBHOOK_URL}${hookPath}`, {
    secret_token: secretToken,
    allowed_updates: ['message', 'callback_query'],
    drop_pending_updates: false,
  });
  botReady = true;
  console.log(`Bot running (webhook) on port ${PORT} -> ${WEBHOOK_URL}/webhook/...`);
}

function shutdown(signal) {
  botReady = false;
  if (httpServer) httpServer.close(() => process.exit(0));
  else { try { bot.stop(signal); } catch (_) {} }
  setTimeout(() => process.exit(0), 5000).unref();
}
process.once('SIGINT', () => shutdown('SIGINT'));
process.once('SIGTERM', () => shutdown('SIGTERM'));
