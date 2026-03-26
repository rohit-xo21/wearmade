import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Star, Users, Zap, Shield, Scissors, ArrowRight } from 'lucide-react';
import api from '../api/axios';

/* ─────────────────────────────────────────────
   Global styles — luxury atelier aesthetic
───────────────────────────────────────────── */
const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400;1,600&family=DM+Sans:wght@300;400;500&display=swap');

  :root {
    --tan:    #c8a97e;
    --tan-lt: #e8d5b7;
    --ink:    #1a1814;
    --warm:   #faf8f4;
    --muted:  #7a7570;
    --border: rgba(0,0,0,0.08);
  }

  .serif { font-family: 'Cormorant Garamond', Georgia, serif; }
  .sans  { font-family: 'DM Sans', sans-serif; }

  .noise-bg {
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
    background-repeat: repeat;
    background-size: 180px 180px;
  }

  /* Animations */
  @keyframes fadeUp   { from{opacity:0;transform:translateY(22px);}to{opacity:1;transform:translateY(0);} }
  @keyframes float    { 0%,100%{transform:translateY(0) rotate(0deg);}40%{transform:translateY(-9px) rotate(.4deg);}70%{transform:translateY(-4px) rotate(-.3deg);} }
  @keyframes spin-slow{ from{transform:rotate(0deg);}to{transform:rotate(360deg);} }
  @keyframes marquee  { from{transform:translateX(0);}to{transform:translateX(-50%);} }
  @keyframes bounce-y { 0%,100%{transform:translateY(0);}50%{transform:translateY(6px);} }

  .fu1{animation:fadeUp .65s .05s ease both;}
  .fu2{animation:fadeUp .65s .18s ease both;}
  .fu3{animation:fadeUp .65s .30s ease both;}
  .fu4{animation:fadeUp .65s .44s ease both;}
  .fu5{animation:fadeUp .65s .58s ease both;}

  /* HERO */
  .hero-wrap{ position:relative;overflow:hidden;background:var(--warm); }
  .hero-glow{ position:absolute;top:-140px;left:50%;transform:translateX(-50%);width:1000px;height:700px;background:radial-gradient(ellipse at center,rgba(200,169,126,.18) 0%,transparent 68%);pointer-events:none;z-index:0; }
  .hero-grid-lines{ position:absolute;inset:0;background-image:linear-gradient(rgba(0,0,0,.035) 1px,transparent 1px),linear-gradient(90deg,rgba(0,0,0,.035) 1px,transparent 1px);background-size:52px 52px;mask-image:radial-gradient(ellipse 75% 55% at 50% 40%,black 20%,transparent 80%);pointer-events:none;z-index:1; }
  .hero-stitch{ position:absolute;inset:0;background-image:repeating-linear-gradient(-45deg,transparent,transparent 28px,rgba(0,0,0,.011) 28px,rgba(0,0,0,.011) 29px);mask-image:radial-gradient(ellipse 100% 80% at 50% 50%,transparent 35%,black 100%);pointer-events:none;z-index:1; }
  .hero-circle{ position:absolute;border-radius:50%;border:1px solid rgba(0,0,0,.055);pointer-events:none;z-index:1; }
  .hero-noise-layer{ position:absolute;inset:0;opacity:.03;pointer-events:none;z-index:1; }
  .hero-content{ position:relative;z-index:3; }

  /* Float cards */
  .float-card{ position:absolute;border-radius:14px;background:rgba(255,255,255,.88);backdrop-filter:blur(12px);border:1px solid rgba(0,0,0,.07);box-shadow:0 6px 32px rgba(0,0,0,.07),0 1px 4px rgba(0,0,0,.04);z-index:4;padding:14px 16px;animation:float 7s ease-in-out infinite;display:none; }
  @media(min-width:1024px){ .float-card{display:block;} }

  /* Tape */
  .m-tape{ position:absolute;bottom:24px;left:50%;transform:translateX(-50%);opacity:.13;z-index:1;pointer-events:none;width:min(640px,82vw); }

  /* Scroll cue */
  .scroll-cue{ font-family:'DM Sans',sans-serif;font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:#b0aca6;display:flex;flex-direction:column;align-items:center;gap:6px;animation:bounce-y 2.6s ease-in-out infinite; }

  /* PROOF MARQUEE */
  .proof-strip{ overflow:hidden;white-space:nowrap; }
  .proof-inner{ display:inline-flex;animation:marquee 28s linear infinite; }
  .proof-inner:hover{ animation-play-state:paused; }
  .proof-item{ display:inline-flex;align-items:center;gap:12px;padding:0 36px;font-size:13px;font-weight:500;color:var(--muted);font-family:'DM Sans',sans-serif; }
  .proof-dot{ width:4px;height:4px;border-radius:50%;background:var(--tan);flex-shrink:0; }

  /* FEATURES */
  .feature-card{ background:#fff;border:1px solid var(--border);border-radius:16px;padding:32px 28px;position:relative;overflow:hidden;transition:transform .3s ease,box-shadow .3s ease; }
  .feature-card:hover{ transform:translateY(-4px);box-shadow:0 16px 48px rgba(0,0,0,.07); }
  .feature-card::before{ content:'';position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,var(--tan-lt),var(--tan),var(--tan-lt));opacity:0;transition:opacity .3s ease; }
  .feature-card:hover::before{ opacity:1; }
  .feat-icon-box{ width:44px;height:44px;border-radius:10px;display:flex;align-items:center;justify-content:center;margin-bottom:20px; }
  .feat-list{ list-style:none;padding:0;margin:0; }
  .feat-list li{ display:flex;gap:10px;font-size:13.5px;color:#5a5652;font-family:'DM Sans',sans-serif;line-height:1.6;padding:7px 0;border-bottom:1px solid rgba(0,0,0,.045); }
  .feat-list li:last-child{ border-bottom:none; }
  .feat-dash{ color:var(--tan);font-weight:600;flex-shrink:0;margin-top:1px; }
  .feat-step-num{ font-family:'Cormorant Garamond',Georgia,serif;font-size:100px;font-weight:300;line-height:1;color:rgba(0,0,0,.05);position:absolute;top:-20px;left:-8px;pointer-events:none;user-select:none; }

  /* HOW IT WORKS */
  .how-wrap{ background:var(--ink);color:#fff;position:relative;overflow:hidden; }
  .how-noise{ position:absolute;inset:0;opacity:.04;pointer-events:none; }
  .how-accent{ position:absolute;border-radius:50%;pointer-events:none;background:radial-gradient(circle,rgba(200,169,126,.15) 0%,transparent 70%); }
  .step-card{ position:relative;padding:36px 28px 28px;border:1px solid rgba(255,255,255,.08);border-radius:16px;background:rgba(255,255,255,.03);backdrop-filter:blur(4px);transition:border-color .3s ease,background .3s ease; }
  .step-card:hover{ border-color:rgba(200,169,126,.35);background:rgba(200,169,126,.05); }
  .step-num{ font-family:'Cormorant Garamond',Georgia,serif;font-size:72px;font-weight:300;line-height:1;color:rgba(255,255,255,.06);position:absolute;top:-12px;left:-8px;pointer-events:none;user-select:none; }

  /* TRUST */
  .trust-card{ flex:1;padding:40px 36px;display:flex;flex-direction:column;transition:background .3s ease; }
  .trust-card:hover{ background:var(--warm); }
  .trust-icon-ring{ width:52px;height:52px;border-radius:50%;border:1px solid var(--border);display:flex;align-items:center;justify-content:center;margin-bottom:20px;transition:border-color .3s ease,background .3s ease; }
  .trust-card:hover .trust-icon-ring{ border-color:var(--tan);background:rgba(200,169,126,.08); }

  /* CTA */
  .cta-wrap{ background:var(--ink);color:#fff;position:relative;overflow:hidden; }
  .cta-spin-ring{ position:absolute;border:1px solid rgba(200,169,126,.14);border-radius:50%;animation:spin-slow 30s linear infinite;pointer-events:none; }
  .cta-spin-ring-2{ animation-direction:reverse;animation-duration:48s; }
  .cta-glow{ position:absolute;border-radius:50%;pointer-events:none;background:radial-gradient(circle,rgba(200,169,126,.12) 0%,transparent 65%); }
  .cta-btn-primary{ display:inline-flex;align-items:center;justify-content:center;gap:8px;background:#fff;color:var(--ink);padding:14px 32px;border-radius:10px;font-size:14px;font-weight:500;font-family:'DM Sans',sans-serif;letter-spacing:.01em;transition:background .2s,transform .2s,box-shadow .2s;text-decoration:none; }
  .cta-btn-primary:hover{ background:#f0ece6;transform:translateY(-1px);box-shadow:0 8px 28px rgba(0,0,0,.2); }
  .cta-btn-secondary{ display:inline-flex;align-items:center;justify-content:center;gap:8px;background:transparent;color:rgba(255,255,255,.7);padding:14px 32px;border-radius:10px;font-size:14px;font-weight:400;font-family:'DM Sans',sans-serif;border:1px solid rgba(255,255,255,.18);transition:background .2s,color .2s,border-color .2s;text-decoration:none; }
  .cta-btn-secondary:hover{ background:rgba(255,255,255,.07);color:#fff;border-color:rgba(255,255,255,.35); }
`;

/* Measurement tape SVG */
const MeasureTape = () => (
  <svg className="m-tape" viewBox="0 0 640 36" xmlns="http://www.w3.org/2000/svg" fill="none">
    <rect x="0" y="8" width="640" height="20" rx="3" fill="#8a6c4a" opacity=".7"/>
    {Array.from({ length: 65 }, (_, i) => {
      const x = i * 10, isMajor = i % 5 === 0;
      return (
        <g key={i}>
          <line x1={x} y1={8} x2={x} y2={isMajor ? 28 : 22} stroke="rgba(255,255,255,.75)" strokeWidth={isMajor ? 1 : .6}/>
          {isMajor && i > 0 && <text x={x} y={7} textAnchor="middle" fontSize="5" fill="rgba(255,255,255,.65)">{i/5}</text>}
        </g>
      );
    })}
  </svg>
);

const SwatchDot = ({ color }) => (
  <span style={{ width:26,height:26,borderRadius:'50%',background:color,display:'inline-block',border:'1px solid rgba(0,0,0,.09)',flexShrink:0 }} />
);

/* ─────────────────────────────────────────────
   Main
───────────────────────────────────────────── */
const LandingPage = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('accessToken');

  useEffect(() => {
    if (token) fetchUser();
    else setLoading(false);
  }, [token]);

  const fetchUser = async () => {
    try {
      const res = await api.get('/auth/me');
      setUser(res.data.data);
    } catch {
      localStorage.removeItem('accessToken');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = () => {
    window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/google`;
  };

  const proofItems = ['Verified Tailors','Custom Measurements','Secure Payments','Order Tracking','In-app Messaging','Portfolio Showcase'];

  return (
    <div style={{ fontFamily:"'DM Sans', sans-serif", color:'#1a1814' }}>
      <style>{globalStyles}</style>

      {/* ══════════════════ HERO ══════════════════ */}
      <section className="hero-wrap" style={{ paddingTop:'6.5rem', paddingBottom:'8rem' }}>
        <div className="hero-glow" />
        <div className="hero-grid-lines" />
        <div className="hero-stitch" />
        <div className="hero-noise-layer noise-bg" />
        <div className="hero-circle" style={{ bottom:'-200px',left:'-130px',width:'520px',height:'520px' }} />
        <div className="hero-circle" style={{ bottom:'-240px',left:'-170px',width:'620px',height:'620px',opacity:.4 }} />
        <div className="hero-circle" style={{ top:'-110px',right:'-150px',width:'440px',height:'440px' }} />

        {/* Floating cards */}
        <div className="float-card" style={{ top:'17%',left:'5%',width:'156px',animationDelay:'0s' }}>
          <p style={{ fontSize:9,letterSpacing:'.12em',textTransform:'uppercase',color:'#aaa',marginBottom:10,fontFamily:"'DM Sans',sans-serif" }}>Fabric Swatches</p>
          {[['#1a1a2e','Midnight Wool'],['#c8a97e','Tan Linen'],['#4a5c6b','Slate Tweed']].map(([c,n]) => (
            <div key={n} style={{ display:'flex',alignItems:'center',gap:8,marginBottom:7 }}>
              <SwatchDot color={c}/><span style={{ fontSize:11,color:'#555',fontFamily:"'DM Sans',sans-serif" }}>{n}</span>
            </div>
          ))}
        </div>

        <div className="float-card" style={{ top:'25%',right:'5%',width:'162px',animationDelay:'-2.2s' }}>
          <p style={{ fontSize:9,letterSpacing:'.12em',textTransform:'uppercase',color:'#aaa',marginBottom:10,fontFamily:"'DM Sans',sans-serif" }}>Measurements</p>
          {[['Chest','96 cm'],['Waist','82 cm'],['Shoulder','44 cm'],['Inseam','78 cm']].map(([l,v]) => (
            <div key={l} style={{ display:'flex',justifyContent:'space-between',marginBottom:5 }}>
              <span style={{ fontSize:11,color:'#999' }}>{l}</span>
              <span style={{ fontSize:11,fontWeight:600,color:'#333',fontVariantNumeric:'tabular-nums' }}>{v}</span>
            </div>
          ))}
          <div style={{ marginTop:10,paddingTop:8,borderTop:'1px solid rgba(0,0,0,.06)',display:'flex',alignItems:'center',gap:5 }}>
            <div style={{ width:7,height:7,borderRadius:'50%',background:'#4ade80' }} />
            <span style={{ fontSize:10,color:'#999' }}>Profile complete</span>
          </div>
        </div>

        <div className="float-card" style={{ bottom:'18%',left:'7%',width:'148px',animationDelay:'-4.1s' }}>
          <p style={{ fontSize:9,letterSpacing:'.12em',textTransform:'uppercase',color:'#aaa',marginBottom:8 }}>Latest Order</p>
          <p style={{ fontSize:12,fontWeight:500,color:'#333',marginBottom:4 }}>Custom Suit · 3pc</p>
          <div style={{ display:'flex',gap:2,marginBottom:6 }}>
            {[1,2,3,4,5].map(i=><span key={i} style={{ color:'#e9a23b',fontSize:12 }}>★</span>)}
          </div>
          <span style={{ fontSize:10,background:'#f0fdf4',color:'#16a34a',borderRadius:4,padding:'2px 7px',fontWeight:500 }}>Delivered</span>
        </div>

        <MeasureTape />

        {/* Content */}
        <div className="hero-content" style={{ maxWidth:860,margin:'0 auto',textAlign:'center',padding:'0 24px' }}>
          <div className="fu1" style={{ marginBottom:24 }}>
            <span style={{ display:'inline-flex',alignItems:'center',gap:7,background:'rgba(255,255,255,.9)',border:'1px solid rgba(0,0,0,.09)',borderRadius:999,padding:'5px 16px',fontSize:10,fontWeight:500,color:'#7a6a56',letterSpacing:'.07em',textTransform:'uppercase',boxShadow:'0 1px 6px rgba(0,0,0,.06)' }}>
              <Scissors size={10} />Premium Tailoring Platform
            </span>
          </div>

          <h1 className="fu2 serif" style={{ fontSize:'clamp(3.2rem,8vw,5.4rem)',fontWeight:300,lineHeight:1.04,color:'#1a1814',marginBottom:20 }}>
            Bespoke tailoring,<br /><em style={{ color:'#c8a97e',fontStyle:'italic' }}>made simple.</em>
          </h1>

          <p className="fu3 serif" style={{ fontSize:'1.15rem',fontStyle:'italic',color:'#7a7570',maxWidth:460,margin:'0 auto 32px',lineHeight:1.7,fontWeight:300 }}>
            Connect with master tailors. Get perfectly fitted, custom clothing delivered to your door.
          </p>

          <div className="fu4" style={{ display:'flex',flexWrap:'wrap',gap:10,justifyContent:'center',marginBottom:20 }}>
            <Link to="/explore" style={{ display:'inline-flex',alignItems:'center',gap:8,background:'#1a1814',color:'#fff',padding:'13px 28px',borderRadius:10,fontSize:13.5,fontWeight:500,textDecoration:'none' }}>
              Explore Tailors <ChevronRight size={15} />
            </Link>
            {!loading && (user ? (
              <Link to={user.role==='customer'?'/customer/dashboard':'/tailor/dashboard'} style={{ display:'inline-flex',alignItems:'center',background:'rgba(255,255,255,.85)',border:'1px solid rgba(0,0,0,.1)',color:'#1a1814',padding:'13px 28px',borderRadius:10,fontSize:13.5,fontWeight:500,textDecoration:'none',backdropFilter:'blur(8px)' }}>
                Go to Dashboard
              </Link>
            ) : (
              <Link to="/register" style={{ display:'inline-flex',alignItems:'center',background:'rgba(255,255,255,.85)',border:'1px solid rgba(0,0,0,.1)',color:'#1a1814',padding:'13px 28px',borderRadius:10,fontSize:13.5,fontWeight:500,textDecoration:'none',backdropFilter:'blur(8px)' }}>
                Create account
              </Link>
            ))}
          </div>

          <div className="fu5">
            {!loading && !user && (
              <button onClick={handleGoogleAuth} style={{ background:'none',border:'none',fontSize:13,color:'#aaa',cursor:'pointer' }}>
                or continue with Google
              </button>
            )}
            {user && <p style={{ fontSize:13,color:'#9a958f' }}>Welcome back, <span style={{ fontWeight:500,color:'#1a1814' }}>{user.name}</span></p>}
            <div className="scroll-cue" style={{ marginTop:36 }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M7 1v12M3 9l4 4 4-4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Scroll
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════ PROOF MARQUEE ══════════════════ */}
      <div className="proof-strip" style={{ borderTop:'1px solid #e8e4de',borderBottom:'1px solid #e8e4de',background:'#fff',padding:'14px 0' }}>
        <div className="proof-inner">
          {[...proofItems,...proofItems,...proofItems,...proofItems].map((item,i) => (
            <span key={i} className="proof-item"><span className="proof-dot"/>{item}</span>
          ))}
        </div>
      </div>

      {/* ══════════════════ FEATURES ══════════════════ */}
      <section style={{ background:'var(--warm)',padding:'7rem 24px',position:'relative',overflow:'hidden' }}>
        {/* Side label */}
        <span style={{ position:'absolute',left:-22,top:'50%',transform:'translateY(-50%) rotate(-90deg)',fontFamily:"'Cormorant Garamond',Georgia,serif",fontSize:11,letterSpacing:'.22em',textTransform:'uppercase',color:'rgba(0,0,0,.12)',whiteSpace:'nowrap',pointerEvents:'none' }}>
          WearMade Platform
        </span>

        <div style={{ maxWidth:1040,margin:'0 auto' }}>
          <div style={{ marginBottom:'4.5rem',display:'flex',alignItems:'flex-end',justifyContent:'space-between',flexWrap:'wrap',gap:16 }}>
            <div>
              <p style={{ fontSize:11,letterSpacing:'.14em',textTransform:'uppercase',color:'#c8a97e',fontWeight:500,marginBottom:12 }}>The Platform</p>
              <h2 className="serif" style={{ fontSize:'clamp(2rem,4.5vw,3rem)',fontWeight:300,color:'#1a1814',lineHeight:1.1 }}>
                Why choose<br /><em style={{ fontStyle:'italic' }}>WearMade?</em>
              </h2>
            </div>
            <p style={{ fontSize:14,color:'#7a7570',maxWidth:320,lineHeight:1.7 }}>
              Everything you need — whether you're seeking a perfect fit or building a craft business.
            </p>
          </div>

          <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))',gap:20 }}>
            {/* Clients card */}
            <div className="feature-card">
              <div className="feat-step-num">01</div>
              <div className="feat-icon-box" style={{ background:'#1a1814' }}><Star size={18} color="#c8a97e" /></div>
              <h3 className="serif" style={{ fontSize:'1.4rem',fontWeight:400,color:'#1a1814',marginBottom:6 }}>For Clients</h3>
              <p style={{ fontSize:13,color:'#aaa',marginBottom:20,lineHeight:1.6 }}>Your measurements, your style, your wardrobe.</p>
              <ul className="feat-list">
                {['Clothing fitted to your exact measurements','Direct access to verified master tailors','Transparent pricing, no hidden fees','Secure payments & satisfaction guarantee'].map(item=>(
                  <li key={item}><span className="feat-dash">—</span>{item}</li>
                ))}
              </ul>
            </div>

            {/* Tailors card */}
            <div className="feature-card">
              <div className="feat-step-num">02</div>
              <div className="feat-icon-box" style={{ background:'#f5f1eb',border:'1px solid #e8e0d4' }}><Users size={18} color="#1a1814" /></div>
              <h3 className="serif" style={{ fontSize:'1.4rem',fontWeight:400,color:'#1a1814',marginBottom:6 }}>For Tailors</h3>
              <p style={{ fontSize:13,color:'#aaa',marginBottom:20,lineHeight:1.6 }}>Grow your craft. Reach the clients you deserve.</p>
              <ul className="feat-list">
                {['Steady stream of quality clients','Professional portfolio to showcase your craft','Simplified business management tools','Fair compensation with timely payouts'].map(item=>(
                  <li key={item}><span className="feat-dash">—</span>{item}</li>
                ))}
              </ul>
            </div>

            {/* Feature highlights card */}
            <div className="feature-card" style={{ background:'#1a1814',borderColor:'transparent' }}>
              <div style={{ marginBottom:28 }}>
                <p style={{ fontSize:10,letterSpacing:'.14em',textTransform:'uppercase',color:'rgba(200,169,126,.7)',marginBottom:8 }}>Core Features</p>
                <p className="serif" style={{ fontSize:'1.1rem',fontStyle:'italic',color:'rgba(255,255,255,.5)',fontWeight:300 }}>Everything in one workflow</p>
              </div>
              {[
                ['01', 'Tailor Discovery'],
                ['02', 'Measurement Profiles'],
                ['03', 'Real-time Chat'],
                ['04', 'Secure Checkout'],
              ].map(([num,label])=>(
                <div key={label} style={{ display:'flex',justifyContent:'space-between',alignItems:'baseline',padding:'10px 0',borderBottom:'1px solid rgba(255,255,255,.06)' }}>
                  <span className="serif" style={{ fontSize:'1.7rem',fontWeight:300,color:'#c8a97e' }}>{num}</span>
                  <span style={{ fontSize:12,color:'rgba(255,255,255,.55)' }}>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════ HOW IT WORKS ══════════════════ */}
      <section className="how-wrap" style={{ padding:'7rem 24px' }}>
        <div className="how-noise noise-bg" />
        <div className="how-accent" style={{ width:700,height:700,top:-200,right:-200 }} />
        <div className="how-accent" style={{ width:500,height:500,bottom:-150,left:-100 }} />

        <div style={{ maxWidth:1040,margin:'0 auto',position:'relative',zIndex:2 }}>
          <div style={{ textAlign:'center',marginBottom:'4.5rem' }}>
            <p style={{ fontSize:11,letterSpacing:'.14em',textTransform:'uppercase',color:'#c8a97e',fontWeight:500,marginBottom:12 }}>The Process</p>
            <h2 className="serif" style={{ fontSize:'clamp(2rem,4.5vw,3rem)',fontWeight:300,color:'#fff',lineHeight:1.1 }}>
              How it <em style={{ fontStyle:'italic',color:'#c8a97e' }}>works</em>
            </h2>
          </div>

          <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:16 }}>
            {[
              { n:'01',title:'Explore Tailors',desc:'Browse verified tailor profiles and portfolios to find your perfect craft match.' },
              { n:'02',title:'Share Measurements',desc:'Enter your precise measurements or book a virtual fitting session with your tailor.' },
              { n:'03',title:'Commission Your Piece',desc:'Describe your vision, pick fabrics, and place your order securely.' },
              { n:'04',title:'Receive & Enjoy',desc:'Your bespoke garment arrives perfectly crafted — or we make it right.' },
            ].map(({ n,title,desc })=>(
              <div key={n} className="step-card">
                <div className="step-num">{n}</div>
                <div style={{ width:36,height:36,borderRadius:8,background:'rgba(200,169,126,.12)',border:'1px solid rgba(200,169,126,.25)',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:20 }}>
                  <Scissors size={15} color="#c8a97e" />
                </div>
                <h3 style={{ fontSize:'1rem',fontWeight:500,color:'#fff',marginBottom:10 }}>{title}</h3>
                <p style={{ fontSize:13.5,color:'rgba(255,255,255,.45)',lineHeight:1.7 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════ TRUST ══════════════════ */}
      <section style={{ background:'#fff',padding:'5.5rem 24px',borderTop:'1px solid #e8e4de' }}>
        <div style={{ maxWidth:1040,margin:'0 auto' }}>
          <div style={{ textAlign:'center',marginBottom:'3.5rem' }}>
            <p style={{ fontSize:11,letterSpacing:'.14em',textTransform:'uppercase',color:'#c8a97e',fontWeight:500,marginBottom:12 }}>Our Promise</p>
            <h2 className="serif" style={{ fontSize:'clamp(1.8rem,3.5vw,2.5rem)',fontWeight:300,color:'#1a1814' }}>
              Built on <em style={{ fontStyle:'italic' }}>trust</em>
            </h2>
          </div>

          <div style={{ display:'flex',flexWrap:'wrap',border:'1px solid #e8e4de',borderRadius:20,overflow:'hidden' }}>
            {[
              { icon:Zap,   title:'Fast Delivery', desc:'Quality craftsmanship, on schedule every time. We track every order end-to-end.' },
              { icon:Shield,title:'Fully Secure',   desc:'Your payments and personal data are protected by bank-grade encryption.' },
              { icon:Star,  title:'Verified Pros',  desc:'Every tailor passes our rigorous vetting process before joining the network.' },
            ].map((item,i)=>{
              const Icon=item.icon;
              return (
                <div key={item.title} className="trust-card" style={{ borderRight: i<2?'1px solid #e8e4de':undefined }}>
                  <div className="trust-icon-ring"><Icon size={18} color="#1a1814" /></div>
                  <h4 style={{ fontSize:'1rem',fontWeight:500,color:'#1a1814',marginBottom:10 }}>{item.title}</h4>
                  <p style={{ fontSize:13.5,color:'#7a7570',lineHeight:1.7,flex:1 }}>{item.desc}</p>
                  <div style={{ marginTop:24 }}>
                    <Link to="/explore" style={{ fontSize:12,color:'#c8a97e',fontWeight:500,textDecoration:'none',letterSpacing:'.04em',display:'inline-flex',alignItems:'center',gap:5 }}>
                      Learn more <ArrowRight size={12} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════ CTA ══════════════════ */}
      <section className="cta-wrap" style={{ padding:'8rem 24px',textAlign:'center' }}>
        <div className="cta-spin-ring" style={{ width:600,height:600,top:'50%',left:'50%',transform:'translate(-50%,-50%)' }} />
        <div className="cta-spin-ring cta-spin-ring-2" style={{ width:420,height:420,top:'50%',left:'50%',transform:'translate(-50%,-50%)' }} />
        <div className="cta-glow" style={{ width:700,height:700,top:'50%',left:'50%',transform:'translate(-50%,-50%)' }} />

        <div style={{ position:'relative',zIndex:2,maxWidth:640,margin:'0 auto' }}>
          <p style={{ fontSize:11,letterSpacing:'.14em',textTransform:'uppercase',color:'#c8a97e',fontWeight:500,marginBottom:24 }}>
            {user?'Keep Going':'Get Started'}
          </p>
          <h2 className="serif" style={{ fontSize:'clamp(2.4rem,6vw,4rem)',fontWeight:300,color:'#fff',lineHeight:1.08,marginBottom:20 }}>
            {user?<>Keep <em style={{ fontStyle:'italic',color:'#c8a97e' }}>creating.</em></>:<>Ready to get <em style={{ fontStyle:'italic',color:'#c8a97e' }}>started?</em></>}
          </h2>
          <p style={{ fontSize:15,color:'rgba(255,255,255,.45)',marginBottom:40,lineHeight:1.7 }}>
            {user?'Explore new tailors and perfect your wardrobe today.':'Join WearMade and experience clothing made just for you.'}
          </p>
          <div style={{ display:'flex',flexWrap:'wrap',gap:12,justifyContent:'center' }}>
            {user?(
              <>
                <Link className="cta-btn-primary" to={user.role==='customer'?'/customer/new-order':'/tailor/requests'}>
                  {user.role==='customer'?'New Order':'View Requests'} <ArrowRight size={15}/>
                </Link>
                <Link className="cta-btn-secondary" to="/explore">Browse Tailors</Link>
              </>
            ):(
              <>
                <Link className="cta-btn-primary" to="/register">Create account <ArrowRight size={15}/></Link>
                <Link className="cta-btn-secondary" to="/explore">Explore portfolios</Link>
              </>
            )}
          </div>
          <div style={{ marginTop:56,display:'flex',alignItems:'center',gap:12,justifyContent:'center',opacity:.25 }}>
            <div style={{ flex:1,maxWidth:100,height:1,background:'linear-gradient(to right,transparent,rgba(200,169,126,.8))' }} />
            <Scissors size={12} color="#c8a97e" />
            <div style={{ flex:1,maxWidth:100,height:1,background:'linear-gradient(to left,transparent,rgba(200,169,126,.8))' }} />
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
    </div>
  );
};

export default LandingPage;