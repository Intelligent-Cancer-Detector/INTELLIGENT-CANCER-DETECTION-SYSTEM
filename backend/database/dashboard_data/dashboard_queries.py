from database.config import get_db_connection


# =========================
# DASHBOARD STATS
# =========================
def get_dashboard_stats(hospital_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        print("👉 Running TODAY query")
        cursor.execute(
            """
            SELECT COUNT(*) FROM assessment
            WHERE hospital_id=%s
            AND created_at >= CURRENT_DATE
            """,
            (hospital_id,),
        )
        result = cursor.fetchone()
        print("TODAY RESULT:", result)
        today = result["count"] if result else 0

        print("👉 Running HIGH RISK query")
        cursor.execute(
            """
            SELECT COUNT(*) FROM assessment
            WHERE hospital_id=%s
            AND risk_level = 'HIGH'
            """,
            (hospital_id,),
        )
        result = cursor.fetchone()
        print("HIGH RISK RESULT:", result)
        high_risk = result["count"] if result else 0

        print("👉 Running CANCER query")
        cursor.execute(
            """
            SELECT COUNT(*) FROM assessment
            WHERE hospital_id = %s AND cancer_type IS NOT NULL
            """,
            (hospital_id,),
        )
        result = cursor.fetchone()
        print("CANCER RESULT:", result)
        cancers = result["count"] if result else 0

        print("👉 Running DOCTOR query")
        cursor.execute(
            """
            SELECT COUNT(*) FROM users
            WHERE hospital_id = %s AND role = 'doctor'
            """,
            (hospital_id,),
        )
        result = cursor.fetchone()
        print("DOCTOR RESULT:", result)
        doctors = result["count"] if result else 0

        print("👉 Running ASSESSMENTS query")
        cursor.execute(
            """
            SELECT risk_level, cancer_type, confidence
            FROM assessment
            WHERE hospital_id = %s
            """,
            (hospital_id,),
        )
        assessments = cursor.fetchall()
        print("ASSESSMENTS:", assessments)

        return {
            "today": today,
            "high_risk": high_risk,
            "cancers": cancers,
            "doctors": doctors,
            "assessments": assessments,
        }

    except Exception as e:
        print("❌ DB ERROR in get_dashboard:", e)
        return None

    finally:
        cursor.close()
        conn.close()


# =========================
# RECENT ASSESSMENTS
# =========================
def get_recent_assessments(hospital_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            """
            SELECT 
                a.id,
                a.created_at,
                a.risk_level,
                a.cancer_type,
                a.confidence,
                a.symptoms_json,

                p.full_name AS patient_name,
                p.age,
                p.gender,
                p.contact,
                p.id,


                u.full_name AS doctors_name

            FROM assessment a
            JOIN patient p ON a.patient_id = p.id  
           
            JOIN users u ON a.doctor_id = u.id

            WHERE a.hospital_id = %s
            ORDER BY a.created_at DESC
            LIMIT 10
        """,
            (hospital_id,),
        )

        return cursor.fetchall()
    except Exception as e:
        print("❌ DB ERROR in get_recent_assessments:", e)
        return None

    finally:
        cursor.close()
        conn.close()


# =========================
# ALERTS
# =========================
def get_alerts(hospital_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            """
            SELECT 
                a.created_at,
                a.cancer_type,
                a.confidence,
                p.full_name
            FROM assessment a
            JOIN patient p ON a.patient_id = p.id
            WHERE a.hospital_id = %s
            AND a.risk_level = 'HIGH'
            ORDER BY a.created_at DESC
            LIMIT 5
        """,
            (hospital_id,),
        )

        return cursor.fetchall()

    except Exception as e:
        print("❌ DB ERROR from get_alerts:", e)
        return None

    finally:
        cursor.close()
        conn.close()
