# Deep Interview Spec: 수업용 익명 질문 게시판 (Classroom Anonymous Q&A Board)

## Metadata
- Interview ID: board-app-2026-07-24
- Rounds: 8
- Final Ambiguity Score: ~14%
- Type: greenfield
- Generated: 2026-07-24
- Threshold: 0.2 (20%)
- Threshold Source: default
- Initial Context Summarized: no
- Status: PASSED

## Clarity Breakdown
| Dimension | Score | Weight | Weighted |
|-----------|-------|--------|----------|
| Goal Clarity | 0.88 | 40% | 0.352 |
| Constraint Clarity | 0.88 | 30% | 0.264 |
| Success Criteria | 0.88 | 30% | 0.264 |
| **Total Clarity** | | | **0.86** |
| **Ambiguity** | | | **0.14** |

## Topology
| Component | Status | Description | Coverage / Deferral Note |
|-----------|--------|--------------|---------------------------|
| 게시판 앱 개발 (Next.js) | active | 학생 질문 제출 + 발표자 열람 화면 | Round 1,3,4,5,6,7에서 상세 확정 |
| Supabase 백엔드 | active | questions 테이블 1개, 브라우저 자동화로 설정 | Round 8에서 계정 준비 상태 확정 |
| GitHub 저장소 | active | 코드 버전관리, 이미 계정 보유 | Round 8에서 확정 (계정 있음) |
| Vercel 배포 | active | 실제 URL로 배포, 계정 신규 가입 필요 | Round 8에서 확정 (가입 필요) |
| 로그인/회원가입 시스템 | deferred | Supabase Auth 등 실사용자 인증 | Round 0에서 사용자가 추천안(생략) 수락. 이유: 학습 목적에 불필요, 난이도만 상승 |

## Goal
비개발자 사용자가 Next.js + Supabase + GitHub + Vercel 조합으로, 수업 시간에 사용할 **익명 질문 게시판**을 만들고 실제 배포까지 완료하여 CRUD(Create/Read/Update/Delete) 전체 사이클을 경험한다.

핵심 시나리오:
1. 선생님/발표자가 앱에 접속하면 **오늘 날짜** 아래 **발표 슬롯(기본 7개: 발표1~발표7)**이 자동으로 표시된다.
2. 학생들은 해당 날짜의 발표 슬롯 링크에 접속해 **익명으로 질문을 작성**한다 (작성 시 간단한 4자리 비밀번호 설정).
3. 발표자는 자신의 슬롯 게시판을 열어 올라온 질문들을 **읽기만** 하고, 그중 몇 개를 골라 구두로 답변한다 (앱 내 "답변완료" 표시나 삭제 기능 불필요).
4. 질문을 작성한 학생 본인은 비밀번호로 본인 확인 후 자신의 질문을 **수정/삭제**할 수 있다 (CRUD의 Update/Delete를 실제로 경험하는 지점).
5. 과거 날짜의 게시판과 질문들은 **삭제되지 않고 계속 보관**되어 나중에도 조회 가능하다.

## Constraints
- 로그인/회원가입 시스템 없음 (Supabase Auth 미사용)
- 학생 규모: 한 반 기준 약 30명, 발표자는 하루 약 7명
- 발표 슬롯은 날짜별로 자동 생성 (수동 생성/이름 등록 불필요)
- 데이터는 날짜별로 영구 보관 (리셋되지 않음)
- Supabase, Vercel 계정은 사용자가 직접 가입해야 함 (에이전트가 비밀번호 입력 대행 불가) — GitHub 계정은 이미 보유
- Supabase 프로젝트/테이블 설정은 브라우저 자동화(Claude Browser)로 진행하되, 로그인/가입 단계는 사용자가 직접 수행

