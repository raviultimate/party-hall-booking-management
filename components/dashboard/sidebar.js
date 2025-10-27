"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  CalendarDays, 
  Users, 
  Building2, 
  CreditCard, 
  Receipt, 
  LogOut 
} from "lucide-react";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";

const Sidebar = () => {
  const pathname = usePathname();

  const navItems = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      title: "Bookings",
      href: "/dashboard/bookings",
      icon: <CalendarDays className="h-5 w-5" />,
    },
    {
      title: "Customers",
      href: "/dashboard/customers",
      icon: <Users className="h-5 w-5" />,
    },
    {
      title: "Halls",
      href: "/dashboard/halls",
      icon: <Building2 className="h-5 w-5" />,
    },
    {
      title: "Payments",
      href: "/dashboard/payments",
      icon: <CreditCard className="h-5 w-5" />,
    },
    {
      title: "Expenses",
      href: "/dashboard/expenses",
      icon: <Receipt className="h-5 w-5" />,
    },
  ];

  return (
    <div className="flex flex-col h-full w-64 bg-white border-r">
      <div className="p-4 border-b">
        <h2 className="text-xl font-bold">Party Hall Manager</h2>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center px-4 py-3 text-sm rounded-md hover:bg-gray-100",
              pathname === item.href
                ? "bg-gray-100 text-primary font-medium"
                : "text-gray-600"
            )}
          >
            {item.icon}
            <span className="ml-3">{item.title}</span>
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t">
        <button
          onClick={() => signOut({ callbackUrl: "/auth/signin" })}
          className="flex items-center px-4 py-3 text-sm rounded-md text-gray-600 hover:bg-gray-100 w-full"
        >
          <LogOut className="h-5 w-5" />
          <span className="ml-3">Sign Out</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
