export interface BlogItem {
  userId: string
  blogId: string
  createdAt: string
  name: string
  summary: string
  dueDate: string
  done: boolean
  attachmentUrl?: string
}
