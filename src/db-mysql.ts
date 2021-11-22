import { createConnection } from 'mysql2';
import { Book, Author } from './Iparser';

const config = {
  host: 'localhost',
  user: 'root',
  password: '53995399',
  database: 'libParsing',
};

const connection = createConnection(config).promise();

function addBooks(book: Book[]) {
  console.log(book);
  // const bookQueryString: string = `INSERT INTO books
  //                                (author, title, size, rating, raters_count, genre_id, book_url)
  //                                VALUES (?,?,?,?,?,?,?)`;
  // connection.query(bookQueryString, [
  //   book.author, book.title, book.size, book.rating, book.ratersCount, book.genre, book.url,
  // ]).catch((err) => console.log(err));
}

function addAuthors(author: Author[]) {
  console.log(author);
  // const authorQueryString: string = `INSERT INTO authors
  //                                    (name, email, date_of_birth, books_list_url)
  //                                    VALUES (?,?,?,?)`;
  // connection.query(authorQueryString, [
  //   author.name, author.email, author.dateOfBirth, author.booksListUrl,
  // ]).catch((err) => console.log(err));
}

export { addBooks, addAuthors };
