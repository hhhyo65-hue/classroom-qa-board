# Plan: 수업용 익명 질문 게시판 (Classroom Anonymous Q&A Board)

Source spec: `.omc/specs/deep-interview-classroom-qa-board.md`
Status: **PENDING APPROVAL** (Critic-approved, iteration 2)

## Review Changelog
- **Iteration 1 → 2** (Architect + Critic, both "approve with changes"): Original design exposed `password_hash` to any client via open anon RLS `select`, and open anon `insert/update/delete` policies meant the app-layer password check was bypassable via direct Supabase REST calls with the public anon key. Fixed by moving ALL Supabase reads/writes server-side (Server Components + Server Actions) using a server-only service-role key; RLS on `questions` now denies anon access entirely (default-deny, no anon policies). Added `revalidatePath` after mutations, security-focused acceptance criteria, and negative verification steps. See Risks table and Steps 2c/2d/3/6c below for the specific changes.

## RALPLAN-DR Summary (short mode)

**Principles**
1. 비개발자가 끝까지 따라올 수 있도록 최소 구성(테이블 1개, 인증 없음)을 유지한다.
2. Supabase/Vercel 계정 가입 및 자격증명 입력은 사용자가 직접 하고, 그 외 클릭 작업은 브라우저 자동화로 대행한다.
3. CRUD 4가지(Create/Read/Update/Delete)를 이 앱 하나 안에서 모두 실습할 수 있게 설계한다.
4. 날짜별 데이터는 영구 보관하며 삭제 로직을 두지 않는다(사용자 자신의 글 삭제는 예외).
5. 배포까지 한 사이클을 빠르게 경험하는 것이 목적이므로, 과설계(관리자 UI, 슬롯 개수 설정 화면 등)를 피한다.

**Decision Drivers (top 3)**
1. 비개발자가 이해할 수 있는 단순한 데이터 모델 (테이블 개수 최소화)
2. 에이전트가 대신할 수 없는 계정 가입/로그인 단계와 자동화 가능한 나머지 단계의 명확한 분리
3. CRUD 전체를 실습 가능한 최소 기능 집합

**Viable Options**

### Option A: 단일 questions 테이블 (가상 슬롯) — 채택
- 테이블 1개: `questions(id, session_date, slot_number, content, password_hash, created_at)`
- 발표 슬롯(1~7)은 테이블 로우가 없어도 UI에서 항상 표시되는 가상 개념
- 장점: 스키마 최소화, Supabase 설정 단계 단순화(테이블 1개만 브라우저로 생성), 비개발자가 이해하기 쉬움
- 단점: 슬롯 개수(7)가 하드코딩됨 → Non-goal로 명시(스펙에서 이미 확인)

### Option B: boards + questions 2테이블 구조
- `boards(id, session_date, slot_number)` + `questions(id, board_id, content, password_hash, created_at)`
- 장점: 정규화된 구조, 슬롯 개수를 데이터로 관리 가능
- 단점: Supabase 설정 단계가 2배(테이블 2개, FK 설정), 비개발자에게 복잡도 증가, 스펙의 "최소 구성" 원칙과 충돌

**Invalidation rationale**: Option B는 스펙의 Technical Context에서 이미 "별도 boards 테이블 불필요"로 명시적으로 결정됨(Round 3→4 정정 반영). 슬롯 개수 동적 관리는 스펙의 Non-Goals에 명시된 범위 밖. Option A 채택.

## Requirements Summary
(스펙 Goal/Constraints/Acceptance Criteria 전문 참조 — `.omc/specs/deep-interview-classroom-qa-board.md`)

- Next.js 앱: 홈(날짜 목록) → 날짜별 발표1~7 슬롯 → 슬롯별 질문 목록+작성 폼
- 질문 작성 시 4자리 비밀번호로 이후 수정/삭제 가능
- 발표자는 읽기 전용 (별도 기능 없음)
- Supabase: questions 테이블 1개. 브라우저(클라이언트)는 Supabase에 절대 직접 접근하지 않음 — 모든 읽기/쓰기는 Next.js 서버(Server Component/Server Action)에서 service role key로 수행하고, RLS는 anon에 대해 기본 차단(정책 없음) 상태로 둠
- GitHub: 기존 계정으로 저장소 생성 및 push
- Vercel: 신규 가입 필요(사용자 직접), 이후 프로젝트 연결/환경변수 설정은 자동화

