import { BOOKS } from "./books";
import { useSettings, bionicize } from "./useSettings";

type Props = {
  onSelect: (id: string) => void;
};

export function SimpleMenu({ onSelect }: Props) {
  const { bionic } = useSettings();
  return (
    <div
      className="min-h-screen px-6 py-12 font-sans"
      style={{ backgroundColor: "var(--background)", color: "var(--foreground)" }}
    >
      <div className="mx-auto max-w-2xl">
        <p className="text-xs uppercase tracking-[0.3em] opacity-60">
          Stress-Free Home Help
        </p>
        <h1 className="mt-2 font-serif text-3xl font-semibold">Menu</h1>

        <ul className="mt-10 divide-y" style={{ borderColor: "var(--border)" }}>
          {BOOKS.map((book) => (
            <li key={book.id} style={{ borderColor: "var(--border)" }} className="border-t first:border-t-0">
              <button
                onClick={() => onSelect(book.id)}
                className="group flex w-full items-center gap-4 py-5 text-left transition hover:opacity-80"
              >
                <span
                  className="h-8 w-1.5 rounded-sm"
                  style={{ backgroundColor: book.spine }}
                  aria-hidden
                />
                <div className="flex-1">
                  <p className="font-serif text-xl">{book.title}</p>
                  <p className="mt-0.5 text-sm opacity-60">
                    {book.toc.join(" · ")}
                  </p>
                </div>
                <span className="opacity-40 transition group-hover:translate-x-1 group-hover:opacity-80">
                  →
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
