// src/App.jsx
import { useRef } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import ProductShowcase from './components/ProductShowcase';
import './App.css';

const presentationProducts = [
  {
    id: 1,
    title: 'Kit 1: Agenda, pluma y termo',
    description: 'Diseños únicos y resistentes para organizar el material. Acabado impecable resistente al agua y roces.',
    price: 15.00,
    imageUrl: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&q=80&w=1000'
  },
  {
    id: 2,
    title: 'Kit 2: Agenda, tarjetero, pluma y termo',
    description: 'Ilustraciones vibrantes y troquelado de alta precisión. Perfecto para decorar portátiles y libretas.',
    price: 8.50,
    imageUrl: 'https://images.unsplash.com/photo-1572375992501-4b0892d50c69?auto=format&fit=crop&q=80&w=1000'
  },
  {
    id: 3,
    title: 'Ki 3: Agenda y termo',
    description: 'Encuadernación de autor con hojas de alto gramaje, portadas exclusivas y texturizadas que destacan al tacto.',
    price: 22.90,
    imageUrl: 'https://images.unsplash.com/photo-1531346878377-a541e4a0ecce?auto=format&fit=crop&q=80&w=1000'
  },
  {
    id: 4,
    title: 'Agendas',
    description: 'Combinación exacta de estética y funcionalidad. Organizadores, notas adhesivas y bolígrafos minimalistas.',
    price: 34.00,
    imageUrl: 'https://images.unsplash.com/photo-1503694978374-8a2fa686963a?auto=format&fit=crop&q=80&w=1000'
  }
];

export default function App() {
  // Referencia al contenedor que tendrá el scroll magnético
  const scrollContainerRef = useRef(null);
  
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
        height: '100vh', 
        overflowY: 'scroll', 
        // Estas dos propiedades activan el "enfoque" al hacer scroll
        scrollSnapType: 'y mandatory',
        scrollBehavior: 'smooth'
      }}
    >
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
      <section className="hero is-fullheight" style={{ scrollSnapAlign: 'start' }}>
        <div className="hero-head">
          <nav className="navbar is-transparent" style={{ padding: '2rem 0' }}>
            <div className="container is-flex is-justify-content-center">
              <motion.img 
                initial={{ opacity: 0, y: -20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, amount: 0.5 }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
                src="/images/LOGO.png" 
                alt="Logotipo de la marca" 
                style={{ maxHeight: '80px', objectFit: 'contain' }} 
              />
            </div>
          </nav>
        </div>

        <div className="hero-body">
          <div className="container has-text-centered">
            <motion.div
              initial={{ opacity: 0, filter: 'blur(10px)', y: 40 }}
              whileInView={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
              viewport={{ once: false, amount: 0.5 }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            >
              <h1 className="title has-text-black is-1 has-text-weight-light" style={{ letterSpacing: '8px', fontSize: '4rem' }}>
                COLECCIÓN 2026
              </h1>
              <h2 className='is-size-4 has-text-black mt-0 pt-0' style={{ letterSpacing: '8px' }}>
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
          Diseño Editorial React
        </p>
      </footer>
    </div>
  );
}