"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Plus, MapPin, Moon, Sun, Home } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTrigger,
} from "@/components/ui/sheet";

const links = [
  { href: "/", label: "Home", icon: Home },
  { href: "/routes", label: "Routes", icon: MapPin },
  { href: "/routes/new", label: "Add Route", icon: Plus },
  { href: "/places", label: "Places", icon: MapPin },
];

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const headerClass = `sticky top-0 z-50 transition-all duration-200 ${
    isScrolled ? "bg-background/80 backdrop-blur-md shadow-sm" : "bg-transparent"
  }`;

  return (
    <header className={headerClass}>
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2">
              <div className="rounded-md bg-primary/10 p-1">
                <MapPin className="h-5 w-5 text-primary" />
              </div>
              <span className="text-lg font-bold">RouteTracker</span>
            </Link>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            {links.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm transition-colors hover:text-primary flex items-center gap-2 ${
                    pathname === link.href
                      ? "font-medium text-primary"
                      : "text-muted-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            {isMounted && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="mr-2"
              >
                {theme === "dark" ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
                <span className="sr-only">Toggle theme</span>
              </Button>
            )}

            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[240px] sm:w-[300px]">
                <SheetHeader className="pb-4">
                  <div className="flex items-center gap-2">
                    <div className="rounded-md bg-primary/10 p-1">
                      <MapPin className="h-5 w-5 text-primary" />
                    </div>
                    <span className="text-lg font-bold">RouteTracker</span>
                  </div>
                </SheetHeader>
                <nav className="flex flex-col gap-4 mt-4">
                  {links.map((link) => {
                    const Icon = link.icon;
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        className={`py-2 text-sm transition-colors hover:text-primary flex items-center gap-2 ${
                          pathname === link.href
                            ? "font-medium text-primary"
                            : "text-muted-foreground"
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        {link.label}
                      </Link>
                    );
                  })}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}