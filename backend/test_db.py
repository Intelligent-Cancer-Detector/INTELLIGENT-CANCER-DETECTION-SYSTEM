# test_db.py - Using IP address fallback

import psycopg2
import socket

# Try to get the IP address first
try:
    # Try Google DNS to resolve
    import dns.resolver
    answers = dns.resolver.resolve('db.tgrrmzusqjzzvhevmmbt.supabase.co', 'A')
    ip_address = str(answers[0])
    print(f"Resolved IP: {ip_address}")
except:
    # Fallback IP (this might change - Supabase uses dynamic IPs)
    ip_address = "54.75.255.126"  # Common Supabase IP range
    print(f"Using fallback IP: {ip_address}")

try:
    conn = psycopg2.connect(
        host="db.tgrrmzusqjzzvhevmmbt.supabase.co",
        port=5432,
        database="postgres",
        user="postgres",
        password="Monsyvalghese@1",
        sslmode="require",
        connect_timeout=30
    )
    print("✅ Connected to Supabase successfully!")
    
    cur = conn.cursor()
    cur.execute("SELECT id, name, email FROM hospitals")
    hospitals = cur.fetchall()
    
    print("\n🏥 Hospitals in database:")
    for hospital in hospitals:
        print(f"   - {hospital[1]} ({hospital[2]})")
    
    cur.close()
    conn.close()
    
except Exception as e:
    print(f"❌ Error: {e}")