# PowerSystem 增量迁移记忆

本文档是 PowerSystem 迁移工作的当前真源。
目标是防止长上下文下的执行漂移，确保后续每一轮迁移都按同一口径推进。

## 1. 迁移总目标

- 源项目：`/Users/jiaxiaojie/Projects/refactor_powersystem/powersystem`
- 目标项目：当前仓库 `NestJS + TypeORM + GraphQL + Strict Layered Architecture`
- 迁移原则：
  - 以原项目“真实已注册接口 + 实际 endpoint/service 行为”为最高真源
  - 严格遵守本仓库 `README.md` 与 `docs/**` 规则
  - 一次只迁移一个接口
  - 每迁移完一个接口就停下，做 review 和迁移对照总结，等确认后再做下一个

## 2. 固定架构约束

- bounded context 固定为：`power-system`
- 目录固定为：
  - `src/modules/power-system/*`
  - `src/usecases/power-system/*`
  - `src/adapters/api/graphql/power-system/*`
  - `src/adapters/api/http/power-system/*`
  - `src/adapters/api/ws/power-system/*`
- 分层方向固定：
  - `adapters -> usecases -> modules -> infrastructure -> core`
- 读侧规则：
  - 读映射收敛在 QueryService
  - adapter 只做 DTO / 输入校验 / 输出映射
- 写侧规则：
  - 写事务放 Usecase
  - Service 提供 repository/transaction 能力与领域持久化
- 数据库规则：
  - `entity` 与 `baseline migration` 必须同步维护
  - 现阶段 baseline migration 用于“空库首次建库”
  - 存量旧库兼容如需支持，采用补充 backfill migration，但不能破坏空库 drill

## 3. 产品决策固化

- 接口契约：`Nest 风格优先`
- 鉴权：第一轮全部 `Public`
- 非典型协议：
  - GraphQL 为主
  - 文件导出 / 异步任务 / WebSocket 场景使用 HTTP / WS 补充
- 旧表策略：
  - `party_b` 不直接复用
  - 新表固定为 `power_system_party_b`
  - 通过幂等数据迁移把旧表数据回填进新表

## 4. 迁移范围

以原项目真实已注册接口为准，共 26 个接口：

1. `partyBs`
2. `partyB`
3. `createPartyB`
4. `updatePartyB`
5. `deletePartyB`
6. `partyAs`
7. `partyA`
8. `createPartyA`
9. `updatePartyA`
10. `deletePartyA`
11. `quotationByContractType`
12. `contracts`
13. `contract`
14. `createContract`
15. `updateContract`
16. `deleteContract`
17. `GET /power-system/contracts/:contractId/docx`
18. `POST /power-system/bills/docx`
19. `powerCompanies`
20. `powerDailySummary`
21. `powerIntervalSummary`
22. `powerCompanyJobs`
23. `POST /power-system/power-consumption/tasks`
24. `powerTaskStatus`
25. `GET /power-system/power-consumption/report`
26. `WS /power-system/price-analysis`
23. `POST /power-system/power-consumption/tasks`
24. `powerTaskStatus`
25. `GET /power-system/power-consumption/report`
26. `WS /power-system/price-analysis`

## 5. 已完成接口

当前已完成并确认的接口：

1. `partyBs`
2. `partyB`
3. `createPartyB`
4. `updatePartyB`
5. `deletePartyB`
6. `partyAs`
7. `partyA`
8. `createPartyA`
9. `updatePartyA`
10. `deletePartyA`
11. `quotationByContractType`
12. `contracts`
13. `contract`
14. `createContract`
15. `updateContract`
16. `deleteContract`
17. `GET /power-system/contracts/:contractId/docx`
18. `POST /power-system/bills/docx`
19. `powerCompanies`
20. `powerDailySummary`
21. `powerIntervalSummary`
22. `powerCompanyJobs`

说明：

- 这些接口均已完成：
  - 代码落位
  - E2E 正反例
  - `typecheck`
  - `build:api`
  - 相关 `eslint`
  - 单文件 E2E 运行通过
- 已完成 PowerSystem 相关回归：
  - `partyAs`
  - `partyA`
  - `createPartyA`
  - `updatePartyA`
  - `deletePartyA`
  - `quotationByContractType`
  - `contracts`
  - `contract`
  - `contractDocx`
  - `billDocx`
  - `powerCompanies`
  - `powerDailySummary`
  - `powerIntervalSummary`
  - `powerCompanyJobs`
  - `POST /power-system/power-consumption/tasks`
  - `powerTaskStatus`
  - `GET /power-system/power-consumption/report`
  - `WS /power-system/price-analysis`
  - `partyBs`
  - `partyB`
  - `createPartyB`
  - `updatePartyB`
  - `deletePartyB`

## 6. 当前 PowerSystem 已落位资产

### 6.1 代码位置

- module:
  - `src/modules/power-system/power-system.module.ts`
  - `src/modules/power-system/bill/*`
  - `src/modules/power-system/party-a/*`
  - `src/modules/power-system/party-b/*`
  - `src/modules/power-system/quotation/*`
  - `src/modules/power-system/contract/*`
  - `src/modules/power-system/power-consumption/*`
  - `src/modules/power-system/price-analysis/*`
- infrastructure:
  - `src/infrastructure/docx/*`
  - `src/infrastructure/docx/templates/bills/*`
  - `src/infrastructure/docx/templates/contracts/*`
  - `src/infrastructure/price-analysis/*`
  - `src/infrastructure/price-analysis/templates/*`
- usecase:
  - `src/usecases/power-system/power-system-usecases.module.ts`
  - `src/usecases/power-system/bill/*`
  - `src/usecases/power-system/party-a/*`
  - `src/usecases/power-system/party-b/*`
  - `src/usecases/power-system/quotation/*`
  - `src/usecases/power-system/contract/*`
  - `src/usecases/power-system/power-consumption/*`
  - `src/usecases/power-system/price-analysis/*`
- GraphQL adapter:
  - `src/adapters/api/graphql/power-system/party-a/*`
  - `src/adapters/api/graphql/power-system/party-b/*`
  - `src/adapters/api/graphql/power-system/quotation/*`
  - `src/adapters/api/graphql/power-system/contract/*`
  - `src/adapters/api/graphql/power-system/power-consumption/*`
- HTTP adapter:
  - `src/adapters/api/http/power-system/bill/*`
  - `src/adapters/api/http/power-system/contract/*`
  - `src/adapters/api/http/power-system/power-consumption/*`
- WS adapter:
  - `src/adapters/api/ws/power-system/price-analysis/*`
- migration:
  - `src/infrastructure/database/migrations/1773927700000-create-power-system-party-b-table.migration.ts`
  - `src/infrastructure/database/migrations/1773927800000-backfill-power-system-party-b-from-legacy-table.migration.ts`
  - `src/infrastructure/database/migrations/1773927900000-create-power-system-party-a-and-power-supply-tables.migration.ts`
  - `src/infrastructure/database/migrations/1773928000000-backfill-power-system-party-a-and-power-supply-from-legacy-tables.migration.ts`
  - `src/infrastructure/database/migrations/1773928100000-create-power-system-quotation-tables.migration.ts`
  - `src/infrastructure/database/migrations/1773928200000-backfill-power-system-quotation-from-legacy-tables.migration.ts`
  - `src/infrastructure/database/migrations/1773928300000-create-power-system-contract-table.migration.ts`
  - `src/infrastructure/database/migrations/1773928400000-backfill-power-system-contract-from-legacy-table.migration.ts`
  - `src/infrastructure/database/migrations/1773928500000-create-power-system-actual-power-consumption-table.migration.ts`
  - `src/infrastructure/database/migrations/1773928600000-backfill-power-system-actual-power-consumption-from-legacy-table.migration.ts`
  - `src/infrastructure/database/migrations/1773928700000-alter-power-system-actual-power-consumption-add-daily-total-column.migration.ts`
  - `src/infrastructure/database/migrations/1773928800000-backfill-power-system-actual-power-consumption-daily-total-from-legacy-table.migration.ts`
  - `src/infrastructure/database/migrations/1773928900000-create-power-system-forecast-power-consumption-table.migration.ts`
  - `src/infrastructure/database/migrations/1773929000000-backfill-power-system-forecast-power-consumption-from-legacy-table.migration.ts`
  - `src/infrastructure/database/migrations/1773929100000-alter-power-system-actual-power-consumption-add-interval-columns.migration.ts`
  - `src/infrastructure/database/migrations/1773929200000-backfill-power-system-actual-power-consumption-interval-columns-from-legacy-table.migration.ts`
  - `src/infrastructure/database/migrations/1773929300000-alter-power-system-forecast-power-consumption-add-interval-columns.migration.ts`
  - `src/infrastructure/database/migrations/1773929400000-backfill-power-system-forecast-power-consumption-interval-columns-from-legacy-table.migration.ts`
  - `src/infrastructure/database/migrations/1773929500000-create-power-system-task-summary-table.migration.ts`
  - `src/infrastructure/database/migrations/1773929600000-backfill-power-system-task-summary-from-legacy-table.migration.ts`
