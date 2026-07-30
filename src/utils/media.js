/**
 * Resolve an image field (banner_image, screenshot, etc.) to a usable <img> src.
 *
 * New uploads are full Cloudinary URLs (https://res.cloudinary.com/...) and
 * are returned as-is. Older records may still have a local-disk path like
 * "uploads/foo.jpg" from before the Cloudinary migration — those files no
 * longer exist on Render's ephemeral filesystem, but we still build the old
 * URL shape so this doesn't throw, it'll just 404 gracefully as a broken image.
 */
export function resolveImageUrl(path) {
  if (!path) return null
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path
  }
  return `${import.meta.env.VITE_API_URL}/${path.replace(/\\/g, "/")}`
}
