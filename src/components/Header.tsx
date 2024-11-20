import React, { useState } from 'react';
import { Moon, Sun, Menu, ChevronDown, X, BarChart3 } from 'lucide-react';
import { useStore } from '../store';

export const Header = () => {
  const { theme, toggleTheme } = useStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const navigation = {
    Übersicht: {
      items: [
        { label: 'Dashboard', href: '#dashboard' },
        { label: 'Monatsvergleich', href: '#monthly' },
        { label: 'Jahresvergleich', href: '#yearly' },
        { label: 'Kategorieanalyse', href: '#categories' },
      ]
    },
    Transaktionen: {
      items: [
        { label: 'Monatsübersicht', href: '#monthly-transactions' },
        { label: 'Alle Transaktionen', href: '#transactions' },
        { label: 'Neue Transaktion', href: '#new-transaction' },
        { label: 'Wiederkehrende', href: '#recurring' },
      ]
    },
    Verwaltung: {
      items: [
        { label: 'Budget', href: '#budgets' },
        { label: 'CSV Import', href: '#import' },
      ]
    }
  };

  const toggleDropdown = (key: string) => {
    setActiveDropdown(activeDropdown === key ? null : key);
  };

  return (
    <header className="sticky top-0 z-50 backdrop-blur-lg bg-white/75 dark:bg-gray-900/75 border-b border-gray-200 dark:border-gray-800">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 -ml-2 md:hidden"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
            <div className="flex items-center gap-2">
              <div className="bg-gradient-to-br from-purple-600 to-blue-600 p-2 rounded-xl">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div className="flex flex-col">
                <h1 className="text-2xl font-display bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent leading-none">
                  FinanzFlow
                </h1>
                <span className="text-[10px] text-gray-500 dark:text-gray-400 font-medium tracking-wider">
                  FINANCE MANAGER
                </span>
              </div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {Object.entries(navigation).map(([key, section]) => (
              <div key={key} className="relative">
                <button
                  onClick={() => toggleDropdown(key)}
                  className="flex items-center gap-1 py-2 hover:text-purple-600 transition-colors font-display text-lg"
                >
                  {key}
                  <ChevronDown className={`w-4 h-4 transition-transform ${
                    activeDropdown === key ? 'rotate-180' : ''
                  }`} />
                </button>
                
                {activeDropdown === key && (
                  <div className="absolute top-full left-0 mt-1 w-48 py-2 rounded-xl bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 animate-slideDown">
                    {section.items.map((item) => (
                      <a
                        key={item.href}
                        href={item.href}
                        className="block px-4 py-2 hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:text-purple-600 transition-colors"
                        onClick={() => setActiveDropdown(null)}
                      >
                        {item.label}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-4">
            {Object.entries(navigation).map(([key, section]) => (
              <div key={key} className="space-y-2">
                <button
                  onClick={() => toggleDropdown(key)}
                  className="flex items-center justify-between w-full px-2 py-2 hover:text-purple-600 transition-colors font-display text-lg"
                >
                  {key}
                  <ChevronDown className={`w-4 h-4 transition-transform ${
                    activeDropdown === key ? 'rotate-180' : ''
                  }`} />
                </button>
                
                {activeDropdown === key && (
                  <div className="pl-4 space-y-2">
                    {section.items.map((item) => (
                      <a
                        key={item.href}
                        href={item.href}
                        className="block px-4 py-2 hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:text-purple-600 transition-colors rounded-lg"
                        onClick={() => {
                          setActiveDropdown(null);
                          setMobileMenuOpen(false);
                        }}
                      >
                        {item.label}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </header>
  );
};