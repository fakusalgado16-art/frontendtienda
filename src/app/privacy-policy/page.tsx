// src/app/privacy-policy/page.tsx
import React from 'react';

export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-4xl font-extrabold text-gray-900 mb-8 text-center">Política de Privacidad</h1>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">1. Introducción</h2>
        <p className="text-gray-700 leading-relaxed">
          En Brava, valoramos tu privacidad y nos comprometemos a proteger tu información personal. Esta Política de Privacidad describe cómo recopilamos, usamos y compartimos tu información cuando visitas o realizas una compra en nuestro sitio web (el "Sitio"). Al utilizar nuestro Sitio, aceptas las prácticas descritas en esta política.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">2. Información que Recopilamos</h2>
        <p className="text-gray-700 leading-relaxed mb-4">
          Recopilamos varios tipos de información para proporcionarte y mejorar nuestros servicios:
        </p>
        <ul className="list-disc list-inside text-gray-700 leading-relaxed space-y-2">
          <li>
            <strong>Información Personal de Identificación (IPI):</strong> Incluye tu nombre, dirección de correo electrónico, dirección de envío, dirección de facturación, número de teléfono y detalles de pago cuando realizas una compra.
          </li>
          <li>
            <strong>Datos de Uso:</strong> Información sobre cómo accedes y utilizas el Sitio, como tu dirección IP, tipo de navegador, páginas visitadas, tiempo de visita y otros datos de diagnóstico.
          </li>
          <li>
            <strong>Datos de Cookies y Seguimiento:</strong> Utilizamos cookies y tecnologías de seguimiento similares para rastrear la actividad en nuestro Sitio y mantener cierta información.
          </li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">3. Cómo Utilizamos Tu Información</h2>
        <p className="text-gray-700 leading-relaxed mb-4">
          Utilizamos la información recopilada para diversos fines:
        </p>
        <ul className="list-disc list-inside text-gray-700 leading-relaxed space-y-2">
          <li>Para procesar tus pedidos y gestionar tu cuenta.</li>
          <li>Para mejorar y personalizar tu experiencia en nuestro Sitio.</li>
          <li>Para comunicarnos contigo sobre tus pedidos, productos y promociones.</li>
          <li>Para detectar, prevenir y abordar problemas técnicos o de seguridad.</li>
          <li>Para cumplir con nuestras obligaciones legales.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">4. Compartir Tu Información</h2>
        <p className="text-gray-700 leading-relaxed mb-4">
          No vendemos, comercializamos ni transferimos tu Información Personal de Identificación a terceros sin tu consentimiento, excepto en las siguientes circunstancias:
        </p>
        <ul className="list-disc list-inside text-gray-700 leading-relaxed space-y-2">
          <li>
            <strong>Proveedores de Servicios:</strong> Podemos compartir tu información con proveedores de servicios de confianza que nos ayudan a operar nuestro Sitio, realizar nuestro negocio o servir a nuestros usuarios (ej. procesadores de pagos, empresas de envío).
          </li>
          <li>
            <strong>Cumplimiento Legal:</strong> Podemos divulgar tu información cuando sea legalmente requerido para cumplir con la ley, hacer cumplir las políticas de nuestro sitio o proteger nuestros derechos, propiedad o seguridad.
          </li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">5. Seguridad de Datos</h2>
        <p className="text-gray-700 leading-relaxed">
          Implementamos una variedad de medidas de seguridad para mantener la seguridad de tu información personal cuando realizas un pedido o ingresas, envías o accedes a tu información personal.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">6. Tus Derechos de Privacidad</h2>
        <p className="text-gray-700 leading-relaxed mb-4">
          Dependiendo de tu ubicación, puedes tener ciertos derechos con respecto a tu información personal, incluyendo el derecho a:
        </p>
        <ul className="list-disc list-inside text-gray-700 leading-relaxed space-y-2">
          <li>Acceder a la información personal que tenemos sobre ti.</li>
          <li>Solicitar la corrección de información inexacta.</li>
          <li>Solicitar la eliminación de tu información personal.</li>
          <li>Oponerte al procesamiento de tu información personal.</li>
        </ul>
        <p className="text-gray-700 leading-relaxed mt-4">
          Para ejercer cualquiera de estos derechos, por favor contáctanos utilizando la información de contacto proporcionada a continuación.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">7. Enlaces a Otros Sitios Web</h2>
        <p className="text-gray-700 leading-relaxed">
          Nuestro Sitio puede contener enlaces a otros sitios web que no son operados por nosotros. Si haces clic en un enlace de terceros, serás dirigido al sitio de ese tercero. Te recomendamos encarecidamente que revises la Política de Privacidad de cada sitio que visites. No tenemos control ni asumimos ninguna responsabilidad por el contenido, las políticas de privacidad o las prácticas de sitios o servicios de terceros.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">8. Cambios a Esta Política de Privacidad</h2>
        <p className="text-gray-700 leading-relaxed">
          Podemos actualizar nuestra Política de Privacidad de vez en cuando. Te notificaremos cualquier cambio publicando la nueva Política de Privacidad en esta página. Te recomendamos revisar esta Política de Privacidad periódicamente para cualquier cambio. Los cambios a esta Política de Privacidad son efectivos cuando se publican en esta página.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">9. Contáctanos</h2>
        <p className="text-gray-700 leading-relaxed">
          Si tienes alguna pregunta sobre esta Política de Privacidad, puedes contactarnos:
        </p>
        <ul className="list-disc list-inside text-gray-700 leading-relaxed space-y-2 mt-2">
          <li>Por correo electrónico: <a href="mailto:belmargiuliana@gmail.com" className="text-pink-600 hover:underline">belmargiuliana@gmail.com</a></li>
          <li>Por teléfono: <a href="tel:+54 9 2946402814" className="text-pink-600 hover:underline">2946402814</a></li>
          <li>Visitando esta página en nuestro sitio web: <a href="/contact" className="text-pink-600 hover:underline">/contact</a></li>
        </ul>
      </section>
    </div>
  );
}
