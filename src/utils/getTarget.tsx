import type { PanInfo } from "motion/react";

export type Position = `${"top" | "bottom"}-${"right" | "left"}`;

export const getTarget = ({
  info,
  currentPosition,
  wrapperRect,
  draggedItemRef,
}: {
  info: PanInfo;
  currentPosition: Position;
  wrapperRect: DOMRect;
  draggedItemRef: DOMRect;
}) => {
  const VELOCITY_THRESHOLD = 150;
  const scrollX = window.scrollX;
  const scrollY = window.scrollY;

  // Calculate the current position of the dragged element
  const dragX = info.point.x - scrollX - wrapperRect.left;
  const dragY = info.point.y - scrollY - wrapperRect.top;

  const velocityX = info.velocity.x;
  const velocityY = info.velocity.y;

  // Determine which quadrant the drag ended in
  const quadrantX = dragX > wrapperRect.width / 2 ? "right" : "left";
  const quadrantY = dragY > wrapperRect.height / 2 ? "bottom" : "top";

  let targetX = 0;
  let targetY = 0;
  let targetPosition: Position = "bottom-right";

  // Snap to specific corner based on quadrant
  if (quadrantX === "right" && quadrantY === "bottom") {
    // Bottom right
    targetX = currentPosition.includes("right")
      ? 0
      : wrapperRect.width - draggedItemRef.width;
    targetY = currentPosition.includes("bottom")
      ? 0
      : wrapperRect.height - draggedItemRef.height;
    targetPosition = "bottom-right";

    // send it to top right
    if (velocityY < -VELOCITY_THRESHOLD) {
      targetY = currentPosition.includes("top")
        ? 0
        : -wrapperRect.height + draggedItemRef.height;
      targetPosition = "top-right";
    }

    // send it to left bottom or top left
    if (velocityX < -VELOCITY_THRESHOLD) {
      targetX = currentPosition.includes("left")
        ? 0
        : -wrapperRect.width + draggedItemRef.width;
      targetPosition =
        currentPosition.includes("top") && targetY > 0
          ? "bottom-left"
          : currentPosition.includes("bottom") && targetY === 0
          ? "bottom-left"
          : "top-left";
    }
  } else if (quadrantX === "left" && quadrantY === "bottom") {
    // Bottom left

    targetX = currentPosition.includes("left")
      ? 0
      : -wrapperRect.width + draggedItemRef.width;
    targetY = currentPosition.includes("bottom")
      ? 0
      : wrapperRect.height - draggedItemRef.height;

    targetPosition = "bottom-left";

    // send it to top left
    if (velocityY < -VELOCITY_THRESHOLD) {
      targetY = currentPosition.includes("top")
        ? 0
        : -wrapperRect.height + draggedItemRef.height;
      targetPosition = "top-left";
    }

    // send it to bottom right or top right
    if (velocityX > VELOCITY_THRESHOLD) {
      targetX = currentPosition.includes("right")
        ? 0
        : wrapperRect.width - draggedItemRef.width;
      targetPosition =
        currentPosition.includes("top") && targetY > 0
          ? "bottom-right"
          : currentPosition.includes("bottom") && targetY === 0
          ? "bottom-right"
          : "top-right";
    }
  } else if (quadrantX === "right" && quadrantY === "top") {
    // Top right
    targetX = currentPosition.includes("right")
      ? 0
      : wrapperRect.width - draggedItemRef.width;
    targetY = currentPosition.includes("top")
      ? 0
      : -wrapperRect.height + draggedItemRef.height;
    targetPosition = "top-right";

    // send to bottom right
    if (velocityY > VELOCITY_THRESHOLD) {
      targetY = currentPosition.includes("bottom")
        ? 0
        : wrapperRect.height - draggedItemRef.height;
      targetPosition = "bottom-right";
    }
    // send to top left or bottom left
    if (velocityX < -VELOCITY_THRESHOLD) {
      targetX = currentPosition.includes("left")
        ? 0
        : -wrapperRect.width + draggedItemRef.width;
      targetPosition =
        currentPosition.includes("top") && targetY > 0
          ? "bottom-left"
          : currentPosition.includes("bottom") && targetY === 0
          ? "bottom-left"
          : "top-left";
    }
  } else if (quadrantX === "left" && quadrantY === "top") {
    // Top left
    targetX = currentPosition.includes("left")
      ? 0
      : -wrapperRect.width + draggedItemRef.width;
    targetY = currentPosition.includes("top")
      ? 0
      : -wrapperRect.height + draggedItemRef.height;

    targetPosition = "top-left";

    // send to bottom left
    if (velocityY > VELOCITY_THRESHOLD) {
      targetY = currentPosition.includes("bottom")
        ? 0
        : wrapperRect.height - draggedItemRef.height;
      targetPosition = "bottom-left";
    }

    // send to top right or bottom right
    if (velocityX > VELOCITY_THRESHOLD) {
      targetX = currentPosition.includes("right")
        ? 0
        : wrapperRect.width - draggedItemRef.width;
      targetPosition =
        currentPosition.includes("top") && targetY > 0
          ? "bottom-right"
          : currentPosition.includes("bottom") && targetY === 0
          ? "bottom-right"
          : "top-right";
    }
  }

  return {
    targetX,
    targetY,
    targetPosition,
  };
};