## Non-Goals
- 실사용자 로그인/회원가입 (이번 사이클에서는 생략)
- 이미지 업로드
- 카테고리/태그 분류
- 발표자가 질문을 "답변완료"로 표시하거나 모더레이션(삭제)하는 기능
- 발표 슬롯 개수(기본 7개)의 관리자 설정 UI — 필요 시 추후 확장

## Acceptance Criteria
- [ ] 학생이 특정 날짜+발표 슬롯 페이지에서 질문(내용 + 4자리 비밀번호)을 익명으로 제출할 수 있다 (Create)
- [ ] 해당 슬롯 페이지에서 제출된 질문 목록을 누구나 볼 수 있다 (Read)
- [ ] 질문 작성자가 비밀번호를 입력해 본인 질문을 수정할 수 있다 (Update)
- [ ] 질문 작성자가 비밀번호를 입력해 본인 질문을 삭제할 수 있다 (Delete)
- [ ] 홈 화면에서 날짜 목록을 볼 수 있고, 특정 날짜를 클릭하면 발표1~7 슬롯이 보인다
- [ ] 특정 발표 슬롯을 클릭하면 그 슬롯의 질문 제출 폼과 질문 목록이 보인다
- [ ] 과거 날짜의 질문 데이터는 삭제되지 않고 계속 조회 가능하다
- [ ] Supabase 프로젝트와 questions 테이블이 브라우저 자동화로 생성된다 (로그인은 사용자가 직접)
- [ ] 코드가 GitHub 저장소에 push된다
- [ ] Vercel에 배포되어 실제 URL로 접속 가능하다 (Supabase 환경변수 연결 포함)

## Assumptions Exposed & Resolved
| Assumption | Challenge | Resolution |
|------------|-----------|------------|
| "게시판"은 범용 게시판일 것 | 실제 용도가 무엇인지 질문 | 수업용 익명 질문 게시판(발표자가 질문 골라 답변)으로 확정 |
| 게시판은 1개일 것 | 계속 쓸지/리셋할지 질문 | 발표자마다(하루 약 7명) 별도 게시판, 날짜별 자동 생성으로 확정 |
| 새 게시판은 버튼으로 수동 생성 | 발표자 등록 방식 질문 | 날짜마다 발표1~7이 자동 생성되는 것으로 정정 (사용자가 직접 수정) |
| 과거 데이터는 리셋될 것 | 히스토리 필요 여부 질문 | 날짜별 영구 보관으로 확정 |
| 로그인 시스템이 필요할 것 | 비개발자 학습 목적 고려해 생략 제안 | 사용자가 추천안(생략) 수락 |
| 발표자가 답변 표시/삭제 기능이 필요할 것 | 실제 필요 여부 질문 | 불필요, 읽기만 하면 됨으로 확정 |
| CRUD의 Update/Delete를 어디서 경험할지 불명확 | 학생 본인 질문 수정/삭제 제안 | 간단한 비밀번호 방식으로 본인 확인 후 수정/삭제, 사용자 수락 |
| Supabase/Vercel 계정이 이미 있을 것 | 계정 보유 여부 질문 | GitHub만 보유, Supabase/Vercel은 신규 가입 필요 — 가입은 사용자가 직접, 이후 설정은 브라우저 자동화 |

## Technical Context (Greenfield)
- Frontend/Backend: Next.js (App Router 권장), Node.js 런타임
- DB: Supabase (Postgres) — 테이블 1개로 충분: `questions (id, session_date, slot_number, content, password, created_at)`
  - 별도 "boards" 테이블 불필요: 발표 슬롯은 session_date + slot_number(1~7) 조합으로 표현되는 가상의 개념이며, 질문이 없어도 슬롯 UI는 항상 1~7 표시
  - 비밀번호는 평문 저장 대신 간단한 해시(bcrypt 등) 권장 (학습용이지만 기본 보안 습관을 들이기 위함)
