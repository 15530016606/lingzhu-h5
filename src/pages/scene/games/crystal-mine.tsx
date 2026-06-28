import { useCallback, useEffect, useRef, useState } from 'react'
import Taro from '@tarojs/taro'
import { View, Text } from '@tarojs/components'
import { theme } from '@/lib/theme'
import { SCENES } from '@/pages/scene/configs'
import { playSound, playRareSound, preloadSounds, resumeAudio } from '@/lib/sound'
import { addToBackpack } from '@/lib/backpack'
import MemoryMatch from './memory-match'
import MatchThree from './match-three'
import StackMatch from './stack-match'

const KF = `
@keyframes float {0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
@keyframes glow-pulse {0%,100%{box-shadow:0 0 10px var(--gc)}50%{box-shadow:0 0 30px var(--gc),0 0 50px var(--gc)}}
@keyframes card-reveal {0%{transform:rotateY(180deg) scale(1.3);opacity:0}40%{transform:rotateY(100deg) scale(1.1)}100%{transform:rotateY(0) scale(1);opacity:1}}
@keyframes star-burst {0%{transform:translate(0,0) scale(0);opacity:1}100%{transform:translate(var(--sx),var(--sy)) scale(0.3);opacity:0}}
@keyframes title-glow {0%,100%{text-shadow:0 0 8px var(--tc)}50%{text-shadow:0 0 20px var(--tc),0 0 40px var(--tc)}}
@keyframes enter-down {0%{transform:translateY(-20px);opacity:0}100%{transform:translateY(0);opacity:1}}
`

const GAMES = [
  {id:'memory',name:'水晶连连看',icon:'💎',desc:'翻牌配对 考验记忆力',color:'#b388ff'},
  {id:'match3',name:'水晶消消乐',icon:'✨',desc:'三连消除 爽快连击',color:'#ff80ab'},
  {id:'stack',name:'水晶叠叠乐',icon:'🔮',desc:'集齐三层 策略叠牌',color:'#ffd54f'},
]

