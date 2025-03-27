import ButtonPrimary from "@/components/common/button-primary";
import ButtonSecondary from "@/components/common/button-secondary";
import {
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  Radio,
  RadioGroup,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@/lib/fas/pro-regular-svg-icons";
import { useUpdateProductStatusScheduleMutation } from "@/services/projectMaterialSchedule";
import { useTranslations } from "next-intl";

export interface Props {
  handleClose: () => void;
  handleClickOpenSample: () => void;
  open: boolean;
  isClientStatus: boolean;
  scheduleId: string;
  productId: string;
}

interface RatioGroupProps {
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  items: string[];
  value: string;
}

const CustomRadioGroup = ({ onChange, items, value }: RatioGroupProps) => {
  const [text, setText] = useState("");
  const [checked, setChecked] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value);
    onChange(e);
  };

  return (
    <RadioGroup value={value} onChange={onChange}>
      {items.map((item) => (
        <FormControlLabel
          key={item}
          control={<Radio />}
          label={item}
          value={item}
          onClick={() => setChecked(false)}
        />
      ))}

      <FormControlLabel
        sx={{
          "& span:nth-child(2)": {
            width: "100%",
          },
        }}
        control={<Radio checked={checked} onClick={() => setChecked(true)} />}
        value={text}
        label={
          <TextField
            fullWidth
            onChange={handleChange}
            onClick={(e: any) => {
              setChecked(true);
              onChange(e);
            }}
            placeholder="Other"
          />
        }
      />
    </RadioGroup>
  );
};

const ProductStatusChangeDialog = ({
  open,
  handleClose,
  isClientStatus = false,
  scheduleId,
  productId,
  handleClickOpenSample,
}: Props) => {
  const [myVar, setMyVar] = useState("");
  const t = useTranslations("projects");
  const [updateStatus] = useUpdateProductStatusScheduleMutation();

  const handleSave = async () => {
    updateStatus({
      scheduleId: scheduleId,
      id: productId,
      newStatus: "sample_requested",
      reason: myVar,
    })
      .unwrap()
      .then((res) => {
        if (res) {
          handleClose();
          handleClickOpenSample();
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  useEffect(() => {
    if (isClientStatus) {
      setMyVar("Client Control Sample");
    } else {
      setMyVar("Internal Control Sample");
    }
  }, [isClientStatus]);

  return (
    <Dialog
      onClose={() => {}}
      aria-labelledby="customized-dialog-title"
      open={open}
    >
      {/* <form onSubmit={handleSubmit(onSubmit)}> */}
      <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title">
        {t("dialog.productStatusChange")}
      </DialogTitle>
      <IconButton
        aria-label="close"
        onClick={() => {
          handleClose();
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
        <Stack spacing={1}>
          <Typography variant="subtitle1">
            {t("statusHistory.description")}
          </Typography>

          <Stack direction={"row"} alignItems={"center"} spacing={0.5}>
            <Box
              bgcolor={isClientStatus ? "#2E7D32" : "#EF6C00"}
              borderRadius={"4px"}
              padding={"4px 8px"}
            >
              <Typography
                fontSize={"14px"}
                sx={{ textDecoration: "line-through" }}
                color={"#FFFFFF"}
              >
                {isClientStatus ? t("client_approved") : t("internal_approved")}
              </Typography>
            </Box>
            <FontAwesomeIcon style={{ fontSize: "16px" }} icon={faArrowRight} />
            <Box bgcolor={"#D32F2F"} borderRadius={"4px"} padding={"4px 8px"}>
              <Typography fontSize={"14px"} color={"#FFFFFF"}>
                {t("sample_requested")}
              </Typography>
            </Box>
          </Stack>
          <CustomRadioGroup
            onChange={(e) => setMyVar(e.target.value)}
            items={
              isClientStatus
                ? [t("statusHistory.clientControlSample")]
                : [
                    t("statusHistory.internalControlSample"),
                    t("statusHistory.clientControlSample"),
                    t("statusHistory.contractorControlSample"),
                  ]
            }
            value={myVar}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <ButtonSecondary
          title={t("button.cancel")}
          onClick={() => {
            handleClose();
          }}
        />
        <ButtonPrimary label="Save" onClick={handleSave} />
      </DialogActions>
      {/* </form> */}
    </Dialog>
  );
};

export default ProductStatusChangeDialog;
