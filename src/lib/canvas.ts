/**
 * H5 环境获取 Canvas 节点
 * Taro 的 <Canvas> 在 H5 下渲染为 <canvas canvas-id="xxx">
 * 用 document.querySelector('canvas[canvas-id="xxx"]') 获取
 */
export function getH5Canvas(id: string): HTMLCanvasElement | null {
  if (typeof document === 'undefined') return null
  return document.querySelector(`canvas[canvas-id="${id}"]`) as HTMLCanvasElement | null
}
