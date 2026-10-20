import express from "express";

type Item = {
  id: number;
  name: string;
};

function parseItemId(raw: string | string[] | undefined): number | null {
  if (typeof raw !== "string" || !/^[1-9]\d*$/.test(raw)) {
    return null;
  }

  const id = Number(raw);
  return Number.isSafeInteger(id) ? id : null;
}

function parseItemName(body: unknown): string | null {
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return null;
  }

  const name = (body as Record<string, unknown>).name;
  return typeof name === "string" && name.trim().length > 0 ? name.trim() : null;
}

export function createApp() {
  const app = express();
  const items = new Map<number, Item>();
  let nextId = 1;

  app.disable("x-powered-by");
  app.use(express.json());

  app.get("/health", (_request, response) => {
    response.status(200).json({ status: "ok" });
  });

  app.post("/items", (request, response) => {
    const name = parseItemName(request.body);
    if (name === null) {
      response.status(400).json({ error: "name must be a non-empty string" });
      return;
    }

    const item: Item = { id: nextId++, name };
    items.set(item.id, item);
    response.location(`/items/${item.id}`).status(201).json(item);
  });

  app.get("/items/:id", (request, response) => {
    const id = parseItemId(request.params.id);
    if (id === null) {
      response.status(400).json({ error: "id must be a positive integer" });
      return;
    }

    const item = items.get(id);
    if (item === undefined) {
      response.status(404).json({ error: "item not found" });
      return;
    }

    response.json(item);
  });

  app.put("/items/:id", (request, response) => {
    const id = parseItemId(request.params.id);
    if (id === null) {
      response.status(400).json({ error: "id must be a positive integer" });
      return;
    }

    if (!items.has(id)) {
      response.status(404).json({ error: "item not found" });
      return;
    }

    const name = parseItemName(request.body);
    if (name === null) {
      response.status(400).json({ error: "name must be a non-empty string" });
      return;
    }

    const item: Item = { id, name };
    items.set(id, item);
    response.json(item);
  });

  return app;
}
