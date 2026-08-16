/**
 * Avatar Repository — clean abstraction over localStorage.
 *
 * Data model:
 *   Avatar   { id, name, imageUrl, status: "published" | "draft" }
 *   UserSelection { avatarId }
 *
 * localStorage keys used:
 *   cc_avatars          — Avatar[]
 *   cc_selected_avatar  — { avatarId } | null
 *
 * This module is the ONLY place that touches those keys.
 * When a real backend ships, swap the internals — callers don't change.
 */

const AVATARS_KEY = "cc_avatars"
const SELECTION_KEY = "cc_selected_avatar"

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function readAvatars() {
  try {
    return JSON.parse(localStorage.getItem(AVATARS_KEY)) || []
  } catch {
    return []
  }
}

function writeAvatars(list) {
  localStorage.setItem(AVATARS_KEY, JSON.stringify(list))
}

function generateId() {
  return "avatar_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
}

// ---------------------------------------------------------------------------
// Default seed avatar (inline SVG data-URL — no external file needed)
// ---------------------------------------------------------------------------

const DEFAULT_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#d4af37"/>
      <stop offset="100%" stop-color="#f2ca50"/>
    </linearGradient>
  </defs>
  <circle cx="60" cy="60" r="60" fill="#1a1509"/>
  <circle cx="60" cy="60" r="56" fill="none" stroke="url(#g)" stroke-width="3"/>
  <text x="60" y="68" text-anchor="middle" font-family="sans-serif" font-size="42" font-weight="800" fill="#d4af37">CC</text>
</svg>`

const DEFAULT_AVATAR = {
  id: "avatar_default",
  name: "Campus Clash",
  imageUrl: `data:image/svg+xml,${encodeURIComponent(DEFAULT_SVG)}`,
  status: "published",
}

// ---------------------------------------------------------------------------
// Seed — ensure at least one avatar exists
// ---------------------------------------------------------------------------

function ensureSeeded() {
  const list = readAvatars()
  if (list.length === 0) {
    writeAvatars([DEFAULT_AVATAR])
  }
}

// ---------------------------------------------------------------------------
// Avatar CRUD (admin)
// ---------------------------------------------------------------------------

export function getAllAvatars() {
  ensureSeeded()
  return readAvatars()
}

export function getPublishedAvatars() {
  return getAllAvatars().filter((a) => a.status === "published")
}

export function getAvatarById(id) {
  return getAllAvatars().find((a) => a.id === id) || null
}

export function addAvatar({ name, imageUrl }) {
  const list = readAvatars()
  const avatar = {
    id: generateId(),
    name: name || "Unnamed",
    imageUrl: imageUrl || "",
    status: "published",
  }
  list.push(avatar)
  writeAvatars(list)
  return avatar
}

export function updateAvatar(id, patch) {
  const list = readAvatars()
  const idx = list.findIndex((a) => a.id === id)
  if (idx === -1) return null
  list[idx] = { ...list[idx], ...patch }
  writeAvatars(list)
  return list[idx]
}

export function deleteAvatar(id) {
  const list = readAvatars().filter((a) => a.id !== id)
  writeAvatars(list)
}

export function togglePublish(id) {
  const list = readAvatars()
  const avatar = list.find((a) => a.id === id)
  if (!avatar) return null
  avatar.status = avatar.status === "published" ? "draft" : "published"
  writeAvatars(list)
  return avatar
}

// ---------------------------------------------------------------------------
// User avatar selection (player)
// ---------------------------------------------------------------------------

export function getSelectedAvatarId() {
  try {
    const data = JSON.parse(localStorage.getItem(SELECTION_KEY))
    return data?.avatarId || null
  } catch {
    return null
  }
}

export function setSelectedAvatarId(avatarId) {
  localStorage.setItem(SELECTION_KEY, JSON.stringify({ avatarId }))
}

export function clearSelectedAvatar() {
  localStorage.removeItem(SELECTION_KEY)
}

/**
 * Resolve the display URL for a given avatarId.
 * Falls back to the default avatar if the id is missing or the avatar was deleted.
 */
export function resolveAvatarUrl(avatarId) {
  if (!avatarId) return DEFAULT_AVATAR.imageUrl
  const avatar = getAvatarById(avatarId)
  if (!avatar) return DEFAULT_AVATAR.imageUrl
  return avatar.imageUrl
}
