"use client";

import { useEffect, useRef, useState } from "react";
import { Coffee, Gauge, RotateCcw, Share2, Sparkles, Trophy, Zap } from "lucide-react";

type Stage = "ready" | "countdown" | "grind" | "pressure" | "pour" | "result";
export type Scores = { grind: number; pressure: number; pour: number };
const clamp = (n:number,a=0,b=100)=>Math.min(b,Math.max(a,n));
const empty:Scores={grind:0,pressure:0,pour:0};

function title(n:number){
  if(n>=990)return "LEGENDARY BREW";
  if(n>=950)return "MASTER BREW";
  if(n>=900)return "EXCEPTIONAL BREW";
  if(n>=820)return "GREAT BREW";
  if(n>=700)return "SOLID BREW";
  return "KEEP BREWING";
}

export default function BrewBattleGame({
  onComplete,
  mode = "practice",
  disabled = false,
}: {
  onComplete?: (scores: Scores) => void | Promise<void>;
  mode?: "practice" | "competitive";
  disabled?: boolean;
}){
  const [stage,setStage]=useState<Stage>("ready");
  const [count,setCount]=useState(3);
  const [scores,setScores]=useState<Scores>(empty);
  const [best,setBest]=useState(0);
  const [gPos,setGPos]=useState(0), [gTarget,setGTarget]=useState(50), [gWidth,setGWidth]=useState(12);
  const gRef=useRef(0), gDir=useRef(1);
  const [pressure,setPressure]=useState(0), [pTarget,setPTarget]=useState(72), [holding,setHolding]=useState(false);
  const pRef=useRef(0);
  const [pour,setPour]=useState(50), [pourTarget,setPourTarget]=useState(50), [time,setTime]=useState(4.6), [accuracy,setAccuracy]=useState(0);
  const pourRef=useRef(50), targetRef=useRef(50), samples=useRef({sum:0,n:0}), dragging=useRef(false);
  const total=scores.grind+scores.pressure+scores.pour;

  function start(){
    if (disabled) return;
    setScores(empty); setGTarget(27+Math.random()*46); setGWidth(8+Math.random()*8);
    setPTarget(62+Math.random()*20); gRef.current=0; gDir.current=1; setGPos(0);
    pRef.current=0; setPressure(0); setHolding(false);
    pourRef.current=50; setPour(50); samples.current={sum:0,n:0}; setAccuracy(0); setTime(4.6);
    setCount(3); setStage("countdown");
  }

  useEffect(()=>{
    if(stage!=="countdown")return;
    if(count<=0){setStage("grind");return;}
    const t=setTimeout(()=>setCount(v=>v-1),550); return()=>clearTimeout(t);
  },[stage,count]);

  useEffect(()=>{
    if(stage!=="grind")return;
    let id=0,last=performance.now(); const speed=50+Math.random()*20;
    const tick=(now:number)=>{
      const dt=Math.min((now-last)/1000,.04); last=now;
      let x=gRef.current+gDir.current*speed*dt;
      if(x>=100){x=100;gDir.current=-1} if(x<=0){x=0;gDir.current=1}
      gRef.current=x; setGPos(x); id=requestAnimationFrame(tick);
    };
    id=requestAnimationFrame(tick); return()=>cancelAnimationFrame(id);
  },[stage]);

  function lockGrind(){
    const d=Math.abs(gRef.current-gTarget), q=clamp(1-d/Math.max(gWidth*1.8,18),0,1);
    setScores(s=>({...s,grind:Math.round(70+230*Math.pow(q,1.7))})); setStage("pressure");
  }

  useEffect(()=>{
    if(stage!=="pressure"||!holding)return;
    let id=0,last=performance.now();
    const tick=(now:number)=>{
      const dt=Math.min((now-last)/1000,.04); last=now;
      const wobble=pRef.current>55?(Math.random()-.5)*14:0;
      pRef.current=clamp(pRef.current+(28+pRef.current*.16+wobble)*dt);
      setPressure(pRef.current);
      if(pRef.current>=100){releasePressure(true);return}
      id=requestAnimationFrame(tick);
    };
    id=requestAnimationFrame(tick); return()=>cancelAnimationFrame(id);
  },[stage,holding]);

  function releasePressure(burn=false){
    if(stage!=="pressure")return;
    setHolding(false);
    const d=burn?40:Math.abs(pRef.current-pTarget), q=clamp(1-d/30,0,1);
    setScores(s=>({...s,pressure:Math.round(80+270*Math.pow(q,1.85))}));
    setTimeout(()=>setStage("pour"),160);
  }

  useEffect(()=>{
    if(stage!=="pour")return;
    let id=0,last=performance.now(),elapsed=0;
    const phase=Math.random()*Math.PI*2, speed=1.1+Math.random()*.5;
    const tick=(now:number)=>{
      const dt=Math.min((now-last)/1000,.04); last=now; elapsed+=dt;
      const t=clamp(50+Math.sin(elapsed*speed*2.2+phase)*27+Math.sin(elapsed*4.1+phase*.4)*7,12,88);
      targetRef.current=t; setPourTarget(t);
      const q=clamp(1-Math.abs(pourRef.current-t)/32,0,1);
      samples.current.sum+=q; samples.current.n++;
      setAccuracy(Math.round(samples.current.sum/samples.current.n*100));
      const left=Math.max(0,4.6-elapsed); setTime(left);
      if(left<=0){
        const avg=samples.current.sum/Math.max(1,samples.current.n);
        const finalPour = Math.round(60+290*Math.pow(avg,1.55));

        setScores(s => {
          const finalScores = { ...s, pour: finalPour };

          if (onComplete) {
            Promise.resolve(onComplete(finalScores)).catch(error => {
              console.error("[BrewBattleGame] completion failed:", error);
            });
          }

          return finalScores;
        });

        setStage("result"); return;
      }
      id=requestAnimationFrame(tick);
    };
    id=requestAnimationFrame(tick); return()=>cancelAnimationFrame(id);
  },[stage]);

  useEffect(()=>{
    if(stage!=="result") return;
    setBest(b=>Math.max(b,total));
  },[stage,total]);

  function shareScore(){
    const url=`${window.location.origin}/brew-battle`;
    const copy=`☕ I just brewed ${total}/1000 in the @EspresSui Brew Arena.\n\nThink you can beat my brew? 👀\n\n🎮 ${url}\n\n$ESPRESSUI #SUI`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(copy)}`,"_blank","noopener,noreferrer");
  }

  function move(x:number,el:HTMLElement){
    const r=el.getBoundingClientRect(),v=clamp((x-r.left)/r.width*100);
    pourRef.current=v; setPour(v);
  }

  return <div className="arena-v2">
    <div className="arena-top">
      <div><span className="game-label">{mode==="competitive"?"COMPETITIVE ARENA · VERIFIED":"PRACTICE ARENA · V2"}</span><h2>Make the perfect brew.</h2><p>Three different skills. One final score. Every run changes.</p></div>
      <div className="arena-best"><Trophy size={18}/><div><small>PERSONAL BEST</small><strong>{best}</strong></div></div>
    </div>
    <div className="arena-progress">
      {(["GRIND","PRESSURE","POUR"] as const).map((n,i)=>{
        const key=(["grind","pressure","pour"] as const)[i], done=scores[key]>0, active=stage===key;
        return <div key={n} className={`${active?"active":""} ${done?"complete":""}`}><span>{done?"✓":`0${i+1}`}</span><strong>{n}</strong></div>
      })}
    </div>
    <div className="arena-machine">
      <div className="arena-machine-head"><span>{stage.toUpperCase()}</span><span>{stage==="result"?`${total} / 1000`:"COFFEYVILLE BREW LAB"}</span></div>
      {stage==="ready"&&<div className="arena-screen arena-center"><Coffee size={54}/><h3>Ready for a real brew?</h3><p>React. Hold. Control. Your three scores become one Brew Score.</p><button className="brew-button" onClick={start} disabled={disabled}><Zap size={18}/> {mode==="competitive"?"BEGIN COMPETITIVE BREW":"START BREW"}</button></div>}
      {stage==="countdown"&&<div className="arena-screen arena-center arena-count"><small>GET READY</small><strong>{count||"BREW!"}</strong></div>}
      {stage==="grind"&&<div className="arena-screen"><div className="stage-title"><div><small>STAGE 01</small><h3>Lock the grind.</h3></div><strong>300 PTS</strong></div><p className="stage-help">Hit LOCK when the grinder reaches the blue sweet spot.</p><div className="grind-track"><div className="grind-target" style={{left:`${gTarget-gWidth/2}%`,width:`${gWidth}%`}}/><div className="grind-marker" style={{left:`${gPos}%`}}/><div className="bean-stream">● · • · ● · • · ●</div></div><button className="brew-button stage-action" onClick={lockGrind}>☕ LOCK GRIND</button></div>}
      {stage==="pressure"&&<div className="arena-screen"><div className="stage-title"><div><small>STAGE 02</small><h3>Build the pressure.</h3></div><strong>350 PTS</strong></div><p className="stage-help">Press and hold. Release in the blue zone before it burns.</p><div className="pressure-row"><div className="pressure-gauge"><div className="pressure-fill" style={{width:`${pressure}%`}}/><div className="pressure-target" style={{left:`${pTarget}%`}}/><div className="pressure-needle" style={{left:`${pressure}%`}}/></div><div className="pressure-readout"><Gauge size={18}/><strong>{Math.round(pressure)} BAR</strong></div></div><button className={`brew-button stage-action ${holding?"holding":""}`} onPointerDown={()=>setHolding(true)} onPointerUp={()=>holding&&releasePressure()} onPointerCancel={()=>holding&&releasePressure()}>{holding?"RELEASE!":"HOLD FOR PRESSURE"}</button></div>}
      {stage==="pour"&&<div className="arena-screen"><div className="stage-title"><div><small>STAGE 03</small><h3>Control the pour.</h3></div><strong>350 PTS</strong></div><p className="stage-help">Move left and right. Keep the stream inside the moving target.</p><div className="pour-field" onPointerDown={e=>{dragging.current=true;e.currentTarget.setPointerCapture(e.pointerId);move(e.clientX,e.currentTarget)}} onPointerMove={e=>{if(dragging.current||e.pointerType==="mouse")move(e.clientX,e.currentTarget)}} onPointerUp={()=>dragging.current=false} onPointerCancel={()=>dragging.current=false}><div className="pour-target" style={{left:`${pourTarget}%`}}><span>KEEP HERE</span></div><div className="pour-stream" style={{left:`${pour}%`}}/><div className="pour-cup">☕</div></div><div className="pour-stats"><span>ACCURACY <strong>{accuracy}%</strong></span><span>TIME <strong>{time.toFixed(1)}s</strong></span></div></div>}
      {stage==="result"&&<div className="arena-screen arena-center arena-result"><Sparkles size={32}/><small>BREW COMPLETE</small><h3>{title(total)}</h3><div className="final-score"><strong>{total}</strong><span>/ 1000</span></div><div className="score-breakdown"><div><span>GRIND</span><strong>{scores.grind}<small>/300</small></strong></div><div><span>PRESSURE</span><strong>{scores.pressure}<small>/350</small></strong></div><div><span>POUR</span><strong>{scores.pour}<small>/350</small></strong></div></div><div className="result-actions"><button className="brew-button" onClick={start}><RotateCcw size={17}/> BREW AGAIN</button><button className="brew-button share-score-button" onClick={shareScore}><Share2 size={17}/> SHARE SCORE ON X</button></div></div>}
    </div>
    <div className="practice-warning">{mode==="competitive"?"COMPETITIVE MODE · Wallet authenticated · Result requires server acceptance.":"PRACTICE MODE · No wallet, payment or rewards. Competitive scoring will be server-validated."}</div>
  </div>
}
