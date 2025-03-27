import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import {
  Button,
  CardActionArea,
  Checkbox,
  Divider,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Popover,
} from "@mui/material";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar } from "@/lib/fas/pro-regular-svg-icons/faStar";
import { faStar as faStarSolid } from "@/lib/fas/pro-solid-svg-icons/faStar";
import { useTranslations } from "next-intl";
import { useState, MouseEvent, SyntheticEvent } from "react";
import { faCopy, faTrash } from "@/lib/fas/pro-light-svg-icons";
import { PROJECT_TYPES } from "@/constants/common";
import SendQuoteRequestDialog from "./SendQuoteRequestDialog";
import GetSampleDialog from "./GetSampleDialog";
import ButtonPrimary from "@/components/common/button-primary";
import {
  useDeleteProductsScheduleMutation,
  useUpdateProductScheduleMutation,
  useUpdateProductStatusScheduleMutation,
} from "@/services/projectMaterialSchedule";
import { useConfirmDialog } from "@/components/common/UserDialog";
import { paths } from "@/paths";
import EditableStatusDropDow from "@/components/common/app-edit-dropdow-status";
import { pathFile } from "@/config/api";
import ImageDefault from "@/components/common/ImageDefault";
import ImageScheduleDetail from "./ImageScheduleDetail";
import { faTrashCan } from "@/lib/fas/pro-regular-svg-icons";
import ActionToProjectFileDialog from "@/components/admin/projects/ActionToProjectFileDialog";
import { useCopyProductMutation } from "@/services/projectFolder";
import { useAvciRouter } from "@/hooks/avci-router";
import ProductStatusChangeDialog from "./ProductStatusChangeDialog";

export interface ProductCardProps {
  product: API.Product;
  type: string;
  selectedProductIds: string[];
  projectFolderId: string;
  handleCheckboxChange: (
    productId: string,
  ) => (event: React.ChangeEvent<HTMLInputElement>) => void;
  readOnly: boolean;
}

