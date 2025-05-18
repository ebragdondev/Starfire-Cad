from flask import Blueprint, render_template
from flask_login import login_required

market_bp = Blueprint('marketplace', __name__, url_prefix='/marketplace')

@market_bp.route('/')
@login_required
def index():
    items = [{"name": "Dark Mode Theme"}, {"name": "DUI Report Template"}]
    return render_template('marketplace/index.html', items=items)
