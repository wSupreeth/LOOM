'use client';

import { useState, useEffect, useRef } from 'react';

type ContentIdea = {
  id: string;
  type: string;
  label: string;
  title: string;
  preview: string;
  icon: string;
  readTime: string;
  platform: string;
};

type ContentDraft = {
  type: string;
  label: string;
  title: string;
  fullContent: string;
  wordCount: number;
};

type Step = 'input' | 'ideas' | 'draft' | 'optimized';

const FORMATS = [
  { type: 'LinkedIn Post', label: 'LI', icon: '↗', readTime: '2 min read', platform: 'LinkedIn' },
  { type: 'Blog Article', label: 'BL', icon: '✦', readTime: '8 min read', platform: 'Medium / Blog' },
  { type: 'Video Script', label: 'VS', icon: '▶', readTime: '5 min video', platform: 'YouTube' },
  { type: 'Newsletter', label: 'NL', icon: '◈', readTime: '4 min read', platform: 'Substack / Email' },
  { type: 'Twitter Thread', label: 'TW', icon: '◎', readTime: '3 min thread', platform: 'X / Twitter' },
];

const LoomLogo = ({ size = 32 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <line x1="6" y1="9" x2="26" y2="9" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.4"/>
    <line x1="6" y1="16" x2="26" y2="16" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.9"/>
    <line x1="6" y1="23" x2="26" y2="23" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.4"/>
    <line x1="12" y1="5" x2="12" y2="27" stroke="#14b8a6" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.7"/>
    <line x1="20" y1="5" x2="20" y2="27" stroke="#14b8a6" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.4"/>
    <circle cx="12" cy="16" r="2" fill="#14b8a6"/>
    <circle cx="20" cy="9" r="1.2" fill="white" fillOpacity="0.6"/>
    <circle cx="20" cy="23" r="1.2" fill="white" fillOpacity="0.6"/>
  </svg>
);

// Sound effects helper
const playSound = (type: 'click' | 'success' | 'whoosh') => {
  if (typeof window === 'undefined') return;
  const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  
  if (type === 'click') {
    osc.frequency.value = 800;
    gain.gain.setValueAtTime(0.05, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
    osc.start();
    osc.stop(ctx.currentTime + 0.1);
  } else if (type === 'success') {
    osc.frequency.value = 600;
    osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.15);
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  } else if (type === 'whoosh') {
    osc.type = 'sine';
    osc.frequency.value = 200;
    osc.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.3);
    gain.gain.setValueAtTime(0.04, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  }
};

// Onboarding Modal
const OnboardingModal = ({ onClose }: { onClose: () => void }) => {
  const [slide, setSlide] = useState(0);
  const slides = [
    {
      icon: '◐',
      title: 'Welcome to LOOM',
      desc: 'A content pipeline that turns any topic into 5 platform-ready content formats. Let me show you how it works.',
    },
    {
      icon: '1',
      title: 'Enter your topic',
      desc: 'Type any subject, idea, or theme. LOOM analyzes it and prepares formats tailored to different platforms.',
    },
    {
      icon: '2',
      title: 'Pick your format',
      desc: 'Choose from LinkedIn posts, blogs, video scripts, newsletters, or Twitter threads. Each comes with a unique angle.',
    },
    {
      icon: '3',
      title: 'Get your draft',
      desc: 'Fully written content delivered in seconds. Copy it, optimize it further, or start fresh with a new topic.',
    },
  ];

  const next = () => {
    playSound('click');
    if (slide < slides.length - 1) setSlide(slide + 1);
    else onClose();
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)',
      zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
      animation: 'fadeIn 0.4s ease',
    }}>
      <div style={{
        maxWidth: 480, width: '100%', background: 'rgba(15,15,15,0.95)',
        border: '1px solid rgba(20,184,166,0.2)', borderRadius: 20, padding: '40px 32px',
        position: 'relative', boxShadow: '0 20px 80px rgba(20,184,166,0.15)',
      }}>
        <button onClick={onClose} style={{
          position: 'absolute', top: 16, right: 16, background: 'transparent',
          border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '4px 10px',
          fontSize: 11, color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontFamily: 'inherit',
        }}>Skip ✕</button>

        <div style={{
          width: 64, height: 64, margin: '0 auto 24px',
          background: 'rgba(20,184,166,0.1)', border: '1.5px solid rgba(20,184,166,0.3)',
          borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 28, color: '#14b8a6', fontWeight: 700,
        }}>{slides[slide].icon}</div>

        <h2 style={{
          fontSize: 24, fontWeight: 800, color: '#fff', textAlign: 'center',
          marginBottom: 12, letterSpacing: '-0.02em',
        }}>{slides[slide].title}</h2>

        <p style={{
          fontSize: 14, color: 'rgba(255,255,255,0.55)', textAlign: 'center',
          lineHeight: 1.7, marginBottom: 32,
        }}>{slides[slide].desc}</p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 24 }}>
          {slides.map((_, i) => (
            <div key={i} style={{
              width: i === slide ? 20 : 6, height: 6, borderRadius: 3,
              background: i === slide ? '#14b8a6' : 'rgba(255,255,255,0.15)',
              transition: 'all 0.3s ease',
            }} />
          ))}
        </div>

        <button onClick={next} style={{
          width: '100%', background: 'linear-gradient(135deg, #14b8a6, #0d9488)',
          border: 'none', borderRadius: 12, padding: '14px 20px', fontSize: 13,
          fontWeight: 700, color: '#fff', cursor: 'pointer', fontFamily: 'inherit',
          letterSpacing: '0.05em', textTransform: 'uppercase',
          boxShadow: '0 0 24px rgba(20,184,166,0.3)', transition: 'all 0.3s ease',
        }}>
          {slide < slides.length - 1 ? 'Next →' : 'Start using LOOM'}
        </button>
      </div>
    </div>
  );
};

