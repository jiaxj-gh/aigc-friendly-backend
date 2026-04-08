# PowerSystem 接口测试入参

更新时间：2026-04-08

关联测试数据：

- SQL 文件：
  - `/Users/jiaxiaojie/.codex/worktrees/4f7a/aigc-friendly-backend/docs/human/power-system-test-data.sql`

本文档默认以上述 SQL 已成功导入为前提。

已植入的关键测试 ID：

- `partyBId`
  - `1`：默认乙方
  - `2`：备用乙方
  - `3`：已停用乙方
- `partyAId`
  - `1`：苏州三星电子有限公司
  - `2`：苏州工业园区国际科技园产业管理有限公司
  - `3`：已停用甲方
- `contractId`
  - `1001`：有效合同，真实甲方
  - `1002`：有效合同，自定义甲方
  - `1003`：已停用合同
  - `1011`：报价类型查询专用合同
- `taskId`
  - `5001`：已完成任务
  - `5002`：计算中任务
  - `5003`：失败任务

## 1. GraphQL 接口

### 1.1 `partyBs`

```graphql
query PartyBs($input: PartyBsInput) {
  partyBs(input: $input) {
    total
    items {
      partyBId
      configName
      companyName
      isDefault
      isActive
    }
  }
}
```

变量：

```json
{
  "input": {
    "configName": "默认",
    "companyName": "中鑫",
    "isDefault": true
  }
}
```

### 1.2 `partyB`

```graphql
query PartyB($input: PartyBInput!) {
  partyB(input: $input) {
    partyBId
    configName
    companyName
    contactPerson
  }
}
```

变量：

```json
{
  "input": {
    "partyBId": 1
  }
}
```

### 1.3 `createPartyB`

```graphql
mutation CreatePartyB($input: CreatePartyBInput!) {
  createPartyB(input: $input) {
    partyBId
    configName
    companyName
  }
}
```

变量：

```json
{
  "input": {
    "configName": "联调用乙方配置",
    "companyName": "苏州联调售电有限公司",
    "creditCode": "91320500PB999999X9",
    "companyAddress": "苏州市工业园区联调路8号",
    "legalPerson": "测试法人",
    "contactPerson": "测试联系人",
    "contactPhone": "13812345678",
    "contactEmail": "power-biz@example.com",
    "depositoryBank": "中国建设银行苏州分行",
    "bankAccountNo": "622700000000000001",
    "hotLine": "400-900-0001",
    "isDefault": false
  }
}
```

### 1.4 `updatePartyB`

```graphql
mutation UpdatePartyB($input: UpdatePartyBInput!) {
  updatePartyB(input: $input) {
    partyBId
    configName
    companyName
    isDefault
  }
}
```

变量：

```json
{
  "input": {
    "partyBId": 2,
    "configName": "备用乙方配置-已更新",
    "contactPerson": "更新后的联系人",
    "contactPhone": "13888888888",
    "isDefault": false
  }
}
```

### 1.5 `deletePartyB`

```graphql
mutation DeletePartyB($input: DeletePartyBInput!) {
  deletePartyB(input: $input)
}
```

变量：

```json
{
  "input": {
    "partyBId": 2
  }
}
```

### 1.6 `partyAs`

```graphql
query PartyAs($input: PartyAsInput) {
  partyAs(input: $input) {
    total
    items {
      partyAId
      companyName
      creditCode
      powerSupplyInfo {
        psId
        powerSupplyAddress
        powerSupplyNumber
      }
    }
  }
}
```

变量：

```json
{
  "input": {
    "companyName": "三星",
    "creditCode": "91320500PA000001A1"
  }
}
```

### 1.7 `partyA`

```graphql
query PartyA($input: PartyAInput!) {
  partyA(input: $input) {
    partyAId
    companyName
    powerSupplyInfo {
      psId
      powerSupplyAddress
      powerSupplyNumber
    }
  }
}
```

变量：

```json
{
  "input": {
    "partyAId": 1
  }
}
```

### 1.8 `createPartyA`

```graphql
mutation CreatePartyA($input: CreatePartyAInput!) {
  createPartyA(input: $input) {
    partyAId
    companyName
    powerSupplyInfo {
      psId
      powerSupplyAddress
      powerSupplyNumber
    }
  }
}
```

