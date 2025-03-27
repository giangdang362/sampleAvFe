import { Box, BoxProps, Stack } from "@mui/material";
import { useEffect, useState } from "react";

type TagItem = {
  id?: string;
  name?: string;
};

export interface TagContainerProps extends BoxProps {
  tags: TagItem[];
}

const TAG_GAP = 8;

const TagContainer: React.FC<TagContainerProps> = ({ tags, sx, ...rest }) => {
  const [containerRef, setContainerRef] = useState<HTMLDivElement | null>(null);
  const tagsKey = JSON.stringify(tags.map((tag) => tag.name));

  useEffect(() => {
    if (!containerRef) return;

    const tagDisplayElems = containerRef.querySelectorAll<HTMLElement>(
      ".display-container > .tag-item",
    );
    const moreTagDisplayElem = containerRef.querySelector<HTMLElement>(
      ".display-container > .more-tag-item",
    );
    const tagMeasurementElems = containerRef.querySelectorAll<HTMLElement>(
      ".measurement-helper-container > .tag-item",
    );
    const moreTagMeasurementElem = containerRef.querySelector<HTMLElement>(
      ".measurement-helper-container > .more-tag-item",
    );
    if (!tagDisplayElems.length) return;

    const resizeObserver = new ResizeObserver(() => {
      if (moreTagMeasurementElem) {
        moreTagMeasurementElem.textContent = "";
      }
      const containerWidth = containerRef.offsetWidth;
      const showElems: { [key: string]: HTMLElement } = {};
      let totalWidth = 0;
      let i = 0;

      for (const elem of tagMeasurementElems) {
        const newTotalWidth =
          totalWidth + elem.offsetWidth + (totalWidth === 0 ? 0 : TAG_GAP);
        if (newTotalWidth > containerWidth) {
          for (; i >= 0; i--) {
            if (moreTagMeasurementElem) {
              moreTagMeasurementElem.textContent =
                "+" + (tagMeasurementElems.length - i);
            }

            const newTotalWidth =
              totalWidth +
              (moreTagMeasurementElem?.offsetWidth ?? 0) +
              (totalWidth === 0 ? 0 : TAG_GAP);

            if (newTotalWidth <= containerWidth) {
              break;
            }

            const removedElem = tagMeasurementElems[i - 1];
            const removedElemId = removedElem.dataset.id ?? "";
            delete showElems[removedElemId];

            totalWidth = Math.max(
              totalWidth - (removedElem?.offsetWidth ?? 0) - TAG_GAP,
              0,
            );
          }

          break;
        }

        const elemId = elem.dataset.id ?? "";
        showElems[elemId] = elem;
        totalWidth = newTotalWidth;
        i++;
      }

      tagDisplayElems.forEach((elem) => {
        const elemId = elem.dataset.id ?? "";
        elem.style.display =
          tagDisplayElems.length === 1 || showElems[elemId] ? "" : "none";
        elem.style.maxWidth = containerWidth + "px";
      });

      if (moreTagDisplayElem) {
        if (moreTagMeasurementElem?.textContent && tagDisplayElems.length > 1) {
          moreTagDisplayElem.style.display = "block";
          moreTagDisplayElem.innerText = moreTagMeasurementElem.textContent;
        } else {
          moreTagDisplayElem.style.display = "none";
        }
      }
    });
    resizeObserver.observe(containerRef);

    return () => {
      resizeObserver.disconnect();
    };
  }, [containerRef, tagsKey]);

  return (
    <Box
      ref={setContainerRef}
      position="relative"
      height="32px"
      overflow="hidden"
      {...rest}
      sx={[
        {
          "& .tag-item, & .more-tag-item": {
            p: "8px 12px",
            borderRadius: "100px",
            border: "1px solid #e0e0e0",
            whiteSpace: "nowrap",
            textOverflow: "ellipsis",
            overflow: "hidden",
            lineHeight: "13px",
            fontSize: "13px",
            color: "#00000099",
          },
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <Stack
        className="display-container"
        sx={{
          position: "absolute",
          flexDirection: "row",
          gap: `${TAG_GAP}px`,
          alignItems: "center",
        }}
      >
        {tags.map((tagItem) => {
          return (
            <Box className="tag-item" key={tagItem.id} data-id={tagItem.id}>
              {tagItem.name}
            </Box>
          );
        })}
        <Box className="more-tag-item" display="none" />
      </Stack>

      <Box
        className="measurement-helper-container"
        position="absolute"
        display="flex"
        visibility="hidden"
      >
        {tags.map((tagItem) => {
          return (
            <Box className="tag-item" key={tagItem.id} data-id={tagItem.id}>
              {tagItem.name}
            </Box>
          );
        })}
        <Box className="more-tag-item" />
      </Box>
    </Box>
  );
};

export default TagContainer;
