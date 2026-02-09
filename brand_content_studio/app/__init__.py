from flask import Flask
from flask_cors import CORS

def create_app():
    app = Flask(__name__)
    app.config['SECRET_KEY'] = 'your-secret-key-change-this'
    
    CORS(app)
    
    # Register blueprints
    from app.routes import main_bp, brand_bp, calendar_bp
    
    app.register_blueprint(main_bp)
    app.register_blueprint(brand_bp)
    app.register_blueprint(calendar_bp)
    
    return app
