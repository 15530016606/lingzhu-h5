import { useCallback, useEffect, useRef, useState } from 'react'
import { View, Text } from '@tarojs/components'
import { playSound, playRareSound, preloadSounds } from '@/lib/sound'

const KF = `
@keyframes s-pop {0%{transform:scale(0);opacity:0}50%{transform:scale(1.15)}100%{transform:scale(1);opacity:1}}
@keyframes s-match {0%{transform:scale(1);opacity:1}30%{transform:scale(1.3)}100%{transform:scale(0);opacity:0}}
@keyframes s-float {0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
@keyframes s-shake {0%,100%{transform:translateX(0)}20%{transform:translateX(-4px)}40%{transform:translateX(4px)}60%{transform:translateX(-2px)}80%{transform:translateX(2px)}}
`

const GEMS = [
  {img:'gem-white.png',color:'#a0c4ff',label:'白'},
  {img:'gem-purple.png',color:'#b388ff',label:'紫'},
  {img:'raw-pink.png',color:'#ff80ab',label:'粉'},
  {img:'raw-gold.png',color:'#ffd54f',label:'金'},
  {img:'raw-green.png',color:'#69f0ae',label:'绿'},
  {img:'raw-blue.png',color:'#40c4ff',label:'蓝'},
]

const TOTAL=40,MAX_SLOT=7

