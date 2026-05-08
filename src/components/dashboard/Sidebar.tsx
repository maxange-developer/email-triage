'use client'

export { SidebarNav } from './SidebarNav'
import { SidebarNav } from './SidebarNav'

export default function Sidebar() {
  return (
    <aside className="hidden md:flex w-60 flex-col glass border-r border-white/10 shrink-0">
      <SidebarNav />
    </aside>
  )
}