- E2E:
  - `test/09-power-system/party-as.e2e-spec.ts`
  - `test/09-power-system/party-a.e2e-spec.ts`
  - `test/09-power-system/power-daily-summary.e2e-spec.ts`
  - `test/09-power-system/power-interval-summary.e2e-spec.ts`
  - `test/09-power-system/power-company-jobs.e2e-spec.ts`
  - `test/09-power-system/create-party-a.e2e-spec.ts`
  - `test/09-power-system/update-party-a.e2e-spec.ts`
  - `test/09-power-system/delete-party-a.e2e-spec.ts`
  - `test/09-power-system/party-bs.e2e-spec.ts`
  - `test/09-power-system/party-b.e2e-spec.ts`
  - `test/09-power-system/create-party-b.e2e-spec.ts`
  - `test/09-power-system/update-party-b.e2e-spec.ts`
  - `test/09-power-system/delete-party-b.e2e-spec.ts`
  - `test/09-power-system/quotation-by-contract-type.e2e-spec.ts`
  - `test/09-power-system/contracts.e2e-spec.ts`
  - `test/09-power-system/contract.e2e-spec.ts`
  - `test/09-power-system/create-contract.e2e-spec.ts`
  - `test/09-power-system/update-contract.e2e-spec.ts`
  - `test/09-power-system/delete-contract.e2e-spec.ts`
  - `test/09-power-system/contract-docx.e2e-spec.ts`
  - `test/09-power-system/bill-docx.e2e-spec.ts`
  - `test/09-power-system/power-tasks.e2e-spec.ts`
  - `test/09-power-system/power-task-status.e2e-spec.ts`
  - `test/09-power-system/power-report.e2e-spec.ts`
  - `test/09-power-system/price-analysis.e2e-spec.ts`

### 6.2 当前已暴露接口

- `partyAs`
- `partyA`
- `createPartyA`
- `updatePartyA`
- `deletePartyA`
- `partyBs`
- `partyB`
- `createPartyB`
- `updatePartyB`
- `deletePartyB`
- `quotationByContractType`
- `contracts`
- `contract`
- `createContract`
- `updateContract`
- `deleteContract`
- `GET /power-system/contracts/:contractId/docx`
- `POST /power-system/bills/docx`
- `powerCompanies`
- `powerDailySummary`
- `powerIntervalSummary`
- `powerCompanyJobs`
- `POST /power-system/power-consumption/tasks`
- `powerTaskStatus`
- `GET /power-system/power-consumption/report`
- `WS /power-system/price-analysis`

尚未暴露：

- 无
- `partyA` 子域 5 个接口已全部暴露
- `partyB` 子域 5 个接口已全部暴露
- `quotation` 子域当前仅暴露 `quotationByContractType`
- `contract` 子域 6 个接口已全部暴露
- 当前已暴露 PowerSystem HTTP / WS 补充接口：
  - `GET /power-system/contracts/:contractId/docx`
  - `POST /power-system/bills/docx`
  - `POST /power-system/power-consumption/tasks`
  - `GET /power-system/power-consumption/report`
  - `WS /power-system/price-analysis`

### 6.3 Adapter 分层快速排查

- 已于 `2026-04-06` 对现有 PowerSystem adapter 目录执行快速排查：
  - 扫描范围：`src/adapters/api/graphql/power-system/**`
  - 现状：未发现新的 `adapter -> modules` 直接依赖
  - 已修正问题：
    - `src/adapters/api/graphql/power-system/quotation/quotation.resolver.ts` 曾直接 import modules 层 `quotation.types.ts`
    - 现已改为只依赖 usecase 返回类型
- 当前补充说明：
  - `src/adapters/api/http/power-system/*`
  - `src/adapters/api/ws/power-system/*`
  - 这两个目录在当前阶段尚未落位实现，因此本轮无可扫文件

## 7. PartyB 已确认行为

### `partyBs`

- 行为：查询全部有效乙方
- 默认语义：`isActive = true`
- 排序：`updatedAt DESC, partyBId DESC`
- 返回：`{ items, total }`
- 当前附加能力：
  - `configName` 模糊过滤
  - `companyName` 模糊过滤
  - `isDefault` 精确过滤

### `partyB`

- 行为：按 ID 查询一个有效乙方
- 语义：停用记录按不存在处理
- not found：
  - message: `乙方不存在`
  - errorCode: `POWER_SYSTEM_PARTY_B_NOT_FOUND`
  - GraphQL code: `NOT_FOUND`

### `createPartyB`

- 行为：按源接口直接创建
- 系统写入：
  - `isActive = true`
  - `createdBy = 'admin'`
  - `updatedBy = 'admin'`
- 当前不额外引入：
  - 唯一性约束
  - 默认主体互斥规则
  - 其他源项目不存在的业务规则

### `updatePartyB`

- 行为：按源接口做部分更新
- 语义：
  - 仅更新 `isActive = true` 的记录
  - 停用记录按不存在处理
  - 仅修改传入字段
  - 未传字段保持不变
- 系统写入：
  - `updatedBy = 'admin'`

### `deletePartyB`

- 行为：软删除乙方主体
- 语义：
  - 仅处理 `isActive = true` 的记录
  - 停用记录按不存在处理
- 返回：
  - GraphQL `Boolean`
- 与旧 REST 的显式差异：
  - 不返回 `{ party_b_id, deleted: true }`
  - 统一成仓库内删除 mutation 的布尔返回

### `partyAs`

- 源真相：
  - 真实注册接口是 `GET /party-a/`
  - 行为是“查询全部有效甲方 + joinedload power_supply_info”
  - 不是 `list_party_a()` 那个分页摘要接口
- 当前 GraphQL 返回：
  - `{ items, total }`
  - `items` 为完整甲方对象
  - 含 `powerSupplyInfo` 嵌套数组
- 默认语义：
  - `isActive = true`
  - 排序：`updatedAt DESC, partyAId DESC`
  - 嵌套供电信息排序：`psId ASC`
- 当前附加能力：
  - `companyName` 模糊过滤
  - `creditCode` 精确过滤
- 新表策略：
  - 甲方主表：`power_system_party_a`
  - 供电信息表：`power_system_power_supply`
- legacy `party_a`、`power_supply` 通过幂等 backfill 迁移回填

### `partyA`

- 源真相：
  - 真实注册接口是 `GET /party-a/{party_a_id}`
  - 行为是“按 ID 查询有效甲方 + joinedload power_supply_info”
  - 不存在或停用时返回 404
- 当前 GraphQL 返回：
  - `partyA(input: PartyAInput!): PartyAType`
  - 返回完整甲方对象
  - 含 `powerSupplyInfo` 嵌套数组
- 默认语义：
  - 仅查询 `isActive = true` 的记录
  - 停用记录按不存在处理
  - 嵌套供电信息排序：`psId ASC`
- not found：
  - message: `甲方不存在`
  - errorCode: `POWER_SYSTEM_PARTY_A_NOT_FOUND`
  - GraphQL code: `NOT_FOUND`

### `createPartyA`

- 源真相：
  - 真实注册接口是 `POST /party-a/`
  - 支持创建甲方主体，并可同时创建 `power_supply_info`
  - 系统自动写入：
    - `isActive = true`
    - `createdBy = 'admin'`
    - `updatedBy = 'admin'`
- 当前 GraphQL 返回：
  - `createPartyA(input: CreatePartyAInput!): PartyAType`
  - 返回完整甲方对象
  - 含 `powerSupplyInfo` 嵌套数组
- 当前实现策略：
  - 保持源字段语义，不额外引入唯一性和冲突规则
  - 通过 Usecase 事务一次性完成甲方和供电信息创建
  - 创建后回查完整对象再返回
- 当前参数语义：
  - `companyName` 必填
  - 其余甲方字段可选
  - `powerSupplyInfo` 可省略，省略时视为 `[]`

### `updatePartyA`

- 源真相：
  - 真实注册接口是 `PUT /party-a/{party_a_id}`
  - 基础字段按传入的已设置字段更新
  - 若传入 `power_supply_info`，则按全量覆盖模式处理
  - 系统自动写入 `updatedBy = 'admin'`
- 当前 GraphQL 返回：
  - `updatePartyA(input: UpdatePartyAInput!): PartyAType`
  - 返回更新后的完整甲方对象
  - 含 `powerSupplyInfo` 嵌套数组
- 默认语义：
  - 仅更新 `isActive = true` 的记录
  - 停用记录按不存在处理
- `powerSupplyInfo`:
  - 省略：不修改供电信息
  - 传数组：按全量覆盖替换
  - 传空数组：清空全部供电信息

### `deletePartyA`

- 源真相：
  - 真实注册接口是 `DELETE /party-a/{party_a_id}`
  - 语义是软删除，只把 `isActive` 置为 `false`
  - 仅处理 `isActive = true` 的记录
  - 不存在或已停用时返回 404
- 当前 GraphQL 返回：
  - `deletePartyA(input: DeletePartyAInput!): Boolean`
- 与源实现对齐的细节：
  - 删除时只更新 `isActive` 和 `updatedAt`
  - 不额外改写 `updatedBy`

### `quotationByContractType`

- 源真相：
  - 真实注册接口是 `GET /quotations/search`
  - 入参是 `contract_id` + `quote_type_id`
  - `quote_type_id` 只允许 `1 / 2 / 3`
  - 查询不到时不是 404，而是成功返回 `data = null`
- 当前 GraphQL 返回：
  - `quotationByContractType(input: QuotationByContractTypeInput!): QuotationType`
  - query 本身为 `nullable`
  - 查询不到时返回 `null`，不抛错
- 当前实现策略：
  - 只补查询所需最小读模型：
    - `power_system_quotation`
    - `power_system_fixed_price_details`
    - `power_system_proportion_sharing_details`
    - `power_system_price_difference_details`
  - legacy `quotation`、详情表通过幂等 backfill 迁移回填
  - `monthlyElectricity` 与 `quoteDetails` 使用 GraphQL JSON 标量返回
  - 顶层字段遵守仓库 camelCase 规则
  - `quoteDetails` 内部 key 保持源业务 payload 的 snake_case 语义
- 审计修正说明：
  - 源 `quotation_service.py` 对比例分成详情的格式化字段名存在陈旧实现，与 model/schema/docs 不一致
  - 迁移实现按 model/schema/docs 一致口径输出 `ps_*` 字段，不复刻该陈旧 bug

### `contracts`

- 源真相：
  - 真实注册接口是 `GET /contracts/`
  - 入参是：
    - `party_a_id` 可选
    - `page` 默认 `1`
    - `page_size` 默认 `20`，最大 `100`
  - 仅查询 `is_active = true` 的合同
  - 排序是 `updated_at DESC`
  - 列表项同时返回：
    - 合同基础信息
    - 甲乙双方展示字段
    - 主报价摘要字段
