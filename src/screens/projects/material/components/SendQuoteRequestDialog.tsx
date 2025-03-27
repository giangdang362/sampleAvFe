import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import React, { useCallback } from "react";
import CloseIcon from "@mui/icons-material/Close";
import ButtonSecondary from "@/components/common/button-secondary";
import ButtonPrimary from "@/components/common/button-primary";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope } from "@/lib/fas/pro-regular-svg-icons/faEnvelope";
import InputForm from "@/components/common/form/InputForm";
import z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useContactSupplierScheduleMutation } from "@/services/projectMaterialSchedule";
import { useTranslations } from "next-intl";

const schema = z.object({
  notes: z.string().trim().optional(),
});

export type Values = z.infer<typeof schema>;

const defaultValues = {
  notes: "",
} satisfies Values;
export interface SendQuoteProps {
  handleClose: () => void;
  open: boolean;
  supplier?: API.Supplier;
  scheduleId: string;
  productId: string;
}

const SendQuoteRequestDialog = ({
  handleClose,
  open,
  supplier,
  scheduleId,
  productId,
}: SendQuoteProps) => {
  const [sendQuote] = useContactSupplierScheduleMutation();
  const t = useTranslations("projects");
  const { control, handleSubmit, reset } = useForm<Values>({
    defaultValues,
    resolver: zodResolver(schema),
  });

  const onSubmit = useCallback(
    async (values: Values): Promise<void> => {
      await sendQuote({
        scheduleId: scheduleId,
        type: "quote",
        message: values.notes ?? "",
        productId: productId,
      });
      reset();
      handleClose();
    },
    [handleClose, productId, reset, scheduleId, sendQuote],
  );

  return (
    <Dialog
      onClose={() => {
        handleClose();
        reset();
      }}
      aria-labelledby="customized-dialog-title"
      open={open}
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title">
          {t("sendQuote")}
        </DialogTitle>
        <IconButton
          aria-label="close"
          onClick={() => {
            handleClose();
            reset();
          }}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
        <DialogContent dividers>
          <Stack spacing={2}>
            <Typography variant="body1" color={"GrayText"} maxWidth={"440px"}>
              {t("quotes_description1")}
            </Typography>
            <Typography variant="body1" color={"GrayText"} maxWidth={"440px"}>
              {t("quotes_description2")}
            </Typography>
            <InputForm
              control={control}
              name="notes"
              label={""}
              placeholder="Your Message"
              multiline
              row={5}
              fullWidth
              sx={{ width: "440px" }}
            />
            <Stack direction={"row"} spacing={1}>
              <Typography variant="subtitle1" color={"GrayText"}>
                {t("send_to")}:
              </Typography>
              {supplier && (
                <Stack>
                  <Typography
                    variant="subtitle1"
                    sx={{ fontWeight: "500", fontSize: 16, color: "black" }}
                    color={"GrayText"}
                  >
                    {supplier?.name}
                  </Typography>
                  <Typography
                    variant="subtitle1"
                    color={"GrayText"}
                    fontSize={14}
                  >
                    <FontAwesomeIcon
                      size="xl"
                      icon={faEnvelope}
                      color="GrayText"
                    />{" "}
                    {supplier?.email}
                  </Typography>
                </Stack>
              )}
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions>
          <ButtonSecondary
            title="Cancel"
            onClick={() => {
              handleClose();
              reset();
            }}
          />
          <ButtonPrimary disabled={!supplier} label="Send" type="submit" />
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default SendQuoteRequestDialog;
