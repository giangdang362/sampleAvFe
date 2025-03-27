import { DetailedHTMLProps, HTMLAttributes } from "react";

const RequiredAsterisk = (
  props: DetailedHTMLProps<HTMLAttributes<HTMLSpanElement>, HTMLSpanElement>,
) => {
  return (
    <span
      aria-hidden
      {...props}
      style={{ color: "var(--mui-palette-error-main)", ...props?.style }}
    >
      {" "}
      *
    </span>
  );
};

export default RequiredAsterisk;
