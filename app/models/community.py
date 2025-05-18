from app import db

class Community(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False)
    plan = db.Column(db.String(50), default='free')
    stripe_id = db.Column(db.String(100), nullable=True)
    logo_url = db.Column(db.String(255), nullable=True)
    primary_color = db.Column(db.String(20), default='#1D4ED8')
    discord_webhook_url = db.Column(db.String(255), nullable=True)
    discord_guild_id = db.Column(db.String(100), nullable=True)
    discord_bot_token = db.Column(db.String(255), nullable=True)
    api_key = db.Column(db.String(100), nullable=True)
    users = db.relationship('User', backref='community', lazy=True)
