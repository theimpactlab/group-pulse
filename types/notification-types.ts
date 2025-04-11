export type NotificationType =
  | "session_created"
  | "session_updated"
  | "response_received"
  | "trial_expiring"
  | "system"
  | "security"

export interface Notification {
  id: string
  userId: string
  type: NotificationType
  title: string
  message: string
  link?: string
  read: boolean
  createdAt: string
}

export interface NotificationPreferences {
  email_session_activity: boolean
  email_responses: boolean
  email_trial_updates: boolean
  email_security: boolean
  email_marketing: boolean
  push_session_activity: boolean
  push_responses: boolean
  push_trial_updates: boolean
  push_security: boolean
}
