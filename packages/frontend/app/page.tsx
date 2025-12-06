import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 gap-8">
      <h1 className="text-4xl font-bold">Productivity App</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
        <Link href="/tasks" className="p-6 border rounded-lg hover:bg-secondary transition-colors">
          <h2 className="text-2xl font-semibold mb-2">Tasks</h2>
          <p className="text-muted-foreground">Manage your daily tasks and priorities.</p>
        </Link>
        
        <Link href="/cycles" className="p-6 border rounded-lg hover:bg-secondary transition-colors">
          <h2 className="text-2xl font-semibold mb-2">12-Week Year</h2>
          <p className="text-muted-foreground">Track long-term goals and cycles.</p>
        </Link>
        
        <Link href="/pomodoro" className="p-6 border rounded-lg hover:bg-secondary transition-colors">
          <h2 className="text-2xl font-semibold mb-2">Pomodoro</h2>
          <p className="text-muted-foreground">Focus timer for work sessions.</p>
        </Link>
        
        <Link href="/music" className="p-6 border rounded-lg hover:bg-secondary transition-colors">
          <h2 className="text-2xl font-semibold mb-2">Music</h2>
          <p className="text-muted-foreground">Playlists for work and break.</p>
        </Link>
      </div>
    </main>
  );
}

