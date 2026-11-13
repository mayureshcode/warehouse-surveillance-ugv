from setuptools import setup, find_packages
from glob import glob
import os

name='warehouse_bringup'
data=[('share/ament_index/resource_index/packages',['resource/'+name]),('share/'+name,['package.xml','README.md','COMMISSIONING.md'])]
for directory in ['launch','config','firmware']:
    for path,_,files in os.walk(directory):
        data.append(('share/'+name+'/'+path,[path+'/'+file for file in files]))
setup(name=name,version='0.1.0',packages=find_packages(exclude=['test']),data_files=data,
      install_requires=['setuptools','numpy','pyserial'],maintainer='WAREHOUSE maintainers',maintainer_email='dev@example.com',
      description='Shared WAREHOUSE application stack with simulation and physical hardware adapters',license='Apache-2.0',
      entry_points={'console_scripts':[
       'sensor_adapter=warehouse_bringup.common_nodes:sensor_adapter_main',
       'health_supervisor=warehouse_bringup.common_nodes:health_main',
       'motion_gateway=warehouse_bringup.common_nodes:motion_main',
       'gnss_monitor=warehouse_bringup.common_nodes:gnss_monitor_main',
       'rtk_alignment=warehouse_bringup.rtk_alignment:main',
       'mock_hardware=warehouse_bringup.mock_hardware:main',
       'stm32_bridge=warehouse_bringup.hardware_nodes:stm32_main',
       'f9p_driver=warehouse_bringup.hardware_nodes:f9p_main',
       'bno085_driver=warehouse_bringup.hardware_nodes:bno_main',
       'gazebo_drive=warehouse_bringup.gazebo_adapter:main',
      ]})
