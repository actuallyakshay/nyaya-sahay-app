import { Button } from '@/components/ui/button';
import { Menu, Scale, X } from 'lucide-react';
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const navLinks = [
  { label: 'Home', to: '/' },
  { label: 'Plans', to: '/plans' },
  { label: 'How It Works', to: '/how-it-works' },
  { label: 'About', to: '/about' },
  { label: 'FAQ', to: '/faq' },
  { label: 'Contact', to: '/contact' },
];

export const PublicLayout = ({ children }: { children: React.ReactNode }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-navy">
              <Scale className="h-5 w-5 text-gold" />
            </div>
            <span className="font-serif text-xl font-bold text-navy">
              NyayaSetu
            </span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {navLinks.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className={`rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-muted ${location.pathname === l.to ? 'text-foreground' : 'text-muted-foreground'}`}
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-2 md:flex">
            <Button variant="ghost" asChild>
              <Link to="/login">Log In</Link>
            </Button>
            <Button asChild>
              <Link to="/register">Get Started</Link>
            </Button>
          </div>

          <button
            className="p-2 md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>

        {mobileOpen && (
          <div className="border-t bg-card p-4 md:hidden">
            <nav className="flex flex-col gap-1">
              {navLinks.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  onClick={() => setMobileOpen(false)}
                  className={`rounded-md px-3 py-2.5 text-sm font-medium ${location.pathname === l.to ? 'bg-muted text-foreground' : 'text-muted-foreground'}`}
                >
                  {l.label}
                </Link>
              ))}
              <div className="mt-3 flex flex-col gap-2 border-t pt-3">
                <Button variant="outline" asChild>
                  <Link to="/login">Log In</Link>
                </Button>
                <Button asChild>
                  <Link to="/register">Get Started</Link>
                </Button>
              </div>
            </nav>
          </div>
        )}
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t bg-navy text-primary-foreground">
        <div className="container py-12">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <div className="mb-4 flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gold/20">
                  <Scale className="h-4 w-4 text-gold" />
                </div>
                <span className="font-serif text-lg font-bold">NyayaSetu</span>
              </div>
              <p className="text-sm text-primary-foreground/70">
                Bridging the gap between citizens and legal support across
                India.
              </p>
            </div>
            <div>
              <h4 className="mb-3 text-sm font-semibold text-gold">Platform</h4>
              <ul className="space-y-2 text-sm text-primary-foreground/70">
                <li>
                  <Link to="/plans" className="hover:text-primary-foreground">
                    Subscription Plans
                  </Link>
                </li>
                <li>
                  <Link
                    to="/how-it-works"
                    className="hover:text-primary-foreground"
                  >
                    How It Works
                  </Link>
                </li>
                <li>
                  <Link to="/faq" className="hover:text-primary-foreground">
                    FAQ
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="mb-3 text-sm font-semibold text-gold">Legal</h4>
              <ul className="space-y-2 text-sm text-primary-foreground/70">
                <li>
                  <a href="#" className="hover:text-primary-foreground">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary-foreground">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary-foreground">
                    Refund Policy
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="mb-3 text-sm font-semibold text-gold">Contact</h4>
              <ul className="space-y-2 text-sm text-primary-foreground/70">
                <li>support@nyayasetu.in</li>
                <li>+91 11 4000 XXXX</li>
                <li>New Delhi, India</li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t border-primary-foreground/10 pt-6 text-center text-xs text-primary-foreground/50">
            © {new Date().getFullYear()} NyayaSetu. All rights reserved. An
            initiative towards accessible legal aid in India.
          </div>
        </div>
      </footer>
    </div>
  );
};
