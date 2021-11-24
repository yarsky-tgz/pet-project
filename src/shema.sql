CREATE TABLE IF NOT EXISTS authors (
    id INT unsigned NOT NULL AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    date_of_birth DATE,
    books_list_url VARCHAR(255),
    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS books (
    id INT unsigned NOT NULL AUTO_INCREMENT,
    author VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    size INT,
    rating DECIMAL(3, 2),
    raters_count INT,
    genre_id SMALLINT unsigned,
    book_url VARCHAR(255) NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS genres (
    id INT unsigned NOT NULL AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    PRIMARY KEY (id)
);

