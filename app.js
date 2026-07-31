const raidData = window.raidData || {};
const select = document.getElementById("raid-select");
const previewList = document.getElementById("gimmick-list");
const startButton = document.getElementById("start-overlay");

let activePiPWindow = null;
let activeRaidId = null;
let activeGimmickIndex = 0;

function populateRaidList() {
  const entries = Object.entries(raidData);
  if (!entries.length) {
    select.innerHTML = '<option value="">등록된 레이드가 없습니다</option>';
    previewList.innerHTML = '<li>레이드 데이터를 먼저 추가해 주세요.</li>';
    return;
  }

  select.innerHTML = entries
    .map(([id, raid]) => `<option value="${id}">${raid.name}</option>`)
    .join("");

  select.value = entries[0][0];
  renderPreview(entries[0][0]);
}

function renderPreview(raidId) {
  const raid = raidData[raidId];
  if (!raid) {
    previewList.innerHTML = "";
    return;
  }

  previewList.innerHTML = raid.gimmicks
    .map((gimmick, index) => {
      const isActive = index === 0;
      return `<li class="${isActive ? "active" : ""}">${gimmick}</li>`;
    })
    .join("");
}

function updatePreviewHighlight(raidId, index) {
  const raid = raidData[raidId];
  if (!raid || !previewList.children.length) {
    return;
  }

  Array.from(previewList.children).forEach((item, itemIndex) => {
    item.classList.toggle("active", itemIndex === index);
  });
}

function renderOverlayContent(documentRef, raid, index) {
  const titleNode = documentRef.getElementById("overlay-title");
  const counterNode = documentRef.getElementById("overlay-index");
  const textNode = documentRef.getElementById("overlay-text");

  if (!titleNode || !counterNode || !textNode) {
    return;
  }

  titleNode.textContent = raid.name;
  counterNode.textContent = `${index + 1}/${raid.gimmicks.length}`;
  textNode.textContent = raid.gimmicks[index];
}

async function openOverlay() {
  const raidId = select.value;
  const raid = raidData[raidId];

  if (!raid) {
    alert("먼저 레이드를 선택해 주세요.");
    return;
  }

  if (!window.documentPictureInPicture) {
    alert("이 브라우저는 Document Picture-in-Picture를 지원하지 않습니다. Chrome 116+로 열어주세요.");
    return;
  }

  try {
    if (activePiPWindow && !activePiPWindow.closed) {
      activePiPWindow.close();
    }

    const pipWindow = await window.documentPictureInPicture.requestWindow({
      width: 400,
      height: 260
    });

    activePiPWindow = pipWindow;
    activeRaidId = raidId;
    activeGimmickIndex = 0;

    const style = pipWindow.document.createElement("style");
    style.textContent = `
      :root { color-scheme: dark; }
      * { box-sizing: border-box; }
      body {
        margin: 0;
        font-family: "Segoe UI", "Malgun Gothic", sans-serif;
        background: rgba(8, 10, 15, 0.96);
        color: #f5f7fa;
      }
      .overlay-shell {
        height: 100vh;
        width: 100vw;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
        cursor: pointer;
        user-select: none;
      }
      .overlay-card {
        width: 100%;
        max-width: 100%;
        background: rgba(20, 24, 32, 0.96);
        border: 1px solid rgba(255, 209, 102, 0.35);
        border-radius: 18px;
        padding: 24px;
        text-align: center;
        box-shadow: 0 16px 40px rgba(0, 0, 0, 0.35);
      }
      .overlay-label {
        font-size: 0.8rem;
        color: #ffd166;
        letter-spacing: 0.15em;
        text-transform: uppercase;
        margin-bottom: 10px;
      }
      .overlay-title {
        font-size: 1.2rem;
        font-weight: 700;
        margin-bottom: 8px;
      }
      .overlay-index {
        font-size: 0.95rem;
        color: #9aa0ac;
        margin-bottom: 14px;
      }
      .overlay-text {
        font-size: 1.25rem;
        font-weight: 600;
        line-height: 1.45;
      }
      .overlay-hint {
        margin-top: 14px;
        font-size: 0.88rem;
        color: #9aa0ac;
      }
    `;

    pipWindow.document.head.appendChild(style);
    pipWindow.document.body.innerHTML = `
      <div class="overlay-shell">
        <div class="overlay-card">
          <div class="overlay-label">던파 레이드 오버레이</div>
          <div class="overlay-title" id="overlay-title"></div>
          <div class="overlay-index" id="overlay-index"></div>
          <div class="overlay-text" id="overlay-text"></div>
          <div class="overlay-hint">클릭하면 다음 기믹으로 넘어갑니다.</div>
        </div>
      </div>
    `;

    renderOverlayContent(pipWindow.document, raid, activeGimmickIndex);

    pipWindow.document.body.addEventListener("click", () => {
      activeGimmickIndex = (activeGimmickIndex + 1) % raid.gimmicks.length;
      renderOverlayContent(pipWindow.document, raid, activeGimmickIndex);
      updatePreviewHighlight(raidId, activeGimmickIndex);
    });

    pipWindow.addEventListener("pagehide", () => {
      activePiPWindow = null;
    });
  } catch (error) {
    console.error(error);
    alert("오버레이를 열 수 없습니다. Chrome에서 다시 시도해 주세요.");
  }
}

select.addEventListener("change", () => {
  renderPreview(select.value);
});

startButton.addEventListener("click", openOverlay);

populateRaidList();
