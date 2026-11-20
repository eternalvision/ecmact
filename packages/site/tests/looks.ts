import { styleAxes, type DemoStyle, type StyleAxis } from '@site/demos/index';

/** The six axes of a look, in the order of the style matrix. */
export const axes = Object.keys(styleAxes) as StyleAxis[];

/**
 * Finds the pairs of looks that share more than two values.
 *
 * @param looks - The looks, by the id of the piece.
 * @returns The pairs that are too alike, with what they share.
 */
export const tooAlike = (looks: Record<string, DemoStyle>) => {
  const ids = Object.keys(looks);
  return ids.flatMap((a, index) =>
    ids.slice(index + 1).flatMap((b) => {
      const same = axes.filter((axis) => looks[a]![axis] === looks[b]![axis]);
      return same.length > 2 ? [`${a} and ${b} share ${same.join(', ')}`] : [];
    }),
  );
};

/**
 * Counts the pieces that use a value, and says which limit of the matrix a count breaks.
 *
 * @param looks - The looks, by the id of the piece.
 * @param dark - The ids of the pieces whose stage is dark.
 * @param labels - The ids of the pieces that set small uppercase labels in a monospace face.
 * @returns The limits that are broken.
 */
export const overLimits = (
  looks: Record<string, DemoStyle>,
  dark: string[],
  labels: string[] = [],
) => {
  const all = Object.values(looks);
  const broken: string[] = [];
  if (all.filter((look) => look.shape === 'sharp').length > 2) broken.push('sharp corners');
  if (dark.length > 5) broken.push('dark stages');
  if (all.filter((look) => look.type === 'mono').length > 2) broken.push('monospace');
  if (labels.length > 2) broken.push('uppercase monospace labels');
  return broken;
};
