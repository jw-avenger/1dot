export type Book = {
  id: string;
  title: string;
  spine: string; // default css color (var or hex)
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
  {
    id: "accessibility",
    title: "Accessibility",
    spine: "#3a5a6e",
    textColor: "var(--spine-gold)",
    height: 255,
    width: 48,
    toc: ["Text size", "Contrast", "Motion", "Screen reader"],
  },
  {
    id: "music",
    title: "Music",
    spine: "#4a2c5a",
    textColor: "var(--spine-gold)",
    height: 235,
    width: 44,
    toc: ["Ambience", "Playlists", "Focus", "Sleep"],
  },
  {
    id: "stickynotes",
    title: "Sticky Notes",
    spine: "#c9a227",
    textColor: "#3a2410",
    height: 220,
    width: 54,
    toc: ["Pinned", "All notes", "Archive"],
  },
  {
    id: "howto",
    title: "How To",
    spine: "#6b4423",
    textColor: "var(--spine-gold)",
    height: 265,
    width: 50,
    toc: ["Getting started", "Tips & tricks", "FAQ"],
  },
  {
    id: "dlc",
    title: "DLC",
    spine: "#1f3a2e",
    textColor: "var(--spine-gold)",
    height: 240,
    width: 46,
    toc: ["Expansions", "Themes", "Plugins"],
  },
  {
    id: "addmore",
    title: "Add More",
    spine: "#2a2a2a",
    textColor: "var(--spine-cream)",
    height: 230,
    width: 44,
    toc: ["Browse catalog", "Suggest a book", "Custom"],
  },
];
