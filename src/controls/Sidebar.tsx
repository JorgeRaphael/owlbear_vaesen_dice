import Stack from "@mui/material/Stack";
import Divider from "@mui/material/Divider";

import { DiceSetPicker } from "./DiceSetPicker";
import { DicePicker } from "./DicePicker";
import { DiceExtras } from "./DiceExtras";

export function Sidebar() {
  return (
    <Stack
      maxHeight="100vh"
      width="60px"
      minWidth="60px"
      sx={{ overflowY: "auto", overflowX: "hidden" }}
    >
      <Stack p={1} gap={1} alignItems="center">
        <DiceSetPicker />
        <Divider flexItem sx={{ mx: 1 }} />
        <DicePicker />
        <Divider flexItem sx={{ mx: 1 }} />
        <DiceExtras />
      </Stack>
    </Stack>
  );
}