- 当前 GraphQL 返回：
  - `contracts(input?: ContractsInput): ContractsOutput`
  - 返回结构：
    - `items`
    - `pagination { page, pageSize, total, totalPages, hasNext, hasPrev }`
- 当前实现策略：
  - `partyAId` 过滤保持源接口宽松语义，不额外限制为正数
  - 默认只查 `isActive = true`
  - 排序采用 `updatedAt DESC, contractId DESC`
  - 为模拟源 `get_primary_quotation()` 的“取第一条报价”语义：
    - 先按 `quotation.id ASC` 拉取合同报价
    - 每个合同只保留最小 `id` 的那条报价做摘要映射
  - `partyACustom = true` 时优先返回合同上的自定义甲方展示字段
  - `partyACustom = false` 时返回甲方主数据展示字段
- 数据兼容策略：
  - 新表固定为 `power_system_contract`
  - legacy `contract` 通过幂等 backfill 迁移回填
  - 当前 contract 表 migration 不加硬外键到 `party_a_id / party_b_id`
  - 原因：
    - 源项目自定义甲方流程会留下 `party_a_id = -1` 的兼容数据
    - 现阶段应先保证旧数据可迁入、空库可 drill
- 已知且接受的契约差异：
  - 旧 REST 顶层分页字段是平铺的 `total / page / page_size / total_pages`
  - 新 GraphQL 统一收敛到 `pagination` 对象

### `contract`

- 源真相：
  - 真实注册接口是 `GET /contracts/{contract_id}`
  - 实际走的是 `get_contract_detail_by_id()` 的详情语义，不是简单基础单查
  - 仅查询 `is_active = true` 的合同
  - 不存在或已停用时返回 404
  - 返回结构分为：
    - `basic_info`
    - `contract_content`
  - `contract_content` 内还包含：
    - 甲方信息
    - 乙方信息
    - 报价信息
- 当前 GraphQL 返回：
  - `contract(input: ContractInput!): ContractType`
  - 返回结构分为：
    - `basicInfo`
    - `contractContent`
- 当前实现策略：
  - 保留源详情接口的双层结构，不压平成单层对象
  - 顶层字段统一转为 camelCase
  - 跨子域读模型组装提升到 `GetContractUsecase`
    - `ContractQueryService` 不直接依赖 `QuotationQueryService`
    - 避免出现 modules 层跨子域 QueryService 直接依赖
  - `partyACustom = true` 时返回合成的 `partyA` 视图：
    - `partyAId = -1`
    - `createdBy/updatedBy = 'custom'`
    - `powerSupplyInfo = []`
  - `partyACustom = false` 时返回真实甲方及其 `powerSupplyInfo`
  - 报价信息沿用“每合同按最小 `quotation.id` 取第一条报价”的兼容策略
  - `quotationInfo` 固定返回对象：
    - 无报价时返回全 `null / {}` 的空结构
    - 不抛 not found
- not found：
  - message: `合同不存在`
  - errorCode: `POWER_SYSTEM_CONTRACT_NOT_FOUND`
  - GraphQL code: `NOT_FOUND`
- 已知且接受的契约差异：
  - 旧 REST 使用 snake_case 的 `basic_info / contract_content / quotation_info`
  - 新 GraphQL 统一为 camelCase 的 `basicInfo / contractContent / quotationInfo`

### `createContract`

- 源真相：
  - 真实注册接口是 `POST /contracts/`
  - 创建合同时报价信息 `quotation` 为必填
  - 系统自动写入：
    - 合同：`isActive = true`、`createdBy = 'admin'`、`updatedBy = 'admin'`
    - 迁移实现中报价主表与报价详情也统一补 `createdBy/updatedBy = 'admin'`
  - 自定义甲方是一个兼容性怪行为：
    - 先根据 `party_a_custom_*` 创建一条新的甲方记录
    - 随后仍把合同上的 `party_a_id` 改写为 `-1`
    - 最终形成“影子 PartyA 已创建，但合同仍指向 sentinel `-1`”的源行为
- 当前 GraphQL 返回：
  - `createContract(input: CreateContractInput!): ContractType`
  - 返回结构与 `contract` 详情接口完全一致：
    - `basicInfo`
    - `contractContent`
- 当前实现策略：
  - 写事务收敛在 `CreateContractUsecase`
  - 创建后在同一事务 manager 内回查合同详情，再走既有详情读映射返回
  - `partyACustom = true` 时保留源行为：
    - 影子 PartyA 记录会创建
    - 合同仍落 `partyAId = -1`
  - `partyACustom = false` 时要求有效 `partyAId`
  - `partyBId` 必须指向有效乙方
  - `quotation` 根据 `quoteTypeId` 写入主表和对应详情表
  - `filingMethod` 默认 `'2'`
  - `filingParty` 默认 `'乙'`
- not found：
  - 缺失甲方：
    - message: `甲方不存在`
    - errorCode: `POWER_SYSTEM_PARTY_A_NOT_FOUND`
    - GraphQL code: `NOT_FOUND`
  - 缺失乙方：
    - message: `乙方不存在`
    - errorCode: `POWER_SYSTEM_PARTY_B_NOT_FOUND`
    - GraphQL code: `NOT_FOUND`
- 当前已覆盖 E2E：
  - 自定义甲方成功创建
  - 缺失乙方返回 `NOT_FOUND`
  - `greenElecAllow = true` 但缺少 `greenElecPrice` 返回 `BAD_USER_INPUT`

### `updateContract`

- 源真相：
  - 真实注册接口是 `PUT /contracts/{contract_id}`
  - 仅更新 `is_active = true` 的合同
  - 系统自动写入：
    - 合同 `updatedBy = 'admin'`
    - 若同时更新报价，报价主表和详情表的 `updatedBy` 也保持统一写入
  - 支持部分更新
  - 若传入 `quotation`，会同步更新合同对应报价
  - 自定义甲方更新逻辑具有源兼容特征：
    - 只要传了 `party_a_custom` 或任意 `party_a_custom_*` 字段，就触发自定义甲方处理
    - 当生效值为 `true` 时，合同上的 `party_a_id` 会落为 `-1`
    - 当生效值为 `false` 时，源实现不会强制把历史 sentinel `-1` 纠正成真实甲方
- 当前 GraphQL 返回：
  - `updateContract(input: UpdateContractInput!): ContractType`
  - 返回结构与 `contract` 详情接口完全一致：
    - `basicInfo`
    - `contractContent`
- 当前实现策略：
  - 写事务收敛在 `UpdateContractUsecase`
  - 自定义甲方逻辑按源行为兼容：
    - 若本次更新生效为 `partyACustom = true`，则保留并更新传入的 `partyACustom*` 字段
    - 合同仍落 `partyAId = -1`
    - 若本次更新生效为 `partyACustom = false`，则清空未显式传入的自定义甲方字段
  - `partyBId` 若显式传入，必须指向有效乙方
  - `partyAId` 仅在显式传入且 `partyACustom = false` 时做正整数校验
  - 若合同当前无报价但更新中携带了 `quotation`，则按“创建报价”的完整口径补建
  - 若已有报价且 `quoteTypeId` 变化：
    - 迁移实现会删除旧报价类型对应的详情行
    - 再 upsert 新报价类型对应的详情行
    - 这是对源实现“可能残留陈旧隐藏详情行”的内部清理优化
- not found：
  - 缺失合同：
    - message: `合同不存在`
    - errorCode: `POWER_SYSTEM_CONTRACT_NOT_FOUND`
    - GraphQL code: `NOT_FOUND`
  - 缺失甲方：
    - message: `甲方不存在`
    - errorCode: `POWER_SYSTEM_PARTY_A_NOT_FOUND`
    - GraphQL code: `NOT_FOUND`
  - 缺失乙方：
    - message: `乙方不存在`
    - errorCode: `POWER_SYSTEM_PARTY_B_NOT_FOUND`
    - GraphQL code: `NOT_FOUND`
- 当前已覆盖 E2E：
  - 成功更新合同并切换报价类型
  - 缺失合同返回 `NOT_FOUND`
  - 非法 `contractId` 返回 `BAD_USER_INPUT`

### `deleteContract`

- 源真相：
  - 真实注册接口是 `DELETE /contracts/{contract_id}`
  - 仅处理 `is_active = true` 的合同
  - 删除语义是软删除：
    - `is_active = false`
    - `updated_at = now()`
  - 源实现删除时不会额外改写 `updated_by`
  - 找不到有效合同则返回 404
- 当前 GraphQL 返回：
  - `deleteContract(input: DeleteContractInput!): Boolean!`
- 当前实现策略：
  - 写事务收敛在 `DeleteContractUsecase`
  - `ContractService.softDeleteContract()` 只改：
    - `isActive`
    - `updatedAt`
  - 不额外改写 `updatedBy`
  - 不联动删除报价记录
- not found：
  - message: `合同不存在`
  - errorCode: `POWER_SYSTEM_CONTRACT_NOT_FOUND`
  - GraphQL code: `NOT_FOUND`
- 当前已覆盖 E2E：
  - 成功软删除有效合同
  - 已停用合同返回 `NOT_FOUND`
  - 非法 `contractId` 返回 `BAD_USER_INPUT`
- 已知且接受的契约差异：
  - 旧 REST 返回删除成功消息
  - 新 GraphQL 统一返回 `Boolean`

### `GET /power-system/contracts/:contractId/docx`

- 源真相：
  - 真实注册接口是 `GET /contracts/{contract_id}/generate-docx-stream`
  - 输入是路径参数 `contract_id`
  - 行为是：
    - 读取合同详情
    - 按 `quote_type_id` 选择三份 Word 模板之一
    - 以占位符替换方式生成 `.docx`
    - 从临时文件读出字节流并以附件形式返回
  - 成功响应：
    - `Content-Type = application/vnd.openxmlformats-officedocument.wordprocessingml.document`
    - `Content-Disposition = attachment; filename=contract_{contract_id}_{timestamp}.docx`
