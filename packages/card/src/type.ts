import { type PredicateType, is } from "unknownutil";

const isMainType = is.LiteralOneOf([
  /** プリンセス */
  "princess",
  /** 領地 */
  "wisdom",
  /** 継承権 */
  "succession",
  /** 災い */
  "disaster",
  /** 行動 */
  "action",
  /** 攻撃 */
  "attack",
] as const);
export type MainType = PredicateType<typeof isMainType>;

const isSubType = is.LiteralOneOf([
  /** 侍女 */
  "handmaiden",
  /** 兵力 */
  "millitary",
  /** 魔法 */
  "magic",
  /** 商人 */
  "merchant",
  /** 計略 */
  "plot",
] as const);
export type SubType = PredicateType<typeof isSubType>;

const Edition = {
  BASIC: 0,
  FAR_EASTERN_BORDER: 1,
} as const;
const isEdition = is.LiteralOneOf(Object.values(Edition));
type Edition = PredicateType<typeof isEdition>;

export const isPrincess = is.ObjectOf({
  type: is.LiteralOf("princess"),
  name: is.String,
  mainType: is.LiteralOf("princess"),
  cost: is.LiteralOf(6),
  succession: is.Number,
  effect: is.String,
  edition: isEdition,
});

export type Princess = PredicateType<typeof isPrincess>;

const cardBase = {
  name: is.String,
  mainType: is.ArrayOf(isMainType),
  subType: is.OptionalOf(isSubType),
  cost: is.Number,
  link: is.LiteralOneOf([0, 1, 2] as const),
  effect: is.String,
};

export const isCommonCard = is.UnionOf([
  is.ObjectOf({
    type: is.LiteralOf("common"),
    ...cardBase,
    edition: isEdition,
  }),
  is.ObjectOf({
    type: is.LiteralOf("common"),
    name: is.String,
    cards: is.ArrayOf(is.ObjectOf(cardBase)),
    edition: isEdition,
  }),
]);

export type CommonCard = PredicateType<typeof isCommonCard>;

export const isBasicCard = is.ObjectOf({
  type: is.LiteralOf("basic"),
  ...cardBase,
  edition: isEdition,
});

export type BasicCard = PredicateType<typeof isBasicCard>;

export const isRareCard = is.ObjectOf({
  type: is.LiteralOf("rare"),
  ...cardBase,
  edition: isEdition,
});

export type RareCard = PredicateType<typeof isRareCard>;
