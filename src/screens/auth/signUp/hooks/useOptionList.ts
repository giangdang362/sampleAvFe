import {
  Control,
  FieldPath,
  FieldValues,
  PathValue,
  useController,
} from "react-hook-form";

export const useOptionList = <
  T extends FieldValues,
  P extends FieldPath<T>,
  Name = PathValue<T, P>,
>({
  name,
  control,
}: {
  name: P;
  control: Control<T>;
}) => {
  const {
    field: { value, onChange },
    fieldState: { error },
  } = useController({
    name,
    control,
  });

  const handleChange = (option: string) => {
    if (!Array.isArray(value)) return;

    const newValue = value ? [...value] : [];
    const index = newValue.findIndex((item) => item === option);

    if (index === -1) {
      newValue.push(option);
    } else {
      newValue.splice(index, 1);
    }

    onChange(newValue);
  };

  const checkSelected = (
    option: string,
  ): Name extends string[] ? boolean : never => {
    if (Array.isArray(value)) {
      if (value.length && typeof value[0] === "string") {
        return !!value.some((item: string) => item === option) as any;
      }

      return false as any;
    }

    return undefined as never;
  };

  return { selected: checkSelected, onChange: handleChange, error };
};
