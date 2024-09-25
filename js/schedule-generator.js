// DOMContentLoaded это событие, когда первоначальный html загружен, но без ожидания полной загрузки css. Document Object Model - представляет xml в виде дерева
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('schedule-form');
    const resultContainer = document.getElementById('schedule-result');

    // слушаем сабмит формы
    form.addEventListener('submit', function(e) {
        e.preventDefault(); // это убирает перезагрузку страницы при нажатии на кнопку generate schedule
        generateSchedule();
    });

    // подгружаем сохраненки при загрузке страницы
    loadSavedState();

    // автосейв при изменении параметров
    ['days', 'maxClasses', 'language'].forEach(id => {
        document.getElementById(id).addEventListener('change', saveParameters);
    });



    /* Lab6 */

    const fetchDataBtn = document.getElementById('fetch-data-btn');

    // создаем прелоадер
    const preloader = document.createElement('div');
    preloader.id = 'preloader';
    preloader.innerHTML = 'Loading...';
    preloader.style.display = 'none'; // сначала скрываем
    resultContainer.appendChild(preloader);

    fetchDataBtn.addEventListener('click', function() {
        // показываем прелоадер
        preloader.style.display = 'block';

        // генерим рандомный id от 1 до 200
        const randomId = Math.floor(Math.random() * 200) + 1;
        const url = `https://jsonplaceholder.typicode.com/todos/${randomId}`;

        fetch(url)
            .then(response => {
                // если что-то не так с запросом, кидаем ошибку
                if (!response.ok) {
                    throw new Error('Проблемы с сетью');
                }
                // парсим ответ в json
                return response.json();
            })
            .then(data => {
                // скрываем прелоадер
                preloader.style.display = 'none';

                // кидаем данные в таблицу
                integrateDataIntoTable([data]);  // апи возвращает объект, а не массив
            })
            .catch(error => {
                // если что-то пошло не так, скрываем прелоадер
                preloader.style.display = 'none';

                // выводим сообщение об ошибке
                const errorMsg = document.createElement('div');
                errorMsg.innerHTML = '⚠ Что-то пошло не так.';
                resultContainer.appendChild(errorMsg);
            });
    });

    function integrateDataIntoTable(data) {
        data.forEach(item => {
            // получаем индекс дня (0-4)
            const dayIndex = (item.id % 5);
            // получаем индекс класса (0-9)
            const classIndex = item.userId - 1;

            // ищем нужную ячейку в таблице
            const cellSelector = `.schedule-cell[data-day="${dayIndex}"][data-class="${classIndex}"]`;
            const cell = document.querySelector(cellSelector);

            if (cell) {
                // создаем элемент задачи
                const task = document.createElement('div');
                task.className = 'task';
                // если задача завершена, добавляем класс
                if (item.completed) {
                    task.classList.add('completed');
                }
                // вставляем данные задачи
                task.innerHTML = `
                <textarea maxlength="100">${item.title}</textarea>
                <button class="check-btn">✓</button>
                <button class="delete-btn">×</button>`;

                // если в ячейке уже есть задача, удаляем ее
                const existingTask = cell.querySelector('.task');
                if (existingTask) {
                    cell.removeChild(existingTask);
                }

                // добавляем новую задачу в ячейку
                cell.appendChild(task);

                // навешиваем дефолтные слушатели на элементы задачи
                const textarea = task.querySelector('textarea');
                textarea.addEventListener('input', saveTasks); // сохраняем изменения текста
                task.querySelector('.check-btn').addEventListener('click', (e) => {
                    e.stopPropagation();
                    // переключаем состояние завершенной задачи
                    task.classList.toggle('completed');
                    saveTasks();
                });
                task.querySelector('.delete-btn').addEventListener('click', (e) => {
                    e.stopPropagation();
                    // удаляем задачу из ячейки
                    cell.removeChild(task);
                    saveTasks();
                });
            }
        });

        // сохраняем все задачи в localStorage
        saveTasks();
    }

    /* Lab6 */




    function generateSchedule() {
        // вытаскиваем данные из формы
        const days = parseInt(document.getElementById('days').value);
        const maxClasses = parseInt(document.getElementById('maxClasses').value);
        const language = document.getElementById('language').value;

        // выбираем язык для дней недели
        const daysOfWeek = language === 'en'
            ? ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
            : ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];

        // собираем HTML для таблицы
        // начинаем с заголовков
        let scheduleHtml = '<table class="schedule-table"><thead><tr><th>Day</th>';
        for (let i = 1; i <= maxClasses; i++) {
            scheduleHtml += `<th>Class ${i}</th>`;
        }
        scheduleHtml += '</tr></thead><tbody>';

        // теперь сами данные + день недели в начале из daysOfWeek[i]
        for (let i = 0; i < days; i++) {
            scheduleHtml += `<tr><td>${daysOfWeek[i]}</td>`;
            for (let j = 0; j < maxClasses; j++) {
                scheduleHtml += `<td class="schedule-cell" data-day="${i}" data-class="${j}"></td>`;
            }
            scheduleHtml += '</tr>';
        }
        scheduleHtml += '</tbody></table>';

        // выводим таблицу на страницу
        resultContainer.innerHTML = scheduleHtml;

        // вешаем обработчики на ячейки
        document.querySelectorAll('.schedule-cell').forEach(cell => {
            cell.addEventListener('click', createTask);
        });

        // подгружаем сохраненные таски
        loadTasks();

        // сохраняем параметры
        saveParameters();
    }

    // e - это событие клика
    function createTask(e) {
        const cell = e.target.closest('.schedule-cell');
        if (cell.querySelector('.task')) return; // если таска уже есть, ничего не делаем

        const task = document.createElement('div');
        task.className = 'task';
        task.innerHTML = `
            <textarea maxlength="100" placeholder="Enter task"></textarea>
            <button class="check-btn">✓</button>
            <button class="delete-btn">×</button>
        `;

        cell.appendChild(task);

        // навешиваем обработчики на элементы таски
        const textarea = task.querySelector('textarea');
        textarea.focus(); // это дает возможность сразу писать текст в ячейку и не кликать второй раз
        textarea.addEventListener('input', saveTasks); // когда меняем текст в поле, оно сразу будет сохранять

        // это галочка
        task.querySelector('.check-btn').addEventListener('click', (e) => {
            e.stopPropagation(); // чтобы клик не пошел дальше, здесь он гасится
            task.classList.toggle('completed'); // добавляем или убираем класс completed, от которого зависит стилизация
            saveTasks();
        });

        // это крестик
        task.querySelector('.delete-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            cell.removeChild(task);
            saveTasks();
        });
    }

    // сохраняем параметры в локалсторадж
    function saveParameters() {
        const params = {
            days: document.getElementById('days').value,
            maxClasses: document.getElementById('maxClasses').value,
            language: document.getElementById('language').value
        };
        localStorage.setItem('scheduleParams', JSON.stringify(params));
    }

    // сохраняем таски в локалсторадж
    function saveTasks() {
        const tasks = {};
        document.querySelectorAll('.schedule-cell').forEach(cell => {
            const day = cell.dataset.day; // dataset содержит все атрибуты, начинающиеся с data- это кастомные атрибуты данных
            const classNum = cell.dataset.class;
            const taskElement = cell.querySelector('.task');
            if (taskElement) {
                const taskText = taskElement.querySelector('textarea').value;
                const isCompleted = taskElement.classList.contains('completed');
                tasks[`${day}-${classNum}`] = { text: taskText, completed: isCompleted };
            }
        });
        localStorage.setItem('scheduleTasks', JSON.stringify(tasks));
    }

    // подгружаем сохраненные параметры и генерим расписание
    function loadSavedState() {
        const params = JSON.parse(localStorage.getItem('scheduleParams'));
        if (params) {
            document.getElementById('days').value = params.days;
            document.getElementById('maxClasses').value = params.maxClasses;
            document.getElementById('language').value = params.language;
        }
        generateSchedule();
    }

    // подгружаем сохраненные таски
    function loadTasks() {
        const tasks = JSON.parse(localStorage.getItem('scheduleTasks'));
        if (tasks) {
            Object.entries(tasks).forEach(([key, task]) => {
                const [day, classNum] = key.split('-');
                const cell = document.querySelector(`.schedule-cell[data-day="${day}"][data-class="${classNum}"]`);
                if (cell) {
                    const taskElement = document.createElement('div');
                    taskElement.className = 'task';
                    if (task.completed) taskElement.classList.add('completed');
                    taskElement.innerHTML = `
                        <textarea maxlength="100">${task.text}</textarea>
                        <button class="check-btn">✓</button>
                        <button class="delete-btn">×</button>
                    `;
                    cell.appendChild(taskElement);

                    // навешиваем те же обработчики, что и в createTask
                    taskElement.querySelector('textarea').addEventListener('input', saveTasks);
                    taskElement.querySelector('.check-btn').addEventListener('click', (e) => {
                        e.stopPropagation();
                        taskElement.classList.toggle('completed');
                        saveTasks();
                    });
                    taskElement.querySelector('.delete-btn').addEventListener('click', (e) => {
                        e.stopPropagation();
                        cell.removeChild(taskElement);
                        saveTasks();
                    });
                }
            });
        }
    }
});
