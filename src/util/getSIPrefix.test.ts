import * as assert from "node:assert";
import { describe, test } from "node:test";
import { getSIPrefix } from "./getSIPrefix.ts";

describe(getSIPrefix.name, () => {
  test("throw InvalidValue", () => {
    assert.throws(() => getSIPrefix(Number.POSITIVE_INFINITY), {
      message: "InvalidValue",
    });
  });

  const cases: Array<[number, string]> = [
    [0.001, "1.0m"],
    [0.999, "999.0m"],
    [0, "0.0"],
    [1, "1.0"],
    [999, "999.0"],
    [1000, "1.0k"],
    [999000, "999.0k"],
    [1000000, "1.0M"],
  ];

  for (const [input, expected] of cases) {
    test(`${input} => ${expected}`, () => {
      const [v, p] = getSIPrefix(input);
      const actual = `${v.toFixed(1)}${p.symbol}`;
      assert.strictEqual(actual, expected);
    });
  }
});
