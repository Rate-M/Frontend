<template>
  <div class="profile-page">
    <div class="profile-card">
      <div class="form-header">
        <h1>Editar perfil</h1>
        <p>Actualiza tu información cuando quieras</p>
      </div>

      <p v-if="formError" class="form-alert" role="alert">{{ formError }}</p>
      <p v-if="success" class="success-message" role="status">
        ✓ Cambios guardados. Redirigiendo a tu perfil...
      </p>

      <p v-if="loadingProfile" class="loading-text">Cargando tu perfil...</p>

      <ProfileForm
        v-else-if="initial"
        mode="edit"
        :initial="initial"
        :loading="saving"
        @submit="handleSave"
        @cancel="router.push('/perfil')"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import ProfileForm from '../components/profile/ProfileForm.vue'
import { emptyProfile } from '../types/profile'
import type { ProfileFormData } from '../types/profile'

const router = useRouter()

const initial = ref<ProfileFormData | null>(null)
const loadingProfile = ref(true)
const saving = ref(false)
const success = ref(false)
const formError = ref('')

const placeholderPhoto = (label: string) =>
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="500"><rect width="100%" height="100%" fill="#e6e1e3"/><text x="50%" y="50%" font-family="sans-serif" font-size="28" fill="#8a8486" text-anchor="middle">${label}</text></svg>`
  )

onMounted(async () => {
  try {
        await new Promise((resolve) => setTimeout(resolve, 600))

    initial.value = {
      ...emptyProfile(),
      displayName: 'Ana',
      birthDate: '1999-04-12',
      gender: 'female',
      pronouns: 'ella',
      occupation: 'Diseñadora',
      zodiac: 'aries',
      lookingFor: 'relationship',
      bio: 'Me gusta el café, el senderismo y los domingos de cine.',
      interests: ['Senderismo', 'Cine', 'Café'],
      photos: [
        { id: 'p1', url: placeholderPhoto('Foto 1'), isPrimary: true },
        { id: 'p2', url: placeholderPhoto('Foto 2'), isPrimary: false }
      ],
      interestedIn: ['male'],
      ageMin: 22,
      ageMax: 35,
      maxDistanceKm: 30,
      visible: true
    }
  } catch (error) {
    console.error('Error:', error)
    formError.value = 'No pudimos cargar tu perfil. Intenta de nuevo.'
  } finally {
    loadingProfile.value = false
  }
})

const handleSave = async (data: ProfileFormData) => {
  formError.value = ''
  saving.value = true

  try {
    console.log('Cambios a guardar:', data)

    await new Promise((resolve) => setTimeout(resolve, 1000))
    success.value = true

    setTimeout(() => {
      router.push('/perfil')
    }, 1500)
  } catch (error) {
    console.error('Error:', error)
    formError.value = 'No pudimos guardar los cambios. Intenta de nuevo.'
    window.scrollTo({ top: 0, behavior: 'smooth' })
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.profile-page {
  min-height: 100vh;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 20px;
}

.profile-card {
  width: 100%;
  max-width: 560px;
  display: flex;
  flex-direction: column;
  gap: 28px;
  background: var(--rm-bg);
  border-radius: 28px;
  padding: 40px 32px;
  box-shadow: 0 1px 2px rgba(20, 18, 20, 0.04), 0 10px 30px rgba(142, 22, 34, 0.08);
}

@media (max-width: 380px) {
  .profile-card {
    padding: 32px 20px;
  }
}

.form-header {
  display: flex;
  flex-direction: column;
  gap: 8px;
  text-align: center;
}
.form-header h1 {
  margin: 0;
  font-family: var(--font-heading);
  font-weight: 500;
  font-size: 34px;
  line-height: 1.1;
}
.form-header p {
  margin: 0;
  font-size: 14px;
  color: var(--rm-text-secondary);
}

.form-alert {
  margin: 0;
  padding: 12px 16px;
  border-radius: 12px;
  background: #fbeaea;
  border: 1px solid var(--rm-accent);
  color: var(--rm-accent-dark);
  font-size: 13px;
}

.success-message {
  margin: 0;
  background: var(--rm-success-bg);
  border: 1px solid var(--rm-success);
  color: var(--rm-success);
  padding: 16px;
  border-radius: 14px;
  text-align: center;
  font-size: 14px;
  line-height: 1.5;
}

.loading-text {
  margin: 0;
  text-align: center;
  font-size: 14px;
  color: var(--rm-text-secondary);
}
</style>