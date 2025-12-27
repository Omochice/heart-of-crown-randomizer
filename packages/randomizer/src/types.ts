/**
 * Item with id property (for filterByIds)
 *
 * This type represents any object that has a numeric id property,
 * which is the minimum requirement for using the filterByIds function.
 *
 * @example
 * ```typescript
 * type Card = Identifiable & {
 *   name: string;
 *   cost: number;
 * };
 * ```
 */
export type Identifiable = {
  id: number;
};