- 当前 HTTP 返回：
  - `GET /power-system/contracts/:contractId/docx`
  - 直接返回 `.docx` 二进制附件
- 当前实现策略：
  - HTTP adapter 只做路径参数解析、响应头设置和错误映射
  - 编排收敛在 `GenerateContractDocxUsecase`
  - 文档数据复用既有 `GetContractUsecase` 的详情读模型
  - 模板与占位符映射已内置到当前仓库：
    - `src/infrastructure/docx/templates/contracts/template_fixed_price.docx`
    - `src/infrastructure/docx/templates/contracts/template_proportion_sharing.docx`
    - `src/infrastructure/docx/templates/contracts/template_price_difference.docx`
    - `src/infrastructure/docx/templates/contracts/placeholder_mapping_by_template.json`
  - `.docx` 生成改为：
    - 按 `quote_type_id` 选择原始模板
    - 基于占位符映射做模板替换
    - 保留模板版式
    - 月度电量表格按模板行动态填充
    - 直接在内存中生成结果，不落临时文件
- not found：
  - message: `合同不存在`
  - errorCode: `POWER_SYSTEM_CONTRACT_NOT_FOUND`
  - HTTP status: `404`
- bad request：
  - 非法合同 ID：
    - errorCode: `INPUT_NORMALIZE_INVALID_LIMIT_VALUE`
    - HTTP status: `400`
- 当前已覆盖 E2E：
  - 成功下载 DOCX 附件
  - 已停用合同返回 `404`
  - 非法 `contractId` 返回 `400`
- 已知且接受的差异：
  - 旧实现使用源码外部路径 `/workspace/...`
  - 新实现把模板和映射文件内置到了当前仓库，并支持 `src` / `dist` 两种运行路径
  - 文件仍是内存返回，不再依赖临时文件
  - 接口协议与版式策略均已回到“模板 + 占位符替换”的业务要求

### `POST /power-system/bills/docx`

- 源真相：
  - 真实注册接口是 `POST /bills/generatebill`
  - 输入 body 是：
    - `party_a_name: str`
    - `quota_info: list[dict[str, str]]`
  - 行为是：
    - 读取报价单模板
    - 替换甲方名称和当前日期
    - 把 `quota_info` 填进表格
    - 保存临时文件后再读成字节流返回
  - 成功响应：
    - `Content-Type = application/vnd.openxmlformats-officedocument.wordprocessingml.document`
    - `Content-Disposition = attachment; filename*=UTF-8''bill_{party_a_name}_{timestamp}.docx`
- 当前 HTTP 返回：
  - `POST /power-system/bills/docx`
  - 直接返回 `.docx` 二进制附件
- 当前实现策略：
  - HTTP adapter 只做 body 接收、响应头设置和错误映射
  - 编排收敛在 `GenerateBillDocxUsecase`
  - bill 接口是纯 payload 驱动：
    - 不读库
    - 不写库
    - 不需要 migration
  - 模板资产已内置到当前仓库：
    - `src/infrastructure/docx/templates/bills/template_bill.docx`
  - `.docx` 生成方式改为：
    - 读取模板文件
    - 替换甲方名称和当前日期占位符
    - 以模板行克隆方式填充报价表格
    - 直接在内存中返回结果，不落临时文件
- bad request：
  - `partyAName` 不是字符串：
    - errorCode: `INPUT_NORMALIZE_INVALID_TEXT`
    - HTTP status: `400`
  - `quotaInfo` 不是数组：
    - errorCode: `INPUT_NORMALIZE_INVALID_TEXT_LIST`
    - HTTP status: `400`
  - `quotaInfo[*]` 不是对象：
    - errorCode: `INPUT_NORMALIZE_INVALID_TEXT_LIST_ITEM`
    - HTTP status: `400`
- 当前已覆盖 E2E：
  - 成功下载 DOCX 附件
  - `quotaInfo` 非数组返回 `400`
  - `quotaInfo[0]` 非对象返回 `400`
- 已知且接受的差异：
  - 旧实现使用 snake_case body：`party_a_name`、`quota_info`
  - 新实现按 Nest 风格使用 camelCase body：`partyAName`、`quotaInfo`
  - 旧实现引用源码外部固定路径 `/workspace/app/word_template/template_bill.docx`
  - 新实现把模板文件内置到了当前仓库，并支持 `src` / `dist` 两种运行路径
  - 报价项缺失 `quotaPrice/quotaType` 时，当前实现仍会生成文档，只回落为空字符串，保持与源实现接近的宽松语义

### `powerCompanies`

- 源真相：
  - 真实注册接口是 `GET /power-consumption/companies`
  - 无输入参数
  - 查询来源是 `actual_power_consumption.retail_user_name`
  - 只保留：
    - 非 `NULL`
    - 非空字符串
  - 行为是：
    - 去重
    - 按公司名升序排序
    - 在结果首位插入固定项 `"--全部--"`
  - 空表或全为空值时，源实现仍会返回：
    - `["--全部--"]`
- 当前 GraphQL 返回：
  - `powerCompanies: [String!]!`
- 当前实现策略：
  - 这轮只为当前接口补最小读模型：
    - `power_system_actual_power_consumption`
  - 当前表结构只覆盖本接口所需字段：
    - `id`
    - `seller_company_name`
    - `retail_user_name`
    - `record_date`
    - `account_number`
    - 审计字段
  - 已补齐空库 baseline migration 与 legacy 幂等 backfill migration
  - 读流程保持分层：
    - `PowerSystemPowerConsumptionResolver`
    - `ListPowerCompaniesUsecase`
    - `PowerConsumptionService`
    - `PowerConsumptionQueryService`
  - `PowerConsumptionService` 负责从库里查 distinct 公司名
  - `PowerConsumptionQueryService` 负责：
    - 去重兜底
    - trim
    - 升序排序
    - 插入 `"--全部--"`
- 当前已覆盖 E2E：
  - 成功返回去重升序公司名，且首项为 `"--全部--"`
  - 空表/无有效公司名时返回 `["--全部--"]`
- review 结论：
  - 该接口没有源项目层面的参数校验、not found 或业务冲突分支
  - 当前实现未人为引入新的错误分支
  - adapter 未直接依赖 modules
  - 读映射保持收敛在 QueryService

### `powerDailySummary`

- 源真相：
  - 真实注册接口是 `GET /power-consumption/daily-summary`
  - 输入是：
    - `company_name`
    - `start_date`
    - `end_date`
  - `company_name = "--全部--"` 表示汇总全部企业
  - 行为是：
    - 分别查询实际用电和预测用电
    - 对每条记录的 96 个时段电量求和，得到单条记录的日总电量
    - 再按 `record_date` 聚合成每日总量
    - 用完整日期区间左连接补齐每天
    - 计算 `forecast_deviation = (forecast - actual) / forecast * 100`
  - 源 endpoint 有 `days` 为空时返回 404 的分支
  - 但按源 service 实际实现，只要日期区间有效，`days` 会按日期补齐，因此该 404 分支通常不可达
- 当前 GraphQL 返回：
  - `powerDailySummary(input: PowerDailySummaryInput!): PowerDailySummaryType!`
  - 返回结构：
    - `companyName`
    - `startDate`
    - `endDate`
    - `days[]`
- 当前实现策略：
  - 为保持单接口增量迁移，这轮没有提前引入 96 个时段列的新表复制
  - 当前只补“日总电量”最小读模型：
    - 在 `power_system_actual_power_consumption` 增加 `daily_total_energy_kwh`
    - 新建 `power_system_forecast_power_consumption`
      - `seller_company_name`
      - `retail_user_name`
      - `record_date`
      - `use_date`
      - `daily_total_energy_kwh`
      - 审计字段
  - 已补齐：
    - 空库 baseline migration
    - legacy 幂等 backfill migration
  - 读流程保持分层：
    - `PowerSystemPowerConsumptionResolver`
    - `GetPowerDailySummaryUsecase`
    - `PowerConsumptionService`
    - `PowerConsumptionQueryService`
  - `PowerConsumptionService` 负责：
    - 按日期区间和公司过滤聚合 actual / forecast 日总电量
  - `PowerConsumptionQueryService` 负责：
    - 生成完整日期区间
    - 合并 actual / forecast
    - 计算 `forecastDeviation`
  - 输入口径：
    - `companyName` 必填
    - `startDate / endDate` 必须是 `YYYY-MM-DD`
    - `startDate > endDate` 返回：
      - errorCode: `TIME_INVALID_TIME_RANGE_ORDER`
      - GraphQL code: `BAD_USER_INPUT`
      - message: `起始日期不能晚于终止日期`
- 当前已覆盖 E2E：
  - 成功汇总 `--全部--` 范围内的每日实际与预测电量
  - 无匹配数据时，仍按日期区间返回补齐后的空日序列
  - 反转日期区间返回 `BAD_USER_INPUT`
- review 结论：
  - 当前实现没有人为添加新的 not found 业务分支
  - 这是刻意保持与源 service 的“日期补齐后通常不会空 days”语义一致
  - 本轮修正过一个真实兼容问题：
    - MySQL `date` 字段在 Node 中不能直接用 `toISOString()` 做 key
    - 否则会因时区换算导致日期前移一天
    - 当前已改为按本地年月日组件格式化
- 延后实现项：
  - 本轮为了保持“单接口增量迁移”，没有把源项目 `actual_power_consumption / forecast_power_consumption` 的 96 个 15 分钟时段列迁入新表
  - 当前只落了 `daily_total_energy_kwh`，足够支撑 `powerDailySummary`
  - 这部分必须在后续 `powerIntervalSummary` 中补齐，否则会导致：
    - 无法按 15 分钟粒度返回 points
    - 无法完整复刻源接口的 `need_upload / forecast_report` 语义
  - 后续 `powerIntervalSummary` 实现时必须补：
    - actual / forecast 两张表的 96 个时段列
    - legacy 96 列回填 migration
    - 基于 96 列的区间明细聚合逻辑
    - 与源接口一致的缺失预测说明口径

