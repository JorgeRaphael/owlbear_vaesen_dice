import { DiceSet } from "../types/DiceSet";
import { DiceStyle } from "../types/DiceStyle";
import { Die } from "../types/Die";

import * as myzbasePreviews from "../previews/myzbase";
import * as myzskillPreviews from "../previews/myzskill";
import * as myzgearPreviews from "../previews/myzgear";

import allPreview from "../previews/all.png";

const standardPreviews: Record<DiceStyle, string> = {
  MYZBASE: myzbasePreviews.D6,
  MYZSKILL: myzskillPreviews.D6,
  MYZGEAR: myzgearPreviews.D6,
};

function createStandardSet(style: DiceStyle): DiceSet {
  const id = `${style}_STANDARD`;
  return {
    id,
    name: `${style.toLowerCase()} dice`,
    dice: [
      { id: `${id}_D6`, type: "D6", style },
    ],
    previewImage: standardPreviews[style],
  };
}

const standardSets = [

  createStandardSet ("MYZBASE"),
  createStandardSet ("MYZSKILL"),
  createStandardSet ("MYZGEAR"),
];

const allSet: DiceSet = {
  id: "all",
  name: "all",
  dice: standardSets.reduce(
    (prev, curr) => [...prev, ...curr.dice],
    [] as Die[]
  ),
  previewImage: allPreview,
};

export const diceSets: DiceSet[] = [...standardSets, allSet];
