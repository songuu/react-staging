# 前端脚手架

## 一：自定义前端脚手架

- 前端框架
  - 使用拼接式的
    - projectName
    - typescript
    - eslint
    - prettier
    - husky
    - lintStaged
    - unitTesting
      - Jest
      - Vitest
    - managementTool
      - pnpm
      - yarn
      - npm
    - buildTool
      - vite
      - webpack
      - rollup
  - 使用模板引擎进行注入
- 工具包
- 自动部署

### 二：执行命令

- pnpm run build:stage-cli

- 当前目录使用
  - pnpm link .
  - npx create-stage
- 全局使用
  - pnpm link .
  - pnpm link -g
- 解除调用
  - pnpm unlink .
  - pnpm unlink -g

### 三：项目设置

- 项目属性
  - 自定义项目
    - 按照上面的配置
  - 完整项目
    - 需要从远端直接下载完整的部分到本地
