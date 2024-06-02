import os
from flask import Flask, request, jsonify, url_for, send_from_directory, abort, Response
from flask_migrate import Migrate
from flask_swagger import swagger
from api.utils import APIException, generate_sitemap
from api.models import db, Trainer, Trainer_data, User, User_data, Routines, Exercise, Image
from api.routes import api
from api.admin import setup_admin
from api.commands import setup_commands
from flask_jwt_extended import create_access_token, get_jwt_identity, jwt_required, JWTManager
from datetime import timedelta
from flask_cors import CORS
from werkzeug.utils import secure_filename
import base64
from flask_mail import Mail, Message
from itsdangerous import URLSafeTimedSerializer
from dotenv import load_dotenv

load_dotenv()

ENV = "development" if os.getenv("FLASK_DEBUG") == "1" else "production"
static_file_dir = os.path.join(os.path.dirname(
    os.path.realpath(__file__)), '../public/')
app = Flask(__name__)
app.url_map.strict_slashes = False
app.config['JWT_SECRET_KEY'] = os.getenv("JWT_SECRET_KEY")

# Agregar configuración para la expiración del token
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=2)

jwt = JWTManager(app)

# database configuration
db_url = os.getenv("DATABASE_URL")
if db_url is not None:
    app.config['SQLALCHEMY_DATABASE_URI'] = db_url.replace(
        "postgres://", "postgresql://")
else:
    app.config['SQLALCHEMY_DATABASE_URI'] = "sqlite:////tmp/test.db"
    
CORS(app)
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
MIGRATE = Migrate(app, db, compare_type=True)
db.init_app(app)

app.config['MAIL_SERVER'] = os.getenv('MAIL_SERVER')
app.config['MAIL_PORT'] = int(os.getenv('MAIL_PORT'))
app.config['MAIL_USE_TLS'] = os.getenv('MAIL_USE_TLS').lower() in ['true', '1', 'yes']
app.config['MAIL_USE_SSL'] = os.getenv('MAIL_USE_SSL').lower() in ['true', '1', 'yes']
app.config['MAIL_USERNAME'] = os.getenv('MAIL_USERNAME')
app.config['MAIL_PASSWORD'] = os.getenv('MAIL_PASSWORD')
app.config['MAIL_DEFAULT_SENDER'] = os.getenv('MAIL_DEFAULT_SENDER')
app.config['SECRET_KEY'] = os.getenv('MAIL_SECRET_KEY')

mail = Mail(app)
# add the admin
setup_admin(app)
setup_commands(app)

# Add all endpoints form the API with a "api" prefix
app.register_blueprint(api, url_prefix='/api')

# Handle/serialize errors like a JSON object
@app.errorhandler(APIException)
def handle_invalid_usage(error):
    return jsonify(error.to_dict()), error.status_code

# generate sitemap with all your endpoints
@app.route('/')
def sitemap():
    if ENV == "development":
        return generate_sitemap(app)
    return send_from_directory(static_file_dir, 'index.html')

# any other endpoint will try to serve it like a static file
@app.route('/<path:path>', methods=['GET'])
def serve_any_other_file(path):
    if not os.path.isfile(os.path.join(static_file_dir, path)):
        path = 'index.html'
    response = send_from_directory(static_file_dir, path)
    response.cache_control.max_age = 0  # avoid cache memory

    return response

# Login & Signup Endpoints
@app.route('/login', methods=['POST'])
def login():
    data = request.json
    if not data:
        raise APIException('Insert the correct information', status_code=400)
    
    email = data.get("email")
    password = data.get("password")
    
    if not email or not password:
        raise APIException('Missing email or password', status_code=400)
    
    user = User.query.filter_by(email=email).first()
    trainer = Trainer.query.filter_by(email=email).first()
    
    if (user and password != user.password) or (trainer and password != trainer.password):
        raise APIException('Invalid password, please try again', status_code=401)
    
    if user:
        role = "user"
        identity = user.id  
    elif trainer:
        role = "trainer"
        identity = trainer.id  
    else:
        raise APIException('User not found', status_code=404)
    
   
    access_token = create_access_token(identity=identity, additional_claims={"role": role})
    

    return jsonify({ "access_token": access_token}), 200

@app.route('/signup', methods=['POST'])
def create_new_user():
    data = request.json
    check_if_email_already_exists = User.query.filter_by(email=data["email"]).first()
    if check_if_email_already_exists:
        raise APIException('Email already exists', status_code=400)
        
    
    new_user = User( 
        email=data["email"],
        password=data["password"],
        role="user",
    )

    db.session.add(new_user)
    db.session.commit()

    new_user_id = new_user.id

    access_token = create_access_token(identity=new_user_id, additional_claims={"role": new_user.role})

    return jsonify({'access_token': access_token}), 200

