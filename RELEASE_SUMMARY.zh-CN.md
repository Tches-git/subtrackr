# SubTrackr 发布摘要（中文）

## 版本概述
这次更新将 SubTrackr 推进到了一个适合演示的 MVP 阶段。

## 本次交付内容

### 核心产品流程
- 完成订阅的新增 / 编辑 / 删除流程
- 将首页 dashboard 接入 Prisma + SQLite 实时数据
- 增加提醒中心，用于展示近期续费与试用到期项目
- 增加 JSON 导入，以及 JSON / CSV 导出能力

### 搜索与筛选
- 增加关键词搜索，支持按名称、分类、备注、网站检索
- 增加分类、状态、排序控制
- 增加快速视图：
  - 全部订阅
  - 即将续费
  - 高成本订阅
  - 即将结束试用
  - 已暂停
- 增加当前筛选摘要与一键清空操作

### 表单体验
- 为订阅表单增加用户可见的校验反馈
- 为 JSON 导入增加明确错误提示
- 将原本较通用的失败反馈替换为可读性更强的提示文案

### Dashboard 与提醒页体验
- 增加 dashboard 洞察卡片
- 增加未来 30 天预计扣费金额
- 优化提醒摘要信息
- 统一 dashboard 与 reminder center 的卡片、标签、筛选项和空状态样式

### 数据质量提升
- 优化月度与年度 recurring spend 估算
- 增加基于 billing cadence 的未来 30 天预计扣费估算
- 改进 weekly / yearly / custom / trial 等不同计费语义的处理逻辑

### 项目清理
- 删除未使用组件 `add-subscription-form.tsx`
- 删除未使用的直接依赖：
  - `@hookform/resolvers`
  - `react-hook-form`
  - `zod`
  - `recharts`
  - `clsx`
  - `tailwind-merge`
  - `date-fns`
- 更新依赖锁文件

### 文档完善
- 重写 README，使其与当前 MVP 实际能力一致
- 新增 `CHANGELOG.md`
- 补充启动步骤、演示路径、MVP 边界和下一阶段路线

## 验证结果
- `npm install` ✅
- `npm run build` ✅
- `npm run lint` ✅

## 当前版本定位
SubTrackr 目前已经达到一个比较完整的 MVP 阶段，适合用于：
- 项目演示
- 交接汇报
- 后续产品迭代

## 当前边界
- 暂无认证 / 多用户支持
- 暂无推送或邮件提醒能力
- 暂无历史账单流水
- recurring billing 估算仍属于实用近似，不是完整账单引擎
- 暂无多币种统一换算能力

## 下一阶段建议
- 增加 renewal history 与 spend trend
- 增强表单校验持久化与编辑体验
- 增加日历同步 / 提醒投递能力
- 补齐截图、录屏与更完整的发布素材
