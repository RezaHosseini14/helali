'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

import { cn } from '@/lib/utils';

const NAV_LINKS = [
  { href: '/audio', label: 'صوت' },
  { href: '/video', label: 'ویدیو' },
  { href: '/gallery', label: 'گالری' },
] as const;

function Header() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const isHome = pathname === '/';
  const isOverHero = isHome && !isScrolled;

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 48);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50">
      <div className="container pointer-events-auto pt-4">
        <nav
          className={cn(
            'flex h-14 items-center justify-between rounded-2xl px-4 transition-all duration-300 sm:h-16 sm:px-6',
            isOverHero
              ? 'border border-white/20 bg-white/10 text-white shadow-none backdrop-blur-xl'
              : 'border border-border/60 bg-white/80 text-foreground shadow-mainshadow backdrop-blur-xl',
          )}
        >
          <ul className="flex items-center gap-1 sm:gap-2">
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={cn(
                      'rounded-full px-2.5 py-1.5 text-sm font-medium transition sm:px-3.5 sm:text-base',
                      isOverHero
                        ? isActive
                          ? 'bg-white/20 text-white'
                          : 'text-white/80 hover:bg-white/10 hover:text-white'
                        : isActive
                          ? 'bg-primary/10 text-primary'
                          : 'text-foreground/75 hover:bg-muted hover:text-foreground',
                    )}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>

          <Link
            href="/"
            className={cn(
              'potk text-base font-bold tracking-tight sm:text-lg lg:text-2xl',
              isOverHero ? 'text-white' : 'text-foreground',
            )}
          >
            عبدالرضا هلالی
          </Link>
        </nav>
      </div>
    </header>
  );
}

export default Header;
