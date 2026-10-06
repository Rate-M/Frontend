<template>
  <div class="legal-documents">
    <div v-if="type === 'privacy'" class="document">
      <h3>Aviso de Privacidad</h3>
      <p><strong>Última actualización:</strong> Septiembre 2026</p>
      
      <h4>1. Responsable del tratamiento de datos</h4>
      <p>RateM Dating, con domicilio en [Dirección], es responsable de proteger y dar tratamiento a sus datos personales.</p>

      <h4>2. Finalidades del tratamiento</h4>
      <p>Sus datos personales serán utilizados para:</p>
      <ul>
        <li>Crear y administrar su cuenta en nuestra plataforma</li>
        <li>Verificar su identidad y mayoría de edad</li>
        <li>Facilitar el servicio de citas y matches</li>
        <li>Enviar notificaciones relacionadas con el servicio</li>
        <li>Prevenir fraudes y garantizar la seguridad</li>
      </ul>

      <h4>3. Datos personales que tratamos</h4>
      <p>Para prestar nuestros servicios, tratamos los siguientes datos:</p>
      <ul>
        <li><strong>Datos de identificación:</strong> Nombre, correo electrónico, fecha de nacimiento</li>
        <li><strong>Datos biométricos:</strong> Fotografía de identificación oficial y selfie para verificación</li>
        <li><strong>Datos de ubicación:</strong> Geolocalización durante las citas confirmadas</li>
        <li><strong>Datos de perfil:</strong> Fotos, biografía, preferencias, reseñas</li>
      </ul>

      <h4>4. Datos personales sensibles</h4>
      <p>Tratamos datos biométricos (reconocimiento facial) y datos de geolocalización únicamente con su consentimiento expreso y para las finalidades específicas de:</p>
      <ul>
        <li>Verificar que es una persona real y mayor de edad</li>
        <li>Confirmar que las citas se llevaron a cabo en el lugar acordado</li>
      </ul>

      <h4>5. Transferencia de datos</h4>
      <p>Sus datos no se transferirán a terceros, excepto:</p>
      <ul>
        <li>Proveedores de servicios de verificación de identidad (KYC)</li>
        <li>Servicios de alojamiento y almacenamiento en la nube</li>
        <li>Cuando exista obligación legal</li>
      </ul>

      <h4>6. Derechos ARCO</h4>
      <p>Usted tiene derecho a:</p>
      <ul>
        <li><strong>Acceder:</strong> Conocer qué datos tenemos suyos</li>
        <li><strong>Rectificar:</strong> Corregir datos inexactos</li>
        <li><strong>Cancelar:</strong> Solicitar la eliminación de sus datos</li>
        <li><strong>Oponerse:</strong> Limitar el uso de sus datos</li>
      </ul>
      <p>Para ejercer sus derechos, envíe una solicitud a: privacidad@ratem.com</p>

      <h4>7. Conservación de datos</h4>
      <p>Conservaremos sus datos mientras mantenga una cuenta activa. Puede solicitar la eliminación en cualquier momento desde su perfil o contactándonos.</p>

      <h4>8. Cambios al aviso de privacidad</h4>
      <p>Nos reservamos el derecho de modificar este aviso. Los cambios se notificarán mediante la aplicación.</p>

      <h4>9. Contacto</h4>
      <p>Para dudas sobre privacidad: privacidad@ratem.com</p>
    </div>

    <div v-else-if="type === 'terms'" class="document">
      <h3>Términos de Servicio</h3>
      <p><strong>Última actualización:</strong> Septiembre 2026</p>

      <h4>1. Aceptación de términos</h4>
      <p>Al crear una cuenta en RateM Dating, usted acepta estos términos de servicio. Si no está de acuerdo, no utilice nuestra plataforma.</p>

      <h4>2. Elegibilidad</h4>
      <p>Debe ser mayor de 18 años para usar RateM. La verificación de identidad es obligatoria.</p>

      <h4>3. Cuenta y seguridad</h4>
      <ul>
        <li>Usted es responsable de mantener la confidencialidad de su cuenta</li>
        <li>Debe proporcionar información veraz y actualizada</li>
        <li>No puede crear múltiples cuentas</li>
        <li>La cuenta es personal e intransferible</li>
      </ul>

      <h4>4. Conducta en la plataforma</h4>
      <p>Usted se compromete a:</p>
      <ul>
        <li>No enviar contenido ofensivo, acosador o ilegal</li>
        <li>No compartir fotos explícitas no solicitadas</li>
        <li>No solicitar dinero o realizar estafas</li>
        <li>Respetar a otros usuarios</li>
        <li>No crear perfiles falsos</li>
      </ul>

      <h4>5. Sistema de reseñas</h4>
      <ul>
        <li>Solo puede reseñar a personas con las que tuvo una cita confirmada</li>
        <li>Las reseñas deben ser honestas y respetuosas</li>
        <li>Las reseñas se publican solo cuando ambos usuarios califican</li>
        <li>Nos reservamos el derecho de moderar contenido inapropiado</li>
      </ul>

      <h4>6. Verificación de identidad</h4>
      <p>Para usar RateM debe:</p>
      <ul>
        <li>Proporcionar una identificación oficial válida</li>
        <li>Tomar una selfie para verificación facial</li>
        <li>Aceptar el tratamiento de datos biométricos</li>
      </ul>

      <h4>7. Geolocalización</h4>
      <p>La aplicación solicitará su ubicación únicamente durante las citas confirmadas para verificar que el encuentro se llevó a cabo.</p>

      <h4>8. Propiedad intelectual</h4>
      <p>Todo el contenido de RateM (logo, diseño, código) es propiedad de RateM Dating.</p>

      <h4>9. Limitación de responsabilidad</h4>
      <p>RateM no se hace responsable por:</p>
      <ul>
        <li>El comportamiento de los usuarios fuera de la plataforma</li>
        <li>Daños o perjuicios derivados del uso del servicio</li>
        <li>La veracidad de la información proporcionada por usuarios</li>
      </ul>

      <h4>10. Terminación</h4>
      <p>Podemos suspender o terminar su cuenta si viola estos términos.</p>

      <h4>11. Ley aplicable</h4>
      <p>Estos términos se rigen por las leyes de México.</p>

      <h4>12. Contacto</h4>
      <p>Para dudas: soporte@ratem.com</p>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  type: 'privacy' | 'terms'
}>()
</script>

<style scoped>
.legal-documents {
  font-family: var(--font-body);
  line-height: 1.6;
  color: var(--rm-text);
}

h3 {
  font-family: var(--font-heading);
  font-weight: 600;
  font-size: 26px;
  margin-bottom: 8px;
  color: var(--rm-text);
}

h4 {
  font-size: 16px;
  margin-top: 24px;
  margin-bottom: 12px;
  color: var(--rm-accent-dark);
  font-weight: 600;
}

p {
  margin-bottom: 12px;
  font-size: 14px;
  color: var(--rm-text-body);
}

ul {
  margin: 12px 0;
  padding-left: 20px;
}

li {
  margin-bottom: 8px;
  font-size: 14px;
  color: var(--rm-text-body);
}

strong {
  font-weight: 600;
  color: var(--rm-text);
}
</style>