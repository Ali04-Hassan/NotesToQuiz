import Link from "next/link";

export default function Nav() {
  return (
    <header className="blueprint-grid border-b-4 border-accent">
      <div className="max-w-4xl mx-auto px-6 py-5 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl font-mono font-bold text-white tracking-tight">
            Notes<span className="text-accent">ToQuiz</span>
          </span>
        </Link>
        <nav className="flex gap-6 font-mono text-sm text-white/80">
          <Link href="/" className="hover:text-accent transition-colors">
            New Quiz
          </Link>
          <Link href="/dashboard" className="hover:text-accent transition-colors">
            Dashboard
          </Link>
        </nav>
      </div>
    </header>
  );
}
