import { argv } from 'process';
import fetch from 'node-fetch';
import iconv from 'iconv-lite';
import * as cheerio from 'cheerio';
import { addAuthors, addBooks, addGenre } from './db-mysql.js';
import { Book, Author, Genre } from './Iparser';

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
        const genresArray: string[] = [];
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
                  dateOfBirth: undefined,
                  email: undefined,
                  booksListUrl: '',
                };
                author.booksListUrl = e.url;
                author.name = e.name;
                if ($ch('td').children('li').children('u').text()) {
                  author.email = $ch('td').children('li').children('u').text();
                }
                if ($ch('a[href=/rating/bday/]').parent().parent().text().split(' ')[1] !== undefined) {
                  const rawDate = $ch('a[href=/rating/bday/]').parent().parent().text().split(' ')[1].slice(0, 10).split('/');
                  if (rawDate[2] !== undefined) {
                    if (Number.isNaN(Number(rawDate[2][3]))) {
                      author.dateOfBirth = new Date(1111, Number(rawDate[1]) - 1, Number(rawDate[0]) + 1);
                    } else {
                      author.dateOfBirth = new Date(Number(rawDate[2]), Number(rawDate[1]) - 1, Number(rawDate[0]) + 1);
                    }
                  }
                }
                authorArray.push(author);
                addAuthors(authorArray);
                const booksArray: Book[] = [];
                let book: Book = {
                  url: '',
                  author: '',
                  title: '',
                  size: undefined,
                  rating: undefined,
                  ratersCount: undefined,
                  genre: undefined,
                };
                if (e.url.indexOf('RUFANT') !== -1) {
                  $ch('body').children('li').each((index, element) => {
                    if ($ch(element).children('tt').children('small').text().split('[')[1] !== undefined) {
                      book.url = e.url + $ch(element).children('a[href]').attr('href');
                      book.author = e.name;
                      book.title = $ch(element).children('a[href]').text();
                      const sizeBook = +$ch(element).children('tt').children('small').text().split('(')[1].split('k')[0];
                      if (!Number.isNaN(sizeBook)) {
                        book.size = sizeBook;
                      }
                      book.ratersCount = +$ch(element).children('tt').children('small').text().split('[')[1].split(']')[0];
                      booksArray.push(book);
                      book = {
                        url: '',
                        author: '',
                        title: '',
                        size: undefined,
                        rating: undefined,
                        ratersCount: undefined,
                        genre: undefined,
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
                      book.ratersCount = +splitFullRating[1] || undefined;
                      book.rating = +splitFullRating[0] || undefined;
                      $ch(element).children('small').each((i, e) => {
                        const getGenre = $ch(e).text().split(' ');
                        getGenre.forEach((el) => {
                          if (el !== 'Комментарии:' && el.indexOf('Оценка') === -1 && el.indexOf('(') === -1 && el.length >= 4) {
                            const newGenre: Genre = {
                              genre: undefined,
                            };
                            if (genresArray.indexOf(el) === -1) {
                              genresArray.push(el);
                              book.genre = genresArray.indexOf(el) + 1;
                              newGenre.genre = el;
                              addGenre(newGenre);
                            } else {
                              book.genre = genresArray.indexOf(el) + 1;
                            }
                          }
                        });
                      });
                      booksArray.push(book);
                      book = {
                        url: '',
                        author: '',
                        title: '',
                        size: undefined,
                        rating: undefined,
                        ratersCount: undefined,
                        genre: undefined,
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
