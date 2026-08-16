/**
 * Avatar Repository — clean abstraction over localStorage.
 *
 * TWO separate concerns, TWO separate storage areas:
 *
 * 1. GLOBAL AVATAR LIBRARY   (key: "cc_avatar_library")
 *    - Shared across ALL accounts
 *    - Admin uploads once → every account sees it
 *    - Avatar { id, name, imageUrl, status }
 *
 * 2. PER-USER SELECTION      (key: "cc_avatar_sel_${userId}")
 *    - Each user has their own selected avatarId
 *    - Account A's selection does NOT affect Account B
 *    - UserSelection { avatarId }
 *
 * This module is the ONLY place that touches those keys.
 * When a real backend ships, swap the internals — callers don't change.
 */

const LIBRARY_KEY = "cc_avatar_library"
const SELECTION_PREFIX = "cc_avatar_sel_"
const PLAYER_AVATARS_KEY = "cc_player_avatars"

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function readLibrary() {
  try {
    return JSON.parse(localStorage.getItem(LIBRARY_KEY)) || []
  } catch {
    return []
  }
}

function writeLibrary(list) {
  localStorage.setItem(LIBRARY_KEY, JSON.stringify(list))
}

function generateId() {
  return "avatar_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
}

/**
 * Extract the current user's ID from the JWT stored in localStorage.
 * Handles common JWT payload field names: id, user_id, _id, sub.
 */
export function getCurrentUserId() {
  try {
    const token = localStorage.getItem("token")
    if (!token) return null
    const payload = JSON.parse(atob(token.split(".")[1]))
    return payload.id || payload.user_id || payload._id || payload.sub || null
  } catch {
    return null
  }
}

function selectionKey(userId) {
  return SELECTION_PREFIX + (userId || "anonymous")
}

// ---------------------------------------------------------------------------
// Global player→avatarId registry (so leaderboard can resolve any player)
// ---------------------------------------------------------------------------

function readPlayerAvatars() {
  try {
    return JSON.parse(localStorage.getItem(PLAYER_AVATARS_KEY)) || {}
  } catch {
    return {}
  }
}

function writePlayerAvatars(map) {
  localStorage.setItem(PLAYER_AVATARS_KEY, JSON.stringify(map))
}

/**
 * Record which avatarId a player has selected.
 * Called on every avatar selection so the leaderboard can resolve any player.
 */
export function setPlayerAvatar(userId, avatarId) {
  if (!userId) return
  const map = readPlayerAvatars()
  map[userId] = avatarId || null
  writePlayerAvatars(map)
}

/**
 * Get the avatarId for any player by their userId.
 * Returns null if the player has never selected an avatar.
 */
export function getPlayerAvatar(userId) {
  if (!userId) return null
  const map = readPlayerAvatars()
  return map[userId] || null
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
  themeId: null,
}

// ---------------------------------------------------------------------------
// Theme-bound seed avatars — auto-injected so every user can select them
// ---------------------------------------------------------------------------

const CYBER_BOY_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0077B6"/>
      <stop offset="100%" stop-color="#00B4D8"/>
    </linearGradient>
  </defs>
  <circle cx="60" cy="60" r="60" fill="#03045e"/>
  <circle cx="60" cy="60" r="56" fill="none" stroke="url(#g)" stroke-width="3"/>
  <text x="60" y="68" text-anchor="middle" font-family="sans-serif" font-size="42" font-weight="800" fill="#90e0ef">CB</text>
</svg>`

const CYBER_BOY_AVATAR = {
  id: "avatar_cyber_boy",
  name: "Cyber Boy",
  imageUrl: `data:image/svg+xml,${encodeURIComponent(CYBER_BOY_SVG)}`,
  status: "published",
  themeId: "cyber-boy",
}

const CYBER_GIRL_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#CDB4DB"/>
      <stop offset="100%" stop-color="#FFAFCC"/>
    </linearGradient>
  </defs>
  <circle cx="60" cy="60" r="60" fill="#1a0f2e"/>
  <circle cx="60" cy="60" r="56" fill="none" stroke="url(#g)" stroke-width="3"/>
  <text x="60" y="68" text-anchor="middle" font-family="sans-serif" font-size="42" font-weight="800" fill="#ffc8dd">CG</text>
</svg>`

