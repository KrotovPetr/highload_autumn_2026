# Task 1: Items API

This directory currently contains the base in-memory microservice for Task 1. Monitoring, dashboard generation, and background load are not implemented yet.

## Run

```sh
cp .env.example .env
docker compose up --build
```

The API listens on `http://localhost:8080` by default. Change `PORT` in `.env` to use another host port. Data is stored in memory and disappears when the service restarts.

## Endpoints

| Method | Path | Result |
| --- | --- | --- |
| `POST` | `/items` | Create an item from `{"name":"example"}`; returns 201 |
| `GET` | `/items/{id}` | Return an item; returns 404 if it does not exist |
| `PUT` | `/items/{id}` | Replace an item's name from `{"name":"updated"}`; returns 404 if it does not exist |
| `GET` | `/health` | Return 200 while the service is ready |

An invalid item ID or missing/empty `name` returns 400.
