import type { CompanionPresetDefinitions } from '@companion-module/base'

type Self = {
  getPlaylistChoices: () => { id: string; label: string }[]
  getOverlayChoices: () => { id: string; label: string }[]
}

export function getPresets(self: Self): CompanionPresetDefinitions {
  const playlists = self.getPlaylistChoices()
  const overlays = self.getOverlayChoices()

  const presets: CompanionPresetDefinitions = {
    // === Transport ===
    stop: {
      type: 'button',
      category: 'Transport',
      name: 'Stop',
      style: {
        text: 'STOP',
        size: '18',
        color: 0xffffff,
        bgcolor: 0xff0000,
      },
      steps: [{ down: [{ actionId: 'stop', options: {} }], up: [] }],
      feedbacks: [],
    },
    pause: {
      type: 'button',
      category: 'Transport',
      name: 'Pause',
      style: {
        text: 'PAUSE',
        size: '18',
        color: 0x000000,
        bgcolor: 0xffff00,
      },
      steps: [{ down: [{ actionId: 'pause', options: {} }], up: [] }],
      feedbacks: [],
    },
    resume: {
      type: 'button',
      category: 'Transport',
      name: 'Resume',
      style: {
        text: 'RESUME',
        size: '18',
        color: 0xffffff,
        bgcolor: 0x00aa00,
      },
      steps: [{ down: [{ actionId: 'resume', options: {} }], up: [] }],
      feedbacks: [],
    },
    pauseresume: {
      type: 'button',
      category: 'Transport',
      name: 'Pause / Resume',
      style: {
        text: 'PAUSE\\nRESUME',
        size: '14',
        color: 0xffffff,
        bgcolor: 0x333333,
      },
      steps: [{ down: [{ actionId: 'pauseresume', options: {} }], up: [] }],
      feedbacks: [
        {
          feedbackId: 'is_paused',
          options: {},
          style: { bgcolor: 0xffff00, color: 0x000000 },
        },
      ],
    },
    play_next: {
      type: 'button',
      category: 'Transport',
      name: 'Play Next',
      style: {
        text: 'NEXT',
        size: '18',
        color: 0xffffff,
        bgcolor: 0x0066cc,
      },
      steps: [{ down: [{ actionId: 'play_next', options: {} }], up: [] }],
      feedbacks: [],
    },
    quick_action_exit: {
      type: 'button',
      category: 'Transport',
      name: 'Quick Action Exit',
      style: {
        text: 'QA\\nEXIT',
        size: '14',
        color: 0xffffff,
        bgcolor: 0xcc6600,
      },
      steps: [{ down: [{ actionId: 'quick_action_exit', options: {} }], up: [] }],
      feedbacks: [],
    },

    // === System ===
    ping: {
      type: 'button',
      category: 'System',
      name: 'Ping',
      style: {
        text: 'PING',
        size: '18',
        color: 0xffffff,
        bgcolor: 0x006699,
      },
      steps: [{ down: [{ actionId: 'ping', options: {} }], up: [] }],
      feedbacks: [],
    },
    brightness_100: {
      type: 'button',
      category: 'System',
      name: 'Brightness 100%',
      style: {
        text: 'BRIGHT\\n100%',
        size: '14',
        color: 0x000000,
        bgcolor: 0xffffff,
      },
      steps: [{ down: [{ actionId: 'set_brightness', options: { value: 100 } }], up: [] }],
      feedbacks: [],
    },
    brightness_50: {
      type: 'button',
      category: 'System',
      name: 'Brightness 50%',
      style: {
        text: 'BRIGHT\\n50%',
        size: '14',
        color: 0xffffff,
        bgcolor: 0x666666,
      },
      steps: [{ down: [{ actionId: 'set_brightness', options: { value: 50 } }], up: [] }],
      feedbacks: [],
    },
    brightness_0: {
      type: 'button',
      category: 'System',
      name: 'Brightness 0%',
      style: {
        text: 'BRIGHT\\n0%',
        size: '14',
        color: 0xffffff,
        bgcolor: 0x000000,
      },
      steps: [{ down: [{ actionId: 'set_brightness', options: { value: 0 } }], up: [] }],
      feedbacks: [],
    },

    // === Overlays group ===
    stop_overlay: {
      type: 'button',
      category: 'Overlays',
      name: 'Stop Overlay',
      style: {
        text: 'STOP\\nOVERLAY',
        size: '14',
        color: 0xffffff,
        bgcolor: 0xaa0000,
      },
      steps: [{ down: [{ actionId: 'stop_aot', options: {} }], up: [] }],
      feedbacks: [],
    },
  }

  // Dynamic: Start Overlay for each found sequence
  overlays.forEach((ov) => {
    const safeId = ov.id.replace(/[^a-zA-Z0-9_-]/g, '_')
    presets[`ov_${safeId}`] = {
      type: 'button',
      category: 'Overlays',
      name: `Start Overlay: ${ov.label}`,
      style: {
        text: ov.label.length > 18 ? ov.label.substring(0, 16) + '…' : ov.label,
        size: '14',
        color: 0xffffff,
        bgcolor: 0x9900cc,
      },
      steps: [
        {
          down: [{ actionId: 'start_aot', options: { overlay: ov.id } }],
          up: [],
        },
      ],
      feedbacks: [],
    }
  })

  // Dynamic: Start Playlist for each found playlist
  playlists.forEach((pl) => {
    const safeId = pl.id.replace(/[^a-zA-Z0-9_-]/g, '_')
    presets[`pl_${safeId}`] = {
      type: 'button',
      category: 'Playlists',
      name: `Start Playlist: ${pl.label}`,
      style: {
        text: pl.label.length > 18 ? pl.label.substring(0, 16) + '…' : pl.label,
        size: '14',
        color: 0xffffff,
        bgcolor: 0x006600,
      },
      steps: [
        {
          down: [{ actionId: 'start_playlist', options: { playlist: pl.id } }],
          up: [],
        },
      ],
      feedbacks: [],
    }
  })

  return presets
}
