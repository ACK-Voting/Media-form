// Cathedral history content types.
//
// The live copy is edited in /cms/history and stored in MongoDB. Nothing is
// bundled here as a fallback: the arrays that used to sit in this file were
// mock-up placeholders — invented dates and invented names — so an empty
// section now renders as an empty page rather than as fiction.
//
// The real history came from four scanned booklets held by the Cathedral,
// principally Canon Dr. Steve Foster's "Who Built Mombasa's Anglican
// Cathedral?" and the Welcome Visitor Book. Photographs extracted from those
// booklets live in Cloudinary under ack/history; see docs/history-image-sources.md
// for which page each one came from.

export type HistoricalEvent = {
  era: string;
  year: string;
  title: string;
  description: string;
  /** Emoji shown in the card header. Kept for entries with no photograph. */
  image: string;
  significance: string;
  /** Optional photograph, shown opposite the card on the timeline. */
  photo?: string;
  photoCaption?: string;
};

export type KeyFigure = {
  name: string;
  role: string;
  years: string;
  contribution: string;
  /** Portrait. Falls back to the person's initials when absent — several of
   *  the figures in the Cathedral's story have no surviving photograph. */
  photo?: string;
};

export type ArchitecturalFeature = {
  feature: string;
  description: string;
  icon: string;
  photo?: string;
};

/**
 * The three figures in the page hero.
 *
 * CMS-editable rather than hardcoded, and rendered only when a value is
 * present. The page used to assert "2,500+ Active Members", which appears in
 * none of the Cathedral's records; a card with nothing in it is better than a
 * card with a number nobody can stand behind.
 */
export type HeroStat = {
  value: string;
  label: string;
};

export type HistoryContent = {
  historicalEvents: HistoricalEvent[];
  keyFigures: KeyFigure[];
  architecturalFeatures: ArchitecturalFeature[];
  heroStats?: HeroStat[];
};
