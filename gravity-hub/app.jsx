const { useState, useEffect, useRef } = React;
const { Engine, Render, Runner, Bodies, Composite, Mouse, MouseConstraint, Events, Query, Body } = Matter;

const PROFILE = {
  name: "Otabek Mardanov",
  title: "Founder & Tech Architect",
  location: "Busan, South Korea 🇰🇷",
  bio: "Crafting immersive, tech-driven travel experiences in Busan. Bridging the gap between modern web development and local storytelling.",
  avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
};

const SOCIALS = [
  { id: 'soc-1', icon: '🌐', url: 'https://chillbusantours.com', color: 'hover:border-blue-500 hover:text-blue-400 hover:shadow-[0_0_15px_rgba(59,130,246,0.5)]' },
  { id: 'soc-2', icon: '💼', url: '#', color: 'hover:border-indigo-500 hover:text-indigo-400 hover:shadow-[0_0_15px_rgba(99,102,241,0.5)]' },
  { id: 'soc-3', icon: '📸', url: '#', color: 'hover:border-pink-500 hover:text-pink-400 hover:shadow-[0_0_15px_rgba(236,72,153,0.5)]' },
  { id: 'soc-4', icon: '🐦', url: '#', color: 'hover:border-sky-500 hover:text-sky-400 hover:shadow-[0_0_15px_rgba(14,165,233,0.5)]' },
];

const LINKS = [
  { id: 'link-1', title: 'Official Website', subtitle: 'chillbusantours.com', url: 'https://chillbusantours.com', icon: '🌍', accent: 'group-hover:text-blue-400' },
  { id: 'link-2', title: 'Project Focus', subtitle: 'Immersive UI/UX & Booking Systems', url: '#', icon: '💻', accent: 'group-hover:text-purple-400' },
  { id: 'link-3', title: 'Tech Stack', subtitle: 'React, Tailwind, Cursor', url: '#', icon: '⚡', accent: 'group-hover:text-emerald-400' },
];

const TAGS = [
  { id: 'tag-1', text: 'Automation (n8n & AI)', color: 'border-indigo-500/50 text-indigo-300 shadow-[0_0_10px_rgba(99,102,241,0.2)]' },
  { id: 'tag-2', text: 'Mobile-First Design', color: 'border-emerald-500/50 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.2)]' },
  { id: 'tag-3', text: 'Global Payments', color: 'border-orange-500/50 text-orange-300 shadow-[0_0_10px_rgba(249,115,22,0.2)]' },
  { id: 'tag-4', text: 'AI Content & Idols', color: 'border-purple-500/50 text-purple-300 shadow-[0_0_10px_rgba(168,85,247,0.2)]' },
];

