import { describe, expect, test } from "vitest";
import { dedent, dedentPlugin, dedentString } from "./index";

describe("dedentString", () => {
  test("strips common leading whitespace from multiline string", () => {
    const input = `
      hello
      world
    `;
    expect(dedentString(input)).toBe("hello\nworld");
  });

  test("preserves relative indentation", () => {
    const input = `
      parent
        child
      sibling
    `;
    expect(dedentString(input)).toBe("parent\n  child\nsibling");
  });

  test("handles empty lines within content", () => {
    const input = `
      first

      third
    `;
    expect(dedentString(input)).toBe("first\n\nthird");
  });

  test("returns empty string for whitespace-only input", () => {
    const input = `
    `;
    expect(dedentString(input)).toBe("");
  });

  test("handles single line content", () => {
    const input = `
      single line
    `;
    expect(dedentString(input)).toBe("single line");
  });

  test("handles content with no indentation", () => {
    const input = `
no indent
also no indent
    `;
    expect(dedentString(input)).toBe("no indent\nalso no indent");
  });

  test("handles tabs as indentation", () => {
    const input = `
\t\thello
\t\tworld
    `;
    expect(dedentString(input)).toBe("hello\nworld");
  });
});

describe("dedent (tagged template)", () => {
  test("dedents template literal content", () => {
    const result = dedent`
      hello
      world
    `;
    expect(result).toBe("hello\nworld");
  });
});

describe("dedentPlugin", () => {
  test("returns a plugin with name 'dedent'", () => {
    const plugin = dedentPlugin();
    expect(plugin.name).toBe("dedent");
  });

  test("transform replaces dedent tagged templates with plain strings", () => {
    const plugin = dedentPlugin();
    const transform =
      typeof plugin.transform === "function"
        ? plugin.transform
        : plugin.transform?.handler;

    const code = `const s = dedent\`
      hello
      world
    \`;`;

    const result = transform?.call({} as never, code, "test.ts") as {
      code: string;
    } | null;

    expect(result).not.toBeNull();
    expect(result?.code).toContain('"hello\\nworld"');
    expect(result?.code).not.toContain("dedent`");
  });

  test("returns null when no dedent tags are found", () => {
    const plugin = dedentPlugin();
    const transform =
      typeof plugin.transform === "function"
        ? plugin.transform
        : plugin.transform?.handler;

    const result = transform?.call(
      {} as never,
      'const s = "plain string";',
      "test.ts",
    );

    expect(result).toBeNull();
  });

  test("handles multiple dedent tags in one file", () => {
    const plugin = dedentPlugin();
    const transform =
      typeof plugin.transform === "function"
        ? plugin.transform
        : plugin.transform?.handler;

    const code = `const a = dedent\`
      first
    \`;
const b = dedent\`
      second
    \`;`;

    const result = transform?.call({} as never, code, "test.ts") as {
      code: string;
    } | null;

    expect(result).not.toBeNull();
    expect(result?.code).toContain('"first"');
    expect(result?.code).toContain('"second"');
  });

  test("properly escapes quotes in content", () => {
    const plugin = dedentPlugin();
    const transform =
      typeof plugin.transform === "function"
        ? plugin.transform
        : plugin.transform?.handler;

    const code = `const s = dedent\`
      say "hello"
    \`;`;

    const result = transform?.call({} as never, code, "test.ts") as {
      code: string;
    } | null;

    expect(result).not.toBeNull();
    expect(result?.code).toContain('say \\"hello\\"');
  });
});
