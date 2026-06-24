export interface BookPage {
  id: number;
  title: string;
  subtitle?: string;
  chapter?: string;
  paragraphs: string[];
  image?: string;
  imageAlt?: string;
  audio?: string;
  type: "cover" | "copyright" | "dedication" | "preface" | "content" | "summary" | "conclusion";
  quote?: string;
  quoteAuthor?: string;
  highlights?: string[];
  steps?: { number?: string; title: string; desc: string }[];
  superpowers?: { num: number; title: string; desc: string }[];
}

export interface CatalogCard {
  author: string;
  title: string;
  subtitle: string;
  place: string;
  year: string;
  pagesCount: number;
  isbn: string;
  cdd: string;
  cdu: string;
  keywords: string[];
  cataloguerCode: string;
}
