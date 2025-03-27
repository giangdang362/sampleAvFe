import * as React from "react";
import { Box, Typography } from "@mui/material";
import { useTranslations } from "next-intl";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { paths } from "@/paths";
import ButtonPrimary from "../common/button-primary";
import { faChevronRight } from "@/lib/fas/pro-light-svg-icons";
import ProductItem from "../admin/products/ProductItem";

interface SuggestResultModalProps {
  searchTerm: string;
  countResult: number;
  dataResult: API.ProductItem[];
}
export default function SuggestResultModal({
  searchTerm,
  countResult,
  dataResult,
}: SuggestResultModalProps) {
  const t = useTranslations("common");

  return (
    <Box
      sx={{
        position: "absolute",
        top: "51px",
        width: "100%",
        minWidth: "",
        minHeight: "400px",
        borderRadius: "10px",
        boxShadow: "4px 6px 10px 4px #00000014",
        zIndex: 1500,
        background: "#fff",
        padding: "24px 60px",
      }}
    >
      <Typography
        sx={{
          color: "#000000DE",
          fontWeight: 500,
        }}
      >{`${countResult} ${countResult > 1 ? t("results") : t("result")} ${t("rs_for")} ${searchTerm}`}</Typography>
      {/* Result for searching */}
      <Box
        sx={{
          mt: "24px",
          display: "flex",
          flexWrap: "wrap",
          rowGap: "24px",
          columnGap: "20px",
        }}
      >
        {dataResult?.slice(0, 16).map((item) => (
          <ProductItem
            key={item.id}
            dataItem={item}
            sx={{
              width: "160px",
              "& .product-img": {
                width: "160px",
                height: "160px",
                aspectRatio: "1/1",
              },
            }}
            addTo={false}
            linkToDetail={true}
          />
        ))}
      </Box>
      {countResult > 16 ? (
        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: "12px" }}>
          <ButtonPrimary
            label={t("see_more")}
            href={`${paths.searchResult}?s=${searchTerm}`}
            endIcon={
              <FontAwesomeIcon
                icon={faChevronRight}
                style={{ fontSize: "14px" }}
              />
            }
          />
        </Box>
      ) : null}
    </Box>
  );
}