// 生成3层叠牌，每层6-8张
function makeDeck(){
  const totalCards=21 // 7组×3张
  const types=Array.from({length:7},()=>Math.floor(Math.random()*6))
  const deck=types.flatMap(t=>[t,t,t])
  // 打乱
  for(let i=deck.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[deck[i],deck[j]]=[deck[j],deck[i]]}
  // 分3层: 底层9张,中层7张,顶层5张
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

  // 检查顶层可见的卡片（上层覆盖的下层不可点）
  const isTopVisible=useCallback((card:any,layers:any[][])=>{
    // 检查上层是否覆盖此位置
    for(let li=card.layer+1;li<layers.length;li++){
      for(const c of layers[li]){
        if(!c.removed&&c.row===card.row&&c.col===card.col)return false
      }
    }
    return true
  },[])

  const tapCard=useCallback((card:any)=>{
    if(lock.current||time<=0||matching)return
    const l=layers
    if(!isTopVisible(card,l))return
    lock.current=true
    playSound('chime1',0.2)
    // 移除卡片
    const nl=l.map(layer=>layer.map(c=>c.id===card.id?{...c,removed:true}:c))
    setLayers(nl)
    const ns=[...slot,card.gem]
    setSlot(ns)
    // 检查3连
    const counts:Record<number,number>={}
    for(const g of ns)counts[g]=(counts[g]||0)+1
    let matched=false
    for(const [g,c] of Object.entries(counts)){
      if(c>=3){
        matched=true
        setMatching(true)
        playSound('coin',0.5)
        setTimeout(()=>{
          // 移除3个
          let removed=0
          const ns2=ns.filter(g2=>{if(g2===Number(g)&&removed<3){removed++;return false}return true})
          setSlot(ns2)
          setScore(s=>s+1)
          setMatching(false)
          lock.current=false
          // 检查是否全部清空
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
      // 检查槽满
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
    <View style={{minHeight:'100vh',background:bgColor,display:'flex',alignItems:'center',justifyContent:'center'}}>
      <style>{KF}</style>
      <View style={{alignItems:'center',gap:12,display:'flex',flexDirection:'column',padding:24}}>
        <Text style={{fontSize:22,fontWeight:700,color:'#4A382C'}}>水晶叠叠乐</Text>
        <Text style={{fontSize:12,color:'#928370',textAlign:'center',lineHeight:1.6}}>3 层叠牌 集 3 张相同消除{'\n'}槽满 7 格则失败</Text>
        <View onClick={init} style={{marginTop:20,padding:'14px 40px',borderRadius:25,
          background:`linear-gradient(135deg,${accentColor},#6a5080)`,cursor:'pointer'}}>
          <Text style={{fontSize:15,fontWeight:700,color:'#fff'}}>开始游戏</Text>
        </View>
      </View>
    </View>
  )

  // 计算已消除的组数
  return(
    <View style={{minHeight:'100vh',background:'#1a1520',display:'flex',flexDirection:'column'}}>
      <style>{KF}</style>
      <View style={{padding:'14px 16px 8px',display:'flex',flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>
        <Text style={{fontSize:15,fontWeight:700,color:'#f0e8d0'}}>叠叠乐</Text>
        <View style={{display:'flex',flexDirection:'row',gap:16,alignItems:'center'}}>
          <Text style={{fontSize:13,color:'#f0e8d0'}}>{score}/7 组</Text>
          <View style={{padding:'4px 10px',borderRadius:12,background:time<=10?'rgba(255,80,80,0.3)':'rgba(255,255,255,0.1)'}}>
            <Text style={{fontSize:13,fontWeight:700,color:time<=10?'#ff5050':'#f0e8d0'}}>{time}s</Text>
          </View>
        </View>
      </View>
      <View style={{margin:'0 16px 10px',height:3,borderRadius:2,background:'rgba(255,255,255,0.08)',overflow:'hidden'}}>
        <View style={{height:'100%',borderRadius:2,background:`linear-gradient(90deg,${accentColor},#f0e8d0)`,
          width:`${(time/TOTAL)*100}%`,transition:'width 1s linear'}}/>
      </View>

      {/* 叠牌区 */}
      <View style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',padding:16}}>
        <View style={{position:'relative',width:'80vw',height:'80vw',maxWidth:300,maxHeight:300}}>
          {layers.map((layer,li)=>layer.map(card=>{
            if(card.removed)return null
            const visible=isTopVisible(card,layers)
            const offset=li*8
            const cw=60-offset*0.3
            return(
              <View key={card.id} onClick={()=>tapCard(card)} style={{
                position:'absolute',
                left:`${8+card.col*30+offset-offset*0.2}px`,top:`${8+card.row*30+offset-offset*0.2}px`,
                width:cw,height:cw,borderRadius:8,overflow:'hidden',cursor:visible?'pointer':'default',
                background:visible?`${GEMS[card.gem].color}33`:'rgba(255,255,255,0.03)',
                border:visible?`1.5px solid ${GEMS[card.gem].color}66`:'1px solid rgba(255,255,255,0.04)',
                display:'flex',alignItems:'center',justifyContent:'center',
                zIndex:li*10+card.row,
                opacity:visible?1:0.25,
                animation:'s-pop 0.2s ease-out',
              }}>
                {visible&&<img src={`/images/scenes/thumbs/thumb_${GEMS[card.gem].img}`} style={{width:'70%',height:'70%',objectFit:'contain'}}/>}
              </View>
            )
          }))}
        </View>
      </View>

      {/* 槽位 */}
      <View style={{padding:'8px 20px',display:'flex',flexDirection:'column',alignItems:'center',gap:6}}>
        <Text style={{fontSize:9,color:'rgba(255,255,255,0.2)'}}>收集槽 ({slot.length}/{MAX_SLOT})</Text>
        <View style={{
          width:'100%',height:48,borderRadius:10,
          background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',
          display:'flex',flexDirection:'row',gap:2,padding:'4px 6px',alignItems:'center',
          animation:shaking?'s-shake 0.3s ease':'none',
        }}>
          {Array.from({length:MAX_SLOT}).map((_,i)=>(
            <View key={i} style={{
              width:40,height:40,borderRadius:6,overflow:'hidden',
              background:slot[i]!==undefined?`${GEMS[slot[i]].color}33`:'rgba(255,255,255,0.03)',
              border:slot[i]!==undefined?`1px solid ${GEMS[slot[i]].color}44`:'1px solid rgba(255,255,255,0.04)',
              display:'flex',alignItems:'center',justifyContent:'center',
              animation:slot[i]!==undefined?'s-pop 0.2s ease-out':'none',
            }}>
              {slot[i]!==undefined&&<img src={`/images/scenes/thumbs/thumb_${GEMS[slot[i]].img}`} style={{width:'70%',height:'70%',objectFit:'contain'}}/>}
            </View>
          ))}
        </View>
      </View>

      <View style={{padding:'6px 16px 10px',alignItems:'center'}}>
        <Text style={{fontSize:9,color:'rgba(255,255,255,0.15)'}}>点卡收集 3 张相同消除</Text>
      </View>
    </View>
  )
}
