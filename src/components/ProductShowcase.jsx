import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './ProductShowcase.css';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.1 }
  }
};

const textItemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1, y: 0,
    transition: { type: 'spring', stiffness: 80, damping: 20 }
  }
};

const imageContainerVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1, scale: 1,
    transition: { duration: 0.8, ease: "easeOut" }
  }
};

export default function ProductShowcase({ product, index }) {
  const isEven = index % 2 === 0;
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Estados para el Flujo: 0: Detalles, 1: Diseño, 2: Tarjeta, 3: Datos, 4: Éxito
  const [step, setStep] = useState(0); 
  const [orderId, setOrderId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estado para el texto del previsualizador de fuentes
  const [previewText, setPreviewText] = useState('Preview name');

  // --- REFERENCIAS Y ESTADOS PARA ESCALADO DE TEXTO ---
  const previewContainerRef = useRef(null);
  const previewTextRef = useRef(null);
  const [textScale, setTextScale] = useState(1);

  // Datos del formulario
  const [formData, setFormData] = useState({
    colorProducto: '',
    tipoGrabado: 'Logotipo', 
    tipografia: '',
    colorTarjeta: '',
    nombre:'',
    empresa: '',
    correo: '',
    whatsapp: '',
    cantidad: 50
  });

  // Inicializar selectores
  useEffect(() => {
    if (product.details) {
      setFormData({
        colorProducto: product.details.colors?.[0]?.color || '',
        tipoGrabado: 'Logotipo',
        tipografia: 'Sin tipografía', 
        colorTarjeta: product.card?.availabilityColors?.[0]?.color || '',
        nombre: '',
        empresa: '',
        correo: '',
        whatsapp: '',
        cantidad: 50
      });
      setPreviewText('Preview name');
    }
  }, [product]);

  // Lógica de auto-selección: Forzar "Sin tipografía" si escogen Logotipo
  useEffect(() => {
    if (formData.tipoGrabado === 'Solo Logo' || formData.tipoGrabado === 'Logotipo') {
      setFormData(prev => ({ ...prev, tipografia: 'Sin tipografía' }));
    } else {
      if (formData.tipografia === 'Sin tipografía' && product.details.typographies) {
        const firstValidFont = product.details.typographies.find(t => t !== 'Sin tipografía');
        if (firstValidFont) {
          setFormData(prev => ({ ...prev, tipografia: firstValidFont }));
        }
      }
    }
  }, [formData.tipoGrabado, product.details.typographies]);

  // --- LÓGICA: AUTO-ESCALADO DEL TEXTO DE GRABADO ---
  useEffect(() => {
    const calculateScale = () => {
      if (previewContainerRef.current && previewTextRef.current) {
        const containerWidth = previewContainerRef.current.offsetWidth - 40;
        const textWidth = previewTextRef.current.offsetWidth; 
        
        if (textWidth > containerWidth && textWidth > 0) {
          setTextScale(containerWidth / textWidth);
        } else {
          setTextScale(1);
        }
      }
    };

    const timeoutId = setTimeout(calculateScale, 50);
    return () => clearTimeout(timeoutId);
  }, [previewText, formData.tipografia, step]);

  const images = product.imageUrls || (product.imageUrl ? [product.imageUrl] : []);
  const hasMultipleImages = images.length > 1;

  const nextImage = () => setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  const prevImage = () => setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const openModalAtStep = (targetStep) => {
    setStep(targetStep);
    setIsModalOpen(true);
  };

  // Función para resetear completamente el formulario y cerrar el modal
  const resetFormAndClose = () => {
    setIsModalOpen(false);
    setTimeout(() => {
      setStep(0);
      setFormData({
        colorProducto: product.details.colors?.[0]?.color || '',
        tipoGrabado: 'Logotipo',
        tipografia: 'Sin tipografía',
        colorTarjeta: product.card?.availabilityColors?.[0]?.color || '',
        nombre: '',
        empresa: '',
        correo: '',
        whatsapp: '',
        cantidad: 50
      });
      setPreviewText('Preview name');
      setTextScale(1); 
      setOrderId('');
    }, 500); 
  };

  // Función para determinar el estilo de fuente
  const getFontStyles = (fontName) => {
    const nameLower = (fontName || '').toLowerCase();
    if (nameLower.includes('dunbar')) return { fontFamily: '"Dunbar Tall", sans-serif', fontWeight: 'bold' };
    if (nameLower.includes('nexa')) return { fontFamily: '"Nexa Script", cursive', fontWeight: '600' };
    if (nameLower.includes('future')) return { fontFamily: '"Future Tense", sans-serif', fontWeight: 'normal' };
    
    if (nameLower.includes('script') || nameLower.includes('cursiva')) return { fontFamily: 'cursive' };
    if (nameLower.includes('serif')) return { fontFamily: 'serif' };
    return { fontFamily: 'sans-serif' };
  };

  const isFontDisabled = formData.tipoGrabado === 'Solo Logo' || formData.tipoGrabado === 'Logotipo';

  // Función Híbrida: Envío a Netlify Forms + Guardado en LocalStorage
  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const newOrderId = 'NMBX-' + Math.random().toString(36).substring(2, 7).toUpperCase();
    setOrderId(newOrderId);

    const tipografiaFinal = isFontDisabled ? 'Sin tipografía' : formData.tipografia;
    const textoGrabadoFinal = isFontDisabled ? 'No aplica' : previewText;

    const pedidoCompleto = {
      orderId: newOrderId,
      fecha: new Date().toLocaleString(),
      producto: product.title,
      textoGrabado: textoGrabadoFinal, 
      ...formData,
      tipografia: tipografiaFinal
    };

    const formPayload = new URLSearchParams();
    formPayload.append('form-name', 'cotizaciones');
    formPayload.append('orderId', newOrderId);
    formPayload.append('producto', product.title);
    formPayload.append('textoGrabado', textoGrabadoFinal);
    
    Object.keys(formData).forEach(key => {
      if (key === 'tipografia') {
        formPayload.append(key, tipografiaFinal);
      } else {
        formPayload.append(key, formData[key]);
      }
    });

    try {
      const historialPedidos = JSON.parse(localStorage.getItem('historialCotizaciones')) || [];
      historialPedidos.push(pedidoCompleto);
      localStorage.setItem('historialCotizaciones', JSON.stringify(historialPedidos));

      await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formPayload.toString()
      });

      setStep(4); 
    } catch (error) {
      console.error("Error al procesar el pedido:", error);
      alert("Hubo un error al procesar tu solicitud. Por favor, intenta de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedCardObj = product.card?.availabilityColors?.find(c => c.color === formData.colorTarjeta);

  return (
    <section className="section showcase-section">
      <div className="container">
        <div className={`columns is-vcentered showcase-columns ${isEven ? '' : 'is-reversed'}`}>
          
          {/* GALERÍA DE IMÁGENES */}
          <div className="column is-7">
            <motion.div 
              variants={imageContainerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: false, margin: "-50px" }}
              className="product-image-wrapper"
            >
              <AnimatePresence mode="wait">
                <motion.img 
                  key={currentIndex} 
                  src={images[currentIndex]} 
                  alt={`${product.title} - Vista ${currentIndex + 1}`} 
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5, ease: [0.25, 1, 2, 1] }}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', top: 0, left: 0 }} 
                />
              </AnimatePresence>

              {hasMultipleImages && (
                <>
                  <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, display: 'flex', justifyContent: 'space-between', padding: '0 1rem', transform: 'translateY(-50%)', zIndex: 10 }}>
                    <button onClick={prevImage} className="button is-white is-rounded is-small" style={{ opacity: 0.7, border: 'none', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>←</button>
                    <button onClick={nextImage} className="button is-white is-rounded is-small" style={{ opacity: 0.7, border: 'none', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>→</button>
                  </div>
                  <div style={{ position: 'absolute', bottom: '15px', left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: '8px', zIndex: 10 }}>
                    {images.map((_, dotIndex) => (
                      <div key={dotIndex} onClick={() => setCurrentIndex(dotIndex)} style={{ width: dotIndex === currentIndex ? '24px' : '8px', height: '8px', borderRadius: '4px', backgroundColor: dotIndex === currentIndex ? '#ffffff' : 'rgba(255,255,255,0.5)', boxShadow: '0 1px 3px rgba(0,0,0,0.3)', cursor: 'pointer', transition: 'all 0.3s ease' }} />
                    ))}
                  </div>
                </>
              )}
            </motion.div>
          </div>

          {/* TEXTOS Y BOTONES PRINCIPALES */}
          <motion.div 
            className="column is-5 showcase-text"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, margin: "-50px" }}
          >
            <motion.p variants={textItemVariants} className="is-size-7 has-text-black is-uppercase mb-4" style={{ letterSpacing: '2px' }}>
              0{index + 1} - Edición limitada
            </motion.p>
            
            <motion.h2 variants={textItemVariants} className="title is-2 has-text-weight-light has-text-black mb-5" style={{ lineHeight: '1.2' }}>
              {product.title}
            </motion.h2>
            
            <motion.p variants={textItemVariants} className="subtitle is-5 has-text-black has-text-weight-light mb-2" style={{ lineHeight: '1.8' }}>
              {product.description}
            </motion.p>

            <motion.div variants={textItemVariants} className="subtitle mb-6">
              {product.details.colors.map((item, dotIndex) => (
                <div
                  key={dotIndex}
                  className="dot"
                  style={{ backgroundColor: item.hex }}
                />
              ))}
            </motion.div>

            <motion.p variants={textItemVariants} className="has-text-info title is-4 mb-5">
              Unidades limitadas
            </motion.p>
            
            <motion.div variants={textItemVariants} className="is-flex is-flex-direction-column" style={{ gap: '12px' }}>
              {product.details && (
                <>
                  <button 
                    onClick={() => openModalAtStep(0)}
                    className="button is-black is-outlined is-medium" 
                    style={{ borderRadius: '0', padding: '1.2rem', transition: 'all 0.3s ease', border: '1px solid #ccc' }}
                  >
                    VER DETALLES
                  </button>
                  <button 
                    onClick={() => openModalAtStep(1)}
                    className="button is-black is-medium" 
                    style={{ borderRadius: '0', padding: '1.2rem', transition: 'all 0.3s ease' }}
                  >
                    CONFIGURAR Y COTIZAR
                  </button>
                </>
              )}
            </motion.div>
          </motion.div>

        </div>
      </div>

      {/* --- MODAL (DETALLES Y FLUJO DE PEDIDO) --- */}
      <AnimatePresence>
        {isModalOpen && product.details && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100dvh', backgroundColor: 'rgba(0, 0, 0, 0.65)', backdropFilter: 'blur(6px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
          >
            <motion.div 
              initial={{ scale: 0.95, y: 15, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 15, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="custom-modal-box" /* <-- IMPLEMENTACIÓN DE CSS RESPONSIVE */
              style={{ width: '90%', maxWidth: '50%' }}
            >
              {step !== 4 && (
                <button onClick={resetFormAndClose} style={{ position: 'absolute', top: '1.2rem', right: '1.2rem', background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#999', transition: 'color 0.2s ease', zIndex: 10 }} onMouseOver={(e) => e.target.style.color = '#000'} onMouseOut={(e) => e.target.style.color = '#999'}>✕</button>
              )}

              {/* PASO 0: SOLO DETALLES */}
              {step === 0 && (
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                  <h3 className="title is-4 mb-2 has-text-weight-light has-text-black">{product.title}</h3>
                  <p className="is-size-7 has-text-grey uppercase mb-5" style={{ letterSpacing: '1px' }}>ESPECIFICACIONES TÉCNICAS</p>

                  <div className="content has-text-black">
                    <h5 className="is-size-6 has-text-weight-bold mb-2 has-text-black mt-5">Descripción:</h5>
                    <p className="is-size-6 has-text-grey-dark mb-6">{product.details.description}</p>


                    <h5 className="is-size-6 has-text-weight-bold mb-3 has-text-black">El kit incluye:</h5>
                    <ul className="mb-5" style={{ paddingLeft: '1.2rem' }}>
                      {product.details.includes.map((item, i) => (
                        <li key={i} className="is-size-6 has-text-black mb-2">{item}</li>
                      ))}
                    </ul>

                    <h5 className="is-size-6 has-text-weight-bold mb-3 has-text-black mt-5">Colores Disponibles:</h5>
                    <div className="tags mb-5">
                      {product.details.colors.map((color, i) => (
                        <span key={i} className={`tag is-medium is-light ${color.text} `} style={{ borderRadius: '4px', background: color.hex, border: '1px solid #eaeaea' }}>{color.color}</span>
                      ))}
                    </div>

                    <h5 className="is-size-6 has-text-weight-bold mb-2 has-text-black mt-5">Materiales:</h5>
                    <p className="is-size-6 has-text-grey-dark mb-6">{product.details.material}</p>
                  </div>

                  <button onClick={() => setStep(1)} className="button is-black is-fullwidth" style={{ borderRadius: '0', padding: '1.2rem' }}>
                    CONFIGURAR Y COTIZAR AHORA
                  </button>
                </motion.div>
              )}

              {/* PASO 1: ESPECIFICACIONES Y DISEÑO */}
              {step === 1 && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                  <h3 className="title is-4 mb-2 has-text-weight-light has-text-black">Diseño del {product.title}</h3>
                  <p className="is-size-7 has-text-grey uppercase mb-5" style={{ letterSpacing: '1px' }}>PASO 1 DE 3 - CONFIGURACIÓN DEL PRODUCTO</p>
                  
                  <details style={{ backgroundColor: '#f9f9f9', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', cursor: 'pointer', border: '1px solid #eaeaea' }}>
                    <summary className="has-text-weight-bold is-size-7 uppercase has-text-black" style={{ outline: 'none' }}>
                      Ver contenido y materiales del kit
                    </summary>
                    <div className="mt-3">
                      <ul style={{ paddingLeft: '1.2rem', margin: 0 }}>
                        {product.details.includes.map((item, i) => (
                          <li key={i} className="is-size-7 has-text-grey-dark mb-1">{item}</li>
                        ))}
                      </ul>
                      <p className="is-size-7 has-text-grey-dark mt-2 mb-0"><span className="has-text-weight-bold">Materiales:</span> {product.details.material}</p>
                    </div>
                  </details>

                  <div className="field mb-5">
                    <label className="label is-small has-text-black">1. Color del Producto</label>
                    <div className="buttons">
                      {product.details.colors.map((item, i) => (
                        <button 
                          key={i} 
                          onClick={() => setFormData({...formData, colorProducto: item.color})} 
                          className={`button is-small ${item.text || 'has-text-dark'}`} 
                          style={{ backgroundColor: item.hex || '#f5f5f5', border: formData.colorProducto === item.color ? '2px solid #000' : '1px solid #dbdbdb', borderRadius: '6px' }}
                        >
                          {item.color} 
                          <span style={{ display: formData.colorProducto === item.color ? 'inline' : 'none' }}>
                            {' '}✓
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* QUITAMOS is-mobile PARA QUE EN TELÉFONOS SE APILEN UNO SOBRE OTRO CORRECTAMENTE */}
                  <div className="columns mb-2"> 
                    <div className="column is-6 field mb-4">
                      <label className="label is-small has-text-black">2. Tipo de Grabado</label>
                      <div className="control">
                        <div className="select is-fullwidth">
                          <select className='has-text-black' name="tipoGrabado" value={formData.tipoGrabado} onChange={handleInputChange} style={{ borderRadius: '6px', backgroundColor: '#fcfcfc' }}>
                            <option value="Logotipo">Logotipo</option>
                            <option value="(1) Nombre y (1) Apellido">(1) Nombre y (1) Apellido</option>
                            <option value="Logo + Nombre">Logotipo + (1) Nombre y (1) Apellido</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="column is-6 field mb-4">
                      <label className="label is-small has-text-black">3. Tipografía</label>
                      <div className="control">
                        <div className={`select is-fullwidth ${isFontDisabled ? 'is-disabled' : ''}`}>
                          <select 
                            className={isFontDisabled ? 'has-text-grey' : 'has-text-black'} 
                            name="tipografia" 
                            value={formData.tipografia} 
                            onChange={handleInputChange} 
                            disabled={isFontDisabled}
                            style={{ 
                              borderRadius: '6px', 
                              backgroundColor: isFontDisabled ? '#e2e8f0' : '#fcfcfc',
                              cursor: isFontDisabled ? 'not-allowed' : 'pointer'
                            }}
                          >
                            {product.details.typographies?.map((tipo, i) => {
                              const disableOption = !isFontDisabled && tipo === 'Sin tipografía';
                              return (
                                <option 
                                  key={i} 
                                  value={tipo} 
                                  disabled={disableOption}
                                  hidden={disableOption}
                                >
                                  {tipo}
                                </option>
                              );
                            })}
                          </select>
                        </div>
                      </div>
                      {isFontDisabled && (
                        <p className="help mt-1" style={{ color: '#64748b' }}>No requerida en solo Logotipo.</p>
                      )}
                    </div>
                  </div>

                  {/* --- VISOR INTERACTIVO DE FUENTES --- */}
                  <AnimatePresence>
                    {!isFontDisabled && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }} 
                        animate={{ opacity: 1, height: 'auto' }} 
                        exit={{ opacity: 0, height: 0 }}
                        style={{ overflow: 'hidden' }}
                        className="mb-5"
                      >
                        <label className="label is-small has-text-black">4. Previsualización de Grabado</label>
                        <input 
                          type="text" 
                          className="input has-text-black mb-3" 
                          value={previewText} 
                          onChange={(e) => setPreviewText(e.target.value)} 
                          placeholder="Escribe el nombre o texto a grabar..." 
                          style={{ borderRadius: '6px', backgroundColor: '#fcfcfc', border: '1px solid #cbd5e1' }}
                          maxLength={35} 
                        />
                        
                        <div 
                          className="font-preview-box" 
                          ref={previewContainerRef}
                          style={{ 
                            overflow: 'hidden', 
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '1.5rem'
                          }}
                        >
                          <span 
                            ref={previewTextRef}
                            style={{ 
                              ...getFontStyles(formData.tipografia),
                              fontSize: '2rem',
                              color: '#1e293b',
                              lineHeight: '1.2',
                              whiteSpace: 'nowrap', 
                              display: 'inline-block',
                              transform: `scale(${textScale})`, 
                              transformOrigin: 'center',
                              transition: 'font-family 0.3s ease, transform 0.1s ease-out'
                            }}>
                            {previewText || 'Preview name'}
                          </span>
                        </div>

                      </motion.div>
                    )}
                  </AnimatePresence>

                  <button onClick={() => setStep(2)} className="button is-black is-fullwidth mt-5" style={{ borderRadius: '0', padding: '1.2rem', transition: 'background-color 0.3s' }}>
                    {product.card.continueMessage}
                  </button>
                </motion.div>
              )}

              {/* PASO 2: TARJETA DE AGRADECIMIENTO */}
              {step === 2 && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                  <h3 className="title is-4 mb-2 has-text-weight-light has-text-black">
                    Personaliza tu {product.card?.type || 'Tarjeta'}
                  </h3>
                  <p className="is-size-7 has-text-grey uppercase mb-5" style={{ letterSpacing: '1px' }}>
                    PASO 2 DE 3 - DETALLE DE EMPAQUE
                  </p>
                  
                <div className="box mt-2 mb-5" style={{ backgroundColor: '#f4f6f8', border: '1px solid #e2e8f0', boxShadow: 'none', padding: '1.5rem' }}>
                    <p className="help mb-4 has-text-weight-medium" style={{ color: '#334155', fontSize: '0.88rem', lineHeight: '1.5' }}>
                      {product.card?.description}
                    </p>
                    
                    {selectedCardObj?.previewImage && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="card-preview-wrapper" 
                      >
                        {/* IMPLEMENTACIÓN DE ANIMACIÓN SUAVE ENTRE IMÁGENES */}
                        <AnimatePresence mode="wait">
                          <motion.img 
                            key={selectedCardObj.color} /* El key dispara la animación al cambiar de color */
                            src={selectedCardObj.previewImage} 
                            alt={`Previsualización de ${formData.colorTarjeta}`} 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                          />
                        </AnimatePresence>
                      </motion.div>
                    )}

                    <div className="field">
                      <label className="label is-small has-text-black">Color de {product.card?.type || 'Tarjeta'}</label>
                      <div className="control">
                        <div className="select is-fullwidth">
                          <select
                          className='has-text-black' 
                            name="colorTarjeta" 
                            value={formData.colorTarjeta} 
                            onChange={handleInputChange} 
                            style={{ borderRadius: '6px', backgroundColor: '#ffffff', border: '1px solid #cbd5e1', fontWeight: '500' }}
                          >
                            {product.card?.availabilityColors?.map((item, i) => (
                              <option key={i} value={item.color}>{item.color}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 is-flex" style={{ gap: '15px' }}>
                    <button onClick={() => setStep(1)} className="button is-black is-outlined" style={{ borderRadius: '0', width: '30%', padding: '1.2rem', border: '1px solid #ccc' }}>
                      Volver
                    </button>
                    <button onClick={() => setStep(3)} className="button is-black" style={{ borderRadius: '0', width: '70%', padding: '1.2rem', transition: 'background-color 0.3s' }}>
                      CONTINUAR A DATOS →
                    </button>
                  </div>
                </motion.div>
              )}

              {/* PASO 3: DATOS DE PEDIDO */}
              {step === 3 && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                  <h3 className="title is-4 mb-2 has-text-weight-light has-text-black">Datos de Contacto</h3>
                  <p className="is-size-7 has-text-grey uppercase mb-5" style={{ letterSpacing: '1px' }}>PASO 3 DE 3 - COMPLETA TU INFORMACIÓN</p>
                  
                  <form onSubmit={handleSubmitOrder}>

                    {/* --- INICIO DE NUEVO CAMPO --- */}
                    <div className="field mb-4">
                      <label className="label is-small has-text-grey-dark">Tu Nombre *</label>
                      <div className="control">
                        <input className="input has-text-black" type="text" name="nombre" required value={formData.nombre} onChange={handleInputChange} placeholder="Ej. Juan Pérez" style={{ borderRadius: '6px', border: '1px solid #ddd', backgroundColor: '#fcfcfc' }} />
                      </div>
                    </div>
                    {/* --- FIN DE NUEVO CAMPO --- */}
                    
                    <div className="field mb-4">
                      <label className="label is-small has-text-grey-dark">Nombre de la Empresa *</label>
                      <div className="control">
                        <input className="input has-text-black" type="text" name="empresa" required value={formData.empresa} onChange={handleInputChange} placeholder="Ej. Corporativo Roca" style={{ borderRadius: '6px', border: '1px solid #ddd', backgroundColor: '#fcfcfc' }} />
                      </div>
                    </div>
                    
                    <div className="field mb-4">
                      <label className="label is-small has-text-grey-dark">Correo Electrónico *</label>
                      <div className="control">
                        <input className="input has-text-black" type="email" name="correo" required value={formData.correo} onChange={handleInputChange} placeholder="contacto@empresa.com" style={{ borderRadius: '6px', border: '1px solid #ddd', backgroundColor: '#fcfcfc' }} />
                      </div>
                    </div>

                    {/* QUITAMOS is-mobile PARA QUE EN TELÉFONOS SE APILEN UNO SOBRE OTRO */}
                    <div className="columns mb-0"> 
                      <div className="column is-6 field">
                        <label className="label is-small has-text-grey-dark">WhatsApp *</label>
                        <div className="control">
                          <input className="input has-text-black" type="tel" name="whatsapp" required value={formData.whatsapp} onChange={handleInputChange} onInput={(e) => {e.target.value = e.target.value.replace(/\D/g, '');}} placeholder="+52..." style={{ borderRadius: '6px', border: '1px solid #ddd', backgroundColor: '#fcfcfc' }} />
                        </div>
                      </div>
                      <div className="column is-6 field">
                        <label className="label is-small has-text-grey-dark">Cantidad (Unidades) *</label>
                        <div className="control">
                          <input className="input has-text-black" type="number" min="1" name="cantidad" required value={formData.cantidad} onChange={handleInputChange} style={{ borderRadius: '6px', border: '1px solid #ddd', backgroundColor: '#fcfcfc' }} />
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 is-flex" style={{ gap: '15px' }}>
                      <button type="button" onClick={() => setStep(2)} className="button is-white is-outlined has-text-black" style={{ borderRadius: '0', width: '30%', padding: '1.2rem', border: '1px solid #ccc' }}>
                        Volver
                      </button>
                      <button type="submit" className={`button is-black ${isSubmitting ? 'is-loading' : ''}`} style={{ borderRadius: '0', width: '70%', padding: '1.2rem' }}>
                        ENVIAR SOLICITUD
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}

              {/* PASO 4: ÉXITO */}
              {step === 4 && (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="has-text-centered py-5">
                  <div className="mb-4">
                    <span style={{ fontSize: '5rem', color: '#27ae60', display: 'inline-block', lineHeight: '1' }}>✓</span>
                  </div>
                  <h3 className="title is-3 has-text-weight-light has-text-black mb-4">Cotización Solicitada</h3>
                  <p className="has-text-grey-dark mb-5" style={{ lineHeight: '1.6', fontSize: '1.05rem' }}>
                    Hemos recibido exitosamente la configuración de tu pedido. En breve recibirás un correo confirmando tu cotización.
                  </p>
                  
                  <div className="box" style={{ backgroundColor: '#f4f6f8', border: '1px dashed #b5c1c9', padding: '1.8rem', borderRadius: '8px' }}>
                    <p className="is-size-7 has-text-grey uppercase mb-2">Tu ID de Pedido Temporal es:</p>
                    <p className="title is-4 has-text-black has-text-weight-bold mb-2" style={{ letterSpacing: '2px' }}>{orderId}</p>
                    <p className="help is-danger mt-3" style={{ fontSize: '0.85rem' }}>
                      * Por favor, guarda este ID para cualquier seguimiento futuro.
                    </p>
                  </div>

                  <button onClick={resetFormAndClose} className="button is-black is-fullwidth mt-6" style={{ borderRadius: '0', padding: '1.2rem' }}>
                    FINALIZAR
                  </button>
                </motion.div>
              )}

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}