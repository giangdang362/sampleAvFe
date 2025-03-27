"use client";
import HeaderMain from "@/components/layout/header";
import { Box } from "@mui/material";
import FooterMain from "@/components/layout/footer-main";
import { useSearchParams } from "next/navigation";
import { useAvciRouter } from "@/hooks/avci-router";
import { paths } from "@/paths";
import { useMemo } from "react";
// import DataTable from "./TableSuppliersList/DataTable";
// import { useGetPartnerMembersQuery } from "@/services/partnerMember";

const NewSupplierMemberView: React.FC = () => {
  const router = useAvciRouter();
  const searchParams = useSearchParams();

  const id = useMemo(() => {
    if (
      searchParams.get("supplier_id") &&
      searchParams.get("supplier_id") !== ""
    ) {
      return searchParams.get("supplier_id");
    }

    return undefined;
  }, [searchParams.get("supplier_id")]);

  return (
    <Box>
      <HeaderMain title="New Supplier" haveBackBtn />
      <Box sx={{ minHeight: 750 }}>
        {/* <DataTable data={dataPartnerMembers?.data ?? []} loading={isLoading} /> */}
      </Box>

      <FooterMain
        formId="create-new-supplier"
        type="step"
        onBack={() =>
          router.push(`${paths.admin.addSupplier}?supplier_id=${id}`)
        }
      />
    </Box>
  );
};

export default NewSupplierMemberView;
