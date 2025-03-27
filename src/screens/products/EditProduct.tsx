import FormCreateProduct from "@/components/admin/products/createProducts/FormCreateProduct";
import FooterMain from "@/components/layout/footer-main";
import HeaderMain from "@/components/layout/header";
import { Box } from "@mui/material";

const EditProduct = () => {
  return (
    <Box>
      <HeaderMain title={"Edit Product"} haveBackBtn />
      {/* <FormCreateProduct id={id} /> */}
      <FormCreateProduct />
      <FooterMain formId={"form-product"} />
    </Box>
  );
};

export default EditProduct;
