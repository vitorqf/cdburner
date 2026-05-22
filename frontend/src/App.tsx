import { Routes, Route, NavLink } from "react-router-dom";
import { Disc3, Library, Flame } from "lucide-react";
import { cn } from "@/lib/utils";
import Home from "@/pages/Home";
import DiscEditor from "@/pages/DiscEditor";
import TrackLibrary from "@/pages/TrackLibrary";
import BurnQueue from "@/pages/BurnQueue";

function Nav() {
  const link = ({ isActive }: { isActive: boolean }) =>
    cn(
      "flex items-center gap-2 px-3 min-h-11 rounded text-sm font-medium transition-colors",
      isActive
        ? "bg-sage text-primary-fg"
        : "text-ink-secondary hover:text-ink hover:bg-cream-mid"
    );

  return (
    <nav
      aria-label="Main navigation"
      className="border-b border-border bg-cream px-4 sm:px-6 flex items-center gap-1 overflow-x-auto"
    >
      <span className="mr-4 sm:mr-6 py-3 font-serif text-lg font-medium text-ink tracking-tight shrink-0 hidden sm:block">
        CDburner
      </span>
      <span className="mr-3 py-3 font-serif text-base font-medium text-ink tracking-tight shrink-0 sm:hidden">
        CD
      </span>
      <NavLink to="/" end className={link}>
        <Disc3 size={15} aria-hidden="true" />
        Discs
      </NavLink>
      <NavLink to="/library" className={link}>
        <Library size={15} aria-hidden="true" />
        Library
      </NavLink>
      <NavLink to="/burn" className={link}>
        <Flame size={15} aria-hidden="true" />
        <span className="hidden sm:inline">Burn Queue</span>
        <span className="sm:hidden">Burn</span>
      </NavLink>
    </nav>
  );
}

export default function App() {
  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <main className="mx-auto max-w-5xl px-4 sm:px-6 py-6 sm:py-8">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/discs/:id" element={<DiscEditor />} />
          <Route path="/library" element={<TrackLibrary />} />
          <Route path="/burn" element={<BurnQueue />} />
        </Routes>
      </main>
    </div>
  );
}
