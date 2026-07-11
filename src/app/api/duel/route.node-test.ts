import test from "node:test";
import assert from "node:assert/strict";

import { POST } from "./route";

test("duel vote endpoint rejects malformed JSON with 400", async () => {
  const response = await POST(
    new Request("http://localhost/api/duel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{",
    }),
  );

  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), { error: "Voto inválido" });
});

test("duel vote endpoint rejects duplicate winner and loser ids", async () => {
  const response = await POST(
    new Request("http://localhost/api/duel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        winnerId: "same-image",
        loserId: "same-image",
        mode: "category",
      }),
    }),
  );

  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), { error: "Voto inválido" });
});
