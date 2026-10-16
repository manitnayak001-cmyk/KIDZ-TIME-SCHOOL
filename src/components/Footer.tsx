type Props = { name: string; tagline: string; social: { name: string; url: string }[] };
export default function Footer({ name, tagline, social }: Props) {
  return (
    <footer className="bg-ink text-white"><div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-8 sm:flex-row sm:justify-between">
      <p>&copy; {new Date().getFullYear()} {name}. {tagline}</p>
      <ul className="flex flex-wrap gap-5 font-bold">
        {social.map((s) => <li key={s.name}><a href={s.url} rel="noopener noreferrer" target="_blank" className="underline">{s.name}</a></li>)}
        <li><a href="/privacy" className="underline">Privacy policy</a></li>
      </ul></div></footer>
  );
}
