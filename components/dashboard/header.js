"use client";

import { useState } from "react";
import { Bell, User } from "lucide-react";

const Header = ({ user }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <header className="bg-white border-b h-16 flex items-center justify-between px-6">
      <div className="flex items-center">
        <h1 className="text-lg font-medium md:hidden">Party Hall Manager</h1>
      </div>
      <div className="flex items-center space-x-4">
        <button className="p-2 rounded-full hover:bg-gray-100">
          <Bell className="h-5 w-5 text-gray-600" />
        </button>
        <div className="relative">
          <button
            className="flex items-center space-x-2"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <div className="bg-gray-200 rounded-full p-2">
              <User className="h-5 w-5 text-gray-600" />
            </div>
            <div className="hidden md:block text-left">
              <div className="text-sm font-medium">{user?.name}</div>
              <div className="text-xs text-gray-500 capitalize">{user?.role}</div>
            </div>
          </button>
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 py-2 bg-white rounded-md shadow-lg z-10 border">
              <div className="px-4 py-2 border-b">
                <div className="text-sm font-medium">{user?.name}</div>
                <div className="text-xs text-gray-500">{user?.email}</div>
              </div>
              <div className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer">
                Profile
              </div>
              <div className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer">
                Settings
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
