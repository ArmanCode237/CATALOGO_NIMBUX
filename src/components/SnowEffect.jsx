// src/components/SnowEffect.jsx
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const SNOWFLAKE_COUNT = 25; // Cantidad sutil para no saturar

export default function SnowEffect() {
  const [flakes, setFlakes] = useState([]);

  useEffect(() => {
    const generatedFlakes = Array.from({ length: SNOWFLAKE_COUNT }).map((_, i) => ({
      id: i,
      x: Math.random() * 100, // Posición horizontal en porcentaje
      size: Math.random() * 6 + 4, // Tamaño entre 4px y 10px
      duration: Math.random() * 12 + 8, // Velocidad de caída entre 8s y 20s
      delay: Math.random() * 5, // Retraso aleatorio al iniciar
      opacity: Math.random() * 0.4 + 0.15, // Opacidad sutil
      drift: (Math.random() - 0.5) * 40, // Ligero movimiento lateral
    }));
    setFlakes(generatedFlakes);
  }, []);

  return (
    <div 
      style={{ 
        position: 'absolute', 
        top: 0, 
        left: 0, 
        width: '100%', 
        height: '100%', 
        overflow: 'hidden', 
        pointerEvents: 'none', // Permite hacer clic a través de la nieve
        zIndex: 1 // Por encima del fondo pero por debajo del contenido principal
      }}
    >
      {flakes.map((flake) => (
        <motion.div
          key={flake.id}
          initial={{ y: -20, x: `${flake.x}vw`, opacity: 0 }}
          animate={{ 
            y: ['0vh', '105vh'], 
            x: [`${flake.x}vw`, `${flake.x + flake.drift}vw`],
            opacity: [0, flake.opacity, flake.opacity, 0]
          }}
          transition={{
            duration: flake.duration,
            repeat: Infinity,
            delay: flake.delay,
            ease: "easeInOut"
          }}
          style={{
            position: 'absolute',
            width: `${flake.size}px`,
            height: `${flake.size}px`,
            backgroundColor: '#29baef',
            borderRadius: '50%',
            boxShadow: '0 0 8px rgba(255, 255, 255, 0.6)',
          }}
        />
      ))}
    </div>
  );
}