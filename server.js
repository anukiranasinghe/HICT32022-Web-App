const express = require('express');
const jwt = require('jsonwebtoken');
const users = require('./data/users');
const { verifyToken } = require('./middleware/auth');

const app = express();
const PORT = 3000;
const SECRET_KEY = 'hict32022-super-secret';

// 1. MIDDLEWARE: This tells our server how to unpack JSON data sent in a POST request.
// (This is the Express HTTP Pipeline at work!)
app.use(express.json());

// 2. MOCK DATABASE: A simple array stored in the server's memory.
let books = [
    { id: 1, title: "Harry Potter" },
    { id: 2, title: "Lord of the Rings" }
];

// 3. GET ROUTE: Read the data
app.get('/api/books', (req, res) => {
    res.json(books);
});

// 4. POST ROUTE: Create new data
app.post('/api/books', (req, res) => {
    // req.body contains the unpacked JSON data sent by the user
    const newBook = req.body;

    // Add the new book to our array
    books.push(newBook);

    // Send a success message back to the client
    res.send("Book added successfully!");
});

// 5. LOGIN ROUTE: Week 4 — issue a JWT
app.post('/login', (req, res) => {
    // Never trust the request. If the body is missing,
    // say so clearly.
    if (!req.body || !req.body.username || !req.body.password) {
        return res.status(400).json({
            message: 'Username and password are required.'
        });
    }

    const { username, password } = req.body;

    const foundUser = users.find(
        (user) => user.username === username && user.password === password
    );
    if (!foundUser) {
        return res.status(401).json({
            message: 'Invalid username or password.'
        });
    }

    const token = jwt.sign(
        { id: foundUser.id, username: foundUser.username,
          role: foundUser.role },
        SECRET_KEY,
        { expiresIn: '1h' }
    );

    res.json({ message: 'Login successful!', token: token });
});

// 6. DASHBOARD ROUTE: Week 4 — protected by the JWT gate
app.get('/dashboard', verifyToken, (req, res) => {
    res.json({ message: 'Welcome to your dashboard!', user: req.user });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
