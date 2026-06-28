import { useCallback, useEffect, useRef, useState } from 'react'
import { View, Text } from '@tarojs/components'
import { playSound, preloadSounds } from '@/lib/sound'

const KF = `
@keyframes m3-pop {0%{transform:scale(1);opacity:1}40%{transform:scale(1.4)}100%{transform:scale(0);opacity:0}}
@keyframes m3-fall {0%{transform:translateY(-60px);opacity:0}100%{transform:translateY(0);opacity:1}}
@keyframes m3-shake {0%,100%{transform:translateX(0)}20%{transform:translateX(-3px)}40%{transform:translateX(3px)}60%{transform:translateX(-2px)}80%{transform:translateX(2px)}}
@keyframes m3-flash {0%,100%{opacity:1}50%{opacity:0.3}}
`

const GEMS = [
  {img:'gem-white.png',color:'#a0c4ff',label:'白'},
  {img:'gem-purple.png',color:'#b388ff',label:'紫'},
  {img:'raw-pink.png',color:'#ff80ab',label:'粉'},
  {img:'raw-gold.png',color:'#ffd54f',label:'金'},
  {img:'raw-green.png',color:'#69f0ae',label:'绿'},
  {img:'raw-blue.png',color:'#40c4ff',label:'蓝'},
]

const ROWS=6,COLS=6,TOTAL=40

function shuffle<T>(a:T[]):T[]{const b=[...a];for(let i=b.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[b[i],b[j]]=[b[j],b[i]]}return b}

// 生成无初始匹配的网格
function makeGrid(){
  const grid:number[][]=[]
  for(let r=0;r<ROWS;r++){
    const row:number[]=[]
    for(let c=0;c<COLS;c++){
      let v=Math.floor(Math.random()*6)
      // 避免初始三连
      while(
        (r>=2&&grid[r-1][c]===v&&grid[r-2][c]===v)||
        (c>=2&&row[c-1]===v&&row[c-2]===v)
      ){v=Math.floor(Math.random()*6)}
      row.push(v)
    }
    grid.push(row)
  }
  return grid
}

// 查找匹配
function findMatches(grid:number[][]):[number,number][]{
  const matched=new Set<string>()
  // 横
  for(let r=0;r<ROWS;r++)for(let c=0;c<COLS-2;c++){
    if(grid[r][c]>=0&&grid[r][c]===grid[r][c+1]&&grid[r][c]===grid[r][c+2]){
      matched.add(`${r},${c}`);matched.add(`${r},${c+1}`);matched.add(`${r},${c+2}`)
    }
  }
  // 竖
  for(let r=0;r<ROWS-2;r++)for(let c=0;c<COLS;c++){
    if(grid[r][c]>=0&&grid[r][c]===grid[r+1][c]&&grid[r][c]===grid[r+2][c]){
      matched.add(`${r},${c}`);matched.add(`${r+1},${c}`);matched.add(`${r+2},${c}`)
    }
  }
  return [...matched].map(s=>s.split(',').map(Number) as [number,number])
}

