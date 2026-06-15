// 类型声明：让 TypeScript 识别 .json 模块导入
declare module '*.json' {
  const value: any
  export default value
}