补充状态更新：

- 上述延后项已在后续 `powerIntervalSummary` 轮次全部补齐
- 当前 `powerDailySummary` 与 `powerIntervalSummary` 已共享同一套 actual / forecast 读模型

### `powerIntervalSummary`

- 源真相：
  - 真实注册接口是 `GET /power-consumption/interval-summary`
  - 输入是：
    - `company_name`
    - `start_date`
    - `end_date`
  - 行为是：
    - 分别查询实际用电和预测用电的 96 个 15 分钟时段列
    - 先按 `record_date` 聚合，再按时段摊平成 `points[]`
    - `24:00` 时段要落到次日 `00:00`
    - 若 actual / forecast 都为空：
      - `points = []`
      - `need_upload = true`
      - `forecast_report = "当前时间段无任何数据"`
    - 否则：
      - 调用 `_check_forecast_missing(company_name, start_date, end_date)`
      - 对每个缺失预测日期，再向前检查 14 天的实际数据缺口
      - 若 `company_name in AVAILABLE_COMPANIES or company_name == "--全部--"`：
        - 返回“缺失预测日期 + 待补充实际数据日期”文案
      - 否则：
        - 返回 `当前预测模型不支持此公司：{company_name}`
  - 必须保留的源项目怪异语义：
    - `_check_forecast_missing()` 对 `--全部--` 没有特殊处理
    - 也就是说 `company_name == "--全部--"` 时，它仍按字面值过滤 `retail_user_name == "--全部--"`
    - 这个行为会让“全部企业”的 `need_upload / forecast_report` 看起来偏怪，但迁移必须保留，不能私自修正
- 当前 GraphQL 返回：
  - `powerIntervalSummary(input: PowerIntervalSummaryInput!): PowerIntervalSummaryType!`
  - 返回结构：
    - `companyName`
    - `startDate`
    - `endDate`
    - `points[]`
      - `timestamp`
      - `actualEnergyKwh`
      - `forecastEnergyKwh`
    - `needUpload`
    - `forecastReport`
- 当前实现策略：
  - 已在 `power_system_actual_power_consumption / power_system_forecast_power_consumption` 两张表中补齐 96 个时段列
  - 已补齐 4 条 migration：
    - actual 表增列
    - actual legacy 96 列回填
    - forecast 表增列
    - forecast legacy 96 列回填
  - 读流程保持分层：
    - `PowerSystemPowerConsumptionResolver`
    - `GetPowerIntervalSummaryUsecase`
    - `PowerConsumptionService`
    - `PowerConsumptionQueryService`
  - `PowerConsumptionService` 负责：
    - 按日期聚合 actual / forecast 的 96 时段列
    - 检查 forecast 缺失日期
    - 检查 actual 回看窗口缺失日期
  - `PowerConsumptionQueryService` 负责：
    - 构造 15 分钟时间点
    - 处理 `24:00 -> 次日 00:00`
    - 生成 `points`
    - 生成 `needUpload / forecastReport`
  - 已引入并固化共享常量：
    - `POWER_CONSUMPTION_INTERVALS`
    - `POWER_CONSUMPTION_SUPPORTED_COMPANIES`
- 当前已覆盖 E2E：
  - 支持企业的 15 分钟实际/预测点位汇总成功
  - 不在预测模型支持列表中的企业会返回“不支持此公司”文案
  - 当前区间无数据时返回空 points + `needUpload = true`
  - 反转日期区间返回 `BAD_USER_INPUT`
- review 结论：
  - 这一轮完整收口了上一轮 `powerDailySummary` 延后的 96 时段能力
  - adapter 未直接依赖 modules
  - 读映射仍收敛在 QueryService
  - 没有引入源项目没有的新业务规则
  - 已显式保留 `--全部--` 的缺预测检查怪异语义
- 延后实现项：
  - 与“任务上传 / 预测任务状态 / CSV 报告 / WebSocket 价格分析”相关的表、状态机和导出逻辑，本轮没有提前实现
  - 这些能力归属于后续接口：
    - `powerCompanyJobs`
    - `POST /power-system/power-consumption/tasks`
    - `powerTaskStatus`
    - `GET /power-system/power-consumption/report`
    - `WS /power-system/price-analysis`
  - 后续实现时必须继续对齐源项目真实行为：
    - 任务状态推进口径
    - 公司级 job 汇总口径
    - 报告导出的字段与文件协议
    - WebSocket 推送的事件粒度与消息结构

### `powerCompanyJobs`

- 源真相：
  - 真实注册接口是 `GET /power-consumption/jobs/{company_name}`
  - 行为是：
    - 只扫描 `task_summary.status == "computing"` 的任务
    - 从每条任务的 `compute_summary.jobs[]` 中筛出 `company_name == {company_name}` 的 job
    - 对无效 `status` / 无效 `predicted_date` / 无法识别的 job 直接跳过
    - `in_progress` 只要匹配 job 中存在 `status == "not_started"` 就为 `true`
    - 最终按 `(predicted_date, task_id)` 排序
  - 该接口没有 not found 分支：
    - 没有匹配 job 时返回空列表
    - `in_progress = false`
  - 该接口依赖的是 `power_consumption` 自己的 `task_summary` 聚合表
  - 不能错误复用当前仓库通用的 `base_async_task_records`
- 当前 GraphQL 返回：
  - `powerCompanyJobs(input: PowerCompanyJobsInput!): PowerCompanyJobsType!`
  - 返回结构：
    - `companyName`
    - `jobs[]`
      - `taskId`
      - `taskName`
      - `predictedDate`
      - `status`
      - `errorMessage`
    - `inProgress`
- 当前实现策略：
  - 新建 PowerSystem 自有任务汇总表：
    - `power_system_task_summary`
  - 已补齐：
    - 空库 baseline migration
    - legacy `task_summary -> power_system_task_summary` 幂等 backfill migration
  - 读流程保持分层：
    - `PowerSystemPowerConsumptionResolver`
    - `GetPowerCompanyJobsUsecase`
    - `PowerConsumptionService`
    - `PowerConsumptionQueryService`
  - `PowerConsumptionService` 负责：
    - 读取 `status = "computing"` 的任务
    - 解析 `compute_summary.jobs`
    - 过滤匹配公司并跳过坏数据
  - `PowerConsumptionQueryService` 负责：
    - 按 `(predictedDate, taskId)` 排序
    - 计算 `inProgress`
  - 已补稳定复用的任务状态类型：
    - `src/types/power-system/power-task.types.ts`
- 当前已覆盖 E2E：
  - 成功返回 computing 任务中的匹配公司 job，并正确计算 `inProgress`
  - 没有匹配 job 时返回空列表
  - 空白公司名返回 `BAD_USER_INPUT`
- review 结论：
  - 当前实现没有提前引入任务创建/执行逻辑
  - adapter 未直接依赖 modules
  - 没有把通用异步任务表误当成源项目任务汇总表
  - 没有引入源接口没有的 not found / 业务冲突分支
- 延后实现项：
  - 任务创建、上传、计算推进和完整任务详情仍未在本轮实现
  - 这些能力归属于后续接口：
    - `POST /power-system/power-consumption/tasks`
    - `powerTaskStatus`
    - `GET /power-system/power-consumption/report`
    - `WS /power-system/price-analysis`
  - 后续实现时必须继续复用并扩展 `power_system_task_summary`：
    - 不能另起一套任务主表
    - 必须继续对齐 legacy `upload_summary / compute_summary / error_message / status` 语义

### `POST /power-system/power-consumption/tasks`

- 源真相：
  - 真实注册接口是 `POST /power-consumption/tasks/execute`
  - 输入是 multipart form-data：
    - `files[]`
    - 可选 `task_name`
  - 行为是：
    - 至少上传一个 CSV 文件，否则返回 400，提示 `至少上传一个CSV文件`
    - 逐个读取文件内容并创建任务
    - 上传阶段负责：
      - 校验扩展名
      - 校验空文件
      - 解析 CSV
      - 保存上传文件
      - 将 actual_power_consumption 做 upsert
      - 汇总 `company_dates`
    - 返回：
      - `task_id`
      - `upload_report`
    - legacy 还会在后续异步阶段继续执行预测计算
- 当前 HTTP 返回：
  - `POST /power-system/power-consumption/tasks`
  - 成功返回原始 JSON：
    - `taskId`
    - `uploadReport`
  - 参数错误返回原始 JSON：
    - `errorCode`
    - `message`
  - 这里刻意使用手动 response 输出，绕过仓库全局 HTTP JSON envelope middleware，避免把该接口契约包成 `success/data/requestId/host`
- 当前实现策略：
  - 复用并扩展上一轮已经落地的 `power_system_task_summary`
  - 不新增新的任务主表
  - `ExecutePowerTaskUsecase` 负责：
    - 归一化 multipart 输入
    - 创建任务汇总记录
    - 推进 `created -> uploading -> uploaded/computing/completed`
    - 解析 CSV 并归一化实际用电行
    - 保存上传文件到 `uploads/power-system/tasks`
    - 调用 `PowerConsumptionService.upsertActualPowerRows`
    - 构建 `uploadSummary`
    - 初始化 `computeSummary` 骨架
  - `PowerConsumptionService` 负责：
    - actual_power 数据 upsert
    - 根据 `companyDates` 选择 forecast jobs
    - 初始化 `compute_summary.jobs[]`
  - 当前 CSV 兼容口径：
    - 接受中文表头与 snake_case 基础表头
    - 接受 `HH:MM` 与 `24:00`
    - 仅对实际提供的时段列做“空值即整行丢弃”
    - 按 `(accountNumber, recordDate)` 去重，保留最后一行
  - 当前任务初始化口径：
    - 有可启动 job 时：任务状态为 `computing`
    - 无可启动 job 时：任务状态直接为 `completed`
    - 会继续写入 legacy 风格的 `error_message`
  - 当前实现还顺手修正了一个真实问题：
    - 同秒同名上传文件保存名会冲突覆盖
    - 现已在保存名中加入随机后缀
