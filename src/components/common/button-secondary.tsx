import * as React from "react";
import { Button, ButtonProps } from "@mui/material";
import { SxProps } from "@mui/system";

interface ButtonSecondaryProps extends ButtonProps {
  title?: string;
  sx?: SxProps;
}

const ButtonSecondary: React.FC<ButtonSecondaryProps> = ({
  title,
  ...rest
}): React.JSX.Element => {
  return (
    <Button variant="outlined" {...rest}>
      {title}
    </Button>
  );
};

export default ButtonSecondary;
