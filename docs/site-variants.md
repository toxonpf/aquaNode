# Два варианта AquaNode в отдельных ветках

| Ветка | Сайт |
| --- | --- |
| `cutMirror` | Текущая версия без карты и заявлений об отправке буйков. Последний этап — создание второй версии совместно с OCA. |
| `fullMirror` | Предыдущая версия с картой, сетью буйков и прежними текстами. Восстановлена из `bb35c16`, последнего коммита перед удалением карты. |

Каждая ветка содержит полноценный сайт в корне репозитория, собственные исходники,
ресурсы, документацию и проверки. Дублировать сайт во вложенной папке не нужно.
Тексты версии с картой относятся к прежнему варианту сайта, а не к текущему статусу проекта.

## Переключение и запуск

Перед переключением остановить сервер разработки и сохранить изменения коммитом
или через `git stash`. Переключиться на нужный сайт:

```sh
git switch cutMirror
# или
git switch fullMirror
```

В обеих ветках команды одинаковые:

```sh
npm ci
npm run dev
npm run build
npm run preview
```

Готовый сайт появляется в `dist/`. Повторный `npm ci` нужен при изменении зависимостей;
между этими двумя версиями зависимости одинаковые.

## Публикация веток на GitHub

```sh
git push -u origin cutMirror
git push -u origin fullMirror
```

## Два проекта Cloudflare Pages

Подключить один GitHub-репозиторий к двум отдельным проектам:

| Настройка | Текущий сайт | Сайт с картой |
| --- | --- | --- |
| Production branch | `cutMirror` | `fullMirror` |
| Root directory | корень репозитория | корень репозитория |
| Build command | `npm run build` | `npm run build` |
| Build output directory | `dist` | `dist` |

После отправки коммитов каждый проект собирается из своей ветки и получает
собственный адрес `pages.dev`. Создание веток локально само по себе не публикует сайты.

## Два сайта через Cloudflare Workers

Если в логе указан `/workers/scripts/…/versions` и выполняется `wrangler deploy`,
это Workers. Можно оставить этот способ публикации: в обеих ветках есть
`wrangler.jsonc` со штатным режимом SPA для маршрутов React.

Для двух Workers подключить тот же репозиторий и задать:

| Настройка | Текущий сайт | Сайт с картой |
| --- | --- | --- |
| Worker name | `aquanode` | `aquanode-full` |
| Production branch | `cutMirror` | `fullMirror` |
| Root directory | корень репозитория | корень репозитория |
| Build command | `npm run build` | `npm run build` |
| Deploy command | `npx wrangler deploy` | `npx wrangler deploy` |

Имя Worker в панели должно совпадать с `name` в `wrangler.jsonc` соответствующей
ветки. Если второй Worker назван иначе, заменить `name` в его ветке на фактическое имя.
У Workers адрес имеет вид `<worker>.<account>.workers.dev`; существующий адрес
Pages не превращается в адрес Worker.

Правило `/* /index.html 200` удалено из `public/_redirects`: Workers считает его
зацикленным при нормализации HTML-пути. Вместо него используется
`assets.not_found_handling: "single-page-application"`. На Pages fallback работает
автоматически, пока в корне сборки нет `404.html`. Для другого статического хостинга
нужно включить его собственный SPA fallback.

Локальная проверка режима Workers после `npm run build`:

```sh
npx wrangler dev --local
```

Проверить прямой заход и перезагрузку на `/about`, `/technology`, `/build`,
`/journal`, `/team`, а в `fullMirror` также `/map?region=taiwan`.

Официальная документация: [Workers SPA](https://developers.cloudflare.com/workers/static-assets/routing/single-page-application/),
[Pages SPA](https://developers.cloudflare.com/pages/configuration/serving-pages/#single-page-application-spa-rendering).
