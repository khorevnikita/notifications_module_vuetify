### Установка
```
npm i --save @khonik/notifications-module@1.0.0
```

### Импортируем в routes/index.js
```
import Notifications from '@khonik/notifications-module'
```

### Добавляем в массив routes:
```
{
    path: '/notifications', name: 'notifications', component: Notifications
}
```