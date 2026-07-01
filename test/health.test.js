import assert from "node:assert/strict";
import { describe, it } from "node:test";

import notFoundMiddleware from "../src/middlewares/notFound.middleware.js";
import { healthCheck } from "../src/modules/health/health.controller.js";
import { getHealth } from "../src/modules/health/health.service.js";

const createResponse = () => {
  return {
    statusCode: null,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
  };
};

describe("health module", () => {
  it("returns health details from the service", () => {
    const health = getHealth();

    assert.equal(health.status, "ok");
    assert.equal(typeof health.uptime, "number");
    assert.equal(typeof health.timestamp, "string");
    assert.ok(health.database);
  });

  it("responds through the health controller", async () => {
    const res = createResponse();

    await healthCheck({}, res, (error) => {
      throw error;
    });

    assert.equal(res.statusCode, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.status, "ok");
  });

  it("returns JSON for missing routes", () => {
    const req = {
      method: "GET",
      originalUrl: "/missing",
    };
    const res = createResponse();

    notFoundMiddleware(req, res);

    assert.equal(res.statusCode, 404);
    assert.equal(res.body.success, false);
  });
});
