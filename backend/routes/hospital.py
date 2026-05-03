# """
# Hospital Profile Routes
# Handles hospital information and statistics
# """

# from flask import Blueprint, request, jsonify
# from database.config import get_db_connection
# import uuid
# import os
# from werkzeug.utils import secure_filename

# hospital_bp = Blueprint('hospital', __name__, url_prefix='/api/hospitals')

# def get_db():
#     return get_db_connection()

# # ===== GET HOSPITAL PROFILE =====
# @hospital_bp.route('/<string:hospital_id>', methods=['GET'])
# def get_hospital(hospital_id):
#     try:
#         conn = get_db()
#         cur = conn.cursor()
        
#         cur.execute("""
#             SELECT id, name, email, phone, city, country, address, 
#                    verified, created_at, updated_at
#             FROM hospital 
#             WHERE id = %s
#         """, (hospital_id,))
        
#         hospital = cur.fetchone()
#         cur.close()
#         conn.close()
        
#         if not hospital:
#             return jsonify({'success': False, 'message': 'Hospital not found'}), 404
        
#         return jsonify({
#             'id': hospital['id'],
#             'name': hospital['name'],
#             'email': hospital.get('email', ''),
#             'phone': hospital.get('phone', ''),
#             'location': f"{hospital.get('city', '')}, {hospital.get('country', '')}",
#             'address': hospital.get('address', ''),
#             'verified': hospital.get('verified', False)
#         })
#     except Exception as e:
#         return jsonify({'success': False, 'message': str(e)}), 500

# # ===== UPDATE HOSPITAL PROFILE =====
# @hospital_bp.route('/<string:hospital_id>', methods=['PUT'])
# def update_hospital(hospital_id):
#     try:
#         data = request.get_json()
#         conn = get_db()
#         cur = conn.cursor()
        
#         update_fields = []
#         params = []
        
#         if 'name' in data:
#             update_fields.append("name = %s")
#             params.append(data['name'])
#         if 'email' in data:
#             update_fields.append("email = %s")
#             params.append(data['email'])
#         if 'phone' in data:
#             update_fields.append("phone = %s")
#             params.append(data['phone'])
#         if 'city' in data:
#             update_fields.append("city = %s")
#             params.append(data['city'])
#         if 'country' in data:
#             update_fields.append("country = %s")
#             params.append(data['country'])
#         if 'address' in data:
#             update_fields.append("address = %s")
#             params.append(data['address'])
        
#         if not update_fields:
#             return jsonify({'success': False, 'message': 'No fields to update'}), 400
        
#         update_fields.append("updated_at = NOW()")
#         params.append(hospital_id)
        
#         query = f"UPDATE hospital SET {', '.join(update_fields)} WHERE id = %s"
#         cur.execute(query, params)
        
#         conn.commit()
#         cur.close()
#         conn.close()
        
#         return jsonify({'success': True, 'message': 'Hospital updated successfully'})
#     except Exception as e:
#         return jsonify({'success': False, 'message': str(e)}), 500

# # ===== GET HOSPITAL STATISTICS =====
# @hospital_bp.route('/<string:hospital_id>/stats', methods=['GET'])
# def get_hospital_stats(hospital_id):
#     try:
#         conn = get_db()
#         cur = conn.cursor()
        
#         # Total staff (users)
#         cur.execute("""
#             SELECT COUNT(*) as count FROM users 
#             WHERE hospital_id = %s AND active = true
#         """, (hospital_id,))
#         staff_count = cur.fetchone()
        
#         # Total departments
#         cur.execute("""
#             SELECT COUNT(*) as count FROM departments 
#             WHERE hospital_id = %s
#         """, (hospital_id,))
#         dept_count = cur.fetchone()
        
#         # Total assessments
#         cur.execute("""
#             SELECT COUNT(*) as count FROM assessment 
#             WHERE hospital_id = %s
#         """, (hospital_id,))
#         assessment_count = cur.fetchone()
        
#         cur.close()
#         conn.close()
        
#         return jsonify({
#             'success': True,
#             'totalStaff': staff_count['count'] if staff_count else 0,
#             'totalDepartments': dept_count['count'] if dept_count else 0,
#             'totalAssessments': assessment_count['count'] if assessment_count else 0
#         })
#     except Exception as e:
#         return jsonify({'success': False, 'message': str(e)}), 500