import { Typography, TypographyProps } from "@mui/material";

function MessageLine(props: TypographyProps) {
  return (
    <Typography
      {...props}
      sx={[
        {
          textAlign: "center",
          px: 2,
        },
        ...(Array.isArray(props.sx) ? props.sx : [props.sx]),
      ]}
    />
  );
}

export default MessageLine;
