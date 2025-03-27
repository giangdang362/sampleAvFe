import SideDialog, { SideDialogProps } from "@/components/common/side-dialog";
import { faLink } from "@/lib/fas/pro-regular-svg-icons";
import { useLazyGetPinterestImagesQuery } from "@/services/images";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  Typography,
  InputAdornment,
  CircularProgress,
  Box,
  Button,
} from "@mui/material";
import { useTranslations } from "next-intl";
import { useState, useRef, useEffect } from "react";
import { faCircleCheck } from "@/lib/fas/pro-solid-svg-icons";
import UserTextField from "@/components/common/UserTextField";

export interface AddPinterestDialogProps
  extends Omit<SideDialogProps, "title"> {
  onAdd: (images: string[]) => void | Promise<void>;
}

const AddPinterestDialog: React.FC<AddPinterestDialogProps> = ({
  onAdd,
  onClose,
  ...rest
}) => {
  const t = useTranslations();
  const [loading, setLoading] = useState(false);
  const pinterestUrlRef = useRef<string>();

  const [pinterestImages, setPinterestImages] = useState<string[]>();
  const [selectedPinterestImages, setSelectedPinterestImages] = useState<
    string[]
  >([]);
  const [getPinterestImages, { isFetching }] = useLazyGetPinterestImagesQuery();
  const [showPinterestUrlInvalidMsg, setShowPinterestUrlInvalidMsg] =
    useState(false);

  const handleGetPinterestImages = () => {
    if (pinterestUrlRef.current) {
      let pinterestPin: string | undefined,
        pinterestUser: string | undefined,
        pinterestBoard: string | undefined;

      const pinterestPinRegex =
        /^https:\/\/(?:www\.)?pinterest\.com\/pin\/(?:|[^/?]+--)?([^/?]+)\/?(?:\?.*)?$/;
      const pinterestUserRegex =
        /^https:\/\/(?:www\.)?pinterest\.com\/([^/?]+)(\/boards)?\/?(?:\?.*)?$/;
      const pinterestBoardRegex =
        /^https:\/\/(?:www\.)?pinterest\.com\/([^/?]+)\/([^/?]+)\/?(?:\?.*)?$/;
      [, pinterestPin] = pinterestPinRegex.exec(pinterestUrlRef.current) ?? [];
      if (!pinterestPin) {
        [, pinterestUser] =
          pinterestUserRegex.exec(pinterestUrlRef.current) ?? [];
        if (!pinterestUser) {
          [, pinterestUser, pinterestBoard] =
            pinterestBoardRegex.exec(pinterestUrlRef.current) ?? [];
        }

        if (pinterestUser === "pin") {
          pinterestUser = undefined;
        }
      }

      if (pinterestPin || pinterestUser) {
        getPinterestImages(
          pinterestPin
            ? { pinId: pinterestPin }
            : {
                userId: pinterestUser as string, // believe me
                boardId: pinterestBoard,
              },
        )
          .unwrap()
          .then((res) => {
            const newPinterestImages = res.flatMap((data) => {
              if ("images" in data) {
                let imageUrl: string | undefined;
                let maxImageWidth = -Infinity;
                for (const image of Object.values(data.images)) {
                  if (image.width > maxImageWidth) {
                    maxImageWidth = image.width;
                    imageUrl = image.url;
                  }
                }

                return imageUrl ? [imageUrl] : [];
              }

              return [];
            });

            if (!newPinterestImages.length) {
              setShowPinterestUrlInvalidMsg(true);
            } else {
              setPinterestImages(newPinterestImages);
            }
          })
          .catch((e: unknown) => {
            if (
              typeof e === "object" &&
              e &&
              "status" in e &&
              typeof e.status === "number" &&
              (e.status >= 400 || e.status <= 499)
            ) {
              setShowPinterestUrlInvalidMsg(true);
            }
          });
      } else {
        setShowPinterestUrlInvalidMsg(true);
      }

      setPinterestImages(undefined);
      setSelectedPinterestImages([]);
    }
  };

  useEffect(() => {
    if (rest.open) {
      setPinterestImages(undefined);
      setSelectedPinterestImages([]);
      setShowPinterestUrlInvalidMsg(false);
    }
  }, [rest.open]);

  return (
    <SideDialog
      title={t("addImages.addFromPinterest")}
      confirmButton={{
        title: t("common.add"),
        disabled: !selectedPinterestImages.length,
        loading,
        onClick: async (e) => {
          setLoading(true);
          await onAdd(selectedPinterestImages);
          setLoading(false);
          onClose?.(e);
        },
      }}
      closeOnConfirm={false}
      cancelButton={{ title: t("common.cancel"), disabled: loading }}
      {...rest}
      onClose={loading ? undefined : onClose}
    >
      <Typography
        component="p"
        variant="caption"
        color="var(--mui-palette-neutral-400)"
        mb={3}
      >
        {t("addImages.pinterestGuide")}
      </Typography>

      <UserTextField
        fullWidth
        required
        size="medium"
        label={t("addImages.imageLink")}
        type="url"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <FontAwesomeIcon width="1rem" height="1rem" icon={faLink} />
            </InputAdornment>
          ),
        }}
        error={showPinterestUrlInvalidMsg}
        helperText={
          showPinterestUrlInvalidMsg ? "Invalid Pinterest url" : undefined
        }
        onChange={(e) => {
          pinterestUrlRef.current = e.target.value;
          setShowPinterestUrlInvalidMsg(false);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            handleGetPinterestImages();
            e.preventDefault();
          }
        }}
        sx={{ mb: 3 }}
      />

      {isFetching ? (
        <CircularProgress sx={{ display: "block", mx: "auto" }} />
      ) : (
        <Box display="grid" gridTemplateColumns="1fr 1fr 1fr" gap={1.5}>
          {pinterestImages?.map((image) => {
            const selected = selectedPinterestImages.includes(image);
            return (
              <Button
                key={image}
                sx={{
                  width: "100%",
                  aspectRatio: 1,
                  overflow: "hidden",
                  position: "relative",
                  p: 0,
                }}
                onClick={() => {
                  if (selected) {
                    setSelectedPinterestImages(
                      selectedPinterestImages?.filter((item) => item !== image),
                    );
                  } else {
                    setSelectedPinterestImages([
                      ...selectedPinterestImages,
                      image,
                    ]);
                  }
                }}
              >
                <img
                  src={image}
                  alt=""
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    backgroundColor: "var(--mui-palette-neutral-200)",
                  }}
                />
                {selected && (
                  <Box
                    position="absolute"
                    top={0}
                    left={0}
                    right={0}
                    bottom={0}
                    bgcolor="rgba(0, 0, 0, 0.4)"
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                  >
                    <FontAwesomeIcon
                      style={{
                        width: "1.3rem",
                        height: "1.3rem",
                        color: "var(--mui-palette-primary-contrastText)",
                      }}
                      icon={faCircleCheck}
                    />
                  </Box>
                )}
              </Button>
            );
          })}
        </Box>
      )}
    </SideDialog>
  );
};

export default AddPinterestDialog;
