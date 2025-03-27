import ButtonPrimary from "@/components/common/button-primary";
import ButtonSecondary from "@/components/common/button-secondary";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import React, { useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope } from "@/lib/fas/pro-regular-svg-icons";
import z from "zod";
import { useForm } from "react-hook-form";
import { useContactSupplierScheduleMutation } from "@/services/projectMaterialSchedule";
import { zodResolver } from "@hookform/resolvers/zod";
import InputForm from "@/components/common/form/InputForm";
import { useTranslations } from "next-intl";

const schema = z.object({
  notes: z.string().trim().optional(),
});

export type Values = z.infer<typeof schema>;

const defaultValues = {
  notes: "",
} satisfies Values;

export interface GetSampleProps {
  handleClose: () => void;
  open: boolean;
  supplier?: API.Supplier;
  scheduleId: string;
  productId: string;
}

const GetSampleDialog = ({
  handleClose,
  open,
  supplier,
  scheduleId,
  productId,
}: GetSampleProps) => {
  const [getSample] = useContactSupplierScheduleMutation();
  const t = useTranslations("projects");
  const { control, handleSubmit, reset } = useForm<Values>({
    defaultValues,
    resolver: zodResolver(schema),
  });

  const onSubmit = useCallback(
    async (values: Values): Promise<void> => {
      await getSample({
        scheduleId: scheduleId,
        type: "get_sample",
        message: values.notes ?? "",
        productId: productId,
      });
      handleClose();
      reset();
    },
    [getSample, handleClose, productId, reset, scheduleId],
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
          {t("get_sample")}
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
            title={t("button.cancel")}
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

export default GetSampleDialog;
