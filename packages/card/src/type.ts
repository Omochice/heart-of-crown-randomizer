export type MainType =
  /** プリンセス */
  | "princess"
  /** 領地 */
  | "territory"
  /** 継承権 */
  | "succession"
  /** 災い */
  | "disaster"
  /** 行動 */
  | "action"
  /** 攻撃 */
  | "attack";

export type SubType =
  /** 侍女 */
  | "maid"
  /** 兵力 */
  | "millitary"
  /** 魔法 */
  | "magic"
  /** 商人 */
  | "merchant"
  /** 計略 */
  | "plot";

export const Edition = {
  BASIC: 0,
  FAR_EASTERN_BORDER: 1,
} as const;
export type Edition = (typeof Edition)[keyof typeof Edition];

export type Princess = {
  id: number;
  type: "princess";
  name: string;
  mainType: "princess";
  cost: 6;
  succession: number;
  effect: string;
  edition: Edition;
};

type CardBase = {
  name: string;
  mainType: MainType[];
  subType?: SubType;
  succession?: number;
  coin?: number;
  cost: number;
  link: 0 | 1 | 2;
  effect: string;
};

export type DuplicateCard = CardBase & {
  id: number;
  type: "common";
  hasChild: false;
  edition: Edition;
};

export type UniqueCard = {
  id: number;
  type: "common";
  name: string;
  cards: CardBase[];
  cost: number;
  hasChild: true;
  edition: Edition;
};

export type CommonCard = DuplicateCard | UniqueCard;

export type BasicCard = CardBase & {
  id: number;
  type: "basic";
  edition: Edition;
};

export type RareCard = CardBase & {
  id: number;
  type: "rare";
  edition: Edition;
};
