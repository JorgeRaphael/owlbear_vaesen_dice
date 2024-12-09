import { DiceStyle } from "../types/DiceStyle";
import { MyzbaseMaterial } from "./myzbase/MyzbaseMaterial";
import { MyzgearMaterial } from "./myzgear/MyzgearMaterial";
import { MyzskillMaterial } from "./myzskill/MyzskillMaterial";

export function DiceMaterial({ diceStyle }: { diceStyle: DiceStyle }) {
  switch (diceStyle) {
    case "MYZBASE":
      return <MyzbaseMaterial />;
    case "MYZGEAR":
      return <MyzgearMaterial />;
    case "MYZSKILL":
      return <MyzskillMaterial />;
    default:
      throw Error(`Dice style ${diceStyle} error: not implemented`);
  }
}
