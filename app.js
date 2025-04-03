// Переключение между формами
document.getElementById('show-register').addEventListener('click', function(e) {
    e.preventDefault();
    document.getElementById('login-form-container').style.display = 'none';
    document.getElementById('register-form-container').style.display = 'block';
});

document.getElementById('show-login').addEventListener('click', function(e) {
    e.preventDefault();
    document.getElementById('register-form-container').style.display = 'none';
    document.getElementById('login-form-container').style.display = 'block';
});

// Обработка логина
document.getElementById('login-form').addEventListener('submit', async function(e) {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    console.log('Sending login request:', { email, password }); // Логируем отправляемые данные

    try {
        const response = await fetch('http://localhost:3000/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })  // Отправляем данные в теле запроса
        });

        const data = await response.json();

        if (response.status === 200) {
            console.log('Login successful', data);
            window.location.href = "slots.html";  // Перенаправление на страницу со слотами
        } else {
            console.log('Login failed', data);
            document.getElementById('error-message').style.display = 'block';
        }
    } catch (error) {
        console.error('Error during login:', error);
    }
});



// Обработка регистрации
document.getElementById('register-form').addEventListener('submit', async function(e) {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('new-password').value;

    // Логируем данные перед отправкой
    console.log('Registration Data:', { email, password });

    try {
        const response = await fetch('http://localhost:3000/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();
        console.log('Registration response:', data);

        if (response.status === 200 && data.message === "User registered") {
            console.log('Registration successful');
            window.location.href = "login.html";  // Перенаправить на страницу логина
        } else {
            console.log('Registration failed', data);
            document.getElementById('error-message').style.display = 'block';
        }
    } catch (error) {
        console.error('Error during registration:', error);
    }
});

// Пример для слота
const slotSymbols = ['🍒', '🍋', '🍊', '🍇', '🍉'];  // Символы для слота

function spin() {
    const bet = document.getElementById('bet').value;
    const result = document.getElementById('result');

    // Генерация случайных символов
    const slot1 = slotSymbols[Math.floor(Math.random() * slotSymbols.length)];
    const slot2 = slotSymbols[Math.floor(Math.random() * slotSymbols.length)];
    const slot3 = slotSymbols[Math.floor(Math.random() * slotSymbols.length)];

    // Отображаем результат
    document.getElementById('slot1').innerText = slot1;
    document.getElementById('slot2').innerText = slot2;
    document.getElementById('slot3').innerText = slot3;

    // Логика выигрыша
    if (slot1 === slot2 && slot2 === slot3) {
        result.innerText = `Поздравляем! Вы выиграли ${bet * 10} монет!`;
    } else {
        result.innerText = `Попробуйте снова.`;
    }
}
