import { ref, watch } from 'vue'
import { useAuthStore } from '../stores/auth'

const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api'
const useMocks = import.meta.env.VITE_USE_MOCKS === 'true'

export function useStreakThreshold() {
  const auth = useAuthStore()
  const threshold = ref<number | null>(useMocks ? 3 : null)
  const loading = ref(false)

  if (!useMocks) {
    watch(() => auth.token, async (token, _, onCleanup) => {
      threshold.value = null
      loading.value = !!token
      if (!token) return

      const controller = new AbortController()
      onCleanup(() => controller.abort())
      try {
        const response = await fetch(`${apiUrl}/config/streak`, {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        })
        if (!response.ok) return

        const { thresholdDays } = await response.json()
        if (!controller.signal.aborted && Number.isInteger(thresholdDays) &&
          thresholdDays >= 3 && thresholdDays <= 5) {
          threshold.value = thresholdDays
        }
      } catch {
        // Mantiene la invitación bloqueada si no se puede cargar la configuración.
      } finally {
        if (!controller.signal.aborted) loading.value = false
      }
    }, { immediate: true })
  }

  return { threshold, loading }
}