- 当前已覆盖 E2E：
  - 成功上传 CSV、写入 actual 数据并执行真实 forecast job
  - 没有文件时返回 400
  - 非 CSV 文件按 legacy 口径记为失败，但任务仍创建并收敛为 `completed`
  - 聚合预测外调失败时，任务仍收敛为 `completed`，并正确累积 `failed_jobs` 与 `error_message`
  - 回归验证 `powerCompanyJobs` 未被打坏
- review 结论：
  - 当前接口已经完成“任务创建 + 上传入库 + 真实预测执行”
  - adapter 未直接依赖 modules
  - 没有新建第二套任务主表
  - 没有把 JSON HTTP 返回错误地交给全局响应包装中间件改写
  - 当前实现保持了 legacy 对失败文件“任务仍创建”的宽松语义
  - 当前增强实现新增了 core port：
    - `PowerPredictPort`
    - usecase 不再直接依赖 infrastructure
- 延后实现项：
  - 当前已补齐真实 forecast 外调与 forecast 表落库
  - 目前剩余的增强方向不是“功能缺失”，而是“运行形态优化”：
    - 默认是 API 进程内后台推进
    - E2E 通过 `POWER_SYSTEM_TASKS_INLINE=true` 走同步执行，确保稳定验证
    - 若后续需要更强健的生产运行形态，可再升级为独立 worker / queue 化

### `powerTaskStatus`

- 源真相：
  - 真实注册接口是 `GET /power-consumption/tasks/{task_id}`
  - 行为是：
    - 按 `task_id` 查询 `task_summary`
    - 不存在返回 404，提示 `任务不存在`
    - 成功时返回任务完整生命周期快照：
      - `task_id`
      - `task_name`
      - `status`
      - `start_time`
      - `end_time`
      - `upload`
      - `compute`
      - `error_message`
    - 其中 `upload / compute` 本质来自 JSON 字段，legacy schema 允许它们在坏数据情况下退化为字典
- 当前 GraphQL 返回：
  - `powerTaskStatus(input: PowerTaskStatusInput!): PowerTaskStatusType!`
  - 返回结构：
    - `taskId`
    - `taskName`
    - `status`
    - `startTime`
    - `endTime`
    - `upload`
      - `startTime`
      - `endTime`
      - `totalFiles`
      - `uploadedFiles`
      - `failedFiles`
      - `files[]`
      - `companyDates[]`
    - `compute`
      - `startTime`
      - `endTime`
      - `totalJobs`
      - `successfulJobs`
      - `failedJobs`
      - `progress`
      - `jobs[]`
    - `errorMessage`
- 当前实现策略：
  - 继续复用 `power_system_task_summary`
  - 不新增任何表或 migration
  - `GetPowerTaskStatusUsecase` 负责：
    - 归一化 `taskId`
    - 查任务
    - 不存在时抛 `POWER_SYSTEM_TASK_NOT_FOUND`
  - `PowerConsumptionQueryService` 负责：
    - 将 `upload_summary / compute_summary` 从 JSON 快照规范化为强类型 GraphQL 读模型
    - 兼容坏数据：
      - 非法时间回落为 `null`
      - 非法数字回落为 `0`
      - 非法 job / file / company_dates 项直接跳过
    - 将 legacy `company_dates` 的字典结构规范成 `companyDates[]`
  - 这一轮显式不把原始 JSON 直接暴露给 adapter 层，避免 DTO/Entity/JSON blob 泄漏
- 当前已覆盖 E2E：
  - 成功返回完整任务状态快照
  - 任务不存在返回 `NOT_FOUND`
  - 非法 `taskId` 返回 `BAD_USER_INPUT`
  - 回归验证 `POST /power-system/power-consumption/tasks` 未被打坏
- review 结论：
  - 分层符合 `adapters -> usecases -> modules`
  - adapter 未直接依赖 modules
  - 读映射收敛在 QueryService
  - 没有提前把 report / WS 兄弟接口带进来
  - 当前接口与 legacy 核心能力逐项对齐
- 接受差异：
  - legacy `upload.company_dates` 是对象字典
  - 新 GraphQL 为了强类型和 schema 稳定性，将其规范为 `companyDates[]`
  - 这属于契约规范化，不改变业务信息
- 延后实现项：
  - 当前状态接口只读取并格式化已有快照，不负责推进真实计算执行
  - 这部分后续接口已全部收口完成：
    - `GET /power-system/power-consumption/report`
    - `WS /power-system/price-analysis`
  - 后续实现时必须继续复用 `power_system_task_summary`，不能新起任务主表

### `GET /power-system/power-consumption/report`

- 源真相：
  - 真实注册接口是 `GET /power-consumption/generate-report`
  - 输入查询参数是：
    - `company_name`
    - `start_date`
    - `end_date`
  - 行为是：
    - 直接读取 `forecast_power_consumption`
    - 选择 `公司名称 / 日期 / 96 个 15 分钟时段列`
    - 无数据时返回 404，提示 `当前预测数据不存在`
    - 成功时以附件流下载 CSV
    - 文件名格式：
      - `forecast_report_{company}_{timestamp}.csv`
      - 空名回退为 `all_companies`
- 当前 HTTP 返回：
  - `GET /power-system/power-consumption/report`
  - 查询参数改为 camelCase：
    - `companyName`
    - `startDate`
    - `endDate`
  - 成功返回原始 CSV 附件流：
    - `Content-Type: text/csv; charset=utf-8`
    - `Content-Disposition: attachment; filename*=UTF-8''...`
  - 错误返回原始 JSON：
    - `errorCode`
    - `message`
- 当前实现策略：
  - 不新增表，不触发任务执行
  - 直接读取现有 `power_system_forecast_power_consumption`
  - `GeneratePowerReportUsecase` 负责：
    - 归一化查询参数
    - 查询 forecast 行
    - 无数据时抛 `POWER_SYSTEM_REPORT_NOT_FOUND`
    - 生成 BOM UTF-8 CSV buffer
    - 生成安全文件名
  - `PowerConsumptionService` 负责：
    - 按公司与日期区间读取 forecast 行
    - 维持稳定排序：`recordDate ASC, retailUserName ASC`
  - `PowerConsumptionQueryService` 负责：
    - 构造 CSV 表头
    - 生成每行的 96 时段值
    - 处理 CSV 转义
  - 当前导出仍然完全基于 forecast 表快照：
    - 不会补算
    - 不会推进任务状态
- 当前已覆盖 E2E：
  - 成功下载 CSV，校验 BOM、文件名、头部和内容
  - 无 forecast 数据时返回 404
  - 反转日期区间返回 400
  - 回归验证 `powerTaskStatus` 未被打坏
- review 结论：
  - 分层符合 `adapters -> usecases -> modules`
  - 没有把 CSV 协议细节泄漏到 module 层
  - 没有引入源接口没有的新业务规则
  - 接口仅读 forecast 快照，和 legacy 语义一致
- 接受差异：
  - legacy 查询参数是 snake_case
  - 当前 Nest 风格接口统一改为 camelCase
  - 这是契约规范化，不改变业务能力
- 延后实现项：
  - 无

### `WS /power-system/price-analysis`

- 源真相：
  - 真实注册接口是 `WS /ws/price-analysis`
  - 协议语义是：
    - 连接建立后发送 connected 消息
    - 客户端提交文件列表
    - 服务端推送 progress / error / complete 消息
    - 完成后返回 Excel 文件内容与抽取结果
  - 输入文件本质上是 PDF 文件的 base64 内容
  - 结果依赖 legacy 模板与字段映射：
    - `elec_price_dict.json`
    - `elec_price_tmplate.xlsx`
- 当前 WS 返回：
  - `WS /power-system/price-analysis`
  - 建连成功先返回：
    - `status: connected`
    - `message: Connected to Price Analysis Service. Please send files.`
  - 客户端发送 JSON payload：
    - `files`
  - 过程消息包含：
    - `connected`
    - `progress`
    - `error`
    - `complete`
  - 完成消息返回：
    - `filename`
    - `content`
    - `warnings`
    - `json_data`
- 当前实现策略：
  - 采用 raw `ws` 适配器挂到现有 HTTP server upgrade
  - `ExecutePriceAnalysisUsecase` 负责：
    - 校验 payload
    - 解析 base64 文件
    - 管理临时目录
    - 推送进度消息
  - `PriceAnalysisService` 负责：
    - 识别文档类型与月份
    - 协调 PDF 文本抽取
    - 组装结构化价格分析数据
  - `PriceAnalysisPdfExtractor` 负责：
    - 运行时优先使用 `pdf-parse`
    - Jest / E2E 下启用简单 stream 文本抽取回退
  - `PriceAnalysisExcelRenderer` 负责：
    - 基于 legacy `elec_price_dict.json`
    - 基于 legacy `elec_price_tmplate.xlsx`
    - 填充模板并输出最终 xlsx
  - 当前实现保留了模板驱动结果文件，而不是手写结构化 Excel
- 当前已覆盖 E2E：
  - 成功完成分析并返回 xlsx
  - 缺少 `files` 返回 error
  - 非法 JSON 返回 error
  - 顺序回归 `power-report` 未被打坏
- review 结论：
  - 分层符合 `adapters -> usecases -> modules -> infrastructure`
  - 适配器没有直接依赖 modules 细节实现
  - 没有新增数据库表，也没有把协议细节泄漏进模块层
  - 通过模板与映射文件保留了 legacy 输出口径
- 接受差异：
  - legacy 路径是 `/ws/price-analysis`
  - 当前统一归位到 `/power-system/price-analysis`
  - PDF 抽取采用规则化实现，不直接复刻 legacy 远程 LLM 流程
  - 这是实现手段差异，不是迁移缺口
