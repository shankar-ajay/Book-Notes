CREATE TABLE books (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  rating INTEGER,
  date_read DATE,
  notes TEXT,
  cover_url TEXT
);



INSERT INTO books (title, author, rating, isbn, date_read, notes)
VALUES 
('Deep Work', 'Cal Newport', 5, '1455586692', '2024-05-21', 'Helped me focus on distraction-free productivity.'),
('Atomic Habits', 'James Clear', 4, '1847941834', '2023-12-15', 'Practical systems for habit formation.'),
('The Subtle Art of Not Giving a F*ck', 'Mark Manson', 3, '176055877X', '2022-08-10', 'Somewhat motivational but not very actionable.'),
('Sapiens', 'Yuval Noah Harari', 5, '0099590085', '2023-03-02', 'Incredible historical storytelling of mankind''s evolution.'),
('Clean Code', 'Robert C. Martin', 4, '0132350882', '2024-01-05', 'Best book on coding discipline and readable code practices.'),
('You Don''t Know JS', 'Kyle Simpson', 5, '1449335586','2025-06-01', 'Advanced deep dive into JavaScript concepts.');