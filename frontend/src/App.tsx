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
      "flex items-center gap-2 px-3 py-2 rounded text-sm font-medium transition-colors",
      isActive
        ? "bg-sage text-primary-fg"
        : "text-ink-secondary hover:text-ink hover:bg-cream-mid"
    );

  return (
    <nav className="border-b border-border bg-cream px-6 py-3 flex items-center gap-1">
      <span className="mr-6 font-serif text-lg font-medium text-ink tracking-tight">
        CDburner
      </span>
      <NavLink to="/" end className={link}>
        <Disc3 size={15} />
        Discs
      </NavLink>
      <NavLink to="/library" className={link}>
        <Library size={15} />
        Library
      </NavLink>
      <NavLink to="/burn" className={link}>
        <Flame size={15} />
        Burn Queue
      </NavLink>
    </nav>
  );
}

export default function App() {
  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <main className="mx-auto max-w-5xl px-6 py-8">
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
