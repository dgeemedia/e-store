#!/usr/bin/env node
// Bulk-load sellers and products from CSV files into Sanity.
//   node scripts/import.mjs --sellers sellers.csv --products products.csv --images ./images --dry-run
// Remove --dry-run to really import. Add --update to refresh text/price fields of items that already exist (stock, sold counts and images are never touched).
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { createClient } from '@sanity/client'

const args = process.argv.slice(2), flag = (n) => args.includes(`--${n}`), opt = (n, d) => (args.includes(`--${n}`) ? args[args.indexOf(`--${n}`) + 1] : d)
const DRY = flag('dry-run'), UPDATE = flag('update'), IMG_DIR = opt('images', './images')
const CATEGORIES = ['Solar & Lighting', 'Fans & Cooling', 'Baby Care', 'Home & Kitchen', 'Personal Care', 'Farm Produce', 'Food & Grocery', 'Building & Hardware', 'Electronics', 'Fashion', 'Other']
const DISPATCH = ['Ships in 24 hours', 'Ships in 2-3 days', 'Ships in 5-7 days', 'Bulk orders: 7-14 days']
const SELLER_TYPES = ['Manufacturer', 'Farm', 'Importer', 'Wholesaler', 'Retailer', 'Fashion / Maker', 'Other']

if (fs.existsSync('.env.local')) for (const l of fs.readFileSync('.env.local', 'utf8').split('\n')) { const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/.exec(l); if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '') }

function parseCsv(text) {
  text = text.replace(/^\uFEFF/, '')
  const rows = []; let row = [], cell = '', q = false
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (q) { if (c === '"') { if (text[i + 1] === '"') { cell += '"'; i++ } else q = false } else cell += c }
    else if (c === '"') q = true
    else if (c === ',') { row.push(cell); cell = '' }
    else if (c === '\n' || c === '\r') { if (c === '\r' && text[i + 1] === '\n') i++; row.push(cell); cell = ''; if (row.some((x) => x.trim())) rows.push(row); row = [] }
    else cell += c
  }
  row.push(cell); if (row.some((x) => x.trim())) rows.push(row)
  const head = (rows.shift() || []).map((h) => h.trim().toLowerCase().replace(/\s+/g, '_'))
  return rows.map((r) => Object.fromEntries(head.map((h, i) => [h, (r[i] || '').trim()])))
}
const slug = (s) => String(s).toLowerCase().normalize('NFKD').replace(/[^\w\s-]/g, '').trim().replace(/[\s_]+/g, '-').replace(/-+/g, '-').slice(0, 80)
const num = (v) => { if (v === '' || v == null) return undefined; const n = Number(String(v).replace(/[₦,\s]/g, '')); return Number.isFinite(n) ? n : NaN }
const yes = (v, d) => (v === '' ? d : /^(y|yes|true|1)$/i.test(v))
const key = () => crypto.randomBytes(6).toString('hex')
const list = (v, sep = ';') => String(v || '').split(sep).map((x) => x.trim()).filter(Boolean)
const clean = (o) => Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined && v !== '' && !(Array.isArray(v) && !v.length)))
const blocks = (text) => list(text, '\n').map((t) => ({ _type: 'block', _key: key(), style: 'normal', markDefs: [], children: [{ _type: 'span', _key: key(), text: t, marks: [] }] }))

