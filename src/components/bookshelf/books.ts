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
  { id: "dashboard", title: "DASHBOARD", spine: "var(--spine-forest)", textColor: "var(--spine-gold)", height: 168, width: 34, toc: ["OVERVIEW", "TODAY", "THIS WEEK", "QUICK STATS"] },
  {
    id: "spaces",
    title: "SPACES",
    spine: "var(--spine-oxblood)",
    textColor: "var(--spine-cream)",
    height: 184,
    width: 38,
    toc: ["HOUSE", "WORK", "OUTSIDE", "CAR"],
    sections: [
      {
        title: "HOUSE",
        children: [
          { title: "KITCHEN", children: [{ title: "PET CARE", list: "petcare" }] },
          { title: "GARDEN" },
          { title: "HOME PROJECTS" },
        ],
      },
      {
        title: "WORK",
        children: [{ title: "WORK PROJECTS" }],
      },
      { title: "OUTSIDE" },
      { title: "CAR" },
    ],
  },
  { id: "settings", title: "MOOD SETTINGS", spine: "var(--spine-dustyblue)", textColor: "var(--spine-cream)", height: 160, width: 32, toc: ["SPINE FONT", "BIONIC READING", "PROFILE", "NOTIFICATIONS", "THEME"] },
  { id: "donate", title: "ABOUT / DONATING", spine: "var(--spine-terracotta)", textColor: "var(--spine-cream)", height: 172, width: 36, toc: ["A NOTE FROM THE MAKER", "GOOGLE PLAY RELEASE", "APPLE DEVELOPER LICENSE", "HOSTING & SYNC", "COMMUNITY POLL"] },
  { id: "accessibility", title: "ACCESSIBILITY", spine: "#3a5a6e", textColor: "var(--spine-gold)", height: 178, width: 34, toc: ["TEXT SIZE", "CONTRAST", "MOTION", "SCREEN READER"] },
  { id: "music", title: "MUSIC", spine: "#4a2c5a", textColor: "var(--spine-gold)", height: 162, width: 30, toc: ["AMBIENCE", "PLAYLISTS", "FOCUS", "SLEEP"] },
  { id: "stickynotes", title: "STICKY NOTES", spine: "#c9a227", textColor: "#3a2410", height: 152, width: 36, toc: ["PINNED", "ALL NOTES", "ARCHIVE"] },
  { id: "social", title: "SOCIAL", spine: "#2e6b8a", textColor: "var(--spine-cream)", height: 156, width: 32, toc: ["FRIENDS", "SHARED LISTS", "INVITES", "ACTIVITY"] },
  { id: "notifications", title: "NOTIFICATIONS", spine: "#a04a2a", textColor: "var(--spine-cream)", height: 164, width: 34, toc: ["REMINDERS", "ALERTS", "QUIET HOURS", "PREFERENCES"] },
  { id: "howto", title: "HOW TO", spine: "#6b4423", textColor: "var(--spine-gold)", height: 186, width: 34, toc: ["GETTING STARTED", "TIPS & TRICKS", "FAQ"] },
  { id: "dlc", title: "DLC", spine: "#1f3a2e", textColor: "var(--spine-gold)", height: 166, width: 30, toc: ["EXPANSIONS", "THEMES", "PLUGINS"] },
  { id: "addmore", title: "ADD MORE", spine: "#2a2a2a", textColor: "var(--spine-cream)", height: 158, width: 32, toc: ["BROWSE CATALOG", "SUGGEST A BOOK", "CUSTOM"] },
];
