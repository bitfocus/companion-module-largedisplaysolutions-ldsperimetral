import {
  InstanceBase,
  InstanceStatus,
  runEntrypoint,
  type SomeCompanionConfigField,
} from '@companion-module/base'
import * as http from 'node:http'
import { getConfigFields, type ModuleConfig } from './config.js'
import { getActions } from './actions.js'
import { getVariableDefinitions } from './variables.js'
import { getFeedbacks } from './feedbacks.js'
import { getPresets } from './presets.js'
import { UpgradeScripts } from './upgrades.js'

interface ApiResponse<T = unknown> {
  status: number
  message: string | null
  result: T
}

interface PlaylistInfo {
  name: string
  filename: string
  is_quick_action: boolean
  has_button: boolean
  sequence_count: number
}

interface SequenceInfo {
  name: string
  filename: string
  is_on_top: boolean
}

interface ReproductionState {
  is_playing: boolean
  is_paused: boolean
  is_render_active: boolean
  is_quickaction: boolean
  current_playlist: string
  current_sequence: string
  current_sequence_index: number
  current_overlay_sequence_name: string
  current_sequence_elapsed_time: string
  current_sequence_total_time: string
}

class LDSperimetralInstance extends InstanceBase<ModuleConfig> {
  public config!: ModuleConfig
  private pollInterval?: NodeJS.Timeout
  private timeInterval?: NodeJS.Timeout
  private lastStatus?: InstanceStatus

  private playlists: PlaylistInfo[] = []
  private overlays: SequenceInfo[] = []
  private lastPlaylistIds = ''
  private lastOverlayIds = ''

  public getPlaylistChoices() {
    return this.playlists.map((p) => ({ id: p.name, label: `${p.name} (${p.sequence_count} seq)` }))
  }

  public getOverlayChoices() {
    return this.overlays.map((o) => ({ id: o.name, label: o.name }))
  }

  public async init(config: ModuleConfig): Promise<void> {
    this.config = config
    this.updateStatus(InstanceStatus.Connecting)

    this.setVariableDefinitions(getVariableDefinitions())
    this.setFeedbackDefinitions(getFeedbacks(this))
    this.updateActionsAndPresets(true)

    await this.refreshLists()
    await this.pollState()
    this.updateActionsAndPresets()

    this.startPolling()
    this.log('info', `LDSperimetral v1.58.1 ready → ${config.host}:${config.port}`)
  }

  public async destroy(): Promise<void> {
    if (this.pollInterval) clearInterval(this.pollInterval)
    if (this.timeInterval) clearInterval(this.timeInterval)
  }

  public async configUpdated(config: ModuleConfig): Promise<void> {
    this.config = config
    this.updateStatus(InstanceStatus.Connecting)
    this.updateActionsAndPresets(true)
    await this.refreshLists()
    await this.pollState()
    this.updateActionsAndPresets()
    this.startPolling()
  }

  public getConfigFields(): SomeCompanionConfigField[] {
    return getConfigFields()
  }

  private setConnectionStatus(ok: boolean, message?: string) {
    const next = ok ? InstanceStatus.Ok : InstanceStatus.ConnectionFailure
    if (next === this.lastStatus) return
    this.lastStatus = next
    this.updateStatus(next, message)
  }

  private startPolling() {
    if (this.pollInterval) clearInterval(this.pollInterval)
    if (this.timeInterval) clearInterval(this.timeInterval)

    const intervalMs = Math.max(1000, (this.config.refreshInterval || 60) * 1000)
    this.log('debug', `Polling every ${intervalMs / 1000}s`)

    this.pollInterval = setInterval(async () => {
      await this.pollState()
      await this.refreshLists()
      this.updateActionsAndPresets()
    }, intervalMs)

    if (this.config.fastTimeUpdate) {
      this.timeInterval = setInterval(async () => {
        await this.pollReproductionState()
      }, 1000)
    }
  }

  public async refreshAfterCommand() {
    await new Promise((r) => setTimeout(r, 500))
    await this.pollReproductionState()
  }

