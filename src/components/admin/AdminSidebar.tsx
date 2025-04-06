
import React from "react";
import { Link } from "react-router-dom";
import { LayoutDashboard, Users, CreditCard, Image, Settings, ChevronRight, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface AdminSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function AdminSidebar({ activeTab, setActiveTab }: AdminSidebarProps) {
  const [collapsed, setCollapsed] = React.useState(false);

  const menuItems = [
    { id: "overview", label: "Dashboard", icon: LayoutDashboard },
    { id: "users", label: "User Management", icon: Users },
    { id: "subscriptions", label: "Subscriptions", icon: CreditCard },
    { id: "memes", label: "Meme Management", icon: Image },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <aside
      className={cn(
        "bg-card border-r border-border transition-all duration-300 ease-in-out z-30",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="h-16 flex items-center px-4 border-b border-border">
        <Link to="/" className="flex items-center">
          {!collapsed && (
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-theme-purple to-theme-pink">
              Admin Panel
            </span>
          )}
          {collapsed && (
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-theme-purple to-theme-pink">
              AP
            </span>
          )}
        </Link>
      </div>
      <div className="py-4">
        <nav className="space-y-1 px-2">
          {menuItems.map((item) => (
            <Button
              key={item.id}
              variant={activeTab === item.id ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start mb-1",
                collapsed ? "px-2" : "px-3"
              )}
              onClick={() => setActiveTab(item.id)}
            >
              <item.icon className={cn("h-5 w-5", collapsed ? "mr-0" : "mr-2")} />
              {!collapsed && <span>{item.label}</span>}
            </Button>
          ))}
        </nav>
      </div>
      <div className="absolute bottom-4 left-0 right-0 px-4">
        <Button
          variant="ghost"
          size="sm"
          className="w-full flex justify-center"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
        </Button>
      </div>
    </aside>
  );
}
