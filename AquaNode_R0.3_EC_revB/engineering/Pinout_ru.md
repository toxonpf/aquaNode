# Распиновка revB
| Узел | Контакт | Сигнал |
|---|---|---|
| XIAO J1.1 | D0 / GPIO1 | EC_ADC |
| XIAO J1.2 | D1 / GPIO2 | PH_EN: общий enable 5 В для EC-стенда |
| XIAO J1.3 | D2 / GPIO3 | Не подключён, strapping |
| XIAO J1.4 | D3 / GPIO4 | BAT_EN, LOW в стенде |
| XIAO J1.5 / J1.6 | D4/GPIO5 / D5/GPIO6 | SDA/SCL, 0x48 ADS1115; скетч их не использует |
| XIAO J1.7 | D6 / GPIO43 | DS_LOCAL, не UART TX |
| J7.1 / .2 / .3 | GND / 3V3 / EC_FILTERED | .2 отсутствует в кабеле |
| TP5 / TP6 | 5V_PH / GND | Питание EC внешним проводом |
| U1.4 / .5 / .6 / .7 | AIN0 / AIN1 / AIN2 / AIN3 | ADC_PH / ADC_BAT / GND / GND |
| Wio | штатный B2B | Радио без изменений; не мостить D0–D5 |

Полный перечень всех контактов — design.json; он не заменяет native netlist. Радио в стенде не инициализируется. Название PH_EN историческое: теперь на стенде оно включает EC, pH должен быть физически отключён.
