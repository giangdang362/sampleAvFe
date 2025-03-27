import { faPlus } from "@/lib/fas/pro-light-svg-icons";
import { useCreatePinboardSectionMutation } from "@/services/pinboards";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { LoadingButton } from "@mui/lab";
import { Box, BoxProps, Divider } from "@mui/material";
import { useTranslations } from "next-intl";
import PinboardSection from "./PinboardSection";
import { Flipper, Flipped } from "react-flip-toolkit";
import { useEffect, createContext, useMemo, useRef, useCallback } from "react";

export interface DesignListProps extends BoxProps {
  pinboard: API.Pinboard;
  getLastestPinboard?: () => Promise<API.Pinboard>;
  noteMode?: boolean;
  readOnly?: boolean;
}

export type PinboardInfoContext = {
  pinboardId: string;
  noteMode: boolean;
  readOnly: boolean;
} | null;
export const PinboardInfoContext = createContext<PinboardInfoContext>(null);

export type PinboardDataContext = API.Pinboard | null;
export const PinboardDataContext = createContext<PinboardDataContext>(null);

const DesignList: React.FC<DesignListProps> = ({
  pinboard,
  getLastestPinboard,
  noteMode = false,
  readOnly = false,
  ...rest
}) => {
  const t = useTranslations("pinboard.section");
  const [createSection, { isLoading }] = useCreatePinboardSectionMutation();

  const pinboardId = pinboard.id;
  const sections = pinboard.sections;

  useEffect(() => {
    if (readOnly) return;

    const main = document.body.querySelector("main");
    if (!main) return;

    const prevOverflowY = main.style.overflowY;

    // stablize screen when ordering items
    main.style.overflowY = "scroll";

    return () => {
      main.style.overflowY = prevOverflowY;
    };
  }, [readOnly]);

  const boxRef = useRef<HTMLDivElement>(null);

  const handleGetLastestSection = useCallback(
    async (sectionId: string) => {
      if (!getLastestPinboard) {
        throw new Error("Missing getLastestPinboard");
      }

      const pinboard = await getLastestPinboard();
      const lastestSection = pinboard.sections.find(
        (item) => item.id === sectionId,
      );

      if (!lastestSection) {
        throw new Error("Section not found");
      }

      return lastestSection;
    },
    [getLastestPinboard],
  );

  return (
    <PinboardDataContext.Provider value={pinboard}>
      <PinboardInfoContext.Provider
        value={useMemo(
          () => ({ pinboardId: pinboard.id, noteMode, readOnly }),
          [pinboard.id, noteMode, readOnly],
        )}
      >
        <Box
          ref={boxRef}
          {...rest}
          sx={[
            {
              "&.is-moving .invisible-when-moving": {
                opacity: "0 !important",
              },
            },
            ...(Array.isArray(rest.sx) ? rest.sx : [rest.sx]),
          ]}
        >
          <Flipper
            flipKey={sections?.map((s) => s.id).join("")}
            onStart={() => boxRef.current?.classList.add("is-moving")}
            onComplete={() => boxRef.current?.classList.remove("is-moving")}
          >
            {sections?.map((section) => (
              <Flipped key={section.id} flipId={section.id}>
                <PinboardSection
                  section={section}
                  getLastestSection={
                    getLastestPinboard ? handleGetLastestSection : undefined
                  }
                  mb={5}
                />
              </Flipped>
            ))}
          </Flipper>

          {!readOnly ? (
            <Divider sx={{ mb: 3 }}>
              <LoadingButton
                startIcon={<FontAwesomeIcon icon={faPlus} />}
                sx={{
                  fontWeight: 400,
                  color: "var(--mui-palette-neutral-400)",
                }}
                onClick={() =>
                  createSection({ id: pinboardId, name: t("untitledSection") })
                }
                loading={isLoading}
              >
                {t("createNewSection")}
              </LoadingButton>
            </Divider>
          ) : (
            <Box height="30px" />
          )}
        </Box>
      </PinboardInfoContext.Provider>
    </PinboardDataContext.Provider>
  );
};

export default DesignList;
