# Структура проекта

```text
src/
  main.tsx                 запуск React и регистрация GSAP
  app/
    App.tsx                маршруты, header, footer, метаданные страницы
    styles.ts              явный порядок подключения CSS
  pages/
    home/                  основная часть Overview, блоки устройства и сети
    about/                 описание проекта и учебный блок
    technology/            устройство и инженерные схемы
    build/                 сборка, проверки и загрузка материалов
    journal/               журнал, записи и кривая обложки
    team/                  участники, портреты, модальное окно и его анимация
  features/
    ocean/
      OceanStory.tsx       пять сцен вступления
      story/               текст сцен, навигация, стрелка «Далее», датчики
      scene/               Three.js, вода, подводный мир и сеть буев
      audio/               звук поверхности и погружения
      styles/              оформление вступления
    buoy/                  общий просмотрщик, модель и SVG буя
    cursor/                курсор и команда cursorStyle()
    i18n/                  выбор языка, функция t(), русские переводы
  components/
    ui/                    заголовки, стрелки, ссылки и кнопки загрузки
    brand/                 логотип и его волны
    layout/                header, footer и их элементы
  data/                    английские исходные записи и их локализация
  shared/
    motion/                появление текста
    navigation/            переходы страниц и плавный скролл
  styles/                  базовые правила, читаемость, языковые и общие поправки
  assets/                  исходный SVG логотипа

tests/
  pages/                   страницы и их содержимое
  ocean/                   сцены, вода, звук и прокрутка истории
  team/                    карточки, контакты и возврат портретов
  cursor/                  движение курсора и консольная команда
  ui/                      общая навигация, загрузка, языки и интерфейс

docs/                      устройство проекта, переводы и контакты
  audits/                  аудит контента и журнал прежних проверок
public/                    ресурсы с постоянными URL: модели, фото, шрифты, скачивания
assets-source/             оригиналы фотографий и других подготовленных изображений
AquaNode_R0.3/              исходный инженерный пакет
scripts/                   подготовка изображений
```

## Где править

| Задача | Файлы |
| --- | --- |
| Порядок сцен и скролл вступления | `src/features/ocean/story/useStoryNavigation.ts` |
| Камера, композиция и погружение | `src/features/ocean/scene/Scene.tsx` |
| Стиль воды и команда `oceanStyle()` | `src/features/ocean/scene/oceanStyle.ts`, `oceanStyles.ts`, `OceanSurface.tsx` |
| Надпись и стрелка «Далее» | `src/features/ocean/story/OceanSkip.tsx`, `src/features/ocean/styles/chapters.css` |
| Обложка и кривая журнала | `src/pages/journal/JournalPage.tsx`, `JournalThread.tsx`, `journal.css` |
| Участники и ссылки | `src/data/catalog.ts`, `docs/team-contacts.md` |
| Анимация модального окна команды | `src/pages/team/useTeamProfileMotion.ts` |
| Кривые поверх фотографий участников | `src/pages/team/PortraitCurrent.tsx`, `portrait-current.css` |
| Волнистый разделитель профиля и клавиша Esc | `src/pages/team/TeamCurrent.tsx`, `TeamRoster.tsx`, `profile-details.css` |
| Цвет отклика текстовых кнопок | `src/styles/interaction.css` |
| Плавная высота переключаемого текста | `src/components/ui/AnimatedHeight.tsx` |
| Сохранение нажатой ссылки при загрузке | `src/shared/navigation/retainNavigation.ts`, `PageTransition.tsx` |
| Переводы | `src/features/i18n/locales/ru*.ts`, `docs/localization.md` |

CSS конкретной страницы лежит рядом с её компонентами. Общие компоненты не должны импортировать страницы. Пути статических ресурсов начинаются с `/assets/`, `/models/`, `/fonts/` или `/resources/` и не зависят от расположения исходников.

Все CSS подключаются один раз через `src/app/styles.ts`. В конце идут читаемость, локализация, совместимость оформления и реакции на действия. При добавлении нового CSS внесите его в этот список, сохраняя порядок общих поправок.

## Проверки

```sh
npm run build
npx playwright test
npx playwright test tests/pages/journal.spec.ts
npx playwright test tests/team
npx playwright test tests/ocean
```

В окружении без установленного браузера Playwright можно указать путь к Chrome через `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`.
