import os
from setuptools import find_packages, setup
from glob import glob

package_name = 'warehouse_description'

def get_data_files():
    data_files = [
        ('share/ament_index/resource_index/packages',
            ['resource/' + package_name]),
        ('share/' + package_name, ['package.xml', 'README.md']),
        ('share/' + package_name + '/launch', glob('launch/*.launch.py')),
        ('share/' + package_name + '/config', glob('config/*.yaml') + glob('config/*.xml')),
        ('share/' + package_name + '/rviz', glob('rviz/*')),
        ('share/' + package_name + '/urdf', glob('urdf/*')),
        ('share/' + package_name + '/scripts', glob('scripts/*.py')),
    ]

    for directory in ['models', 'worlds']:
        for (path, directories, filenames) in os.walk(directory):
            for filename in filenames:
                data_files.append((os.path.join('share', package_name, path), [os.path.join(path, filename)]))
    return data_files

setup(
    name=package_name,
    version='0.1.0',
    packages=find_packages(exclude=['test']),
    data_files=get_data_files(),
    install_requires=['setuptools'],
    zip_safe=True,
    maintainer='Developer',
    maintainer_email='dev@example.com',
    description='warehouse_description ROS2 package',
    license='Apache-2.0',
    entry_points={
        'console_scripts': [
            'warehouse_description_node = warehouse_description.warehouse_description_node:main',
            'patrol_controller = warehouse_description.patrol_controller:main',
            'waypoint_patrol = warehouse_description.waypoint_patrol:waypoint_patrol_main',
            'set_patrol_points = warehouse_description.set_patrol_points:main',
            'vortex_3d_mapper = warehouse_description.vortex_3d_mapper:main',
            'cliff_detector = warehouse_description.cliff_detector:main',
            'teleop_mapping_keyboard = warehouse_description.teleop_mapping_keyboard:main',
            'teleop_mapping_terminal = warehouse_description.teleop_mapping_terminal:main',
            'differential_drive_controller = warehouse_description.differential_drive_controller:main',
            'scan_tf_gate = warehouse_description.scan_tf_gate:main',
            'command_arbiter = warehouse_description.command_arbiter:main',
        ],
    },
)