const client = DRY ? null : createClient({ projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID, dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production', apiVersion: '2024-10-01', token: process.env.SANITY_API_TOKEN, useCdn: false })
if (!DRY && (!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || !process.env.SANITY_API_TOKEN)) { console.error('Set NEXT_PUBLIC_SANITY_PROJECT_ID and SANITY_API_TOKEN (in .env.local) or use --dry-run.'); process.exit(1) }

async function uploadImage(ref) {
  const isUrl = /^https?:\/\//i.test(ref); let buf, filename
  if (isUrl) { const r = await fetch(ref); if (!r.ok) throw new Error(`cannot download ${ref} (${r.status})`); buf = Buffer.from(await r.arrayBuffer()); filename = ref.split('/').pop().split('?')[0] || 'image.jpg' }
  else { const p = path.join(IMG_DIR, ref); buf = fs.readFileSync(p); filename = path.basename(p) }
  const a = await client.assets.upload('image', buf, { filename })
  return { _type: 'image', _key: key(), asset: { _type: 'reference', _ref: a._id } }
}
const checkImage = (ref) => (/^https?:\/\//i.test(ref) ? true : fs.existsSync(path.join(IMG_DIR, ref)))
const stats = { created: 0, skipped: 0, updated: 0, errors: [] }
const err = (what, n, msg) => { stats.errors.push(`${what} row ${n}: ${msg}`); console.log(`  ERROR ${what} row ${n}: ${msg}`) }
const sellerIds = new Map()

async function doc(id, fields, images) {
  const existing = DRY ? null : await client.getDocument(id)
  if (existing && !UPDATE) { stats.skipped++; return 'skipped' }
  if (DRY) { stats.created++; return 'would create' }
  if (existing) { const { _type, ...rest } = fields; await client.patch(id).set(rest).commit(); stats.updated++; return 'updated' }
  const imgs = images ? { images: await Promise.all(images.map(uploadImage)) } : {}
  await client.createIfNotExists({ _id: id, ...fields, ...imgs }); stats.created++; return 'created'
}

async function sellers(file) {
  const rows = parseCsv(fs.readFileSync(file, 'utf8')); console.log(`\nSellers: ${rows.length} rows`)
  for (const [i, r] of rows.entries()) {
    const n = i + 2; if (!r.name) { err('seller', n, 'name is required'); continue }
    if (r.type && !SELLER_TYPES.includes(r.type)) { err('seller', n, `type must be one of: ${SELLER_TYPES.join(', ')}`); continue }
    const commission = num(r.commission_percent); if (Number.isNaN(commission)) { err('seller', n, 'commission_percent must be a number'); continue }
    if (r.logo && !checkImage(r.logo)) { err('seller', n, `logo file not found: ${r.logo}`); continue }
    const id = `seller-${slug(r.name)}`; sellerIds.set(slug(r.name), id)
    try {
      const logo = r.logo && !DRY ? { logo: await uploadImage(r.logo) } : {}
      const fields = clean({ _type: 'brand', name: r.name, slug: { _type: 'slug', current: slug(r.name) }, sellerType: r.type || 'Manufacturer', tagline: r.tagline, about: r.about, commissionPercent: commission ?? 0, featured: yes(r.featured, false), sponsored: yes(r.sponsored, false), ...logo })
      console.log(`  ${r.name}: ${await doc(id, fields)}`)
    } catch (e) { err('seller', n, e.message) }
  }
}

async function products(file) {
  const rows = parseCsv(fs.readFileSync(file, 'utf8')); console.log(`\nProducts: ${rows.length} rows`)
  for (const [i, r] of rows.entries()) {
    const n = i + 2
    if (!r.seller || !r.name) { err('product', n, 'seller and name are required'); continue }
    const price = num(r.unit_price); if (!(price > 0)) { err('product', n, 'unit_price must be a number above 0'); continue }
    const pack = num(r.pack_price), size = num(r.pack_size), weight = num(r.weight_kg), stock = num(r.stock), warranty = num(r.warranty_months)
    if ([pack, size, weight, stock, warranty].some(Number.isNaN)) { err('product', n, 'pack_price, pack_size, weight_kg, stock and warranty_months must be numbers'); continue }
    if (r.category && !CATEGORIES.includes(r.category)) { err('product', n, `category must be one of: ${CATEGORIES.join(' | ')}`); continue }
    if (r.dispatch_time && !DISPATCH.includes(r.dispatch_time)) { err('product', n, `dispatch_time must be one of: ${DISPATCH.join(' | ')}`); continue }
    const imgs = list(r.images); if (!imgs.length) { err('product', n, 'at least one image is required (file name in the images folder, or a web address)'); continue }
    const missing = imgs.filter((x) => !checkImage(x)); if (missing.length) { err('product', n, `image not found: ${missing.join(', ')}`); continue }
    let tiers; try { tiers = list(r.volume_tiers).map((t) => { const [a, b] = t.split(':').map(num); if (!(a >= 2) || !(b > 0)) throw new Error(); return { _type: 'tier', _key: key(), minUnits: a, unitPrice: b } }) } catch { err('product', n, 'volume_tiers must look like 12:900;100:800 (from-units:price-per-unit)'); continue }
    const options = list(r.options).map((g) => { const [name, vals] = g.split('='); return { _type: 'optionGroup', _key: key(), name: (name || '').trim(), values: list(vals, '|') } }).filter((g) => g.name && g.values.length)
    const specs = list(r.specs).map((s) => { const [label, ...v] = s.split('='); return { _type: 'spec', _key: key(), label: label.trim(), value: v.join('=').trim() } }).filter((s) => s.label && s.value)
    const sid = sellerIds.get(slug(r.seller)) || `seller-${slug(r.seller)}`
    if (!DRY && !sellerIds.has(slug(r.seller)) && !(await client.getDocument(sid))) { await client.createIfNotExists({ _id: sid, _type: 'brand', name: r.seller, slug: { _type: 'slug', current: slug(r.seller) }, sellerType: 'Manufacturer', commissionPercent: 0 }); console.log(`  (created minimal seller "${r.seller}"; complete its details in Studio)`) }
    sellerIds.set(slug(r.seller), sid)
    const id = `product-${slug(r.seller)}-${slug(r.name)}`.slice(0, 100)
    const fields = clean({ _type: 'product', name: r.name, slug: { _type: 'slug', current: slug(`${r.name}`) }, brand: { _type: 'reference', _ref: sid }, category: r.category || 'Other', description: r.short_description, nameZh: r.name_zh, nameFr: r.name_fr, descriptionZh: r.short_description_zh, descriptionFr: r.short_description_fr, body: blocks(r.full_description),
      unitPrice: price, dozenPrice: pack, packSize: size ?? (pack ? 12 : undefined), packLabel: r.pack_label || (pack ? 'dozen' : undefined), tiers, warrantyMonths: warranty, dispatchTime: r.dispatch_time || 'Ships in 2-3 days', weightKg: weight, stockUnits: stock, options, specs, active: yes(r.active, true), featured: yes(r.featured, false) })
    try { console.log(`  ${r.name}: ${await doc(id, fields, imgs)}`) } catch (e) { err('product', n, e.message) }
  }
}

console.log(DRY ? 'DRY RUN: nothing is written.' : `Importing into Sanity project ${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}${UPDATE ? ' (update mode)' : ''}`)
const sf = opt('sellers'), pf = opt('products')
if (!sf && !pf) { console.error('Usage: node scripts/import.mjs --sellers sellers.csv --products products.csv --images ./images [--dry-run] [--update]'); process.exit(1) }
if (sf) await sellers(sf)
if (pf) await products(pf)
console.log(`\nDone. ${DRY ? 'Would create' : 'Created'}: ${stats.created}  Updated: ${stats.updated}  Skipped (already exist): ${stats.skipped}  Errors: ${stats.errors.length}`)
if (stats.errors.length) { console.log('Fix these rows and run again (rows that already imported are skipped):'); stats.errors.forEach((e) => console.log(' - ' + e)); process.exit(2) }
