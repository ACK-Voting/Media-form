// Cathedral history content.
//
// Serves as the fallback shown before the CMS `history` section loads, and as
// the source for the committed seed. Edit the live copy in /cms/history.
//
// NOTE: these entries came from the original mock-up and appear to be
// placeholder text rather than the cathedral's real history. They should be
// replaced with verified dates, names and events.

export type HistoricalEvent = {
  era: string;
  year: string;
  title: string;
  description: string;
  image: string;
  significance: string;
};

export type KeyFigure = {
  name: string;
  role: string;
  years: string;
  contribution: string;
};

export type ArchitecturalFeature = {
  feature: string;
  description: string;
  icon: string;
};

export type HistoryContent = {
  historicalEvents: HistoricalEvent[];
  keyFigures: KeyFigure[];
  architecturalFeatures: ArchitecturalFeature[];
};

// The arrays that used to live here were mock-up placeholders and have been
// removed. Real history is entered in /cms/history and stored in MongoDB.
