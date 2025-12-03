# Task Manager – запуск проекта

## Запуск в Docker
1. В папке backend
   ```bash
   npm i
   ```
2. В папке frontend
   ```bash
   npm i
   ```
3. В корне проекта:
   ```bash
   npm run compose:up
   ```
4. Приложение будет доступно по адресу `http://localhost:4173`, Swagger `http://localhost:3000/api`.

5. В папке backend 
   ```bash
   npx prisma generate
   npm run seed
   ```


# P.S.
я не знал как лучше сделать, поэтому редактирование работает только для задач где author === текущий пользователь 