变量：

```json
{
  "input": {
    "companyName": "苏州联调用电企业有限公司",
    "creditCode": "91320500PA999999A9",
    "companyAddress": "苏州市工业园区联调大道66号",
    "legalPerson": "测试甲方法人",
    "depositoryBank": "中国农业银行苏州分行",
    "bankAccountNo": "622800000000000001",
    "contactEmail": "party-a@example.com",
    "contactPerson": "张甲",
    "contactPhone": "13912345678",
    "powerSupplyInfo": [
      {
        "powerSupplyAddress": "联调园区1号楼",
        "powerSupplyNumber": "TEST-ACC-001"
      },
      {
        "powerSupplyAddress": "联调园区2号楼",
        "powerSupplyNumber": "TEST-ACC-002"
      }
    ]
  }
}
```

### 1.9 `updatePartyA`

```graphql
mutation UpdatePartyA($input: UpdatePartyAInput!) {
  updatePartyA(input: $input) {
    partyAId
    companyName
    contactPerson
    powerSupplyInfo {
      powerSupplyAddress
      powerSupplyNumber
    }
  }
}
```

变量：

```json
{
  "input": {
    "partyAId": 1,
    "contactPerson": "更新后的甲方联系人",
    "contactPhone": "13999999999",
    "powerSupplyInfo": [
      {
        "powerSupplyAddress": "苏州工业园区苏虹东路501号A栋-更新",
        "powerSupplyNumber": "ACC-001-UPDATED"
      }
    ]
  }
}
```

### 1.10 `deletePartyA`

```graphql
mutation DeletePartyA($input: DeletePartyAInput!) {
  deletePartyA(input: $input)
}
```

变量：

```json
{
  "input": {
    "partyAId": 2
  }
}
```

### 1.11 `quotationByContractType`

```graphql
query QuotationByContractType($input: QuotationByContractTypeInput!) {
  quotationByContractType(input: $input) {
    id
    contractId
    quoteTypeId
    greenElecAllow
    quoteDetails
  }
}
```

变量：

```json
{
  "input": {
    "contractId": 1011,
    "quoteTypeId": 2
  }
}
```

### 1.12 `contracts`

```graphql
query Contracts($input: ContractsInput) {
  contracts(input: $input) {
    pagination {
      page
      pageSize
      total
      totalPages
    }
    items {
      contractId
      partyAContractNo
      partyBContractNo
      partyACompanyName
      partyBCompanyName
      quoteTypeId
    }
  }
}
```

变量：

```json
{
  "input": {
    "partyAId": 1,
    "page": 1,
    "pageSize": 20
  }
}
```

### 1.13 `contract`

```graphql
query Contract($input: ContractInput!) {
  contract(input: $input) {
    basicInfo {
      contractId
      contractCurrentStatus
    }
    contractContent {
      partyAContractNo
      partyBContractNo
      partyA {
        companyName
      }
      partyB {
        companyName
      }
      quotationInfo {
        quoteTypeId
        quoteDetails
      }
    }
  }
}
```

变量：

```json
{
  "input": {
    "contractId": 1001
  }
}
```

### 1.14 `createContract`

```graphql
mutation CreateContract($input: CreateContractInput!) {
  createContract(input: $input) {
    basicInfo {
      contractId
    }
    contractContent {
      partyAContractNo
      quotationInfo {
        quoteTypeId
      }
    }
  }
}
```

变量：

```json
{
  "input": {
    "partyAContractNo": "PA-TEST-NEW-001",
    "partyBContractNo": "PB-TEST-NEW-001",
    "partyASignDate": "2026-04-08",
    "partyBSignDate": "2026-04-08",
    "signLocation": "苏州",
    "partyBId": 1,
    "partyAId": 1,
    "contractCurrentStatus": "已签约",
    "workOrderNumber": "WO-TEST-NEW-001",
    "submissionTime": "2026-04-08 09:00:00",
    "confirmationTime": "2026-04-08 09:30:00",
    "contractSignDate": "2026-04-08",
    "orderTime": "2026-04-08 08:50:00",
    "additionalTerms": "测试合同附加条款",
    "quotation": {
      "quoteTypeId": 1,
      "tradeStartTime": "2026-05-01",
      "tradeEndTime": "2026-12-31",
      "totalElectricity": 88888,
      "monthlyElectricity": {
        "2026-05": 12000,
        "2026-06": 13000
      },
      "greenElecAllow": true,
      "greenElecPrice": 0.05,
      "electricityDeviation": 5,
      "positiveDeviationRatio": 10,
      "positiveDeviationPrice": 0.12,
      "negativeDeviationRatio": 10,
      "negativeDeviationPrice": 0.08,
      "standardCurveMethod": false,
      "quoteDetails": {
        "fixedPriceRatio": 100,
        "marketTransactionPrice": 0.468,
        "priceLimit": 0.52
      }
    }
  }
}
```

