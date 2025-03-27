import Image from "next/image";
import { ButtonBase } from "@mui/material";

interface OptionButtonProps {
  value: string;
  label: string;
  imgSrc: string;
  checked?: boolean;
  onChange?: (value: string) => void;
  imgAlt?: string;
}

const OptionButton: React.FC<OptionButtonProps> = ({
  value,
  label,
  imgSrc,
  checked,
  onChange,
  imgAlt,
}) => {
  return (
    <ButtonBase
      component="label"
      sx={(style) => ({
        px: `calc(${style.spacing(3)} + ${checked ? 0 : 1}px)`,
        py: `calc(${style.spacing(2)} + ${checked ? 0 : 1}px)`,
        border: `${checked ? 2 : 1}px solid var(--mui-palette-primary-main)`,
        borderRadius: 1.5,
        justifyContent: "flex-start",
        fontWeight: 500,
        boxShadow: checked ? "0px 0px 8px 3px rgba(0, 0, 0, 0.1)" : undefined,
        opacity: checked ? 1 : 0.5,
      })}
    >
      <input
        type="checkbox"
        value={value}
        style={{ display: "none" }}
        checked={checked}
        onChange={() => onChange?.(value)}
      />

      <Image
        src={imgSrc}
        width={40}
        height={40}
        alt={imgAlt ?? ""}
        style={{ marginRight: 24 }}
      />
      {label}
    </ButtonBase>
  );
};

export default OptionButton;
