import { useCallback, useEffect, useRef, useState } from 'react'
import { playSound, playRareSound, preloadSounds } from '@/lib/sound'

const KF = `
@keyframes s-pop {0%{transform:scale(0);opacity:0}50%{transform:scale(1.15)}100%{transform:scale(1);opacity:1}}
@keyframes s-match {0%{transform:scale(1);opacity:1}30%{transform:scale(1.3)}100%{transform:scale(0);opacity:0}}
@keyframes s-shake {0%,100%{transform:translateX(0)}20%{transform:translateX(-4px)}40%{transform:translateX(4px)}60%{transform:translateX(-2px)}80%{transform:translateX(2px)}}
`

const GEMS = [
  {emoji:'💎',color:'#a0c4ff',label:'白'},
  {emoji:'🔮',color:'#b388ff',label:'紫'},
  {emoji:'💗',color:'#ff80ab',label:'粉'},
  {emoji:'⭐',color:'#ffd54f',label:'金'},
  {emoji:'💠',color:'#40c4ff',label:'蓝'},
  {emoji:'✨',color:'#e8f0ff',label:'晶'},
]

const TOTAL=40,MAX_SLOT=7

function makeDeck(){
  const types=Array.from({length:7},()=>Math.floor(Math.random()*6))
  const deck=types.flatMap(t=>[t,t,t])
  for(let i=deck.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[deck[i],deck[j]]=[deck[j],deck[i]]}
  const layers:number[][]=[deck.slice(0,9),deck.slice(9,16),deck.slice(16,21)]
  return layers.map((layer,li)=>layer.map((gem,gi)=>({
    id:`${li}-${gi}`,gem,layer:li,row:Math.floor(gi/3),col:gi%3,removed:false,
  })))
}

