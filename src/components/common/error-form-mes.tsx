import * as React from "react";
import { FormHelperText } from "@mui/material";

interface ErrorFormMesProps {
  mes: string;
}

const ErrorFormMes: React.FC<ErrorFormMesProps> = ({
  mes,
}): React.JSX.Element => {
  return (
    <FormHelperText sx={{ color: "red", marginLeft: 2 }}>{mes}</FormHelperText>
  );
};

export default ErrorFormMes;