## Acceptance Criteria (from spec, testable)
- [ ] 학생이 특정 날짜+슬롯 페이지에서 질문(내용+4자리 비밀번호)을 익명 제출 가능 (Create)
- [ ] 슬롯 페이지에서 제출된 질문 목록을 누구나 열람 가능 (Read)
- [ ] 작성자가 비밀번호 확인 후 본인 질문 수정 가능 (Update)
- [ ] 작성자가 비밀번호 확인 후 본인 질문 삭제 가능 (Delete)
- [ ] 홈에서 날짜 목록 → 날짜 클릭 시 발표1~7 슬롯 노출
- [ ] 슬롯 클릭 시 해당 슬롯의 질문 폼+목록 노출
- [ ] 과거 날짜 데이터 영구 조회 가능
- [ ] Supabase 프로젝트+questions 테이블이 브라우저 자동화로 생성됨(로그인은 사용자 직접)
- [ ] 코드가 GitHub 저장소에 push됨
- [ ] Vercel 배포로 실 URL 접속 가능(Supabase 환경변수 연결 포함)
- [ ] 브라우저 개발자도구 Network 탭에서 어떤 요청 응답에도 `password_hash` 값이 노출되지 않음
- [ ] Supabase anon key로 `questions` 테이블에 직접 REST 요청(GET/POST 등)을 보내도 거부되거나 빈 결과가 반환됨 (RLS 기본 차단 확인)
- [ ] 질문 작성/수정/삭제 후 페이지가 새로고침 없이 자동으로 최신 목록을 반영함 (`revalidatePath` 동작 확인)

## Implementation Steps

### 1. 로컬 프로젝트 초기화
- `npx create-next-app@latest` (TypeScript, App Router, Tailwind 권장 — 비개발자용이므로 스타일은 최소화)
- `npm install @supabase/supabase-js`
- 파일: `app/layout.tsx`, `app/page.tsx`

### 2. Supabase 설정 (브라우저 자동화, Claude Browser 사용)
- 2a. 사용자에게 supabase.com 가입 요청 (에이전트는 자격증명 입력 불가 — 사용자 직접 수행)
- 2b. 로그인 확인 후 새 프로젝트 생성 (프로젝트명, 리전, DB 비밀번호는 사용자에게 확인 후 자동화로 입력)
- 2c. Table Editor 또는 SQL Editor에서 `questions` 테이블 생성:
  ```sql
  create table questions (
    id uuid primary key default gen_random_uuid(),
    session_date date not null,
    slot_number int not null check (slot_number between 1 and 7),
    content text not null,
    password_hash text not null,
    created_at timestamptz not null default now()
  );
  alter table questions enable row level security;
  -- 의도적으로 anon/authenticated 대상 정책을 하나도 만들지 않음 (RLS 기본 차단).
  -- 모든 읽기/쓰기는 서버(Server Action/Server Component)에서 service role key로 수행하며,
  -- service role은 RLS를 우회하므로 별도 정책이 필요 없음. 브라우저는 Supabase에 직접 접근하지 않음.
  ```
