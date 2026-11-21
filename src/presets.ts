import type { CompanionPresetDefinitions } from '@companion-module/base'

type Self = {
  getPlaylistChoices: () => { id: string; label: string }[]
  getOverlayChoices: () => { id: string; label: string }[]
}

export function getPresets(self: Self): CompanionPresetDefinitions {
  const playlists = self.getPlaylistChoices()
  const overlays = self.getOverlayChoices()

  const presets: CompanionPresetDefinitions = {
    // === Status ===
    current_status: {
      type: 'button',
      category: 'Status',
      name: 'Current Status',
      style: {
        text: '$(LDSperimetral:instance_name)\\n$(LDSperimetral:current_playlist)\\n$(LDSperimetral:current_sequence)',
        size: '14',
        color: 0xffffff,
        bgcolor: 0x333333,
        alignment: 'center:center',
      },
      steps: [{ down: [], up: [] }],
      feedbacks: [
        {
          feedbackId: 'is_playing',
          options: {},
          style: { bgcolor: 0x00aa00, color: 0xffffff },
        },
      ],
    },
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
        color: 0x000000,
        bgcolor: 0xcccccc,
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
        bgcolor: 0x444444,
      },
      steps: [{ down: [{ actionId: 'ping', options: {} }], up: [] }],
      feedbacks: [],
    },
    set_brightness: {
      type: 'button',
      category: 'System',
      name: 'Set Brightness',
      style: {
        text: 'BRIGHT\\n100%',
        size: '14',
        color: 0xffffff,
        bgcolor: 0x555555,
      },
      steps: [{ down: [{ actionId: 'set_brightness', options: { value: 100 } }], up: [] }],
      feedbacks: [],
    },
    stop_aot: {
      type: 'button',
      category: 'System',
      name: 'Stop Overlay',
      style: {
        text: 'STOP\\nOV',
        size: '14',
        color: 0xffffff,
        bgcolor: 0x880000,
      },
      steps: [{ down: [{ actionId: 'stop_aot', options: {} }], up: [] }],
      feedbacks: [],
    },
  }

  // Dynamic: Start Overlay for each found sequence
  overlays.forEach((ov, i) => {
    presets[`ov_${i}`] = {
      type: 'button',
      category: 'Overlays',
      name: `Overlay: ${ov.label}`,
      style: {
        text: `OV\\n${ov.label}`,
        size: '14',
        color: 0xffffff,
        bgcolor: 0x663399,
      },
      steps: [{ down: [{ actionId: 'start_aot', options: { overlay: ov.id } }], up: [] }],
      feedbacks: [],
    }
  })

  // Dynamic: Start Playlist for each found playlist
  playlists.forEach((pl, i) => {
    presets[`pl_${i}`] = {
      type: 'button',
      category: 'Playlists',
      name: `Playlist: ${pl.label}`,
      style: {
        text: `PL\\n${pl.label}`,
        size: '14',
        color: 0xffffff,
        bgcolor: 0x006600,
      },
      steps: [{ down: [{ actionId: 'start_playlist', options: { playlist: pl.id } }], up: [] }],
      feedbacks: [],
    }
  })

  return presets
}
