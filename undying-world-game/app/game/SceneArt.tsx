export function SceneArt({ roomId }: { roomId: string }) {
  const props = { className: `scene-art art-${roomId}`, "aria-hidden": true } as const;
  if (roomId === "dining") return <div {...props}><i className="window"/><i className="table"/><i className="seat s1"/><i className="seat s2"/><i className="seat s3"/><i className="seat s4"/><i className="seat s5"/><i className="seat s6"/><i className="seat s7"/></div>;
  if (roomId === "shrine") return <div {...props}><i className="altar"/><i className="portrait p1"/><i className="portrait p2"/><i className="incense"/><i className="book"/></div>;
  if (roomId === "bedroom") return <div {...props}><i className="window"/><i className="bed"/><i className="wardrobe"/><i className="chest"/><i className="doorframe"/></div>;
  if (roomId === "courtyard") return <div {...props}><i className="moon"/><i className="roof"/><i className="wall"/><i className="figure"/><i className="brazier"/></div>;
  if (roomId === "account") return <div {...props}><i className="window"/><i className="cabinet"/><i className="desk"/><i className="lamp"/><i className="abacus"/></div>;
  if (roomId.startsWith("old-tableau-")) return <div {...props}><i className="c3-grid"/><i className="c3-panel panel-one"/><i className="c3-panel panel-two"/><i className="c3-marker"/><i className="c3-line"/></div>;
  if (roomId.startsWith("living-")) return <div {...props}><i className="c4-web"/><i className="c4-person person-one"/><i className="c4-person person-two"/><i className="c4-person person-three"/><i className="c4-seat seat-one"/><i className="c4-seat seat-two"/><i className="c4-truth"/></div>;
  if (roomId.startsWith("final-banquet-")) return <div {...props}><i className="c5-window"/><i className="c5-table"/><i className="c5-seat seat-a"/><i className="c5-seat seat-b"/><i className="c5-seat seat-c"/><i className="c5-seat seat-d"/><i className="c5-seat seat-e"/><i className="c5-seat seat-f"/><i className="c5-nameless"/><i className="c5-evidence"/></div>;
  return <div {...props}><i className="light"/><i className="window"/><i className="shelf left"/><i className="shelf right"/><i className="desk"/></div>;
}
