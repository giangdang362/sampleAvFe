"use client";
import HeaderMain from "@/components/layout/header";
import { Box } from "@mui/material";
import FormNewSupplier from "@/components/admin/supplier/NewSupplier/FormNewSupplier";
import { useIsUser } from "@/services/helpers";

const NewSupplierView: React.FC = () => {
  const isUser = useIsUser();

  return (
    <Box>
      <HeaderMain
        title="New Supplier"
        haveBackBtn
        backBtnHref={{ isUser, path: "suppliers" }}
      />
      <FormNewSupplier />
    </Box>
  );
};

export default NewSupplierView;
