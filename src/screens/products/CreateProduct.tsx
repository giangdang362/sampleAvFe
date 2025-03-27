"use client";
import FormCreateProduct from "@/components/admin/products/createProducts/FormCreateProduct";
import FooterMain from "@/components/layout/footer-main";
import HeaderMain from "@/components/layout/header";
import { useIsUser } from "@/services/helpers";
import { LoadingButton } from "@mui/lab";
import { Box, Stack } from "@mui/material";
import { useTranslations } from "next-intl";
import { useState } from "react";

const CreateProduct = () => {
  const t = useTranslations("products");
  const [open, setOpen] = useState(false);
  const [isLoadingBy, setIsLoadingBy] = useState<"save" | "add-to">();
  const isUser = useIsUser();

  const handleClickOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Box>
      <HeaderMain
        title={t("create_product")}
        haveBackBtn={true}
        backBtnHref={{ isUser, path: "products" }}
      />
      <FormCreateProduct
        addToOpen={open}
        onAddToClose={handleClose}
        onLoadingChanged={setIsLoadingBy}
      />
      <FooterMain
        type="custom"
        cusView={
          <Stack
            direction="row"
            sx={{
              alignItems: "center",
              justifyContent: "flex-start",
            }}
          >
            <Stack direction={"row"} gap={"12px"}>
              <LoadingButton
                variant="contained"
                type="submit"
                disabled={isLoadingBy === "add-to"}
                loading={isLoadingBy === "save"}
                form={"form-product"}
              >
                Save
              </LoadingButton>
              <LoadingButton
                variant="outlined"
                form={"form-product"}
                disabled={isLoadingBy === "save"}
                loading={isLoadingBy === "add-to"}
                onClick={() => {
                  handleClickOpen();
                }}
              >
                Add to
              </LoadingButton>
            </Stack>
          </Stack>
        }
      />
    </Box>
  );
};

export default CreateProduct;
