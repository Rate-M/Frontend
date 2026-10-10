<template>
  <div class="profile-page">
    <div class="profile-card">
      <img :src="logoUrl" alt="RateM Dating" class="logo-img" />

      <div class="form-header">
        <h1>Crea tu perfil</h1>
        <p>Cuéntanos quién eres para empezar a conocer gente</p>
      </div>

      <p v-if="formError" class="form-alert" role="alert">{{ formError }}</p>

      <ProfileForm mode="create" :loading="loading" @submit="handleCreate" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import logoUrl from '../assets/logo.png'
import ProfileForm from '../components/profile/ProfileForm.vue'
import type { LegalAcceptance, ProfileFormData } from '../types/profile'

const router = useRouter()
const loading = ref(false)
const formError = ref('')

const handleCreate = async (data: ProfileFormData, acceptance?: LegalAcceptance) => {
  formError.value = ''
  loading.value = true

  try {
    console.log('Perfil a crear:', data)
    console.log('Términos y aviso aceptados:', acceptance)

    await new Promise((resolve) => setTimeout(resolve, 1000))
    router.push('/descubrir')
  } catch (error) {
    console.error('Error:', error)
    formError.value = 'No pudimos crear tu perfil. Intenta de nuevo.'
    window.scrollTo({ top: 0, behavior: 'smooth' })
  } finally {
    loading.value = false
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