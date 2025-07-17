const express = require("express");
const mysql = require("mysql2");
const bcrypt = require("bcrypt");
const session = require("express-session");

const app = express();
const PORT = 3000;

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(session({
  secret: "glowsome-secret",
  resave: false,
  saveUninitialized: true
}));
app.use(express.static(__dirname)); // Serve static files like HTML/CSS

// MySQL Connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "", // Change this if needed
  database: "glowsomemore"
});

db.connect(err => {
  if (err) throw err;
  console.log("Connected to MySQL ✅");
});

// Signup Route
app.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;
  const hashed = await bcrypt.hash(password, 10);

  db.query("INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
    [name, email, hashed],
    err => {
      if (err) return res.status(500).send("Signup failed.");
      res.redirect("index.html");
    }
  );
});

// Login Route
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  db.query("SELECT * FROM users WHERE email = ?", [email], async (err, results) => {
    if (err || results.length === 0) return res.status(401).send("Invalid email.");
    const valid = await bcrypt.compare(password, results[0].password);
    if (valid) {
      req.session.userId = results[0].id;
      res.redirect("index.html");
    } else {
      res.status(401).send("Incorrect password.");
    }
  });
});

// Fetch Products
app.get("/products", (req, res) => {
  db.query("SELECT * FROM products", (err, results) => {
    if (err) return res.status(500).send("Failed to fetch products.");
    res.json(results);
    headers: { "Content-Type" ; "application/json" }

  });
});

// Add to Cart Route
app.post("/cart", (req, res) => {
  const { product_id, quantity } = req.body;
  const userId = req.session.userId;

  if (!userId) return res.status(401).send("Please log in to add to cart.");
  if (!product_id || !quantity) return res.status(400).send("Missing product data.");

  const sql = `
    INSERT INTO carts (user_id, product_id, quantity)
    VALUES (?, ?, ?)
    ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity)
  `;

  db.query(sql, [userId, product_id, quantity], err => {
    if (err) {
      console.error("Cart insert error:", err);
      return res.status(500).send("Cart update failed.");
    }
    res.send("Item added to your glam cart 💅");
  });
});

// Checkout Route
app.post("/checkout", (req, res) => {
  if (!req.session.userId) return res.redirect("signup.html");
  res.send("Order confirmed! 💖");
});

app.listen(PORT, () => console.log(`GlowSomeMore server running on http://localhost:${PORT}`));
app.post("/checkout", (req, res) => {
  console.log("Session userId:", req.session.userId); // Debug line
  if (!req.session.userId) {
    return res.status(401).send("Please log in first.");
  }
  res.send("Order confirmed!");
});
