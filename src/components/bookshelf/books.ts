export type Book = {
  id: string;
  title: string;
  spine: string; // css var name
  textColor: string;
  height: number; // px
  width: number; // px
  toc: string[];
};

export const BOOKS: Book[] = [
  {
    id: "dashboard",
    title: "Dashboard",
    spine: "var(--spine-forest)",
    textColor: "var(--spine-gold)",
    height: 240,
    width: 52,
    toc: ["Overview", "Today", "This Week", "Quick Stats"],
  },
  {
    id: "spaces",
    title: "Spaces",
    spine: "var(--spine-oxblood)",
    textColor: "var(--spine-cream)",
    height: 260,
    width: 56,
    toc: ["Home", "Work", "Garden", "Projects", "Kitchen"],
  },
  {
    id: "settings",
    title: "Settings",
    spine: "var(--spine-dustyblue)",
    textColor: "var(--spine-cream)",
    height: 230,
    width: 46,
    toc: ["Spine font", "Bionic reading", "Profile", "Notifications", "Theme"],
  },
  {
    id: "about",
    title: "About",
    spine: "var(--spine-mustard)",
    textColor: "var(--wood-dark)",
    height: 250,
    width: 42,
    toc: ["Our Story", "How It Works", "Credits"],
  },
  {
    id: "donate",
    title: "Donate",
    spine: "var(--spine-terracotta)",
    textColor: "var(--spine-cream)",
    height: 245,
    width: 50,
    toc: ["One-time", "Monthly", "Why Support Us"],
  },
];
