import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-full bg-gradient-to-br from-orange-50 via-white to-emerald-50">
      <header className="border-b border-orange-100/80 bg-white/70 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-emerald-600 text-lg font-bold text-white shadow-md">
              P
            </div>
            <div>
              <p className="text-lg font-bold tracking-tight text-slate-900">
                ParkIndia
              </p>
              <p className="text-xs text-slate-500">Delhi NCR · Beta</p>
            </div>
          </div>
          <Link
            href="/auth"
            className="rounded-full border border-orange-200 bg-white px-4 py-2 text-sm font-medium text-orange-700 transition hover:border-orange-300 hover:bg-orange-50"
          >
            Log in
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-16">
        <section className="relative overflow-hidden rounded-3xl border border-orange-100 bg-white p-8 shadow-xl shadow-orange-100/50 sm:p-12">
          <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-orange-200/40 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-10 h-48 w-48 rounded-full bg-emerald-200/40 blur-3xl" />

          <div className="relative max-w-2xl">
            <span className="inline-flex items-center rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-orange-800">
              🇮🇳 Made for Indian neighbourhoods
            </span>
            <h1 className="mt-4 text-4xl font-extrabold leading-tight text-slate-900 sm:text-5xl">
              Park smarter across{" "}
              <span className="bg-gradient-to-r from-orange-600 to-emerald-600 bg-clip-text text-transparent">
                Sector lanes & gated societies
              </span>
            </h1>
            <p className="mt-4 text-lg leading-relaxed text-slate-600">
              Find verified driveway, basement, and stilt slots near you — or
              list your unused space and earn daily. Built for Indian addresses,
              gate protocols, and WhatsApp-first coordination.
            </p>
          </div>
        </section>

        <section className="mt-10 grid gap-6 md:grid-cols-2">
          <Link
            href="/dashboard/driver"
            className="group rounded-2xl border border-emerald-100 bg-white p-6 shadow-lg shadow-emerald-50 transition hover:-translate-y-1 hover:border-emerald-200 hover:shadow-xl"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-2xl">
              🚗
            </div>
            <h2 className="mt-4 text-xl font-bold text-slate-900">
              Find a Parking Spot
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Browse active slots — covered basements, open driveways, stilt
              bays — across Sector 62, 15, 44 and more.
            </p>
            <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 transition-all group-hover:gap-3">
              Browse & book
              <span aria-hidden>→</span>
            </span>
          </Link>

          <Link
            href="/dashboard/host"
            className="group rounded-2xl border border-orange-100 bg-white p-6 shadow-lg shadow-orange-50 transition hover:-translate-y-1 hover:border-orange-200 hover:shadow-xl"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100 text-2xl">
              🏠
            </div>
            <h2 className="mt-4 text-xl font-bold text-slate-900">
              List Your Space
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Publish your spot with daily/nightly pricing, structural address,
              and custom gate instructions for visitors.
            </p>
            <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-orange-700 transition-all group-hover:gap-3">
              Host a spot
              <span aria-hidden>→</span>
            </span>
          </Link>
        </section>

        <section className="mt-10 grid gap-4 sm:grid-cols-3">
          {[
            {
              title: "All-state plates",
              desc: "MH, DL, KA, TN, Bharat (BH) series & more accepted.",
            },
            {
              title: "Gate-ready instructions",
              desc: "Security guard scripts & WhatsApp alerts to hosts.",
            },
            {
              title: "Mobile-first cards",
              desc: "Scan listings quickly on the way to your sector.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-slate-100 bg-white/80 p-5 shadow-sm"
            >
              <h3 className="font-semibold text-slate-900">{item.title}</h3>
              <p className="mt-1 text-sm text-slate-600">{item.desc}</p>
            </div>
          ))}
        </section>
      </main>

      <footer className="mt-auto border-t border-orange-100 bg-white/60 py-6 text-center text-sm text-slate-500">
        ParkIndia Beta · Delhi NCR · Secure neighbourhood parking
      </footer>
    </div>
  );
}
