from controllers.hospital_profile.hospital_profile_controller import (
    get_hospital_data_stats,
    get_hospital_profile,
    update_hospital_profile,
)
from flask import Blueprint

hospital_info_bp = Blueprint("hospital_info", __name__)


# ===== GET HOSPITAL PROFILE =====
@hospital_info_bp.route("/<hospital_id>", methods=["GET"])
def get_hospital(hospital_id):
    return get_hospital_profile(hospital_id)


# ===== UPDATE HOSPITAL PROFILE =====
@hospital_info_bp.route("/<hospital_id>/update-hospital", methods=["PUT"])
def update_hospital(hospital_id):
    return update_hospital_profile(hospital_id)


# ===== GET HOSPITAL STATISTICS =====
@hospital_info_bp.route("/<hospital_id>/hospital-stats", methods=["PUT"])
def get_hospital_stats(hospital_id):
    return get_hospital_data_stats(hospital_id)


# staff section
# ===== GET ALL STAFF =====
@hospital_info_bp.route("/<hospital_id>/staff", methods=["GET"])
def get_all_staff(hospital_id):
    return get_all_staff_by_hospital(hospital_id)
    pass


# ===== ADD NEW STAFF =====
@hospital_info_bp.route("/<hospital_id>/staff/add-staff", methods=["POST"])
def add_staff(hospital_id):
    return add_staff_controller(hospital_id)


# ===== DELETE STAFF (SOFT DELETE) =====
@hospital_info_bp.route(
    "/<hospital_id>/staff/<string:staff_id>/delete-staff", methods=["DELETE"]
)
def delete_staff(hospital_id, staff_id):
    pass


# ===== UPDATE STAFF =====
@hospital_info_bp.route("/<hospital_id>/staff/<string:staff_id>", methods=["PUT"])
def update_staff(hospital_id, staff_id):
    pass
