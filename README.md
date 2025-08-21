# Weather Data Updater Service

## 📌 Overview

This project provides a service that retrieves weather data (sunrise and sunset times) from a third-party API and stores **5 days' worth of weather information** in a MongoDB database. The service ensures that exactly 5 days of data are always available for each location:

* When a new location is added → fetch and store **5 consecutive days** (today + next 4 days).
* On daily scheduled updates (via cron/Lambda) → remove expired data (past day) and fetch the missing new day, keeping exactly 5 records.

For example:

* On **21st Aug**, data will exist for \[21, 22, 23, 24, 25].
* On **22nd Aug**, data for 21st Aug is removed, and data for 26th Aug is added → \[22, 23, 24, 25, 26].

This rolling mechanism ensures the database always has **the latest 5 days of weather info**.

---

## 🛠️ Tech Stack

* **Node.js** – runtime environment
* **Express.js** – for API endpoints
* **MongoDB** + **Mongoose** – for database storage
* **AWS Lambda (planned)** – to schedule and run daily updates
* **Jest** – for unit testing with mocked dependencies
* **Axios** – to call the third-party weather API

---


## ⚙️ How It Works

### 1. Adding a New Location

* Saves the location's latitude/longitude.
* Fetches **5 days of weather data** from today.
* Stores it in the database.

### 2. Daily Scheduled Update

* Keeps only valid dates within the 5-day rolling window.
* If any date is missing → fetch it from the API.
* Ensures **always 5 entries** in `weatherData`.

---

## 🚀 Running the Project

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Create a `.env` file in project root:

```env
PORT=4000
NODE_ENV=development
MONGODB_URI=MONGODB_URL

WEATHER_LAMBDA_NAME=weather-service-dev-weatherFetcher
AWS_REGION=ap-south-1
AWS_ACCESS_KEY_ID=ACCESS_KEY
AWS_SECRET_ACCESS_KEY=SECRET_KEY
```

Create a `.env` file in lambda folder:

```env
AWS_ACCESS_KEY_ID=ACCESS_KEY
AWS_SECRET_ACCESS_KEY=SECRET_KEY
AWS_REGION=ap-south-1
MONGO_URI=MONGODB_URL

```

### 3. Run service (local)

```bash
npm run run:weather
```

### 4. Run tests

```bash
npm test
```

## ✅ Requirements Covered

✔️ Retrieve weather data every 24 hours
✔️ Maintain exactly **5 days of sunrise/sunset info** per location
✔️ Replace expired dates with new ones (rolling window)
✔️ Store in MongoDB with Mongoose schema
✔️ Unit tests with Jest
