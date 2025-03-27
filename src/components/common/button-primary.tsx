import * as React from "react";
import { Button, ButtonProps } from "@mui/material";
import { SxProps } from "@mui/system";

interface ButtonPrimaryProps extends ButtonProps {
  label?: string;
  sx?: SxProps;
  ref?: any;
}

const ButtonPrimary: React.FC<ButtonPrimaryProps> = ({
  label,
  ref,
  ...rest
}): React.JSX.Element => {
  return (
    <Button ref={ref} variant="contained" {...rest}>
      {label}
    </Button>
  );
};

export default ButtonPrimary;
