# К востоку от Эдема — дневник чтения

Читательский спутник к роману Джона Стейнбека «К востоку от Эдема» (рус. перевод): главы, цитаты, контекст эпохи, смыслы, герои и сюжет. Строго без спойлеров: только прочитанное.

Сайт: https://samvelkoch.github.io/eastofeden/

## Устройство

| Файл | Что внутри |
| --- | --- |
| `index.html` | Разметка: шапка, 5 экранов, таб-бар, блок «Семьи» |
| `style.css` | Стили, монохромная палитра, светлая/тёмная тема |
| `theme.js` | Переключатель темы (Светлая → Тёмная → Как в системе), выбор хранится в `localStorage` |
| `app.js` | Рендер всех экранов из `data.json`, маршруты `#ch-N`, `#quotes`, `#meanings`, `#people`, `#story` |
| `data.json` | Весь контент дневника |

## Как обновлять

Почти всё меняется только в `data.json`:

- `current` — где сейчас читатель (`ch`, `note`, `pct`) и граница спойлеров.
- `chapters` — краткое содержание глав (`n`, `title`, `summary`).
- `quotes` — цитаты (`ch`, `loc` для хайлайтов Kindle или `sec`, `themes`, `text`, `context`, `comment`, `ord` — позиция в тексте для сортировки). Тема `claude` = «Выбор Claude».
- `context` — факты и трактовки по главам (`kind`: `fact` | `reading`).
- `meanings`, `debates`, `questions`, `attitudes`, `hypotheses`, `storylines`, `cast`, `timeline`, `log`.

Проверка локально: `python3 -m http.server` и открыть http://localhost:8000 (данные грузятся через `fetch`, поэтому `file://` не подойдёт).

## Картинки и карты
- Картинки: `data.json → world[].items[].img = {file, cap, credit}`. `file` — имя файла на Wikimedia Commons (только public domain / свободные лицензии); превью грузится через `Special:FilePath?width=640`, на сайте показывается в ч/б. Если файл не загрузился, карточка просто без картинки.
- Карты: `data.json → maps` (точки с `ll: [lon, lat]`, `ch`, `lab`). SVG пересобирать после правок координат: `cd tools/maps && npm i && node build.mjs` → `img/map-*.svg`. Тексты легенды берутся из data.json без пересборки.
