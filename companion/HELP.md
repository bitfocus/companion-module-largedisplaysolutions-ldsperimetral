# LDSperimetral

Control **LDSperimetral v1.58.1** from [Large Display Solutions](https://www.largedisplaysolutions.com/) via its HTTP API.

Official API documentation:  
https://www.largedisplaysolutions.com/fr/documentation-de-lapi-http-de-ldsperimetral/

## Configuration

- **IP Address**: IP of the computer running LDSperimetral (default `127.0.0.1`)
- **Port**: HTTP port configured in the software (default `8082`)
- **Refresh interval**: Time between automatic refreshes of variables and lists (default `60` seconds)
- **Update time variables every second**: When enabled, `elapsed_ms` and `total_ms` are refreshed every second

## Features

- Dynamic actions and presets for playlists and overlay sequences
- Real-time variables from `get_reproduction_state`
- Automatic refresh of all variables after every command
- Support for Stop / Pause / Resume / Play Next / Brightness / AOT overlays
- Sequence names proposed in "Start Sequence in Playlist"

## Variables

- `is_playing`, `is_paused`
- `current_playlist`, `current_sequence`, `current_sequence_index`
- `current_overlay`
- `elapsed_ms`, `total_ms`
- `ping_result`, `ping_status`
- `instance_name`

## Developer

**Le Comte Brice**  
SAS BLC  
Website: [www.blc-tech.fr](https://www.blc-tech.fr)  
Email: brice@blc-tech.fr

## Notes

All actions send simple HTTP GET requests.  
Responses are JSON envelopes (`status`, `message`, `result`).  
Make sure the Companion computer can reach the LDSperimetral PC on the network.
