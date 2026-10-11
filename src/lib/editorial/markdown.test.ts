import { test } from "node:test";
import assert from "node:assert/strict";

import { mdEscape } from "./markdown.ts";

test("mdEscape neutralizes table, link and HTML syntax in untrusted names", () => {
  assert.equal(mdEscape("Claude Haiku 5.5"), "Claude Haiku 5.5");
  assert.equal(mdEscape("Evil | [click](https://x.io) <b>"), "Evil \\| \\[click\\]\\(https://x.io\\) \\<b\\>");
  assert.equal(mdEscape("two\nlines"), "two lines");
});