export default function StackMatch({onEnd,accentColor,bgColor}:{onEnd:(s:number)=>void,accentColor:string,bgColor:string}){
  const [layers,setLayers]=useState<any[][]>([])
  const [slot,setSlot]=useState<number[]>([])
  const [score,setScore]=useState(0)
  const [time,setTime]=useState(TOTAL)
  const [started,setStarted]=useState(false)
  const [shaking,setShaking]=useState(false)
  const [matching,setMatching]=useState(false)
  const timerRef=useRef<any>()
  const lock=useRef(false)

  useEffect(()=>{preloadSounds()},[])

  const init=useCallback(()=>{
    setLayers(makeDeck());setSlot([]);setScore(0);setTime(TOTAL)
    setStarted(true);setShaking(false);setMatching(false)
    timerRef.current=setInterval(()=>{
      setTime(t=>{if(t<=1){clearInterval(timerRef.current);return 0}return t-1})
    },1000)
  },[])

  useEffect(()=>{
    if(started&&time<=0){
      const pct=Math.min(score*15,100)
      setTimeout(()=>onEnd(pct),500)
    }
  },[time,started,score,onEnd])

  const isTopVisible=useCallback((card:any,layers:any[][])=>{
    for(let li=card.layer+1;li<layers.length;li++){
      for(const c of layers[li]){
        if(!c.removed&&c.row===card.row&&c.col===card.col)return false
      }
    }
    return true
  },[])

  // 响应式卡片尺寸
  const cardSize = Math.min(18, (typeof window !== 'undefined' ? window.innerWidth : 375) / 20)
  const gap = cardSize * 0.2

  const tapCard=useCallback((card:any)=>{
    if(lock.current||time<=0||matching)return
    const l=layers
    if(!isTopVisible(card,l))return
    lock.current=true
    playSound('chime1',0.2)
    const nl=l.map(layer=>layer.map(c=>c.id===card.id?{...c,removed:true}:c))
    setLayers(nl)
    const ns=[...slot,card.gem]
    setSlot(ns)
    const counts:Record<number,number>={}
    for(const g of ns)counts[g]=(counts[g]||0)+1
    let matched=false
    for(const [g,c] of Object.entries(counts)){
      if(c>=3){
        matched=true
        setMatching(true)
        playSound('coin',0.5)
        setTimeout(()=>{
          let removed=0
          const ns2=ns.filter(g2=>{if(g2===Number(g)&&removed<3){removed++;return false}return true})
          setSlot(ns2)
          setScore(s=>s+1)
          setMatching(false)
          lock.current=false
          const allRemoved=nl.every(layer=>layer.every(c=>c.removed))
          if(allRemoved){
            clearInterval(timerRef.current)
            setTimeout(()=>onEnd(100),500)
          }
        },300)
        break
      }
    }
    if(!matched){
      if(ns.length>=MAX_SLOT){
        setShaking(true)
        playSound('click_error',0.3)
        setTimeout(()=>{
          setShaking(false)
          clearInterval(timerRef.current)
          setTimeout(()=>onEnd(Math.min(score*15,100)),500)
        },600)
      }else{
        setTimeout(()=>{lock.current=false},200)
      }
    }
  },[layers,slot,time,matching,score,isTopVisible,onEnd])

  if(!started)return(
    <div style={{minHeight:'100vh',background:bgColor,display:'flex',alignItems:'center',justifyContent:'center'}}>
      <style>{KF}</style>
      <div style={{alignItems:'center',gap:12,display:'flex',flexDirection:'column',padding:'16px'}}>
        <span style={{fontSize:20,fontWeight:700,color:'#fff'}}>叠叠乐</span>
        <span style={{fontSize:12,color:'rgba(255,255,255,0.5)',textAlign:'center',lineHeight:1.6}}>3 层叠牌 集齐 3 张相同消除{'\n'}槽满 7 格则失败</span>
        <div onClick={init} style={{marginTop:16,padding:'12px 36px',borderRadius:25,
          background:`linear-gradient(135deg,${accentColor},#6a5080)`,cursor:'pointer',touchAction:'manipulation'}}>
          <span style={{fontSize:15,fontWeight:700,color:'#fff'}}>开始游戏</span>
        </div>
      </div>
    </div>
  )

  return(
    <div style={{minHeight:'100vh',background:'#1a1520',display:'flex',flexDirection:'column',overflow:'hidden'}}>
      <style>{KF}</style>

      {/* 状态栏 */}
      <div style={{padding:'12px 16px',display:'flex',flexDirection:'row',justifyContent:'space-between',alignItems:'center',background:'rgba(0,0,0,0.2)'}}>
        <span style={{fontSize:14,fontWeight:700,color:'#f0e8d0'}}>叠叠乐 {score}/7组</span>
        <span style={{fontSize:14,fontWeight:700,color:time<=10?'#ff5050':'#f0e8d0'}}>{time}s</span>
      </div>
      <div style={{height:3,background:'rgba(255,255,255,0.08)'}}>
        <div style={{height:'100%',background:`linear-gradient(90deg,${accentColor},#f0e8d0)`,
          width:`${(time/TOTAL)*100}%`,transition:'width 1s linear'}}/>
      </div>

      {/* 叠牌区 - 使用 vw 百分比定位 */}
      <div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center'}}>
        <div style={{position:'relative',width:'85vw',height:'85vw',maxWidth:320,maxHeight:320}}>
          {layers.map((layer,li)=>layer.map(card=>{
            if(card.removed)return null
            const visible=isTopVisible(card,layers)
            const cw = `calc(${100/3}% - ${gap}px)`
            return(
              <div key={card.id} onClick={()=>tapCard(card)} style={{
                position:'absolute',
                left:`calc(${card.col * 33.33}% + ${li * 2}px)`,
                top:`calc(${card.row * 33.33}% + ${li * 2}px)`,
                width:`calc(${100/3}% - ${gap}px)`, aspectRatio:'1',
                borderRadius:10, cursor:visible?'pointer':'default',
                background:visible?`${GEMS[card.gem].color}44`: 'rgba(255,255,255,0.03)',
                border:visible?`2px solid ${GEMS[card.gem].color}77`:'1px solid rgba(255,255,255,0.06)',
                display:'flex',alignItems:'center',justifyContent:'center',
                zIndex:li*10+card.row,
                opacity:visible?1:0.2,
                animation:visible?'s-pop 0.25s ease-out':'none',
                touchAction:'manipulation', boxSizing:'border-box',
              }}>
                {visible&&<span style={{fontSize:'clamp(20px,5vw,32px)'}}>{GEMS[card.gem].emoji}</span>}
              </div>
            )
          }))}
        </div>
      </div>

      {/* 槽位 */}
      <div style={{padding:'12px 20px',display:'flex',flexDirection:'column',alignItems:'center',gap:6}}>
        <span style={{fontSize:10,color:'rgba(255,255,255,0.3)'}}>收集槽 ({slot.length}/{MAX_SLOT})</span>
        <div style={{
          width:'100%',maxWidth:320,height:48,borderRadius:12,
          background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.08)',
          display:'flex',flexDirection:'row',gap:4,padding:'4px 8px',alignItems:'center',
          animation:shaking?'s-shake 0.3s ease':'none',
        }}>
          {Array.from({length:MAX_SLOT}).map((_,i)=>(
            <div key={i} style={{
              flex:1,height:'100%',borderRadius:8,
              background:slot[i]!==undefined?`${GEMS[slot[i]].color}33`:'rgba(255,255,255,0.03)',
              border:slot[i]!==undefined?`1px solid ${GEMS[slot[i]].color}55`:'1px solid rgba(255,255,255,0.05)',
              display:'flex',alignItems:'center',justifyContent:'center',
              animation:slot[i]!==undefined?'s-pop 0.2s ease-out':'none',
            }}>
              {slot[i]!==undefined&&<span style={{fontSize:18}}>{GEMS[slot[i]].emoji}</span>}
            </div>
          ))}
        </div>
      </div>

      <div style={{padding:'4px 16px 12px',textAlign:'center'}}>
        <span style={{fontSize:9,color:'rgba(255,255,255,0.15)'}}>点卡收集 3 张相同消除</span>
      </div>
    </div>
  )
}
