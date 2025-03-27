import { Box, Stack, StackProps, SxProps } from "@mui/material";
import { ChangeEvent, FC, ReactNode, useState } from "react";

interface InputItemProps extends StackProps {
  iconElement?: ReactNode;
  value: string;
  setValueChange: (x: string) => void;
  sx?: SxProps;
}

const InputItem: FC<InputItemProps> = ({
  iconElement,
  value,
  setValueChange,
  sx,
  ...rest
}) => {
  const [valueInput, setValueInput] = useState<string>(value);
  const handleOnchange = (
    e: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>,
  ) => {
    setValueInput(e.target.value);
    setValueChange(e.target.value);
  };

  return (
    <Stack
      flexDirection={"row"}
      gap={"8px"}
      alignItems={"center"}
      sx={{
        ...sx,
      }}
      {...rest}
    >
      {iconElement}
      <Box
        component={"input"}
        value={valueInput}
        onChange={(e) => handleOnchange(e)}
        placeholder={valueInput ? "" : "Empty..."}
        sx={{
          border: "none",
          "&:focus-visible": {
            outline: "none",
          },
          padding: "2px",
        }}
      ></Box>
    </Stack>
  );
};

export default InputItem;
