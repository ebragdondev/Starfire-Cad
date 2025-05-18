from flask import Blueprint, render_template, request
from flask_login import login_required

sim_bp = Blueprint('simulator', __name__, url_prefix='/simulator')

@sim_bp.route('/')
@login_required
def quiz_list():
    quizzes = [{"id": 1, "title": "Pursuit Policy"}, {"id": 2, "title": "10-Code Quiz"}]
    return render_template('simulator/index.html', quizzes=quizzes)

@sim_bp.route('/quiz/<int:quiz_id>')
@login_required
def take_quiz(quiz_id):
    return render_template('simulator/quiz.html', quiz_id=quiz_id)
