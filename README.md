# SubTrackr

一个面向日常用户的订阅管理工具。SubTrackr 用来帮助用户跟踪周期性扣费、提前发现即将续费项目，并更直观地理解自己的 recurring spend，而不必反复翻查银行卡或支付记录。

## 项目概览
SubTrackr 当前是一个以 dashboard 为中心的 MVP，底层使用本地 SQLite 存储数据。整体目标是做到“适合演示、容易运行、便于继续扩展”。

### 当前 MVP 已包含的能力
- 以 dashboard 为中心的订阅管理体验
- 基于 Prisma + SQLite 的实时订阅列表
- 订阅新增 / 编辑 / 删除流程
- 按名称、分类、备注、网站进行搜索
- 分类、状态、排序与快速视图筛选
- 用于试用到期和近期续费的提醒中心
- 支持重复项跳过的 JSON 导入
- JSON / CSV 导出接口
- 按分类展示支出分布
- 支持月支出、年化支出、未来扣费、试用风险、暂停/取消概览的洞察卡片
- 基础用户可见的表单错误提示
- 更贴近实际的月度 / 年度 / 未来 30 天预计扣费估算逻辑

## 技术栈
- Next.js 16
- TypeScript
- Tailwind CSS 4
- Prisma 7 + SQLite adapter
- SQLite

## 本地开发
### 1. 安装依赖
```bash
npm install
```

### 2. 生成 Prisma Client
```bash
npm run db:generate
```

### 3. 执行数据库迁移
```bash
npm run db:migrate -- --name init
```

### 4. 导入演示数据（可选，但建议）
```bash
npm run db:seed
```

### 5. 启动项目
```bash
npm run dev
```

打开 <http://localhost:3000>

## 常用命令
```bash
npm run dev
npm run build
npm run start
npm run lint
npm run db:generate
npm run db:migrate
npm run db:seed
```

## 演示路径
如果你想快速演示当前版本，建议按下面的顺序：

1. 打开 dashboard
- 查看顶部摘要卡片
- 展示当前月支出、年化支出、活跃订阅数和提醒数量

2. 展示搜索与筛选
- 试一下 `即将续费` 或 `高成本订阅` 这样的快速视图
- 搜索某个分类、服务名称或备注关键词
- 清空筛选，展示 dashboard 恢复默认状态

3. 新增或编辑订阅
- 创建一个未来会扣费的新订阅
- 把状态改成 `Paused` 或 `Canceled`
- 回到 dashboard，展示列表与洞察卡片如何同步变化

4. 打开提醒中心
- 展示即将结束的试用
- 展示未来 7 天内的续费
- 展示未来 30 天预计扣费金额

5. 演示导入 / 导出
- 导出当前数据为 JSON 或 CSV
- 将 JSON 粘贴到导入表单中
- 展示重复项跳过与反馈信息

## 数据模型说明
当前每个订阅会存储以下信息：
- 名称
- 分类
- 价格
- 币种
- 计费周期
- 计费间隔
- 状态
- 下次扣费日期
- 试用结束日期
- 网站
- 备注
- 品牌色

## 当前计算逻辑
SubTrackr 目前采用的是“实用优先”的 recurring billing 估算逻辑：
- `MONTHLY`、`WEEKLY`、`YEARLY`、`CUSTOM` 会参与月度 / 年度支出估算
- `TRIAL` 不计入 recurring spend
- 未来 30 天扣费预测会在窗口期内估算 weekly 和 custom cadence 可能发生的重复扣费

这套逻辑足够适合 MVP 与演示，但还不是完整的账单引擎。

## 当前 MVP 边界
当前版本刻意保持轻量，因此**暂不包含**：
- 认证或多用户系统
- 真实银行卡 / 支付平台集成
- 推送或邮件提醒投递
- 历史账单流水
- 基于自然月语义的完整 recurring schedule 引擎
- 完整的多币种汇率换算与统一归一化

## 下一步建议
- 增加 renewal history 和 spend trend 视图
- 增加日历同步或提醒投递集成
- 提升字段级校验和更完整的编辑体验
- 增强 custom cadence 的精度与语义表达
- 增加多币种统计能力
- 补齐截图、录屏和更适合作品集展示的素材

## 当前状态
当前版本已经达到：可构建、lint 通过、基于 SQLite 的 MVP，可用于演示、汇报和继续迭代。
