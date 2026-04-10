# test_supabase.py - Test connection to Supabase

from supabase import create_client, Client

# Your Supabase credentials
SUPABASE_URL = "https://tgrrmzusqjzzvhevmmbt.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRncnJtenVzcWp6enZoZXZtbWJ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUyOTg4NDUsImV4cCI6MjA5MDg3NDg0NX0.nmD117ohEA-pMV4YnNluPxJGT4N-HFJxPaRRyGFyyks"

try:
    # Initialize Supabase client
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
    print("✅ Connected to Supabase successfully!")
    
    # Test query - get all hospitals
    response = supabase.table('hospitals').select("*").execute()
    
    print("\n🏥 Hospitals in database:")
    if response.data:
        for hospital in response.data:
            print(f"   - {hospital['name']} ({hospital['email']}) - Status: {hospital['status']}")
    else:
        print("   - No hospitals found")
    
    # Test query - get all active users
    response = supabase.table('users').select("id, full_name, email, role").eq('is_active', True).execute()
    
    print("\n👥 Active Users:")
    if response.data:
        for user in response.data:
            print(f"   - {user['full_name']} ({user['email']}) - Role: {user['role']}")
    else:
        print("   - No users found")
    
    # Get patient count
    response = supabase.table('patients').select("*", count='exact').execute()
    print(f"\n📊 Total Patients: {response.count}")
    
    # Get assessment count
    response = supabase.table('assessments').select("*", count='exact').execute()
    print(f"📋 Total Assessments: {response.count}")
    
    print("\n✅ All tests passed! Your database is ready for the ML model.")
    
except Exception as e:
    print(f"❌ Error: {e}")