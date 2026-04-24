import hashlib
import uuid

from flask import jsonify, request
from database.hospital_queries import create_hospital
from database.user_queries import get_user_by_email
from database.user_queries import create_user

DEBUG_MODE = True


def register_user():
    try:
        data = request.get_json()

        hospital = data.get("hospital", {})
        admin = data.get("admin", {})
        security = data.get("security", {})

        #  checking if user really exuists
        existing = get_user_by_email(admin.get("email"))
        if existing:
            return jsonify({"success": False, "error": "User already exists"}), 400

        # # HASH PASSWORD
        # password_hash = hashlib.sha256(security.get("password").encode()).hexdigest()

        raw_password = security.get("password")
        if DEBUG_MODE:
            password_hash = raw_password
        else:
            password_hash = hashlib.sha256(
                security.get("password").encode()
            ).hexdigest()

        # CREATE HOSPITAL

        hospital_id = str(uuid.uuid4())

        hospital_result = create_hospital(
            hospital_id,
            hospital.get("name"),
            hospital.get("email"),
            hospital.get("phone"),
            hospital.get("address"),
            hospital.get("city"),
            hospital.get("state"),
            hospital.get("postal_code"),
            hospital.get("country"),
            hospital.get("type"),
        )

        # CREATE USER
        user_id = str(uuid.uuid4())
        user = create_user(
            user_id=user_id,
            full_name=admin.get("fullName"),
            email=admin.get("email"),
            password_hash=password_hash,
            hospital_id=hospital_id,
            role="super_admin",
            department=admin.get("department"),
            phone=admin.get("phone"),
        )

        return (
            jsonify(
                {
                    "success": True,
                    "message": "Registration successful",
                    "user": user,
                    "hospital": hospital_result,
                }
            ),
            201,
        )

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


def login_user():
    try:
        data = request.get_json()
        email = data.get("email")
        password = data.get("password")

        # 1 Checking if user exists
        user = get_user_by_email(email)
        if not user:
            return (
                jsonify({"success": False, "error": "Invalid email or password"}),
                401,
            )

        # # 2 Hash the incoming password
        # password_hash = hashlib.sha256(password.encode()).hexdigest()

        # 3 compare the passwords
        if DEBUG_MODE:
            password_to_check = password
        else:
            password_to_check = hashlib.sha256(password.encode()).hexdigest()

        if user["password_hash"] != password_to_check:
            return (
                jsonify({"success": False, "error": "Invalid email or password"}),
                401,
            )

        # 4 login success
        return (
            jsonify(
                {
                    "success": True,
                    "message": "Login successful",
                    "user": {
                        "id": user["id"],
                        "email": user["email"],
                        "full_name": user["full_name"],
                        "role": user["role"],
                        "hospital_id": user["hospital_id"],
                    },
                }
            ),
            200,
        )

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


"""

The above is similar to this in nodejs

# export const registerUser = async (req, res) => {
#    const result = await createUser(req.body)
# }


"""
