import { useState } from "react";
import GameCanvas from "@/components/GameCanvas";
import type { HudState } from "@/game/scene";

const initialHud: HudState = {
  health: 1000,
  ammo: 30,
  reserve: Number.POSITIVE_INFINITY,
  reloading: false,
  score: 0,
  wave: 1,
  enemies: 6,
  objective: "CLEAR THE CENTRAL COURT",
  zone: "PALM AVENUE",
  locked: false,
  hitMarker: 0,
  killConfirm: 0,
  damagePulse: 0,
  player: { x: 0, z: 34, angle: Math.PI },
  radarEnemies: [],
};

export default function App() {
  const [run, setRun] = useState(0);
  const [hud, setHud] = useState(initialHud);
  const [gameOver, setGameOver] = useState(false);
  const [missionComplete, setMissionComplete] = useState(false);

  const restart = () => {
    setGameOver(false);
    setMissionComplete(false);
    setHud(initialHud);
    setRun((value) => value + 1);
  };

  return (
    <main className="game-shell">
      <GameCanvas
        restartKey={run}
        onHud={setHud}
        onGameOver={() => setGameOver(true)}
        onMissionComplete={() => setMissionComplete(true)}
      />

      <div className="scanlines" aria-hidden="true" />
      <header className="mission-bar">
        <div className="brand-lockup">
          <span className="brand-mark">I</span>
          <div>
            <div className="brand-title">IUT OPS</div>
            <div className="brand-subtitle">CAMPUS RESPONSE UNIT</div>
          </div>
        </div>
        <div className="mission-chip">MISSION 01 <span>//</span> {hud.zone}</div>
        <div className="status-chip"><i /> LIVE FEED</div>
      </header>

      <section className="hud-top-right" aria-label="Mission status">
        <div className="zone-chip"><span>LOCAL ZONE</span><strong>{hud.zone}</strong></div>
        <div className="hud-label">SECTOR</div>
        <div className="hud-value">IUT · GAZIPUR</div>
        <div className="hud-divider" />
        <div className="hud-label">HOSTILES</div>
        <div className="hud-value accent">{String(hud.enemies).padStart(2, "0")}</div>
      </section>

      <section className="radar" aria-label="Campus radar">
        <div className="radar-heading"><span>TACTICAL RADAR</span><b>LIVE</b></div>
        <div className="radar-screen">
          <div className="radar-grid radar-grid-a" /><div className="radar-grid radar-grid-b" />
          <div className="radar-axis radar-axis-x" /><div className="radar-axis radar-axis-y" />
          {hud.radarEnemies.map((enemy, index) => {
            const left = Math.max(5, Math.min(95, ((enemy.x + 36) / 72) * 100));
            const top = Math.max(5, Math.min(95, ((enemy.z + 36) / 72) * 100));
            return <i key={`${index}-${enemy.x}-${enemy.z}`} className="radar-hostile" style={{ left: `${left}%`, top: `${top}%` }} />;
          })}
          <i className="radar-player" style={{ left: `${Math.max(5, Math.min(95, ((hud.player.x + 36) / 72) * 100))}%`, top: `${Math.max(5, Math.min(95, ((hud.player.z + 36) / 72) * 100))}%`, transform: `translate(-50%, -50%) rotate(${hud.player.angle}rad)` }} />
        </div>
        <div className="radar-legend"><span><i className="legend-player" /> OPERATOR</span><span><i className="legend-hostile" /> HOSTILE</span></div>
      </section>

      <div className="crosshair" aria-hidden="true"><span /><span /></div>
      <div className={`hit-marker ${hud.hitMarker > 0 ? "is-visible" : ""}`} aria-hidden="true">×</div>
      <div className={`damage-pulse ${hud.damagePulse > 0 ? "is-visible" : ""}`} aria-hidden="true" />
      <div className={`kill-confirm ${hud.killConfirm > 0 ? "is-visible" : ""}`} aria-live="polite">TARGET DOWN</div>

      <section className="objective-card" aria-live="polite">
        <div className="eyebrow">CURRENT DIRECTIVE</div>
        <div className="objective-title">{hud.objective}</div>
        <div className="objective-meta">WAVE {String(hud.wave).padStart(2, "0")} <span>•</span> WATER COURT APPROACH</div>
      </section>

      <section className="bottom-hud" aria-label="Player status">
        <div className="health-block">
          <div className="eyebrow">VITALS</div>
          <div className="health-row"><strong>{String(hud.health).padStart(4, "0")}</strong><span> / 1000</span></div>
          <div className="health-track"><i style={{ width: `${Math.min(100, (hud.health / 1000) * 100)}%` }} /></div>
        </div>
        <div className={`controls-hint ${hud.reloading ? "is-reloading" : ""}`}><b>W A S D</b> MOVE <b>SHIFT</b> SPRINT <b>R</b> RELOAD <b>LMB</b> FIRE</div>
        <div className="ammo-block">
          <div className="ammo-main">{String(hud.ammo).padStart(2, "0")}</div>
          <div className="ammo-reserve">/ ∞ <span>{hud.reloading ? "RELOADING" : "5.56 · UNLIMITED"}</span></div>
        </div>
      </section>

      <div className="score-chip">SCORE <strong>{String(hud.score).padStart(5, "0")}</strong></div>

      {!hud.locked && !gameOver && (
        <div className="start-prompt">CLICK TO DEPLOY <span>·</span> MOUSE LOOK ENABLES POINTER LOCK</div>
      )}

      {gameOver && (
        <div className="game-over-backdrop">
          <div className="game-over-card">
            <div className="eyebrow">SIGNAL LOST</div>
            <h1>OPERATOR DOWN</h1>
            <p>The central court is still contested. Re-enter the sector and push the next wave back.</p>
            <button onClick={restart}>REDEPLOY <span>↗</span></button>
          </div>
        </div>
      )}
      {missionComplete && (
        <div className="game-over-backdrop mission-complete-backdrop">
          <div className="game-over-card mission-complete-card">
            <div className="eyebrow">MISSION ACCOMPLISHED</div>
            <h1>CENTRAL COURT SECURED</h1>
            <p>All five hostile waves are clear. IUT campus response operations are complete.</p>
            <button onClick={restart}>REDEPLOY <span>↗</span></button>
          </div>
        </div>
      )}
    </main>
  );
}
