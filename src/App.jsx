// ================================================================
// PREM RAJ — 3D PORTFOLIO v3
// Orbital Photo Ring · Cinematic Horizontal Projects · GSAP + R3F
// ================================================================
import { useState, useEffect, useRef, useCallback, lazy, Suspense } from "react"
import { motion, useScroll, useTransform, useInView,
         AnimatePresence, useMotionValue, useSpring } from "framer-motion"
import { Github, Linkedin, Mail, MapPin, ExternalLink, Award,
         Trophy, ChevronDown, Menu, X, Check, ArrowUp, Download, Sparkles } from "lucide-react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

const HeroScene    = lazy(() => import("./three/HeroScene.jsx"))
const ProfileScene = lazy(() => import("./three/ProfileScene.jsx"))
const SkillsScene  = lazy(() => import("./three/SkillsScene.jsx"))

gsap.registerPlugin(ScrollTrigger)

// ──────────────────────── DATA ────────────────────────
const NAV = ["About","Skills","Projects","Experience","Certifications","Hackathons","Contact"]
const MQ1 = ["JavaScript","TypeScript","React.js","Redux Toolkit","Node.js","Express.js","FastAPI","Python","MongoDB","MySQL","Tailwind CSS"]
const MQ2 = ["REST APIs","JWT Auth","Gemini AI","LLMs","RAG","Cloudinary","Vercel","Render","Git","GitHub","VS Code","Postman"]

const SKILLS = [
  { icon:"💛", title:"Languages",      items:["JavaScript (ES6+)","TypeScript","C++","Java","Python"] },
  { icon:"⚛️", title:"Frontend",       items:["React.js","Redux Toolkit","HTML5","CSS3","Tailwind CSS","Bootstrap"] },
  { icon:"🟢", title:"Backend",        items:["Node.js","Express.js","FastAPI","REST APIs","MVC","Async Programming"] },
  { icon:"🗄️", title:"Databases",      items:["MongoDB","MongoDB Atlas","MySQL"] },
  { icon:"🤖", title:"AI & ML",        items:["Gemini AI","LLMs","RAG","Prompt Engineering","Multi-Agent Systems","API Orchestration"] },
  { icon:"🔐", title:"Security",       items:["JWT","Bcrypt","RBAC","Zoho Mail API","Nodemailer","Multer","Cloudinary"] },
  { icon:"🚀", title:"Deployment",     items:["Vercel","Render","cPanel","SSL/DNS (MX,SPF,DKIM)"] },
  { icon:"🛠️", title:"Tools",          items:["Git","GitHub","Postman","VS Code","GitHub Copilot","Agile/Scrum"] },
  { icon:"🧠", title:"Core CS",        items:["Data Structures","Algorithms","OOP","DBMS","Complexity Analysis"] },
]

const PROJECTS = [
  { num:"01", title:"Spotify Web Clone",          type:"Frontend",
    tech:["HTML5","CSS3","Vanilla JavaScript","DOM Manipulation"],
    desc:"A fully functional Spotify web player clone featuring music playback, playlist rendering, and responsive UI built with vanilla web technologies.",
    color:"#1DB954",
    imgs:["/photos/spotify-main.png","/photos/spotify-sub1.png","/photos/spotify-sub2.png"],
    live:"https://premrajsingh.github.io/spotify/", github:"https://github.com/premrajsingh/spotify" },
  { num:"02", title:"CRUD Application",           type:"Backend",
    tech:["Node.js","Express.js","MongoDB","Mongoose"],
    desc:"A complete RESTful CRUD application with persistent MongoDB storage, deployed on Render for robust cloud availability.",
    color:"#F59E0B",
    imgs:[],
    live:"https://crud-operation-4-56id.onrender.com", github:"https://github.com/premrajsingh/crud-operation" },
  { num:"03", title:"Studify Hub",                type:"Full Stack",
    tech:["HTML5","CSS3","JavaScript","LocalStorage"],
    desc:"Student productivity platform with integrated code editor, API tools, and workflow automation. Modular architecture reduced manual effort by 30%.",
    color:"#8B5CF6",
    imgs:["/photos/studify-main.png","/photos/studify-sub1.png","/photos/studify-sub2.png"],
    live:"https://premrajsingh.github.io/StudifyHub/", github:"https://github.com/premrajsingh/StudifyHub" },
  { num:"04", title:"Dasgupta Maiti Portal",      type:"MERN · Freelance",
    tech:["React","Node.js","Express","MongoDB","JWT Auth","Cloudinary","Nodemailer"],
    desc:"Secure enterprise portal for a Kolkata law firm — JWT/RBAC auth, Cloudinary media, Zoho Mail integration, full SSL + DNS production deploy.",
    color:"#EC4899",
    imgs:["/photos/dasgupta-main.png","/photos/dasgupta-sub1.png","/photos/dasgupta-sub2.png"],
    live:"https://dasguptamaitiassociates.com/", github:"https://github.com/premrajsingh/CAweb" },
  { num:"05", title:"Yashoda Bhawan System",      type:"Full Stack · Freelance",
    tech:["React","Node.js","MongoDB","Express","Tailwind CSS"],
    desc:"Hotel management system with admin dashboard for Jharkhand property. Optimised DB schema, REST APIs, performance-focused production deployment.",
    color:"#3B82F6",
    imgs:["/photos/yashoda-main.png","/photos/yashoda-sub1.png","/photos/yashoda-sub2.png"],
    live:"#", github:"#" },
  { num:"06", title:"Bank Statement Processor",   type:"Python · Automation",
    tech:["Python","Gmail API","Hashlib (SHA)","macOS launchd"],
    desc:"Background daemon that ingests Gmail attachments, classifies banks, SHA-deduplicates documents — slashing manual effort by 90–95%.",
    color:"#00D4FF",
    imgs:[],
    live:"#", github:"https://github.com/premrajsingh/Automated-Bank-Statement-Processing-System" },
  { num:"07", title:"AI Project Estimator",       type:"AI/ML · Full Stack",
    tech:["FastAPI","React","Gemini AI","MongoDB","Tailwind CSS"],
    desc:"Multi-agent AI system that analyses GitHub repos and generates architecture reports, cost & timeline estimates. Built Repo Intelligence for deep codebase analysis.",
    color:"#00FF94",
    imgs:["/photos/ai-estimator-main.png","/photos/ai-estimator-sub1.png","/photos/ai-estimator-sub2.png"],
    live:"#", github:"https://github.com/premrajsingh/AI-Project-Estimator" },
]

const CERTS = [
  { id:1, title:"Full Stack MERN Development", platform:"Course Platform", date:"2024", grad:"135deg,#667eea,#764ba2", link:"#" },
  { id:2, title:"Data Structures & Algorithms",platform:"Platform Name",   date:"2024", grad:"135deg,#00b4d8,#0077b6", link:"#" },
  { id:3, title:"Python Programming Mastery",  platform:"Platform Name",   date:"2023", grad:"135deg,#f093fb,#f5576c", link:"#" },
  { id:4, title:"National Service Scheme (NSS)",platform:"College Unit",   date:"2022-24", grad:"135deg,#4facfe,#00f2fe", link:"#" },
  { id:5, title:"Extra-Curricular Achievement",platform:"Event/College",   date:"2024", grad:"135deg,#43e97b,#38f9d7", link:"#" },
  { id:6, title:"Technical Workshop Cert",    platform:"College/Org",     date:"2024", grad:"135deg,#fa709a,#fee140", link:"#" },
]

const HACKS = [
  { icon:"🚀", medal:"#C0C0C0", title:"HACKHAZARDS '25", event:"The NAMESPACE Community", date:"April 2025", role:"Team CODESYNC", built:"Cutting-edge project", result:"Participant", img:"/photos/hackhazards-cert.png" },
  { icon:"🧠", medal:"#C0C0C0", title:"CreaTech 2026", event:"Larsen & Toubro Limited (L&T)", date:"2026", role:"Team visionx", built:"Aptitude Assessment", result:"Participant", img:"/photos/createch-cert.png" },
]

const DSA = ["Arrays","Trees","Recursion","Sliding Window","Greedy","Dynamic Programming","Linked Lists","Graphs","Heaps","Binary Search"]