比例分成 `quoteDetails` 示例：

```json
{
  "psPropSharingRatio": 100,
  "psDistRefPrice": 0.415,
  "psLongTermTransRatio": 60,
  "psPartyAPropBelowLongTerm": 70,
  "psPartyBPropBelowLongTerm": 30,
  "psPartyAPropAboveLongTerm": 60,
  "psPartyBPropAboveLongTerm": 40,
  "psLongTermTransLimit": 0.52
}
```

价差浮动 `quoteDetails` 示例：

```json
{
  "pdPriceDiffFlucRatio": 100,
  "pdLongTermTransRatio": 65,
  "pdLongTermTransAvgPrice": 0.431,
  "pdLongTermTransDirection": true,
  "pdLongTermTransLimit": 0.51
}
```

### 1.15 `updateContract`

```graphql
mutation UpdateContract($input: UpdateContractInput!) {
  updateContract(input: $input) {
    basicInfo {
      contractId
    }
    contractContent {
      signLocation
      quotationInfo {
        quoteTypeId
      }
    }
  }
}
```

变量：

```json
{
  "input": {
    "contractId": 1002,
    "signLocation": "苏州园区-更新",
    "additionalTerms": "更新后的附加条款",
    "quotation": {
      "quoteTypeId": 3,
      "greenElecAllow": false,
      "standardCurveMethod": true,
      "curveModifyDays": 7,
      "curveDeviation": 3,
      "curvePositiveRatio": 5,
      "curvePositivePrice": 0.1,
      "curveNegativeRatio": 5,
      "curveNegativePrice": 0.06,
      "quoteDetails": {
        "pdPriceDiffFlucRatio": 100,
        "pdLongTermTransRatio": 65,
        "pdLongTermTransAvgPrice": 0.431,
        "pdLongTermTransDirection": true,
        "pdLongTermTransLimit": 0.51
      }
    }
  }
}
```

### 1.16 `deleteContract`

```graphql
mutation DeleteContract($input: DeleteContractInput!) {
  deleteContract(input: $input)
}
```

变量：

```json
{
  "input": {
    "contractId": 1002
  }
}
```

### 1.17 `powerCompanies`

```graphql
query PowerCompanies {
  powerCompanies
}
```

### 1.18 `powerDailySummary`

```graphql
query PowerDailySummary($input: PowerDailySummaryInput!) {
  powerDailySummary(input: $input) {
    companyName
    startDate
    endDate
    days {
      summaryDate
      actualEnergyKwh
      forecastEnergyKwh
      forecastDeviation
    }
  }
}
```

变量：

```json
{
  "input": {
    "companyName": "苏州三星电子有限公司",
    "startDate": "2026-04-01",
    "endDate": "2026-04-03"
  }
}
```

全部企业示例：

```json
{
  "input": {
    "companyName": "--全部--",
    "startDate": "2026-04-01",
    "endDate": "2026-04-03"
  }
}
```

### 1.19 `powerIntervalSummary`

```graphql
query PowerIntervalSummary($input: PowerIntervalSummaryInput!) {
  powerIntervalSummary(input: $input) {
    companyName
    needUpload
    forecastReport
    points {
      timestamp
      actualEnergyKwh
      forecastEnergyKwh
    }
  }
}
```

变量：

```json
{
  "input": {
    "companyName": "苏州三星电子有限公司",
    "startDate": "2026-04-01",
    "endDate": "2026-04-03"
  }
}
```

### 1.20 `powerCompanyJobs`

