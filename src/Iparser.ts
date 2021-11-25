export interface Author {
  name: string;
  dateOfBirth: Date | undefined;
  email: string | undefined;
  booksListUrl: string;
}

export interface Book {
  url: string;
  author: string;
  title: string;
  size: number | undefined;
  rating: number | undefined;
  ratersCount: number | undefined;
  genre: number | undefined;
}

export interface Genre {
  genre: string | undefined;
}

export interface AuthorLink {
  name: string;
  url: string;
}
