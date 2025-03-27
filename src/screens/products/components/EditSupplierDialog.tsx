import {
  DialogTitle,
  IconButton,
  DialogContent,
  DialogActions,
  Dialog,
  FormControl,
  Autocomplete,
  TextField,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ButtonPrimary from "../../../components/common/button-primary";
import ButtonSecondary from "../../../components/common/button-secondary";
import { useGetListPartnerMemberQuery } from "@/services/partnerMember";
import React from "react";
import { useTranslations } from "next-intl";

export interface EditSupplierDialogProps {
  open: boolean;
  handleClose: () => void;
  handleConfirm?: (selectedId: string) => void;
  initData?: string;
}

export function EditSupplierDialog({
  open,
  handleClose,
  handleConfirm,
  initData,
}: EditSupplierDialogProps): React.JSX.Element {
  const { data: dataPartnerMember } = useGetListPartnerMemberQuery();
  const t = useTranslations("products");
  const selectedIdRef = React.useRef<string>();
  // const handleChangeDropdown = (e: SelectChangeEvent<string>) => {
  //   selectedIdRef.current = e.target.value;
  // };
  return (
    <div>
      <Dialog
        onClose={() => {
          handleClose();
        }}
        aria-labelledby="customized-dialog-title"
        open={open}
      >
        <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title">
          Edit Supplier
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
          <FormControl fullWidth sx={{ minWidth: "440px" }}>
            {/* <InputLabel id="demo-simple-select-label">
              Contact Name - Company
            </InputLabel> */}
            <Autocomplete
              onChange={(e, data) => {
                selectedIdRef.current = data?.id;
              }}
              sx={{
                p: 0,
                "& .mui-ga15xk-MuiFormLabel-root-MuiInputLabel-root": {
                  top: "6px",
                },
              }}
              id="tags-outlined"
              options={dataPartnerMember?.data ?? []}
              getOptionLabel={(item) => {
                return `${item.name} - ${item.partner?.companyName}`;
              }}
              filterSelectedOptions
              defaultValue={dataPartnerMember?.data.find(
                (item) => item.id === initData ?? undefined,
              )}
              renderInput={({ size: _size, ...params }) => (
                <TextField
                  {...params}
                  size="medium"
                  variant="outlined"
                  label=""
                  placeholder={t("supplier_name_company")}
                />
              )}
            />
            {/* <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              label="Contact Name - Company"
              onChange={handleChangeDropdown}
              defaultValue={initData ?? undefined}
            >
              {dataPartnerMember?.data?.map((item) => (
                <MenuItem
                  key={`menu-${item.id}`}
                  value={item.id}
                >{`${item.name} - ${item?.partner?.companyName}`}</MenuItem>
              ))}
            </Select> */}
          </FormControl>
        </DialogContent>
        <DialogActions>
          <ButtonSecondary title="Cancel" onClick={handleClose} />
          <ButtonPrimary
            label="Save"
            type="submit"
            form="form-product"
            onClick={() => {
              selectedIdRef.current && handleConfirm?.(selectedIdRef.current);
              handleClose();
            }}
          />
        </DialogActions>
      </Dialog>
    </div>
  );
}