export default function MatchThree({onEnd,accentColor,bgColor}:{onEnd:(s:number)=>void,accentColor:string,bgColor:string}){
  const [grid,setGrid]=useState<number[][]>([])
  const [selected,setSelected]=useState<[number,number]|null>(null)
  const [score,setScore]=useState(0)
  const [time,setTime]=useState(TOTAL)
  const [started,setStarted]=useState(false)
  const [removing,setRemoving]=useState<Set<string>>(new Set())
  const [shake,setShake]=useState<[number,number]|null>(null)
  const lock=useRef(false)
  const timerRef=useRef<any>()

  useEffect(()=>{preloadSounds()},[])

  const init=useCallback(()=>{
    setGrid(makeGrid());setSelected(null);setScore(0);setTime(TOTAL)
    setStarted(true);setRemoving(new Set())
    timerRef.current=setInterval(()=>{
      setTime(t=>{if(t<=1){clearInterval(timerRef.current);return 0}return t-1})
    },1000)
  },[])

  useEffect(()=>{
    if(started&&time<=0)setTimeout(()=>onEnd(Math.min(score*10,100)),500)
  },[time,started,score,onEnd])

  // 消除 + 下落
  const processMatches=useCallback((g:number[][])=>{
    const matches=findMatches(g)
    if(matches.length===0&&lock.current){lock.current=false;return}
    if(matches.length===0)return
    // 标记消除
    const ms=new Set(matches.map(([r,c])=>`${r},${c}`))
    setRemoving(ms)
    playSound('coin',0.3)
    setTimeout(()=>{
      setScore(s=>s+matches.length/3)
      // 移除
      const ng=g.map(row=>[...row])
      for(const [r,c] of matches)ng[r][c]=-1
      // 下落
      for(let c=0;c<COLS;c++){
        let write=ROWS-1
        for(let r=ROWS-1;r>=0;r--)if(ng[r][c]>=0){ng[write][c]=ng[r][c];if(write!==r)ng[r][c]=-1;write--}
        for(let r=write;r>=0;r--)ng[r][c]=Math.floor(Math.random()*6)
      }
      setGrid(ng)
      setRemoving(new Set())
      // 再检查新匹配
      setTimeout(()=>processMatches(ng),200)
    },250)
  },[])

  const tapCell=useCallback((r:number,c:number)=>{
    if(lock.current||time<=0)return
    const g=grid
    if(!selected){
      if(g[r][c]>=0)setSelected([r,c])
      return
    }
    const [sr,sc]=selected
    if(sr===r&&sc===c){setSelected(null);return}
    // 检查邻接
    if(Math.abs(sr-r)+Math.abs(sc-c)!==1){setSelected([r,c]);return}
    // 交换
    lock.current=true
    const ng=g.map(row=>[...row])
    ng[sr][sc]=g[r][c];ng[r][c]=g[sr][sc]
    setGrid(ng);setSelected(null)
    playSound('chime1',0.2)
    // 检查匹配
    setTimeout(()=>{
      const ms=findMatches(ng)
      if(ms.length===0){
        // 换回来
        const ng2=g.map(row=>[...row])
        setGrid(ng2)
        setShake([r,c])
        playSound('click_error',0.2)
        setTimeout(()=>{setShake(null);lock.current=false},300)
      }else{
        processMatches(ng)
      }
    },200)
  },[grid,selected,time,processMatches])

  if(!started)return(
    <View style={{minHeight:'100vh',background:bgColor,display:'flex',alignItems:'center',justifyContent:'center'}}>
      <style>{KF}</style>
      <View style={{alignItems:'center',gap:12,display:'flex',flexDirection:'column',padding:24}}>
        <Text style={{fontSize:22,fontWeight:700,color:'#4A382C'}}>水晶消消乐</Text>
        <Text style={{fontSize:12,color:'#928370',textAlign:'center',lineHeight:1.6}}>6x6 三连消除{'\n'}40 秒看你能消多少</Text>
        <View onClick={init} style={{marginTop:20,padding:'14px 40px',borderRadius:25,
          background:`linear-gradient(135deg,${accentColor},#6a5080)`,cursor:'pointer'}}>
          <Text style={{fontSize:15,fontWeight:700,color:'#fff'}}>开始游戏</Text>
        </View>
      </View>
    </View>
  )

  return(
    <View style={{minHeight:'100vh',background:'#1a1520',display:'flex',flexDirection:'column'}}>
      <style>{KF}</style>
      <View style={{padding:'14px 16px 8px',display:'flex',flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>
        <Text style={{fontSize:15,fontWeight:700,color:'#f0e8d0'}}>消消乐</Text>
        <View style={{display:'flex',flexDirection:'row',gap:16,alignItems:'center'}}>
          <Text style={{fontSize:13,color:'#f0e8d0'}}>{score*10}分</Text>
          <View style={{padding:'4px 10px',borderRadius:12,background:time<=10?'rgba(255,80,80,0.3)':'rgba(255,255,255,0.1)'}}>
            <Text style={{fontSize:13,fontWeight:700,color:time<=10?'#ff5050':'#f0e8d0'}}>{time}s</Text>
          </View>
        </View>
      </View>
      <View style={{margin:'0 16px 10px',height:3,borderRadius:2,background:'rgba(255,255,255,0.08)',overflow:'hidden'}}>
        <View style={{height:'100%',borderRadius:2,background:`linear-gradient(90deg,${accentColor},#f0e8d0)`,
          width:`${(time/TOTAL)*100}%`,transition:'width 1s linear'}}/>
      </View>
      <View style={{padding:'4px 16px',display:'flex',flexDirection:'column',alignItems:'center',flex:1,justifyContent:'center'}}>
        <View style={{width:'100%',maxWidth:330,aspectRatio:'1/1',display:'flex',flexDirection:'column',gap:2}}>
        {grid.map((row,r)=>(
          <View key={r} style={{display:'flex',flexDirection:'row',gap:2,flex:1}}>
            {row.map((v,c)=>(
              <View key={c} onClick={()=>tapCell(r,c)} style={{
                flex:1,aspectRatio:'1/1',maxWidth:52,maxHeight:52,
                borderRadius:6,overflow:'hidden',cursor:'pointer',
                border:selected&&selected[0]===r&&selected[1]===c?`2px solid ${GEMS[v]?.color||'#fff'}`:'1px solid rgba(255,255,255,0.06)',
                background:v>=0?`${GEMS[v].color}33`:'transparent',
                display:'flex',alignItems:'center',justifyContent:'center',
                animation:removing.has(`${r},${c}`)?'m3-pop 0.25s ease-out forwards':
                  shake&&shake[0]===r&&shake[1]===c?'m3-shake 0.2s ease':'none',
                opacity:v<0?0:1,
              }}>
                {v>=0&&<img src={`/images/scenes/thumbs/thumb_${GEMS[v].img}`} style={{width:'75%',height:'75%',objectFit:'contain'}}/>}
              </View>
            ))}
          </View>
        ))}
        </View>
      </View>
      <View style={{padding:'8px 16px',alignItems:'center'}}>
        <Text style={{fontSize:9,color:'rgba(255,255,255,0.15)'}}>点两个相邻宝石交换 三连消除</Text>
      </View>
    </View>
  )
}
