"use client";

import * as React from "react";
import Box from "@mui/material/Box";
import { useColorScheme } from "@mui/material/styles";
import { NoSsr } from "@mui/material";

const HEIGHT = 60;
const WIDTH = 60;

type Color = "dark" | "light";

export interface LogoProps {
  color?: Color;
  emblem?: boolean;
  height?: number;
  width?: number;
}

export function Logo({
  color: _color = "dark",
  emblem,
  height = HEIGHT,
  width = WIDTH,
}: LogoProps): React.JSX.Element {
  let url: string;

  if (emblem) {
    url = "logo.svg";
  } else {
    url = "logo-header.png";
  }

  return (
    <Box alt="logo" component="img" height={height} src={url} width={width} />
  );
}

export interface DynamicLogoProps {
  colorDark?: Color;
  colorLight?: Color;
  emblem?: boolean;
  height?: number;
  width?: number;
}

export function DynamicLogo({
  colorDark = "light",
  colorLight = "dark",
  height = HEIGHT,
  width = WIDTH,
  ...props
}: DynamicLogoProps): React.JSX.Element {
  const { colorScheme } = useColorScheme();
  const color = colorScheme === "dark" ? colorDark : colorLight;

  return (
    <NoSsr
      fallback={<Box sx={{ height: `${height}px`, width: `${width}px` }} />}
    >
      <Logo color={color} height={height} width={width} {...props} />
    </NoSsr>
  );
}
