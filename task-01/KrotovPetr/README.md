# Task 1: Items API

This directory contains the in-memory microservice, two application instances, and Prometheus scraping for Task 1. Grafana dashboard generation and background load are not implemented yet.

## Run

```sh
cp .env.example .env
docker compose up --build
```

The first API instance listens on `http://localhost:8080`, the second on `http://localhost:8081`, and Prometheus on `http://localhost:9090`. Change `PORT` or `PORT_2` in `.env` to use other host ports. Both application containers use the same image. Each has its own in-memory storage, which disappears when that container restarts.

## Endpoints

| Method | Path | Result |
| --- | --- | --- |
| `POST` | `/items` | Create an item from `{"name":"example"}`; returns 201 |
| `GET` | `/items/{id}` | Return an item; returns 404 if it does not exist |
| `PUT` | `/items/{id}` | Replace an item's name from `{"name":"updated"}`; returns 404 if it does not exist |
| `GET` | `/health` | Return 200 while the service is ready |
| `GET` | `/metrics` | Return Prometheus metrics |
| `GET` | `/handlers` | List the application's working REST routes |

An invalid item ID or missing/empty `name` returns 400.

## Metrics

`POD_ID` and `DATACENTER` are read from the environment. They appear on both application metrics as `pod_id` and `datacenter` labels. The second instance receives `POD_ID_2` and `DATACENTER_2` from Compose. The defaults are `pod-1`/`dc-a` and `pod-2`/`dc-b`.

| Metric | Type | Labels | Use |
| --- | --- | --- | --- |
| `http_requests_total` | Counter | `method`, `route`, `status_code`, `pod_id`, `datacenter` | Request rate and 4xx/5xx counts by exact code |
| `http_request_duration_seconds` | Histogram | `method`, `route`, `pod_id`, `datacenter`; generated bucket label `le` | p50, p95, and p99 latency |

`route` contains a template such as `/items/{id}`, never the ID from a request. `/health` and `/metrics` are excluded. The histogram uses buckets at 0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, and 5 seconds, plus the automatic `+Inf` bucket. These boundaries give finer detail for quick in-memory requests while still covering slower requests.

A Histogram exposes cumulative buckets that can be summed across instances while retaining the `le` boundary, then passed to `histogram_quantile`. A Summary calculates quantiles in each instance; those quantiles cannot be combined into a correct overall percentile.

Prometheus scrapes `app:8080/metrics` and `app-b:8080/metrics` every five seconds. Check target status at `http://localhost:9090/targets`. The `/handlers` response is built from the same route registrations as the API, so registering another working route through `registerHandler` adds it to the list without editing `/handlers`.
