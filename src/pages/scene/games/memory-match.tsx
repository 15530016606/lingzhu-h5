import { useCallback, useEffect, useRef, useState } from 'react'
import { View, Text } from '@tarojs/components'
import { playSound, playRareSound, preloadSounds } from '@/lib/sound'

const KF = `
@keyframes flip {0%{transform:rotateY(0)}50%{transform:rotateY(90deg)}100%{transform:rotateY(180deg)}}
@keyframes match-pop {0%{transform:scale(1);opacity:1}40%{transform:scale(1.3)}100%{transform:scale(0);opacity:0}}
@keyframes shake {0%,100%{transform:translateX(0)}20%{transform:translateX(-4px)}40%{transform:translateX(4px)}60%{transform:translateX(-2px)}80%{transform:translateX(2px)}}
@keyframes bounce-in {0%{transform:scale(0);opacity:0}60%{transform:scale(1.1)}100%{transform:scale(1);opacity:1}}
`

const GEM_IMGS = [
  {id:'white',img:'gem-white.png',color:'#a0c4ff',label:'白'},
  {id:'purple',img:'gem-purple.png',color:'#b388ff',label:'紫'},
  {id:'pink',img:'raw-pink.png',color:'#ff80ab',label:'粉'},
  {id:'gold',img:'raw-gold.png',color:'#ffd54f',label:'金'},
  {id:'green',img:'raw-green.png',color:'#69f0ae',label:'绿'},
  {id:'blue',img:'raw-blue.png',color:'#40c4ff',label:'蓝'},
  {id:'crystal',img:'raw-white.png',color:'#e8f0ff',label:'晶'},
  {id:'sparkle',img:'gem-white.png',color:'#fff',label:'光'},
]

function shuffle(arr:any[]){
  const a=[...arr];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}
  return a
}

const TOTAL_TIME = 40

