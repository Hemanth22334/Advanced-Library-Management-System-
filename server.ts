import express, { Request, Response, NextFunction } from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import cors from "cors";
import bcrypt from "bcryptjs";
import multer from "multer";
import fs from "fs";
import { initDb, User, Book, Transaction, sequelize } from "./src/db";
import { generateToken, verifyToken, AuthUser } from "./src/lib/auth";
import { Op } from "sequelize";

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  await initDb();

  // Seed data if empty
  const bookCount = await Book.count();
  if (bookCount === 0) {
    await Book.bulkCreate([
      { title: "The Great Gatsby", author: "F. Scott Fitzgerald", category: "Fiction", quantity: 5, imageUrl: "https://picsum.photos/seed/gatsby/400/300" },
      { title: "Clean Code", author: "Robert C. Martin", category: "Technology", quantity: 3, imageUrl: "https://picsum.photos/seed/cleancode/400/300" },
      { title: "A Brief History of Time", author: "Stephen Hawking", category: "Science", quantity: 2, imageUrl: "https://picsum.photos/seed/hawking/400/300" },
      { title: "Sapiens", author: "Yuval Noah Harari", category: "History", quantity: 4, imageUrl: "https://picsum.photos/seed/sapiens/400/300" },
      { title: "The Pragmatic Programmer", author: "Andrew Hunt", category: "Technology", quantity: 6, imageUrl: "https://picsum.photos/seed/pragmatic/400/300" }
    ]);
    console.log('Sample books seeded');
  }

  app.use(cors());
  app.use(express.json());

  // Ensure uploads directory exists
  const uploadDir = path.join(process.cwd(), 'public/uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  // Multer config for images
  const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
  });
  const upload = multer({ storage });

  // --- Middleware ---
  const authenticate = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const token = authHeader.split(' ')[1];
    const user = verifyToken(token);
    if (!user) return res.status(401).json({ error: 'Invalid token' });
    req.user = user;
    next();
  };

  const isAdmin = (req: Request, res: Response, next: NextFunction) => {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    next();
  };

  // --- Auth Routes ---
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { name, email, password, role } = req.body;
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await User.create({ name, email, password: hashedPassword, role: role || 'student' });
      const token = generateToken({ id: user.id, email: user.email, role: user.role, name: user.name });
      res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Registration failed" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ where: { email } });
      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      const token = generateToken({ id: user.id, email: user.email, role: user.role, name: user.name });
      res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
    } catch (error) {
      res.status(500).json({ error: "Login failed" });
    }
  });

  // --- Book Routes ---
  app.get("/api/books", async (req, res) => {
    const { search, category } = req.query;
    const where: any = {};
    if (search) {
      where[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { author: { [Op.like]: `%${search}%` } }
      ];
    }
    if (category) where.category = category;
    
    const books = await Book.findAll({ where });
    res.json(books);
  });

  app.post("/api/books", authenticate, isAdmin, upload.single('image'), async (req: any, res: Response) => {
    try {
      const { title, author, category, quantity } = req.body;
      const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;
      const book = await Book.create({ title, author, category, quantity, imageUrl });
      res.json(book);
    } catch (error) {
      res.status(500).json({ error: "Failed to create book" });
    }
  });

  app.put("/api/books/:id", authenticate, isAdmin, async (req, res) => {
    try {
      const book = await Book.findByPk(req.params.id);
      if (!book) return res.status(404).json({ error: "Book not found" });
      await book.update(req.body);
      res.json(book);
    } catch (error) {
      res.status(500).json({ error: "Update failed" });
    }
  });

  app.delete("/api/books/:id", authenticate, isAdmin, async (req, res) => {
    try {
      const book = await Book.findByPk(req.params.id);
      if (!book) return res.status(404).json({ error: "Book not found" });
      await book.destroy();
      res.json({ message: "Book deleted" });
    } catch (error) {
      res.status(500).json({ error: "Delete failed" });
    }
  });

  // --- Transaction Routes ---
  app.post("/api/transactions/issue", authenticate, isAdmin, async (req, res) => {
    try {
      const { userId, bookId, dueDate } = req.body;
      
      const book = await Book.findByPk(bookId);
      if (!book || book.quantity <= 0) return res.status(400).json({ error: "Book unavailable" });

      const active = await Transaction.findOne({ where: { userId, bookId, status: 'issued' } });
      if (active) return res.status(400).json({ error: "User already has this book issued" });

      const transaction = await Transaction.create({ userId, bookId, dueDate, status: 'issued' });
      await book.decrement('quantity');
      
      res.json(transaction);
    } catch (error) {
      res.status(500).json({ error: "Issue failed" });
    }
  });

  app.post("/api/transactions/return/:id", authenticate, isAdmin, async (req, res) => {
    try {
      const transaction = await Transaction.findByPk(req.params.id);
      if (!transaction || transaction.status === 'returned') {
        return res.status(400).json({ error: "Invalid transaction" });
      }

      await transaction.update({ status: 'returned', returnDate: new Date() });
      const book = await Book.findByPk(transaction.bookId);
      if (book) await book.increment('quantity');

      res.json(transaction);
    } catch (error) {
      res.status(500).json({ error: "Return failed" });
    }
  });

  app.get("/api/dashboard/stats", authenticate, async (req, res) => {
    const totalBooks = await Book.count();
    const issuedBooks = await Transaction.count({ where: { status: 'issued' } });
    const totalUsers = await User.count({ where: { role: 'student' } });
    
    // Simple category distribution for charts
    const categories = await Book.findAll({
      attributes: ['category', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
      group: ['category']
    });

    res.json({ totalBooks, issuedBooks, totalUsers, categories });
  });

  app.get("/api/my-books", authenticate, async (req, res) => {
    const transactions = await Transaction.findAll({
      where: { userId: req.user?.id },
      include: [Book],
      order: [['issueDate', 'DESC']]
    });
    res.json(transactions);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
