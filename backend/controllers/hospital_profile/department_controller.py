# controllers/department/department_controller.py

import uuid

from database.department_queries import insert_department
from flask import jsonify, request


def add_department_controller(hospital_id):
    try:
        data = request.get_json()

        if not data:
            return jsonify({"status": "error", "message": "No data provided"}), 400

        # 🔥 Extract fields
        name = data.get("name")
        head = data.get("head")
        description = data.get("description")
        location = data.get("location")

        # ✅ Validate
        if not name:
            return (
                jsonify({"status": "error", "message": "Department name is required"}),
                400,
            )

        # 🔥 Generate ID
        department_id = f"dept_{uuid.uuid4().hex[:8]}"

        # ✅ Call DB
        new_department = insert_department(
            department_id, hospital_id, name, head, description, location
        )

        if not new_department:
            return (
                jsonify({"status": "error", "message": "Failed to add department"}),
                500,
            )

        return (
            jsonify(
                {
                    "status": "success",
                    "message": "Department added successfully",
                    "data": new_department,
                }
            ),
            201,
        )

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500
