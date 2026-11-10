// ==========================================
// 1. ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ И НАСТРОЙКИ
// ==========================================
let allLoadedData1C = []; 
let allLoadedDataSED = []; 
let currentFiltered1C = []; 
let currentFilteredSED = []; 
let currentGlobalPeriod = 'all'; 
let prevStartDate = new Date(0);
let prevEndDate = new Date(0);

let modalChartInstance = null; 
let sedChartInstance = null;
let deptBarChartInstance = null; 
let sedGeneralChartInstance = null;
let sedEmployeesChartInstance = null;
let dynamicsChart1CInstance = null;
let dynamicsChartSEDInstance = null;
let heatmapChart1CInstance = null;
let heatmapChartSEDInstance = null;
let heatmapChartSoglasInstance = null;
let heatmapChartPerenosInstance = null;
let soglasSpeedChartInstance = null;
let soglasEmpChartInstance = null;
let perenosEmployeesChartInstance = null;
let currentModalEmp = null;
let currentModalPeriod = 'global';
let globalDocTypes = {};
let globalTotalDocs = 0;
// Палитра цветов для аватарок
const AVATAR_COLORS = [
    '#E74C3C', // Красный
    '#3498DB', // Синий
    '#2ECC71', // Зеленый
    '#9B59B6', // Фиолетовый
    '#F39C12', // Оранжевый
    '#1ABC9C', // Бирюзовый
    '#E91E63', // Розовый
    '#607D8B', // Серо-голубой
    '#8E44AD', // Темно-фиолетовый
    '#D35400'  // Тыквенный
];
const ORG_PREFIXES = {
    'ТЗ': 'ООО "Транзит"', 'ПР': 'АО "Покровский рудник"', 'МР': 'ООО "Маломырский рудник"',
    'АР': 'ООО "Албынский рудник"', 'АА': 'ООО "АВТ-Амур"', 'ТМ': 'ООО "ТЭМИ"',
    'КС': 'ООО "Капстрой"', 'РГ': 'НПГФ "Регис"', 'БЗ': 'ООО "БРМЗ"',
    'АМ': 'ООО "Атлас Майнинг"', 'АК': 'Авиакомпания "Вертикаль"', 'ТК': 'ООО "Токурский рудник"',
    'АИ': 'АО "А-Инжиниринг"', 'БМ': 'АО "Бамское"', 'АГ': 'ООО "Амурское ГРП"', 
    'ОС': 'ООО "Осипкан"', 'ПГК': 'ЧНПОУ "Покровский горный колледж"' // <-- ДОБАВИЛИ ПГК
};

const ORG_COLORS = [
    '#3498DB', '#2ECC71', '#E74C3C', '#F1C40F', '#9B59B6', '#1ABC9C', 
    '#E67E22', '#34495E', '#FF7F50', '#8BC34A', '#5F27CD', '#A0522D', 
    '#00D2D3', '#FF9800', '#607D8B', '#E84393', '#795548' // <-- ДОБАВИЛИ 17-Й ЦВЕТ
];

// Функция для выбора цвета на основе имени (чтобы цвет не менялся)
function getAvatarColor(name) {
    if (!name) return AVATAR_COLORS[0];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % AVATAR_COLORS.length;
    return AVATAR_COLORS[index];
}

// --- НАСТРОЙКА ОГРАНИЧЕНИЯ ПО ГОДАМ ---
const MIN_ALLOWED_YEAR = 2026; 

// ЖЕСТКИЙ СПРАВОЧНИК ЦВЕТОВ ДЛЯ ТИПОВ ДОКУМЕНТОВ
const DOC_COLORS = {
    "Реестр заявок на оплату": "#3498DB",
    "Заявка на оплату": "#2ECC71",
    "Отгрузка ТМЦ от поставщика": "#E74C3C",
    "Поступление ТМЦ и услуг": "#F1C40F",
    "Заказ поставщику": "#9B59B6",
    "Закрытие позиций заявок ДМТС": "#E67E22",
    "Корректировка заказа поставщику": "#1ABC9C",
    "Корректировка долга": "#34495E",
    "Корректировка заявки ДМТС": "#FF7F50",
    "Корректировка заявок на оплату": "#8BC34A",
    "Согласование строк потребности": "#5F27CD",
    "Перенос срока поставки": "#A0522D",
    "Договоры контрагентов": "#00D2D3",
    "Заявка ДМТС": "#FF9800",
    "Заявка на добавление/изменение записи справочника": "#607D8B",
    "Перемещение ОЗ ТМЦ": "#E84393",
    "Доставка ТМЦ": "#00B894",
    "Дислокация вагонов": "#6C5CE7",
    "Закрытие заказов поставщикам": "#16A085",
    "Списание ТМЦ": "#D35400"
};

const fallbackPalette = ['#95A5A6', '#7F8C8D', '#BDC3C7', '#D1D8E0', '#778BEB'];
const docColorMap = {};

const jobTitles = {
    "Абакумов Дмитрий Алексеевич": "Ведущий специалист",
    "Кононова Анастасия Дмитриевна": "Ведущий специалист",
    "Кононов Олег Викторович": "Ведущий специалист",
    "Игнатюк Яна Сергеевна": "Ведущий специалист",
    "Васильева Татьяна Владимировна": "Ведущий специалист",
    "Плигина Мария Валерьевна": "Ведущий специалист",
    "Карпова Наталья Викторовна": "Ведущий специалист",
    "Дашкевич Алина Максимовна": "Ведущий экономист",
    "Полищук Татьяна Николаевна": "Ведущий экономист",
    "Родионова Ольга Вячеславовна": "Руководитель"
};
// Маппинг департаментов на кураторов (если в 1С куратор не указан)
const DEPT_TO_CURATOR = {
    "ДМТС (Москва)": "Кононова Анастасия Дмитриевна", // ЗАМЕНИ НА РЕАЛЬНЫЕ ДАННЫЕ
    "ДМТС (ТР)": "Дашкевич Алина Максимовна",
    "ДМТС (АК)": "Васильева Татьяна Владимировна",
    "ДКС (Капстрой)": "Кононов Олег Викторович",
    "ДМТС (АА)": "Васильева Татьяна Владимировна",
    "ДМТС (АР)": "Дашкевич Алина Максимовна",
    "ДМТС (БЗ)": "Васильева Татьяна Владимировна",
    "ДМТС (Благовещенск)": "Абакумов Дмитрий Алексеевич",
    "ДМТС (МР)": "Васильева Татьяна Владимировна",
    "ДМТС (ПГК)": "Игнатюк Яна Сергеевна",
    "ДМТС (ПР)": "Плигина Мария Валерьевна",
    "ДМТС (РГ)": "Игнатюк Яна Сергеевна",
    "ДМТС (ТР)": "Игнатюк Яна Сергеевна",
    "ДОП": "Кононов Олег Викторович"
};

const birthdays = {
    "Родионова Ольга Вячеславовна": "28.01.1979",
    "Дашкевич Алина Максимовна": "21.06.1999",
    "Полищук Татьяна Николаевна": "30.11.1982",
    "Карпова Наталья Викторовна": "22.01.1984",
    "Абакумов Дмитрий Алексеевич": "25.08.2002",
    "Кононов Олег Викторович": "27.10.2000",
    "Кононова Анастасия Дмитриевна": "18.03.1998",
    "Игнатюк Яна Сергеевна": "05.07.1991",
    "Васильева Татьяна Владимировна": "17.05.1983",
    "Плигина Мария Валерьевна": "18.04.1989"
};

const monthNamesGenitive = ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"];
let currentCalendarDate = new Date(); 

// ==========================================
// 2. ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// ==========================================
function getTextColor() {
    return document.body.classList.contains('dark-theme') ? '#B0B0B0' : '#333';
}

function getDisciplineColor(discipline) {
    if (discipline >= 95) return '#2E7D32';
    if (discipline >= 90) return '#D4AC0D';
    if (discipline >= 85) return '#F39C12';
    if (discipline >= 80) return '#D35400';
    return '#C0392B';
}

function getShortName(fullName) {
    if (!fullName) return '';
    return String(fullName).trim().toLowerCase().split(/\s+/)[0].replace(/[^a-zа-яё]/g, '');
}

function getAgeSuffix(age) {
    let lastDigit = age % 10;
    let lastTwoDigits = age % 100;
    if (lastTwoDigits >= 11 && lastTwoDigits <= 14) return 'лет';
    if (lastDigit === 1) return 'год';
    if (lastDigit >= 2 && lastDigit <= 4) return 'года';
    return 'лет';
}

function parseExcelDate(dateValue) {
    if (!dateValue || dateValue === 'NaT' || dateValue === 'nan') return null;
    if (dateValue instanceof Date) return dateValue;
    if (typeof dateValue === 'number') return new Date(Math.round((dateValue - 25569) * 86400 * 1000));
    let str = String(dateValue).trim();
    if (str === '' || str === 'NaT' || str === 'nan') return null;
    const isoMatch = str.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (isoMatch) return new Date(isoMatch[1], isoMatch[2] - 1, isoMatch[3]);
    const ruMatch = str.match(/^(\d{2})\.(\d{2})\.(\d{4})/);
    if (ruMatch) return new Date(ruMatch[3], ruMatch[2] - 1, ruMatch[1]);
    const d = new Date(str);
    return isNaN(d.getTime()) ? null : d;
}

function parseLocalDate(dateString) {
    if (!dateString) return null;
    const [year, month, day] = dateString.split('-');
    return new Date(year, month - 1, day);
}
// Парсер для дат отпусков из baked-данных (формат "YYYY-MM-DD")
// Использует ЛОКАЛЬНЫЙ часовой пояс, а не UTC
function parseISOLocal(s) {
    if (!s) return null;
    const [y, m, d] = s.split('-').map(Number);
    return new Date(y, m - 1, d);
}

// ==========================================
// 3. ПЛАГИНЫ ДЛЯ ГРАФИКОВ
// ==========================================
const barLabelsPlugin = {
    id: 'barLabels',
    afterDatasetsDraw(chart) {
        const { ctx } = chart;
        ctx.save();
        chart.getDatasetMeta(0).data.forEach((datapoint, index) => {
            const value = chart.data.datasets[0].data[index];
            if (!value) return; 
            ctx.fillStyle = getTextColor();
            ctx.font = 'bold 13px Arial';
            if (chart.options.indexAxis === 'y') {
                ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
                ctx.fillText(value, datapoint.x + 8, datapoint.y);
            } else {
                ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
                ctx.fillText(value, datapoint.x, datapoint.y - 8);
            }
        });
        ctx.restore();
    }
};

// Плагин для отображения суммы над столбцом (для stacked bar)
const stackedBarTotalPlugin = {
    id: 'stackedBarTotal',
    afterDatasetsDraw(chart) {
        const { ctx } = chart;
        ctx.save();
        const labelsCount = chart.data.labels.length;
        
        for (let i = 0; i < labelsCount; i++) {
            let total = 0;
            let topY = null;

            // Ищем верхнюю точку столбца
            for (let j = chart.data.datasets.length - 1; j >= 0; j--) {
                let val = chart.data.datasets[j].data[i];
                if (val > 0) {
                    total += val;
                    if (topY === null) {
                        const meta = chart.getDatasetMeta(j);
                        if (meta.data[i]) topY = meta.data[i].y;
                    }
                }
            }
            
            // Если есть данные, пишем сумму над столбцом
            if (total > 0 && topY !== null) {
                const metaX = chart.getDatasetMeta(0).data[i].x;
                ctx.fillStyle = getTextColor();
                ctx.font = 'bold 13px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'bottom';
                ctx.fillText(total, metaX, topY - 8);
            }
        }
        ctx.restore();
    }
};

const sedCenterTextPlugin = {
    id: 'sedCenterText',
    afterDatasetsDraw(chart) {
        const { ctx } = chart;
        ctx.save();
        const text = chart.config.options.plugins.sedCenterText.value;
        const color = chart.config.options.plugins.sedCenterText.color;
        const meta = chart.getDatasetMeta(0);
        if (!meta.data || meta.data.length === 0) return;
        const centerX = meta.data[0].x; 
        const centerY = meta.data[0].y;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = 'bold 26px Arial';
        ctx.fillStyle = color;
        ctx.fillText(text, centerX, centerY);
        ctx.restore();
    }
};

const doughnutLabelsPlugin = {
    id: 'doughnutLabels',
    afterDatasetsDraw(chart) {
        const { ctx } = chart;
        ctx.save();
        const meta = chart.getDatasetMeta(0);
        const data = chart.data.datasets[0].data;
        const total = data.reduce((a, b) => a + b, 0);
        
        if (total === 0) return;
        
        meta.data.forEach((element, index) => {
            const value = data[index];
            if (value === 0) return;
            
            const percentage = Math.round((value / total) * 100);
            if (percentage < 5) return; // Не рисуем текст на слишком маленьких кусочках
            
            // Получаем координаты центра сегмента
            const position = element.tooltipPosition();
            
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 13px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            // Добавляем легкую тень для читаемости
            ctx.shadowColor = 'rgba(0,0,0,0.5)';
            ctx.shadowBlur = 3;
            
            ctx.fillText(`${percentage}%`, position.x, position.y);
        });
        ctx.restore();
    }
};

const stackedBarLabelsPlugin = {
    id: 'stackedBarLabels',
    afterDatasetsDraw(chart) {
        const { ctx } = chart;
        ctx.save();
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = 'bold 11px Arial';
        ctx.fillStyle = '#fff'; 
        const datasets = chart.data.datasets;
        const labelsCount = chart.data.labels.length;
        for (let i = 0; i < labelsCount; i++) {
            let totalForRow = 0;
            for (let j = 0; j < datasets.length; j++) totalForRow += datasets[j].data[i];
            for (let j = 0; j < datasets.length; j++) {
                const val = datasets[j].data[i];
                if (val > 0 && totalForRow > 0) {
                    const percentage = Math.round((val / totalForRow) * 100);
                    const meta = chart.getDatasetMeta(j);
                    const bar = meta.data[i];
                    if (bar && bar.x !== undefined && bar.y !== undefined) {
                        const midX = bar.base + (bar.x - bar.base) / 2;
                        const midY = bar.y;
                        if (Math.abs(bar.x - bar.base) > 30) ctx.fillText(`${val} (${percentage}%)`, midX, midY);
                    }
                }
            }
        }
        ctx.restore();
    }
};

const lineLabelsPlugin = {
    id: 'lineLabels',
    afterDatasetsDraw(chart) {
        const { ctx } = chart;
        ctx.save();
        chart.data.datasets.forEach((dataset, i) => {
            chart.getDatasetMeta(i).data.forEach((datapoint, index) => {
                const value = dataset.data[index];
                if (!value) return; 
                ctx.fillStyle = getTextColor();
                ctx.font = 'bold 12px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'bottom';
                ctx.fillText(value, datapoint.x, datapoint.y - 10);
            });
        });
        ctx.restore();
    }
};

// ==========================================
// 4. ЧТЕНИЕ ФАЙЛОВ
// ==========================================
const excelInput = document.getElementById('excel-file');
if (excelInput && typeof XLSX !== 'undefined') {
    excelInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = function(e) {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, {type: 'array', cellDates: true});
            const worksheet = workbook.Sheets[workbook.SheetNames[0]];
            let json = XLSX.utils.sheet_to_json(worksheet);
            
            json = json.filter(row => {
                const keys = Object.keys(row);
                let dateKey = keys.find(k => k.trim().toLowerCase().includes('дата'));
                if (dateKey) row._parsedDate = parseExcelDate(row[dateKey]);
                if (row._parsedDate && row._parsedDate.getFullYear() < MIN_ALLOWED_YEAR) return false;
                return true;
            });

            allLoadedData1C = json; 
            calculateYearlyTotal();
            updateStatus();
        };
        reader.readAsArrayBuffer(file);
    });
}

const sedInput = document.getElementById('sed-file');
if (sedInput && typeof XLSX !== 'undefined') {
    sedInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = function(e) {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, {type: 'array', cellDates: true});
            const worksheet = workbook.Sheets[workbook.SheetNames[0]];
            let json = XLSX.utils.sheet_to_json(worksheet);
            
            json = json.filter(row => {
                const keys = Object.keys(row);
                let dateKey = keys.find(k => k.trim().toLowerCase().includes('создано'));
                if (dateKey) row._parsedDate = parseExcelDate(row[dateKey]);
                if (row._parsedDate && row._parsedDate.getFullYear() < MIN_ALLOWED_YEAR) return false;
                return true;
            });

            allLoadedDataSED = json; 
            calculateYearlyTotal();
            updateStatus();
        };
        reader.readAsArrayBuffer(file);
    });
}

function updateStatus() {
    const status = document.getElementById('file-status');
    if (status) {
        if (allLoadedData1C.length > 0 || allLoadedDataSED.length > 0) {
            status.innerText = `Загружено 1С: ${allLoadedData1C.length} | СЭД: ${allLoadedDataSED.length}`;
            applyFilter('all'); 
        }
    } else if (allLoadedData1C.length > 0 || allLoadedDataSED.length > 0) {
        applyFilter('all'); 
    }
}

// ==========================================
// 5. ГОДОВЫЕ СЧЕТЧИКИ
// ==========================================
function calculateYearlyTotal() {
    if (allLoadedData1C.length === 0 && allLoadedDataSED.length === 0) return;
    
    // Текущий год (не меньше MIN_ALLOWED_YEAR) — для обоих счётчиков.
    // Защита от случая, когда в данных случайно есть будущий год.
    const currentYear = Math.max(new Date().getFullYear(), MIN_ALLOWED_YEAR);
    
    let totalForYear1C = allLoadedData1C.filter(r => r._parsedDate && r._parsedDate.getFullYear() === currentYear).length;
    if (totalForYear1C === 0 && allLoadedData1C.length > 0) totalForYear1C = allLoadedData1C.length;

    const currYear1C = document.getElementById('current-year');
    const banner1C = document.getElementById('yearly-banner');
    if (currYear1C) currYear1C.innerText = currentYear;
    if (banner1C) banner1C.style.display = 'block';
    animateValue("yearly-docs", 0, totalForYear1C, 800); 

    let totalForYearSED = allLoadedDataSED.filter(r => r._parsedDate && r._parsedDate.getFullYear() === currentYear).length;
    if (totalForYearSED === 0 && allLoadedDataSED.length > 0) totalForYearSED = allLoadedDataSED.length;

    const currYearSED = document.getElementById('current-year-sed');
    const bannerSED = document.getElementById('yearly-sed-banner');
    if (currYearSED) currYearSED.innerText = currentYear;
    if (bannerSED) bannerSED.style.display = 'block';
    animateValue("yearly-tasks-sed", 0, totalForYearSED, 800);
        // Считаем согласования
    let totalForYearSoglas = allLoadedData1C.filter(r => r._parsedDate && r._parsedDate.getFullYear() === currentYear && r['Тип'] === 'Согласование строк потребности').length;
    if (totalForYearSoglas === 0 && allLoadedData1C.length > 0) {
        totalForYearSoglas = allLoadedData1C.filter(r => r['Тип'] === 'Согласование строк потребности').length;
    }

    const currYearSoglas = document.getElementById('current-year-soglas');
    const bannerSoglas = document.getElementById('yearly-soglas-banner');
    if (currYearSoglas) currYearSoglas.innerText = currentYear;
    if (bannerSoglas) bannerSoglas.style.display = 'block';
    animateValue("yearly-soglas-tasks", 0, totalForYearSoglas, 800);
}

// ==========================================
// 6. ФИЛЬТРАЦИЯ
// ==========================================
document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        applyFilter(this.dataset.period);
    });
});

const applyCustomBtn = document.getElementById('apply-custom-date');
if (applyCustomBtn) {
    applyCustomBtn.addEventListener('click', function() {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        applyFilter('custom');
    });
}

function applyFilter(period) {
    currentGlobalPeriod = period; 
    
    let allData = [...allLoadedData1C, ...allLoadedDataSED]; 
    if (allData.length === 0) return;
    let maxDate = new Date(0);
    allData.forEach(row => { if (row._parsedDate && row._parsedDate > maxDate) maxDate = row._parsedDate; });
    
    let startDate = new Date(0);
    let endDate = new Date(8640000000000000);
    // СОХРАНЯЕМ ТЕКУЩИЕ ДАТЫ ДЛЯ ЭДО
    window.currentFilterStart = startDate;
    window.currentFilterEnd = endDate;
    
    if (period === 'week') {
        startDate = new Date(maxDate); startDate.setDate(startDate.getDate() - 7); endDate = maxDate;
    } else if (period === 'month') {
        startDate = new Date(maxDate); startDate.setMonth(startDate.getMonth() - 1); endDate = maxDate;
    } else if (period === 'halfyear') { 
        startDate = new Date(maxDate); startDate.setMonth(startDate.getMonth() - 6); endDate = maxDate;
    } else if (period === 'year') {
        startDate = new Date(maxDate); startDate.setFullYear(startDate.getFullYear() - 1); endDate = maxDate;
    } else if (period === 'custom') {
        const startVal = document.getElementById('date-start');
        const endVal = document.getElementById('date-end');
        if (startVal && startVal.value) startDate = parseLocalDate(startVal.value);
        if (endVal && endVal.value) { endDate = parseLocalDate(endVal.value); endDate.setHours(23, 59, 59, 999); }
    }
    window.currentFilterStart = startDate;
    window.currentFilterEnd = endDate;
        // Расчет предыдущего периода для сравнения
    if (period === 'all') {
        prevStartDate = new Date(0);
        prevEndDate = new Date(0); // Флаг, что сравнения нет
    } else {
        let duration = endDate.getTime() - startDate.getTime();
        prevEndDate = new Date(startDate.getTime() - 1); // 1 мс до начала текущего
        prevStartDate = new Date(prevEndDate.getTime() - duration);
    }

    const minAllowedDate = new Date(MIN_ALLOWED_YEAR, 0, 1);

    currentFiltered1C = allLoadedData1C.filter(row => {
        if (!row._parsedDate) return false; 
        if (row._parsedDate < minAllowedDate) return false; 
        return row._parsedDate >= startDate && row._parsedDate <= endDate;
    });

    currentFilteredSED = allLoadedDataSED.filter(row => {
        if (!row._parsedDate) return false;
        if (row._parsedDate < minAllowedDate) return false;
        return row._parsedDate >= startDate && row._parsedDate <= endDate;
    });
    
    processData();
}

// ==========================================
// 7. ОБРАБОТКА И ОТРИСОВКА
// ==========================================
function processData() {
    let totalDocs = 0;
    let totalSoglas = 0;
    let employeeStats = {}; 
    let allDocTypes = globalDocTypes; // Ссылаемся на глобальную переменную
    for (let k in allDocTypes) delete allDocTypes[k]; // Очищаем перед новым заполнением 

    allLoadedData1C.forEach(row => {
        const keys = Object.keys(row);
        let empKey = keys.find(k => k.trim().toLowerCase().includes('ответствен'));
        if (empKey && row[empKey]) {
            let empName = String(row[empKey]).trim();
            if (!employeeStats[empName]) employeeStats[empName] = { total: 0 };
        }
    });

    currentFiltered1C.forEach(row => {
        const keys = Object.keys(row);
        let empKey = keys.find(k => k.trim().toLowerCase().includes('ответствен'));
        let empName = empKey ? String(row[empKey]).trim() : String(row[keys[2]] || 'Неизвестный');
        let typeKey = keys.find(k => k.trim().toLowerCase().includes('тип'));
        let docType = typeKey ? String(row[typeKey]).trim() : String(row[keys[0]] || 'Другой');
        
        totalDocs += 1;
                if (docType === 'Согласование строк потребности') {
            totalSoglas++;
        }
        if (!employeeStats[empName]) employeeStats[empName] = { total: 0 };
        employeeStats[empName].total += 1;
        
        if (!allDocTypes[docType]) allDocTypes[docType] = 0;
        allDocTypes[docType] += 1;
    });

    let totalTasks = currentFilteredSED.length;
    let sumDiscipline = 0;
    let countEmpWithSed = 0;
        // Оптимизация: группируем задачи по фамилиям за один проход
    let sedByEmp = new Map();
    currentFilteredSED.forEach(row => {
        let shortName = getShortName(row['Сотрудник']);
        if (!shortName) return;
        if (!sedByEmp.has(shortName)) sedByEmp.set(shortName, []);
        sedByEmp.get(shortName).push(row);
    });

    sedByEmp.forEach((empTasks, shortName) => {
        if (!shortName) return;
        let inTime = 0, late = 0;
        empTasks.forEach(r => {
            let delayVal = String(r['Задержка, раб.дней'] || r['Задержка'] || '').trim();
            let completedVal = r['Выполнено']; 
            let hasDelay = delayVal && parseInt(delayVal) > 0;
            let isCompleted = completedVal && String(completedVal).trim() !== '';
            if (hasDelay) late++;
            else if (isCompleted) inTime++;
        });
        let closed = inTime + late;
        if (closed > 0) {
            sumDiscipline += Math.round((inTime / closed) * 100);
            countEmpWithSed++;
        }
    });

    let avgDiscipline = countEmpWithSed > 0 ? Math.round(sumDiscipline / countEmpWithSed) : 0;

    const sortedTypes = Object.keys(allDocTypes).sort((a, b) => allDocTypes[b] - allDocTypes[a]);
    let fallbackIndex = 0; 
    
    sortedTypes.forEach((type) => {
        if (!docColorMap[type]) {
            if (DOC_COLORS[type]) {
                docColorMap[type] = DOC_COLORS[type]; 
            } else {
                docColorMap[type] = fallbackPalette[fallbackIndex % fallbackPalette.length];
                fallbackIndex++;
            }
        }
    });

    animateValue("total-docs", 0, totalDocs, 800); 
    animateValue("total-tasks", 0, totalTasks, 800); 
    animateValue("total-soglas", 0, totalSoglas, 800);
    
    if (avgDiscipline > 0) {
        const discElement = document.getElementById('total-discipline');
        if (discElement) {
            if (document.body.classList.contains('dark-theme')) discElement.style.color = '#FFFFFF'; 
            else discElement.style.color = getDisciplineColor(avgDiscipline);
        }
        animateValue("total-discipline", 0, avgDiscipline, 800, '%');
    } else {
        const discElement = document.getElementById('total-discipline');
        if (discElement) {
            discElement.innerText = '—';
            discElement.style.color = 'var(--text-muted)';
        }
    }
        // --- РАСЧЕТ ТРЕНДОВ (СРАВНЕНИЕ С ПРОШЛЫМ ПЕРИОДОМ) ---
    if (currentGlobalPeriod !== 'all' && prevEndDate.getTime() > 0) {
        // 1. Фильтруем данные за прошлый период
        let prev1C = allLoadedData1C.filter(row => row._parsedDate && row._parsedDate >= prevStartDate && row._parsedDate <= prevEndDate);
        let prevSED = allLoadedDataSED.filter(row => row._parsedDate && row._parsedDate >= prevStartDate && row._parsedDate <= prevEndDate);

        let prevTotalDocs = prev1C.length;
        let prevTotalTasks = prevSED.length;
        let prevTotalSoglas = prev1C.filter(r => r['Тип'] === 'Согласование строк потребности').length;

        // Считаем дисциплину за прошлый период
        let prevSumDisc = 0;
        let prevCountDisc = 0;
        let uniquePrevEmps = new Set(prevSED.map(r => getShortName(r['Сотрудник'] || '')));
        
        uniquePrevEmps.forEach(shortName => {
            if (!shortName) return;
            let empTasks = prevSED.filter(r => getShortName(r['Сотрудник']) === shortName);
            let inTime = 0, late = 0;
            empTasks.forEach(r => {
                let delayVal = String(r['Задержка, раб.дней'] || r['Задержка'] || '').trim();
                let completedVal = r['Выполнено']; 
                let hasDelay = delayVal && parseInt(delayVal) > 0;
                let isCompleted = completedVal && String(completedVal).trim() !== '';
                if (hasDelay) late++;
                else if (isCompleted) inTime++;
            });
            let closed = inTime + late;
            if (closed > 0) {
                prevSumDisc += Math.round((inTime / closed) * 100);
                prevCountDisc++;
            }
        });
        let prevAvgDiscipline = prevCountDisc > 0 ? Math.round(prevSumDisc / prevCountDisc) : 0;

                // Функция для обновления бейджа
        function updateTrendBadge(elementId, diffValue, isDiscipline = false) {
            const el = document.getElementById(elementId);
            if (!el) return;
            
            el.style.display = 'inline-block';
            el.className = 'kpi-trend'; 
            
            let text = '';
            if (isDiscipline) {
                let sign = diffValue > 0 ? '+' : '';
                text = `${sign}${diffValue}% к прошлому периоду`;
            } else {
                                let prevValue = 0;
                let currValue = 0;
                
                if (elementId === 'trend-docs') {
                    prevValue = prevTotalDocs;
                    currValue = totalDocs;
                } else if (elementId === 'trend-soglas') {
                    prevValue = prevTotalSoglas;
                    currValue = totalSoglas;
                } else {
                    prevValue = prevTotalTasks;
                    currValue = totalTasks;
                }
                
                let percent = 0;
                if (prevValue === 0) {
                    percent = currValue > 0 ? 100 : 0;
                } else {
                    percent = Math.round(((currValue - prevValue) / prevValue) * 100);
                }
                let sign = percent > 0 ? '+' : '';
                text = `${sign}${percent}% к прошлому периоду`;
            }

                        let actualDiff = 0;
            if (isDiscipline) {
                actualDiff = diffValue;
            } else if (elementId === 'trend-docs') {
                actualDiff = totalDocs - prevTotalDocs;
            } else if (elementId === 'trend-soglas') {
                actualDiff = totalSoglas - prevTotalSoglas;
            } else {
                actualDiff = totalTasks - prevTotalTasks;
            }
            
            if (actualDiff > 0) {
                el.classList.add('trend-up');
                el.innerHTML = `📈 ${text}`;
            } else if (actualDiff < 0) {
                el.classList.add('trend-down');
                el.innerHTML = `📉 ${text}`;
            } else {
                el.classList.add('trend-neutral');
                el.innerHTML = `➖ ${text}`;
            }
        }

                // Обновляем плашки
        updateTrendBadge('trend-docs', totalDocs);
        updateTrendBadge('trend-soglas', totalSoglas); // <-- ДОБАВИТЬ ЭТО
        updateTrendBadge('trend-tasks', totalTasks);
        updateTrendBadge('trend-disc', avgDiscipline - prevAvgDiscipline, true);

    } else {
        document.getElementById('trend-docs').style.display = 'none';
        document.getElementById('trend-soglas').style.display = 'none'; // <-- ДОБАВИТЬ ЭТО
        document.getElementById('trend-tasks').style.display = 'none';
        document.getElementById('trend-disc').style.display = 'none';
    }
    // ----------------------------------------------------
    globalDocTypes = allDocTypes;
    globalTotalDocs = totalDocs;
    renderDeptDetails(allDocTypes, totalDocs);
    renderEmployeeCards(employeeStats);
    renderLeaderboard(employeeStats, currentFilteredSED); 
    renderDynamicsChart(); 
    renderHeatmapChart();
    renderSedAnalytics();
        // Если панель согласований открыта, обновляем её данные при смене глобального фильтра
    const soglasPanel = document.getElementById('details-soglas-panel');
    if (soglasPanel && soglasPanel.style.display === 'block') {
        renderSoglasAnalytics();
    }
}

function renderEmployeeCards(stats) {
    const grid = document.getElementById('employee-grid');
    if (!grid) return;
    grid.innerHTML = ''; 
    
    const sortedEmployees = Object.keys(stats).sort((a, b) => a.localeCompare(b, 'ru'));

    for (let emp of sortedEmployees) {
        if (emp === '_types') continue; 
        const card = document.createElement('div');
        card.className = 'employee-card';
        card.onclick = () => openEmployeeModal(emp);
        
        const shortName = getShortName(emp);
        let sedTasks = currentFilteredSED.filter(r => getShortName(r['Сотрудник']) === shortName);
        
        let postName = jobTitles[emp] || 'Сотрудник';
        let sedHtml = '';
        
        if (sedTasks.length > 0) {
            let total = sedTasks.length;
            let inTime = 0, late = 0, inWork = 0;
            sedTasks.forEach(r => {
                let delayVal = String(r['Задержка, раб.дней'] || r['Задержка'] || '').trim();
                let completedVal = r['Выполнено']; 
                let hasDelay = delayVal && parseInt(delayVal) > 0;
                let isCompleted = completedVal && String(completedVal).trim() !== '';
                if (hasDelay) late++;
                else if (isCompleted) inTime++;
                else inWork++;
            });
            let closed = inTime + late;
            let discipline = closed > 0 ? Math.round((inTime / closed) * 100) : 100;
            const color = getDisciplineColor(discipline);
            
            sedHtml = `
                <div style="margin-top: 10px; padding-top: 10px; border-top: 1px dashed var(--border-color); font-size: 12px;">
                    <div style="display:flex; justify-content:space-between; margin-bottom: 3px;">
                        <span>Задач СЭД:</span> <strong>${total}</strong>
                    </div>
                    <div style="display:flex; justify-content:space-between;">
                        <span>Дисциплина:</span> <strong style="color: ${color};">${discipline}%</strong>
                    </div>
                </div>
            `;
        } else {
            sedHtml = `
                <div style="margin-top: 10px; padding-top: 10px; border-top: 1px dashed var(--border-color); font-size: 12px; color: var(--text-muted);">
                    <div style="display:flex; justify-content:space-between; margin-bottom: 3px;">
                        <span>Задач СЭД:</span> <strong>0</strong>
                    </div>
                    <div style="display:flex; justify-content:space-between;">
                        <span>Дисциплина:</span> <strong>—</strong>
                    </div>
                </div>
            `;
        }

               // Генерируем инициалы для аватарки
        let parts = emp.split(' ');
        let initials = (parts[0] ? parts[0][0] : '') + (parts[1] ? parts[1][0] : '');

        card.innerHTML = `
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 5px;">
                <div class="small-avatar" style="background-color: ${getAvatarColor(emp)};">${initials}</div>
                <h4 style="margin: 0; font-size: 15px; line-height: 1.2;">${emp}</h4>
            </div>
            <p style="color:var(--text-muted); font-size:11px; margin-bottom:0; margin-left: 34px;">${postName}</p>
            <p style="margin-top: 8px;">Документов 1С: <strong>${stats[emp].total}</strong></p>
            ${sedHtml}
        `;
        grid.appendChild(card);
    }

}

// ==========================================
// 8. ДОСКА ПОЧЕТА
// ==========================================
function renderLeaderboard(empStats, sedData) {
    const fullNameMap = {};
    for (let emp in empStats) {
        fullNameMap[getShortName(emp)] = emp;
    }

    let all1C = [];
    for (let emp in empStats) {
        if (empStats[emp].total > 0) {
            all1C.push({ name: emp, value: empStats[emp].total });
        }
    }
    all1C.sort((a, b) => b.value - a.value);
    let top1C = all1C.slice(0, 3); 

    let sedStats = {};
    sedData.forEach(row => {
        let rawName = String(row['Сотрудник'] || '').trim();
        let shortName = getShortName(rawName);
        if (!shortName) return;

        if (!sedStats[shortName]) {
            sedStats[shortName] = { inTime: 0, total: 0 };
        }

        let delayVal = String(row['Задержка, раб.дней'] || row['Задержка'] || '').trim();
        let completedVal = row['Выполнено']; 
        let hasDelay = delayVal && parseInt(delayVal) > 0;
        let isCompleted = completedVal && String(completedVal).trim() !== '';

        if (isCompleted) {
            sedStats[shortName].total++;
            if (!hasDelay) {
                sedStats[shortName].inTime++;
            }
        }
    });

    let allSEDInTime = [];
    for (let shortName in sedStats) {
        let fullName = fullNameMap[shortName] || shortName; 
        if (sedStats[shortName].inTime > 0) {
            allSEDInTime.push({ name: fullName, value: sedStats[shortName].inTime });
        }
    }
    allSEDInTime.sort((a, b) => b.value - a.value);
    let topInTime = allSEDInTime.slice(0, 3);

    let allSEDTotal = [];
    for (let shortName in sedStats) {
        let fullName = fullNameMap[shortName] || shortName; 
        if (sedStats[shortName].total > 0) {
            allSEDTotal.push({ name: fullName, value: sedStats[shortName].total });
        }
    }
    allSEDTotal.sort((a, b) => b.value - a.value);
    let topTotal = allSEDTotal.slice(0, 3);

    const renderList = (elementId, dataArray, suffix) => {
        const ul = document.getElementById(elementId);
        if (!ul) return;
        ul.innerHTML = '';
        
        if (dataArray.length === 0) {
            ul.innerHTML = '<li style="justify-content:center; color:var(--text-muted);">Нет данных</li>';
            return;
        }

        dataArray.forEach((item, index) => {
            const li = document.createElement('li');
            li.innerHTML = `
                <span class="emp-name" title="${item.name}">${index + 1}. ${item.name}</span>
                <span class="emp-value">${item.value} ${suffix}</span>
            `;
            ul.appendChild(li);
        });
    };

    renderList('leader-1c-list', top1C, 'док.');
    renderList('leader-sed-list', topInTime, 'зад.');
    renderList('leader-sed-total-list', topTotal, 'зад.');
}

// ==========================================
// 9. ГРАФИКИ ДИНАМИКИ
// ==========================================
function renderDynamicsChart() {
    const section = document.getElementById('dynamics-section');
    const canvas1C = document.getElementById('dynamicsChart1C');
    const canvasSED = document.getElementById('dynamicsChartSED');
    
    if (currentGlobalPeriod === 'week') {
        if (section) section.style.display = 'none';
        return;
    }
    
    if (!section || !canvas1C || !canvasSED) return;
    section.style.display = 'block';

    const groupByMonth = (currentGlobalPeriod === 'year' || currentGlobalPeriod === 'halfyear' || currentGlobalPeriod === 'all');
    let groups = {}; 

    function getMonday(d) {
        d = new Date(d);
        let day = d.getDay();
        let diff = d.getDate() - day + (day === 0 ? -6 : 1); 
        return new Date(d.setDate(diff));
    }

    function addToGroup(date, source) {
        if (!date) return;
        let key, labelStr, tooltipStr;
        
        if (groupByMonth) {
            key = `${date.getFullYear()}-${date.getMonth()}`;
            const monthNames = ["Янв", "Фев", "Мар", "Апр", "Май", "Июн", "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек"];
            labelStr = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
            tooltipStr = labelStr;
        } else {
            const monday = getMonday(date);
            key = monday.getTime();
            const sunday = new Date(monday);
            sunday.setDate(monday.getDate() + 6);
            const fmt = (d) => `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}`;
            tooltipStr = `${fmt(monday)} - ${fmt(sunday)}`;
            labelStr = 'Неделя'; 
        }

        if (!groups[key]) {
            groups[key] = { date: date, label: labelStr, tooltip: tooltipStr, count1C: 0, countSED: 0 };
        }
        
        if (source === '1C') groups[key].count1C++;
        if (source === 'SED') groups[key].countSED++;
    }

    currentFiltered1C.forEach(row => {
        if (row._parsedDate) addToGroup(row._parsedDate, '1C');
    });

    currentFilteredSED.forEach(row => {
        if (row._parsedDate) addToGroup(row._parsedDate, 'SED');
    });

    const sortedKeys = Object.keys(groups).sort((a, b) => {
        if (groupByMonth) {
            const [yearA, monthA] = a.split('-');
            const [yearB, monthB] = b.split('-');
            return new Date(yearA, monthA) - new Date(yearB, monthB);
        }
        return parseInt(a) - parseInt(b);
    });

    let labels = [];
    let tooltips = [];
    let data1C = [];
    let dataSED = [];

    sortedKeys.forEach((key, index) => {
        const g = groups[key];
        if (groupByMonth) {
            labels.push(g.label);
        } else {
            labels.push(`Неделя ${index + 1}`); 
        }
        tooltips.push(g.tooltip);
        data1C.push(g.count1C);
        dataSED.push(g.countSED);
    });

    // --- График 1С ---
    if (dynamicsChart1CInstance) dynamicsChart1CInstance.destroy();
    const ctx1C = canvas1C.getContext('2d');
    dynamicsChart1CInstance = new Chart(ctx1C, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Документы 1С',
                data: data1C,
                borderColor: '#F1C40F',
                backgroundColor: '#F1C40F',
                borderWidth: 3,
                pointRadius: 5,
                pointBackgroundColor: '#F1C40F',
                tension: 0
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            layout: { padding: { top: 20, right: 10 } },
            scales: {
                x: { grid: { display: false }, ticks: { color: getTextColor(), font: { size: 11, weight: 'bold' } } },
                y: { beginAtZero: true, ticks: { color: getTextColor() }, grid: { color: document.body.classList.contains('dark-theme') ? '#333' : '#eee' } }
            },
            plugins: {
                legend: { display: false }, 
                tooltip: { callbacks: { title: function(context) { return tooltips[context[0].dataIndex]; } } }
            }
        },
        plugins: [lineLabelsPlugin] 
    });

    // --- График СЭД ---
    if (dynamicsChartSEDInstance) dynamicsChartSEDInstance.destroy();
    const ctxSED = canvasSED.getContext('2d');
    dynamicsChartSEDInstance = new Chart(ctxSED, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Задачи СЭД',
                data: dataSED,
                borderColor: '#E56B1F',
                backgroundColor: '#E56B1F',
                borderWidth: 3,
                pointRadius: 5,
                pointBackgroundColor: '#E56B1F',
                tension: 0
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            layout: { padding: { top: 20, right: 10 } },
            scales: {
                x: { grid: { display: false }, ticks: { color: getTextColor(), font: { size: 11, weight: 'bold' } } },
                y: { beginAtZero: true, ticks: { color: getTextColor() }, grid: { color: document.body.classList.contains('dark-theme') ? '#333' : '#eee' } }
            },
            plugins: {
                legend: { display: false }, 
                tooltip: { callbacks: { title: function(context) { return tooltips[context[0].dataIndex]; } } }
            }
        },
        plugins: [lineLabelsPlugin] 
    });
}

// ==========================================
// 9.5 ТЕПЛОВАЯ КАРТА (АКТИВНОСТЬ ПО ДНЯМ)
// ==========================================
function renderHeatmapChart() {
    const section = document.getElementById('heatmap-section');
    if (!section) return;
    section.style.display = 'block';

    // 1. Фильтруем данные для 4 разных графиков
    const data1C_Base = currentFiltered1C.filter(r => r['Тип'] !== 'Согласование строк потребности' && r['Тип'] !== 'Перенос срока поставки');
    const dataSoglas = currentFiltered1C.filter(r => r['Тип'] === 'Согласование строк потребности');
    const dataPerenos = currentFiltered1C.filter(r => r['Тип'] === 'Перенос срока поставки');
    const dataSED = currentFilteredSED;

    const labels = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

    // Вспомогательная функция для подготовки данных (считает дни и обрезает выходные, если пусто)
    function getHeatmapData(dataArray) {
        let counts = [0, 0, 0, 0, 0, 0, 0];
        dataArray.forEach(row => {
            if (row._parsedDate) counts[row._parsedDate.getDay()]++;
        });
        // Переставляем: Пн(1) ... Вс(0)
        let ordered = [counts[1], counts[2], counts[3], counts[4], counts[5], counts[6], counts[0]];
        let currentLabels = [...labels];
        
        // Если сб и вс по нулям, обрезаем их
        if (ordered[5] === 0 && ordered[6] === 0) {
            ordered = ordered.slice(0, 5);
            currentLabels = currentLabels.slice(0, 5);
        }
        return { data: ordered, labels: currentLabels };
    }

        function createGradient(ctx, chartArea) {
        if (!chartArea) return 'rgba(241, 196, 15, 0.5)';
        const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
        // Классический градиент: зеленый -> желтый -> оранжевый -> красный
        gradient.addColorStop(0, 'rgba(46, 125, 50, 0.2)');   
        gradient.addColorStop(0.2, 'rgba(46, 125, 50, 0.8)'); 
        gradient.addColorStop(0.4, 'rgba(139, 195, 74, 0.8)'); 
        gradient.addColorStop(0.6, 'rgba(241, 196, 15, 0.8)'); 
        gradient.addColorStop(0.8, 'rgba(230, 126, 34, 0.9)'); 
        gradient.addColorStop(1, 'rgba(192, 57, 43, 1)');      
        return gradient;
    }

        function drawChart(canvasId, chartInstance, rawData) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return null;
        
        const prepared = getHeatmapData(rawData);

        if (chartInstance) chartInstance.destroy();
        
        // ПРИНУДИТЕЛЬНЫЙ СБРОС РАЗМЕРОВ ХОЛСТА
        canvas.removeAttribute('width');
        canvas.removeAttribute('height');
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        
        const ctx = canvas.getContext('2d');
        
        return new Chart(ctx, {
            type: 'line',
            data: {
                labels: prepared.labels,
                datasets: [{
                    data: prepared.data,
                    borderWidth: 0, fill: true, tension: 0.4, pointRadius: 4,
                    pointBackgroundColor: '#fff',
                    pointBorderColor: '#C0392B', // Красные точки-маркеры (как на старых графиках)
                    pointBorderWidth: 2,
                    backgroundColor: function(context) {
                        const chart = context.chart;
                        const {ctx, chartArea} = chart;
                        if (!chartArea) return 'rgba(0,0,0,0.1)';
                        return createGradient(ctx, chartArea);
                    }
                }]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                layout: { padding: { top: 10, right: 20, left: 20, bottom: 0 } },
                scales: {
                    x: { offset: true, grid: { display: false }, ticks: { color: getTextColor(), font: { size: 13, weight: 'bold' }, padding: 0} },
                    y: { beginAtZero: true, display: false, grace: '10%' }
                },
                plugins: {
                    legend: { display: false },
                    tooltip: { callbacks: { label: function(context) { return ` Кол-во: ${context.raw}`; } } }
                }
            }
        });
    }

    // Рисуем все 4 графика
    heatmapChart1CInstance = drawChart('heatmapChart1C', heatmapChart1CInstance, data1C_Base);
    heatmapChartSEDInstance = drawChart('heatmapChartSED', heatmapChartSEDInstance, dataSED);
    heatmapChartSoglasInstance = drawChart('heatmapChartSoglas', heatmapChartSoglasInstance, dataSoglas);
    heatmapChartPerenosInstance = drawChart('heatmapChartPerenos', heatmapChartPerenosInstance, dataPerenos);
}

// ==========================================
// 10. ГРАФИКИ 1С И СЭД
// ==========================================
function renderDeptDetails(typesData, totalDocs) {
    const legendDiv = document.getElementById('custom-legend');
    const canvas = document.getElementById('deptBarChart');
    if (!legendDiv || !canvas) return;

    // 1. Отрисовка легенды (она общая для обоих режимов)
    legendDiv.innerHTML = '';
    const labels = Object.keys(typesData);
    const values = Object.values(typesData);
    const sortedIndices = values.map((_, i) => i).sort((a, b) => values[b] - values[a]);
    const sortedLabels = sortedIndices.map(i => labels[i]);
    const sortedValues = sortedIndices.map(i => values[i]);
    const sortedColors = sortedLabels.map(label => docColorMap[label]);
    
    sortedLabels.forEach((label, index) => {
        const color = sortedColors[index];
        const legendItem = document.createElement('div');
        legendItem.style.cssText = 'display: flex; align-items: flex-start; margin-bottom: 12px; font-size: 13px; line-height: 1.4; border-bottom: 1px solid var(--border-color); padding-bottom: 8px;';
        legendItem.innerHTML = `<div style="min-width: 16px; height: 16px; background-color: ${color}; border-radius: 3px; margin-right: 12px; margin-top: 2px;"></div><div><strong>${label}</strong>:<br>${sortedValues[index]} шт.</div>`;
        legendDiv.appendChild(legendItem);
    });

    if (deptBarChartInstance) deptBarChartInstance.destroy();
    const ctx = canvas.getContext('2d');
    const isEmployeeMode = document.getElementById('chart-toggle')?.checked;
    const excludeSoglas = document.getElementById('exclude-soglas-toggle')?.checked;
    
    // Создаем отфильтрованную копию данных для графика
    let dataForChart = currentFiltered1C;
    if (excludeSoglas) {
        dataForChart = currentFiltered1C.filter(r => r['Тип'] !== 'Согласование строк потребности');
    }

        // 2. Отрисовка графика (в зависимости от режима)
    if (isEmployeeMode) {
        // --- РЕЖИМ: ПО СОТРУДНИКАМ (Grouped Bar) ---
        let empData = {};
        dataForChart.forEach(row => {
            const keys = Object.keys(row);
            let empKey = keys.find(k => k.trim().toLowerCase().includes('ответствен'));
            let empName = empKey ? String(row[empKey]).trim() : String(row[keys[2]] || 'Неизвестный');
            let typeKey = keys.find(k => k.trim().toLowerCase().includes('тип'));
            let docType = typeKey ? String(row[typeKey]).trim() : String(row[keys[0]] || 'Другой');

            if (!empData[empName]) empData[empName] = { total: 0, types: {} };
            empData[empName].total++;
            empData[empName].types[docType] = (empData[empName].types[docType] || 0) + 1;
        });

        let sortedEmps = Object.keys(empData).sort((a,b) => empData[b].total - empData[a].total);
        
        // Сокращаем имена для оси X (Иванов И.)
        let empLabels = sortedEmps.map(name => {
            let parts = name.split(' ');
            return parts.length > 1 ? `${parts[0]} ${parts[1][0]}.` : name;
        });

        let datasets = sortedLabels.map(type => {
            return {
                label: type,
                data: sortedEmps.map(emp => empData[emp].types[type] || 0),
                backgroundColor: docColorMap[type],
                borderWidth: 0,
                borderRadius: 0,
                barPercentage: 1.0,      // Столбики занимают всю ширину группы
                categoryPercentage: 1.0  // Группы стоят вплотную друг к другу
            };
        });

        deptBarChartInstance = new Chart(ctx, {
            type: 'bar',
            data: { labels: empLabels, datasets: datasets },
            options: {
                responsive: true, maintainAspectRatio: false,
                layout: { padding: { top: 10, bottom: 0, left: 0, right: 10 } },
                scales: {
                    x: { 
                        stacked: false, 
                        ticks: { color: getTextColor(), font: {size: 11}, maxRotation: 45, minRotation: 45 }, 
                        grid: { display: false } 
                    },
                    y: { 
                        stacked: false, 
                        display: false, 
                        beginAtZero: true 
                    }
                },
                plugins: {
                    legend: { display: false },
                    tooltip: { 
                        mode: 'index', // Показывать все значения для сотрудника
                        intersect: false,
                        callbacks: { 
                            label: function(context) { 
                                return ` ${context.dataset.label}: ${context.raw} шт.`; 
                            },
                            // Скрываем нулевые значения в тултипе, чтобы не было мешанины
                            footer: function(items) {
                                return '';
                            }
                        },
                        filter: function(tooltipItem) {
                            return tooltipItem.raw > 0; // Показываем только столбцы, где есть данные
                        }
                    }
                }
            }
        });

    } else {
        // --- РЕЖИМ: ПО ТИПАМ (Старый Bar Chart) ---
        deptBarChartInstance = new Chart(ctx, {
            type: 'bar',
            data: { labels: sortedLabels, datasets: [{ data: sortedValues, backgroundColor: sortedColors, borderRadius: 4, borderSkipped: false }] },
            options: {
                responsive: true, maintainAspectRatio: false,
                layout: { padding: { top: 30, bottom: 10, left: 10, right: 30 } },
                scales: { x: { ticks: { display: false }, grid: { display: false } }, y: { display: false, beginAtZero: true } },
                plugins: { legend: { display: false }, tooltip: { callbacks: { label: function(context) { return ` ${context.label}: ${context.raw} шт.`; } } } }
            },
            plugins: [barLabelsPlugin] 
        });
    }
        // --- БЛОК ПЕРЕНОСОВ СРОКОВ ---
    const perenosData = currentFiltered1C.filter(r => r['Тип'] === 'Перенос срока поставки');
    let perenosEmpStats = {};
    
    perenosData.forEach(row => {
        let empName = row['Ответственный'] || 'Неизвестный';
        perenosEmpStats[empName] = (perenosEmpStats[empName] || 0) + 1;
    });

    let sortedPerenosEmps = Object.keys(perenosEmpStats).sort((a, b) => perenosEmpStats[b] - perenosEmpStats[a]);

    if (perenosEmployeesChartInstance) perenosEmployeesChartInstance.destroy();
    const ctxPerenos = document.getElementById('perenosEmployeesChart');
    
    if (ctxPerenos) {
        perenosEmployeesChartInstance = new Chart(ctxPerenos.getContext('2d'), {
            type: 'bar',
            data: {
                labels: sortedPerenosEmps.map(name => name.split(' ')[0]), // Фамилии
                datasets: [{
                    label: 'Переносы',
                    data: sortedPerenosEmps.map(name => perenosEmpStats[name]),
                    backgroundColor: '#A0522D', // Коричневый цвет (как у типа документа)
                    borderRadius: 4
                }]
            },
            options: {
                indexAxis: 'y', // Горизонтальные столбцы (удобно для ФИО)
                responsive: true, 
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: { callbacks: { label: function(context) { return ` ${context.raw} шт.`; } } }
                },
                scales: {
                    x: { beginAtZero: true, ticks: { color: getTextColor() } },
                    y: { ticks: { color: getTextColor() }, grid: { display: false } }
                }
            }
        });
    }
}
function renderSoglasAnalytics() {
    const soglasData = currentFiltered1C.filter(r => r['Тип'] === 'Согласование строк потребности');
    const avgEl = document.getElementById('avg-soglas-time');
    
    if (soglasData.length === 0) {
        if (avgEl) avgEl.innerText = 'Нет данных';
        if (soglasSpeedChartInstance) soglasSpeedChartInstance.destroy();
        if (soglasEmpChartInstance) soglasEmpChartInstance.destroy();
        return;
    }

        // 1. Считаем средний срок и распределение по дням
    let totalDays = 0;
    let countWithDates = 0;
    let speedStats = { 'fast': 0, 'normal': 0, 'slow': 0 }; 
    let empStats = {};

    soglasData.forEach(r => {
        let emp = r['Ответственный'] || 'Неизвестный';
        empStats[emp] = (empStats[emp] || 0) + 1;

        // Используем готовые дни из Excel файла!
        if (r['Дней согласования'] !== undefined && r['Дней согласования'] !== null) {
            const diffDays = parseInt(r['Дней согласования']);
            
            totalDays += diffDays;
            countWithDates++;

            if (diffDays <= 1) speedStats.fast++;
            else if (diffDays <= 3) speedStats.normal++;
            else speedStats.slow++;
        }
    });

    let avgDays = countWithDates > 0 ? (totalDays / countWithDates).toFixed(1) : 0;
    if (avgEl) avgEl.innerText = `${avgDays} дн.`;

            // 2. Рисуем круговую диаграмму скорости
    if (soglasSpeedChartInstance) soglasSpeedChartInstance.destroy();
    const ctxSpeed = document.getElementById('soglasSpeedChart').getContext('2d');
    
    // Считаем общее количество для процентов
    const totalSpeed = speedStats.fast + speedStats.normal + speedStats.slow;
    
    soglasSpeedChartInstance = new Chart(ctxSpeed, {
        type: 'doughnut',
        data: {
            labels: ['За 1 день', '2-3 дня', 'Более 3 дней'],
            datasets: [{
                data: [speedStats.fast, speedStats.normal, speedStats.slow],
                backgroundColor: ['#2E7D32', '#F39C12', '#C0392B'],
                borderWidth: 1,
                borderColor: document.body.classList.contains('dark-theme') ? '#1E1E1E' : '#fff'
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false, cutout: '60%',
            layout: { padding: 10 },
            plugins: {
                title: { display: true, text: 'Скорость согласования', color: getTextColor(), font: {size: 14, weight: 'bold'} },
                legend: { 
                    position: 'bottom', 
                    labels: { 
                        color: getTextColor(), 
                        padding: 15,
                        generateLabels: function(chart) {
                            const data = chart.data;
                            if (data.labels.length && data.datasets.length) {
                                return data.labels.map(function(label, i) {
                                    const value = data.datasets[0].data[i];
                                    const pct = totalSpeed > 0 ? Math.round((value / totalSpeed) * 100) : 0;
                                    const bgColor = data.datasets[0].backgroundColor[i];
                                    return {
                                        text: `${label} (${pct}%)`,
                                        fillStyle: bgColor,
                                        strokeStyle: bgColor,
                                        lineWidth: 1,
                                        hidden: false,
                                        index: i,
                                        fontColor: getTextColor()
                                    };
                                });
                            }
                            return [];
                        }
                    } 
                },
                tooltip: { 
                    callbacks: { 
                        label: function(context) { 
                            const val = context.raw;
                            const pct = totalSpeed > 0 ? Math.round((val / totalSpeed) * 100) : 0;
                            return ` ${context.label}: ${val} шт. (${pct}%)`; 
                        } 
                    } 
                }
            }
        },
        plugins: [doughnutLabelsPlugin] // <-- ПОДКЛЮЧАЕМ ПЛАГИН
    });

    // 3. Рисуем столбчатую диаграмму по сотрудникам
    let sortedEmps = Object.keys(empStats).sort((a, b) => empStats[b] - empStats[a]);
    
    if (soglasEmpChartInstance) soglasEmpChartInstance.destroy();
    const ctxEmp = document.getElementById('soglasEmployeesChart').getContext('2d');
    soglasEmpChartInstance = new Chart(ctxEmp, {
        type: 'bar',
        data: {
            labels: sortedEmps.map(name => name.split(' ')[0]), // Только фамилии
            datasets: [{
                label: 'Согласовано строк',
                data: sortedEmps.map(name => empStats[name]),
                backgroundColor: '#D4AC0D',
                borderRadius: 4
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: {
                title: { display: true, text: 'Вклад сотрудников', color: getTextColor(), font: {size: 14} },
                legend: { display: false },
                tooltip: { callbacks: { label: function(context) { return ` ${context.raw} шт.`; } } }
            },
            scales: {
                y: { beginAtZero: true, ticks: { color: getTextColor() } },
                x: { ticks: { color: getTextColor(), maxRotation: 45, minRotation: 45 } }
            }
        }
    });
           // 4. Считаем статистику по Бизнес-единицам
    let orgStats = {};
    
    soglasData.forEach(r => {
        const orgName = r['Organization'] || 'Не указана';
        
        if (!orgStats[orgName]) {
            orgStats[orgName] = { count: 0, totalDays: 0, validDays: 0 };
        }
        
        orgStats[orgName].count++;
        if (r['Дней согласования'] !== undefined) {
            orgStats[orgName].totalDays += parseInt(r['Дней согласования']);
            orgStats[orgName].validDays++;
        }
    });

    let sortedOrgs = Object.keys(orgStats).sort((a, b) => orgStats[b].count - orgStats[a].count);
    let orgLabels = sortedOrgs;
    
    // Красим организации по кругу из нашей палитры
    let orgColors = sortedOrgs.map((_, i) => ORG_COLORS[i % ORG_COLORS.length]);
    // ... дальше идет код отрисовки круговой и столбчатой диаграммы, его менять не нужно ...

    // 5. Рисуем круговую по объему (Верхняя левая)
    if (window.soglasOrgVolumeChartInstance) window.soglasOrgVolumeChartInstance.destroy();
    const ctxOrgVol = document.getElementById('soglasOrgVolumeChart').getContext('2d');
    window.soglasOrgVolumeChartInstance = new Chart(ctxOrgVol, {
        type: 'doughnut',
        data: {
            labels: orgLabels,
            datasets: [{
                data: sortedOrgs.map(o => orgStats[o].count),
                backgroundColor: orgColors,
                borderWidth: 1,
                borderColor: document.body.classList.contains('dark-theme') ? '#1E1E1E' : '#fff'
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false, cutout: '60%',
                plugins: {
                title: { display: true, text: 'Объем по бизнес-единицам', color: getTextColor(), font: {size: 14, weight: 'bold'} },
                legend: { 
                    position: 'right', 
                    labels: { 
                        color: getTextColor(), 
                        boxWidth: 12, 
                        padding: 10, 
                        font: {size: 11},
                        // КАСТОМНАЯ ЛЕГЕНДА С КОЛИЧЕСТВОМ
                        generateLabels: function(chart) {
                            const data = chart.data;
                            if (data.labels.length && data.datasets.length) {
                                return data.labels.map(function(label, i) {
                                    const value = data.datasets[0].data[i];
                                    const bgColor = data.datasets[0].backgroundColor[i];
                                    return {
                                        text: `${label} (${value})`, // <-- ДОБАВЛЯЕМ КОЛИЧЕСТВО
                                        fillStyle: bgColor,
                                        strokeStyle: bgColor,
                                        lineWidth: 1,
                                        hidden: false,
                                        index: i,
                                        fontColor: getTextColor()
                                    };
                                });
                            }
                            return [];
                        }
                    } 
                },
                tooltip: { callbacks: { label: function(context) { return ` ${context.label}: ${context.raw} шт.`; } } }
            }
        }
    });

    // 6. Рисуем SLA по организациям (Верхняя правая)
    if (window.soglasOrgSlaChartInstance) window.soglasOrgSlaChartInstance.destroy();
    const ctxOrgSla = document.getElementById('soglasOrgSlaChart').getContext('2d');
    
    let slaData = sortedOrgs.map(o => {
        return orgStats[o].validDays > 0 ? (orgStats[o].totalDays / orgStats[o].validDays).toFixed(1) : 0;
    });

    window.soglasOrgSlaChartInstance = new Chart(ctxOrgSla, {
        type: 'bar',
        data: {
            labels: orgLabels.map(l => l.length > 20 ? l.substring(0, 18) + '...' : l), // Сокращаем длинные имена
            datasets: [{
                label: 'Средний срок (дн.)',
                data: slaData,
                backgroundColor: orgColors,
                borderRadius: 4
            }]
        },
        options: {
            indexAxis: 'y', // Горизонтальные столбцы
            responsive: true, maintainAspectRatio: false,
            plugins: {
                title: { display: true, text: 'Средний SLA по бизнес-единицам', color: getTextColor(), font: {size: 14, weight: 'bold'} },
                legend: { display: false },
                tooltip: { callbacks: { label: function(context) { return ` ${context.raw} дней`; } } }
            },
            scales: {
                x: { beginAtZero: true, ticks: { color: getTextColor() }, grid: { color: document.body.classList.contains('dark-theme') ? '#333' : '#eee' } },
                y: { ticks: { color: getTextColor(), font: {size: 11} }, grid: { display: false } }
            }
        }
    });
}

function renderSedAnalytics() {
    const section = document.getElementById('sed-analytics-section');
    const generalCanvas = document.getElementById('sedGeneralChart');
    const employeesCanvas = document.getElementById('sedEmployeesChart');
    
    if (!section || !generalCanvas || !employeesCanvas) return;

    if (!currentFilteredSED || currentFilteredSED.length === 0) {
        section.style.display = 'none';
        return;
    }
    
    let totalInTime = 0, totalLate = 0, totalInWork = 0;
    let empStats = {}; 

    currentFilteredSED.forEach(row => {
        let rawName = String(row['Сотрудник'] || '').trim();
        let shortName = getShortName(rawName);
        let displayName = shortName.charAt(0).toUpperCase() + shortName.slice(1); 

        if (!empStats[displayName]) {
            empStats[displayName] = { inTime: 0, late: 0, inWork: 0 };
        }

        let delayVal = String(row['Задержка, раб.дней'] || row['Задержка'] || '').trim();
        let completedVal = row['Выполнено']; 
        let hasDelay = delayVal && parseInt(delayVal) > 0;
        let isCompleted = completedVal && String(completedVal).trim() !== '';

        if (hasDelay) {
            empStats[displayName].late++;
            totalLate++;
        } else if (isCompleted) {
            empStats[displayName].inTime++;
            totalInTime++;
        } else {
            empStats[displayName].inWork++;
            totalInWork++;
        }
    });

    if (sedGeneralChartInstance) sedGeneralChartInstance.destroy();
    const ctxGeneral = generalCanvas.getContext('2d');
    
    sedGeneralChartInstance = new Chart(ctxGeneral, {
        type: 'doughnut',
        data: {
            labels: ['В срок', 'С нарушением', 'В работе'],
            datasets: [{
                data: [totalInTime, totalLate, totalInWork],
                backgroundColor: ['#2E7D32', '#D32F2F', '#0288D1'],
                borderWidth: 1,
                borderColor: document.body.classList.contains('dark-theme') ? '#1E1E1E' : '#fff'
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            cutout: '60%',
            plugins: {
                legend: { position: 'right', labels: { color: getTextColor() } },
                tooltip: { callbacks: { label: function(context) { return ` ${context.label}: ${context.raw} шт.`; } } },
                sedCenterText: { value: totalInTime + totalLate + totalInWork, color: getTextColor() }
            }
        },
        plugins: [sedCenterTextPlugin]
    });

    if (sedEmployeesChartInstance) sedEmployeesChartInstance.destroy();
    const ctxEmployees = employeesCanvas.getContext('2d');

    const sortedEmps = Object.keys(empStats).sort((a, b) => a.localeCompare(b, 'ru'));
    const dataInTime = sortedEmps.map(e => empStats[e].inTime);
    const dataLate = sortedEmps.map(e => empStats[e].late);
    const dataInWork = sortedEmps.map(e => empStats[e].inWork);

    sedEmployeesChartInstance = new Chart(ctxEmployees, {
        type: 'bar',
        data: {
            labels: sortedEmps,
            datasets: [
                { label: 'В срок', data: dataInTime, backgroundColor: '#2E7D32', maxBarThickness: 20 },
                { label: 'С нарушением', data: dataLate, backgroundColor: '#D32F2F', maxBarThickness: 20 },
                { label: 'В работе', data: dataInWork, backgroundColor: '#0288D1', maxBarThickness: 20 }
            ]
        },
        options: {
            indexAxis: 'y', responsive: true, maintainAspectRatio: false,
            layout: { padding: { right: 15 } },
            scales: {
                x: { stacked: true, display: false },
                y: { 
                    stacked: true, 
                    grid: { display: false },
                    ticks: { color: getTextColor(), crossAlign: 'far', padding: 10 },
                    afterFit: function(scale) { scale.width = 100; }
                }
            },
            plugins: {
                legend: { position: 'bottom', labels: { color: getTextColor() } },
                tooltip: { callbacks: { label: function(context) { return ` ${context.dataset.label}: ${context.raw} шт.`; } } }
            }
        },
        plugins: [stackedBarLabelsPlugin]
    });
}

// ==========================================
// 11. АНИМАЦИЯ И ОБРАБОТЧИКИ
// ==========================================
const expandKpiBtn = document.getElementById('expand-kpi-btn');
if (expandKpiBtn) {
    expandKpiBtn.addEventListener('click', function() {
        const panel = document.getElementById('details-panel');
        const icon = document.getElementById('expand-icon');
        if (!panel || !icon) return;
        if (panel.style.display === 'none') { panel.style.display = 'block'; icon.innerText = '▲'; } 
        else { panel.style.display = 'none'; icon.innerText = '▼'; }
    });
}

const expandSedBtn = document.getElementById('expand-sed-btn');
if (expandSedBtn) {
    expandSedBtn.addEventListener('click', function() {
        const panel = document.getElementById('sed-analytics-section');
        const icon = document.getElementById('expand-sed-icon');
        if (!panel || !icon) return;
        if (!currentFilteredSED || currentFilteredSED.length === 0) return;
        if (panel.style.display === 'none') { panel.style.display = 'flex'; icon.innerText = '▲'; } 
        else { panel.style.display = 'none'; icon.innerText = '▼'; }
    });
}
const expandSoglasBtn = document.getElementById('expand-soglas-btn');
if (expandSoglasBtn) {
    expandSoglasBtn.addEventListener('click', function() {
        const panel = document.getElementById('details-soglas-panel');
        const icon = document.getElementById('expand-soglas-icon');
        if (!panel || !icon) return;
        
        if (panel.style.display === 'none') { 
            panel.style.display = 'block'; 
            icon.innerText = '▲'; 
            renderSoglasAnalytics(); // Рисуем графики при открытии
        } else { 
            panel.style.display = 'none'; 
            icon.innerText = '▼'; 
        }
    });
}

function animateValue(id, start, end, duration, suffix = '') {
    let obj = document.getElementById(id);
    if (!obj) return;
    if (start === end) { obj.innerHTML = end + suffix; return; }
    let range = end - start; let current = start; let startTime = null;
    function step(timestamp) {
        if (!startTime) startTime = timestamp;
        let progress = timestamp - startTime;
        let percentage = Math.min(progress / duration, 1);
        let easedPercentage = percentage * (2 - percentage);
        current = Math.floor(start + (range * easedPercentage));
        obj.innerHTML = current + suffix;
        if (progress < duration) { window.requestAnimationFrame(step); } else { obj.innerHTML = end + suffix; }
    }
    window.requestAnimationFrame(step);
}

// ==========================================
// 12. МОДАЛЬНОЕ ОКНО СОТРУДНИКА
// ==========================================
function openEmployeeModal(empName) {
    const modal = document.getElementById('employee-modal');
    if (!modal) return;

    modal.style.display = 'flex';
    document.body.classList.add('modal-open'); // <-- ДОБАВИТЬ СЮДА (блокируем скролл)
    currentModalEmp = empName;
    currentModalPeriod = 'global'; // Сбрасываем фильтр при открытии

    // Сбрасываем активные кнопки фильтров
    document.querySelectorAll('.m-filter-btn').forEach(b => b.classList.remove('active'));
    document.querySelector('.m-filter-btn[data-mperiod="global"]').classList.add('active');

    renderModalData();
}

function renderModalData() {
    if (!currentModalEmp) return;

        // --- ПРОВЕРКА КУРАТОРА (ОТОБРАЖЕНИЕ КНОПКИ) ---
    const empShortName = getShortName(currentModalEmp);
    let hasDtz = false;
    if (window.allDtzData && window.allDtzData.length > 0) {
        hasDtz = window.allDtzData.some(row => {
            const isTMC = row[3] === 'ТМЦ';
            let curator = String(row[4] || '').trim();
            const isRealCurator = curator !== '' && curator.toLowerCase() !== 'nan' && curator !== 'Не указан';
            
            if (isTMC && isRealCurator) {
                return getShortName(curator) === empShortName; // <--- ЗДЕСЬ ТОЖЕ ДОЛЖНО БЫТЬ empShortName
            }
            return false;
        });
    }
    const dtzBtnContainer = document.getElementById('emp-dtz-btn-container');
    if (dtzBtnContainer) {
        dtzBtnContainer.style.display = hasDtz ? 'block' : 'none';
    }

    const title = document.getElementById('modal-title');
    const role = document.getElementById('modal-role');
    const avatar = document.getElementById('modal-avatar');
    const chartCanvas = document.getElementById('employeeChart');
    const sedBlock = document.getElementById('modal-sed-block');
    const sedCanvas = document.getElementById('sedChart');

    // 1. Обновляем шапку (ФИО, Должность, Аватар)
    title.innerText = `Статистика: ${currentModalEmp}`;
    role.innerText = jobTitles[currentModalEmp] || 'Сотрудник';
    
    let parts = currentModalEmp.split(' ');
    let initials = (parts[0] ? parts[0][0] : '') + (parts[1] ? parts[1][0] : '');
    avatar.innerText = initials;
    avatar.style.backgroundColor = getAvatarColor(currentModalEmp)

            // 2. Определяем даты фильтрации для модального окна
    let startDate = new Date(0);
    let endDate = new Date(8640000000000000);
    
    if (currentModalPeriod !== 'global') {
        let maxDate = new Date(0);
        allLoadedData1C.forEach(row => { if (row._parsedDate && row._parsedDate > maxDate) maxDate = row._parsedDate; });
        allLoadedDataSED.forEach(row => { if (row._parsedDate && row._parsedDate > maxDate) maxDate = row._parsedDate; });
        
        if (currentModalPeriod === 'week') {
            startDate = new Date(maxDate); startDate.setDate(startDate.getDate() - 7); endDate = maxDate;
        } else if (currentModalPeriod === 'month') {
            startDate = new Date(maxDate); startDate.setMonth(startDate.getMonth() - 1); endDate = maxDate;
        } else if (currentModalPeriod === 'year') {
            startDate = new Date(maxDate); startDate.setFullYear(startDate.getFullYear() - 1); endDate = maxDate;
        } else if (currentModalPeriod === 'custom') {
            const startVal = document.getElementById('modal-date-start')?.value;
            const endVal = document.getElementById('modal-date-end')?.value;
            if (startVal) startDate = parseLocalDate(startVal);
            if (endVal) { endDate = parseLocalDate(endVal); endDate.setHours(23, 59, 59, 999); }
        }
    }

    // 3. Фильтруем данные для конкретного сотрудника
    let empData1C = {};
    allLoadedData1C.forEach(row => {
        const keys = Object.keys(row);
        let empKey = keys.find(k => k.trim().toLowerCase().includes('ответствен'));
        let rowEmp = empKey ? String(row[empKey]).trim() : String(row[keys[2]] || 'Неизвестный');
        
                if (rowEmp === currentModalEmp) {
            if (currentModalPeriod !== 'global') {
                if (!row._parsedDate || row._parsedDate < startDate || row._parsedDate > endDate) return;
            }
            let typeKey = keys.find(k => k.trim().toLowerCase().includes('тип'));
            let docType = typeKey ? String(row[typeKey]).trim() : String(row[keys[0]] || 'Другой');
            if (!empData1C[docType]) empData1C[docType] = 0;
            empData1C[docType]++;
        }
    });

    let empDataSED = [];
    let shortName = getShortName(currentModalEmp);
        allLoadedDataSED.forEach(row => {
        let rawName = String(row['Сотрудник'] || '').trim();
        if (getShortName(rawName) === shortName) {
            if (currentModalPeriod !== 'global') {
                if (!row._parsedDate || row._parsedDate < startDate || row._parsedDate > endDate) return;
            }
            empDataSED.push(row);
        }
    });

    // 4. Рисуем график 1С
    const labels = Object.keys(empData1C);
    const values = Object.values(empData1C);
    if (modalChartInstance) { modalChartInstance.destroy(); }
    
    if (labels.length > 0) {
        const ctxModal = chartCanvas.getContext('2d');
        const chartData = labels.map((label, index) => { return { label: label, value: values[index], color: docColorMap[label] || '#999999' }; }).sort((a, b) => b.value - a.value);

        modalChartInstance = new Chart(ctxModal, {
            type: 'bar', 
            data: { labels: chartData.map(d => d.label), datasets: [{ data: chartData.map(d => d.value), backgroundColor: chartData.map(d => d.color), borderRadius: 4, borderSkipped: false }] },
            options: {
                indexAxis: 'y', responsive: true, maintainAspectRatio: false,
                layout: { padding: { top: 10, bottom: 10, left: 20, right: 40 } },
                scales: { 
                    x: { display: false, beginAtZero: true }, 
                    y: { ticks: { font: { size: 12 }, color: getTextColor() }, grid: { display: false } } 
                },
                plugins: { legend: { display: false }, tooltip: { callbacks: { label: function(context) { return ` ${context.raw} шт.`; } } } }
            },
            plugins: [barLabelsPlugin] 
        });
    } else {
        // Если данных нет (например, за выбранную неделю сотрудник ничего не делал)
        const ctxModal = chartCanvas.getContext('2d');
        ctxModal.clearRect(0, 0, chartCanvas.width, chartCanvas.height);
        ctxModal.font = "16px Arial";
        ctxModal.fillStyle = getTextColor();
        ctxModal.textAlign = "center";
        ctxModal.fillText("Нет проведенных документов за этот период", chartCanvas.width/2, chartCanvas.height/2);
    }

           // 5. Рисуем блок СЭД
    if (sedBlock && sedCanvas) {
        let total = empDataSED.length;
        
        // Если задач нет — скрываем блок и НЕ рисуем пустой график
        if (total === 0) {
            sedBlock.style.display = 'none';
        } else {
            sedBlock.style.display = 'block'; 
            
            let inTime = 0, late = 0, inWork = 0;
            
            empDataSED.forEach(r => {
                let delayVal = String(r['Задержка, раб.дней'] || r['Задержка'] || '').trim();
                let completedVal = r['Выполнено']; 
                let hasDelay = delayVal && parseInt(delayVal) > 0;
                let isCompleted = completedVal && String(completedVal).trim() !== '';
                if (hasDelay) late++;
                else if (isCompleted) inTime++;
                else inWork++;
            });
            
            let closed = inTime + late;
            let discipline = closed > 0 ? Math.round((inTime / closed) * 100) : 0;

            const setTxt = (id, txt) => { const el = document.getElementById(id); if (el) el.innerText = txt; };
            setTxt('modal-sed-total', total);
            setTxt('modal-sed-inwork', inWork);
            setTxt('modal-sed-intime', inTime);
            setTxt('modal-sed-late', late);

            const discColor = getDisciplineColor(discipline);
            const discText = `${discipline}%`;

            if (sedChartInstance) { sedChartInstance.destroy(); }
            const ctxSed = sedCanvas.getContext('2d');
            
            sedChartInstance = new Chart(ctxSed, {
                type: 'doughnut',
                data: {
                    labels: ['В срок', 'С нарушением', 'К исполнению'],
                    datasets: [{ data: [inTime, late, inWork], backgroundColor: ['#2E7D32', '#D32F2F', '#0288D1'], borderWidth: 1 }]
                },
                options: {
                    responsive: true, maintainAspectRatio: false, cutout: '65%', 
                    plugins: {
                        legend: { display: false }, 
                        tooltip: { callbacks: { label: function(context) { return ` ${context.label}: ${context.raw} шт.`; } } },
                        sedCenterText: { value: discText, color: discColor }
                    }
                },
                plugins: [sedCenterTextPlugin] 
            });
        }
    }
}

const closeModalBtn = document.getElementById('close-modal');
if (closeModalBtn) {
    closeModalBtn.addEventListener('click', function() { 
        const modal = document.getElementById('employee-modal');
        if (modal) modal.style.display = 'none'; 
        document.body.classList.remove('modal-open'); // <-- ДОБАВИТЬ СЮДА
    });
}

window.addEventListener('click', function(event) { 
    let modal = document.getElementById('employee-modal'); 
    if (modal && event.target === modal) { 
        modal.style.display = 'none'; 
        document.body.classList.remove('modal-open'); // <-- ДОБАВИТЬ СЮДА
    } 
});

// ==========================================
// 13. АВТОМАТИЧЕСКАЯ ЗАГРУЗКА И ЧАСЫ
// ==========================================
document.addEventListener("DOMContentLoaded", function() {
    
        // --- ПРИМЕНЯЕМ ТЕМУ (ПОЛЬЗОВАТЕЛЬ ИЛИ РАСПИСАНИЕ) ---
    function setInitialTheme() {
        const savedTheme = localStorage.getItem('dashboard-theme');
        const isNight = new Date().getHours() >= 20 || new Date().getHours() < 6;
        const isManualOverride = sessionStorage.getItem('theme-manual-override');

        // Если ночь, и пользователь еще не переключал тему вручную в этой сессии
        if (isNight && !isManualOverride) {
            applyTheme('dark');
            // Показываем подсказку с задержкой (чтобы прелоадер успел исчезнуть)
            setTimeout(() => {
                const toast = document.getElementById('theme-toast');
                if (toast) {
                    toast.classList.add('show');
                    // Скрываем через 6 секунд
                    setTimeout(() => toast.classList.remove('show'), 6000);
                }
            }, 3500); 
        } else if (savedTheme) {
            // Если сейчас день ИЛИ пользователь уже переключил тему, уважаем память
            applyTheme(savedTheme);
        } else {
            // Если памяти нет и это день
            applyTheme('light');
        }
    }
    
    setInitialTheme();

                // Проверка времени каждые 10 минут
    setInterval(() => {
        const isManualOverride = sessionStorage.getItem('theme-manual-override');
        if (!isManualOverride) {
            const currentHour = new Date().getHours();
            const isNight = currentHour >= 20 || currentHour < 6;
            const isDarkNow = document.body.classList.contains('dark-theme');
            
            // Включаем темную ТОЛЬКО если наступил вечер/ночь
            if (isNight && !isDarkNow) {
                applyTheme('dark');
                if (typeof currentFiltered1C !== 'undefined') processData();
                
                const toast = document.getElementById('theme-toast');
                if (toast) {
                    toast.classList.add('show');
                    setTimeout(() => toast.classList.remove('show'), 6000);
                }
            }
            
            // УБРАЛИ ветку else if (!isNight && isDarkNow), 
            // чтобы днем тема не переключалась насильно, если вкладка открыта!
        }
    }, 600000); // 10 минут
    // ----------------------------------------------------

    function startClock() {
        // ... (дальше идет ваш существующий код часов)
        const clockElement = document.getElementById('live-clock');
        const updateElement = document.getElementById('update-date');
        if (!clockElement || !updateElement) return;

        const modDate = new Date(document.lastModified);
        const optionsDate = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        updateElement.innerText = modDate.toLocaleString('ru-RU', optionsDate);

        function updateTime() {
            const now = new Date();
            const optionsTime = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', timeZoneName: 'short' };
            clockElement.innerText = now.toLocaleString('ru-RU', optionsTime);
        }
        updateTime(); 
        setInterval(updateTime, 1000); 
    }
    startClock();

        // --- РАСПАКОВКА ОПТИМИЗИРОВАННЫХ ДАННЫХ ---
    if (typeof window.bakedData1C === 'string' && typeof window.bakedDataSED === 'string') {
        console.log("✅ Найдены сжатые данные. Начинаем распаковку...");
        const fileArea = document.getElementById('dev-tools');
        if (fileArea) fileArea.style.display = 'none';
        
        try {
            if (typeof LZString === 'undefined') {
                throw new Error("Библиотека LZString не загружена! Проверь <head> и build.py");
            }

            // Восстанавливаем 1С
            if (window.bakedData1C) {
                const raw1C = JSON.parse(LZString.decompressFromBase64(window.bakedData1C));
                    window.bakedData1C = raw1C.map(row => ({
                    "Дата": row[0],
                    "Тип": window.bakedTypes[row[1]],
                    "Ответственный": window.bakedEmployees[row[2]],
                    "Дней согласования": row[3] || 0,
                    "Organization": row[4] || "Не указана", // <-- ЗАМЕНИЛИ
                    _parsedDate: parseExcelDate(row[0])
                    
                }));
            if (window.bakedProblemSoglas && typeof window.bakedProblemSoglas === 'string') {
                const rawProblem = JSON.parse(LZString.decompressFromBase64(window.bakedProblemSoglas));
                window.bakedProblemSoglas = rawProblem.map(row => ({
                    date: row[0],
                    emp: row[1],
                    days: row[2],
                    predmet: row[3]
                }));
            }
            }
            
            // Восстанавливаем СЭД
            if (window.bakedDataSED) {
                const rawSED = JSON.parse(LZString.decompressFromBase64(window.bakedDataSED));
                window.bakedDataSED = rawSED.map(row => ({
                    "Тема": row[0],
                    "Автор задачи": row[1],
                    "Создано": row[2],
                    "Срок": row[3],
                    "Выполнено": row[4],
                    "Задержка, раб.дней": row[5],
                    "Сотрудник": window.bakedEmployees[row[6]],
                    _parsedDate: parseExcelDate(row[2])
                }));
            }

            // Восстанавливаем Отпуска
            if (window.bakedDataVacations && typeof window.bakedDataVacations === 'string') {
                window.bakedDataVacations = JSON.parse(LZString.decompressFromBase64(window.bakedDataVacations));
            }
            if (window.bakedDataVacSummary && typeof window.bakedDataVacSummary === 'string') {
                window.bakedDataVacSummary = JSON.parse(LZString.decompressFromBase64(window.bakedDataVacSummary));
            }
            
        } catch (e) {
            console.error("❌ Ошибка распаковки данных:", e);
        }

        // Переносим в глобальные массивы
        if (window.bakedData1C && Array.isArray(window.bakedData1C)) {
            allLoadedData1C = window.bakedData1C.filter(row => row._parsedDate && row._parsedDate.getFullYear() >= MIN_ALLOWED_YEAR);
            console.log(`📊 Загружено 1С: ${allLoadedData1C.length} строк`);
        }
        if (window.bakedDataSED && Array.isArray(window.bakedDataSED)) {
            allLoadedDataSED = window.bakedDataSED.filter(row => row._parsedDate && row._parsedDate.getFullYear() >= MIN_ALLOWED_YEAR);
            console.log(`📊 Загружено СЭД: ${allLoadedDataSED.length} строк`);
        }
        
        if (allLoadedData1C.length > 0 || allLoadedDataSED.length > 0) calculateYearlyTotal();
        
        const statusEl = document.getElementById('file-status');
        if (statusEl) statusEl.innerText = "Данные обновлены автоматически";
        applyFilter('all');

        if (window.bakedDataEDO && typeof window.bakedDataEDO === 'string') {
                window.bakedDataEDO = JSON.parse(LZString.decompressFromBase64(window.bakedDataEDO));
            }
        if (window.bakedTransfers && typeof window.bakedTransfers === 'string') {
                window.bakedTransfers = JSON.parse(LZString.decompressFromBase64(window.bakedTransfers));
            }
        if (window.bakedZakupSoglas && typeof window.bakedZakupSoglas === 'string') {
            window.bakedZakupSoglas = JSON.parse(LZString.decompressFromBase64(window.bakedZakupSoglas));
            }
        if (window.bakedAchievementsArchive && typeof window.bakedAchievementsArchive === 'string') {
            try {
                window.bakedAchievementsArchive = JSON.parse(LZString.decompressFromBase64(window.bakedAchievementsArchive));
            } catch (e) {
                console.error("Ошибка распаковки архива:", e);
                window.bakedAchievementsArchive = [];
            }
        }
        if (window.bakedDiadokMatches && typeof window.bakedDiadokMatches === 'string') {
                window.bakedDiadokMatches = JSON.parse(LZString.decompressFromBase64(window.bakedDiadokMatches));
            }
            if (window.bakedDiadokBlind && typeof window.bakedDiadokBlind === 'string') {
                window.bakedDiadokBlind = JSON.parse(LZString.decompressFromBase64(window.bakedDiadokBlind));
            }
    }
});

// ==========================================
// 14. ИНТЕРФЕЙС (ТЕМА, ПЕЧАТЬ, СПРАВОЧНИКИ)
// ==========================================
// Функция для применения темы (чтобы не дублировать код)
function applyTheme(theme) {
    const themeBtn = document.getElementById('theme-toggle-btn');
    if (theme === 'dark') {
        document.body.classList.add('dark-theme');
        if (themeBtn) themeBtn.innerText = '☀️ Светлая тема';
    } else {
        document.body.classList.remove('dark-theme');
        if (themeBtn) themeBtn.innerText = '🌙 Тёмная тема';
    }
}

const themeBtn = document.getElementById('theme-toggle-btn');
if (themeBtn) {
        themeBtn.addEventListener('click', function() {
        const isDark = document.body.classList.toggle('dark-theme');
        const newTheme = isDark ? 'dark' : 'light';
        
        // Сохраняем выбор в память
        localStorage.setItem('dashboard-theme', newTheme);
        
        // ВАЖНО: Запоминаем, что пользователь сделал выбор вручную в этой сессии
        // Это не даст автоматике перебить его выбор прямо сейчас
        sessionStorage.setItem('theme-manual-override', 'true');
        
        // Обновляем текст кнопки и перерисовываем графики
        this.innerText = isDark ? '☀️ Светлая тема' : '🌙 Тёмная тема';
        
        // Скрываем тост, если он висел на экране
        const toast = document.getElementById('theme-toast');
        if (toast) toast.classList.remove('show');
        
        if (typeof currentFiltered1C !== 'undefined') processData(); 
    });
}

window.addEventListener('beforeprint', function() {
    if (deptBarChartInstance) deptBarChartInstance.resize();
    if (sedGeneralChartInstance) sedGeneralChartInstance.resize();
    if (sedEmployeesChartInstance) sedEmployeesChartInstance.resize();
    if (dynamicsChart1CInstance) dynamicsChart1CInstance.resize();
    if (dynamicsChartSEDInstance) dynamicsChartSEDInstance.resize();
    if (heatmapChart1CInstance) heatmapChart1CInstance.resize();
    if (heatmapChartSEDInstance) heatmapChartSEDInstance.resize();
    if (heatmapChartSoglasInstance) heatmapChartSoglasInstance.resize();
    if (heatmapChartPerenosInstance) heatmapChartPerenosInstance.resize();
    if (soglasSpeedChartInstance) soglasSpeedChartInstance.resize();
    if (soglasEmpChartInstance) soglasEmpChartInstance.resize();
    if (perenosEmployeesChartInstance) perenosEmployeesChartInstance.resize();
    if (window.soglasOrgVolumeChartInstance) window.soglasOrgVolumeChartInstance.resize();
    if (window.soglasOrgSlaChartInstance) window.soglasOrgSlaChartInstance.resize();
});

const printBtn = document.getElementById('print-btn');
if (printBtn) {
    printBtn.addEventListener('click', function() {
        const isDark = document.body.classList.contains('dark-theme');
        
        const detailsPanel = document.getElementById('details-panel');
        const sedPanel = document.getElementById('sed-analytics-section');
        
        const wasDetailsHidden = detailsPanel && (detailsPanel.style.display === 'none' || detailsPanel.style.display === '');
        const wasSedHidden = sedPanel && (sedPanel.style.display === 'none' || sedPanel.style.display === '');

        if (detailsPanel) detailsPanel.style.display = 'block';
        if (sedPanel) sedPanel.style.display = 'flex';
        
        if (isDark) {
    document.body.classList.remove('dark-theme');
    // Перерисовываем графики с ТЁМНЫМ текстом (для белой бумаги)
    if (typeof currentFiltered1C !== 'undefined') processData();
}

setTimeout(() => {
            if (deptBarChartInstance) deptBarChartInstance.resize();
            if (sedGeneralChartInstance) sedGeneralChartInstance.resize();
            if (sedEmployeesChartInstance) sedEmployeesChartInstance.resize();
            if (dynamicsChart1CInstance) dynamicsChart1CInstance.resize();
            if (dynamicsChartSEDInstance) dynamicsChartSEDInstance.resize();
            if (heatmapChart1CInstance) heatmapChart1CInstance.resize();
            if (heatmapChartSEDInstance) heatmapChartSEDInstance.resize();
            if (perenosEmployeesChartInstance) perenosEmployeesChartInstance.resize();

            window.print(); 
            
            setTimeout(() => {
                if (isDark) document.body.classList.add('dark-theme');
                if (wasDetailsHidden && detailsPanel) detailsPanel.style.display = 'none';
                if (wasSedHidden && sedPanel) sedPanel.style.display = 'none';
                
                const expIcon = document.getElementById('expand-icon');
                const expSedIcon = document.getElementById('expand-sed-icon');
                if (expIcon) expIcon.innerText = '▼';
                if (expSedIcon) expSedIcon.innerText = '▼';
                
                if (typeof currentFiltered1C !== 'undefined') processData();
            }, 500); 
        }, 500); 
    });
}

// --- Справочник сотрудников ---
const infoModal = document.getElementById('info-modal');
const showInfoBtn = document.getElementById('show-info-btn');
const closeInfoBtn = document.getElementById('close-info-modal');

if (showInfoBtn && infoModal) {
    showInfoBtn.addEventListener('click', function(e) {
        e.preventDefault(); 
        infoModal.style.display = 'flex';
    });
}

if (closeInfoBtn && infoModal) {
    closeInfoBtn.addEventListener('click', function() {
        infoModal.style.display = 'none';
    });
}

if (infoModal) {
    window.addEventListener('click', function(event) {
        if (event.target === infoModal) { 
            infoModal.style.display = 'none'; 
        }
    });
}

// ==========================================
// 15. КАЛЕНДАРЬ И ДНИ РОЖДЕНИЯ
// ==========================================
function initBirthdays() {
    renderUpcomingBirthdays();
    renderCalendar(currentCalendarDate.getFullYear(), currentCalendarDate.getMonth());

    const prevBtn = document.getElementById('prev-month');
    const nextBtn = document.getElementById('next-month');

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            currentCalendarDate.setMonth(currentCalendarDate.getMonth() - 1);
            renderCalendar(currentCalendarDate.getFullYear(), currentCalendarDate.getMonth());
            const tooltip = document.getElementById('calendar-tooltip');
            if (tooltip) tooltip.innerText = '';
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            currentCalendarDate.setMonth(currentCalendarDate.getMonth() + 1);
            renderCalendar(currentCalendarDate.getFullYear(), currentCalendarDate.getMonth());
            const tooltip = document.getElementById('calendar-tooltip');
            if (tooltip) tooltip.innerText = '';
        });
    }
}

function renderUpcomingBirthdays() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let upcoming = [];

    for (let name in birthdays) {
        let parts = birthdays[name].split('.');
        let bday = new Date(today.getFullYear(), parts[1] - 1, parts[0]);
        
        if (bday < today) {
            bday.setFullYear(today.getFullYear() + 1);
        }
        
        let diffTime = Math.abs(bday - today);
        let diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        upcoming.push({ name: name, date: bday, daysLeft: diffDays });
    }

    upcoming.sort((a, b) => a.daysLeft - b.daysLeft);

    const listDiv = document.getElementById('upcoming-list');
    if (!listDiv) return;
    listDiv.innerHTML = '';

    let toShow = upcoming.filter(u => u.daysLeft <= 30);
    
    if (toShow.length === 0) {
        listDiv.innerHTML = '<div style="color: var(--text-muted); padding: 5px;">В ближайшие 30 дней дней рождения нет.</div>';
        return; // Останавливаем выполнение, чтобы не показывать далекие даты
    }

    let lastShownDate = null;

    toShow.forEach(u => {
        if (toShow.length > 1 && lastShownDate && Math.abs(u.date - lastShownDate) < (14 * 24 * 60 * 60 * 1000)) return;
        
        const dateStr = `${u.date.getDate()} ${monthNamesGenitive[u.date.getMonth()]}`;
        let text = u.daysLeft === 0 ? "Сегодня!" : `через ${u.daysLeft} дн.`;
        
        const p = document.createElement('div');
        p.style.marginBottom = '8px';
        p.innerHTML = `🎂 <strong>${dateStr}</strong> — ${u.name.split(' ').slice(0,2).join(' ')} (${text})`;
        listDiv.appendChild(p);
        
        lastShownDate = u.date;
    });

    if (listDiv.innerHTML === '') {
        listDiv.innerHTML = 'В ближайший месяц дней рождения нет.';
    }
}

function renderCalendar(year, month) {
    const monthNamesNominative = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"];
    const monthHeader = document.getElementById('calendar-month-year');
    if (monthHeader) monthHeader.innerText = `${monthNamesNominative[month]} ${year}`;

    const grid = document.getElementById('calendar-grid');
    if (!grid) return;
    grid.innerHTML = '';

    const daysOfWeek = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
    daysOfWeek.forEach(d => {
        const el = document.createElement('div');
        el.className = 'calendar-day header';
        el.innerText = d;
        grid.appendChild(el);
    });

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    let startDayIndex = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;

    for (let i = 0; i < startDayIndex; i++) {
        const el = document.createElement('div');
        el.className = 'calendar-day other-month';
        grid.appendChild(el);
    }

    for (let day = 1; day <= lastDay.getDate(); day++) {
        const el = document.createElement('div');
        el.className = 'calendar-day';
        el.innerText = day;
        // ПРОВЕРКА НА СЕГОДНЯШНИЙ ДЕНЬ
            const today = new Date();
            if (day === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
                el.style.outline = '2px solid var(--brand-orange)';
                el.style.fontWeight = 'bold';
                el.style.boxShadow = '0 0 8px rgba(229, 107, 31, 0.5)';
            }

        let bdayNames = [];
        for (let name in birthdays) {
            let parts = birthdays[name].split('.');
            if (parseInt(parts[0]) === day && (parseInt(parts[1]) - 1) === month) {
                bdayNames.push(name);
            }
        }

        if (bdayNames.length > 0) {
            el.classList.add('has-birthday');
            el.title = "День рождения!";
            
            el.addEventListener('click', () => {
                let names = bdayNames.map(n => n.split(' ').slice(0,2).join(' ')).join(', ');
                const tooltip = document.getElementById('calendar-tooltip');
                if (tooltip) tooltip.innerText = `🎉 ${day} ${monthNamesGenitive[month]}: ${names}`;
            });
        }

        grid.appendChild(el);
    }
}

// ==========================================
// 16. АВТОМАТИЧЕСКИЙ РАСЧЕТ ВОЗРАСТА
// ==========================================
function updateAges() {
    const cells = document.querySelectorAll('.dob-cell');
    const today = new Date();

    cells.forEach(cell => {
        const originalDateStr = cell.getAttribute('data-original-date') || cell.innerText.trim();
        cell.setAttribute('data-original-date', originalDateStr);

        const parts = originalDateStr.split('.');
        if (parts.length === 3) {
            const bDay = parseInt(parts[0], 10);
            const bMonth = parseInt(parts[1], 10) - 1; 
            const bYear = parseInt(parts[2], 10);

            let age = today.getFullYear() - bYear;
            
            const m = today.getMonth() - bMonth;
            if (m < 0 || (m === 0 && today.getDate() < bDay)) {
                age--;
            }

            const suffix = getAgeSuffix(age);
            
            cell.innerHTML = `${originalDateStr} <span style="color: var(--text-muted); font-size: 13px;">(${age} ${suffix})</span>`;
        }
    });
}

// ==========================================
// 17. КАРТА АКТИВОВ (SVG) С ТЕМПЕРАТУРОЙ
// ==========================================
document.addEventListener("DOMContentLoaded", function() {
    const mapModal = document.getElementById('map-modal');
    const showMapBtn = document.getElementById('show-map-btn');
    const closeMapBtn = document.getElementById('close-map-modal');
    const pointsContainer = document.getElementById('map-points-container');

    if (!mapModal || !showMapBtn) return;

        const mapPoints = [
        { 
            x: 51.2, y: 80.4, title: "Благовещенск", lat: 50.259, lon: 127.517,
            location: "Амурская область, г. Благовещенск. Административный центр региона.",
            orgs: [
                {
                    name: "Атлас Майнинг, ООО",
                    address: "ул. Ленина, д. 140/1",
                    desc: "Один из крупнейших российских золотодобывающих холдингов. Производственные активы (рудники и комплексы) сосредоточены в Амурской области."
                },
                {
                    name: "Регис НПГФ, ООО",
                    address: "Западный промышленный узел, ул. Промышленная, д. 3",
                    desc: "Крупнейшая в Дальневосточном регионе геологоразведочная компания. Основной профиль: Проведение полного спектра геологоразведочных, геофизических и геохимических работ в области изучения недр и воспроизводства минерально-сырьевой базы (ОКВЭД 71.12.3)."
                },
                {
                    name: "БРМЗ, ООО",
                    address: "ул. Калинина, д. 137",
                    desc: "Производственное предприятие в Амурской области, работающее с 1945 года. Изготовление металлоконструкций, производство навесного оборудования для спецтехники, ремонт агрегатов и узлов (КамАЗ, БелАЗ, Komatsu, Volvo, Cummins), литейное производство, плазменная и кислородная резка с ЧПУ."
                }
            ]
        },
        { 
            x: 49.6, y: 40.7, title: "Покровский горный колледж", lat: 53.754, lon: 127.180,
            location: "Амурская область, г. Зея, ул. Золотогорское шоссе, д. 6.",
            orgs: [
                {
                    name: "Покровский горный колледж, ЧНПОУ",
                    address: "г. Зея",
                    desc: "Частное образовательное учреждение среднего профессионального образования, ориентированное на подготовку кадров для горнодобывающей промышленности. Практическая подготовка студентов тесно связана с реальной производственной базой предприятий группы."
                }
            ]
        },
        { 
            x: 45.7, y: 47.6, title: "Покровский рудник", lat: 53.236, lon: 126.352,
            location: "480 км от Благовещенска.",
            orgs: [
                {
                    name: "Покровский рудник, АО",
                    address: "Покровский рудник",
                    desc: "Предприятие основано в 1999 году. На базе рудника создан Покровский автоклавно-гидрометаллургический комплекс (ПАГК), запущенный в декабре 2018 года. Один из двух крупнейших в России центров по переработке упорных золотосодержащих руд и концентратов. Руда добывается из трех карьеров. Мощность: 6,7 млн тонн руды в год, 500 тыс. тонн флотоконцентрата в год."
                }
            ]
        },
        { 
            x: 63.7, y: 54.9, title: "Транзит", lat: 52.429, lon: 130.866,
            location: "Амурская область, Селемджинский район, пгт Февральск, улица Высоцкого, д. 1.",
            orgs: [
                {
                    name: "Транзит, ООО",
                    address: "пгт Февральск",
                    desc: "Основной вид деятельности: транспортная обработка грузов, логистика и обеспечение производственных объектов группы. Компания обеспечивает перевозки и работу с товарно-материальными ценностями для рудников и подразделений холдинга (включая Албынский и Маломырский рудники)."
                }
            ]
        },
        { 
            x: 67.0, y: 50.0, title: "Маломырский рудник", lat: 53.031, lon: 131.670,
            location: "Регион: Амурская область, Селемджинский район. В бассейне рек Малый Икур и Селемджа, примерно в 40 км к северу от посёлка Стойба и в 166 км от ж/д станции Февральск. 590 км от Благовещенска.",
            orgs: [
                {
                    name: "Маломырский рудник, ООО",
                    address: "Селемджинский район",
                    desc: "Основной вид деятельности: Добыча (открытым и подземным способами) и переработка природного золота. Предприятие располагает мощной золотоизвлекательной фабрикой (ЗИФ) с отделениями флотации и переработки. Приобретено «Атлас Майнингом» в 2003 году на стадии «гринфилд». 2010 год — начало производства. Мощность переработки: 5,8 млн тонн руды в год."
                }
            ]
        },
        { 
            x: 74.1, y: 49.5, title: "Албынский рудник", lat: 52.929, lon: 133.564,
            location: "Регион: Амурская область, Селемджинский район. Находится в восточной части области, в верховьях ручья Албын (приток реки Харга), рядом с поселком Златоустовск и вахтовым поселком Албын. Удален от Благовещенска примерно на 720 км.",
            orgs: [
                {
                    name: "Албынский рудник, ООО",
                    address: "Селемджинский район",
                    desc: "Введен в эксплуатацию в 2011 году. Самое молодое предприятие «Атлас Майнинг» и крупнейшее предприятие Группы по неупорной ресурсной базе. Ведется разработка трех граничащих лицензионных участков, которые охватывают несколько рудных тел в пределах четырех ключевых месторождений: Албынского, Эльгинского, Унгличикского и Афанасьевского. ЗИФ способна перерабатывать до 4,7 млн тонн руды в год."
                },
                {
                    name: "ТЭМИ, ООО",
                    address: "месторождение Албын",
                    desc: "Основной вид деятельности: Добыча руд и песков драгоценных металлов (золота, серебра, платины). Ключевые активы / проекты: Разработка Эльгинского рудного поля, Албынского кластера и геологоразведка на Угличиканском месторождении в Амурской области."
                }
            ]
        }
    ];

    async function fetchTemperature(lat, lon) {
    // ВСТАВЬТЕ СЮДА ВАШ КЛЮЧ OPENWEATHERMAP
    const API_KEY = 'd5146448d6b4e9fba475a9be8e3181b2';
    
    try {
        const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=ru`;
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP ошибка: ${response.status}`);
        const data = await response.json();
        
        // В ответе OpenWeatherMap температура лежит в data.main.temp
        if (data.main && data.main.temp !== undefined) {
            return Math.round(data.main.temp) + '°C';
        }
        return null;
    } catch (error) {
        console.error("Ошибка загрузки погоды:", error);
        return null;
    }
}

        function renderMapPoints() {
        pointsContainer.innerHTML = ''; 
        
        // Удаляем старые тултипы, если они остались с прошлого раза
        document.querySelectorAll('.city-tooltip-body').forEach(t => t.remove());

        mapPoints.forEach(point => {
            const el = document.createElement('div');
            el.className = 'map-point';
            el.style.left = `${point.x}%`;
            el.style.top = `${point.y}%`;

            // --- СОЗДАЕМ ТУЛТИП ОТДЕЛЬНО И ДОБАВЛЯЕМ В BODY ---
            const tooltip = document.createElement('div');
            tooltip.className = 'city-tooltip city-tooltip-body';
            
            let orgsHtml = '';
            point.orgs.forEach(org => {
                orgsHtml += `
                    <div class="org-block">
                        <div class="org-name">${org.name}</div>
                        <div class="org-address">${org.address}</div>
                        <div class="org-desc">${org.desc}</div>
                    </div>
                `;
            });

            tooltip.innerHTML = `
                <div class="city-title">${point.title}</div>
                <div class="city-loc">📍 ${point.location}</div>
                <div class="orgs-container">${orgsHtml}</div>
                <div class="weather-info" style="display: none;"></div>
            `;
            
            // Добавляем тултип прямо в body, чтобы никакие окна его не обрезали
            document.body.appendChild(tooltip);

            // --- ОБРАБОТЧИК НАВЕДЕНИЯ ---
            let hideTimeout;
            el.addEventListener('mouseenter', async () => {
                clearTimeout(hideTimeout);
                tooltip.style.display = 'block';

                const rect = el.getBoundingClientRect();
                
                // Центрируем по горизонтали
                tooltip.style.left = `${rect.left + rect.width / 2}px`;
                
                // Открываем вверх или вниз в зависимости от положения на экране
                if (rect.top > window.innerHeight / 2) {
                    tooltip.style.top = `${rect.top}px`;
                    tooltip.style.transform = 'translate(-50%, calc(-100% - 15px))';
                    tooltip.classList.remove('tooltip-down');
                } else {
                    tooltip.style.top = `${rect.bottom}px`;
                    tooltip.style.transform = 'translate(-50%, 15px)';
                    tooltip.classList.add('tooltip-down');
                }

                // Загрузка погоды
                const weatherDiv = tooltip.querySelector('.weather-info');
                if (!weatherDiv || weatherDiv.dataset.loaded) return;

                weatherDiv.innerText = '🌡️ Загрузка...';
                weatherDiv.style.display = 'block';

                const temp = await fetchTemperature(point.lat, point.lon);
                
                if (temp) {
                    weatherDiv.innerText = `🌡️ Сейчас: ${temp}`;
                } else {
                    weatherDiv.innerText = '🌡️ Нет данных';
                }
                weatherDiv.dataset.loaded = 'true';
            });

            el.addEventListener('mouseleave', () => {
                // Запускаем таймер: скрыть окно через 300 миллисекунд
                hideTimeout = setTimeout(() => {
                    tooltip.style.display = 'none';
                }, 300); 
            });

            // Когда мышка заходит на само окно (чтобы прокрутить)
            tooltip.addEventListener('mouseenter', () => {
                clearTimeout(hideTimeout); // Отменяем скрытие! Окно остается открытым
            });

            // Когда мышка уходит с окна
            tooltip.addEventListener('mouseleave', () => {
                tooltip.style.display = 'none'; // Тут можно скрывать сразу
            });

            pointsContainer.appendChild(el);
        });
    }

    showMapBtn.addEventListener('click', function(e) {
        e.preventDefault();
        mapModal.style.display = 'flex';
        renderMapPoints(); 
    });

    if (closeMapBtn) {
        closeMapBtn.addEventListener('click', function() {
            mapModal.style.display = 'none';
        });
    }

    window.addEventListener('click', function(event) {
        if (event.target === mapModal) { 
            mapModal.style.display = 'none'; 
        }
    });
});

// ==========================================
// 18. ЭКСПОРТ В EXCEL (С КАРТИНКАМИ-ДИАГРАММАМИ)
// ==========================================
async function generateChartImage(chartConfig, width = 600, height = 400) {
    return new Promise((resolve) => {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        const chart = new Chart(ctx, chartConfig);
        setTimeout(() => {
            const base64Image = canvas.toDataURL('image/png');
            chart.destroy();
            resolve(base64Image);
        }, 500);
    });
}

const excelBtn = document.getElementById('excel-btn');
if (excelBtn) {
    excelBtn.addEventListener('click', async function() {
        if (currentFiltered1C.length === 0 && currentFilteredSED.length === 0) {
            alert("Нет данных для экспорта.");
            return;
        }

        const originalText = this.innerText;
        this.innerText = '⏳ Формирование...';
        this.disabled = true;

        try {
            const workbook = new ExcelJS.Workbook();
            
            // --- ЛИСТ 1: АНАЛИЗ ДОКУМЕНТОВ 1С ---
            const ws1C = workbook.addWorksheet('Документы 1С');
            ws1C.mergeCells('A1:E2');
            const titleCell = ws1C.getCell('A1');
            titleCell.value = 'Анализ документов 1С по сотрудникам';
            titleCell.font = { size: 16, bold: true, color: { argb: 'FFE56B1F' } };
            titleCell.alignment = { vertical: 'middle', horizontal: 'center' };

            let empTotals = {};
            currentFiltered1C.forEach(row => {
                const keys = Object.keys(row);
                let empKey = keys.find(k => k.trim().toLowerCase().includes('ответствен'));
                let empName = empKey ? String(row[empKey]).trim() : String(row[keys[2]] || 'Неизвестный');
                if (!empTotals[empName]) empTotals[empName] = 0;
                empTotals[empName]++;
            });

            let empsList = Object.keys(empTotals).sort((a, b) => empTotals[b] - empTotals[a]);

            let pivotData = {}; 
            let typeTotals = {};

            currentFiltered1C.forEach(row => {
                const keys = Object.keys(row);
                let empKey = keys.find(k => k.trim().toLowerCase().includes('ответствен'));
                let empName = empKey ? String(row[empKey]).trim() : String(row[keys[2]] || 'Неизвестный');
                let typeKey = keys.find(k => k.trim().toLowerCase().includes('тип'));
                let docType = typeKey ? String(row[typeKey]).trim() : String(row[keys[0]] || 'Другой');

                if (!pivotData[empName]) pivotData[empName] = {};
                if (!pivotData[empName][docType]) pivotData[empName][docType] = 0;
                pivotData[empName][docType]++;

                if (!typeTotals[docType]) typeTotals[docType] = 0;
                typeTotals[docType]++;
            });

            let sortedTypes = Object.keys(typeTotals).sort((a,b) => typeTotals[b] - typeTotals[a]);

            let headerValues = ['Сотрудник', ...sortedTypes, 'ИТОГО'];
            const headerRow = ws1C.addRow(headerValues);
            headerRow.height = 50; 

            headerRow.eachCell(cell => {
                cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE56B1F' } };
                cell.alignment = { wrapText: true, vertical: 'middle', horizontal: 'center' }; 
            });

            empsList.forEach(empName => {
                let rowValues = [empName];
                let rowTotal = 0;
                sortedTypes.forEach(docType => {
                    let val = pivotData[empName][docType] || 0;
                    rowValues.push(val);
                    rowTotal += val;
                });
                rowValues.push(rowTotal);
                
                const addedRow = ws1C.addRow(rowValues);
                let totalCell = addedRow.getCell(rowValues.length);
                totalCell.font = { bold: true };
                totalCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF3CD' } };
                totalCell.alignment = { horizontal: 'right' };
                addedRow.getCell(1).alignment = { horizontal: 'left' };
            });
            
            let rowEndIndex = ws1C.rowCount;
            ws1C.getColumn(1).width = 35;
            for(let i = 2; i <= sortedTypes.length + 2; i++) ws1C.getColumn(i).width = 16;

            let topChartTypes = sortedTypes.slice(0, 10);
            const chart1CConfig = {
                type: 'bar',
                data: {
                    labels: topChartTypes,
                    datasets: [{ label: 'Документы', data: topChartTypes.map(t => typeTotals[t]), backgroundColor: '#E56B1F' }]
                },
                options: { responsive: false, animation: false, plugins: { legend: { display: false }, title: { display: true, text: 'Топ-10 типов документов 1С', font: { size: 18 } } }, scales: { y: { beginAtZero: true } } }
            };
            const base64Img1C = await generateChartImage(chart1CConfig);
            const imageId1C = workbook.addImage({ base64: base64Img1C, extension: 'png' });
            ws1C.addImage(imageId1C, { tl: { col: 0.5, row: rowEndIndex + 3 }, ext: { width: 600, height: 400 } });


            // --- ЛИСТ 2: ЗАДАЧИ СЭД ---
            const wsSED = workbook.addWorksheet('Задачи СЭД');
            wsSED.mergeCells('A1:E2');
            wsSED.getCell('A1').value = 'Исполнительская дисциплина (СЭД)';
            wsSED.getCell('A1').font = { size: 16, bold: true, color: { argb: 'FFE56B1F' } };
            wsSED.getCell('A1').alignment = { vertical: 'middle', horizontal: 'center' };

            const sedHeader = wsSED.addRow(['ФИО Сотрудника', 'Всего задач', 'В срок', 'С нарушением', 'Дисциплина (%)']);
            sedHeader.eachCell(cell => {
                cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE56B1F' } };
                cell.alignment = { horizontal: 'center' };
            });

            let uniqueEmps = new Set(currentFilteredSED.map(r => getShortName(r['Сотрудник'] || '')));
            let sedTableData = [];
            
            uniqueEmps.forEach(shortName => {
                if(!shortName) return;
                let empTasks = currentFilteredSED.filter(r => getShortName(r['Сотрудник']) === shortName);
                let fullName = "Неизвестный";
                for (let name in jobTitles) { if (getShortName(name) === shortName) fullName = name; } 

                let inTime = 0, late = 0;
                empTasks.forEach(r => {
                    let delayVal = String(r['Задержка, раб.дней'] || r['Задержка'] || '').trim();
                    let completedVal = r['Выполнено']; 
                    let hasDelay = delayVal && parseInt(delayVal) > 0;
                    let isCompleted = completedVal && String(completedVal).trim() !== '';
                    if (hasDelay) late++;
                    else if (isCompleted) inTime++;
                });
                let closed = inTime + late;
                let disc = closed > 0 ? Math.round((inTime / closed) * 100) : 0;
                sedTableData.push({ name: fullName, total: empTasks.length, inTime: inTime, late: late, disc: disc });
            });

            sedTableData.sort((a,b) => b.disc - a.disc).forEach(data => {
                let addedRow = wsSED.addRow([data.name, data.total, data.inTime, data.late, data.disc]);
                let discCell = addedRow.getCell(5);
                if (data.disc >= 90) discCell.font = { color: { argb: 'FF2E7D32' }, bold: true };
                else if (data.disc >= 80) discCell.font = { color: { argb: 'FFF39C12' }, bold: true };
                else discCell.font = { color: { argb: 'FFD32F2F' }, bold: true };
            });

            wsSED.getColumn(1).width = 35; wsSED.getColumn(2).width = 15; wsSED.getColumn(3).width = 12; wsSED.getColumn(4).width = 15; wsSED.getColumn(5).width = 15;
            
            let totalInTimeSED = sedTableData.reduce((acc, curr) => acc + curr.inTime, 0);
            let totalLateSED = sedTableData.reduce((acc, curr) => acc + curr.late, 0);
            let totalWorkSED = sedTableData.reduce((acc, curr) => acc + (curr.total - curr.inTime - curr.late), 0);

            const chartSEDConfig = {
                type: 'doughnut',
                data: {
                    labels: ['В срок', 'С нарушением', 'В работе'],
                    datasets: [{ data: [totalInTimeSED, totalLateSED, totalWorkSED], backgroundColor: ['#2E7D32', '#D32F2F', '#0288D1'] }]
                },
                options: { responsive: false, animation: false, plugins: { legend: { position: 'right' }, title: { display: true, text: 'Статусы задач СЭД', font: { size: 18 } } } }
            };
            const base64ImgSED = await generateChartImage(chartSEDConfig, 500, 350);
            const imageIdSED = workbook.addImage({ base64: base64ImgSED, extension: 'png' });
            let sedRowEndIndex = wsSED.rowCount;
            wsSED.addImage(imageIdSED, { tl: { col: 0.5, row: sedRowEndIndex + 2 }, ext: { width: 500, height: 350 } });


            // --- ЛИСТ 3: ДИНАМИКА ---
            const wsDyn = workbook.addWorksheet('Динамика');
            wsDyn.mergeCells('A1:C2');
            wsDyn.getCell('A1').value = 'Динамика работы отдела';
            wsDyn.getCell('A1').font = { size: 16, bold: true, color: { argb: 'FFE56B1F' } };
            wsDyn.getCell('A1').alignment = { vertical: 'middle', horizontal: 'center' };

            const dynHeader = wsDyn.addRow(['Период', 'Документы 1С', 'Задачи СЭД']);
            dynHeader.eachCell(cell => {
                cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE56B1F' } };
                cell.alignment = { horizontal: 'center' };
            });

            const groupByMonth = (currentGlobalPeriod === 'year' || currentGlobalPeriod === 'halfyear' || currentGlobalPeriod === 'all');
            let dynGroups = {};
            function getMonday(d) { d = new Date(d); let day = d.getDay(); let diff = d.getDate() - day + (day === 0 ? -6 : 1); return new Date(d.setDate(diff)); }
            function addToDynGroup(date, source) {
                if (!date) return;
                let key, labelStr;
                if (groupByMonth) {
                    key = `${date.getFullYear()}-${date.getMonth()}`;
                    const monthNames = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"];
                    labelStr = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
                } else {
                    const monday = getMonday(date); key = monday.getTime();
                    const sunday = new Date(monday); sunday.setDate(monday.getDate() + 6);
                    const fmt = (d) => `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}`;
                    labelStr = `${fmt(monday)} - ${fmt(sunday)}`;
                }
                if (!dynGroups[key]) dynGroups[key] = { date: date, label: labelStr, count1C: 0, countSED: 0 };
                if (source === '1C') dynGroups[key].count1C++;
                if (source === 'SED') dynGroups[key].countSED++;
            }
            currentFiltered1C.forEach(row => { if (row._parsedDate) addToDynGroup(row._parsedDate, '1C'); });
            currentFilteredSED.forEach(row => { if (row._parsedDate) addToDynGroup(row._parsedDate, 'SED'); });

            const sortedDynKeys = Object.keys(dynGroups).sort((a, b) => {
                if (groupByMonth) { const [yearA, monthA] = a.split('-'); const [yearB, monthB] = b.split('-'); return new Date(yearA, monthA) - new Date(yearB, monthB); }
                return parseInt(a) - parseInt(b);
            });

            sortedDynKeys.forEach(key => { wsDyn.addRow([dynGroups[key].label, dynGroups[key].count1C, dynGroups[key].countSED]); });

            wsDyn.getColumn(1).width = 25; wsDyn.getColumn(2).width = 15; wsDyn.getColumn(3).width = 15;

            const chartDyn1CConfig = {
                type: 'line',
                data: { labels: sortedDynKeys.map(k => dynGroups[k].label), datasets: [{ label: 'Документы 1С', data: sortedDynKeys.map(k => dynGroups[k].count1C), borderColor: '#F1C40F', tension: 0 }] },
                options: { responsive: false, animation: false, plugins: { title: { display: true, text: 'Динамика документов 1С', font: { size: 18 } } } }
            };
            const base64ImgDyn1C = await generateChartImage(chartDyn1CConfig, 700, 300);
            const imageIdDyn1C = workbook.addImage({ base64: base64ImgDyn1C, extension: 'png' });
            let dynRowEndIndex = wsDyn.rowCount;
            wsDyn.addImage(imageIdDyn1C, { tl: { col: 0.5, row: dynRowEndIndex + 2 }, ext: { width: 700, height: 300 } });

            const chartDynSEDConfig = {
                type: 'line',
                data: { labels: sortedDynKeys.map(k => dynGroups[k].label), datasets: [{ label: 'Задачи СЭД', data: sortedDynKeys.map(k => dynGroups[k].countSED), borderColor: '#E56B1F', tension: 0 }] },
                options: { responsive: false, animation: false, plugins: { title: { display: true, text: 'Динамика задач СЭД', font: { size: 18 } } } }
            };
            const base64ImgDynSED = await generateChartImage(chartDynSEDConfig, 700, 300);
            const imageIdDynSED = workbook.addImage({ base64: base64ImgDynSED, extension: 'png' });
            wsDyn.addImage(imageIdDynSED, { tl: { col: 0.5, row: dynRowEndIndex + 18 }, ext: { width: 700, height: 300 } });

            const buffer = await workbook.xlsx.writeBuffer();
            saveAs(new Blob([buffer], { type: 'application/octet-stream' }), "Дашборд_Атлас_Майнинг.xlsx");

        } catch (error) {
            console.error("Ошибка экспорта:", error);
            alert("Произошла ошибка при создании Excel файла.");
        } finally {
            this.innerText = originalText;
            this.disabled = false;
        }
    });
}

// ==========================================
// 19. ИНИЦИАЛИЗАЦИЯ И ГЛОБАЛЬНЫЕ ОБРАБОТЧИКИ
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    initBirthdays();
    updateAges();
});

// Закрытие модальных окон по клавише Esc
window.addEventListener('keydown', function(event) {
    if (event.key === 'Escape' || event.key === 'Esc') {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            if (modal.style.display === 'flex' || modal.style.display === 'block') {
                modal.style.display = 'none';
            }
        });
        document.body.classList.remove('modal-open'); // <-- ДОБАВИТЬ СЮДА
    }
});

// ==========================================
// 20. ПАНЕЛЬ РУКОВОДИТЕЛЯ (СВЕТОФОР)
// ==========================================
document.addEventListener("DOMContentLoaded", function() {
    const managerBtn = document.getElementById('show-manager-btn');
    const managerModal = document.getElementById('manager-modal');
    const closeManagerModal = document.getElementById('close-manager-modal');
    
    const authScreen = document.getElementById('manager-auth-screen');
    const mainScreen = document.getElementById('manager-main-screen');
    const passInput = document.getElementById('manager-pass-input');
    const passSubmit = document.getElementById('manager-pass-submit');
    const authError = document.getElementById('manager-auth-error');
    
    const listContainer = document.getElementById('manager-list-container');
    const filterBtns = document.querySelectorAll('.manager-filter-btn');
    const managerDateStart = document.getElementById('manager-date-start');
    const managerDateEnd = document.getElementById('manager-date-end');
    const applyManagerCustom = document.getElementById('manager-apply-custom-date');

    let currentManagerPeriod = 'all';
    let currentManagerStart = null;
    let currentManagerEnd = null;
    let managerSoglasChartInst = null;

    if (!managerBtn || !managerModal) return;

    managerBtn.addEventListener('click', (e) => {
        e.preventDefault();
        managerModal.style.display = 'flex';
        authScreen.style.display = 'block';
        mainScreen.style.display = 'none';
        passInput.value = '';
        authError.style.display = 'none';
    });

    closeManagerModal.addEventListener('click', () => managerModal.style.display = 'none');

    passSubmit.addEventListener('click', () => {
        if (passInput.value === '1907') {
            authScreen.style.display = 'none';
            mainScreen.style.display = 'block';
            updateManagerTabs();
        } else {
            authError.style.display = 'block';
        }
    });

    passInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') passSubmit.click();
    });

    const tabButtons = document.querySelectorAll('.manager-tab-btn');
    const tabContents = document.querySelectorAll('.manager-tab-content');

    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            tabButtons.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.style.display = 'none');

            btn.classList.add('active');
            const targetId = btn.getAttribute('data-tab');
            const targetContent = document.getElementById(targetId);
            if (targetContent) targetContent.style.display = 'block';
            
            updateManagerTabs(); 
        });
    });

    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            filterBtns.forEach(b => {
                b.classList.remove('active');
                b.style.background = 'transparent';
                b.style.color = 'var(--text-main)';
            });
            this.classList.add('active');
            this.style.background = 'var(--primary-color)';
            this.style.color = 'white';
            
            if (managerDateStart) managerDateStart.value = '';
            if (managerDateEnd) managerDateEnd.value = '';

            currentManagerPeriod = this.dataset.mperiod;
            currentManagerStart = null;
            currentManagerEnd = null;
            
            updateManagerTabs(); 
        });
    });

    if (applyManagerCustom) {
        applyManagerCustom.addEventListener('click', function() {
            const startVal = managerDateStart.value;
            const endVal = managerDateEnd.value;
            
            if (!startVal && !endVal) {
                alert("Выберите хотя бы одну дату для фильтрации.");
                return;
            }

            filterBtns.forEach(b => {
                b.classList.remove('active');
                b.style.background = 'transparent';
                b.style.color = 'var(--text-main)';
            });

            currentManagerPeriod = 'custom';
            currentManagerStart = startVal;
            currentManagerEnd = endVal;
            
            updateManagerTabs(); 
        });
    }

    function updateManagerTabs() {
        renderManagerPanel(currentManagerPeriod, currentManagerStart, currentManagerEnd);
        renderManagerAuthors(currentManagerPeriod, currentManagerStart, currentManagerEnd);
        renderManagerSoglas(currentManagerPeriod, currentManagerStart, currentManagerEnd);
        renderManagerTransfers(currentManagerPeriod, currentManagerStart, currentManagerEnd);
        renderManagerZakupSoglas(currentManagerPeriod, currentManagerStart, currentManagerEnd);
    }

    function getFilteredManagerDates(period, customStart, customEnd) {
        let maxDate = new Date(0);
        
        // Ищем самую позднюю дату по всем источникам данных
        allLoadedDataSED.forEach(row => { if (row._parsedDate && row._parsedDate > maxDate) maxDate = row._parsedDate; });
        allLoadedData1C.forEach(row => { if (row._parsedDate && row._parsedDate > maxDate) maxDate = row._parsedDate; });
        
        if (window.bakedTransfers) {
            window.bakedTransfers.forEach(row => {
                const d = parseISOLocal(row[0]); 
                if (d && d > maxDate) maxDate = d;
            });
        }
        
        if (window.bakedZakupSoglas) {
            window.bakedZakupSoglas.forEach(row => {
                const d = parseISOLocal(row[3]); // Индекс 3 - Дата окончания
                if (d && d > maxDate) maxDate = d;
            });
        }

        let startDate = new Date(0);
        let endDate = new Date(8640000000000000);
        
        if (period === 'week') {
            startDate = new Date(maxDate); startDate.setDate(startDate.getDate() - 7); endDate = maxDate;
        } else if (period === 'month') {
            startDate = new Date(maxDate); startDate.setMonth(startDate.getMonth() - 1); endDate = maxDate;
        } else if (period === 'year') {
            startDate = new Date(maxDate); startDate.setFullYear(startDate.getFullYear() - 1); endDate = maxDate;
        } else if (period === 'custom') {
            if (customStart) startDate = parseLocalDate(customStart);
            if (customEnd) { endDate = parseLocalDate(customEnd); endDate.setHours(23, 59, 59, 999); }
        }
        return { startDate, endDate };
    }

    function renderManagerPanel(period, customStart = null, customEnd = null) {
        listContainer.innerHTML = '';
        let { startDate, endDate } = getFilteredManagerDates(period, customStart, customEnd);

        let filteredSED = allLoadedDataSED.filter(row => {
            if (!row._parsedDate) return false;
            return row._parsedDate >= startDate && row._parsedDate <= endDate;
        });

        let empStats = {};
        let uniqueEmps = new Set(filteredSED.map(r => getShortName(r['Сотрудник'] || '')));

        uniqueEmps.forEach(shortName => {
            if (!shortName) return;
            let empTasks = filteredSED.filter(r => getShortName(r['Сотрудник']) === shortName);
            let fullName = "Неизвестный";
            for (let name in jobTitles) { if (getShortName(name) === shortName) fullName = name; }

            let inTime = 0, late = 0, inWork = 0;
            let overdueTasks = [];

            empTasks.forEach(r => {
                let delayVal = String(r['Задержка, раб.дней'] || r['Задержка'] || '').trim();
                let completedVal = r['Выполнено']; 
                let hasDelay = delayVal && parseInt(delayVal) > 0;
                let isCompleted = completedVal && String(completedVal).trim() !== '';

                if (hasDelay) {
                    late++;
                    overdueTasks.push(r);
                } else if (isCompleted) {
                    inTime++;
                } else {
                    inWork++;
                }
            });

            if (late > 0) {
                empStats[fullName] = { total: empTasks.length, inTime, late, inWork, tasks: overdueTasks };
            }
        });

        let sortedEmps = Object.keys(empStats).sort((a, b) => empStats[b].late - empStats[a].late);

        if (sortedEmps.length === 0) {
            listContainer.innerHTML = `<div style="text-align: center; padding: 40px 20px; color: var(--text-muted); font-size: 16px; font-weight: bold;">
                🎉 Просроченные задачи за выбранный период отсутствуют. Все молодцы!
            </div>`;
            return;
        }

        sortedEmps.forEach(empName => {
            let data = empStats[empName];
            const card = document.createElement('div');
            card.className = 'manager-emp-card';

            const header = document.createElement('div');
            header.className = 'manager-emp-header';
            header.innerHTML = `
                <div class="manager-emp-name">${empName}</div>
                <div class="manager-emp-stats">
                    <span class="stat-total">Всего<br><strong>${data.total}</strong></span>
                    <span class="stat-intime">В срок<br><strong>${data.inTime}</strong></span>
                    <span class="stat-late">Просрочено<br><strong>${data.late}</strong></span>
                    <span class="stat-work">В работе<br><strong>${data.inWork}</strong></span>
                </div>
                <div class="manager-emp-toggle">▼</div>
            `;
            
            const details = document.createElement('div');
            details.className = 'manager-emp-details';
            
            let sortedTasks = data.tasks.sort((a, b) => (a._parsedDate?.getTime() || 0) - (b._parsedDate?.getTime() || 0));

            let tableHtml = `
                <table class="manager-task-table">
                    <thead>
                        <tr>
                            <th>Тема задачи</th>
                            <th>Автор</th>
                            <th>Создано</th>
                            <th>Срок</th>
                            <th>Выполнено</th>
                            <th style="text-align: right;">Задержка</th>
                        </tr>
                    </thead>
                    <tbody>
            `;

            sortedTasks.forEach(task => {
                let createdAt = task['Создано'] ? String(task['Создано']).split(' ')[0] : '—';
                let deadline = task['Срок'] ? String(task['Срок']).split(' ')[0] : '—';
                let completed = task['Выполнено'] ? String(task['Выполнено']).split(' ')[0] : '—';
                let delay = task['Задержка, раб.дней'] || task['Задержка'] || '—';
                let theme = task['Тема'] || 'Без названия';
                let author = task['Автор задачи'] || '—';

                tableHtml += `
                    <tr>
                        <td style="max-width: 300px; white-space: normal;">${theme}</td>
                        <td>${author}</td>
                        <td>${createdAt}</td>
                        <td>${deadline}</td>
                        <td>${completed}</td>
                        <td class="delay-col">+${delay} дн.</td>
                    </tr>
                `;
            });

            tableHtml += `</tbody></table>`;
            details.innerHTML = tableHtml;

            header.addEventListener('click', () => {
                const isOpen = card.classList.contains('open');
                document.querySelectorAll('.manager-emp-card').forEach(c => c.classList.remove('open'));
                if (!isOpen) card.classList.add('open');
            });

            card.appendChild(header);
            card.appendChild(details);
            listContainer.appendChild(card);
        });
    }

    function renderManagerAuthors(period, customStart = null, customEnd = null) {
        const container = document.getElementById('manager-authors-container');
        if (!container) return;
        container.innerHTML = '';

        let { startDate, endDate } = getFilteredManagerDates(period, customStart, customEnd);

        const filteredSED = allLoadedDataSED.filter(row => {
            if (!row._parsedDate) return false;
            return row._parsedDate >= startDate && row._parsedDate <= endDate;
        });

        if (filteredSED.length === 0) {
            container.innerHTML = '<div style="text-align: center; padding: 20px; color: var(--text-muted);">Нет данных за выбранный период.</div>';
            return;
        }

        let stats = {};
        let totalTasks = filteredSED.length;

        filteredSED.forEach(row => {
            let author = row['Автор задачи'] || 'Неизвестный';
            
            if (!stats[author]) stats[author] = { total: 0, shortDeadline: 0 };
            stats[author].total++;

            let createdDate = row._parsedDate;
            let deadlineStr = row['Срок'];
            if (deadlineStr) {
                let deadlineDate = parseExcelDate(deadlineStr);
                if (deadlineDate && createdDate) {
                    const diffTime = deadlineDate - createdDate;
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    if (diffDays < 2) stats[author].shortDeadline++;
                }
            }
        });

        let sortedAuthors = Object.keys(stats).sort((a, b) => stats[b].total - stats[a].total);

        let tableHtml = `
            <table class="authors-table">
                <thead>
                    <tr>
                        <th>Автор задачи</th>
                        <th style="width: 40%;">Всего задач / Доля</th>
                        <th style="text-align: center;">С коротким сроком (< 2 дн.)</th>
                    </tr>
                </thead>
                <tbody>
        `;

        sortedAuthors.forEach(author => {
            const data = stats[author];
            const pct = Math.round((data.total / totalTasks) * 100);
            
            tableHtml += `
                <tr>
                    <td style="font-weight: bold;">${author}</td>
                    <td>
                        <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 2px;">
                            <span>${data.total} шт.</span>
                            <span style="color: var(--text-muted);">${pct}%</span>
                        </div>
                        <div class="pct-bar-container">
                            <div class="pct-bar-fill" style="width: ${pct}%;"></div>
                        </div>
                    </td>
                    <td style="text-align: center;">
                        ${data.shortDeadline > 0 ? `<span class="badge-danger">${data.shortDeadline}</span>` : '<span style="color:var(--text-muted);">—</span>'}
                    </td>
                </tr>
            `;
        });

        tableHtml += `</tbody></table>`;
        container.innerHTML = tableHtml;
    }

    function renderManagerSoglas(period, customStart = null, customEnd = null) {
        const avgEl = document.getElementById('manager-soglas-avg');
        const container = document.getElementById('manager-soglas-problems');
        const canvas = document.getElementById('managerSoglasChart');
        if (!avgEl || !container || !canvas) return;

        let { startDate, endDate } = getFilteredManagerDates(period, customStart, customEnd);

        const filteredSoglas = allLoadedData1C.filter(row => {
            if (row['Тип'] !== 'Согласование строк потребности') return false;
            if (!row._parsedDate) return false;
            return row._parsedDate >= startDate && row._parsedDate <= endDate;
        });

        if (filteredSoglas.length === 0) {
            avgEl.innerText = 'Нет данных';
            container.innerHTML = '<div style="text-align: center; padding: 20px; color: var(--text-muted);">Нет данных за период.</div>';
            if (managerSoglasChartInst) managerSoglasChartInst.destroy();
            return;
        }

        let empStats = {};
        let totalDays = 0;
        let validCount = 0;

        filteredSoglas.forEach(r => {
            const days = parseInt(r['Дней согласования']) || 0;
            const emp = r['Ответственный'] || 'Неизвестный';

            totalDays += days;
            validCount++;

            if (!empStats[emp]) empStats[emp] = { totalDays: 0, count: 0 };
            empStats[emp].totalDays += days;
            empStats[emp].count++;
        });

        let problemLines = (window.bakedProblemSoglas || []).filter(p => {
            const pDate = parseExcelDate(p.date);
            return pDate && pDate >= startDate && pDate <= endDate;
        });

        const avg = validCount > 0 ? (totalDays / validCount).toFixed(1) : 0;
        avgEl.innerText = `${avg} дн.`;

        problemLines.sort((a, b) => b.days - a.days);
        
        if (problemLines.length === 0) {
            container.innerHTML = '<div style="text-align: center; padding: 20px; color: var(--text-muted);">Проблемных строк за период нет.</div>';
        } else {
            let tableHtml = `<table class="manager-task-table">
                <thead><tr><th>Предмет закупки</th><th>Исполнитель</th><th style="text-align: right;">Дней</th></tr></thead><tbody>`;
            
            problemLines.slice(0, 50).forEach(p => {
                tableHtml += `<tr>
                    <td style="max-width: 250px; white-space: normal; font-size: 11px;">${p.predmet}</td>
                    <td style="font-size: 12px;">${p.emp.split(' ')[0]}</td>
                    <td class="delay-col" style="text-align: right;">${p.days}</td>
                </tr>`;
            });
            tableHtml += `</tbody></table>`;
            container.innerHTML = tableHtml;
        }

        Object.keys(empStats).forEach(emp => {
            const avgSla = empStats[emp].totalDays / empStats[emp].count;
            const safeSla = avgSla === 0 ? 0.1 : avgSla;
            empStats[emp].avgSla = avgSla;
            empStats[emp].score = (empStats[emp].count / safeSla).toFixed(1);
        });

        let sortedEmps = Object.keys(empStats).sort((a, b) => empStats[b].score - empStats[a].score);

        if (managerSoglasChartInst) managerSoglasChartInst.destroy();
        const ctx = canvas.getContext('2d');
        
        managerSoglasChartInst = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: sortedEmps.map(name => name.split(' ')[0]),
                datasets: [{
                    label: 'Индекс эффективности',
                    data: sortedEmps.map(name => empStats[name].score),
                    backgroundColor: '#3498DB',
                    borderRadius: 4
                }]
            },
            options: {
                indexAxis: 'y',
                responsive: true, maintainAspectRatio: false,
                plugins: {
                    title: { display: true, text: 'Индекс эффективности (Строки / SLA)', color: getTextColor(), font: {size: 14} },
                    legend: { display: false },
                    tooltip: { 
                        callbacks: { 
                            label: function(context) { 
                                const emp = sortedEmps[context.dataIndex];
                                const stats = empStats[emp];
                                return [
                                    `Индекс: ${stats.score}`,
                                    `Обработано строк: ${stats.count}`,
                                    `Средний SLA: ${stats.avgSla.toFixed(1)} дн.`
                                ]; 
                            } 
                        } 
                    }
                },
                scales: {
                    x: { beginAtZero: true, ticks: { color: getTextColor() } },
                    y: { ticks: { color: getTextColor() }, grid: { display: false } }
                }
            }
        });
    }
    let managerTransfersChartInst = null;

    function renderManagerTransfers(period, customStart = null, customEnd = null) {
        const totalEl = document.getElementById('manager-transfers-total');
        const avgEl = document.getElementById('manager-transfers-avg');
        const tableContainer = document.getElementById('manager-transfers-table');
        const canvas = document.getElementById('managerTransfersReasonsChart');
        
        if (!totalEl || !avgEl || !tableContainer || !canvas) return;

        let { startDate, endDate } = getFilteredManagerDates(period, customStart, customEnd);

        // Фильтруем данные по датам (индекс 0 - дата переноса)
        let filteredTransfers = (window.bakedTransfers || []).filter(row => {
            const d = parseISOLocal(row[0]); 
            return d && d >= startDate && d <= endDate;
        });

        if (filteredTransfers.length === 0) {
            totalEl.innerText = '0';
            avgEl.innerText = '0 дн.';
            tableContainer.innerHTML = '<div style="text-align: center; padding: 20px; color: var(--text-muted);">Нет переносов за период.</div>';
            if (managerTransfersChartInst) managerTransfersChartInst.destroy();
            return;
        }

        // Считаем KPI
        totalEl.innerText = filteredTransfers.length;
        
        let totalDays = 0;
        let validCount = 0;
        let reasonsStats = {};

        filteredTransfers.forEach(row => {
            const diffDays = parseInt(row[4]) || 0; // row[4] - DiffDays
            const reason = row[5] || 'Не указана'; // row[5] - Reason
            
            if (diffDays > 0) {
                totalDays += diffDays;
                validCount++;
            }
            
            reasonsStats[reason] = (reasonsStats[reason] || 0) + 1;
        });

        const avgDays = validCount > 0 ? (totalDays / validCount).toFixed(1) : 0;
        avgEl.innerText = avgDays + ' дн.';

        // 1. Рисуем график причин
        let sortedReasons = Object.keys(reasonsStats).sort((a, b) => reasonsStats[b] - reasonsStats[a]);
        
        const chartContainer = document.getElementById('managerTransfersReasonsContainer');
        if (chartContainer) {
            const newHeight = Math.max(300, sortedReasons.length * 40 + 60);
            chartContainer.style.height = newHeight + 'px';
        }

        if (managerTransfersChartInst) managerTransfersChartInst.destroy();
        
        try {
            managerTransfersChartInst = new Chart(canvas.getContext('2d'), {
                type: 'bar',
                data: {
                    labels: sortedReasons,
                    datasets: [{
                        label: 'Количество переносов',
                        data: sortedReasons.map(r => reasonsStats[r]),
                        backgroundColor: '#E67E22',
                        borderRadius: 4
                    }]
                },
                options: {
                    indexAxis: 'y',
                    responsive: true, maintainAspectRatio: false,
                    plugins: {
                        title: { display: true, text: 'Причины переносов', color: getTextColor(), font: {size: 14} },
                        legend: { display: false },
                        tooltip: { callbacks: { label: function(context) { return ` ${context.raw} шт.`; } } }
                    },
                    scales: {
                        x: { beginAtZero: true, ticks: { color: getTextColor() } },
                        y: { ticks: { color: getTextColor(), font: {size: 11} }, grid: { display: false } }
                    }
                }
            });
        } catch (e) {
            console.error("Ошибка отрисовки графика переносов:", e);
        }

        // 2. Заполняем таблицу долгих переносов
        let sortedTransfers = [...filteredTransfers].sort((a, b) => b[4] - a[4]);
        
        let tableHtml = '<table class="manager-task-table" style="width: 100%; table-layout: fixed;">';
        tableHtml += '<thead><tr>';
        tableHtml += '<th style="width: 15%;">Документ</th>';
        tableHtml += '<th style="width: 30%;">Номенклатура</th>';
        tableHtml += '<th style="width: 15%;">Ответственный</th>';
        tableHtml += '<th style="width: 10%; text-align: center;">Сдвиг</th>';
        tableHtml += '<th style="width: 30%;">Причина</th>';
        tableHtml += '</tr></thead><tbody>';
        
        sortedTransfers.slice(0, 50).forEach(row => {
            const predmet = row[6] || 'Без названия';
            const emp = row[1] || '—';
            const diff = row[4];
            const reason = row[5];
            const docNum = row[7] || '—';

            tableHtml += '<tr>';
            tableHtml += '<td style="font-size: 12px; font-weight: bold; word-wrap: break-word;">' + docNum + '</td>';
            tableHtml += '<td style="white-space: normal; font-size: 12px; word-wrap: break-word;">' + predmet + '</td>';
            tableHtml += '<td style="font-size: 12px; word-wrap: break-word;">' + emp.split(' ')[0] + '</td>';
            tableHtml += '<td style="text-align: center; font-weight: bold; color: #D32F2F; font-size: 12px;">+' + diff + '</td>';
            tableHtml += '<td style="font-size: 12px; white-space: normal; word-wrap: break-word;">' + reason + '</td>';
            tableHtml += '</tr>';
        });
        
        tableHtml += '</tbody></table>';
        tableContainer.innerHTML = tableHtml;
    }
    let managerZakupChartInst = null;

    function renderManagerZakupSoglas(period, customStart = null, customEnd = null) {
        console.log("1. Функция вызвана!");
        
        const avgEl = document.getElementById('manager-zakup-avg');
        const totalEl = document.getElementById('manager-zakup-total');
        const worstEl = document.getElementById('manager-zakup-worst');
        const canvas = document.getElementById('managerZakupChart');
        const tableContainer = document.getElementById('manager-zakup-table');

        if (!avgEl || !totalEl || !worstEl || !canvas || !tableContainer) {
            console.error("2. ОШИБКА: Не найдены элементы HTML (canvas или table)!");
            return;
        }
        console.log("3. Элементы HTML найдены.");

        let { startDate, endDate } = getFilteredManagerDates(period, customStart, customEnd);
        console.log("4. Даты фильтра:", startDate, endDate);

        let filtered = (window.bakedZakupSoglas || []).filter(row => {
            if (!row[3]) return false; 
            const d = parseISOLocal(row[3]); 
            return d && d >= startDate && d <= endDate;
        });
        console.log("5. Строк после фильтрации:", filtered.length);

        if (filtered.length === 0) {
            console.log("6. ВЫХОД: Массив пуст (даты не подходят под фильтр).");
            avgEl.innerText = '0 дн.';
            totalEl.innerText = '0';
            worstEl.innerText = '—';
            tableContainer.innerHTML = '<div style="text-align: center; padding: 20px; color: var(--text-muted);">Нет данных за выбранный период.</div>';
            return;
        }
        
        console.log("7. УСПЕХ: Начинаем рендер таблицы и графика.");

        let totalDays = 0;
        let empStats = {}; 
        
        filtered.forEach(row => {
            const emp = row[1] || 'Неизвестный';
            const days = parseInt(row[4]) || 0;
            totalDays += days;
            if (!empStats[emp]) empStats[emp] = { totalDays: 0, count: 0 };
            empStats[emp].totalDays += days;
            empStats[emp].count++;
        });

        const avg = (totalDays / filtered.length).toFixed(1);
        avgEl.innerText = avg + ' дн.';
        totalEl.innerText = filtered.length;

        let worstEmp = null;
        let maxAvg = 0;
        for (let e in empStats) {
            let empAvg = empStats[e].totalDays / empStats[e].count;
            if (empAvg > maxAvg) {
                maxAvg = empAvg;
                worstEmp = e;
            }
        }
        if (worstEmp) worstEl.innerText = worstEmp.split(' ')[0] + ' (' + maxAvg.toFixed(1) + ' дн.)';

        // --- 1. СБОРКА И ВЫВОД ТАБЛИЦЫ ---
        let sortedFiltered = [...filtered].sort((a, b) => (parseInt(b[4]) || 0) - (parseInt(a[4]) || 0)); 
        
        let tableHtml = '<table class="manager-task-table" style="width: 100%; table-layout: fixed;">';
        tableHtml += '<thead><tr>';
        tableHtml += '<th style="width: 45%;">Предмет закупки</th>';
        tableHtml += '<th style="width: 25%;">Закупщик</th>';
        tableHtml += '<th style="width: 20%;">Организация</th>';
        tableHtml += '<th style="width: 10%; text-align: center;">Дней</th>';
        tableHtml += '</tr></thead><tbody>';
            
        sortedFiltered.slice(0, 100).forEach(row => {
            tableHtml += '<tr>';
            tableHtml += '<td style="white-space: normal; word-wrap: break-word; font-size: 12px; line-height: 1.3;">' + (row[0] || '—') + '</td>';
            tableHtml += '<td style="font-size: 12px; word-wrap: break-word; font-weight: bold;">' + (row[1] || '—') + '</td>';
            tableHtml += '<td style="font-size: 12px; word-wrap: break-word; color: var(--text-muted);">' + (row[2] || '—') + '</td>';
            tableHtml += '<td style="text-align: center; font-weight: bold; color: #D32F2F; font-size: 14px;">' + (row[4] || 0) + '</td>';
            tableHtml += '</tr>';
        });
        tableHtml += '</tbody></table>';
        tableContainer.innerHTML = tableHtml;

        // --- 2. ОТРИСОВКА ГРАФИКА ---
        try {
            let sortedEmps = Object.keys(empStats).sort((a, b) => {
                let avgA = empStats[a].totalDays / empStats[a].count;
                let avgB = empStats[b].totalDays / empStats[b].count;
                return avgB - avgA;
            });

            if (managerZakupChartInst) managerZakupChartInst.destroy();
            const existingChart = Chart.getChart(canvas);
            if (existingChart) existingChart.destroy();
            
            let chartLabels = [];
            let chartData = [];
            let chartColors = [];

            sortedEmps.forEach(name => {
                chartLabels.push(name.split(' ')[0]);
                let avgVal = empStats[name].totalDays / empStats[name].count;
                chartData.push(avgVal.toFixed(1));
                
                if (avgVal <= 3) chartColors.push('#2ECC71');
                else if (avgVal <= 7) chartColors.push('#F1C40F');
                else chartColors.push('#E74C3C');
            });

            // ДИНАМИЧЕСКАЯ ВЫСОТА: 35 пикселей на каждого человека (минимум 400)
            const chartWrapper = document.getElementById('managerZakupChartWrapper');
            if (chartWrapper) {
                chartWrapper.style.height = Math.max(400, sortedEmps.length * 35) + 'px';
            }
            
            managerZakupChartInst = new Chart(canvas.getContext('2d'), {
                type: 'bar',
                data: {
                    labels: chartLabels,
                    datasets: [{
                        label: 'Среднее время (дн.)',
                        data: chartData,
                        backgroundColor: chartColors,
                        borderRadius: 4
                    }]
                },
                options: {
                    indexAxis: 'y',
                    responsive: true, 
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false },
                        title: { display: true, text: 'Среднее время согласования по закупщикам', color: getTextColor(), font: {size: 14} }
                    },
                    scales: {
                        x: { beginAtZero: true, ticks: { color: getTextColor() } },
                        y: { ticks: { color: getTextColor(), font: {size: 12} }, grid: { display: false } }
                    }
                }
            });
        } catch (e) {
            console.error("Ошибка отрисовки графика:", e);
        }
    } // КОНЕЦ ФУНКЦИИ

}); // <--- ВОТ ЭТА СКОБКА ЗАКРЫВАЕТ СЕКЦИЮ 20
// ==========================================
// 21. ЕДИНЫЙ КАЛЕНДАРЬ ОТДЕЛА
// ==========================================
document.addEventListener("DOMContentLoaded", function() {
    const unifiedBtn = document.getElementById('show-unified-calendar-btn');
    const unifiedModal = document.getElementById('unified-calendar-modal');
    const closeUnifiedBtn = document.getElementById('close-unified-calendar');
    
    const grid = document.getElementById('unified-calendar-grid');
    const monthYear = document.getElementById('unified-month-year');
    const prevBtn = document.getElementById('prev-unified-month');
    const nextBtn = document.getElementById('next-unified-month');
    const upcomingList = document.getElementById('unified-upcoming-list');

    // Если элементов нет на странице, выходим
    if (!unifiedBtn || !unifiedModal) return;

    let currentUnifiedDate = new Date();
    if (currentUnifiedDate.getFullYear() < 2026) currentUnifiedDate = new Date(2026, 0, 1);

    const monthNamesNominative = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"];
    
        // Словарь праздников с названиями
    const holidays2026 = {
        '01-01': 'Новый год', '01-02': 'Новогодние каникулы', '01-03': 'Новогодние каникулы',
        '01-04': 'Новогодние каникулы', '01-05': 'Новогодние каникулы', '01-06': 'Новогодние каникулы',
        '01-07': 'Рождество Христово', '01-08': 'Новогодние каникулы',
        '02-21': 'День защитника Отечества (выходной)', '02-22': 'День защитника Отечества (выходной)', '02-23': 'День защитника Отечества',
        '03-07': 'Международный женский день (выходной)', '03-08': 'Международный женский день', '03-09': 'Международный женский день (выходной)',
        '05-01': 'Праздник Весны и Труда', '05-02': 'Праздник Весны и Труда (выходной)', '05-03': 'Праздник Весны и Труда (выходной)',
        '05-09': 'День Победы', '05-10': 'День Победы (выходной)', '05-11': 'День Победы (выходной)',
        '06-12': 'День России', '06-13': 'День России (выходной)', '06-14': 'День России (выходной)',
        '11-04': 'День народного единства',
        '12-31': 'Выходной день'
    };
    const metalurgDay = '07-19'; // День металлурга 2026 (3-е воскресенье июля)

    // Открытие и закрытие окна
    unifiedBtn.addEventListener('click', (e) => {
        e.preventDefault();
        unifiedModal.style.display = 'flex';
        renderUnifiedCalendar(currentUnifiedDate.getFullYear(), currentUnifiedDate.getMonth());
        renderUnifiedUpcoming();
    });

    closeUnifiedBtn.addEventListener('click', () => unifiedModal.style.display = 'none');
    
    window.addEventListener('click', (event) => {
        if (event.target === unifiedModal) unifiedModal.style.display = 'none';
    });

    // Переключение месяцев
    prevBtn.addEventListener('click', () => {
        currentUnifiedDate.setMonth(currentUnifiedDate.getMonth() - 1);
        renderUnifiedCalendar(currentUnifiedDate.getFullYear(), currentUnifiedDate.getMonth());
    });
    
    nextBtn.addEventListener('click', () => {
        currentUnifiedDate.setMonth(currentUnifiedDate.getMonth() + 1);
        renderUnifiedCalendar(currentUnifiedDate.getFullYear(), currentUnifiedDate.getMonth());
    });

    function renderUnifiedCalendar(year, month) {
        monthYear.innerText = `${monthNamesNominative[month]} ${year}`;
        grid.innerHTML = '';

        const daysOfWeek = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
        daysOfWeek.forEach(d => {
            const el = document.createElement('div');
            el.className = 'uc-day header';
            el.innerText = d;
            grid.appendChild(el);
        });

        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        let startDayIndex = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;

        for (let i = 0; i < startDayIndex; i++) {
            const el = document.createElement('div');
            el.className = 'uc-day other-month';
            grid.appendChild(el);
        }

        for (let day = 1; day <= lastDay.getDate(); day++) {
            const el = document.createElement('div');
            el.className = 'uc-day';
            el.innerHTML = `<span style="align-self: flex-start; margin-left: 2px;">${day}</span>`;
            
            const currentDate = new Date(year, month, day);
            
            // ПРОВЕРКА НА СЕГОДНЯШНИЙ ДЕНЬ
            const today = new Date();
            if (currentDate.getDate() === today.getDate() && 
                currentDate.getMonth() === today.getMonth() && 
                currentDate.getFullYear() === today.getFullYear()) {
                el.classList.add('uc-today');
            }
            const dateStrMMDD = `${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const isWeekend = currentDate.getDay() === 0 || currentDate.getDay() === 6;

                        // Проверка на праздник
            if (holidays2026[dateStrMMDD]) {
                el.classList.add('is-holiday');
                el.title = holidays2026[dateStrMMDD]; // Показываем название при наведении
            } else if (isWeekend) {
                el.classList.add('is-weekend'); // Отдельный класс для обычных выходных
            }

            // Проверка на День металлурга
            if (dateStrMMDD === metalurgDay) {
                el.classList.add('is-metalurg');
                el.title = "День металлурга!";
            }

            // Проверка на Дни рождения
            let bdays = [];
            for (let name in birthdays) {
                let parts = birthdays[name].split('.');
                if (parseInt(parts[0]) === day && (parseInt(parts[1]) - 1) === month) {
                    bdays.push(name.split(' ').slice(0, 2).join(' '));
                }
            }
            if (bdays.length > 0) {
                const bdayIcon = document.createElement('div');
                bdayIcon.className = 'uc-bday-icon';
                bdayIcon.innerText = '🎂';
                bdayIcon.title = `ДР: ${bdays.join(', ')}`;
                el.appendChild(bdayIcon);
            }

            // Проверка на отпуска
            let vacPeople = [];
            if (window.bakedDataVacations) {
                window.bakedDataVacations.forEach(vac => {
                    let start = parseISOLocal(vac.start);
                    let end = parseISOLocal(vac.end);
                    if (currentDate >= start && currentDate <= end) {
                        let parts = vac.name.split(' ');
                        let initials = (parts[0] ? parts[0][0] : '') + (parts[1] ? parts[1][0] : '');
                        vacPeople.push({ shortName: parts.slice(0, 2).join(' '), initials, color: getAvatarColor(vac.name) });
                    }
                });
            }
            
            if (vacPeople.length > 0) {
                el.classList.add('has-vacation');
                const avatarsDiv = document.createElement('div');
                avatarsDiv.className = 'uc-avatars';
                vacPeople.forEach(p => {
                    avatarsDiv.innerHTML += `<div class="uc-avatar" style="background-color: ${p.color};" title="${p.shortName}">${p.initials}</div>`;
                });
                el.appendChild(avatarsDiv);
            }

            grid.appendChild(el);
        }
    }

        function renderUnifiedUpcoming() {
        const bdayContainer = document.getElementById('unified-upcoming-bdays');
        const vacContainer = document.getElementById('unified-upcoming-vacs');
        if (!bdayContainer || !vacContainer) return;
        
        bdayContainer.innerHTML = '';
        vacContainer.innerHTML = '';

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const next30Days = new Date(today);
        next30Days.setDate(today.getDate() + 30);

        // Дни рождения
        let bdayEvents = [];
        for (let name in birthdays) {
            let parts = birthdays[name].split('.');
            let bday = new Date(today.getFullYear(), parts[1] - 1, parts[0]);
            if (bday < today) bday.setFullYear(today.getFullYear() + 1);
            
            if (bday >= today && bday <= next30Days) {
                bdayEvents.push({ date: bday, text: `🎂 <b>${bday.getDate()} ${monthNamesGenitive[bday.getMonth()]}</b> — ${name.split(' ').slice(0,2).join(' ')}` });
            }
        }
        bdayEvents.sort((a, b) => a.date - b.date);
        if (bdayEvents.length === 0) bdayContainer.innerHTML = '<div style="color: var(--text-muted);">Нет ближайших ДР.</div>';
        else bdayEvents.forEach(ev => bdayContainer.innerHTML += `<div style="margin-bottom: 5px;">${ev.text}</div>`);

        // Отпуска
        let vacEvents = [];
        if (window.bakedDataVacations) {
            window.bakedDataVacations.forEach(vac => {
                let start = parseISOLocal(vac.start);
                let end = parseISOLocal(vac.end);
                
                if (end >= today && start <= next30Days) {
                    let shortName = vac.name.split(' ').slice(0, 2).join(' ');
                    let isNow = today >= start && today <= end;
                    let text = isNow 
                        ? `🏖️ <b>${shortName}</b> (до ${end.getDate()} ${monthNamesGenitive[end.getMonth()]})`
                        : `✈️ <b>${shortName}</b> (с ${start.getDate()} ${monthNamesGenitive[start.getMonth()]} по ${end.getDate()} ${monthNamesGenitive[end.getMonth()]})`;
                    vacEvents.push({ date: start, text: text });
                }
            });
        }
        vacEvents.sort((a, b) => a.date - b.date);
        if (vacEvents.length === 0) vacContainer.innerHTML = '<div style="color: var(--text-muted);">Нет ближайших отпусков.</div>';
        else vacEvents.forEach(ev => vacContainer.innerHTML += `<div style="margin-bottom: 5px;">${ev.text}</div>`);
    }
        // --- КАЛЬКУЛЯТОР ОТПУСКНЫХ ---
    const calcBtn = document.getElementById('calc-btn');
    if (calcBtn) {
        calcBtn.addEventListener('click', () => {
            const oklad = parseFloat(document.getElementById('calc-salary').value);
            const days = parseInt(document.getElementById('calc-days').value);
            const month = parseInt(document.getElementById('calc-month').value);
            
            if (isNaN(oklad) || oklad <= 0 || isNaN(days) || days <= 0) {
                document.getElementById('calc-result').style.display = 'block';
                document.getElementById('calc-result').innerHTML = '<span style="color: #D32F2F;">Введите корректные данные</span>';
                return;
            }

            // Количество рабочих дней в месяцах 2026 года
            const workDaysInMonth = [15, 19, 21, 22, 19, 21, 23, 21, 22, 22, 21, 22]; 
            const workDays = workDaysInMonth[month];

            // КОЭФФИЦИЕНТЫ
            const districtCoef = 0.20; // Районный
            const farEastCoef = 0.30;  // ДВ надбавка
            const bonusCoef = 0.57;    // Премия (100% КПЭ)
            
            // Итоговый коэффициент к окладу
            const fullMultiplier = 1 + districtCoef + farEastCoef + bonusCoef; // 2.07

            // 1. Средний дневной заработок для отпускных (по закону за 12 мес / 12 / 29.3)
            // Так как коэффициенты постоянные, мы применяем их к окладу
            const avgDailyEarnings = (oklad * fullMultiplier) / 29.3;
            const vacationPay = avgDailyEarnings * days;

            // 2. Зарплата за оставшиеся рабочие дни (без премии, только оклад + надбавки 1.5)
            const remainingWorkDays = workDays - days; 
            const salaryForWorkedDays = ((oklad * 1.5) / workDays) * remainingWorkDays;

            // 3. Обычная зарплата за полный месяц (для сравнения)
            const normalMonthSalary = oklad * fullMultiplier;

            // 4. Итого на руки
            const totalPayout = vacationPay + salaryForWorkedDays;
            const diff = totalPayout - normalMonthSalary;

            const resultDiv = document.getElementById('calc-result');
            resultDiv.style.display = 'block';
            
            let diffText = diff >= 0 
                ? `<span style="color: #2ECC71; font-weight: bold;">Вы получите на ${Math.round(diff)} ₽ больше</span>`
                : `<span style="color: #E74C3C; font-weight: bold;">Вы потеряете ${Math.round(Math.abs(diff))} ₽</span>`;

            resultDiv.innerHTML = `
                <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
                    <span>Средний дневной заработок:</span> <b>${Math.round(avgDailyEarnings)} ₽</b>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
                    <span>Отпускные:</span> <b>${Math.round(vacationPay)} ₽</b>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
                    <span>ЗП за остаток дней:</span> <b>${Math.round(salaryForWorkedDays)} ₽</b>
                </div>
                <div style="display: flex; justify-content: space-between; border-top: 1px solid var(--border-color); padding-top: 5px; margin-top: 5px;">
                    <span>Итого на руки:</span> <b>${Math.round(totalPayout)} ₽</b>
                </div>
                <div style="margin-top: 5px; text-align: center;">${diffText}</div>
            `;
        });
    }
});
// ==========================================
// 22. АНИМАЦИЯ ЗАГРУЗКИ (ПРЕЛОАДЕР)
// ==========================================
document.addEventListener("DOMContentLoaded", function() {
    const preloader = document.getElementById('preloader');
    const percentText = document.getElementById('preloader-percent');
    
    if (!preloader || !percentText) return;

    // Длительность анимации (2000 мс = 2 секунды)
    const duration = 3000; // 3.0 секунды 
    const startTime = performance.now();

    function updateCounter(currentTime) {
        let elapsed = currentTime - startTime;
        let progress = Math.min(elapsed / duration, 1);
        
        // Считаем проценты
        let percent = Math.floor(progress * 100);
        percentText.innerText = percent + '%';

        if (progress < 1) {
            requestAnimationFrame(updateCounter);
        } else {
            // Когда заливка дошла до 100%, ждем еще полсекунды (чтобы текст успел появиться)
            setTimeout(() => {
                preloader.classList.add('fade-out');
                
                // Полностью удаляем прелоадер из DOM через 500мс (когда он исчезнет визуально)
                setTimeout(() => {
                    preloader.style.display = 'none';
                }, 500);
            }, 500); 
        }
    }

    requestAnimationFrame(updateCounter);
});
// ==========================================
// 23. ДОРОЖНАЯ КАРТА (ROADMAP)
// ==========================================
document.addEventListener("DOMContentLoaded", function() {
    const versionBadge = document.getElementById('version-badge');
    const roadmapModal = document.getElementById('roadmap-modal');
    const closeRoadmapBtn = document.getElementById('close-roadmap-modal');
    const timelineContainer = document.getElementById('roadmap-timeline');

    if (!versionBadge || !roadmapModal) return;

    // ДАННЫЕ ВЕРСИЙ (Сверху вниз: от новых к старым)
        const versionsData = [
        {
            version: "1.4",
            status: "future",
            date: "В планах",
            features: ["Содержимое скрыто до релиза"]
        },
        {
            version: "1.3",
            status: "current",
            date: "08 Ноября 2026",
            features: [
                "Блок Дебиторской задолженности (ДтЗ): Полноценный раздел со статистикой, графиками динамики, умным ИИ-ассистентом для поиска скрытых рисков и личными карточками кураторов",
                "Панель руководителя 3.0: Новая вкладка «Согласование закупщиками» (анализ скорости работы, рейтинг и таблица долгих согласований)",
                "Система достижений с наградами: Добавлены бессрочные, сезонные и объемные достижения, а также архив наград за прошлые периоды",
                "Интеграция с Контур.Диадок: Сверка контрагентов по ИНН, выявление сбоев (настроен ЭДО, но шлют бумагу) и слепых зон",
                "Схема этажа: Интерактивный чертеж с точной рассадкой сотрудников и контактными данными",
                "Глобальный ИИ-Ассистент: Чат-бот для быстрого аудита данных (в тестовом режиме на стадии ранней разработки)",
                "Различные доработки и исправления: Улучшение фильтров дат, динамические графики (со скроллом), исправление отображения имен и мелкие UI/UX правки"
            ]
        },
        {
            version: "1.2",
            status: "past",
            date: "03 Ноября 2026",
            features: [
                "Аналитика ЭДО: интерактивные графики, фильтры и динамика",
                "Умный ЭДО-Ассистент с генерацией инсайтов",
                "Строки потребности 2.0 (Организации, SLA, проблемные строки)",
                "Панель руководителя 2.0 (3 вкладки, индекс эффективности)",
                "Единый календарь отдела (отпуска, ДР, праздники, калькулятор)",
                "Карта активов 2.0 (паспорта с адресами и описаниями)",
                "Виджет погоды с прогнозом на 5 дней",
                "Интерактивный тур, глоссарий и справка",
                "Умный приоритет тем и фиксы режима презентации"
            ]
        },
        {
            version: "1.1",
            status: "past",
            date: "30 Октября 2026",
            features: [
                "Оптимизация веса файла: сжатие данных (LZ-string) и отказ от CDN",
                "Добавлены новые документы 1С: Согласование строк и Перенос сроков",
                "Новая панель: Аналитика согласования (Средний срок SLA, скорость, вклад сотрудников)",
                "Тепловые карты разделены: базовые 1С, СЭД, Согласования, Переносы",
                "Цветные аватарки сотрудников и их интеграция в календарь отпусков",
                "Полностью переработан режим презентации (слайды, крупные графики)",
                "Горячие клавиши теперь работают на русской раскладке",
                "Полная автономность: работа без интернета и локальный экспорт в Excel",
                "Множество багфиксов: печать из темной темы, скролл модалок, UTC-даты"
            ]
        },
        {
            version: "1.0",
            status: "past",
            date: "Октябрь 2026",
            features: [
                "Общая статистика документов в 1С и задач в СЭД",
                "Показатель средней дисциплины в СЭД",
                "Выбор периода для просмотра статистики",
                "Счетчик отдела по задачам СЭД и документам 1С",
                "Индивидуальные карточки сотрудников с личной статистикой",
                "Доска почета по трем номинациям",
                "Динамика работы отдела и тепловая карта активности",
                "Справочник сотрудников с ближайшими днями рождения",
                "Интерактивная карта активов ГК",
                "График отпусков с расчетом остатков дней",
                "Защищенная панель руководителя"
            ]
        }
    ];

    // Генерация таймлайна
    function renderRoadmap() {
        timelineContainer.innerHTML = '';

        versionsData.forEach(v => {
            const item = document.createElement('div');
            item.className = `timeline-item ${v.status}`;

            // Формируем список фич
            let featuresHtml = '<ul class="timeline-features">';
            v.features.forEach(f => {
                featuresHtml += `<li>${f}</li>`;
            });
            featuresHtml += '</ul>';

            // Если это будущая версия или в разработке, добавляем заглушку
            if (v.status === 'development' || v.status === 'future') {
                let dateText = v.status === 'development' ? `Релиз запланирован на <b>${v.date}</b>` : `Планируется в будущих обновлениях`;
                item.innerHTML = `
                    <div class="timeline-dot"></div>
                    <div class="timeline-content">
                        <div class="timeline-header">
                            <span class="timeline-version">Версия ${v.version}</span>
                            <span class="timeline-status">${v.status === 'development' ? 'В разработке' : 'Скоро'}</span>
                        </div>
                        <p style="font-size: 13px; color: var(--text-muted); margin-bottom: 10px;">${dateText}</p>
                        <div style="background: rgba(0,0,0,0.1); padding: 15px; border-radius: 8px; text-align: center; color: var(--text-muted);">
                            🔒 Список изменений скрыт до релиза
                        </div>
                    </div>
                `;
            } else {
                // Для текущей версии (1.0)
                item.innerHTML = `
                    <div class="timeline-dot"></div>
                    <div class="timeline-content">
                        <div class="timeline-header">
                            <span class="timeline-version">Версия ${v.version}</span>
                            <span class="timeline-status">Текущая версия</span>
                        </div>
                        <p style="font-size: 13px; color: var(--text-muted); margin-bottom: 10px;">Выпущено: ${v.date}</p>
                        ${featuresHtml}
                    </div>
                `;
            }

            timelineContainer.appendChild(item);
        });
    }

    // Обработчики открытия/закрытия
    versionBadge.addEventListener('click', () => {
        roadmapModal.style.display = 'flex';
        renderRoadmap(); // Рендерим при открытии
    });

    closeRoadmapBtn.addEventListener('click', () => {
        roadmapModal.style.display = 'none';
    });

    window.addEventListener('click', (event) => {
        if (event.target === roadmapModal) {
            roadmapModal.style.display = 'none';
        }
    });
});
// ==========================================
// 24. ПЕРЕКЛЮЧАТЕЛЬ ГРАФИКА (ПО ТИПАМ / ПО СОТРУДНИКАМ)
// ==========================================
document.addEventListener("DOMContentLoaded", function() {
    const chartToggle = document.getElementById('chart-toggle');
    const labelGen = document.getElementById('label-general');
    const labelEmp = document.getElementById('label-employees');
    const excludeSoglasToggle = document.getElementById('exclude-soglas-toggle');
    if (excludeSoglasToggle) {
        excludeSoglasToggle.addEventListener('change', () => {
            if (typeof globalTotalDocs !== 'undefined' && globalTotalDocs > 0) {
                renderDeptDetails(globalDocTypes, globalTotalDocs);
            }
        });
    }

    if (!chartToggle) return;

    function updateToggleState() {
        const excludeContainer = document.getElementById('exclude-soglas-container');

        if (chartToggle.checked) {
            // Режим "По сотрудникам"
            labelGen.style.color = 'var(--text-muted)';
            labelEmp.style.color = 'var(--text-main)';
            if (excludeContainer) excludeContainer.style.display = 'flex'; // Показываем галочку
        } else {
            // Режим "По типам"
            labelGen.style.color = 'var(--text-main)';
            labelEmp.style.color = 'var(--text-muted)';
            if (excludeContainer) excludeContainer.style.display = 'none'; // Скрываем галочку
        }
        
        if (typeof globalTotalDocs !== 'undefined' && globalTotalDocs > 0) {
            renderDeptDetails(globalDocTypes, globalTotalDocs);
        }
    }

    // Клик по самому ползунку
    chartToggle.addEventListener('change', updateToggleState);

    // Клик по подписям для удобства
    if (labelGen) labelGen.addEventListener('click', () => { chartToggle.checked = false; updateToggleState(); });
    if (labelEmp) labelEmp.addEventListener('click', () => { chartToggle.checked = true; updateToggleState(); });
});
// ==========================================
// 25. КНОПКА "НАВЕРХ"
// ==========================================
document.addEventListener("DOMContentLoaded", function() {
    const scrollTopBtn = document.getElementById('scroll-to-top-btn');
    if (!scrollTopBtn) return;

    // Жестко задаем стили, чтобы никакой старый CSS не мешал
    scrollTopBtn.style.position = 'fixed';
    scrollTopBtn.style.bottom = '30px';
    scrollTopBtn.style.right = '30px';
    scrollTopBtn.style.width = '50px';
    scrollTopBtn.style.height = '50px';
    scrollTopBtn.style.backgroundColor = 'var(--brand-orange)';
    scrollTopBtn.style.color = 'white';
    scrollTopBtn.style.borderRadius = '50%';
    scrollTopBtn.style.zIndex = '999999';
    scrollTopBtn.style.justifyContent = 'center';
    scrollTopBtn.style.alignItems = 'center';
    scrollTopBtn.style.cursor = 'pointer';
    scrollTopBtn.style.boxShadow = '0 4px 15px rgba(0,0,0,0.3)';
    scrollTopBtn.style.transition = 'all 0.3s ease';
    
    // Скрываем по умолчанию
    scrollTopBtn.style.display = 'none';
    scrollTopBtn.style.opacity = '0';
    scrollTopBtn.style.visibility = 'hidden';

    // Функция проверки прокрутки
    function checkScroll() {
        const scrollPos = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop;
        
        if (scrollPos > 300) {
            scrollTopBtn.style.display = 'flex';
            setTimeout(() => {
                scrollTopBtn.style.opacity = '1';
                scrollTopBtn.style.visibility = 'visible';
                scrollTopBtn.style.transform = 'translateY(0)';
            }, 10);
        } else {
            scrollTopBtn.style.opacity = '0';
            scrollTopBtn.style.visibility = 'hidden';
            scrollTopBtn.style.transform = 'translateY(20px)';
            setTimeout(() => {
                if (window.scrollY <= 300) {
                    scrollTopBtn.style.display = 'none';
                }
            }, 300);
        }
    }

    // Отслеживаем скролл
    window.addEventListener('scroll', checkScroll);
    checkScroll(); // Проверяем при загрузке

    // Клик по кнопке
    scrollTopBtn.addEventListener('click', function() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
});

// ==========================================
// 26. ГОРЯЧИЕ КЛАВИШИ И ШПАРГАЛКА
// ==========================================
document.addEventListener("DOMContentLoaded", function() {
        // Обработчик кнопки Помощь
    const helpBtn = document.getElementById('show-help-btn');
    const helpModal = document.getElementById('help-modal');
    const closeHelpBtn = document.getElementById('close-help-modal');

    if (helpBtn && helpModal) {
        helpBtn.addEventListener('click', (e) => {
            e.preventDefault();
            helpModal.style.display = 'flex';
        });
        closeHelpBtn.addEventListener('click', () => helpModal.style.display = 'none');
        window.addEventListener('click', (e) => {
            if (e.target === helpModal) helpModal.style.display = 'none';
        });
    }

    // Логика переключения вкладок в окне Помощи
    const helpTabBtns = document.querySelectorAll('.help-tab-btn');
    const helpTabContents = document.querySelectorAll('.help-tab-content');

    helpTabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            helpTabBtns.forEach(b => b.classList.remove('active'));
            helpTabContents.forEach(c => c.style.display = 'none');

            btn.classList.add('active');
            const targetId = btn.getAttribute('data-htab');
            const targetContent = document.getElementById(targetId);
            if (targetContent) {
                targetContent.style.display = 'block';
            }
        });
    });

    // Функция для закрытия всех окон перед открытием нового
    function closeAllModals() {
        document.querySelectorAll('.modal').forEach(m => m.style.display = 'none');
    }

    // Слушатель клавиатуры
    window.addEventListener('keydown', function(e) {
        // 1. ЗАЩИТА: Если фокус в поле ввода или календаре, игнорируем
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) {
            return;
        }

        // 2. ЗАЩИТА: Если зажат Ctrl, Alt или Meta (Cmd), игнорируем (чтобы не мешать браузеру)
        if (e.ctrlKey || e.altKey || e.metaKey) {
            return;
        }

        const key = e.key.toLowerCase();

                // 3. Обработка нажатий (по физической клавише, не зависят от раскладки)
        switch (e.code) {
            case 'KeyM': // Русская 'Ь'
                closeAllModals();
                document.getElementById('show-map-btn')?.click();
                break;
            case 'KeyE': // Русская 'У'
                closeAllModals();
                document.getElementById('show-info-btn')?.click();
                break;
            case 'KeyV': // Русская 'М' (Календарь)
                closeAllModals();
                document.getElementById('show-unified-calendar-btn')?.click();
                break;
            case 'KeyR': // Русская 'К'
                closeAllModals();
                document.getElementById('version-badge')?.click();
                break;
            case 'KeyL': // Русская 'Д'
                closeAllModals();
                document.getElementById('show-manager-btn')?.click();
                break;
            case 'KeyT': // Русская 'Е'
                document.getElementById('theme-toggle-btn')?.click();
                break;
            case 'KeyX': // Русская 'Ч'
                document.getElementById('excel-btn')?.click();
                break;
            case 'KeyP': // Русская 'З'
                document.getElementById('print-btn')?.click();
                break;
            case 'KeyU': // Русская 'Г'
                window.scrollTo({ top: 0, behavior: 'smooth' });
                break;
            case 'KeyF': // Русская 'А' (Режим презентации)
                // Эта клавиша обрабатывается в секции 27, но пусть будет и здесь
                break;
            case 'Slash': // Кнопка '/', она же '?' с Shift, она же '\' (или '.' на русской)
                e.preventDefault();
                closeAllModals();
                if (helpModal) helpModal.style.display = 'flex';
                break;
        }
    });
                const tourSteps = [
        { element: '.dashboard-header', title: 'Шапка дашборда', text: 'Здесь расположен логотип, название портала, виджет погоды (при наведении показывает прогноз), дата обновления и текущее время.', position: 'bottom' },
        { element: '.toolbar', title: 'Панель управления', text: 'Кнопки для переключения темы, запуска режима презентации, печати и выгрузки данных в Excel.', position: 'bottom' },
        { element: '#yearly-banner', title: 'Годовые итоги', text: 'Блоки с общей статистикой отдела за текущий год.', position: 'bottom' },
        { element: '.kpi-container', title: 'Главные цифры (KPI)', text: 'Основные показатели. Сейчас мы автоматически раскроем детализацию по каждому из них.', position: 'bottom', action: 'openKpiPanels' },
        { element: '#details-panel', title: 'Детализация документов 1С', text: 'Распределение документов по типам и сотрудникам. Внизу — аналитика по переносам сроков.', position: 'bottom' },
        { element: '#details-soglas-panel', title: 'Строки потребности', text: 'Средний срок (SLA), скорость работы, вклад сотрудников и объем по бизнес-единицам.', position: 'bottom' },
        { element: '#sed-analytics-section', title: 'Исполнительская дисциплина (СЭД)', text: 'Круговая диаграмма статусов задач и рейтинг выполнения по каждому сотруднику.', position: 'bottom' },
        { element: '.filter-panel', title: 'Фильтр по периодам', text: 'Выберите нужный интервал, и все графики пересчитаются под выбранные даты.', position: 'bottom' },
        { element: '.employees-section', title: 'Карточки сотрудников', text: 'Нажмите на карточку коллеги, чтобы открыть личный профиль.', position: 'top' },
        { element: '#dynamics-section', title: 'Динамика работы отдела', text: 'Графики активности отдела по неделям или месяцам.', position: 'top' },
        { element: '#heatmap-section', title: 'Тепловые карты', text: 'Показывают нагрузку по дням недели. Чем краснее — тем больше задач.', position: 'top' },
        { element: '#edo-section', title: 'Аналитика ЭДО', text: 'Здесь мы анализируем контрагентов: кто перешел на электронку, а кто застрял на бумаге. Есть умный ЭДО-Ассистент!', position: 'top' },
        { element: '.dashboard-footer', title: 'Полезные ссылки', text: 'Справочник сотрудников, Карта активов, Календарь и Панель руководителя.', position: 'top' }
    ];

    let currentTourStep = 0;
    const tourTooltip = document.getElementById('tour-tooltip');
    const tourTitle = document.getElementById('tour-title');
    const tourText = document.getElementById('tour-text');
    const startTourBtn = document.getElementById('start-tour-btn');
    const tourNextBtn = document.getElementById('tour-next');
    const tourPrevBtn = document.getElementById('tour-prev');
    const tourSkipBtn = document.getElementById('tour-skip');

    if (startTourBtn && tourTooltip) {
        startTourBtn.addEventListener('click', () => {
            helpModal.style.display = 'none'; // Закрываем окно помощи
            currentTourStep = 0;
            showTourStep(currentTourStep);
        });

        tourNextBtn.addEventListener('click', () => {
            if (currentTourStep < tourSteps.length - 1) {
                currentTourStep++;
                showTourStep(currentTourStep);
            } else {
                endTour();
            }
        });

        tourPrevBtn.addEventListener('click', () => {
            if (currentTourStep > 0) {
                currentTourStep--;
                showTourStep(currentTourStep);
            }
        });

        tourSkipBtn.addEventListener('click', endTour);
    }

        function showTourStep(index) {
        // Убираем подсветку с предыдущего элемента
        document.querySelectorAll('.tour-highlight').forEach(el => el.classList.remove('tour-highlight'));
        tourTooltip.style.display = 'none';

        const step = tourSteps[index];
        const target = document.querySelector(step.element);

        if (!target) {
            if (index < tourSteps.length - 1) {
                currentTourStep++;
                showTourStep(currentTourStep);
            }
            return;
        }

        // Выполняем спец. действие (раскрытие панелей)
        if (step.action === 'openKpiPanels') {
            document.getElementById('details-panel').style.display = 'block';
            document.getElementById('details-soglas-panel').style.display = 'block';
            document.getElementById('sed-analytics-section').style.display = 'flex';
            
            // ПРИНУДИТЕЛЬНО ОТРИСОВЫВАЕМ ГРАФИКИ, ЧТОБЫ ОНИ НЕ БЫЛИ ПУСТЫМИ
            if (typeof renderDeptDetails === 'function' && typeof globalDocTypes !== 'undefined') {
                renderDeptDetails(globalDocTypes, globalTotalDocs);
            }
            if (typeof renderSoglasAnalytics === 'function') renderSoglasAnalytics();
            if (typeof renderSedAnalytics === 'function') renderSedAnalytics();
            
            // Меняем иконки на "вверх"
            if (document.getElementById('expand-icon')) document.getElementById('expand-icon').innerText = '▲';
            if (document.getElementById('expand-soglas-icon')) document.getElementById('expand-soglas-icon').innerText = '▲';
            if (document.getElementById('expand-sed-icon')) document.getElementById('expand-sed-icon').innerText = '▲';
        }

        // Прокручиваем к элементу
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });

        // Ждем прокрутки и показываем
        setTimeout(() => {
            target.classList.add('tour-highlight');
            
            tourTitle.innerText = step.title;
            tourText.innerText = step.text;
            
            tourPrevBtn.style.visibility = index === 0 ? 'hidden' : 'visible';
            tourNextBtn.innerText = index === tourSteps.length - 1 ? 'Завершить' : 'Далее';

            const rect = target.getBoundingClientRect();
            tourTooltip.style.display = 'flex';

            const tooltipRect = tourTooltip.getBoundingClientRect();
            const scrollY = window.scrollY;
            const scrollX = window.scrollX;

            let top = 0;
            let left = 0;

            if (step.position === 'bottom') {
                top = rect.bottom + scrollY + 15;
                left = rect.left + scrollX + (rect.width / 2) - (tooltipRect.width / 2);
            } else if (step.position === 'top') {
                top = rect.top + scrollY - tooltipRect.height - 15;
                left = rect.left + scrollX + (rect.width / 2) - (tooltipRect.width / 2);
            }

            if (left < 10) left = 10;
            if (left + tooltipRect.width > window.innerWidth - 10) {
                left = window.innerWidth - tooltipRect.width - 10;
            }

            tourTooltip.style.top = `${top}px`;
            tourTooltip.style.left = `${left}px`;
        }, 400);
    }

        function endTour() {
        document.querySelectorAll('.tour-highlight').forEach(el => el.classList.remove('tour-highlight'));
        tourTooltip.style.display = 'none';
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        // Сворачиваем панели обратно
        document.getElementById('details-panel').style.display = 'none';
        document.getElementById('details-soglas-panel').style.display = 'none';
        document.getElementById('sed-analytics-section').style.display = 'none';
        
        if (document.getElementById('expand-icon')) document.getElementById('expand-icon').innerText = '▼';
        if (document.getElementById('expand-soglas-icon')) document.getElementById('expand-soglas-icon').innerText = '▼';
        if (document.getElementById('expand-sed-icon')) document.getElementById('expand-sed-icon').innerText = '▼';
    }
});
// ==========================================
// 27. РЕЖИМ ПРЕЗЕНТАЦИИ
// ==========================================
document.addEventListener("DOMContentLoaded", function() {
    const presentationBtn = document.getElementById('presentation-btn');
    const exitPresentationBtn = document.getElementById('exit-presentation-btn');

    if (!presentationBtn || !exitPresentationBtn) return;
    let themeBeforePresentation = null;

    function enterPresentationMode() {
        themeBeforePresentation = document.body.classList.contains('dark-theme');
        document.body.classList.add('presentation-mode');
                // Автоматически раскрываем все панели для презентации
        const detailsPanel = document.getElementById('details-panel');
        if (detailsPanel && detailsPanel.style.display === 'none') {
            detailsPanel.style.display = 'block';
            const icon = document.getElementById('expand-icon');
            if (icon) icon.innerText = '▲';
        }
        const sedPanel = document.getElementById('sed-analytics-section');
        if (sedPanel && sedPanel.style.display === 'none') {
            sedPanel.style.display = 'flex';
            const icon = document.getElementById('expand-sed-icon');
            if (icon) icon.innerText = '▲';
        }
        const soglasPanel = document.getElementById('details-soglas-panel');
        if (soglasPanel && soglasPanel.style.display === 'none') {
            soglasPanel.style.display = 'block';
            const icon = document.getElementById('expand-soglas-icon');
            if (icon) icon.innerText = '▲';
        }
        
        // Прокручиваем страницу в самый верх, чтобы начать презентацию с KPI
        window.scrollTo(0, 0);
        document.body.classList.add('dark-theme'); // Принудительно темная тема
        exitPresentationBtn.style.display = 'block';

        // Запрос полноэкранного режима
        if (document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen().catch(err => {
                console.log("Браузер заблокировал полноэкранный режим:", err);
            });
        }

        // Перерисовываем графики с новыми размерами
        setTimeout(() => {
            if (typeof processData !== 'undefined') processData();
            if (typeof deptBarChartInstance !== 'undefined' && deptBarChartInstance) deptBarChartInstance.resize();
            if (typeof sedGeneralChartInstance !== 'undefined' && sedGeneralChartInstance) sedGeneralChartInstance.resize();
            if (typeof sedEmployeesChartInstance !== 'undefined' && sedEmployeesChartInstance) sedEmployeesChartInstance.resize();
            if (typeof dynamicsChart1CInstance !== 'undefined' && dynamicsChart1CInstance) dynamicsChart1CInstance.resize();
            if (typeof dynamicsChartSEDInstance !== 'undefined' && dynamicsChartSEDInstance) dynamicsChartSEDInstance.resize();
            if (typeof heatmapChart1CInstance !== 'undefined' && heatmapChart1CInstance) heatmapChart1CInstance.resize();
            if (typeof heatmapChartSEDInstance !== 'undefined' && heatmapChartSEDInstance) heatmapChartSEDInstance.resize();
            if (typeof soglasSpeedChartInstance !== 'undefined' && soglasSpeedChartInstance) soglasSpeedChartInstance.resize();
            if (typeof soglasEmpChartInstance !== 'undefined' && soglasEmpChartInstance) soglasEmpChartInstance.resize();
            if (typeof perenosEmployeesChartInstance !== 'undefined' && perenosEmployeesChartInstance) perenosEmployeesChartInstance.resize();
            if (typeof heatmapChartSoglasInstance !== 'undefined' && heatmapChartSoglasInstance) heatmapChartSoglasInstance.resize();
            if (typeof heatmapChartPerenosInstance !== 'undefined' && heatmapChartPerenosInstance) heatmapChartPerenosInstance.resize();
        }, 300);
    }

    function exitPresentationMode() {
        document.body.classList.remove('presentation-mode');
                // Сворачиваем панели обратно
        const detailsPanel = document.getElementById('details-panel');
        if (detailsPanel) {
            detailsPanel.style.display = 'none';
            document.getElementById('expand-icon').innerText = '▼';
        }
        const sedPanel = document.getElementById('sed-analytics-section');
        if (sedPanel) {
            sedPanel.style.display = 'none';
            document.getElementById('expand-sed-icon').innerText = '▼';
        }
        const soglasPanel = document.getElementById('details-soglas-panel');
        if (soglasPanel) {
            soglasPanel.style.display = 'none';
            document.getElementById('expand-soglas-icon').innerText = '▼';
        }
                // Возвращаем тему, которая была ДО презентации
        if (themeBeforePresentation === false) {
            document.body.classList.remove('dark-theme');
        } else {
            document.body.classList.add('dark-theme');
        }

        // Выход из полноэкранного режима
        if (document.exitFullscreen && document.fullscreenElement) {
            document.exitFullscreen().catch(err => console.log(err));
        }

        // Перерисовываем графики обратно
        setTimeout(() => {
            if (typeof processData !== 'undefined') processData();
        }, 300);
    }

    // Обработчики кнопок
    presentationBtn.addEventListener('click', enterPresentationMode);
    exitPresentationBtn.addEventListener('click', exitPresentationMode);

    // Обработка горячей клавиши F
    window.addEventListener('keydown', function(e) {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        if (e.code === 'KeyF' && !e.ctrlKey && !e.altKey && !e.metaKey) {
            if (document.body.classList.contains('presentation-mode')) {
                exitPresentationMode();
            } else {
                enterPresentationMode();
            }
        }
    });

    // Если пользователь нажал Esc (или F11) на системном уровне, синхронизируем состояние
    document.addEventListener('fullscreenchange', function() {
        if (!document.fullscreenElement && document.body.classList.contains('presentation-mode')) {
            exitPresentationMode();
        }
    });
});
// ==========================================
// 28. НАВИГАЦИЯ И ФИЛЬТРЫ В КАРТОЧКЕ СОТРУДНИКА
// ==========================================
document.addEventListener("DOMContentLoaded", function() {
    const prevBtn = document.getElementById('modal-prev-emp');
    const nextBtn = document.getElementById('modal-next-emp');
    const filterBtns = document.querySelectorAll('.m-filter-btn[data-mperiod]');
    const applyCustomBtn = document.getElementById('modal-apply-custom');

    if (!prevBtn || !nextBtn) return;

    const allEmployees = Object.keys(jobTitles).sort((a, b) => a.localeCompare(b, 'ru'));

    function switchEmployee(direction) {
        if (!currentModalEmp) return;
        let currentIndex = allEmployees.indexOf(currentModalEmp);
        if (currentIndex === -1) return;

        let newIndex = currentIndex + direction;
        
        if (newIndex < 0) newIndex = allEmployees.length - 1;
        if (newIndex >= allEmployees.length) newIndex = 0;

        currentModalEmp = allEmployees[newIndex];
        renderModalData();
    }

    prevBtn.addEventListener('click', () => switchEmployee(-1));
    nextBtn.addEventListener('click', () => switchEmployee(1));

    // Обработка кнопок фильтров
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            filterBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // Очищаем календари при выборе быстрой кнопки
            document.getElementById('modal-date-start').value = '';
            document.getElementById('modal-date-end').value = '';
            
            currentModalPeriod = this.dataset.mperiod;
            renderModalData(); 
        });
    });

    // Обработка кнопки "Применить" для календаря
    if (applyCustomBtn) {
        applyCustomBtn.addEventListener('click', function() {
            filterBtns.forEach(b => b.classList.remove('active'));
            currentModalPeriod = 'custom';
            renderModalData();
        });
    }

    // Навигация стрелками клавиатуры
    window.addEventListener('keydown', function(e) {
        // Если карточка сотрудника не открыта, не реагируем
        const modal = document.getElementById('employee-modal');
        if (!modal || modal.style.display !== 'flex') return;

        // Если фокус в поле ввода, игнорируем (чтобы можно было вводить даты)
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

        if (e.key === 'ArrowLeft') {
            switchEmployee(-1);
        } else if (e.key === 'ArrowRight') {
            switchEmployee(1);
        }
    });
});
   // ==========================================
// 29. ВИДЖЕТ ПОГОДЫ В ШАПКЕ
// ==========================================
document.addEventListener("DOMContentLoaded", function() {
    console.log("⚡ Виджет погоды: скрипт успешно запущен!");
    
    const weatherWidget = document.getElementById('weather-widget');
    const weatherPopup = document.getElementById('weather-popup');
    
    if (!weatherWidget || !weatherPopup) {
        console.error("❌ Ошибка: HTML элементы виджета не найдены!");
        return;
    }

    const API_KEY = 'd5146448d6b4e9fba475a9be8e3181b2';
    const LAT = 50.259;
    const LON = 127.517;

    // Функция для подбора иконки
    function getWeatherIcon(weatherId, temp, isDay = true) {
        if (weatherId >= 600 && weatherId < 700) return '❄️';
        if (weatherId >= 500 && weatherId < 600) return temp < 2 ? '❄️' : '🌧️';
        if (weatherId >= 200 && weatherId < 300) return '⛈️';
        if (weatherId >= 300 && weatherId < 500) return '🌦️';
        if (weatherId === 800) return isDay ? '☀️' : '🌙';
        if (weatherId === 801) return '🌤️';
        if (weatherId > 801 && weatherId < 805) return '☁️';
        return '🌥️';
    }

    // События наведения мыши
    weatherWidget.addEventListener('mouseenter', () => weatherPopup.classList.add('show'));
    weatherWidget.addEventListener('mouseleave', () => weatherPopup.classList.remove('show'));

    // Запрос текущей погоды
    async function fetchCurrentWeather() {
        try {
            const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${LAT}&lon=${LON}&appid=${API_KEY}&units=metric&lang=ru`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();

            const temp = Math.round(data.main.temp);
            const feels = Math.round(data.main.feels_like);
            const icon = getWeatherIcon(data.weather[0].id, temp, true);
            
            document.getElementById('weather-main-icon').innerText = icon;
            document.getElementById('weather-main-temp').innerText = `${temp > 0 ? '+' : ''}${temp}°C`;
            document.getElementById('wd-feels').innerText = `${feels > 0 ? '+' : ''}${feels}°`;
            document.getElementById('wd-humidity').innerText = `${data.main.humidity}%`;
            
            const windSpeed = data.wind.speed;
            const windDeg = data.wind.deg || 0;
            const dirs = ['С', 'СВ', 'В', 'ЮВ', 'Ю', 'ЮЗ', 'З', 'СЗ'];
            const dir = dirs[Math.round(windDeg / 45) % 8];
            document.getElementById('wd-wind').innerText = `${windSpeed} м/с (${dir})`;

            const pop = data.pop ? Math.round(data.pop * 100) : 0;
            document.getElementById('wd-pop').innerText = `${pop}%`;

            const sunrise = new Date(data.sys.sunrise * 1000);
            const sunset = new Date(data.sys.sunset * 1000);
            const formatTime = (d) => `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
            document.getElementById('wd-sunrise').innerText = formatTime(sunrise);
            document.getElementById('wd-sunset').innerText = formatTime(sunset);

        } catch (e) {
            console.error("❌ Ошибка текущей погоды:", e);
            document.getElementById('weather-main-temp').innerText = '—';
        }
    }

    // Запрос прогноза на 5 дней
    async function fetchForecast() {
        try {
            const res = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${LAT}&lon=${LON}&appid=${API_KEY}&units=metric&lang=ru`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();

            const list = document.getElementById('weather-forecast-list');
            list.innerHTML = '';

            const dailyData = {};
            data.list.forEach(item => {
                const date = new Date(item.dt * 1000);
                const dayKey = date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' });
                
                if (!dailyData[dayKey]) {
                    dailyData[dayKey] = { temps: [], icons: {}, date: date };
                }
                dailyData[dayKey].temps.push(item.main.temp);
                const icon = getWeatherIcon(item.weather[0].id, item.main.temp, true);
                dailyData[dayKey].icons[icon] = (dailyData[dayKey].icons[icon] || 0) + 1;
            });

            const days = Object.keys(dailyData).slice(1, 6);
            
            days.forEach(dayStr => {
                const day = dailyData[dayStr];
                const maxTemp = Math.round(Math.max(...day.temps));
                const minTemp = Math.round(Math.min(...day.temps));
                
                let bestIcon = '🌥️', maxCount = 0;
                for (let ic in day.icons) {
                    if (day.icons[ic] > maxCount) { maxCount = day.icons[ic]; bestIcon = ic; }
                }

                const dayName = day.date.toLocaleDateString('ru-RU', { weekday: 'short' });
                const dayDate = day.date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });

                const row = document.createElement('div');
                row.className = 'wf-day';
                row.innerHTML = `
                    <div class="wf-date">${dayName}, ${dayDate}</div>
                    <div class="wf-icon">${bestIcon}</div>
                    <div class="wf-temp">Д: ${maxTemp > 0 ? '+' : ''}${maxTemp}° <br><span>Н: ${minTemp > 0 ? '+' : ''}${minTemp}°</span></div>
                `;
                list.appendChild(row);
            });

        } catch (e) {
            console.error("❌ Ошибка прогноза:", e);
            document.getElementById('weather-forecast-list').innerHTML = '<div style="font-size: 11px; color: var(--text-muted);">Прогноз недоступен</div>';
        }
    }

    fetchCurrentWeather();
    fetchForecast();
});
// ==========================================
// 30. АНАЛИТИКА ЭДО
// ==========================================
let edoPieChartInstance = null;
let edoBuChartInstance = null;
let edoTrendChartInstance = null;

document.addEventListener("DOMContentLoaded", function() {
        // Автоматическое определение доступных периодов в ЭДО
    setTimeout(() => {
        if (!window.bakedDataEDO || !Array.isArray(window.bakedDataEDO) || window.bakedDataEDO.length === 0) {
            document.getElementById('edo-data-range-info').innerText = "Нет данных";
            return;
        }

        let minDate = new Date(8640000000000000);
        let maxDate = new Date(0);
        let uniqueMonths = new Set();

        window.bakedDataEDO.forEach(row => {
            const d = parseISOLocal(row[0]);
            if (d) {
                if (d < minDate) minDate = d;
                if (d > maxDate) maxDate = d;
                uniqueMonths.add(row[0].substring(0, 7)); // YYYY-MM
            }
        });

        // Форматируем для плашки
        const fmt = (d) => `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth()+1).padStart(2, '0')}.${d.getFullYear()}`;
        document.getElementById('edo-data-range-info').innerText = `Данные: ${fmt(minDate)} — ${fmt(maxDate)}`;

        // Заполняем селект
        const select = document.getElementById('edo-period-select');
        const monthNames = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"];
        
        let sortedMonths = Array.from(uniqueMonths).sort();
        sortedMonths.forEach(m => {
            const [y, mm] = m.split('-');
            const opt = document.createElement('option');
            opt.value = m;
            opt.innerText = `${monthNames[parseInt(mm)-1]} ${y}`;
            select.appendChild(opt);
        });

        // Добавляем слушатель на смену месяца
        select.addEventListener('change', renderEdoAnalytics);
    }, 1000); // Ждем, пока данные распакуются
    const edoHeader = document.getElementById('edo-header');
    const edoPanel = document.getElementById('edo-panel');
    const edoExpandIcon = document.getElementById('edo-expand-icon');
    const edoFilterToggle = document.getElementById('edo-filter-toggle');

    if (!edoHeader) return;

    edoHeader.addEventListener('click', () => {
        if (edoPanel.style.display === 'none') {
            edoPanel.style.display = 'block';
            edoExpandIcon.innerText = '▲';
            renderEdoAnalytics(); // Отрисовываем при открытии
        } else {
            edoPanel.style.display = 'none';
            edoExpandIcon.innerText = '▼';
        }
    });

    if (edoFilterToggle) {
        edoFilterToggle.addEventListener('change', renderEdoAnalytics);
    }
    const edoFilterStrict = document.getElementById('edo-filter-strict');
    if (edoFilterStrict) {
        edoFilterStrict.addEventListener('change', renderEdoAnalytics);
    }
    setTimeout(() => {
        if (typeof renderEdoAnalytics === 'function') {
            renderEdoAnalytics();
        }
    }, 500);
});

function renderEdoAnalytics() {
    if (!window.bakedDataEDO || !Array.isArray(window.bakedDataEDO)) return;

    const filterCoreOnly = document.getElementById('edo-filter-toggle')?.checked || false;
    const filterStrict = document.getElementById('edo-filter-strict')?.checked || false;
        // Контрагенты, которых мы принудительно считаем электронными
    const forcedElectronic = [
        'Министерство лесного хозяйства и пожарной безопасности Амурской области',
        'Аптрейд',
        'Смартвэй'
    ];
    
    const coreBEs = ['Атлас Майнинг', 'Покровский рудник', 'Албынский рудник', 'Маломырский рудник'];

    let filteredData = window.bakedDataEDO;
    const selectedPeriod = document.getElementById('edo-period-select')?.value || 'all';

    // Если выбран конкретный месяц
    if (selectedPeriod !== 'all') {
        const [year, month] = selectedPeriod.split('-');
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0, 23, 59, 59); // Последний день месяца
        
        filteredData = filteredData.filter(row => {
            const d = parseISOLocal(row[0]);
            return d >= startDate && d <= endDate;
        });
    }
    // Если 'all', то filteredData остается полным массивом

    // Фильтр по БЕ
    if (filterCoreOnly) {
        filteredData = filteredData.filter(row => coreBEs.some(core => row[1].includes(core)));
    }

    // Сбор статистики
    let contractors = {}; 
    filteredData.forEach(row => {
        const [date, org, cont, channel] = row;
        if (!contractors[cont]) contractors[cont] = { edo: 0, paper: 0, bes: new Set() };
        
        if (channel.toLowerCase().includes('эдо') || channel.toLowerCase().includes('электрон')) {
            contractors[cont].edo++;
        } else {
            contractors[cont].paper++;
        }
        contractors[cont].bes.add(org);
    });

    let totalElec = 0;
    let totalPaper = 0;
    let paperList = [];

    for (let name in contractors) {
        const c = contractors[name];
        
                // Проверяем, есть ли контрагент в белом списке
        let isForced = forcedElectronic.some(f => name.includes(f));
        
        let isElectronic = false;
        if (isForced) {
            isElectronic = true; // Принудительно электронный
        } else if (filterStrict) {
            isElectronic = c.edo >= 1; 
        } else {
            isElectronic = c.edo > c.paper;
        }
// СОХРАНЯЕМ СТАТУС В ОБЪЕКТ
        contractors[name].isElectronic = isElectronic;

        if (isElectronic) {
            totalElec++;
        } else {
            totalPaper++;
            paperList.push({
                name: name,
                total: c.edo + c.paper,
                paper: c.paper,
                edo: c.edo,
                bes: Array.from(c.bes)
            });
        }
    }

        const totalConts = totalElec + totalPaper;
    const edoShare = totalConts > 0 ? Math.round((totalElec / totalConts) * 100) : 0;
    
    // 1. СНАЧАЛА обновляем главный KPI
    const kpiEl = document.getElementById('edo-main-kpi');
    if (kpiEl) kpiEl.innerText = `${edoShare}%`;
    
    // 2. И ТОЛЬКО ПОТОМ проверяем, открыта ли панель для отрисовки графиков
    if (document.getElementById('edo-panel').style.display === 'none') return;

    // 3. Круговая диаграмма
    if (edoPieChartInstance) edoPieChartInstance.destroy();
    const ctxPie = document.getElementById('edoPieChart').getContext('2d');
    edoPieChartInstance = new Chart(ctxPie, {
        type: 'doughnut',
        data: {
            labels: ['Электронные', 'Бумажные'],
            datasets: [{
                data: [totalElec, totalPaper],
                backgroundColor: ['#2ECC71', '#E74C3C'],
                borderWidth: 1,
                borderColor: document.body.classList.contains('dark-theme') ? '#1E1E1E' : '#fff'
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false, cutout: '60%',
            plugins: {
                title: { display: true, text: `Статус контрагентов (${filterCoreOnly ? 'Основные БЕ' : 'Все БЕ'})`, color: getTextColor(), font: {size: 14} },
                legend: { position: 'bottom', labels: { color: getTextColor() } },
                doughnutLabels: {}
            }
        },
        plugins: [doughnutLabelsPlugin]
    });

    // 4. Столбчатая диаграмма по БЕ (возвращаем полные названия)
    let buStats = {}; 
    for (let name in contractors) {
        const c = contractors[name];
        let isElectronic = filterStrict ? c.edo > 1 : c.edo > c.paper;
        const status = isElectronic ? 'elec' : 'paper';
        
        c.bes.forEach(org => {
            // Оставляем полное название всегда, независимо от фильтра
            let displayOrg = org; 
            
            if (filterCoreOnly && !coreBEs.some(core => org.includes(core))) return;

            if (!buStats[displayOrg]) buStats[displayOrg] = { elec: 0, paper: 0 };
            buStats[displayOrg][status]++;
        });
    }

    if (edoBuChartInstance) edoBuChartInstance.destroy();
    const ctxBu = document.getElementById('edoBuChart').getContext('2d');
    let labels = Object.keys(buStats).sort(); // Сортируем по алфавиту
    
    edoBuChartInstance = new Chart(ctxBu, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                { label: 'Электронные', data: labels.map(l => buStats[l].elec), backgroundColor: '#2ECC71', borderRadius: 4 },
                { label: 'Бумажные', data: labels.map(l => buStats[l].paper), backgroundColor: '#E74C3C', borderRadius: 4 }
            ]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: {
                title: { display: true, text: 'Контрагенты по Бизнес-Единицам', color: getTextColor(), font: {size: 14} },
                legend: { position: 'bottom', labels: { color: getTextColor() } }
            },
            scales: {
                x: { stacked: true, ticks: { color: getTextColor(), maxRotation: 45, minRotation: 45, font: {size: 10} }, grid: { display: false } },
                y: { stacked: true, ticks: { color: getTextColor() }, grid: { color: document.body.classList.contains('dark-theme') ? '#333' : '#eee' } }
            }
        }
    });
            // 5. Рисуем график динамики (по месяцам)
    const applyStatusToTrend = document.getElementById('edo-filter-apply-status')?.checked || false;
    
    let monthlyData = {};
    filteredData.forEach(row => {
        const month = row[0].substring(0, 7); // Формат YYYY-MM
        const contName = row[2]; // Имя контрагента
        const channel = row[3].toLowerCase(); // Канал
        
        if (!monthlyData[month]) monthlyData[month] = { total: 0, edo: 0 };
        monthlyData[month].total++;
        
        // Базовая проверка: прошел ли документ по ЭДО
        let isEdo = channel.includes('эдо') || channel.includes('электрон');
        
        // Если включена галочка и контрагент имеет статус "Электронный", то ВСЕ его документы идут в ЭДО
        if (applyStatusToTrend && contractors[contName] && contractors[contName].isElectronic) {
            isEdo = true; 
        }
        
        if (isEdo) {
            monthlyData[month].edo++;
        }
    });

    const sortedMonths = Object.keys(monthlyData).sort();
    const monthNames = ["Янв", "Фев", "Мар", "Апр", "Май", "Июн", "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек"];
    
    const trendLabels = sortedMonths.map(m => {
        const [y, mm] = m.split('-');
        return `${monthNames[parseInt(mm)-1]} ${y}`;
    });
    
    const trendData = sortedMonths.map(m => {
        return monthlyData[m].total > 0 ? Math.round((monthlyData[m].edo / monthlyData[m].total) * 100) : 0;
    });

    if (edoTrendChartInstance) edoTrendChartInstance.destroy();
    const ctxTrend = document.getElementById('edoTrendChart').getContext('2d');
    
    edoTrendChartInstance = new Chart(ctxTrend, {
        type: 'line',
        data: {
            labels: trendLabels,
            datasets: [{
                label: 'Доля ЭДО-документов (%)',
                data: trendData,
                borderColor: '#3498DB',
                backgroundColor: 'rgba(52, 152, 219, 0.2)',
                borderWidth: 3,
                pointRadius: 4,
                pointBackgroundColor: '#3498DB',
                fill: true,
                tension: 0.3
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: {
                title: { display: true, text: 'Динамика внедрения ЭДО по месяцам', color: getTextColor(), font: {size: 14} },
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: function(context) { return ` Доля ЭДО: ${context.raw}%`; }
                    }
                }
            },
            scales: {
                x: { ticks: { color: getTextColor() }, grid: { display: false } },
                y: { 
                    beginAtZero: true, 
                    max: 100,
                    ticks: { color: getTextColor(), callback: function(value) { return value + '%'; } },
                    grid: { color: document.body.classList.contains('dark-theme') ? '#333' : '#eee' }
                }
            }
        }
    });

    // 5. Таблица
    const tbody = document.getElementById('edo-paper-table-body');
    tbody.innerHTML = '';
    paperList.sort((a, b) => b.paper - a.paper);

    paperList.forEach(cont => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td style="font-weight: bold; font-size: 13px;">${cont.name}</td>
            <td style="text-align: center;">${cont.total}</td>
            <td style="text-align: center; color: #E74C3C; font-weight: bold;">${cont.paper}</td>
            <td style="text-align: center; color: #2ECC71;">${cont.edo}</td>
            <td style="font-size: 11px;">${cont.bes.join(', ')}</td>
        `;
        tbody.appendChild(tr);
    });

    if (tbody.children.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: var(--text-muted); padding: 20px;">Нет данных за выбранный период</td></tr>';
    }
        // --- СВЕРКА С ДИАДОК ---
    const diadokMatchesBody = document.getElementById('diadok-matches-body');
    const diadokBlindBody = document.getElementById('diadok-blind-body');

    if (diadokMatchesBody && diadokBlindBody) {
        diadokMatchesBody.innerHTML = '';
        diadokBlindBody.innerHTML = '';

        // 1. Сбои в ЭДО
        if (window.bakedDiadokMatches && window.bakedDiadokMatches.length > 0) {
            window.bakedDiadokMatches.forEach(row => {
                // row = [cont_name, inn, diadok_ids, paper_count, orgs]
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td style="word-wrap: break-word; max-width: 150px; font-size: 11px;">${row[0]}</td>
                    <td style="text-align: center; font-family: monospace; font-size: 11px;">${row[1]}</td>
                    <td style="text-align: center; font-weight: bold; color: #E74C3C; font-size: 11px;">${row[3]}</td>
                    <td style="font-family: monospace; font-size: 10px; color: var(--text-muted); word-wrap: break-word;">${row[2]}</td>
                `;
                diadokMatchesBody.appendChild(tr);
            });
        } else {
            diadokMatchesBody.innerHTML = '<tr><td colspan="4" style="text-align: center; padding: 15px; color: var(--text-muted);">Сбоев не обнаружено 🎉</td></tr>';
        }

        // 2. Слепые зоны
        if (window.bakedDiadokBlind && window.bakedDiadokBlind.length > 0) {
            window.bakedDiadokBlind.forEach(row => {
                // row = [cont_name, inn, paper_count, orgs]
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td style="word-wrap: break-word; max-width: 150px; font-size: 11px;">${row[0]}</td>
                    <td style="text-align: center; font-family: monospace; font-size: 11px;">${row[1]}</td>
                    <td style="text-align: center; font-weight: bold; color: #E67E22; font-size: 11px;">${row[2]}</td>
                    <td style="font-size: 11px;">${row[3]}</td>
                `;
                diadokBlindBody.appendChild(tr);
            });
        } else {
            diadokBlindBody.innerHTML = '<tr><td colspan="4" style="text-align: center; padding: 15px; color: var(--text-muted);">Все контрагенты настроены</td></tr>';
        }
    }
}
// ==========================================
// 31. ЭДО-АССИСТЕНТ (УМНЫЙ АНАЛИЗ)
// ==========================================
document.addEventListener("DOMContentLoaded", function() {
    const openBtn = document.getElementById('open-ai-assistant-btn');
    const modal = document.getElementById('ai-assistant-modal');
    const closeBtn = document.getElementById('close-ai-assistant');
    const textContainer = document.getElementById('ai-analysis-text');

    if (!openBtn || !modal) return;

    openBtn.addEventListener('click', () => {
        modal.style.display = 'flex';
        generateAiInsights();
    });

    closeBtn.addEventListener('click', () => modal.style.display = 'none');
    window.addEventListener('click', (e) => { if (e.target === modal) modal.style.display = 'none'; });

        // Эффект появления по абзацам (вместо печатной машинки, чтобы не ломались теги)
    function revealInsights(htmlArray, element, speed = 400) {
        element.innerHTML = '';
        let i = 0;
        
        function showNext() {
            if (i < htmlArray.length) {
                const div = document.createElement('div');
                div.style.marginBottom = '15px';
                div.style.opacity = '0';
                div.style.transition = 'opacity 0.3s ease';
                div.innerHTML = htmlArray[i];
                element.appendChild(div);
                
                // Плавное появление
                setTimeout(() => { div.style.opacity = '1'; }, 50);
                
                i++;
                setTimeout(showNext, speed);
            }
        }
        showNext();
    }

    function generateAiInsights() {
        if (!window.bakedDataEDO || !Array.isArray(window.bakedDataEDO)) return;
        
        const data = window.bakedDataEDO;
        const coreBEs = ['Атлас Майнинг', 'Покровский рудник', 'Албынский рудник', 'Маломырский рудник'];
        const forcedElectronic = [
            'Министерство лесного хозяйства и пожарной безопасности Амурской области',
            'Аптрейд', 'Смартвэй'
        ];
        
        const filterCoreOnly = document.getElementById('edo-filter-toggle')?.checked || false;
        
        const startDate = window.currentFilterStart || new Date(0);
        const endDate = window.currentFilterEnd || new Date(8640000000000000);

        let filteredData = data;
        if (startDate.getTime() > 0) {
            filteredData = filteredData.filter(row => {
                const d = parseISOLocal(row[0]);
                return d >= startDate && d <= endDate;
            });
        }
        if (filterCoreOnly) {
            filteredData = filteredData.filter(row => coreBEs.some(core => row[1].includes(core)));
        }

        let contractors = {};
        let buStats = {};
        
        filteredData.forEach(row => {
            const [date, org, cont, channel] = row;
            if (!contractors[cont]) contractors[cont] = { edo: 0, paper: 0, bes: new Set() };
            if (!buStats[org]) buStats[org] = { edo: 0, paper: 0 };
            
            const isEdo = channel.toLowerCase().includes('эдо') || channel.toLowerCase().includes('электрон');
            
            if (isEdo) {
                contractors[cont].edo++;
                buStats[org].edo++;
            } else {
                contractors[cont].paper++;
                buStats[org].paper++;
            }
            contractors[cont].bes.add(org);
        });

        let insights = [];

        // 1. Топ бумажных (с учетом белого списка)
        let paperConts = Object.keys(contractors).filter(c => {
            const isForced = forcedElectronic.some(f => c.includes(f));
            return !isForced && contractors[c].paper > contractors[c].edo;
        }).sort((a,b) => contractors[b].paper - contractors[a].paper);

        if (paperConts.length > 0) {
            insights.push(`📌 <b>Зона риска:</b> Наибольший объем бумаги приходит от <span class="ai-danger">${paperConts[0]}</span> (${contractors[paperConts[0]].paper} док.). Рекомендуется связаться с их бухгалтерией.`);
        }

        // 2. Зона роста (30-49%)
        let growthZone = [];
        for (let c in contractors) {
            const isForced = forcedElectronic.some(f => c.includes(f));
            if (isForced) continue;
            
            const total = contractors[c].edo + contractors[c].paper;
            if (total > 5) {
                const edoShare = contractors[c].edo / total;
                if (edoShare >= 0.3 && edoShare < 0.5) growthZone.push(c);
            }
        }
        if (growthZone.length > 0) {
            insights.push(`🎯 <b>Зона роста:</b> Контрагенты <span class="ai-highlight">${growthZone.slice(0,3).join(', ')}</span> уже используют ЭДО на 30-49%. Небольшое усилие поможет им полностью отказаться от бумаги.`);
        }

        // 3. Частичное внедрение (с учетом белого списка)
        let partial = [];
        for (let c in contractors) {
            const isForced = forcedElectronic.some(f => c.includes(f));
            if (isForced) continue;

            if (contractors[c].bes.size > 1 && contractors[c].edo > 0 && contractors[c].paper > 0) {
                partial.push(c);
            }
        }
        if (partial.length > 0) {
            insights.push(`🔀 <b>Частичное внедрение:</b> <span class="ai-highlight">${partial.slice(0,2).join(', ')}</span> работают с нами по ЭДО, но все еще присылают бумагу. Обратите на это внимание и необходимо принять меры.`);
        }

        // 4. Сравнение БЕ
        let worstBE = null;
        let worstPercent = 100;
        for (let bu in buStats) {
            const total = buStats[bu].edo + buStats[bu].paper;
            if (total > 10) {
                const pct = (buStats[bu].edo / total) * 100;
                if (pct < worstPercent) {
                    worstPercent = pct;
                    worstBE = bu;
                }
            }
        }
        if (worstBE) {
            insights.push(`📉 <b>Точка внимания:</b> В <span class="ai-danger">${worstBE}</span> зафиксирован самый низкий уровень ЭДО-документов (${Math.round(worstPercent)}%).`);
        }

        // 5. Мелкие поставщики (игнорируем)
        let smallPaper = Object.keys(contractors).filter(c => {
            const isForced = forcedElectronic.some(f => c.includes(f));
            return !isForced && contractors[c].paper > 0 && contractors[c].paper <= 2;
        });
        if (smallPaper.length > 0) {
            insights.push(`⏭️ <b>Игнорирование:</b> Найдено <span class="ai-highlight">${smallPaper.length}</span> контрагентов, которые прислали всего 1-2 бумажных документа. Не тратьте на них ресурс.`);
        }

        insights.push(`📈 <b>Прогноз:</b> При сохранении текущих темпов цифровизации, полный переход на ЭДО ожидается в течение ближайших 6-8 месяцев.`);

        // Добавляем заголовок
        let finalHtmlArray = [
            `<span style="color:#2ECC71; font-weight:bold;">> Анализ завершен. Обработано ${filteredData.length} строк данных.</span>`
        ];
        finalHtmlArray = finalHtmlArray.concat(insights);
        
        revealInsights(finalHtmlArray, document.getElementById('ai-analysis-text'), 500);
    }
});
// ==========================================
// 32. ГЛОБАЛЬНЫЙ ИИ-АССИСТЕНТ
// ==========================================
document.addEventListener("DOMContentLoaded", function() {
    const aiBtn = document.getElementById('global-ai-btn');
    const aiModal = document.getElementById('global-ai-modal');
    const closeAiBtn = document.getElementById('close-global-ai');
    const chatHistory = document.getElementById('ai-chat-history');
    const aiInput = document.getElementById('ai-input-field');
    const sendBtn = document.getElementById('ai-send-btn');

    if (!aiBtn || !aiModal) return;

    aiBtn.addEventListener('click', () => {
        aiModal.style.display = 'flex';
        aiInput.focus();
    });

    closeAiBtn.addEventListener('click', () => aiModal.style.display = 'none');
    window.addEventListener('click', (e) => { if (e.target === aiModal) aiModal.style.display = 'none'; });

    sendBtn.addEventListener('click', () => {
        const text = aiInput.value.trim();
        if (text) {
            handleGlobalAIPrompt(text);
            aiInput.value = '';
        }
    });

    aiInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendBtn.click();
    });

    // Делаем функцию глобальной, чтобы её можно было вызывать из HTML (onclick)
    window.handleGlobalAIPrompt = function(promptText) {
        // 1. Добавляем сообщение пользователя в чат
        addChatMessage(promptText, 'user');
        
        // 2. Показываем анимацию "печатает..."
        const typingId = showTypingIndicator();

        // 3. Обрабатываем запрос (имитация задержки для реалистичности)
        setTimeout(() => {
            removeTypingIndicator(typingId);
            const response = generateAIResponse(promptText);
            addChatMessage(response, 'bot');
        }, 800);
    };

    function addChatMessage(text, sender) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `ai-message ai-${sender}`;
        
        const avatar = sender === 'bot' ? '🤖' : '👤';
        
        // Для бота поддерживаем HTML (переносы строк и теги)
        const formattedText = sender === 'bot' ? text : text.replace(/</g, "&lt;");
        
        msgDiv.innerHTML = `
            <div class="ai-avatar">${avatar}</div>
            <div class="ai-text">${formattedText}</div>
        `;
        chatHistory.appendChild(msgDiv);
        chatHistory.scrollTop = chatHistory.scrollHeight;
    }

    function showTypingIndicator() {
        const id = 'typing-' + Date.now();
        const msgDiv = document.createElement('div');
        msgDiv.id = id;
        msgDiv.className = 'ai-message ai-bot';
        msgDiv.innerHTML = `<div class="ai-avatar">🤖</div><div class="ai-text" style="opacity: 0.6;">печатает...</div>`;
        chatHistory.appendChild(msgDiv);
        chatHistory.scrollTop = chatHistory.scrollHeight;
        return id;
    }

    function removeTypingIndicator(id) {
        const el = document.getElementById(id);
        if (el) el.remove();
    }

    function generateAIResponse(query) {
        const q = query.toLowerCase();
        
        // 1. Определяем темы
        const isAudit = q.includes('аудит') || q.includes('общ') || q.includes('итог') || q.includes('сводк');
        const isDemandLines = q.includes('строк') || q.includes('потребност') || q.includes('согласован');
        const is1C = (q.includes('1с') || q.includes('документ')) && !isDemandLines;
        const isSED = q.includes('сэд') || q.includes('задач') || q.includes('дисциплин') || q.includes('просроч');
        const isEDO = q.includes('эдо') || q.includes('бумаг') || q.includes('контрагент') || q.includes('диадок');
        const isVacation = q.includes('отпуск') || q.includes('календар') || q.includes('отдых') || q.includes('кадр');
        const isTransfers = q.includes('перенос') || q.includes('сдвиг') || q.includes('задержк');

        // 2. Ищем сотрудника
        let foundEmployee = null;
        for (let fullName in jobTitles) {
            const surname = fullName.split(' ')[0].toLowerCase();
            if (q.includes(surname)) {
                foundEmployee = fullName;
                break;
            }
        }

        // Подсказка о периоде
        let periodStr = currentGlobalPeriod === 'all' ? 'Всё время' : 
                        (currentGlobalPeriod === 'week' ? 'Неделя' : 
                        (currentGlobalPeriod === 'month' ? 'Месяц' : 'Выбранный период'));

        let header = `<i>Анализ за период: <b>${periodStr}</b> (выбран в фильтре дашборда)</i><br><br>`;

        // 3. Роутинг
        if (foundEmployee) {
            if (isVacation) return header + getEmployeeVacation(foundEmployee);
            if (isDemandLines || is1C) return header + getEmployeeResponse(foundEmployee, '1C');
            if (isSED) return header + getEmployeeResponse(foundEmployee, 'SED');
            return header + getEmployeeResponse(foundEmployee, 'ALL');
        }

        if (isAudit) return header + getAuditResponse();
        if (isDemandLines) return header + getDemandLinesResponse();
        if (isTransfers) return header + getTransfersResponse();
        if (is1C) return header + get1CResponse();
        if (isSED) return header + getSEDResponse();
        if (isEDO) return header + getEDOResponse();
        if (isVacation) return header + getVacationResponse();
        
        return `Извините, я не совсем понял запрос. Попробуйте нажать на одну из кнопок быстрого доступа.<br><br><b>Я умею анализировать:</b><br>• Общий аудит<br>• Строки потребности<br>• Задачи СЭД<br>• Переносы сроков<br>• Отпуска<br>• Данные конкретного сотрудника (например: «Покажи Абакумова» или «Отпуск Карповой»)`;
    }

    // --- НОВЫЕ И ОБНОВЛЕННЫЕ ГЕНЕРАТОРЫ ---
    function getAuditResponse() {
        try {
            if (!currentFiltered1C || !currentFilteredSED) {
                return "Данные еще не загружены. Пожалуйста, подождите пару секунд и попробуйте снова.";
            }

            let total1C = currentFiltered1C.length;
            let totalSED = currentFilteredSED.length;
            
            let sumDisc = 0, countDisc = 0;
            let empStats = {};
            
            currentFilteredSED.forEach(r => {
                let emp = getShortName(r['Сотрудник'] || '');
                if (!emp) return;
                if (!empStats[emp]) empStats[emp] = { inTime: 0, late: 0 };
                
                let delay = parseInt(String(r['Задержка, раб.дней'] || '').trim()) || 0;
                let comp = String(r['Выполнено'] || '').trim();
                
                if (delay > 0) empStats[emp].late++;
                else if (comp !== '') empStats[emp].inTime++;
            });

            for (let e in empStats) {
                let closed = empStats[e].inTime + empStats[e].late;
                if (closed > 0) { 
                    sumDisc += (empStats[e].inTime / closed * 100); 
                    countDisc++; 
                }
            }
            let avgDisc = countDisc > 0 ? Math.round(sumDisc / countDisc) : 0;

            let perenosCount = 0;
            if (window.bakedTransfers) {
                perenosCount = window.bakedTransfers.length; // Можно отфильтровать по текущему периоду, но для общего аудита сойдет
            }

            return `
                <b>Сводный отчет за выбранный период:</b><br><br>
                • Обработано документов 1С: <b>${total1C}</b><br>
                • Выполнено задач СЭД: <b>${totalSED}</b><br>
                • Средняя дисциплина отдела: <b>${avgDisc}%</b><br>
                • Оформлено переносов сроков: <b>${perenosCount}</b><br><br>
                <i>Чтобы получить детальный анализ, спросите меня, например: «Покажи строки потребности» или «Что с дисциплиной СЭД?».</i>
            `;
        } catch (e) {
            console.error("Ошибка в ИИ-Ассистенте:", e);
            return "Произошла ошибка при сборе данных. Попробуйте обновить страницу.";
        }
    }

    // Строки потребности (выделено в отдельный блок)
    function getDemandLinesResponse() {
        let soglas = currentFiltered1C.filter(r => r['Тип'] === 'Согласование строк потребности');
        if (soglas.length === 0) return "За выбранный период строк потребности не зафиксировано.";
        
        let totalDays = 0;
        let orgStats = {}; 
        
        soglas.forEach(r => {
            let days = parseInt(r['Дней согласования']) || 0;
            let org = r['Organization'] || 'Неизвестно';
            
            totalDays += days;
            if (!orgStats[org]) orgStats[org] = { totalDays: 0, count: 0 };
            orgStats[org].totalDays += days;
            orgStats[org].count++;
        });
        
        let avgSla = (totalDays / soglas.length).toFixed(1);
        
        let worstOrg = null; let worstSla = 0;
        for (let o in orgStats) {
            if (orgStats[o].count >= 5) {
                let sla = orgStats[o].totalDays / orgStats[o].count;
                if (sla > worstSla) { worstSla = sla; worstOrg = o; }
            }
        }

        // ИЩЕМ САМУЮ ДОЛГУЮ СТРОКУ В ПРАВИЛЬНОМ МАССИВЕ (bakedProblemSoglas)
        let maxDays = 0;
        let maxDaysItem = '';
        
        if (window.bakedProblemSoglas && Array.isArray(window.bakedProblemSoglas)) {
            window.bakedProblemSoglas.forEach(p => {
                // p = [date, emp, days, predmet]
                let d = parseInt(p[2]) || 0;
                if (d > maxDays) {
                    maxDays = d;
                    maxDaysItem = p[3] || 'Без названия';
                }
            });
        }

        let insight = '';
        if (worstOrg) {
            let factText = maxDaysItem ? `<br><b>💡 Интересный факт:</b> Самая «зависшая» строка периода — «${maxDaysItem.substring(0, 60)}...». Её согласовывали <b>${maxDays} дней</b>!` : '';
            
            insight = `<div class="ai-insight-box">
                <b>🔍 На что обратить внимание:</b> В бизнес-единице <b>${worstOrg}</b> зафиксирован самый долгий средний срок согласования (<b>${worstSla.toFixed(1)} дн.</b>), что выше среднего по отделу. Рекомендуется проверить загрузку специалистов на этом направлении.
                ${factText}
            </div>`;
        }

        return `
            <b>Анализ строк потребности:</b><br><br>
            • Всего согласовано строк: <b>${soglas.length}</b><br>
            • Средний SLA по отделу: <b>${avgSla} дн.</b><br>
            ${insight}
        `;
    }

    // Отпуск конкретного сотрудника
    function getEmployeeVacation(fullName) {
        if (!window.bakedDataVacations) return "Данные по отпускам не загружены.";
        
        let shortName = fullName.split(' ')[0];
        let vacs = window.bakedDataVacations.filter(v => v.name.includes(shortName));
        
        if (vacs.length === 0) return `У сотрудника <b>${fullName}</b> нет запланированных отпусков в графике.`;
        
        let text = `<b>Отпуска сотрудника ${fullName}:</b><br><br>`;
        vacs.forEach(v => {
            let start = parseISOLocal(v.start);
            let end = parseISOLocal(v.end);
            let days = Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1;
            text += `• С ${start.getDate()} ${monthNamesGenitive[start.getMonth()]} по ${end.getDate()} ${monthNamesGenitive[end.getMonth()]} (${days} дн.)<br>`;
        });
        
        return text;
    }

    // Обновленный ответ по сотруднику (берем только нужный контекст)
    function getEmployeeResponse(fullName, context = 'ALL') {
        const shortName = fullName.split(' ')[0];
        let emp1C = currentFiltered1C.filter(r => (r['Ответственный'] || '').includes(shortName));
        let empSED = currentFilteredSED.filter(r => (r['Сотрудник'] || '').includes(shortName));
        let empTransfers = (window.bakedTransfers || []).filter(r => (r[1] || '').includes(shortName));

        let response = `<b>Статистика сотрудника: ${fullName}</b><br><br>`;
        let hasData = false;

        if ((context === 'ALL' || context === '1C') && emp1C.length > 0) {
            hasData = true;
            let docTypes = {};
            emp1C.forEach(r => { let t = r['Тип'] || 'Другое'; docTypes[t] = (docTypes[t] || 0) + 1; });
            let typeText = Object.keys(docTypes).map(t => `  - ${t}: ${docTypes[t]} шт.`).join('<br>');
            response += `📄 <b>Документы 1С:</b> Всего <b>${emp1C.length}</b> шт.<br>${typeText}<br><br>`;
        }

        if ((context === 'ALL' || context === 'SED') && empSED.length > 0) {
            hasData = true;
            let inTime = 0, late = 0, inWork = 0;
            empSED.forEach(r => {
                let delay = parseInt(String(r['Задержка, раб.дней'] || '').trim()) || 0;
                let comp = String(r['Выполнено'] || '').trim();
                if (delay > 0) late++;
                else if (comp !== '') inTime++;
                else inWork++;
            });
            let closed = inTime + late;
            let discipline = closed > 0 ? Math.round((inTime / closed) * 100) : 0;
            response += `⏱️ <b>Задачи СЭД:</b> Всего <b>${empSED.length}</b> шт.<br>• В срок: ${inTime} | С нарушением: ${late} | В работе: ${inWork}<br>• <b>Дисциплина:</b> ${discipline}%<br><br>`;
        }

        if (context === 'ALL' && empTransfers.length > 0) {
            hasData = true;
            response += `🔄 <b>Переносы сроков:</b> <b>${empTransfers.length}</b> шт.<br><br>`;
        }

        if (!hasData) return `За выбранный период у сотрудника <b>${fullName}</b> нет активности по выбранному направлению.`;
        return response;
    }

    // НОВЫЙ ГЕНЕРАТОР: Переносы
    function getTransfersResponse() {
        if (!window.bakedTransfers || window.bakedTransfers.length === 0) return "Данные по переносам не загружены.";

        let startDate = window.currentFilterStart || new Date(0);
        let endDate = window.currentFilterEnd || new Date(8640000000000000);
        
        let filtered = window.bakedTransfers.filter(row => {
            let d = parseISOLocal(row[0]);
            return d >= startDate && d <= endDate;
        });

        if (filtered.length === 0) return "За выбранный период переносов сроков не зафиксировано.";

        let reasons = {};
        let emps = {};
        let contractors = {}; // Если есть инфа о контрагенте в предмете, но пока парсим по тексту
        let totalDays = 0;

        filtered.forEach(r => {
            let days = parseInt(r[4]) || 0;
            let reason = r[5] || 'Не указана';
            let emp = (r[1] || 'Неизвестный').split(' ')[0];
            let predmet = r[6] || '';

            totalDays += days;
            reasons[reason] = (reasons[reason] || 0) + 1;
            emps[emp] = (emps[emp] || 0) + 1;
        });

        let topReason = Object.keys(reasons).sort((a,b) => reasons[b] - reasons[a])[0];
        let topEmp = Object.keys(emps).sort((a,b) => emps[b] - emps[a])[0];
        let avgDiff = (totalDays / filtered.length).toFixed(1);

        let insight = `<div class="ai-insight-box">
            <b>🔍 На что обратить внимание:</b> Чаще всего сроки сдвигаются по причине <b>«${topReason}»</b>. Рекомендуется проанализировать этот процесс.<br>
            <b>💡 Интересный факт:</b> Больше всего переносов оформляет <b>${topEmp}</b> (${emps[topEmp]} шт.). Возможно, этот сотрудник работает с самыми сложными или проблемными поставщиками.
        </div>`;

        return `
            <b>Анализ переносов сроков:</b><br><br>
            • Всего оформлено переносов: <b>${filtered.length}</b><br>
            • Средний сдвиг даты: <b>${avgDiff} дн.</b><br>
            ${insight}
        `;
    }

    function get1CResponse() {
        if (!currentFiltered1C || currentFiltered1C.length === 0) return "Нет данных по 1С за выбранный период.";

        let totalDocs = currentFiltered1C.length;
        let soglas = currentFiltered1C.filter(r => r['Тип'] === 'Согласование строк потребности');
        let perenos = currentFiltered1C.filter(r => r['Тип'] === 'Перенос срока поставки');
        
        let avgSla = 0;
        if (soglas.length > 0) {
            let sum = soglas.reduce((acc, r) => acc + (parseInt(r['Дней согласования']) || 0), 0);
            avgSla = (sum / soglas.length).toFixed(1);
        }

        let orgStats = {};
        soglas.forEach(r => {
            let org = r['Organization'] || 'Неизвестно';
            orgStats[org] = (orgStats[org] || 0) + 1;
        });
        let topOrg = Object.keys(orgStats).sort((a,b) => orgStats[b] - orgStats[a])[0];

        return `
            <b>Анализ по документам 1С:</b><br><br>
            • Всего обработано документов: <b>${totalDocs}</b><br>
            • Строк потребности: <b>${soglas.length}</b><br>
            • Средний срок согласования (SLA): <b>${avgSla} дн.</b><br>
            • Наибольший объем строк поступил от: <b>${topOrg || '—'}</b><br>
            • Зафиксировано переносов сроков: <b>${perenos.length}</b><br><br>
            <i>Для просмотра проблемных строк обратитесь к панели руководителя.</i>
        `;
    }
    function getSEDResponse() {
        if (!currentFilteredSED || currentFilteredSED.length === 0) return "Нет данных по СЭД за выбранный период.";
        
        let empStats = {};
        let authors = {};
        let dailyLoad = {}; // { 'YYYY-MM-DD': count }
        let totalTasks = currentFilteredSED.length;

        currentFilteredSED.forEach(r => {
            let emp = getShortName(r['Сотрудник']);
            let author = r['Автор задачи'] || 'Неизвестен';
            
            if (emp) {
                if (!empStats[emp]) empStats[emp] = { inTime: 0, late: 0 };
                let delay = parseInt(String(r['Задержка, раб.дней'] || '').trim()) || 0;
                let comp = String(r['Выполнено'] || '').trim();
                if (delay > 0) empStats[emp].late++;
                else if (comp !== '') empStats[emp].inTime++;
            }

            let deadlineStr = r['Срок'];
            if (deadlineStr && r._parsedDate) {
                // Считаем нагрузку по дням
                let dateKey = r._parsedDate.toISOString().split('T')[0];
                dailyLoad[dateKey] = (dailyLoad[dateKey] || 0) + 1;

                let dDate = parseExcelDate(deadlineStr);
                if (dDate) {
                    let diff = Math.ceil((dDate - r._parsedDate) / (1000 * 60 * 60 * 24));
                    if (diff <= 2) authors[author] = (authors[author] || 0) + 1;
                }
            }
        });

        let worstEmp = null, worstPct = 101;
        for (let e in empStats) {
            let total = empStats[e].inTime + empStats[e].late;
            if (total >= 5) {
                let pct = Math.round((empStats[e].inTime / total) * 100);
                if (pct < worstPct) { worstPct = pct; worstEmp = e; }
            }
        }

        let topAuthor = Object.keys(authors).sort((a,b) => authors[b] - authors[a])[0];
        
        // Ищем пиковый день
        let peakDay = Object.keys(dailyLoad).sort((a,b) => dailyLoad[b] - dailyLoad[a])[0];
        let peakCount = dailyLoad[peakDay] || 0;
        let peakDateStr = peakDay ? new Date(peakDay).toLocaleDateString('ru-RU', {day: 'numeric', month: 'long'}) : '';

        let insight = `<div class="ai-insight-box">
            <b>🔍 На что обратить внимание:</b> Наибольшее количество просрочек у <b>${worstEmp ? worstEmp.charAt(0).toUpperCase() + worstEmp.slice(1) : '—'}</b> (${worstPct}% выполнено в срок).<br>
            <b>💡 Интересный факт:</b> Пик нагрузки пришелся на <b>${peakDateStr}</b> — в этот день поступило <b>${peakCount}</b> задач${topAuthor ? `, а больше всего «горящих» задач (срок < 2 дней) ставит <b>${topAuthor}</b>` : ''}.
        </div>`;

        return `
            <b>Анализ дисциплины СЭД:</b><br><br>
            • Всего задач за период: <b>${totalTasks}</b><br>
            ${insight}
        `;
    }

    function getEDOResponse() {
        if (!window.bakedDataEDO) return "Данные ЭДО не загружены.";
        
        // Вычисляем дату последней выгрузки для предупреждения
        let maxDate = new Date(0);
        window.bakedDataEDO.forEach(r => {
            let d = parseISOLocal(r[0]);
            if (d && d > maxDate) maxDate = d;
        });
        let dateWarning = maxDate.getTime() > 0 ? `<br><br>⚠️ <i>Внимание: данные ЭДО актуальны по <b>${String(maxDate.getDate()).padStart(2, '0')}.${String(maxDate.getMonth()+1).padStart(2, '0')}.${maxDate.getFullYear()}</b> (ежемесячная выгрузка).</i>` : "";

        // Упрощенный расчет статусов
        let conts = {};
        window.bakedDataEDO.forEach(r => {
            if (!conts[r[2]]) conts[r[2]] = { e: 0, p: 0 };
            let ch = r[3].toLowerCase();
            if (ch.includes('эдо') || ch.includes('электрон')) conts[r[2]].e++;
            else conts[r[2]].p++;
        });

        let elec = 0, paper = 0;
        for (let c in conts) {
            if (conts[c].e > conts[c].p) elec++;
            else paper++;
        }
        let share = Math.round((elec / (elec + paper)) * 100);

        return `
            <b>Анализ ЭДО:</b><br><br>
            • Доля контрагентов на ЭДО: <b>${share}%</b><br>
            • Электронных контрагентов: <b>${elec}</b><br>
            • Бумажных контрагентов: <b>${paper}</b><br>
            ${dateWarning}
        `;
    }

    function getVacationResponse() {
        if (!window.bakedDataVacations) return "Данные по отпускам не загружены.";

        const today = new Date();
        today.setHours(0,0,0,0);
        const next30Days = new Date(today);
        next30Days.setDate(today.getDate() + 30);

        let onVacation = new Set();
        let dailyVacations = {}; // { 'YYYY-MM-DD': count }

        window.bakedDataVacations.forEach(vac => {
            let start = parseISOLocal(vac.start);
            let end = parseISOLocal(vac.end);
            if (end >= today && start <= next30Days) {
                onVacation.add(vac.name.split(' ')[0]);
                
                // Считаем пересечения
                let current = new Date(start);
                while (current <= end) {
                    if (current >= today && current <= next30Days) {
                        let key = current.toISOString().split('T')[0];
                        dailyVacations[key] = (dailyVacations[key] || 0) + 1;
                    }
                    current.setDate(current.getDate() + 1);
                }
            }
        });

        let uniq = Array.from(onVacation);
        
        // Ищем самый "пустой" день
        let worstDay = Object.keys(dailyVacations).sort((a,b) => dailyVacations[b] - dailyVacations[a])[0];
        let worstCount = worstDay ? dailyVacations[worstDay] : 0;
        let worstDateStr = worstDay ? new Date(worstDay).toLocaleDateString('ru-RU', {day: 'numeric', month: 'long'}) : '';

        let insight = worstDay ? `<div class="ai-insight-box">
            <b>🔍 Кадровый риск:</b> <b>${worstDateStr}</b> в отпуске одновременно будут <b>${worstCount}</b> сотрудников. Рекомендуется не назначать критически важные дедлайны на этот день.
        </div>` : '';

        return `
            <b>Анализ графика отпусков:</b><br><br>
            • В ближайшие 30 дней в отпуске будут: <b>${uniq.length}</b> чел.<br>
            ${insight}
        `;
    }
});
// ==========================================
// 33. СХЕМА ЭТАЖА
// ==========================================
document.addEventListener("DOMContentLoaded", function() {
    const showBtn = document.getElementById('show-floorplan-btn');
    const floorplanModal = document.getElementById('floorplan-modal');
    const closeBtn = document.getElementById('close-floorplan');
    const container = document.getElementById('floorplan-container');

    if (!showBtn || !floorplanModal) return;

    showBtn.addEventListener('click', (e) => {
        e.preventDefault();
        // Закрываем окно сотрудников, чтобы не мешало
        document.getElementById('info-modal').style.display = 'none';
        floorplanModal.style.display = 'flex';
        renderFloorPlan();
    });

    closeBtn.addEventListener('click', () => floorplanModal.style.display = 'none');
    window.addEventListener('click', (e) => { if (e.target === floorplanModal) floorplanModal.style.display = 'none'; });

    // Данные о сотрудниках (используем те, что в справочнике)
    const phones = {
        "Родионова Ольга Вячеславовна": "1907", "Дашкевич Алина Максимовна": "1913",
        "Полищук Татьяна Николаевна": "1915", "Карпова Наталья Викторовна": "1922",
        "Абакумов Дмитрий Алексеевич": "1845", "Кононов Олег Викторович": "1931",
        "Кононова Анастасия Дмитриевна": "1927", "Игнатюк Яна Сергеевна": "1929",
        "Васильева Татьяна Владимировна": "1847", "Плигина Мария Валерьевна": "1830"
    };

        // Структура этажа
    const layout = [
        { 
            id: '211', area: 87.3, className: 'fp-room-211',
            desks: [
                // --- ВЕРХНЯЯ БОЛЬШАЯ ЧАСТЬ ---
                { name: '', x: 10, y: 15 }, // Левый верхний угол
                { name: '', x: 10, y: 35 }, // Чуть ниже, впритык
                { name: '', x: 35, y: 10 }, // Верх по центру (1)
                { name: '', x: 50, y: 10 }, // Верх по центру (2)
                { name: '', x: 50, y: 45 }, // В нижней области, на пересечении Т-перегородки

                // --- НИЖНЯЯ ЛЕВАЯ ЧАСТЬ (КАРПОВА) ---
                { name: '', x: 15, y: 75 }, // Левая сторона
                { name: 'Карпова Наталья Викторовна', x: 40, y: 75 }, // Правая сторона

                // --- НИЖНЯЯ ПРАВАЯ ЧАСТЬ (ПОЛИЩУК) ---
                { name: 'Полищук Татьяна Николаевна', x: 60, y: 60 }, // Левый верхний угол малого кабинета
                { name: '', x: 60, y: 90 }, // Левый нижний угол
                { name: '', x: 90, y: 60 }  // Правый верхний угол
            ] 
        },
        { id: 'StairsLeft', area: 10, isStair: true },
        { id: 'T', area: 6, isToilet: true, desks: [] },
        { 
            id: '209', area: 14.4, 
            desks: [
                { name: '', x: 50, y: 20 },
                { name: '', x: 50, y: 70 }
            ] 
        },
        { id: '208', area: 14.5, desks: [{ name: '', x: 50, y: 50 }] },
        { id: '207', area: 14.8, desks: [{ name: '', x: 50, y: 50 }] },
        { 
            id: '206', area: 15.1, 
            desks: [
                { name: 'Васильева Татьяна Владимировна', x: 30, y: 70 },
                { name: 'Плигина Мария Валерьевна', x: 70, y: 70 }
            ] 
        },
        { 
            id: '205', area: 30.9, 
            desks: [
                { name: 'Игнатюк Яна Сергеевна', x: 30, y: 25 },
                { name: 'Кононов Олег Викторович', x: 70, y: 25 },
                { name: 'Абакумов Дмитрий Алексеевич', x: 20, y: 75 }, // <-- ПОМЕНЯЛИ МЕСТАМИ С КОНОНОВОЙ
                { name: 'Кононова Анастасия Дмитриевна', x: 50, y: 75 },
                { name: 'Дашкевич Алина Максимовна', x: 80, y: 75 } // <-- ПОМЕНЯЛИ МЕСТАМИ С АБАКУМОВЫМ
            ] 
        },
        { 
            id: '204', area: 30.1, 
            desks: [
                { name: '', x: 20, y: 25 },
                { name: '', x: 20, y: 75 },
                { name: '', x: 80, y: 75 }
            ] 
        },
        { 
            id: '203', area: 30.4, 
            desks: [
                { name: '', x: 20, y: 25 },
                { name: '', x: 20, y: 75 }
            ] 
        },
        { 
            id: '202', area: 14.5, 
            desks: [
                { name: 'Черноскутов Н.А.', x: 50, y: 70 }
            ] 
        },
        { 
            id: '201', area: 14.7, 
            desks: [
                { name: 'Родионова Ольга Вячеславовна', x: 50, y: 25 },
                { name: '', x: 50, y: 75 }
            ] 
        },
        { id: 'StairsRight', area: 10, isStair: true }
    ];

    function renderFloorPlan() {
        let html = `<div class="floorplan-wrapper">`;
        
        html += `<div class="floorplan-corridor"><span>⬅️ Выход на лестницу</span><span>Коридор</span><span>Выход из коридора ➡️</span></div>`;

        layout.forEach(room => {
            if (room.isStair) {
                html += `<div class="fp-stair" style="flex-grow: ${room.area};">ЛЕСТНИЦА</div>`;
                return;
            }

            let roomClass = room.className ? `fp-room ${room.className}` : 'fp-room';
            html += `<div class="${roomClass}" style="flex-grow: ${room.area};">`;
            
            if (!room.isToilet) {
                html += `<div class="fp-room-label">${room.id}</div>`;
            } else {
                html += `<div style="position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); color:var(--brand-orange); font-size:20px; opacity:0.5;">🚻</div>`;
            }

            room.desks.forEach(desk => {
                const style = `left: ${desk.x}%; top: ${desk.y}%;`;
                
                if (desk.name) {
                    let initials = desk.name.split(' ').map(n => n[0]).join('').substring(0,2);
                    let color = getAvatarColor(desk.name);
                    let role = jobTitles[desk.name] || 'Сотрудник';
                    let phone = phones[desk.name] ? `доб. ${phones[desk.name]}` : '—';
                    
                    if (desk.name === 'Черноскутов Н.А.') {
                        role = 'Директор департамента';
                        phone = '—';
                    }

                    html += `
                        <div class="fp-desk occupied" style="${style} background-color: ${color};">
                            ${initials}
                            <div class="desk-tooltip">
                                <b>${desk.name}</b><br>
                                <span style="color:var(--brand-orange);">${role}</span><br>
                                📞 ${phone}
                            </div>
                        </div>
                    `;
                } else {
                    html += `<div class="fp-desk empty" style="${style}"></div>`;
                }
            });

            html += `</div>`;
        });

        html += `</div>`;
        container.innerHTML = html;
    }
});
// ==========================================
// 34. СИСТЕМА ДОСТИЖЕНИЙ (АЧИВКИ)
// ==========================================
const VOLUME_ACHIEVEMENTS = [
    { id: 'v_orders', title: 'Заказ поставщику', icon: '📦', match: 'Заказ поставщику', thresholds: [100, 300, 1700, 3500] },
    { id: 'v_shipments', title: 'Отгрузка ТМЦ', icon: '🚚', match: 'Отгрузка ТМЦ от поставщика', thresholds: [100, 350, 2000, 4000] },
    { id: 'v_receipts', title: 'Поступление ТМЦ', icon: '📥', match: 'Поступление ТМЦ и услуг', thresholds: [50, 200, 1200, 2500] },
    { id: 'v_payments', title: 'Заявки на оплату', icon: '💳', match: 'Заявка на оплату', thresholds: [100, 350, 1000, 2000] },
    { id: 'v_registers', title: 'Реестры', icon: '📂', match: 'Реестр заявок на оплату', thresholds: [80, 300, 1700, 3500] },
    { id: 'v_transfers', title: 'Переносы', icon: '🔄', match: 'Перенос срока поставки', thresholds: [300, 1200, 6000, 10000] },
    { id: 'v_dicts', title: 'Справочники', icon: '📝', match: 'Заявка на добавление/изменение записи справочника', thresholds: [100, 350, 1200, 2500] },
    { id: 'v_contracts', title: 'Договоры', icon: '📜', match: 'Договоры контрагентов', thresholds: [85, 300, 1500, 3000] },
    { id: 'v_lines', title: 'Строки потребности', icon: '📄', match: 'Согласование строк потребности', thresholds: [1500, 5000, 25000, 50000] },
    { id: 'v_delivery', title: 'Доставка', icon: '🚛', match: 'Доставка ТМЦ', thresholds: [20, 70, 400, 700] },
    { id: 'v_sed', title: 'СЭД-Марафонец', icon: '✅', match: 'SED', thresholds: [100, 400, 2200, 4500] },
    { id: 'v_minor', title: 'Мастер на все руки', icon: '🧰', match: 'MINOR', thresholds: [50, 200, 1000, 2000] }
];

// Конфигурация достижений
const ACHIEVEMENTS_CONFIG = [
    // Базовые (за объемы)
    { id: 'lines', title: 'Эксперт строк', icon: '📄', thresholds: [50000, 100000, 500000, 1000000], type: '1C', match: 'Согласование строк потребности', desc: 'За проведение строк потребностей.' },
    { id: 'orders', title: 'Мастер заказов', icon: '📦', thresholds: [5000, 8000, 10000, 15000], type: '1C', match: 'Заказ поставщику', desc: 'За проведение заказов поставщикам.' },
    { id: 'shipments', title: 'Контролер отгрузок', icon: '🚚', thresholds: [5000, 8000, 10000, 15000], type: '1C', match: 'Отгрузка ТМЦ от поставщика', desc: 'За проведение отгрузок ТМЦ.' },
    { id: 'receipts', title: 'Хранитель поставок', icon: '📥', thresholds: [2000, 5000, 7000, 10000], type: '1C', match: 'Поступление ТМЦ и услуг', desc: 'За проведение поступлений ТМЦ.' },
    { id: 'payments', title: 'Финансовый контролер', icon: '💳', thresholds: [2000, 5000, 7000, 10000], type: '1C', match: ['Заявка на оплату', 'Реестр заявок на оплату'], desc: 'За работу с заявками на оплату.' },
    { id: 'registers', title: 'Архивариус', icon: '📂', thresholds: [1000, 3000, 5000], type: '1C', match: 'Реестр заявок на оплату', desc: 'За проведение реестров заявок.' },
    { id: 'additions', title: 'Систематизатор', icon: '📝', thresholds: [3000, 5000, 7000, 10000], type: '1C', match: 'Заявка на добавление/изменение записи справочника', desc: 'За работу со справочниками.' },
    { id: 'contracts', title: 'Эксперт договоров', icon: '📜', thresholds: [3000, 5000, 7000, 10000], type: '1C', match: 'Договоры контрагентов', desc: 'За оформление договоров.' },
    { id: 'transfers', title: 'Координатор сроков', icon: '🔄', thresholds: [15000, 30000, 50000, 100000], type: '1C', match: 'Перенос срока поставки', desc: 'За оформление переносов сроков.' },
    { id: 'sed', title: 'Исполнительный контроль', icon: '✅', thresholds: [3000, 5000, 7000, 10000], type: 'SED', match: 'ALL', desc: 'За выполнение задач в СЭД.' },
    
    // МАСТЕР 1С (Ограниченный список документов)
    { 
        id: 'master1c', title: 'Мастер 1С', icon: '🏆', thresholds: [10000, 30000, 50000, 100000], type: '1C', 
        match: [
            'Заказ поставщику', 'Отгрузка ТМЦ от поставщика', 'Поступление ТМЦ и услуг', 
            'Доставка ТМЦ', 'Заявка на оплату', 'Реестр заявок на оплату', 
            'Договоры контрагентов', 'Заявка на добавление/изменение записи справочника', 'Заявка ДМТС'
        ], 
        desc: 'За общее количество ключевых документов 1С.',
        includes: 'Входят: Заказы, Отгрузки, Поступления, Доставки, Оплаты, Реестры, Договоры, Справочники, Заявки ДМТС.'
    },
    
    // Специальные
    { id: 'flawless', title: 'Стальная дисциплина', icon: '🛡️', thresholds: [100, 300, 500, 1000], type: 'STREAK', match: 'SED', desc: 'За задачи СЭД, закрытые строго в срок (подряд).' },
    
    // АРХИТЕКТОР ИЗМЕНЕНИЙ (Ограниченный список документов)
    { 
        id: 'adjustments', title: 'Архитектор изменений', icon: '⚙️', thresholds: [500, 1000, 3000, 5000], type: '1C', 
        match: [
            'Корректировка заявки ДМТС', 'Закрытие позиций заявок ДМТС', 'Корректировка заказа поставщику', 
            'Корректировка долга', 'Корректировка заявок на оплату', 'Закрытие заказов поставщикам'
        ], 
        desc: 'За работу с документами корректировок.',
        includes: 'Входят: Корректировки заявок, заказов, долга, оплат и закрытия позиций/заказов.'
    },
    
    // ХРАНИТЕЛЬ ВЫХОДНЫХ (За выходные дни)
    { 
        id: 'weekend', title: 'Хранитель выходных', icon: '📅', thresholds: [50, 200, 500], type: 'WEEKEND', 
        match: 'ALL', desc: 'За документы, проведенные в субботу или воскресенье.' 
    }
];

    // Хелпер для определения начала и конца текущего периода
    function getCurrentPeriodBounds(type = 'month') {
        const now = new Date();
        let start = new Date();
        let end = new Date();
        
        if (type === 'week') {
            const day = now.getDay() || 7; // Пн=1, Вс=7
            start.setDate(now.getDate() - day + 1);
            start.setHours(0,0,0,0);
            end.setDate(start.getDate() + 6);
            end.setHours(23,59,59,999);
        } else if (type === 'month') {
            start = new Date(now.getFullYear(), now.getMonth(), 1);
            end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
        } else if (type === 'halfyear') {
            const isFirstHalf = now.getMonth() < 6;
            start = new Date(now.getFullYear(), isFirstHalf ? 0 : 6, 1);
            end = new Date(now.getFullYear(), isFirstHalf ? 6 : 12, 0, 23, 59, 59, 999);
        } else if (type === 'year') {
            start = new Date(now.getFullYear(), 0, 1);
            end = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
        }
        return { start, end };
    }
    function formatDateRange(start, end) {
        const options = { day: 'numeric', month: 'short' };
        const s = start.toLocaleDateString('ru-RU', options).replace('.', '');
        const e = end.toLocaleDateString('ru-RU', options).replace('.', '');
        return `${s} — ${e}`;
    }

    // Функция расчета сезонных ачивок для сотрудника
    function calcSeasonalAchievements(empName, periodType = 'month') {
        const shortName = getShortName(empName);
        const { start, end } = getCurrentPeriodBounds(periodType);
        
        // 1. СБОР ДАННЫХ ЗА ПЕРИОД
        let emp1C = allLoadedData1C.filter(r => 
            getShortName(r['Ответственный']) === shortName && 
            r._parsedDate && r._parsedDate >= start && r._parsedDate <= end
        );
        
        let empSED = allLoadedDataSED.filter(r => 
            getShortName(r['Сотрудник']) === shortName && 
            r._parsedDate && r._parsedDate >= start && r._parsedDate <= end
        );

        // 2. СПРИНТЕР (Средний SLA)
        let soglas = emp1C.filter(r => r['Тип'] === 'Согласование строк потребности');
        let totalSlaDays = 0;
        soglas.forEach(r => totalSlaDays += parseInt(r['Дней согласования']) || 0);
        let avgSla = soglas.length >= 5 ? (totalSlaDays / soglas.length).toFixed(1) : null;

        // 3. МОЛНИЯ (Дни с 10+ задачами день-в-день)
        let dailyTasks = {};
        empSED.forEach(r => {
            if (!r['Создано']) return;
            let day = r['Создано'].split(' ')[0]; // YYYY-MM-DD
            if (!dailyTasks[day]) dailyTasks[day] = { total: 0, late: 0 };
            
            let delay = parseInt(String(r['Задержка, раб.дней'] || '').trim()) || 0;
            dailyTasks[day].total++;
            if (delay > 0) dailyTasks[day].late++;
        });
        
        let lightningDays = 0;
        for (let day in dailyTasks) {
            if (dailyTasks[day].total >= 10 && dailyTasks[day].late === 0) {
                lightningDays++;
            }
        }
        // Цели для Молнии
        let lightningTarget = periodType === 'week' ? 3 : periodType === 'month' ? 10 : 100;

        // 4. КРИСТАЛЬНАЯ ДИСЦИПЛИНА
        let sedClosed = 0, sedLate = 0;
        empSED.forEach(r => {
            let delay = parseInt(String(r['Задержка, раб.дней'] || '').trim()) || 0;
            let comp = String(r['Выполнено'] || '').trim();
            if (comp !== '') {
                sedClosed++;
                if (delay > 0) sedLate++;
            }
        });
        let isCrystal = sedClosed > 10 && sedLate === 0;

        // 5. ЛИЧНЫЙ ПРОРЫВ (Сравнение с прошлым периодом)
        // Вычисляем длительность периода в днях для сдвига назад
        let durationDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
        let prevStart = new Date(start); prevStart.setDate(prevStart.getDate() - durationDays);
        let prevEnd = new Date(start); prevEnd.setDate(prevEnd.getDate() - 1);

        let currVol = emp1C.length + empSED.length;
        let prevVol = 0;
        
        allLoadedData1C.forEach(r => {
            if (getShortName(r['Ответственный']) === shortName && r._parsedDate && r._parsedDate >= prevStart && r._parsedDate <= prevEnd) prevVol++;
        });
        allLoadedDataSED.forEach(r => {
            if (getShortName(r['Сотрудник']) === shortName && r._parsedDate && r._parsedDate >= prevStart && r._parsedDate <= prevEnd) prevVol++;
        });

        let growthPct = prevVol === 0 ? (currVol > 0 ? 100 : 0) : Math.round(((currVol - prevVol) / prevVol) * 100);

        return {
            avgSla,
            lightningDays,
            lightningTarget,
            isCrystal,
            sedLate,
            growthPct,
            currVol,
            prevVol
        };
    }

function renderAchievements(empName) {
    document.getElementById('achievements-emp-name').innerText = empName;
    
    // ==========================================
    // БЛОК 1: ПОСТОЯННЫЕ ДОСТИЖЕНИЯ (Старая логика)
    // ==========================================
    const iconsContainer = document.getElementById('steam-ach-icons');
    const progressContainer = document.getElementById('steam-ach-progress');
    
    iconsContainer.innerHTML = '';
    progressContainer.innerHTML = '';

    const shortName = getShortName(empName);
    const emp1C = allLoadedData1C.filter(r => getShortName(r['Ответственный']) === shortName);
    const empSED = allLoadedDataSED.filter(r => getShortName(r['Сотрудник']) === shortName);
    
    // Считаем серию для СЭД
    let currentStreak = 0;
    let maxStreak = 0;
    const sortedSED = [...empSED].sort((a,b) => (a._parsedDate?.getTime() || 0) - (b._parsedDate?.getTime() || 0));
    
    sortedSED.forEach(r => {
        let delay = parseInt(String(r['Задержка, раб.дней'] || '').trim()) || 0;
        let comp = String(r['Выполнено'] || '').trim();
        if (comp !== '') {
            if (delay === 0) {
                currentStreak++;
                if (currentStreak > maxStreak) maxStreak = currentStreak;
            } else {
                currentStreak = 0; 
            }
        }
    });

    let unlockedCount = 0;

    ACHIEVEMENTS_CONFIG.forEach(ach => {
        let currentValue = 0;

        // Считаем прогресс для базовых ачивок
        if (ach.type === '1C') {
            if (ach.match === 'ALL') {
                currentValue = emp1C.length;
            } else if (Array.isArray(ach.match)) {
                currentValue = emp1C.filter(r => ach.match.includes(String(r['Тип']))).length;
            } else {
                currentValue = emp1C.filter(r => String(r['Тип']) === ach.match).length;
            }
        } else if (ach.type === 'SED') {
            currentValue = empSED.length;
        } else if (ach.type === 'STREAK') {
            currentValue = maxStreak;
        } else if (ach.type === 'WEEKEND') {
            currentValue = emp1C.filter(r => {
                if (!r._parsedDate) return false;
                const day = r._parsedDate.getDay();
                return day === 0 || day === 6; 
            }).length;
        }

        // Определяем ранг
        let tier = 0;
        let nextThreshold = ach.thresholds[0];
        let prevThreshold = 0;

        for (let i = 0; i < ach.thresholds.length; i++) {
            if (currentValue >= ach.thresholds[i]) {
                tier = i + 1;
                prevThreshold = ach.thresholds[i];
                nextThreshold = ach.thresholds[i+1] || ach.thresholds[i];
            } else break;
        }

        let progressPct = tier === ach.thresholds.length ? 100 
            : (tier === 0 ? (currentValue / ach.thresholds[0]) * 100 
            : ((currentValue - prevThreshold) / (nextThreshold - prevThreshold)) * 100);

        let tierName = ['Не получено', 'Бронза', 'Серебро', 'Золото', 'Платина'][tier];

        // РЕНДЕР ВЕРХНЕЙ ИКОНКИ (только если tier > 0)
        if (tier > 0) {
            unlockedCount++;
            const iconBox = document.createElement('div');
            iconBox.className = 'steam-icon-box';
            iconBox.innerHTML = `
                ${ach.icon}
                <div class="ach-tooltip">
                    <b>${ach.title} (${tierName})</b>
                    <span class="desc">${ach.desc}</span>
                    ${ach.includes ? `<span class="desc" style="font-size:10px; color:#666;">${ach.includes}</span>` : ''}
                    <span class="date">Получено</span>
                </div>
            `;
            iconsContainer.appendChild(iconBox);
        }

        // РЕНДЕР НИЖНЕГО ПРОГРЕСС-БАРА (для всех)
        const row = document.createElement('div');
        row.className = 'steam-progress-row';
        row.innerHTML = `
            <div class="steam-row-icon" style="${tier === 0 ? 'filter: grayscale(100%); opacity: 0.5;' : ''}">${ach.icon}</div>
            <div class="steam-row-content">
                <div class="steam-row-title">
                    <span style="${tier === 0 ? 'color: #8f98a0;' : ''}">${ach.title}</span>
                    <span class="tier-name">${tierName}</span>
                </div>
                <div class="steam-row-desc" style="font-size: 11px; color: #8f98a0; margin-bottom: 5px;" title="${ach.includes || ach.desc}">${ach.desc}</div>
                <div class="steam-row-bar">
                    <div class="steam-row-fill" style="width: ${Math.min(progressPct, 100)}%;"></div>
                </div>
                <div class="steam-row-stats">
                    <span>${currentValue.toLocaleString('ru-RU')} / ${nextThreshold.toLocaleString('ru-RU')}</span>
                    <span>${tier === ach.thresholds.length ? 'Максимум!' : 'До след. ранга: ' + (nextThreshold - currentValue).toLocaleString('ru-RU')}</span>
                </div>
            </div>
        `;
        progressContainer.appendChild(row);
    });

    // Если нет ни одной награды
    if (unlockedCount === 0) {
        iconsContainer.innerHTML = '<div style="color: #8f98a0; font-size: 13px;">У сотрудника пока нет полученных наград. Продолжайте работу!</div>';
    }

    // ==========================================
    // БЛОК 2, 3, 4: ВЫЗОВ НОВЫХ ВКЛАДОК
    // ==========================================
    
    // 1. Сезонные (Спринтер, Молния и т.д.)
    renderSeasonalTab(empName);
    
    // 2. Короли объемов
    renderVolumesTab(empName, emp1C, empSED);
    
    // 3. Архив (Стрики)
    renderArchiveTab(empName);
}

    // --- ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ДЛЯ ЗАЛА НАГРАД ---

    function getCurrentPeriodBounds(type = 'month') {
        const now = new Date();
        let start = new Date();
        let end = new Date();
        if (type === 'week') {
            const day = now.getDay() || 7; start.setDate(now.getDate() - day + 1); start.setHours(0,0,0,0);
            end.setDate(start.getDate() + 6); end.setHours(23,59,59,999);
        } else if (type === 'month') {
            start = new Date(now.getFullYear(), now.getMonth(), 1);
            end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
        } else if (type === 'halfyear') {
            const isFirstHalf = now.getMonth() < 6;
            start = new Date(now.getFullYear(), isFirstHalf ? 0 : 6, 1);
            end = new Date(now.getFullYear(), isFirstHalf ? 6 : 12, 0, 23, 59, 59, 999);
        } else if (type === 'year') {
            start = new Date(now.getFullYear(), 0, 1);
            end = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
        }
        return { start, end };
    }

    function calcSeasonalAchievements(empName, periodType = 'month') {
        const shortName = getShortName(empName);
        const { start, end } = getCurrentPeriodBounds(periodType);
        
        let emp1C_p = allLoadedData1C.filter(r => getShortName(r['Ответственный']) === shortName && r._parsedDate && r._parsedDate >= start && r._parsedDate <= end);
        let empSED_p = allLoadedDataSED.filter(r => getShortName(r['Сотрудник']) === shortName && r._parsedDate && r._parsedDate >= start && r._parsedDate <= end);

        // 1. Спринтер (Средний SLA)
        let soglas = emp1C_p.filter(r => r['Тип'] === 'Согласование строк потребности');
        let totalSlaDays = 0;
        soglas.forEach(r => totalSlaDays += parseInt(r['Дней согласования']) || 0);
        let avgSla = soglas.length > 0 ? (totalSlaDays / soglas.length) : null;
        let isSprinter = avgSla !== null && avgSla <= 2.0; // Цель: 2 дня и меньше

        // 2. Молния
        let dailyTasks = {};
        empSED_p.forEach(r => {
            if (!r['Создано']) return;
            let day = r['Создано'].split(' ')[0];
            if (!dailyTasks[day]) dailyTasks[day] = { total: 0, late: 0 };
            let delay = parseInt(String(r['Задержка, раб.дней'] || '').trim()) || 0;
            dailyTasks[day].total++;
            if (delay > 0) dailyTasks[day].late++;
        });
        let lightningDays = 0;
        for (let day in dailyTasks) if (dailyTasks[day].total >= 10 && dailyTasks[day].late === 0) lightningDays++;
        let lightningTarget = periodType === 'week' ? 3 : periodType === 'month' ? 10 : 100;

        // 3. Кристалл
        let sedClosed = 0, sedLate = 0;
        empSED_p.forEach(r => {
            let delay = parseInt(String(r['Задержка, раб.дней'] || '').trim()) || 0;
            if (String(r['Выполнено'] || '').trim() !== '') { sedClosed++; if (delay > 0) sedLate++; }
        });
        let crystalTarget = 10;
        let isCrystal = sedClosed >= crystalTarget && sedLate === 0;

        // 4. Прорыв (Рост объема)
        let durationDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
        let prevStart = new Date(start); prevStart.setDate(prevStart.getDate() - durationDays);
        let prevEnd = new Date(start); prevEnd.setDate(prevEnd.getDate() - 1);
        
        let currVol = emp1C_p.length + empSED_p.length;
        let prevVol = 0;
        allLoadedData1C.forEach(r => { if (getShortName(r['Ответственный']) === shortName && r._parsedDate >= prevStart && r._parsedDate <= prevEnd) prevVol++; });
        allLoadedDataSED.forEach(r => { if (getShortName(r['Сотрудник']) === shortName && r._parsedDate >= prevStart && r._parsedDate <= prevEnd) prevVol++; });
        let growthPct = prevVol === 0 ? (currVol > 0 ? 100 : 0) : Math.round(((currVol - prevVol) / prevVol) * 100);
        let growthTarget = 20; // Цель: +20% к прошлому периоду

        return { 
            avgSla, isSprinter, 
            lightningDays, lightningTarget, 
            sedClosed, sedLate, crystalTarget, isCrystal,
            growthPct, growthTarget, currVol, prevVol 
        };
    }

    function renderSeasonalTab(empName, period = 'month') {
        const container = document.getElementById('seasonal-ach-progress');
        container.innerHTML = '';
        const stats = calcSeasonalAchievements(empName, period);
        const { start, end } = getCurrentPeriodBounds(period);

        let periodName = period === 'week' ? 'Неделя' : period === 'month' ? 'Месяц' : period === 'halfyear' ? 'Полугодие' : 'Год';
        
        // Расчет процентов для прогресс-баров
        let sprinterPct = stats.avgSla ? Math.min((2.0 / stats.avgSla) * 100, 100) : 0; // Чем меньше SLA, тем лучше
        let lightningPct = Math.min((stats.lightningDays / stats.lightningTarget) * 100, 100);
        let crystalPct = stats.sedLate > 0 ? 0 : Math.min((stats.sedClosed / stats.crystalTarget) * 100, 100);
        let growthPct = Math.min((Math.max(0, stats.growthPct) / stats.growthTarget) * 100, 100);

        let html = `
            <div style="text-align:center; margin-bottom:15px; color:#9E9E9E; font-size:13px; font-weight:bold;">
                Текущий период: ${formatDateRange(start, end)}
            </div>
            
            <!-- Спринтер -->
            <div class="steam-progress-row">
                <div class="steam-row-icon">🏎️</div>
                <div class="steam-row-content">
                    <div class="steam-row-title">
                        <span>Спринтер</span>
                        <span style="color:${stats.isSprinter ? '#2ECC71' : '#F1C40F'}; font-size:11px;">${stats.isSprinter ? 'Выполнено!' : 'Цель: SLA < 2 дн.'}</span>
                    </div>
                    <div class="steam-row-desc" style="font-size:11px; color:#8f98a0; margin-bottom:5px;">Средний срок согласования твоих строк потребности.</div>
                    <div class="steam-row-bar"><div class="steam-row-fill" style="width: ${sprinterPct}%; background:${stats.isSprinter ? '#2ECC71' : ''};"></div></div>
                    <div class="steam-row-stats">
                        <span>Твой SLA: ${stats.avgSla ? stats.avgSla.toFixed(1) + ' дн.' : 'Мало данных'}</span>
                    </div>
                </div>
            </div>

            <!-- Молния -->
            <div class="steam-progress-row">
                <div class="steam-row-icon">⚡</div>
                <div class="steam-row-content">
                    <div class="steam-row-title">
                        <span>Молния</span>
                        <span style="color:#F1C40F; font-size:11px;">${stats.lightningDays} / ${stats.lightningTarget} дней</span>
                    </div>
                    <div class="steam-row-desc" style="font-size:11px; color:#8f98a0; margin-bottom:5px;">Закрыть 10+ задач СЭД строго в день их создания.</div>
                    <div class="steam-row-bar"><div class="steam-row-fill" style="width: ${lightningPct}%;"></div></div>
                </div>
            </div>

            <!-- Кристалл -->
            <div class="steam-progress-row">
                <div class="steam-row-icon">💎</div>
                <div class="steam-row-content">
                    <div class="steam-row-title">
                        <span>Кристальная дисциплина</span>
                        <span style="color:${stats.isCrystal ? '#2ECC71' : (stats.sedLate > 0 ? '#E74C3C' : '#F1C40F')}; font-size:11px;">
                            ${stats.isCrystal ? 'Идеально!' : (stats.sedLate > 0 ? 'Потеряна' : 'В процессе')}
                        </span>
                    </div>
                    <div class="steam-row-desc" style="font-size:11px; color:#8f98a0; margin-bottom:5px;">0 просрочек в СЭД (минимум 10 закрытых задач).</div>
                    <div class="steam-row-bar"><div class="steam-row-fill" style="width: ${crystalPct}%; background:${stats.sedLate > 0 ? '#E74C3C' : ''};"></div></div>
                    <div class="steam-row-stats">
                        <span>Закрыто: ${stats.sedClosed} / ${stats.crystalTarget}</span>
                        <span style="color:${stats.sedLate > 0 ? '#E74C3C' : '#8f98a0'};">Просрочек: ${stats.sedLate}</span>
                    </div>
                </div>
            </div>

            <!-- Прорыв -->
            <div class="steam-progress-row">
                <div class="steam-row-icon">📈</div>
                <div class="steam-row-content">
                    <div class="steam-row-title">
                        <span>Личный прорыв</span>
                        <span style="color:${stats.growthPct >= stats.growthTarget ? '#2ECC71' : '#F1C40F'}; font-size:11px;">Цель: +${stats.growthTarget}%</span>
                    </div>
                    <div class="steam-row-desc" style="font-size:11px; color:#8f98a0; margin-bottom:5px;">Рост твоего объема работы (1С + СЭД) к прошлому периоду.</div>
                    <div class="steam-row-bar"><div class="steam-row-fill" style="width: ${growthPct}%; background:${stats.growthPct >= stats.growthTarget ? '#2ECC71' : ''};"></div></div>
                    <div class="steam-row-stats">
                        <span>Твой рост: ${stats.growthPct > 0 ? '+' : ''}${stats.growthPct}%</span>
                        <span>${stats.currVol} против ${stats.prevVol}</span>
                    </div>
                </div>
            </div>
        `;
        container.innerHTML = html;
    }

    function renderVolumesTab(empName, emp1C, empSED, period = 'month') {
        const container = document.getElementById('volume-ach-progress');
        container.innerHTML = '';
        const { start, end } = getCurrentPeriodBounds(period); 

        // Понятный заголовок с периодом (например: 1 нояб — 30 нояб)
        let html = `<div style="text-align:center; margin-bottom:15px; color:#9E9E9E; font-size:13px; font-weight:bold;">
            Прогресс: ${formatDateRange(start, end)}
        </div>`;

        VOLUME_ACHIEVEMENTS.forEach(ach => {
            let count = 0;
            
            if (ach.match === 'SED') {
                count = empSED.filter(r => r._parsedDate >= start && r._parsedDate <= end).length;
            } else if (ach.match === 'MINOR') {
                const minorTypes = ['Корректировка заказа поставщику', 'Корректировка долга', 'Корректировка заявки ДМТС', 'Корректировка заявок на оплату', 'Закрытие позиций заявок ДМТС', 'Закрытие заказов поставщикам', 'Перемещение ОЗ ТМЦ', 'Списание ТМЦ', 'Дислокация вагонов'];
                count = emp1C.filter(r => r._parsedDate >= start && r._parsedDate <= end && minorTypes.includes(r['Тип'])).length;
            } else {
                count = emp1C.filter(r => r._parsedDate >= start && r._parsedDate <= end && ach.match.includes(r['Тип'])).length;
            }

            let targetIndex = period === 'week' ? 0 : period === 'month' ? 1 : period === 'halfyear' ? 2 : 3;
            let target = ach.thresholds[targetIndex];
            let pct = Math.min((count / target) * 100, 100);

            let desc = `Неделя: ${ach.thresholds[0]} | Месяц: ${ach.thresholds[1]} | Полугодие: ${ach.thresholds[2]} | Год: ${ach.thresholds[3]}`;

            html += `
                <div class="steam-progress-row">
                    <div class="steam-row-icon">${ach.icon}</div>
                    <div class="steam-row-content">
                        <div class="steam-row-title">
                            <span>${ach.title}</span>
                        </div>
                        <div class="steam-row-desc" style="font-size:10px; color:#8f98a0; margin-bottom:5px;">${desc}</div>
                        <div class="steam-row-bar"><div class="steam-row-fill" style="width: ${pct}%;"></div></div>
                        <div class="steam-row-stats">
                            <span>${count} / ${target}</span>
                            <span>Осталось: ${Math.max(0, target - count)}</span>
                        </div>
                    </div>
                </div>
            `;
        });
        container.innerHTML = html;
    }

    function renderArchiveTab(empName) {
        const container = document.getElementById('archive-ach-list');
        if (!container) return;
        container.innerHTML = '<div style="text-align:center; color:#8f98a0; padding:20px;">Глубокий анализ истории (может занять пару секунд)...</div>';

        const shortName = getShortName(empName);
        const emp1C = allLoadedData1C.filter(r => getShortName(r['Ответственный']) === shortName);
        const empSED = allLoadedDataSED.filter(r => getShortName(r['Сотрудник']) === shortName);

        if (emp1C.length === 0 && empSED.length === 0) {
            container.innerHTML = '<div style="text-align:center; color:#8f98a0; padding:20px;">Нет данных для анализа.</div>';
            return;
        }

        // Находим минимальную и максимальную дату в данных
        let minDate = new Date(8640000000000000), maxDate = new Date(0);
        [...emp1C, ...empSED].forEach(r => {
            if (r._parsedDate) {
                if (r._parsedDate < minDate) minDate = new Date(r._parsedDate);
                if (r._parsedDate > maxDate) maxDate = new Date(r._parsedDate);
            }
        });
        
        if (minDate > maxDate) {
            container.innerHTML = '<div style="text-align:center; color:#8f98a0; padding:20px;">Нет корректных дат для анализа.</div>';
            return;
        }

        maxDate.setHours(23, 59, 59, 999);
        const today = new Date();
        
        let historyAchievements = [];
        const monthNames = ["Янв", "Фев", "Мар", "Апр", "Май", "Июн", "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек"];

        // Хелпер для форматирования дат (например, 12 окт - 18 окт)
        const formatRange = (s, e) => {
            if (s.getMonth() === e.getMonth()) {
                return `${s.getDate()}-${e.getDate()} ${monthNames[s.getMonth()]} ${s.getFullYear()}`;
            }
            return `${s.getDate()} ${monthNames[s.getMonth()]} - ${e.getDate()} ${monthNames[e.getMonth()]} ${e.getFullYear()}`;
        };

        // Функция для проверки ачивок за конкретный период
        function analyzePeriod(pStart, pEnd, prevStart, prevEnd, periodType, periodLabel) {
            // Если период еще не закончился (например, сегодня 10 ноября, а мы смотрим ноябрь), пропускаем его
            if (pEnd > today) return;

            let p1C = emp1C.filter(r => r._parsedDate >= pStart && r._parsedDate <= pEnd);
            let pSED = empSED.filter(r => r._parsedDate >= pStart && r._parsedDate <= pEnd);

            if (p1C.length === 0 && pSED.length === 0) return;

            // 1. СПРИНТЕР (Сравниваем со всем отделом за этот период)
            let periodAll1C = allLoadedData1C.filter(r => r._parsedDate >= pStart && r._parsedDate <= pEnd);
            let empStats = {};
            periodAll1C.forEach(r => {
                if (r['Тип'] === 'Согласование строк потребности' && r['Ответственный']) {
                    let e = r['Ответственный'];
                    if (!empStats[e]) empStats[e] = { days: 0, count: 0 };
                    empStats[e].days += parseInt(r['Дней согласования']) || 0;
                    empStats[e].count++;
                }
            });
            let bestSla = 999;
            for (let e in empStats) {
                if (empStats[e].count >= 5) {
                    let avg = empStats[e].days / empStats[e].count;
                    if (avg < bestSla) bestSla = avg;
                }
            }
            if (empStats[empName] && empStats[empName].count >= 5) {
                let mySla = empStats[empName].days / empStats[empName].count;
                if (mySla === bestSla && bestSla <= 3) { // Порог Спринтера
                    historyAchievements.push({ id: 'seasonal_sprinter', title: 'Спринтер', icon: '🏎️', date: periodLabel });
                }
            }

            // 2. МОЛНИЯ (10+ задач в день)
            let dailyTasks = {};
            pSED.forEach(r => {
                if (!r['Создано']) return;
                let day = r['Создано'].split(' ')[0];
                if (!dailyTasks[day]) dailyTasks[day] = { total: 0, late: 0 };
                let delay = parseInt(String(r['Задержка, раб.дней'] || '').trim()) || 0;
                dailyTasks[day].total++;
                if (delay > 0) dailyTasks[day].late++;
            });
            let lightningDays = 0;
            for (let day in dailyTasks) if (dailyTasks[day].total >= 10 && dailyTasks[day].late === 0) lightningDays++;
            
            let lightningTarget = periodType === 'week' ? 3 : periodType === 'month' ? 10 : periodType === 'halfyear' ? 50 : 100;
            if (lightningDays >= lightningTarget) {
                historyAchievements.push({ id: 'seasonal_lightning', title: 'Молния', icon: '⚡', date: periodLabel });
            }

            // 3. КРИСТАЛЛ (0 просрочек, 10+ задач)
            let sedClosed = 0, sedLate = 0;
            pSED.forEach(r => {
                let delay = parseInt(String(r['Задержка, раб.дней'] || '').trim()) || 0;
                if (String(r['Выполнено'] || '').trim() !== '') { sedClosed++; if (delay > 0) sedLate++; }
            });
            if (sedClosed >= 10 && sedLate === 0) {
                historyAchievements.push({ id: 'seasonal_crystal', title: 'Кристальная дисциплина', icon: '💎', date: periodLabel });
            }

            // 4. ЛИЧНЫЙ ПРОРЫВ (Рост к прошлому периоду)
            if (prevStart) {
                let prev1C = emp1C.filter(r => r._parsedDate >= prevStart && r._parsedDate <= prevEnd);
                let prevSED = empSED.filter(r => r._parsedDate >= prevStart && r._parsedDate <= prevEnd);
                let currVol = p1C.length + pSED.length;
                let prevVol = prev1C.length + prevSED.length;
                
                if (prevVol >= 5) { // Защита от нулевых объемов
                    let growthPct = Math.round(((currVol - prevVol) / prevVol) * 100);
                    if (growthPct >= 20) {
                        historyAchievements.push({ id: 'seasonal_breakthrough', title: 'Личный прорыв', icon: '📈', date: periodLabel });
                    }
                }
            }

            // 5. ОБЪЕМНЫЕ АЧИВКИ (Короли объемов)
            VOLUME_ACHIEVEMENTS.forEach(ach => {
                let count = 0;
                if (ach.match === 'SED') count = pSED.length;
                else if (ach.match === 'MINOR') {
                    const minorTypes = ['Корректировка заказа поставщику', 'Корректировка долга', 'Корректировка заявки ДМТС', 'Корректировка заявок на оплату', 'Закрытие позиций заявок ДМТС', 'Закрытие заказов поставщикам', 'Перемещение ОЗ ТМЦ', 'Списание ТМЦ', 'Дислокация вагонов'];
                    count = p1C.filter(r => minorTypes.includes(r['Тип'])).length;
                } else {
                    count = p1C.filter(r => ach.match.includes(r['Тип'])).length;
                }
                
                let targetIndex = periodType === 'week' ? 0 : periodType === 'month' ? 1 : periodType === 'halfyear' ? 2 : 3;
                if (count >= ach.thresholds[targetIndex]) { 
                    historyAchievements.push({ id: ach.id, title: ach.title, icon: ach.icon, date: periodLabel });
                }
            });
        }

        // --- ГЕНЕРАЦИЯ ПЕРИОДОВ ---

        // 1. НЕДЕЛИ
        let currW = new Date(minDate);
        currW.setDate(currW.getDate() - (currW.getDay() || 7) + 1); // На начало недели
        while (currW <= maxDate) {
            let wEnd = new Date(currW); wEnd.setDate(wEnd.getDate() + 6); wEnd.setHours(23,59,59,999);
            let prevWStart = new Date(currW); prevWStart.setDate(prevWStart.getDate() - 7);
            let prevWEnd = new Date(currW); prevWEnd.setDate(prevWEnd.getDate() - 1); prevWEnd.setHours(23,59,59,999);
            
            analyzePeriod(new Date(currW), wEnd, prevWStart, prevWEnd, 'week', `Неделя ${formatRange(currW, wEnd)}`);
            currW.setDate(currW.getDate() + 7);
        }

        // 2. МЕСЯЦЫ
        let currM = new Date(minDate.getFullYear(), minDate.getMonth(), 1);
        while (currM <= maxDate) {
            let mEnd = new Date(currM.getFullYear(), currM.getMonth() + 1, 0, 23,59,59,999);
            let prevMStart = new Date(currM.getFullYear(), currM.getMonth() - 1, 1);
            let prevMEnd = new Date(currM.getFullYear(), currM.getMonth(), 0, 23,59,59,999);
            
            analyzePeriod(new Date(currM), mEnd, prevMStart, prevMEnd, 'month', `${monthNames[currM.getMonth()]} ${currM.getFullYear()}`);
            currM.setMonth(currM.getMonth() + 1);
        }

        // 3. ПОЛУГОДИЯ
        let currH = new Date(minDate.getFullYear(), minDate.getMonth() < 6 ? 0 : 6, 1);
        while (currH <= maxDate) {
            let hEnd = new Date(currH.getFullYear(), currH.getMonth() + 6, 0, 23,59,59,999);
            let prevHStart = new Date(currH.getFullYear(), currH.getMonth() - 6, 1);
            let prevHEnd = new Date(currH.getFullYear(), currH.getMonth(), 0, 23,59,59,999);
            
            let hLabel = `${currH.getMonth() === 0 ? '1' : '2'} пол. ${currH.getFullYear()}`;
            analyzePeriod(new Date(currH), hEnd, prevHStart, prevHEnd, 'halfyear', hLabel);
            currH.setMonth(currH.getMonth() + 6);
        }

        // 4. ГОДЫ
        let currY = new Date(minDate.getFullYear(), 0, 1);
        while (currY <= maxDate) {
            let yEnd = new Date(currY.getFullYear(), 11, 31, 23,59,59,999);
            let prevYStart = new Date(currY.getFullYear() - 1, 0, 1);
            let prevYEnd = new Date(currY.getFullYear() - 1, 11, 31, 23,59,59,999);
            
            analyzePeriod(new Date(currY), yEnd, prevYStart, prevYEnd, 'year', `${currY.getFullYear()} год`);
            currY.setFullYear(currY.getFullYear() + 1);
        }


        // --- ВЫВОД ---
        if (historyAchievements.length === 0) {
            container.innerHTML = '<div style="text-align:center; color:#8f98a0; padding:20px;">Архив пуст. Достижений за завершенные периоды нет.</div>';
            return;
        }

        let grouped = {};
        historyAchievements.forEach(item => {
            if (!grouped[item.id]) {
                grouped[item.id] = { title: item.title, icon: item.icon, dates: [] };
            }
            grouped[item.id].dates.push(item.date);
        });

        let html = '';
        for (let id in grouped) {
            let g = grouped[id];
            let datesTooltip = g.dates.join(', '); 
            
            html += `
                <div class="steam-progress-row" style="opacity: 0.7; cursor: help;" title="Получено за: ${datesTooltip}">
                    <div class="steam-row-icon" style="filter: grayscale(100%);">${g.icon}</div>
                    <div class="steam-row-content">
                        <div class="steam-row-title">
                            <span>${g.title}</span>
                            <span style="color:#F1C40F; font-weight:bold;">x${g.dates.length}</span>
                        </div>
                    </div>
                </div>
            `;
        }
        container.innerHTML = html;
    }
// ==========================================
// 35. ОБРАБОТЧИКИ ОКНА "ЗАЛ НАГРАД"
// ==========================================
document.addEventListener("DOMContentLoaded", function() {
    // 1. Находим элементы в HTML
    const openAchBtn = document.getElementById('open-achievements-btn'); // Кнопка в карточке сотрудника
    const achModal = document.getElementById('achievements-modal');       // Само окно (Steam-стиль)
    const closeAchBtn = document.getElementById('close-achievements');    // Крестик закрытия

    // 2. Проверяем, что они существуют на странице (защита от ошибок)
    if (openAchBtn && achModal) {
        
        // 3. Обработчик клика по кнопке "Зал наград"
        openAchBtn.addEventListener('click', () => {
            achModal.style.display = 'flex'; // Показываем окно
            
            // ВАЖНО: Передаем в функцию достижений имя сотрудника, 
            // чья карточка сейчас открыта (переменная currentModalEmp из 12 секции)
            renderAchievements(currentModalEmp); 
        });
    }

    // 4. Обработчик клика по крестику (закрыть)
    if (closeAchBtn) {
        closeAchBtn.addEventListener('click', () => {
            achModal.style.display = 'none'; 
        });
    }

    // 5. Закрытие при клике на темный фон вокруг окна
    window.addEventListener('click', (e) => {
        if (e.target === achModal) {
            achModal.style.display = 'none';
        }
    });
    let currentAchPeriod = 'month'; // По умолчанию месяц

    document.querySelectorAll('.ach-tab-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.ach-tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.ach-tab-content').forEach(c => c.style.display = 'none');
            this.classList.add('active');
            document.getElementById(this.dataset.atab).style.display = 'block';
            
            // Показываем переключатель периода только для Сезонных и Объемов
            const periodSelector = document.getElementById('ach-period-selector');
            if (this.dataset.atab === 'ach-seasonal' || this.dataset.atab === 'ach-volumes') {
                periodSelector.style.display = 'flex';
            } else {
                periodSelector.style.display = 'none';
            }
        });
    });

    document.querySelectorAll('.ach-period-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.ach-period-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentAchPeriod = this.dataset.achperiod;
            
            // Перерисовываем текущую вкладку
            if (document.getElementById('ach-seasonal').style.display === 'block') {
                renderSeasonalTab(currentModalEmp, currentAchPeriod);
            } else if (document.getElementById('ach-volumes').style.display === 'block') {
                const shortName = getShortName(currentModalEmp);
                const emp1C = allLoadedData1C.filter(r => getShortName(r['Ответственный']) === shortName);
                const empSED = allLoadedDataSED.filter(r => getShortName(r['Сотрудник']) === shortName);
                renderVolumesTab(currentModalEmp, emp1C, empSED, currentAchPeriod);
            }
        });
    });
});
// ==========================================
// 36. АНАЛИТИКА ДЕБИТОРСКОЙ ЗАДОЛЖЕННОСТИ (ДтЗ)
// ==========================================
document.addEventListener("DOMContentLoaded", function() {
    const dtzHeader = document.getElementById('dtz-header');
    const dtzPanel = document.getElementById('dtz-panel');
    const dtzExpandIcon = document.getElementById('dtz-expand-icon');
    const tmcFilter = document.getElementById('dtz-filter-tmc');
    const statusBtns = document.querySelectorAll('.dtz-status-btn');
    
    const dateStartInput = document.getElementById('dtz-date-start');
    const dateEndInput = document.getElementById('dtz-date-end');
    const applyDatesBtn = document.getElementById('dtz-apply-dates');
    
    const curatorToggle = document.getElementById('dtz-curator-toggle');
    const orgToggle = document.getElementById('dtz-org-toggle');
    const granularityBtns = document.querySelectorAll('.dtz-granularity-btn');

    if (!dtzHeader) return;

    window.allDtzData = [];
    let dtzStats = {};
    let dtzDateStr = "";
    try {
        if (window.bakedDtZData) window.allDtzData = JSON.parse(LZString.decompressFromBase64(window.bakedDtZData));
        // Чистим nan кураторов на основе департаментов
            window.allDtzData.forEach(row => {
                let curator = row[4];
                let dept = row[10];
                if (!curator || curator.toLowerCase() === 'nan' || curator.trim() === '') {
                    if (DEPT_TO_CURATOR[dept]) {
                        row[4] = DEPT_TO_CURATOR[dept]; // Подменяем nan на куратора
                    }
                }
            });
        if (window.bakedDtZStats) dtzStats = JSON.parse(LZString.decompressFromBase64(window.bakedDtZStats));
        if (window.bakedDtZDate) dtzDateStr = window.bakedDtZDate;
    } catch(e) { console.error("Ошибка распаковки ДтЗ:", e); }

    document.getElementById('dtz-date-span').innerText = dtzDateStr || "—";

    let currentStatusFilter = 'all';
    let currentGranularity = 'day'; 
    let dtzCharts = {}; 
    let currentFilteredDtzData = [];
    let currentState = {};

    // Парсим дату выгрузки (DD.MM.YYYY)
    let reportDate = new Date();
    if (dtzDateStr) {
        const parts = dtzDateStr.split('.');
        if (parts.length === 3) reportDate = new Date(parts[2], parts[1]-1, parts[0]);
    }
    reportDate.setHours(23, 59, 59, 999); // Конец дня выгрузки

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Начало сегодняшнего дня

    // ФУНКЦИЯ ОПРЕДЕЛЕНИЯ СТАТУСА
    function getActualStatus(deadlineStr) {
        if (!deadlineStr) return 'empty';
        const deadline = new Date(deadlineStr);
        deadline.setHours(0, 0, 0, 0);

        if (deadline <= reportDate) return 'overdue'; // Срок был до выгрузки
        if (deadline > reportDate && deadline <= today) return 'question'; // Срок между выгрузкой и сегодня
        return 'operational'; // Срок в будущем
    }

    const formatMoney = (val) => {
        if (val >= 1e9) return (val / 1e9).toFixed(2) + ' млрд ₽';
        if (val >= 1e6) return (val / 1e6).toFixed(1) + ' млн ₽';
        return val.toLocaleString('ru-RU') + ' ₽';
    };

    const getRandomColor = (i) => {
        const colors = ['#E74C3C', '#3498DB', '#2ECC71', '#9B59B6', '#F39C12', '#1ABC9C', '#E67E22', '#34495E', '#FF7F50', '#8BC34A', '#5F27CD', '#A0522D', '#00D2D3', '#FF9800', '#607D8B', '#E84393', '#795548'];
        return colors[i % colors.length];
    };

    // --- ОБНОВЛЕНИЕ ХЕДЕРА ДО КЛИКА ---
    function updateHeaderKPI() {
        let total = 0;
        window.allDtzData.forEach(row => {
            // Учитываем только ТМЦ, если стоит галочка
            if (tmcFilter.checked && row[3] !== 'ТМЦ') return;
            total += (parseFloat(row[8]) || 0);
        });
        document.getElementById('dtz-main-sum').innerText = formatMoney(total);
    }
    updateHeaderKPI(); // Вызываем сразу при загрузке

    // --- ОБРАБОТЧИКИ ---
    dtzHeader.addEventListener('click', () => {
        if (dtzPanel.style.display === 'none') {
            dtzPanel.style.display = 'block';
            dtzExpandIcon.innerText = '▲';
            renderDtzDashboard();
        } else {
            dtzPanel.style.display = 'none';
            dtzExpandIcon.innerText = '▼';
        }
    });

    if (tmcFilter) {
        tmcFilter.addEventListener('change', () => {
            updateHeaderKPI(); // Обновляем хедер сразу
            if (dtzPanel.style.display !== 'none') renderDtzDashboard();
        });
    }
    
    if (applyDatesBtn) applyDatesBtn.addEventListener('click', renderDtzDashboard);

    if (curatorToggle) {
        curatorToggle.addEventListener('change', () => {
            renderCuratorsChart(currentState.curatorsSum, currentState.curatorsCount, currentState.totalSum, currentState.totalCount);
        });
    }
    if (orgToggle) {
        orgToggle.addEventListener('change', () => {
            renderOrgsChart(currentState.orgsBE, currentState.orgsDept, currentState.totalSum);
        });
    }

    granularityBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            granularityBtns.forEach(b => {
                b.classList.remove('active');
                b.style.background = 'transparent';
                b.style.color = 'var(--text-main)';
            });
            this.classList.add('active');
            this.style.background = 'var(--brand-orange)';
            this.style.color = 'white';
            currentGranularity = this.dataset.type;
            renderLineCharts(); 
        });
    });

    statusBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            statusBtns.forEach(b => {
                b.classList.remove('active');
                b.style.background = 'transparent';
                b.style.color = 'var(--text-main)';
            });
            this.classList.add('active');
            this.style.background = 'var(--brand-orange)';
            this.style.color = 'white';
            currentStatusFilter = this.dataset.status;
            renderDtzDashboard();
        });
    });

    function renderDtzDashboard() {
        if (!window.allDtzData || window.allDtzData.length === 0) return;

        // Фильтрация
        let filtered = window.allDtzData;
        if (tmcFilter.checked) filtered = filtered.filter(row => row[3] === 'ТМЦ');
        
        // Фильтр по дате заказа (индекс 11)
        const startVal = dateStartInput.value;
        const endVal = dateEndInput.value;
        if (startVal) filtered = filtered.filter(row => row[11] && row[11] >= startVal);
        if (endVal) filtered = filtered.filter(row => row[11] && row[11] <= endVal);

        // Статусный фильтр (считаем на лету)
        if (currentStatusFilter !== 'all') {
            filtered = filtered.filter(row => getActualStatus(row[7]) === currentStatusFilter);
        }

        // Подсчет
        let totalSum = 0, overdueSum = 0, operationalSum = 0, questionSum = 0, emptySum = 0;
        let emptyCount = 0;
        
        let contractors = {}, methods = {};
        let curatorsSum = {}, curatorsCount = {};
        let orgsBE = {}, orgsDept = {};
        
        // ВОТ ОНА, ПРОПУЩЕННАЯ СТРОЧКА:
        let responsibles = {};

        filtered.forEach(row => {
            const sum = parseFloat(row[8]) || 0;
            const status = getActualStatus(row[7]);
            const respName = row[2] || 'Не указан';
            const cName = row[1] || 'Неизвестно';
            
            totalSum += sum;
            if (status === 'overdue') overdueSum += sum;
            else if (status === 'operational') operationalSum += sum;
            else if (status === 'question') questionSum += sum;
            else if (status === 'empty') { emptySum += sum; emptyCount++; }

            const mName = row[5] || 'Не заполнено';
            
            let curName = row[4] || 'Не указан';
            if (curName === 'Перчук Анастасия Дмитриевна') curName = 'Кононова Анастасия Дмитриевна';

            const oName = row[0] || 'Неизвестно';
            const dName = row[10] || 'Не указан'; 

            contractors[cName] = (contractors[cName] || 0) + sum;
            methods[mName] = (methods[mName] || 0) + sum;
            curatorsSum[curName] = (curatorsSum[curName] || 0) + sum;
            curatorsCount[curName] = (curatorsCount[curName] || 0) + 1;
            orgsBE[oName] = (orgsBE[oName] || 0) + sum;
            orgsDept[dName] = (orgsDept[dName] || 0) + sum;

            // Собираем стату по ответственным
            if (!responsibles[respName]) {
                responsibles[respName] = { 
                    totalSum: 0,
                    totalCount: 0, 
                    overdueSum: 0, overdueCount: 0, 
                    operationalSum: 0, operationalCount: 0, 
                    questionSum: 0, questionCount: 0,
                    contractorsOverdue: {} 
                };
            }
            responsibles[respName].totalSum += sum;
            responsibles[respName].totalCount++;
            
            if (status === 'overdue') {
                responsibles[respName].overdueSum += sum;
                responsibles[respName].overdueCount++;
                responsibles[respName].contractorsOverdue[cName] = (responsibles[respName].contractorsOverdue[cName] || 0) + sum;
            } else if (status === 'operational') {
                responsibles[respName].operationalSum += sum;
                responsibles[respName].operationalCount++;
            } else if (status === 'question') {
                responsibles[respName].questionSum += sum;
                responsibles[respName].questionCount++;
            }
        });

        currentState = { curatorsSum, curatorsCount, orgsBE, orgsDept, totalSum, totalCount: filtered.length };

        // Обновляем сумму в хедере и KPI
        document.getElementById('dtz-main-sum').innerText = formatMoney(totalSum); 
        document.getElementById('dtz-kpi-total').innerText = formatMoney(totalSum);
        document.getElementById('dtz-kpi-overdue').innerText = formatMoney(overdueSum);
        document.getElementById('dtz-kpi-operational').innerText = formatMoney(operationalSum);
        document.getElementById('dtz-kpi-question').innerText = formatMoney(questionSum);

        // Сноска про пустые сроки
        const warningEl = document.getElementById('dtz-empty-warning');
        if (emptyCount > 0) {
            warningEl.style.display = 'block';
            warningEl.innerHTML = `⚠️ Внимание: ${emptyCount} строк на сумму ${formatMoney(emptySum)} не имеют расчетного срока поставки (ошибки заполнения 1С).`;
        } else {
            warningEl.style.display = 'none';
        }

        // Рисуем всё
        renderLineCharts();
        renderDoughnutAndTable('dtzPieContractors', 'dtzTableContractors', contractors, totalSum, true);
        renderDoughnutAndTable('dtzPieMethods', 'dtzTableMethods', methods, totalSum, false);
        renderCuratorsChart(curatorsSum, curatorsCount, totalSum, filtered.length);
        renderOrgsChart(orgsBE, orgsDept, totalSum);
        
        // Рисуем ответственных
        renderResponsiblesChart(responsibles);
    }

    // ... (дальше идут функции getAggregatedData, renderLineCharts, renderDoughnutAndTable, renderCuratorsChart, renderOrgsChart - они остаются БЕЗ ИЗМЕНЕНИЙ, берешь их из прошлого шага)
    // Если нужно, я могу прислать их снова, но они не менялись.
    
    // Для порядка, вот они:
    function getAggregatedData() {
        if (currentGranularity === 'day') {
            return { 
                labels: dtzStats.dates.map(d => { const p = d.split('-'); return `${p[2]}.${p[1]}.${p[0]}`; }), 
                sums: dtzStats.sums, 
                counts: dtzStats.counts 
            };
        }
        let aggregated = {};
        dtzStats.dates.forEach((dateStr, index) => {
            let key = currentGranularity === 'month' ? dateStr.substring(0, 7) : dateStr.substring(0, 4);
            if (!aggregated[key]) {
                aggregated[key] = { sum: dtzStats.sums[index], count: dtzStats.counts[index] };
            } else {
                aggregated[key].sum = dtzStats.sums[index]; 
                aggregated[key].count += dtzStats.counts[index]; 
            }
        });
        let sortedKeys = Object.keys(aggregated).sort();
        let labels = sortedKeys.map(key => {
            if (currentGranularity === 'month') {
                const [y, m] = key.split('-');
                const monthNames = ["Янв", "Фев", "Мар", "Апр", "Май", "Июн", "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек"];
                return `${monthNames[parseInt(m)-1]} ${y}`;
            }
            return `${key} год`;
        });
        return { labels, sums: sortedKeys.map(k => aggregated[k].sum), counts: sortedKeys.map(k => aggregated[k].count) };
    }

    function renderLineCharts() {
        if (!dtzStats.dates || dtzStats.dates.length === 0) return;
        const aggData = getAggregatedData();
        const chartType = currentGranularity === 'day' ? 'line' : 'bar';

        if (dtzCharts.sum) dtzCharts.sum.destroy();
        dtzCharts.sum = new Chart(document.getElementById('dtzTrendSumChart').getContext('2d'), {
            type: chartType,
            data: { labels: aggData.labels, datasets: [{ label: 'Объем ДтЗ', data: aggData.sums, borderColor: '#E74C3C', backgroundColor: currentGranularity === 'day' ? 'rgba(231, 76, 60, 0.1)' : '#E74C3C', fill: currentGranularity === 'day', tension: 0.3, pointRadius: 0, pointHoverRadius: 5, borderRadius: currentGranularity === 'day' ? 0 : 4 }] },
            options: { responsive: true, maintainAspectRatio: false, interaction: { mode: 'index', intersect: false }, plugins: { legend: { display: false }, title: { display: true, text: 'Динамика объема ДтЗ', color: getTextColor() }, tooltip: { callbacks: { title: c => c[0].label, label: c => 'Сумма: ' + formatMoney(c.raw) } } }, scales: { x: { display: currentGranularity !== 'day', ticks: { color: getTextColor(), maxRotation: 45 } }, y: { ticks: { color: getTextColor(), callback: v => formatMoney(v) } } } }
        });

        if (dtzCharts.count) dtzCharts.count.destroy();
        dtzCharts.count = new Chart(document.getElementById('dtzTrendCountChart').getContext('2d'), {
            type: chartType,
            data: { labels: aggData.labels, datasets: [{ label: 'Новые строки', data: aggData.counts, borderColor: '#3498DB', backgroundColor: currentGranularity === 'day' ? 'rgba(52, 152, 219, 0.1)' : '#3498DB', fill: currentGranularity === 'day', tension: 0.3, pointRadius: 0, pointHoverRadius: 5, borderRadius: currentGranularity === 'day' ? 0 : 4 }] },
            options: { responsive: true, maintainAspectRatio: false, interaction: { mode: 'index', intersect: false }, plugins: { legend: { display: false }, title: { display: true, text: 'Динамика новых строк', color: getTextColor() }, tooltip: { callbacks: { title: c => c[0].label, label: c => 'Кол-во: ' + c.raw + ' шт.' } } }, scales: { x: { display: currentGranularity !== 'day', ticks: { color: getTextColor(), maxRotation: 45 } }, y: { ticks: { color: getTextColor() } } } }
        });
    }

    function renderDoughnutAndTable(chartId, tableId, dataObj, total, isTop10) {
        let sorted = Object.keys(dataObj).map(key => ({ name: key, val: dataObj[key] })).sort((a, b) => b.val - a.val);
        if (isTop10 && sorted.length > 10) {
            let top10 = sorted.slice(0, 10);
            let othersVal = sorted.slice(10).reduce((acc, curr) => acc + curr.val, 0);
            if (othersVal > 0) top10.push({ name: 'Другое', val: othersVal });
            sorted = top10;
        }

        if (dtzCharts[chartId]) dtzCharts[chartId].destroy();
        dtzCharts[chartId] = new Chart(document.getElementById(chartId).getContext('2d'), {
            type: 'doughnut',
            data: { labels: sorted.map(d => d.name), datasets: [{ data: sorted.map(d => d.val), backgroundColor: sorted.map((_, i) => getRandomColor(i)), borderWidth: 1 }] },
            options: { responsive: true, maintainAspectRatio: false, cutout: '60%', plugins: { legend: { display: false } } }
        });

        let tHtml = `<table style="width: 100%; border-collapse: collapse;"><tr style="border-bottom: 1px solid var(--border-color); color: var(--text-muted); font-weight: bold;"><th style="text-align: left; padding: 4px;">Наименование</th><th style="text-align: right; padding: 4px;">Сумма</th><th style="text-align: right; padding: 4px;">Доля</th></tr>`;
        sorted.forEach(item => {
            const pct = total > 0 ? ((item.val / total) * 100).toFixed(1) : 0;
            tHtml += `<tr style="border-bottom: 1px dashed var(--border-color);"><td style="padding: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 120px;" title="${item.name}">${item.name}</td><td style="text-align: right; padding: 4px;">${formatMoney(item.val)}</td><td style="text-align: right; padding: 4px; font-weight: bold; color: var(--brand-orange);">${pct}%</td></tr>`;
        });
        document.getElementById(tableId).innerHTML = tHtml + `</table>`;
    }

    function renderCuratorsChart(sumObj, countObj, totalSum, totalCount) {
        const isCountMode = curatorToggle && curatorToggle.checked;
        const dataObj = isCountMode ? countObj : sumObj;
        const totalVal = isCountMode ? totalCount : totalSum;

        let sorted = Object.keys(dataObj).map(key => ({ name: key, sum: sumObj[key] || 0, count: countObj[key] || 0, metric: dataObj[key] })).sort((a, b) => b.metric - a.metric);

        if (dtzCharts['dtzPieCurators']) dtzCharts['dtzPieCurators'].destroy();
        dtzCharts['dtzPieCurators'] = new Chart(document.getElementById('dtzPieCurators').getContext('2d'), {
            type: 'doughnut',
            data: { labels: sorted.map(d => d.name), datasets: [{ data: sorted.map(d => d.metric), backgroundColor: sorted.map((_, i) => getRandomColor(i)), borderWidth: 1 }] },
            options: { responsive: true, maintainAspectRatio: false, cutout: '60%', plugins: { legend: { display: false }, tooltip: { callbacks: { label: c => isCountMode ? ` ${c.raw} шт.` : ` ${formatMoney(c.raw)}` } } } }
        });

        let tHtml = `<table style="width: 100%; border-collapse: collapse;"><tr style="border-bottom: 1px solid var(--border-color); color: var(--text-muted); font-weight: bold;"><th style="text-align: left; padding: 4px;">Куратор</th><th style="text-align: right; padding: 4px;">Сумма</th><th style="text-align: right; padding: 4px;">Шт.</th></tr>`;
        sorted.forEach(item => {
            tHtml += `<tr style="border-bottom: 1px dashed var(--border-color);"><td style="padding: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100px;" title="${item.name}">${item.name}</td><td style="text-align: right; padding: 4px;">${formatMoney(item.sum)}</td><td style="text-align: right; padding: 4px; font-weight: bold; color: ${isCountMode ? 'var(--brand-orange)' : 'var(--text-main)'};">${item.count}</td></tr>`;
        });
        document.getElementById('dtzTableCurators').innerHTML = tHtml + `</table>`;
    }

    function renderOrgsChart(beObj, deptObj, totalSum) {
        const isDeptMode = orgToggle && orgToggle.checked;
        const dataObj = isDeptMode ? deptObj : beObj;
        let sorted = Object.keys(dataObj).map(key => ({ name: key, val: dataObj[key] })).sort((a, b) => b.val - a.val);

        if (dtzCharts['dtzPieOrgs']) dtzCharts['dtzPieOrgs'].destroy();
        dtzCharts['dtzPieOrgs'] = new Chart(document.getElementById('dtzPieOrgs').getContext('2d'), {
            type: 'doughnut',
            data: { labels: sorted.map(d => d.name), datasets: [{ data: sorted.map(d => d.val), backgroundColor: sorted.map((_, i) => getRandomColor(i)), borderWidth: 1 }] },
            options: { responsive: true, maintainAspectRatio: false, cutout: '60%', plugins: { legend: { display: false } } }
        });

        let tHtml = `<table style="width: 100%; border-collapse: collapse;"><tr style="border-bottom: 1px solid var(--border-color); color: var(--text-muted); font-weight: bold;"><th style="text-align: left; padding: 4px;">Наименование</th><th style="text-align: right; padding: 4px;">Сумма</th><th style="text-align: right; padding: 4px;">Доля</th></tr>`;
        sorted.forEach(item => {
            const pct = totalSum > 0 ? ((item.val / totalSum) * 100).toFixed(1) : 0;
            tHtml += `<tr style="border-bottom: 1px dashed var(--border-color);"><td style="padding: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 120px;" title="${item.name}">${item.name}</td><td style="text-align: right; padding: 4px;">${formatMoney(item.val)}</td><td style="text-align: right; padding: 4px; font-weight: bold; color: var(--brand-orange);">${pct}%</td></tr>`;
        });
        document.getElementById('dtzTableOrgs').innerHTML = tHtml + `</table>`;
    }
    let dtzRespChartInstance = null;

    function renderResponsiblesChart(respData) {
        if (!respData || Object.keys(respData).length === 0) return;

        // Сортируем ответственных по убыванию ОБЩЕЙ суммы (как ты просил)
        let sortedResps = Object.keys(respData).sort((a, b) => {
            return respData[b].totalSum - respData[a].totalSum;
        });

        // 1. Отрисовка графика
        const canvas = document.getElementById('dtzResponsiblesChart');
        const wrapper = document.getElementById('dtzRespChartWrapper');
        
        if (canvas && wrapper) {
                        // Фикс для корректной работы тултипов при скролле
            wrapper.addEventListener('scroll', () => {
                if (dtzRespChartInstance) {
                    dtzRespChartInstance.resize();
                }
            });
            if (dtzRespChartInstance) dtzRespChartInstance.destroy();
            
            // ДИНАМИЧЕСКАЯ ВЫСОТА: 35 пикселей на каждого человека (минимум 400)
            const dynamicHeight = Math.max(400, sortedResps.length * 35);
            wrapper.style.height = dynamicHeight + 'px';

            const labels = sortedResps.map(name => {
                let parts = name.split(' ');
                return parts.length > 1 ? `${parts[0]} ${parts[1][0]}.` : name;
            });

            try {
                dtzRespChartInstance = new Chart(canvas.getContext('2d'), {
                    type: 'bar',
                    data: {
                        labels: labels,
                        datasets: [
                            { label: 'Просроченная', data: sortedResps.map(name => respData[name].overdueSum), backgroundColor: '#D32F2F', borderRadius: 3 },
                            { label: 'Оперативная', data: sortedResps.map(name => respData[name].operationalSum), backgroundColor: '#2ECC71', borderRadius: 3 },
                            { label: 'Под вопросом', data: sortedResps.map(name => respData[name].questionSum), backgroundColor: '#F1C40F', borderRadius: 3 }
                        ]
                    },
                    options: {
                        indexAxis: 'y',
                        responsive: true,
                        maintainAspectRatio: false,
                        interaction: { mode: 'nearest', intersect: true },
                        plugins: {
                            legend: { position: 'top', labels: { color: getTextColor(), boxWidth: 12, font: {size: 11} } },
                            tooltip: { callbacks: { label: function(context) { return ` ${context.dataset.label}: ${formatMoney(context.raw)}`; } } }
                        },
                        scales: {
                            x: { stacked: false, display: false, beginAtZero: true },
                            y: { stacked: false, ticks: { color: getTextColor(), font: {size: 11} }, grid: { display: false } }
                        }
                    }
                });
            } catch (e) {
                console.error("Ошибка отрисовки графика ответственных:", e);
            }
        }

        // 2. Отрисовка таблицы
        const tbody = document.getElementById('dtz-responsibles-table-body');
        if (!tbody) return;
        
        tbody.innerHTML = '';

        sortedResps.forEach(name => {
            const data = respData[name];
            
            let topContractorsHtml = '—';
            if (Object.keys(data.contractorsOverdue).length > 0) {
                let sortedConts = Object.keys(data.contractorsOverdue)
                    .map(c => ({ name: c, sum: data.contractorsOverdue[c] }))
                    .sort((a, b) => b.sum - a.sum)
                    .slice(0, 3);
                
                topContractorsHtml = sortedConts.map(c => 
                    `<div style="font-size: 11px; margin-bottom: 2px;" title="${c.name}"><span style="color:var(--text-muted);">${c.name.substring(0, 25)}...</span> <b>(${formatMoney(c.sum)})</b></div>`
                ).join('');
            }

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td style="font-weight: bold; color: var(--text-main);">${name}</td>
                <!-- СЮДА ДОБАВИЛИ ОБЩУЮ СУММУ -->
                <td style="text-align: center; font-weight: bold; line-height: 1.2;">
                    ${data.totalCount} <br><span style="font-size: 11px; color: var(--text-muted); font-weight: normal;">${formatMoney(data.totalSum)}</span>
                </td>
                <td style="text-align: center; color: #D32F2F;">
                    ${data.overdueSum > 0 ? `<b>${formatMoney(data.overdueSum)}</b> <br><span style="font-size: 11px; color: var(--text-muted); font-weight: normal;">(${data.overdueCount} шт.)</span>` : '—'}
                </td>
                <td style="text-align: center; color: #2ECC71;">
                    ${data.operationalSum > 0 ? `<b>${formatMoney(data.operationalSum)}</b> <br><span style="font-size: 11px; color: var(--text-muted); font-weight: normal;">(${data.operationalCount} шт.)</span>` : '—'}
                </td>
                <td style="text-align: center; color: #D4AC0D;">
                    ${data.questionSum > 0 ? `<b>${formatMoney(data.questionSum)}</b> <br><span style="font-size: 11px; color: var(--text-muted); font-weight: normal;">(${data.questionCount} шт.)</span>` : '—'}
                </td>
                <td style="text-align: left; vertical-align: top;">${topContractorsHtml}</td>
            `;
            tbody.appendChild(tr);
        });
    }
        // --- ЛИЧНАЯ ДЕБИТОРКА В КАРТОЧКЕ СОТРУДНИКА ---
    const openEmpDtzBtn = document.getElementById('open-emp-dtz-btn');
    const empDtzModal = document.getElementById('employee-dtz-modal');
    const closeEmpDtzBtn = document.getElementById('close-employee-dtz');

    // Переменные состояния для фильтров модалки
    let currentEmpDtzRows = []; 
    let empDtzStatus = 'all';
    let empDtzOrg = 'all';
    let empDtzCont = 'all';
    let empDtzResp = 'all';

        if (openEmpDtzBtn && empDtzModal) {
        // 1. Открытие окна
        openEmpDtzBtn.addEventListener('click', (e) => {
            e.preventDefault(); 
            if (!currentModalEmp || !window.allDtzData) return;
            
            const empShortName = getShortName(currentModalEmp);
            
            currentEmpDtzRows = window.allDtzData.filter(row => {
                const isTMC = row[3] === 'ТМЦ';
                const curator = String(row[4] || '').trim();
                return isTMC && curator !== '' && curator.toLowerCase() !== 'nan' && getShortName(curator) === empShortName;
            });

            empDtzStatus = 'all'; empDtzOrg = 'all'; empDtzCont = 'all'; empDtzResp = 'all';
            
            document.querySelectorAll('.emp-dtz-status-btn').forEach(b => {
                b.classList.remove('active');
                b.style.background = 'transparent';
                b.style.color = 'var(--text-main)';
                if (b.dataset.status === 'all') {
                    b.classList.add('active');
                    b.style.background = 'var(--brand-orange)';
                    b.style.color = 'white';
                }
            });

            const orgSelect = document.getElementById('emp-dtz-filter-org');
            const contSelect = document.getElementById('emp-dtz-filter-cont');
            const respSelect = document.getElementById('emp-dtz-filter-resp');

            orgSelect.innerHTML = '<option value="all">Все организации</option>';
            contSelect.innerHTML = '<option value="all">Все контрагенты</option>';
            respSelect.innerHTML = '<option value="all">Все ответственные</option>';

            const orgs = new Set(), conts = new Set(), resps = new Set();
            currentEmpDtzRows.forEach(row => {
                if (row[0]) orgs.add(row[0]);
                if (row[1]) conts.add(row[1]);
                if (row[2]) resps.add(row[2]);
            });

            Array.from(orgs).sort().forEach(o => orgSelect.innerHTML += `<option value="${o}">${o}</option>`);
            Array.from(conts).sort().forEach(c => contSelect.innerHTML += `<option value="${c}">${c}</option>`);
            Array.from(resps).sort().forEach(r => respSelect.innerHTML += `<option value="${r}">${r}</option>`);

            const depts = new Set();
            currentEmpDtzRows.forEach(row => { if (row[10]) depts.add(row[10]); });
            document.getElementById('emp-dtz-title').innerText = `Дебиторская задолженность: ${currentModalEmp}`;
            document.getElementById('emp-dtz-depts').innerText = depts.size > 0 
                ? `Администрируемые департаменты: ${Array.from(depts).join(', ')}` 
                : `Нет активных строк с признаком ТМЦ`;

            renderEmpDtzFilteredTable();
            
            empDtzModal.style.display = 'flex'; 
        }); // Закрывается обработчик клика

        // 2. Закрытие окна
        closeEmpDtzBtn.addEventListener('click', () => {
            empDtzModal.style.display = 'none';
        });

        window.addEventListener('click', (e) => {
            if (e.target === empDtzModal) empDtzModal.style.display = 'none';
        });

        // 3. Обработчики фильтров
        document.querySelectorAll('.emp-dtz-status-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                document.querySelectorAll('.emp-dtz-status-btn').forEach(b => {
                    b.classList.remove('active');
                    b.style.background = 'transparent';
                    b.style.color = 'var(--text-main)';
                });
                this.classList.add('active');
                this.style.background = 'var(--brand-orange)';
                this.style.color = 'white';
                empDtzStatus = this.dataset.status;
                renderEmpDtzFilteredTable();
            });
        });

        document.getElementById('emp-dtz-filter-org').addEventListener('change', function() { empDtzOrg = this.value; renderEmpDtzFilteredTable(); });
        document.getElementById('emp-dtz-filter-cont').addEventListener('change', function() { empDtzCont = this.value; renderEmpDtzFilteredTable(); });
        document.getElementById('emp-dtz-filter-resp').addEventListener('change', function() { empDtzResp = this.value; renderEmpDtzFilteredTable(); });

        // 4. Функция рендера
        function renderEmpDtzFilteredTable() {
            let filtered = currentEmpDtzRows.filter(row => {
                if (empDtzStatus !== 'all' && getActualStatus(row[7]) !== empDtzStatus) return false;
                if (empDtzOrg !== 'all' && row[0] !== empDtzOrg) return false;
                if (empDtzCont !== 'all' && row[1] !== empDtzCont) return false;
                if (empDtzResp !== 'all' && row[2] !== empDtzResp) return false;
                return true;
            });

            let totalSum = 0, overdueSum = 0, operSum = 0, questSum = 0;
            let totalCount = 0, overdueCount = 0, operCount = 0, questCount = 0; // <-- ДОБАВИЛИ СЧЕТЧИКИ

            filtered.forEach(row => {
                const sum = parseFloat(row[8]) || 0;
                const status = getActualStatus(row[7]);
                
                totalSum += sum;
                totalCount++; // <-- Считаем общее кол-во

                if (status === 'overdue') { overdueSum += sum; overdueCount++; }
                else if (status === 'operational') { operSum += sum; operCount++; }
                else if (status === 'question') { questSum += sum; questCount++; }
            });

            // Выводим суммы и добавляем кол-во строк в скобках мелким шрифтом
            document.getElementById('emp-dtz-kpi-total').innerHTML = `${formatMoney(totalSum)} <span style="font-size: 12px; color: var(--text-muted); font-weight: normal;">(${totalCount})</span>`;
            document.getElementById('emp-dtz-kpi-overdue').innerHTML = `${formatMoney(overdueSum)} <span style="font-size: 12px; color: var(--text-muted); font-weight: normal;">(${overdueCount})</span>`;
            document.getElementById('emp-dtz-kpi-operational').innerHTML = `${formatMoney(operSum)} <span style="font-size: 12px; color: var(--text-muted); font-weight: normal;">(${operCount})</span>`;
            document.getElementById('emp-dtz-kpi-question').innerHTML = `${formatMoney(questSum)} <span style="font-size: 12px; color: var(--text-muted); font-weight: normal;">(${questCount})</span>`;

            let groupedByDept = {};
            filtered.forEach(row => {
                let deptName = row[10] || 'Без департамента';
                if (!groupedByDept[deptName]) groupedByDept[deptName] = [];
                groupedByDept[deptName].push(row);
            });

            const tbody = document.getElementById('emp-dtz-table-body');
            tbody.innerHTML = '';

            if (filtered.length === 0) {
                tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 20px; color: var(--text-muted);">Нет строк по выбранным фильтрам</td></tr>';
            } else {
                for (let dept in groupedByDept) {
                    let headerTr = document.createElement('tr');
                    headerTr.innerHTML = `
                        <td colspan="7" style="background: var(--secondary-color); font-weight: bold; color: var(--brand-orange); text-align: left; padding: 10px; font-size: 14px; border-bottom: 2px solid var(--border-color);">
                            🏢 ${dept}
                        </td>
                    `;
                    tbody.appendChild(headerTr);

                    groupedByDept[dept].sort((a, b) => (parseFloat(b[8]) || 0) - (parseFloat(a[8]) || 0));

                    groupedByDept[dept].forEach(row => {
                        const sum = parseFloat(row[8]) || 0;
                        let deadline = row[7] || '—';
                        if (deadline.includes('-')) {
                            const parts = deadline.split('-');
                            deadline = `${parts[2]}.${parts[1]}.${parts[0]}`;
                        }
                        const comment = row[12] || '';

                        const tr = document.createElement('tr');
                        tr.innerHTML = `
                            <td>${row[0] || '—'}</td>
                            <td style="font-weight: bold;">${row[1] || '—'}</td>
                            <td>${row[2] ? row[2].split(' ')[0] : '—'}</td>
                            <td style="font-size: 11px; color: var(--text-muted);">${row[9] || '—'}</td>
                            <td style="text-align: center;">${deadline}</td>
                            <td style="text-align: right; font-weight: bold; color: #E74C3C;">${sum.toLocaleString('ru-RU')} ₽</td>
                            <td style="font-size: 12px; color: var(--text-main); white-space: normal; line-height: 1.4;">${comment}</td>
                        `;
                        tbody.appendChild(tr);
                    });
                }
            }
                } // Закрывается функция renderEmpDtzFilteredTable

        // 2. Закрытие окна
        closeEmpDtzBtn.addEventListener('click', () => {
            empDtzModal.style.display = 'none';
        });

        window.addEventListener('click', (e) => {
            if (e.target === empDtzModal) empDtzModal.style.display = 'none';
        });

        // ВАЖНО: Обработчики фильтров (кнопки статусов, селекты org/cont/resp) 
        // должны находиться ЗДЕСЬ (чуть выше функции renderEmpDtzFilteredTable, если они пропали - верни их сюда).

    } // <--- ВОТ СЮДА ПЕРЕЕХАЛА СКОБКА, ЗАКРЫВАЮЩАЯ БЛОК if
        // --- ИИ-АССИСТЕНТ ДТЗ ---
    const dtzAiBtn = document.getElementById('dtz-ai-btn');
    const dtzAiModal = document.getElementById('dtz-ai-modal');
    const closeDtzAiBtn = document.getElementById('close-dtz-ai');
    const dtzAiText = document.getElementById('dtz-ai-analysis-text');
    let dtzTypeTimer = null; // Таймер для остановки печати при закрытии

    function typeWriterHTML(htmlString, element, speed = 10) {
        if (dtzTypeTimer) clearTimeout(dtzTypeTimer);
        element.innerHTML = '';
        let i = 0;
        let currentHtml = '';
        
        function type() {
            if (i < htmlString.length) {
                if (htmlString[i] === '<') {
                    let closingIdx = htmlString.indexOf('>', i);
                    if (closingIdx !== -1) {
                        currentHtml += htmlString.substring(i, closingIdx + 1);
                        i = closingIdx + 1;
                        type(); // Пропускаем теги без задержки
                        return;
                    }
                }
                
                currentHtml += htmlString[i];
                element.innerHTML = currentHtml + '<span class="type-cursor"></span>';
                i++;
                element.scrollTop = element.scrollHeight; // Авто-скролл вниз
                dtzTypeTimer = setTimeout(type, speed);
            } else {
                element.innerHTML = currentHtml; // Убираем курсор в конце
            }
        }
        type();
    }

    if (dtzAiBtn && dtzAiModal) {
        dtzAiBtn.addEventListener('click', () => {
            // Собираем данные прямо на момент клика, используя текущие фильтры
            let filteredForAI = window.allDtzData || [];
            
            if (tmcFilter && tmcFilter.checked) {
                filteredForAI = filteredForAI.filter(row => row[3] === 'ТМЦ');
            }
            
            const startVal = dateStartInput.value;
            const endVal = dateEndInput.value;
            if (startVal) filteredForAI = filteredForAI.filter(row => row[11] && row[11] >= startVal);
            if (endVal) filteredForAI = filteredForAI.filter(row => row[11] && row[11] <= endVal);
            
            if (currentStatusFilter !== 'all') {
                filteredForAI = filteredForAI.filter(row => getActualStatus(row[7]) === currentStatusFilter);
            }

            // Проверка на пустоту (на всякий случай)
            if (filteredForAI.length === 0) {
                dtzAiModal.style.display = 'flex';
                dtzAiText.innerHTML = '<span style="color:#E74C3C;">> Нет данных для анализа. Выберите другой период или снимите фильтры.</span>';
                return;
            }

            dtzAiModal.style.display = 'flex';
            dtzAiText.innerHTML = '<span style="color:#2ECC71;">> Сбор данных и анализ...</span>';
            
            setTimeout(() => {
                generateDtzInsights(filteredForAI);
            }, 300);
        });

        closeDtzAiBtn.addEventListener('click', () => {
            dtzAiModal.style.display = 'none';
            if (dtzTypeTimer) clearTimeout(dtzTypeTimer); // Останавливаем печать
        });
        window.addEventListener('click', (e) => { if (e.target === dtzAiModal) dtzAiModal.style.display = 'none'; });

        function generateDtzInsights(data) {
            if (!data || data.length === 0) {
                dtzAiText.innerHTML = '<span style="color:#E74C3C;">> Нет данных для анализа. Выберите другой период или снимите фильтры.</span>';
                return;
            }

            let insights = [];
            const today = new Date(); today.setHours(0, 0, 0, 0);

            // Вспомогательные структуры
            let byCurator = {}, byResp = {}, byCont = {};
            let overdueOrders = [];
            let totalOverdue = 0;

            data.forEach(row => {
                const sum = parseFloat(row[8]) || 0;
                const status = getActualStatus(row[7]);
                if (status !== 'overdue') return; // Для большинства инсайтов берем только просрочку

                totalOverdue += sum;
                overdueOrders.push(row);

                let curator = row[4] || 'Неизвестно';
                let resp = row[2] || 'Неизвестно';
                let cont = row[1] || 'Неизвестно';
                let org = row[0] || 'Неизвестно';

                if (!byCurator[curator]) byCurator[curator] = { total: 0, conts: {} };
                byCurator[curator].total += sum;
                byCurator[curator].conts[cont] = (byCurator[curator].conts[cont] || 0) + sum;

                if (!byResp[resp]) byResp[resp] = { total: 0, count: 0, shortTerm: 0 };
                byResp[resp].total += sum;
                byResp[resp].count++;

                if (!byCont[cont]) byCont[cont] = { total: 0, orgs: new Set() };
                byCont[cont].total += sum;
                byCont[cont].orgs.add(org);

                // Проверка на короткий срок (для 3-го инсайта)
                if (row[11] && row[7]) {
                    let created = new Date(row[11]);
                    let deadline = new Date(row[7]);
                    let diffDays = Math.ceil((deadline - created) / (1000 * 60 * 60 * 24));
                    if (diffDays > 0 && diffDays <= 14) byResp[resp].shortTerm++;
                }
            });

            // 1. Скрытая концентрация
            let topConc = null;
            for (let cur in byCurator) {
                if (byCurator[cur].total < 50000000) continue; // Больше 50 млн
                for (let c in byCurator[cur].conts) {
                    let share = byCurator[cur].conts[c] / byCurator[cur].total;
                    if (share > 0.75 && byCurator[cur].conts[c] > 20000000) {
                        topConc = { curator: cur, cont: c, sum: byCurator[cur].conts[c], share: Math.round(share * 100) };
                        break;
                    }
                }
                if (topConc) break;
            }
            if (topConc) {
                insights.push(`⚠️ <b>Скрытая концентрация:</b> У куратора <b>${topConc.curator.split(' ')[0]}</b> ${topConc.share}% просрочки (${formatMoney(topConc.sum)}) приходится на одного контрагента — <b>${topConc.cont}</b>.`);
            }

            // 2. Авансовая ловушка
            let advTrap = null;
            data.forEach(row => {
                if (getActualStatus(row[7]) === 'operational') {
                    let resp = row[2];
                    let sum = parseFloat(row[8]) || 0;
                    if (!advTrap) advTrap = {};
                    if (!advTrap[resp]) advTrap[resp] = 0;
                    advTrap[resp] += sum;
                }
            });
            if (advTrap) {
                let topAdv = Object.keys(advTrap).sort((a,b) => advTrap[b] - advTrap[a])[0];
                // Проверяем, есть ли у него просрочка
                if (advTrap[topAdv] > 50000000 && (!byResp[topAdv] || byResp[topAdv].total < 1000000)) {
                    insights.push(`💸 <b>Авансовая ловушка:</b> Закупщик <b>${topAdv.split(' ')[0]}</b> имеет ${formatMoney(advTrap[topAdv])} оперативной ДтЗ при отсутствии просрочки. Вероятно, работа идет по предоплате.`);
                }
            }

            // 3. Проблема планирования
            let badPlanner = null;
            for (let resp in byResp) {
                if (byResp[resp].count > 5 && (byResp[resp].shortTerm / byResp[resp].count) > 0.5) {
                    badPlanner = { name: resp, pct: Math.round((byResp[resp].shortTerm / byResp[resp].count) * 100) };
                    break;
                }
            }
            if (badPlanner) {
                insights.push(`📅 <b>Проблема планирования:</b> У закупщика <b>${badPlanner.name.split(' ')[0]}</b> ${badPlanner.pct}% просроченных заказов имели срок поставки менее 14 дней. Стоит пересмотреть нормативы сроков.`);
            }

            // 4. Эффект домино
            let domino = null;
            for (let c in byCont) {
                if (byCont[c].orgs.size >= 2 && byCont[c].total > 10000000) {
                    domino = { cont: c, count: byCont[c].orgs.size, sum: byCont[c].total };
                    break;
                }
            }
            if (domino) {
                insights.push(`🌍 <b>Эффект домино:</b> Контрагент <b>${domino.cont}</b> имеет просрочку сразу перед <b>${domino.count}</b> нашими БЕ на общую сумму ${formatMoney(domino.sum)}. Системный риск.`);
            }

            // 5. Бомба замедленного действия (Топ-3)
            overdueOrders.sort((a, b) => (parseFloat(b[8]) || 0) - (parseFloat(a[8]) || 0));
            if (overdueOrders.length > 0) {
                let bombText = overdueOrders.slice(0, 3).map((r, i) => {
                    return `<br>${i+1}. Заказ <b>${r[9].split('от')[0].trim()}</b> (${r[1]}) — ${formatMoney(r[8])}`;
                }).join('');
                insights.push(`💣 <b>Самые крупные риски:</b>${bombText}`);
            }

            // 6. Ожидаемая просрочка (Прогноз)
            let next10Days = new Date(today);
            next10Days.setDate(today.getDate() + 10);
            let expectedSum = 0, expectedCount = 0;
            
            data.forEach(row => {
                if (getActualStatus(row[7]) === 'operational' && row[7]) {
                    let deadline = new Date(row[7]);
                    if (deadline >= today && deadline <= next10Days) {
                        expectedSum += parseFloat(row[8]) || 0;
                        expectedCount++;
                    }
                }
            });
            if (expectedCount > 0) {
                insights.push(`⏳ <b>Ожидаемая просрочка:</b> В ближайшие 10 дней истекает срок по <b>${expectedCount}</b> заказам на сумму ${formatMoney(expectedSum)}. Если поставки не будет, они уйдут в просрочку.`);
            }

            // 7. Сезонность
            let monthsCount = {};
            overdueOrders.forEach(row => {
                if (row[11]) {
                    let m = new Date(row[11]).getMonth();
                    monthsCount[m] = (monthsCount[m] || 0) + 1;
                }
            });
            let worstMonth = Object.keys(monthsCount).sort((a,b) => monthsCount[b] - monthsCount[a])[0];
            if (worstMonth !== undefined && overdueOrders.length > 10) {
                const monthNames = ["Январе", "Феврале", "Марте", "Апреле", "Мае", "Июне", "Июле", "Августе", "Сентябре", "Октябре", "Ноябре", "Декабре"];
                insights.push(`📊 <b>Сезонность:</b> Больше всего проблемных заказов (ушедших в просрочку) было создано в <b>${monthNames[worstMonth]}</b>.`);
            }

            // 8. Взаимозачеты (Старые долги > 180 дней)
            let oldSum = 0, oldCount = 0;
            overdueOrders.forEach(row => {
                if (row[11]) {
                    let created = new Date(row[11]);
                    let diffDays = Math.ceil((today - created) / (1000 * 60 * 60 * 24));
                    if (diffDays > 180) {
                        oldSum += parseFloat(row[8]) || 0;
                        oldCount++;
                    }
                }
            });
            if (oldCount > 0) {
                insights.push(`🔍 <b>Взаимозачеты:</b> Обнаружено <b>${oldCount}</b> заказов с давностью более 180 дней на сумму ${formatMoney(oldSum)}. Требуется проверка статуса их закрытия в 1С.`);
            }

                        // Вывод с анимацией печати
            if (insights.length === 0) {
                let finalHtml = '<span style="color:#2ECC71;">> Проверка завершена. Критических рисков и аномалий не выявлено. Просрочка в пределах нормы.</span>';
                typeWriterHTML(finalHtml, dtzAiText, 12);
            } else {
                let finalHtml = '<span style="color:#2ECC71; font-weight:bold;">> Анализ завершен. Найдено скрытых рисков: ' + insights.length + '</span><br><br>';
                finalHtml += insights.map(i => `<div style="margin-bottom: 15px; padding-left: 10px; border-left: 2px solid #3498DB;">${i}</div>`).join('');
                typeWriterHTML(finalHtml, dtzAiText, 5); // 5мс на символ — быстро и эффектно
            }
        }
    } // Конец if (dtzAiBtn && dtzAiModal)
}); // <--- ЗАКРЫВАЕТСЯ САМА СЕКЦИЯ 36


    
