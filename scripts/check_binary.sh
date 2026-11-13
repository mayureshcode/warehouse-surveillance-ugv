#!/usr/bin/env bash
set -eo pipefail
root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
source "$root/scripts/platform.sh"
warehouse_select_platform
warehouse_source_ros
source "$root/scripts/environment.sh"
source "$root/install/local_setup.bash"
python3 - <<'PY'
import importlib
from ament_index_python.packages import get_package_share_directory
for name in ['warehouse_description','warehouse_bringup','warehouse_dashboard','warehouse_slam','glim_ros','nav2_bringup']:
    print(name,get_package_share_directory(name))
for name in ['warehouse_slam.map_bridge','warehouse_slam.saved_localizer','warehouse_dashboard.ros_bridge']:
    importlib.import_module(name)
PY
ros2 pkg executables glim_ros | rg -q '^glim_ros glim_rosnode$'
xacro "$root/install/warehouse_description/share/warehouse_description/urdf/warehouse.urdf.xacro" minimal_sensors:=true >/dev/null
# ELF loader checks, not a substitute for motion/SLAM acceptance.
while IFS= read -r -d '' library; do
  if ldd "$library" 2>/dev/null | rg -q '=> not found'; then
    echo "Unresolved runtime library: $library" >&2;exit 1
  fi
done < <(find "$root/install" "$root/.binary/deps" -type f -name '*.so*' -print0)
echo 'Binary runtime package/import/link checks passed.'
