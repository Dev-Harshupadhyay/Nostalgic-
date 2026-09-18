type Props = {
  eyebrow: string;
  title: string;
  description: string;
  emoji: string;
  count?: number;
};

export default function PageHeader({ eyebrow, title, description, emoji, count }: Props) {
  return (
    <header className="fade-up relative overflow-hidden px-1 pb-6 pt-9 sm:pt-12">
      <div
        aria-hidden
        className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(232,163,61,0.2),transparent_68%)] blur-3xl"
      />
      <p className="eyebrow">{eyebrow}</p>
      <h1 className="mt-2 flex items-center gap-3 text-[1.75rem] font-extrabold tracking-tight sm:text-4xl">
        <span aria-hidden>{emoji}</span>
        <span className="warm-text">{title}</span>
      </h1>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/55">{description}</p>
      {typeof count === "number" ? (
        <p className="mt-2 text-xs text-white/35">{count} songs in this collection</p>
      ) : null}
    </header>
  );
}
