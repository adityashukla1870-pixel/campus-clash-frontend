/**
 * Avatar Repository — API-backed with localStorage cache.
 *
 * STORAGE LAYERS:
 *
 * 1. BACKEND API (source of truth)
 *    - Avatar library: GET/POST/PATCH/DELETE /avatars
 *    - User selection: POST /avatars/select (saves avatarId on user doc)
 *
 * 2. LOCALCACHE (instant reads, fallback if API unavailable)
 *    - Avatar library cached under "cc_avatar_library"
 *    - Per-user selection: "cc_avatar_sel_${userId}"
 *
 * This module preserves the same exported function names/shapes as the
 * original localStorage-only version. Sync functions read from cache;
 * write functions hit the API then update the cache.
 */

import axios from "../api/axios"

const LIBRARY_KEY = "cc_avatar_library"
const SELECTION_PREFIX = "cc_avatar_sel_"

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
// Library init — fetch from API, populate localStorage cache
// ---------------------------------------------------------------------------

let _initialized = false

/**
 * Fetch the avatar library from the API and write to localStorage.
 * Call once on app load (e.g. in App.jsx useEffect).
 * Safe to call multiple times — no-ops after the first successful fetch.
 */
export async function initAvatarLibrary() {
  if (_initialized) return

  const token = localStorage.getItem("token")
  if (!token) return

  try {
    const res = await axios.get("/avatars")

    if (Array.isArray(res.data)) {
      writeLibrary(res.data)
      _initialized = true
    }
  } catch {
    // API unavailable — localStorage cache remains the fallback
  }
}

// ---------------------------------------------------------------------------
// Global Avatar Library CRUD
// ---------------------------------------------------------------------------

/**
 * Return the full avatar list (sync, from localStorage cache).
 * Triggers a background API fetch on first call if not yet initialized.
 */
export function getAllAvatars() {
  if (!_initialized) initAvatarLibrary()
  return readLibrary()
}

export function getPublishedAvatars() {
  return getAllAvatars().filter((a) => a.status === "published")
}

export function getAvatarById(id) {
  return getAllAvatars().find((a) => a.id === id) || null
}

/**
 * Create a new avatar via the API.
 * @param {Object} params - { name: string, image: File, themeId?: string }
 * @returns {Promise<Object>} the created avatar
 */
export async function addAvatar({ name, image, themeId }) {
  const formData = new FormData()
  formData.append("name", name || "Unnamed")
  if (image) formData.append("image", image)
  if (themeId) formData.append("themeId", themeId)

  const res = await axios.post("/avatars", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  })
  const avatar = res.data
  const list = readLibrary()
  list.push(avatar)
  writeLibrary(list)
  return avatar
}

/**
 * Update an avatar. If `image` is a File, it's uploaded to Cloudinary.
 * @param {string} id
 * @param {Object} patch - { name?, themeId?, status?, image?: File }
 */
export async function updateAvatar(id, patch) {
  const formData = new FormData()
  if (patch.name !== undefined) formData.append("name", patch.name)
  if (patch.themeId !== undefined) formData.append("themeId", patch.themeId || "")
  if (patch.status !== undefined) formData.append("status", patch.status)
  if (patch.image) formData.append("image", patch.image)

  const res = await axios.patch(`/avatars/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  })
  const updated = res.data
  const list = readLibrary()
  const idx = list.findIndex((a) => a.id === id)
  if (idx !== -1) list[idx] = updated
  else list.push(updated)
  writeLibrary(list)
  return updated
}

export async function deleteAvatar(id) {
  await axios.delete(`/avatars/${id}`)
  const list = readLibrary().filter((a) => a.id !== id)
  writeLibrary(list)
}

export async function togglePublish(id) {
  const current = getAvatarById(id)
  if (!current) return null
  const newStatus = current.status === "published" ? "draft" : "published"
  return updateAvatar(id, { status: newStatus })
}

// ---------------------------------------------------------------------------
// Per-user avatar selection
// ---------------------------------------------------------------------------

/**
 * Get the avatarId selected by the given user (or current user if omitted).
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
 * Writes to localStorage (instant) + fires a background POST to the backend.
 */
export function setSelectedAvatarId(avatarId, userId) {
  const uid = userId || getCurrentUserId()
  if (!uid) return
  localStorage.setItem(selectionKey(uid), JSON.stringify({ avatarId }))
  // Fire-and-forget: persist to backend user document
  axios.post("/avatars/select", { avatarId }).catch(() => {})
}

export function clearSelectedAvatar(userId) {
  const uid = userId || getCurrentUserId()
  if (!uid) return
  localStorage.removeItem(selectionKey(uid))
  axios.post("/avatars/select", { avatarId: null }).catch(() => {})
}

// ---------------------------------------------------------------------------
// Player avatar registry (backend-backed)
// ---------------------------------------------------------------------------

/**
 * Record which avatarId a player has selected.
 * Saves to the backend user document (fire-and-forget).
 * Also updates localStorage cache for instant reads.
 */
export function setPlayerAvatar(userId, avatarId) {
  if (!userId) return
  // Fire-and-forget: backend is source of truth
  axios.post("/avatars/select", { avatarId: avatarId || null }).catch(() => {})
}

/**
 * Get the avatarId for any player.
 * Reads from localStorage cache (populated by leaderboard response or previous calls).
 */
export function getPlayerAvatar(userId) {
  if (!userId) return null
  // The backend leaderboard now includes avatarId per player.
  // This function is kept for backward compatibility but is no longer
  // the primary resolution path for the leaderboard.
  return null
}

// ---------------------------------------------------------------------------
// Avatar URL resolver
// ---------------------------------------------------------------------------

/**
 * Resolve the display URL for a given avatarId.
 * Falls back to a built-in SVG default if the id is missing or avatar not found.
 */
const DEFAULT_IMAGE_URL = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">'
  + "<defs><linearGradient id=\"g\" x1=\"0\" y1=\"0\" x2=\"1\" y2=\"1\">"
  + '<stop offset="0%" stop-color="#d4af37"/>'
  + '<stop offset="100%" stop-color="#f2ca50"/>'
  + "</linearGradient></defs>"
  + '<circle cx="60" cy="60" r="60" fill="#1a1509"/>'
  + '<circle cx="60" cy="60" r="56" fill="none" stroke="url(#g)" stroke-width="3"/>'
  + '<text x="60" y="68" text-anchor="middle" font-family="sans-serif" font-size="42" font-weight="800" fill="#d4af37">CC</text>'
  + "</svg>"
)}`

export function resolveAvatarUrl(avatarId) {
  if (!avatarId) return DEFAULT_IMAGE_URL
  const avatar = getAvatarById(avatarId)
  if (!avatar) return DEFAULT_IMAGE_URL
  return avatar.imageUrl
}

/**
 * Resolve the themeId from the current user's selected avatar.
 */
export function resolveThemeId(userId) {
  const avatarId = getSelectedAvatarId(userId)
  if (!avatarId) return null
  const avatar = getAvatarById(avatarId)
  return avatar?.themeId || null
}