- 2d. Project Settings > API에서 Project URL, **service_role key**(secret) 확인 → 로컬 `.env.local`에 저장 (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` — **`NEXT_PUBLIC_` 접두사를 절대 붙이지 않는다**. 이 접두사가 붙으면 브라우저 번들에 노출되어 서비스 키가 유출됨). anon key는 이 설계에서 사용하지 않으므로 저장할 필요 없음.

### 3. 애플리케이션 코드
- `lib/supabase-server.ts`: **서버 전용** Supabase 클라이언트 (service role key 사용). 파일 최상단에 `import "server-only"` 추가하여 실수로 클라이언트 컴포넌트에서 import 시 빌드 에러가 나도록 강제. 이 파일은 `"use client"` 컴포넌트에서 절대 import하지 않는다.
- `app/page.tsx`: 홈(Server Component) — `lib/supabase-server.ts`로 질문이 존재하는 `session_date` 목록 조회, `id, content` 등 안전한 컬럼만 select (`password_hash` 절대 select하지 않음). 데이터가 없어도 "오늘로 이동" 링크를 항상 노출
- `app/[date]/page.tsx`: 발표1~7 슬롯 타일 표시 (고정 7개, 각 슬롯 클릭 시 이동), `date` 파라미터는 `YYYY-MM-DD` 정규식으로 검증 후 미스매치 시 404
- `app/[date]/[slot]/page.tsx`: Server Component에서 질문 목록(Read) 조회 시 `select("id, content, created_at")`로 **password_hash 제외**, `slot` 파라미터는 1~7 범위 검증 후 미스매치 시 404
- `app/[date]/[slot]/QuestionItem.tsx` (Client Component): 각 질문에 "수정"/"삭제" 버튼 → 비밀번호 입력 모달 → 서버 액션 호출 (비밀번호 원문은 서버 액션 인자로만 전달되고 클라이언트에는 해시가 전혀 내려오지 않음)
- 서버 액션 (`app/actions.ts`, 모두 `lib/supabase-server.ts`의 service role 클라이언트 사용):
  - `createQuestion(date, slot, content, password)`: bcrypt로 해시 후 insert, 이후 `revalidatePath(\`/${date}/${slot}\`)`
  - `updateQuestion(id, date, slot, content, password)`: 저장된 password_hash와 bcrypt.compare로 대조, 일치 시에만 update, 이후 `revalidatePath(\`/${date}/${slot}\`)`
  - `deleteQuestion(id, date, slot, password)`: 동일 방식으로 대조 후 delete, 이후 `revalidatePath(\`/${date}/${slot}\`)`
  - 비밀번호 불일치 시 명확한 에러 메시지 반환 (예: "비밀번호가 일치하지 않습니다")
  - **수용된 리스크**: 4자리 비밀번호는 이론상 최대 10,000회 시도로 브루트포스 가능. 이 프로젝트는 학습/단일 학급 저위험 용도이므로 별도 rate limiting은 이번 사이클 범위에서 제외(Non-goal). 프로덕션 확장 시 추가 검토 필요

### 4. 로컬 테스트
- `npm run dev` 로 로컬 구동, 질문 Create/Read/Update/Delete 전체 흐름 수동 테스트
- 날짜/슬롯 라우팅 정상 동작 확인

### 5. GitHub 저장소 설정
- **필수 게이트(첫 push 전에 반드시 확인)**: `.gitignore`에 `.env.local`이 포함되어 있는지 확인하고, `git status`로 `.env.local`이 추적되지 않음(untracked도 아님)을 재확인한다. service_role key가 한 번이라도 GitHub에 올라가면 DB 전체가 노출되므로, 이 확인 없이는 절대 첫 push를 진행하지 않는다.
- 로컬 `git init`
- 사용자 기존 GitHub 계정으로 새 저장소 생성 (gh CLI 또는 브라우저 자동화)
- `git add`, `git commit`, `git push`

### 6. Vercel 배포 (브라우저 자동화)
- 6a. 사용자에게 vercel.com 가입 요청 (GitHub 계정으로 가입 권장 — 자격증명 입력은 사용자 직접)
- 6b. 로그인 확인 후 "Import Project" → 방금 만든 GitHub 저장소 선택
- 6c. 환경변수 설정 화면에서 `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` 입력 (값은 로컬 `.env.local`에서 가져와 자동화로 입력). **`NEXT_PUBLIC_` 접두사를 붙이지 않는다** — service role key는 반드시 서버 전용(Server-side) 환경변수로만 등록해야 브라우저에 노출되지 않는다
- 6d. Deploy 클릭 → 배포 완료 대기 → 최종 URL 확인

### 7. 배포 후 검증
- 배포된 URL 접속하여 실제로 질문 Create/Read/Update/Delete 왕복 테스트
- 날짜 이동 후 과거 데이터 유지 확인

## Risks and Mitigations
| Risk | Mitigation |
|------|-----------|
| 비밀번호를 평문 저장 시 유출 위험 | bcrypt 해시로 저장, DB에는 해시만 존재, 클라이언트에는 해시조차 내려주지 않음 |
| **[HIGH, 수정됨]** 클라이언트가 Supabase에 직접 접근해 임의로 데이터를 조작하거나 password_hash를 읽어갈 수 있음 (원래 설계의 open RLS + 공개 anon key 조합의 결함, Architect/Critic 리뷰에서 지적) | RLS를 anon에 대해 기본 차단(정책 없음)으로 전환하고, 모든 읽기/쓰기를 서버(Server Action/Server Component)에서 service role key로만 수행. service role key는 `NEXT_PUBLIC_` 접두사 없이 서버 전용 환경변수로만 저장(.env.local, Vercel 모두). 클라이언트 쿼리는 `password_hash`를 select하지 않음 |
| .env.local이 실수로 GitHub에 커밋됨 | .gitignore 확인을 구현 단계 필수 체크리스트에 포함 (service role key 유출 방지 관점에서 특히 중요) |
| 브라우저 자동화 중 UI 변경으로 셀렉터 실패 | 단계별 스크린샷 확인 후 진행, 실패 시 사용자에게 수동 개입 요청 |
| 사용자가 Supabase/Vercel 가입 단계에서 막힘 | 각 단계마다 무엇을 입력해야 하는지 구체적으로 안내 후 진행 확인 |

## ADR: 클라이언트-서버 데이터 접근 구조

- **Decision**: 브라우저는 Supabase에 절대 직접 접근하지 않는다. 모든 읽기/쓰기는 Next.js Server Component/Server Action에서 service role key로 수행하며, `questions` 테이블은 RLS 활성화 + anon 대상 정책 없음(기본 차단)으로 설정한다.
- **Drivers**: (1) 비개발자도 이해 가능한 단일 테이블 유지, (2) 4자리 비밀번호 게이트가 실제로 우회 불가능해야 함, (3) 학습 목적상 "비밀번호 검증이 서버에서만 이뤄진다"는 올바른 습관을 형성해야 함
- **Alternatives considered**: (A) 최초안 — RLS 전체 허용(anon insert/select/update/delete) + 클라이언트 직접 접근 + 앱 레이어 비밀번호 대조. (B) 정규화된 2테이블(boards+questions) 구조.
- **Why chosen**: 최초안(A)은 Architect/Critic 리뷰에서 password_hash 노출 및 REST 직접 우회 취약점이 확인되어 폐기. 2테이블안(B)은 스펙에서 이미 "단일 테이블로 충분"이라 결정되었고 이번 보안 이슈와 무관하여 재고 대상이 아니었음. 서버 전용 접근 구조는 스키마를 바꾸지 않고도(단일 테이블 유지) 접근 제어만 교정하는 최소 변경 경로였음.
- **Consequences**: Supabase 클라이언트 코드가 client component가 아닌 server component/action에만 존재해야 하므로, 향후 기능 추가 시에도 "브라우저는 DB를 직접 안 만진다" 원칙을 지켜야 함. anon key를 사용하지 않으므로 추후 실시간 구독(Realtime) 등 클라이언트 직접 기능이 필요해지면 이 구조를 재검토해야 함.
- **Follow-ups**: 프로덕션급으로 확장할 경우 (1) 비밀번호 시도 rate limiting 추가, (2) Supabase Auth 도입 검토, (3) 슬롯 개수(7) 동적 관리 UI 검토 — 모두 이번 사이클 범위 밖(Non-goal)으로 명시적으로 보류.

## Review Changelog (applied improvements)
- Architect iteration 1: RLS/anon-key bypass 및 password_hash 노출 지적 → 서버 전용 접근 구조로 전면 수정
- Critic iteration 1: 6개 필수 변경사항(정책 제거, hash 비노출, revalidatePath, 리스크 등급 상향, 보안 AC 추가, 네거티브 검증 추가) → 모두 반영
- Architect iteration 2: brute-force 리스크 명시, gitignore 하드 게이트화 → 반영
- Critic iteration 2: **APPROVE** (모든 필수 변경사항 확인됨, 블로킹 이슈 없음)

## Verification Steps
1. 로컬에서 `npm run dev` 후 질문 CRUD 왕복 수동 테스트
2. Supabase Table Editor에서 실제 저장된 row 확인
3. GitHub 저장소에 코드 push 확인 (`git log`, 원격 저장소 웹에서 확인)
4. Vercel 배포 URL에서 동일한 CRUD 왕복 테스트 재실행
5. 브라우저 콘솔/네트워크 탭에서 에러 없는지 확인
6. **(보안 검증)** 브라우저 개발자도구 Network 탭에서 질문 목록 응답을 열어 `password_hash` 필드가 전혀 없는지 확인
7. **(보안 검증)** Supabase anon key로 `curl`이나 REST 클라이언트를 이용해 `questions` 테이블에 직접 select/insert 요청을 보내 거부되거나 빈 결과가 오는지 확인 (RLS 기본 차단 검증)
8. **(회귀 검증)** 질문을 수정/삭제한 직후 새로고침 없이 화면 목록이 즉시 갱신되는지 확인 (`revalidatePath` 동작 검증)
