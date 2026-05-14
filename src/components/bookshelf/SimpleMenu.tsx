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
        <h1 className="font-serif text-3xl font-semibold">Library</h1>

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
                  <p className="font-serif text-xl">{bionicize(book.title, bionic)}</p>
                  <p className="mt-0.5 text-sm opacity-60">
                    {bionicize(book.toc.join(" · "), bionic)}
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
