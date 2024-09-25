(function() {
    // при загрузке страницы, делаем замер
    window.addEventListener('load', function() {
        // получаем инфу о навигации страницы
        const [navigationEntry] = window.performance.getEntriesByType('navigation');
        // время до полной загрузки в секундах, округляем до 3 знаков
        const loadTimeInSeconds = (navigationEntry.domContentLoadedEventEnd / 1000).toFixed(3);
        // находим футер, куда вставим время загрузки
        const footer = document.getElementById('load-time');

        // если футер есть
        if (footer) {
            // вставляем текст с временем загрузки
            footer.innerHTML = `Page load time: ${loadTimeInSeconds} seconds`;
        }
    });
})();


// после того как весь HTML загрузится
document.addEventListener("DOMContentLoaded", function() {
    // находим все ссылки в меню
    const navLinks = document.querySelectorAll("nav ul li a");
    // разбираем url страницы и достаем имя файла
    const currentPath = window.location.pathname.split("/").pop();

    // перебираем все ссылки в меню
    navLinks.forEach(link => {
        // если href ссылки совпадает с текущей страницей
        if (link.getAttribute("href") === currentPath) {
            // добавляем класс "active" для выделения
            link.classList.add("active");
        }
    });
});

