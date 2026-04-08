# PowerSystem 最终交付说明

更新时间：2026-04-07

## 1. 交付结论

- PowerSystem 首轮 26 个接口迁移已全部完成
- 统一审计中发现的高优先级问题已全部修复
- 当前版本已满足“可交付、可运行、可回归、可审计”的标准
- 当前剩余事项仅为可选增强项，不再存在阻塞性交付缺口

关联文档：

- 迁移记忆：
  - `/Users/jiaxiaojie/.codex/worktrees/4f7a/aigc-friendly-backend/docs/human/power-system-migration-memory.zh-CN.md`
- 统一审计总结：
  - `/Users/jiaxiaojie/.codex/worktrees/4f7a/aigc-friendly-backend/docs/human/power-system-unified-audit-summary.zh-CN.md`

## 2. 接口清单

### 2.1 GraphQL

- `partyBs(input?)`
- `partyB(input)`
- `createPartyB(input)`
- `updatePartyB(input)`
- `deletePartyB(input)`
- `partyAs(input?)`
- `partyA(input)`
- `createPartyA(input)`
- `updatePartyA(input)`
- `deletePartyA(input)`
- `quotationByContractType(input)`
- `contracts(input?)`
- `contract(input)`
- `createContract(input)`
- `updateContract(input)`
- `deleteContract(input)`
- `powerCompanies`
- `powerDailySummary(input)`
- `powerIntervalSummary(input)`
- `powerCompanyJobs(input)`
- `powerTaskStatus(input)`

主要入口文件：

- `/Users/jiaxiaojie/.codex/worktrees/4f7a/aigc-friendly-backend/src/adapters/api/graphql/power-system/party-a/party-a.resolver.ts`
- `/Users/jiaxiaojie/.codex/worktrees/4f7a/aigc-friendly-backend/src/adapters/api/graphql/power-system/party-b/party-b.resolver.ts`
- `/Users/jiaxiaojie/.codex/worktrees/4f7a/aigc-friendly-backend/src/adapters/api/graphql/power-system/quotation/quotation.resolver.ts`
- `/Users/jiaxiaojie/.codex/worktrees/4f7a/aigc-friendly-backend/src/adapters/api/graphql/power-system/contract/contract.resolver.ts`
- `/Users/jiaxiaojie/.codex/worktrees/4f7a/aigc-friendly-backend/src/adapters/api/graphql/power-system/power-consumption/power-consumption.resolver.ts`

### 2.2 HTTP

- `GET /power-system/contracts/:contractId/docx`
- `POST /power-system/bills/docx`
- `POST /power-system/power-consumption/tasks`
- `GET /power-system/power-consumption/report`

主要入口文件：

- `/Users/jiaxiaojie/.codex/worktrees/4f7a/aigc-friendly-backend/src/adapters/api/http/power-system/contract/contract-docx.controller.ts`
- `/Users/jiaxiaojie/.codex/worktrees/4f7a/aigc-friendly-backend/src/adapters/api/http/power-system/bill/bill-docx.controller.ts`
- `/Users/jiaxiaojie/.codex/worktrees/4f7a/aigc-friendly-backend/src/adapters/api/http/power-system/power-consumption/power-task.controller.ts`
- `/Users/jiaxiaojie/.codex/worktrees/4f7a/aigc-friendly-backend/src/adapters/api/http/power-system/power-consumption/power-report.controller.ts`

### 2.3 WebSocket

- `WS /power-system/price-analysis`

主要入口文件：

- `/Users/jiaxiaojie/.codex/worktrees/4f7a/aigc-friendly-backend/src/adapters/api/ws/power-system/price-analysis/price-analysis.ws-adapter.ts`

## 3. 数据与迁移

- PowerSystem 使用独立新表命名空间：
  - `power_system_party_b`
  - `power_system_party_a`
  - `power_system_power_supply`
  - `power_system_contract`
  - `power_system_quotation*`
  - `power_system_actual_power_consumption`
  - `power_system_forecast_power_consumption`
  - `power_system_task_summary`
- 所有空库建表 migration 与 legacy backfill migration 已补齐
- 合同、甲方、乙方、报价、用电量、任务汇总均支持从旧库幂等回填

主要 migration 目录：

- `/Users/jiaxiaojie/.codex/worktrees/4f7a/aigc-friendly-backend/src/infrastructure/database/migrations`

## 4. 环境变量

### 4.1 基础运行

- `DB_HOST`
- `DB_PORT`
- `DB_USER`
- `DB_PASS`
- `DB_NAME`
- `DB_TIMEZONE`
- `DB_POOL_SIZE`
- `DB_SYNCHRONIZE`
- `DB_LOGGING`
- `REDIS_HOST`
- `REDIS_PORT`
- `REDIS_DB`
- `REDIS_PASSWORD`
- `REDIS_TLS`

