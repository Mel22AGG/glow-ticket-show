import { Home, Search, Ticket, User, Heart, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  showAdmin?: boolean;
}

const baseTabs = [
  { id: "home", label: "Inicio", icon: Home },
  { id: "search", label: "Buscar", icon: Search },
  { id: "favorites", label: "Favoritos", icon: Heart },
  { id: "tickets", label: "Tickets", icon: Ticket },
  { id: "profile", label: "Perfil", icon: User },
];

const BottomNav = ({ activeTab, onTabChange, showAdmin }: BottomNavProps) => {
  const tabs = showAdmin
    ? [...baseTabs.slice(0, 4), { id: "admin", label: "Admin", icon: Shield }, baseTabs[4]]
    : baseTabs;

  return (
    <nav
      aria-label="Navegación principal"
      className="fixed bottom-0 left-0 right-0 z-40 max-w-md mx-auto pointer-events-none"
    >
      <div className="pointer-events-auto mx-auto mb-2 w-full max-w-md rounded-2xl bg-card/95 backdrop-blur-xl border border-border shadow-2xl safe-bottom">
        <div className="flex items-stretch justify-around px-3 pt-2 pb-2 gap-1 overflow-hidden">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                aria-label={tab.label}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "relative w-[72px] shrink-0 flex flex-col items-center justify-center gap-0.5 h-[56px] rounded-xl px-1 py-1.5 transition-all duration-200",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  isActive
                    ? "bg-primary/12 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                )}
              >
                {isActive && (
                  <span
                    aria-hidden
                    className="absolute -top-[6px] left-1/2 -translate-x-1/2 w-8 h-1 rounded-full bg-primary"
                  />
                )}
                <tab.icon
                  className={cn("transition-all", isActive ? "w-[22px] h-[22px] shrink-0" : "w-[20px] h-[20px] shrink-0")}
                  fill={isActive ? "currentColor" : "none"}
                  strokeWidth={isActive ? 2.4 : 2}
                />
                <span className={cn("text-[10px] leading-none whitespace-nowrap", isActive ? "font-bold" : "font-medium")}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default BottomNav;
