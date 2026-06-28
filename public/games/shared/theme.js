;(function(){
  var params = new URLSearchParams(location.search)
  var scene = params.get('scene') || 'crystal'

  var themes = {
    crystal: { bg:'#1a1020', surface:'#2a1a40', primary:'#b388ff', accent:'#ff80ab', text:'#f0e8d0', textSec:'rgba(255,255,255,0.5)', name:'水晶矿场' },
    forest: { bg:'#0e1a0e', surface:'#1a2a10', primary:'#8bc34a', accent:'#b8bd6a', text:'#e8f0d0', textSec:'rgba(255,255,255,0.5)', name:'森林深处' },
    jade:   { bg:'#0a1810', surface:'#102a18', primary:'#4caf50', accent:'#7db87d', text:'#d0e8d8', textSec:'rgba(255,255,255,0.5)', name:'玉石溪谷' },
    orchard:{ bg:'#1a1008', surface:'#2a1a10', primary:'#ff8a65', accent:'#d4a080', text:'#e8d8c8', textSec:'rgba(255,255,255,0.5)', name:'丰收果园' },
    beach:  { bg:'#081018', surface:'#0a1a28', primary:'#40c4ff', accent:'#7aaed4', text:'#c8d8e8', textSec:'rgba(255,255,255,0.5)', name:'河岸拾贝' },
    workshop:{bg:'#141008', surface:'#221810', primary:'#ffb300', accent:'#c9a87c', text:'#e0d4c0', textSec:'rgba(255,255,255,0.5)', name:'柴犬工坊' },
  }

  var t = themes[scene] || themes.crystal
  var root = document.documentElement
  root.style.setProperty('--theme-bg', t.bg)
  root.style.setProperty('--theme-surface', t.surface)
  root.style.setProperty('--theme-primary', t.primary)
  root.style.setProperty('--theme-accent', t.accent)
  root.style.setProperty('--theme-text', t.text)
  root.style.setProperty('--theme-text-sec', t.textSec)
  root.style.setProperty('--theme-name', t.name)

  // 如果 body 有 background，覆盖掉
  var style = document.createElement('style')
  style.textContent = 'body{background:'+t.bg+'!important}'
  document.head.appendChild(style)
})()
