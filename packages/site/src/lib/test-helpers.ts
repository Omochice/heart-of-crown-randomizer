import type { CommonCard } from "@heart-of-crown-randomizer/card/type";

export function makeCard(id: number, edition: 0 | 1 = 0): CommonCard {
  return {
    id,
    type: "common",
    name: `Card ${id}`,
    mainType: ["action"],
    cost: id,
    link: 1,
    effect: "",
    hasChild: false,
    edition,
  } as CommonCard;
}
