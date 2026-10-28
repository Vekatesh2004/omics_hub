import io
import uuid
from datetime import datetime
from flask import Flask, render_template, request, redirect, url_for, session, send_file, jsonify
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas

app = Flask(__name__, template_folder='templates', static_folder='static')
app.secret_key = "omics_hub_training_portal_secret"

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///omics_hub.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# Database Models
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    subscription_plan = db.Column(db.String(50), default="Free")

class Course(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(150), nullable=False)
    plan_required = db.Column(db.String(50), nullable=False)
    category = db.Column(db.String(50), nullable=False)
    description = db.Column(db.Text, nullable=False)
    lessons = db.relationship('Lesson', backref='course', lazy=True)

class Lesson(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    course_id = db.Column(db.Integer, db.ForeignKey('course.id'), nullable=False)
    title = db.Column(db.String(150), nullable=False)
    content = db.Column(db.Text, nullable=False)
    duration = db.Column(db.String(50), default="45 mins")
    order_num = db.Column(db.Integer, nullable=False)

class Progress(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    course_id = db.Column(db.Integer, db.ForeignKey('course.id'), nullable=False)
    completed_lessons = db.Column(db.String(255), default="")  # Comma-separated completed lesson IDs
    completion_pct = db.Column(db.Integer, default=0)
    attendance_pct = db.Column(db.Integer, default=95)
    project_status = db.Column(db.String(50), default="In Progress")

# Database Seeding
with app.app_context():
    db.create_all()
    if not Course.query.first():
        c1 = Course(
            title="Python for Bioinformatics & Sequence Parsing",
            plan_required="Free",
            category="Programming",
            description="Master sequence manipulation, Biopython modules, and FASTQ parsing."
        )
        c2 = Course(
            title="Proteomics & Structural Biology (AlphaFold)",
            plan_required="Pro",
            category="Proteomics",
            description="Process mass spectrometry data, protein-ligand docking, and 3D structure prediction."
        )
        c3 = Course(
            title="Variant Calling & NGS Analysis Pipeline",
            plan_required="Premium",
            category="Genomics",
            description="Process Illumina FASTQ reads, execute BWA-MEM alignment, and run GATK HaplotypeCaller."
        )
        db.session.add_all([c1, c2, c3])
        db.session.commit()

        # Seed realistic modules for Course 1
        l1 = Lesson(course_id=c1.id, order_num=1, title="Module 1: Introduction to BioPython & Sequence IO", duration="30 mins", content="Learn to initialize SeqRecord objects, read FASTA/FASTQ headers, and translate DNA sequences into amino acid chains.")
        l2 = Lesson(course_id=c1.id, order_num=2, title="Module 2: Quality Filtering & FASTQ Parsing", duration="45 mins", content="Parse raw Illumina sequencing quality scores, extract Phred-33 ASCII values, and filter low-quality sequence reads.")
        l3 = Lesson(course_id=c1.id, order_num=3, title="Module 3: Automating Sequence Alignments", duration="60 mins", content="Build custom automated pipelines using pairwise alignment algorithms (Needleman-Wunsch & Smith-Waterman) in Python.")
        db.session.add_all([l1, l2, l3])
        db.session.commit()

@app.after_request
def add_header(response):
    response.headers['Cache-Control'] = 'no-store, no-cache, must-revalidate, max-age=0'
    return response

@app.route("/")
def index():
    if "user" in session:
        return redirect(url_for("training_dashboard"))
    return redirect(url_for("auth"))

@app.route("/auth", methods=["GET", "POST"])
def auth():
    if "user" in session and request.method == "GET":
        user_exists = User.query.filter_by(username=session["user"]).first()
        if user_exists:
            return redirect(url_for("training_dashboard"))
        session.clear()

    if request.method == "POST":
        action = request.form.get("action")
        if action == "register":
            username = request.form.get("username", "").strip()
            email = request.form.get("email", "").strip()
            password = request.form.get("password", "").strip()
            
            existing = User.query.filter((User.username == username) | (User.email == email)).first()
            if existing:
                return render_template("auth.html", error="User or email already registered.", active_tab="register")
            
            new_user = User(username=username, email=email, password_hash=generate_password_hash(password))
            db.session.add(new_user)
            db.session.commit()
            
            for course in Course.query.all():
                db.session.add(Progress(user_id=new_user.id, course_id=course.id, completion_pct=0))
            db.session.commit()
            
            session["user"] = username
            return redirect(url_for("training_dashboard"))
            
        elif action == "login":
            username = request.form.get("username", "").strip()
            password = request.form.get("password", "").strip()
            user = User.query.filter_by(username=username).first()
            if user and check_password_hash(user.password_hash, password):
                session["user"] = user.username
                return redirect(url_for("training_dashboard"))
            return render_template("auth.html", error="Invalid credentials.", active_tab="login")
            
    return render_template("auth.html", active_tab="login")

@app.route("/training")
def training_dashboard():
    if "user" not in session:
        return redirect(url_for("auth"))
    
    current_user = User.query.filter_by(username=session["user"]).first()
    if not current_user:
        session.clear()
        return redirect(url_for("auth"))
    
    all_courses = Course.query.all()
    course_data = []
    
    for c in all_courses:
        p = Progress.query.filter_by(user_id=current_user.id, course_id=c.id).first()
        if not p:
            p = Progress(user_id=current_user.id, course_id=c.id, completion_pct=0)
            db.session.add(p)
            db.session.commit()

        completed_ids = set(filter(None, p.completed_lessons.split(","))) if p.completed_lessons else set()

        course_data.append({
            "id": c.id,
            "title": c.title,
            "plan_required": c.plan_required,
            "category": c.category,
            "description": c.description,
            "progress": p.completion_pct,
            "attendance": f"{p.attendance_pct}%",
            "project_status": p.project_status,
            "lessons": [
                {
                    "id": l.id,
                    "title": l.title,
                    "duration": l.duration,
                    "content": l.content,
                    "is_completed": str(l.id) in completed_ids
                } for l in c.lessons
            ]
        })
        
    return render_template("training.html", user=current_user, courses=course_data)

# API Route to complete an individual module step
@app.route("/complete_module/<int:course_id>/<int:lesson_id>", methods=["POST"])
def complete_module(course_id, lesson_id):
    if "user" not in session:
        return jsonify({"error": "Unauthorized"}), 401
    
    user = User.query.filter_by(username=session["user"]).first()
    progress = Progress.query.filter_by(user_id=user.id, course_id=course_id).first()
    total_lessons = Lesson.query.filter_by(course_id=course_id).count()
    
    if progress and total_lessons > 0:
        completed = set(filter(None, progress.completed_lessons.split(",")))
        completed.add(str(lesson_id))
        progress.completed_lessons = ",".join(completed)
        progress.completion_pct = int((len(completed) / total_lessons) * 100)
        
        if progress.completion_pct == 100:
            progress.project_status = "Completed"
            
        db.session.commit()
        return jsonify({"success": True, "new_progress": progress.completion_pct, "completed_lessons": list(completed)})
        
    return jsonify({"error": "Invalid course or module"}), 400

@app.route("/subscribe/<plan>")
def subscribe(plan):
    if "user" not in session:
        return redirect(url_for("auth"))
    user = User.query.filter_by(username=session["user"]).first()
    if user and plan in ["Free", "Pro", "Premium"]:
        user.subscription_plan = plan
        db.session.commit()
    return redirect(url_for("training_dashboard"))

@app.route("/generate_certificate/<course_name>")
def generate_certificate(course_name):
    if "user" not in session:
        return redirect(url_for("auth"))
        
    username = session["user"]
    issue_date = datetime.now().strftime("%B %d, %Y")
    cert_id = f"OH-{uuid.uuid4().hex[:8].upper()}"
    
    buffer = io.BytesIO()
    pdf = canvas.Canvas(buffer, pagesize=letter)
    
    pdf.setStrokeColorRGB(0.05, 0.15, 0.3)
    pdf.setLineWidth(4)
    pdf.rect(20, 20, 572, 752)
    
    pdf.setFillColorRGB(0.05, 0.15, 0.3)
    pdf.rect(20, 690, 572, 82, fill=True)
    pdf.setFillColorRGB(1, 1, 1)
    pdf.setFont("Helvetica-Bold", 22)
    pdf.drawCentredString(306, 725, "OMICS HUB ACADEMY")
    
    pdf.setFillColorRGB(0.1, 0.1, 0.1)
    pdf.setFont("Helvetica-Bold", 20)
    pdf.drawCentredString(306, 610, "CERTIFICATE OF ACHIEVEMENT")
    
    pdf.setFont("Helvetica", 13)
    pdf.drawCentredString(306, 550, "This is proudly presented to:")
    
    pdf.setFont("Helvetica-Bold", 22)
    pdf.setFillColorRGB(0.0, 0.47, 0.8)
    pdf.drawCentredString(306, 500, username.upper())
    
    pdf.setFillColorRGB(0.1, 0.1, 0.1)
    pdf.setFont("Helvetica", 13)
    pdf.drawCentredString(306, 440, "for successfully completing all modules of the training program:")
    
    pdf.setFont("Helvetica-Bold", 15)
    pdf.drawCentredString(306, 400, f'"{course_name}"')
    
    pdf.setFont("Helvetica", 10)
    pdf.setFillColorRGB(0.4, 0.4, 0.4)
    pdf.drawCentredString(306, 320, f"Issued Date: {issue_date}  |  Verification ID: {cert_id}")
    
    pdf.setLineWidth(1)
    pdf.setStrokeColorRGB(0.7, 0.7, 0.7)
    pdf.line(140, 220, 280, 220)
    pdf.line(332, 220, 472, 220)
    
    pdf.setFont("Helvetica", 10)
    pdf.setFillColorRGB(0.1, 0.1, 0.1)
    pdf.drawCentredString(210, 205, "Lead Bioinformatician")
    pdf.drawCentredString(402, 205, "Academic Director")
    
    pdf.save()
    buffer.seek(0)
    
    return send_file(
        buffer,
        as_attachment=True,
        download_name=f"OmicsHub_{course_name.replace(' ', '_')}_Certificate.pdf",
        mimetype="application/pdf"
    )

@app.route("/logout")
def logout():
    session.clear()
    return redirect(url_for("auth"))

if __name__ == "__main__":
    app.run(debug=True)