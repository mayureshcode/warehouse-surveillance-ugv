# warehouse_description

Robot model, Gazebo construction-site simulation, SLAM/navigation configuration and motion utilities for WAREHOUSE.

## Entry points

Use `ros2 launch warehouse_description warehouse_gazebo.launch.py` for configurable simulation and `warehouse_full_system.launch.py` to include the dashboard. `world`, `headless`, `seed`, `mapping`, `launch_nav2`, `vortex_3d`, `cliff_detect`, `patrol` and `rqt_cam` control simulation features. Spawn coordinates are configurable in the canonical launcher. Patrol and the camera viewer default off.

## Data

- `urdf/`: Xacro robot structure and simulated sensors.
- `worlds/warehouse_construction_site.sdf`: static mesh-based construction scene.
- `models/construction_site_chunk5/`: supplied collision meshes with their original proprietary license; publication authorized by the repository owner. See ../../docs/DEPENDENCIES.md.
- `config/`: Nav2, SLAM and existing patrol presets. Preset route safety requires inspection against the selected map.
- `test/`: kinematics, point-cloud, TF, launch clock, navigation and world contracts.

The arbiter accepts `/warehouse/cmd_vel/manual`, `/warehouse/cmd_vel/recovery` and `/warehouse/cmd_vel/nav`, prioritizes fresh commands and publishes `/warehouse/cmd_vel`. The controller publishes limited `/warehouse/gazebo_cmd_vel` for Gazebo. Neither is a certified hardware safety controller.

Read the [workspace README](../../README.md) and [deployment checks](../../docs/DEPLOYMENT.md) before deployment.