export default function MemoryMatch({onEnd,accentColor,bgColor}:{onEnd:(s:number)=>void,accentColor:string,bgColor:string}){
  const [cards,setCards]=useState<any[]>([])
  const [flipped,setFlipped]=useState<number[]>([])
  const [matched,setMatched]=useState<number[]>([])
  const [score,setScore]=useState(0)
  const [time,setTime]=useState(TOTAL_TIME)
  const [started,setStarted]=useState(false)
  const [shaking,setShaking]=useState<number|null>(null)
  const lock=useRef(false)
  const timerRef=useRef<any>()

  useEffect(()=>{preloadSounds()},[])

  const init = useCallback(()=>{
    const pairs = shuffle(GEM_IMGS).slice(0,8)
    const deck = shuffle([...pairs,...pairs].map((g,i)=>({id:i,gem:g,matched:false})))
    setCards(deck)
    setFlipped([]);setMatched([]);setScore(0);setTime(TOTAL_TIME)
    setStarted(true)
    // 计时
    timerRef.current = setInterval(()=>{
      setTime(t=>{
        if(t<=1){clearInterval(timerRef.current);return 0}
        return t-1
      })
    },1000)
  },[])

  // 时间到
  useEffect(()=>{
    if(started && time<=0){
      const pct = score/8*100
      setTimeout(()=>onEnd(pct),500)
    }
  },[time,started,score,onEnd])

  const tapCard = useCallback((idx:number)=>{
    if(lock.current||flipped.length>=2||matched.includes(idx)||flipped.includes(idx)||time<=0)return
    const newFlip=[...flipped,idx]
    setFlipped(newFlip)
    playSound('chime1',0.2)
    if(newFlip.length===2){
      lock.current=true
      const [a,b]=newFlip
      if(cards[a].gem.id===cards[b].gem.id){
        // 配对成功
        setTimeout(()=>{
          playSound('coin',0.4)
          setMatched(m=>[...m,a,b])
          setScore(s=>s+1)
          setFlipped([])
          lock.current=false
          // 检查全完成
          if(matched.length+2===cards.length){
            clearInterval(timerRef.current)
            setTimeout(()=>onEnd(100),600)
          }
        },400)
      }else{
        // 配对失败
        setShaking(a)
        setTimeout(()=>{
          setShaking(null)
          setFlipped([])
          lock.current=false
          playSound('click_error',0.2)
        },600)
      }
    }
  },[flipped,matched,cards,time,onEnd])

  // 未开始 → 点开始
  if(!started){
    return(
      <View style={{minHeight:'100vh',background:bgColor,display:'flex',alignItems:'center',justifyContent:'center'}}>
        <style>{KF}</style>
        <View style={{alignItems:'center',gap:12,display:'flex',flexDirection:'column',padding:24}}>
          <Text style={{fontSize:22,fontWeight:700,color:'#4A382C'}}>水晶连连看</Text>
          <Text style={{fontSize:12,color:'#928370',textAlign:'center',lineHeight:1.6}}>
            翻牌配对{'\n'}8 对水晶 40 秒挑战
          </Text>
          <View onClick={init} style={{marginTop:20,padding:'14px 40px',borderRadius:25,
            background:`linear-gradient(135deg,${accentColor},#6a5080)`,cursor:'pointer'}}>
            <Text style={{fontSize:15,fontWeight:700,color:'#fff'}}>开始游戏</Text>
          </View>
        </View>
      </View>
    )
  }

  return(
    <View style={{minHeight:'100vh',background:'#1a1520',display:'flex',flexDirection:'column'}}>
      <style>{KF}</style>

      {/* 顶栏 */}
      <View style={{padding:'14px 16px 8px',display:'flex',flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>
        <Text style={{fontSize:15,fontWeight:700,color:'#f0e8d0'}}>连连看</Text>
        <View style={{display:'flex',flexDirection:'row',gap:16,alignItems:'center'}}>
          <Text style={{fontSize:13,color:'#f0e8d0'}}>{score}/8</Text>
          <View style={{padding:'4px 10px',borderRadius:12,background:time<=10?'rgba(255,80,80,0.3)':'rgba(255,255,255,0.1)'}}>
            <Text style={{fontSize:13,fontWeight:700,color:time<=10?'#ff5050':'#f0e8d0'}}>{time}s</Text>
          </View>
        </View>
      </View>

      {/* 进度条 */}
      <View style={{margin:'0 16px 12px',height:3,borderRadius:2,background:'rgba(255,255,255,0.08)',overflow:'hidden'}}>
        <View style={{height:'100%',borderRadius:2,background:`linear-gradient(90deg,${accentColor},#f0e8d0)`,
          width:`${(time/TOTAL_TIME)*100}%`,transition:'width 1s linear'}}/>
      </View>

      {/* 卡片网格 */}
      <View style={{padding:'8px 16px',display:'flex',flex:1,alignItems:'center',justifyContent:'center'}}>
        <View style={{width:'100%',maxWidth:340,aspectRatio:'1/1',display:'flex',flexDirection:'row',flexWrap:'wrap',gap:6,alignContent:'center'}}>
        {cards.map((card,i)=>{
          const isFlipped = flipped.includes(i)||matched.includes(i)
          const isMatched = matched.includes(i)
          return(
            <View key={card.id} onClick={()=>tapCard(i)} style={{
              width:'calc(25% - 4.5px)',aspectRatio:'1/1',maxWidth:78,
              borderRadius:10,overflow:'hidden',
              cursor:'pointer',perspective:'300px',
              animation:isMatched?'match-pop 0.4s ease-out forwards':shaking===i?'shake 0.3s ease':'none',
              opacity:isMatched?0:1,pointerEvents:isMatched?'none':'auto',
            }}>
              <View style={{width:'100%',height:'100%',position:'relative',transformStyle:'preserve-3d',
                transition:'transform 0.3s',transform:isFlipped?'rotateY(180deg)':'rotateY(0)'}}>
                {/* 卡背 */}
                <View style={{position:'absolute',inset:0,borderRadius:10,
                  background:'linear-gradient(145deg,#6a5080,#4a3060)',
                  border:'1px solid rgba(255,255,255,0.1)',
                  display:'flex',alignItems:'center',justifyContent:'center',
                  backfaceVisibility:'hidden'}}>
                  <Text style={{fontSize:20,opacity:0.4}}>?</Text>
                </View>
                {/* 卡面 */}
                <View style={{position:'absolute',inset:0,borderRadius:10,
                  background:'#2a1a40',border:`1px solid ${card.gem.color}44`,
                  display:'flex',alignItems:'center',justifyContent:'center',
                  backfaceVisibility:'hidden',transform:'rotateY(180deg)'}}>
                  <img src={`/images/scenes/thumbs/thumb_${card.gem.img}`} style={{width:'65%',height:'65%',objectFit:'contain'}}/>
                </View>
              </View>
            </View>
          )
        })}
        </View>
      </View>

      {/* 底部提示 */}
      <View style={{padding:'8px 16px',alignItems:'center'}}>
        <Text style={{fontSize:10,color:'rgba(255,255,255,0.2)'}}>翻两张配对的消除</Text>
      </View>
    </View>
  )
}
