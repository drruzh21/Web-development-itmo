var swiper = new Swiper('.swiper', {
    // включаем зацикливание слайдов
    loop: true,

    // настраиваем пагинацию (точки под слайдером)
    pagination: {
        el: '.swiper-pagination',
        clickable: true, // можно кликать по точкам для навигации
    },

    // настраиваем кнопки навигации
    navigation: {
        nextEl: '.swiper-button-next', // кнопка "следующий слайд"
        prevEl: '.swiper-button-prev', // кнопка "предыдущий слайд"
    },

    // устанавливаем количество отображаемых слайдов
    slidesPerView: 1,

    // расстояние между слайдами в пикселях
    spaceBetween: 30,
});
