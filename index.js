const express = require('express');
const session = require('express-session');
const mongoose = require('mongoose');
const MongoStore = require('connect-mongo');
const fileUpload = require('express-fileupload');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const config = require('./util/config');

const app = express();

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

const uploadDir = path.join(__dirname, 'public/assets/uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

app.use(fileUpload({
    createParentPath: true,
    limits: { 
        fileSize: 50 * 1024 * 1024 // 50MB limit
    },
    abortOnLimit: true,
    useTempFiles: true,
    tempFileDir: path.join(__dirname, 'public/assets/uploads/temp'),
    safeFileNames: true,
    preserveExtension: true,
    debug: process.env.NODE_ENV === 'development'
}));

mongoose.connect(config.MongoURI).then(() => {
    console.log('Connected to MongoDB');
}).catch(err => {
    console.error('Error connecting to MongoDB:', err);
});

app.use(session({
    secret: config.SessionSecret || 'very-secret-key',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: config.MongoURI,
        collectionName: 'sessions',
        ttl: 14 * 24 * 60 * 60, // 14 days
    }),
    cookie: {
        maxAge: 14 * 24 * 60 * 60 * 1000, // 14 days
        secure: config.HttpType == "https" ? true : false, // Set to true if using HTTPS
        httpOnly: true,
        // sameSite: 'strict', // CSRF protection, turned off for now
    },
}));

app.use(cors({
    origin: config.FrontendURL,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
}))

const authRoutes = require('./routes/authRoutes');
const orgRoutes = require('./routes/orgRoutes');
const profileRoutes = require('./routes/profileRoutes');
const ticketRoutes = require('./routes/ticketRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const commentRoutes = require('./routes/commentRoutes');
const professionRoutes = require('./routes/professionRoutes');

app.use("/api/auth", authRoutes);
app.use("/api/org", orgRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/ticket", ticketRoutes);
app.use("/api/category", categoryRoutes);
app.use("/api/comment", commentRoutes);
app.use("/api/profession", professionRoutes);

app.use("/api", (req, res) => {
    return res.status(401).json({ message: "Unauthorized" });
});

app.use((req, res) => {
    res.status(404).render("error", {
        status: 404,
        message: "Page not found",
    });
});

app.listen(config.Port, () => {
    console.log(`Server is running on ${config.HttpType}://localhost:${config.Port}`);
});