from flask import Blueprint, render_template, redirect, url_for
from flask_login import current_user, login_required
from app.models.user import User
from app.models.community import Community
from app import db

gap_bp = Blueprint('gap', __name__, url_prefix='/gap')

@gap_bp.before_request
@login_required
def check_staff():
    if current_user.role not in ['staff', 'superadmin']:
        return redirect(url_for('community.dashboard'))

@gap_bp.route('/')
def dashboard():
    user_count = User.query.count()
    community_count = Community.query.count()
    return render_template('gap/dashboard.html', user_count=user_count, community_count=community_count)

@gap_bp.route('/users')
def users():
    all_users = User.query.all()
    return render_template('gap/users.html', users=all_users)

@gap_bp.route('/communities')
def communities():
    all_communities = Community.query.all()
    return render_template('gap/communities.html', communities=all_communities)
