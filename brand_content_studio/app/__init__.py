from flask import Flask
from flask_cors import CORS

from dotenv import load_dotenv
import os

load_dotenv()

def create_app():

    app = Flask(__name__)
    app.config['SECRET_KEY'] = 'your-secret-key-change-this'
    
    CORS(app, origins=[
        'https://diya-react.vercel.app',
        'http://localhost:5173',
        'http://localhost:5174',
    ])
    
    # Register blueprints
    from app.routes import main_bp, brand_bp, calendar_bp
    
    app.register_blueprint(main_bp)
    app.register_blueprint(brand_bp)
    app.register_blueprint(calendar_bp)
    
    return app