- 延后实现项：
  - 无

## 8. 环境与运行口径

### 8.1 环境文件

已补齐：

- `env/.env.development`
- `env/.env.e2e`

本地默认实例口径：

- MySQL:
  - host: `127.0.0.1`
  - port: `3306`
  - user: `root`
  - password: 空
- Redis:
  - host: `127.0.0.1`
  - port: `6379`
  - password: 空

本地数据库划分：

- development:
  - DB: `aigc_friendly_backend_dev`
  - Redis DB: `14`
- e2e:
  - DB: `aigc_friendly_backend_e2e`
  - Redis DB: `15`

### 8.2 已验证命令

以下命令已在当前仓库运行通过：

- `npm run migration:drill:empty-db`
- `NODE_ENV=e2e node ./test/run-e2e-group.js --file 09-power-system/party-bs.e2e-spec.ts`
- `NODE_ENV=e2e node ./test/run-e2e-group.js --file 09-power-system/party-b.e2e-spec.ts`
- `NODE_ENV=e2e node ./test/run-e2e-group.js --file 09-power-system/create-party-b.e2e-spec.ts`
- `NODE_ENV=e2e node ./test/run-e2e-group.js --file 09-power-system/update-party-b.e2e-spec.ts`
- `NODE_ENV=e2e node ./test/run-e2e-group.js --file 09-power-system/delete-party-b.e2e-spec.ts`
- `NODE_ENV=e2e node ./test/run-e2e-group.js --file 09-power-system/party-as.e2e-spec.ts`
- `NODE_ENV=e2e node ./test/run-e2e-group.js --file 09-power-system/party-a.e2e-spec.ts`
- `NODE_ENV=e2e node ./test/run-e2e-group.js --file 09-power-system/create-party-a.e2e-spec.ts`
- `NODE_ENV=e2e node ./test/run-e2e-group.js --file 09-power-system/update-party-a.e2e-spec.ts`
- `NODE_ENV=e2e node ./test/run-e2e-group.js --file 09-power-system/delete-party-a.e2e-spec.ts`
- `NODE_ENV=e2e node ./test/run-e2e-group.js --file 09-power-system/quotation-by-contract-type.e2e-spec.ts`
- `NODE_ENV=e2e node ./test/run-e2e-group.js --file 09-power-system/contracts.e2e-spec.ts`
- `NODE_ENV=e2e node ./test/run-e2e-group.js --file 09-power-system/contract.e2e-spec.ts`
- `NODE_ENV=e2e node ./test/run-e2e-group.js --file 09-power-system/create-contract.e2e-spec.ts`
- `NODE_ENV=e2e node ./test/run-e2e-group.js --file 09-power-system/update-contract.e2e-spec.ts`
- `NODE_ENV=e2e node ./test/run-e2e-group.js --file 09-power-system/delete-contract.e2e-spec.ts`
- `NODE_ENV=e2e node ./test/run-e2e-group.js --file 09-power-system/contract-docx.e2e-spec.ts`
- `NODE_ENV=e2e node ./test/run-e2e-group.js --file 09-power-system/bill-docx.e2e-spec.ts`
- `NODE_ENV=e2e node ./test/run-e2e-group.js --file 09-power-system/power-companies.e2e-spec.ts`
- `NODE_ENV=e2e node ./test/run-e2e-group.js --file 09-power-system/power-daily-summary.e2e-spec.ts`
- `NODE_ENV=e2e node ./test/run-e2e-group.js --file 09-power-system/power-interval-summary.e2e-spec.ts`
- `NODE_ENV=e2e node ./test/run-e2e-group.js --file 09-power-system/power-company-jobs.e2e-spec.ts`
- `NODE_ENV=e2e node ./test/run-e2e-group.js --file 09-power-system/power-tasks.e2e-spec.ts`
- `NODE_ENV=e2e node ./test/run-e2e-group.js --file 09-power-system/power-task-status.e2e-spec.ts`
- `NODE_ENV=e2e node ./test/run-e2e-group.js --file 09-power-system/power-report.e2e-spec.ts`
- `NODE_ENV=e2e node ./test/run-e2e-group.js --file 09-power-system/price-analysis.e2e-spec.ts`

### 8.3 重要运行注意事项

- 同一个 `e2e` 库上的单文件 E2E 不要并发跑
- 原因：
  - 当前 E2E 依赖 `entity + synchronize`
  - 并发运行可能在建表或清库/播种阶段打架，出现：
    - `Table already exists`
    - 主键重复
    - 空分页或空详情这类假失败
- 正确做法：
  - 单文件顺序执行
  - 或者单独准备隔离数据库
- `2026-04-06` 已再次验证：
  - 并发跑 `contract.e2e-spec.ts`、`contracts.e2e-spec.ts`、`update-contract.e2e-spec.ts`
  - 会出现重复主键或断言污染的假失败
  - 顺序重跑后三者均恢复通过
- `2026-04-06` 又补充验证：
  - 并发跑 `contract.e2e-spec.ts`、`delete-contract.e2e-spec.ts`
  - 会因为共享测试库状态污染，导致 `contract.e2e-spec.ts` 出现假性 `NOT_FOUND`
  - 顺序重跑后恢复通过
- 带外键的测试表不要在用例里用 `repository.clear()`
- 原因：
  - TypeORM 的 `clear()` 在 MySQL 下走 `TRUNCATE`
  - 带外键的表会被 MySQL 拒绝
- 正确做法：
  - 子表先 `DELETE`
  - 父表后 `DELETE`

### 8.4 新依赖与安装口径

- 为 `GET /power-system/contracts/:contractId/docx` 已新增依赖：
  - `docx`
  - `docxtemplater`
  - `pizzip`
  - `@xmldom/xmldom`
- 为 `WS /power-system/price-analysis` 已新增依赖：
  - `exceljs`
  - `pdf-parse`
  - `pdf-lib`
  - `@types/ws`
- 本轮安装时发现历史 `package-lock.json` 中存在腾讯镜像 `resolved` 地址：
  - `http://mirrors.cloud.tencent.com/npm/`
  - `http://mirrors.tencentyun.com/npm/`
- 这会导致在当前环境下 `npm install` 出现 `ECONNRESET`，并可能暂时破坏 `node_modules`
- 当前已统一改为官方 npm registry 地址，因此本仓库后续安装口径以 `https://registry.npmjs.org/` 为准
- 后续若再引入新库：
  - 允许引入
  - 但需要先检查 lockfile 的下载源是否可用
  - 安装后必须补最小化验证：
    - `typecheck`
    - `build:api`
    - 相关 `eslint`
    - 当前接口 E2E
- 当前对合同导出的固定约束已更新：
  - `GET /power-system/contracts/:contractId/docx` 不接受结构化手写文档方案
  - 必须采用“模板 + 占位符替换”的实现
  - 模板版式应作为业务要求优先保留
- 当前对 PowerSystem 真实预测执行的环境口径已更新：
  - `POWER_SYSTEM_TASKS_INLINE`
    - `true` 时：任务接口内同步执行真实预测
    - `false` 时：任务接口返回后，在 API 进程内后台推进
  - `POWER_SYSTEM_PREDICT_API_URL`
    - 外部预测接口地址
    - 默认 legacy 值：`http://221.224.90.218:8000/load_predict`
  - `POWER_SYSTEM_PREDICT_API_TIMEOUT_MS`
    - 外调超时，默认 `15000`

## 9. 后续迁移指导

后续每一轮必须严格执行以下步骤：

1. 先对照源项目 endpoint + service，确认真实行为
2. 只为当前接口补最小可用代码
3. 不提前暴露兄弟接口
4. 若涉及写操作：
   - 写事务必须在 Usecase
   - Service 只提供持久化与 repository/transaction 能力
5. 若涉及读操作：
   - 输出映射必须走 QueryService
6. 补当前接口 E2E：
   - 1 个成功路径
   - 1 个参数校验失败路径
   - 1 个 not found / 业务冲突路径
7. 执行验证：
   - `npm run typecheck`
   - `npm run build:api`
   - 相关文件 `eslint`
   - 当前接口单文件 E2E
   - 必要时回归已完成的 PowerSystem 接口
8. 做代码审计：

- 检查层次方向
- 检查 DTO/Entity 泄漏
- 检查读写边界
- 检查是否引入了源项目没有的新业务规则
- 检查 adapter 层是否直接 import modules 层

9. 输出迁移对照总结并暂停，等待确认

补充实施策略：

- 后续若遇到复杂接口，不要被“纯代码硬写”绑住
- 只要符合本仓库规则、能降低复杂度并提升稳定性，可以引入新库或复用成熟生态能力
- 引入新库前仍要做最小化评估：
  - 是否真的解决当前接口问题
  - 是否与 NestJS / TypeORM / GraphQL 体系兼容
  - 是否会引入过重依赖或不必要的长期维护成本
- 如果本轮为了遵守“一次只迁移一个接口”而没有实现某些后续接口必需的支撑代码：
  - 必须把这部分明确记录到本文档
  - 记录内容至少包括：
    - 哪些能力被延后
    - 为什么本轮不实现
    - 它归属后续哪个接口
    - 后续实现时必须对齐的源项目语义
    - 如果不补会造成什么功能缺口

## 10. 后续接口顺序

全部 26 个接口已完成。

当前不再有“下一接口”。

后续阶段进入：

1. 增强项补充
2. 统一审计与回归
3. 文档收口与交付

## 11. 避免漂移的硬规则

- 不要把原项目未注册接口当成迁移范围
- 不要把“文档里提过但源码没注册”的接口提前加进来
- 不要为了“看起来更完整”提前实现未验收兄弟接口
- 不要私自增加源项目没有的唯一性/互斥/权限规则
- 不要跳过 E2E 与 review
- 不要并发执行同一个 e2e 库上的 PowerSystem 单文件测试
- 不要让 adapter 层直接依赖 modules 层类型或服务

## 12. 当前状态结论

截至本文档保存时：

