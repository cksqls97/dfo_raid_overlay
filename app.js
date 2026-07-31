const raidDataStore = window.raidData || {};
const startButton = document.getElementById("start-overlay");
const statusText = document.getElementById("status-text");

let currentRaid = raidDataStore.micaela || null;
let pipWindow = null;
let overlayState = {
  view: "start",
  phaseIndex: null,
  monsterIndex: null
};

function updateStatus(message) {
  if (statusText) {
    statusText.textContent = message;
  }
}

function getPhase() {
  if (!currentRaid || overlayState.phaseIndex === null || overlayState.phaseIndex < 0) {
    return null;
  }
  return currentRaid.phases[overlayState.phaseIndex] || null;
}

function getMonster() {
  const phase = getPhase();
  if (!phase || overlayState.monsterIndex === null || overlayState.monsterIndex < 0) {
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
    updateStatus("오버레이를 열면 단계 → 몬스터 → 기믹 순으로 빠르게 확인할 수 있습니다.");
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
    body {
      margin: 0;
      font-family: "Segoe UI", "Malgun Gothic", sans-serif;
      background: #0b0e14;
      color: #f4f7fb;
    }
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
      if (overlayState.phaseIndex === index) {
        phaseButton.classList.add("active");
      }
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
        if (overlayState.monsterIndex === index) {
          monsterButton.classList.add("active");
        }
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
    alert("이 브라우저는 Document Picture-in-Picture를 지원하지 않습니다. Chrome 116+로 열어주세요.");
    return;
  }

  try {
    if (pipWindow && !pipWindow.closed) {
      pipWindow.close();
    }

    pipWindow = await window.documentPictureInPicture.requestWindow({
      width: 400,
      height: 320
    });

    overlayState = {
      view: "start",
      phaseIndex: null,
      monsterIndex: null
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
