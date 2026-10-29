# Проверки и журналы
Python 3.12+; ec_model.py, export_calibration.py и unit tests используют стандартную библиотеку. log_capture.py дополнительно требует pyserial. Скрипты доставки сохранены для будущих независимых TX/RX-логов; они не подтверждают существование радио/mesh в прошивке.

Из корня пакета: `python -m unittest discover -s test_tools -p "test_*.py" -v`.
Калибровка: `python test_tools/ec_model.py --low-v <измерено> --low-ec <сертификат> --high-v <измерено> --high-ec <сертификат> --cal-id <ID>`. Угловые скобки здесь означают обязательные реальные значения, не готовую команду. Сохранить JSON, затем `python test_tools/export_calibration.py real_cal.json --out calibration_candidate.h` и проверить файл. Генератор отказывается перезаписывать существующий файл и отклоняет идентификаторы SYNTHETIC. Acceptance flags остаются false.

Лог реального стенда: `python test_tools/log_capture.py --port COM5 --run-id bench-001 --role bench --out bench-001.jsonl` (COM5 заменить). Не создавать этот файл заранее: он открывается только на запись нового результата. Сохраняются исходные байты, время хоста и ошибка разбора. Наличие синтетического JSON никогда не считать записью устройства.

Проверка исходных CAD-структур: `python repro/source_checks.py` (pypdf и Pillow нужны импортируемому inspect_local). Скрипт не является ERC/DRC. Результаты native-проверок получать отдельно в установленном KiCad.
