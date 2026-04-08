# Diet Goal Tracker

A backend-backed diet tracking app with account creation, login, daily meal history, admin audit logging, and private per-user data.

## Features

- Login, sign up, and logout flow with email and password
- Each user only sees their own diet goals, meals, and day history
- Admin audit trail for signups, logins, logouts, and registration alerts
- Add meals for breakfast, lunch, dinner, snacks, or custom entries
- Describe foods with common measurements and auto-calculate calories, protein, carbs, and fat
- Track calories, protein, carbs, and fat for the day
- Set your own daily macro goals
- Get an automatic end-of-day style status:
  - `On limit` when calories, carbs, and fat stay under target and protein meets target
  - `Off limit` when any target falls outside the goal
- Backend stores users, meals, goals, sessions, notifications, and audit events in a local JSON database

## Run

Start the backend server:

```bash
cd /Users/ajayreddy/Desktop/devOPS/diet
npm start
```

Then open [http://127.0.0.1:3000](http://127.0.0.1:3000).

The backend files are:

- [server.js](/Users/ajayreddy/Desktop/devOPS/diet/server.js)
- [package.json](/Users/ajayreddy/Desktop/devOPS/diet/package.json)

Data is stored in `data/app-data.json` after the server starts.

Smart meal examples:

- `200g chicken breast, 150g cooked rice, 10g olive oil`
- `100g oats, 250g milk, 120g banana`
- `paneer 180g, roti 60g, curd 100g`
- `40 grms of oats with 50 ml of milk`
- `1 cup rice, 1 bowl dal, 2 rotis`
- `2 eggs, 1 banana, 1 glass milk`
