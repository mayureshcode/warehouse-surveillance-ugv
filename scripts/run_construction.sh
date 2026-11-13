#!/usr/bin/env bash
set -eo pipefail
workspace_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
source "$workspace_root/scripts/platform.sh"
warehouse_select_platform
warehouse_source_ros
source "$workspace_root/install/setup.bash"
exec ros2 launch warehouse_description warehouse_full_system.launch.py world:=warehouse_construction_site.sdf seed:=42 "$@"
