require('dotenv').config(); // Загружаем переменные из файла .env
const express = require('express');
const mysql = require('mysql');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();

const corsOptions = {
    origin: 'http://localhost:3000', // Убедитесь, что это правильный адрес вашего фронта
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));

app.use((req, res, next) => {
    console.log('Request headers:', req.headers);  // Логируем заголовки запроса
    next();
});


// Перед всеми маршрутам добавляем этот middleware
app.use(express.json());  // Для обработки JSON тела запросов


app.get('/', (_req, res) => {
    res.send('Server is running');  // Отправляем простое сообщение
});

// Подключение к базе данных MySQL
const db = mysql.createConnection({
    host: '127.0.0.1', // или 'localhost'
    user: 'root',
    password: 'vers123', // Ваш пароль
    database: 'casino',
    port: 3306 // Укажите порт, если используется другой
});

// Подключаемся к базе данных
db.connect(err => {
    if (err) throw err;
    console.log("Connected to MySQL");
});

// Регистрация пользователя
app.post('/register', async (req, res) => {
    console.log('Request body:', req.body);  // Логируем тело запроса

    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        db.query("INSERT INTO users (email, password) VALUES (?, ?)", [email, hashedPassword], (err, result) => {
            if (err) {
                console.error('Error during registration:', err);  // Логирование ошибки
                return res.status(500).json({ message: "Error registering user" });
            }
            res.status(200).json({ message: "User registered", userId: result.insertId });
        });
    } catch (error) {
        console.error('Error hashing password:', error);  // Логирование ошибки
        res.status(500).json({ message: "Error hashing password" });
    }
});

// Авторизация пользователя (проверка пароля)
app.post('/login', (req, res) => {
    console.log('Login request body:', req.body); // Логируем данные, которые приходят на сервер

    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
    }

    db.query("SELECT * FROM users WHERE email = ?", [email], async (err, result) => {
        if (err) return res.status(500).json({ message: 'Error querying database', error: err });
        if (result.length === 0) return res.status(401).json({ message: "Unauthorized" });

        const user = result[0];
        const match = await bcrypt.compare(password, user.password);

        if (match) {
            const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
            res.status(200).json({ message: 'Login successful', token });
        } else {
            res.status(401).json({ message: 'Unauthorized' });
        }
    });
});

// Middleware для проверки токена
const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(401).json({ message: "Access denied" });

    jwt.verify(token.split(" ")[1], process.env.JWT_SECRET || "secretkey", (err, user) => {
        if (err) return res.status(403).json({ message: "Invalid token" });
        req.user = user;
        next();
    });
};

// Получение баланса пользователя (только для авторизованных пользователей)
app.get('/balance', authenticateToken, (req, res) => {
    db.query("SELECT balance FROM users WHERE id = ?", [req.user.userId], (err, result) => {
        if (err) return res.status(500).json({ message: 'Error fetching balance', error: err });
        if (result.length === 0) return res.status(404).json({ message: 'User not found' });
        res.json({ balance: result[0].balance });
    });
});

// Обработка ошибок
app.use((req, res, next) => {
    res.status(404).json({ message: 'Not found' });
});

app.listen(3000, () => console.log("Server running on port 3000"));
