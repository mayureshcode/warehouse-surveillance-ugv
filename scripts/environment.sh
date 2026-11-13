#!/usr/bin/env bash
# Sourced by supported entry points; local GLIM dependencies take precedence.
warehouse_deps_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)/.deps"
warehouse_prefix="$warehouse_deps_root/install"
if [[ "${WAREHOUSE_ROS_DISTRO:-${ROS_DISTRO:-humble}}" == jazzy ]]; then
  warehouse_prefix="$warehouse_deps_root/jazzy/install"
fi
warehouse_binary_lib="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)/.binary/deps/lib"
if [[ -d "$warehouse_binary_lib" ]]; then
  export LD_LIBRARY_PATH="$warehouse_binary_lib${LD_LIBRARY_PATH:+:$LD_LIBRARY_PATH}"
fi
if [ -d "$warehouse_prefix" ]; then
  export CMAKE_PREFIX_PATH="$warehouse_prefix${CMAKE_PREFIX_PATH:+:$CMAKE_PREFIX_PATH}"
  export LD_LIBRARY_PATH="$warehouse_prefix/lib:$warehouse_prefix/lib64${LD_LIBRARY_PATH:+:$LD_LIBRARY_PATH}"
fi
unset warehouse_prefix warehouse_deps_root warehouse_binary_lib
