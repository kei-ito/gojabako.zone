type ClassNameEntry = Array<ClassNameEntry> | string | false | null | undefined;

export const classnames = (...args: Array<ClassNameEntry>) =>
  [...list(args)].join(" ");

const list = function* (entries: Array<ClassNameEntry>): Generator<string> {
  for (const entry of entries) {
    if (Array.isArray(entry)) {
      yield* list(entry);
    } else if (typeof entry === "string") {
      for (const className of entry.split(/\s+/)) {
        if (className) {
          yield className;
        }
      }
    }
  }
};

export const IconClass = "material-symbols-rounded";