参考文件：

- `/Users/jiaxiaojie/.codex/worktrees/4f7a/aigc-friendly-backend/env/.env.example`
- `/Users/jiaxiaojie/.codex/worktrees/4f7a/aigc-friendly-backend/env/.env.development`
- `/Users/jiaxiaojie/.codex/worktrees/4f7a/aigc-friendly-backend/env/.env.e2e`

### 4.2 PowerSystem 专用

- `POWER_SYSTEM_PREDICT_API_URL`
  - 预测服务地址，对齐 legacy `DEFAULT_PREDICT_API_URL`
- `POWER_SYSTEM_PREDICT_API_TIMEOUT_MS`
  - 预测服务超时设置

### 4.3 当前本地口径

- development：
  - MySQL：`aigc_friendly_backend_dev`
  - Redis DB：`14`
- e2e：
  - MySQL：`aigc_friendly_backend_e2e`
  - Redis DB：`15`

## 5. 运行方式

### 5.1 API

- 启动 API：
  - `npm run start:dev`
- GraphQL、HTTP、WS 入口都由 API 进程承载

### 5.2 Worker

- PowerSystem 异步预测任务默认走：
  - `POST /power-system/power-consumption/tasks`
  - `QueuePowerTaskUsecase`
  - BullMQ `power/run-task`
  - `PowerTaskProcessor`
  - `PowerTaskPipelineService`
- 需要同时启动 worker 进程，才能走完整产品路径

关键文件：

- `/Users/jiaxiaojie/.codex/worktrees/4f7a/aigc-friendly-backend/src/bootstraps/worker/worker.module.ts`
- `/Users/jiaxiaojie/.codex/worktrees/4f7a/aigc-friendly-backend/src/adapters/worker/power-system/power-task.processor.ts`

### 5.3 文档与模板

- 合同 DOCX：模板 + 占位符替换
- 报价单 DOCX：模板 + 占位符替换
- 价格分析 Excel：模板 + PDF 抽取映射

模板目录：

- `/Users/jiaxiaojie/.codex/worktrees/4f7a/aigc-friendly-backend/src/infrastructure/docx/templates/contracts`
- `/Users/jiaxiaojie/.codex/worktrees/4f7a/aigc-friendly-backend/src/infrastructure/docx/templates/bills`
- `/Users/jiaxiaojie/.codex/worktrees/4f7a/aigc-friendly-backend/src/infrastructure/price-analysis/templates`

## 6. 已完成验证

- `npm run typecheck`
- `npm run build:api`
- `npm run migration:drill:empty-db`
- 顺序跑完整个 `test/09-power-system`
- 关键补充验证：
  - `npx jest src/usecases/power-system/power-consumption/run-power-task-pipeline.usecase.spec.ts --runInBand`
  - `NODE_ENV=e2e node ./test/run-e2e-group.js --file 09-power-system/power-tasks-queue.e2e-spec.ts`
  - `NODE_ENV=e2e node ./test/run-e2e-group.js --file 08-qm-worker/power-worker-consume.e2e-spec.ts`
  - `NODE_ENV=e2e node ./test/run-e2e-group.js --file 09-power-system/power-tasks.e2e-spec.ts`
  - `NODE_ENV=e2e node ./test/run-e2e-group.js --file 09-power-system/power-task-status.e2e-spec.ts`
  - `NODE_ENV=e2e node ./test/run-e2e-group.js --file 09-power-system/power-interval-summary.e2e-spec.ts`
  - `NODE_ENV=e2e node ./test/run-e2e-group.js --file 09-power-system/power-report.e2e-spec.ts`

## 7. 与 legacy 的关键对齐点

- 以源项目真实已注册接口和 service 行为为最高真源
- 甲乙方、合同、报价、用电量、任务状态等核心业务语义已对齐
- `power-consumption` 真实预测链路已对齐：
  - 上传 actual
  - 初始化任务
  - 调用外部预测 HTTP 接口
  - forecast 落库
  - status / report / summary 回读
- 合同和报价单导出均已改成模板驱动，而不是纯代码拼文档

## 8. 已知可选增强项

- 补更明确的 worker deployment / smoke run 文档
- 根据预测接口吞吐继续调优 `power` 队列：
  - 并发
  - 重试
  - 退避策略
- 若后续需要更强观测性，可继续扩展：
  - `power` 队列 dashboard
  - 预测接口调用指标
  - 任务 trace / metric 面板

## 9. 最终判断

- 当前 PowerSystem 已达到首轮迁移交付完成态
- 26 个接口、数据迁移、模板导出、预测执行、Worker 消费、Async Task Record 都已闭合
- 后续工作应从“迁移实现”切换到“运维增强 / 观测增强 / 性能治理”
