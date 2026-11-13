import re

with open('launch/warehouse_gazebo.launch.py', 'r') as f:
    content = f.read()

# Topics to add:
# Unitree Lidar
# '/warehouse/sensors/unitree_lidar@sensor_msgs/msg/LaserScan[gz.msgs.LaserScan',
# '/warehouse/sensors/unitree_lidar/points@sensor_msgs/msg/PointCloud2[gz.msgs.PointCloudPacked',
# Orbbec Astra 2
# '/warehouse/sensors/orbbec/color/image_raw@sensor_msgs/msg/Image[gz.msgs.Image',
# '/warehouse/sensors/orbbec/color/camera_info@sensor_msgs/msg/CameraInfo[gz.msgs.CameraInfo',
# '/warehouse/sensors/orbbec/depth/image_raw@sensor_msgs/msg/Image[gz.msgs.Image',
# '/warehouse/sensors/orbbec/depth/camera_info@sensor_msgs/msg/CameraInfo[gz.msgs.CameraInfo',

new_topics = """
            # Rear Cluster (Unitree & Orbbec)
            '/warehouse/sensors/unitree_lidar@sensor_msgs/msg/LaserScan[gz.msgs.LaserScan',
            '/warehouse/sensors/unitree_lidar/points@sensor_msgs/msg/PointCloud2[gz.msgs.PointCloudPacked',
            '/warehouse/sensors/orbbec/color/image_raw@sensor_msgs/msg/Image[gz.msgs.Image',
            '/warehouse/sensors/orbbec/color/camera_info@sensor_msgs/msg/CameraInfo[gz.msgs.CameraInfo',
            '/warehouse/sensors/orbbec/depth/image_raw@sensor_msgs/msg/Image[gz.msgs.Image',
            '/warehouse/sensors/orbbec/depth/camera_info@sensor_msgs/msg/CameraInfo[gz.msgs.CameraInfo',
"""

# Insert right before the D435i topics or PTZ
content = content.replace("            # D435i", new_topics + "            # D435i")

with open('launch/warehouse_gazebo.launch.py', 'w') as f:
    f.write(content)

