"""Compatibility entrypoint for the canonical WAREHOUSE simulation launch."""
import importlib.util
from pathlib import Path


def generate_launch_description():
    spec = importlib.util.spec_from_file_location(
        'warehouse_gazebo_launch', Path(__file__).with_name('warehouse_gazebo.launch.py'))
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module.generate_launch_description()