// ──────────────────────── HOOKS ────────────────────────
function useTypewriter(words, speed=75, pause=2200) {
  const [txt,setTxt]=useState(""), [wi,setWi]=useState(0), [del,setDel]=useState(false)
  useEffect(()=>{
    const cur=words[wi]
    const t=setTimeout(()=>{
      if(!del){ if(txt.length<cur.length) setTxt(cur.slice(0,txt.length+1)); else setTimeout(()=>setDel(true),pause) }
      else { if(txt.length>0) setTxt(cur.slice(0,txt.length-1)); else{setDel(false);setWi(i=>(i+1)%words.length)} }
    }, del?speed/2:speed)
    return ()=>clearTimeout(t)
  },[txt,del,wi,words,speed,pause])
  return txt
}

// ──────────────────────── CURSOR ────────────────────────
function Cursor() {
  const [pos,setPos]=useState({x:-200,y:-200}), [hov,setHov]=useState(false), [clk,setClk]=useState(false)
  const rx=useSpring(-200,{damping:22,stiffness:260}), ry=useSpring(-200,{damping:22,stiffness:260})
  useEffect(()=>{
    const mv=e=>{setPos({x:e.clientX,y:e.clientY});rx.set(e.clientX);ry.set(e.clientY)}
    const mo=e=>setHov(!!e.target.closest("a,button,[data-h]"))
    const md=()=>setClk(true), mu=()=>setClk(false)
    window.addEventListener("mousemove",mv); window.addEventListener("mouseover",mo)
    window.addEventListener("mousedown",md); window.addEventListener("mouseup",mu)
    return()=>{ window.removeEventListener("mousemove",mv); window.removeEventListener("mouseover",mo)
      window.removeEventListener("mousedown",md); window.removeEventListener("mouseup",mu) }
  },[rx,ry])
  return(<>
    <motion.div className="fixed top-0 left-0 pointer-events-none rounded-full z-[9999]"
      animate={{x:pos.x-4,y:pos.y-4,scale:clk?0.4:hov?0:1}} transition={{type:"spring",damping:38,stiffness:520}}
      style={{width:8,height:8,background:"#00FF94",boxShadow:"0 0 14px #00FF94,0 0 28px rgba(0,255,148,0.4)"}}/>
    <motion.div className="fixed top-0 left-0 pointer-events-none rounded-full border z-[9998]"
      style={{x:rx,y:ry,width:40,height:40,marginLeft:-20,marginTop:-20,borderColor:"#00FF94",background:hov?"rgba(0,255,148,0.06)":"transparent"}}
      animate={{scale:clk?0.7:hov?2.2:1}} transition={{type:"spring",damping:18,stiffness:130}}/>
  </>)
}

function Trail() {
  const [pts,setPts]=useState([]), id=useRef(0)
  useEffect(()=>{
    const mv=e=>setPts(p=>[...p.slice(-6),{id:id.current++,x:e.clientX,y:e.clientY}])
    window.addEventListener("mousemove",mv); return()=>window.removeEventListener("mousemove",mv)
  },[])
  return(<div className="fixed inset-0 pointer-events-none z-[9997]">
    {pts.map(p=>(
      <motion.div key={p.id} initial={{opacity:0.55,scale:1}} animate={{opacity:0,scale:0}} transition={{duration:0.6}}
        className="absolute rounded-full" style={{left:p.x-3,top:p.y-3,width:6,height:6,background:"#00FF94",boxShadow:"0 0 6px #00FF94"}}/>
    ))}
  </div>)
}

function ProgressBar() {
  const {scrollYProgress}=useScroll()
  return <motion.div className="fixed top-0 left-0 right-0 h-[2px] origin-left z-[9996]"
    style={{scaleX:scrollYProgress,background:"linear-gradient(90deg,#00FF94,#00D4FF,#00FF94)"}}/>
}

// ──────────────────────── LOADER ────────────────────────
function Loader({onDone}) {
  useEffect(()=>{
    const tl=gsap.timeline({onComplete:onDone})
    tl.set(".ld-logo",{opacity:0,scale:0})
      .to(".ld-logo",{scale:1,opacity:1,duration:0.6,ease:"back.out(1.7)"})
      .to(".ld-line",{scaleX:1,duration:0.85,ease:"power3.out"})
      .to(".ld-bar",{scaleY:1,stagger:0.055,ease:"power2.out",duration:0.38},"-=0.4")
      .to(".ld-wrap",{opacity:0,duration:0.5,ease:"power2.in"},">+0.3")
  },[onDone])
  return(<motion.div className="ld-wrap fixed inset-0 z-[10000] flex flex-col items-center justify-center"
    style={{background:"#000"}} exit={{opacity:0}}>
    <div className="absolute inset-0 pointer-events-none"
      style={{backgroundImage:"repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,255,148,0.04) 3px,rgba(0,255,148,0.04) 4px)"}}/>
    {[0,1,2].map(i=>(
      <motion.div key={i} className="absolute rounded-full border border-[#00FF94]/10"
        initial={{width:40,height:40,opacity:0.7}} animate={{width:500,height:500,opacity:0}}
        transition={{duration:2.2,delay:i*0.55,repeat:Infinity,ease:"easeOut"}}/>
    ))}
    <div className="ld-logo text-center z-10">
      <div className="font-mono text-7xl font-black tracking-tighter mb-5"
        style={{color:"#00FF94",textShadow:"0 0 60px rgba(0,255,148,0.9),0 0 120px rgba(0,255,148,0.4)"}}>
        {"<PR/>"}
      </div>
      <div className="ld-line h-px w-72 mx-auto origin-left"
        style={{background:"linear-gradient(90deg,transparent,#00FF94,transparent)",transform:"scaleX(0)"}}/>
    </div>
    <div className="flex items-end gap-1.5 mt-10" style={{height:44}}>
      {Array.from({length:20}).map((_,i)=>(
        <span key={i} className="ld-bar inline-block w-1.5 rounded-sm"
          style={{height:`${18+Math.random()*22}px`,background:"#00FF94",transform:"scaleY(0)",transformOrigin:"bottom",opacity:0.5+Math.random()*0.5}}/>
      ))}
    </div>
    <div className="font-mono text-xs mt-4" style={{color:"rgba(0,255,148,0.4)"}}>LOADING...</div>
  </motion.div>)
}

// ──────────────────────── NAV ────────────────────────
function Nav() {
  const [scrolled,setScrolled]=useState(false), [open,setOpen]=useState(false)
  useEffect(()=>{ const fn=()=>setScrolled(window.scrollY>50); window.addEventListener("scroll",fn,{passive:true}); return()=>window.removeEventListener("scroll",fn) },[])
  return(<motion.nav initial={{y:-80,opacity:0}} animate={{y:0,opacity:1}} transition={{delay:0.3,duration:0.7}}
    className="fixed top-0 left-0 right-0 z-50"
    style={{background:scrolled?"rgba(8,8,8,0.94)":"transparent",backdropFilter:scrolled?"blur(24px)":"none",
      borderBottom:scrolled?"1px solid rgba(0,255,148,0.07)":"none",
      padding:scrolled?"12px 0":"22px 0",transition:"all 0.4s ease"}}>
    <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
      <a href="#" data-h className="font-mono text-lg font-black tracking-tighter">
        <span style={{color:"#00FF94"}}>{"<"}</span>PR
        <motion.span animate={{opacity:[1,0,1]}} transition={{duration:1,repeat:Infinity}} style={{color:"#00FF94"}}>_</motion.span>
        <span style={{color:"#00FF94"}}>{"/>"}</span>
      </a>
      <ul className="hidden md:flex items-center gap-0.5">
        {NAV.map(l=>(
          <li key={l}><a href={`#${l.toLowerCase()}`} data-h
            className="relative px-4 py-2 text-sm font-medium text-gray-400 hover:text-white transition-colors group block">
            {l}<span className="absolute bottom-0 left-4 right-4 h-px scale-x-0 group-hover:scale-x-100 transition-transform origin-left" style={{background:"#00FF94"}}/>
          </a></li>
        ))}
      </ul>
      <button onClick={()=>setOpen(!open)} data-h
        className="md:hidden w-10 h-10 rounded-full flex items-center justify-center"
        style={{border:"1px solid rgba(0,255,148,0.22)",color:"#00FF94"}}>
        <AnimatePresence mode="wait">
          <motion.div key={open?"x":"m"} initial={{rotate:-90,opacity:0}} animate={{rotate:0,opacity:1}} exit={{rotate:90,opacity:0}} transition={{duration:0.16}}>
            {open?<X size={18}/>:<Menu size={18}/>}
          </motion.div>
        </AnimatePresence>
      </button>
    </div>
    <AnimatePresence>
      {open&&(<motion.div initial={{height:0,opacity:0}} animate={{height:"auto",opacity:1}} exit={{height:0,opacity:0}}
        className="md:hidden overflow-hidden" style={{background:"rgba(8,8,8,0.98)",borderTop:"1px solid rgba(0,255,148,0.07)"}}>
        <ul className="px-6 py-6 space-y-3">
          {NAV.map((l,i)=>(
            <motion.li key={l} initial={{x:-20,opacity:0}} animate={{x:0,opacity:1}} transition={{delay:i*0.04}}>
              <a href={`#${l.toLowerCase()}`} onClick={()=>setOpen(false)} data-h className="block py-1.5 text-gray-300 font-medium">
                <span className="font-mono text-xs mr-3" style={{color:"#00FF94"}}>0{i+1}.</span>{l}
              </a>
            </motion.li>
          ))}
        </ul>
      </motion.div>)}
    </AnimatePresence>
  </motion.nav>)
}