  private async pollState() {
    await this.pollReproductionState()
    await this.pollInstanceName()
  }

  private async pollReproductionState() {
    try {
      const data = await this.makeRequest('/ws/remoteplayer/get_reproduction_state')
      if (data) {
        const json = JSON.parse(data) as ApiResponse<ReproductionState>
        if (json.status === 0 && json.result) {
          const s = json.result
          this.setVariableValues({
            is_playing: s.is_playing ? 'true' : 'false',
            is_paused: s.is_paused ? 'true' : 'false',
            current_playlist: s.current_playlist || '',
            current_sequence: s.current_sequence || '',
            current_sequence_index: String(s.current_sequence_index ?? -1),
            current_overlay: s.current_overlay_sequence_name || '',
            elapsed_ms: s.current_sequence_elapsed_time || '0',
            total_ms: s.current_sequence_total_time || '0',
          })
          this.checkFeedbacks('is_playing', 'is_paused')
          this.setConnectionStatus(true)
        } else {
          this.setConnectionStatus(false, 'Invalid response from LDSperimetral')
        }
      } else {
        this.setConnectionStatus(false, 'No reply from LDSperimetral')
      }
    } catch (e) {
      this.log('debug', `pollReproductionState error: ${e}`)
      this.setConnectionStatus(false, String(e))
    }
  }

  private async pollInstanceName() {
    try {
      const nameRaw = await this.makeRequest('/ws/remoteplayer/get_instance_name')
      if (nameRaw) {
        const nameJson = JSON.parse(nameRaw) as ApiResponse<string>
        if (nameJson.status === 0) {
          this.setVariableValues({ instance_name: nameJson.result || '' })
        }
      }
    } catch (e) {
      this.log('debug', `pollInstanceName error: ${e}`)
    }
  }

  private updateActionsAndPresets(force = false) {
    const plIds = this.playlists.map((p) => p.name).join('|')
    const ovIds = this.overlays.map((o) => o.name).join('|')
    if (!force && plIds === this.lastPlaylistIds && ovIds === this.lastOverlayIds) return
    this.lastPlaylistIds = plIds
    this.lastOverlayIds = ovIds
    this.setActionDefinitions(getActions(this))
    this.setPresetDefinitions(getPresets(this))
  }

  private async refreshLists() {
    try {
      const plRaw = await this.makeRequest('/ws/remoteplayer/list_playlists')
      if (plRaw) {
        const json = JSON.parse(plRaw) as ApiResponse<PlaylistInfo[]>
        if (json.status === 0 && Array.isArray(json.result)) {
          this.playlists = json.result
          this.log('info', `Playlists: ${this.playlists.length}`)
        }
      }

      const ovRaw = await this.makeRequest('/ws/remoteplayer/list_overlay_sequences')
      if (ovRaw) {
        const json = JSON.parse(ovRaw) as ApiResponse<SequenceInfo[]>
        if (json.status === 0 && Array.isArray(json.result)) {
          this.overlays = json.result
          this.log('info', `Overlays: ${this.overlays.length}`)
        }
      }
    } catch (e) {
      this.log('debug', `refreshLists error: ${e}`)
    }
  }

  public async makeRequest(path: string): Promise<string | void> {
    const host = (this.config.host || '').trim()
    const url = `http://${host}:${this.config.port}${path}`
    this.log('debug', `→ ${url}`)

    return new Promise((resolve) => {
      const req = http.get(url, (res) => {
        let data = ''
        res.on('data', (chunk) => (data += chunk))
        res.on('end', () => {
          const code = res.statusCode ?? 0
          if (code >= 200 && code < 400) {
            resolve(data.trim())
          } else {
            this.log('warn', `← HTTP ${code} for ${path}`)
            resolve()
          }
        })
      })
      req.on('error', (err) => {
        this.log('debug', `Request error: ${err.message}`)
        resolve()
      })
      req.setTimeout(3000, () => {
        req.destroy()
        resolve()
      })
    })
  }
}

export default LDSperimetralInstance

runEntrypoint(LDSperimetralInstance, UpgradeScripts)
