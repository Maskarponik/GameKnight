document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.querySelector("#gameCanvas");
    const ctx = canvas.getContext("2d");

    function resizeCanvas() {
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;

        // Устанавливаем размеры канваса
        canvas.width = screenWidth;
        canvas.height = screenHeight;

        // Рассчитываем масштаб
        const scaleX = screenWidth / 1920;
        const scaleY = screenHeight / 1080;
        const scale = Math.min(scaleX, scaleY);

        // Центрируем игровую область
        const offsetX = (screenWidth - 1920 * scale) / 2;
        const offsetY = (screenHeight - 1080 * scale) / 2;

        // Применяем масштабирование
        ctx.setTransform(scale, 0, 0, scale, offsetX, offsetY);
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Отрисовываем сцену
        drawScene();
    }

    window.addEventListener("resize", resizeCanvas);

    // Запускаем при загрузке страницы
    resizeCanvas();

    // Пример функции отрисовки
    function drawScene() {
        // Добавьте вашу логику для отрисовки объектов на канвасе
    }
});
