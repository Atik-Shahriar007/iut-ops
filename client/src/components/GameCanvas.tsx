import { useEffect, useRef } from "react";
import { Engine } from "@babylonjs/core/Engines/engine";
import type { GameHandle, HudState } from "@/game/scene";
import { createGameScene } from "@/game/scene";

type Props = {
  restartKey: number;
  onHud: (hud: HudState) => void;
  onGameOver: () => void;
  onMissionComplete: () => void;
  onCountdown: (value: number) => void;
};

export default function GameCanvas({ restartKey, onHud, onGameOver, onMissionComplete, onCountdown }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const callbacksRef = useRef({ onHud, onGameOver, onMissionComplete, onCountdown });
  callbacksRef.current = { onHud, onGameOver, onMissionComplete, onCountdown };

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
      onMissionComplete: () => callbacksRef.current.onMissionComplete(),
      onCountdown: (value) => callbacksRef.current.onCountdown(value),
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
