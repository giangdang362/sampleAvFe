import { faImage } from "@/lib/fas/pro-light-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Box, BoxProps } from "@mui/material";
import { forwardRef } from "react";

interface ImageDefaultProps extends BoxProps {
  isBorderRadiusCircle?: boolean;
  fontSizeIcon?: string;
}

const ImageDefault = forwardRef<unknown, ImageDefaultProps>(
  ({ isBorderRadiusCircle, fontSizeIcon, ...rest }, ref) => {
    return (
      <Box
        ref={ref}
        display="flex"
        alignItems="center"
        justifyContent="center"
        borderRadius={isBorderRadiusCircle ? "99999px" : "0px"}
        bgcolor="#E7E7E9"
        width="46px"
        height="46px"
        {...rest}
      >
        <FontAwesomeIcon
          color={"#b4b4b4"}
          icon={faImage}
          style={{ fontSize: fontSizeIcon ?? "24px" }}
        />
      </Box>
    );
  },
);
ImageDefault.displayName = "ImageDefault";

export default ImageDefault;
