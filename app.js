const raidDataStore = window.raidData || {};
const startButton = document.getElementById("start-overlay");
const statusText = document.getElementById("status-text");

let currentRaid = raidDataStore.micaela || null;
let pipWindow = null;
let overlayState = {
  view: "start",
  phaseIndex: null,
  monsterIndex: null,
};

function updateStatus(message) {
  if (statusText) {
    statusText.textContent = message;
  }
}

function getPhase() {
  if (
    !currentRaid ||
    overlayState.phaseIndex === null ||
    overlayState.phaseIndex < 0
  ) {
    return null;
  }
  return currentRaid.phases[overlayState.phaseIndex] || null;
}

function getMonster() {
  const phase = getPhase();
  if (
    !phase ||
    overlayState.monsterIndex === null ||
    overlayState.monsterIndex < 0
  ) {
    return null;
  }
  return phase.monsters[overlayState.monsterIndex] || null;
}

function updateOverlayStatus() {
  if (!currentRaid) {
    updateStatus("레이드 데이터를 찾을 수 없습니다.");
    return;
  }

  if (overlayState.view === "start") {
    updateStatus(
      "오버레이를 열면 단계 → 몬스터 → 기믹 순으로 빠르게 확인할 수 있습니다.",
    );
    return;
  }

  const phase = getPhase();
  const monster = getMonster();

  if (overlayState.view === "phase" && phase) {
    updateStatus(`${phase.name}를 선택했습니다. 몬스터를 선택해 주세요.`);
    return;
  }

  if (overlayState.view === "monster" && phase && monster) {
    updateStatus(`${phase.name}의 ${monster.name}를 선택했습니다.`);
    return;
  }

  if (overlayState.view === "gimmick" && monster) {
    updateStatus(`${monster.name}의 기믹을 확인 중입니다.`);
  }
}

