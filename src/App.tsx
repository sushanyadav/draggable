import {
  AnimatePresence,
  DragHandlers,
  motion,
  MotionValue,
  useAnimate,
  useMotionValue,
  useMotionValueEvent,
} from "motion/react";
import { useEffect, useRef, useState } from "react";
import { cn } from "./utils/cn";
import { getTarget, Position } from "./utils/getTarget";

export const App = () => {
  const [isPlaylistExpanded, setIsPlaylistExpanded] = useState(false);
  const [position, setPosition] = useState<Position>("bottom-right");
  const [isAnimating, setIsAnimating] = useState(false);
  const [showPlayer, setShowPlayer] = useState(true);
  const [debug, setDebug] = useState(true);
  const [scope, animate] = useAnimate();

  const xPos = useMotionValue(0);
  const yPos = useMotionValue(0);

  const constraintsRef = useRef<HTMLDivElement>(null);
  const draggedItem = useRef<HTMLDivElement>(null);

  const handleDragEnd: DragHandlers["onDragEnd"] = async (_, info) => {
    const wrapperRect = constraintsRef.current?.getBoundingClientRect();
    const draggedItemRef = draggedItem.current?.getBoundingClientRect();

    if (!wrapperRect || !draggedItemRef) return;

    const { targetX, targetY, targetPosition } = getTarget({
      info,
      wrapperRect,
      draggedItemRef,
      currentPosition: position,
    });

    if (targetPosition !== position) {
      setIsAnimating(true);
    }

    await animate([
      [xPos, targetX, { type: "spring", duration: 0.5, bounce: 0.16 }],
      [yPos, targetY, { type: "spring", duration: 0.5, bounce: 0.16, at: "<" }],
    ]);

    setPosition(targetPosition as Position);
    setIsAnimating(false);
    setTimeout(() => {
      xPos.set(0);
      yPos.set(0);
    }, 0);
  };

  const dismissPlayer = () => {
    setShowPlayer(false);
    setIsPlaylistExpanded(false);
  };

  useEffect(() => {
    // dismiss player on esc
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        dismissPlayer();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [debug]);

  return (
    <main ref={scope} className="min-h-dvh bg-black/90 text-white">
      <div
        ref={constraintsRef}
        className="fixed inset-4 grid place-items-center"
      >
        {!showPlayer ? (
          <motion.button
            onClick={() => setShowPlayer(!showPlayer)}
            whileTap={{ scale: 0.9 }}
            className="bg-white/10 rounded-lg px-4 py-2 text-xs !outline-none"
          >
            Show player
          </motion.button>
        ) : (
          <div>
            <motion.button
              onClick={() => setDebug(!debug)}
              whileTap={{ scale: 0.9 }}
              className="bg-white/10 rounded-lg px-4 py-2 text-xs !outline-none"
            >
              Debug {debug ? "off" : "on"}
            </motion.button>
            {debug && <Debug position={position} xPos={xPos} yPos={yPos} />}
          </div>
        )}

        <AnimatePresence>
          {showPlayer && (
            <motion.div
              drag
              dragElastic={{
                top: 0.5,
                bottom: 0.5,
                left: 0.5,
                right: 0.5,
              }}
              ref={draggedItem}
              dragConstraints={constraintsRef}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{
                opacity: 0,
                transition: {
                  type: "tween",
                  ease: "easeOut",
                  duration: 0.1,
                },
              }}
              style={{
                y: yPos,
                x: xPos,
              }}
              onDragEnd={handleDragEnd}
              transition={{
                opacity: {
                  type: "tween",
                  ease: "easeOut",
                  duration: 0.2,
                },
              }}
              className={cn(
                "w-[calc(100vw-32px)] [@media(min-width:400px)]:max-w-[300px] rounded-lg bg-red-400 overflow-hidden fixed",
                {
                  "bottom-[inherit] left-[inherit]": position === "bottom-left",
                  "top-[inherit] left-[inherit]": position === "top-left",
                  "bottom-[inherit] right-[inherit]":
                    position === "bottom-right",
                  "top-[inherit] right-[inherit]": position === "top-right",
                  "pointer-events-none": isAnimating,
                }
              )}
            >
              <div className="h-[100px] relative rounded-[inherit]">
                <ExpandButton
                  isPlaylistExpanded={isPlaylistExpanded}
                  onClick={() => setIsPlaylistExpanded(!isPlaylistExpanded)}
                />
                <CloseButton onClick={dismissPlayer} />
              </div>
              <AnimatePresence initial={false}>
                {isPlaylistExpanded && <Playlist />}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
};

const ExpandButton = ({
  isPlaylistExpanded,
  onClick,
}: {
  isPlaylistExpanded: boolean;
  onClick: () => void;
}) => {
  return (
    <button
      onClick={onClick}
      className="absolute right-2 bottom-2 !outline-none active:scale-75 transition-transform"
      aria-label={isPlaylistExpanded ? "Collapse playlist" : "Expand playlist"}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="32"
        height="32"
        fill="currentColor"
        viewBox="0 0 256 256"
        className="size-5"
      >
        <path d="M32,64a8,8,0,0,1,8-8H216a8,8,0,0,1,0,16H40A8,8,0,0,1,32,64Zm8,72H160a8,8,0,0,0,0-16H40a8,8,0,0,0,0,16Zm72,48H40a8,8,0,0,0,0,16h72a8,8,0,0,0,0-16Zm135.66-57.7a8,8,0,0,1-10,5.36L208,122.75V192a32.05,32.05,0,1,1-16-27.69V112a8,8,0,0,1,10.3-7.66l40,12A8,8,0,0,1,247.66,126.3ZM192,192a16,16,0,1,0-16,16A16,16,0,0,0,192,192Z"></path>
      </svg>
    </button>
  );
};

const CloseButton = ({ onClick }: { onClick: () => void }) => {
  return (
    <button
      onClick={onClick}
      className="absolute right-2 top-2 !outline-none active:scale-75 transition-transform"
      aria-label="Close player"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="32"
        height="32"
        fill="currentColor"
        viewBox="0 0 256 256"
        className="size-3"
      >
        <path d="M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z"></path>
      </svg>
    </button>
  );
};

const Playlist = () => {
  return (
    <motion.div
      initial={{ height: 0 }}
      animate={{
        height: "auto",
      }}
      exit={{
        height: 0,
        transition: { duration: 0.18 },
      }}
      transition={{ duration: 0.3, type: "spring", bounce: 0.26 }}
      className="overflow-hidden rounded-b-[inherit] "
    >
      <div className="space-y-1 rounded-[inherit] bg-red-600/20 p-2 border-t border-white/10">
        <span className="text-[10px] font-medium text-white uppercase block mb-2">
          Playlists...
        </span>
        <div className="h-[15px] rounded w-full bg-red-600/30"></div>
        <div className="h-[15px] rounded w-full bg-red-600/30"></div>
        <div className="h-[15px] rounded w-full bg-red-600/30"></div>
        <div className="h-[15px] rounded w-full bg-red-600/30"></div>
        <div className="h-[15px] rounded w-full bg-red-600/30"></div>
      </div>
    </motion.div>
  );
};

const Debug = ({
  position: _position,
  xPos,
  yPos,
}: {
  position: Position;
  xPos: MotionValue<number>;
  yPos: MotionValue<number>;
}) => {
  const [x, setX] = useState(0);
  const [y, setY] = useState(0);

  useMotionValueEvent(xPos, "change", (x) => setX(x));
  useMotionValueEvent(yPos, "change", (y) => setY(y));

  const positions = {
    "bottom-right": "bottom-4 right-4",
    "bottom-left": "bottom-4 left-4",
    "top-right": "top-4 right-4",
    "top-left": "top-4 left-4",
  };

  const position = positions[_position];

  return (
    <div className="p-2 text-[10px]">
      <span className="font-medium">CSS:</span> {position}
      <span className="block mt-2">X Position: {x.toFixed(4)}</span>
      <span className="block">Y Position: {y.toFixed(4)}</span>
    </div>
  );
};
