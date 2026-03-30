import React, { useState, useEffect, useRef } from 'react';
import Matter from 'matter-js';

const LINKS = [
  { id: 1, title: 'GitHub', url: 'https://github.com', color: 'bg-blue-500' },
  { id: 2, title: 'LinkedIn', url: 'https://linkedin.com', color: 'bg-blue-700' },
  { id: 3, title: 'Portfolio', url: 'https://example.com', color: 'bg-emerald-500' },
  { id: 4, title: 'Twitter', url: 'https://twitter.com', color: 'bg-gray-800' },
  ];

export default function App() {
    const [gravityEnabled, setGravityEnabled] = useState(false);
    const sceneRef = useRef(null);
    const engineRef = useRef(null);

  useEffect(() => {
        if (!gravityEnabled) return;
        const { Engine, Render, Runner, Bodies, Composite, Mouse, MouseConstraint } = Matter;
        const engine = Engine.create();
        engineRef.current = engine;
        const render = Render.create({
                element: sceneRef.current,
                engine: engine,
                options: { width: window.innerWidth, height: window.innerHeight, wireframes: false, background: 'transparent' }
        });
        const ground = Bodies.rectangle(window.innerWidth / 2, window.innerHeight + 50, window.innerWidth, 100, { isStatic: true });
        Composite.add(engine.world, [ground]);
        Render.run(render);
        const runner = Runner.create();
        Runner.run(runner, engine);
        return () => {
                Render.stop(render);
                Runner.stop(runner);
                Engine.clear(engine);
                render.canvas.remove();
        };
  }, [gravityEnabled]);

  return (
        <div className="min-h-screen relative font-sans flex flex-col items-center">
              <h1 className="text-5xl font-black text-slate-800 pt-32 mb-10"> My Gravity Hub </h1>h1>
              <button onClick={() => setGravityEnabled(true)} className="bg-blue-600 text-white py-2 px-8 rounded-md"> I'm Feeling Lucky </button>button>
          {!gravityEnabled && (
                  <div className="grid grid-cols-2 gap-6 mt-10">
                    {LINKS.map(link => (
                                <a key={link.id} href={link.url} className={`${link.color} text-white p-8 rounded-2xl`}> {link.title} </a>a>
                              ))}
                  </div>div>
              )}
              <div ref={sceneRef} className="absolute inset-0 z-0" style={{ display: gravityEnabled ? 'block' : 'none' }} />
        </div>div>
      );
}
</div>
