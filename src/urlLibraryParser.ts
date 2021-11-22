import { argv } from 'process';
import fetch from 'node-fetch';
import iconv from 'iconv-lite';
import * as cheerio from 'cheerio';
import { addAuthors, addBooks } from './db-mysql.js';
import { Book, Author } from './Iparser';

(async () => {
  const fetchData = async (url: string) => {
    let code: string = '';
    if (url.indexOf('RUFANT') !== -1) code = 'koi8-r';
    else code = 'CP1251';
    const data = await fetch(url)
      .then((res) => {
        if (res && res.body) return res.body.pipe(iconv.decodeStream(code));
      });
    return data;
  };
  const data = await fetchData(argv[2]);

  if (data !== undefined) {
    let dataString: string = '';
    data.on('data', (chunk: string) => dataString += chunk)
      .on('end', () => {
        const authorLinks: Object[] = [];
        const $ = cheerio.load(dataString);
        $('li').children('a').each((idx, elem) => {
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

        authorLinks.forEach(async (e: any) => {
          const authorLinksData = await fetchData(e.url);
          if (authorLinksData !== undefined) {
            let authorDataString: string = '';
            authorLinksData.on('data', (chunk: string) => authorDataString += chunk)
              .on('end', () => {
                const $ch = cheerio.load(authorDataString);
                const authorArray: Author[] = [];
                const author: Author = {
                  name: '',
                  dateOfBirth: '',
                  email: '',
                  booksListUrl: '',
                };
                author.booksListUrl = e.url;
                author.name = e.name;
                if ($ch('td').children('li').children('u').text()) {
                  author.email = $ch('td').children('li').children('u').text();
                }
                if ($ch('a[href=/rating/bday/]').parent().parent().text().split(' ')[1] !== undefined) {
                  author.dateOfBirth = $ch('a[href=/rating/bday/]').parent().parent().text().split(' ')[1].slice(0, 10);
                }
                authorArray.push(author);
                addAuthors(authorArray);
                // console.log(authorArray);
                const booksArray: Book[] = [];
                let book: Book = {
                  url: '',
                  author: '',
                  title: '',
                  size: 0,
                  rating: 0,
                  ratersCount: 0,
                  genre: '',
                };
                if (e.url.indexOf('RUFANT') !== -1) {
                  $ch('body').children('li').each((index, element) => {
                    if ($ch(element).children('tt').children('small').text().split('[')[1] !== undefined) {
                      book.url = e.url + $ch(element).children('a[href]').attr('href');
                      book.author = e.name;
                      book.title = $ch(element).children('a[href]').text();
                      book.size = +$ch(element).children('tt').children('small').text().split('(')[1].split('k')[0];
                      book.ratersCount = +$ch(element).children('tt').children('small').text().split('[')[1].split(']')[0];
                      booksArray.push(book);
                      book = {
                        url: '',
                        author: '',
                        title: '',
                        size: 0,
                        rating: 0,
                        ratersCount: 0,
                        genre: '',
                      };
                    }
                  });
                } else {
                  $ch('dl').children('dt').children('li').each((index, element) => {
                    if ($ch(element).children('a[href]').next().text().indexOf('k') !== -1) {
                      book.url = e.url + $ch(element).children('a[href]').attr('href');
                      book.author = e.name;
                      book.title = $ch(element).children('a[href]').children('b').text();
                      book.size = +$ch(element).children('a[href]').next().text().split('k')[0];
                      const fullRating = $ch(element).children('small').children('b').text();
                      const splitFullRating = fullRating.split('*');
                      book.ratersCount = +splitFullRating[1] || 0;
                      book.rating = +splitFullRating[0] || 0;
                      $ch(element).children('small').each((i, e) => {
                        const getGenre = $ch(e).text().split(' ');
                        getGenre.forEach((el) => {
                          if (el !== 'Комментарии:' && el.indexOf('Оценка') === -1 && el.indexOf('(') === -1 && el.length >= 4) {
                            book.genre = el;
                          }
                        });
                      });
                      booksArray.push(book);
                      book = {
                        url: '',
                        author: '',
                        title: '',
                        size: 0,
                        rating: 0,
                        ratersCount: 0,
                        genre: '',
                      };
                    }
                  });
                }
                addBooks(booksArray);
              });
          }
        });
      });
  }
})();
