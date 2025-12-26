/**
 * Item with id property (for filterByIds)
 *
 * This interface represents any object that has a numeric id property,
 * which is the minimum requirement for using the filterByIds function.
 *
 * @example
 * ```typescript
 * interface Card extends Identifiable {
 *   id: number;
 *   name: string;
 *   cost: number;
 * }
 * ```
 */
export interface Identifiable {
  id: number;
}
