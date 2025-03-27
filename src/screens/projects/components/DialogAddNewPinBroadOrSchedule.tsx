import {
  DialogTitle,
  IconButton,
  DialogContent,
  DialogActions,
  Dialog,
  Button,
} from "@mui/material";
import * as React from "react";
import CloseIcon from "@mui/icons-material/Close";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useCallback, useMemo } from "react";
import InputForm from "@/components/common/form/InputForm";
import { useCreatePinBoardOrScheduleMutation } from "@/services/projectFolder";
import { paths } from "@/paths";
import { useCreatePinboardSectionMutation } from "@/services/pinboards";
import { useTranslations } from "next-intl";
import { isErrorResponse, useIsUser } from "@/services/helpers";
import { useAvciRouter } from "@/hooks/avci-router";
import { LoadingButton } from "@mui/lab";

export interface DialogAddNewPinBoardScheduleProps {
  handleClose: () => void;
  handleClickOpen?: () => void;
  open: boolean;
  projectId: string;
  type: string;
}

export function DialogAddNewPinBroadSchedule({
  handleClose,
  open,
  projectId,
  type,
}: DialogAddNewPinBoardScheduleProps): React.JSX.Element {
  const tPinboardSection = useTranslations("pinboard.section");
  const [inputRef, setInputRef] = React.useState<HTMLInputElement | null>(null);
  const router = useAvciRouter();
  const isUser = useIsUser();
  const defaultValues = useMemo(() => {
    return {
      name: "",
    };
  }, []);

  const schema = z.object({
    name: z
      .string()
      .min(1, { message: "This field is required" })
      .max(155)
      .trim(),
  });
  type Values = z.infer<typeof schema>;

  const { control, handleSubmit, reset, setError } = useForm<Values>({
    resolver: zodResolver(schema),
    values: defaultValues,
  });

  const [createPinBoard, { isLoading: isCreatingProjectFile }] =
    useCreatePinBoardOrScheduleMutation();
  const [createSection, { isLoading: isCreatingSection }] =
    useCreatePinboardSectionMutation();
  const t = useTranslations("projects");

  const onSubmit = useCallback(
    async (data: Values): Promise<void> => {
      const pinboardRes = await createPinBoard({
        name: data.name ?? "",
        projectId: projectId,
        type: type === "pinboard" ? "pinboard" : "schedule",
      });

      if (pinboardRes.data) {
        if (type === "pinboard") {
          await createSection({
            id: pinboardRes.data.id,
            name: tPinboardSection("untitledSection"),
          });
        }

        reset({ name: "" });
        handleClose();
        let url =
          type === "pinboard"
            ? paths.admin.pinboard
            : `${paths.admin.materialSchedule}/${pinboardRes.data.id}`;
        if (isUser) {
          url =
            type === "pinboard"
              ? paths.app.pinboard
              : `${paths.app.materialSchedule}/${pinboardRes.data.id}`;
        }
        router.push(url, { id: pinboardRes.data.id });
      } else if (
        isErrorResponse(pinboardRes.error) &&
        pinboardRes.error.data.message === "PROJECT_FOLDER_EXIST"
      ) {
        setError("name", {
          message: `${t("message.alreadyExist")}`,
        });
      }
    },
    [
      createPinBoard,
      projectId,
      type,
      reset,
      handleClose,
      isUser,
      router,
      createSection,
      tPinboardSection,
      setError,
      t,
    ],
  );

  React.useEffect(() => {
    if (inputRef && open) {
      inputRef.focus();
    }
  }, [inputRef, open]);

  return (
    <Dialog
      onClose={() => {
        handleClose();
        reset({ name: "" });
      }}
      aria-labelledby="customized-dialog-title"
      open={open}
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        id="form-new-pin-board-schedule"
      >
        <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title">
          {type === "pinboard"
            ? `${t("dialog.addNewPinboard")}`
            : `${t("dialog.addNewMaterialSchedule")}`}
        </DialogTitle>
        <IconButton
          aria-label="close"
          onClick={() => {
            handleClose();
            reset({ name: "" });
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
        <DialogContent
          dividers
          sx={{
            textAlign: "center",
          }}
        >
          <InputForm
            sx={{ minWidth: "440px" }}
            control={control}
            label={
              type === "pinboard"
                ? `${t("dialog.pinboardName")}`
                : `${t("dialog.scheduleName")}`
            }
            name="name"
            fullWidth
            inputRef={setInputRef}
          />
        </DialogContent>
        <DialogActions>
          <Button
            variant="outlined"
            onClick={() => {
              handleClose();
              reset({ name: "" });
            }}
          >
            {t("button.cancel")}
          </Button>
          <LoadingButton
            variant="contained"
            loading={isCreatingProjectFile || isCreatingSection}
            type="submit"
          >
            {type === "pinboard"
              ? `${t("button.addPinboard")}`
              : `${t("button.addsSchedule")}`}
          </LoadingButton>
        </DialogActions>
      </form>
    </Dialog>
  );
}