# Delete user
@app.route('/delete_user/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    user = User.query.get(user_id)
    if not user:
        raise APIException('User not found', status_code=404)
    db.session.delete(user)
    db.session.commit()
    return jsonify({'message': f'User {user_id} and all associated data deleted'}), 200

#User Endpoints
@app.route('/user_data/<int:user_id>')
@jwt_required()
def get_user_data(user_id):
    user = User.query.get(user_id)
    
    if user:
        user_data = User_data.query.filter_by(user_id=user_id).first()
        serialized_user_data = user_data.serialize()

        return jsonify(serialized_user_data), 200
    else:
        raise APIException('User data not found', status_code=404)
        

@app.route('/user_data/<int:id>', methods=['POST', 'PATCH'])
@jwt_required()
def add_or_update_user_data(id):
    data = request.json
    existing_user_data = User_data.query.filter_by(user_id=id).first()
    if existing_user_data:
        existing_user_data.user_name = data.get("user_name", existing_user_data.user_name)
        existing_user_data.user_weight = data.get("user_weight", existing_user_data.user_weight)
        existing_user_data.user_height = data.get("user_height", existing_user_data.user_height)
        existing_user_data.user_illness = data.get("user_illness", existing_user_data.user_illness)
        existing_user_data.user_objetives = data.get("user_objetives", existing_user_data.user_objetives)
        existing_user_data.user_age = data.get("user_age", existing_user_data.user_age)
        db.session.commit()
        
        updated_user_data = User_data.query.filter_by(user_id=id).first()
        serialized_user_data = updated_user_data.serialize()

        return jsonify(serialized_user_data), 200
    else:
       
        new_user_data = User_data(
            user_name=data.get("user_name"),
            user_weight=data.get("user_weight"),
            user_height=data.get("user_height"),
            user_illness=data.get("user_illness"),
            user_objetives=data.get("user_objetives"),
            user_age=data.get("user_age"),
            user_id=get_jwt_identity() ,
            trainer_data_id=1,
        )

        db.session.add(new_user_data)
        db.session.commit()

        serialized_new_user_data = new_user_data.serialize()

        return jsonify(serialized_new_user_data), 200
    
    
@app.route('/user/<int:user_id>/profile_picture', methods=['POST', 'PUT'])
@jwt_required()
def upload_user_profile_picture(user_id):
    user_data = User_data.query.filter_by(user_id=user_id).first()
    if not user_data:
        raise APIException('User not found', status_code=404)

    imagen = request.files.get('user_profile_picture')
    if not imagen:
        raise APIException('No image selected', status_code=400)

    filename = secure_filename(imagen.filename)
    mimetype = imagen.mimetype
    img_bytes = imagen.read()
    img_base64 = base64.b64encode(img_bytes).decode('utf-8')

    if request.method == 'POST':
        
        existing_image = Image.query.filter_by(user_data_id=user_data.id).first()
        if existing_image:
            return jsonify({'error': 'Image already exists, use PUT to update'}), 400

        new_image = Image(
            user_data_id=get_jwt_identity(),
            img=img_bytes,
            name=filename,
            mimetype=mimetype,
        )
        db.session.add(new_image)
        db.session.commit()

        serialized_image = {
            'id': new_image.id,
            'user_data_id': new_image.user_data_id,
            'name': new_image.name,
            'mimetype': new_image.mimetype,
            'img': img_base64,
        }

        return jsonify(serialized_image), 201

    elif request.method == 'PUT':
        
        existing_image = Image.query.filter_by(user_data_id=user_data.id).first()
        if not existing_image:
            return jsonify({'error': 'Image not found, use POST to upload'}), 404

        existing_image.img = img_bytes
        existing_image.name = filename
        existing_image.mimetype = mimetype
        db.session.commit()

        serialized_image = {
            'id': existing_image.id,
            'user_data_id': existing_image.user_data_id,
            'name': existing_image.name,
            'mimetype': existing_image.mimetype,
            'img': img_base64,
        }

        return jsonify(serialized_image), 200


#Trainer Endpoints
@app.route('/trainer_data/<int:trainer_id>')
@jwt_required()
def get_trainer_data(trainer_id):
    trainer = Trainer.query.get(trainer_id)
    
    if trainer:
        trainer_data = Trainer_data.query.filter_by(trainer_id=trainer_id).first()
        serialized_trainer_data = trainer_data.serialize()

        return jsonify(serialized_trainer_data), 200
    else:
        raise APIException('Trainer data not found', status_code=404)
        

@app.route('/trainer_data/<int:id>', methods=['POST', 'PATCH'])
@jwt_required()
def add_or_update_trainer_data(id):
    data = request.json
    existing_trainer_data = Trainer_data.query.filter_by(trainer_id=id).first()
    if existing_trainer_data:
        existing_trainer_data.trainer_name = data.get("trainer_name", existing_trainer_data.trainer_name)
        existing_trainer_data.trainer_speciality = data.get("trainer_speciality", existing_trainer_data.trainer_speciality)
        existing_trainer_data.trainer_experience = data.get("trainer_experience", existing_trainer_data.trainer_experience)
        existing_trainer_data.trainer_certificates = data.get("trainer_certificates", existing_trainer_data.trainer_certificates)
        db.session.commit()
        
        updated_trainer_data = Trainer_data.query.filter_by(trainer_id=id).first()
        serialized_trainer_data = updated_trainer_data.serialize()

        return jsonify(serialized_trainer_data), 200
    else:
       
        new_trainer_data = Trainer_data(
            trainer_name=data.get("trainer_name"),
            trainer_speciality=data.get("trainer_speciality"),
            trainer_experience=data.get("trainer_experience"),
            trainer_certificates=data.get("trainer_certificates"),
            trainer_id=get_jwt_identity(),
        )

        db.session.add(new_trainer_data)
        db.session.commit()

        serialized_new_trainer_data = new_trainer_data.serialize()

        return jsonify(serialized_new_trainer_data), 200

# Rutinas
@app.route('/routines', methods=['POST'])
def create_routine():
    data = request.json
    new_routine = Routines(
        user_id=data["user_id"],
        trainer_id=data["trainer_id"],
        routine_name=data["routine_name"],
        routine_description=data["routine_description"],
        routine_level=data["routine_level"],
    )
    db.session.add(new_routine)
    db.session.commit()

    serialized_routine = new_routine.serialize()

    return jsonify(serialized_routine), 200


@app.route('/routines/<int:routine_id>', methods=['GET'])
def get_routine(routine_id):
    routine = Routines.query.get(routine_id)

    if not routine:
        raise APIException('Routine not found', status_code=404)

    serialized_routine = routine.serialize()

    return jsonify(serialized_routine), 200


@app.route('/routines/<int:routine_id>', methods=['PUT'])
def update_routine(routine_id):
    data = request.json
    routine = Routines.query.get(routine_id)

    if not routine:
        raise APIException('Routine not found', status_code=404)

    routine.user_id = data.get("user_id", routine.user_id)
    routine.trainer_id = data.get("trainer_id", routine.trainer_id)
    routine.routine_name = data.get("routine_name", routine.routine_name)
    routine.routine_description = data.get("routine_description", routine.routine_description)
    routine.routine_level = data.get("routine_level", routine.routine_level)

    db.session.commit()

    serialized_routine = routine.serialize()

    return jsonify(serialized_routine), 200


@app.route('/routines/<int:routine_id>', methods=['DELETE'])
def delete_routine(routine_id):
    routine = Routines.query.get(routine_id)

    if not routine:
        raise APIException('Routine not found', status_code=404)

    db.session.delete(routine)
    db.session.commit()

    return jsonify({'message': f'Routine {routine_id} deleted'}), 200


# Ejercicios
@app.route('/exercises', methods=['POST'])
def create_exercise():
    data = request.json
    new_exercise = Exercise(
        routine_id=data["routine_id"],
        exercise_name=data["exercise_name"],
        exercise_description=data["exercise_description"],
        exercise_repetitions=data["exercise_repetitions"],
        exercise_series=data["exercise_series"],
        exercise_rest=data["exercise_rest"],
    )
    db.session.add(new_exercise)
    db.session.commit()

    serialized_exercise = new_exercise.serialize()

    return jsonify(serialized_exercise), 200


@app.route('/exercises/<int:exercise_id>', methods=['GET'])
def get_exercise(exercise_id):
    exercise = Exercise.query.get(exercise_id)

    if not exercise:
        raise APIException('Exercise not found', status_code=404)

    serialized_exercise = exercise.serialize()

    return jsonify(serialized_exercise), 200


@app.route('/exercises/<int:exercise_id>', methods=['PUT'])
def update_exercise(exercise_id):
    data = request.json
    exercise = Exercise.query.get(exercise_id)

    if not exercise:
        raise APIException('Exercise not found', status_code=404)

    exercise.routine_id = data.get("routine_id", exercise.routine_id)
    exercise.exercise_name = data.get("exercise_name", exercise.exercise_name)
    exercise.exercise_description = data.get("exercise_description", exercise.exercise_description)
    exercise.exercise_repetitions = data.get("exercise_repetitions", exercise.exercise_repetitions)
    exercise.exercise_series = data.get("exercise_series", exercise.exercise_series)
    exercise.exercise_rest = data.get("exercise_rest", exercise.exercise_rest)

    db.session.commit()

    serialized_exercise = exercise.serialize()

    return jsonify(serialized_exercise), 200


@app.route('/exercises/<int:exercise_id>', methods=['DELETE'])
def delete_exercise(exercise_id):
    exercise = Exercise.query.get(exercise_id)

    if not exercise:
        raise APIException('Exercise not found', status_code=404)

    db.session.delete(exercise)
    db.session.commit()

    return jsonify({'message': f'Exercise {exercise_id} deleted'}), 200


if __name__ == '__main__':
    app.run()
