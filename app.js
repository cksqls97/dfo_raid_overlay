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
  if (!pipWindow) return;

  const body = pipWindow.document.body;
  body.innerHTML = "";

  const style = pipWindow.document.createElement("style");
  style.textContent = `
    :root { color-scheme: dark; }
    * { box-sizing: border-box; }
    html, body { margin: 0; min-height: 100%; min-width: 100%; }
    body { font-family: "Segoe UI", "Malgun Gothic", sans-serif; background: #0b0e14; color: #f4f7fb; overflow: hidden; }
    .overlay-shell { min-height: 100vh; min-width: 100vw; display: flex; align-items: flex-end; justify-content: center; padding: 8px 12px; background: radial-gradient(circle at top, rgba(255, 209, 102, 0.12), transparent 45%), #0b0e14; }
    .overlay-card { width: calc(100% - 24px); max-width: none; align-self: stretch; padding: clamp(12px, 2vw, 22px); border-radius: 12px 12px 8px 8px; background: rgba(20,24,32,0.96); border: 1px solid rgba(255,209,102,0.18); box-shadow: 0 12px 36px rgba(0,0,0,0.35); box-sizing: border-box; }
    .overlay-label { font-size: clamp(0.75rem,1.2vw,0.9rem); color:#ffd166; letter-spacing:0.12em; text-transform:uppercase; margin-bottom:8px; }
    .overlay-title { font-size: clamp(1rem,2.1vw,1.4rem); font-weight:700; margin-bottom:8px; color:#f4f7fb; }
    .overlay-description { font-size: clamp(0.85rem,1.4vw,1rem); color:#bfc8d3; line-height:1.5; margin-bottom:12px; }
    .overlay-grid { display:grid; gap:10px; grid-template-columns: repeat(auto-fit, minmax(140px,1fr)); }
    .overlay-btn { width:100%; min-height:48px; padding: clamp(10px,1.6vw,14px) clamp(12px,2vw,16px); border:none; border-radius:12px; background:#202633; color:#f4f7fb; font-size:clamp(0.95rem,1.6vw,1.05rem); cursor:pointer; text-align:center; font-weight:600; box-sizing:border-box; }
    .overlay-btn:hover { background:#2a3140; }
    .overlay-btn.active { background:#ffd166; color:#151821; }
    .overlay-subtitle { font-size: clamp(0.85rem,1.3vw,0.98rem); color:#9aa4b2; margin-bottom:10px; }
    .overlay-footer { display:flex; gap:10px; margin-top:12px; flex-wrap:wrap; }
    .overlay-footer .overlay-btn { flex:1 1 140px; }
    .gimmick-list { list-style:none; padding:0; margin:10px 0 0; display:grid; gap:10px; }
    .gimmick-list li { padding: clamp(10px,1.6vw,14px); border-radius:10px; background: rgba(255,255,255,0.04); color:#f8fafc; line-height:1.6; font-size:clamp(0.92rem,1.6vw,1rem); }
  `;
  pipWindow.document.head.appendChild(style);

  const shell = pipWindow.document.createElement("div");
  shell.className = "overlay-shell";

  const card = pipWindow.document.createElement("div");
  card.className = "overlay-card";

  const label = pipWindow.document.createElement("div");
  label.className = "overlay-label";
  label.textContent = currentRaid.name;
  card.appendChild(label);

  if (overlayState.view === "start") {
    const title = pipWindow.document.createElement("div");
    title.className = "overlay-title";
    title.textContent = "미카엘라 공략 시작";
    card.appendChild(title);

    const description = pipWindow.document.createElement("div");
    description.className = "overlay-description";
    description.textContent = "클릭하면 1페이즈, 2페이즈, 3페이즈를 순서대로 확인할 수 있습니다.";
    card.appendChild(description);

    const button = pipWindow.document.createElement("button");
    button.className = "overlay-btn active";
    button.type = "button";
    button.textContent = "단계 선택하기";
    button.dataset.action = "start";
    card.appendChild(button);
  } else if (overlayState.view === "phase") {
    const title = pipWindow.document.createElement("div");
    title.className = "overlay-title";
    title.textContent = "단계를 선택하세요";
    card.appendChild(title);

    const grid = pipWindow.document.createElement("div");
    grid.className = "overlay-grid";

    currentRaid.phases.forEach((phase, index) => {
      const phaseButton = pipWindow.document.createElement("button");
      phaseButton.className = "overlay-btn";
      phaseButton.type = "button";
      phaseButton.textContent = phase.name;
      phaseButton.dataset.action = "select-phase";
      phaseButton.dataset.phaseIndex = String(index);
      if (overlayState.phaseIndex === index) phaseButton.classList.add("active");
      grid.appendChild(phaseButton);
    });

    card.appendChild(grid);
  } else if (overlayState.view === "monster") {
    const phase = getPhase();
    const title = pipWindow.document.createElement("div");
    title.className = "overlay-title";
    title.textContent = phase ? phase.name : "단계";
    card.appendChild(title);

    const subtitle = pipWindow.document.createElement("div");
    subtitle.className = "overlay-subtitle";
    subtitle.textContent = "몬스터를 선택하면 기믹이 표시됩니다.";
    card.appendChild(subtitle);

    const grid = pipWindow.document.createElement("div");
    grid.className = "overlay-grid";

    if (phase) {
      phase.monsters.forEach((monster, index) => {
        const monsterButton = pipWindow.document.createElement("button");
        monsterButton.className = "overlay-btn";
        monsterButton.type = "button";
        monsterButton.textContent = monster.name;
        monsterButton.dataset.action = "select-monster";
        monsterButton.dataset.monsterIndex = String(index);
        if (overlayState.monsterIndex === index) monsterButton.classList.add("active");
        grid.appendChild(monsterButton);
      });
    }

    card.appendChild(grid);

    const footer = pipWindow.document.createElement("div");
    footer.className = "overlay-footer";
    const backButton = pipWindow.document.createElement("button");
    backButton.className = "overlay-btn";
    backButton.type = "button";
    backButton.textContent = "뒤로";
    backButton.dataset.action = "back-phase";
    footer.appendChild(backButton);
    card.appendChild(footer);
  } else if (overlayState.view === "gimmick") {
    const phase = getPhase();
    const monster = getMonster();
    const title = pipWindow.document.createElement("div");
    title.className = "overlay-title";
    title.textContent = monster ? monster.name : "기믹";
    card.appendChild(title);

    const subtitle = pipWindow.document.createElement("div");
    subtitle.className = "overlay-subtitle";
    subtitle.textContent = phase ? `${phase.name} 공략` : "공략";
    card.appendChild(subtitle);

    const list = pipWindow.document.createElement("ul");
    list.className = "gimmick-list";

    if (monster) {
      monster.gimmicks.forEach((gimmick) => {
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
}

function handleOverlayClick(event) {
  const target = event.target && event.target.closest ? event.target.closest("button[data-action]") : null;
  if (!target) {
    if (overlayState.view === "start") overlayState.view = "phase";
    else if (overlayState.view === "monster") { overlayState.view = "phase"; overlayState.monsterIndex = null; }
    else if (overlayState.view === "gimmick") overlayState.view = "monster";
    renderOverlayContent();
    updateOverlayStatus();
    return;
  }

  const action = target.dataset.action;
  if (action === "start") { overlayState.view = "phase"; overlayState.phaseIndex = null; overlayState.monsterIndex = null; }
  else if (action === "select-phase") { overlayState.phaseIndex = Number(target.dataset.phaseIndex); overlayState.view = "monster"; overlayState.monsterIndex = null; }
  else if (action === "select-monster") { overlayState.monsterIndex = Number(target.dataset.monsterIndex); overlayState.view = "gimmick"; }
  else if (action === "back-phase") { overlayState.view = "phase"; overlayState.monsterIndex = null; }
  else if (action === "back-monster") { overlayState.view = "monster"; }
  else if (action === "home") { overlayState.view = "start"; overlayState.phaseIndex = null; overlayState.monsterIndex = null; }

  renderOverlayContent();
  updateOverlayStatus();
}

// Attached once per pipWindow: renderOverlayContent only replaces body.innerHTML,
// so binding this inside renderOverlayContent would stack a new listener on the
// same body element every render.
function attachOverlayClickHandler() {
  pipWindow.document.body.addEventListener("click", handleOverlayClick);
}

async function openOverlay() {
  if (!currentRaid) {
    alert("미카엘라 레이드 데이터를 찾을 수 없습니다.");
    return;
  }

  try {
    if (pipWindow && !pipWindow.closed) {
      pipWindow.close();
    }
    pipWindow = null;

    if (window.documentPictureInPicture && window.documentPictureInPicture.requestWindow) {
      pipWindow = await window.documentPictureInPicture.requestWindow({
        width: 520,
        height: 360,
      });

      pipWindow.addEventListener("pagehide", () => {
        pipWindow = null;
      });
    } else {
      // Fallback for browsers without Document Picture-in-Picture support
      pipWindow = window.open("", "mikaela-overlay", "width=760,height=420,resizable=yes");

      if (!pipWindow) {
        alert("팝업이 차단되었습니다. 팝업 허용 후 다시 시도하세요.");
        return;
      }

      pipWindow.document.title = "미카엘라 오버레이";
      pipWindow.addEventListener("beforeunload", () => {
        pipWindow = null;
      });
    }

    overlayState = {
      view: "start",
      phaseIndex: null,
      monsterIndex: null,
    };

    attachOverlayClickHandler();
    renderOverlayContent();
    updateOverlayStatus();
  } catch (error) {
    console.error(error);
    alert("오버레이를 열 수 없습니다. 환경을 확인한 뒤 다시 시도해 주세요.");
  }
}

startButton.addEventListener("click", openOverlay);
updateOverlayStatus();