const CYBER_GIRL_AVATAR = {
  id: "avatar_cyber_girl",
  name: "Cyber Girl",
  imageUrl: `data:image/svg+xml,${encodeURIComponent(CYBER_GIRL_SVG)}`,
  status: "published",
  themeId: "cyber-girl",
}

const THEME_SEEDS = [CYBER_BOY_AVATAR, CYBER_GIRL_AVATAR]

// ---------------------------------------------------------------------------
// Seed — ensure at least one avatar exists in the global library
// ---------------------------------------------------------------------------

function ensureSeeded() {
  const list = readLibrary()
  if (list.length === 0) {
    writeLibrary([DEFAULT_AVATAR])
  }
  ensureThemeAvatars()
}

/**
 * Auto-inject theme-bound avatars (e.g. Cyber Boy) into the library if missing.
 * This guarantees every user can select them without admin intervention.
 */
function ensureThemeAvatars() {
  const list = readLibrary()
  let changed = false
  for (const seed of THEME_SEEDS) {
    if (!list.some((a) => a.id === seed.id)) {
      list.push(seed)
      changed = true
    }
  }
  if (changed) writeLibrary(list)
}

// ---------------------------------------------------------------------------
// Global Avatar Library CRUD (admin)
// ---------------------------------------------------------------------------

export function getAllAvatars() {
  ensureSeeded()
  return readLibrary()
}

export function getPublishedAvatars() {
  return getAllAvatars().filter((a) => a.status === "published")
}

export function getAvatarById(id) {
  return getAllAvatars().find((a) => a.id === id) || null
}

export function addAvatar({ name, imageUrl, themeId }) {
  const list = readLibrary()
  const avatar = {
    id: generateId(),
    name: name || "Unnamed",
    imageUrl: imageUrl || "",
    status: "published",
    themeId: themeId || null,
  }
  list.push(avatar)
  writeLibrary(list)
  return avatar
}

export function updateAvatar(id, patch) {
  const list = readLibrary()
  const idx = list.findIndex((a) => a.id === id)
  if (idx === -1) return null
  list[idx] = { ...list[idx], ...patch }
  writeLibrary(list)
  return list[idx]
}

export function deleteAvatar(id) {
  const list = readLibrary().filter((a) => a.id !== id)
  writeLibrary(list)
}

export function togglePublish(id) {
  const list = readLibrary()
  const avatar = list.find((a) => a.id === id)
  if (!avatar) return null
  avatar.status = avatar.status === "published" ? "draft" : "published"
  writeLibrary(list)
  return avatar
}

// ---------------------------------------------------------------------------
// Per-user avatar selection (player)
// ---------------------------------------------------------------------------

/**
 * Get the avatarId selected by the given user (or current user if omitted).
 * Each user's selection is stored under their own localStorage key.
 */
export function getSelectedAvatarId(userId) {
  const uid = userId || getCurrentUserId()
  if (!uid) return null
  try {
    const data = JSON.parse(localStorage.getItem(selectionKey(uid)))
    return data?.avatarId || null
  } catch {
    return null
  }
}

/**
 * Save the avatarId selected by the given user (or current user if omitted).
 */
export function setSelectedAvatarId(avatarId, userId) {
  const uid = userId || getCurrentUserId()
  if (!uid) return
  localStorage.setItem(selectionKey(uid), JSON.stringify({ avatarId }))
}

/**
 * Clear the avatar selection for the given user (or current user if omitted).
 */
export function clearSelectedAvatar(userId) {
  const uid = userId || getCurrentUserId()
  if (!uid) return
  localStorage.removeItem(selectionKey(uid))
}

// ---------------------------------------------------------------------------
// Avatar URL resolver
// ---------------------------------------------------------------------------

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

/**
 * Resolve the themeId from the current user's selected avatar.
 * Flow: selected avatarId → look up avatar in library → return avatar.themeId
 * Returns null if no avatar selected, avatar deleted, or avatar has no themeId.
 */
export function resolveThemeId(userId) {
  const avatarId = getSelectedAvatarId(userId)
  if (!avatarId) return null
  const avatar = getAvatarById(avatarId)
  return avatar?.themeId || null
}
