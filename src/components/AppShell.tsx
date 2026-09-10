import { Link, useRouterState } from "@tanstack/react-router";
import {
  Brush,
  CalendarCheck,
  LayoutDashboard,
  Mail,
  Menu,
  Moon,
  NotebookPen,
  Search,
  Settings,
  Sparkles,
  Sun,
  Users,
} from "lucide-react";
import { useState, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/email-assistant", label: "AI Email Assistant", icon: Mail },
  { to: "/meeting-notes", label: "Meeting Notes", icon: NotebookPen },
  { to: "/task-planner", label: "AI Task Planner", icon: CalendarCheck },
  { to: "/research", label: "Business Research", icon: Search },
  { to: "/assistant", label: "AI Salon Assistant", icon: Sparkles },
  { to: "/customers", label: "Customers", icon: Users },
  { to: "/services", label: "Services", icon: Brush },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

function BrandMark() {
  return (
    <Link to="/" className="flex items-center gap-3">
      <span className="surface-pink flex h-10 w-10 items-center justify-center rounded-2xl shadow-[var(--shadow-soft)]">
        <Sparkles className="h-5 w-5" aria-hidden="true" />
      </span>
      <span className="leading-tight">
        <span className="font-display block text-lg font-semibold">GlowBiz AI</span>
        <span className="block text-xs text-muted-foreground">Salon manager</span>
      </span>
    </Link>
  );
}

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <nav className="flex flex-col gap-1" aria-label="Main">
      {navItems.map(({ to, label, icon: Icon }) => {
        const active = pathname === to;
        return (
          <Link
            key={to}
            to={to}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-[var(--shadow-soft)]"
                : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
            )}
          >
            <Icon className="h-4.5 w-4.5 shrink-0" aria-hidden="true" />
            <span className="truncate">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

function ThemeToggle() {
  const { theme, toggle } = useTheme();
  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggle}
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      className="rounded-full"
    >
      {theme === "dark" ? (
        <Sun className="h-4.5 w-4.5" aria-hidden="true" />
      ) : (
        <Moon className="h-4.5 w-4.5" aria-hidden="true" />
      )}
    </Button>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 hidden w-70 flex-col border-r border-sidebar-border bg-sidebar px-4 py-6 lg:flex">
        <BrandMark />
        <div className="mt-8 flex-1 overflow-y-auto">
          <NavLinks />
        </div>
        <div className="surface-blush mt-4 rounded-2xl p-4 text-xs text-muted-foreground">
          Spend less time managing your salon and more time serving your clients.
        </div>
      </aside>

      <div className="lg:pl-70">
        <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-border bg-background/85 px-4 py-3 backdrop-blur-md sm:px-6">
          <div className="flex items-center gap-3">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="rounded-full lg:hidden" aria-label="Open menu">
                  <Menu className="h-4.5 w-4.5" aria-hidden="true" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 bg-sidebar px-4 py-6">
                <SheetTitle className="sr-only">Navigation</SheetTitle>
                <BrandMark />
                <div className="mt-8">
                  <NavLinks onNavigate={() => setOpen(false)} />
                </div>
              </SheetContent>
            </Sheet>
            <div className="lg:hidden">
              <BrandMark />
            </div>
            <p className="hidden text-sm text-muted-foreground lg:block">
              Your AI-powered salon workspace
            </p>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button asChild variant="default" className="hidden rounded-full sm:inline-flex">
              <Link to="/assistant">
                <Sparkles className="h-4 w-4" aria-hidden="true" />
                Ask GlowBiz
              </Link>
            </Button>
          </div>
        </header>

        <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:py-10">{children}</main>
      </div>
    </div>
  );
}