- 迁移计划已固化
- 运行环境已打通
- PowerSystem 首轮 26 个接口已全部完成迁移
- GraphQL 主接口、HTTP 补充接口、WS 价格分析接口均已落地
- 各接口已按“单接口增量迁移 + E2E + review + 记忆固化”的口径完成
- 当前阶段已从“剩余接口迁移”转入“增强项 / 审计 / 统一回归”阶段
- 审计新增发现：
  - legacy `power_consumption_service.py` 中 `forecast_company_energy()` 会调用外部 `DEFAULT_PREDICT_API_URL`
  - 当前新仓库已完成这条“真实预测执行”链路迁入
  - 现状是：
    - `POST /power-system/power-consumption/tasks` 已完成上传、actual 入库、forecast job 规划、外部预测调用与 forecast 表落库
    - `powerTaskStatus` / `powerIntervalSummary` / `report` 已顺序回归通过
    - 当前代码库已具备等价的 HTTP 外调实现，并会把新的 forecast 结果写入 `power_system_forecast_power_consumption`
  - 当前保留的增强点：
    - 真实预测执行默认仍是 API 进程内后台推进，而不是独立 worker
    - 这属于运行形态增强，不是功能缺失
- 本次“真实预测执行链路曾一度漏迁”的归因记录：
  - 直接原因：
    - `POST /power-system/power-consumption/tasks` 在首轮迁移时只对齐了“接口契约、上传入库、任务骨架、状态读模型”
    - 没有继续追到 legacy `forecast_company_energy() -> DEFAULT_PREDICT_API_URL -> forecast 表落库` 这条隐藏在 service 内部的副作用链
  - 流程原因：
    - 当时迁移粒度按“单接口落位”推进，容易优先收敛可见的 request/response 行为，而遗漏 service 内部的外部依赖与异步副作用
    - `powerTaskStatus / report / intervalSummary` 在首轮也能基于 legacy backfill 数据通过，因此掩盖了“新预测结果其实不会生成”的缺口
    - 首轮 review 更偏重分层、契约、migration、E2E 正反例，缺少一条专门检查“源 service 是否调用外部系统/队列/文件模板/后台任务”的审计步骤
  - 经验结论：
    - 以后迁移接口时，不能只核对 endpoint 和返回值，还必须顺着源 service 把以下副作用全部盘清：
      - 外部 HTTP 调用
      - 后台任务推进
      - 文件模板生成
      - 第三方 SDK / 模型服务
      - 对下游表的写入
    - 对于“创建任务类接口”，必须额外检查：
      - 是否真的执行了任务
      - 还是只写了任务骨架
  - 防复发动作：
    - 统一审计阶段新增一条固定检查项：
      - “源 service 是否存在外部依赖或异步副作用，迁移后是否仍真实执行”
    - 后续如果再出现“本轮为了范围控制先不补副作用链”的情况，必须在文档里显式写成：
      - 哪条副作用链被延后
      - 由哪个后续增强项补齐
      - 不补会导致什么功能残缺

## 13. 统一审计结论（2026-04-07）

### 13.1 审计依据

- 原项目真源：
  - `/Users/jiaxiaojie/Projects/powersystem/app/api/v1/endpoints/*.py`
  - `/Users/jiaxiaojie/Projects/powersystem/app/services/*.py`
- 新项目规则：
  - `README.md`
  - `docs/common/modules.rules.md`
  - `docs/common/queryservice.rules.md`
  - `docs/common/usecase.rules.md`
  - `docs/worker/qm-worker-integration.rules.md`
- 新项目已有样例：
  - 现有 AI / Email 队列接入与 Worker Adapter 模式

### 13.2 审计时已通过的验证

- `npm run typecheck`
- `npm run build:api`
- `npm run migration:drill:empty-db`
- 顺序跑完整个 `test/09-power-system`，全部通过

### 13.3 审计发现

- 发现 1：
  - `POST /power-system/power-consumption/tasks` 当前仍在 API 进程内直接后台推进预测任务
  - 代码位置：
    - `src/adapters/api/http/power-system/power-consumption/power-task.controller.ts`
    - `src/bootstraps/worker/worker.module.ts`
  - 风险性质：
    - 与 README “API 只处理同步请求、Worker 负责异步消费与重试”的双启动设计不一致
    - 也不符合 `docs/worker/qm-worker-integration.rules.md` 里“API 入队 -> Worker 消费”的统一队列接入模式
    - API 进程重启或异常退出时，正在执行的预测任务没有 durable queue / retry / worker 隔离保护
  - 当前状态判定：
    - 功能可用
    - 但属于架构层面的高优先级增强项

- 发现 2：
  - 预测流水线缺少顶层失败收口，fatal error 时任务可能永久停留在 `computing`
  - 代码位置：
    - `src/adapters/api/http/power-system/power-consumption/power-task.controller.ts`
    - `src/usecases/power-system/power-consumption/run-power-task-pipeline.usecase.ts`
  - 对照 legacy：
    - 源项目 `execute_task_pipeline()` 顶层会在异常后回滚并把任务写成完成态，避免悬挂
  - 风险性质：
    - 当前迁移实现只在 controller 侧记录日志
    - 若在 `getTaskSummaryOrThrow()`、首次 `saveTaskSummary()`、末次 `saveTaskSummary()` 等环节抛错，任务可能无法进入最终态
    - 这会直接影响 `powerCompanyJobs`、`powerTaskStatus` 与人工运维判断
  - 当前状态判定：
    - 阻塞性真实问题
    - 应优先修复

- 发现 3：
  - `PowerConsumptionService` 从 QueryService 文件 import 类型，违反了 QueryService 边界约束
  - 代码位置：
    - `src/modules/power-system/power-consumption/power-consumption.service.ts`
    - `src/modules/power-system/power-consumption/queries/power-consumption.query.service.ts`
  - 风险性质：
    - `docs/common/queryservice.rules.md` 要求 QueryService 下游仅依赖 core 或 infrastructure
    - `docs/common/modules.rules.md` 要求 modules(service) 不做跨语义反向耦合
    - 虽然当前只是 type import，不影响运行
    - 但会持续放松 QueryService 与 service 的边界，后续容易演化成真实跨文件耦合
  - 当前状态判定：
    - 非阻塞
    - 但应在下一轮整理时移回 `power-consumption.types.ts`

### 13.4 审计后修复结果（2026-04-07）

- 已修复发现 1：
  - `POST /power-system/power-consumption/tasks` 默认路径已从“API 进程内直接后台执行”
    改为“API 入队 -> Worker 消费”
  - 当前实现：
    - API：
      - `ExecutePowerTaskUsecase` 负责创建任务、上传入库、初始化 computeSummary
      - `QueuePowerTaskUsecase` 负责向 BullMQ `power/run-task` 入队
    - Worker：
      - `PowerTaskProcessor` 消费 `power/run-task`
      - `ConsumePowerTaskJobUsecase` 调用 `RunPowerTaskPipelineUsecase`
  - 当前状态：
    - 后续已继续完成仓库统一的 Async Task Record 对接
    - 因此这条问题现在已经完全收口，不再保留增强缺口

- 已修复发现 2：
  - `RunPowerTaskPipelineUsecase` 已新增顶层 fatal 收口
  - 若在任务加载、首次状态保存、末次状态保存等阶段抛出异常：
    - 会调用 `finalizeTaskPipelineWithFatalError()`
    - 将任务写为 `completed`
    - 补 `endTime`
    - 追加 `errorMessage`
  - 这样不会再出现任务永久卡在 `computing` 的悬挂状态

- 已顺手修复发现 3：
  - `IntervalSummaryAggregateRow` 已从 QueryService 文件移回 `power-consumption.types.ts`
  - `PowerConsumptionService` 不再 import `queries/*.query.service.ts`

### 13.5 本轮修复验证

- 静态验证：
  - `npm run typecheck`
  - `npm run build:api`
  - `npm run migration:drill:empty-db`
  - 定向 `eslint`
- 测试验证：
  - `npx jest src/usecases/power-system/power-consumption/run-power-task-pipeline.usecase.spec.ts --runInBand`
  - `NODE_ENV=e2e node ./test/run-e2e-group.js --file 09-power-system/power-tasks-queue.e2e-spec.ts`
  - `NODE_ENV=e2e node ./test/run-e2e-group.js --file 09-power-system/power-tasks.e2e-spec.ts`
  - `NODE_ENV=e2e node ./test/run-e2e-group.js --file 09-power-system/power-task-status.e2e-spec.ts`
  - `NODE_ENV=e2e node ./test/run-e2e-group.js --file 09-power-system/power-interval-summary.e2e-spec.ts`
  - `NODE_ENV=e2e node ./test/run-e2e-group.js --file 09-power-system/power-report.e2e-spec.ts`
- 注意：
  - 修复过程中曾误并发触发两条 PowerSystem E2E
  - 已废弃那次结果，并按顺序完整重跑
  - 最终结论仅以顺序回归结果为准

### 13.6 剩余增强项

- 当前 `power` 队列已经接入 BullMQ Worker，且独立 worker consume E2E 已补齐：
  - `test/08-qm-worker/power-worker-consume.e2e-spec.ts`
- 当前 `power` 队列也已接入仓库统一的 Async Task Record 三段状态：
  - 入队成功/失败：`QueuePowerTaskUsecase`
  - Worker 开始/完成/失败：`ConsumePowerTaskJobUsecase`
  - 队列路径 E2E：`test/09-power-system/power-tasks-queue.e2e-spec.ts`
  - 独立 worker consume E2E：`test/08-qm-worker/power-worker-consume.e2e-spec.ts`
- 当前不再有阻塞性交付缺口，后续只剩可选增强项：
  - 更明确的 worker deployment / smoke 文档
  - `power` 队列并发、重试、退避策略调优
- 这项属于“与仓库统一 worker 审计模式进一步对齐”的增强项
- 不再阻塞当前 PowerSystem 功能正确性与统一审计结论
