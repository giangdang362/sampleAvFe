import { Stack, Typography } from "@mui/material";
import InputItemTable from "./InputItemTable";
import { Control, Path } from "react-hook-form";
import { ValuesUser } from "@/screens/usersManagement/UserDetail";

interface InputEditSaveProps {
  control: Control<ValuesUser>;
  label: string;
  name: Path<ValuesUser>;
}

const InputEditSave = ({ control, label, name }: InputEditSaveProps) => {
  return (
    <Stack
      sx={{
        flexDirection: "row",
        alignItems: "center",
        padding: "20px 12px",
        borderBottom: "1px solid #e0e0e0",
      }}
    >
      <Typography minWidth={"200px"} height={"19px"}>
        {label}
      </Typography>
      <InputItemTable
        name={name}
        control={control}
        onClick={() => {}}
        onChange={() => {}}
        // disabled={showAction}
        sx={{
          width: "100%",
          "& input": {
            padding: 0,
            fontSize: "16px",
            lineHeight: "19px",
            alignItems: "center",
          },
        }}
      />
    </Stack>
  );
};

export default InputEditSave;
