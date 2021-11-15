import { argv } from 'process';
import { createConnection, QueryError, RowDataPacket } from 'mysql2';
import fetch from 'node-fetch';
import iconv from 'iconv-lite';
import * as cheerio from 'cheerio';

const config = {
  host: 'localhost',
  user: 'someone',
  password: '53995399',
  database: 'testDB',
};

const connection = createConnection(config).promise();

interface Author {
  name: string;
  dateOfBirth: number;
  email: string;
  booksListUrl: string;
}

interface Book {
  url: string;
  author: string;
  title: string;
  size: string;
  rating: number;
  ratersCount: number;
  genre: string;
}

(async () => {
  const fetchData = async (url: string, code: string = 'CP1251') => {
    const data = await fetch(url)
      .then((res) => {
        if (res && res.body) return res.body.pipe(iconv.decodeStream(code));
      });
    return data;
  };
  const bookEncode = 'koi8-r';
  const data = await fetchData(argv[2], bookEncode);
  if (data !== undefined) {
    let dataString: string = '';
    data.on('data', (chunk: string) => dataString += chunk)
      .on('end', () => {
        const authorLinks: Object[] = [];
        const $ = cheerio.load(dataString);
        $('li').children('a').each((idx, elem): any => {
          const authorUrl = (() => {
            const url = elem.attribs.href;
            if (url.indexOf('http://') !== -1) {
              return url;
            }
            return `http://lib.ru/RUFANT/${url}`;
          })();
          const authorLinksObject = {
            name: $(elem).text(),
            url: authorUrl,
          };
          authorLinks.push(authorLinksObject);
        });
        authorLinks.splice(0, 4);

        authorLinks.forEach(async (el: any, idx) => {
          const authorLinksData = await fetchData(el.url);
          if (authorLinksData !== undefined) {
            let authorDataString: string = '';
            authorLinksData.on('data', (chunk: string) => authorDataString += chunk)
              .on('end', () => {
                const $ch = cheerio.load(authorDataString);
                const author: Author = {
                  name: '',
                  dateOfBirth: 0,
                  email: '',
                  booksListUrl: '',
                };
                author.name = el.name;
                author.email = $ch('td').children('li').children('u').text();
                author.booksListUrl = el.url;
                const authorQueryString: string = `INSERT INTO authors
                                                   (name, email, date_of_birth, books_list_url)
                                                   VALUES (?,?,?,?)`;
                connection.query(authorQueryString, [
                  author.name, author.email, author.dateOfBirth, author.booksListUrl,
                ]).catch((err) => console.log(err));

                const book: Book = {
                  url: '',
                  author: '',
                  title: '',
                  size: '',
                  rating: 0,
                  ratersCount: 0,
                  genre: '',
                };
                $ch('dt').children('li').each((idx, elem) => {
                  const fullRating = $ch(elem).children('small').children('b').text();
                  const splitFullRating = fullRating.split('*');
                  if ($ch(elem).children('a').attr('href') !== undefined) {
                    book.url = el.url + $ch(elem).children('a').attr('href');
                    book.author = author.name;
                    book.title = $ch(elem).children('a').children('b').text();
                    book.size = $ch(elem).children('a').next().text();
                    book.rating = +splitFullRating[0] || 0;
                    book.ratersCount = +splitFullRating[1] || 0;
                    book.genre = $ch(elem).children('small').children('b').next().text();
                    const bookQueryString: string = `INSERT INTO books
                                                   (author, title, size, rating, raters_count, genre_id, book_url)
                                                   VALUES (?,?,?,?,?,?,?)`;
                    connection.query(bookQueryString, [
                      book.author, book.title, book.size, book.rating, book.ratersCount, book.genre, book.url,
                    ]).catch((err) => console.log(err));
                    // console.log(book);
                  }
                });
              });
          }
        });
      });
  }
})();
