import type { Plugin } from "rolldown";

/**
 * Strips common leading whitespace from a multiline string.
 * The first and last lines are trimmed if they contain only whitespace.
 */
export function dedentString(raw: string): string {
  const lines = raw.split("\n");

  // Drop leading empty line (from opening backtick)
  if (lines.length > 0 && lines[0].trim() === "") {
    lines.shift();
  }
  // Drop trailing empty line (from closing backtick)
  if (lines.length > 0 && lines[lines.length - 1].trim() === "") {
    lines.pop();
  }

  const nonEmptyLines = lines.filter((line) => line.trim().length > 0);
  if (nonEmptyLines.length === 0) {
    return "";
  }

  const minIndent = Math.min(
    ...nonEmptyLines.map((line) => {
      const match = line.match(/^(\s*)/);
      return match ? match[1].length : 0;
    }),
  );

  return lines.map((line) => line.slice(minIndent)).join("\n");
}

/**
 * Tagged template literal function for dedenting multiline strings.
 * At build time, the rolldown plugin replaces this with a plain string.
 * This runtime implementation serves as a fallback for type-checking and dev.
 */
export function dedent(
  strings: TemplateStringsArray,
  ..._values: never[]
): string {
  return dedentString(strings[0]);
}

/**
 * Rolldown plugin that transforms `dedent` tagged template literals
 * into plain string literals at build time.
 */
export function dedentPlugin(): Plugin {
  return {
    name: "dedent",
    transform: {
      filter: {
        id: {
          include: [/\.ts$/],
        },
      },
      handler(code) {
        if (!code.includes("dedent`")) {
          return null;
        }

        const transformed = code.replace(
          /dedent`([\s\S]*?)`/g,
          (_match, content: string) => {
            const dedented = dedentString(content);
            const escaped = dedented
              .replace(/\\/g, "\\\\")
              .replace(/"/g, '\\"')
              .replace(/\n/g, "\\n");
            return `"${escaped}"`;
          },
        );

        if (transformed === code) {
          return null;
        }

        return { code: transformed };
      },
    },
  };
}
