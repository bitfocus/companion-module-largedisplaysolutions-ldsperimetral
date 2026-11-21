import type { SomeCompanionConfigField } from '@companion-module/base'

export interface ModuleConfig {
  host: string
  port: number
  refreshInterval: number
  fastTimeUpdate: boolean
}

export function getConfigFields(): SomeCompanionConfigField[] {
  return [
    {
      type: 'textinput',
      id: 'host',
      label: 'IP Address of LDSperimetral PC',
      width: 8,
      default: '127.0.0.1',
    },
    {
      type: 'number',
      id: 'port',
      label: 'HTTP Port',
      width: 4,
      min: 1,
      max: 65535,
      default: 8082,
    },
    {
      type: 'number',
      id: 'refreshInterval',
      label: 'Refresh interval (seconds)',
      width: 6,
      min: 1,
      max: 3600,
      default: 60,
    },
    {
      type: 'checkbox',
      id: 'fastTimeUpdate',
      label: 'Update time variables (elapsed_ms / total_ms) every second',
      width: 12,
      default: false,
    },
  ]
}
