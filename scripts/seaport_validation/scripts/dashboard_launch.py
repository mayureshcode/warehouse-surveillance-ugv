import sys
from pathlib import Path
folder=Path(__file__).parent/'dashboard';sys.path.insert(0,str(folder))
from warehouse_dashboard import dashboard_node as d
original=d.get_package_share_directory
d.get_package_share_directory=lambda p:str(folder) if p=='warehouse_dashboard' else original(p)
d.main()
