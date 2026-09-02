import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react"
import { useLocation } from "react-router-dom"
import API from "../api/axios"

const NotificationContext = createContext(null)

const PUBLIC_PATHS = ["/", "/login", "/register", "/forgot-password", "/reset-password"]

export function useNotifications() {
  return useContext(NotificationContext)
}

export function NotificationProvider({ children }) {
  const location = useLocation()
  const [announcements, setAnnouncements] = useState([])
  const [systemNotifications, setSystemNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [systemUnreadCount, setSystemUnreadCount] = useState(0)
  const [popupQueue, setPopupQueue] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchAnnouncements = useCallback(async () => {
    const token = localStorage.getItem("token")
    if (!token) return
    try {
      const res = await API.get("/announcements/user")
      const data = res.data?.announcements || []
      setAnnouncements(data)

      const unsentUnread = data.filter(a => !a.seen).length
      setUnreadCount(unsentUnread)

      const popupItems = data.filter(a =>
        a.showPopup && !a.dismissed && !a.seen
      )
      setPopupQueue(popupItems)
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchSystemNotifications = useCallback(async () => {
    const token = localStorage.getItem("token")
    if (!token) return
    try {
      const res = await API.get("/notifications/my")
      const data = res.data?.notifications || []
      setSystemNotifications(data)
      setSystemUnreadCount(res.data?.unread_count || 0)
    } catch {
      // silent
    }
  }, [])

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token || PUBLIC_PATHS.includes(location.pathname)) {
      setLoading(false)
      return
    }

    fetchAnnouncements()
    fetchSystemNotifications()

    const interval = setInterval(() => {
      fetchAnnouncements()
      fetchSystemNotifications()
    }, 30000)
    return () => clearInterval(interval)
  }, [fetchAnnouncements, fetchSystemNotifications, location.pathname])

  const dismissPopup = useCallback(async (id) => {
    setPopupQueue(prev => prev.filter(a => a.id !== id))
    try {
      await API.patch(`/announcements/${id}/dismiss`)
    } catch {
      // silent
    }
    setUnreadCount(prev => Math.max(0, prev - 1))
  }, [])

  const markRead = useCallback(async (id) => {
    try {
      await API.patch(`/announcements/${id}/read`)
    } catch {
      // silent
    }
    setAnnouncements(prev =>
      prev.map(a => a.id === id ? { ...a, seen: true } : a)
    )
    setUnreadCount(prev => Math.max(0, prev - 1))
  }, [])

  const markAllRead = useCallback(async () => {
    try {
      await API.patch("/announcements/read-all")
    } catch {
      // silent
    }
    setAnnouncements(prev => prev.map(a => ({ ...a, seen: true })))
    setUnreadCount(0)
  }, [])

  const markSystemRead = useCallback(async (id) => {
    try {
      await API.post(`/notifications/${id}/read`)
    } catch {
      // silent
    }
    setSystemNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    )
    setSystemUnreadCount(prev => Math.max(0, prev - 1))
  }, [])

  const markAllSystemRead = useCallback(async () => {
    try {
      await API.post("/notifications/read-all")
    } catch {
      // silent
    }
    setSystemNotifications(prev => prev.map(n => ({ ...n, read: true })))
    setSystemUnreadCount(0)
  }, [])

  const refresh = useCallback(() => {
    fetchAnnouncements()
    fetchSystemNotifications()
  }, [fetchAnnouncements, fetchSystemNotifications])

  const combinedUnread = unreadCount + systemUnreadCount

  const value = {
    announcements,
    systemNotifications,
    unreadCount: combinedUnread,
    announcementUnread: unreadCount,
    systemUnread: systemUnreadCount,
    popupQueue,
    loading,
    dismissPopup,
    markRead,
    markAllRead,
    markSystemRead,
    markAllSystemRead,
    refresh,
  }

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  )
}
