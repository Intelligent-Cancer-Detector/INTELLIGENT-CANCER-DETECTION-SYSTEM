"""
Department Management Routes
Handles hospital departments
"""

from flask import Blueprint, request, jsonify
from database.config import get_db_connection
from datetime import datetime

departments_bp = Blueprint('departments', __name__, url_prefix='/api/hospitals')

def get_db():
    return get_db_connection()

# ===== GET ALL DEPARTMENTS =====
@departments_bp.route('/<string:hospital_id>/departments', methods=['GET'])
def get_all_departments(hospital_id):
    try:
        conn = get_db()
        cur = conn.cursor()
        
        cur.execute("""
            SELECT 
                d.id, 
                d.name, 
                d.head, 
                d.description, 
                d.location,
                d.created_at,
                (SELECT COUNT(*) FROM user_departments ud WHERE ud.department_id = d.id) as staff_count
            FROM departments d
            WHERE d.hospital_id = %s
            ORDER BY d.name
        """, (hospital_id,))
        
        departments = cur.fetchall()
        cur.close()
        conn.close()
        
        return jsonify(departments if departments else [])
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

# ===== ADD NEW DEPARTMENT =====
@departments_bp.route('/<string:hospital_id>/departments', methods=['POST'])
def add_department(hospital_id):
    try:
        data = request.get_json()
        conn = get_db()
        cur = conn.cursor()
        
        if 'name' not in data:
            return jsonify({'success': False, 'message': 'Department name is required'}), 400
        
        # Check if department name already exists
        cur.execute("""
            SELECT id FROM departments 
            WHERE name = %s AND hospital_id = %s
        """, (data['name'], hospital_id))
        
        if cur.fetchone():
            return jsonify({'success': False, 'message': 'Department name already exists'}), 400
        
        cur.execute("""
            INSERT INTO departments (hospital_id, name, head, description, location, created_at, updated_at)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            RETURNING id
        """, (
            hospital_id,
            data['name'],
            data.get('head', ''),
            data.get('description', ''),
            data.get('location', ''),
            datetime.now(),
            datetime.now()
        ))
        
        new_dept = cur.fetchone()
        conn.commit()
        cur.close()
        conn.close()
        
        return jsonify({
            'success': True, 
            'message': 'Department added successfully',
            'department_id': new_dept['id']
        }), 201
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

# ===== DELETE DEPARTMENT =====
@departments_bp.route('/<string:hospital_id>/departments/<int:dept_id>', methods=['DELETE'])
def delete_department(hospital_id, dept_id):
    try:
        conn = get_db()
        cur = conn.cursor()
        
        # First, remove user associations
        cur.execute("DELETE FROM user_departments WHERE department_id = %s", (dept_id,))
        
        # Then delete department
        cur.execute("""
            DELETE FROM departments 
            WHERE id = %s AND hospital_id = %s
        """, (dept_id, hospital_id))
        
        conn.commit()
        cur.close()
        conn.close()
        
        return jsonify({'success': True, 'message': 'Department deleted successfully'})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

# ===== UPDATE DEPARTMENT =====
@departments_bp.route('/<string:hospital_id>/departments/<int:dept_id>', methods=['PUT'])
def update_department(hospital_id, dept_id):
    try:
        data = request.get_json()
        conn = get_db()
        cur = conn.cursor()
        
        update_fields = []
        params = []
        
        if 'name' in data:
            update_fields.append("name = %s")
            params.append(data['name'])
        if 'head' in data:
            update_fields.append("head = %s")
            params.append(data['head'])
        if 'description' in data:
            update_fields.append("description = %s")
            params.append(data['description'])
        if 'location' in data:
            update_fields.append("location = %s")
            params.append(data['location'])
        
        if not update_fields:
            return jsonify({'success': False, 'message': 'No fields to update'}), 400
        
        update_fields.append("updated_at = NOW()")
        params.append(dept_id)
        params.append(hospital_id)
        
        query = f"UPDATE departments SET {', '.join(update_fields)} WHERE id = %s AND hospital_id = %s"
        cur.execute(query, params)
        
        conn.commit()
        cur.close()
        conn.close()
        
        return jsonify({'success': True, 'message': 'Department updated successfully'})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500