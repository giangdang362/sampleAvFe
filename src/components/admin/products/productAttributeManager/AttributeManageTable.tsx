import { faPlus } from "@/lib/fas/pro-regular-svg-icons";
import {
  useCreateConstSlugMutation,
  useDeleteConstSlugMutation,
  useGetClientOrderConstSlugQuery,
  usePatchConstSlugMutation,
} from "@/services/slug";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Box, BoxProps, Button, List, Typography } from "@mui/material";
import { useTranslations } from "next-intl";
import AttributeManageItem from "./AttributeManageItem";
import { useLayoutEffect, useRef, useState } from "react";
import AttributeManageAddNew, {
  AttributeManageAddNewRef,
} from "./AttributeManageAddNew";
import { noop } from "lodash";
import AttributeManageSubheader from "./AttributeManageSubheader";
import DataStateOverlay from "@/components/common/DataStateOverflay";

export interface AttributeManageTableProps extends BoxProps {
  slug: string;
  title: string;
  twoLevel?: boolean;
}

const AttributeManageTable: React.FC<AttributeManageTableProps> = ({
  slug,
  title,
  twoLevel,
  ...rest
}) => {
  const t = useTranslations("common");
  const addNewRef = useRef<AttributeManageAddNewRef>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const { currentData, isFetching, isError } = useGetClientOrderConstSlugQuery({
    slug,
  });

  const [patchAttr] = usePatchConstSlugMutation();
  const [createAttr, { isLoading: isCreating }] = useCreateConstSlugMutation();
  const [deleteAttr] = useDeleteConstSlugMutation();

  const handleCreate = (parentId: number, value: string) => {
    return createAttr({
      slug: "",
      enName: value,
      zhoName: value,
      parent: { id: parentId },
    })
      .unwrap()
      .then(() => setIsAddingNew(false))
      .catch();
  };

  const handleChange = (id: number, value: string) => {
    patchAttr({ id, enName: value, zhoName: value });
  };

  const handleDelete = (id: number) => {
    return deleteAttr({ id }).then(noop);
  };

  useLayoutEffect(() => {
    setIsAddingNew(false);
  }, [slug]);

  const AttributeRenderItem = twoLevel
    ? AttributeManageSubheader
    : AttributeManageItem;

  return (
    <Box
      border="1px solid var(--mui-palette-divider)"
      borderRadius={1.5}
      mb="100px"
      {...rest}
    >
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        px={2}
        pt={3}
        pb={1}
      >
        <Typography component="h2" variant="subtitle1">
          {title}
        </Typography>

        <Button
          size="small"
          startIcon={<FontAwesomeIcon icon={faPlus} />}
          sx={{ px: 0.5 }}
          onClick={() => {
            setIsAddingNew(true);
            addNewRef.current?.focusInput();
          }}
        >
          {t("new")}
        </Button>
      </Box>

      {isAddingNew && (
        <AttributeManageAddNew
          ref={addNewRef}
          onConfirm={(value) => {
            if (!currentData) return;
            handleCreate(currentData.id, value);
          }}
          onCancel={() => setIsAddingNew(false)}
          sx={{
            borderBottom: "1px solid var(--mui-palette-divider)",
            "& .MuiInputBase-input": twoLevel
              ? { fontWeight: "500" }
              : undefined,
          }}
          loading={isCreating}
          padding={twoLevel}
        />
      )}

      <DataStateOverlay
        isError={isError}
        isFetching={!currentData && isFetching}
        isEmpty={currentData?.children.length === 0}
      >
        <List disablePadding>
          {currentData?.children.map((item, index) => (
            <AttributeRenderItem
              key={item.id}
              id={item.id}
              value={item.enName}
              items={item.children}
              onChange={handleChange}
              onDelete={handleDelete}
              {...(twoLevel
                ? {
                    onCreate: handleCreate,
                  }
                : {})}
              sx={{
                borderTop:
                  index !== 0
                    ? "1px solid var(--mui-palette-divider)"
                    : undefined,
              }}
            />
          ))}
        </List>
      </DataStateOverlay>
    </Box>
  );
};

export default AttributeManageTable;
