import { TextField, TextFieldProps, TextFieldVariants } from "@mui/material";
import { FC, useEffect, useImperativeHandle, useState } from "react";

export type UserTextFieldProps<
  Variant extends TextFieldVariants = TextFieldVariants,
> = TextFieldProps<Variant> & {
  hideAsteriskWhenShrink?: boolean;
  startAdornmentWidth?: number | string;
};

const UserTextField: FC<UserTextFieldProps> = ({
  hideAsteriskWhenShrink,
  startAdornmentWidth = "1rem",
  onChange,
  onFocus,
  onBlur,
  InputLabelProps,
  InputProps,
  defaultValue,
  value,
  ...rest
}) => {
  const [focused, setFocused] = useState(false);
  const [isCurrentValueEmpty, setIsCurrentValueEmpty] = useState(
    value !== undefined ? !value : !defaultValue,
  );

  const [inputLabelRef, setInputLabelRef] = useState<HTMLLabelElement | null>(
    null,
  );

  const haveStartAdornment = !!InputProps?.startAdornment;

  useImperativeHandle(
    InputLabelProps?.ref,
    () => inputLabelRef as HTMLLabelElement,
    [inputLabelRef],
  );

  useEffect(() => {
    // Patches missing transitions of input label when startAdornment exists
    if (inputLabelRef) {
      const inputLabelTransitions =
        window.getComputedStyle(inputLabelRef).transition;
      inputLabelRef.style.transition = integrateTransition(
        inputLabelTransitions,
        "left",
        "opacity",
      );
    }
  }, [inputLabelRef]);

  useEffect(() => {
    setIsCurrentValueEmpty(value !== undefined ? !value : !defaultValue);
  }, [defaultValue, value]);

  useEffect(() => {
    return () => {
      setIsCurrentValueEmpty(true);
    };
  }, []);

  return (
    <TextField
      {...rest}
      value={value}
      defaultValue={defaultValue}
      InputProps={InputProps}
      InputLabelProps={{
        shrink: focused || !isCurrentValueEmpty,
        ...InputLabelProps,
        ref: setInputLabelRef,
        sx: [
          haveStartAdornment
            ? {
                left:
                  focused || !isCurrentValueEmpty
                    ? 0
                    : `calc(${typeof startAdornmentWidth === "number" ? `${startAdornmentWidth}px` : startAdornmentWidth} + 8px)`,
              }
            : undefined,
          hideAsteriskWhenShrink
            ? {
                "& .MuiFormLabel-asterisk": {
                  transition: "inherit",
                  opacity: focused || !isCurrentValueEmpty ? 1 : 0,
                },
              }
            : undefined,
          ...(Array.isArray(InputLabelProps?.sx)
            ? InputLabelProps?.sx
            : [InputLabelProps?.sx]),
        ],
      }}
      onChange={(e) => {
        setIsCurrentValueEmpty(!e.target.value);
        return onChange?.(e);
      }}
      onFocus={(e) => {
        setFocused(true);
        return onFocus?.(e);
      }}
      onBlur={(e) => {
        setFocused(false);
        return onBlur?.(e);
      }}
    />
  );
};

export default UserTextField;

function integrateTransition(
  originalTransition: string,
  ...newTransitions: string[]
): string {
  let firstInputLabelTransition = "";
  const specialTimingFuncRegex = /(?:cubic-bezier|steps)\([^)]+\)/g;
  const specialTimingFuncs = originalTransition.match(specialTimingFuncRegex);
  if (specialTimingFuncs?.length) {
    const others = originalTransition.split(specialTimingFuncRegex);

    firstInputLabelTransition =
      others[0] + specialTimingFuncs[0] + others[1]?.split(",")[0];
  } else {
    firstInputLabelTransition = originalTransition.split(",")[0];
  }

  if (firstInputLabelTransition) {
    const transitionProps = firstInputLabelTransition
      .split(" ")
      ?.filter((_, i) => i !== 0)
      .join(" ");

    return (
      originalTransition +
      newTransitions
        ?.map((transition) => `,${transition} ${transitionProps}`)
        .join("")
    );
  }

  return originalTransition;
}