function App() {
  const [gravityEnabled, setGravityEnabled] = useState(false);
  const engineRef = useRef(null);
  const runnerRef = useRef(null);
  const physicsItemsRef = useRef([]);

  useEffect(() => {
    if (!gravityEnabled) {
      document.body.style.overflow = '';
      return;
    }

    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.body.style.overflow = 'hidden';

    // --- Matter.js Setup ---
    const engine = Engine.create();
    engineRef.current = engine;

    const render = Render.create({
      element: document.getElementById('physics-canvas-container'),
      engine: engine,
      options: {
        width: window.innerWidth,
        height: window.innerHeight,
        wireframes: false,
        background: 'transparent',
        hasBounds: true
      }
    });

    const wallOptions = { isStatic: true, render: { visible: false } };
    const ground = Bodies.rectangle(window.innerWidth / 2, window.innerHeight + 50, window.innerWidth, 100, wallOptions);
    const ceiling = Bodies.rectangle(window.innerWidth / 2, -50, window.innerWidth, 100, wallOptions);
    const leftWall = Bodies.rectangle(-50, window.innerHeight / 2, 100, window.innerHeight, wallOptions);
    const rightWall = Bodies.rectangle(window.innerWidth + 50, window.innerHeight / 2, 100, window.innerHeight, wallOptions);

    Composite.add(engine.world, [ground, ceiling, leftWall, rightWall]);

    // Define items and their specific physics properties
    const itemsToPhysicalize = [
      { id: 'profile-header', type: 'rectangle', options: { density: 0.05, restitution: 0.4 } },
      ...SOCIALS.map(s => ({ id: s.id, type: 'circle', options: { density: 0.01, restitution: 0.8, frictionAir: 0.005 } })),
      ...LINKS.map(l => ({ id: l.id, type: 'rectangle', options: { density: 0.03, restitution: 0.5 } })),
      ...TAGS.map(t => ({ id: t.id, type: 'rectangle', options: { density: 0.02, restitution: 0.6, frictionAir: 0.03 } })),
      { id: 'gravity-btn', type: 'rectangle', options: { density: 0.02, restitution: 0.7 } }
    ];

    const physicsItems = itemsToPhysicalize.map((item) => {
      const element = document.getElementById(item.id);
      if (!element) return null;

      const rect = element.getBoundingClientRect();
      const scrollX = window.scrollX;
      const scrollY = window.scrollY;
      const x = rect.left + rect.width / 2 + scrollX;
      const y = rect.top + rect.height / 2 + scrollY;

      let body;
      if (item.type === 'circle') {
          body = Bodies.circle(x, y, rect.width / 2, { ...item.options, render: { visible: false } });
      } else {
          body = Bodies.rectangle(x, y, rect.width, rect.height, { ...item.options, render: { visible: false } });
      }

      // Pre-apply absolute styling relative to body coordinate center
      element.style.position = 'absolute';
      element.style.left = '0px';
      element.style.top = '0px';
      element.style.width = `${rect.width}px`;
      element.style.height = `${rect.height}px`;
      element.style.zIndex = '50';
      element.style.margin = '0';

      return { body, element, origUrl: item.url };
    }).filter(Boolean);

    Composite.add(engine.world, physicsItems.map(p => p.body));
    physicsItemsRef.current = physicsItems;

    // Mouse Interaction
    const mouse = Mouse.create(render.canvas);
    const mouseConstraint = MouseConstraint.create(engine, {
      mouse: mouse,
      constraint: { stiffness: 0.2, render: { visible: false } }
    });
    Composite.add(engine.world, mouseConstraint);
    render.mouse = mouse;

    let isDragging = false;
    Events.on(mouseConstraint, 'startdrag', () => { isDragging = true; });
    Events.on(mouseConstraint, 'enddrag', () => { setTimeout(() => { isDragging = false; }, 50); });

    // Click handler to open links if not dragging
    Events.on(mouseConstraint, 'mouseup', (event) => {
      if (isDragging) return;
      const mousePos = event.mouse.position;
      const clickedBodies = Query.point(Composite.allBodies(engine.world), mousePos);
      if (clickedBodies.length > 0) {
        const clickedBody = clickedBodies[0];
        const match = physicsItemsRef.current.find(p => p.body === clickedBody);
        
        let targetUrl = null;
        if(match && match.element.id.startsWith('soc-')) {
            targetUrl = SOCIALS.find(s=>s.id === match.element.id)?.url;
        } else if(match && match.element.id.startsWith('link-')) {
            targetUrl = LINKS.find(s=>s.id === match.element.id)?.url;
        }

        if (targetUrl && targetUrl !== '#') {
          window.open(targetUrl, '_blank', 'noopener,noreferrer');
        }
      }
    });

    // Update DOM on tick
    Events.on(engine, 'afterUpdate', () => {
      physicsItemsRef.current.forEach(({ body, element }) => {
        const { x, y } = body.position;
        element.style.transform = `translate(${x - element.offsetWidth / 2}px, ${y - element.offsetHeight / 2}px) rotate(${body.angle}rad)`;
      });
    });

    // Handle Window Resize
    const handleResize = () => {
      render.canvas.width = window.innerWidth;
      render.canvas.height = window.innerHeight;
      Body.setPosition(ground, { x: window.innerWidth / 2, y: window.innerHeight + 50 });
      Body.setPosition(rightWall, { x: window.innerWidth + 50, y: window.innerHeight / 2 });
    };
    window.addEventListener('resize', handleResize);

    Render.run(render);
    const runner = Runner.create();
    runnerRef.current = runner;
    Runner.run(runner, engine);

    return () => {
      window.removeEventListener('resize', handleResize);
      Render.stop(render);
      Runner.stop(runnerRef.current);
      Engine.clear(engineRef.current);
      if (render.canvas) render.canvas.remove();
    };
  }, [gravityEnabled]);

  return (
    <div className="min-h-screen font-sans bg-[#030303] text-gray-200 flex items-center justify-center p-4 md:p-10 relative overflow-hidden">
        
      <style>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: #030303; }
        ::-webkit-scrollbar-thumb { background: #333; border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: #555; }
      `}</style>

      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-600/20 rounded-full mix-blend-screen filter blur-[100px] animate-blob pointer-events-none"></div>
      <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-purple-600/20 rounded-full mix-blend-screen filter blur-[100px] animate-blob animation-delay-2000 pointer-events-none"></div>
      <div className="absolute -bottom-10 left-1/3 w-72 h-72 bg-emerald-600/20 rounded-full mix-blend-screen filter blur-[100px] animate-blob animation-delay-4000 pointer-events-none"></div>
      
      {/* Floating tags around the main card */}
      <div className="absolute inset-0 pointer-events-none z-0 hidden lg:block">
         {TAGS.map((tag, index) => {
             const positions = [
                 { top: '15%', left: '15%' },
                 { top: '25%', right: '15%' },
                 { bottom: '20%', left: '15%' },
                 { bottom: '25%', right: '15%' }
             ];
             const pos = positions[index % positions.length];
             return (
                <div 
                    key={tag.id} 
                    id={tag.id}
                    className={`absolute px-5 py-2.5 rounded-full font-medium text-sm backdrop-blur-xl bg-black/40 border transition-all ${tag.color} transform -rotate-2 hover:rotate-0 hover:scale-105 select-none ${!gravityEnabled ? 'animate-pulse' : ''}`}
                    style={{ ...pos, pointerEvents: gravityEnabled ? 'none' : 'auto', animationDuration: `${3 + index}s` }}
                >
                    {tag.text}
                </div>
             );
         })}
      </div>

      {/* Main Glassmorphic Card Container */}
      <div className={`relative z-10 w-full max-w-lg bg-[#ffffff05] backdrop-blur-2xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.5)] rounded-[2.5rem] p-8 md:p-12 transition-all duration-700 ${gravityEnabled ? 'ring-0 shadow-none bg-transparent border-transparent backdrop-blur-none' : ''}`}>
        
        {/* Profile Header */}
        <div id="profile-header" className="flex flex-col items-center text-center mb-10 select-none">
            <div className="relative mb-6 group cursor-pointer">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 rounded-full blur opacity-25 group-hover:opacity-60 transition duration-500"></div>
                <img src={PROFILE.avatar} alt="Avatar" className="relative w-28 h-28 rounded-full border-2 border-white/20 shadow-2xl object-cover transform transition duration-500 group-hover:scale-[1.03]"/>
            </div>
            
            <h1 className="text-3xl font-extrabold tracking-tight mb-2 bg-clip-text text-transparent bg-gradient-to-r from-gray-100 to-gray-400">
                {PROFILE.name}
            </h1>
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] mb-3 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                {PROFILE.title}
            </h2>
            <div className="flex items-center gap-1.5 border border-white/10 bg-white/5 text-gray-300 text-xs font-medium px-4 py-1.5 rounded-full mb-5 shadow-inner">
                <span>📍</span> {PROFILE.location}
            </div>
            <p className="text-gray-400 font-medium text-sm leading-relaxed max-w-sm">
                "{PROFILE.bio}"
            </p>
        </div>

        {/* Social Links Row */}
        <div className="flex justify-center gap-5 mb-10">
            {SOCIALS.map(soc => (
                <a 
                    key={soc.id}
                    id={soc.id}
                    href={!gravityEnabled ? soc.url : undefined}
                    target="_blank"
                    className={`w-12 h-12 flex items-center justify-center rounded-full text-white/70 text-xl bg-white/5 border border-white/10 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:bg-white/10 ${soc.color} select-none`}
                    style={{ pointerEvents: gravityEnabled ? 'none' : 'auto' }}
                >
                    {soc.icon}
                </a>
            ))}
        </div>

        {/* Main Project Links */}
        <div className="flex flex-col gap-4 mb-10">
            {LINKS.map(link => (
                <a
                    key={link.id}
                    id={link.id}
                    href={!gravityEnabled ? link.url : undefined}
                    target="_blank"
                    className="group relative flex items-center p-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 shadow-lg rounded-2xl transition-all duration-300 hover:scale-[1.02] select-none text-left overflow-hidden"
                    style={{ pointerEvents: gravityEnabled ? 'none' : 'auto' }}
                >
                    {/* Hover Glow Background */}
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-purple-500/0 to-indigo-500/0 group-hover:from-blue-500/10 group-hover:to-purple-500/10 transition-all duration-500"></div>

                    <div className={`w-12 h-12 flex-shrink-0 flex items-center justify-center bg-black/30 border border-white/5 rounded-full text-2xl mr-4 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 ${link.accent} text-gray-300`}>
                        {link.icon}
                    </div>
                    <div className="flex-grow z-10">
                        <h3 className="text-lg font-bold text-gray-100 group-hover:text-white transition-colors">{link.title}</h3>
                        <p className="text-xs text-gray-400 font-medium mt-0.5">{link.subtitle}</p>
                    </div>
                    
                    {/* Hover Arrow */}
                    <div className="opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 z-10 text-gray-400 group-hover:text-white">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                    </div>
                </a>
            ))}
        </div>

        {/* Anti-Gravity Toggle Button */}
        <div className="flex justify-center mt-4">
             <button 
                id="gravity-btn"
                onClick={() => setGravityEnabled(true)}
                className={`relative group bg-transparent text-white font-bold py-3.5 px-8 rounded-full border border-white/20 shadow-[0_0_20px_rgba(255,255,255,0.05)] transition-all hover:border-white/40 active:scale-95 flex items-center gap-3 select-none overflow-hidden ${gravityEnabled ? 'pointer-events-none opacity-0' : ''}`}
            >
                {/* Button glowing background */}
                <div className="absolute inset-0 bg-gradient-to-r from-gray-800 to-gray-900 group-hover:from-gray-700 group-hover:to-gray-800 transition-colors -z-10"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 opacity-0 group-hover:opacity-100 transition-opacity -z-10 blur-md"></div>
                
                <span className="text-xl group-hover:animate-bounce">🌌</span> 
                <span className="tracking-wide text-sm">Activate Zero Gravity</span>
            </button>
        </div>

      </div>

      {/* Container for Matter.js Canvas */}
      <div 
        id="physics-canvas-container" 
        className="absolute inset-0 select-none overflow-hidden" 
        style={{ pointerEvents: gravityEnabled ? 'auto' : 'none', zIndex: gravityEnabled ? 40 : -10 }}
      />
      
      {/* Mobile Tags Render Overlay */}
      <div className="lg:hidden absolute inset-0 pointer-events-none z-0">
          {TAGS.map((tag, index) => {
             const positions = [
                 { top: '3%', left: '5%' },
                 { top: '12%', right: '5%' },
                 { bottom: '10%', left: '5%' },
                 { bottom: '3%', right: '5%' }
             ];
             const pos = positions[index % positions.length];
             return (
                <div 
                    key={`mob-${tag.id}`} 
                    id={`mob-${tag.id}`} 
                    className={`absolute text-xs px-3 py-1.5 rounded-full font-medium backdrop-blur-xl bg-black/50 border transition-all ${tag.color} opacity-80 ${!gravityEnabled ? 'animate-pulse' : 'hidden'}`}
                    style={pos}
                >
                    {tag.text}
                </div>
             );
         })}
      </div>

    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
