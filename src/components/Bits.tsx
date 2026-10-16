export function PageHero({ title, intro }: { title: string; intro: string }) {
  return (<header className="bg-sun-soft py-14"><div className="mx-auto max-w-6xl px-5">
    <h1 className="text-4xl font-semibold md:text-5xl">{title}</h1><p className="mt-3 max-w-prose text-lg">{intro}</p></div></header>);
}
export function Wrap({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto max-w-6xl px-5 py-14">{children}</div>;
}
// Visible marker for text the school must replace before launch.
export function Todo({ children }: { children: React.ReactNode }) {
  return <p className="mt-3 inline-block rounded-xl border-2 border-dashed border-cherry bg-white px-3 py-1 text-sm font-bold text-cherry">Placeholder: {children}</p>;
}
