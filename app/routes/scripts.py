from flask import Blueprint, render_template, request
from flask_login import login_required

scripts_bp = Blueprint('scripts', __name__, url_prefix='/scripts')

@scripts_bp.route('/')
@login_required
def list_scripts():
    scripts = [{"trigger": "unit_login", "code": "print('Welcome')"}]
    return render_template('scripts/index.html', scripts=scripts)
