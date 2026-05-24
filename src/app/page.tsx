import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-full bg-zinc-50">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-900 text-sm font-semibold text-white">
              P
            </div>
            <div>
              <p className="font-semibold text-zinc-900">ParkIndia</p>
              <p className="text-xs text-zinc-500">Delhi NCR · Beta</p>
            </div>
          </div>
          <Link
            href="/auth"
            className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
          >
            Sign in
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
        <section className="max-w-2xl">
          <p className="text-xs font-medium uppercase tracking-widest text-zinc-400">
            Neighbourhood parking
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-zinc-900 sm:text-5xl">
            Park across sectors and gated societies
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-zinc-600">
            Find verified basement, driveway, and stilt slots — or list your
            space. One account works on every device: your profile, bookings,
            and listings stay in sync.
          </p>
        </section>

        <section className="mt-10 grid gap-4 sm:grid-cols-2">
          <Link
            href="/dashboard/driver"
            className="group rounded-xl border border-zinc-200 bg-white p-6 transition hover:border-zinc-300 hover:shadow-sm"
          >
            <p className="text-sm font-medium text-zinc-500">For drivers</p>
            <h2 className="mt-2 text-lg font-semibold text-zinc-900">
              Find a parking spot
            </h2>
            <p className="mt-2 text-sm text-zinc-600">
              Browse the map, book a slot, and alert your host via WhatsApp at
              the gate.
            </p>
            <span className="mt-4 inline-block text-sm font-medium text-zinc-900 group-hover:underline">
              Browse spots →
            </span>
          </Link>

          <Link
            href="/dashboard/host"
            className="group rounded-xl border border-zinc-200 bg-white p-6 transition hover:border-zinc-300 hover:shadow-sm"
          >
            <p className="text-sm font-medium text-zinc-500">For hosts</p>
            <h2 className="mt-2 text-lg font-semibold text-zinc-900">
              List your space
            </h2>
            <p className="mt-2 text-sm text-zinc-600">
              Set pricing, pin your location on the map, and add gate
              instructions for visitors.
            </p>
            <span className="mt-4 inline-block text-sm font-medium text-zinc-900 group-hover:underline">
              Host a spot →
            </span>
          </Link>
        </section>

        <section className="mt-12 grid gap-4 border-t border-zinc-200 pt-10 sm:grid-cols-3">
          {[
            {
              title: "One account, any device",
              desc: "Sign in with phone and password — profile syncs like a modern app.",
            },
            {
              title: "Map-first discovery",
              desc: "See every active spot across Delhi NCR on an interactive map.",
            },
            {
              title: "Gate-ready workflows",
              desc: "Indian plates, WhatsApp host alerts, and security instructions built in.",
            },
          ].map((item) => (
            <div key={item.title}>
              <h3 className="text-sm font-semibold text-zinc-900">{item.title}</h3>
              <p className="mt-1 text-sm text-zinc-500">{item.desc}</p>
            </div>
          ))}
        </section>
      </main>

      <footer className="mt-auto border-t border-zinc-200 py-6 text-center text-sm text-zinc-400">
        ParkIndia Beta · Delhi NCR
      </footer>
    </div>
  );
}
