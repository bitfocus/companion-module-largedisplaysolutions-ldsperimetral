import type { CompanionVariableDefinition } from '@companion-module/base'

export function getVariableDefinitions(): CompanionVariableDefinition[] {
  return [
    { variableId: 'is_playing', name: 'Is Playing' },
    { variableId: 'is_paused', name: 'Is Paused' },
    { variableId: 'current_playlist', name: 'Current Playlist' },
    { variableId: 'current_sequence', name: 'Current Sequence' },
    { variableId: 'current_sequence_index', name: 'Current Sequence Index' },
    { variableId: 'current_overlay', name: 'Current Overlay' },
    { variableId: 'elapsed_ms', name: 'Elapsed Time (ms)' },
    { variableId: 'total_ms', name: 'Total Time (ms)' },
    { variableId: 'ping_result', name: 'Ping Result' },
    { variableId: 'ping_status', name: 'Ping Status (0=OK)' },
    { variableId: 'instance_name', name: 'Instance Name' },
  ]
}
