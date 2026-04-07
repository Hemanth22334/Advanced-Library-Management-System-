import React from 'react';
import { Book, LayoutDashboard, LogOut, Library, Users, History } from 'lucide-react';
import { cn } from '../lib/utils';

interface NavbarProps {
  user: any;
  onLogout: () => void;
  currentPage: string;
  setPage: (page: string) => void;
}

export default function Navbar({ user, onLogout, currentPage, setPage }: NavbarProps) {
  const isAdmin = user?.role === 'admin';

  const navItems = [
    { id: 'books', label: 'Books', icon: Library },
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    ...(isAdmin ? [{ id: 'users', label: 'Users', icon: Users }] : []),
    ...(!isAdmin ? [{ id: 'my-books', label: 'My Books', icon: History }] : []),
  ];

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div 
              className="flex items-center gap-2 cursor-pointer" 
              onClick={() => setPage('books')}
            >
              <div className="bg-indigo-600 p-2 rounded-lg">
                <Book className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-900 tracking-tight">LuminaLib</span>
            </div>
            
            <div className="hidden sm:ml-8 sm:flex sm:space-x-4">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setPage(item.id)}
                  className={cn(
                    "inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                    currentPage === item.id
                      ? "bg-indigo-50 text-indigo-700"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  )}
                >
                  <item.icon className="w-4 h-4 mr-2" />
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-slate-900">{user.name}</p>
              <p className="text-xs text-slate-500 capitalize">{user.role}</p>
            </div>
            <button
              onClick={onLogout}
              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
