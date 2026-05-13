'use client'

export { SidebarNav } from './SidebarNav'
import { SidebarNav } from './SidebarNav'

export default function Sidebar() {
  return (
    <aside className="hidden md:flex w-60 flex-col bg-[var(--surface)] border-r border-[var(--hairline)] shrink-0">
      <SidebarNav />
    </aside>
  )
}