export default function CrystalMineGame({source,onComplete}:{source:string,onComplete:(m:string,n:string)=>void}){
  const cfg = SCENES.find(s=>s.id===source)||SCENES[0]
  const [phase,setPhase] = useState<'intro'|'reveal'|'game'|'result'>('intro')
  const [gamePicked,setGamePicked] = useState<any>(null)
  const [stars,setStars] = useState<any[]>([])
  const [gemWon,setGemWon] = useState<any>(null)
  const iconRef = useRef<number>()

  useEffect(()=>{preloadSounds()},[])

  const drawCard = useCallback(()=>{
    resumeAudio()
    playSound('chime1',0.3)
    const picked = GAMES[Math.floor(Math.random()*GAMES.length)]
    // 粒子星星
    const st = Array.from({length:12},(_,i)=>({
      id:Date.now()+i,sx:(Math.random()-0.5)*200,sy:(Math.random()-0.5)*200-50,
    }))
    setStars(st)
    setTimeout(()=>setStars([]),500)
    // 翻卡
    setTimeout(()=>{
      setGamePicked(picked)
      playRareSound()
      setPhase('reveal')
      // 自动进游戏
      setTimeout(()=>{
        setPhase('game')
      },1200)
    },300)
  },[])

  const onGameEnd = useCallback((score:number)=>{
    let gemId = 'white', gemName = '白水晶', gemType: 'gem'|'scrap' = 'gem'
    if(score >= 80){
      gemId = ['gold','green','blue'][Math.floor(Math.random()*3)]
      gemName = gemId==='gold'?'发晶':gemId==='green'?'绿幽灵':'海蓝宝'
    } else if(score >= 40) {
      gemId = ['white','purple','pink'][Math.floor(Math.random()*3)]
      gemName = gemId==='white'?'白水晶':gemId==='purple'?'紫晶':'粉晶'
    } else {
      gemId = 'scrap'
      gemName = '碎石废料'
      gemType = 'scrap'
    }
    setGemWon({id:gemId,name:gemName,type:gemType})
    setPhase('result')
    playSound('complete',0.6)
    if(gemType==='scrap') playSound('click_error',0.3)
    else if(score>=80) playRareSound()
  },[])

  const handleCollect = useCallback(()=>{
    if(!gemWon)return
    addToBackpack(gemWon.id, gemWon.name, gemWon.type)
    setCollected(true)
    playSound('coin',0.5)
  },[gemWon])

  const [collected,setCollected] = useState(false)
  const [flipped,setFlipped] = useState(false)
  const goHome = useCallback(()=>Taro.navigateBack(),[])
  const playAgain = useCallback(()=>{
    setPhase('intro');setCollected(false);setGemWon(null);setGamePicked(null);setFlipped(false)
  },[])

  // 游戏组件
  if(phase === 'game' && gamePicked){
    if(gamePicked.id === 'memory') return <MemoryMatch onEnd={onGameEnd} accentColor={cfg.accentColor} bgColor={cfg.bgColor} />
    if(gamePicked.id === 'match3') return <MatchThree onEnd={onGameEnd} accentColor={cfg.accentColor} bgColor={cfg.bgColor} />
    if(gamePicked.id === 'stack') return <StackMatch onEnd={onGameEnd} accentColor={cfg.accentColor} bgColor={cfg.bgColor} />
    return <View style={{padding:40,alignItems:'center',paddingTop:100}}><Text style={{color:'#fff',fontSize:14}}>未知游戏</Text></View>
  }

  return(
    <View style={{minHeight:'100vh',background:'#1a1020',overflow:'hidden',display:'flex',flexDirection:'column'}}>
      <style>{KF}</style>

      <View style={{flex:1,display:'flex',flexDirection:'column',
        background:`url(${cfg.sceneImage}) center/cover no-repeat`}}>
        <View style={{flex:1,
          background:'linear-gradient(180deg,rgba(0,0,0,0.25),rgba(0,0,0,0.08)30%,rgba(0,0,0,0.35))',
          display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:20}}>

          <Text style={{fontSize:20,fontWeight:700,color:'#fff',textShadow:'0 2px 8px rgba(0,0,0,0.5)',marginBottom:4}}>{cfg.name}</Text>
          <Text style={{fontSize:10,color:'rgba(255,255,255,0.4)',marginBottom:28}}>抽一张卡 随机游戏赢水晶</Text>

          {/* 卡背（intro） */}
          {phase === 'intro' && (
            <View onClick={drawCard} style={{
              width:160,height:220,borderRadius:16,cursor:'pointer',
              background:'linear-gradient(145deg,#6a5080,#3a2040)',
              border:'2px solid rgba(255,255,255,0.1)',
              display:'flex',alignItems:'center',justifyContent:'center',
              animation:'float 2.5s ease-in-out infinite, glow-pulse 2s ease-in-out infinite',
              '--gc':'rgba(160,120,200,0.35)',marginBottom:20,
            } as any}>
              <View style={{alignItems:'center',gap:6,display:'flex',flexDirection:'column'}}>
                <Text style={{fontSize:40,opacity:0.6}}>?</Text>
                <Text style={{fontSize:11,color:'rgba(255,255,255,0.35)'}}>点击抽卡</Text>
              </View>
            </View>
          )}

          {/* 翻卡 reveal */}
          {phase === 'reveal' && gamePicked && (
            <View style={{alignItems:'center',gap:14,display:'flex',flexDirection:'column'}}>
              <View style={{
                width:160,height:220,borderRadius:16,
                background:'linear-gradient(145deg,#2a1a40,#1a1020)',
                border:`2px solid ${gamePicked.color}55`,
                boxShadow:`0 0 30px ${gamePicked.color}33`,
                display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',
                animation:'card-reveal 0.5s ease-out',
              }}>
                <Text style={{fontSize:52,marginBottom:6}}>{gamePicked.icon}</Text>
                <Text style={{fontSize:17,fontWeight:700,color:'#f0e8d0',marginBottom:2,
                  animation:`title-glow 0.8s ease-in-out infinite`,
                  '--tc':gamePicked.color} as any}>{gamePicked.name}</Text>
                <Text style={{fontSize:10,color:'rgba(255,255,255,0.35)'}}>{gamePicked.desc}</Text>
              </View>
              {/* 加载粒子 */}
              <View style={{display:'flex',flexDirection:'row',gap:6}}>
                {[0,1,2].map(i=>(
                  <View key={i} style={{width:6,height:6,borderRadius:3,background:gamePicked.color,
                    animation:'enter-down 0.5s ease-in-out infinite',animationDelay:`${i*0.15}s`}}/>
                ))}
              </View>
            </View>
          )}

          {/* 星星粒子 */}
          {stars.map(s=>(
            <View key={s.id} style={{position:'absolute',left:'50%',top:'45%',width:4,height:4,borderRadius:2,
              background:'#fff',animation:`star-burst 0.4s ease-out forwards`,
              '--sx':`${s.sx}px`,'--sy':`${s.sy}px`} as any}/>
          ))}
        </View>
      </View>

      {/* 结果弹窗 */}
      {phase === 'result' && gemWon && (
        <View style={{position:'absolute',inset:0,background:'rgba(0,0,0,0.7)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:30}}>
          <View style={{background:'#FAF6ED',borderRadius:20,padding:'24px 28px',alignItems:'center',gap:8,display:'flex',flexDirection:'column',maxWidth:280}}>
            {gemWon.type==='scrap' ? (
              <>
                <View style={{width:48,height:48,borderRadius:10,background:'#c8b8a8',display:'flex',alignItems:'center',justifyContent:'center'}}>
                  <Text style={{fontSize:24,opacity:0.6}}>💎</Text>
                </View>
                <Text style={{fontSize:15,fontWeight:700,color:'#928370'}}>获得碎石废料</Text>
                <Text style={{fontSize:10,color:'#928370',textAlign:'center'}}>表现不太好，下次加油</Text>
              </>
            ) : (
              <>
                <View style={{width:56,height:56,borderRadius:12,overflow:'hidden',
                  border:`2px solid ${gemWon.id==='gold'?'#ffd54f':gemWon.id==='green'?'#69f0ae':gemWon.id==='blue'?'#40c4ff':'#a0c4ff'}88`,
                  boxShadow:`0 0 16px ${gemWon.id==='gold'?'#ffd54f':gemWon.id==='green'?'#69f0ae':gemWon.id==='blue'?'#40c4ff':'#a0c4ff'}66`}}>
                  <img src={`/images/scenes/thumbs/thumb_${gemWon.id==='scrap'?'rock-chip':gemWon.id==='gold'?'raw-gold':gemWon.id==='green'?'raw-green':gemWon.id==='blue'?'raw-blue':gemWon.id==='purple'?'raw-purple':gemWon.id==='pink'?'raw-pink':'raw-white'}.png`} style={{width:'100%',height:'100%',objectFit:'cover'}}/>
                </View>
                <Text style={{fontSize:15,fontWeight:700,color:'#4A382C'}}>{gemWon.name}</Text>
                <Text style={{fontSize:10,color:'#928370'}}>{gemWon.id==='gold'||gemWon.id==='green'||gemWon.id==='blue'?'稀有品质':'普通品质'}</Text>
              </>
            )}
            {!collected ? (
              <View onClick={handleCollect} style={{marginTop:10,padding:'10px 36px',borderRadius:25,
                background:'linear-gradient(135deg,#d4a574,#c4956a)',cursor:'pointer',
                boxShadow:'0 3px 10px rgba(212,165,116,0.3)'}}>
                <Text style={{fontSize:13,fontWeight:700,color:'#fff'}}>放入背包</Text>
              </View>
            ) : (
              <>
                <Text style={{fontSize:11,color:'#9db9a5',fontWeight:600}}>已放入背包</Text>
                <View style={{display:'flex',flexDirection:'row',gap:10,marginTop:6}}>
                  <View onClick={goHome} style={{padding:'8px 20px',borderRadius:20,
                    border:'1px solid #d4c0a4',cursor:'pointer'}}>
                    <Text style={{fontSize:12,color:'#4A382C'}}>返回首页</Text>
                  </View>
                  <View onClick={playAgain} style={{padding:'8px 20px',borderRadius:20,
                    background:'linear-gradient(135deg,#d4a574,#c4956a)',cursor:'pointer'}}>
                    <Text style={{fontSize:12,fontWeight:600,color:'#fff'}}>再来一局</Text>
                  </View>
                </View>
              </>
            )}
          </View>
        </View>
      )}
    </View>
  )
}
