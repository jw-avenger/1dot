import { memo } from "react";
import roomImg from "@/assets/cozy-dashboard-room.jpg";

type Props = {
  /** Click handler for the trash can object (only wired link so far). */
  onTrashClick: () => void;
};

/**
 * Cozy expanded-mode dashboard.
 *
 * A painterly illustrated room sits behind invisible clickable hotspots —
 * each room object will become a link to its matching destination. Only
 * the trash can is wired in this first pass; other objects render as art.
 *
 * Hotspots are positioned in percent of the 1024×1024 illustration so they
 * stay locked to their object at any responsive size.
 */
function CozyDashboardRoomImpl({ onTrashClick }: Props) {
  return (
    <div
      className="relative w-full overflow-hidden rounded-md shadow-inner"
      style={{ aspectRatio: "1 / 1" }}
    >
      <img
        src={roomImg}
        alt=""
        loading="lazy"
        width={1024}
        height={1024}
        className="absolute inset-0 h-full w-full select-none object-cover"
        draggable={false}
      />

      {/* Trash can hotspot (bottom-right). */}
      <button
        type="button"
        onClick={onTrashClick}
        aria-label="Open trash"
        title="Trash"
        className="group absolute rounded-xl outline-none transition focus-visible:ring-2 focus-visible:ring-paper/80"
        style={{ left: "80%", top: "74%", width: "13%", height: "22%" }}
      >
        <span
          aria-hidden
          className="absolute inset-0 rounded-xl opacity-0 transition group-hover:opacity-100 group-focus-visible:opacity-100"
          style={{
            boxShadow:
              "0 0 0 2px rgba(245,217,154,0.55), 0 0 24px 6px rgba(245,217,154,0.35)",
          }}
        />
      </button>
    </div>
  );
}

export const CozyDashboardRoom = memo(CozyDashboardRoomImpl);