function renderOverlayContent() {
  if (!pipWindow) {
    return;
  }

  const body = pipWindow.document.body;
  body.innerHTML = "";

  const style = pipWindow.document.createElement("style");
  style.textContent = `
    :root { color-scheme: dark; }
    * { box-sizing: border-box; }
    html, body {
      margin: 0;
      min-height: 100%;
      min-width: 100%;
    }
    body {
      font-family: "Segoe UI", "Malgun Gothic", sans-serif;
      background: #0b0e14;
      color: #f4f7fb;
      overflow: hidden;
    }
    .overlay-shell {
      min-height: 100vh;
      min-width: 100vw;
      display: flex;
      align-items: flex-end;
      justify-content: center;
      padding: 12px;
      background: radial-gradient(circle at top, rgba(255, 209, 102, 0.18), transparent 45%), #0b0e14;
    }
    .overlay-card {
      width: min(100%, 100vw);
      max-width: 780px;
      padding: clamp(16px, 2.5vw, 24px);
      border-radius: 18px 18px 10px 10px;
      background: rgba(20, 24, 32, 0.96);
      border: 1px solid rgba(255, 209, 102, 0.35);
      box-shadow: 0 16px 42px rgba(0, 0, 0, 0.35);
    }
    .overlay-label {
      font-size: clamp(0.75rem, 1.2vw, 0.9rem);
      color: #ffd166;
      letter-spacing: 0.16em;
      text-transform: uppercase;
      margin-bottom: 10px;
    }
    .overlay-title {
      font-size: clamp(1.05rem, 2.2vw, 1.4rem);
      font-weight: 700;
      margin-bottom: 10px;
      color: #f4f7fb;
    }
    .overlay-description {
      font-size: clamp(0.85rem, 1.6vw, 1rem);
      color: #bfc8d3;
      line-height: 1.6;
      margin-bottom: 16px;
    }
    .overlay-grid {
      display: grid;
      gap: 10px;
      grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    }
    .overlay-btn {
      width: 100%;
      min-height: 50px;
      padding: clamp(10px, 1.8vw, 14px) clamp(12px, 2vw, 16px);
      border: none;
      border-radius: 14px;
      background: #202633;
      color: #f4f7fb;
      font-size: clamp(0.95rem, 1.8vw, 1.1rem);
      cursor: pointer;
      text-align: center;
      font-weight: 600;
    }
    .overlay-btn:hover {
      background: #2a3140;
    }
    .overlay-btn.active {
      background: #ffd166;
      color: #151821;
    }
    .overlay-subtitle {
      font-size: clamp(0.85rem, 1.5vw, 0.98rem);
      color: #9aa4b2;
      margin-bottom: 10px;
    }
    .overlay-footer {
      display: flex;
      gap: 10px;
      margin-top: 14px;
      flex-wrap: wrap;
    }
    .overlay-footer .overlay-btn {
      flex: 1 1 140px;
    }
    .gimmick-list {
      list-style: none;
      padding: 0;
      margin: 10px 0 0;
      display: grid;
      gap: 10px;
    }
    .gimmick-list li {
      padding: clamp(10px, 1.8vw, 14px);
      border-radius: 10px;
      background: rgba(255, 255, 255, 0.05);
      color: #f8fafc;
      line-height: 1.6;
      font-size: clamp(0.92rem, 1.9vw, 1rem);
    }
  `;
  pipWindow.document.head.appendChild(style);

  const style = pipWindow.document.createElement("style");
  style.textContent = `
    :root { color-scheme: dark; }
    * { box-sizing: border-box; }
    html, body {
      margin: 0;
      min-height: 100%;
      min-width: 100%;
    }
    body {
      font-family: "Segoe UI", "Malgun Gothic", sans-serif;
      background: #0b0e14;
      color: #f4f7fb;
      overflow: hidden;
    }
    .overlay-shell {
      min-height: 100vh;
      min-width: 100vw;
      display: flex;
      align-items: flex-end;
      justify-content: center;
      padding: 8px 12px;
      background: radial-gradient(circle at top, rgba(255, 209, 102, 0.12), transparent 45%), #0b0e14;
    }
    .overlay-card {
      width: calc(100% - 24px);
      max-width: none;
      align-self: stretch;
      padding: clamp(12px, 2vw, 22px);
      border-radius: 12px 12px 8px 8px;
      background: rgba(20, 24, 32, 0.96);
      border: 1px solid rgba(255, 209, 102, 0.18);
      box-shadow: 0 12px 36px rgba(0, 0, 0, 0.35);
      box-sizing: border-box;
    }
    .overlay-label {
      font-size: clamp(0.75rem, 1.2vw, 0.9rem);
      color: #ffd166;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      margin-bottom: 8px;
    }
    .overlay-title {
      font-size: clamp(1rem, 2.1vw, 1.4rem);
      font-weight: 700;
      margin-bottom: 8px;
      color: #f4f7fb;
    }
    .overlay-description {
      font-size: clamp(0.85rem, 1.4vw, 1rem);
      color: #bfc8d3;
      line-height: 1.5;
      margin-bottom: 12px;
    }
    .overlay-grid {
      display: grid;
      gap: 10px;
      grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    }
    .overlay-btn {
      width: 100%;
      min-height: 48px;
      padding: clamp(10px, 1.6vw, 14px) clamp(12px, 2vw, 16px);
      border: none;
      border-radius: 12px;
      background: #202633;
      color: #f4f7fb;
      font-size: clamp(0.95rem, 1.6vw, 1.05rem);
      cursor: pointer;
      text-align: center;
      font-weight: 600;
      box-sizing: border-box;
    }
    .overlay-btn:hover {
      background: #2a3140;
    }
    .overlay-btn.active {
      background: #ffd166;
      color: #151821;
    }
    .overlay-subtitle {
      font-size: clamp(0.85rem, 1.3vw, 0.98rem);
      color: #9aa4b2;
      margin-bottom: 10px;
    }
    .overlay-footer {
      display: flex;
      gap: 10px;
      margin-top: 12px;
      flex-wrap: wrap;
    }
    .overlay-footer .overlay-btn {
      flex: 1 1 140px;
    }
    .gimmick-list {
      list-style: none;
      padding: 0;
      margin: 10px 0 0;
      display: grid;
      gap: 10px;
    }
    .gimmick-list li {
      padding: clamp(10px, 1.6vw, 14px);
      border-radius: 10px;
      background: rgba(255, 255, 255, 0.04);
      color: #f8fafc;
      line-height: 1.6;
      font-size: clamp(0.92rem, 1.6vw, 1rem);
    }
  `;
  pipWindow.document.head.appendChild(style);
        const item = pipWindow.document.createElement("li");
        item.textContent = gimmick;
        list.appendChild(item);
      });
    }

    card.appendChild(list);

    const footer = pipWindow.document.createElement("div");
    footer.className = "overlay-footer";
    const backButton = pipWindow.document.createElement("button");
    backButton.className = "overlay-btn";
    backButton.type = "button";
    backButton.textContent = "몬스터 선택으로";
    backButton.dataset.action = "back-monster";
    footer.appendChild(backButton);

    const homeButton = pipWindow.document.createElement("button");
    homeButton.className = "overlay-btn";
    homeButton.type = "button";
    homeButton.textContent = "처음으로";
    homeButton.dataset.action = "home";
    footer.appendChild(homeButton);

    card.appendChild(footer);
  }

  shell.appendChild(card);
  body.appendChild(shell);

  body.addEventListener("click", (event) => {
    const target = event.target.closest("button[data-action]");

    if (!target) {
      if (overlayState.view === "start") {
        overlayState.view = "phase";
        overlayState.phaseIndex = null;
        overlayState.monsterIndex = null;
      } else if (overlayState.view === "monster") {
        overlayState.view = "phase";
        overlayState.monsterIndex = null;
      } else if (overlayState.view === "gimmick") {
        overlayState.view = "monster";
      }
      renderOverlayContent();
      updateOverlayStatus();
      return;
    }

    const action = target.dataset.action;

    if (action === "start") {
      overlayState.view = "phase";
      overlayState.phaseIndex = null;
      overlayState.monsterIndex = null;
    } else if (action === "select-phase") {
      overlayState.phaseIndex = Number(target.dataset.phaseIndex);
      overlayState.view = "monster";
      overlayState.monsterIndex = null;
    } else if (action === "select-monster") {
      overlayState.monsterIndex = Number(target.dataset.monsterIndex);
      overlayState.view = "gimmick";
    } else if (action === "back-phase") {
      overlayState.view = "phase";
      overlayState.monsterIndex = null;
    } else if (action === "back-monster") {
      overlayState.view = "monster";
    } else if (action === "home") {
      overlayState.view = "start";
      overlayState.phaseIndex = null;
      overlayState.monsterIndex = null;
    }

    renderOverlayContent();
    updateOverlayStatus();
  });
}

async function openOverlay() {
  if (!currentRaid) {
    alert("미카엘라 레이드 데이터를 찾을 수 없습니다.");
    return;
  }

  if (!window.documentPictureInPicture) {
    alert(
      "이 브라우저는 Document Picture-in-Picture를 지원하지 않습니다. Chrome 116+로 열어주세요.",
    );
    return;
  }

  try {
    if (pipWindow && !pipWindow.closed) {
      pipWindow.close();
    }

    pipWindow = await window.documentPictureInPicture.requestWindow({
      width: 520,
      height: 360,
    });

    overlayState = {
      view: "start",
      phaseIndex: null,
      monsterIndex: null,
    };

    renderOverlayContent();
    updateOverlayStatus();

    pipWindow.addEventListener("pagehide", () => {
      pipWindow = null;
    });
  } catch (error) {
    console.error(error);
    alert("오버레이를 열 수 없습니다. Chrome에서 다시 시도해 주세요.");
  }
}

startButton.addEventListener("click", openOverlay);
updateOverlayStatus();
