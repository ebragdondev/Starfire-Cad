from flask import Blueprint, render_template, request
from flask_login import login_required

ai_bp = Blueprint('ai', __name__, url_prefix='/ai')

@ai_bp.route('/assistant', methods=['GET', 'POST'])
@login_required
def assistant():
    result = ""
    if request.method == 'POST':
        input_text = request.form['incident']
        result = f"AI Suggestion: Based on input '{input_text}', recommend further investigation and possible traffic citation."
    return render_template('ai/assistant.html', result=result)
