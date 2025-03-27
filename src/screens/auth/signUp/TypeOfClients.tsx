import { Box, FormHelperText, Stack, Typography } from "@mui/material";
import { Control } from "react-hook-form";
import { Account } from "./zod";
import { useTranslations } from "next-intl";
import { useOptionList } from "./hooks/useOptionList";
import OptionOther from "./components/OptionOther";
import OptionButton from "./components/OptionButton";
import RequiredAsterisk from "@/components/common/RequiredAsterisk";

interface ClientsTypeProps {
  control: Control<Account>;
}

const options = [
  {
    value: "option1",
    imgSrc: "/avci_signup_icons/Modern-Architecture-Buildings.svg",
    labelKey: "options.1",
    imgAlt: "Modern architecture buildings",
  },
  {
    value: "option2",
    imgSrc: "/avci_signup_icons/Official-Building.svg",
    labelKey: "options.2",
    imgAlt: "Official building",
  },
  {
    value: "option3",
    imgSrc: "/avci_signup_icons/Ecology-Globe-Hand.svg",
    labelKey: "options.3",
    imgAlt: "Hand's palm with the Earth floating above it",
  },
  {
    value: "option4",
    imgSrc: "/avci_signup_icons/Social-Profile-Avatar.svg",
    labelKey: "options.4",
    imgAlt: "A human head",
  },
  {
    value: "option5",
    imgSrc: "/avci_signup_icons/Family-Home.svg",
    labelKey: "options.5",
    imgAlt: "Family home",
  },
] as const;

const TypeOfClients = ({ control }: ClientsTypeProps) => {
  const t = useTranslations("signUp.type_of_client");
  const { selected, onChange, error } = useOptionList({
    name: "organization.data.clientTypes.list",
    control,
  });

  return (
    <Box>
      <Box mb={1.5}>
        <Typography variant="h6" sx={{ fontWeight: "600", fontSize: "16px" }}>
          {t("main_title")}
          <RequiredAsterisk />
        </Typography>
        <Typography
          variant="subtitle1"
          sx={{ fontWeight: "400", fontSize: "14px" }}
        >
          {t("main_desc")}
        </Typography>
      </Box>

      <Stack spacing={2}>
        {options.map(({ value, imgSrc, labelKey, imgAlt }) => (
          <OptionButton
            key={value}
            value={value}
            label={t(labelKey)}
            checked={selected(value)}
            onChange={onChange}
            imgSrc={imgSrc}
            imgAlt={imgAlt}
          />
        ))}

        <OptionOther
          control={control}
          name="organization.data.clientTypes.other"
        />
      </Stack>

      {!!error?.message && (
        <FormHelperText error sx={{ mt: 1 }}>
          {error.message}
        </FormHelperText>
      )}
    </Box>
  );
};

export default TypeOfClients;
