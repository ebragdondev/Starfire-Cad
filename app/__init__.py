from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager
from flask_session import Session
import redis
from config import Config

db = SQLAlchemy()
login_manager = LoginManager()

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    db.init_app(app)
    login_manager.init_app(app)
    app.config['SESSION_TYPE'] = 'redis'
    app.config['SESSION_REDIS'] = redis.from_url(app.config['REDIS_URL'])
    Session(app)

    from .routes.auth import auth_bp
    from .routes.community import community_bp
    from .routes.dashboard import dashboard_bp
    from .routes.gap import gap_bp
    from .routes.api import api_bp
    from .routes.stripe_webhook import stripe_webhook_bp
    from .routes.ai import ai_bp
    from .routes.marketplace import market_bp
    from .routes.simulator import sim_bp
    from .routes.scripts import scripts_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(community_bp)
    app.register_blueprint(dashboard_bp)
    app.register_blueprint(gap_bp)
    app.register_blueprint(api_bp)
    app.register_blueprint(stripe_webhook_bp)
    app.register_blueprint(ai_bp)
    app.register_blueprint(market_bp)
    app.register_blueprint(sim_bp)
    app.register_blueprint(scripts_bp)

    return app
