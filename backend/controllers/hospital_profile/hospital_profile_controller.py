from flask import request, jsonify
from database.hospital_queries import update_hospital, get_hospital_by_id


# ===== GET HOSPITAL PROFILE =====
def get_hospital_profile(hospital_id):
    try:
        data = get_hospital_by_id(hospital_id)

        return {"status": "success", "data": data}
    except Exception as e:
        return {"status": "error", "message": str(e)}


# ===== UPDATE HOSPITAL PROFILE =====
def update_hospital_profile(hospital_id):
    try:
        data = request.get_json()
        if not data:
            return jsonify({"status": "error", "message": "No data provided"}), 400

        # Check if hospital exists
        existing = get_hospital_by_id(hospital_id)
        if not existing:
            return jsonify({"status": "error", "message": "Hospital not found"}), 404

        # ✅ Only allow specific fields (IMPORTANT)
        allowed_fields = {
            "name",
            "email",
            "hospital_logo",
            "license_number",
            "hospital_type",
            "address",
            "city",
            "state",
            "postal_code",
            "country",
            "phone",
            "description",
        }

        filtered_data = {k: v for k, v in data.items() if k in allowed_fields}

        # ❌ Prevent empty update
        if not filtered_data:
            return (
                jsonify({"status": "error", "message": "No valid fields to update"}),
                400,
            )

        # Optional: simple email validation
        if "email" in filtered_data and "@" not in filtered_data["email"]:
            return jsonify({"status": "error", "message": "Invalid email format"}), 400

        # Call DB layer
        updated = update_hospital(
            hospital_id=hospital_id,
            name=filtered_data.get("name"),
            email=filtered_data.get("email"),
            hospital_logo=filtered_data.get("hospital_logo"),
            license_number=filtered_data.get("license_number"),
            hospital_type=filtered_data.get("hospital_type"),
            address=filtered_data.get("address"),
            city=filtered_data.get("city"),
            state=filtered_data.get("state"),
            postal_code=filtered_data.get("postal_code"),
            country=filtered_data.get("country"),
            phone=filtered_data.get("phone"),
            description=filtered_data.get("description"),
            # 🚫 intentionally removed verified & active
        )

        if not updated:
            return jsonify({"status": "error", "message": "Update failed"}), 500

        return (
            jsonify(
                {
                    "status": "success",
                    "message": "Hospital updated successfully",
                    "data": updated,
                }
            ),
            200,
        )

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


# ===== GET HOSPITAL STATISTICS =====
def get_hospital_data_stats(hospital_id):
    pass
