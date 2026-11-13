#!/usr/bin/env bash
# Select native ROS/Ubuntu pairs. Optional function arguments support fixture tests.
warehouse_select_platform() {
  local release_file="${1:-/etc/os-release}" architecture="${2:-$(uname -m)}"
  local ID VERSION_ID
  source "$release_file"
  [[ "$ID" == ubuntu && "$architecture" == x86_64 ]] || {
    echo 'Supported targets: Ubuntu 22.04/Humble and Ubuntu 24.04/Jazzy on amd64.' >&2;return 1;
  }
  case "$VERSION_ID" in
    22.04) WAREHOUSE_ROS_DISTRO=humble;WAREHOUSE_UBUNTU_CODENAME=jammy;WAREHOUSE_GZ_BRIDGE=ros-humble-ros-gzharmonic;;
    24.04) WAREHOUSE_ROS_DISTRO=jazzy;WAREHOUSE_UBUNTU_CODENAME=noble;WAREHOUSE_GZ_BRIDGE=ros-jazzy-ros-gz;;
    *) echo "Unsupported Ubuntu version: $VERSION_ID" >&2;return 1;;
  esac
  export WAREHOUSE_ROS_DISTRO WAREHOUSE_UBUNTU_CODENAME WAREHOUSE_GZ_BRIDGE
}
warehouse_source_ros() {
  [[ -f "/opt/ros/$WAREHOUSE_ROS_DISTRO/setup.bash" ]] || {
    echo "Missing ROS $WAREHOUSE_ROS_DISTRO. Run ./setup.sh to install prerequisites." >&2;return 1;
  }
  source "/opt/ros/$WAREHOUSE_ROS_DISTRO/setup.bash"
}
