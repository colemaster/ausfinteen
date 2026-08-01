import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { CommandPalette } from '@/components/ui/CommandPalette';

export function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-200">
      {/* The Navbar component handles the .glass-nav internal styling */}
      <Navbar />
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 scroll-fade-in overflow-hidden">
        <Outlet />
      </main>
      <Footer />
      <CommandPalette />
    </div>
  );
}
