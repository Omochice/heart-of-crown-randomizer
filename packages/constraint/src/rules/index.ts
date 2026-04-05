import type { Constraint } from "../type";
import { eachCost2to5 } from "./each-cost-2-to-5";
import { highCostGte2 } from "./high-cost-gte-2";
import { link2Gte3 } from "./link2-gte-3";
import { link2GteLink0 } from "./link2-gte-link0";
import { noAttack } from "./no-attack";

export { eachCost2to5 } from "./each-cost-2-to-5";
export { highCostGte2 } from "./high-cost-gte-2";
export { link2Gte3 } from "./link2-gte-3";
export { link2GteLink0 } from "./link2-gte-link0";
export { noAttack } from "./no-attack";

export const allConstraints: readonly Constraint[] = [
  noAttack,
  link2GteLink0,
  link2Gte3,
  highCostGte2,
  eachCost2to5,
].sort((a, b) => a.id - b.id);
