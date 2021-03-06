## GaltMap требования

Сделать интерактивную карту, которая в реальном времени будет показывать статусы
всех участков определенной заранее территории, а так же показывать общие логи
из бота, логи для конкретного пользователя, балансы пользователя и общее кол-во
ETH в отдельном окне.

## GaltMap техническое задание

### Отображение участков

Для отображения участков определенной формы и цвета необходимо использовать
библиотеку leaflet.js. Обозначить на заданной заранее территории список участков
и отобразить их на карте. В то же время постоянно слушать redis на наличие
event'ов, связанных с покупкой/продажей/аукционом территорий и отображать их
статусы на карте в реальном времени.

### Логи

Логи должны представлять собой три окна, которые в реальном времени отображают
все изменения во вселенной.

###### Окно 1. Общий лог

Необходимо реализовать окно с общими логами, которые будут приходить из redis.
Затем, с помощью websocket отображать их на клиенте в окне с общими логами.

###### Окно 2. Лог бота

Необходимо реализовать окно логов со всеми сообщениями из бота для конкретного
пользователя. ID пользователя необходимо определять по URL. Например
пользователь переходит по ссылке
https://galtmap.io/0xdb6475f4af1a428c2c8f16abeafdf75e43930e55 - где 
0xdb6475f4af1a428c2c8f16abeafdf75e43930e55 его ID из телеграм бота. Необходимо
реализовать логику получения этих сообщений.

###### Окно 3. Информация о пользователе

Необходимо реализовать окно, с отображением информации о пользователе в реальном
времени для конкретного пользователя телеграм бота. Логика должна быть 
реализована через redis, с помощью pub & sub.

### Общее кол-во ETH & GALT

В отдельном небольшом окне необходимо реализовать 2 счетчика, которые в реальном
времени следят за балансом ETH & GALT на контракте 
[TerritoryCrowdsale](https://github.com/andromedaspace/galtproject-docs/blob/master/ru/contracts/TerritoryCrowdsale.md).
Необходимо реализовать механизм получения кол-ва ETH & GALT.
