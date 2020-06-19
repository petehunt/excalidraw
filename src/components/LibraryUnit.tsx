import React, { useRef, useEffect, useState } from "react";
import { exportToSvg } from "../scene/export";
import { ExcalidrawElement, NonDeleted } from "../element/types";
import { close } from "../components/icons";

import "./LibraryUnit.scss";
import { t } from "../i18n";

export const LibraryUnit = ({
  elements,
  onRemoveFromLibrary,
}: {
  elements?: NonDeleted<ExcalidrawElement>[];
  onRemoveFromLibrary: () => void;
}) => {
  const ref = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!elements) {
      return;
    }
    const svg = exportToSvg(elements, {
      exportBackground: false,
      viewBackgroundColor: "#fff",
      shouldAddWatermark: false,
    });
    for (const child of ref.current!.children) {
      if (child.tagName !== "svg") {
        continue;
      }
      ref.current!.removeChild(child);
    }
    ref.current!.appendChild(svg);

    const current = ref.current!;
    return () => {
      current.removeChild(svg);
    };
  }, [elements]);

  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="library-unit"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className="library-unit__dragger"
        ref={ref}
        draggable={true}
        onDragStart={(event) => {
          setIsHovered(false);
          event.dataTransfer.setData(
            "application/vnd.excalidraw.json",
            JSON.stringify(elements),
          );
        }}
      />
      {elements && isHovered && (
        <button
          className="library-unit__removeFromLibrary"
          aria-label={t("labels.removeFromLibrary")}
          onClick={onRemoveFromLibrary}
        >
          {close}
        </button>
      )}
    </div>
  );
};
