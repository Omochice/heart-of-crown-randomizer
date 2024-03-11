import type { CommonCard } from "@heart-of-crown-randomizer/card/type";

export type Rule = {
  description: string;
  expr: (cards: CommonCard[]) => boolean;
};
