from database.departments_queries import (
    create_department,
    delete_department,
    get_departments_by_hospital,
    update_department,
)
from flask import jsonify, request


# ======================
# CREATE DEPARTMENT
# ======================
def add_hospital_department(hospital_id):
    try:
        data = request.get_json()

        name = data.get("name")
        head = data.get("head")
        description = data.get("description")
        location = data.get("location")

        if not name:
            return (
                jsonify({"success": False, "error": "Department name is required"}),
                400,
            )

        department = create_department(
            hospital_id,
            name,
            head,
            description,
            location,
        )

        if not department:
            return (
                jsonify({"success": False, "error": "Failed to create department"}),
                500,
            )

        return (
            jsonify(
                {
                    "success": True,
                    "message": "Department created successfully",
                    "data": department,
                }
            ),
            201,
        )

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


# ======================
# GET DEPARTMENTS
# ======================
def get_departments(hospital_id):
    try:
        departments = get_departments_by_hospital(hospital_id)

        return jsonify({"success": True, "data": departments}), 200

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


# ======================
# UPDATE DEPARTMENT
# ======================
def edit_department(department_id):
    try:
        data = request.get_json()

        updated = update_department(
            department_id,
            name=data.get("name"),
            head=data.get("head"),
            description=data.get("description"),
            location=data.get("location"),
        )

        if not updated:
            return (
                jsonify(
                    {"success": False, "error": "Department not found or update failed"}
                ),
                404,
            )

        return (
            jsonify(
                {
                    "success": True,
                    "message": "Department updated successfully",
                    "data": updated,
                }
            ),
            200,
        )

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


# ======================
# DELETE DEPARTMENT
# ======================
def remove_department(department_id):
    try:
        deleted = delete_department(department_id)

        if not deleted:
            return jsonify({"success": False, "error": "Department not found"}), 404

        return (
            jsonify({"success": True, "message": "Department deleted successfully"}),
            200,
        )

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500
