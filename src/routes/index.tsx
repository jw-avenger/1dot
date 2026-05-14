import { createFileRoute } from "@tanstack/react-router";
import { Bookshelf } from "@/components/bookshelf/Bookshelf";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Stress-Free Home Help — Your Library" },
      {
        name: "description",
        content:
          "A cozy, calm home for everything you manage — pick a book from the shelf to begin.",
      },
      { property: "og:title", content: "Stress-Free Home Help" },
      {
        property: "og:description",
        content: "A cozy bookshelf menu for managing your home, your way.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  return <Bookshelf />;
}
