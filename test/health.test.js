import assert from "node:assert/strict";
import { describe, it } from "node:test";

import app from "../src/app.js";
import { getHealth } from "../src/modules/health/health.service.js";

const request = async (path) => {
  const server = app.listen(0);

  try {
    const { port } = server.address();
    const response = await fetch(`http://127.0.0.1:${port}${path}`);
    const body = await response.json();

    return {
      status: response.status,
      body,
    };
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
};

describe("health module", () => {
  it("returns health details from the service", () => {
    const health = getHealth();

    assert.equal(health.status, "ok");
    assert.equal(typeof health.uptime, "number");
    assert.equal(typeof health.timestamp, "string");
    assert.ok(health.database);
  });

  it("responds to GET /health", async () => {
    const response = await request("/health");

    assert.equal(response.status, 200);
    assert.equal(response.body.success, true);
    assert.equal(response.body.data.status, "ok");
  });

  it("returns JSON for missing routes", async () => {
    const response = await request("/missing");

    assert.equal(response.status, 404);
    assert.equal(response.body.success, false);
  });
});
