"""ICDS - Database Configuration"""

"""This is the central db connection"""

import os
from psycopg2.extras import RealDictCursor
from dotenv import load_dotenv
import psycopg2

load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")

# initializing db connection


def get_db_connection():
    # create and return a database connection
    if not DATABASE_URL:
        raise Exception("❌ DATABASE_URL is not set in .env file")
    connection = psycopg2.connect(
        DATABASE_URL, cursor_factory=RealDictCursor, sslmode="require"
    )
    return connection


def query(sql: str, params=None):
    """Helper function like your Node.js `query()`"""

    if params is None:
        params = []
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute(sql, params)
        if cursor.description:  # If it's a SELECT query
            result = cursor.fetchall()
            conn.commit()
            return result
        else:  # For INSERT, UPDATE, DELETE
            conn.commit()
            return cursor.rowcount

    except Exception as e:
        conn.rollback()
        print(f"❌ Database Error: {e}")
        raise e
    finally:
        cursor.close()
        conn.close()
