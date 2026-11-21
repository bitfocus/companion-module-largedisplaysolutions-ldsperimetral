import type { CompanionActionDefinitions } from '@companion-module/base'

type Choice = { id: string; label: string }

type Self = {
  makeRequest: (path: string) => Promise<string | void>
  log: (level: 'debug' | 'info' | 'warn' | 'error', message: string) => void
  getPlaylistChoices: () => Choice[]
  getOverlayChoices: () => Choice[]
  setVariableValues?: (values: Record<string, string>) => void
  refreshAfterCommand?: () => Promise<void>
}

function dropdown(id: string, label: string, choices: Choice[], fallback = '(none found, check the connection)') {
  return {
    type: 'dropdown' as const,
    id,
    label,
    choices: choices.length > 0 ? choices : [{ id: '', label: fallback }],
    default: choices[0]?.id ?? '',
  }
}

export function getActions(self: Self): CompanionActionDefinitions {
  const playlists = self.getPlaylistChoices()
  const overlays = self.getOverlayChoices()

  const after = async (raw?: string | void) => {
    if (raw) {
      try {
        const json = JSON.parse(raw)
        if (json.status !== 0) {
          self.log('warn', `Command rejected (status ${json.status}): ${json.message || ''}`)
        }
      } catch {
        // not JSON
      }
    }
    if (self.refreshAfterCommand) await self.refreshAfterCommand()
  }

  return {
    stop: {
      name: 'Stop',
      options: [],
      callback: async () => {
        const r = await self.makeRequest('/ws/remoteplayer/stop')
        await after(r)
      },
    },
    pause: {
      name: 'Pause',
      options: [],
      callback: async () => {
        const r = await self.makeRequest('/ws/remoteplayer/pause')
        await after(r)
      },
    },
    resume: {
      name: 'Resume',
      options: [],
      callback: async () => {
        const r = await self.makeRequest('/ws/remoteplayer/resume')
        await after(r)
      },
    },
    pauseresume: {
      name: 'Pause / Resume',
      options: [],
      callback: async () => {
        const r = await self.makeRequest('/ws/remoteplayer/pauseresume')
        await after(r)
      },
    },
    play_next: {
      name: 'Play Next Sequence',
      options: [],
      callback: async () => {
        const r = await self.makeRequest('/ws/remoteplayer/play_next')
        await after(r)
      },
    },
    quick_action_exit: {
      name: 'Quick Action Exit',
      options: [],
      callback: async () => {
        const r = await self.makeRequest('/ws/remoteplayer/quick_action_exit')
        await after(r)
      },
    },
    start_playlist: {
      name: 'Start Playlist',
      options: [dropdown('playlist', 'Playlist', playlists)],
      callback: async (action) => {
        const name = encodeURIComponent(String(action.options.playlist ?? ''))
        const r = name ? await self.makeRequest(`/ws/remoteplayer/start_playlist/${name}`) : undefined
        await after(r)
      },
    },
    start_sequence: {
      name: 'Start Sequence in Playlist',
      options: [
        dropdown('playlist', 'Playlist', playlists),
        {
          type: 'number',
          id: 'index',
          label: 'Sequence Index (0-based)',
          default: 0,
          min: 0,
          max: 999,
        },
      ],
      callback: async (action) => {
        const playlist = encodeURIComponent(String(action.options.playlist ?? ''))
        const index = Number(action.options.index ?? 0)
        const r =
          playlist && !Number.isNaN(index)
            ? await self.makeRequest(`/ws/remoteplayer/start_sequence/${playlist}/${index}`)
            : undefined
        await after(r)
      },
    },
    start_aot: {
      name: 'Start Overlay (Stay on Top)',
      options: [dropdown('overlay', 'Overlay Sequence', overlays)],
      callback: async (action) => {
        const name = encodeURIComponent(String(action.options.overlay ?? ''))
        const r = name ? await self.makeRequest(`/ws/remoteplayer/start_aot_sequence/${name}`) : undefined
        await after(r)
      },
    },
    stop_aot: {
      name: 'Stop Overlay',
      options: [],
      callback: async () => {
        const r = await self.makeRequest('/ws/remoteplayer/start_aot_sequence/')
        await after(r)
      },
    },
    set_brightness: {
      name: 'Set Global Brightness',
      options: [
        {
          type: 'number',
          id: 'value',
          label: 'Brightness % (0-100)',
          default: 100,
          min: 0,
          max: 100,
        },
      ],
      callback: async (action) => {
        const value = action.options.value as number
        const r = await self.makeRequest(`/ws/remoteplayer/set_global_brightness/${value}`)
        await after(r)
      },
    },
    ping: {
      name: 'Ping',
      options: [],
      callback: async () => {
        const data = await self.makeRequest('/ws/remoteplayer/ping')
        if (data) {
          try {
            const json = JSON.parse(data)
            self.setVariableValues?.({
              ping_result: json.result === true ? 'true' : String(json.result ?? ''),
              ping_status: String(json.status ?? ''),
            })
            self.log('info', `Ping → status:${json.status} result:${json.result}`)
          } catch {
            self.log('warn', 'Ping: invalid JSON')
          }
        }
        await after(data)
      },
    },
  }
}