- 저장소: GitHub (기존 계정 사용)
- 배포: Vercel (신규 가입 필요), Supabase 프로젝트 URL/anon key를 Vercel 환경변수로 연결
- Supabase 프로젝트 생성, 테이블 생성, API 키 확인 등은 Claude Browser(브라우저 자동화)로 진행. 단, 계정 가입/로그인의 자격증명 입력은 안전 정책상 사용자가 직접 수행해야 함

## Ontology (Key Entities)
| Entity | Type | Fields | Relationships |
|--------|------|--------|----------------|
| Question | core domain | id, session_date, slot_number(1-7), content, password, created_at | 특정 날짜+슬롯에 속함 (FK 아님, 컬럼 조합으로 그룹핑) |

(참고: "Board/발표 슬롯"은 별도 테이블이 아닌 session_date + slot_number 조합으로 표현되는 가상 엔티티로 확정됨 — Round 3→4에서 정정)

## Ontology Convergence
| Round | Entity Count | New | Changed | Stable | Stability Ratio |
|-------|-------------|-----|---------|--------|------------------|
| 1 | 1 (Question) | 1 | - | - | N/A |
| 2 | 2 (Question, Board) | 1 | - | 1 | 50% |
| 3 | 2 (Question, Board) | 0 | - | 2 | 100% |
| 4 | 2 (Question, Board→발표슬롯 정정) | 0 | 1(renamed concept) | 1 | 100% (renamed counted as stable) |
| 5-8 | 1 (Question; Board는 가상 개념으로 흡수) | 0 | 1(Board 제거, 컬럼으로 대체) | 1 | 100% |

## Interview Transcript
<details>
<summary>Full Q&A (8 rounds + Round 0 topology gate)</summary>

### Round 0 (Topology)
**Q:** 4개 컴포넌트(앱 개발/Supabase/GitHub/Vercel)로 이해했는데 맞는지, 로그인 기능 추가 여부
**A:** "잘 모르겠어요, 추천해주세요" → 로그인 생략 추천안 수락

### Round 1
**Q:** 게시글 하나에 어떤 정보가 들어가면 될까요?
**A:** 익명이고 간단한 비번 정도는 해도 될 것 같고 굳이 있을 필요는 없어. 용도는 수업 시간에 학생들이 질문 하나씩 올리면 발표자가 그중 몇 개를 골라 답변하는 방식

### Round 2
**Q:** 게시판을 계속 이어서 쓸지, 수업(발표)마다 새로 시작할지
**A:** 발표할 때마다 새 게시판이 하나씩 생기면 좋겠어. 발표하는 학생이 30명 정도

### Round 3 (정정됨)
**Q:** 새 게시판은 어떻게 만들어지고 학생들은 어떻게 찾아가는지
**A:** (최초 답변: 버튼 생성+링크 공유) → 사용자 정정: "날짜 하나 생기면 그 안에 7개 게시판이 생겨야 함, 각각 클릭해서 들어감"

### Round 4
**Q:** 하루에 생기는 7개의 발표자 게시판은 어떻게 만들어지나요?
**A:** 자동으로 '발표1~7' 생성

### Round 5
**Q:** 수업이 끝난 다음에도 그날 질문을 다시 볼 수 있어야 하나요?
**A:** 네, 날짜별로 계속 남아있어야 해요

### Round 6
**Q:** 발표자가 질문을 '답변함'으로 표시하거나 이상한 글을 지울 수 있어야 할까요?
**A:** 둘 다 필요없어요, 읽기만 해도 돼요

### Round 7
**Q:** 질문을 올린 학생 본인이 자기 질문을 나중에 고치거나 지울 수 있게 해드릴까요?
**A:** 네, 간단한 비밀번호로 본인확인 후 수정/삭제 (추천안 수락)

### Round 8
**Q:** GitHub, Vercel, Supabase 계정을 이미 가지고 계신가요?
**A:** git만 가입되어있는 것 같아 (Supabase, Vercel은 신규 가입 필요)

</details>
