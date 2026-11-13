from setuptools import find_packages, setup
import os
from glob import glob

package_name = 'warehouse_dashboard'

setup(
    name=package_name,
    version='0.0.1',
    packages=find_packages(exclude=['test']),
    data_files=[
        ('share/ament_index/resource_index/packages',
            ['resource/' + package_name]),
        ('share/' + package_name, ['package.xml', 'README.md']),
        (os.path.join('share', package_name, 'launch'), glob('launch/*.launch.py')),
        (os.path.join('share', package_name, 'web'), glob('web/*.*')),
        (os.path.join('share', package_name, 'web/css'), glob('web/css/*.*')),
        (os.path.join('share', package_name, 'web/js'), glob('web/js/*.*')),
        (os.path.join('share', package_name, 'web/vendor'), glob('web/vendor/*.*')),
        (os.path.join('share', package_name, 'web/assets'), glob('web/assets/*.*')),
    ],
    install_requires=['setuptools', 'websockets', 'aiohttp'],
    zip_safe=True,
    maintainer='Developer',
    maintainer_email='dev@example.com',
    description='WAREHOUSE Web Dashboard',
    license='Apache-2.0',
    entry_points={
        'console_scripts': [
            'dashboard_node = warehouse_dashboard.dashboard_node:main'
        ],
    },
)
