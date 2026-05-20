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
    {/* Three clean horizontal threads */}
    <line x1="6" y1="9" x2="26" y2="9" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.4"/>
    <line x1="6" y1="16" x2="26" y2="16" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.9"/>
    <line x1="6" y1="23" x2="26" y2="23" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.4"/>
    {/* Two vertical warp threads crossing */}
    <line x1="12" y1="5" x2="12" y2="27" stroke="#14b8a6" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.7"/>
    <line x1="20" y1="5" x2="20" y2="27" stroke="#14b8a6" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.4"/>
    {/* Intersection accent dots */}
    <circle cx="12" cy="16" r="2" fill="#14b8a6"/>
    <circle cx="20" cy="9" r="1.2" fill="white" fillOpacity="0.6"/>
    <circle cx="20" cy="23" r="1.2" fill="white" fillOpacity="0.6"/>
  </svg>
);

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
  const inputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);
    const threads: { x: number; y: number; length: number; angle: number; speed: number; opacity: number; color: string; width: number; }[] = [];
    for (let i = 0; i < 28; i++) {
      threads.push({
        x: Math.random() * window.innerWidth, y: Math.random() * window.innerHeight,
        length: 40 + Math.random() * 80, angle: Math.random() * Math.PI * 2,
        speed: 0.08 + Math.random() * 0.12, opacity: 0.03 + Math.random() * 0.06,
        color: Math.random() > 0.7 ? '#14b8a6' : '#ffffff', width: 0.5 + Math.random() * 1,
      });
    }
    const nodes: { x: number; y: number; r: number; phase: number; speed: number }[] = [];
    for (let i = 0; i < 10; i++) {
      nodes.push({
        x: Math.random() * window.innerWidth, y: Math.random() * window.innerHeight,
        r: 1 + Math.random() * 2, phase: Math.random() * Math.PI * 2,
        speed: 0.004 + Math.random() * 0.006,
      });
    }
    let frame = 0;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      frame++;
      threads.forEach(t => {
        t.x += Math.cos(t.angle) * t.speed;
        t.y += Math.sin(t.angle) * t.speed;
        if (t.x < -100) t.x = canvas.width + 100;
        if (t.x > canvas.width + 100) t.x = -100;
        if (t.y < -100) t.y = canvas.height + 100;
        if (t.y > canvas.height + 100) t.y = -100;
        ctx.beginPath();
        ctx.moveTo(t.x, t.y);
        ctx.lineTo(t.x + Math.cos(t.angle) * t.length, t.y + Math.sin(t.angle) * t.length);
        ctx.strokeStyle = t.color;
        ctx.globalAlpha = t.opacity;
        ctx.lineWidth = t.width;
        ctx.stroke();
      });
      nodes.forEach(n => {
        const pulse = Math.sin(frame * n.speed + n.phase);
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r + pulse * 0.5, 0, Math.PI * 2);
        ctx.fillStyle = '#14b8a6';
        ctx.globalAlpha = 0.08 + pulse * 0.06;
        ctx.fill();
      });
      ctx.globalAlpha = 1;
      animRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(animRef.current); window.removeEventListener('resize', resize); };
  }, []);

  useEffect(() => { setTimeout(() => setVisible(true), 100); inputRef.current?.focus(); }, []);
  useEffect(() => { setCharCount(topic.length); }, [topic]);

  const simulateLoading = async (messages: string[], duration: number) => {
    for (let i = 0; i < messages.length; i++) {
      setLoadingText(messages[i]);
      await new Promise(r => setTimeout(r, duration / messages.length));
    }
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
      'LinkedIn Post': `Okay so I've been thinking about ${userTopic} a lot lately and I think most people are approaching it completely backwards.

Here's what I mean:

Everyone's focused on the output. The result. The finished thing.

Nobody's talking about the input — the thinking that happens before any of it.

I spent the last few weeks going deep on ${userTopic}. Not surface level stuff. Actually deep.

Three things shifted for me:

1. The problem is almost never what it looks like on the surface
2. The people doing it well are usually doing less, not more
3. Speed comes from clarity — not effort

I'm still figuring this out honestly. But I think ${userTopic} is one of those things where slowing down to actually understand it pays back 10x.

What's your experience been? Genuinely curious — drop a comment.

#${userTopic.replace(/\s+/g, '')} #Thinking #BuildingInPublic`,
      'Blog Article': `# The ${userTopic} Playbook: A Deep Dive

## Why This Matters Now

We're at an inflection point with ${userTopic}. The rules have changed and most people haven't updated their mental models to match.

This piece is for practitioners, not theorists. If you're looking for a surface-level overview, this isn't it.

## The Core Problem

Most frameworks for thinking about ${userTopic} were built for a different era. They assume linear progress, stable environments, and predictable outcomes.

None of those assumptions hold today.

## A Better Mental Model

Think of ${userTopic} as a system with three operating layers:

Layer 1: Foundation
The non-negotiables. Principles that don't change regardless of context or conditions.

Layer 2: Strategy
The adjustable variables. How you apply the foundation given your specific constraints.

Layer 3: Execution
Where most people over-invest their attention, while under-investing in layers 1 and 2.

## What Actually Moves the Needle

The practitioners who compound fastest are those who invest in understanding why before how.

They build durable intuition, not brittle procedures.

## The Takeaway

${userTopic} isn't a destination. It's an ongoing practice of refinement.

The best time to start building that practice was yesterday.
The second best time is right now.`,

      'Video Script': `[COLD OPEN: 0:00 to 0:15]
You've been thinking about ${userTopic} all wrong.
And I can prove it in the next five minutes.

[TITLE CARD: 0:15 to 0:20]
${userTopic}: What Nobody Tells You

[SETUP: 0:20 to 1:00]
Quick question. When you hear "${userTopic}", what comes to mind?
Most people go straight to tactics. Tools. Templates.
That's the trap.
The people who actually win with ${userTopic} start somewhere completely different.

[MAIN CONTENT: 1:00 to 3:30]
Let me break this down into three parts.

Part one: The foundation.
Before you do anything with ${userTopic}, you need a clear mental model...

Part two: The strategy layer.
This is where most people spend too little time...

Part three: Execution.
Here's what elite practitioners actually do differently...

[PRACTICAL DEMO: 3:30 to 4:30]
Let me show you a real example.
Take this scenario with ${userTopic}...

[CLOSE: 4:30 to 5:00]
Here's the one thing I want you to take away:
${userTopic} isn't complicated. It's just misunderstood.

If you found this useful, subscribe.
I post breakdowns like this every week.
See you in the next one.`,

      'Newsletter': `THE ${userTopic.toUpperCase()} DIGEST
The signal in the noise, curated weekly

This week's focus: ${userTopic}

Three things worth your attention:

01: The Shift You're Not Seeing

Something is changing in how the best practitioners approach ${userTopic}. It's subtle, but the downstream effects are significant. Here's the pattern I've been tracking...

02: The Framework That Changes Everything

There's a mental model for ${userTopic} that I keep returning to. It's not new, but most people are applying it backwards. The core insight:

Most of what we call "strategy" around ${userTopic} is actually execution in disguise. Real strategy is the part that comes before.

03: One Question Worth Sitting With

If you had to explain ${userTopic} to someone with no context, in a single sentence, what would you say?

That constraint forces clarity. Clarity drives better decisions.

WORTH READING
A few pieces on ${userTopic} that are worth your time this week...

PARTING THOUGHT
The people winning at ${userTopic} aren't smarter. They're just more deliberate about where they focus their attention.

Until next week.`,

      'Twitter Thread': `1/
Most people misunderstand ${userTopic}.

Here's a thread on what actually matters and what's just noise:

2/
First, let's clear something up.

${userTopic} isn't about having the right tools.
It's about having the right mental model.

The tools come later.

3/
The biggest mistake I see:

People treat ${userTopic} as a problem to solve.

The best practitioners treat it as a system to design.

Subtle difference. Massive consequences.

4/
What that shift looks like in practice:

Less time reacting.
More time designing constraints.
Better outcomes with less friction.

5/
The foundation matters more than you think.

Most people skip it because it's not visible.

The ones who don't are the ones who compound over time.

6/
Three questions to stress-test your approach to ${userTopic}:

Is this principle durable or situational?
Would this scale if everything got harder?
Am I optimizing for now or for next year?

7/
The uncomfortable truth about ${userTopic}:

There's no shortcut to depth.

But there is a faster path to clarity.
It starts with better questions.

8/
If I had to summarize everything I've learned about ${userTopic} in one line:

Build the foundation before the structure.
Design the system before the habit.
Understand the why before the how.

9/
That's the thread.

If this landed, follow me. I break down ideas like this every week.

And reply with the one thing about ${userTopic} you're currently figuring out.

10/
RT the first tweet if this was worth your time.

Someone in your network probably needs to read this today.`,
    };
    const content = contentMap[idea.type] || '';
    return { type: idea.type, label: idea.label, title: idea.title, fullContent: content, wordCount: content.split(/\s+/).length };
  };

  const getOptimized = (content: string): string => `${content}

OPTIMIZATION APPLIED
Hook strength increased: first line rewritten for pattern interrupt
Readability score improved: shorter paragraphs, stronger white space
CTA placement optimized: moved to highest-attention position
Keyword density balanced: naturally distributed throughout
Emotional resonance enhanced: added specificity and stakes
Platform signals added: formatted for algorithmic preference`;

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    await simulateLoading(['Analyzing topic...', 'Mapping formats...', 'Generating ideas...'], 1400);
    setLoading(false);
    setStep('ideas');
  };

  const handleSelectIdea = async (idea: ContentIdea) => {
    setLoading(true);
    setSelectedIdea(idea);
    await simulateLoading(['Structuring narrative...', 'Drafting content...', 'Refining tone...'], 1200);
    setDraft(getDraft(idea, topic));
    setLoading(false);
    setStep('draft');
  };

  const handleOptimize = async () => {
    if (!draft) return;
    setLoading(true);
    await simulateLoading(['Analyzing draft...', 'Applying optimizations...', 'Finalizing...'], 1000);
    setOptimized(getOptimized(draft.fullContent));
    setLoading(false);
    setStep('optimized');
  };

  const handleCopy = async () => {
    const text = step === 'draft' ? draft?.fullContent : optimized;
    if (text) { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }
  };

  const handleReset = () => {
    setVisible(false);
    setTimeout(() => { setStep('input'); setTopic(''); setSelectedIdea(null); setDraft(null); setOptimized(''); setCopied(false); setVisible(true); }, 300);
  };

  const stepIndex = { input: 0, ideas: 1, draft: 2, optimized: 3 }[step];
  const px = isMobile ? '16px' : '32px';
  const sectionPad = isMobile ? '48px 16px' : '80px 32px';

  return (
    <div style={{ minHeight: '100vh', background: '#080808', color: '#fff', fontFamily: "'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", position: 'relative', overflow: 'hidden' }}>
      <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', inset: 0, backgroundImage: `linear-gradient(rgba(255,255,255,0.012) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.012) 1px, transparent 1px)`, backgroundSize: '80px 80px', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', top: -200, left: '25%', width: 700, height: 500, background: 'radial-gradient(ellipse, rgba(20,184,166,0.05) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />

      {/* Header */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 50,
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        background: 'rgba(8,8,8,0.88)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: `0 ${px}`, height: isMobile ? 64 : 72, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

          {/* Logo + Name */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: isMobile ? 36 : 42,
              height: isMobile ? 36 : 42,
              background: 'rgba(20,184,166,0.08)',
              border: '1px solid rgba(20,184,166,0.18)',
              borderRadius: 10,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <LoomLogo size={isMobile ? 20 : 24} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <span style={{
                fontSize: isMobile ? 16 : 18,
                fontWeight: 700,
                letterSpacing: '0.25em',
                color: 'rgba(255,255,255,0.92)',
                lineHeight: 1,
                textTransform: 'uppercase',
              }}>Loom</span>
            
            </div>
          </div>

          {/* Step tracker */}
          <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 6 : 10 }}>
            {['Topic', 'Format', 'Draft', 'Done'].map((label, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 4 : 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, opacity: i <= stepIndex ? 1 : 0.22, transition: 'opacity 0.4s ease' }}>
                  <div style={{
                    width: 22, height: 22, borderRadius: '50%',
                    background: i < stepIndex ? '#14b8a6' : 'transparent',
                    border: i === stepIndex ? '1.5px solid #14b8a6' : i < stepIndex ? 'none' : '1.5px solid rgba(255,255,255,0.15)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 10, fontWeight: 700, transition: 'all 0.4s ease',
                  }}>
                    {i < stepIndex ? '✓' : i + 1}
                  </div>
                  {!isMobile && (
                    <span style={{ fontSize: 11, fontWeight: 500, color: i === stepIndex ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.35)', letterSpacing: '0.04em' }}>{label}</span>
                  )}
                </div>
                {i < 3 && <div style={{ width: isMobile ? 10 : 24, height: 1, background: 'rgba(255,255,255,0.07)' }} />}
              </div>
            ))}
          </div>

        </div>
      </header>

      {/* Loading */}
      {loading && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(8,8,8,0.75)', backdropFilter: 'blur(8px)', zIndex: 100, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20 }}>
          <div style={{ display: 'flex', gap: 6 }}>
            {[0, 1, 2, 3].map(i => <div key={i} style={{ width: 4, height: 4, borderRadius: '50%', background: '#14b8a6', animation: `loomPulse 1.2s ease-in-out ${i * 0.15}s infinite` }} />)}
          </div>
          <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{loadingText}</span>
        </div>
      )}

      {/* Main */}
      <main style={{ maxWidth: 1100, margin: '0 auto', padding: sectionPad, position: 'relative', zIndex: 1, opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(16px)', transition: 'opacity 0.5s ease, transform 0.5s ease' }}>

        {/* INPUT */}
        {step === 'input' && (
          <div>
            <div style={{ marginBottom: isMobile ? 40 : 72 }}>
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: isMobile ? 'clamp(64px, 20vw, 100px)' : 'clamp(80px, 14vw, 160px)', fontWeight: 900, letterSpacing: '-0.05em', lineHeight: 0.9, background: 'linear-gradient(180deg, #ffffff 30%, rgba(255,255,255,0.25) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', userSelect: 'none' }}>LOOM</div>
              </div>
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                  <div style={{ width: 24, height: 1, background: '#14b8a6' }} />
                  <span style={{ fontSize: isMobile ? 11 : 12, fontWeight: 600, color: '#14b8a6', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
                    Language Output & Optimization Machine
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ width: 24, height: 1, background: 'rgba(255,255,255,0.1)' }} />
                  <span style={{ fontSize: isMobile ? 13 : 15, fontWeight: 400, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Weave your story</span>
                </div>
              </div>
              <p style={{ fontSize: isMobile ? 15 : 17, color: 'rgba(255,255,255,0.35)', maxWidth: 460, lineHeight: 1.65 }}>
                Enter a topic. LOOM generates 5 platform-ready content formats, fully drafted and optimized for engagement.
              </p>
            </div>

<div style={{ maxWidth: '100%', width: '100%' }}>
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 2 }}>
                <div style={{ position: 'relative' }}>
                  <input ref={inputRef} type="text" placeholder="What's your topic?" value={topic}
                    onChange={e => setTopic(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleGenerate()} maxLength={120}
                    style={{ width: '100%', background: 'transparent', border: 'none', outline: 'none', fontSize: isMobile ? 16 : 20, fontWeight: 500, color: '#fff', padding: isMobile ? '18px 20px' : '24px 28px', letterSpacing: '-0.01em', boxSizing: 'border-box' }}
                  />
                  <div style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', fontSize: 11, color: 'rgba(255,255,255,0.18)', fontFamily: 'monospace' }}>{charCount}/120</div>
                </div>
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '10px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {(isMobile ? ['AI design', 'Remote work'] : ['AI in design', 'Remote work', 'Sustainability']).map(hint => (
                      <button key={hint} onClick={() => setTopic(hint)} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 6, padding: '4px 10px', fontSize: 12, color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontFamily: 'inherit' }}
                        onMouseEnter={e => { const el = e.target as HTMLButtonElement; el.style.background = 'rgba(20,184,166,0.1)'; el.style.color = '#14b8a6'; el.style.borderColor = 'rgba(20,184,166,0.3)'; }}
                        onMouseLeave={e => { const el = e.target as HTMLButtonElement; el.style.background = 'rgba(255,255,255,0.05)'; el.style.color = 'rgba(255,255,255,0.4)'; el.style.borderColor = 'rgba(255,255,255,0.08)'; }}
                      >{hint}</button>
                    ))}
                  </div>
                  <button onClick={handleGenerate} disabled={!topic.trim()} style={{ background: topic.trim() ? 'linear-gradient(135deg, #14b8a6, #0d9488)' : 'rgba(255,255,255,0.05)', border: 'none', borderRadius: 10, padding: '10px 20px', fontSize: 13, fontWeight: 600, color: topic.trim() ? '#fff' : 'rgba(255,255,255,0.2)', cursor: topic.trim() ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'inherit', boxShadow: topic.trim() ? '0 0 20px rgba(20,184,166,0.3)' : 'none', transition: 'all 0.3s ease' }}>
                    Generate <span style={{ fontSize: 16 }}>→</span>
                  </button>
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

            {/* Disclaimer */}
            <div style={{
              marginTop: isMobile ? 40 : 56,
              maxWidth: '100%',
              padding: '16px 20px',
              border: '1px solid rgba(255,255,255,0.07)',
              borderLeft: '2px solid rgba(20,184,166,0.5)',
              borderRadius: '0 8px 8px 0',
              background: 'rgba(255,255,255,0.02)',
              opacity: 0,
              animation: 'fadeSlideUp 0.5s ease forwards 600ms',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#14b8a6' }}>Notice</span>
                <div style={{ flex: 1, height: 1, background: 'rgba(20,184,166,0.15)' }} />
              </div>
              <p style={{ fontSize: isMobile ? 12 : 13, color: 'rgba(255,255,255,0.55)', lineHeight: 1.7, fontWeight: 400, letterSpacing: '0.01em', margin: 0 }}>
                LOOM is currently in active development. This build runs on simulated output, real-time LLM integration, user accounts, and export features are in progress. Some functionality may be limited or subject to change.
              </p>
            </div>

            {/* About LOOM */}
            <div style={{
              marginTop: isMobile ? 48 : 72,
              maxWidth: '100%',
              opacity: 0,
              animation: 'fadeSlideUp 0.5s ease forwards 750ms',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)' }}>About</span>
                <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
              </div>
             <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? 12 : 48 }}>
                <p style={{ fontSize: isMobile ? 14 : 15, color: 'rgba(255,255,255,0.5)', lineHeight: 1.8, fontWeight: 400, margin: 0 }}>
                  Most content tools give you a blank page and wish you luck. LOOM doesn't. You bring a topic - it handles the rest. Five formats, fully drafted, ready to publish. No prompting, no fiddling, no staring at a cursor. Built for people who have something to say but not all day to say it.
                </p>
                <p style={{ fontSize: isMobile ? 13 : 14, color: 'rgba(255,255,255,0.3)', lineHeight: 1.8, fontWeight: 400, margin: 0 }}>
                 LOOM is an ongoing project built and maintained by Supreeth. Currently in active development, with more formats, integrations, and real-time LLM support on the way.  
                </p>
              </div>
            </div>
          </div>
        )}

        {/* IDEAS */}
        {step === 'ideas' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: isMobile ? 32 : 56 }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#14b8a6', marginBottom: 12 }}>Step 02: Choose Format</div>
                <h2 style={{ fontSize: isMobile ? 36 : 48, fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1, color: '#fff' }}>Select your<br />format.</h2>
                <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.35)', marginTop: 12 }}>Topic: <span style={{ color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>"{topic}"</span></p>
              </div>
              <button onClick={handleReset} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '8px 16px', fontSize: 13, color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontFamily: 'inherit', marginTop: 8 }}>← Reset</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 12 }}>
              {generateIdeas(topic).map((idea, idx) => (
                <button key={idea.id} onClick={() => handleSelectIdea(idea)} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: isMobile ? '20px' : '28px', textAlign: 'left', cursor: 'pointer', transition: 'all 0.3s ease', opacity: 0, animation: `fadeSlideUp 0.4s ease forwards ${idx * 60}ms`, fontFamily: 'inherit', width: '100%' }}
                  onMouseEnter={e => { const el = e.currentTarget; el.style.background = 'rgba(20,184,166,0.05)'; el.style.borderColor = 'rgba(20,184,166,0.25)'; el.style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={e => { const el = e.currentTarget; el.style.background = 'rgba(255,255,255,0.02)'; el.style.borderColor = 'rgba(255,255,255,0.07)'; el.style.transform = 'translateY(0)'; }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 36, height: 36, background: 'rgba(20,184,166,0.1)', border: '1px solid rgba(20,184,166,0.2)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: '#14b8a6', fontWeight: 700 }}>{idea.icon}</div>
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 600, color: '#14b8a6', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{idea.type}</div>
                        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', marginTop: 1 }}>{idea.platform}</div>
                      </div>
                    </div>
                    <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.05)', padding: '3px 8px', borderRadius: 4 }}>{idea.readTime}</span>
                  </div>
                  <h3 style={{ fontSize: isMobile ? 15 : 17, fontWeight: 600, color: '#fff', lineHeight: 1.35, letterSpacing: '-0.02em', marginBottom: 8 }}>{idea.title}</h3>
                  <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', lineHeight: 1.55 }}>{idea.preview}</p>
                  <div style={{ marginTop: 16, fontSize: 12, color: '#14b8a6', fontWeight: 600, letterSpacing: '0.05em' }}>SELECT FORMAT →</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* DRAFT */}
        {step === 'draft' && draft && (
          <div>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: isMobile ? 24 : 48 }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#14b8a6', marginBottom: 12 }}>Step 03: Draft</div>
                <h2 style={{ fontSize: isMobile ? 32 : 48, fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1, color: '#fff' }}>{draft.type}</h2>
                <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.35)', marginTop: 10 }}>{draft.wordCount} words · Ready to use</p>
              </div>
              <button onClick={handleReset} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '8px 16px', fontSize: 13, color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontFamily: 'inherit', marginTop: 8 }}>← Reset</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 300px', gap: 20, alignItems: 'start' }}>
              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: isMobile ? '24px 20px' : '40px 44px' }}>
                <h3 style={{ fontSize: isMobile ? 17 : 22, fontWeight: 700, letterSpacing: '-0.02em', color: '#fff', marginBottom: 20, paddingBottom: 20, borderBottom: '1px solid rgba(255,255,255,0.07)' }}>{draft.title}</h3>
                <div style={{ fontSize: isMobile ? 14 : 15, color: 'rgba(255,255,255,0.75)', lineHeight: 1.8, whiteSpace: 'pre-wrap', letterSpacing: '0.01em' }}>{draft.fullContent}</div>
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
                <button onClick={handleCopy} style={{ width: '100%', background: copied ? 'rgba(20,184,166,0.1)' : 'rgba(255,255,255,0.04)', border: `1px solid ${copied ? 'rgba(20,184,166,0.3)' : 'rgba(255,255,255,0.08)'}`, borderRadius: 12, padding: '14px 20px', fontSize: 13, fontWeight: 600, color: copied ? '#14b8a6' : 'rgba(255,255,255,0.6)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontFamily: 'inherit', transition: 'all 0.3s ease' }}>
                  {copied ? '✓ Copied' : '⎘ Copy content'}
                </button>
                <button onClick={handleOptimize} style={{ width: '100%', background: 'linear-gradient(135deg, #14b8a6, #0d9488)', border: 'none', borderRadius: 12, padding: '14px 20px', fontSize: 13, fontWeight: 700, color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontFamily: 'inherit', letterSpacing: '0.05em', textTransform: 'uppercase', boxShadow: '0 0 24px rgba(20,184,166,0.25)', transition: 'all 0.3s ease' }}>
                  ✦ Optimize draft
                </button>
                <button onClick={handleReset} style={{ width: '100%', background: 'transparent', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '12px 20px', fontSize: 12, color: 'rgba(255,255,255,0.25)', cursor: 'pointer', fontFamily: 'inherit' }}>Start over</button>
              </div>
            </div>
          </div>
        )}

        {/* OPTIMIZED */}
        {step === 'optimized' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: isMobile ? 24 : 48 }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#14b8a6', marginBottom: 12 }}>Step 04: Optimized</div>
                <h2 style={{ fontSize: isMobile ? 32 : 48, fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1, color: '#fff' }}>Ready to<br />publish.</h2>
                <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.35)', marginTop: 10 }}>Fully optimized for engagement</p>
              </div>
              <button onClick={handleReset} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '8px 16px', fontSize: 13, color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontFamily: 'inherit', marginTop: 8 }}>← Reset</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 300px', gap: 20, alignItems: 'start' }}>
              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(20,184,166,0.15)', borderRadius: 16, padding: isMobile ? '24px 20px' : '40px 44px', boxShadow: '0 0 40px rgba(20,184,166,0.05)' }}>
                <div style={{ fontSize: isMobile ? 14 : 15, color: 'rgba(255,255,255,0.75)', lineHeight: 1.8, whiteSpace: 'pre-wrap', letterSpacing: '0.01em' }}>{optimized}</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, position: isMobile ? 'static' : 'sticky', top: 84 }}>
                {!isMobile && (
                  <div style={{ background: 'rgba(20,184,166,0.05)', border: '1px solid rgba(20,184,166,0.15)', borderRadius: 14, padding: 20 }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: '#14b8a6', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 16 }}>Optimizations</div>
                    {['Hook strength', 'Readability', 'CTA placement', 'Keywords', 'Engagement'].map((item, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 0' }}>
                        <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>{item}</span>
                        <span style={{ fontSize: 11, color: '#14b8a6', fontWeight: 600 }}>✓ Applied</span>
                      </div>
                    ))}
                  </div>
                )}
                <button onClick={handleCopy} style={{ width: '100%', background: copied ? 'rgba(20,184,166,0.1)' : 'linear-gradient(135deg, #14b8a6, #0d9488)', border: 'none', borderRadius: 12, padding: '14px 20px', fontSize: 13, fontWeight: 700, color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontFamily: 'inherit', letterSpacing: '0.05em', textTransform: 'uppercase', boxShadow: copied ? 'none' : '0 0 24px rgba(20,184,166,0.25)', transition: 'all 0.3s ease' }}>
                  {copied ? '✓ Copied to clipboard' : '⎘ Copy content'}
                </button>
                <button onClick={handleReset} style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '12px 20px', fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontFamily: 'inherit' }}>Create new content →</button>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: `20px ${px}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', maxWidth: 1100, margin: '0 auto', position: 'relative', zIndex: 1, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.05em' }}>Built by <span style={{ color: 'rgba(20,184,166,0.7)', fontWeight: 600 }}>Supreeth</span></span>
          <a href="https://github.com/YOUR-USERNAME/contentflow" target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.05em', textDecoration: 'none', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 6, padding: '3px 10px', transition: 'all 0.2s' }}
            onMouseEnter={e => { const el = e.currentTarget; el.style.color = '#fff'; el.style.borderColor = 'rgba(255,255,255,0.2)'; }}
            onMouseLeave={e => { const el = e.currentTarget; el.style.color = 'rgba(255,255,255,0.2)'; el.style.borderColor = 'rgba(255,255,255,0.08)'; }}
          >GitHub ↗</a>
        </div>
        <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.08em', fontFamily: 'monospace' }}>V2.S4 / LOOM</span>
      </footer>

      <style>{`
        @keyframes fadeSlideUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes loomPulse { 0%, 100% { transform: scale(1); opacity: 0.4; } 50% { transform: scale(1.5); opacity: 1; } }
        * { box-sizing: border-box; }
        input::placeholder { color: rgba(255,255,255,0.2); }
        button:active { transform: scale(0.98); }
        @media (max-width: 768px) { input { font-size: 16px !important; } }
      `}</style>
    </div>
  );
}