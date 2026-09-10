// src/App.jsx
import { useRef, useEffect } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import ProductShowcase from './components/ProductShowcase';
import SnowEffect from './components/SnowEffect';
import presentationProducts from './data/products.json';
import './App.css';

export default function App() {
  // Referencia al contenedor que tendrá el scroll magnético
  const scrollContainerRef = useRef(null);

  // --- SISTEMA DE PRECARGA GLOBAL (PRELOAD) ---
  useEffect(() => {
    presentationProducts.forEach((product) => {
      const imagesToPreload = product.imageUrls || (product.imageUrl ? [product.imageUrl] : []);
      imagesToPreload.forEach((url) => {
        const img = new Image();
        img.src = url;
      });
    });
  }, []);
  // --------------------------------------------
  
  // Conectamos el progreso del scroll a nuestro contenedor específico
  const { scrollYProgress } = useScroll({ container: scrollContainerRef });
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
<div 
      ref={scrollContainerRef}
      className="premium-dynamic-bg"
      style={{ 
        height: '100dvh',
        overflowY: 'scroll', 
        scrollSnapType: 'y mandatory',
        scrollBehavior: 'smooth',
        WebkitOverflowScrolling: 'touch',
        position: 'relative' // Asegura el anclaje de los elementos absolutos
      }}
    >
      {/* 2. Colocamos el efecto de nieve sutilmente flotando de fondo */}
      <SnowEffect />

      {/* Barra de progreso global */}
      <motion.div
        style={{
          scaleX,
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          backgroundColor: '#000000',
          transformOrigin: '0%',
          zIndex: 50
        }}
      />

      {/* PORTADA - Alineación de scroll al inicio */}
      <section 
        className="hero" 
        style={{ 
          scrollSnapAlign: 'start', 
          minHeight: '100dvh',
          display: 'flex',
          flexDirection: 'column' /* Restaura el comportamiento de pantalla completa */
        }}
      >
        <div className="hero-head">
          <nav className="navbar is-transparent" style={{ padding: '2rem 0' }}>
            <div className="container is-flex is-justify-content-center">
              <motion.img 
                initial={{ opacity: 0, y: -20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, amount: 0.5 }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
                src="/images/LOGO_1.png" 
                alt="Logotipo de la marca" 
                style={{ maxHeight: '80px', objectFit: 'contain' }} 
              />
            </div>
          </nav>
        </div>

        {/* Agregamos Flexbox al hero-body para centrar el contenido verticalmente */}
        <div className="hero-body" style={{ flexGrow: 1, display: 'flex', alignItems: 'center', width: '100%' }}>
          <div className="container has-text-centered">
            <motion.div
              initial={{ opacity: 0, filter: 'blur(10px)', y: 40 }}
              whileInView={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
              viewport={{ once: false, amount: 0.5 }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            >
              <h1 
                className="title has-text-black has-text-weight-light" 
                style={{ 
                  letterSpacing: 'clamp(4px, 2vw, 8px)',
                  fontSize: 'clamp(2.5rem, 8vw, 4rem)' 
                }}
              >
                COLECCIÓN 2026
              </h1>
              <h2 
                className='is-size-4 has-text-black mt-0 pt-0' 
                style={{ 
                  letterSpacing: 'clamp(3px, 1.5vw, 8px)' 
                }}
              >
                REGALOS CORPORATIVOS
              </h2>
              <motion.div 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: false, amount: 0.5 }}
                transition={{ delay: 0.5, duration: 1 }}
                className="mt-6"
              >
                <p className="has-text-grey is-size-7 is-uppercase tracking-wide" style={{ letterSpacing: '3px' }}>
                  Desliza para explorar
                </p>
                <motion.div 
                  animate={{ y: [0, 8, 0] }}
                  transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                  className="mt-4"
                >
                  <span style={{ fontSize: '1.5rem', color: '#ccc' }}>↓</span>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* SECCIONES DE PRODUCTOS */}
      {presentationProducts.map((product, index) => (
        <ProductShowcase key={product.id} product={product} index={index} />
      ))}
      
      {/* FOOTER - Alineación de scroll al final */}
      <footer className="section is-medium has-text-centered" style={{ scrollSnapAlign: 'end', minHeight: '30vh' }}>
        <p className="has-text-grey-light is-size-7 is-uppercase" style={{ letterSpacing: '2px' }}>
          @ 2026 NIMBUX - TODOS LOS DERECHOS RESERVADOS
        </p>
      </footer>
    </div>
  );
}