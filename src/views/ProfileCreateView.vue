<template>
  <div class="profile-page">
    <div class="profile-card">
      <img :src="logoUrl" alt="RateM Dating" class="logo-img" />

      <div class="form-header">
        <h1>Crea tu perfil</h1>
        <p>Cuéntanos quién eres para empezar a conocer gente</p>
      </div>

      <p v-if="formError" class="form-alert" role="alert">{{ formError }}</p>

      <ProfileForm v-if="!created" mode="create" :loading="loading" :show-mock-fields="useMocks" @submit="handleCreate" />
      <section v-else aria-label="Preferencias pendientes">
        <p>Tu perfil ya está guardado. Falta guardar tus preferencias de descubrimiento.</p>
        <button type="button" :disabled="loading" @click="retryPreferences">Guardar preferencias</button>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import logoUrl from '../assets/logo.png'
import ProfileForm from '../components/profile/ProfileForm.vue'
import { createProfile, saveProfilePreferences } from '../services/profiles'
import { useAuthStore } from '../stores/auth'
import type { ProfileFormData } from '../types/profile'

const router = useRouter()
const auth = useAuthStore()
const useMocks = import.meta.env.VITE_USE_MOCKS === 'true'
const loading = ref(false)
const formError = ref('')
const created = ref<ProfileFormData | null>(null)

const finish = async (data: ProfileFormData) => {
  if (loading.value) return
  if (!auth.token) {
    await router.push('/login')
    return
  }
  formError.value = ''
  loading.value = true

  try {
    if (!useMocks) {
      if (!created.value) {
        await createProfile(auth.token, data)
        created.value = data
      }
      await saveProfilePreferences(auth.token, data)
    }
    await router.push('/descubrir')
  } catch (error) {
    formError.value = error instanceof Error ? error.message : 'No pudimos guardar tu perfil.'
  } finally {
    loading.value = false
  }
}

const handleCreate = (data: ProfileFormData) => void finish(data)
const retryPreferences = () => {
  if (created.value) void finish(created.value)
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

.logo-img {
  align-self: center;
  width: 160px;
  height: auto;
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
</style>
