import { faChevronRight } from "@/lib/fas/pro-regular-svg-icons";
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { BoxProps, Box, Stack, Typography } from "@mui/material";

interface ItemRowRenderProp extends BoxProps {
  icon?: IconProp;
  name?: string;
  isForwardIcon?: boolean;
}

const ItemRowRender = ({
  icon,
  name,
  isForwardIcon = true,
  ...rest
}: ItemRowRenderProp) => {
  return (
    <Box {...rest}>
      <Stack
        sx={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box
          sx={{
            flexDirection: "row",
            alignItems: "center",
            display: "flex",
            minWidth: 0,
          }}
        >
          {icon && (
            <FontAwesomeIcon
              style={{
                fontSize: "20px",
                color: "#00000061",
                marginRight: "8px",
              }}
              icon={icon}
            />
          )}

          <Typography variant="subtitle2" noWrap pr={"20px"}>
            {name ?? ""}
          </Typography>
        </Box>
        {isForwardIcon && (
          <FontAwesomeIcon
            style={{ fontSize: "16px", color: "#00000061" }}
            icon={faChevronRight}
          />
        )}
      </Stack>
    </Box>
  );
};
export default ItemRowRender;
