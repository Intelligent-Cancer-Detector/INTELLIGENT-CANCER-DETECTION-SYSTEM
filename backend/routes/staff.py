"""
Staff Management Routes
Handles hospital staff (users)
"""

from flask import Blueprint, request, jsonify
from database.config import get_db_connection
import uuid
from datetime import datetime

staff_bp = Blueprint('staff', __name__, url_prefix='/api/hospitals')

def get_db():
    return get_db_connection()

# ===== GET ALL STAFF =====
@staff_bp.route('/<string:hospital_id>/staff', methods=['GET'])
def get_all_staff(hospital_id):
    try:
        conn = get_db()
        cur = conn.cursor()
        
        cur.execute("""
            SELECT 
                u.id, 
                u.full_name as name, 
                u.email, 
                u.phone, 
                u.role as position,
                u.department,
                u.active,
                u.created_at,
                ud.department_id,
                ud.position_in_dept,
                ud.join_date,
                d.name as department_name
            FROM users u
            LEFT JOIN user_departments ud ON u.id = ud.user_id
            LEFT JOIN departments d ON ud.department_id = d.id
            WHERE u.hospital_id = %s AND u.active = true
            ORDER BY u.full_name
        """, (hospital_id,))
        
        staff = cur.fetchall()
        cur.close()
        conn.close()
        
        return jsonify(staff if staff else [])
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

# ===== ADD NEW STAFF =====
@staff_bp.route('/<string:hospital_id>/staff', methods=['POST'])
def add_staff(hospital_id):
    try:
        data = request.get_json()
        conn = get_db()
        cur = conn.cursor()
        
        # Validate required fields
        required = ['name', 'email', 'position']
        for field in required:
            if field not in data:
                return jsonify({'success': False, 'message': f'Missing required field: {field}'}), 400
        
        # Check if email exists
        cur.execute("SELECT id FROM users WHERE email = %s", (data['email'],))
        if cur.fetchone():
            return jsonify({'success': False, 'message': 'Email already exists'}), 400
        
        # Generate user ID
        user_id = f"user_{uuid.uuid4().hex[:8]}"
        
        # Insert new user
        cur.execute("""
            INSERT INTO users (
                id, hospital_id, full_name, email, phone, role, 
                password_hash, active, created_at, updated_at
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, (
            user_id, 
            hospital_id, 
            data['name'], 
            data['email'], 
            data.get('phone', ''), 
            data['position'], 
            'pending_hash', 
            True,
            datetime.now(),
            datetime.now()
        ))
        
        # If department assigned, add to junction table
        if data.get('department_id'):
            cur.execute("""
                INSERT INTO user_departments (user_id, department_id, position_in_dept, join_date)
                VALUES (%s, %s, %s, %s)
            """, (user_id, data['department_id'], data['position'], data.get('join_date')))
        
        conn.commit()
        cur.close()
        conn.close()
        
        return jsonify({
            'success': True, 
            'message': 'Staff added successfully', 
            'user_id': user_id
        }), 201
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

# ===== DELETE STAFF (SOFT DELETE) =====
@staff_bp.route('/<string:hospital_id>/staff/<string:staff_id>', methods=['DELETE'])
def delete_staff(hospital_id, staff_id):
    try:
        conn = get_db()
        cur = conn.cursor()
        
        # Soft delete - set active to false
        cur.execute("""
            UPDATE users 
            SET active = false, updated_at = NOW()
            WHERE id = %s AND hospital_id = %s
        """, (staff_id, hospital_id))
        
        conn.commit()
        cur.close()
        conn.close()
        
        return jsonify({'success': True, 'message': 'Staff deleted successfully'})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

# ===== UPDATE STAFF =====
@staff_bp.route('/<string:hospital_id>/staff/<string:staff_id>', methods=['PUT'])
def update_staff(hospital_id, staff_id):
    try:
        data = request.get_json()
        conn = get_db()
        cur = conn.cursor()
        
        update_fields = []
        params = []
        
        if 'name' in data:
            update_fields.append("full_name = %s")
            params.append(data['name'])
        if 'email' in data:
            update_fields.append("email = %s")
            params.append(data['email'])
        if 'phone' in data:
            update_fields.append("phone = %s")
            params.append(data['phone'])
        if 'position' in data:
            update_fields.append("role = %s")
            params.append(data['position'])
        
        if update_fields:
            update_fields.append("updated_at = NOW()")
            params.append(staff_id)
            params.append(hospital_id)
            
            query = f"UPDATE users SET {', '.join(update_fields)} WHERE id = %s AND hospital_id = %s"
            cur.execute(query, params)
        
        conn.commit()
        cur.close()
        conn.close()
        
        return jsonify({'success': True, 'message': 'Staff updated successfully'})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500