import { useState } from "react";

import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Stack from "@mui/material/Stack";
import Menu from "@mui/material/Menu";

import HiddenOnIcon from "@mui/icons-material/VisibilityOffRounded";
import HiddenOffIcon from "@mui/icons-material/VisibilityRounded";
import MoreIcon from "@mui/icons-material/MoreHorizRounded";

import { DieBonus } from "./DieBonus";
import { DieAdvantage } from "./DieAdvantage";
import { useDiceControlsStore } from "./store";
import { useDiceRollStore } from "../dice/store";

export function DiceExtras() {
  const hidden = useDiceControlsStore((state) => state.diceHidden);
  const toggleDiceHidden = useDiceControlsStore(
    (state) => state.toggleDiceHidden
  );
  const bonus = useDiceControlsStore((state) => state.diceBonus);
  const setBonus = useDiceControlsStore((state) => state.setDiceBonus);
  const advantage = useDiceControlsStore((state) => state.diceAdvantage);
  const setAdvantage = useDiceControlsStore((state) => state.setDiceAdvantage);

  const clearRoll = useDiceRollStore((state) => state.clearRoll);
  const roll = useDiceRollStore((state) => state.roll);
  function clearRollIfNeeded() {
    if (roll) {
      clearRoll();
    }
  }

  /** Controls (bonus and adv/dis) */
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  function handleClick(event: React.MouseEvent<HTMLButtonElement>) {
    setAnchorEl(event.currentTarget);
  }
  function handleClose() {
    setAnchorEl(null);
  }

  return (
    <>
      <Tooltip
        title={hidden ? "Show Roll" : "Hide Roll"}
        placement="top"
        disableInteractive
      >
        <IconButton onClick={toggleDiceHidden}>
          {hidden ? <HiddenOnIcon /> : <HiddenOffIcon />}
        </IconButton>
      </Tooltip>
      <IconButton
        aria-label="more"
        id="more-button"
        aria-controls={open ? "more-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
        onClick={handleClick}
      >
        <MoreIcon />
      </IconButton>
      <Menu
        id="more-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          "aria-labelledby": "more-button",
        }}
        anchorOrigin={{
          vertical: "center",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "center",
          horizontal: "left",
        }}
      >
        <Stack>
          <DieBonus
            bonus={bonus}
            onChange={(bonus) => {
              setBonus(bonus);
              clearRollIfNeeded();
            }}
            onIncrease={() => {
              setBonus(bonus + 1);
              clearRollIfNeeded();
            }}
            onDecrease={() => {
              setBonus(bonus - 1);
              clearRollIfNeeded();
            }}
          />
          <Divider variant="middle" />
          <DieAdvantage
            advantage={advantage}
            onChange={(advantage) => {
              setAdvantage(advantage);
              clearRollIfNeeded();
            }}
          />
        </Stack>
      </Menu>
    </>
  );
}
