import os

class Config:
    SECRET_KEY = os.getenv('SECRET_KEY', 'fallback')
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SESSION_TYPE = 'redis'
    SESSION_REDIS = redis.from_url(os.getenv('REDIS_URL'))
