import uuid

from database.user_queries import (
    assign_user_to_department,
    create_user,
    get_user_by_email,
    get_users_by_hospital,
)
from flask import jsonify, request

# Allowed roles for staff (NOT super_admin)
ALLOWED_ROLES = [
    "doctor",
    "nurse",
    "admin",
    "lab_technician",
    "receptionist",
    "pharmacist",
]


def add_staff_member(hospital_id):
    try:
        data = request.get_json()

        if not data:
            return jsonify({"success": False, "error": "No data provided"}), 400

        # Normalize fields
        name = data.get("name") or data.get("fullName")
        email = data.get("email")
        phone = data.get("phone")
        role = data.get("position") or data.get("role")
        department_id = data.get("department_id")
        join_date = data.get("join_date")

        # Validate required fields
        if not name or not email or not role:
            return (
                jsonify(
                    {"success": False, "error": "Name, email, and role are required"}
                ),
                400,
            )

        # 🚫 Block super_admin creation
        if role == "super_admin":
            return (
                jsonify({"success": False, "error": "Cannot assign super_admin role"}),
                403,
            )

        # Validate role
        if role not in ALLOWED_ROLES:
            return jsonify({"success": False, "error": "Invalid role"}), 400

        # Check duplicate email
        if get_user_by_email(email):
            return jsonify({"success": False, "error": "Email already exists"}), 400

        # Generate user ID
        user_id = f"user_{uuid.uuid4().hex[:8]}"

        # Temporary password
        temp_password = "temp123"

        # Create user
        new_user = create_user(
            user_id=user_id,
            full_name=name,
            email=email,
            password_hash=temp_password,
            hospital_id=hospital_id,
            role=role,
            phone=phone,
        )

        if not new_user:
            return (
                jsonify({"success": False, "error": "Failed to create staff user"}),
                500,
            )

        # Assign department (optional)
        if department_id:
            assign_user_to_department(
                user_id=user_id,
                department_id=department_id,
                position=role,
                join_date=join_date,
            )

        return (
            jsonify(
                {
                    "success": True,
                    "message": "Staff member added successfully",
                    "data": new_user,
                }
            ),
            201,
        )

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


# ======================
# GET STAFFs
# ======================


def get_staff(hospital_id):
    try:
        staff = get_users_by_hospital(hospital_id)
        return jsonify({"success": True, "data": staff}), 200

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500
