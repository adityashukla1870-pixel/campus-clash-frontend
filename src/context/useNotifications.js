import { useContext } from "react"
import { NotificationContext } from "./notificationContextRef"

export function useNotifications() {
  return useContext(NotificationContext)
}
