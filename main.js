document.addEventListener('DOMContentLoaded', init);

function init() {
    renderNavbar();
    route();
    window.addEventListener('hashchange', route);
    if (!window.location.hash) {
        renderHome(document.getElementById('content'));
    }

    const footer = document.createElement('footer');
    footer.innerHTML = '&copy; 2023 Erik Marku';
    document.body.appendChild(footer);
}

function renderNavbar() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    let navbarLinks = '';
    if (currentUser) {
        navbarLinks = `
            <a href="#planner">Ferien planen</a>
            <a href="#scheduled">Geplante Ferien</a>
            ${window.location.hash === '#planner' ? '' : '<a href="#logout" style="color: red;">Abmelden</a>'}
        `;
    }
    document.getElementById('root').innerHTML = `<nav>${navbarLinks}</nav>`;
}

function route() {
    const path = window.location.hash;
    const contentDiv = document.getElementById('content') || createContentDiv();
    const routes = {
        '#home': renderHome,
        '#login': renderLogin,
        '#register': renderRegister,
        '#planner': renderHolidays,
        '#scheduled': renderScheduledHolidays,
        '#logout': handleLogout
    };
    (routes[path] || renderHome)(contentDiv);
}

function createContentDiv() {
    const contentDiv = document.createElement('div');
    contentDiv.id = 'content';
    document.body.appendChild(contentDiv);
    return contentDiv;
}

function renderHome(root) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));

    if (currentUser) {
        root.innerHTML = `
            <div class="welcome-box">
                <h1>Willkommen zurück, ${currentUser.username}!</h1>
                <p>Hier können Sie Ihre Ferien planen!</p>
                <button onclick="window.location.hash='#planner'">Ferien planen</button>
                <button onclick="window.location.hash='#scheduled'">Geplante Ferien anzeigen</button>
                <button onclick="window.location.hash='#logout'">Abmelden</button>
            </div>
        `;
    } else {
        root.innerHTML = `
            <div class="welcome-box">
                <h1>Willkommen auf unserer Webseite!</h1>
                <p>Wollen Sie sich anmelden oder registrieren?</p>
                <button onclick="window.location.hash='#login'">Anmelden</button>
                <button onclick="window.location.hash='#register'">Registrieren</button>
            </div>
        `;
    }
}

function renderLogin(root) {
    root.innerHTML = `
        <div class="form-box">
            <h2>Anmelden</h2>
            <form id="login-form">
                <input type="text" id="username" placeholder="Benutzername" required>
                <input type="password" id="password" placeholder="Passwort" required>
                <button type="submit">Anmelden</button>
            </form>
            <a href="#register">Registrieren</a>
        </div>
    `;

    document.getElementById('login-form').addEventListener('submit', handleLogin);
}

function renderRegister(root) {
    root.innerHTML = `
        <div class="form-box">
            <h2>Registrieren</h2>
            <form id="register-form">
                <input type="text" id="new-username" placeholder="Benutzername" required>
                <input type="password" id="new-password" placeholder="Passwort (mindestens 8 Zeichen)" required>
                <button type="submit">Registrieren</button>
            </form>
            <a href="#login">Bereits registriert? Anmelden</a>
        </div>
    `;

    document.getElementById('register-form').addEventListener('submit', handleRegister);
}

function renderHolidays(root) {
    const holidayFormHTML = `
        <div class="add-holiday-box">
            <h2>Ferien hinzufügen</h2>
            <form id="add-holiday-form">
                <input type="text" id="holiday-name" placeholder="Ferienname" required>
                <input type="date" id="holiday-start-date" required>
                <input type="date" id="holiday-end-date" required>
                <button type="submit">Hinzufügen</button>
            </form>
        </div>
    `;

    root.innerHTML = holidayFormHTML;

    document.getElementById('add-holiday-form').addEventListener('submit', handleAddHoliday);
}

function renderScheduledHolidays(root) {
    root.innerHTML = `
        <div id="scheduled-holidays-list"></div>
    `;

    displayScheduledHolidays();
}

function handleLogout() {
    localStorage.removeItem('currentUser');
    alert("Sie wurden erfolgreich abgemeldet.");
    window.location.hash = '#home';
    renderNavbar();
}

function handleLogin(event) {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const userData = JSON.parse(localStorage.getItem('user_' + username));

    if (userData && userData.password === password) {
        alert("Anmeldung erfolgreich!");

        localStorage.setItem('currentUser', JSON.stringify({ username }));

        window.location.hash = '#home';
        renderNavbar();
    } else {
        alert("Falscher Benutzername oder Passwort");
    }
}

function handleRegister(event) {
    event.preventDefault();

    const newUsername = document.getElementById('new-username').value;
    const newPassword = document.getElementById('new-password').value;

    if (newUsername.length === 0 || newPassword.length < 8) {
        alert("Bitte geben Sie einen gültigen Benutzernamen und ein Passwort mit mindestens 8 Zeichen ein.");
        return;
    }

    if (localStorage.getItem('user_' + newUsername)) {
        alert("Dieser Benutzername ist bereits vergeben. Bitte wählen Sie einen anderen.");
        return;
    }

    const userData = {
        username: newUsername,
        password: newPassword
    };
    localStorage.setItem('user_' + newUsername, JSON.stringify(userData));

    alert("Registrierung erfolgreich! Sie können sich jetzt anmelden.");
    window.location.hash = '#login';
}


