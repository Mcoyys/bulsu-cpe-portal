import React, { useState, useEffect } from 'react';

export default function FloatingRobot() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e) => {
      // The 0.05 multiplier makes it a "lazy" follow so it feels like it's floating
      const x = (e.clientX - window.innerWidth / 2) * 0.05;
      const y = (e.clientY - window.innerHeight / 2) * 0.05;
      setPosition({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div 
      className={`robot-container ${isHovered ? 'dancing' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`
      }}
    >
      <style>{`
        .robot-container {
          position: fixed;
          bottom: 30px;
          right: 30px;
          font-size: 3.5rem;
          cursor: pointer;
          z-index: 9999;
          user-select: none;
          filter: drop-shadow(0 10px 15px rgba(0,0,0,0.2));
          transition: transform 0.2s ease-out;
        }

        /* The Idle Floating Animation */
        .robot-container:not(.dancing) {
          animation: float 3s ease-in-out infinite;
        }

        /* The "Dancing" Robot Animation on Hover */
        .dancing {
          animation: dance 0.5s linear infinite;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }

        @keyframes dance {
          0% { transform: rotate(0deg) scale(1.2); }
          25% { transform: rotate(15deg) scale(1.3); }
          50% { transform: rotate(0deg) scale(1.2); }
          75% { transform: rotate(-15deg) scale(1.3); }
          100% { transform: rotate(0deg) scale(1.2); }
        }

        .robot-bubble {
          position: absolute;
          top: -40px;
          left: -40px;
          background: white;
          padding: 5px 12px;
          border-radius: 15px;
          font-size: 0.8rem;
          font-weight: bold;
          color: #800000;
          box-shadow: 0 4px 10px rgba(0,0,0,0.1);
          white-space: nowrap;
          opacity: 0;
          transition: 0.3s;
          pointer-events: none;
        }

        .robot-container:hover .robot-bubble {
          opacity: 1;
          top: -50px;
        }
      `}</style>
      
      <div className="robot-bubble">
        {isHovered ? "LET'S BUILD! ⚙️" : "Hi Daeniel! 👋"}
      </div>
      
      <span>🤖</span>
    </div>
  );
}import React, { useState, useEffect } from 'react';

export default function FloatingRobot() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e) => {
      // The 0.05 multiplier makes it a "lazy" follow so it feels like it's floating
      const x = (e.clientX - window.innerWidth / 2) * 0.05;
      const y = (e.clientY - window.innerHeight / 2) * 0.05;
      setPosition({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div 
      className={`robot-container ${isHovered ? 'dancing' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`
      }}
    >
      <style>{`
        .robot-container {
          position: fixed;
          bottom: 30px;
          right: 30px;
          font-size: 3.5rem;
          cursor: pointer;
          z-index: 9999;
          user-select: none;
          filter: drop-shadow(0 10px 15px rgba(0,0,0,0.2));
          transition: transform 0.2s ease-out;
        }

        /* The Idle Floating Animation */
        .robot-container:not(.dancing) {
          animation: float 3s ease-in-out infinite;
        }

        /* The "Dancing" Robot Animation on Hover */
        .dancing {
          animation: dance 0.5s linear infinite;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }

        @keyframes dance {
          0% { transform: rotate(0deg) scale(1.2); }
          25% { transform: rotate(15deg) scale(1.3); }
          50% { transform: rotate(0deg) scale(1.2); }
          75% { transform: rotate(-15deg) scale(1.3); }
          100% { transform: rotate(0deg) scale(1.2); }
        }

        .robot-bubble {
          position: absolute;
          top: -40px;
          left: -40px;
          background: white;
          padding: 5px 12px;
          border-radius: 15px;
          font-size: 0.8rem;
          font-weight: bold;
          color: #800000;
          box-shadow: 0 4px 10px rgba(0,0,0,0.1);
          white-space: nowrap;
          opacity: 0;
          transition: 0.3s;
          pointer-events: none;
        }

        .robot-container:hover .robot-bubble {
          opacity: 1;
          top: -50px;
        }
      `}</style>
      
      <div className="robot-bubble">
        {isHovered ? "LET'S BUILD! ⚙️" : "Hi Daeniel! 👋"}
      </div>
      
      <span>🤖</span>
    </div>
  );
}