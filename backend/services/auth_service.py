# from flask import jsonify
# from supabase import create_client
# from config.supabase_client import supabase
# import hashlib

# SUPABASE_URL = "https://tgrrmzusqjzzvhevmmbt.supabase.co"
# SUPABASE_KEY = "your-key"

# supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# def login_user(data):
#     try:
#         email = data.get("email", "").strip().lower()
#         password = data.get("password", "")

#         hashed = hashlib.sha256(password.encode()).hexdigest()

#         res = supabase.table("users").select("*").eq("email", email).execute()

#         if not res.data:
#             return jsonify({"success": False, "error": "Invalid credentials"}), 401

#         user = res.data[0]

#         if user["password_hash"] != hashed:
#             return jsonify({"success": False, "error": "Invalid credentials"}), 401

#         return jsonify({"success": True, "user": user}), 200

#     except Exception as e:
#         return jsonify({"success": False, "error": str(e)}), 500

# def create_user(data):
#     try:
#         pass


#     except Exception as e:
#         return jsonify({
#             "success":False,
#             "error":str(e)
#         })
