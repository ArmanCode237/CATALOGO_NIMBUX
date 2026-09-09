// src/components/InteractiveCatalog.jsx
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

// Físicas de resorte para un movimiento fluido y premium
const transitionSpring = { type: "spring", stiffness: 100, damping: 20 };

const imageVariants = {
  enter: (direction) => ({ x: direction > 0 ? 300 : -300, opacity: 0, scale: 0.9 }),
  center: { x: 0, opacity: 1, scale: 1, transition: transitionSpring },
  exit: (direction) => ({ x: direction < 0 ? 300 : -300, opacity: 0, scale: 0.9, transition: transitionSpring })
};

const textVariants = {
  enter: (direction) => ({ y: direction > 0 ? 50 : -50, opacity: 0 }),
  center: { y: 0, opacity: 1, transition: { ...transitionSpring, delay: 0.1 } },
  exit: (direction) => ({ y: direction < 0 ? 50 : -50, opacity: 0, transition: transitionSpring })
};

export default function InteractiveCatalog({ products }) {
  const [[page, direction], setPage] = useState([0, 0]);

  // Asegura que el índice sea cíclico (loop)
  const productIndex = Math.abs(page % products.length);
  const currentProduct = products[productIndex];

  const paginate = (newDirection) => {
    setPage([page + newDirection, newDirection]);
  };

  return (
    <div 
      style={{ 
        height: '100vh', 
        width: '100%', 
        backgroundColor: currentProduct.bgColor, // El fondo cambia dinámicamente
        transition: 'background-color 0.8s ease',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center'
      }}
    >
      <div className="container" style={{ position: 'relative', height: '70vh', width: '100%' }}>
        <AnimatePresence initial={false} custom={direction}>
          <div 
            key={page}
            className="columns is-vcentered m-0" 
            style={{ position: 'absolute', width: '100%', height: '100%' }}
          >
            {/* TEXTO - Izquierda */}
            <motion.div 
              className="column is-5 is-offset-1"
              custom={direction}
              variants={textVariants}
              initial="enter"
              animate="center"
              exit="exit"
              style={{ zIndex: 10 }}
            >
              <p className="is-size-7 is-uppercase tracking-wide mb-3 has-text-weight-bold" style={{ opacity: 0.5 }}>
                {currentProduct.subtitle}
              </p>
              <h1 className="title is-1 has-text-weight-bold" style={{ fontSize: '3.5rem', lineHeight: '1.1' }}>
                {currentProduct.title}
              </h1>
              <p className="subtitle is-5 mt-4" style={{ lineHeight: '1.8', opacity: 0.8 }}>
                {currentProduct.description}
              </p>
              <div className="mt-6 is-flex is-align-items-center">
                <p className="title is-3 mb-0 mr-5">${currentProduct.price.toFixed(2)}</p>
                <button className="button is-dark is-rounded is-medium" style={{ padding: '0 2.5rem' }}>
                  Añadir al carrito
                </button>
              </div>
            </motion.div>

            {/* IMAGEN PNG - Derecha */}
            <motion.div 
              className="column is-6 is-flex is-justify-content-center"
              custom={direction}
              variants={imageVariants}
              initial="enter"
              animate="center"
              exit="exit"
            >
              <img 
                src={currentProduct.image} 
                alt={currentProduct.title} 
                style={{ 
                  maxHeight: '65vh', 
                  objectFit: 'contain',
                  // Esto le da volumen al PNG transparente
                  filter: 'drop-shadow(0px 25px 35px rgba(0,0,0,0.15))' 
                }} 
              />
            </motion.div>
          </div>
        </AnimatePresence>
      </div>

      {/* CONTROLES DE NAVEGACIÓN */}
      <div style={{ position: 'absolute', bottom: '5%', left: '0', right: '0', display: 'flex', justifyContent: 'center', gap: '2rem', zIndex: 20 }}>
        <button 
          className="button is-white is-rounded" 
          onClick={() => paginate(-1)}
          style={{ width: '50px', height: '50px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}
        >
          <FaChevronLeft />
        </button>
        
        {/* Indicadores de paginación (Dots) */}
        <div className="is-flex is-align-items-center" style={{ gap: '0.5rem' }}>
          {products.map((_, idx) => (
            <div 
              key={idx} 
              style={{ 
                width: idx === productIndex ? '24px' : '8px', 
                height: '8px', 
                borderRadius: '4px',
                backgroundColor: '#000',
                opacity: idx === productIndex ? 0.8 : 0.2,
                transition: 'all 0.3s ease',
                cursor: 'pointer'
              }}
              onClick={() => {
                const newDirection = idx > productIndex ? 1 : -1;
                setPage([idx, newDirection]);
              }}
            />
          ))}
        </div>

        <button 
          className="button is-white is-rounded" 
          onClick={() => paginate(1)}
          style={{ width: '50px', height: '50px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}
        >
          <FaChevronRight />
        </button>
      </div>
    </div>
  );
}