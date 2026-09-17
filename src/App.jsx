// src/App.jsx
import { useRef, useEffect, useState } from 'react';
import { motion, useScroll, useSpring, AnimatePresence } from 'framer-motion';
import ProductShowcase from './components/ProductShowcase';
import SnowEffect from './components/SnowEffect';
import presentationProducts from './data/products.json';
import './App.css';

export default function App() {
  const scrollContainerRef = useRef(null);

  // --- ESTADOS PARA EL MODAL DE ASESORÍA ---
  const [isAssessmentOpen, setIsAssessmentOpen] = useState(false);
  const [assessmentStep, setAssessmentStep] = useState(0);
  const [isSubmittingAssessment, setIsSubmittingAssessment] = useState(false);
  
  // NUEVO: Estado para bloquear el cierre del modal si vienen de la liga especial
  const [isStrictAssessment, setIsStrictAssessment] = useState(false);

  // Estado con los valores del select
  const [assessmentData, setAssessmentData] = useState({
    presupuesto: '$15,000 - $25,000 MXN',
    volumen: '20 - 50 piezas',
    tiempo: 'Noviembre',
    etapa: 'Ya tenemos presupuesto y buscamos proveedor para realizar el pedido',
    tipo: 'Kits Corporativos',
    nombre: '',
    empresa: '',
    correo: '',
    whatsapp: ''
  });

  // ESTADO: Para almacenar los textos personalizados cuando seleccionan "Otro"
  const [customAssessmentData, setCustomAssessmentData] = useState({
    presupuesto: '',
    volumen: '',
    tiempo: '',
    etapa: '',
    tipo: ''
  });

  // Detección de enlace personalizado (www.tusitio.com/#asesoria)
  useEffect(() => {
    if (window.location.hash === '#asesoria' || window.location.search.includes('asesoria=true')) {
      setIsStrictAssessment(true); // Activa el modo obligatorio
      setIsAssessmentOpen(true);
    }
  }, []);

  const handleAssessmentChange = (e) => {
    const { name, value } = e.target;
    setAssessmentData({ ...assessmentData, [name]: value });
  };

  const handleCustomAssessmentChange = (e) => {
    const { name, value } = e.target;
    setCustomAssessmentData({ ...customAssessmentData, [name]: value });
  };

  // Función modificada para respetar el bloqueo
  const handleCloseRequest = () => {
    // Si es modo estricto y NO ha llegado al paso de éxito (paso 2), impedimos cerrar
    if (isStrictAssessment && assessmentStep !== 2) {
      return; 
    }
    resetAssessmentAndClose();
  };

  const resetAssessmentAndClose = () => {
    setIsAssessmentOpen(false);
    if (window.location.hash === '#asesoria') {
      window.history.pushState('', document.title, window.location.pathname + window.location.search);
    }
    
    // Una vez que cierran (después del éxito), liberamos el modo estricto para que puedan navegar normal
    setIsStrictAssessment(false);

    setTimeout(() => {
      setAssessmentStep(0);
      setAssessmentData({
        presupuesto: '$15,000 - $25,000 MXN',
        volumen: '20 - 50 piezas',
        tiempo: 'Noviembre',
        etapa: 'Ya tenemos presupuesto y buscamos proveedor para realizar el pedido',
        tipo: 'Kits Corporativos',
        nombre: '',
        empresa: '',
        correo: '',
        whatsapp: ''
      });
      setCustomAssessmentData({
        presupuesto: '',
        volumen: '',
        tiempo: '',
        etapa: '',
        tipo: ''
      });
    }, 500);
  };

  const handleAssessmentSubmit = async (e) => {
    e.preventDefault();

    // --- VALIDACIONES DE DATOS ---
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(assessmentData.correo)) {
      alert("Por favor, introduce una dirección de correo electrónico válida.");
      return;
    }

    // Valida que el WhatsApp contenga entre 10 y 15 números. Permite un '+' al inicio.
    const phoneRegex = /^\+?[0-9]{10,15}$/;
    // Limpiamos los espacios en blanco por si el usuario los escribió
    const cleanWhatsapp = assessmentData.whatsapp.replace(/\s+/g, '');
    if (!phoneRegex.test(cleanWhatsapp)) {
      alert("Por favor, introduce un número de WhatsApp válido (solo números, mínimo 10 dígitos).");
      return;
    }

    setIsSubmittingAssessment(true);

    const currentDate = new Date();
    const formattedDate = currentDate.toLocaleDateString('es-MX');
    const formattedTime = currentDate.toLocaleTimeString('es-MX');
    const nombreEmpresa = assessmentData.empresa.trim() || 'Empresa_No_Especificada';
    const customId = `${nombreEmpresa} - ${formattedDate} - ${formattedTime}`;

    const finalData = {
      asesoriaId: customId, 
      ...assessmentData,
      whatsapp: cleanWhatsapp, // Enviamos el número limpio a Netlify
      presupuesto: assessmentData.presupuesto === 'Otro' ? customAssessmentData.presupuesto : assessmentData.presupuesto,
      volumen: assessmentData.volumen === 'Otro' ? customAssessmentData.volumen : assessmentData.volumen,
      tiempo: assessmentData.tiempo === 'Otro' ? customAssessmentData.tiempo : assessmentData.tiempo,
      tipo: assessmentData.tipo === 'Otro' ? customAssessmentData.tipo : assessmentData.tipo,
      etapa: assessmentData.etapa === 'Otro' ? customAssessmentData.etapa : assessmentData.etapa,
    };

    const formPayload = new URLSearchParams();
    formPayload.append('form-name', 'asesoria');
    Object.keys(finalData).forEach(key => formPayload.append(key, finalData[key]));

    try {
      await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formPayload.toString()
      });
      setAssessmentStep(2);
    } catch (error) {
      console.error("Error al procesar asesoría:", error);
      alert("Hubo un error al enviar tu solicitud. Por favor, intenta de nuevo.");
    } finally {
      setIsSubmittingAssessment(false);
    }
  };

  // Sistema de precarga
  useEffect(() => {
    presentationProducts.forEach((product) => {
      const imagesToPreload = product.imageUrls || (product.imageUrl ? [product.imageUrl] : []);
      imagesToPreload.forEach((url) => {
        const img = new Image();
        img.src = url;
      });
    });
  }, []);
  
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
        position: 'relative' 
      }}
    >
      <SnowEffect />

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

      {/* PORTADA */}
      <section 
        className="hero" 
        style={{ 
          scrollSnapAlign: 'start', 
          minHeight: '100dvh',
          display: 'flex',
          flexDirection: 'column' 
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
                <div className="mb-6">
                  {/* Botón manual para abrir el modal (no aplica el bloqueo estricto) */}
                  <button 
                    onClick={() => {
                      setIsStrictAssessment(false); // Reseteamos por si acaso
                      setIsAssessmentOpen(true);
                    }}
                    className="button is-black is-outlined is-medium" 
                    style={{ 
                      borderRadius: '0', 
                      padding: '1.4rem 2rem', 
                      transition: 'all 0.3s ease', 
                      border: '1px solid #ccc',
                      letterSpacing: '2px',
                      fontSize: '0.85rem'
                    }}
                  >
                    SOLICITAR ASESORÍA PERSONALIZADA
                  </button>
                </div>

                <p className="has-text-grey is-size-7 is-uppercase tracking-wide mt-6" style={{ letterSpacing: '3px' }}>
                  Desliza para explorar el catálogo
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
      
      {/* FOOTER */}
      <footer className="section is-medium has-text-centered" style={{ scrollSnapAlign: 'end', minHeight: '30vh' }}>
        <p className="has-text-grey-light is-size-7 is-uppercase" style={{ letterSpacing: '2px' }}>
          @ 2026 NIMBUX - TODOS LOS DERECHOS RESERVADOS
        </p>
      </footer>

      {/* --- MODAL DE ASESORÍA Y ENCUESTA --- */}
      <AnimatePresence>
        {isAssessmentOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ 
              position: 'fixed', top: 0, left: 0, width: '100vw', height: '100dvh', 
              backgroundColor: 'rgba(0, 0, 0, 0.65)', backdropFilter: 'blur(6px)', 
              zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' 
            }}
          >
            <motion.div 
              initial={{ scale: 0.95, y: 15, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 15, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="custom-modal-box"
              style={{ width: '90%', maxWidth: '50%' }}
            >
              {/* LÓGICA DEL BOTÓN DE CIERRE: Se oculta si es modo estricto y no ha terminado */}
              {(!isStrictAssessment || assessmentStep === 2) && (
                <button onClick={handleCloseRequest} style={{ position: 'absolute', top: '1.2rem', right: '1.2rem', background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#999', transition: 'color 0.2s ease', zIndex: 10 }} onMouseOver={(e) => e.target.style.color = '#000'} onMouseOut={(e) => e.target.style.color = '#999'}>✕</button>
              )}

              {/* PASO 0: CUESTIONARIO ESTRATÉGICO CON PREGUNTAS EXACTAS E INPUTS "OTRO" */}
              {assessmentStep === 0 && (
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                  <h3 className="title is-4 mb-2 has-text-weight-light has-text-black">Regalos Corporativos</h3>
                  <p className="is-size-7 has-text-grey uppercase mb-5" style={{ letterSpacing: '1px' }}>PASO 1 DE 2 - CUÉNTANOS SOBRE TU PROYECTO</p>

                  {/* MENSAJE DE BIENVENIDA ADAPTADO */}
                  <div className="mb-5 has-text-grey-dark" style={{ lineHeight: '1.6', fontSize: '0.80rem', backgroundColor: '#fcfcfc', padding: '1rem', borderLeft: '4px solid #000', borderRadius: '4px' }}>
                    <p className="mb-2">¡Hola! 👋 Gracias por tu interés en nuestra <span className='has-text-weight-bold has-text-black'>Reserva de Kits Corporativos</span> Nimbux 2026. </p>
                  </div>

                  <div className="field mb-4">
                    <label className="label is-small has-text-black">¿Cuál es el presupuesto aproximado que tienes contemplado para tus regalos corporativos? *</label>
                    <div className="control">
                      <div className="select is-fullwidth">
                        <select className="has-text-black" name="presupuesto" value={assessmentData.presupuesto} onChange={handleAssessmentChange} style={{ borderRadius: '6px', backgroundColor: '#fcfcfc' }}>
                          <option value="$15,000 - $25,000 MXN">$15,000 - $25,000 MXN</option>
                          <option value="$25,000 - $50,000 MXN">$25,000 - $50,000 MXN</option>
                          <option value="$50,000 - $100,000 MXN">$50,000 - $100,000 MXN</option>
                          <option value="Más de $100,000 MXN">Más de $100,000 MXN</option>
                          <option value="Otro">Otro</option>
                        </select>
                      </div>
                    </div>
                    <AnimatePresence>
                      {assessmentData.presupuesto === 'Otro' && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-2">
                          <input className="input has-text-black is-small" type="text" name="presupuesto" value={customAssessmentData.presupuesto} onChange={handleCustomAssessmentChange} placeholder="Por favor, especifica el monto..." required style={{ borderRadius: '6px', backgroundColor: '#fcfcfc', border: '1px solid #cbd5e1' }} />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="field mb-4">
                    <label className="label is-small has-text-black">¿Cuántos regalos corporativos necesitas aproximadamente? *</label>
                    <div className="control">
                      <div className="select is-fullwidth">
                        <select className="has-text-black" name="volumen" value={assessmentData.volumen} onChange={handleAssessmentChange} style={{ borderRadius: '6px', backgroundColor: '#fcfcfc' }}>
                          <option value="20 - 50 piezas">20 - 50 piezas</option>
                          <option value="51 - 100 piezas">51 - 100 piezas</option>
                          <option value="101 - 200 piezas">101 - 200 piezas</option>
                          <option value="Más de 200 piezas">Más de 200 piezas</option>
                          <option value="Otro">Otro</option>
                        </select>
                      </div>
                    </div>
                    <AnimatePresence>
                      {assessmentData.volumen === 'Otro' && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-2">
                          <input className="input has-text-black is-small" type="text" name="volumen" value={customAssessmentData.volumen} onChange={handleCustomAssessmentChange} placeholder="Por favor, especifica la cantidad..." required style={{ borderRadius: '6px', backgroundColor: '#fcfcfc', border: '1px solid #cbd5e1' }} />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="field mb-4">
                    <label className="label is-small has-text-black">¿Para cuándo necesitas recibir tu pedido? *</label>
                    <div className="control">
                      <div className="select is-fullwidth">
                        <select className="has-text-black" name="tiempo" value={assessmentData.tiempo} onChange={handleAssessmentChange} style={{ borderRadius: '6px', backgroundColor: '#fcfcfc' }}>
                          <option value="Noviembre">Noviembre</option>
                          <option value="Primera quincena de diciembre">Primera quincena de diciembre</option>
                          <option value="Segunda quincena de diciembre">Segunda quincena de diciembre</option>
                          <option value="Aún estoy definiendo la fecha">Aún estoy definiendo la fecha</option>
                          <option value="Otro">Otro</option>
                        </select>
                      </div>
                    </div>
                    <AnimatePresence>
                      {assessmentData.tiempo === 'Otro' && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-2">
                          <input className="input has-text-black is-small" type="text" name="tiempo" value={customAssessmentData.tiempo} onChange={handleCustomAssessmentChange} placeholder="Por favor, especifica la fecha o mes..." required style={{ borderRadius: '6px', backgroundColor: '#fcfcfc', border: '1px solid #cbd5e1' }} />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="field mb-4">
                    <label className="label is-small has-text-black">¿Qué tipo de regalos está buscando? *</label>
                    <div className="control">
                      <div className="select is-fullwidth">
                        <select className="has-text-black" name="tipo" value={assessmentData.tipo} onChange={handleAssessmentChange} style={{ borderRadius: '6px', backgroundColor: '#fcfcfc' }}>
                          <option value="Kits Corporativos">Kits Corporativos</option>
                          <option value="Agendas Corporativas">Agendas Corporativas</option>
                          <option value="Quiero que Nimbux me recomiende opciones">Quiero que Nimbux me recomiende opciones</option>
                          <option value="Otro">Otro</option>
                        </select>
                      </div>
                    </div>
                    <AnimatePresence>
                      {assessmentData.tipo === 'Otro' && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-2">
                          <input className="input has-text-black is-small" type="text" name="tipo" value={customAssessmentData.tipo} onChange={handleCustomAssessmentChange} placeholder="Por favor, especifica el tipo de regalo..." required style={{ borderRadius: '6px', backgroundColor: '#fcfcfc', border: '1px solid #cbd5e1' }} />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="field mb-5">
                    <label className="label is-small has-text-black">¿En qué etapa se encuentra actualmente tu empresa? *</label>
                    <div className="control">
                      <div className="select is-fullwidth">
                        <select className="has-text-black" name="etapa" value={assessmentData.etapa} onChange={handleAssessmentChange} style={{ borderRadius: '6px', backgroundColor: '#fcfcfc' }}>
                          <option value="Ya tenemos presupuesto y buscamos proveedor para realizar el pedido">Ya tenemos presupuesto y buscamos proveedor para realizar el pedido</option>
                          <option value="Estamos comparando proveedores antes de tomar una decisión">Estamos comparando proveedores antes de tomar una decisión</option>
                          <option value="Necesitamos una cotización para autorización interna">Necesitamos una cotización para autorización interna</option>
                          <option value="Apenas estamos explorando opciones">Apenas estamos explorando opciones</option>
                          <option value="Otro">Otro</option>
                        </select>
                      </div>
                    </div>
                    <AnimatePresence>
                      {assessmentData.etapa === 'Otro' && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-2">
                          <input className="input has-text-black is-small" type="text" name="etapa" value={customAssessmentData.etapa} onChange={handleCustomAssessmentChange} placeholder="Por favor, especifica la etapa..." required style={{ borderRadius: '6px', backgroundColor: '#fcfcfc', border: '1px solid #cbd5e1' }} />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <button onClick={() => setAssessmentStep(1)} className="button is-black is-fullwidth mt-2" style={{ borderRadius: '0', padding: '1.2rem', transition: 'background-color 0.3s' }}>
                    CONTINUAR A DATOS DE CONTACTO →
                  </button>
                </motion.div>
              )}

              {/* PASO 1: DATOS DE CONTACTO */}
              {assessmentStep === 1 && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                  <h3 className="title is-4 mb-2 has-text-weight-light has-text-black">Datos de Contacto</h3>
                  <p className="is-size-7 has-text-grey uppercase mb-5" style={{ letterSpacing: '1px' }}>PASO 2 DE 2 - ¿A DÓNDE ENVIAMOS LA PROPUESTA?</p>
                  
                  <form onSubmit={handleAssessmentSubmit}>
                    <div className="field mb-4">
                      <label className="label is-small has-text-grey-dark">Tu Nombre *</label>
                      <div className="control">
                        <input className="input has-text-black" type="text" name="nombre" required value={assessmentData.nombre} onChange={handleAssessmentChange} placeholder="Ej. Juan Pérez" style={{ borderRadius: '6px', border: '1px solid #ddd', backgroundColor: '#fcfcfc' }} />
                      </div>
                    </div>

                    <div className="field mb-4">
                      <label className="label is-small has-text-grey-dark">Nombre de la Empresa *</label>
                      <div className="control">
                        <input className="input has-text-black" type="text" name="empresa" required value={assessmentData.empresa} onChange={handleAssessmentChange} placeholder="Ej. Corporativo Roca" style={{ borderRadius: '6px', border: '1px solid #ddd', backgroundColor: '#fcfcfc' }} />
                      </div>
                    </div>

                    <div className="columns mb-0">
                      <div className="column is-6 field mb-3">
                        <label className="label is-small has-text-grey-dark">Correo Electrónico *</label>
                        <div className="control">
                          <input className="input has-text-black" type="email" name="correo" required value={assessmentData.correo} onChange={handleAssessmentChange} placeholder="contacto@empresa.com" style={{ borderRadius: '6px', border: '1px solid #ddd', backgroundColor: '#fcfcfc' }} />
                        </div>
                      </div>
                      <div className="column is-6 field mb-3">
                        <label className="label is-small has-text-grey-dark">WhatsApp *</label>
                        <div className="control">
                          <input className="input has-text-black" type="tel" name="whatsapp" required value={assessmentData.whatsapp} onChange={handleAssessmentChange}   onInput={(e) => {e.target.value = e.target.value.replace(/\D/g, '');}} placeholder="+52..." style={{ borderRadius: '6px', border: '1px solid #ddd', backgroundColor: '#fcfcfc' }} />
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 is-flex" style={{ gap: '15px' }}>
                      <button type="button" onClick={() => setAssessmentStep(0)} className="button is-white is-outlined has-text-black" style={{ borderRadius: '0', width: '30%', padding: '1.2rem', border: '1px solid #ccc' }}>
                        Volver
                      </button>
                      <button type="submit" className={`button is-black ${isSubmittingAssessment ? 'is-loading' : ''}`} style={{ borderRadius: '0', width: '70%', padding: '1.2rem' }}>
                        SOLICITAR PROPUESTA
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}

              {/* PASO 2: ÉXITO */}
              {assessmentStep === 2 && (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="has-text-centered py-5">
                  <div className="mb-4">
                    <span style={{ fontSize: '5rem', color: '#27ae60', display: 'inline-block', lineHeight: '1' }}>✓</span>
                  </div>
                  <h3 className="title is-3 has-text-weight-light has-text-black mb-4">Solicitud Recibida</h3>
                  <p className="has-text-grey-dark mb-5" style={{ lineHeight: '1.6', fontSize: '1.05rem' }}>
                    Hemos recibido la información de tu proyecto exitosamente. Un especialista de nuestro equipo se pondrá en contacto contigo muy pronto.
                  </p>
                  
                  {/* Este botón ahora llama a resetAssessmentAndClose que también limpia el hash */}
                  <button onClick={resetAssessmentAndClose} className="button is-black is-fullwidth mt-6" style={{ borderRadius: '0', padding: '1.2rem' }}>
                    EXPLORAR EL CATÁLOGO
                  </button>
                </motion.div>
              )}

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}