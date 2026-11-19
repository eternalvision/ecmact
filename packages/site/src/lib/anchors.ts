import { slugify } from '@site/lib/dom';

/**
 * Gives every heading of a page the id of its anchor: the slug of its text, and for a text that repeats the slug
 * with `-2`, `-3` and so on. A heading without Latin letters gets `section`, the same way. These ids are the
 * addresses that readers have bookmarked, so the rule must not change.
 *
 * @param texts - The texts of the headings, in the order of the page.
 * @returns One id per heading.
 */
export const anchorIds = (texts: string[]): string[] => {
  const used = new Set<string>();
  return texts.map((text) => {
    const base = slugify(text) || 'section';
    let id = base;
    for (let n = 2; used.has(id); n++) id = `${base}-${n}`;
    used.add(id);
    return id;
  });
};

/**
 * Chooses the extra ids a heading answers to. An alias that is the id of any heading of the page, or that an earlier
 * heading already has, is dropped, so an alias never takes an address that something else owns.
 *
 * @param ids - The ids of the headings, from `anchorIds`.
 * @param declared - The aliases each heading asks for, in the same order.
 * @returns The aliases each heading gets.
 */
export const headingAliases = (ids: string[], declared: (string[] | undefined)[]): string[][] => {
  const taken = new Set(ids);
  return declared.map((aliases = []) =>
    aliases.filter((alias) => {
      if (taken.has(alias)) return false;
      taken.add(alias);
      return true;
    }),
  );
};
