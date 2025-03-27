import * as React from "react";
import { SelectChangeEvent, Typography } from "@mui/material";
import Grid2 from "@mui/material/Unstable_Grid2";
import EditableTypography from "@/components/common/app-edit-inline";
import EditableDropDow from "@/components/common/app-edit-dropdow";

export type PdDetailProps = {
  name: string;
  suffixValue?: string;
  data?: string | number | React.ReactNode;
  maxLength?: number;
  typeInput?: string;
  disabled?: boolean;
} & (
  | {
      type?: "input";
      onChange: (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
      ) => void;
    }
  | {
      type?: "dropDow";
      onChangeDropDow: (e: SelectChangeEvent) => void;
      dataDropDow: API.SlugItem[];
      isGroupView?: boolean;
    }
);

export function PdDetailRow(Props: PdDetailProps): React.JSX.Element {
  if (Props.type === "dropDow") {
  }

  return (
    <Grid2
      container
      columns={16}
      rowSpacing={{ md: 4 }}
      sx={{ alignItems: "center" }}
    >
      <Grid2 xs={4}>
        <Typography sx={{ color: "GrayText", marginRight: "" }} variant="body2">
          {Props.name}
        </Typography>
      </Grid2>
      <Grid2 xs={12}>
        {typeof Props.data === "string" || typeof Props.data === "number" ? (
          Props.type === "input" ? (
            <EditableTypography
              enabled={!Props.disabled}
              value={Props.data ?? ""}
              placeholder={Props.data ? "" : "..."}
              onChangeText={Props.onChange}
              suffixValue={Props.suffixValue}
              maxLength={Props.maxLength}
              typeInput={Props.typeInput}
              sx={{
                width: "100%",
                "&:hover": {
                  boxShadow: "0 0 0 0.5px #c4c4c4",
                },
                borderRadius: "2px",
              }}
            />
          ) : Props.type === "dropDow" && typeof Props.data !== "number" ? (
            <EditableDropDow
              enabled={!Props.disabled}
              dataDropDow={Props.dataDropDow}
              value={Props.data}
              onChangeDropDow={Props.onChangeDropDow}
              isGroupView={Props.isGroupView}
              sx={{
                width: "100%",
                "&:hover": {
                  boxShadow: "0 0 0 0.5px #c4c4c4",
                },
                borderRadius: "2px",
              }}
            />
          ) : null
        ) : (
          Props.data
        )}
      </Grid2>
    </Grid2>
  );
}
