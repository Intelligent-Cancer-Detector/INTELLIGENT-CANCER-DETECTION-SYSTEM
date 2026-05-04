import uuid

from database.staff_queries import check_email_exists, insert_staff
from flask import jsonify, request


# ===== ADD STAFF MEMBER =====
def add_staff_member(hospital_id):
    try:
        data = request.get_json()

        if not data:
            return jsonify({"status": "error", "message": "No data provided"}), 400

        # normalize keys
        name = data.get("name") or data.get("fullName")
        email = data.get("email")
        phone = data.get("phone")
        position = data.get("position") or data.get("role")
        department_id = data.get("department_id")
        join_date = data.get("join_date")

        # required fields
        if not name or not email or not position:
            return (
                jsonify(
                    {
                        "status": "error",
                        "message": "Name, email, and position are required",
                    }
                ),
                400,
            )

        # check duplicate email
        if check_email_exists(email):
            return jsonify({"status": "error", "message": "Email already exists"}), 400

        # generate user id
        user_id = f"user_{uuid.uuid4().hex[:8]}"

        # insert into database
        new_staff = insert_staff(
            user_id=user_id,
            hospital_id=hospital_id,
            name=name,
            email=email,
            phone=phone,
            position=position,
            department_id=department_id,
            join_date=join_date,
        )

        if not new_staff:
            return (
                jsonify({"status": "error", "message": "Failed to add staff member"}),
                500,
            )

        return (
            jsonify(
                {
                    "status": "success",
                    "message": "Staff member added successfully",
                    "data": new_staff,
                }
            ),
            201,
        )

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500
