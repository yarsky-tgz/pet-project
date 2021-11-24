import { createConnection } from 'mysql2';
import { Book, Author, Genre } from './Iparser';

const config = {
  host: 'localhost',
  user: 'root',
  password: '53995399',
  database: 'libParsing',
};

const connection = createConnection(config).promise();

function addGenre(genre: Genre) {
  connection.query('INSERT INTO genres (name) VALUES (?)', [genre.genre])
    .catch((err) => console.log(err));
}

function addBooks(book: Book[]) {
  const bookReplacements: (string | number | undefined)[] = [];
  let queryPlaceholders: string = '(?,?,?,?,?,?,?)';
  book.forEach((el, idx) => {
    if (idx === 0) {
      bookReplacements.push(el.author, el.title, el.size, el.rating, el.ratersCount, el.genre, el.url);
    } else {
      queryPlaceholders += ',(?,?,?,?,?,?,?)';
      bookReplacements.push(el.author, el.title, el.size, el.rating, el.ratersCount, el.genre, el.url);
    }
  });
  const bookQueryString: string = `INSERT INTO books
                                 (author, title, size, rating, raters_count, genre_id, book_url)
                                 VALUES ${queryPlaceholders}`;
  connection.query(bookQueryString, bookReplacements)
    .catch((err) => console.log(err));
}

function addAuthors(author: Author[]) {
  const authorQueryString: string = `INSERT INTO authors
                                     (name, email, date_of_birth, books_list_url)
                                     VALUES (?,?,?,?)`;
  connection.query(authorQueryString, [author[0].name, author[0].email, author[0].dateOfBirth, author[0].booksListUrl])
    .catch((err) => console.log(err));
}

export { addBooks, addAuthors, addGenre };