export default function LOOM() {
  const [step, setStep] = useState<Step>('input');
  const [topic, setTopic] = useState('');
  const [selectedIdea, setSelectedIdea] = useState<ContentIdea | null>(null);
  const [draft, setDraft] = useState<ContentDraft | null>(null);
  const [optimized, setOptimized] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('');
  const [copied, setCopied] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const [visible, setVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [cursorVisible, setCursorVisible] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // First-visit onboarding
  useEffect(() => {
    const seen = localStorage.getItem('loom-onboarded');
    if (!seen) setShowOnboarding(true);
  }, []);

  const closeOnboarding = () => {
    localStorage.setItem('loom-onboarded', 'true');
    setShowOnboarding(false);
  };

  // Custom cursor + parallax tracking
  useEffect(() => {
    if (isMobile) return;
    const handleMove = (e: MouseEvent) => {
      setMouse({ x: e.clientX, y: e.clientY });
      setCursorVisible(true);
    };
    const handleLeave = () => setCursorVisible(false);
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseleave', handleLeave);
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseleave', handleLeave);
    };
  }, [isMobile]);

  // Enhanced background animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);

    const threads: any[] = [];
    for (let i = 0; i < 32; i++) {
      threads.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        length: 50 + Math.random() * 100,
        angle: Math.random() * Math.PI * 2,
        speed: 0.1 + Math.random() * 0.15,
        opacity: 0.04 + Math.random() * 0.08,
        color: Math.random() > 0.65 ? '#14b8a6' : '#ffffff',
        width: 0.5 + Math.random() * 1.2,
        parallaxFactor: 0.02 + Math.random() * 0.05,
      });
    }

    const nodes: any[] = [];
    for (let i = 0; i < 14; i++) {
      nodes.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        r: 1.5 + Math.random() * 2.5,
        phase: Math.random() * Math.PI * 2,
        speed: 0.005 + Math.random() * 0.008,
        parallaxFactor: 0.03 + Math.random() * 0.06,
      });
    }

    let frame = 0;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      frame++;

      const mx = mouse.x - canvas.width / 2;
      const my = mouse.y - canvas.height / 2;

      // Animated gradient mesh background
      const grad = ctx.createRadialGradient(
        canvas.width / 2 + Math.sin(frame * 0.003) * 200,
        canvas.height / 2 + Math.cos(frame * 0.003) * 150,
        0,
        canvas.width / 2, canvas.height / 2,
        Math.max(canvas.width, canvas.height) * 0.7
      );
      grad.addColorStop(0, 'rgba(20,184,166,0.04)');
      grad.addColorStop(0.4, 'rgba(20,184,166,0.015)');
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      threads.forEach(t => {
        t.x += Math.cos(t.angle) * t.speed;
        t.y += Math.sin(t.angle) * t.speed;
        if (t.x < -100) t.x = canvas.width + 100;
        if (t.x > canvas.width + 100) t.x = -100;
        if (t.y < -100) t.y = canvas.height + 100;
        if (t.y > canvas.height + 100) t.y = -100;

        const px = t.x + mx * t.parallaxFactor;
        const py = t.y + my * t.parallaxFactor;

        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(px + Math.cos(t.angle) * t.length, py + Math.sin(t.angle) * t.length);
        ctx.strokeStyle = t.color;
        ctx.globalAlpha = t.opacity;
        ctx.lineWidth = t.width;
        ctx.stroke();
      });

      nodes.forEach(n => {
        const pulse = Math.sin(frame * n.speed + n.phase);
        const px = n.x + mx * n.parallaxFactor;
        const py = n.y + my * n.parallaxFactor;
        ctx.beginPath();
        ctx.arc(px, py, n.r + pulse * 0.8, 0, Math.PI * 2);
        ctx.fillStyle = '#14b8a6';
        ctx.globalAlpha = 0.1 + pulse * 0.08;
        ctx.fill();
      });

      ctx.globalAlpha = 1;
      animRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(animRef.current); window.removeEventListener('resize', resize); };
  }, [mouse, isMobile]);

  useEffect(() => { setTimeout(() => setVisible(true), 100); inputRef.current?.focus(); }, []);
  useEffect(() => { setCharCount(topic.length); }, [topic]);

  const simulateLoading = async (messages: string[], duration: number) => {
    for (let i = 0; i < messages.length; i++) {
      setLoadingText(messages[i]);
      await new Promise(r => setTimeout(r, duration / messages.length));
    }
  };

  const morphTransition = async (newStep: Step) => {
    playSound('whoosh');
    setVisible(false);
    await new Promise(r => setTimeout(r, 400));
    setStep(newStep);
    setVisible(true);
  };

  const generateIdeas = (userTopic: string): ContentIdea[] =>
    FORMATS.map((f, i) => ({
      id: String(i + 1), ...f,
      title: [
        `Why ${userTopic} Is Redefining the Way We Work`,
        `The ${userTopic} Playbook: A Deep Dive`,
        `${userTopic} in 5 Minutes: A Visual Breakdown`,
        `The ${userTopic} Digest: What's Worth Your Attention`,
        `${userTopic}: 10 Truths Nobody Is Talking About`,
      ][i],
      preview: [
        `A punchy, high-engagement post built for LinkedIn's algorithm. Hooks readers in 3 seconds.`,
        `Long-form authority content. SEO-friendly structure with clear narrative arc.`,
        `Tight, camera-ready script with natural pacing and a strong call-to-action.`,
        `Curated insights formatted for email. Skimmable, valuable, and shareable.`,
        `Hook-driven thread optimized for retweets and profile growth.`,
      ][i],
    }));

  const getDraft = (idea: ContentIdea, userTopic: string): ContentDraft => {
    const contentMap: Record<string, string> = {
      'LinkedIn Post': `Okay so I've been thinking about ${userTopic} a lot lately and I think most people are approaching it completely backwards.\n\nHere's what I mean:\n\nEveryone's focused on the output. The result. The finished thing.\n\nNobody's talking about the input — the thinking that happens before any of it.\n\nI spent the last few weeks going deep on ${userTopic}. Not surface level stuff. Actually deep.\n\nThree things shifted for me:\n\n1. The problem is almost never what it looks like on the surface\n2. The people doing it well are usually doing less, not more\n3. Speed comes from clarity — not effort\n\nI'm still figuring this out honestly. But I think ${userTopic} is one of those things where slowing down to actually understand it pays back 10x.\n\nWhat's your experience been? Genuinely curious — drop a comment.\n\n#${userTopic.replace(/\s+/g, '')} #Thinking #BuildingInPublic`,
      'Blog Article': `# The ${userTopic} Playbook: A Deep Dive\n\n## Why This Matters Now\n\nWe're at an inflection point with ${userTopic}. The rules have changed and most people haven't updated their mental models to match.\n\nThis piece is for practitioners, not theorists.\n\n## The Core Problem\n\nMost frameworks for thinking about ${userTopic} were built for a different era. None of those assumptions hold today.\n\n## A Better Mental Model\n\nThink of ${userTopic} as a system with three operating layers: Foundation, Strategy, Execution.\n\n## The Takeaway\n\n${userTopic} isn't a destination. It's an ongoing practice of refinement.`,
      'Video Script': `[COLD OPEN]\nYou've been thinking about ${userTopic} all wrong. And I can prove it in the next five minutes.\n\n[MAIN CONTENT]\nLet me break ${userTopic} down into three parts: foundation, strategy, execution.\n\n[CLOSE]\nIf you found this useful, subscribe. See you in the next one.`,
      'Newsletter': `THE ${userTopic.toUpperCase()} DIGEST\n\nThree things worth your attention this week on ${userTopic}.\n\n01: The shift you're not seeing\n02: The framework that changes everything\n03: One question worth sitting with`,
      'Twitter Thread': `1/\nMost people misunderstand ${userTopic}. Here's a thread on what actually matters:\n\n2/\n${userTopic} isn't about tools. It's about mental models.\n\n3/\nThe best practitioners treat ${userTopic} as a system to design, not a problem to solve.\n\n4/\nIf this landed, follow me. I break down ideas like this every week.`,
    };
    const content = contentMap[idea.type] || '';
    return { type: idea.type, label: idea.label, title: idea.title, fullContent: content, wordCount: content.split(/\s+/).length };
  };

  const getOptimized = (content: string): string => `${content}\n\nOPTIMIZATION APPLIED\nHook strength increased · Readability improved · CTA optimized · Keywords balanced · Engagement enhanced`;

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    playSound('click');
    setLoading(true);
    await simulateLoading(['Analyzing topic...', 'Mapping formats...', 'Generating ideas...'], 1400);
    setLoading(false);
    await morphTransition('ideas');
  };

  const handleSelectIdea = async (idea: ContentIdea) => {
    playSound('click');
    setLoading(true);
    setSelectedIdea(idea);
    await simulateLoading(['Structuring narrative...', 'Drafting content...', 'Refining tone...'], 1200);
    setDraft(getDraft(idea, topic));
    setLoading(false);
    await morphTransition('draft');
  };

  const handleOptimize = async () => {
    if (!draft) return;
    playSound('click');
    setLoading(true);
    await simulateLoading(['Analyzing draft...', 'Applying optimizations...', 'Finalizing...'], 1000);
    setOptimized(getOptimized(draft.fullContent));
    setLoading(false);
    await morphTransition('optimized');
  };

  const handleCopy = async () => {
    const text = step === 'draft' ? draft?.fullContent : optimized;
    if (text) { await navigator.clipboard.writeText(text); playSound('success'); setCopied(true); setTimeout(() => setCopied(false), 2000); }
  };

  const handleReset = async () => {
    playSound('whoosh');
    setVisible(false);
    await new Promise(r => setTimeout(r, 300));
    setStep('input'); setTopic(''); setSelectedIdea(null); setDraft(null); setOptimized(''); setCopied(false);
    setVisible(true);
  };

  const stepIndex = { input: 0, ideas: 1, draft: 2, optimized: 3 }[step];
  const px = isMobile ? '16px' : '32px';
  const sectionPad = isMobile ? '48px 16px' : '80px 32px';

  return (
    <div style={{ minHeight: '100vh', background: '#080808', color: '#fff', fontFamily: "'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", position: 'relative', overflow: 'hidden', cursor: isMobile ? 'auto' : 'none' }}>
      {showOnboarding && <OnboardingModal onClose={closeOnboarding} />}

      {/* Custom cursor */}
      {!isMobile && cursorVisible && (
        <>
          <div style={{ position: 'fixed', left: mouse.x, top: mouse.y, width: 8, height: 8, borderRadius: '50%', background: '#14b8a6', transform: 'translate(-50%, -50%)', pointerEvents: 'none', zIndex: 9999, transition: 'transform 0.05s ease' }} />
          <div style={{ position: 'fixed', left: mouse.x, top: mouse.y, width: 36, height: 36, borderRadius: '50%', border: '1px solid rgba(20,184,166,0.4)', transform: 'translate(-50%, -50%)', pointerEvents: 'none', zIndex: 9998, transition: 'all 0.15s ease' }} />
        </>
      )}

      <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', inset: 0, backgroundImage: `linear-gradient(rgba(255,255,255,0.012) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.012) 1px, transparent 1px)`, backgroundSize: '80px 80px', pointerEvents: 'none', zIndex: 0 }} />

      <header style={{ position: 'sticky', top: 0, zIndex: 50, borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(8,8,8,0.88)', backdropFilter: 'blur(24px)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: `0 ${px}`, height: isMobile ? 64 : 72, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: isMobile ? 36 : 42, height: isMobile ? 36 : 42, background: 'rgba(20,184,166,0.08)', border: '1px solid rgba(20,184,166,0.18)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <LoomLogo size={isMobile ? 20 : 24} />
            </div>
            <span style={{ fontSize: isMobile ? 16 : 18, fontWeight: 700, letterSpacing: '0.25em', color: 'rgba(255,255,255,0.92)', lineHeight: 1, textTransform: 'uppercase' }}>Loom</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 6 : 10 }}>
            {['Topic', 'Format', 'Draft', 'Done'].map((label, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 4 : 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, opacity: i <= stepIndex ? 1 : 0.22, transition: 'opacity 0.4s ease' }}>
                  <div style={{ width: 22, height: 22, borderRadius: '50%', background: i < stepIndex ? '#14b8a6' : 'transparent', border: i === stepIndex ? '1.5px solid #14b8a6' : i < stepIndex ? 'none' : '1.5px solid rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, transition: 'all 0.4s ease', boxShadow: i === stepIndex ? '0 0 12px rgba(20,184,166,0.5)' : 'none' }}>
                    {i < stepIndex ? '✓' : i + 1}
                  </div>
                  {!isMobile && <span style={{ fontSize: 11, fontWeight: 500, color: i === stepIndex ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.35)' }}>{label}</span>}
                </div>
                {i < 3 && <div style={{ width: isMobile ? 10 : 24, height: 1, background: 'rgba(255,255,255,0.07)' }} />}
              </div>
            ))}
            <button onClick={() => setShowOnboarding(true)} style={{ marginLeft: 12, background: 'transparent', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, width: 28, height: 28, color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: 13, fontFamily: 'inherit' }}>?</button>
          </div>
        </div>
      </header>

      {loading && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(8,8,8,0.75)', backdropFilter: 'blur(8px)', zIndex: 100, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20 }}>
          <div style={{ display: 'flex', gap: 6 }}>
            {[0, 1, 2, 3].map(i => <div key={i} style={{ width: 4, height: 4, borderRadius: '50%', background: '#14b8a6', animation: `loomPulse 1.2s ease-in-out ${i * 0.15}s infinite` }} />)}
          </div>
          <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{loadingText}</span>
        </div>
      )}

      <main className={`morph-container ${visible ? 'morph-in' : 'morph-out'}`} style={{ maxWidth: 1100, margin: '0 auto', padding: sectionPad, position: 'relative', zIndex: 1 }}>
        {step === 'input' && (
          <div>
            <div style={{ marginBottom: isMobile ? 40 : 72 }}>
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: isMobile ? 'clamp(64px, 20vw, 100px)' : 'clamp(80px, 14vw, 160px)', fontWeight: 900, letterSpacing: '-0.05em', lineHeight: 0.9, background: 'linear-gradient(180deg, #ffffff 30%, rgba(255,255,255,0.25) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', userSelect: 'none' }}>LOOM</div>
              </div>
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                  <div style={{ width: 24, height: 1, background: '#14b8a6' }} />
                  <span style={{ fontSize: isMobile ? 11 : 12, fontWeight: 600, color: '#14b8a6', letterSpacing: '0.2em', textTransform: 'uppercase' }}>Language Output & Optimization Machine</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ width: 24, height: 1, background: 'rgba(255,255,255,0.1)' }} />
                  <span style={{ fontSize: isMobile ? 13 : 15, fontWeight: 400, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Weave your story</span>
                </div>
              </div>
              <p style={{ fontSize: isMobile ? 15 : 17, color: 'rgba(255,255,255,0.35)', maxWidth: 460, lineHeight: 1.65 }}>Enter a topic. LOOM generates 5 platform-ready content formats, fully drafted and optimized for engagement.</p>
            </div>

            <div style={{ maxWidth: '100%', width: '100%' }}>
              <div className="loom-input-wrap" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 2, transition: 'all 0.3s ease' }}>
                <div style={{ position: 'relative' }}>
                  <input ref={inputRef} type="text" placeholder="What's your topic?" value={topic} onChange={e => setTopic(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleGenerate()} maxLength={120} style={{ width: '100%', background: 'transparent', border: 'none', outline: 'none', fontSize: isMobile ? 16 : 20, fontWeight: 500, color: '#fff', padding: isMobile ? '18px 20px' : '24px 28px', letterSpacing: '-0.01em', boxSizing: 'border-box' }} />
                  <div style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', fontSize: 11, color: 'rgba(255,255,255,0.18)', fontFamily: 'monospace' }}>{charCount}/120</div>
                </div>
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '10px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {(isMobile ? ['AI design', 'Remote work'] : ['AI in design', 'Remote work', 'Sustainability']).map(hint => (
                      <button key={hint} onClick={() => { setTopic(hint); playSound('click'); }} className="hint-chip" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 6, padding: '4px 10px', fontSize: 12, color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontFamily: 'inherit' }}>{hint}</button>
                    ))}
                  </div>
                  <button onClick={handleGenerate} disabled={!topic.trim()} className="primary-btn" style={{ background: topic.trim() ? 'linear-gradient(135deg, #14b8a6, #0d9488)' : 'rgba(255,255,255,0.05)', border: 'none', borderRadius: 10, padding: '10px 20px', fontSize: 13, fontWeight: 600, color: topic.trim() ? '#fff' : 'rgba(255,255,255,0.2)', cursor: topic.trim() ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'inherit', boxShadow: topic.trim() ? '0 0 20px rgba(20,184,166,0.3)' : 'none', transition: 'all 0.3s ease' }}>Generate <span>→</span></button>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: isMobile ? 24 : 64, marginTop: isMobile ? 40 : 64, flexWrap: 'wrap' }}>
              {[{ num: '5', label: 'Content formats' }, { num: '3', label: 'Pipeline stages' }, { num: '<2s', label: 'Generation time' }].map((stat, i) => (
                <div key={i} style={{ opacity: 0, animation: `fadeSlideUp 0.5s ease forwards ${300 + i * 100}ms` }}>
                  <div style={{ fontSize: isMobile ? 24 : 32, fontWeight: 800, letterSpacing: '-0.04em', color: '#fff', lineHeight: 1 }}>{stat.num}</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginTop: 6, letterSpacing: '0.04em', textTransform: 'uppercase' }}>{stat.label}</div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: isMobile ? 40 : 56, maxWidth: '100%', padding: '16px 20px', border: '1px solid rgba(255,255,255,0.07)', borderLeft: '2px solid rgba(20,184,166,0.5)', borderRadius: '0 8px 8px 0', background: 'rgba(255,255,255,0.02)', opacity: 0, animation: 'fadeSlideUp 0.5s ease forwards 600ms' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#14b8a6' }}>Notice</span>
                <div style={{ flex: 1, height: 1, background: 'rgba(20,184,166,0.15)' }} />
              </div>
              <p style={{ fontSize: isMobile ? 12 : 13, color: 'rgba(255,255,255,0.55)', lineHeight: 1.7, margin: 0 }}>LOOM is currently in active development. This build runs on simulated output — real-time LLM integration, user accounts, and export features are in progress.</p>
            </div>

            <div style={{ marginTop: isMobile ? 48 : 72, maxWidth: '100%', opacity: 0, animation: 'fadeSlideUp 0.5s ease forwards 750ms' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)' }}>About</span>
                <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? 12 : 48 }}>
                <p style={{ fontSize: isMobile ? 14 : 15, color: 'rgba(255,255,255,0.5)', lineHeight: 1.8, margin: 0 }}>Most content tools give you a blank page and wish you luck. LOOM doesn't. You bring a topic — it handles the rest. Five formats, fully drafted, ready to publish.</p>
                <p style={{ fontSize: isMobile ? 13 : 14, color: 'rgba(255,255,255,0.3)', lineHeight: 1.8, margin: 0 }}>LOOM is an ongoing project built and maintained by Supreeth. Currently in active development, with more formats, integrations, and real-time LLM support on the way.</p>
              </div>
            </div>
          </div>
        )}

        {step === 'ideas' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: isMobile ? 32 : 56 }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#14b8a6', marginBottom: 12 }}>Step 02: Choose Format</div>
                <h2 style={{ fontSize: isMobile ? 36 : 48, fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1 }}>Select your<br />format.</h2>
                <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.35)', marginTop: 12 }}>Topic: <span style={{ color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>"{topic}"</span></p>
              </div>
              <button onClick={handleReset} className="ghost-btn" style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '8px 16px', fontSize: 13, color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontFamily: 'inherit', marginTop: 8 }}>← Reset</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 12 }}>
              {generateIdeas(topic).map((idea, idx) => (
                <button key={idea.id} onClick={() => handleSelectIdea(idea)} className="idea-card" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: isMobile ? '20px' : '28px', textAlign: 'left', cursor: 'pointer', opacity: 0, animation: `fadeSlideUp 0.4s ease forwards ${idx * 80}ms`, fontFamily: 'inherit', width: '100%' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 36, height: 36, background: 'rgba(20,184,166,0.1)', border: '1px solid rgba(20,184,166,0.2)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: '#14b8a6', fontWeight: 700 }}>{idea.icon}</div>
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 600, color: '#14b8a6', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{idea.type}</div>
                        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)' }}>{idea.platform}</div>
                      </div>
                    </div>
                    <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.05)', padding: '3px 8px', borderRadius: 4 }}>{idea.readTime}</span>
                  </div>
                  <h3 style={{ fontSize: isMobile ? 15 : 17, fontWeight: 600, color: '#fff', lineHeight: 1.35, marginBottom: 8 }}>{idea.title}</h3>
                  <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', lineHeight: 1.55 }}>{idea.preview}</p>
                  <div style={{ marginTop: 16, fontSize: 12, color: '#14b8a6', fontWeight: 600 }}>SELECT FORMAT →</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 'draft' && draft && (
          <div>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: isMobile ? 24 : 48 }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#14b8a6', marginBottom: 12 }}>Step 03: Draft</div>
                <h2 style={{ fontSize: isMobile ? 32 : 48, fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1 }}>{draft.type}</h2>
                <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.35)', marginTop: 10 }}>{draft.wordCount} words · Ready to use</p>
              </div>
              <button onClick={handleReset} className="ghost-btn" style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '8px 16px', fontSize: 13, color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontFamily: 'inherit', marginTop: 8 }}>← Reset</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 300px', gap: 20, alignItems: 'start' }}>
              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: isMobile ? '24px 20px' : '40px 44px' }}>
                <h3 style={{ fontSize: isMobile ? 17 : 22, fontWeight: 700, color: '#fff', marginBottom: 20, paddingBottom: 20, borderBottom: '1px solid rgba(255,255,255,0.07)' }}>{draft.title}</h3>
                <div style={{ fontSize: isMobile ? 14 : 15, color: 'rgba(255,255,255,0.75)', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>{draft.fullContent}</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, position: isMobile ? 'static' : 'sticky', top: 84 }}>
                {!isMobile && (
                  <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: 20 }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 16 }}>Content info</div>
                    {[{ label: 'Format', value: draft.type }, { label: 'Words', value: draft.wordCount }, { label: 'Platform', value: selectedIdea?.platform || 'N/A' }, { label: 'Status', value: 'Draft' }].map(item => (
                      <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>{item.label}</span>
                        <span style={{ fontSize: 12, color: '#fff', fontWeight: 500 }}>{item.value}</span>
                      </div>
                    ))}
                  </div>
                )}
                <button onClick={handleCopy} className="action-btn" style={{ width: '100%', background: copied ? 'rgba(20,184,166,0.1)' : 'rgba(255,255,255,0.04)', border: `1px solid ${copied ? 'rgba(20,184,166,0.3)' : 'rgba(255,255,255,0.08)'}`, borderRadius: 12, padding: '14px 20px', fontSize: 13, fontWeight: 600, color: copied ? '#14b8a6' : 'rgba(255,255,255,0.6)', cursor: 'pointer', fontFamily: 'inherit' }}>{copied ? '✓ Copied' : '⎘ Copy content'}</button>
                <button onClick={handleOptimize} className="primary-btn" style={{ width: '100%', background: 'linear-gradient(135deg, #14b8a6, #0d9488)', border: 'none', borderRadius: 12, padding: '14px 20px', fontSize: 13, fontWeight: 700, color: '#fff', cursor: 'pointer', fontFamily: 'inherit', letterSpacing: '0.05em', textTransform: 'uppercase', boxShadow: '0 0 24px rgba(20,184,166,0.25)' }}>✦ Optimize draft</button>
                <button onClick={handleReset} className="ghost-btn" style={{ width: '100%', background: 'transparent', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '12px 20px', fontSize: 12, color: 'rgba(255,255,255,0.25)', cursor: 'pointer', fontFamily: 'inherit' }}>Start over</button>
              </div>
            </div>
          </div>
        )}

        {step === 'optimized' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: isMobile ? 24 : 48 }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#14b8a6', marginBottom: 12 }}>Step 04: Optimized</div>
                <h2 style={{ fontSize: isMobile ? 32 : 48, fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1 }}>Ready to<br />publish.</h2>
                <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.35)', marginTop: 10 }}>Fully optimized for engagement</p>
              </div>
              <button onClick={handleReset} className="ghost-btn" style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '8px 16px', fontSize: 13, color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontFamily: 'inherit', marginTop: 8 }}>← Reset</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 300px', gap: 20, alignItems: 'start' }}>
              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(20,184,166,0.15)', borderRadius: 16, padding: isMobile ? '24px 20px' : '40px 44px', boxShadow: '0 0 40px rgba(20,184,166,0.05)' }}>
                <div style={{ fontSize: isMobile ? 14 : 15, color: 'rgba(255,255,255,0.75)', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>{optimized}</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, position: isMobile ? 'static' : 'sticky', top: 84 }}>
                {!isMobile && (
                  <div style={{ background: 'rgba(20,184,166,0.05)', border: '1px solid rgba(20,184,166,0.15)', borderRadius: 14, padding: 20 }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: '#14b8a6', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 16 }}>Optimizations</div>
                    {['Hook strength', 'Readability', 'CTA placement', 'Keywords', 'Engagement'].map((item, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
                        <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>{item}</span>
                        <span style={{ fontSize: 11, color: '#14b8a6', fontWeight: 600 }}>✓ Applied</span>
                      </div>
                    ))}
                  </div>
                )}
                <button onClick={handleCopy} className="primary-btn" style={{ width: '100%', background: copied ? 'rgba(20,184,166,0.1)' : 'linear-gradient(135deg, #14b8a6, #0d9488)', border: 'none', borderRadius: 12, padding: '14px 20px', fontSize: 13, fontWeight: 700, color: '#fff', cursor: 'pointer', fontFamily: 'inherit', letterSpacing: '0.05em', textTransform: 'uppercase', boxShadow: copied ? 'none' : '0 0 24px rgba(20,184,166,0.25)' }}>{copied ? '✓ Copied to clipboard' : '⎘ Copy content'}</button>
                <button onClick={handleReset} className="ghost-btn" style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '12px 20px', fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontFamily: 'inherit' }}>Create new content →</button>
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', margin: 0, letterSpacing: '0.05em', textAlign: 'center' }}>Like what you see?</p>
                  <a href="https://github.com/wSupreeth" target="_blank" rel="noopener noreferrer" className="ghost-btn" style={{ width: '100%', background: 'transparent', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '11px 20px', fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.35)', cursor: 'pointer', fontFamily: 'inherit', letterSpacing: '0.05em', textAlign: 'center', textDecoration: 'none', display: 'block' }}>View on GitHub ↗</a>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: `20px ${px}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', maxWidth: 1100, margin: '0 auto', position: 'relative', zIndex: 1, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)' }}>Built by <span style={{ color: 'rgba(20,184,166,0.7)', fontWeight: 600 }}>Supreeth</span></span>
          <a href="https://github.com/wSupreeth" target="_blank" rel="noopener noreferrer" className="ghost-btn" style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)', textDecoration: 'none', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 6, padding: '3px 10px' }}>GitHub ↗</a>
        </div>
        <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.08em', fontFamily: 'monospace' }}>V2.S4 / LOOM</span>
      </footer>
    </div>
  );
}