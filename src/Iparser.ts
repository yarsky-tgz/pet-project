export interface Author {
  name: string;
  dateOfBirth: string | undefined;
  email: string;
  booksListUrl: string;
}

export interface Book {
  url: string;
  author: string;
  title: string;
  size: number;
  rating: number;
  ratersCount: number;
  genre: string;
}
