export type SpaceNode = {
  title: string;
  children?: SpaceNode[];
  /** Special interactive list rendered inside this node. */
  list?: "petcare";
};

export type Book = {
  id: string;
  title: string;
  spine: string;
  textColor: string;
  height: number; // px
  width: number; // px
  toc: string[];
  sections?: SpaceNode[];
};

// Scaled down so all books comfortably fit within the shelf on small screens.
export const BOOKS: Book[] = [
  { id: "dashboard", title: "Dashboard", spine: "var(--spine-forest)", textColor: "var(--spine-gold)", height: 168, width: 34, toc: ["Overview", "Today", "This Week", "Quick Stats"] },
  { id: "spaces", title: "Spaces", spine: "var(--spine-oxblood)", textColor: "var(--spine-cream)", height: 184, width: 38, toc: ["Home", "Work", "Garden", "Projects", "Kitchen"] },
  { id: "settings", title: "Mood Settings", spine: "var(--spine-dustyblue)", textColor: "var(--spine-cream)", height: 160, width: 32, toc: ["Spine font", "Bionic reading", "Profile", "Notifications", "Theme"] },
  { id: "about", title: "About", spine: "var(--spine-mustard)", textColor: "var(--wood-dark)", height: 174, width: 30, toc: ["Our Story", "How It Works", "Credits"] },
  { id: "donate", title: "Donate", spine: "var(--spine-terracotta)", textColor: "var(--spine-cream)", height: 170, width: 34, toc: ["One-time", "Monthly", "Why Support Us"] },
  { id: "accessibility", title: "Accessibility", spine: "#3a5a6e", textColor: "var(--spine-gold)", height: 178, width: 34, toc: ["Text size", "Contrast", "Motion", "Screen reader"] },
  { id: "music", title: "Music", spine: "#4a2c5a", textColor: "var(--spine-gold)", height: 162, width: 30, toc: ["Ambience", "Playlists", "Focus", "Sleep"] },
  { id: "stickynotes", title: "Sticky Notes", spine: "#c9a227", textColor: "#3a2410", height: 152, width: 36, toc: ["Pinned", "All notes", "Archive"] },
  { id: "howto", title: "How To", spine: "#6b4423", textColor: "var(--spine-gold)", height: 186, width: 34, toc: ["Getting started", "Tips & tricks", "FAQ"] },
  { id: "dlc", title: "DLC", spine: "#1f3a2e", textColor: "var(--spine-gold)", height: 166, width: 30, toc: ["Expansions", "Themes", "Plugins"] },
  { id: "addmore", title: "Add More", spine: "#2a2a2a", textColor: "var(--spine-cream)", height: 158, width: 32, toc: ["Browse catalog", "Suggest a book", "Custom"] },
];
