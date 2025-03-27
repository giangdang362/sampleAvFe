import FaIconButton from "@/components/common/FaIconButton";
import { useConfirmDialog } from "@/components/common/UserDialog";
import { PROJECT_TYPES } from "@/constants/common";
import {
  faChevronDown,
  faChevronUp,
  faCopy,
  faTrash,
} from "@/lib/fas/pro-regular-svg-icons";
import {
  useDeleteSectionScheduleMutation,
  useDuplicateScheduleSectionMutation,
} from "@/services/projectFolder";
import {
  useCreateProductScheduleMutation,
  useGetListProductMaterialScheduleIdQuery,
  useUpdateMaterialScheduleMutation,
  useUpdateScheduleSectionMutation,
} from "@/services/projectMaterialSchedule";
import {
  Active,
  DndContext,
  DragEndEvent,
  useDroppable,
  useSensor,
} from "@dnd-kit/core";
import AddIcon from "@mui/icons-material/Add";
import { Button, Card, Checkbox, Stack, Typography } from "@mui/material";
import { useTranslations } from "next-intl";
import React, { Fragment, memo, useCallback, useEffect, useRef } from "react";
import { ProductCard } from "../components/furnitures-card";
import EditableTypography from "@/components/common/app-edit-inline";
import {
  verticalListSortingStrategy,
  SortableContext,
} from "@dnd-kit/sortable";
import SortableItem from "./SortableItem";
import { useDndSensors } from "@/hooks/useDndSensors";
import {
  restrictToParentElement,
  restrictToVerticalAxis,
} from "@dnd-kit/modifiers";
import { OnlySelfKeyboardSensor } from "@/utils/OnlySelfKeyboardSensor";

const CreateButton = ({
  sectionId,
  onCreate,
}: {
  sectionId: string | undefined;
  onCreate?: (source?: { productId: string } | { imageId: string }) => void;
}) => {
  const { setNodeRef, active, isOver } = useDroppable({
    id: "droppable-schedule-section-" + sectionId,
  });

  function isValidProductSource(
    data: unknown,
  ): data is { productId: string } | { imageId: string } {
    return (
      typeof data === "object" &&
      data !== null &&
      (("productId" in data && typeof data.productId === "string") ||
        ("imageId" in data && typeof data.imageId === "string"))
    );
  }

  const activeDataRef = useRef<Active>();
  useEffect(() => {
    if (active && isOver) {
      activeDataRef.current = active;
    } else if (!isOver) {
      const data = activeDataRef.current?.data.current as unknown;
      if (!active && isValidProductSource(data)) {
        onCreate?.(data);
      } else {
        activeDataRef.current = undefined;
      }
    }
  }, [active, isOver]);

  return (
    <Button
      ref={setNodeRef}
      sx={{
        my: 2,
        width: "100%",
        border: "2px dashed rgba(0, 0, 0, 0.23)",
        color: "rgba(0, 0, 0, 0.6)",
        fontSize: "14px",
        fontWeight: "500",
        bgcolor: isOver
          ? "rgba(var(--mui-palette-primary-mainChannel) / var(--mui-palette-action-hoverOpacity))"
          : undefined,
      }}
      onClick={() => onCreate?.()}
    >
      <AddIcon />
      New Product
    </Button>
  );
};