```graphql
query PowerCompanyJobs($input: PowerCompanyJobsInput!) {
  powerCompanyJobs(input: $input) {
    companyName
    inProgress
    jobs {
      taskId
      taskName
      predictedDate
      status
      errorMessage
    }
  }
}
```

变量：

```json
{
  "input": {
    "companyName": "苏州三星电子有限公司"
  }
}
```

### 1.21 `powerTaskStatus`

```graphql
query PowerTaskStatus($input: PowerTaskStatusInput!) {
  powerTaskStatus(input: $input) {
    taskId
    taskName
    status
    upload {
      totalFiles
      uploadedFiles
      companyDates {
        companyName
        dates
      }
    }
    compute {
      totalJobs
      successfulJobs
      failedJobs
      progress
      jobs {
        companyName
        predictedDate
        status
        errorMessage
      }
    }
    errorMessage
  }
}
```

变量：

```json
{
  "input": {
    "taskId": 5001
  }
}
```

## 2. HTTP 接口

### 2.1 `GET /power-system/contracts/:contractId/docx`

有效示例：

```http
GET /power-system/contracts/1001/docx
```

### 2.2 `POST /power-system/bills/docx`

请求体：

```json
{
  "partyAName": "苏州三星电子有限公司",
  "quotaInfo": [
    {
      "quotaType": "固定价格",
      "quotaPrice": "0.465"
    },
    {
      "quotaType": "比例分成",
      "quotaPrice": "70/30"
    },
    {
      "quotaType": "价差浮动",
      "quotaPrice": "0.431"
    }
  ]
}
```

### 2.3 `POST /power-system/power-consumption/tasks`

这是 `multipart/form-data`。

表单字段：

- `taskName`
- `files`

请求示例：

```bash
curl -X POST 'http://127.0.0.1:3000/power-system/power-consumption/tasks' \
  -F 'taskName=联调上传任务' \
  -F 'files=@/absolute/path/actual.csv;type=text/csv'
```

`actual.csv` 示例内容：

```csv
售电公司名称,零售用户名,户号,日期,00:15,00:30,00:45,01:00
测试售电公司,苏州三星电子有限公司,ACC-001,2026-04-01,1.00,2.00,3.00,4.00
测试售电公司,苏州三星电子有限公司,ACC-001,2026-04-02,1.50,2.50,3.50,4.50
测试售电公司,苏州三星电子有限公司,ACC-001,2026-04-03,1.20,2.20,3.20,4.20
```

### 2.4 `GET /power-system/power-consumption/report`

查询参数示例：

```http
GET /power-system/power-consumption/report?companyName=苏州三星电子有限公司&startDate=2026-04-01&endDate=2026-04-03
```

全部企业示例：

```http
GET /power-system/power-consumption/report?companyName=--全部--&startDate=2026-04-01&endDate=2026-04-03
```

## 3. WebSocket 接口

### 3.1 `WS /power-system/price-analysis`

连接成功后，服务端会先推送：

```json
{
  "status": "connected",
  "message": "Connected to Price Analysis Service. Please send files."
}
```

随后客户端发送 JSON：

```json
{
  "files": [
    {
      "name": "price-analysis.pdf",
      "content": "JVBERi0xLjQKJcfs..."
    }
  ]
}
```

说明：

- `name`：文件名
- `content`：PDF 文件的 base64 内容

服务端过程消息示例：

```json
{
  "status": "progress",
  "step": "upload",
  "message": "Uploading and parsing files..."
}
```

完成消息示例：

```json
{
  "status": "complete",
  "message": "Analysis complete.",
  "result": {
    "filename": "elec_price_result.xlsx",
    "content": "UEsDBBQAAAAI...",
    "warnings": [],
    "json_data": {
      "province": "江苏",
      "price_month": "2026-04"
    }
  }
}
```

## 4. 备注

- `bills/docx` 与 `price-analysis` 不依赖数据库种子数据
- `contracts/:contractId/docx`、`quotationByContractType`、`contracts`、`contract` 依赖上面 SQL 中的合同与报价数据
- `powerCompanies`、`powerDailySummary`、`powerIntervalSummary`、`report` 依赖 SQL 中的 actual / forecast 用电量数据
- `powerCompanyJobs`、`powerTaskStatus` 依赖 SQL 中的 `power_system_task_summary`