export function ProductCard({
  product,
  type,
  selectedProductIds,
  projectFolderId,
  handleCheckboxChange,
  readOnly = false,
}: ProductCardProps): React.JSX.Element {
  const t = useTranslations("projects");
  const tCommon = useTranslations("common");
  const route = useAvciRouter();
  const [deleteProduct] = useDeleteProductsScheduleMutation();
  const [updateProduct] = useUpdateProductScheduleMutation();
  const [updateStatus] = useUpdateProductStatusScheduleMutation();
  const [openCopyTo, setOpenCopyTo] = useState(false);
  const [openQuote, setOpenQuote] = useState(false);
  const [openStatusChange, setOpenStatusChange] = useState(false);
  const [openImageDetail, setOpenImageDetail] = useState(false);
  const [openGetSample, setOpenGetSample] = useState(false);
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleFlag = async () => {
    try {
      await updateProduct({
        scheduleId: projectFolderId ?? "",
        id: product.id,
        favorite: !product.favorite,
      });
    } catch (e) {}
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const [copyProduct] = useCopyProductMutation();
  const handleClickOpen = () => {
    setOpenCopyTo(true);
  };
  const handleCloseCopyTo = () => {
    setOpenCopyTo(false);
  };
  const handleCopyTo = async (scheduleId: string, sectionId: string) => {
    await copyProduct({
      scheduleId,
      sectionId,
      productId: product.id,
    }).unwrap();
  };

  const handleClickOpenQuote = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setOpenQuote(true);
  };
  const handleCloseQuote = () => {
    setOpenQuote(false);
  };

  const handleClickOpenImage = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setOpenImageDetail(true);
  };

  const handleCloseImage = () => {
    setOpenImageDetail(false);
  };

  const handleClickOpenSample = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setOpenGetSample(true);
  };
  const handleCloseSample = () => {
    setOpenGetSample(false);
  };
  const open = Boolean(anchorEl);

  const { openDialog } = useConfirmDialog();
  const handleDeleteProduct = async () => {
    openDialog({
      type: "confirm",
      title: t("product.deleteProductTitle", {
        name: `${product?.series}-${product.model}`,
      }),
      content: t("product.deleteProductContent", {
        name: `${product?.series}-${product.model}`,
      }),
      confirmButtonLabel: tCommon("delete"),
      icon: faTrashCan,
      mainColor: "error",
      onConfirm: async () => {
        try {
          await deleteProduct({
            scheduleId: projectFolderId ?? "",
            ids: [product.id ?? ""],
          }).unwrap();
        } catch {}
      },
    });
    return;
  };

  const preventDraggingProps = {
    onMouseDown: (event: SyntheticEvent) => event.stopPropagation(),
    onTouchStart: (event: SyntheticEvent) => event.stopPropagation(),
  };

  return (
    <Box display={"flex"} gap={1} sx={{ cursor: "move", width: "100%", mb: 2 }}>
      {!readOnly && (
        <Card
          sx={{
            borderRadius: "4px",
            width: 25,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "space-around",
            borderWidth: 1,
            border: "1px solid rgba(0, 0, 0, 0.12)",
            overflow: "unset",
          }}
        >
          <IconButton onClick={handleFlag}>
            {product.favorite ? (
              <FontAwesomeIcon
                size="xs"
                icon={faStarSolid}
                style={{ color: "#FFD43B" }}
              />
            ) : (
              <FontAwesomeIcon size="xs" icon={faStar} />
            )}
          </IconButton>
          <Checkbox
            size="small"
            itemID={product.id}
            value={product.id}
            checked={selectedProductIds?.includes(product.id)}
            onChange={handleCheckboxChange(product.id)}
          />
          <IconButton onClick={handleClick}>
            <MoreHorizIcon />
          </IconButton>
          <Popover
            id={product.id}
            open={open}
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "left",
            }}
            transformOrigin={{
              vertical: 14,
              horizontal: 0,
            }}
            onClose={handleClose}
            sx={{ marginTop: 1 }}
            elevation={8}
            slotProps={{ paper: { sx: { minWidth: "150px" } } }}
            {...preventDraggingProps}
          >
            <List>
              <ListItemButton onClick={handleClickOpen}>
                <ListItemIcon>
                  <FontAwesomeIcon icon={faCopy} />
                </ListItemIcon>
                <ListItemText primary={tCommon("copy_to")} />
              </ListItemButton>
              <Divider />
              <ListItemButton onClick={handleDeleteProduct}>
                <ListItemIcon>
                  <FontAwesomeIcon
                    color="var(--mui-palette-error-main)"
                    icon={faTrash}
                  />
                </ListItemIcon>
                <ListItemText
                  sx={{ color: "var(--mui-palette-error-main)" }}
                  primary={tCommon("delete")}
                />
              </ListItemButton>
            </List>
          </Popover>
        </Card>
      )}
      <Card
        sx={{
          borderRadius: "4px",
          border: "1px solid rgba(0, 0, 0, 0.12)",
          overflow: "unset",
          flex: 1,
        }}
      >
        <CardActionArea
          disableRipple
          sx={{
            cursor: !readOnly ? "move" : "default",
            width: "100%",
            "&:hover": {
              ".action-button": {
                display: "block",
              },
            },
            display: "flex",
            justifyContent: "flex-start",
          }}
          // href={`${paths.admin.materialSchedule}/${projectFolderId}/product-detail/${product?.id}`}
          onClick={() =>
            route.push(
              `${paths.admin.materialSchedule}/${projectFolderId}/product-detail/${product?.id}`,
            )
          }
          draggable={false}
        >
          {product.images && product?.images[0] ? (
            !readOnly ? (
              <Box
                onClick={handleClickOpenImage}
                component={Button}
                padding={0}
                mx="16px"
              >
                <Box
                  component="img"
                  sx={{
                    // marginLeft: "12px",
                    width: "100px",
                    height: "100px",
                    borderRadius: "4px",
                  }}
                  alt="null"
                  src={`${pathFile}/${product.images[0].path}` ?? ""}
                />
              </Box>
            ) : (
              <Box
                component="img"
                sx={{
                  marginLeft: "16px",
                  marginRight: "16px",
                  width: "100px",
                  height: "100px",
                  borderRadius: "4px",
                }}
                alt="null"
                src={`${pathFile}/${product.images[0].path}` ?? ""}
              />
            )
          ) : (
            <ImageDefault
              width="100px"
              height="100px"
              sx={{
                marginLeft: "16px",
                marginRight: "16px",
                borderRadius: "4px",
              }}
              fontSizeIcon="36px"
            />
          )}

          <Box flex={1} minWidth="150px">
            <Stack p={1}>
              <Typography variant="body1">
                {product.docCode ? product.docCode : "-"}
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: "GrayText",
                  marginTop: 0.5,
                }}
              >
                {t("doc_code")}
              </Typography>
            </Stack>
            <Stack p={1}>
              <Typography variant="body1">
                {product.series || product.model
                  ? `${product.series}-${product.model}`
                  : "-"}
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: "GrayText",
                }}
              >
                {t("product_name")}
              </Typography>
            </Stack>
          </Box>

          <Box flex={1} minWidth="150px">
            <Stack p={1}>
              <Typography variant="body1">
                {product.origin ? product.origin : "-"}
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: "GrayText",
                }}
              >
                {t("origin")}
              </Typography>
            </Stack>
            <Stack p={1}>
              <Typography variant="body1">
                {product.brandName ? product.brandName : "-"}
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: "GrayText",
                }}
              >
                {t("brand")}
              </Typography>
            </Stack>
          </Box>

          {type === PROJECT_TYPES.summary ? (
            <Box flex={1} minWidth="150px">
              <Stack p={1}>
                <Typography variant="body1">
                  {product.material ? product.material : "-"}
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: "GrayText",
                  }}
                >
                  {t("material")}
                </Typography>
              </Stack>
              <Stack p={1}>
                <Typography variant="body1">
                  {product.color ? product.color : "-"}
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: "GrayText",
                  }}
                >
                  {t("colour")}
                </Typography>
              </Stack>
            </Box>
          ) : (
            <Box flex={1} minWidth="150px">
              <Stack p={1}>
                <Typography variant="body1">
                  {product.unitRate ? `$${product.unitRate}` : "-"}
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: "GrayText",
                  }}
                >
                  {t("unit_rate")}
                </Typography>
              </Stack>
              <Stack p={1}>
                <Typography variant="body1">
                  {product.quantity ? product.quantity : "-"}
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: "GrayText",
                  }}
                >
                  {t("quantity")}
                </Typography>
              </Stack>
            </Box>
          )}

          {type === PROJECT_TYPES.summary ? (
            <Box flex={1} minWidth="150px">
              <Stack p={1}>
                <Typography variant="body1">
                  {product.surface ? product.surface : "-"}
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: "GrayText",
                  }}
                >
                  {t("surface")}
                </Typography>
              </Stack>
              <Stack p={1}>
                <Typography variant="body1">{`${product.width ? product.width : "--"}x${product.length ? product.length : "--"}x${product.height ? product.height : "--"}`}</Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: "GrayText",
                  }}
                >
                  {t("size")}
                </Typography>
              </Stack>
            </Box>
          ) : (
            <Box flex={1} minWidth="150px">
              <Stack p={1}>
                <Typography variant="body1">
                  {product.unit ? product.unit : "-"}
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: "GrayText",
                  }}
                >
                  {t("unit")}
                </Typography>
              </Stack>
              <Stack p={1}>
                <Typography variant="body1">
                  {product.discount ? product.discount : "-"}%
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: "GrayText",
                  }}
                >
                  {t("discount")}
                </Typography>
              </Stack>
            </Box>
          )}

          {type === PROJECT_TYPES.summary ? (
            <Box flex={1} minWidth="150px">
              <Stack p={1}>
                <Typography variant="body1">
                  {product?.supplier?.partner.companyName
                    ? product?.supplier.partner.companyName
                    : "-"}
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: "GrayText",
                  }}
                >
                  {t("supplier")}
                </Typography>
              </Stack>
              <Stack p={1}>
                <Typography variant="body1">
                  {product.leadTime ? product.leadTime : "-"}
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: "GrayText",
                  }}
                >
                  {t("lead_time")}
                </Typography>
              </Stack>
              {/* <Stack p={1}>
                <Typography variant="body1">{product.finish}</Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: "GrayText",
                  }}
                >
                  {t("finish")}
                </Typography>
              </Stack> */}
            </Box>
          ) : (
            <Box flex={1} minWidth="150px">
              <Stack p={1}>
                <Typography variant="body1">
                  {product.originalCost ? `$${product.originalCost}` : "-"}
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: "GrayText",
                  }}
                >
                  {t("total_original_cost")}
                </Typography>
              </Stack>
              <Stack p={1}>
                <Typography variant="body1">
                  {product.finalCost ? `$${product.finalCost}` : "-"}
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: "GrayText",
                  }}
                >
                  {t("total_final_cost")}
                </Typography>
              </Stack>
            </Box>
          )}

          <Box flex={1.5} minWidth="270px" alignSelf="flex-start">
            <Stack p={1}>
              <Typography variant="body1">{t("status")}</Typography>
              <EditableStatusDropDow
                enabled={!readOnly}
                value={product.status}
                onChangeDropDow={(e) => {
                  updateStatus({
                    scheduleId: projectFolderId ?? "",
                    id: product.id,
                    newStatus: e.target.value,
                    reason: "",
                  });
                }}
              />
            </Stack>
            {!readOnly && (
              <Stack
                p={1}
                spacing={2}
                direction={"row"}
                display={"none"}
                className="action-button"
              >
                <ButtonPrimary
                  disabled={product?.supplier?.partner === undefined}
                  onClick={handleClickOpenQuote}
                  variant="outlined"
                  label={t("quotes")}
                />
                <ButtonPrimary
                  disabled={product?.supplier?.partner === undefined}
                  onClick={(e) => {
                    if (
                      product?.status === "internal_approved" ||
                      product?.status === "client_approved"
                    ) {
                      e.stopPropagation();
                      setOpenStatusChange(true);
                    } else {
                      handleClickOpenSample(e);
                    }
                  }}
                  variant="outlined"
                  label={t("get_sample")}
                  sx={{ marginLeft: 1 }}
                />
              </Stack>
            )}
          </Box>
        </CardActionArea>
      </Card>

      <div {...preventDraggingProps}>
        <ActionToProjectFileDialog
          type="schedule"
          action="copy"
          open={openCopyTo}
          onClose={handleCloseCopyTo}
          onSectionSelected={handleCopyTo}
        />
        <SendQuoteRequestDialog
          handleClose={handleCloseQuote}
          open={openQuote}
          supplier={product.supplier}
          scheduleId={projectFolderId}
          productId={product.id}
        />
        <GetSampleDialog
          handleClose={handleCloseSample}
          open={openGetSample}
          supplier={product.supplier}
          scheduleId={projectFolderId}
          productId={product.id}
        />
        <ProductStatusChangeDialog
          scheduleId={projectFolderId}
          productId={product.id}
          isClientStatus={product?.status === "client_approved"}
          handleClickOpenSample={() => {
            setOpenGetSample(true);
          }}
          handleClose={() => {
            setOpenStatusChange(false);
          }}
          open={openStatusChange}
        />
        <ImageScheduleDetail
          open={openImageDetail}
          handleClose={handleCloseImage}
          title={`${product.series}-${product.model}`}
          images={product.images}
        />
      </div>
    </Box>
  );
}
