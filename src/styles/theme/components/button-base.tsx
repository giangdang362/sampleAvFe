import type { Components } from "@mui/material/styles";

import type { Theme } from "../types";
import { Link } from "@/i18n";

export const MuiButtonBase = {
  defaultProps: { LinkComponent: Link },
} satisfies Components<Theme>["MuiButtonBase"];
