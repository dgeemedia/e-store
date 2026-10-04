import { writeClient } from './sanity'
import { telegram } from './notify'
/** Turns a Telegram message from you/your staff group into a reply on the site. Idempotent: Telegram retries never duplicate a reply. */
export async function handleOwnerMessage(m: any) {
  if (!m?.text || String(m.chat?.id) !== String(process.env.TELEGRAM_CHAT_ID)) return
  const tag = /^#([a-f0-9]{6})\b/.exec(m.reply_to_message?.text || '')?.[1]
  if (!tag) { await telegram('To answer a visitor, long-press their message and tap Reply.'); return }
  const id = `tg-${m.chat.id}-${m.message_id}`
  if (await writeClient.getDocument(id)) return
  const cid = await (writeClient as any).fetch(`*[_type=="chatMessage" && string::startsWith(cid, $tag)][0].cid`, { tag })
  if (!cid) { await telegram(`Conversation #${tag} was not found.`); return }
  await writeClient.createIfNotExists({ _id: id, _type: 'chatMessage', cid, sender: 'owner', text: String(m.text).slice(0, 1000), createdAt: new Date().toISOString() })
  await telegram(`Delivered to visitor #${tag}`) // if you do not see this line, your reply did NOT reach the site
}
let lastPull = 0
/** LOCAL TESTING ONLY (TELEGRAM_POLL=true, no webhook registered): fetch your replies with getUpdates instead of a webhook. */
export async function pullReplies() {
  const tok = process.env.TELEGRAM_BOT_TOKEN
  if (!tok || Date.now() - lastPull < 2000) return
  lastPull = Date.now()
  const st: any = await writeClient.getDocument('chat-state')
  const offset = st?.offset || 0
  const r = await fetch(`https://api.telegram.org/bot${tok}/getUpdates?offset=${offset}&timeout=0`).then((x) => x.json()).catch(() => null)
  if (!r?.ok || !r.result?.length) return
  let next = offset
  for (const u of r.result) { next = Math.max(next, u.update_id + 1); await handleOwnerMessage(u.message) }
  await writeClient.createOrReplace({ _id: 'chat-state', _type: 'chatState', offset: next })
}
