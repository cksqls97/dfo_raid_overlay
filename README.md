# 던파 레이드 오버레이

Chrome의 Document Picture-in-Picture 기능을 활용한 간단한 레이드 공략 오버레이입니다.

## 실행 방법

1. 이 저장소를 로컬에서 열고 브라우저로 실행합니다.
2. Chrome 116 이상에서 페이지를 열고 `오버레이 시작` 버튼을 누릅니다.
3. PiP 창이 열리면, 창을 클릭해 다음 기믹으로 이동할 수 있습니다.

## GitHub + Vercel 배포

1. GitHub 저장소를 생성합니다.
2. 이 폴더의 내용을 저장소에 업로드합니다.
3. Vercel에 새 프로젝트로 연결합니다.
4. 프로젝트 루트는 저장소 루트 그대로 사용하면 됩니다.
5. 정적 사이트로 자동 감지되어 바로 배포됩니다.

> Vercel에서 빌드 명령은 비워 두고, 출력 디렉터리는 기본값을 사용하면 됩니다.

## GitHub 자동 커밋 & 푸시

수정 사항이 있을 때마다 자동으로 커밋하고 푸시하려면 다음 PowerShell 스크립트를 사용하세요.

```powershell
cd C:\Users\Steve\dfo-raid-overlay
powershell -ExecutionPolicy Bypass -File .\scripts\auto-commit-push.ps1 -Message "Your commit message"
```

커밋 메시지를 꼭 입력해 주세요. 메시지가 없는 경우 기본 메시지로 커밋됩니다.
