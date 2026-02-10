import os
import sys

# Add project directory to path
project_home = os.path.dirname(os.path.abspath(__file__))
if project_home not in sys.path:
    sys.path.insert(0, project_home)

os.chdir(project_home)

from dotenv import load_dotenv
load_dotenv(os.path.join(project_home, '.env'))

from app import create_app
application = create_app()
