document.addEventListener('DOMContentLoaded', function() {
    // Sovelluksen alustus
    initCalendar();
    loadTodos();
    loadMaterials();
    setupLanguageSwitcher();

    // Lomakkeenkäsittelijät
    document.getElementById('todo-form').addEventListener('submit', addTodo);
    document.getElementById('material-form').addEventListener('submit', addMaterial);
});

// Kalenteri
function initCalendar() {
    const calendarEl = document.getElementById('calendar');
    const days = ['Su', 'Ma', 'Ti', 'Ke', 'To', 'Pe', 'La'];
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    // Kalenterin otsikko
    const monthNames = [
        'Tammikuu', 'Helmikuu', 'Maaliskuu', 'Huhtikuu', 'Toukokuu', 'Kesäkuu',
        'Heinäkuu', 'Elokuu', 'Syyskuu', 'Lokakuu', 'Marraskuu', 'Joulukuu'
    ];
    
    const header = document.createElement('div');
    header.className = 'calendar-header';
    header.textContent = `${monthNames[currentMonth]} ${currentYear}`;
    calendarEl.appendChild(header);
    
    // Viikonpäivät
    days.forEach(day => {
        const dayEl = document.createElement('div');
        dayEl.textContent = day;
        dayEl.style.fontWeight = 'bold';
        calendarEl.appendChild(dayEl);
    });
    
    // Kuukauden ensimmäinen päivä
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    
    // Päivien lukumäärä kuukaudessa
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    
    // Tyhjät solut kuukauden alussa
    for (let i = 0; i < firstDay; i++) {
        const emptyEl = document.createElement('div');
        emptyEl.className = 'calendar-day';
        calendarEl.appendChild(emptyEl);
    }
    
    // Kuukauden päivät
    for (let i = 1; i <= daysInMonth; i++) {
        const dayEl = document.createElement('div');
        dayEl.className = 'calendar-day';
        dayEl.textContent = i;
        
        // Tarkista tapahtumat
        if (hasEventsOnDate(new Date(currentYear, currentMonth, i))) {
            dayEl.classList.add('has-event');
        }
        
        // Nykypäivä
        if (i === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear()) {
            dayEl.style.border = '2px solid ' + getComputedStyle(document.documentElement).getPropertyValue('--accent-color');
        }
        
        calendarEl.appendChild(dayEl);
    }
}

function hasEventsOnDate(date) {
    // Tarkistetaan tämän päivämäärän tehtäviä
    const todos = JSON.parse(localStorage.getItem('todos')) || [];
    return todos.some(todo => {
        if (!todo.date) return false;
        const todoDate = new Date(todo.date);
        return todoDate.toDateString() === date.toDateString();
    });
}

// To-Do List
function addTodo(e) {
    e.preventDefault();
    
    const input = document.getElementById('todo-input');
    const dateInput = document.getElementById('todo-date');
    
    const todo = {
        id: Date.now(),
        text: input.value,
        completed: false,
        date: dateInput.value
    };
    
    const todos = JSON.parse(localStorage.getItem('todos')) || [];
    todos.push(todo);
    localStorage.setItem('todos', JSON.stringify(todos));
    
    input.value = '';
    dateInput.value = '';
    
    renderTodo(todo);
}

function loadTodos() {
    const todos = JSON.parse(localStorage.getItem('todos')) || [];
    todos.forEach(renderTodo);
}

function renderTodo(todo) {
    const list = document.getElementById('todo-list');
    
    const li = document.createElement('li');
    li.dataset.id = todo.id;
    if (todo.completed) li.classList.add('completed');
    
    const textSpan = document.createElement('span');
    textSpan.textContent = todo.text;
    if (todo.date) {
        const date = new Date(todo.date);
        textSpan.textContent += ` (${date.toLocaleDateString('fi-FI')})`;
    }
    
    const buttonsDiv = document.createElement('div');
    
    const completeBtn = document.createElement('button');
    completeBtn.textContent = todo.completed ? '✔' : '◻';
    completeBtn.addEventListener('click', () => toggleTodoComplete(todo.id));
    
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = '✖';
    deleteBtn.addEventListener('click', () => deleteTodo(todo.id));
    
    buttonsDiv.appendChild(completeBtn);
    buttonsDiv.appendChild(deleteBtn);
    
    li.appendChild(textSpan);
    li.appendChild(buttonsDiv);
    
    list.appendChild(li);
}

function toggleTodoComplete(id) {
    const todos = JSON.parse(localStorage.getItem('todos')) || [];
    const updatedTodos = todos.map(todo => {
        if (todo.id === id) {
            return { ...todo, completed: !todo.completed };
        }
        return todo;
    });
    
    localStorage.setItem('todos', JSON.stringify(updatedTodos));
    
    // Uudelleen piirtäminen
    document.getElementById('todo-list').innerHTML = '';
    loadTodos();
}

