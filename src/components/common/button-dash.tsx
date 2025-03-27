import * as React from "react";
import { Button, ButtonProps } from "@mui/material";
import { SxProps } from "@mui/system";

interface ButtonDashedProps extends ButtonProps {
  label?: string;
  sx?: SxProps;
}

const ButtonDashed: React.FC<ButtonDashedProps> = ({
  label,
  sx,
  ...rest
}): React.JSX.Element => {
  return (
    <Button
      variant="outlined"
      sx={{
        borderWidth: "1px",
        borderStyle: "dashed",
        borderRadius: "4px",
        height: "36px",
        ...sx,
      }}
      {...rest}
    >
      {label}
    </Button>
  );
};

export default ButtonDashed;
