import { Sidebar, MobileNav } from '@/components/layout/sidebar';
import { useAuth } from '@/components/auth/auth-provider';
import { Button } from '@/components/ui/button';
import { Package, Loader2 } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, signIn } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>
        <div className="w-full max-w-md space-y-8 text-center">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center">
              <Package className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl font-display font-bold tracking-tight">HygieStock</h1>
            <p className="text-muted-foreground">Manage your household supplies intelligently.</p>
          </div>
          
          <div className="bg-card border border-border rounded-3xl p-8 shadow-xl">
            <h2 className="text-2xl font-bold mb-6">Welcome Back</h2>
            <Button 
              size="lg" 
              className="w-full py-6 text-lg rounded-xl font-bold"
              onClick={signIn}
            >
              Sign in with Google
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-72 border-r border-border flex-col sticky top-0 h-screen">
        <Sidebar />
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-border flex items-center px-6 md:px-8 bg-background/80 backdrop-blur-md sticky top-0 z-10">
          <MobileNav />
          <div className="ml-auto flex items-center gap-4">
            <ThemeToggle />
            {/* User profile */}
            {user.photoURL ? (
              <img src={user.photoURL} alt="Profile" className="w-8 h-8 rounded-full border border-border" referrerPolicy="no-referrer" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs">
                {user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
              </div>
            )}
          </div>
        </header>
        <div className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
}