function deleteTodo(id) {
    const todos = JSON.parse(localStorage.getItem('todos')) || [];
    const updatedTodos = todos.filter(todo => todo.id !== id);
    localStorage.setItem('todos', JSON.stringify(updatedTodos));
    
    // Uudelleen piirtäminen
    document.getElementById('todo-list').innerHTML = '';
    loadTodos();
}

// Materiaalit
function addMaterial(e) {
    e.preventDefault();
    
    const titleInput = document.getElementById('material-title');
    const linkInput = document.getElementById('material-link');
    const notesInput = document.getElementById('material-notes');
    
    const material = {
        id: Date.now(),
        title: titleInput.value,
        link: linkInput.value,
        notes: notesInput.value,
        date: new Date().toISOString()
    };
    
    const materials = JSON.parse(localStorage.getItem('materials')) || [];
    materials.push(material);
    localStorage.setItem('materials', JSON.stringify(materials));
    
    titleInput.value = '';
    linkInput.value = '';
    notesInput.value = '';
    
    renderMaterial(material);
}

function loadMaterials() {
    const materials = JSON.parse(localStorage.getItem('materials')) || [];
    materials.forEach(renderMaterial);
}

function renderMaterial(material) {
    const list = document.getElementById('materials-list');
    
    const materialEl = document.createElement('div');
    materialEl.className = 'material-item';
    materialEl.dataset.id = material.id;
    
    const titleEl = document.createElement('h3');
    titleEl.textContent = material.title;
    
    const dateEl = document.createElement('p');
    dateEl.textContent = new Date(material.date).toLocaleDateString('fi-FI');
    dateEl.style.fontSize = '0.8em';
    dateEl.style.color = '#666';
    
    const notesEl = document.createElement('p');
    notesEl.textContent = material.notes;
    
    const linkEl = document.createElement('a');
    if (material.link) {
        linkEl.href = material.link;
        linkEl.textContent = 'Avaa linkki';
        linkEl.target = '_blank';
        linkEl.style.display = 'inline-block';
        linkEl.style.marginTop = '10px';
        linkEl.style.color = getComputedStyle(document.documentElement).getPropertyValue('--secondary-color');
    }
    
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Poista';
    deleteBtn.style.marginTop = '10px';
    deleteBtn.addEventListener('click', () => deleteMaterial(material.id));
    
    materialEl.appendChild(titleEl);
    materialEl.appendChild(dateEl);
    materialEl.appendChild(notesEl);
    if (material.link) materialEl.appendChild(linkEl);
    materialEl.appendChild(deleteBtn);
    
    list.appendChild(materialEl);
}

function deleteMaterial(id) {
    const materials = JSON.parse(localStorage.getItem('materials')) || [];
    const updatedMaterials = materials.filter(material => material.id !== id);
    localStorage.setItem('materials', JSON.stringify(updatedMaterials));
    
    // Uudelleen piirtäminen
    document.getElementById('materials-list').innerHTML = '';
    loadMaterials();
}

// Vaihda kieltä
function setupLanguageSwitcher() {
    document.getElementById('fi').addEventListener('click', () => changeLanguage('fi'));
    document.getElementById('en').addEventListener('click', () => changeLanguage('en'));
}

function changeLanguage(lang) {
    const translations = {
        'fi': {
            'calendar': 'Kalenteri',
            'tasks': 'Tehtävät',
            'add': 'Lisää',
            'materials': 'Materiaalit',
            'add-material': 'Lisää materiaali',
            'footer': 'Opiskelukaveri - Sinun opiskeluaikasi apuri'
        },
        'en': {
            'calendar': 'Calendar',
            'tasks': 'Tasks',
            'add': 'Add',
            'materials': 'Materials',
            'add-material': 'Add material',
            'footer': 'Study Buddy - Your study time assistant'
        },
    };
    
    document.querySelectorAll('[data-translate]').forEach(el => {
        const key = el.getAttribute('data-translate');
        el.textContent = translations[lang][key];
    });
    
    // Paikkamerkkien päivittäminen
    if (lang === 'fi') {
        document.getElementById('todo-input').placeholder = 'Lisää uusi tehtävä...';
        document.getElementById('material-title').placeholder = 'Materiaalin otsikko...';
        document.getElementById('material-notes').placeholder = 'Muistiinpanot...';
    } else if (lang === 'en') {
        document.getElementById('todo-input').placeholder = 'Add new task...';
        document.getElementById('material-title').placeholder = 'Material title...';
        document.getElementById('material-notes').placeholder = 'Notes...';
    }
}