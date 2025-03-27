import { Box } from "@mui/material";

type ProgressBarProp = {
  green: number;
  yellow: number;
  red: number;
};

const ProgressBar = ({ green, yellow, red }: ProgressBarProp) => {
  return (
    <Box
      sx={{
        display: "flex",
        height: "8px",
        borderRadius: "6px",
        overflow: "hidden",
        bgcolor: "red",
      }}
    >
      <Box
        sx={{
          flex: `0 0 ${green}%`,
          bgcolor: "#2E7D32",
        }}
      />
      <Box
        sx={{
          flex: `0 0 ${yellow}%`,
          bgcolor: "#F99D31",
        }}
      />
      <Box
        sx={{
          flex: `0 0 ${red}%`,
          bgcolor: "#D32F2F",
        }}
      />
    </Box>
  );
};

export default ProgressBar;
