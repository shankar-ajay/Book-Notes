import express from "express";
import bodyParser from "body-parser";
import axios from "axios";
import { marked } from "marked";
import pg from "pg";
import env from "dotenv";

const app = express();
const port = 3000;
env.config();

const db = new pg.Client({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT
});
db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");

// app.get("/", async (req, res) => {
//   try {
//     const result = await db.query("SELECT * FROM books ORDER BY date_read DESC");
//     res.render("index.ejs", { books: result.rows });
//   } catch (err) {
//     console.error(err);
//     res.send("Error fetching books.");
//   }
// });

app.get("/", async (req, res) => {
  try {
    // Allowed sort columns and their SQL expressions
    const sortOptions = {
      title: "title ASC",
      date_read: "date_read DESC",
      rating: "rating DESC",
    };

    // Get the sort param from query string
    const sortKey = req.query.sort;

    // Pick SQL order by clause or default
    const orderBy = sortOptions[sortKey] || "date_read DESC";

    // Use parameterized query with dynamic order by
    const queryText = `SELECT * FROM books ORDER BY ${orderBy}`;

    const result = await db.query(queryText);
    res.render("index.ejs", { books: result.rows });
  } catch (err) {
    console.error(err);
    res.send("Error fetching books.");
  }
});


app.get("/add", (req, res) => {
  res.render("add.ejs");
});

app.post("/add", async (req, res) => {
  const { title, author, rating, date_read, notes } = req.body;

  try {
    const cover = await axios.get(`https://covers.openlibrary.org/b/title/${encodeURIComponent(title)}-L.jpg`, {
      validateStatus: false,
    });
    const cover_url = cover.status === 200 ? cover.request.res.responseUrl : null;

    await db.query(
      "INSERT INTO books (title, author, rating, date_read, notes, cover_url) VALUES ($1, $2, $3, $4, $5, $6)",
      [title, author, rating, date_read, notes, cover_url]
    );
    res.redirect("/");
  } catch (err) {
    console.error(err);
    res.send("Error adding book.");
  }
});

app.get("/edit/:id", async (req, res) => {
  const id = req.params.id;
  const result = await db.query("SELECT * FROM books WHERE id = $1", [id]);
  res.render("edit.ejs", { book: result.rows[0] });
});

app.post("/edit/:id", async (req, res) => {
  const id = req.params.id;
  const { title, author, rating, date_read, notes } = req.body;
  await db.query(
    "UPDATE books SET title = $1, author = $2, rating = $3, date_read = $4, notes = $5 WHERE id = $6",
    [title, author, rating, date_read, notes, id]
  );
  res.redirect("/");
});

app.post("/delete/:id", async (req, res) => {
  const id = req.params.id;
  await db.query("DELETE FROM books WHERE id = $1", [id]);
  res.redirect("/");
});

// Route for viewing a single book
// app.get("/book/:id", async (req, res) => {
//   const bookId = req.params.id;
//   try {
//     const result = await db.query("SELECT * FROM books WHERE id = $1", [bookId]);
//     const book = result.rows[0];
//     if (!book) {
//       return res.status(404).send("Book not found");
//     }
//     res.render("book", { book });
//   } catch (err) {
//     console.error("Error fetching book:", err);
//     res.status(500).send("Internal server error");
//   }
// });

app.get("/book/:id", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM books WHERE id = $1", [req.params.id]);
    const book = result.rows[0];

    // ✅ Convert Markdown to HTML
    book.notes = marked(book.notes);

    res.render("book", { book });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error retrieving book.");
  }
});

// Edit books
app.get("/book/:id/edit", async (req, res) => {
  const result = await db.query("SELECT * FROM books WHERE id = $1", [req.params.id]);
  const book = result.rows[0];
  res.render("edit", { book });
});

app.post("/book/:id/update", async (req, res) => {
  const { title, author, rating, date_read, notes, isbn } = req.body;

  try {
    await db.query(
      `UPDATE books SET title = $1, author = $2, rating = $3, date_read = $4, notes = $5, isbn = $6 WHERE id = $7`,
      [title, author, rating, date_read, notes, isbn, req.params.id]
    );

    res.redirect(`/book/${req.params.id}`);
  } catch (err) {
    console.error("Error updating book:", err);
    res.send("Failed to update the book.");
  }
});



app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