interface Props {
  section?: API.Sections;
  isEstimation?: boolean;
  selectedProductIds: string[];
  handleCheckboxChange: (
    productId: string,
  ) => (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleSelectAllChange: (
    section: API.Sections,
  ) => (event: React.ChangeEvent<HTMLInputElement>) => void;
  readOnly: boolean;
}

const Summary = ({
  section,
  isEstimation = false,
  handleCheckboxChange,
  handleSelectAllChange,
  selectedProductIds,
  readOnly = false,
}: Props) => {
  const [updateSchedule] = useUpdateMaterialScheduleMutation();
  const [deleteSectionSchedule] = useDeleteSectionScheduleMutation();
  const [updateSection] = useUpdateScheduleSectionMutation();
  const [createProductSchedule] = useCreateProductScheduleMutation();
  const [duplicateSection] = useDuplicateScheduleSectionMutation();
  const t = useTranslations("projects");
  const tCommon = useTranslations("common");
  const { data: getSectionbyId } = useGetListProductMaterialScheduleIdQuery({
    id: section?.projectFolderId ?? "",
  });

  const sectionIds = getSectionbyId?.sections.map((s) => s.id);
  const sectionIndex = sectionIds?.findIndex((id) => id === section?.id);

  const { openDialog } = useConfirmDialog();
  const handleDeleteSection = async () => {
    openDialog({
      type: "confirm",
      title: t("section.deleteSectionTitle", { name: section?.name }),
      content: t("section.deleteSectionContent", { name: section?.name }),
      confirmButtonLabel: tCommon("delete"),
      icon: faTrash,
      mainColor: "error",
      onConfirm: async () => {
        try {
          await deleteSectionSchedule({
            folderId: section?.projectFolderId ?? "",
            type: "schedule",
            ids: [section?.id ?? ""],
          }).unwrap();
        } catch {}
      },
    });
    return;
  };

  const handleDuplicateSection = async () => {
    try {
      await duplicateSection({
        folderid: section?.projectFolderId ?? "",
        sectionId: section?.id ?? "",
      }).unwrap();
    } catch (e) {
      console.log(e);
    }
  };

  const handleTitleChange = async (newName: string) => {
    try {
      await updateSection({
        id: section?.projectFolderId ?? "",
        sectionId: section?.id ?? "",
        name: newName,
      }).unwrap();
    } catch {}
  };

  const onCreateProduct = useCallback(
    async (
      source?: { productId: string } | { imageId: string },
    ): Promise<void> => {
      const productId =
        source && "productId" in source ? source.productId : undefined;
      const imageId =
        source && "imageId" in source && !productId
          ? source.imageId
          : undefined;

      await createProductSchedule({
        type: productId ? "library" : "new",
        sectionId: section?.id ?? "",
        scheduleId: section?.projectFolderId ?? "",
        productId,
        imageId,
      });
    },
    [createProductSchedule, section?.id, section?.projectFolderId],
  );

  const handleOrderChange = async (direction: "up" | "down") => {
    if (!sectionIds || sectionIndex === undefined || sectionIndex === -1) {
      return;
    }

    const newSectionIds = [...sectionIds];
    const newIndex = direction === "up" ? sectionIndex - 1 : sectionIndex + 1;
    const otherSection = newSectionIds[newIndex];
    newSectionIds[newIndex] = newSectionIds[sectionIndex];
    newSectionIds[sectionIndex] = otherSection;

    try {
      await updateSchedule({
        id: section?.projectFolderId ?? "",
        sectionIds: newSectionIds,
        updateType: "optimistic",
      }).unwrap();
    } catch {}
  };

  const onDrop = useCallback(
    async (dropResult: DragEndEvent) => {
      if (!section?.products) return;

      const { active, over } = dropResult;
      if (!over) return;

      if (active.id !== over.id) {
        const removedIndex = section.products.findIndex(
          (item) => item.id === active.id,
        );
        const addedIndex = section.products.findIndex(
          (item) => item.id === over.id,
        );

        if (removedIndex !== -1 && addedIndex !== -1) {
          const updatedProducts = [...(section?.products ?? [])];
          const [removedItem] = updatedProducts.splice(removedIndex, 1);
          updatedProducts.splice(addedIndex, 0, removedItem);
          try {
            await updateSection({
              id: section?.projectFolderId ?? "",
              sectionId: section?.id ?? "",
              itemIds: updatedProducts.map(({ id }) => id),
            }).unwrap();
          } catch {}
        }
      }
    },
    [section?.id, section?.products, section?.projectFolderId, updateSection],
  );

  const sensors = useDndSensors(useSensor(OnlySelfKeyboardSensor));
  const renderProductCard = (product: API.Product) => (
    <ProductCard
      key={product.id}
      type={isEstimation ? PROJECT_TYPES.estimation : PROJECT_TYPES.summary}
      product={product}
      selectedProductIds={selectedProductIds}
      handleCheckboxChange={handleCheckboxChange}
      projectFolderId={section?.projectFolderId ?? ""}
      readOnly={readOnly}
    />
  );

  return (
    <div id={`${section?.id}`}>
      <Stack>
        <Stack
          direction={"row"}
          justifyContent={"space-between"}
          alignItems={"center"}
          sx={{
            "&:hover": {
              ".action-button": {
                display: "block",
              },
            },
          }}
        >
          <Stack direction={"row"} alignItems={"center"} my={1}>
            {!readOnly && (
              <Checkbox
                size="small"
                disableRipple
                checked={
                  (section?.products ?? "").length > 0 &&
                  section?.products?.every((product) =>
                    selectedProductIds.includes(product.id),
                  )
                }
                indeterminate={
                  section?.products?.some((product) =>
                    selectedProductIds.includes(product.id),
                  ) &&
                  !section?.products?.every((product) =>
                    selectedProductIds.includes(product.id),
                  )
                }
                onChange={section && handleSelectAllChange(section)}
                sx={{
                  padding: "2px",
                  marginRight: 1,
                }}
              />
            )}

            <EditableTypography
              isHoverInput={false}
              value={section?.name ?? ""}
              onChangeText={(e) => {
                handleTitleChange(e.target?.value ?? "");
              }}
              enabled={!readOnly}
              sx={{
                fontWeight: 600,
                fontSize: "16px",
                lineHeight: 1.215,
                maxWidth: "45vw",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
              textFieldInputSx={{
                fontWeight: 600,
                fontSize: "16px",
                lineHeight: 1.215,
              }}
            />
            <Typography
              sx={{
                marginLeft: 2,
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: "rgba(0, 0, 0, 0.08)",
                alignItems: "center",
                justifyContent: "center",
                display: "flex",
              }}
            >
              {section?.products?.length ? section?.products?.length : 0}
            </Typography>
          </Stack>
          {!readOnly && (
            <Stack direction={"row"} display={"none"} className="action-button">
              <FaIconButton
                title={t("section.moveSectionUp")}
                icon={faChevronUp}
                color="primary"
                onClick={() => handleOrderChange("up")}
                disabled={sectionIndex === 0}
                tooltipProps={{ PopperProps: { disablePortal: true } }}
              />
              <FaIconButton
                title={t("section.moveSectionDown")}
                icon={faChevronDown}
                color="primary"
                onClick={() => handleOrderChange("down")}
                disabled={sectionIndex === (sectionIds?.length ?? 1) - 1}
                tooltipProps={{ PopperProps: { disablePortal: true } }}
              />
              <FaIconButton
                title={t("section.duplicateSection")}
                icon={faCopy}
                color="default"
                onClick={handleDuplicateSection}
                tooltipProps={{ PopperProps: { disablePortal: true } }}
              />
              <FaIconButton
                title={t("section.deleteSection")}
                icon={faTrash}
                color="default"
                onClick={handleDeleteSection}
                tooltipProps={{ PopperProps: { disablePortal: true } }}
              />
            </Stack>
          )}
        </Stack>
        {!readOnly ? (
          <DndContext
            sensors={sensors}
            onDragEnd={onDrop}
            modifiers={[restrictToVerticalAxis, restrictToParentElement]}
          >
            <SortableContext
              items={section?.products ?? []}
              strategy={verticalListSortingStrategy}
            >
              {section?.products?.map((product) => (
                <SortableItem
                  key={product.id}
                  id={product.id}
                  sx={{
                    "& > *": {
                      transition: "transform 0.3s",
                    },
                    "&.is-dragging > *": {
                      transform: "scale(1.02)",
                    },
                  }}
                >
                  {renderProductCard(product)}
                </SortableItem>
              ))}
            </SortableContext>
          </DndContext>
        ) : (
          section?.products?.map((product) => (
            <Fragment key={product.id}>{renderProductCard(product)}</Fragment>
          ))
        )}
        {!readOnly && (
          <CreateButton sectionId={section?.id} onCreate={onCreateProduct} />
        )}
        {isEstimation && (
          <Card
            sx={{
              borderRadius: 0.8,
              border: "1px solid rgba(0, 0, 0, 0.12)",
              bgcolor: "rgba(25, 25, 25, 0.04)",
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              gap: 1,
            }}
          >
            <Stack p={1}>
              <Typography>{t("totals")}</Typography>
            </Stack>
            <Stack flex={1} p={1}>
              <Typography variant="subtitle1">
                {section?.percentageOfWholeProject
                  ? `${section?.percentageOfWholeProject}%`
                  : "-"}
              </Typography>
              <Typography sx={{}}>{t("percentageOfProject")}</Typography>
            </Stack>
            <Stack flex={1} p={1}>
              <Typography variant="subtitle1">
                {section?.totalSaving ? `$${section?.totalSaving}` : "-"}
              </Typography>
              <Typography sx={{}}>{t("totalSavings")}</Typography>
            </Stack>
            <Stack flex={1} p={1}>
              <Typography variant="subtitle1">
                {section?.totalFinalCost ? `$${section?.totalFinalCost}` : "-"}
              </Typography>
              <Typography sx={{}}>{t("totalCost")}</Typography>
            </Stack>
          </Card>
        )}
      </Stack>
    </div>
  );
};

export default memo(Summary);