function handleAddHoliday(event) {
    event.preventDefault();
    const name = document.getElementById('holiday-name').value;
    const startDate = document.getElementById('holiday-start-date').value;
    const endDate = document.getElementById('holiday-end-date').value;

    if (!validateDates(startDate, endDate)) {
        return;
    }

    if (isHolidayConflict(startDate, endDate)) {
        alert("Es sind bereits Ferien für diesen Zeitraum geplant.");
        return;
    }

    if (isPastDate(startDate)) {
        alert("Ferien können nicht in der Vergangenheit geplant werden.");
        return;
    }

    const currentUser = JSON.parse(localStorage.getItem('currentUser'));

    const newHoliday = {
        name,
        startDate,
        endDate
    };

    const userHolidays = JSON.parse(localStorage.getItem('user_' + currentUser.username + '_holidays')) || [];

    userHolidays.push(newHoliday);

    localStorage.setItem('user_' + currentUser.username + '_holidays', JSON.stringify(userHolidays));

    alert("Ferien erfolgreich hinzugefügt!");
    window.location.hash = '#scheduled';
}

function validateDates(startDate, endDate) {
    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);

    return startDateObj < endDateObj;
}


function isHolidayConflict(startDate, endDate, ignoreIndex = -1) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const userHolidays = JSON.parse(localStorage.getItem('user_' + currentUser.username + '_holidays')) || [];

    for (let i = 0; i < userHolidays.length; i++) {
        if (i === ignoreIndex) continue;

        const holiday = userHolidays[i];
        const holidayStartDate = new Date(holiday.startDate);
        const holidayEndDate = new Date(holiday.endDate);

        const newStartDate = new Date(startDate);
        const newEndDate = new Date(endDate);

        if (
            (newStartDate >= holidayStartDate && newStartDate <= holidayEndDate) ||
            (newEndDate >= holidayStartDate && newEndDate <= holidayEndDate) ||
            (newStartDate <= holidayStartDate && newEndDate >= holidayEndDate)
        ) {
            return true;
        }
    }

    return false;
}


function isPastDate(date) {
    const currentDate = new Date();
    const selectedDate = new Date(date);

    return selectedDate < currentDate;
}

function displayScheduledHolidays() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const userHolidays = JSON.parse(localStorage.getItem('user_' + currentUser.username + '_holidays')) || [];
    const holidaysList = document.getElementById('scheduled-holidays-list');
    holidaysList.innerHTML = '';

    if (userHolidays.length === 0) {
        holidaysList.innerHTML = '<p>Keine geplanten Ferien.</p>';
        return;
    }

    userHolidays.forEach((holiday, index) => {
        const holidayItem = document.createElement('div');
        holidayItem.className = 'holiday-item';
        holidayItem.innerHTML = `
            <h3>${holiday.name}</h3>
            <p>Startdatum: ${holiday.startDate}</p>
            <p>Enddatum: ${holiday.endDate}</p>
            <button onclick="handleEditHoliday(${index})">Bearbeiten</button>
            <button onclick="handleDeleteHoliday(${index})">Löschen</button>
        `;
        holidaysList.appendChild(holidayItem);
    });
}

function handleEditHoliday(index) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const userHolidays = JSON.parse(localStorage.getItem('user_' + currentUser.username + '_holidays')) || [];

    if (index >= 0 && index < userHolidays.length) {
        const holiday = userHolidays[index];

        const newName = prompt('Neuer Ferienname (leer lassen, um den Namen beizubehalten):', holiday.name);
        if (newName === null) {
            return;
        }

        const newStartDate = prompt('Neues Startdatum:', holiday.startDate);
        const newEndDate = prompt('Neues Enddatum:', holiday.endDate);

        if (newStartDate !== null && newEndDate !== null) {
            if (newName !== '') {
                holiday.name = newName;
            }
    
            if (!validateDates(newStartDate, newEndDate)) {
                alert("Ungültige Daten: Das Startdatum muss vor dem Enddatum liegen.");
                return;
            }
    
            if (isHolidayConflict(newStartDate, newEndDate, index)) {
                alert("Ungültige Daten: Es sind bereits Ferien für diesen Zeitraum geplant.");
                return;
            }

            if (isPastDate(newStartDate)) {
                alert("Ungültige Daten: Ferien können nicht in der Vergangenheit geplant werden.");
                return;
            }

            holiday.startDate = newStartDate;
            holiday.endDate = newEndDate;
            localStorage.setItem('user_' + currentUser.username + '_holidays', JSON.stringify(userHolidays));
            displayScheduledHolidays();
        }
    }
}

function handleDeleteHoliday(index) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const userHolidays = JSON.parse(localStorage.getItem('user_' + currentUser.username + '_holidays')) || [];

    if (index >= 0 && index < userHolidays.length) {
        const confirmDelete = confirm('Sind Sie sicher, dass Sie diese Ferien löschen möchten?');
        if (confirmDelete) {
            userHolidays.splice(index, 1);
            localStorage.setItem('user_' + currentUser.username + '_holidays', JSON.stringify(userHolidays));
            displayScheduledHolidays();
        }
    }
}