// ──────────────────────── HERO ────────────────────────
function Hero() {
  const roles=["Full Stack Developer","AI/ML Enthusiast","Problem Solver","Freelancer","Open Source Contributor"]
  const role=useTypewriter(roles,72,2200)
  const [mx,setMx]=useState(0), [my,setMy]=useState(0)
  const heroRef=useRef()

  const handleMM=useCallback(e=>{
    const r=heroRef.current?.getBoundingClientRect(); if(!r) return
    setMx(((e.clientX-r.left)/r.width)*2-1); setMy(((e.clientY-r.top)/r.height)*2-1)
  },[])

  return(
    <section ref={heroRef} className="relative min-h-screen overflow-hidden flex flex-col"
      onMouseMove={handleMM} onMouseLeave={()=>{setMx(0);setMy(0)}}>
      {/* Grid */}
      <div className="absolute inset-0 pointer-events-none"
        style={{backgroundImage:"linear-gradient(rgba(0,255,148,0.026) 1px,transparent 1px),linear-gradient(90deg,rgba(0,255,148,0.026) 1px,transparent 1px)",backgroundSize:"68px 68px"}}/>
      {/* 3D Canvas — right 60% receives pointer events */}
      <div className="absolute inset-0" style={{pointerEvents:"none"}}>
        <div className="absolute inset-0" style={{left:"38%", pointerEvents:"auto"}}>
          <Suspense fallback={null}><HeroScene mouseX={mx} mouseY={my}/></Suspense>
        </div>
      </div>
      {/* Left gradient to make text readable */}
      <div className="absolute inset-0 pointer-events-none"
        style={{background:"linear-gradient(90deg,rgba(8,8,8,1) 0%,rgba(8,8,8,0.97) 28%,rgba(8,8,8,0.88) 45%,rgba(8,8,8,0.35) 62%,transparent 78%)"}}/>
      {/* Bottom gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
        style={{background:"linear-gradient(to top,#080808,transparent)"}}/>

      <div className="relative z-10 flex flex-col min-h-screen px-6 pt-28 pb-10 pointer-events-none">
        <div className="w-full flex-1 flex flex-col justify-center pointer-events-auto" style={{maxWidth:420}}>
          <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.1}}
            className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full mb-8 w-fit"
            style={{border:"1px solid rgba(0,255,148,0.28)",background:"rgba(0,255,148,0.04)"}}>
            <motion.span animate={{scale:[1,1.7,1],opacity:[1,0.3,1]}} transition={{duration:1.5,repeat:Infinity}}
              className="w-2 h-2 rounded-full flex-shrink-0" style={{background:"#00FF94",boxShadow:"0 0 10px #00FF94"}}/>
            <span className="text-sm font-semibold" style={{color:"#00FF94"}}>Available for Opportunities</span>
          </motion.div>

          <div className="mb-3">
            <motion.h1 initial={{y:80,opacity:0}} animate={{y:0,opacity:1}} transition={{delay:0.1,duration:0.9,ease:[0.22,1,0.36,1]}}
              className="font-black uppercase leading-none tracking-tight"
              style={{fontSize:"clamp(2.5rem,5.5vw,5rem)",background:"linear-gradient(180deg,#FFFFFF 0%,#A0A0A0 100%)",
                WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text",lineHeight:"0.9"}}>
              PREM<br/>RAJ
            </motion.h1>
          </div>

          <motion.div initial={{y:20,opacity:0}} animate={{y:0,opacity:1}} transition={{delay:0.35,duration:0.6}} className="font-mono text-xl md:text-2xl text-gray-400 mb-5 flex items-center h-8">
            <span style={{color:"#00FF94"}}>{">"}&nbsp;</span><span>{role}</span>
            <motion.span animate={{opacity:[1,0,1]}} transition={{duration:0.75,repeat:Infinity}} style={{color:"#00FF94"}}>|</motion.span>
          </motion.div>

          <motion.p initial={{y:18,opacity:0}} animate={{y:0,opacity:1}} transition={{delay:0.5,duration:0.55}} className="text-gray-300 text-base md:text-lg mb-8 max-w-md leading-relaxed">
            IT undergrad @ GGSIPU Delhi · 250+ DSA problems · Building AI-powered apps that&nbsp;
            <span style={{color:"#00FF94"}}>actually matter</span>
          </motion.p>

          <motion.div initial={{y:16,opacity:0}} animate={{y:0,opacity:1}} transition={{delay:0.62,duration:0.5}} className="flex flex-wrap gap-3 mb-8">
            <a href="#projects" data-h className="h-btn px-7 py-3 rounded-full font-bold text-sm text-black"
              style={{background:"linear-gradient(135deg,#00FF94,#00D4FF)",boxShadow:"0 0 30px rgba(0,255,148,0.28)"}}>
              View Work →
            </a>
            <a href="/Prem_Raj_Resume.pdf" download data-h className="h-btn flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold transition-all"
              style={{border:"1px solid rgba(0,255,148,0.28)",color:"#00FF94"}}
              onMouseEnter={e=>{e.currentTarget.style.background="rgba(0,255,148,0.07)"}}
              onMouseLeave={e=>{e.currentTarget.style.background="transparent"}}>
              <Download size={14}/>Resume
            </a>
            <div className="flex gap-2 h-btn">
              {[{I:Github,h:"https://github.com/premrajsingh"},{I:Linkedin,h:"https://linkedin.com/in/prem-raj"},{I:Mail,h:"mailto:singhpremraj264@gmail.com"}].map(({I,h},k)=>(
                <a key={k} href={h} target="_blank" rel="noreferrer" data-h
                  className="w-11 h-11 rounded-full flex items-center justify-center transition-all"
                  style={{border:"1px solid rgba(0,255,148,0.2)",color:"#00FF94"}}
                  onMouseEnter={e=>{e.currentTarget.style.background="#00FF94";e.currentTarget.style.color="#000"}}
                  onMouseLeave={e=>{e.currentTarget.style.background="transparent";e.currentTarget.style.color="#00FF94"}}>
                  <I size={15}/>
                </a>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.78}} className="flex flex-wrap gap-2.5">
            {[{v:"250+",l:"DSA Problems"},{v:"5+",l:"Projects"},{v:"2",l:"Clients"},{v:"8.0",l:"CGPA"},{v:"3+",l:"Yrs Coding"}].map((s,i)=>(
              <span key={i} className="h-chip flex items-center gap-2 px-4 py-2 rounded-full text-sm"
                style={{background:"rgba(14,14,14,0.9)",border:"1px solid rgba(0,255,148,0.1)"}}>
                <strong className="font-mono" style={{color:"#00FF94"}}>{s.v}</strong>
                <span className="text-gray-400 text-xs">{s.l}</span>
              </span>
            ))}
          </motion.div>

          <div className="flex items-center gap-1.5 mt-5">
            <MapPin size={12} style={{color:"#00FF94"}}/>
            <span className="text-gray-500 text-xs">Delhi, India</span>
          </div>
        </div>
      </div>

      <motion.div animate={{y:[0,9,0]}} transition={{duration:1.9,repeat:Infinity}}
        className="absolute bottom-5 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 z-10"
        style={{color:"rgba(0,255,148,0.4)"}}>
        <span className="font-mono text-[9px] tracking-[0.35em]">SCROLL</span>
        <ChevronDown size={14}/>
      </motion.div>
    </section>
  )
}

// ──────────────────────── MARQUEE ────────────────────────
function MTag({t}) {
  return(<div className="flex items-center gap-2.5 px-5 py-2 rounded-full mx-2 flex-shrink-0"
    style={{border:"1px solid rgba(0,255,148,0.12)",background:"rgba(0,255,148,0.024)"}}>
    <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{background:"#00FF94"}}/>
    <span className="text-gray-400 text-sm font-medium whitespace-nowrap">{t}</span>
  </div>)
}
function Marquee() {
  return(<section className="py-12 overflow-hidden" style={{borderTop:"1px solid rgba(255,255,255,0.03)",borderBottom:"1px solid rgba(255,255,255,0.03)"}}>
    <div className="mb-3" style={{maskImage:"linear-gradient(90deg,transparent,black 8%,black 92%,transparent)"}}>
      <div style={{display:"flex",animation:"marquee-l 26s linear infinite",width:"max-content"}}>
        {[...MQ1,...MQ1,...MQ1].map((t,i)=><MTag key={i} t={t}/>)}
      </div>
    </div>
    <div style={{maskImage:"linear-gradient(90deg,transparent,black 8%,black 92%,transparent)"}}>
      <div style={{display:"flex",animation:"marquee-r 20s linear infinite",width:"max-content"}}>
        {[...MQ2,...MQ2,...MQ2].map((t,i)=><MTag key={i} t={t}/>)}
      </div>
    </div>
  </section>)
}

// ──────────────────────── ABOUT ────────────────────────
function About() {
  const ref=useRef(), inView=useInView(ref,{once:true,margin:"-80px"})
  const bio="I'm Prem Raj, a 3rd-year IT student at GGSIPU Delhi genuinely obsessed with building things that work beautifully. From AI-powered estimators to full-stack freelance systems — I turn complex problems into clean, scalable solutions. When I'm not coding, I'm exploring mountains or grinding LeetCode at 2am."
  const tl=[{y:"2023",l:"Started B.Tech IT",p:"GGSIPU, New Delhi"},{y:"Jun 2025",l:"Frontend Dev Intern",p:"Coding Bits"},{y:"Nov 2025",l:"Freelance Full-Stack Dev",p:"2 Clients · MERN Stack"},{y:"2026",l:"Building AI Products",p:"Currently"}]
  return(<section id="about" className="py-28 px-6" style={{borderTop:"1px solid rgba(0,255,148,0.05)"}}>
    <div ref={ref} className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
      <div>
        <motion.p initial={{opacity:0,x:-18}} animate={inView?{opacity:1,x:0}:{}} className="font-mono text-sm mb-3" style={{color:"#00FF94"}}>// about.me</motion.p>
        <motion.h2 initial={{opacity:0,y:30}} animate={inView?{opacity:1,y:0}:{}} transition={{delay:0.08}}
          className="font-black mb-8 leading-none" style={{fontSize:"clamp(2.2rem,6vw,5rem)"}}>Who Am I?</motion.h2>
        <p className="text-gray-400 text-lg leading-relaxed mb-12">
          {bio.split(" ").map((w,i)=>(
            <motion.span key={i} initial={{opacity:0,y:8}} animate={inView?{opacity:1,y:0}:{}}
              transition={{delay:0.15+i*0.012,duration:0.38}} className="inline-block mr-1.5">{w}</motion.span>
          ))}
        </p>
        <div className="relative pl-8" style={{borderLeft:"1px solid rgba(0,255,148,0.14)"}}>
          {tl.map((t,i)=>(
            <motion.div key={i} initial={{opacity:0,x:-22}} animate={inView?{opacity:1,x:0}:{}} transition={{delay:0.5+i*0.12}} className="relative mb-8 last:mb-0">
              <span className="absolute rounded-full" style={{left:-34,top:5,width:14,height:14,background:"#080808",border:"2px solid #00FF94",boxShadow:"0 0 14px rgba(0,255,148,0.7)"}}/>
              <div className="font-mono text-xs mb-0.5" style={{color:"#00FF94"}}>{t.y}</div>
              <div className="font-bold text-white">{t.l}</div>
              <div className="text-gray-500 text-sm">{t.p}</div>
            </motion.div>
          ))}
        </div>
      </div>
      <div className="flex flex-col items-center gap-7">
        <div className="relative group flex items-center justify-center w-full h-[360px] md:h-[400px]">
          {/* Animated blurred aura behind */}
          <motion.div animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 m-auto w-64 h-64 rounded-full blur-[80px]" style={{ background: "#00FF94" }} />
          
          {/* Main Photo Container */}
          <motion.div whileHover={{ scale: 1.05, rotate: -2 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="relative z-10 w-64 h-80 rounded-[2rem] overflow-hidden shadow-2xl"
            style={{ border: "2px solid rgba(0,255,148,0.3)", boxShadow: "0 20px 50px -10px rgba(0,255,148,0.3)" }}>
            <img src="/photos/hero.jpg" alt="Prem Raj" className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-110" />
            
            {/* Glassmorphism gradient overlay */}
            <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 40%)" }}/>
          </motion.div>

          {/* Floating badges */}
          <motion.div animate={{ y: [-10, 10, -10] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute z-20 -right-4 top-20 px-4 py-2 rounded-2xl backdrop-blur-md font-bold text-xs"
            style={{ background: "rgba(10,10,10,0.8)", border: "1px solid rgba(0,255,148,0.3)", color: "#00FF94" }}>
            MERN Stack
          </motion.div>
          
          <motion.div animate={{ y: [10, -10, 10] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="absolute z-20 -left-6 bottom-24 px-4 py-2 rounded-2xl backdrop-blur-md font-bold text-xs"
            style={{ background: "rgba(10,10,10,0.8)", border: "1px solid rgba(0,212,255,0.3)", color: "#00D4FF" }}>
            AI Integrations
          </motion.div>
        </div>
        <div className="flex flex-wrap gap-3 justify-center">
          {[["📍","Delhi, India"],["🎓","GGSIPU · 8.0 CGPA"],["💼","2 Clients"],["⚡","Open to Work"]].map(([ic,tx],i)=>(
            <motion.span key={i} initial={{opacity:0,scale:0.8}} animate={inView?{opacity:1,scale:1}:{}} transition={{delay:0.6+i*0.07}}
              className="px-4 py-2 rounded-full text-sm font-medium"
              style={{background:"rgba(14,14,14,0.9)",border:"1px solid rgba(0,255,148,0.1)",color:"#d0d0d0"}}>
              {ic} {tx}
            </motion.span>
          ))}
        </div>
        <motion.a href="/Prem_Raj_Resume.pdf" download data-h initial={{opacity:0}} animate={inView?{opacity:1}:{}} transition={{delay:0.85}}
          className="flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold transition-all"
          style={{border:"1px solid rgba(0,255,148,0.25)",color:"#00FF94"}}
          onMouseEnter={e=>{e.currentTarget.style.background="rgba(0,255,148,0.07)"}}
          onMouseLeave={e=>{e.currentTarget.style.background="transparent"}}>
          <Download size={15}/>Download Resume
        </motion.a>
      </div>
    </div>
  </section>)
}

// ──────────────────────── SKILLS ────────────────────────
function Skills() {
  const ref=useRef(), inView=useInView(ref,{once:true,margin:"-80px"})
  const prof=[{name:"JavaScript / React",v:90,c:"#F7DF1E"},{name:"Node.js / Express",v:82,c:"#339933"},{name:"Python / FastAPI",v:75,c:"#3776AB"},{name:"C++",v:70,c:"#00599C"},{name:"MongoDB / MySQL",v:80,c:"#47A248"}]
  return(<section id="skills" className="py-28 px-6 relative overflow-hidden" style={{borderTop:"1px solid rgba(0,255,148,0.05)"}}>
    <div className="absolute inset-0 pointer-events-none opacity-[0.14]"
      style={{backgroundImage:"radial-gradient(circle,rgba(0,255,148,0.35) 1px,transparent 1px)",backgroundSize:"30px 30px"}}/>
    <div className="absolute inset-0 pointer-events-none opacity-50">
      <Suspense fallback={null}><SkillsScene/></Suspense>
    </div>
    <div ref={ref} className="max-w-7xl mx-auto relative z-10">
      <motion.p initial={{opacity:0}} animate={inView?{opacity:1}:{}} className="font-mono text-sm mb-3" style={{color:"#00FF94"}}>// skills.json</motion.p>
      <motion.h2 initial={{opacity:0,y:28}} animate={inView?{opacity:1,y:0}:{}} transition={{delay:0.08}}
        className="font-black mb-14 leading-none" style={{fontSize:"clamp(2.2rem,6vw,5rem)"}}>
        Tech Stack<motion.span animate={{opacity:[1,0,1]}} transition={{duration:0.8,repeat:Infinity}} style={{color:"#00FF94"}}>_</motion.span>
      </motion.h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-14">
        {SKILLS.map((cat,i)=>(
          <motion.div key={cat.title} initial={{opacity:0,y:26}} animate={inView?{opacity:1,y:0}:{}} transition={{delay:i*0.06}}
            whileHover={{y:-6,transition:{duration:0.2}}}
            className="p-6 rounded-2xl transition-colors"
            style={{background:"rgba(10,10,10,0.88)",border:"1px solid rgba(0,255,148,0.08)",backdropFilter:"blur(12px)"}}
            onMouseEnter={e=>e.currentTarget.style.borderColor="rgba(0,255,148,0.28)"}
            onMouseLeave={e=>e.currentTarget.style.borderColor="rgba(0,255,148,0.08)"}>
            <div className="flex items-center gap-3 mb-5"><span className="text-2xl">{cat.icon}</span><h3 className="font-bold text-white">{cat.title}</h3></div>
            <div className="flex flex-wrap gap-2">
              {cat.items.map(item=>(
                <span key={item} className="skill-pill px-3 py-1 rounded-full text-xs font-medium text-gray-400"
                  style={{background:"#080808",border:"1px solid rgba(0,255,148,0.1)"}}>{item}</span>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
      <div className="grid lg:grid-cols-2 gap-8">
        <div className="p-8 rounded-2xl" style={{background:"rgba(10,10,10,0.9)",border:"1px solid rgba(0,255,148,0.08)"}}>
          <h3 className="text-lg font-bold mb-7 text-white">Proficiency</h3>
          <div className="space-y-5">
            {prof.map((p,i)=>(
              <div key={p.name}>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-300 font-medium">{p.name}</span>
                  <span className="font-mono font-bold" style={{color:p.c}}>{p.v}%</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{background:"rgba(255,255,255,0.05)"}}>
                  <motion.div initial={{width:0}} animate={inView?{width:`${p.v}%`}:{}}
                    transition={{delay:0.3+i*0.1,duration:1.4,ease:"easeOut"}}
                    className="h-full rounded-full" style={{background:`linear-gradient(90deg,${p.c},#00D4FF)`}}/>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="p-8 rounded-2xl flex flex-col" style={{background:"rgba(10,10,10,0.9)",border:"1px solid rgba(0,255,148,0.08)"}}>
          <h3 className="text-lg font-bold mb-5 text-white">DSA Progress</h3>
          <div className="flex-1 flex flex-col items-center justify-center text-center py-4">
            <div className="text-7xl font-black font-mono mb-2"
              style={{background:"linear-gradient(135deg,#00FF94,#00D4FF)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>250+</div>
            <p className="text-gray-500 text-sm mb-5">Problems Solved</p>
            <div className="flex flex-wrap gap-2 justify-center mb-5">
              {DSA.map(t=><span key={t} className="px-3 py-1 rounded-full text-xs" style={{background:"#080808",border:"1px solid rgba(0,255,148,0.1)",color:"#aaa"}}>{t}</span>)}
            </div>
            <div className="flex gap-3 w-full">
              <div className="flex-1 p-3 rounded-xl text-center" style={{background:"rgba(249,115,22,0.07)",border:"1px solid rgba(249,115,22,0.18)"}}>
                <div className="text-orange-400 font-bold text-sm">LeetCode</div>
                <div className="text-white font-mono text-2xl font-bold">200+</div>
              </div>
              <div className="flex-1 p-3 rounded-xl text-center" style={{background:"rgba(34,197,94,0.07)",border:"1px solid rgba(34,197,94,0.18)"}}>
                <div className="text-green-400 font-bold text-sm">HackerRank</div>
                <div className="text-white font-mono text-2xl font-bold">50+</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>)
}

// ──────────────────────── PROJECTS — EXPANDABLE GALLERY ────────────────────────
function Projects() {
  const [activeProject, setActiveProject] = useState(null)
  const [cols, setCols] = useState(2)
  const ref = useRef()
  const inView = useInView(ref, { once: true, margin: "-80px" })

  // Lock body scroll when modal is open
  useEffect(() => {
    if (activeProject) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "auto"
    }
  }, [activeProject])

  return (
    <section id="projects" className="py-32 px-6 relative" style={{ borderTop:"1px solid rgba(0,255,148,0.05)", background: "#000" }}>
      {/* Background decoration */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 pointer-events-none opacity-[0.12]" 
           style={{ background: "radial-gradient(ellipse at top, #00FF94, transparent 70%)" }} />
           
      <div ref={ref} className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-20 flex flex-col items-center">
          <motion.p initial={{opacity:0}} animate={inView?{opacity:1}:{}} className="font-mono text-sm mb-4 tracking-widest uppercase" style={{color:"#00FF94"}}>
            // project.gallery
          </motion.p>
          <motion.h2 initial={{opacity:0,y:30}} animate={inView?{opacity:1,y:0}:{}} transition={{delay:0.1, duration:0.7}}
            className="font-black leading-none"
            style={{fontSize:"clamp(3rem,9vw,6rem)", background:"linear-gradient(180deg,#FFFFFF 0%,#808080 100%)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent"}}>
            Selected Work
          </motion.h2>
          <motion.p initial={{opacity:0}} animate={inView?{opacity:1}:{}} transition={{delay:0.2}} className="mt-6 text-gray-400 max-w-2xl text-base md:text-lg">
            Explore my entire arsenal of projects at a glance. Click on any card to reveal in-depth architectures, tech stacks, and live previews.
          </motion.p>
        </div>

        {/* View Toggle Controls */}
        <motion.div initial={{opacity:0, y:10}} animate={inView?{opacity:1, y:0}:{}} transition={{delay:0.3}} className="flex justify-center mb-12">
          <div className="flex bg-[#0a0a0a] border border-white/10 p-1.5 rounded-full items-center">
             <span className="text-gray-500 text-xs font-mono uppercase tracking-widest px-4 hidden sm:block">Columns:</span>
             {[2, 3, 4].map(num => (
               <button
                 key={num}
                 onClick={() => setCols(num)}
                 className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${cols === num ? 'bg-[#00FF94] text-black shadow-[0_0_15px_rgba(0,255,148,0.4)]' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
               >
                 {num}
               </button>
             ))}
          </div>
        </motion.div>

        {/* Grid View (All visible at once) */}
        <div className={`grid gap-6 md:gap-8 transition-all duration-500 ${
          cols === 2 ? "grid-cols-1 md:grid-cols-2" :
          cols === 3 ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" :
          "grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4"
        }`}>
          {PROJECTS.map((p, i) => (
            <motion.div
              layoutId={`card-${p.num}`}
              key={p.num}
              onClick={() => setActiveProject(p)}
              initial={{ opacity: 0, y: 50 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.08, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ scale: 1.02, y: -8 }}
              className="group cursor-pointer rounded-3xl overflow-hidden bg-[#080808] border border-white/5 relative flex flex-col h-[400px] shadow-2xl"
            >
              {/* Image Box */}
              <motion.div layoutId={`image-${p.num}`} className="h-[65%] w-full relative overflow-hidden bg-[#0d0d0d]">
                {p.imgs && p.imgs.length > 0 ? (
                  <img src={p.imgs[0]} alt={p.title} className="w-full h-full object-cover opacity-80 group-hover:scale-110 group-hover:opacity-100 transition-all duration-700" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-black text-6xl opacity-10" style={{color: p.color}}>{p.num}</div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-[#080808]/40 to-transparent opacity-90" />
                
                {/* Floating Tag */}
                <div className="absolute top-5 left-5">
                  <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-md"
                    style={{ background: "rgba(0,0,0,0.6)", color: "#fff", border: `1px solid ${p.color}40` }}>
                    {p.type}
                  </span>
                </div>
              </motion.div>
              
              {/* Content Summary */}
              <div className="p-6 flex flex-col flex-1 relative z-10 -mt-8">
                 <div className="flex justify-between items-end mb-3">
                   <motion.h3 layoutId={`title-${p.num}`} className="text-xl md:text-2xl font-black text-white group-hover:text-[#00FF94] transition-colors">{p.title}</motion.h3>
                   <span className="font-mono text-sm text-gray-600">{p.num}</span>
                 </div>
                 
                 <p className="text-gray-400 text-xs line-clamp-2 mb-4 flex-1">
                   {p.desc}
                 </p>
                 
                 <motion.div layoutId={`tech-${p.num}`} className="flex flex-wrap gap-2">
                   {p.tech.slice(0, 3).map(t => (
                     <span key={t} className="px-2 py-1 rounded-md text-[10px] font-bold" style={{ background: "rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", color: "#aaa" }}>{t}</span>
                   ))}
                   {p.tech.length > 3 && <span className="px-2 py-1 rounded-md text-[10px] font-bold text-gray-500">+{p.tech.length - 3}</span>}
                 </motion.div>
              </div>
            </motion.div>
          ))}
        </div>
        
        <motion.div initial={{opacity:0, y:20}} whileInView={{opacity:1, y:0}} viewport={{once:true}} className="mt-16 flex justify-center">
          <a href="https://github.com/premrajsingh" target="_blank" rel="noreferrer" data-h 
            className="flex items-center gap-3 px-8 py-4 rounded-full font-bold text-sm transition-all hover:scale-105 hover:bg-[#00FF94] hover:text-black"
            style={{ border: "1px solid rgba(0,255,148,0.3)", color: "#00FF94" }}>
            Explore GitHub Profile <ArrowUp size={16} className="rotate-45" />
          </a>
        </motion.div>
      </div>

      {/* Expanded Modal View */}
      <AnimatePresence>
        {activeProject && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveProject(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-xl z-[100]"
            />
            <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 md:p-8 pointer-events-none">
              <motion.div
                layoutId={`card-${activeProject.num}`}
                className="w-full max-w-6xl h-[90vh] md:h-[85vh] rounded-[2rem] bg-[#0a0a0a] border border-white/10 overflow-hidden flex flex-col md:flex-row pointer-events-auto shadow-[0_0_80px_rgba(0,0,0,0.8)] relative"
              >
                 {/* Close Button */}
                 <button onClick={() => setActiveProject(null)} className="absolute top-6 right-6 z-50 w-12 h-12 rounded-full bg-black/50 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all hover:rotate-90">
                   <X size={24} />
                 </button>

                 {/* Left: Image Box */}
                 <motion.div layoutId={`image-${activeProject.num}`} className="w-full md:w-[55%] h-[40%] md:h-full relative bg-[#050505]">
                    {activeProject.imgs && activeProject.imgs.length > 0 ? (
                      <img src={activeProject.imgs[0]} alt={activeProject.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-black text-9xl opacity-10" style={{color: activeProject.color}}>{activeProject.num}</div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-[#0a0a0a] via-transparent to-transparent opacity-90" />
                    
                    <div className="absolute bottom-6 left-6 flex gap-2">
                       {activeProject.imgs.map((src, idx) => (
                         <div key={idx} className="w-16 h-12 rounded-lg border border-white/20 overflow-hidden opacity-70 hover:opacity-100 transition-opacity cursor-pointer">
                           <img src={src} className="w-full h-full object-cover" />
                         </div>
                       ))}
                    </div>
                 </motion.div>
                 
                 {/* Right: Detailed Content */}
                 <div className="w-full md:w-[45%] h-[60%] md:h-full p-8 md:p-12 flex flex-col overflow-y-auto bg-[#0a0a0a]">
                    <div className="flex items-center gap-3 mb-6">
                      <span className="font-mono text-sm font-bold px-3 py-1 rounded-full"
                        style={{ background: `${activeProject.color}15`, color: activeProject.color, border: `1px solid ${activeProject.color}35` }}>
                        {activeProject.type}
                      </span>
                      <span className="font-mono text-xl opacity-20 font-black">{activeProject.num}</span>
                    </div>

                    <motion.h3 layoutId={`title-${activeProject.num}`} className="text-4xl md:text-5xl font-black text-white mb-6 leading-tight">
                      {activeProject.title}
                    </motion.h3>
                    
                    <motion.div layoutId={`tech-${activeProject.num}`} className="flex flex-wrap gap-2 mb-8">
                      {activeProject.tech.map(t => (
                        <span key={t} className="px-3 py-1.5 rounded-lg text-xs font-bold" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#e0e0e0" }}>{t}</span>
                      ))}
                    </motion.div>
                    
                    <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.2}} className="flex-1">
                      <h4 className="text-white font-bold mb-3">About the Project</h4>
                      <p className="text-gray-400 text-sm md:text-base leading-relaxed mb-8">
                        {activeProject.desc}
                      </p>
                    </motion.div>
                    
                    <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{delay:0.3}} className="flex gap-4 mt-auto pt-6 border-t border-white/10">
                      <a href={activeProject.live} target="_blank" rel="noreferrer" data-h
                        className="flex-1 flex items-center justify-center gap-2 py-4 rounded-xl font-black text-black text-sm transition-transform hover:scale-105"
                        style={{ background: activeProject.color, boxShadow: `0 10px 40px -10px ${activeProject.color}80` }}>
                        Live Preview <ExternalLink size={18}/>
                      </a>
                      <a href={activeProject.github} target="_blank" rel="noreferrer" data-h
                        className="w-14 h-14 flex items-center justify-center rounded-xl transition-all hover:scale-105 shrink-0"
                        style={{ border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)", color: "#fff" }}
                        onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.15)"}
                        onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}>
                        <Github size={22}/>
                      </a>
                    </motion.div>
                 </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </section>
  )
}

// ──────────────────────── EXPERIENCE ────────────────────────
function Experience() {
  const items=[
    {role:"Frontend Developer Intern",company:"Coding Bits",period:"June 2025 – July 2025",badge:"Internship",c:"#00FF94",
     pts:["Developed reusable React components, improving scalability","Optimized performance & cross-browser compatibility","Collaborated in Agile environment with code reviews"]},
    {role:"Freelance Full-Stack Developer",company:"Self-Employed",period:"Nov 2025 – Jan 2026",badge:"Freelance",c:"#00D4FF",
     pts:["Dasgupta Maiti & Associates (Kolkata) — MERN, JWT, Zoho Mail API, Cloudinary, SSL+DNS production deploy","Yashoda Bhawan (Jharkhand) — Hotel system, admin dashboard, optimised DB schema, production deployment"]},
  ]
  return(<section id="experience" className="py-24 px-6" style={{borderTop:"1px solid rgba(0,255,148,0.05)"}}>
    <div className="max-w-4xl mx-auto">
      <p className="font-mono text-sm mb-3" style={{color:"#00FF94"}}>// career.log</p>
      <h2 className="font-black mb-12 leading-none" style={{fontSize:"clamp(2.2rem,6vw,4.5rem)"}}>Experience</h2>
      <div className="relative border-l border-gray-800 ml-3 md:ml-0 md:border-none space-y-8">
        {items.map((it,i)=>(
          <motion.div key={i} initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{duration:0.5}}
            className="relative pl-8 md:pl-0 md:grid md:grid-cols-[200px_1fr] gap-8 items-start group">
            <div className="md:hidden absolute left-[-4.5px] top-2 w-2 h-2 rounded-full" style={{background:it.c,boxShadow:`0 0 8px ${it.c}`}}/>
            <div className="mb-2 md:mb-0 mt-1.5">
              <p className="font-mono text-sm text-gray-500">{it.period}</p>
            </div>
            <div className="p-7 rounded-2xl transition-all" style={{background:"rgba(10,10,10,0.8)",border:"1px solid rgba(0,255,148,0.08)"}}
              onMouseEnter={e=>e.currentTarget.style.borderColor=`${it.c}40`}
              onMouseLeave={e=>e.currentTarget.style.borderColor="rgba(0,255,148,0.08)"}>
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <h3 className="text-xl font-bold text-white">{it.role}</h3>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold" style={{color:it.c,background:`${it.c}12`,border:`1px solid ${it.c}30`}}>{it.badge}</span>
              </div>
              <p className="text-gray-400 font-medium mb-5">{it.company}</p>
              <ul className="space-y-3">
                {it.pts.map((pt,k)=>(
                  <li key={k} className="flex gap-3 text-sm text-gray-400 leading-relaxed">
                    <span className="flex-shrink-0 mt-0.5" style={{color:it.c}}>▹</span><span>{pt}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>)
}

// ──────────────────────── CERTIFICATIONS ────────────────────────
function CertCard({c,i}) {
  return(<motion.div initial={{opacity:0,y:28}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:i*0.07}}
    className="group relative rounded-2xl p-6 transition-all duration-300 hover:-translate-y-2" 
    style={{background:"rgba(14,14,14,0.6)", border:"1px solid rgba(0,255,148,0.1)", backdropFilter:"blur(12px)"}}>
    <div className="absolute inset-0 rounded-2xl transition-opacity duration-300 opacity-0 group-hover:opacity-10" 
      style={{background:`linear-gradient(${c.grad})`}}></div>
    
    <div className="relative z-10 flex flex-col h-full">
      <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110" 
        style={{background:`linear-gradient(${c.grad})`}}>
        <Award size={24} className="text-white"/>
      </div>
      
      <h3 className="text-white font-bold mb-1 group-hover:text-[#00FF94] transition-colors">{c.title}</h3>
      <p className="text-gray-400 text-sm mb-4">{c.platform}</p>
      
      <div className="mt-auto flex items-center justify-between">
        <span className="text-gray-600 font-mono text-xs">{c.date}</span>
        <a href={c.link} target="_blank" rel="noreferrer"
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold text-black transition-all hover:scale-105 active:scale-95"
          style={{background:"#00FF94"}}>
          <ExternalLink size={12}/> View Link
        </a>
      </div>
    </div>
  </motion.div>)
}
function Certifications() {
  return(<section id="certifications" className="py-28 px-6" style={{borderTop:"1px solid rgba(0,255,148,0.05)"}}>
    <div className="max-w-7xl mx-auto">
      <p className="font-mono text-sm mb-3" style={{color:"#00FF94"}}>// credentials.verify</p>
      <h2 className="font-black mb-3 leading-none" style={{fontSize:"clamp(2.2rem,6vw,5rem)"}}>Certifications</h2>
      <p className="text-gray-600 text-sm font-mono mb-12">// Coursework & Extra-Curricular achievements</p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {CERTS.map((c,i)=><CertCard key={c.id} c={c} i={i}/>)}
      </div>
    </div>
  </section>)
}

// ──────────────────────── HACKATHONS ────────────────────────
function Hackathons() {
  return(<section id="hackathons" className="py-28 px-6 relative overflow-hidden" style={{borderTop:"1px solid rgba(0,255,148,0.05)"}}>
    <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-[0.06]">
      {Array.from({length:20}).map((_,i)=>(
        <motion.div key={i} className="absolute font-mono text-[10px]" style={{left:`${(i*5)%100}%`,top:-60,color:"#00FF94"}}
          animate={{y:["0vh","120vh"]}} transition={{duration:7+(i%4),repeat:Infinity,delay:i*0.32,ease:"linear"}}>
          {Array.from({length:14}).map((_,j)=><div key={j}>{Math.random()>0.5?"1":"0"}</div>)}
        </motion.div>
      ))}
    </div>
    <div className="max-w-7xl mx-auto relative">
      <p className="font-mono text-sm mb-3" style={{color:"#00FF94"}}>// hackathons.log</p>
      <h2 className="font-black mb-12 leading-none" style={{fontSize:"clamp(2.2rem,6vw,5rem)"}}>Hackathon Arena 🏆</h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {HACKS.map((h,i)=>(
          <motion.div key={i} initial={{opacity:0,y:80}} whileInView={{opacity:1,y:0}} viewport={{once:true}}
            transition={{delay:i*0.13,type:"spring",bounce:0.42}} whileHover={{y:-8,transition:{duration:0.22}}}
            className="p-6 rounded-2xl" style={{background:"rgba(0,255,148,0.024)",backdropFilter:"blur(10px)",border:"1px solid rgba(0,255,148,0.14)"}}>
            <div className="text-5xl mb-4">{h.icon}</div>
            <h3 className="text-xl font-bold mb-3 text-white">{h.title}</h3>
            {[["Event",h.event],["Date",h.date],["Role",h.role],["Built",h.built]].map(([k,v])=>(
              <p key={k} className="text-sm text-gray-400 mb-1.5"><span style={{color:"#00FF94"}}>{k}:</span> {v}</p>
            ))}
            <div className="flex items-center justify-between mt-4">
              <span className="inline-block px-3 py-1.5 rounded-full text-xs font-bold"
                style={{background:"rgba(0,255,148,0.1)",border:"1px solid rgba(0,255,148,0.3)",color:"#00FF94"}}>{h.result}</span>
              <Trophy size={22} style={{color:h.medal,filter:`drop-shadow(0 0 7px ${h.medal})`}}/>
            </div>
            {h.img ? (
              <div className="mt-4 h-40 rounded-xl overflow-hidden border border-[rgba(0,255,148,0.2)] bg-black/40">
                <img src={h.img} alt={h.title} className="w-full h-full object-contain p-2 transition-transform duration-300 hover:scale-105" />
              </div>
            ) : (
              <div className="mt-4 h-28 rounded-xl flex items-center justify-center"
                style={{background:"linear-gradient(135deg,rgba(0,255,148,0.06),rgba(0,212,255,0.06))",border:"1px dashed rgba(0,255,148,0.1)"}}>
                <span className="text-gray-600 text-xs font-mono">[ Certificate Image ]</span>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  </section>)
}

// ──────────────────────── CONTACT ────────────────────────
function MagBtn({children,onClick,style:s,className}) {
  const ref=useRef()
  const x=useMotionValue(0),y=useMotionValue(0)
  const sx=useSpring(x,{damping:13,stiffness:190}),sy=useSpring(y,{damping:13,stiffness:190})
  const mv=e=>{const r=ref.current?.getBoundingClientRect();if(!r)return;x.set((e.clientX-r.left-r.width/2)*0.32);y.set((e.clientY-r.top-r.height/2)*0.32)}
  return(<motion.button ref={ref} onMouseMove={mv} onMouseLeave={()=>{x.set(0);y.set(0)}}
    style={{x:sx,y:sy,...s}} onClick={onClick} className={className} data-h>{children}</motion.button>)
}
function Contact() {
  const [copied,setCopied]=useState(false)
  const cp=()=>{navigator.clipboard.writeText("singhpremraj264@gmail.com");setCopied(true);setTimeout(()=>setCopied(false),2200)}
  const lines=["Let's Build","Something","Amazing."]
  return(<section id="contact" className="relative py-28 px-6 overflow-hidden min-h-screen flex items-center" style={{borderTop:"1px solid rgba(0,255,148,0.05)"}}>
    <motion.div animate={{x:[0,90,0],y:[0,45,0]}} transition={{duration:14,repeat:Infinity,ease:"easeInOut"}}
      className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full pointer-events-none"
      style={{background:"radial-gradient(circle,rgba(0,255,148,0.11) 0%,transparent 70%)",filter:"blur(80px)"}}/>
    <motion.div animate={{x:[0,-80,0],y:[0,-45,0]}} transition={{duration:16,repeat:Infinity,ease:"easeInOut"}}
      className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full pointer-events-none"
      style={{background:"radial-gradient(circle,rgba(0,212,255,0.09) 0%,transparent 70%)",filter:"blur(70px)"}}/>
    <div className="max-w-3xl mx-auto text-center relative z-10 w-full">
      <h2 className="font-black leading-none mb-10" style={{fontSize:"clamp(2.5rem,7vw,5.5rem)"}}>
        {lines.map((line,li)=>(
          <motion.div key={li} initial={{y:40,opacity:0}} whileInView={{y:0,opacity:1}} viewport={{once:true}}
            transition={{delay:li*0.15,duration:0.6,ease:"easeOut"}}
            style={{background:"linear-gradient(135deg,#00FF94,#00D4FF)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>
            {line}
          </motion.div>
        ))}
      </h2>
      <motion.p initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}}
        className="text-gray-400 text-lg mb-10 max-w-xl mx-auto">
        Open to internships, full-time roles, freelance projects, and cool collabs.
      </motion.p>
      <motion.div initial={{opacity:0,scale:0.8}} whileInView={{opacity:1,scale:1}} viewport={{once:true}} className="flex justify-center mb-14">
        <MagBtn onClick={()=>window.location.href="mailto:singhpremraj264@gmail.com"}
          className="px-10 py-4 rounded-full text-lg font-bold text-black flex items-center gap-2 transition-transform hover:scale-105"
          style={{background:"linear-gradient(135deg,#00FF94,#00D4FF)",boxShadow:"0 0 55px rgba(0,255,148,0.35)"}}>
          <Sparkles size={18}/>Send a Message
        </MagBtn>
      </motion.div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {icon:copied?<Check size={22}/>:<Mail size={22}/>,label:copied?"Copied!":"singhpremraj264@gmail.com",onClick:cp},
          {icon:<Linkedin size={22}/>,label:"linkedin/prem-raj",href:"https://linkedin.com/in/prem-raj"},
          {icon:<Github size={22}/>,label:"github/premrajsingh",href:"https://github.com/premrajsingh"},
          {icon:<MapPin size={22}/>,label:"Delhi, India"},
        ].map((c,i)=>{
          const cls="p-5 rounded-2xl flex flex-col items-center gap-2.5 transition-all",sty={background:"rgba(14,14,14,0.9)",border:"1px solid rgba(0,255,148,0.1)"}
          const hi=e=>{e.currentTarget.style.borderColor="rgba(0,255,148,0.4)"},ho=e=>{e.currentTarget.style.borderColor="rgba(0,255,148,0.1)"}
          return c.href?(
            <a key={i} href={c.href} target="_blank" rel="noreferrer" data-h className={cls} style={sty} onMouseEnter={hi} onMouseLeave={ho}>
              <div style={{color:"#00FF94"}}>{c.icon}</div><span className="text-xs text-gray-400 break-all text-center">{c.label}</span>
            </a>
          ):(
            <button key={i} onClick={c.onClick} data-h className={cls} style={sty} onMouseEnter={hi} onMouseLeave={ho}>
              <div style={{color:"#00FF94"}}>{c.icon}</div><span className="text-xs text-gray-400 break-all text-center">{c.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  </section>)
}

function Footer() {
  return(<footer className="py-7 px-6" style={{borderTop:"1px solid rgba(0,255,148,0.07)"}}>
    <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-4 items-center text-sm text-gray-600">
      <p>© 2026 Prem Raj · Built with ☕ + late nights</p>
      <p className="text-center hidden md:block">React · R3F · GSAP · Framer Motion · Three.js</p>
      <div className="flex gap-4 md:justify-end">
        {[{I:Github,h:"https://github.com/premrajsingh"},{I:Linkedin,h:"https://linkedin.com/in/prem-raj"},{I:Mail,h:"mailto:singhpremraj264@gmail.com"}].map(({I,h},k)=>(
          <a key={k} href={h} target="_blank" rel="noreferrer" data-h className="transition-colors hover:text-[#00FF94]"><I size={16}/></a>
        ))}
      </div>
    </div>
  </footer>)
}

function BackToTop() {
  const [show,setShow]=useState(false)
  useEffect(()=>{const fn=()=>setShow(window.scrollY>window.innerHeight*0.55);window.addEventListener("scroll",fn,{passive:true});return()=>window.removeEventListener("scroll",fn)},[])
  return(<AnimatePresence>
    {show&&(<motion.button initial={{opacity:0,scale:0}} animate={{opacity:1,scale:1}} exit={{opacity:0,scale:0}}
      onClick={()=>window.scrollTo({top:0,behavior:"smooth"})} data-h
      className="fixed bottom-8 right-8 w-12 h-12 rounded-full flex items-center justify-center text-black z-40"
      style={{background:"linear-gradient(135deg,#00FF94,#00D4FF)",boxShadow:"0 0 30px rgba(0,255,148,0.55)"}}>
      <ArrowUp size={20}/>
    </motion.button>)}
  </AnimatePresence>)
}

function EasterEgg() {
  const [show,setShow]=useState(false),[conf,setConf]=useState([])
  useEffect(()=>{
    let buf=""
    const fn=e=>{
      buf=(buf+e.key.toLowerCase()).slice(-4)
      if(buf==="hire"){
        setShow(true)
        setConf(Array.from({length:80},(_,i)=>({id:i+Date.now(),x:Math.random()*window.innerWidth,c:["#00FF94","#00D4FF","#fff","#FFD700","#FF6B6B"][i%5]})))
        setTimeout(()=>{setShow(false);setConf([])},4000)
      }
    }
    window.addEventListener("keydown",fn); return()=>window.removeEventListener("keydown",fn)
  },[])
  return(<>
    <AnimatePresence>
      {show&&(<motion.div initial={{y:100,opacity:0}} animate={{y:0,opacity:1}} exit={{y:80,opacity:0}}
        className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[9000] px-8 py-4 rounded-full text-black font-black text-base whitespace-nowrap"
        style={{background:"linear-gradient(135deg,#00FF94,#00D4FF)",boxShadow:"0 10px 55px rgba(0,255,148,0.6)"}}>
        🎉 Great choice! Let's build something amazing!
      </motion.div>)}
    </AnimatePresence>
    <div className="fixed inset-0 pointer-events-none z-[8999]">
      {conf.map(c=>(
        <motion.div key={c.id} initial={{y:-30,x:c.x,opacity:1,rotate:0,scale:1}}
          animate={{y:window.innerHeight+60,rotate:720,opacity:0,scale:0.3}} transition={{duration:3,ease:"easeIn"}}
          className="absolute w-3 h-3 rounded-sm" style={{background:c.c,boxShadow:`0 0 8px ${c.c}`}}/>
      ))}
    </div>
  </>)
}

// ──────────────────────── SHOOTING STARS ────────────────────────
function ShootingStars() {
  const [stars, setStars] = useState([])
  useEffect(() => {
    setStars(Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 120}%`,
      top: `${Math.random() * -30}%`,
      delay: Math.random() * 12,
      duration: 1.5 + Math.random() * 3,
      size: 0.5 + Math.random() * 1.5
    })))
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none z-[0] overflow-hidden">
      {stars.map((s) => (
        <div key={s.id} className="shooting-star"
          style={{
            left: s.left, top: s.top,
            animationDelay: `${s.delay}s`,
            animationDuration: `${s.duration}s`,
            transform: `scale(${s.size})`
          }}>
          <div className="star-inner">
            <div className="star-tail" />
            <div className="star-head" />
          </div>
        </div>
      ))}
      <style>{`
        .shooting-star {
          position: absolute;
          animation: falling-star linear infinite;
          opacity: 0;
        }
        .star-inner {
          position: relative;
          transform: rotate(135deg);
        }
        .star-head {
          position: absolute;
          top: -2px; left: -2px;
          width: 4px; height: 4px; background: #fff; border-radius: 50%;
          box-shadow: 0 0 15px 3px rgba(0, 255, 148, 0.9);
        }
        .star-tail {
          position: absolute;
          top: -1px; left: -150px;
          width: 150px; height: 2px;
          background: linear-gradient(90deg, transparent, rgba(0,255,148,0.8), #fff);
        }
        @keyframes falling-star {
          0% { transform: translate3d(0, 0, 0); opacity: 0; }
          5% { opacity: 1; }
          15% { opacity: 0; }
          100% { transform: translate3d(-1500px, 1500px, 0); opacity: 0; }
        }
      `}</style>
    </div>
  )
}

// ──────────────────────── APP ────────────────────────
export default function App() {
  const [loading,setLoading]=useState(true)
  useEffect(()=>{
    if(loading) return
    return()=>ScrollTrigger.getAll().forEach(t=>t.kill())
  },[loading])
  return(<>
    <AnimatePresence>{loading&&<Loader onDone={()=>setLoading(false)}/>}</AnimatePresence>
    {!loading&&(<>
      <ShootingStars/><Cursor/><Trail/><ProgressBar/><Nav/>
      <main>
        <Hero/><Marquee/><About/><Skills/><Projects/>
        <Experience/><Certifications/><Hackathons/><Contact/>
      </main>
      <Footer/><BackToTop/><EasterEgg/>
    </>)}
  </>)
}
