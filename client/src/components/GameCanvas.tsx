import { useEffect, useRef } from "react";
import { Engine } from "@babylonjs/core/Engines/engine";
import type { GameHandle, HudState } from "@/game/scene";
import { createGameScene } from "@/game/scene";

type Props = {
  restartKey: number;
  onHud: (hud: HudState) => void;
  onGameOver: () => void;
};

export default function GameCanvas({ restartKey, onHud, onGameOver }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const callbacksRef = useRef({ onHud, onGameOver });
  callbacksRef.current = { onHud, onGameOver };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let disposed = false;
    const engine = new Engine(canvas, true, {
      preserveDrawingBuffer: true,
      stencil: true,
      adaptToDeviceRatio: true,
    });
    let handle: GameHandle | null = null;

    createGameScene(engine, canvas, {
      onHud: (hud) => callbacksRef.current.onHud(hud),
      onGameOver: () => callbacksRef.current.onGameOver(),
    }).then((created) => {
      if (disposed) {
        created.dispose();
        return;
      }
      handle = created;
      engine.runRenderLoop(() => created.scene.render());
    });

    const resize = () => engine.resize();
    window.addEventListener("resize", resize);

    return () => {
      disposed = true;
      window.removeEventListener("resize", resize);
      engine.stopRenderLoop();
      handle?.dispose();
      engine.dispose();
    };
  }, [restartKey]);

  return <canvas ref={canvasRef} className="game-canvas" aria-label="IUT Ops first-person game" />;
}
