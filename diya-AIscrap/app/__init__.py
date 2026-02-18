import os
from flask import Flask, send_from_directory
from flask_cors import CORS
from dotenv import load_dotenv

load_dotenv()

def create_app():
    # Paths for serving the React build
    static_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'static')
    assets_dir = os.path.join(static_dir, 'assets')

    app = Flask(__name__,
                static_folder=assets_dir,
                static_url_path='/assets')

    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'change-this-in-production')

    CORS(app)

    # Register API blueprints
    from app.routes import main_bp, brand_bp, calendar_bp
    app.register_blueprint(main_bp)
    app.register_blueprint(brand_bp)
    app.register_blueprint(calendar_bp)

    # Register New Flows (Modular)
    import sys
    import importlib.util

    # Add project root to sys.path
    root_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    if root_dir not in sys.path:
        sys.path.insert(0, root_dir)






    # SPA catch-all: serve React index.html for all non-API routes
    @app.route('/', defaults={'path': ''})
    @app.route('/<path:path>')
    def serve_spa(path):
        file_path = os.path.join(static_dir, path)
        if path and os.path.isfile(file_path):
            return send_from_directory(static_dir, path)
        return send_from_directory(static_dir, 'index.html')

    return app
