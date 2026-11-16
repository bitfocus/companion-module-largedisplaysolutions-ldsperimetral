import type { CompanionFeedbackDefinitions } from '@companion-module/base'

type Self = {
  getVariableValue: (variableId: string) => string | undefined
}

export function getFeedbacks(self: Self): CompanionFeedbackDefinitions {
  return {
    is_playing: {
      type: 'boolean',
      name: 'Is Playing',
      defaultStyle: {
        bgcolor: 0x00ff00,
        color: 0x000000,
      },
      options: [],
      callback: () => {
        return self.getVariableValue('is_playing') === 'true'
      },
    },
    is_paused: {
      type: 'boolean',
      name: 'Is Paused',
      defaultStyle: {
        bgcolor: 0xffff00,
        color: 0x000000,
      },
      options: [],
      callback: () => {
        return self.getVariableValue('is_paused') === 'true'
      },
    },
  }
}
